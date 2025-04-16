import React from 'react';
import { Dialog as MobileDialog } from 'antd-mobile';
import _, { isEmpty } from 'lodash';
import { Dialog } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import { replaceRulesTranslateInfo } from 'worksheet/util';
import { formatSearchConfigs } from 'src/pages/widgetConfig/util';
import { getExpandWidgetIds } from 'src/pages/widgetConfig/widgetSetting/components/SplitLineConfig/config';
import { browserIsMobile } from 'src/util';
import { FORM_ERROR_TYPE, FROM } from '../core/config';
import { dealCustomEvent } from '../core/customEvent';
import {
  checkAllValueAvailable,
  checkRequired,
  getRuleErrorInfo,
  replaceStr,
  updateRulesData,
} from '../core/formUtils';
import { controlState, formatControlValue, getServiceError } from '../core/utils';

export const updateErrorItemsAction = (dispatch, items) => {
  dispatch({
    type: 'SET_ERROR_ITEMS',
    payload: items,
  });
};

export const updateUniqueErrorItemsAction = (dispatch, items) => {
  dispatch({
    type: 'SET_UNIQUE_ERROR_ITEMS',
    payload: items,
  });
};

export const updateRulesLoadingAction = (dispatch, loading) => {
  dispatch({
    type: 'SET_RULES_LOADING',
    payload: loading,
  });
};

export const updateLoadingItemsAction = (dispatch, items) => {
  dispatch({
    type: 'SET_LOADING_ITEMS',
    payload: items,
  });
};

export const updateActiveTabControlIdAction = (dispatch, id) => {
  dispatch({
    type: 'SET_ACTIVE_TAB_CONTROL_ID',
    payload: id,
  });
};

export const updateConfigLockAction = (dispatch, lock) => {
  dispatch({
    type: 'SET_CONFIG_LOCK',
    payload: lock,
  });
};

export const updateEmSizeNumAction = (dispatch, num) => {
  dispatch({
    type: 'SET_EM_SIZE_NUM',
    payload: num,
  });
};

export const getFilterDataByRuleAction = (dispatch, props, dataFormat, rules = [], isInit = false) => {
  const { ignoreHideControl, recordId, from, systemControlData, verifyAllControls } = props;
  let tempRenderData = updateRulesData({
    rules,
    recordId,
    data: dataFormat.getDataSource().concat(systemControlData || []),
    from,
    updateControlIds: dataFormat.getUpdateRuleControlIds(),
    ignoreHideControl,
    checkRuleValidator: (controlId, errorType, errorMessage, rule) => {
      dataFormat.setErrorControl(controlId, errorType, errorMessage, rule, isInit);
    },
    verifyAllControls,
  });

  // 标签页显示，但标签页内没有显示字段，标签页隐藏
  tempRenderData.forEach(item => {
    if (item.type === 52 && controlState(item, from).visible && !item.hidden) {
      const childWidgets = tempRenderData.filter(i => i.sectionId === item.controlId);
      if (_.every(childWidgets, c => !(controlState(c, from).visible && !c.hidden))) {
        item.fieldPermission = replaceStr(item.fieldPermission || '111', 0, '0');
      }
    }
  });
  dispatch({
    type: 'SET_RENDER_DATA',
    payload: tempRenderData,
  });
};

/**
 * 获取配置（业务规则 || 查询配置）
 */
export const getConfigAction = async (dispatch, props, { getRules, getSearchConfig }) => {
  const { appId, worksheetId, onRulesLoad = () => {} } = props;
  let rules;
  let config;
  // 获取字段显示规则
  if (getRules) {
    rules = await sheetAjax.getControlRules({ worksheetId, type: 1 });
    rules = replaceRulesTranslateInfo(appId, worksheetId, rules);
    onRulesLoad(rules);
    dispatch({
      type: 'SET_RULES',
      payload: rules,
    });
  }
  // 获取查询配置
  if (getSearchConfig) {
    config = await sheetAjax.getQueryBySheetId({ worksheetId });
    dispatch({
      type: 'SET_SEARCH_CONFIG',
      payload: formatSearchConfigs(config),
    });
  }

  dispatch({
    type: 'SET_CONFIG_LOCK',
    payload: true,
  });
};

/**
 * 更新error显示状态
 */
export const updateErrorStateAction = (dispatch, state, { isShow, controlId }) => {
  const { errorItems, uniqueErrorItems } = state;
  if (controlId) {
    updateErrorItemsAction(
      dispatch,
      errorItems.map(item => (item.controlId === controlId ? Object.assign({}, item, { showError: false }) : item)),
    );
    updateUniqueErrorItemsAction(
      dispatch,
      uniqueErrorItems.map(item =>
        item.controlId === controlId ? Object.assign({}, item, { showError: false }) : item,
      ),
    );
  } else {
    updateErrorItemsAction(
      dispatch,
      errorItems.map(item => Object.assign({}, item, { showError: isShow })),
    );
    updateUniqueErrorItemsAction(
      dispatch,
      uniqueErrorItems.map(item => Object.assign({}, item, { showError: isShow })),
    );
  }
};

/**
 * 提交错误信息弹层
 */
export const errorDialog = errors => {
  const isMobile = browserIsMobile();
  if (isMobile) {
    MobileDialog.alert({
      content: (
        <div>
          {errors.map(item => (
            <div className="Gray_75 mBottom6 WordBreak">{item}</div>
          ))}
        </div>
      ),
      confirmText: _l('取消'),
    });
  } else {
    Dialog.confirm({
      className: 'ruleErrorMsgDialog',
      title: <span className="Bold Font17 Red">{_l('错误提示')}</span>,
      description: (
        <div>
          {errors.map(item => (
            <div className="Gray_75 mBottom6 WordBreak">{item}</div>
          ))}
        </div>
      ),
      removeCancelBtn: true,
    });
  }
};

/**
 * 获取提交数据
 */
export const getSubmitDataAction = (
  dispatch,
  props,
  state,
  { silent, ignoreAlert, verifyAllControls } = {},
  dataFormat,
  getSubmitBegin,
  getControlRefs,
) => {
  const { from, recordId, ignoreHideControl, systemControlData, tabControlProp = {}, worksheetId } = props;
  const { rules, activeTabControlId, errorItems, uniqueErrorItems } = state;
  const updateControlIds = dataFormat.getUpdateControlIds();
  const data = dataFormat.getDataSource();
  const submitBegin = getSubmitBegin();
  // 校验需要系统字段，提交不需要，防止数据被变更
  const ruleList = updateRulesData({
    rules,
    data: data.concat(systemControlData || []),
    recordId,
    checkAllUpdate: true,
    ignoreHideControl,
  });
  // 过滤系统字段
  const list = ruleList.filter(i => !_.find(systemControlData, s => s.controlId === i.controlId));
  // 保存时必走，防止无字段变更判断错误
  const errors =
    updateControlIds.length || !recordId || submitBegin || verifyAllControls
      ? checkAllValueAvailable(rules, list, recordId, from)
      : [];
  const ids = verifyAllControls
    ? list
        .filter(item => controlState(item, from).visible && controlState(item, from).editable && item.type !== 52)
        .map(it => it.controlId)
    : list
        .filter(item => {
          // 标签页隐藏，内部字段报错校验过滤
          if (item.sectionId) {
            const parentControls = _.find(list, t => t.controlId === item.sectionId);
            if (parentControls && !(controlState(parentControls, from).visible && !parentControls.hidden)) {
              return false;
            }
          }
          return controlState(item, from).visible && controlState(item, from).editable && item.type !== 52;
        })
        .map(it => it.controlId);
  const subListErrorControls = data
    .filter(c => c.type === 34)
    .map(c => ({
      controlId: c.controlId,
      error: c.store && c.store.getErrors(),
    }))
    .filter(c => !isEmpty(c.error));
  const totalErrors = errorItems
    .concat(uniqueErrorItems)
    .concat(subListErrorControls)
    .filter(it => _.includes(ids, it.controlId));
  const hasError = !!totalErrors.length;
  const hasRuleError = errors.length;

  // 提交时所有错误showError更新为true
  updateErrorStateAction(dispatch, state, { isShow: hasError });

  // 标签页内报错，展开标签页
  // 分段内报错，展开分段
  if (hasError) {
    // 分段
    data.forEach(d => {
      if (d.type === 22) {
        const expandWidgetIds = getExpandWidgetIds(data, d, from);
        const controlRefs = getControlRefs();
        const { handleExpand } = controlRefs[d.controlId] || {};
        const visibleErrors = totalErrors.filter(i => _.includes(expandWidgetIds, i.controlId));
        if (visibleErrors.length > 0 && _.isFunction(handleExpand)) {
          handleExpand(true);
        }
      }
    });

    // 标签页
    // 定位到第一个报错
    const firstErrorItem = _.head(
      totalErrors.map(t => _.find(data, d => d.controlId === t.controlId)).sort((a, b) => a.row - b.row),
    );
    if (firstErrorItem) {
      const ele = document.getElementById(`formItem-${worksheetId}-${firstErrorItem.controlId}`);
      ele && ele.scrollIntoView({ block: 'center' });
    }

    // 所有报错附属标签页
    const tabErrorControls = data
      .filter(d => _.find(totalErrors, t => t.controlId === d.controlId) && d.sectionId)
      .map(t => _.find(data, d => d.controlId === t.sectionId))
      .filter(_.identity)
      .sort((a, b) => a.row - b.row);
    if (!!tabErrorControls.length && !_.find(tabErrorControls, t => t.controlId === activeTabControlId)) {
      const tempId = _.get(tabErrorControls, '0.controlId');
      updateActiveTabControlIdAction(dispatch, tempId);
      if (_.isFunction(tabControlProp.handleSectionClick)) {
        tabControlProp.handleSectionClick(tempId);
      }
    }
  }

  let error;

  if (hasError) {
    if (!ignoreAlert && !silent) alert(_l('请正确填写记录'), 3);
    error = true;
  } else if ($('.recordInfoForm,.formMain').find('.fileUpdateLoading').length) {
    alert(_l('附件正在上传，请稍后'), 3);
    error = true;
  } else if (hasRuleError) {
    error = true;
  }

  if (!hasError && hasRuleError && !silent) {
    errorDialog(errors);
  }

  return { data: list, fullData: data, updateControlIds, hasError, hasRuleError, error, ids };
};

/**
 * 表单提交数据
 */
export const submitFormDataAction = (
  dispatch,
  props,
  state,
  options,
  dataFormat,
  updateSubmitBegin,
  getSubmitBegin,
  getControlRefs,
) => {
  const { loadingItems } = state;
  updateSubmitBegin(true);
  const { rules } = state;
  const { onSave, from } = props;
  const { data, updateControlIds, error, ids } = getSubmitDataAction(
    dispatch,
    props,
    state,
    options,
    dataFormat,
    getSubmitBegin,
    getControlRefs,
  );

  if (!error && _.some(Object.values(loadingItems), i => i)) {
    return;
  }

  onSave(error, {
    data,
    updateControlIds,
    handleRuleError: badData => {
      badData.forEach(itemBadData => {
        const [rowId, ruleId, controlId] = (itemBadData || '').split(':').reverse();
        const control = _.find(data, d => d.controlId === controlId);
        if (control && control.type === 34) {
          const state = control.store && control.store.getState();
          const ruleError = getRuleErrorInfo(_.get(state, 'base.worksheetInfo.rules'), [[ruleId, rowId].join(':')]);
          ruleError.forEach(ruleErrorItem => {
            if (_.get(ruleErrorItem, 'errorInfo.0.errorMessage')) {
              const error = {
                [`${rowId}-${_.get(ruleErrorItem, 'errorInfo.0.controlId')}`]: _.get(
                  ruleErrorItem,
                  'errorInfo.0.errorMessage',
                ),
              };
              if (!isEmpty(error)) {
                dataFormat.callStore(
                  { fnName: 'dispatch', controlId: controlId },
                  {
                    type: 'UPDATE_CELL_ERRORS',
                    value: error,
                  },
                );
              }
            }
          });
        }
      });
      let totalRuleError = getRuleErrorInfo(rules, badData)
        .reduce((total, its) => {
          return total.concat(its.errorInfo);
        }, [])
        .filter(i => _.find(data, d => d.controlId === i.controlId));
      const hideControlErrors = totalRuleError
        .filter(
          i =>
            !controlState(
              _.find(data, d => d.controlId === i.controlId),
              from,
            ).visible,
        )
        .map(i => i.errorMessage);
      // 后端校验隐藏字段报错
      if (hideControlErrors.length > 0) {
        errorDialog(hideControlErrors);
      }
      // 过滤掉子表报错、ids：不需校验的字段合集
      totalRuleError = totalRuleError.filter(it => _.includes(ids, it.controlId));
      updateErrorItemsAction(dispatch, totalRuleError);
    },
    // 接口报错
    handleServiceError: badData => {
      const { serviceError, hideControlErrors } = getServiceError(badData, data, from);
      // 后端校验隐藏字段报错
      if (hideControlErrors.length > 0) {
        errorDialog(hideControlErrors);
      }
      updateErrorItemsAction(dispatch, serviceError);
      alert(_l('记录提交失败：有必填字段未填写'), 2);
    },
  });
  updateSubmitBegin(false);
};

/**
 * 组件onChange方法
 * searchByChange: api查询被动赋值引起的工作表查询，文本类按失焦处理
 */
export const handleChangeAction = (
  dispatch,
  props,
  state,
  dataFormat,
  value,
  cid,
  item,
  updateChangeStatus,
  searchByChange = true,
) => {
  const { uniqueErrorItems, rules } = state;
  const { onWidgetChange = () => {}, onManualWidgetChange = () => {} } = props;

  if (searchByChange) {
    // 手动更改表单
    onManualWidgetChange();
  }

  if (!_.get(value, 'rows')) {
    onWidgetChange();
  }

  if (item.value !== value || cid !== item.controlId || _.get(value, 'isFormTable')) {
    if (_.get(value, 'isFormTable')) {
      value = value.value;
    }
    dataFormat.updateDataSource({
      controlId: cid,
      value,
      removeUniqueItem: id => {
        _.remove(uniqueErrorItems, o => o.controlId === id && o.errorType === FORM_ERROR_TYPE.UNIQUE);
      },
      searchByChange: searchByChange,
    });
    getFilterDataByRuleAction(dispatch, props, dataFormat, rules);

    const newErrorItems = dataFormat.getErrorControls();
    updateErrorItemsAction(
      dispatch,
      newErrorItems.map(item =>
        item.controlId === cid && item.errorType === FORM_ERROR_TYPE.RULE_REQUIRED
          ? Object.assign({}, item, { showError: !!checkRequired({ ...item, value }) })
          : item,
      ),
    );

    const ids = dataFormat.getUpdateControlIds();
    if (ids.length) {
      props.onChange(dataFormat.getDataSource(), ids, { controlId: cid });
      updateChangeStatus(true);
    }
  }
};

/**
 * 自定义事件
 */
export const triggerCustomEventAction = (dispatch, props, state, dataFormat, updateRenderData, handleChange) => {
  const { systemControlData, handleEventPermission = () => {}, from, tabControlProp = {} } = props;
  const { searchConfig = [], renderData = [] } = state;

  const customProps = {
    ...props,
    ..._.pick(props, ['from', 'recordId', 'projectId', 'worksheetId', 'appId']),
    formData: dataFormat.getDataSource().concat(systemControlData || []),
    renderData,
    searchConfig: searchConfig.filter(i => i.eventType === 1),
    checkRuleValidator: (controlId, errorType, errorMessage) => {
      dataFormat.setErrorControl(controlId, errorType, errorMessage);
    },
    setErrorItems: errorInfo => {},
    setRenderData: () => {
      updateRenderData();
      handleEventPermission();
    },
    handleChange: (value, cid, item, searchByChange) => {
      handleChange(value, cid, item, searchByChange);
    },
    handleActiveTab: id => {
      const curControl = _.find(renderData, r => r.controlId === id);
      if (
        curControl &&
        controlState(curControl, from).visible &&
        !(_.includes([FROM.PUBLIC_ADD, FROM.PUBLIC_EDIT], from) && _.includes([29, 51], curControl.type))
      ) {
        updateActiveTabControlIdAction(dispatch, id);
        if (_.isFunction(tabControlProp.handleSectionClick)) {
          tabControlProp.handleSectionClick(id);
        }
      }
    },
  };
  dealCustomEvent(customProps);
};

/**
 * 验证唯一值
 */
export const checkControlUniqueAction = (dispatch, props, state, controlId, controlType, controlValue) => {
  const { uniqueErrorItems, loadingItems } = state;
  const { worksheetId, recordId, checkCellUnique, onError = () => {} } = props;

  if (_.isFunction(checkCellUnique)) {
    if (checkCellUnique(controlId, controlValue)) {
      _.remove(uniqueErrorItems, item => item.controlId === controlId && item.errorType === FORM_ERROR_TYPE.UNIQUE);
    } else {
      uniqueErrorItems.push({
        controlId,
        errorType: FORM_ERROR_TYPE.UNIQUE,
        showError: true,
      });
    }
    updateUniqueErrorItemsAction(dispatch, uniqueErrorItems);
    return;
  }

  updateLoadingItemsAction(dispatch, { ...loadingItems, [controlId]: true });

  sheetAjax
    .checkFieldUnique({
      worksheetId,
      controlId,
      controlType,
      controlValue: formatControlValue(controlValue, controlType),
    })
    .then(res => {
      const isError = !res.isSuccess && res.data && res.data.rowId !== recordId;
      if (isError) {
        uniqueErrorItems.push({
          controlId,
          errorType: FORM_ERROR_TYPE.UNIQUE,
          showError: true,
        });
        onError();
      } else if (res.isSuccess) {
        _.remove(uniqueErrorItems, item => item.controlId === controlId && item.errorType === FORM_ERROR_TYPE.UNIQUE);
      }

      updateUniqueErrorItemsAction(dispatch, uniqueErrorItems);
      updateLoadingItemsAction(dispatch, { ...loadingItems, [controlId]: false });
    });
};
