import Ask, { AskReply, AskSkeleton } from './Ask';
import BuildApp from './BuildApp';
import Chart from './Chart';
import ModifyPlan from './ModifyPlan';
import { EMBED_LANGUAGE_PREFIX, parseEmbed } from './protocol';

// 协议纯逻辑见 ./protocol（服务层与组件层共用）；本文件负责「后缀 → 渲染组件」映射。
// 新增一种嵌入产物：实现组件、在 EMBED_REGISTRY 与 protocol 的 EMBED_SUFFIXES 同步登记后缀即可。
export {
  ASK_REPLY_SUFFIX,
  ASK_SUFFIX,
  EMBED_LANGUAGE_PREFIX,
  EMBED_SUFFIXES,
  MODIFY_PLAN_SUFFIX,
  TRIGGER_BUILD_SUMMARY_SUFFIX,
  buildEmbedFence,
  extractAsk,
  extractEmbedSegments,
  isSilentEmbedSegment,
  parseEmbed,
} from './protocol';

// 流式骨架（非注册型，按需直接渲染）：ask 围栏流式期占位用。
export { AskSkeleton };

// 后缀 → 渲染组件。组件统一接收 { data }（已解析的 JSON 对象）。
const EMBED_REGISTRY = {
  build_app: BuildApp,
  modify_plan: ModifyPlan,
  chart: Chart,
  ask: Ask,
  ask_reply: AskReply,
};

// 按后缀取登记的渲染组件（用户消息按段渲染时用），未登记返回 null。
export function getEmbedComponent(suffix) {
  return EMBED_REGISTRY[suffix] || null;
}

// 解析 fence 并附带渲染组件：命中前缀、后缀有登记组件、JSON 可解析 → { Component, data }；否则 null。
// 供 CodeBlock（assistant markdown 内的代码块）分发使用；streaming 半包 / 未登记后缀自然回退普通代码块。
export function resolveEmbed(language, code) {
  if (typeof language !== 'string' || !language.startsWith(EMBED_LANGUAGE_PREFIX)) return null;

  const embed = parseEmbed(language, code);

  if (!embed) return null;

  const Component = EMBED_REGISTRY[embed.suffix];

  if (!Component) return null;

  return { Component, data: embed.data };
}
