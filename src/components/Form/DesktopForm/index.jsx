import React, { Fragment, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import cx from 'classnames';
import _ from 'lodash';
import { LoadDiv } from 'ming-ui';
import { getExpandWidgetIdsMap } from 'src/pages/widgetConfig/widgetSetting/components/SplitLineConfig/config';
import { controlState } from 'src/utils/control';
import { FROM } from '../core/config';
import { desktopFormPropTypes } from '../core/formPropTypes';
import { getControlsByTab, getWidgetDisplayRow } from '../core/utils';
import DeskFormWidget from './components/DeskFormWidget';
import FormLabel from './components/FormLabel';
import WidgetSection from './components/WidgetSection';
import './style.less';

const useEventCallback = callback => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback((...args) => {
    if (_.isFunction(callbackRef.current)) {
      return callbackRef.current(...args);
    }
  }, []);
};

const useStableFunctionProps = props => {
  const propsRef = useRef(props);
  const stableFunctionRef = useRef({});
  propsRef.current = props;

  return useMemo(() => {
    const stableProps = { ...(props || {}) };

    Object.keys(stableProps).forEach(key => {
      if (!_.isFunction(stableProps[key])) {
        return;
      }

      if (!stableFunctionRef.current[key]) {
        stableFunctionRef.current[key] = (...args) => {
          const current = _.get(propsRef.current, key);

          if (_.isFunction(current)) {
            return current(...args);
          }
        };
      }

      stableProps[key] = stableFunctionRef.current[key];
    });

    return stableProps;
  }, [props]);
};

const DesktopForm = props => {
  const {
    from,
    widgetStyle = {},
    ignoreSection,
    tabControlProp = {},
    className,
    renderData,
    rulesLoading,
    triggerCustomEvent,
    recordId,
    instanceId,
    tabFocusArr,
  } = props;
  const stableControlProps = useStableFunctionProps(props.controlProps);
  const stableWidgetCallbacks = {
    openRelateSheet: useEventCallback(props.openRelateSheet),
    registerCell: useEventCallback(props.registerCell),
    getMasterFormData: useEventCallback(props.getMasterFormData),
    onBlur: useEventCallback(props.onBlur),
    triggerCustomEvent: useEventCallback(props.triggerCustomEvent),
    handleChange: useEventCallback(props.handleChange),
    checkControlUnique: useEventCallback(props.checkControlUnique),
    submitFormData: useEventCallback(props.submitFormData),
    renderVerifyCode: useEventCallback(props.renderVerifyCode),
    updateRenderData: useEventCallback(props.updateRenderData),
    setLoadingInfo: useEventCallback(props.setLoadingInfo),
    setNavVisible: useEventCallback(_.get(tabControlProp, 'setNavVisible')),
  };
  const { otherTabs = [] } = tabControlProp;
  let { commonData, tabData } = getControlsByTab(renderData, widgetStyle, from, ignoreSection, otherTabs);
  tabData = tabData.filter(control => controlState(control, from).visible).filter(c => !c.hidden);

  const getWidgetTabFocusId = item => {
    const currentTabFocusId = tabFocusArr[0];
    return currentTabFocusId && currentTabFocusId.split('~')[1] === item.controlId ? currentTabFocusId : undefined;
  };

  // 是否新建记录
  const isCreated = useMemo(() => !recordId || recordId === '_FAKE_RECORD_ID', [recordId]);
  const expandWidgetIdsMap = useMemo(() => getExpandWidgetIdsMap(renderData, from), [renderData, from]);

  /**
   * 渲染表单
   */
  const renderForm = (formData = []) => {
    const {
      disabled,
      worksheetId,
      filledByAiMap = {},
      forceFull,
      isDraft,
      smsVerification,
      smsVerificationFiled,
      verifyCode,
    } = props;
    const formList = [];
    let prevRow = -1;
    let preIsSection;
    let data = [].concat(formData).filter(item => !item.hidden && controlState(item, from).visible);
    const richTextControlCount = data.filter(c => c.type === 41).length;

    data.forEach(item => {
      const isFilledByAi = !!filledByAiMap[item.controlId];

      if ((item.row !== prevRow || forceFull) && !preIsSection && prevRow > -1) {
        formList.push(
          <div className={cx('customFormLine', { Visibility: isCreated })} key={`clearfix-${item.row}-${item.col}`} />,
        );
      }

      const isFull = forceFull || item.size === 12;
      const displayRowInfo = getWidgetDisplayRow({ item, data, widgetStyle });
      const id = `formItem-${worksheetId}-${item.controlId}`;
      const formItemId = `${instanceId}~${item.controlId}`;
      const widgetVerifyCode =
        window.isPublicWorksheet && smsVerification && item.type === 3 && smsVerificationFiled === item.controlId
          ? verifyCode
          : undefined;

      formList.push(
        <div
          className={cx('customFormItem', { customFormItemRow: displayRowInfo.displayRow, isFilledByAi })}
          style={{
            width: isFull ? '100%' : `${(item.size / 12) * 100}%`,
            display: item.type === 49 && disabled ? 'none' : 'flex',
          }}
          id={id}
          key={id}
          data-instance-id={formItemId}
          data-control-type={item.type}
        >
          {item.type === 22 && _.includes([FROM.H5_ADD, FROM.H5_EDIT], from) && (
            <div className="relative" style={{ height: 10 }}>
              <div
                className="Absolute"
                style={{
                  background: 'var(--color-background-secondary)',
                  height: 10,
                  left: -1000,
                  right: -1000,
                  top: -7,
                }}
              />
            </div>
          )}
          {/**控件标题 */}
          {!_.includes([22, 52], item.type) && (
            <FormLabel
              {..._.pick(props, [
                'from',
                'worksheetId',
                'recordId',
                'errorItems',
                'uniqueErrorItems',
                'loadingItems',
                'disabled',
                'updateErrorState',
                'handleChange',
              ])}
              item={item}
              widgetStyle={{ ...widgetStyle, ...displayRowInfo }}
            />
          )}

          {/**控件内容 */}
          <DeskFormWidget
            disabled={disabled}
            initSource={props.initSource}
            flag={props.flag}
            projectId={props.projectId}
            worksheetId={worksheetId}
            recordId={recordId}
            viewId={props.viewId}
            appId={props.appId}
            from={from}
            sheetSwitchPermit={props.sheetSwitchPermit}
            systemControlData={props.systemControlData}
            popupContainer={props.popupContainer}
            isCharge={props.isCharge}
            widgetStyle={widgetStyle}
            mobileApprovalRecordInfo={props.mobileApprovalRecordInfo}
            customWidgets={props.customWidgets}
            isDraft={isDraft}
            masterData={props.masterData}
            disabledChildTableCheck={props.disabledChildTableCheck}
            formDidMountFlag={props.formDidMountFlag}
            controlRefs={props.controlRefs}
            dataFormat={props.dataFormat}
            disabledFunctions={props.disabledFunctions}
            renderData={renderData}
            verifyCode={widgetVerifyCode}
            {...stableWidgetCallbacks}
            item={{
              ...item,
              ...stableControlProps,
              setLoadingInfo: stableWidgetCallbacks.setLoadingInfo,
              richTextControlCount,
              formItemId,
              isDraft: isDraft || from === FROM.DRAFT,
              ...(item.type === 22
                ? {
                    setNavVisible: stableWidgetCallbacks.setNavVisible,
                    expandWidgetIds: expandWidgetIdsMap[item.controlId] || [],
                  }
                : {}),
            }}
            isCreated={isCreated}
            tabFocusId={getWidgetTabFocusId(item)}
          />
        </div>,
      );

      prevRow = item.row;
      preIsSection =
        (item.type === 22 || item.type === 10010) &&
        item.size === 12 &&
        data.filter(d => d.row === item.row).length === 1;
    });

    return formList;
  };

  const renderTab = (commonData, tabControls) => {
    const {
      tabControlProp: { isSplit, splitTabDom } = {},
      from,
      isDraft,
      activeTabControlId,
      setActiveTabControlId,
    } = props;
    const sectionProps = {
      ...props,
      tabControls,
      hasCommon: commonData.length > 0,
      activeTabControlId: activeTabControlId || _.get(tabControls[0], 'controlId'),
      isDraft: isDraft || from === FROM.DRAFT,
      setActiveTabControlId: value => setActiveTabControlId(value),
      renderForm: value => renderForm(value),
      triggerCustomEvent: value => triggerCustomEvent({ ...props, ...value }),
    };

    if (isSplit && splitTabDom) {
      return createPortal(<WidgetSection {...sectionProps} />, splitTabDom);
    }

    return (
      <div className="relateRecordBlockCon">
        <WidgetSection {...sectionProps} />
      </div>
    );
  };

  if (rulesLoading) {
    return (
      <div style={{ height: '100%', paddingTop: 50 }}>
        <LoadDiv />
      </div>
    );
  }

  return (
    <Fragment>
      <div
        className={cx('customFieldsContainer', {
          [`${className}`]: className,
        })}
      >
        {renderForm(commonData)}
      </div>

      {!!tabData.length && renderTab(commonData, tabData)}
    </Fragment>
  );
};

DesktopForm.propTypes = desktopFormPropTypes;

export default DesktopForm;
