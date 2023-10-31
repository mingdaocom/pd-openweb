import { combineReducers } from 'redux';

// loading状态
export function loading(state = true, action) {
  switch (action.type) {
    case 'COLUMNRULES_LOAD_SUCCESS':
    case 'PRINT_LOAD_SUCCESS':
      return false;
    case 'COLUMNRULES_FETCH_START':
    case 'COLUMNRULES_FETCH_FAIL':
    case 'PRINT_FETCH_START':
      return true;
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

// 取到的规则数（已保存的）
export function dispalyRulesNum(state = [], action) {
  switch (action.type) {
    case 'DISPALY_RULES_LIST_NUM':
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
export function worksheetControls(state = [], action) {
  switch (action.type) {
    case 'WORKSHEET_CONTROLS':
      return action.data;
    default:
      return state;
  }
}

// 当前表与关联表数据(业务规则去除系统字段)
export function worksheetRuleControls(state = [], action) {
  switch (action.type) {
    case 'WORKSHEET_RULE_CONTROLS':
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

export default combineReducers({
  columnRulesListData,
  loading,
  filters,
  dispalyRulesNum,
  selectRules,
  worksheetControls,
  ruleError,
});
