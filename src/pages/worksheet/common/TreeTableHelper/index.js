import _, { difference, find, get, intersection, isUndefined, pickBy, sortBy } from 'lodash';

function getSortedValue(list) {
  return _.map(list, function (num) {
    return _.padStart(num, 10, '0');
  });
}

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

export function getTreeExpandCellWidth(index, rowsLength) {
  rowsLength = rowsLength || 1;
  let strLength = String(rowsLength).length;
  if (strLength < 2) {
    strLength = 2;
  }
  return index * (strLength * 14) + 34;
}

export function treeDataUpdater(
  { treeMap = {} } = {},
  {
    rootRows = [],
    rows = [],
    defaultIndex = 1,
    defaultLevelList = [],
    defaultparentKeys = [],
    keyPrefix = '',
    noSetRootMapKey = false,
    expandSize,
    levelLimit,
    pageIndexStart,
  } = {},
) {
  let maxLevel = defaultIndex;
  function parseChildren(
    row,
    { index, parentKeys, keyPrefix = '', defaultLevelList = [], notSetKey = false, doNotContinue, hideExpand },
  ) {
    if (levelLimit && index > levelLimit) return;
    if (index > 50) return;
    let filteredRows = _.filter(rows, r => r.pid === row.rowid || _.includes(row.childrenids, r.rowid));
    filteredRows = _.sortBy(filteredRows, r => r.addTime);
    const key = (notSetKey ? [keyPrefix] : [keyPrefix, row.rowid]).filter(_.identity).join('_');
    doNotContinue = doNotContinue || (expandSize && index + 1 - defaultIndex > expandSize);
    if (!doNotContinue) {
      filteredRows.forEach((r, i) => {
        const newLevelList = defaultLevelList.concat(i + 1);
        maxLevel = _.max([index + 1, maxLevel]);
        parseChildren(r, {
          index: index + 1,
          parentKeys: parentKeys.concat(key),
          keyPrefix: key,
          defaultLevelList: newLevelList,
        });
      });
    }
    const childrenIds = _.uniq(safeParse(row.childrenids, 'array').concat(filteredRows.map(r => r.rowid)));
    if (!notSetKey) {
      if (typeof pageIndexStart === 'number' && defaultLevelList.length) {
        defaultLevelList[0] = pageIndexStart + defaultLevelList[0];
      }
      treeMap[key] = {
        index,
        rowid: row.rowid,
        childrenIds,
        key,
        levelList: defaultLevelList,
        loaded: doNotContinue ? false : !!filteredRows.length || !row.childrenids,
        folded: doNotContinue ? true : !filteredRows.length,
        parentKeys,
        hideExpand,
      };
    }
  }
  rootRows.forEach((row, i) => {
    parseChildren(row, {
      index: defaultIndex,
      parentKeys: defaultparentKeys,
      keyPrefix,
      defaultLevelList: noSetRootMapKey ? defaultLevelList : defaultLevelList.concat(i + 1),
      notSetKey: noSetRootMapKey,
    });
  });
  return { treeMap, maxLevel };
}

const initialTreeViewParams = {
  maxLevel: 0,
  treeMap: {},
  sortedIds: [],
  expandedAllKeys: {},
};

// 树形表格相关参数
export function treeTableViewData(state = initialTreeViewParams, action) {
  switch (action.type) {
    case 'UPDATE_TREE_TABLE_VIEW_DATA':
      return {
        ...state,
        ...action.value,
      };
    case 'UPDATED_TREE_NODE_EXPANSION':
      return {
        ...state,
        treeMap: {
          ...state.treeMap,
          [action.key]: {
            ...state.treeMap[action.key],
            ...(isUndefined(action.folded) ? {} : { folded: action.folded }),
            ...(isUndefined(action.childrenIds) ? {} : { childrenIds: action.childrenIds }),
            ...(isUndefined(action.loaded) ? {} : { loaded: action.loaded }),
            ...(isUndefined(action.loading) ? {} : { loading: action.loading }),
          },
        },
      };
    case 'UPDATE_TREE_TABLE_VIEW_ITEM':
      return {
        ...state,
        ...action.value,
      };
    case 'UPDATE_TREE_TABLE_VIEW_EXPANDED':
      return {
        ...state,
        expandedAllKeys: {
          ...state.expandedAllKeys,
          [action.key]: true,
        },
      };
    case 'UPDATE_TREE_TABLE_VIEW_TREE_MAP':
      return {
        ...state,
        treeMap: pickBy(
          {
            ...state.treeMap,
            ...action.value,
          },
          value => !isUndefined(value),
        ),
      };
    // 切换视图或表时 重置数据
    case 'RESET':
    case 'RESET_TREE':
    case 'WORKSHEET_INIT':
    case 'WORKSHEET_SHEETVIEW_CLEAR':
      return initialTreeViewParams;
    default:
      return state;
  }
}

/**
 * 更新树形视图节点
 * @param {string} recordId
 * @returns
 */
export const handleUpdateTreeNodeExpansion =
  (
    row = {},
    {
      runTimes,
      expandAll,
      forceUpdate,
      treeMap,
      maxLevel,
      rows,
      updateRows,
      getNewRows,
      isAddsSubTree,
      updateTreeNodeExpansion,
    } = {},
  ) =>
  async dispatch => {
    const recordId = row.rowid;
    const treeMapKey = row.key;
    let { folded, loaded = false, loading = false } = treeMap[treeMapKey] || {};
    let needDeleteKeys = {};
    if (forceUpdate) {
      loaded = false;
      folded = true;
    }
    if (loaded) {
      dispatch({
        type: 'UPDATED_TREE_NODE_EXPANSION',
        key: treeMapKey,
        folded: !folded,
      });
    } else if (loading) {
      return;
    } else {
      dispatch({
        type: 'UPDATED_TREE_NODE_EXPANSION',
        key: treeMapKey,
        loading: true,
      });
      const childRows = await getNewRows();
      const newRows = rows.filter(r => !find(childRows, { rowid: r.rowid })).concat(childRows);
      dispatch({
        type: 'WORKSHEET_SHEETVIEW_APPEND_ROWS',
        rows: childRows,
      });
      const newChildrenIds = isAddsSubTree
        ? row.childrenids
        : JSON.stringify(_.uniq(safeParse(row.childrenids, 'array').concat(childRows.map(r => r.rowid))));
      if (forceUpdate) {
        (updateRows([recordId], {
          childrenids: newChildrenIds,
        }),
          Object.keys(treeMap).forEach(key => {
            if (treeMap[key].parentKeys.includes(row.key)) {
              needDeleteKeys[key] = undefined;
            }
          }));
      }
      const currentTreeNode = treeMap[treeMapKey] || {};
      const treeDataUpdaterResult = isAddsSubTree
        ? treeDataUpdater({}, { rootRows: newRows.filter(r => !r.pid), rows: newRows })
        : treeDataUpdater(
            { treeMap: {} },
            {
              noSetRootMapKey: true,
              rootRows: [
                {
                  ...row,
                  childrenids: newChildrenIds,
                },
              ],
              rows: newRows,
              defaultIndex: currentTreeNode.index,
              defaultparentKeys: currentTreeNode.parentKeys,
              defaultLevelList: currentTreeNode.levelList,
              keyPrefix: treeMapKey,
              expandSize: 1,
            },
          );
      dispatch({
        type: 'UPDATE_TREE_TABLE_VIEW_ITEM',
        value: {
          maxLevel: _.max([maxLevel, treeDataUpdaterResult.maxLevel]),
        },
      });
      dispatch({
        type: 'UPDATE_TREE_TABLE_VIEW_TREE_MAP',
        value: _.assign(needDeleteKeys, treeDataUpdaterResult.treeMap),
      });
      dispatch({
        type: 'UPDATED_TREE_NODE_EXPANSION',
        key: treeMapKey,
        folded: false,
        loaded: true,
        loading: false,
        childrenIds: forceUpdate ? childRows.map(r => r.rowid) : undefined,
      });
      if (expandAll) {
        dispatch({
          type: 'UPDATE_TREE_TABLE_VIEW_EXPANDED',
          key: treeMapKey,
        });
        childRows.forEach(row => {
          if (get(row, 'childrenids.length')) {
            dispatch(
              updateTreeNodeExpansion(
                {
                  ...row,
                  key: [treeMapKey, row.rowid].filter(_.identity).join('_'),
                },
                { expandAll: true, runTimes: runTimes + 1 },
              ),
            );
          }
        });
      }
    }
  };

export function handleTreeNodeRow(row, deletedRecordId) {
  let newChildrenIds;
  if (typeof deletedRecordId === 'object') {
    row.childrenids && intersection(safeParse(row.childrenids, 'array'), deletedRecordId).length
      ? JSON.stringify(difference(safeParse(row.childrenids, 'array'), deletedRecordId))
      : row.childrenids;
  } else {
    newChildrenIds =
      row.childrenids && row.childrenids.indexOf(deletedRecordId) > -1
        ? JSON.stringify(safeParse(row.childrenids, 'array').filter(id => id !== deletedRecordId))
        : row.childrenids;
  }
  return {
    ...row,
    pid: deletedRecordId === row.pid ? '' : row.pid,
    childrenids: newChildrenIds,
  };
}
