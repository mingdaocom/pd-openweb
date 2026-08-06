// 「嵌入数据」协议的纯逻辑层（不依赖任何 React 组件），供服务层（agentService）与组件层（index.js）共用。
// 协议：把结构化产物以 ```mingo_embed_data_<suffix>\n<json>\n``` 的代码块落进消息文本。
export const EMBED_LANGUAGE_PREFIX = 'mingo_embed_data_';
// 「修改搭建计划」：用户在 AppBuilder 卡片上聚合的多条修改，提交后作为一条用户消息嵌入渲染
export const MODIFY_PLAN_SUFFIX = 'modify_plan';
// 「触发搭建总结」：build 完成后前端自动调 app-build-summary 的触发语（系统指令，非用户输入）
export const TRIGGER_BUILD_SUMMARY_SUFFIX = 'trigger_build_summary';

// 已登记的 embed 后缀（与 index.js 的 EMBED_REGISTRY 对应；此处用纯字符串避免服务层依赖组件）。
// 「向用户提问」：mingo_ask 提问卡（assistant 侧）与其作答回传（user 侧）成对
export const ASK_SUFFIX = 'ask';
export const ASK_REPLY_SUFFIX = 'ask_reply';

export const EMBED_SUFFIXES = [
  'build_app',
  MODIFY_PLAN_SUFFIX,
  TRIGGER_BUILD_SUMMARY_SUFFIX,
  'chart',
  ASK_SUFFIX,
  ASK_REPLY_SUFFIX,
];

// 静默后缀：系统自动发起的触发类消息，历史渲染时整段跳过（消息 parts 为空 → 整条不显示在列表里）。
export const SILENT_EMBED_SUFFIXES = [TRIGGER_BUILD_SUMMARY_SUFFIX];

// ask_reply 全部跳过：用户对所有提问都点了「跳过」，回传无信息量。
// 按设计稿「全部跳过时直接发送，界面中不显示」——照常发给 AI，但该 ask_reply 整段不渲染。
export function isAskReplyAllSkipped(suffix, data) {
  if (suffix !== ASK_REPLY_SUFFIX) return false;
  const answers = data && Array.isArray(data.answers) ? data.answers : [];

  return answers.length > 0 && answers.every(a => a && a.skipped);
}

// 该 embed 段是否应整段静默（不进消息 parts）：系统触发类后缀，或全部跳过的 ask_reply。
export function isSilentEmbedSegment(suffix, data) {
  return SILENT_EMBED_SUFFIXES.includes(suffix) || isAskReplyAllSkipped(suffix, data);
}

// 解析 fence：命中前缀、后缀已登记、JSON 可解析为非空对象 → { suffix, data }；否则 null。
export function parseEmbed(language, code) {
  if (typeof language !== 'string' || !language.startsWith(EMBED_LANGUAGE_PREFIX)) return null;

  const suffix = language.slice(EMBED_LANGUAGE_PREFIX.length);

  if (!EMBED_SUFFIXES.includes(suffix)) return null;

  const data = safeParse(code, 'object');

  if (!data || typeof data !== 'object' || !Object.keys(data).length) return null;

  return { suffix, data };
}

// 把消息文本里的 ```mingo_embed_data_<suffix>``` 抽成独立段，供「用户消息（不走 markdown）」按段渲染：
// 返回 [{ type:'text', text } | { type:'embed', suffix, data }]。未登记 / 解析失败的 fence 保留为普通文本。
export function extractEmbedSegments(text) {
  if (typeof text !== 'string' || !text) return [{ type: 'text', text: text || '' }];

  const fenceRe = /```([^\n`]+)\n([\s\S]*?)```/g;
  const segments = [];
  let lastIndex = 0;
  let match;

  while ((match = fenceRe.exec(text))) {
    const [full, language, code] = match;
    const embed = parseEmbed(language.trim(), code.trim());

    if (!embed) continue; // 非已登记 embed：留作普通文本，不切分

    const pre = text.slice(lastIndex, match.index);

    if (pre.trim()) segments.push({ type: 'text', text: pre });
    segments.push({ type: 'embed', suffix: embed.suffix, data: embed.data });
    lastIndex = match.index + full.length;
  }

  const rest = text.slice(lastIndex);

  if (rest.trim() || !segments.length) segments.push({ type: 'text', text: rest });

  return segments;
}

// 构造嵌入 fence 文本（发送给后端的消息体即此字符串，保持 ```包裹数据 不变）。
export function buildEmbedFence(suffix, data) {
  return `\`\`\`${EMBED_LANGUAGE_PREFIX}${suffix}\n${JSON.stringify(data)}\n\`\`\``;
}

// 从 assistant 文本里抽出 mingo_ask 提问围栏（assistant 的围栏走 markdown 文本，不是 user 侧的 embed part）。
// 返回 { text: 去掉该围栏后的正文, data: 解析出的提问对象 | null }。
// 提问卡固定在底部输入区渲染，故正文里要把围栏剥掉；流式未闭合时隐藏「围栏起始→结尾」的半包，避免裸 JSON 闪现。
// 返回值额外带 opened：是否已出现 ask 围栏起始（供流式骨架判断"提问卡即将到来"）。
export function extractAsk(text) {
  if (typeof text !== 'string' || !text) return { text: text || '', data: null, opened: false };

  const open = text.indexOf('```' + EMBED_LANGUAGE_PREFIX + ASK_SUFFIX);

  if (open === -1) return { text, data: null, opened: false };

  // 语言行（```mingo_embed_data_ask…）到首个换行；无换行说明围栏刚起头，隐藏半包
  const after = text.slice(open);
  const nl = after.indexOf('\n');

  if (nl === -1) return { text: text.slice(0, open).trim(), data: null, opened: true };

  // 取语言行之后的内容；有闭合 ``` 取其前，无闭合（流式或末尾省略）则取到结尾——容错各种收尾格式
  const body = after.slice(nl + 1);
  const close = body.indexOf('```');
  const json = (close === -1 ? body : body.slice(0, close)).trim();
  // 流式期间会对半包 JSON 反复尝试解析：必须静默（不用 safeParse，它失败会 console.error 刷屏），
  // 且仅在内容看起来闭合（以 } 结尾）时才尝试，省掉绝大多数注定失败的解析。
  let data = null;

  if (json.endsWith('}')) {
    try {
      data = JSON.parse(json);
    } catch {
      data = null;
    }
  }

  // JSON 不完整（流式未结束）：隐藏围栏起始后内容，等闭合再解析
  if (!data || typeof data !== 'object' || !Object.keys(data).length) {
    return { text: text.slice(0, open).trim(), data: null, opened: true };
  }

  const restAfter = close === -1 ? '' : body.slice(close + 3);
  const rest = (text.slice(0, open) + restAfter).trim();

  return { text: rest, data, opened: true };
}
