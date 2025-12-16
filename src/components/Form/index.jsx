import React, { createContext, useContext, useEffect, useImperativeHandle, useReducer, useRef, useState } from 'react';
import _ from 'lodash';
import { Dialog, Icon, LoadDiv } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { mobileConfirmPopupFunc } from 'ming-ui/components/MobileConfirmPopup';
import RecordInfoContext from 'src/pages/worksheet/common/recordInfo/RecordInfoContext';
import { browserIsMobile } from 'src/utils/common';
import WidgetsVerifyCode from './components/WidgetsVerifyCode';
import { FORM_ERROR_TYPE } from './core/config';
import DataFormat from './core/DataFormat';
import { commonDefaultProps, commonPropTypes } from './core/formPropTypes';
import { useFormEventManager } from './core/useFormEventManager';
import { loadSDK } from './core/utils';
import {
  checkControlUniqueAction,
  getConfigAction,
  getFilterDataByRuleAction,
  getSubmitDataAction,
  handleChangeAction,
  submitFormDataAction,
  triggerCustomEventAction,
  updateActiveTabControlIdAction,
  updateConfigLockAction,
  updateErrorItemsAction,
  updateErrorStateAction,
  updateLoadingItemsAction,
  updateRulesLoadingAction,
  updateUniqueErrorItemsAction,
} from './store/actions';
import { initialState, reducer } from './store/reducers';
import './index.less';

export const EntranceContext = createContext();

export const useFormStore = () => {
  const context = useContext(EntranceContext);
  if (!context) {
    throw new Error('useFormStore must be used within a EntranceContext');
  }
  return context;
};

const isMobile = browserIsMobile();

const Entrance = React.forwardRef((props, ref) => {
  const recordInfoContext = useContext(RecordInfoContext);
  const dataFormat = useRef(null);
  const abortController = useRef(new AbortController());
  const controlRefs = useRef({});
  const storeCenter = useRef({});
  const changeStatus = useRef(false);
  const submitBegin = useRef(false);
  const containerRef = useRef(null); // 专门用于获取真实DOM的ref
  const firstRenderMap = useRef({
    flag: true,
    worksheetId: true,
    recordId: true,
  });
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    rules: props.rules || [],
    rulesLoading: !props.disableRules && !props.rules,
    searchConfig: props.searchConfig || [],
  });
  const stateRef = useRef(state);
  const [Component, setComponent] = useState(null);

  // 定义 getState 方法，始终返回最新 state
  const getState = () => stateRef.current;

  /**
   * 规则筛选数据
   */
  const getFilterDataByRule = (isInit = false) => {
    getFilterDataByRuleAction(dispatch, {
      props,
      dataFormat: dataFormat.current,
      getState,
      isInit,
      updateChangeStatus: bool => {
        changeStatus.current = bool;
      },
      onChangeEnhance,
    });
  };

  /**
   * 获取配置（业务规则 || 查询配置）
   */
  const getConfig = ({ getRules, getSearchConfig }) => {
    getConfigAction(dispatch, { props, getRules, getSearchConfig });
  };

  /**
   * 更新error显示状态
   */
  const updateErrorState = (isShow, controlId) => {
    updateErrorStateAction(dispatch, { getState, isShow, controlId });
  };

  const getSubmitData = options => {
    return getSubmitDataAction(dispatch, {
      props,
      getState,
      options,
      dataFormat: dataFormat.current,
      getSubmitBegin: () => submitBegin.current,
      getControlRefs: () => controlRefs.current,
      newErrorDialog,
    });
  };

  /**
   * 表单提交数据
   */
  const submitFormData = options => {
    submitFormDataAction(dispatch, {
      props,
      getState,
      options,
      dataFormat: dataFormat.current,
      updateSubmitBegin: bool => (submitBegin.current = bool),
      getSubmitBegin: () => submitBegin.current,
      getControlRefs: () => controlRefs.current,
      newErrorDialog,
    });
  };

  /**
   * 组件onChange方法
   */
  const handleChange = (value, cid, item, searchByChange = true) => {
    handleChangeAction(dispatch, {
      props,
      getState,
      dataFormat: dataFormat.current,
      value,
      cid,
      item,
      updateChangeStatus: bool => {
        changeStatus.current = bool;
      },
      onChangeEnhance,
      searchByChange,
    });
  };

  const updateErrorItems = items => {
    updateErrorItemsAction(dispatch, items);
  };

  const updateUniqueErrorItems = items => {
    updateUniqueErrorItemsAction(dispatch, items);
  };

  const updateRulesLoading = loading => {
    updateRulesLoadingAction(dispatch, loading);
  };

  const setActiveTabControlId = id => {
    updateActiveTabControlIdAction(dispatch, id);
  };

  const updateLoadingItems = items => {
    updateLoadingItemsAction(dispatch, items);
  };

  /**
   * 提交的时唯一值错误
   */
  const uniqueErrorUpdate = uniqueErrorIds => {
    const { uniqueErrorItems } = getState();

    alert(_l('记录提交失败：数据重复'), 2);

    (uniqueErrorIds || []).forEach(controlId => {
      if (
        !_.find(uniqueErrorItems, item => item.controlId === controlId && item.errorType === FORM_ERROR_TYPE.UNIQUE)
      ) {
        uniqueErrorItems.push({
          controlId,
          errorType: FORM_ERROR_TYPE.UNIQUE,
          showError: true,
        });
        updateUniqueErrorItems(uniqueErrorItems);
      }
    });
  };

  /**
   * 更新渲染数据
   */
  const updateRenderData = () => {
    const newErrorItems = dataFormat.current.getErrorControls();
    const { errorItems = [] } = state;
    getFilterDataByRule();
    if (newErrorItems.length !== errorItems.length) updateErrorItems(newErrorItems);
  };

  const triggerCustomEvent = params => {
    triggerCustomEventAction(dispatch, {
      params,
      props,
      getState,
      dataFormat: dataFormat.current,
      updateRenderData,
      handleChange,
    });
  };

  const checkControlUnique = (controlId, controlType, controlValue) => {
    checkControlUniqueAction(dispatch, {
      props,
      getState,
      controlId,
      controlType,
      controlValue,
    });
  };

  const getWorkflowParams = () => {
    const { mobileApprovalRecordInfo = {} } = props;
    const { instanceId, workId } = browserIsMobile()
      ? mobileApprovalRecordInfo
      : _.get(recordInfoContext, 'recordBaseInfo') || {};
    return { instanceId, workId };
  };

  const onChangeEnhance = (dataSource, controlIds, obj) => {
    props.onChange(dataSource, controlIds, obj);
  };

  /**
   * 初始化数据
   */
  const initSourceAction = (data, disabled, reInit = false) => {
    const {
      appId,
      isCharge,
      isCreate,
      projectId,
      worksheetId,
      initSource,
      recordId,
      recordCreateTime,
      from,
      onFormDataReady = () => {},
      masterRecordRowId,
      ignoreLock,
      verifyAllControls,
      loadRowsWhenChildTableStoreCreated,
      controlProps = {},
    } = props;
    const { rules, searchConfig } = state;
    const { instanceId, workId } = getWorkflowParams();
    dataFormat.current = new DataFormat({
      setSubListStore: true,
      isCharge,
      projectId,
      appId,
      worksheetId,
      recordId,
      data: data.map(c => ({ ...c, ...controlProps })),
      isCreate: _.isUndefined(isCreate) ? initSource || !recordId : isCreate,
      disabled,
      recordCreateTime,
      masterRecordRowId,
      ignoreLock,
      rules,
      from,
      instanceId,
      workId,
      verifyAllControls,
      abortController: abortController.current,
      storeCenter: storeCenter.current,
      embedData: {
        ..._.pick(props, ['projectId', 'appId', 'groupId', 'worksheetId', 'recordId', 'viewId']),
      },
      searchConfig: searchConfig.filter(i => !i.eventType),
      loadRowsWhenChildTableStoreCreated,
      updateLoadingItems: loadingItems => {
        updateLoadingItems({ ...loadingItems });
      },
      updateLoadingItemsWithAutoSubmit: loadingItems => {
        updateLoadingItems({ ...loadingItems });
      },
      activeTrigger: () => {
        if (!changeStatus.current && dataFormat.current) {
          onChangeEnhance(dataFormat.current.getDataSource(), dataFormat.current.getUpdateControlIds(), {
            noSaveTemp: true,
          });
          changeStatus.current = true;
        }
      },
      onAsyncChange: ({ controlId }) => {
        onChangeEnhance(dataFormat.current.getDataSource(), [controlId], { isAsyncChange: true });
        changeStatus.current = true;
        getFilterDataByRule();
        updateErrorItems(dataFormat.current.getErrorControls());
        // updateLoadingItems({ ...state.loadingItems });
      },
    });
    getFilterDataByRule(true);
    updateErrorItems(
      dataFormat.current.getErrorControls().map(item => ({ ...item, showError: reInit ? false : item.reInit })),
    );
    updateUniqueErrorItems([]);
    updateRulesLoading(false);
    changeStatus.current = !reInit;
    onFormDataReady(dataFormat.current);
  };

  /**
   * 渲染短信验证码
   */
  const renderVerifyCode = item => {
    const { controlId, type } = item;
    const { smsVerificationFiled, smsVerification, worksheetId } = props;

    if (window.isPublicWorksheet && smsVerification && type === 3 && smsVerificationFiled === controlId && item.value) {
      return (
        <WidgetsVerifyCode
          {...item}
          verifyCode={state.verifyCode}
          worksheetId={worksheetId}
          handleChange={code => dispatch({ type: 'SET_VERIFY_CODE', payload: code })}
        />
      );
    }
    return null;
  };

  // 提示错误二次确认层
  const newErrorDialog = (errors, options) => {
    const isAllIgnoreError = errors.every(i => i.ignoreErrorMessage);
    const uniqueErrors = _.uniqBy(errors, 'errorMessage');
    if (isMobile) {
      mobileConfirmPopupFunc({
        title: _l('表单存在以下错误，请正确填写'),
        cancelText: _l('忽略，继续保存'),
        confirmText: _l('前往修改'),
        removeCancelBtn: !isAllIgnoreError,
        closeFnName: 'onConfirm',
        onConfirm: () => {},
        onCancel: () => {
          // 新建子表保存
          if (props.continueSubmit) {
            props.continueSubmit({ ignoreDialog: true });
          } else {
            submitFormData({ ...options, ignoreDialog: true });
          }
        },
        children: (
          <div className="mobileConfirmContent">
            {uniqueErrors.map((item, index) => {
              return (
                <div className="errorItem" key={`${item.controlId}-${index}`}>
                  <div className="errorIcon">
                    <Icon
                      className="Font16 mRight10"
                      icon={item.ignoreErrorMessage ? 'error_outline' : 'error1'}
                      style={{ color: item.ignoreErrorMessage ? '#F8932C' : '#FF0000' }}
                    />
                  </div>

                  <div className="flex WordBreak Font14 Gray">{item.errorMessage}</div>
                </div>
              );
            })}
          </div>
        ),
      });
    } else {
      Dialog.confirm({
        className: 'newRuleErrorMsgDialog',
        title: <span className="Bold Font17">{_l('表单存在以下错误，请正确填写')}</span>,
        okText: _l('前往修改'),
        cancelText: _l('忽略，继续保存'),
        description: (
          <div>
            {uniqueErrors.map(item => {
              return (
                <div className="errorItem">
                  <Tooltip
                    title={item.ignoreErrorMessage ? _l('非强制校验，可选择忽略') : _l('必须修改正确后才能保存')}
                    placement="bottomLeft"
                    align={{ offset: [-12, 0] }}
                  >
                    <Icon
                      className="Font16 pointer"
                      icon={item.ignoreErrorMessage ? 'error_outline' : 'error1'}
                      style={{ color: item.ignoreErrorMessage ? '#F8932C' : '#FF0000' }}
                    />
                  </Tooltip>

                  <div className="flex WordBreak Font14 Gray">{item.errorMessage}</div>
                </div>
              );
            })}
          </div>
        ),
        removeCancelBtn: !isAllIgnoreError,
        onlyClose: true,
        onOk: () => {},
        onCancel: () => {
          submitFormData({ ...options, ignoreDialog: true });
        },
      });
    }
  };

  const setLoadingInfo = (key, status) => {
    dataFormat.current.loadingInfo[key] = status;
    updateLoadingItems({ ...dataFormat.current.loadingInfo });
  };

  // 初始化数据
  useEffect(() => {
    const { rulesLoading, searchConfig } = state;

    const { data, disabled, isWorksheetQuery } = props;
    if (!rulesLoading && !isWorksheetQuery) {
      initSourceAction(data, disabled);
    } else if (rulesLoading || (isWorksheetQuery && searchConfig && !searchConfig.length)) {
      getConfig({ getRules: rulesLoading, getSearchConfig: isWorksheetQuery && !searchConfig.length });
    }

    if (window.isWeiXin) {
      // 处理微信webview键盘收起 网页未撑开
      $(document).on('blur', '.customMobileFormContainer input', () => {
        window.scrollTo(0, 0);
      });
    }
    loadSDK();
  }, []);

  // 根据平台加载组件
  useEffect(() => {
    const loadComponent = async () => {
      if (isMobile) {
        const module = await import('./MobileForm');
        setComponent(() => module.default);
      } else {
        const module = await import('./DesktopForm');
        setComponent(() => module.default);
      }
    };

    loadComponent();

    return () => {
      abortController.current.abort();
    };
  }, []);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // 监听 是否执行getConfig，如果执行，则等待配置加载完再初始化数据
  useEffect(() => {
    if (state.rules && state.searchConfig && state.configLock) {
      initSourceAction(props.data, props.disabled);
      updateConfigLockAction(dispatch, false);
    }
  }, [state.rules, state.searchConfig, state.configLock]);

  useEffect(() => {
    if (Object.values(state.loadingItems).every(i => !i) && submitBegin.current) {
      submitFormData();
    }
  }, [state.loadingItems, state.renderData]);

  // 监听 flag 和 data.length
  useEffect(() => {
    if (firstRenderMap.current.flag) {
      firstRenderMap.current.flag = false;
      return;
    }
    initSourceAction(props.data, props.disabled, true);
  }, [props.flag, props.data.length, props.disabled, props.isRecordLock]);

  // 监听 worksheetId
  useEffect(() => {
    if (firstRenderMap.current.worksheetId) {
      firstRenderMap.current.worksheetId = false;
      return;
    }
    getConfig({ getRules: true, getSearchConfig: true });
  }, [props.worksheetId]);

  // 监听 recordId
  useEffect(() => {
    if (firstRenderMap.current.recordId) {
      firstRenderMap.current.recordId = false;
      return;
    }
    storeCenter.current = {};
  }, [props.recordId]);

  // 暴露方法
  useImperativeHandle(ref, () => ({
    uniqueErrorUpdate,
    submitFormData,
    getSubmitData,
    handleChange,
    getFilterDataByRule,
    setActiveTabControlId,
    updateRenderData,
    dataFormat: dataFormat.current,
    state,
  }));

  // 使用表单事件管理器
  const widgetEventProps = useFormEventManager({
    containerRef,
    stateRef,
    ..._.pick(props, ['from', 'disabledTabs', 'disabledChildTableCheck', 'flag']),
  });

  if (!Component) {
    return <LoadDiv />;
  }

  return (
    <EntranceContext.Provider value={{ state, dispatch }}>
      <div className="h100 w100" ref={containerRef}>
        <Component
          {...props}
          {...state}
          {...widgetEventProps}
          controlRefs={controlRefs}
          dataFormat={dataFormat}
          checkControlUnique={checkControlUnique}
          submitFormData={submitFormData}
          renderVerifyCode={renderVerifyCode}
          setActiveTabControlId={setActiveTabControlId}
          updateErrorState={updateErrorState}
          handleChange={handleChange}
          triggerCustomEvent={triggerCustomEvent}
          setLoadingInfo={setLoadingInfo}
          updateRenderData={updateRenderData}
        />
      </div>
    </EntranceContext.Provider>
  );
});

Entrance.propTypes = {
  ...commonPropTypes,
};

Entrance.defaultProps = {
  ...commonDefaultProps,
};

export default Entrance;
