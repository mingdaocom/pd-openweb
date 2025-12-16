import { combineReducers } from 'redux';

// loading状态
export function loading(state = true, action) {
  switch (action.type) {
    case 'COLUMNRULES_LOAD_SUCCESS':
      return false;
    case 'COLUMNRULES_FETCH_START':
    case 'COLUMNRULES_FETCH_FAIL':
      return true;
    default:
      return state;
  }
}

export function copyLoading(state = false, action) {
  switch (action.type) {
    case 'COLUMNRULES_COPY_START':
    case 'COLUMNRULES_COPY_END':
      return action.data;
    default:
      return state;
  }
}

// worksheetId
export function worksheetId(state = '', action) {
  switch (action.type) {
    case 'COLUMNRULES_WORKSHEETID':
      return action.data;
    default:
      return state;
  }
}

// 当前表信息
export function worksheetInfo(state = {}, action) {
  switch (action.type) {
    case 'WORKSHEET_INFO':
      return action.data;
    default:
      return state;
  }
}

// 当前表显示规则
export function columnRulesListData(state = [], action) {
  switch (action.type) {
    case 'COLUMNRULES_LIST':
      return action.data;
    default:
      return state;
  }
}

//正编辑的规则
export function selectRules(state = {}, action) {
  switch (action.type) {
    case 'UPDATE_SELECT_COLUMNRULES_LIST':
      return action.data;
    default:
      return state;
  }
}

// 当前表与关联表数据
export function worksheetRuleControls(state = [], action) {
  switch (action.type) {
    case 'WORKSHEET_RULE_CONTROLS':
      return action.data;
    default:
      return state;
  }
}

export function worksheetRelationSearch(state = [], action) {
  switch (action.type) {
    case 'WORKSHEET_RELATION_SEARCH':
      return action.data;
    default:
      return state;
  }
}

// 当前正在编辑的筛选
export function filters(state = [], action) {
  switch (action.type) {
    case 'FILTER_LIST':
      return action.data;
    default:
      return state;
  }
}

// input框提示
export function ruleError(state = {}, action) {
  switch (action.type) {
    case 'COLUMN_RULELIST_ERROR':
      return action.data;
    default:
      return state;
  }
}

export function activeTab(state = 0, action) {
  switch (action.type) {
    case 'UPDATE_ACTIVE_TAB':
      return action.data;
    default:
      return state;
  }
}

export function queryConfigs(state = [], action) {
  switch (action.type) {
    case 'WORKSHEET_QUERY_CONFIGS':
      return action.data;
    default:
      return state;
  }
}

export default combineReducers({
  columnRulesListData,
  loading,
  copyLoading,
  filters,
  selectRules,
  worksheetRuleControls,
  worksheetRelationSearch,
  ruleError,
  activeTab,
  worksheetId,
  worksheetInfo,
  queryConfigs,
});
