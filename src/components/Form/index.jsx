import React, {
  lazy,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useReducer,
  useRef,
} from 'react';
import _ from 'lodash';
import { Icon, LoadDiv } from 'ming-ui';
import { ConfigProvider, Modal, Tooltip } from 'ming-ui/antd-components';
import { mobileConfirmPopupFunc } from 'ming-ui/antd-mobile-components';
import RecordInfoContext from 'src/pages/worksheet/common/recordInfo/RecordInfoContext';
import { browserIsMobile } from 'src/utils/platform/browser/device';
import { loadIntegrationSdk } from 'src/utils/platform/browser/integrationSdk';
import WidgetsVerifyCode from './components/WidgetsVerifyCode';
import { FORM_ERROR_TYPE } from './core/config';
import DataFormat from './core/DataFormat';
import { commonDefaultProps, commonPropTypes } from './core/formPropTypes';
import { destroyMapLocation, retainMapLocation } from './core/mapUtils';
import { useFormEventManager } from './core/useFormEventManager';
import { FORM_THEME } from './formTheme';
import { fixWeixinInputBlurScroll } from './MobileForm/tools/utils';
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

const isMobile = browserIsMobile();
const LoadableMobileForm = lazy(() => import('./MobileForm'));
const LoadableDesktopForm = lazy(() => import('./DesktopForm'));
const Entrance = React.forwardRef((componentProps, ref) => {
  const props = _.defaults({}, componentProps, commonDefaultProps);
  const recordInfoContext = useContext(RecordInfoContext);
  const dataFormat = useRef(null);
  const abortController = useRef(new AbortController());
  const controlRefs = useRef({});
  const storeCenter = useRef({});
  const changeStatus = useRef(false);
  const submitBegin = useRef(false);
  const containerRef = useRef(null); // 专门用于获取真实DOM的ref
  const newErrorDialogRef = useRef(null);

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
  const propsRef = useRef(props);
  const recordInfoContextRef = useRef(recordInfoContext);
  const Component = isMobile ? LoadableMobileForm : LoadableDesktopForm; // 定义 getState 方法，始终返回最新 state

  const getState = useCallback(() => stateRef.current, []);
  const onChangeEnhance = useCallback((dataSource, controlIds, obj) => {
    propsRef.current.onChange(dataSource, controlIds, obj);
  }, []);
  const showErrorDialog = useCallback((...args) => {
    if (_.isFunction(newErrorDialogRef.current)) {
      newErrorDialogRef.current(...args);
    }
  }, []);
  /**
   * 规则筛选数据
   */

  const getFilterDataByRule = useCallback(
    (isInit = false) => {
      getFilterDataByRuleAction(dispatch, {
        props: propsRef.current,
        dataFormat: dataFormat.current,
        getState,
        isInit,
        updateChangeStatus: bool => {
          changeStatus.current = bool;
        },
        onChangeEnhance,
      });
    },
    [getState, onChangeEnhance],
  );
  /**
   * 获取配置（业务规则 || 查询配置）
   */

  const getConfig = useCallback(({ getRules, getSearchConfig }) => {
    getConfigAction(dispatch, {
      props: propsRef.current,
      getRules,
      getSearchConfig,
    });
  }, []);
  /**
   * 更新error显示状态
   */

  const updateErrorState = useCallback(
    (isShow, controlId) => {
      updateErrorStateAction(dispatch, {
        getState,
        isShow,
        controlId,
      });
    },
    [getState],
  );

  const getSubmitData = useCallback(
    options => {
      return getSubmitDataAction(dispatch, {
        props: propsRef.current,
        getState,
        options,
        dataFormat: dataFormat.current,
        getSubmitBegin: () => submitBegin.current,
        getControlRefs: () => controlRefs.current,
        getFormContainer: () => containerRef.current,
        newErrorDialog: showErrorDialog,
      });
    },
    [getState, showErrorDialog],
  );
  /**
   * 表单提交数据
   */

  const submitFormData = useCallback(
    options => {
      submitFormDataAction(dispatch, {
        props: propsRef.current,
        getState,
        options,
        dataFormat: dataFormat.current,
        updateSubmitBegin: bool => (submitBegin.current = bool),
        getSubmitBegin: () => submitBegin.current,
        getControlRefs: () => controlRefs.current,
        getFormContainer: () => containerRef.current,
        newErrorDialog: showErrorDialog,
      });
    },
    [getState, showErrorDialog],
  );
  /**
   * 组件onChange方法
   */

  const handleChange = useCallback(
    (value, cid, item, searchByChange = true) => {
      handleChangeAction(dispatch, {
        props: propsRef.current,
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
    },
    [getState, onChangeEnhance],
  );

  const updateErrorItems = useCallback(items => {
    updateErrorItemsAction(dispatch, items);
  }, []);

  const updateUniqueErrorItems = useCallback(items => {
    updateUniqueErrorItemsAction(dispatch, items);
  }, []);

  const updateRulesLoading = useCallback(loading => {
    updateRulesLoadingAction(dispatch, loading);
  }, []);

  const setActiveTabControlId = useCallback(id => {
    updateActiveTabControlIdAction(dispatch, id);
  }, []);

  const updateLoadingItems = useCallback(items => {
    updateLoadingItemsAction(dispatch, items);
  }, []);
  /**
   * 提交的时唯一值错误
   */

  const uniqueErrorUpdate = useCallback(
    uniqueErrorIds => {
      const { uniqueErrorItems } = getState();
      alert(_l('记录提交失败：数据重复'), 2);
      const nextUniqueErrorItems = (uniqueErrorIds || []).reduce((items, uniqueErrorId) => {
        const controlId = _.isString(uniqueErrorId) ? uniqueErrorId.split(':')[0] : uniqueErrorId;

        if (_.find(items, item => item.controlId === controlId && item.errorType === FORM_ERROR_TYPE.UNIQUE)) {
          return items;
        }

        return items.concat({
          controlId,
          errorType: FORM_ERROR_TYPE.UNIQUE,
          showError: true,
        });
      }, uniqueErrorItems);

      updateUniqueErrorItems(nextUniqueErrorItems);
    },
    [getState, updateUniqueErrorItems],
  );
  /**
   * 更新渲染数据
   */

  const updateRenderData = useCallback(() => {
    const newErrorItems = dataFormat.current.getErrorControls();
    const { errorItems = [] } = getState();
    getFilterDataByRule();
    if (newErrorItems.length !== errorItems.length) updateErrorItems(newErrorItems);
  }, [getFilterDataByRule, getState, updateErrorItems]);

  const triggerCustomEvent = useCallback(
    params => {
      triggerCustomEventAction(dispatch, {
        params,
        props: propsRef.current,
        getState,
        dataFormat: dataFormat.current,
        updateRenderData,
        handleChange,
      });
    },
    [getState, handleChange, updateRenderData],
  );

  const checkControlUnique = useCallback(
    (controlId, controlType, controlValue) => {
      checkControlUniqueAction(dispatch, {
        props: propsRef.current,
        getState,
        controlId,
        controlType,
        controlValue,
      });
    },
    [getState],
  );

  const getWorkflowParams = useCallback(() => {
    const { mobileApprovalRecordInfo = {} } = propsRef.current;
    const { instanceId, workId } = browserIsMobile()
      ? mobileApprovalRecordInfo
      : _.get(recordInfoContextRef.current, 'recordBaseInfo') || {};
    return {
      instanceId,
      workId,
    };
  }, []);
  /**
   * 初始化数据
   */

  const initSourceAction = useCallback(
    (data, disabled, reInit = false) => {
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
      } = propsRef.current;
      const { rules, searchConfig } = getState();
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
          ..._.pick(propsRef.current, ['projectId', 'appId', 'groupId', 'worksheetId', 'recordId', 'viewId']),
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
        onAsyncChange: changes => {
          const { controlId, controlIds } = changes;

          if (isMobile) {
            // H5 子表行详情依赖原始异步回填值重放 DataFormat，避免 getDataSource 快照未包含最新 sourcevalue。
            onChangeEnhance(dataFormat.current.getDataSource(), controlIds || [controlId], {
              isAsyncChange: true,
              asyncChanges: changes,
            });
          } else {
            onChangeEnhance(dataFormat.current.getDataSource(), [controlId], {
              isAsyncChange: true,
            });
          }

          changeStatus.current = true;
          getFilterDataByRule();
          updateErrorItems(dataFormat.current.getErrorControls()); // updateLoadingItems({ ...state.loadingItems });
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
    },
    [
      getFilterDataByRule,
      getState,
      getWorkflowParams,
      onChangeEnhance,
      updateErrorItems,
      updateLoadingItems,
      updateRulesLoading,
      updateUniqueErrorItems,
    ],
  );
  /**
   * 渲染短信验证码
   */

  const renderVerifyCode = useCallback(
    item => {
      const { controlId, type } = item;
      const { smsVerificationFiled, smsVerification, worksheetId } = propsRef.current;

      if (
        window.isPublicWorksheet &&
        smsVerification &&
        type === 3 &&
        smsVerificationFiled === controlId &&
        item.value
      ) {
        return (
          <WidgetsVerifyCode
            {...item}
            verifyCode={state.verifyCode}
            worksheetId={worksheetId}
            handleChange={code =>
              dispatch({
                type: 'SET_VERIFY_CODE',
                payload: code,
              })
            }
          />
        );
      }

      return null;
    },
    [state.verifyCode],
  ); // 提示错误二次确认层

  const newErrorDialog = useCallback(
    (errors, options) => {
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
            if (propsRef.current.continueSubmit) {
              propsRef.current.continueSubmit({
                ignoreDialog: true,
              });
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
                        style={{
                          color: item.ignoreErrorMessage ? 'var(--color-warning)' : 'var(--color-error)',
                        }}
                      />
                    </div>

                    <div className="flex WordBreak Font14 textPrimary">{item.errorMessage}</div>
                  </div>
                );
              })}
            </div>
          ),
        });
      } else {
        Modal.confirm({
          className: 'newRuleErrorMsgDialog',
          title: <span className="Font17">{_l('表单存在以下错误，请正确填写')}</span>,
          styles: { body: { overflowX: 'hidden' } },
          okText: _l('前往修改'),
          cancelText: _l('忽略，继续保存'),
          content: (
            <div>
              {uniqueErrors.map(item => {
                return (
                  <div className="errorItem">
                    <Tooltip
                      title={item.ignoreErrorMessage ? _l('非强制校验，可选择忽略') : _l('必须修改正确后才能保存')}
                      placement="bottomLeft"
                      align={{
                        offset: [-12, 0],
                      }}
                    >
                      <Icon
                        className="Font16 pointer"
                        icon={item.ignoreErrorMessage ? 'error_outline' : 'error1'}
                        style={{
                          color: item.ignoreErrorMessage ? 'var(--color-warning)' : 'var(--color-error)',
                        }}
                      />
                    </Tooltip>

                    <div className="flex WordBreak Font14 textPrimary">{item.errorMessage}</div>
                  </div>
                );
              })}
            </div>
          ),
          cancelButtonProps: {
            style: {
              display: !isAllIgnoreError ? 'none' : undefined,
            },
          },
          onOk: () => {},
          onCancel: () => {
            submitFormData({
              ...options,
              ignoreDialog: true,
            });
          },
        });
      }
    },
    [submitFormData],
  );

  const setLoadingInfo = useCallback(
    (key, status) => {
      dataFormat.current.loadingInfo[key] = status;
      updateLoadingItems({ ...dataFormat.current.loadingInfo });
    },
    [updateLoadingItems],
  ); // 初始化数据

  useEffect(() => {
    const { rulesLoading, searchConfig } = getState();
    const { data, disabled, isWorksheetQuery } = propsRef.current;

    if (!rulesLoading && !isWorksheetQuery) {
      initSourceAction(data, disabled);
    } else if (rulesLoading || (isWorksheetQuery && searchConfig && !searchConfig.length)) {
      getConfig({
        getRules: rulesLoading,
        getSearchConfig: isWorksheetQuery && !searchConfig.length,
      });
    }

    if (window.isWeiXin) {
      $(document).on('blur.weixinInputBlurScroll', '.customMobileFormContainer input', fixWeixinInputBlurScroll);
    }

    loadIntegrationSdk();
    return () => {
      $(document).off('blur.weixinInputBlurScroll', '.customMobileFormContainer input', fixWeixinInputBlurScroll);
    };
  }, [getConfig, getState, initSourceAction]);

  useEffect(() => {
    retainMapLocation();
    const controller = abortController.current;

    return () => {
      controller.abort();
      destroyMapLocation();
    };
  }, []);

  useLayoutEffect(() => {
    stateRef.current = state;
    propsRef.current = props;
    recordInfoContextRef.current = recordInfoContext;
    newErrorDialogRef.current = newErrorDialog;
  }, [newErrorDialog, props, recordInfoContext, state]); // 监听 是否执行getConfig，如果执行，则等待配置加载完再初始化数据

  useEffect(() => {
    if (state.rules && state.searchConfig && state.configLock) {
      initSourceAction(propsRef.current.data, propsRef.current.disabled);
      updateConfigLockAction(dispatch, false);
    }
  }, [initSourceAction, state.configLock, state.rules, state.searchConfig]);
  useEffect(() => {
    if (Object.values(state.loadingItems).every(i => !i) && submitBegin.current) {
      submitFormData();
    }
  }, [state.loadingItems, state.renderData, submitFormData]); // 监听 flag 和 data.length

  useEffect(() => {
    if (firstRenderMap.current.flag) {
      firstRenderMap.current.flag = false;
      return;
    }

    initSourceAction(propsRef.current.data, propsRef.current.disabled, true);
  }, [initSourceAction, props.data.length, props.disabled, props.flag, props.isRecordLock]); // 监听 worksheetId

  useEffect(() => {
    if (firstRenderMap.current.worksheetId) {
      firstRenderMap.current.worksheetId = false;
      return;
    }

    getConfig({
      getRules: true,
      getSearchConfig: true,
    });
  }, [getConfig, props.worksheetId]); // 监听 recordId

  useEffect(() => {
    if (firstRenderMap.current.recordId) {
      firstRenderMap.current.recordId = false;
      return;
    }

    storeCenter.current = {};
  }, [props.recordId]); // 暴露方法

  useImperativeHandle(
    ref,
    () => ({
      uniqueErrorUpdate,
      submitFormData,
      getSubmitData,
      handleChange,
      triggerCustomEvent,
      getFilterDataByRule,
      setActiveTabControlId,
      updateRenderData,
      dataFormat: dataFormat.current,
      state,
    }),
    [
      getFilterDataByRule,
      getSubmitData,
      handleChange,
      setActiveTabControlId,
      state,
      submitFormData,
      triggerCustomEvent,
      uniqueErrorUpdate,
      updateRenderData,
    ],
  ); // 使用表单事件管理器

  const widgetEventProps = useFormEventManager({
    containerRef,
    stateRef,
    ..._.pick(props, ['from', 'disabledTabs', 'disabledChildTableCheck', 'flag']),
  });
  return (
    <ConfigProvider theme={FORM_THEME}>
      <div className="h100 w100 formContainer" ref={containerRef}>
        <Suspense fallback={<LoadDiv className="mTop10" />}>
          <Component
            {...props}
            {...widgetEventProps}
            renderData={state.renderData}
            errorItems={state.errorItems}
            uniqueErrorItems={state.uniqueErrorItems}
            rulesLoading={state.rulesLoading}
            loadingItems={state.loadingItems}
            verifyCode={state.verifyCode}
            activeTabControlId={state.activeTabControlId}
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
        </Suspense>
      </div>
    </ConfigProvider>
  );
});
Entrance.propTypes = { ...commonPropTypes };
export default Entrance;
