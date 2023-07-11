import sheetAjax from 'src/api/worksheet';
import { originRuleItem } from '../../components/columnRules/config';
import _ from 'lodash';
import {
  checkConditionCanSave,
  checkConditionError,
  formatValues,
  filterDeleteOptions,
} from '../../components/columnRules/config';
import { getUnUniqName } from 'src/util';
/**
 * 获取规则列表
 */
export function loadColumnRules({ worksheetId }) {
  return (dispatch, getState) => {
    dispatch({
      type: 'COLUMNRULES_FETCH_START',
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
              ? data.map((item, index) => {
                  return {
                    ...item,
                    name: item.name || getUnUniqName(data, _l('规则%0', index + 1)),
                  };
                })
              : [],
        });
        dispatch({
          type: 'DISPALY_RULES_LIST_NUM', // 取到的规则数（已保存的）
          data: data.length,
        });
        dispatch(clearColumnRules()); //清除state历史数据
      })
      .then(err => {});
  };
}

/**
 * 当前是否编辑状态
 */
export function updateEditState(data) {
  return (dispatch, getState) => {
    dispatch({
      type: 'COLUMNRULES_ISEDIT',
      data: data.ruleId || false,
    });
  };
}

/**
 * 新增规则
 */
export function addColumnRules() {
  return (dispatch, getState) => {
    const stateList = getState().formSet;
    let { dispalyRulesNum, columnRulesListData = [] } = stateList;
    let selectRulesNew = { ...originRuleItem };
    selectRulesNew.ruleId = `new_${dispalyRulesNum + 1}`;
    selectRulesNew.name = getUnUniqName(columnRulesListData, _l('规则%0', dispalyRulesNum + 1));
    dispatch(selectColumnRules(selectRulesNew));
  };
}

/**
 * 更新编辑的规则id
 */
export function updateEditingId(data = '') {
  return (dispatch, getState) => {
    dispatch({
      type: 'COLUMNRULES_ISEDIT_ID',
      data,
    });
  };
}

//更新当前正在编辑的规则
export function selectColumnRules(data = {}) {
  return (dispatch, getState) => {
    dispatch({
      type: 'UPDATE_SELECT_COLUMNRULES_LIST',
      data: _.cloneDeep(data),
    });
    dispatch(updateEditingId(data.ruleId));
    dispatch(updateEditState(data));
  };
}

/**
 * 保存规则
 */
export function saveControlRules() {
  return (dispatch, getState) => {
    const stateList = getState().formSet;
    let { worksheetId = '', selectRules = {}, columnRulesListData = [], worksheetControls } = stateList;
    let { filters = [], name = '', ruleItems = [] } = selectRules;
    filters = filterDeleteOptions(filters, worksheetControls);
    const ruleItemError = ruleItems.every(({ type, controls = [], message }) => {
      return !!(_.includes([7, 8], type) ? true : type === 6 ? message : controls.length);
    });

    if (!ruleItems.length && !filters.length) {
      dispatch(clearColumnRules());
      return;
    }

    if (!name || !filters.length || !checkConditionCanSave(filters) || !ruleItems.length || !ruleItemError) {
      !name && dispatch(updateNameError(name));
      filters.length > 0 && dispatch(updateFilterError(filters));
      ruleItems.length > 0 && ruleItems.map((item, index) => dispatch(updateActionError(index, item)));
      alert(_l('请完善规则内容'), 3);
      return;
    }

    sheetAjax
      .saveControlRule({
        ...selectRules,
        filters: formatValues(filters),
        ruleId: selectRules.ruleId.indexOf('new_') >= 0 ? '' : selectRules.ruleId,
        worksheetId,
      })
      .then(data => {
        if (data) {
          const newColumnRulesListData =
            selectRules.ruleId.indexOf('new_') >= 0
              ? columnRulesListData.concat({ ...selectRules, ruleId: data })
              : columnRulesListData.map(item =>
                  item.ruleId === selectRules.ruleId ? { ...selectRules, filters } : item,
                );
          dispatch(clearColumnRules());
          dispatch({
            type: 'COLUMNRULES_LIST',
            data: newColumnRulesListData,
          });
          dispatch({
            type: 'DISPALY_RULES_LIST_NUM',
            data: newColumnRulesListData.length,
          });
          alert(_l('保存成功'));
        }
      });
  };
}

//取消保存,清空
export function clearColumnRules() {
  return (dispatch, getState) => {
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
        dispatch({
          type: 'DISPALY_RULES_LIST_NUM',
          data: columnRulesListDataFilter.length,
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
    sheetAjax
      .saveControlRule({
        editAttrs: ['copy'],
        ruleId: rule.ruleId,
        worksheetId,
      })
      .then(data => {
        if (data) {
          const index = _.findIndex(columnRulesListData, item => item.ruleId === rule.ruleId);
          columnRulesListData.splice(index + 1, 0, { ...rule, name: `${rule.name}-复制`, ruleId: data });
          dispatch(clearColumnRules());
          dispatch({
            type: 'COLUMNRULES_LIST',
            data: columnRulesListData,
          });
          dispatch({
            type: 'DISPALY_RULES_LIST_NUM',
            data: columnRulesListData.length,
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
    let { worksheetId } = stateList;
    const ruleIds = list.map(item => item.ruleId);
    dispatch(clearColumnRules());
    dispatch({
      type: 'COLUMNRULES_LIST',
      data: list,
    });
    dispatch({
      type: 'DISPALY_RULES_LIST_NUM',
      data: list.length,
    });
    sheetAjax.sortControlRules({
      ruleIds,
      worksheetId,
    });
  };
}

//更改当前正在编辑的规则名称
export function updateRuleName(value) {
  return (dispatch, getState) => {
    const stateList = getState().formSet;
    let { selectRules = {} } = stateList;
    selectRules.name = value;
    dispatch({
      type: 'UPDATE_SELECT_COLUMNRULES_LIST',
      data: { ...selectRules },
    });
    dispatch(updateNameError());
  };
}

//更改当前正在编辑的属性
export function updateRuleAttr(attr, value, selectRules) {
  return (dispatch, getState) => {
    const stateList = getState().formSet;
    const { worksheetId, columnRulesListData = [] } = stateList;

    sheetAjax
      .saveControlRule({
        [attr]: value,
        ruleId: selectRules.ruleId,
        editAttrs: [attr],
        worksheetId,
      })
      .then(data => {
        if (data) {
          const newColumnRulesListData = columnRulesListData.map(item =>
            item.ruleId === selectRules.ruleId ? Object.assign({}, item, { [attr]: value }) : item,
          );
          dispatch({
            type: 'COLUMNRULES_LIST',
            data: newColumnRulesListData,
          });
        }
      });
  };
}

//更改当前列表名称，实时计算宽度
export function updateColumnDataName(value, ruleId) {
  return (dispatch, getState) => {
    const stateList = getState().formSet;
    const { columnRulesListData = [] } = stateList;
    const newColumnRulesListData = columnRulesListData.map(item =>
      item.ruleId === ruleId ? Object.assign({}, item, { name: value }) : item,
    );
    dispatch({
      type: 'COLUMNRULES_LIST',
      data: newColumnRulesListData,
    });
  };
}

//更新条件并更新controlIds
export function updateFilters(filters = []) {
  return (dispatch, getState) => {
    const stateList = getState().formSet;
    let { selectRules } = stateList;
    selectRules.filters = filters;
    dispatch({
      type: 'UPDATE_SELECT_COLUMNRULES_LIST',
      data: { ...selectRules },
    });
  };
}

//更新动作
export function updateAction(ruleItems) {
  return (dispatch, getState) => {
    const stateList = getState().formSet;
    let { selectRules } = stateList;
    selectRules.ruleItems = ruleItems;
    dispatch({
      type: 'UPDATE_SELECT_COLUMNRULES_LIST',
      data: { ...selectRules },
    });
  };
}

//更新错误
export function updateFilterError(filters) {
  return (dispatch, getState) => {
    const stateList = getState().formSet;
    let { ruleError = {} } = stateList;
    let filterError = [];
    filters.forEach(item => {
      const errs = (item.groupFilters || []).map(i => {
        return checkConditionError(i);
      });
      filterError.push(errs);
    });
    dispatch({
      type: 'COLUMN_RULELIST_ERROR',
      data: { ...ruleError, filterError },
    });
  };
}
//更新名称错误
export function updateNameError(value) {
  return (dispatch, getState) => {
    const stateList = getState().formSet;
    let { ruleError = {} } = stateList;
    dispatch({
      type: 'COLUMN_RULELIST_ERROR',
      data: { ...ruleError, nameError: value ? !value : false },
    });
  };
}

//更新名称错误
export function updateActionError(index, value) {
  return (dispatch, getState) => {
    const stateList = getState().formSet;
    let { ruleError = {} } = stateList;
    let actionError = ruleError.actionError || {};
    if (value) {
      const { controls = [], type, message } = value;
      actionError[index] = _.includes([7, 8], type) ? false : type === 6 ? !message : !controls.length;
    } else {
      delete actionError[index];
    }
    dispatch({
      type: 'COLUMN_RULELIST_ERROR',
      data: { ...ruleError, actionError },
    });
  };
}
