import _ from 'lodash';

/** 兼容 advancedSetting 里 JSON 字符串或未传 */
export function parseJsonArray(raw) {
  if (raw == null || raw === '') {
    return [];
  }

  if (Array.isArray(raw)) {
    return raw;
  }

  if (typeof raw === 'string') {
    return safeParse(raw, 'array') || [];
  }

  return [];
}

export function normalizeGroups(groupRaw) {
  const arr = Array.isArray(groupRaw) ? groupRaw : [];

  return _.sortBy(
    arr.map((g, idx) => ({
      raw: g,
      id: (g && g.id) || `legacy_${idx}`,
      sort: g && g.sort != null && g.sort !== '' ? Number(g.sort) : idx + 1,
      _idx: idx,
    })),
    ['sort', '_idx'],
  );
}
