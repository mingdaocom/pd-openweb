import _ from 'lodash';
import MarkdownIt from 'markdown-it';
import { htmlDecodeReg } from 'src/utils/core/string';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import { getMarkdownIt } from './renderPostMarkdown';

/**
 * Markdown 编辑态与后端存储态的互转。
 *
 * 编辑器里 @人 / 话题用标准 Markdown 链接承载，IR 模式下会渲染成链接，用户看到的是「@张三」：
 *   编辑态 [@张三](/user_u1)  →  提交 user:u1  →  后端存为 [aid]u1[/aid]
 *   存储态 [aid]u1[/aid]      →  回填编辑器 [@张三](/user_u1)
 *
 * 这样身份 id 跟着内容走，改显示名、同名、复制粘贴都不会串人或丢 id；
 * 万一转换没命中，留在正文里也只是一个指向用户主页的普通链接，不会变成一串裸标记。
 */

/** Markdown 链接文本里的方括号需要转义，否则会截断链接语法 */
const escapeLinkText = value => String(value == null ? '' : value).replace(/([[\]])/g, '\\$1');

const unescapeLinkText = value => String(value == null ? '' : value).replace(/\\([[\]])/g, '$1');

const USER_LINK_REG = /\[@((?:\\.|[^[\]\\])*)\]\(([^)\s]*\/user_([^)\s?#]+))\)/g;
const GROUP_LINK_REG = /\[@((?:\\.|[^[\]\\])*)\]\(([^)\s]*\/group\/groupValidate\?gID=([^)\s&]+))\)/g;
const CATEGORY_LINK_REG = /\[#((?:\\.|[^[\]\\])*)#\]\(([^)\s]*\/feed\?catId=([^)\s&]+))\)/g;

/**
 * @人 / @群组 / 话题链接的地址特征。
 * 编辑器据此把这三类链接识别成原子节点（隐藏 Markdown 标记、整体删除），
 * 用户手写的普通 Markdown 链接不受影响，仍按 Vditor 原生方式编辑。
 */
const MENTION_URL_REG = /\/(?:user_|group\/groupValidate\?gID=|feed\?catId=)/;

let messageMarkdownIt;

function getMessageMarkdownIt() {
  if (messageMarkdownIt) return messageMarkdownIt;

  // 收件箱/消息只需要纯文本，不复用正文渲染器的配置：正文渲染器关闭了 code，
  // 这里仍要把围栏代码块的内容保留下来，同时丢弃 ``` 和语言名。
  messageMarkdownIt = new MarkdownIt({
    html: false,
    linkify: false,
    breaks: true,
    typographer: false,
  });

  return messageMarkdownIt;
}

export const isMentionUrl = url => MENTION_URL_REG.test(String(url == null ? '' : url));

export function buildUserMentionMarkdown(name, accountId) {
  return `[@${escapeLinkText(name)}](${pathCompletion('/user_' + accountId, { hasDomain: false })})`;
}

export function buildGroupMentionMarkdown(name, groupId) {
  return `[@${escapeLinkText(name)}](${pathCompletion('/group/groupValidate?gID=' + groupId, { hasDomain: false })})`;
}

export function buildCategoryMarkdown(name, catId) {
  return `[#${escapeLinkText(name)}#](${pathCompletion('/feed?catId=' + catId, { hasDomain: false })})`;
}

/**
 * 编辑态 → 存储态：把 Markdown 链接形式的 @人 / 话题换回后端认识的私有标记。
 * @param {string} markdown 编辑器里的 Markdown 源码
 * @returns {string} 可直接提交的正文
 */
export function toSyntaxMessage(markdown) {
  if (!markdown) return '';

  return (
    String(markdown)
      // @人 / @群组按改版前输入框的提交格式 user:id、group:id（@所有人即 user:atAll）：
      // 后端从这种写法里识别提及、生成 rUserList / rGroupList 并发提醒，再改写成 [aid] / [gid] 存储。
      // 直接交 [aid] / [gid] 是后端的输出格式，它不会再解析，被 @ 的人收不到提醒
      .replace(USER_LINK_REG, (raw, name, url, accountId) => `user:${accountId}`)
      .replace(GROUP_LINK_REG, (raw, name, url, groupId) => `group:${groupId}`)
      // 话题按纯文本 #名字# 提交：AddPost 没有话题参数，后端是从正文里认 #名字# 建立关联的，
      // 存下来之后才由后端改写成 [cid]catId[/cid]。前端直接写 [cid] 等于交了后端的输出格式，
      // 它不会再解析，动态发出去就成了「未知话题」。
      .replace(CATEGORY_LINK_REG, (raw, name) => `#${unescapeLinkText(name)}#`)
  );
}

/**
 * 存储态 → 编辑态：把私有标记还原成 Markdown 链接，供编辑历史动态时回填编辑器。
 * 找不到对应数据的标记保持原样，避免把内容改坏。
 *
 * @param {string} message 后端存储的正文
 * @param {Object} context 动态 / 评论数据（rUserList、rGroupList、categories）
 * @returns {string} Markdown 源码
 */
export function toDisplayMessage(message, context = {}) {
  if (!message) return '';

  const { rUserList, rGroupList, categories } = context;

  return (
    String(message)
      .replace(/\[aid\]([^[\]]*?)\[\/aid\]/gi, (raw, accountId) => {
        const rUser = _.find(rUserList, item => (item.aid || item.accountId) === accountId);
        const name = rUser && (rUser.name || rUser.fullname);
        return name ? buildUserMentionMarkdown(name, accountId) : raw;
      })
      .replace(/\[gid\]([^[\]]*?)\[\/gid\]/gi, (raw, groupId) => {
        const rGroup = _.find(rGroupList, item => item.groupID === groupId);
        return rGroup && rGroup.groupName ? buildGroupMentionMarkdown(rGroup.groupName, groupId) : raw;
      })
      // 名字是可选的：现行存储格式为 [cid]catId[/cid]，历史数据里可能带 |名字
      .replace(/\[cid\]([0-9a-zA-Z-]*)(?:\|(.*?))?\[\/cid\]/gi, (raw, catId, name) => {
        const category = _.find(categories, item => item.catID === catId);
        const catName = (category && category.catName) || name;

        return catName ? buildCategoryMarkdown(catName, catId) : raw;
      })
  );
}

/**
 * 后端存储态 → 编辑态，编辑历史动态时用这个回填编辑器。
 *
 * 与 toDisplayMessage 的差别是先做实体解码：后端把 < > 存成 &lt; &gt;，直接回填的话
 * 引用（&gt; 开头）、自动链接（&lt;https://…&gt;）、HTML 标签、乃至正文里的 a > b
 * 在编辑器里全都认不出来，引用套列表还会整块塌成一个段落。
 * 正文渲染（renderPostMarkdown）在入口处做同样的解码，两边看到的必须是同一份源码。
 *
 * @param {string} message 后端存储的正文
 * @param {Object} context 动态 / 评论数据（rUserList、rGroupList、categories）
 * @returns {string} Markdown 源码
 */
export function fromStoredMessage(message, context = {}) {
  return toDisplayMessage(htmlDecodeReg(message), context);
}

function renderInlineText(children) {
  let text = '';

  (children || []).forEach(child => {
    switch (child.type) {
      case 'text':
      case 'code_inline':
        text += child.content;
        break;
      case 'softbreak':
      case 'hardbreak':
        text += '\n';
        break;
      case 'image':
        text += child.content || _l('图片');
        break;
      default:
        // 链接、强调等只保留其中的文字，标记本身丢弃
        break;
    }
  });

  return text;
}

/**
 * Markdown 源码 → 纯文本降级版，写入 postMsg 供 IM 卡片、收件箱、通知、搜索索引使用。
 * 私有标记（[aid] 等）原样保留，后端仍按现有规则解析 @人。
 *
 * @param {string} markdown 已转换成存储态的 Markdown 源码
 * @returns {string} 纯文本
 */
function stripMarkdownWithParser(markdown, parser) {
  if (!markdown) return '';

  const tokens = parser.parse(String(markdown), {});
  const lines = [];
  let current = '';

  const flush = () => {
    if (current.trim()) lines.push(current.trim());
    current = '';
  };

  tokens.forEach(token => {
    switch (token.type) {
      case 'inline':
        current += renderInlineText(token.children);
        break;
      case 'fence':
      case 'code_block':
        flush();
        if (token.content.trim()) lines.push(token.content.trim());
        break;
      case 'th_open':
      case 'td_open':
        if (current) current += ' ';
        break;
      case 'paragraph_close':
      case 'heading_close':
      case 'blockquote_close':
      case 'list_item_close':
      case 'tr_close':
        flush();
        break;
      default:
        break;
    }
  });

  flush();
  return lines.join('\n');
}

export function stripMarkdown(markdown) {
  return stripMarkdownWithParser(markdown, getMarkdownIt());
}

/**
 * 消息/收件箱专用的 Markdown 纯文本降级。
 *
 * 消息组件仍沿用 createLinksForMessage 处理 @人、群组和话题，因此必须先清理 Markdown，
 * 再交给 createLinksForMessage，避免把已经生成的 HTML 当成 Markdown 源码处理。
 * @param {string} markdown 后端存储态 Markdown 源码
 * @returns {string} 去掉 Markdown 语法但保留正文的纯文本
 */
export function stripMarkdownForMessage(markdown) {
  return stripMarkdownWithParser(htmlDecodeReg(markdown), getMessageMarkdownIt());
}

/**
 * 从 Markdown 源码里提取 @人 / @群组，用于在编辑器与纯文本输入框之间切换时重建 mentionsCollection。
 * @param {string} markdown 编辑态 Markdown 源码
 * @returns {Array<{ type: string, id: string, fullname: string }>}
 */
export function extractMentions(markdown) {
  if (!markdown) return [];

  const mentions = [];
  const source = String(markdown);

  source.replace(USER_LINK_REG, (raw, name, url, accountId) => {
    mentions.push({ type: 'user', id: accountId, fullname: unescapeLinkText(name) });
    return raw;
  });

  source.replace(GROUP_LINK_REG, (raw, name, url, groupId) => {
    mentions.push({ type: 'group', id: groupId, fullname: unescapeLinkText(name) });
    return raw;
  });

  return mentions;
}

/**
 * mentionsCollection → createLinksForMessage / toDisplayMessage 需要的关联列表
 * @param {Array} mentions MentionsInput 的 mentionsCollection
 */
export function mentionsToRelationLists(mentions = []) {
  return {
    rUserList: mentions
      .filter(item => item.type === 'user')
      .map(item => ({ aid: item.id, name: item.fullname || item.value })),
    rGroupList: mentions
      .filter(item => item.type === 'group')
      .map(item => ({ groupID: item.id, groupName: item.fullname || item.value })),
  };
}
