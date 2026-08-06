import { saveAs } from 'file-saver';
import _, { find, get, includes, isFunction, isString, omit, pick } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import worksheetAjax from 'src/api/worksheet';
import { createRequestPool } from 'worksheet/api/standard';
import { getTreeExpandSize, handleUpdateTreeNodeExpansion, treeDataUpdater } from 'worksheet/common/TreeTableHelper';
import { postWithToken } from 'src/utils/common';
import { filterEmptyChildTableRows } from 'src/utils/record';

const PAGE_SIZE = 200;

export function updateTreeNodeExpansion(
  row = {},
  { expandAll, forceUpdate, getNewRows, updateRows, worksheetId, recordId } = {},
) {
  return (dispatch, getState) => {
    const { base = {}, rows = [], treeTableViewData } = getState();
    const { control, instanceId, workId } = base;
    const { treeMap, maxLevel } = treeTableViewData;
    const getNewRowsFn =
      getNewRows ||
      (() =>
        worksheetAjax
          .getRowRelationRows({
            worksheetId,
            rowId: recordId,
            controlId: control.controlId,
            pageIndex: 1,
            pageSize: 200,
            fastFilters: [
              {
                controlId: 'rowid',
                value: row.rowid,
              },
            ],
            instanceId,
            workId,
          })
          .then(res => {
            const newRows = res.data.map(r => ({
              ...r,
              isAddByTree: true,
            }));
            dispatch(addRows(newRows));
            return newRows;
          }));
    dispatch(
      handleUpdateTreeNodeExpansion(row, {
        expandAll,
        forceUpdate,
        treeMap,
        maxLevel,
        rows,
        getNewRows: getNewRowsFn,
        isAddsSubTree: true,
        updateRows,
      }),
    );
  };
}

export function updateBase(changes = {}) {
  return (dispatch, getState) => {
    const { base = {} } = getState();
    dispatch({
      type: 'UPDATE_BASE',
      value: { ...base, ...changes },
    });
  };
}

export const initRows = rows => ({ type: 'INIT_ROWS', rows });

export const updateTreeTableViewData =
  ({ prevTreeMap } = {}) =>
  (dispatch, getState) => {
    const { base, rows, treeTableViewData = {} } = getState();

    if (!base.isTreeTableView) {
      return;
    }

    const { treeMap, maxLevel } = treeDataUpdater(
      {},
      {
        rootRows: rows.filter(r => !r.pid),
        rows: rows,
        levelLimit: 20,
        expandSize: getTreeExpandSize(base.control),
        // 复用当前展开状态：编辑/新增记录后重建树形时，保留用户手动展开到默认层级之外的层级；
        // state 里的 treeMap 已被清空时（如 RESET 后重建），由调用方显式传入清空前的 prevTreeMap
        prevTreeMap: prevTreeMap || treeTableViewData.treeMap,
      },
    );
    dispatch({
      type: 'UPDATE_TREE_TABLE_VIEW_DATA',
      value: { maxLevel, treeMap },
    });
  };

export const resetRows = () => {
  return (dispatch, getState) => {
    const { base = {} } = getState();
    dispatch(initRows(getState().originRows));
    if (base.reset && !base.loaded) {
      dispatch({ type: 'RESET' });
    } else {
      dispatch({ type: 'RESET_TREE' });
    }

    dispatch(updateTreeTableViewData());
    return Promise.resolve();
  };
};

export const clearRows = () => {
  return (dispatch, getState) => {
    const { base = {} } = getState();
    dispatch(initRows([]));
    if (base.reset && !base.loaded) {
      dispatch({ type: 'RESET' });
    }

    return Promise.resolve();
  };
};

export const updateCellErrors = errors => {
  return {
    type: 'UPDATE_CELL_ERRORS',
    value: errors || {},
  };
};

function getChangesControlIds(oldRow, newRow, controls) {
  if (!oldRow || !newRow) {
    return [];
  }

  const ids = oldRow.updatedControlIds || [];
  controls
    .map(c => c.controlId)
    .forEach(key => {
      if (key.length === 24) {
        if (oldRow[key] !== newRow[key]) {
          ids.push(key);
        }
      }
    });
  return ids;
}

export const clearAndSetRows = (
  rows,
  { isSetValueFromEvent = false, isSetValueFromRule = false, controls = [] } = {},
) => {
  return (dispatch, getState) => {
    const oldRows = getState().rows;
    let newRows = rows;
    let deleted = oldRows.map(r => r.rowid);

    if (isSetValueFromEvent) {
      deleted = oldRows.filter(oldRow => !find(rows, r => r.rowid === oldRow.rowid)).map(r => r.rowid);
      newRows = newRows.map(row => ({
        ...row,
        updatedControlIds: getChangesControlIds(
          find(oldRows, r => r.rowid === row.rowid),
          row,
          controls,
        ),
      }));
    }

    dispatch({ type: 'CLEAR_AND_SET_ROWS', isSetValueFromEvent, isSetValueFromRule, rows: newRows, deleted });
  };
};

export const setOriginRows = rows => ({ type: 'LOAD_ROWS', rows });

export const setFilterControls =
  (filterControls, { skipRealCount } = {}) =>
  (dispatch, getState) => {
    const { rows = [], realCount, filterControls: prevFilterControls = [] } = getState();

    // 进入筛选态前，若"未筛选真实总数"未知(行来自内嵌数据，未经未筛选服务端加载落总数)，
    // 用当前未筛选 rows 落总数：此刻 state.rows 仍是全量，筛选后全删才能据 realCount 正确判空触发必填。
    // skipRealCount：放大弹层预置筛选条件时跳过——此时 rows 尚未加载(为空)，按空 rows 落总数会误置为 0。
    if (!skipRealCount && !_.isEmpty(filterControls) && _.isEmpty(prevFilterControls) && !_.isNumber(realCount)) {
      dispatch({ type: 'SET_REAL_COUNT', value: filterEmptyChildTableRows(rows).length });
    }

    dispatch({ type: 'UPDATE_FILTER_CONTROLS', filterControls });
  };

// 按本地增删维护 realCount(未筛选真实总数)。仅在真实总数已知(由未筛选加载落过)时增量维护，
// 用增量而非按 rows 重算，避免分页只加载首页时按子集重算导致少算。
export const adjustRealCount = delta => (dispatch, getState) => {
  const { realCount } = getState();

  if (_.isNumber(realCount) && delta) {
    dispatch({ type: 'SET_REAL_COUNT', value: realCount + delta });
  }
};

export const addRow = (row, insertRowId) => (dispatch, getState) => {
  const { filterControls = [] } = getState();
  // 筛选生效时，新增的临时行（temp-*）置顶，不参与筛选
  const isTempRow = row.rowid && _.isFunction(row.rowid.startsWith) && row.rowid.startsWith('temp-');
  const finalInsertRowId = !insertRowId && filterControls.length && isTempRow ? '__HEAD__' : insertRowId;
  // adjustRealCount 必须在 ADD_ROW/DELETE_ROW 等会改 rows 的 action 之前 dispatch：
  // 这些 action 会同步触发大表单实时校验（DataFormat 的必填判断），realCount 滞后会让筛选态下
  // 增删后的必填判断读到旧的 realCount，导致删空筛选后保存不触发必填、或新增首行误报必填。
  dispatch(adjustRealCount(1));
  dispatch({ type: 'ADD_ROW', row: omit(row, 'needShowLoading'), rowid: row.rowid, insertRowId: finalInsertRowId });
  dispatch(updateTreeTableViewData());
  dispatch(updatePagination({ count: _.get(getState(), 'pagination.count') + 1 }));
};

export const deleteRow = rowid => (dispatch, getState) => {
  const { cellErrors = {} } = getState();
  dispatch({ type: 'UPDATE_CELL_ERRORS', value: _.omitBy(cellErrors, (value, key) => key.startsWith(`${rowid}-`)) });
  // 先减 realCount，再 DELETE_ROW（见 addRow 注释）
  dispatch(adjustRealCount(-1));
  dispatch({ type: 'DELETE_ROW', rowid });
  dispatch(updateTreeTableViewData());
  dispatch(updatePagination({ count: _.get(getState(), 'pagination.count') - 1 }));
};

export const deleteRows =
  (rowIds, { useUserPermission } = {}) =>
  (dispatch, getState) => {
    const { rows, cellErrors = {} } = getState();
    const filteredRowIds = rowIds.filter(rowId => {
      const row = find(rows, r => r.rowid === rowId);
      return row && (useUserPermission ? row.allowdelete : true);
    });

    if (filteredRowIds.length === 0) {
      return;
    }

    dispatch({
      type: 'UPDATE_CELL_ERRORS',
      value: _.omitBy(cellErrors, (value, key) => filteredRowIds.some(rowId => key.startsWith(`${rowId}-`))),
    });
    // 先减 realCount，再 DELETE_ROWS（见 addRow 注释）：否则批量删空筛选态时，
    // DELETE_ROWS 同步触发的实时校验读到的还是旧 realCount，必填判为非空、保存不拦。
    dispatch(adjustRealCount(-filteredRowIds.length));
    dispatch({ type: 'DELETE_ROWS', rowIds: filteredRowIds });
    dispatch(updateTreeTableViewData());
  };

export const updateRow = ({ rowid, value }, { asyncUpdate, noRealUpdate } = {}) => {
  return dispatch => {
    dispatch({
      type: 'UPDATE_ROW',
      asyncUpdate,
      rowid,
      noRealUpdate,
      value: { ...value, empty: false },
    });
    dispatch(updateTreeTableViewData());
    return Promise.resolve();
  };
};

export const updateRows = ({ rowIds, value }, { asyncUpdate, noRealUpdate } = {}) => {
  return dispatch => {
    dispatch({
      type: 'UPDATE_ROWS',
      asyncUpdate,
      rowIds,
      noRealUpdate,
      value: { ...value, empty: false },
    });
    dispatch(updateTreeTableViewData());
    return Promise.resolve();
  };
};

async function batchLoadRows(args) {
  let rows = [];
  let total;
  let res;
  let noMore = false;

  while ((_.isUndefined(total) || rows.length < total) && !noMore) {
    res = await worksheetAjax.getRowRelationRows(args);
    rows = rows.concat(res.data || []).map((row, i) => ({ ...row, addTime: i }));
    if (!total) {
      total = res.count;
    }

    if (res.data.length === 0) {
      noMore = true;
    }

    args.pageIndex += 1;
  }

  return {
    res,
    rows: rows.slice(0, 1000),
  };
}

export const loadRows = ({
  worksheetId,
  recordId,
  controlId,
  pageIndex = 1,
  getWorksheet,
  from,
  isTreeTableView,
  setLoadingInfo,
  callback = () => {},
}) => {
  return (dispatch, getState) => {
    const { base = {}, filterControls = [] } = getState();
    const { instanceId, workId, control } = base;

    const args = {
      worksheetId,
      rowId: recordId,
      controlId: controlId,
      getWorksheet,
      pageIndex,
      pageSize: PAGE_SIZE,
      getType: from === 21 ? from : undefined,
      instanceId,
      workId,
      discussId: control.discussId,
      filterControls,
    };
    batchLoadRows(args)
      .then(batchRes => {
        const { res, rows } = batchRes;
        dispatch(updatePagination({ count: res.count }));
        // 仅未筛选加载时落"真实总数"(此时 res.count 即全量总数)；筛选态加载不覆盖，保留已知总数。
        if (_.isEmpty(filterControls)) {
          dispatch({ type: 'SET_REAL_COUNT', value: res.count });
        }

        dispatch({ type: 'LOAD_ROWS', rows });
        dispatch({ type: 'UPDATE_DATA_LOADING', value: false });
        dispatch(initRows(rows));
        if (isTreeTableView) {
          const expandSize = getTreeExpandSize(base.control);
          const { treeMap, maxLevel } = treeDataUpdater(
            {},
            {
              rootRows: rows.filter(r => typeof r.pid !== 'undefined' && !r.pid),
              rows: rows,
              levelLimit: 5,
              expandSize,
            },
          );
          dispatch({
            type: 'UPDATE_TREE_TABLE_VIEW_DATA',
            value: { maxLevel, treeMap },
          });
        }

        dispatch({ type: 'LOAD_ROWS_COMPLETE' });
        // 无条件清标：预取路径（initAndLoadRows）和工作流场景都会在加载前打 loadRows_ 标记，
        // 未打过标的调用方写入 false 无害
        if (isFunction(setLoadingInfo)) {
          setLoadingInfo('loadRows_' + controlId, false);
        }

        callback(res);
      })
      .catch(() => {
        // 加载失败也要清标，否则保存被永久挂起
        if (isFunction(setLoadingInfo)) {
          setLoadingInfo('loadRows_' + controlId, false);
        }

        callback(null);
      });
  };
};

// 分页加载数据
export const loadPageRows =
  ({ worksheetId, recordId, controlId, getWorksheet, from, callback = () => {} }) =>
  (dispatch, getState) => {
    const { base = {}, pagination = {}, filterControls = [] } = getState();
    const { instanceId, workId } = base;
    const { pageIndex, pageSize } = pagination;

    const args = {
      worksheetId,
      rowId: recordId,
      controlId: controlId,
      getWorksheet,
      pageIndex,
      pageSize: pageSize || PAGE_SIZE,
      getType: from === 21 ? from : undefined,
      instanceId,
      workId,
      filterControls,
    };

    // 表格形态手动分页加载
    worksheetAjax.getRowRelationRows(args).then(res => {
      dispatch({ type: 'LOAD_ROWS', rows: res.data || [] });
      dispatch({ type: 'UPDATE_DATA_LOADING', value: false });
      dispatch(initRows(res.data || []));
      callback(res);
    });
  };

export const addRows =
  (rows, options = {}) =>
  (dispatch, getState) => {
    dispatch({ type: 'ADD_ROWS', rows: rows.map(row => omit(row, 'needShowLoading')), ...options });
    dispatch(updateTreeTableViewData());
    dispatch(updatePagination({ count: _.get(getState(), 'pagination.count') + rows.length }));
    dispatch(adjustRealCount(rows.length));
  };

export const sortRows = ({ control, isAsc }) => {
  return dispatch => {
    // 只更新排序配置，不修改 rows 顺序
    dispatch({
      type: 'UPDATE_SORT_CONFIG',
      sortConfig: _.isUndefined(isAsc)
        ? null
        : {
            controlId: control.controlId,
            isAsc,
          },
    });
  };
};

export const exportSheet = ({
  worksheetId,
  rowId,
  controlId,
  clientId,
  fileName,
  filterControls = [],
  onDownload = () => {},
} = {}) => {
  return async () => {
    try {
      const resData = await postWithToken(
        `${md.global.Config.WorksheetDownUrl}/ExportExcel/DetailTable`,
        { worksheetId, tokenType: 8 },
        {
          worksheetId,
          rowId,
          controlId,
          filterControls,
          pageIndex: 1,
          pageSize: 10000,
          clientId,
        },
        {
          responseType: 'blob',
        },
      );
      onDownload();
      saveAs(resData, fileName || resData.name || 'file');
    } catch (err) {
      onDownload(err);
      alert(_l('导出失败！请稍候重试'), 2);
    }
  };
};

export const updatePagination = pagination => dispatch => {
  dispatch({ type: 'UPDATE_PAGINATION', pagination });
};

class RowData {
  constructor(args = {}) {
    this.args = args;
    this.init();
  }
  init() {
    const {
      requestPool,
      recordId,
      projectId,
      row,
      abortController,
      masterData,
      controls = [],
      searchConfig,
      isCreate = false,
      isQueryWorksheetFill = false,
      DataFormat,
    } = this.args;

    if (get(row, 'updatedControlIds')) {
      this.updatedControlIds = get(row, 'updatedControlIds');
    }

    this.handleAsyncChange = this.handleAsyncChange.bind(this);
    this.formData = new DataFormat({
      requestPool,
      data: controls.map(c => {
        let controlValue = (row || {})[c.controlId];

        if (_.isUndefined(controlValue) && (isCreate || !row)) {
          controlValue = c.value;
        }

        return {
          ...c,
          isSubList: true,
          isQueryWorksheetFill,
          value: controlValue,
        };
      }),
      isCreate: isCreate || !row,
      from: 2,
      // rules, // 批量赋值不需要业务规则
      searchConfig,
      projectId,
      masterData,
      abortController,
      masterRecordRowId: recordId,
      onAsyncChange: this.handleAsyncChange,
    });
    this.addTime = new Date().getTime();
  }
  handleAsyncChange(changes) {
    const { controls, updateRow } = this.args;
    const { controlId, value } = changes;
    this.formData.updateDataSource({ controlId, value });
    let updatedControlIds = this.formData.controlIds.concat('rowid');
    // 收集受异步赋值影响的派生字段（他表字段30/公式31/文本组合32），需包含传递依赖：
    // 例如「关联字段 -> 数值字段 -> 公式字段」中公式并未直接引用关联字段，单跳过滤会漏掉，导致界面不实时计算
    const affectedIds = new Set([controlId, ...this.formData.controlIds]);
    const derivedControls = controls.filter(c => includes([30, 31, 32], c.type));
    let hasNewAffected = true;

    while (hasNewAffected) {
      hasNewAffected = false;
      derivedControls.forEach(c => {
        if (!affectedIds.has(c.controlId) && [...affectedIds].some(id => includes(c.dataSource, id))) {
          affectedIds.add(c.controlId);
          updatedControlIds.push(c.controlId);
          hasNewAffected = true;
        }
      });
    }

    updateRow(pick(this.getRow(), updatedControlIds));
  }
  getRow() {
    const { rowId, allowEdit } = this.args;
    const rowOfFormData = [
      {
        updatedControlIds: _.uniqBy(this.updatedControlIds || []).concat(this.formData.getUpdateControlIds()),
      },
      ...this.formData.getDataSource(),
    ].reduce((a = {}, b = {}) => Object.assign(a, { [b.controlId]: b.value }));
    return {
      ...rowOfFormData,
      rowid: rowId,
      allowedit: allowEdit,
      addTime: this.addTime,
    };
  }
}

export function setRowsFromStaticRows({
  recordId,
  masterData,
  staticRows = [],
  abortController,
  type,
  allowEdit = true,
  isDefaultValue = true,
  isQueryWorksheetFill = true,
  isSetValueFromEvent = false,
  isSetValueFromRule = false,
  triggerSubListControlValueChange = () => {},
} = {}) {
  return (getState, dispatch, DataFormat) => {
    const { base = {} } = getState();
    const { controls, projectId, searchConfig, initRowIsCreate, max } = base;
    // 树形子表：value 序列化可能不带 pid/childrenids，按 value 重建会丢父子关系、展开 icon 消失。
    // 用同 rowid 的现有行（如服务端已加载行）的树字段做兜底，仅当 value 未给该字段时回退。
    const existingRows = getState().rows || [];
    const requestPool = createRequestPool({
      abortController: abortController || (typeof AbortController !== 'undefined' && new AbortController()),
      maxConcurrentRequests: 6,
    });
    const rows = (!max ? staticRows : staticRows.slice(0, max)).map(staticRow => {
      let tempRowId;

      if (/^public-/.test(staticRow.rowid)) {
        tempRowId = staticRow.rowid.replace('public-', '');
      } else if (isSetValueFromEvent) {
        if (!staticRow.rowid) {
          tempRowId = `temp-${uuidv4()}`;
        } else {
          tempRowId = staticRow.rowid;
        }
      } else {
        tempRowId = !isDefaultValue
          ? `temp-${uuidv4()}`
          : includes(staticRow.rowid, 'temp-')
            ? staticRow.rowid.replace('temp-', 'default-')
            : /^default-/.test(staticRow.rowid)
              ? staticRow.rowid
              : `default-${uuidv4()}`;
      }

      Object.keys(staticRow).forEach(key => {
        if (isString(staticRow[key]) && includes(staticRow[key], '"sid":"temp-')) {
          staticRow[key] = staticRow[key].replace('"sid":"temp-', `"sid":"default-`);
        }
      });
      const createRowArgs = {
        requestPool,
        recordId,
        projectId,
        abortController,
        row: staticRow,
        masterData,
        rowId: tempRowId,
        controls,
        searchConfig,
        isDefaultValue,
        isQueryWorksheetFill,
        allowEdit,
        isCreate:
          (!!recordId ||
            (!_.isUndefined(staticRow.initRowIsCreate)
              ? staticRow.initRowIsCreate
              : !_.isUndefined(initRowIsCreate)
                ? initRowIsCreate
                : true)) &&
          !isSetValueFromEvent,
        updateRow: row => {
          dispatch({
            type: 'UPDATE_ROW',
            rowid: row.rowid,
            value: row,
          });
          // setTimeout(() => {
          //   triggerSubListControlValueChange();
          // }, 100);
        },
        DataFormat,
      };
      const rowData = new RowData(createRowArgs);
      const builtRow = rowData.getRow();
      // value 显式给了（含空串，如手动移到根）以 value 为准；value 未给（undefined）才回退现有行的树字段
      const existingRow = find(existingRows, r => r.rowid === builtRow.rowid);
      const valuePid = get(staticRow, 'pid');
      const valueChildrenids = get(staticRow, 'childrenids');
      return _.assign(builtRow, {
        pid: ((valuePid === undefined ? get(existingRow, 'pid') : valuePid) || '').replace('temp-', 'default-'),
        childrenids: (
          (valueChildrenids === undefined ? get(existingRow, 'childrenids') : valueChildrenids) || ''
        ).replace(/temp-/g, 'default-'),
      });
    });

    if (type === 'append') {
      dispatch(addRows(rows));
      triggerSubListControlValueChange({
        action: 'append',
        isDefault: true,
        rows: filterEmptyChildTableRows(getState().rows),
      });
    } else {
      dispatch(clearAndSetRows(rows, { isSetValueFromEvent, isSetValueFromRule, controls }));
      triggerSubListControlValueChange({
        action: 'clearAndSet',
        isDefault: true,
        rows: filterEmptyChildTableRows(getState().rows),
      });
      dispatch(updateTreeTableViewData());
    }
  };
}
