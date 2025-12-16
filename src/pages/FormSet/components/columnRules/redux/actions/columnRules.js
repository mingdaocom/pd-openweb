import _ from 'lodash';
import sheetAjax from 'src/api/worksheet';
import { formatSearchConfigs } from 'src/pages/widgetConfig/util';
import { dealCusTomEventActions } from 'src/pages/widgetConfig/util/data';
import {
  checkConditionCanSave,
  checkConditionError,
  checkRuleEnableLimit,
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
  const { worksheetId, isWorksheetQuery } = worksheetInfo || {};
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
    sheetAjax.getWorksheetControls({ worksheetId, getRelationSearch: true, resultType: 3 }).then(res => {
      dispatch({
        type: 'WORKSHEET_RELATION_SEARCH',
        data: _.get(res, 'data.controls') || [],
      });
    });
    if (isWorksheetQuery) {
      sheetAjax.getQueryBySheetId({ worksheetId }).then(res => {
        const formatSearchData = formatSearchConfigs(res);
        dispatch({
          type: 'WORKSHEET_QUERY_CONFIGS',
          data: formatSearchData.filter(i => i.eventType === 2),
        });
      });
    }
  };
}

/**
 * 新增规则
 */
export function addColumnRules() {
  return (dispatch, getState) => {
    const stateList = getState().formSet;
    let { columnRulesListData = [], activeTab } = stateList;

    if (!checkRuleEnableLimit(columnRulesListData)) {
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
    const { worksheetId = '', selectRules = {}, columnRulesListData = [], worksheetRuleControls } = stateList;
    const { filters = [], name = '', ruleItems = [] } = selectRules;
    // 没有配置任何东西，直接关闭弹层
    if (!ruleItems.length && !filters.length) {
      dispatch(clearColumnRules());
      return;
    }

    // 错误校验
    const dealFilters = filterDeleteOptions(filters, worksheetRuleControls);
    const ruleItemError = ruleItems.every(ruleItem => !getActionError(ruleItem));

    if (!name || !dealFilters.length || !checkConditionCanSave(dealFilters) || !ruleItems.length || !ruleItemError) {
      filters.length > 0 && dispatch(updateError('filters', filters));
      ruleItems.length > 0 &&
        ruleItems.map((item, index) => {
          if (item.type === 9) {
            if (item.controls && item.controls.length > 0) {
              item.controls.map((c, cidx) => dispatch(updateError('setValue', c.value, `${index}-${cidx}`)));
            }
          } else {
            dispatch(updateError('action', item, index));
          }
        });
      alert(_l('请完善规则内容'), 3);
      return;
    }

    sheetAjax
      .saveControlRule({
        ...selectRules,
        filters: formatValues(filters),
        ruleItems: ruleItems.map(r => {
          if (r.type === 9) {
            return {
              ...r,
              controls: dealCusTomEventActions(r.controls, worksheetRuleControls),
            };
          }
          return r;
        }),
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
    let { worksheetId, columnRulesListData = [], copyLoading } = stateList;

    const { disabled, ruleId, name } = rule;

    if (copyLoading || (!disabled && !checkRuleEnableLimit(columnRulesListData))) {
      return;
    }

    dispatch({
      type: 'COLUMNRULES_COPY_START',
      data: true,
    });

    sheetAjax
      .saveControlRule({
        editAttrs: ['copy'],
        ruleId: ruleId,
        worksheetId,
      })
      .then(data => {
        if (data) {
          const index = _.findIndex(columnRulesListData, item => item.ruleId === ruleId);
          columnRulesListData.splice(index + 1, 0, {
            ...rule,
            name: `${name}-${_l('复制')}`,
            ruleId: data,
          });
          dispatch(clearColumnRules());
          dispatch({
            type: 'COLUMNRULES_LIST',
            data: columnRulesListData,
          });
          dispatch({
            type: 'COLUMNRULES_COPY_END',
            data: false,
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
    if (attr === 'setValue') {
      let setValueError = ruleError.setValueError || {};
      if (value === 'delete' || !_.isEmpty(safeParse(value || '{}'))) {
        delete setValueError[index];
      } else {
        setValueError[index] = true;
      }

      dispatch({
        type: 'COLUMN_RULELIST_ERROR',
        data: { ...ruleError, setValueError },
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

export function updateQueryConfigs(value) {
  return dispatch => {
    dispatch({
      type: 'WORKSHEET_QUERY_CONFIGS',
      data: value,
    });
  };
}
