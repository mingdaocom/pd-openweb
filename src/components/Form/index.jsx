import React, { createContext, useContext, useEffect, useImperativeHandle, useReducer, useRef, useState } from 'react';
import { LoadDiv } from 'ming-ui';
import { isCustomWidget } from 'src/pages/widgetConfig/util';
import { browserIsMobile } from 'src/utils/common';
import { isRelateRecordTableControl } from 'src/utils/control';
import FormWidget from './components/FormWidget';
import FreeField from './components/FreeField';
import WidgetsDesc from './components/WidgetsDesc';
import WidgetsVerifyCode from './components/WidgetsVerifyCode';
import { FORM_ERROR_TYPE, FROM } from './core/config';
import DataFormat from './core/DataFormat';
import { ADD_EVENT_ENUM } from './core/enum';
import { commonDefaultProps, commonPropTypes } from './core/formPropTypes';
import { controlState, convertControl, isUnTextWidget, loadSDK } from './core/utils';
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
  const dataFormat = useRef(null);
  const abortController = useRef(new AbortController());
  const controlRefs = useRef({});
  const storeCenter = useRef({});
  const changeStatus = useRef(false);
  const submitBegin = useRef(false);
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
  const [Component, setComponent] = useState(null);

  /**
   * 规则筛选数据
   */
  const getFilterDataByRule = (isInit = false) => {
    getFilterDataByRuleAction(dispatch, props, dataFormat.current, state.rules, isInit);
  };

  /**
   * 获取配置（业务规则 || 查询配置）
   */
  const getConfig = ({ getRules, getSearchConfig }) => {
    getConfigAction(dispatch, props, { getRules, getSearchConfig });
  };

  /**
   * 更新error显示状态
   */
  const updateErrorState = (isShow, controlId) => {
    updateErrorStateAction(dispatch, state, { isShow, controlId });
  };

  const getSubmitData = options => {
    return getSubmitDataAction(
      dispatch,
      props,
      state,
      options,
      dataFormat.current,
      () => submitBegin.current,
      () => controlRefs.current,
    );
  };

  /**
   * 表单提交数据
   */
  const submitFormData = options => {
    submitFormDataAction(
      dispatch,
      props,
      state,
      options,
      dataFormat.current,
      bool => (submitBegin.current = bool),
      () => submitBegin.current,
      () => controlRefs.current,
    );
  };

  /**
   * 组件onChange方法
   */
  const handleChange = (value, cid, item, searchByChange = true) => {
    handleChangeAction(
      dispatch,
      props,
      state,
      dataFormat.current,
      value,
      cid,
      item,
      bool => {
        changeStatus.current = bool;
      },
      searchByChange,
    );
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

  const updateActiveTabControlId = id => {
    updateActiveTabControlIdAction(dispatch, id);
  };

  const updateLoadingItems = items => {
    updateLoadingItemsAction(dispatch, items);
  };

  /**
   * 提交的时唯一值错误
   */
  const uniqueErrorUpdate = uniqueErrorIds => {
    const { uniqueErrorItems } = state;

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
    triggerCustomEventAction(dispatch, params, props, state, dataFormat.current, updateRenderData, handleChange);
  };

  const checkControlUnique = (controlId, controlType, controlValue) => {
    checkControlUniqueAction(dispatch, props, state, controlId, controlType, controlValue, dataFormat.current);
  };

  const getWorkflowParams = () => {
    const { mobileApprovalRecordInfo = {} } = props;
    const { instanceId, workId } = browserIsMobile()
      ? mobileApprovalRecordInfo
      : _.get(this, 'context.recordBaseInfo') || {};
    return { instanceId, workId };
  };

  /**
   * 初始化数据
   */
  const initSourceAction = (data, disabled, needSetStateCb = false) => {
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
      searchConfig: searchConfig.filter(i => i.eventType !== 1),
      loadRowsWhenChildTableStoreCreated,
      updateLoadingItems: items => {
        updateLoadingItems(items);
      },
      activeTrigger: () => {
        if (!changeStatus.current && dataFormat.current) {
          props.onChange(dataFormat.current.getDataSource(), dataFormat.current.getUpdateControlIds(), {
            noSaveTemp: true,
          });
          changeStatus.current = true;
        }
      },
      onAsyncChange: ({ controlId, value }) => {
        props.onChange(dataFormat.current.getDataSource(), [controlId], { isAsyncChange: true });
        changeStatus.current = true;
        getFilterDataByRule();
        updateErrorItems(dataFormat.current.getErrorControls());
        updateLoadingItems({ ...state.loadingItems });
      },
    });
    getFilterDataByRule(true);
    updateErrorItems(dataFormat.current.getErrorControls());
    updateUniqueErrorItems([]);
    updateRulesLoading(false);
    if (needSetStateCb) {
      updateErrorState(false);
      changeStatus.current = false;
    }
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

  /**
   * 渲染表单项
   */
  const renderFormItem = (item, widgets) => {
    const {
      disabled,
      initSource,
      flag,
      projectId,
      worksheetId,
      recordId,
      viewId,
      appId,
      from,
      openRelateSheet = () => {},
      registerCell,
      sheetSwitchPermit = [],
      systemControlData,
      popupContainer,
      getMasterFormData,
      isCharge,
      widgetStyle = {},
      mobileApprovalRecordInfo = {},
      customWidgets,
      isDraft,
      masterData,
      disabledChildTableCheck,
      formDidMountFlag,
      onBlur = () => {},
    } = props;
    const { renderData } = state;
    // 字段描述显示方式
    const hintType = _.get(item, 'advancedSetting.hinttype') || '0';
    const hintShowAsText =
      hintType === '0'
        ? from === FROM.DRAFT || (from !== FROM.RECORDINFO && !recordId && !item.isSubList && item.type !== 34)
        : hintType === '2' && item.type !== 34;

    // 他表字段
    if (convertControl(item.type) === 'SHEET_FIELD') {
      item = _.cloneDeep(item);
      item.value =
        item.sourceControlType === 3 && item.sourceControl.enumDefault === 1
          ? (item.value || '').replace(/\+86/, '')
          : item.value;
      item.otherSheetControlType = item.type;
      item.type = item.sourceControlType === 3 ? 2 : item.sourceControlType;
      item.enumDefault = item.sourceControlType === 3 ? 2 : item.enumDefault;
      item.disabled = true;
      item.advancedSetting = (item.sourceControl || {}).advancedSetting || {};
      if (item.type === 46) {
        item.unit = _.includes(['6', '9'], (item.sourceControl || {}).unit) ? '6' : '1';
      }
    }

    const { type, controlId } = item;
    const widgetName = convertControl(type);
    const isFreeField = isCustomWidget(item);
    let Widgets;
    if (isFreeField) {
      Widgets = FreeField;
    } else if (widgetName === 'CustomWidgets') {
      Widgets = customWidgets[type];
    } else {
      Widgets = widgets[widgetName];
    }

    if (!Widgets) {
      return undefined;
    }

    if (item.notSupport) {
      return (
        <div className="center Gray_9e GrayBGFA pTop20 pBottom20">
          {item.notSupportTip || _l('%0暂不支持', item.controlName)}
        </div>
      );
    }

    const isEditable = controlState(item, from).editable;
    const maskPermissions =
      (isCharge || _.get(item, 'advancedSetting.isdecrypt[0]') === '1') && !window.shareState.shareId;

    // (禁用或只读) 且 内容不存在
    if (
      !_.includes([22, 52, 34], item.type) &&
      !isCustomWidget(item) &&
      !(item.type === 29 && isRelateRecordTableControl(item)) &&
      !(
        _.includes([9, 10, 11], item.type) &&
        (item.advancedSetting || {}).readonlyshowall === '1' &&
        !browserIsMobile()
      ) &&
      (item.disabled || _.includes([25, 31, 32, 33, 37, 38, 53], item.type) || !isEditable) &&
      ((!item.value && item.value !== 0 && !_.includes([28, 47, 51], item.type)) ||
        (browserIsMobile() && _.includes([9, 10, 11], item.type) && item.value && !JSON.parse(item.value).length) ||
        (item.type === 29 &&
          (safeParse(item.value).length <= 0 ||
            (browserIsMobile() && !item.value) ||
            (typeof item.value === 'string' && item.value.startsWith('deleteRowIds')) ||
            (_.get(window, 'shareState.isPublicForm') && item.value === 0))) ||
        (_.includes([21, 26, 27, 48, 35, 14, 10, 11], item.type) &&
          _.isArray(JSON.parse(item.value)) &&
          !JSON.parse(item.value).length))
    ) {
      return (
        <React.Fragment>
          <div className="customFormNull" />
          {!recordId && hintShowAsText && <WidgetsDesc item={item} from={from} />}
        </React.Fragment>
      );
    }

    return (
      <FormWidget
        formDidMountFlag={formDidMountFlag}
        triggerCustomEvent={triggerType => triggerCustomEvent({ ...item, triggerType })}
      >
        <Widgets
          {...item}
          // customFields={this}
          mobileApprovalRecordInfo={mobileApprovalRecordInfo}
          flag={flag}
          isCharge={isCharge}
          widgetStyle={widgetStyle}
          maskPermissions={maskPermissions}
          popupContainer={popupContainer}
          sheetSwitchPermit={sheetSwitchPermit} // 工作表业务模板权限
          disabled={
            item.type === 36 ? disabledChildTableCheck || item.disabled || !isEditable : item.disabled || !isEditable
          }
          formDisabled={disabled}
          isEditable={isEditable}
          projectId={projectId}
          from={from}
          worksheetId={worksheetId}
          renderData={renderData}
          recordId={recordId}
          appId={appId}
          isDraft={isDraft || from === FROM.DRAFT} // 子表单条记录详情from不对，新增参数以供使用
          viewIdForPermit={viewId}
          initSource={initSource}
          masterData={masterData}
          onChange={(value, cid = controlId, searchByChange) => {
            handleChange(value, cid, item, searchByChange);
            // 非文本change校验重复、文本失焦校验
            if (item.unique && value && isUnTextWidget(item)) {
              checkControlUnique(controlId, type, value);
            }

            // h5附件上传完成后才能触发自定义事件
            let uploadFieldTriggerEvent = true;
            if (browserIsMobile() && item.type === 14) {
              uploadFieldTriggerEvent = !_.isEqual(item.value, value);
              item.value = value;
              if (isUnTextWidget(item) && uploadFieldTriggerEvent) {
                triggerCustomEvent({ ...item, value, triggerType: ADD_EVENT_ENUM.CHANGE });
              }
              return;
            }

            // 非文本类值改变时触发自定义事件
            if (isUnTextWidget(item) && item.value !== value && uploadFieldTriggerEvent) {
              triggerCustomEvent({ ...item, value, triggerType: ADD_EVENT_ENUM.CHANGE });
            }
          }}
          onBlur={(originValue, newVal) => {
            // 由输入法和onCompositionStart结合引起的组件内部未更新value值的情况，主动抛出新值
            const newValue = newVal || (`${item.value || ''}` ? `${item.value || ''}`.trim() : '');
            if (item.unique && newValue) {
              checkControlUnique(controlId, type, newValue);
            }
            if (newValue && newValue !== originValue) {
              dataFormat.current.updateDataBySearchConfigs({
                control: { ...item, value: newValue },
                searchType: 'onBlur',
              });
              // 文本类失焦触发自定义事件
              if (!isUnTextWidget(item)) {
                triggerCustomEvent({ ...item, triggerType: ADD_EVENT_ENUM.CHANGE });
              }
            }
            onBlur(controlId);
            triggerCustomEvent({ ...item, triggerType: ADD_EVENT_ENUM.BLUR });
          }}
          openRelateSheet={openRelateSheet}
          registerCell={cell => {
            controlRefs.current[controlId] = cell;
            registerCell({ item, cell });
          }}
          getControlRef={key => controlRefs.current[key]}
          formData={dataFormat.current
            .getDataSource()
            .concat(systemControlData || [])
            .concat(getMasterFormData() || [])}
          triggerCustomEvent={triggerType => triggerCustomEvent({ ...item, triggerType })}
          submitChildTableCheckData={submitFormData}
        />
        {hintShowAsText && <WidgetsDesc item={item} from={from} />}
      </FormWidget>
    );
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
  }, [state.loadingItems]);

  // 监听 flag 和 data.length
  useEffect(() => {
    if (firstRenderMap.current.flag) {
      firstRenderMap.current.flag = false;
      return;
    }
    initSourceAction(props.data, props.disabled, true);
  }, [props.flag, props.data.length]);

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
    dataFormat: dataFormat.current,
  }));

  if (!Component) {
    return <LoadDiv />;
  }

  return (
    <EntranceContext.Provider value={{ state, dispatch }}>
      <div className="h100" ref={ref}>
        <Component
          {...props}
          {...state}
          renderVerifyCode={renderVerifyCode}
          renderFormItem={renderFormItem}
          updateActiveTabControlId={updateActiveTabControlId}
          updateErrorState={updateErrorState}
          handleChange={handleChange}
          triggerCustomEvent={triggerCustomEvent}
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
