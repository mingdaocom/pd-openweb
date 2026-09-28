import { combineReducers } from 'redux';
import _, { includes, uniq } from 'lodash';
import { handleTreeNodeRow, treeTableViewData } from 'worksheet/common/TreeTableHelper/index.js';
import { browserIsMobile } from 'src/utils/platform/browser/device';

function dataLoading(state = true, action) {
  switch (action.type) {
    case 'UPDATE_DATA_LOADING':
      return action.value;
    default:
      return state;
  }
}

function baseLoading(state = true, action) {
  switch (action.type) {
    case 'UPDATE_BASE_LOADING':
      return action.value;
    default:
      return state;
  }
}

function base(state = {}, action) {
  // controls, searchConfig, rules, projectId, workflowChildTableSwitch, entityName, appId
  // masterData, recordId

  switch (action.type) {
    case 'UPDATE_BASE':
      return {
        loaded: false,
        reset: false,
        ...action.value,
      };
    case 'LOAD_ROWS':
      return {
        ...state,
        loaded: true,
      };
    case 'CLEAR_AND_SET_ROWS':
      return {
        ...state,
        reset: true,
      };
    case 'RESET':
      return {
        ...state,
        loaded: false,
        reset: false,
      };
    default:
      return state;
  }
}

const DIRTY_MARKING_ACTIONS = [
  'ADD_ROW',
  'ADD_ROWS',
  'UPDATE_ROW',
  'UPDATE_ROWS',
  'DELETE_ROW',
  'DELETE_ROWS',
  'MOVE_ROW',
  'CLEAR_AND_SET_ROWS',
];

function changes(state = {}, action) {
  // 静默拖拽排序（查看态直接走接口持久化）不标脏，避免记录被误判为有未保存变更
  if (action.type === 'MOVE_ROW' && action.silent) {
    return state;
  }

  if (_.includes(DIRTY_MARKING_ACTIONS, action.type)) {
    const next = { ...state, isDirty: true };

    // 插入行（指定位置新增）与拖拽排序会改变记录顺序，标记后由保存流程附带完整排序 controlItems，
    // 否则差量保存只提交新增值、顺序会丢（新增行被追加到末尾）
    if ((action.type === 'ADD_ROW' && action.insertRowId) || action.type === 'MOVE_ROW') {
      next.orderChanged = true;
    }

    return next;
  }

  switch (action.type) {
    case 'DELETE_ALL':
      return { ...state, isDeleteAll: true, isDirty: true };
    case 'LOAD_ROWS':
    case 'INIT_ROWS':
    case 'FORCE_SET_OUT_ROWS':
    case 'RESET_CHANGES':
    case 'RESET':
      return {};
    default:
      return state;
  }
}

function cellErrors(state = {}, action) {
  switch (action.type) {
    case 'UPDATE_CELL_ERRORS':
      return action.value;
    default:
      return state;
  }
}

// 仅记录「row 端重算发现不了」的错误（失焦时持久化的非法格式值、后端唯一校验），
// 由写入方通过 action.persisted 标记。保存时只有这类错误才与 row 端结果合并：
// 否则上一次保存写回 cellErrors 的必填/规则错误会被当成待处理错误反复保留，
// 出现「改了业务规则条件字段、该字段已不必填，保存仍报必填」。
// 未标记的 key 随 cellErrors 收敛（清空、删行、改值清错误时同步失效）。
function persistedCellErrors(state = {}, action) {
  switch (action.type) {
    case 'UPDATE_CELL_ERRORS':
      return _.pickBy({ ...state, ...(action.persisted || {}) }, (error, key) => key in (action.value || {}));
    default:
      return state;
  }
}

function lastAction(state, action) {
  return action;
}

function originRows(state = [], action) {
  switch (action.type) {
    case 'LOAD_ROWS':
      return action.rows.map(row => ({ ...row }));
    default:
      return state;
  }
}

function fillEmptyRows(rows, emptyCount = 0) {
  if (rows.length < emptyCount) {
    return rows.concat(
      new Array(emptyCount - rows.length).fill().map(() => ({
        rowid: 'empty-' + Math.random().toString(32),
      })),
    );
  } else {
    return rows;
  }
}

const ROWS_HANDLED_ACTIONS = [
  'INIT_ROWS',
  'FORCE_SET_OUT_ROWS',
  'CLEAR_AND_SET_ROWS',
  'ADD_ROW',
  'ADD_ROWS',
  'UPDATE_ROW',
  'UPDATE_ROWS',
  'DELETE_ROW',
  'DELETE_ROWS',
  'MOVE_ROW',
  'UPDATE_STATE',
];

function rows(state = [], action) {
  const emptyCount = action.emptyCount || 0;

  // 无关 action 不重建空行，避免重新生成 empty rowid 导致在途交互（focus/paste）丢失行引用
  if (!_.includes(ROWS_HANDLED_ACTIONS, action.type)) {
    return state.length < emptyCount && !browserIsMobile() ? fillEmptyRows(state, emptyCount) : state;
  }

  let insertIndex;
  let newState = [...state];
  let lastNotEmptyIndex = _.findLastIndex(
    state,
    row => !(row.rowid && _.isFunction(row.rowid.startsWith) && row.rowid.startsWith('empty')),
  );

  if (!_.isUndefined(lastNotEmptyIndex) && newState.length <= emptyCount) {
    newState = state.slice(0, lastNotEmptyIndex + 1);
  }

  switch (action.type) {
    case 'INIT_ROWS':
    case 'FORCE_SET_OUT_ROWS':
    case 'CLEAR_AND_SET_ROWS':
      newState = action.rows.map(row => ({ ...row }));
      break;
    case 'ADD_ROW':
      if (action.insertRowId === '__HEAD__') {
        newState = [action.row, ...newState];
        break;
      }

      insertIndex = action.insertRowId ? _.findIndex(newState, r => r.rowid === action.insertRowId) : -1;
      if (insertIndex >= 0) {
        newState.splice(insertIndex + 1, 0, action.row);
      } else {
        if (newState.length > 5) {
          newState = newState.concat(action.row);
        } else {
          newState = newState.concat(action.row);
        }
      }

      break;
    case 'ADD_ROWS':
      newState = newState.concat(action.rows);
      break;
    case 'UPDATE_ROW':
      newState = state.map(row => (row.rowid === action.rowid ? { ...row, ...action.value } : row));
      break;
    case 'UPDATE_ROWS':
      newState = state.map(row =>
        includes(action.rowIds, row.rowid)
          ? {
              ...row,
              ...action.value,
              updatedControlIds: uniq((row.updatedControlIds || []).concat(Object.keys(action.value))),
            }
          : row,
      );
      break;
    case 'MOVE_ROW': {
      // 拖拽排序：按 rowid 在真实行序列中重排（先存本地，走子表保存流程提交新顺序）
      const fromIndex = _.findIndex(newState, r => r.rowid === action.fromRowId);
      const toIndex = _.findIndex(newState, r => r.rowid === action.toRowId);

      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
        break;
      }

      const [movedRow] = newState.splice(fromIndex, 1);
      let targetIndex = _.findIndex(newState, r => r.rowid === action.toRowId);

      if (action.position === 'after') {
        targetIndex += 1;
      }

      newState.splice(targetIndex, 0, movedRow);
      // 把新顺序同步到 addTime（子表默认顺序字段）：否则拖拽只改数组、addTime 仍是旧值/新建行的时间戳，
      // 一旦发生按 addTime 的重排（关字段排序 / 树形 / 新建记录）会被打回原序。addTime 不提交给后端，
      // 仅作前端默认排序键，故按数组顺序整体重编号即可（含新建记录，让其排序同样稳定）。
      let seq = 0;
      newState = newState.map(r =>
        r.rowid && _.isFunction(r.rowid.startsWith) && r.rowid.startsWith('empty') ? r : { ...r, addTime: seq++ },
      );
      break;
    }

    case 'DELETE_ROW':
      newState = newState.filter(row => row.rowid !== action.rowid).map(row => handleTreeNodeRow(row, action.rowid));
      break;
    case 'DELETE_ROWS':
      newState = newState
        .filter(row => !_.includes(action.rowIds, row.rowid))
        .map(row => handleTreeNodeRow(row, action.rowIds));
      break;
    case 'UPDATE_STATE':
      newState = action.state;
  }

  return newState.length < emptyCount && !browserIsMobile() ? fillEmptyRows(newState, emptyCount) : newState;
}

function pagination(state = { pageIndex: 1, pageSize: 20, count: 0 }, action) {
  switch (action.type) {
    case 'UPDATE_PAGINATION':
      return { ...state, ...action.pagination };
    default:
      return state;
  }
}

// 子表"未筛选时的真实总行数"：筛选态下 state.rows 只是服务端筛选后的子集，
// 无法据此判空触发必填，故由 actions 在未筛选加载时落总数、筛选态下按本地增删增量维护。
// 默认 null = 未知（从未在未筛选态加载过），判空时回退旧的安全策略，避免误报必填。
function realCount(state = null, action) {
  switch (action.type) {
    case 'SET_REAL_COUNT':
      return _.isNumber(action.value) ? Math.max(0, action.value) : null;
    case 'RESET':
      return null;
    default:
      return state;
  }
}

function sortConfig(state = null, action) {
  switch (action.type) {
    case 'UPDATE_SORT_CONFIG':
      return action.sortConfig;
    case 'RESET':
    case 'LOAD_ROWS':
    case 'CLEAR_AND_SET_ROWS':
      return null;
    default:
      return state;
  }
}

function filterControls(state = [], action) {
  switch (action.type) {
    case 'UPDATE_FILTER_CONTROLS':
      return action.filterControls || [];
    case 'RESET':
      return [];
    default:
      return state;
  }
}

export default combineReducers({
  cellErrors,
  persistedCellErrors,
  baseLoading,
  dataLoading,
  base,
  treeTableViewData,
  originRows,
  lastAction,
  rows,
  changes,
  pagination,
  realCount,
  sortConfig,
  filterControls,
});
