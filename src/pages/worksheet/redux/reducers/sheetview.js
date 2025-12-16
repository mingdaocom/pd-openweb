import _, { get } from 'lodash';

export { treeTableViewData } from 'worksheet/common/TreeTableHelper/index.js';

// 表视图表格属性

const initialSheetViewConfig = {
  fixedColumnCount: 0,
  defaultScrollLeft: 0,
  sheetColumnWidths: {},
  sheetColumnWidthsMap: {},
  sheetHiddenColumns: [],
  allWorksheetIsSelected: false,
  sheetSelectedRows: [],
  columnStyles: {},
};

export function sheetViewConfig(state = initialSheetViewConfig, action) {
  switch (action.type) {
    // 记录选择逻辑
    case 'WORKSHEET_SHEETVIEW_SELECT_ALL':
      return { ...state, allWorksheetIsSelected: action.value, sheetSelectedRows: [] };
    case 'WORKSHEET_SHEETVIEW_SELECT_ROWS':
      return { ...state, allWorksheetIsSelected: false, sheetSelectedRows: [...action.rows] };
    case 'WORKSHEET_SHEETVIEW_CLEAR_SELECT':
    case 'WORKSHEET_SHEETVIEW_FETCH_ROWS_START':
      if (_.get(action, 'value.noClearSelected')) {
        return { ...state };
      }
      return { ...state, allWorksheetIsSelected: false, sheetSelectedRows: [] };
    // 列宽调整逻辑
    case 'WORKSHEET_SHEETVIEW_INIT_COLUMN_WIDTH':
      return { ...state, sheetColumnWidths: { ...action.value } };
    case 'WORKSHEET_SHEETVIEW_UPDATE_COLUMN_WIDTH':
      return action.changes
        ? { ...state, sheetColumnWidths: { ...state.sheetColumnWidths, ...action.changes } }
        : { ...state, sheetColumnWidths: { ...state.sheetColumnWidths, [action.controlId]: action.value } };
    // 列临时隐藏逻辑
    case 'WORKSHEET_SHEETVIEW_HIDE_COLUMN':
      return { ...state, sheetHiddenColumns: [...state.sheetHiddenColumns, action.controlId] };
    case 'WORKSHEET_SHEETVIEW_CLEAR_HIDDEN_COLUMN':
      return { ...state, sheetHiddenColumns: [] };
    // 冻结列
    case 'WORKSHEET_SHEETVIEW_UPDATE_FIXED_COLUMN_COUNT':
      return { ...state, fixedColumnCount: action.value };
    // 表格默认横向滚动值
    case 'WORKSHEET_SHEETVIEW_UPDATE_SCROLL_LEFT':
      return { ...state, defaultScrollLeft: action.value };
    // 显示列样式
    case 'WORKSHEET_SHEETVIEW_UPDATE_COLUMN_STYLES':
      return { ...state, columnStyles: action.value };
    case 'WORKSHEET_INIT':
    case 'WORKSHEET_SHEETVIEW_CLEAR':
      return initialSheetViewConfig;
    default:
      return state;
  }
}

// 表视图数据请求参数

const initialSheetFetchParams = {
  pageIndex: 1,
  pageSize: 50,
  sortControls: [],
};

export function sheetFetchParams(state = initialSheetFetchParams, action) {
  switch (action.type) {
    case 'WORKSHEET_SHEETVIEW_CHANGE_PAGEINDEX':
      return { ...state, pageIndex: action.pageIndex };
    case 'WORKSHEET_SHEETVIEW_CHANGE_PAGESIZE':
      return { ...state, pageSize: action.pageSize, pageIndex: action.pageIndex || 1 };
    case 'WORKSHEET_SHEETVIEW_UPDATE_SORTS':
      return {
        ...state,
        sortControls: action.sortControl && typeof action.sortControl.isAsc !== 'undefined' ? [action.sortControl] : [],
      };
    case 'WORKSHEET_INIT':
    case 'WORKSHEET_SHEETVIEW_CLEAR':
      return initialSheetFetchParams;
    default:
      return state;
  }
}

// 表视图数据请

const initialSheetViewData = {
  // 表视图loading
  loading: true,
  // 表视图记录数据
  rows: [],
  // 记录总行数
  count: 0,
  // 表视图统计信息数据
  rowsSummary: { types: {}, values: {} },
  // 表视图分组统计信息数据
  groupRowsSummary: {},
  // 表视图批量编辑权限
  permission: {},
};

export function sheetViewData(state = initialSheetViewData, action) {
  switch (action.type) {
    // 开始获取记录数据
    case 'WORKSHEET_SHEETVIEW_FETCH_ROWS_START':
      return { ...state, loading: !(action.value || {}).noLoading };
    case 'WORKSHEET_SHEETVIEW_REFRESH':
      return { ...state, refreshFlag: Math.random() };
    // 更新记录数据
    case 'WORKSHEET_SHEETVIEW_FETCH_ROWS':
    case 'WORKSHEET_SHEETVIEW_UPDATE_ROWS':
      return { ...state, loading: false, rows: action.rows };
    case 'WORKSHEET_SHEETVIEW_APPEND_ROWS':
      return { ...state, rows: state.rows.concat(action.rows) };
    // 更新记录页数
    case 'WORKSHEET_SHEETVIEW_UPDATE_COUNT':
      return { ...state, count: action.count };
    // 更新记录页数
    case 'WORKSHEET_SHEETVIEW_UPDATE_COUNT_ABNORMAL':
      return { ...state, pageCountAbnormal: true };
    // 更新单个记录数据
    case 'WORKSHEET_SHEETVIEW_UPDATE_ROWS_BY_ROWIDS':
      return {
        ...state,
        loading: false,
        rows: state.rows.map(row =>
          _.includes(action.rowIds, row.rowid) ? { ...row, ...action.rowUpdatedValue } : row,
        ),
      };
    // 获取视图统计信息成功
    case 'WORKSHEET_SHEETVIEW_FETCH_REPORT_SUCCESS':
      if (action.groupKey) {
        return {
          ...state,
          groupRowsSummary: {
            ...state.groupRowsSummary,
            [action.groupKey]: {
              values: action.values || get(state, `groupRowsSummary.${action.groupKey}.values`, {}),
            },
            ...(action.types ? { types: action.types || get(state, 'groupRowsSummary.types', {}) } : {}),
          },
        };
      } else {
        return {
          ...state,
          rowsSummary: {
            types: action.types || state.rowsSummary.types || {},
            values: action.values || state.rowsSummary.values || {},
          },
        };
      }
    // 隐藏记录
    case 'WORKSHEET_SHEETVIEW_HIDE_ROWS':
      return {
        ...state,
        loading: false,
        rows: state.rows.filter(row => !_.includes(action.rowIds, row.rowid)),
        count: state.count - action.rowIds.length,
      };
    // 更新批量编辑权限
    case 'WORKSHEET_SHEETVIEW_UPDATE_PERMISSION':
      return { ...state, permission: { ...state.permission, [action.viewId]: action.value } };
    // 切换视图或表时 重置数据
    case 'WORKSHEET_INIT':
    case 'WORKSHEET_SHEETVIEW_CLEAR':
      return initialSheetViewData;
    default:
      return state;
  }
}

export function abortController(state = new AbortController(), action) {
  return action.type === 'WORKSHEET_SHEETVIEW_INIT_ABORT_CONTROLLER' ? new AbortController() : state;
}

export function foldedMap(state = {}, action) {
  switch (action.type) {
    case 'WORKSHEET_SHEETVIEW_FETCH_ROWS_START':
    case 'WORKSHEET_SHEETVIEW_CLEAR_FOLDED':
      return {};
    case 'WORKSHEET_SHEETVIEW_UPDATE_FOLDED':
      return {
        ...state,
        ...action.value,
      };
    default:
      return state;
  }
}

export function groupFetchParams(state = {}, action) {
  switch (action.type) {
    case 'WORKSHEET_SHEETVIEW_CHANGE_GROUP_FETCH_PARAMS':
      return { ...state, [action.groupKey]: { ...state[action.groupKey], ...action.changes } };
    case 'WORKSHEET_INIT':
    case 'WORKSHEET_SHEETVIEW_CLEAR':
    case 'WORKSHEET_SHEETVIEW_FETCH_ROWS_START':
      return {};
    default:
      return state;
  }
}
