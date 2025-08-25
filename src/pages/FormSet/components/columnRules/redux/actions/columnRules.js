import _ from 'lodash';
import sheetAjax from 'src/api/worksheet';
import {
  checkConditionCanSave,
  checkConditionError,
  filterDeleteOptions,
  formatValues,
  getActionError,
  getDefaultRuleName,
  originRuleItem,
  TAB_TYPES,
} from '../../config';

/**
 * 获取规则列表
 */
export function loadColumnRules({ worksheetRuleControls, worksheetInfo }) {
  const worksheetId = _.get(worksheetInfo, 'worksheetId');
  return dispatch => {
    dispatch({
      type: 'COLUMNRULES_FETCH_START',
    });
    dispatch({
      type: 'WORKSHEET_RULE_CONTROLS',
      data: worksheetRuleControls,
    });
    dispatch({
      type: 'WORKSHEET_INFO',
      data: worksheetInfo,
    });
    dispatch({
      type: 'COLUMNRULES_WORKSHEETID',
      data: worksheetId,
    });
    sheetAjax
      .getControlRules({
        worksheetId,
        type: 1, // 1字段显隐
      })
      .then(data => {
        dispatch({
          type: 'COLUMNRULES_LOAD_SUCCESS',
        });
        dispatch({
          type: 'COLUMNRULES_LIST', // 显示规则列表
          data:
            data.length > 0
              ? data.map(item => {
                  return {
                    ...item,
                    name: item.name || getDefaultRuleName(data, 0),
                  };
                })
              : [],
        });
        dispatch(clearColumnRules()); //清除state历史数据
      })
      .then(() => {});
  };
}

/**
 * 新增规则
 */
export function addColumnRules() {
  return (dispatch, getState) => {
    const stateList = getState().formSet;
    let { columnRulesListData = [], activeTab } = stateList;

    if (columnRulesListData.length >= 50) {
      alert(_l('业务规则数量已达上限（50个）'), 3);
      return;
    }

    let selectRulesNew = Object.assign({}, originRuleItem);
    selectRulesNew.type = activeTab;
    // 验证规则
    if (activeTab === TAB_TYPES.CHECK_RULE) {
      selectRulesNew.checkType = 0;
      selectRulesNew.hintType = 0;
    }
    selectRulesNew.name = getDefaultRuleName(columnRulesListData, activeTab);

    dispatch(selectColumnRules(selectRulesNew));
  };
}

//更新当前正在编辑的规则
export function selectColumnRules(data = {}) {
  return dispatch => {
    dispatch({
      type: 'UPDATE_SELECT_COLUMNRULES_LIST',
      data: _.cloneDeep(data),
    });
  };
}

// 更新激活规则类型
export function updateActiveTab(value) {
  return dispatch => {
    dispatch({
      type: 'UPDATE_ACTIVE_TAB',
      data: value,
    });
  };
}

/**
 * 保存规则
 */
export function saveControlRules() {
  return (dispatch, getState) => {
    const stateList = getState().formSet;
    const { worksheetId = '', selectRules = {}, columnRulesListData = [], worksheetControls } = stateList;
    const { filters = [], name = '', ruleItems = [] } = selectRules;
    // 没有配置任何东西，直接关闭弹层
    if (!ruleItems.length && !filters.length) {
      dispatch(clearColumnRules());
      return;
    }

    // 错误校验
    const dealFilters = filterDeleteOptions(filters, worksheetControls);
    const ruleItemError = ruleItems.every(ruleItem => !getActionError(ruleItem));

    if (!name || !dealFilters.length || !checkConditionCanSave(dealFilters) || !ruleItems.length || !ruleItemError) {
      filters.length > 0 && dispatch(updateError('filters', filters));
      ruleItems.length > 0 && ruleItems.map((item, index) => dispatch(updateError('action', item, index)));
      alert(_l('请完善规则内容'), 3);
      return;
    }

    sheetAjax
      .saveControlRule({
        ...selectRules,
        filters: formatValues(filters),
        ruleId: selectRules.ruleId.indexOf('-') >= 0 ? '' : selectRules.ruleId,
        worksheetId,
      })
      .then(data => {
        if (data) {
          const newColumnRulesListData =
            selectRules.ruleId.indexOf('-') >= 0
              ? columnRulesListData.concat({ ...selectRules, ruleId: data })
              : columnRulesListData.map(item =>
                  item.ruleId === selectRules.ruleId ? { ...selectRules, filters } : item,
                );
          dispatch(clearColumnRules());
          dispatch({
            type: 'COLUMNRULES_LIST',
            data: newColumnRulesListData,
          });
          alert(_l('保存成功'));
        }
      });
  };
}

//取消保存,清空
export function clearColumnRules() {
  return dispatch => {
    dispatch(selectColumnRules({}));
    dispatch({
      type: 'COLUMN_RULELIST_ERROR',
      data: {},
    });
  };
}

//删除规则
export function deleteControlRules(rule) {
  return (dispatch, getState) => {
    const stateList = getState().formSet;
    let { worksheetId, columnRulesListData = [] } = stateList;

    sheetAjax
      .saveControlRule({
        ruleId: rule.ruleId,
        editAttrs: ['delete'],
        worksheetId,
      })
      .then(() => {
        const columnRulesListDataFilter = columnRulesListData.filter(item => item.ruleId !== rule.ruleId);
        dispatch(clearColumnRules());
        dispatch({
          type: 'COLUMNRULES_LIST',
          data: columnRulesListDataFilter,
        });
        alert(_l('删除成功'));
      });
  };
}

//复制规则
export function copyControlRules(rule) {
  return (dispatch, getState) => {
    const stateList = getState().formSet;
    let { worksheetId, columnRulesListData = [] } = stateList;

    if (columnRulesListData.length >= 50) {
      alert(_l('业务规则数量已达上限（50个）'), 3);
      return;
    }

    sheetAjax
      .saveControlRule({
        editAttrs: ['copy'],
        ruleId: rule.ruleId,
        worksheetId,
      })
      .then(data => {
        if (data) {
          const index = _.findIndex(columnRulesListData, item => item.ruleId === rule.ruleId);
          columnRulesListData.splice(index + 1, 0, { ...rule, name: `${rule.name}-${_l('复制')}`, ruleId: data });
          dispatch(clearColumnRules());
          dispatch({
            type: 'COLUMNRULES_LIST',
            data: columnRulesListData,
          });
          alert(_l('复制成功'));
        }
      });
  };
}

//拖拽规则
export function grabControlRules(list = []) {
  return (dispatch, getState) => {
    const stateList = getState().formSet;
    let { worksheetId, columnRulesListData } = stateList;
    const ruleIds = list.map(item => item.ruleId);

    dispatch(clearColumnRules());
    dispatch({
      type: 'COLUMNRULES_LIST',
      data: list.concat(columnRulesListData.filter(item => !_.includes(ruleIds, item.ruleId))),
    });

    sheetAjax.sortControlRules({
      ruleIds,
      worksheetId,
    });
  };
}

// 更新数据
export function updateSelectRule(attr, value) {
  return (dispatch, getState) => {
    const stateList = getState().formSet;
    const { selectRules = {} } = stateList;
    dispatch({
      type: 'UPDATE_SELECT_COLUMNRULES_LIST',
      data: { ...selectRules, [attr]: value },
    });
  };
}

// 校验配置错误
export function updateError(attr, value, index) {
  return (dispatch, getState) => {
    const stateList = getState().formSet;
    const { ruleError = {} } = stateList;
    // 筛选校验
    if (attr === 'filters') {
      let filterError = [];
      value.forEach(item => {
        const errs = (item.groupFilters || [])
          .map(i => {
            return checkConditionError(i);
          })
          .filter(_.identity);
        !_.isEmpty(errs) && filterError.push(errs);
      });
      dispatch({
        type: 'COLUMN_RULELIST_ERROR',
        data: { ...ruleError, filterError },
      });
    }
    // 执行动作校验
    if (attr === 'action') {
      let actionError = ruleError.actionError || {};
      if (value) {
        actionError[index] = getActionError(value);
      } else {
        delete actionError[index];
      }

      dispatch({
        type: 'COLUMN_RULELIST_ERROR',
        data: { ...ruleError, actionError },
      });
    }
  };
}

//更改属性直接保存（名称、禁用等操作）
export function updateRuleAttr(attr, value, ruleId) {
  return (dispatch, getState) => {
    const stateList = getState().formSet;
    const { worksheetId, columnRulesListData = [] } = stateList;

    sheetAjax
      .saveControlRule({
        [attr]: value,
        ruleId,
        editAttrs: [attr],
        worksheetId,
      })
      .then(data => {
        if (data) {
          const newColumnRulesListData = columnRulesListData.map(item =>
            item.ruleId === ruleId ? Object.assign({}, item, { [attr]: value }) : item,
          );
          dispatch({
            type: 'COLUMNRULES_LIST',
            data: newColumnRulesListData,
          });
        }
      });
  };
}
