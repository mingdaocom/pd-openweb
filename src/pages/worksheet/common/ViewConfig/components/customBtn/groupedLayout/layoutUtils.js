/**
 * 自定义动作布局（详情/列表）兼容说明：
 *
 * - listbtns/detailbtns：仍只走 ActionSet 里原有 getBtnBySort（先按数组顺序排已在列表中的按钮，其余接在尾部）。
 *   本文件不在保存布局时改写这两个字段。
 *
 * - listgroup/detailgroup：
 *   - 若**未**出现「type 为字符串 'group' 或 'btn'」的混合布局（含空数组、仅旧式 { id,name,sort,btns } 分组、或未配置），
 *     则视为**老数据**：扁平顺序**只**来自 listbtns/detailbtns，与旧分组对象做片段匹配（segmentsFromLegacyFlatAndGroups）。
 *   - 若存在上述 typed 混合项，则按新混合表解析（segmentsFromTypedRows）。
 *     其中：
 *       - `type: 'btn'` 表示一个独立的未分组按钮区域；
 *       - `type: 'group'` 仅表示分组本身，若要带子项，使用 `group.btns`。
 *
 * 两种路径末尾都会 appendBtnsInDataNotInLayout：把 btnData 里已有、但布局 JSON 尚未收录的按钮按独立区域补到最后。
 */
import _ from 'lodash';
import { normalizeGroups, parseJsonArray } from './parseUtils';
import { cloneSegment, newGroupId, normalizeSegments } from './segmentUtils';

export {
  addGroupSegment,
  moveGroupSegment,
  moveIdBetweenSegments,
  moveIdToSegmentBoundary,
  moveSegmentToIndex,
  removeGroupSegment,
} from './segmentUtils';

function buildGroupSegment(meta, ids) {
  const g = meta.raw;
  return {
    type: 'group',
    id: meta.id,
    sort: meta.sort,
    name: (g && g.name) || _l('分组'),
    ids,
    icon: g && g.icon,
    iconUrl: g && g.iconUrl,
    iconColor: g && g.iconColor,
  };
}

/**
 * 是否为「新」混合布局：数组里至少一项带 type === 'group' | 'btn'。
 * 老用户仅有 listbtns/detailbtns、detailgroup 为空或仅旧分组对象（无 type 字段）时，恒为 false，走旧解析。
 */
export function isTypedCompositeLayout(rows) {
  const arr = parseJsonArray(rows);

  if (!arr.length) {
    return false;
  }

  return arr.some(r => r && (r.type === 'group' || r.type === 'btn'));
}

/** btnData 里有、但 detailgroup/listgroup 里尚未出现的按钮，按独立按钮区域补到最后（与 optionWorksheetBtn 后未写回布局一致） */
function appendBtnsInDataNotInLayout(segments, btnOrder) {
  if (!btnOrder || !btnOrder.length) {
    return segments;
  }

  const seen = new Set(_.flatMap(segments || [], seg => seg.ids || []));
  const missing = btnOrder.filter(id => id && !seen.has(id));

  if (!missing.length) {
    return segments;
  }

  const next = [...segments.map(cloneSegment), ...missing.map(id => ({ type: 'ungrouped', ids: [id] }))];

  return normalizeSegments(next);
}

/** 新格式直接按 rows 顺序复原，过滤掉当前视图不可见或已删除的按钮 */
function segmentsFromTypedRows(rows, idSet) {
  const segments = [];

  for (const row of rows) {
    if (!row) {
      continue;
    }

    if (row.type === 'group') {
      const gid = row.id || row.groupId || newGroupId();
      const groupIds = Array.isArray(row.btns) ? row.btns.filter(bid => bid && idSet.has(bid)) : [];
      segments.push({
        type: 'group',
        id: gid,
        sort: row.sort != null && row.sort !== '' ? Number(row.sort) : undefined,
        name: row.name || _l('分组'),
        ids: groupIds,
        icon: row.icon,
        iconUrl: row.iconUrl,
        iconColor: row.iconColor,
      });
    } else if (row.type === 'btn') {
      const bid = row.id || row.btnId;

      if (!bid || !idSet.has(bid)) {
        continue;
      }

      segments.push({ type: 'ungrouped', ids: [bid] });
    }
  }

  return normalizeSegments(segments);
}

/**
 * 旧数据：detailgroup 为分组对象数组（无 type:'btn' 混合项）时，扁平顺序仅来自 listbtns/detailbtns
 */
function segmentsFromLegacyFlatAndGroups(flatBtnIds, groupRaw, idSet) {
  const flat = Array.isArray(flatBtnIds) && flatBtnIds.length ? flatBtnIds : [...idSet];
  const flatFiltered = flat.filter(id => idSet.has(id));
  const metas = normalizeGroups(groupRaw);
  const usedGroupIds = new Set();
  const segments = [];
  let i = 0;

  const getValidGroupBtnIds = meta =>
    meta.raw && Array.isArray(meta.raw.btns) ? meta.raw.btns.filter(id => idSet.has(id)) : [];

  while (i < flatFiltered.length) {
    let matched = null;

    for (const meta of metas) {
      if (usedGroupIds.has(meta.id)) {
        continue;
      }

      const btns = getValidGroupBtnIds(meta);

      if (!btns.length) {
        continue;
      }

      if (_.isEqual(flatFiltered.slice(i, i + btns.length), btns)) {
        matched = { meta, btns };
        break;
      }
    }

    if (matched) {
      segments.push(buildGroupSegment(matched.meta, matched.btns));
      usedGroupIds.add(matched.meta.id);
      i += matched.btns.length;
    } else {
      const start = i;

      while (i < flatFiltered.length) {
        let innerMatch = null;

        for (const meta of metas) {
          if (usedGroupIds.has(meta.id)) {
            continue;
          }

          const btns = getValidGroupBtnIds(meta);

          if (!btns.length) {
            continue;
          }

          if (_.isEqual(flatFiltered.slice(i, i + btns.length), btns)) {
            innerMatch = true;
            break;
          }
        }

        if (innerMatch) {
          break;
        }

        i++;
      }

      const chunk = flatFiltered.slice(start, i);

      if (chunk.length) {
        segments.push({ type: 'ungrouped', ids: chunk });
      }
    }
  }

  for (const meta of metas) {
    const btns = getValidGroupBtnIds(meta);

    if (!btns.length && !usedGroupIds.has(meta.id)) {
      segments.push(buildGroupSegment(meta, []));
    }
  }

  return segments;
}

/**
 * @param btnData 与 ActionSet getBtnBySort 一致（含未写入 listgroup/detailgroup 的新按钮）
 * @param flatBtnOrderJson listbtns/detailbtns 解析结果：仅老路径下作扁平顺序，与旧 detailgroup 分组匹配
 * @param groupRaw listgroup/detailgroup：可为 JSON 字符串；新 typed 或旧分组数组
 */
export function segmentsFromView(btnData, flatBtnOrderJson, groupRaw) {
  const btnOrder = (btnData || []).map(b => b.btnId);
  const idSet = new Set(btnOrder);
  const rows = parseJsonArray(groupRaw);
  const flatOrder = parseJsonArray(flatBtnOrderJson);

  let segments;

  if (isTypedCompositeLayout(rows)) {
    segments = segmentsFromTypedRows(rows, idSet);
  } else {
    segments = segmentsFromLegacyFlatAndGroups(flatOrder, rows, idSet);
  }

  return appendBtnsInDataNotInLayout(segments, btnOrder);
}

/**
 * 保存为 listgroup/detailgroup：
 * - 未分组按钮 => { type:'btn', id }
 * - 分组 => { type:'group', ... , btns: [] }
 * listbtns/detailbtns 由其它流程维护，不在此写入
 */
export function layoutToPayload(segments) {
  const layoutItems = [];
  let sort = 1;

  for (const s of segments) {
    if (s.type === 'ungrouped') {
      for (const id of s.ids || []) {
        layoutItems.push({ type: 'btn', id });
      }
    } else {
      const row = {
        type: 'group',
        id: s.id || newGroupId(),
        sort,
        name: s.name || _l('分组'),
        btns: [...(s.ids || [])],
      };
      sort += 1;

      if (s.icon) {
        row.icon = s.icon;
      }

      if (s.iconUrl) {
        row.iconUrl = s.iconUrl;
      }

      if (s.iconColor) {
        row.iconColor = s.iconColor;
      }

      layoutItems.push(row);
    }
  }

  return { layoutItems };
}
