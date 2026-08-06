// <workEnd /> 工作阶段切分：后端在「工作阶段」末尾输出 <workEnd />。按需求「把开始到标签的内容
// 识别成工作阶段」，标签之前的全部正文（可能被 reasoning / tool 等事件拆成多个 text part）统一
// 折叠成一个 work part，标签之后为正文（text part）。流式层与历史加载层共用，放在独立模块避免
// 加深 streamEvents ↔ agentService 的循环依赖。

// 兼容 <workEnd/>、<workEnd /> 以及可能携带的属性
export const WORK_END_REGEX = /<workEnd\b[^>]*?\/?>/i;

// 把「开始 → <workEnd /> 标签」之间的所有部件折叠成一个 work part：reasoning / text 作为有序子部件
// 收进 work.children，由 WorkPhase 嵌套渲染（思考块、正文都缩进收纳在「已工作」里，而非与其同级平铺）。
// 已切出的前序 work 部件原样保留为同级 —— 多段 <workEnd /> 之间不互相嵌套。
// finishedAt 由调用方在「标签到达时」传入：流式层为 Date.now()，历史无时间则为 undefined。
export function carveWorkParts(parts, finishedAt) {
  const lastIdx = parts.length - 1;
  const last = parts[lastIdx];

  if (!last || last.kind !== 'text') return parts;
  const matched = WORK_END_REGEX.exec(last.text);

  if (!matched) return parts;

  const before = last.text.slice(0, matched.index);
  const after = last.text.slice(matched.index + matched[0].length);

  const leadingWork = [];
  const children = [];

  for (let i = 0; i <= lastIdx; i++) {
    const p = parts[i];

    // 前序已折叠的工作阶段：保持同级，不再被卷进新的 work
    if (p.kind === 'work') {
      leadingWork.push(p);
      continue;
    }

    if (p.kind === 'text') {
      const text = i === lastIdx ? before : p.text;

      if (text && text.trim()) children.push({ kind: 'text', text, ts: p.ts });
      continue;
    }

    // reasoning：结束时刻取下一部件的开始时刻（无则用工作阶段结束时刻），折叠后仍显示真实思考时长
    if (p.kind === 'reasoning') {
      const next = parts[i + 1];

      children.push({ ...p, finishedAt: next ? next.ts : finishedAt });
      continue;
    }

    children.push(p);
  }

  const result = [...leadingWork];

  if (children.length) {
    result.push({ kind: 'work', children, ts: children[0].ts, finishedAt });
  }

  // 标签之后的正文：可能还含下一个 <workEnd />，递归继续切
  if (after) return carveWorkParts([...result, { kind: 'text', text: after, ts: Date.now() }], finishedAt);
  return result;
}

// 历史加载用：把一段原始 assistant 文本按 <workEnd /> 切成 work / text parts。
// 历史无逐段时间戳，work part 不带 finishedAt（折叠头只显示「已工作」不带时长）。
export function splitWorkPartsFromText(text, ts) {
  return carveWorkParts([{ kind: 'text', text, ts }], undefined);
}
