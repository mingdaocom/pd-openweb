import React, { Fragment, memo, useMemo } from 'react';
import { createPortal } from 'react-dom';
import cx from 'classnames';
import _ from 'lodash';
import { LoadDiv } from 'ming-ui';
import { getExpandWidgetIdsMap } from 'src/utils/domain/control/editorLayout';
import { controlState } from 'src/utils/domain/control/state';
import { FROM } from '../core/config';
import { desktopFormPropTypes } from '../core/formPropTypes';
import { useControlRenderCache, useEventCallback, useWidgetLayoutCache } from '../core/renderHooks';
import { getControlsByTab, getErrorItemsMap } from '../core/utils';
import DeskFormWidget from './components/DeskFormWidget';
import FormLabel from './components/FormLabel';
import WidgetSection from './components/WidgetSection';
import './style.less';

const EMPTY_ARRAY = [];
const EMPTY_OBJECT = {};

const DesktopForm = props => {
  const {
    from,
    widgetStyle: rawWidgetStyle,
    ignoreSection,
    tabControlProp: rawTabControlProp,
    className,
    renderData,
    rulesLoading,
    triggerCustomEvent,
    recordId,
    instanceId,
    tabFocusArr,
    dataFormat,
    getMasterFormData,
    masterData,
    systemControlData,
  } = props;
  const widgetStyle = rawWidgetStyle || EMPTY_OBJECT;
  const tabControlProp = rawTabControlProp || EMPTY_OBJECT;
  const stableControlProps = useMemo(() => props.controlProps || {}, [props.controlProps]);
  const stableWidgetCallbacks = {
    openRelateSheet: useEventCallback(props.openRelateSheet),
    registerCell: useEventCallback(props.registerCell),
    getMasterFormData: useEventCallback(props.getMasterFormData),
    onBlur: useEventCallback(props.onBlur),
    triggerCustomEvent: useEventCallback(props.triggerCustomEvent),
    handleChange: useEventCallback(props.handleChange),
    checkControlUnique: useEventCallback(props.checkControlUnique),
    submitFormData: useEventCallback(props.submitFormData),
    updateRenderData: useEventCallback(props.updateRenderData),
    updateErrorState: useEventCallback(props.updateErrorState),
    setLoadingInfo: useEventCallback(props.setLoadingInfo),
    setNavVisible: useEventCallback(_.get(tabControlProp, 'setNavVisible')),
  };
  const otherTabs = tabControlProp.otherTabs || EMPTY_ARRAY;
  const { commonData, tabData: rawTabData } = useMemo(
    () => getControlsByTab(renderData, widgetStyle, from, ignoreSection, otherTabs),
    [from, ignoreSection, otherTabs, renderData, widgetStyle],
  );
  const tabData = useMemo(
    () => rawTabData.filter(control => controlState(control, from).visible).filter(c => !c.hidden),
    [from, rawTabData],
  );
  const errorItemsMap = useMemo(
    () => getErrorItemsMap(props.errorItems, props.uniqueErrorItems),
    [props.errorItems, props.uniqueErrorItems],
  );
  const fullFormData = useMemo(() => {
    const dataSource = dataFormat?.current ? dataFormat.current.getDataSource() : renderData;

    return dataSource.concat(systemControlData || EMPTY_ARRAY).concat(getMasterFormData() || EMPTY_ARRAY);
  }, [dataFormat, getMasterFormData, renderData, systemControlData]);

  const getWidgetTabFocusId = item => {
    const currentTabFocusId = tabFocusArr[0];
    return currentTabFocusId && currentTabFocusId.split('~')[1] === item.controlId ? currentTabFocusId : undefined;
  };

  // 是否新建记录
  const isCreated = useMemo(() => !recordId || recordId === '_FAKE_RECORD_ID', [recordId]);
  const expandWidgetIdsMap = useMemo(() => getExpandWidgetIdsMap(renderData, from), [renderData, from]);
  const controlRenderCache = useControlRenderCache();
  const getWidgetLayoutInfo = useWidgetLayoutCache();

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
    const { displayRowMap, richTextControlCount, rowControlCountMap } = getWidgetLayoutInfo({ data, widgetStyle });

    data.forEach(item => {
      const isFilledByAi = !!filledByAiMap[item.controlId];

      if ((item.row !== prevRow || forceFull) && !preIsSection && prevRow > -1) {
        formList.push(
          <div className={cx('customFormLine', { Visibility: isCreated })} key={`clearfix-${item.row}-${item.col}`} />,
        );
      }

      const isFull = forceFull || item.size === 12;
      const displayRowInfo = displayRowMap[item.controlId] || EMPTY_OBJECT;
      const id = `formItem-${worksheetId}-${item.controlId}`;
      const formItemId = `${instanceId}~${item.controlId}`;
      const formItemStyle = controlRenderCache.getFormItemStyle(item.controlId, {
        width: isFull ? '100%' : `${(item.size / 12) * 100}%`,
        display: item.type === 49 && disabled ? 'none' : 'flex',
      });
      const labelWidgetStyle = controlRenderCache.getWidgetStyle(
        `${item.controlId}-label`,
        displayRowInfo === EMPTY_OBJECT ? widgetStyle : { ...widgetStyle, ...displayRowInfo },
      );
      const widgetItem = controlRenderCache.getItem(item.controlId, {
        ...item,
        ...stableControlProps,
        setLoadingInfo: stableWidgetCallbacks.setLoadingInfo,
        richTextControlCount,
        formItemId,
        isDraft: isDraft || from === FROM.DRAFT,
        ...(item.type === 22
          ? {
              setNavVisible: stableWidgetCallbacks.setNavVisible,
              expandWidgetIds: expandWidgetIdsMap[item.controlId] || EMPTY_ARRAY,
            }
          : {}),
      });
      const widgetVerifyCode =
        window.isPublicWorksheet && smsVerification && item.type === 3 && smsVerificationFiled === item.controlId
          ? verifyCode
          : undefined;

      formList.push(
        <div
          className={cx('customFormItem', { customFormItemRow: displayRowInfo.displayRow, isFilledByAi })}
          style={formItemStyle}
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
              from={from}
              worksheetId={worksheetId}
              recordId={recordId}
              disabled={disabled}
              updateErrorState={stableWidgetCallbacks.updateErrorState}
              item={item}
              currentErrorItem={errorItemsMap[item.controlId] || EMPTY_OBJECT}
              loading={!!_.get(props.loadingItems, item.controlId)}
              widgetStyle={labelWidgetStyle}
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
            popupContainer={props.popupContainer}
            isCharge={props.isCharge}
            widgetStyle={widgetStyle}
            mobileApprovalRecordInfo={props.mobileApprovalRecordInfo}
            customWidgets={props.customWidgets}
            isDraft={isDraft}
            masterData={masterData}
            disabledChildTableCheck={props.disabledChildTableCheck}
            formDidMountFlag={props.formDidMountFlag}
            controlRefs={props.controlRefs}
            dataFormat={dataFormat}
            disabledFunctions={props.disabledFunctions}
            renderData={renderData}
            formData={fullFormData}
            verifyCode={widgetVerifyCode}
            renderVerifyCode={props.renderVerifyCode}
            {...stableWidgetCallbacks}
            item={widgetItem}
            isCreated={isCreated}
            tabFocusId={getWidgetTabFocusId(item)}
          />
        </div>,
      );

      prevRow = item.row;
      preIsSection =
        (item.type === 22 || item.type === 10010) && item.size === 12 && rowControlCountMap[item.row] === 1;
    });

    return formList;
  };

  const stableSectionTriggerCustomEvent = useEventCallback(value => triggerCustomEvent({ ...props, ...value }));
  const stableSetActiveTabControlId = useEventCallback(props.setActiveTabControlId);

  const renderTab = (commonData, tabControls) => {
    const { tabControlProp: { isSplit, splitTabDom } = {}, from, isDraft, activeTabControlId } = props;
    const sectionProps = {
      from,
      disabled: props.disabled,
      tabControlProp,
      controlProps: stableControlProps,
      isCharge: props.isCharge,
      appId: props.appId,
      worksheetId: props.worksheetId,
      recordId: props.recordId,
      tabControls,
      widgetStyle,
      sheetSwitchPermit: props.sheetSwitchPermit,
      showSplitIcon: props.showSplitIcon,
      hasCommon: commonData.length > 0,
      activeTabControlId: activeTabControlId || _.get(tabControls[0], 'controlId'),
      isDraft: isDraft || from === FROM.DRAFT,
      setActiveTabControlId: stableSetActiveTabControlId,
      // renderForm 会在 WidgetSection 的 render 阶段执行，必须使用本轮闭包中的错误状态。
      // useEventCallback 直到 layout effect 才更新回调，会导致分段内的 FormLabel 落后一轮渲染。
      renderForm,
      triggerCustomEvent: stableSectionTriggerCustomEvent,
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

export default memo(DesktopForm);
