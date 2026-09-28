// plan 产物里的「紧凑字符串」解析 —— 纯函数，无 UI 依赖，供 panel 渲染与方案导出共用。

// Parse compact strings like "名称(Type)" or "名称(Relation→目标表)"
export function parseCompactStr(str) {
  if (typeof str !== 'string') return { name: String(str || ''), type: '' };
  const m = str.match(/^(.+?)\(([^)]+)\)$/);
  if (!m) return { name: str, type: '' };
  return { name: m[1].trim(), type: m[2].trim() };
}

// 列表型紧凑字段（fields / views / charts / components）兼容两种产出：
// 1) 数组：["客户名称(Text)", "客户分类(Relation:客户分类)"] —— 原样返回；
// 2) 逗号分隔字符串："客户名称(Text), 客户分类(Relation:客户分类)" —— 按"括号深度为 0 的逗号"切分，
//    避免类型里的逗号（如未来出现）被误切。两种都交给 parseCompactStr 逐项解析。
export function parseCompactList(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];

  const out = [];
  let depth = 0;
  let cur = '';

  for (const ch of value) {
    if (ch === '(') depth += 1;
    else if (ch === ')') depth = Math.max(0, depth - 1);

    if (ch === ',' && depth === 0) {
      const token = cur.trim();

      if (token) out.push(token);
      cur = '';
    } else {
      cur += ch;
    }
  }

  const last = cur.trim();

  if (last) out.push(last);
  return out;
}
