import MarkdownIt from 'markdown-it';
import { parseUnicodeEmotion } from 'src/components/emotion/parseEmotion';
import { sanitizePostMessageHtml } from 'src/utils/core/sanitizeHtml';
import { htmlDecodeReg } from 'src/utils/core/string';
import { expandBlankLines } from './markdownBlankLines';
import { createPlaceholderRegExp, tokenizeMessage } from './messageTokens';

/**
 * 把 Markdown 格式的动态 / 评论正文渲染成可直接注入的 HTML。
 *
 * 解析引擎与发布框、工作表 Markdown 字段一致，都是 Vditor 内置的 Lute：同一份源码在编辑态与
 * 发布后走同一套解析规则，任务列表、空行、代码块等不会再出现两边显示不一致。
 * Lute 由脚本异步加载（见 ensureMarkdownEngine），加载完成前用 markdown-it 兜底，避免正文空白；
 * 两者对常规语法输出一致，差异只在任务列表、表情短码、脚注、公式这些 Lute 独有的能力上。
 *
 * 管线共五步：
 *   ⓪ 先做实体解码：后端存的正文里 < > 等已被编码成 &lt; &gt;，不解码则 Markdown 认不出
 *      块引用（&gt; 开头）和 HTML 标签，安全性由第 ③ 步的白名单清洗保证
 *   ① 私有标记与表情标记换成占位符，避免被 Markdown 语法吃掉（[cid]x|y[/cid] 本身就是 [文本] 形态）
 *   ② Markdown 渲染（Lute，未就绪时 markdown-it）
 *   ③ 白名单清洗（沿用动态正文既有的 xss 白名单，负责挡住脚本与危险属性）
 *   ④ 回填占位符，代码块内还原为字面量，其余替换成标记 HTML（单独清洗）；链接统一新窗口打开
 */

const LUTE_SCRIPT_ID = 'vditorLuteScript';

/** Lute 的脚注锚点按条编号（footnotes-ref-1），同一页多条动态会撞车，渲染时换成全局唯一编号 */
const FOOTNOTE_ANCHOR_REG = /(footnotes-(?:ref|def)-)(\d+)/g;

let lutePromise;
let lute;
let markdownIt;
let footnoteScope = 0;

/**
 * 把脚注锚点 footnotes-ref-1 / footnotes-def-1 改写成带作用域的 footnotes-ref-3-1，
 * 引用与定义在同一次渲染里用同一个作用域，跳转仍然成对。
 * 类名（footnotes-ref、footnotes-defs-ol 等）后面不接编号，不会被误伤。
 */
function scopeFootnoteAnchors(html) {
  if (!html.includes('footnotes-')) return html;

  const scope = ++footnoteScope;

  return html.replace(FOOTNOTE_ANCHOR_REG, (raw, prefix, index) => `${prefix}${scope}-${index}`);
}

/**
 * 按编辑器（MdMarkdown 里的 Vditor）同款选项创建 Lute 实例，两边解析规则必须保持一致。
 * 例外：行内公式不允许 $ 紧跟数字，否则「预算 $100 和 $200」会被当成公式，正文被吃掉。
 */
function createLute() {
  const instance = window.Lute.New();

  instance.SetHeadingAnchor(false);
  instance.SetInlineMathAllowDigitAfterOpenMarker(false);
  instance.SetAutoSpace(false);
  instance.SetToC(false);
  instance.SetFootnotes(true);
  instance.SetFixTermTypo(false);
  instance.SetVditorCodeBlockPreview(true);
  instance.SetVditorMathBlockPreview(true);
  instance.SetSanitize(true);
  instance.SetChineseParagraphBeginningSpace(false);
  instance.SetRenderListStyle(false);
  instance.SetLinkBase('');
  instance.SetLinkPrefix('');
  instance.SetMark(false);
  instance.SetGFMAutoLink(true);
  // 动态没有 front matter 这回事：开着的话「--- 开头」会把整条正文吞成 YAML 代码块，
  // 而 --- 正是工具栏分隔线按钮产生的内容。编辑器侧同样关闭（见 MdMarkdown）
  instance.SetYamlFrontMatter(false);
  // 行首 4 个空格不当代码块：客户端发的动态常在话题、正文前带缩进空格，按缩进代码块渲染后
  // 话题标记会原样露出；需要代码请用 ``` 围栏。编辑器侧同样关闭（见 MdMarkdown 的 indentCodeBlock）
  instance.SetIndentCodeBlock(false);

  return instance;
}

function getLute() {
  if (!lute && window.Lute) lute = createLute();

  return lute;
}

/** Lute 是否已可用（可用时 renderPostMarkdown 即为最终结果，无需再次渲染） */
export function isMarkdownEngineReady() {
  return !!getLute();
}

/**
 * 加载 Lute 脚本，地址与脚本 id 均与编辑器（Vditor 的 addScript）一致，两边共用同一份。
 *
 * Vditor 约定「带该 id 的 script 存在」＝「Lute 已加载完成」：它插入时不带 id，onload 后才补上，
 * 并据此跳过等待直接使用 window.Lute。这里必须沿用同一约定，否则正文开始下载时就占用 id，
 * 会让此刻初始化的编辑器误判已就绪并在 Lute.New() 报错。
 * 两边同时加载也是安全的：src 相同，浏览器复用同一份请求，先完成的一方占住 id。
 *
 * @returns {Promise<boolean>} 是否可用；加载失败时保持 markdown-it 兜底，不抛出
 */
export function ensureMarkdownEngine() {
  if (isMarkdownEngineReady()) return Promise.resolve(true);

  if (!lutePromise) {
    lutePromise = new Promise(resolve => {
      let timer;

      const settle = () => {
        clearInterval(timer);
        resolve(isMarkdownEngineReady());
      };

      // 编辑器可能正在加载同一份脚本：它加载完成时不会通知这里，用轮询兜底
      timer = setInterval(() => {
        if (isMarkdownEngineReady()) settle();
      }, 100);

      // 已带 id 说明编辑器已加载完成，此时 window.Lute 必然可用，轮询会立即收口
      if (document.getElementById(LUTE_SCRIPT_ID)) return;

      const script = document.createElement('script');

      script.async = true;
      script.src = `${window.__customSubPath__}/staticfiles/vditordist/js/lute/lute.min.js`;
      script.addEventListener('load', () => {
        // id 已被编辑器占用时不再重复标记，保持 DOM 中只有一个 Lute 脚本标签
        if (document.getElementById(LUTE_SCRIPT_ID)) {
          script.remove();
        } else {
          script.id = LUTE_SCRIPT_ID;
        }

        settle();
      });
      script.addEventListener('error', settle);
      document.head.appendChild(script);
    }).then(ready => {
      // 加载失败时允许下次再试，避免一次网络波动后正文永远停在兜底渲染
      if (!ready) lutePromise = null;

      return ready;
    });
  }

  return lutePromise;
}

export function getMarkdownIt() {
  if (markdownIt) return markdownIt;

  markdownIt = new MarkdownIt({
    // 系统动态（人员加入、应用推送等）的正文由后端生成，含 <a> 链接，
    // 关闭 html 会把它们转义成源码显示，因此保留原始 HTML，安全由后续白名单清洗兜底
    html: true,
    linkify: true,
    // 动态的既有习惯是一个换行即断行，与标准 Markdown 的两空格换行不同
    breaks: true,
    typographer: false,
  });

  // 与 Lute 保持一致：不识别缩进代码块（见 createLute）
  markdownIt.disable('code');

  const renderToken = (tokens, idx, options, env, self) => self.renderToken(tokens, idx, options);
  const defaultLinkOpen = markdownIt.renderer.rules.link_open || renderToken;

  // 正文里的链接统一新窗口打开，与纯文本链路的自动链接保持一致
  markdownIt.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    tokens[idx].attrSet('target', '_blank');
    tokens[idx].attrSet('rel', 'noopener noreferrer');
    return defaultLinkOpen(tokens, idx, options, env, self);
  };

  return markdownIt;
}

function restoreTokens(host, tokens) {
  const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
  const placeholderReg = createPlaceholderRegExp();
  const matchedNodes = [];

  while (walker.nextNode()) {
    const node = walker.currentNode;
    placeholderReg.lastIndex = 0;

    if (node.nodeValue && placeholderReg.test(node.nodeValue)) {
      matchedNodes.push(node);
    }
  }

  matchedNodes.forEach(node => {
    // 代码块内保持字面量，用户展示 [aid]xxx[/aid] 这类示例文本时不该变成真的 @人
    const keepRaw = !!node.parentElement?.closest('code, pre');
    const value = node.nodeValue;
    const fragment = document.createDocumentFragment();
    const reg = createPlaceholderRegExp();
    let lastIndex = 0;
    let match;

    while ((match = reg.exec(value))) {
      const token = tokens[Number(match[1])];

      if (match.index > lastIndex) {
        fragment.appendChild(document.createTextNode(value.slice(lastIndex, match.index)));
      }

      if (!token) {
        fragment.appendChild(document.createTextNode(match[0]));
      } else if (keepRaw) {
        fragment.appendChild(document.createTextNode(token.raw));
      } else {
        // 标记 HTML 在第 ③ 步清洗之后才回填，这里必须单独清洗：
        // 回填进 host 后图片会立即加载，事件属性在注入页面之前就会执行
        const holder = document.createElement('template');
        holder.innerHTML = sanitizePostMessageHtml(token.html);
        fragment.appendChild(holder.content);
      }

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < value.length) {
      fragment.appendChild(document.createTextNode(value.slice(lastIndex)));
    }

    node.replaceWith(fragment);
  });
}

/**
 * @param {string} message Markdown 源码（其中 @人、话题、表情仍是私有标记）
 * @param {Object} context 动态 / 评论数据（rUserList、rGroupList、categories、sourceType、filterFace）
 * @returns {string} 可交给 dangerouslySetInnerHTML 的 HTML
 */
export default function renderPostMarkdown(message, context = {}) {
  if (!message) return '';

  const { text, tokens } = tokenizeMessage(htmlDecodeReg(message), context);
  const host = document.createElement('div');
  // 空行与发布框共用同一套占位段落表示，保证编辑时与发布后显示一致
  const source = expandBlankLines(text);
  const engine = getLute();

  const rendered = engine ? scopeFootnoteAnchors(engine.Md2HTML(source)) : getMarkdownIt().render(source);

  host.innerHTML = sanitizePostMessageHtml(rendered);
  restoreTokens(host, tokens);

  // 正文里的链接统一新窗口打开，与纯文本链路的自动链接保持一致（Lute 不输出 target）
  host.querySelectorAll('a[href]').forEach(link => {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });

  return context.filterFace ? host.innerHTML : parseUnicodeEmotion(host.innerHTML);
}
