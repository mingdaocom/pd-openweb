import _ from 'lodash';
import { segmentsFromView } from './layoutUtils';
import { normalizeGroups, parseJsonArray } from './parseUtils';

export const getActionColumnKey = item =>
  `${item.type}:${item.type === 'group' ? item.source || 'list' : ''}:${item.id}`;

function isTypedActionGroupLayout(rows) {
  const arr = parseJsonArray(rows);

  if (!arr.length) {
    return false;
  }

  return arr.some(r => r && (r.type === 'group' || r.type === 'btn'));
}

/** 从 listgroup/detailgroup 抽出按钮 id 顺序（typed 走整表；否则退回 listbtns/detailbtns 或旧分组 btns） */
export function orderedBtnIdsFromGroupLayout(groupRaw, visibleBtnIds) {
  const rows = parseJsonArray(groupRaw);

  if (isTypedActionGroupLayout(rows)) {
    return _.flatMap(rows, r => {
      if (!r) {
        return [];
      }

      if (r.type === 'btn') {
        return _.compact([r.id || r.btnId]);
      }

      if (r.type === 'group' && Array.isArray(r.btns)) {
        return _.compact(r.btns);
      }

      return [];
    });
  }

  if (Array.isArray(visibleBtnIds) && visibleBtnIds.length) {
    return _.compact(visibleBtnIds);
  }

  return _.flatMap(normalizeGroups(rows), m => (m.raw && Array.isArray(m.raw.btns) ? _.compact(m.raw.btns) : []));
}

function getGroupOptionsFromLayout(btnData, { flatBtnOrderJson, groupRaw, source, sourceText }) {
  const segments = segmentsFromView(btnData, flatBtnOrderJson, groupRaw);

  return _.compact(
    segments.map(seg =>
      seg.type === 'group'
        ? {
            type: 'group',
            id: seg.id,
            name: seg.name || _l('分组'),
            icon: seg.icon || 'adds',
            iconUrl: seg.iconUrl,
            color: seg.iconColor || '',
            source,
            sourceText,
            isGroup: true,
            btnIds: seg.ids || [],
          }
        : null,
    ),
  );
}

/**
 * 行内/卡片操作的配置侧下拉数据：
 * 老逻辑允许选择完整 btnList；这里在此基础上追加详情/批量两套分组选项。
 * 分组只作为配置侧选项保存来源，不展开组内按钮，也不改变使用侧解析语义。
 */
export function actionColumnOptionsFromLayouts(btnData, layouts = []) {
  return [
    ..._.flatMap(layouts, layout => getGroupOptionsFromLayout(btnData, layout)),
    ...(btnData || []).map(btn => ({
      ...btn,
      type: 'btn',
      id: btn.btnId,
    })),
  ];
}
