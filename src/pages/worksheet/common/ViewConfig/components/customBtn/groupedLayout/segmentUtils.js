import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';

export function cloneSegment(s) {
  if (s.type === 'ungrouped') {
    return { type: 'ungrouped', ids: [...(s.ids || [])] };
  }

  return {
    type: 'group',
    id: s.id,
    sort: s.sort,
    name: s.name,
    ids: [...(s.ids || [])],
    icon: s.icon,
    iconUrl: s.iconUrl,
    iconColor: s.iconColor,
  };
}

/** 内部统一成「分组段」或「单按钮未分组段」，方便拖拽时按段计算边界 */
export function normalizeSegments(segments) {
  return _.flatMap(segments || [], seg => {
    if (!seg) {
      return [];
    }

    if (seg.type === 'group') {
      return {
        ...cloneSegment(seg),
        ids: _.compact(seg.ids),
      };
    }

    return _.compact(seg.ids).map(id => ({ type: 'ungrouped', ids: [id] }));
  });
}

export function newGroupId() {
  return uuidv4();
}

/** 按钮拖入某个分组/未分组段内部 */
export function moveIdBetweenSegments(segments, fromSi, fromIi, toSi, toIi) {
  const next = segments.map(cloneSegment);

  if (fromSi < 0 || fromSi >= next.length) {
    return segments;
  }

  const fromRow = next[fromSi];

  if (fromIi < 0 || fromIi >= fromRow.ids.length) {
    return segments;
  }

  const [id] = fromRow.ids.splice(fromIi, 1);

  if (!id) {
    return segments;
  }

  let insertAt = toIi;

  if (fromSi === toSi && toIi > fromIi) {
    insertAt -= 1;
  }

  if (toSi < 0 || toSi >= next.length) {
    return segments;
  }

  if (insertAt < 0) {
    insertAt = 0;
  }

  if (insertAt > next[toSi].ids.length) {
    insertAt = next[toSi].ids.length;
  }

  next[toSi].ids.splice(insertAt, 0, id);
  return normalizeSegments(next);
}

/** 按钮拖到段边界时，脱离原分组并成为独立按钮段 */
export function moveIdToSegmentBoundary(segments, fromSi, fromIi, insertBefore) {
  const next = segments.map(cloneSegment);

  if (fromSi < 0 || fromSi >= next.length || insertBefore < 0 || insertBefore > next.length) {
    return segments;
  }

  const fromRow = next[fromSi];

  if (!fromRow || fromIi < 0 || fromIi >= fromRow.ids.length) {
    return segments;
  }

  const [id] = fromRow.ids.splice(fromIi, 1);

  if (!id) {
    return segments;
  }

  let at = insertBefore;

  if (fromRow.type === 'ungrouped' && fromRow.ids.length === 0) {
    next.splice(fromSi, 1);

    if (fromSi < at) {
      at -= 1;
    }
  }

  if (at < 0) {
    at = 0;
  }

  if (at > next.length) {
    at = next.length;
  }

  next.splice(at, 0, { type: 'ungrouped', ids: [id] });
  return normalizeSegments(next);
}

function maxGroupSort(segments) {
  return _.max(segments.filter(s => s.type === 'group').map(s => s.sort || 0)) || 0;
}

/** 新分组始终追加在整段布局最后（与「新按钮默认排最后」一致） */
export function addGroupSegment(segments, meta) {
  const { name, icon, iconUrl, iconColor } = meta || {};
  const next = segments.map(cloneSegment);
  const newSeg = {
    type: 'group',
    id: newGroupId(),
    sort: maxGroupSort(next) + 1,
    name: (name && String(name).trim()) || _l('新分组'),
    ids: [],
    icon,
    iconUrl,
    iconColor,
  };
  next.push(newSeg);
  return next;
}

/** 删除分组只移除容器，组内按钮顺延到末尾未分组区域 */
export function removeGroupSegment(segments, groupSegmentIndex) {
  const s = segments[groupSegmentIndex];

  if (!s || s.type !== 'group') {
    return segments;
  }

  const next = segments.map(cloneSegment);
  const [removed] = next.splice(groupSegmentIndex, 1);
  const orphanIds = [...(removed.ids || [])];

  if (!orphanIds.length) {
    return normalizeSegments(next);
  }

  const last = next[next.length - 1];

  if (last && last.type === 'ungrouped') {
    last.ids = [...last.ids, ...orphanIds];
  } else {
    next.push({ type: 'ungrouped', ids: orphanIds });
  }

  return normalizeSegments(next);
}

export function moveGroupSegment(segments, groupSegmentIndex, direction) {
  const s = segments[groupSegmentIndex];

  if (!s || s.type !== 'group' || !s.ids.length) {
    return segments;
  }

  const j = groupSegmentIndex + direction;

  if (j < 0 || j >= segments.length) {
    return segments;
  }

  const next = segments.map(cloneSegment);
  [next[groupSegmentIndex], next[j]] = [next[j], next[groupSegmentIndex]];
  return next;
}

/**
 * 将整段（分组或未分组）拖到新的位置。insertBefore 为 0..segments.length，
 * 表示插入到该下标之前（与「第 n 个间隙」对应）。
 */
export function moveSegmentToIndex(segments, fromSi, insertBefore) {
  const len = segments.length;

  if (fromSi < 0 || fromSi >= len || insertBefore < 0 || insertBefore > len) {
    return segments;
  }

  if (fromSi === insertBefore || fromSi + 1 === insertBefore) {
    return segments;
  }

  const next = segments.map(cloneSegment);
  const [row] = next.splice(fromSi, 1);
  let at = insertBefore;

  if (fromSi < insertBefore) {
    at -= 1;
  }

  next.splice(at, 0, row);
  return next;
}
