import sheetAjax from 'src/api/worksheet';
import update from 'immutability-helper';
import { dealData, getParaIds, getHierarchyViewIds, getItemByRowId } from './util';
import _, { get, filter, flatten, isEmpty, isFunction } from 'lodash';
import { getCurrentView } from '../util';
import { getItem } from '../../views/util';

const MULTI_RELATE_MAX_PAGE_SIZE = 500;

const getTotalData = (hierarchyViewData = {}, total = 0) => {
  Object.values(hierarchyViewData).map(item => {
    if (item) {
      total += 1;
    }
    if (get(item, 'childrenids.length') > 0) {
      total = getTotalData(item.childrenids, total);
    }
  });
  return total;
};

// 展开多级数据
export function expandedMultiLevelHierarchyData(args) {
  return (dispatch, getState) => {
    const { sheet } = getState();
    const { searchType, ...rest } = sheet.filters || {};
    const { pageSize = 50 } = sheet.hierarchyView.hierarchyDataStatus;
    sheetAjax
      .getFilterRows({
        ...args,
        ...rest,
        ...getParaIds(sheet),
        pageSize,
        searchType: searchType || 1,
      })
      .then(({ data, count, resultCode }) => {
        if (resultCode === 1) {
          const treeData = dealData(data);
          const totalDataOver = getTotalData(data);
          // 第一次调用少于1000条，加载全量数据
          const needGetOne =
            ((totalDataOver < 1000 && pageSize === 50) || (totalDataOver > 1000 && pageSize === 1000)) &&
            sheet.hierarchyView.hierarchyTopLevelDataCount === 0;
          dispatch({ type: 'INIT_HIERARCHY_VIEW_DATA', data: treeData });
          dispatch({
            type: 'CHANGE_HIERARCHY_DATA_STATUS',
            data: {
              loading: needGetOne,
              pageIndex: 1,
              ...(needGetOne ? { pageSize: totalDataOver > 1000 ? 50 : 1000 } : {}),
            },
          });
          dispatch({
            type: 'CHANGE_HIERARCHY_TOP_LEVEL_DATA_COUNT',
            count: count,
          });
          dispatch({
            type: 'EXPAND_HIERARCHY_VIEW_STATE',
            data: {
              treeData,
              data,
              level: needGetOne ? (totalDataOver > 1000 ? '1' : '5') : +args.layer,
            },
          });

          if (needGetOne) {
            dispatch(getDefaultHierarchyData());
          }
        }
      });
  };
}

function genKanbanKeyByData(data) {
  return data.map(item => item.rowid).join(',');
}

// 递归获取多级关联的层级视图数据
function getHierarchyDataRecursion({ worksheet, records, kanbanKey, index, para }) {
  const { dispatch, getState, viewControls, level, filters, ...rest } = para;
  // 筛选条件异步加载，重新获取数据时暂停上一次递归请求
  const { sheet } = getState();
  if (!_.isEqual(_.get(filters, 'filtersGroup') || [], _.get(sheet, 'filters.filtersGroup') || [])) return;

  if (records.length >= 1000 || index > level || index > viewControls.length) {
    const treeData = dealData(records);
    dispatch({ type: 'INIT_HIERARCHY_VIEW_DATA', data: treeData });
    dispatch({
      type: 'EXPAND_HIERARCHY_VIEW_STATE',
      data: { treeData, data: records, level },
    });
    dispatch({ type: 'CHANGE_HIERARCHY_DATA_STATUS', data: { loading: false } });
    return;
  }
  const { worksheetId: relationWorksheetId, controlId } = viewControls[index - 1];
  sheetAjax
    .getFilterRows({
      ...rest,
      ...filters,
      relationWorksheetId,
      controlId,
      kanbanKey,
      pageSize: MULTI_RELATE_MAX_PAGE_SIZE,
    })
    .then(({ data }) => {
      if (data.length < 1) {
        const treeData = dealData(records);
        dispatch({ type: 'INIT_HIERARCHY_VIEW_DATA', data: treeData });
        dispatch({
          type: 'EXPAND_HIERARCHY_VIEW_STATE',
          data: { treeData, data: records, level },
        });
        dispatch({ type: 'CHANGE_HIERARCHY_DATA_STATUS', data: { loading: false } });
        return;
      }
      getHierarchyDataRecursion({
        worksheet,
        records: records.concat(data),
        kanbanKey: genKanbanKeyByData(data),
        index: index + 1,
        para,
      });
    });
}

export const expandMultiLevelHierarchyDataOfMultiRelate = level => {
  return (dispatch, getState) => {
    const { sheet } = getState();
    const { worksheetInfo = {}, filters } = sheet;
    const { worksheetId } = worksheetInfo;
    const { viewControls, viewId } = getCurrentView(sheet);
    sheetAjax
      .getFilterRows({
        worksheetId,
        viewId,
        pageSize: 50,
        ...filters,
      })
      .then(({ data, count }) => {
        const kanbanKey = genKanbanKeyByData(data);
        dispatch({
          type: 'CHANGE_HIERARCHY_TOP_LEVEL_DATA_COUNT',
          count: count,
        });
        dispatch({ type: 'CHANGE_HIERARCHY_DATA_STATUS', data: { loading: false, pageIndex: 1 } });
        if (!kanbanKey || level <= 1) {
          const treeData = dealData(data);
          dispatch({
            type: 'EXPAND_HIERARCHY_VIEW_STATE',
            data: { treeData, data, level: 1 },
          });
          dispatch({ type: 'INIT_HIERARCHY_VIEW_DATA', data: treeData });
          return;
        }
        const para = {
          viewControls,
          level,
          viewId,
          dispatch,
          getState,
          worksheetId,
          filters,
        };
        getHierarchyDataRecursion({
          worksheet: sheet,
          records: data,
          kanbanKey,
          index: 2,
          para,
        });
      });
  };
};

export const addHierarchyRecord = args => dispatch => {
  const { path, pathId, data } = args;
  dispatch({
    type: 'CHANGE_HIERARCHY_VIEW_DATA',
    data: dealData([data]),
  });
  // 添加子记录
  if (isEmpty(path)) {
    // 添加顶级记录
    dispatch({ type: 'ADD_TOP_LEVEL_STATE', data: [data] });
  } else {
    dispatch(addHierarchyChildrenRecord({ data, path, pathId }));
  }
};
export function onCopySuccess(data) {
  return dispatch => {
    const { path, pathId, item } = data;
    if (path.length === 1) {
      // 添加顶级记录
      dispatch({ type: 'ADD_TOP_LEVEL_STATE', data: item });
    } else {
      dispatch(addHierarchyChildrenRecord({ data: item, path: path.slice(0, -1), pathId: pathId.slice(0, -1) }));
    }
  };
}
export function addHierarchyChildrenRecord(data) {
  return { type: 'ADD_HIERARCHY_CHILDREN_RECORD_STATE', data };
}
export const getTopLevelHierarchyData = args => dispatch => {
  dispatch({ type: 'CHANGE_HIERARCHY_DATA_STATUS', data: { loading: true } });
  sheetAjax.getFilterRows(args).then(({ data, resultCode, count }) => {
    if (resultCode === 1) {
      const treeData = dealData(data);
      dispatch({ type: 'INIT_HIERARCHY_VIEW_DATA', data: treeData });
      dispatch({ type: 'INIT_HIERARCHY_VIEW_STATE', data });
      dispatch({ type: 'CHANGE_HIERARCHY_TOP_LEVEL_DATA_COUNT', count });
      dispatch({ type: 'CHANGE_HIERARCHY_DATA_STATUS', data: { loading: false } });
    }
  });
};
// 删除层级记录
export function deleteHierarchyRecord({ rows, path, pathId, ...rest }) {
  return (dispatch, getState) => {
    const { sheet } = getState();
    const { hierarchyView } = sheet;
    let { hierarchyViewData } = hierarchyView;
    const rowIds = rows.filter(item => !!item.allowDelete).map(item => item.rowid);
    sheetAjax.deleteWorksheetRows({ rowIds, ...getHierarchyViewIds(sheet, path), ...rest }).then(data => {
      const id = rowIds[0];
      if (data.isSuccess) {
        const pathLen = pathId.length;
        if (pathLen === 1) {
          dispatch(expandedMultiLevelHierarchyData({ layer: 3 }));
        } else {
          dispatch(
            getAssignChildren(
              {
                path: path.slice(0, -1),
                pathId: pathId.slice(0, -1),
                kanbanKey: pathId[pathLen - 2],
              },
              true,
            ),
          );
        }
        dispatch({
          type: 'CHANGE_HIERARCHY_VIEW_DATA',
          data: update(hierarchyViewData, { $unset: [id] }),
        });
      }
    });
  };
}
// 判断是否是祖先元素
const isAncestor = (src, target) => {
  for (let i = 0; i < target.length; i++) {
    if (src[i] !== target[i]) return false;
  }
  return true;
};
const isSibling = (src, target) => {
  if (!Array.isArray(src) || !Array.isArray(target)) return;
  return JSON.stringify(src.slice(0, -1)) === JSON.stringify(target.slice(0, -1));
};
export function updateMovedRecord(args) {
  return (dispatch, getState) => {
    const { src, target, ...rest } = args;
    const { sheet } = getState();
    const { controls } = sheet;
    const { viewControl } = getCurrentView(sheet);
    const control = _.find(controls, item => item.controlId === viewControl);
    const newOldControl = [
      {
        ..._.pick(control, ['type', 'controlId', 'controlName']),
        value: JSON.stringify([{ sid: target.rowId }]),
      },
    ];
    sheetAjax
      .updateWorksheetRow({
        newOldControl,
        rowId: src.rowId,
        ...getParaIds(sheet),
        ...rest,
      })
      .then(data => {
        // 如果拖拽的是顶级记录则重新拉取所有记录
        if (src.path.length === 1) {
          dispatch(expandedMultiLevelHierarchyData({ layer: 3 }));
          return;
        }

        // 如果是拖到兄弟元素上则只需要拉取父级元素
        if (isSibling(src.path, target.path)) {
          dispatch(
            getAssignChildren(
              {
                path: src.path.slice(0, -1),
                pathId: src.pathId.slice(0, -1),
                kanbanKey: src.pathId[src.pathId.length - 2],
              },
              true,
            ),
          );
          return;
        }
        // 如果拖动祖先元素中 则只拉取祖先元素的数据即可
        if (isAncestor(src.path, target.path)) {
          dispatch(
            getAssignChildren(
              {
                ..._.pick(target, ['path', 'pathId']),
                kanbanKey: target.rowId,
              },
              true,
            ),
          );
          return;
        }
        dispatch(getAssignChildren({ ..._.pick(target, ['path', 'pathId']), kanbanKey: target.rowId }, true));
        dispatch(
          getAssignChildren(
            {
              path: src.path.slice(0, -1),
              pathId: src.pathId.slice(0, -1),
              kanbanKey: src.pathId[src.pathId.length - 2],
            },
            true,
          ),
        );
      });
  };
}

export function moveMultiSheetRecord(args) {
  return function (dispatch, getState) {
    const { sheet } = getState();
    const { src, target } = args;
    const { viewControls } = getCurrentView(sheet);
    const { worksheetId } = viewControls[target.path.length - 1];
    const { controlId, worksheetId: relationWorksheetId } = viewControls[target.path.length];
    const { hierarchyView } = sheet;
    const { pid: fromRowId, controls } = get(hierarchyView, ['hierarchyViewData', [src.rowId]]);
    const { viewId } = _.find(controls, item => item.controlId === controlId) || {};

    sheetAjax
      .replaceRowRelationRows({
        worksheetId,
        fromRowId: fromRowId,
        toRowId: target.rowId,
        rowIds: [src.rowId],
        controlId,
        viewId,
      })
      .then(({ isSuccess }) => {
        if (isSuccess) {
          dispatch({ type: 'MULTI_RELATE_MOVE_RECORD', data: { src, target } });
          // 重新拉取目标节点数据
          dispatch(
            getAssignChildren({
              path: target.path,
              pathId: target.pathId,
              kanbanKey: target.rowId,
              controlId,
              relationWorksheetId,
            }),
          );
          // 重新拉取当前父节点数据
          dispatch(
            getAssignChildren({
              path: src.path.slice(0, -1),
              pathId: src.pathId.slice(0, -1),
              kanbanKey: fromRowId,
              controlId,
              relationWorksheetId,
            }),
          );
        } else {
          alert(_l('调整关联关系失败! 请稍后重试'), 2);
        }
      });
  };
}

// 关联多表层级视图获取子级数据
export function multiRelateGetChildren(para) {
  return function (dispatch, getState) {
    const { sheet } = getState();
    const { viewControls = [] } = getCurrentView(sheet);
    const layerInfo = viewControls[para.path.length];
    if (!layerInfo) return;
    const { controlId, worksheetId: relationWorksheetId } = layerInfo;

    dispatch(
      getAssignChildren({
        ...para,
        controlId,
        relationWorksheetId,
      }),
    );
  };
}

export function getAssignChildren({ path = [], pathId = [], callback, ...args }, onlyUpdateChildren = false) {
  return function (dispatch, getState) {
    const { sheet } = getState();
    const { filters, hierarchyView } = sheet;
    const { viewType, childType, viewControls = [] } = getCurrentView(sheet);
    const getDefaultPara = () => {
      if (viewType === 2 && childType === 2) {
        const level = path.length;
        const { controlId, worksheetId: relationWorksheetId } = viewControls[level] || {};
        return {
          controlId,
          relationWorksheetId,
          pageSize: 1000,
        };
      }
    };
    args = {
      ...getDefaultPara(),
      ...getParaIds(sheet),
      ...filters,
      ...args,
    };
    sheetAjax.getFilterRows(args).then(({ data, resultCode, count }) => {
      if (resultCode !== 1) {
        return;
      }
      dispatch({
        type: 'CHANGE_HIERARCHY_VIEW_DATA',
        data: dealData(data),
      });
      // 只更新children
      if (onlyUpdateChildren) {
        dispatch({
          type: 'UPDATE_HIERARCHY_CHILDREN',
          data: { data, path, pathId },
        });
        return;
      }
      dispatch({
        type: 'EXPAND_CHILDREN_STATE',
        data: { data, path, pathId },
      });
      if (_.isFunction(callback)) {
        callback();
      }
    });
  };
}

// 切换子记录的显隐
export const changeHierarchyChildrenVisible = data => {
  return { type: 'TOGGLE_HIERARCHY_VISIBLE', data };
};

// 成为顶级记录
export function becomeTopLevelRecord(data) {
  return (dispatch, getState) => {
    const { sheet } = getState();

    const { hierarchyView, controls } = sheet;
    const { hierarchyViewState } = hierarchyView;
    const { rowId, path, pathId } = data;
    // 如果更新了父记录 则重新拉取父记录的子记录
    const args = {
      kanbanKey: pathId[pathId.length - 2],
      ...getParaIds(sheet),
      ...sheet.filters,
      path: path.slice(0, -1),
      pathId: pathId.slice(0, -1),
    };
    const { viewControl } = getCurrentView(sheet);
    const control = _.find(controls, item => item.controlId === viewControl);
    const newOldControl = [
      {
        ..._.pick(control, ['type', 'controlId', 'controlName']),
        value: JSON.stringify([]),
      },
    ];
    sheetAjax.updateWorksheetRow({ newOldControl, rowId, ...getParaIds(sheet) }).then(res => {
      if (res && res.data) {
        dispatch(getAssignChildren(args, true));
        dispatch({ type: 'ADD_TOP_LEVEL_STATE', data: [res.data] });
        if (data.children && data.children.length) {
          dispatch(
            getAssignChildren(
              {
                kanbanKey: rowId,
                path: [hierarchyViewState.length],
                pathId: [rowId],
                ...getParaIds(sheet),
                ...sheet.filters,
              },
              true,
            ),
          );
        }
      }
    });
  };
}
export const addTopLevelStateFromTemp = data => {
  return { type: 'ADD_TOP_LEVEL_STATE_FROM_TEMP', data };
};
// 更新层级记录数据
export function updateHierarchyData({ recordId, value, path, pathId, relateSheet }) {
  return (dispatch, getState) => {
    const { sheet } = getState();
    const { hierarchyView } = sheet;
    const { hierarchyViewData } = hierarchyView;
    const { viewControl, childType } = getCurrentView(sheet);
    const updateKeys = Object.keys(value);
    // 如果更新了父记录 则重新拉取父记录的子记录
    if (_.includes(updateKeys, viewControl)) {
      const args = {
        kanbanKey: pathId[pathId.length - 2],
        ...getParaIds(sheet),
        ...sheet.filters,
        path: path.slice(0, -1),
        pathId: pathId.slice(0, -1),
      };
      dispatch(getAssignChildren(args, true));
      dispatch({
        type: 'ADD_TOP_LEVEL_STATE',
        data: [hierarchyViewData[recordId]],
      });
      return;
    }
    if (!_.isEmpty(value)) {
      dispatch({
        type: 'CHANGE_HIERARCHY_VIEW_DATA',
        data: update(hierarchyViewData, {
          [recordId]: { $apply: item => ({ ...item, ...value }) },
        }),
      });
    }
    // 如果在记录详情里编辑了关联记录 则重新拉取这个记录下的子记录
    if (relateSheet) {
      if (String(childType) === '2') {
        dispatch(multiRelateGetChildren({ path, pathId, kanbanKey: recordId }));
        return;
      }
      const args = {
        kanbanKey: recordId,
        ...getParaIds(sheet),
        ...sheet.filters,
        path,
        pathId,
      };
      dispatch(getAssignChildren(args, true));
    }
  };
}

// 拖拽移动记录
export function moveRecord(data) {
  return { type: 'MOVE_RECORD', data };
}

export function getHierarchyRecord(args, cb) {
  return function (dispatch, getState) {
    const { sheet } = getState();
    args = {
      ...getParaIds(sheet),
      ...sheet.filters,
      ...args,
    };
    sheetAjax.getFilterRows(args).then(({ data, resultCode, count }) => {
      if (isFunction(cb)) {
        cb(data);
      }
      if (resultCode !== 1 || !data.length) {
        return;
      }
      dispatch({ type: 'CHANGE_HIERARCHY_VIEW_DATA', data: dealData(data) });
      dispatch({ type: 'CHANGE_HIERARCHY_DATA_STATUS', data: { loading: false, pageIndex: args.pageIndex || 1 } });
      dispatch({ type: 'ADD_TOP_LEVEL_STATE', data });
      dispatch({ type: 'CHANGE_HIERARCHY_TOP_LEVEL_DATA_COUNT', count });
    });
  };
}

// 更新标题控件数据
export function updateTitleData({ data, rowId }) {
  return function (dispatch, getState) {
    const { sheet } = getState();
    const originData = get(sheet, ['hierarchyView', 'hierarchyViewData', rowId]);
    dispatch({ type: 'UPDATE_HIERARCHY_VIEW_DATA', data: { [rowId]: { ...originData, ...data } } });
  };
}

export function addTextTitleRecord(data) {
  return { type: 'ADD_TEXT_TITLE_RECORD', data };
}

export function removeHierarchyTempItem(data) {
  return { type: 'REMOVE_HIERARCHY_TEMP_ITEM', data };
}

export function addHierarchyRelateSheetControls(payload) {
  return { type: 'ADD_HIERARCHY_RELATE_SHEET_CONTROLS', payload };
}
export function initHierarchyRelateSheetControls(payload) {
  return { type: 'INIT_HIERARCHY_RELATE_SHEET_CONTROLS', payload };
}

export function getDefaultHierarchyData(view) {
  return (dispatch, getState) => {
    const { sheet } = getState();
    const pageSize =
      Number(childType) === 2
        ? 50
        : _.get(sheet, 'hierarchyView.hierarchyTopLevelDataCount')
        ? _.get(sheet, 'hierarchyView.hierarchyDataStatus.pageSize')
        : 1000;
    const { viewId, viewControl, viewControls, childType } = isEmpty(view) ? getCurrentView(sheet) : view;
    if (!viewControl && isEmpty(viewControls)) return;
    // 层级视图刷新(本表小于1000条加载全量数据)
    dispatch({
      type: 'CHANGE_HIERARCHY_DATA_STATUS',
      data: { loading: true, pageSize: pageSize },
    });
    if (_.includes(['1', '0'], String(childType))) {
      const { level } = getItem(`hierarchyConfig-${viewId}`) || {};
      dispatch(
        expandedMultiLevelHierarchyData({
          layer: level || (pageSize === 1000 ? '5' : '1'),
        }),
      );
    } else {
      // 多表关联层级视图获取多级数据 默认加载3级
      dispatch(expandMultiLevelHierarchyDataOfMultiRelate(3));
    }
  };
}

export function hierarchyViewRefresh() {
  getDefaultHierarchyData();
}

export function addMultiRelateHierarchyControls(ids) {
  return dispatch => {
    sheetAjax.getWorksheetsControls({ worksheetIds: ids }).then(({ code, data }) => {
      if (code === 1) {
        const relateControls = data.map(item => item.controls);
        dispatch(addHierarchyRelateSheetControls({ ids, controls: relateControls }));
      }
    });
  };
}

export const updateHierarchySearchRecord = record => {
  return (dispatch, getState) => {
    const { sheet } = getState();
    const count = sheet.hierarchyView.hierarchyTopLevelDataCount || 0;
    if (count < 1000) {
      if (record) {
        //向上展开所有层级
        const currentItem = getItemByRowId(record.rowid, sheet.hierarchyView.hierarchyViewState);
        if (currentItem) {
          dispatch({ type: 'CHANGE_HIERARCHY_DATA_VISIBLE', data: currentItem });
          //定位到可视区域
          setTimeout(() => {
            const searchEl = document.getElementById(`${record.rowid}`);
            if (searchEl) {
              searchEl.scrollIntoView({
                inline: 'center',
                block: 'center',
              });
            }
          }, 100);
        }
      }
      //搜索命中
      dispatch({ type: 'CHANGE_HIERARCHY_SEARCH_RECORD_ID', data: record ? record.rowid : null });
    } else {
      //打开记录详情
      dispatch({ type: 'CHANGE_HIERARCHY_RECORD_INFO_ID', data: record ? record.rowid : null });
    }
  };
};
