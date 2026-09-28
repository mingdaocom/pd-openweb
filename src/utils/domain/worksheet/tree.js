import _, { find, get, sortBy } from 'lodash';
import { VIEW_DISPLAY_TYPE } from 'src/utils/domain/worksheet/constants';

/**
 * 判断视图是否为树形表格视图（层级视图的表格形态）。
 * 它与普通表格视图共用列样式（liststyle）配置，判定口径与工作表视图侧保持一致。
 */
export function isTreeTableView(view) {
  return (
    String(get(view, 'viewType')) === VIEW_DISPLAY_TYPE.structure &&
    get(view, 'advancedSetting.hierarchyViewType') === '3'
  );
}

function getSortedValue(list) {
  return _.map(list, function (num) {
    return _.padStart(num, 10, '0');
  });
}

/**
 * 按树形层级顺序整理工作表行，并过滤折叠节点的后代记录。
 */
export function getSheetViewRows(sheetViewData = {}, treeTableViewData = {}) {
  const { rows } = sheetViewData;
  const { treeMap } = treeTableViewData;
  const foldedList = Object.keys(treeMap).filter(key => treeMap[key].folded);

  return Object.keys(treeMap).length
    ? sortBy(Object.keys(treeMap), key => getSortedValue(get(treeMap, key + '.levelList') || []))
        .map(key => {
          const row = find(rows, { rowid: get(treeMap, key + '.rowid') });
          return row && { ...row, key };
        })
        .filter(row => {
          if (!row) {
            return false;
          }

          if (_.intersection(get(treeMap, `${row.key}.parentKeys`), foldedList).length) {
            return false;
          }

          return true;
        })
    : rows;
}
