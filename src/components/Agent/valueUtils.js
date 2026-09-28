/**
 * 判断值是否为可读取字段的普通记录对象。
 */
export function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

/**
 * 忽略字段名大小写读取记录字段，兼容后端 Pascal / camel 混用。
 */
export function readField(source, key) {
  if (!isRecord(source)) return undefined;
  if (key in source) return source[key];
  const target = key.toLowerCase();

  for (const [fieldKey, fieldValue] of Object.entries(source)) {
    if (fieldKey.toLowerCase() === target) return fieldValue;
  }

  return undefined;
}

/**
 * 规范化非空字符串，其他值返回 undefined。
 */
export function stringValue(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}
