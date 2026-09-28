import React, { Fragment, memo, useEffect, useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import { controlState } from 'src/utils/domain/control/state';
import { FROM } from '../core/config';
import { mobileFormPropTypes } from '../core/formPropTypes';
import { useControlRenderCache, useEventCallback, useWidgetLayoutCache } from '../core/renderHooks';
import { getControlsByTab, getErrorItemsMap, showRefreshBtn } from '../core/utils';
import FormLabel from './components/FormLabel';
import MobileFormWidget from './components/MobileFormWidget';
import MobileWidgetSection from './components/MobileWidgetSection';
import RefreshBtn from './components/RefreshBtn';
import { FormEmSizeContext } from './FormContext';
// import { FIELD_SIZE_OPTIONS } from './tools/config';
import { getValueStyle } from './tools/utils';
import './style.less';

const EMPTY_ARRAY = [];
const EMPTY_OBJECT = {};

const CONTROL_HEIGHT_MAP = {
  '1em': '39px',
  '1.2em': '44px',
  '1.4em': '49px',
  '1.6em': '53px',
  '1.8em': '58px',
};

const CustomFormItemControlWrap = styled.div`
  ${props => props.$isShowRefreshBtn && (props.$type === 14 || props.$type === 41) && 'padding-right: 30px !important;'}
  .controlValueHeight {
    ${props =>
      props.$size
        ? `height: ${CONTROL_HEIGHT_MAP[props.$size]}!important;line-height: ${CONTROL_HEIGHT_MAP[props.$size]}!important`
        : ''};
  }
  .customFormTextarea {
    ${props => (props.$size ? `font-size: ${props.$size} !important; height: ${CONTROL_HEIGHT_MAP[props.$size]};` : '')}
    &:not(.isEditing) {
      ${props => (_.includes([2, 3], props.$type) ? props.$valueStyle : '')}
    }
  }
  .customFormControlBox {
    ${props => (props.$size ? `font-size: ${props.$size} !important; height: ${CONTROL_HEIGHT_MAP[props.$size]};` : '')}
    ${props => (_.includes([25, 31, 32, 33, 37, 38, 53], props.$type) ? props.$valueStyle : '')}
    ${props => props.$isShowRefreshBtn && 'padding-right: 30px !important;'}
    & > span:first-child {
      ${props => (_.includes([2, 3, 4, 5, 6, 7, 8, 15, 16, 19, 23, 24, 46], props.$type) ? props.$valueStyle : '')}
    }
  }
  .controlMinHeight {
    ${props => `min-height: ${CONTROL_HEIGHT_MAP[props.$size || '1em']} !important;`}
  }
`;

const FormEmSizeProvider = ({ containerRef, children }) => {
  const [emSizeNum, setEmSizeNum] = useState(16);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!containerRef.current) return;

      const emSize = window.getComputedStyle(containerRef.current).fontSize || '16px';
      setEmSizeNum(emSize.split('px')[0]);
    }, 0);

    return () => clearTimeout(timer);
  }, [containerRef]);

  return <FormEmSizeContext.Provider value={emSizeNum}>{children}</FormEmSizeContext.Provider>;
};

const MobileForm = props => {
  const {
    from,
    widgetStyle: rawWidgetStyle,
    ignoreSection,
    tabControlProp: rawTabControlProp,
    className,
    renderData,
    rulesLoading,
    handleChange,
    renderVerifyCode,
    triggerCustomEvent,
    setLoadingInfo,
    dataFormat,
    getMasterFormData,
    masterData,
    systemControlData,
  } = props;
  const widgetStyle = rawWidgetStyle || EMPTY_OBJECT;
  const tabControlProp = rawTabControlProp || EMPTY_OBJECT;
  const otherTabs = tabControlProp.otherTabs || EMPTY_ARRAY;
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
    updateErrorState: useEventCallback(props.updateErrorState),
    setNavVisible: useEventCallback(_.get(tabControlProp, 'setNavVisible')),
  };
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
  const controlRenderCache = useControlRenderCache(true);
  const getWidgetLayoutInfo = useWidgetLayoutCache();

  const containerRef = useRef(null);

  /**
   * 渲染表单
   */
  const renderForm = (
    renderData = [],
    currentErrorItemsMap = errorItemsMap,
    currentRenderVerifyCode = renderVerifyCode,
  ) => {
    const { disabled, worksheetId, recordId, isDraft, mobileApprovalRecordInfo = {}, filledByAiMap = {} } = props;
    const { instanceId, workId } = mobileApprovalRecordInfo;
    const formList = [];
    let prevRow = -1;
    let preIsSection;
    let firstFieldRendered = false;
    let data = [].concat(renderData).filter(item => !item.hidden && controlState(item, from).visible);
    const { displayRowMap, richTextControlCount } = getWidgetLayoutInfo({
      data,
      widgetStyle,
    });

    data.forEach(item => {
      const isFilledByAi = filledByAiMap?.[item.controlId];
      const { enumDefault2 } = item;
      const { hidetitle } = item.advancedSetting || {};
      // 自由连接不显示
      if (item.type === 21) return;
      // 分段字段，隐藏标题且不可折叠
      if (item.type === 22 && hidetitle === '1' && enumDefault2 === 0) {
        if (!disabled) {
          formList.push(
            <div className="customFormItemSplitLine" key={`clearfix-${worksheetId}-${item.controlId}`}></div>,
          );
        }

        return;
      }

      if (disabled && !preIsSection && prevRow > -1) {
        formList.push(<div className="customFormLine" key={`clearfix-${worksheetId}-${item.controlId}`} />);
      }

      const displayRowInfo = displayRowMap[item.controlId] || EMPTY_OBJECT;
      const isShowRefreshBtn = showRefreshBtn({
        ..._.pick(props, ['disabledFunctions', 'recordId', 'from', 'isEditing']),
        item,
      });
      const isFirstItem = !firstFieldRendered && !_.includes([22, 52], item.type);
      const itemValueStyle = getValueStyle(item);
      const formItemStyle = controlRenderCache.getFormItemStyle(item.controlId, {
        width: '100%',
        display: item.type === 49 && disabled ? 'none' : 'flex',
      });
      const labelWidgetStyle = controlRenderCache.getWidgetStyle(
        `${item.controlId}-label`,
        displayRowInfo === EMPTY_OBJECT ? widgetStyle : { ...widgetStyle, ...displayRowInfo },
      );
      const widgetItem = controlRenderCache.getItem(item.controlId, {
        ...item,
        ...stableControlProps,
        instanceId,
        workId,
        richTextControlCount,
        isDraft: isDraft || from === FROM.DRAFT,
        ...(item.type === 22 ? { setNavVisible: stableWidgetCallbacks.setNavVisible } : {}),
        setLoadingInfo,
      });
      const refreshButtonProps = controlRenderCache.getRefreshButtonProps(item.controlId, {
        disabledFunctions: props.disabledFunctions,
        worksheetId,
        recordId,
        from,
      });

      formList.push(
        <div
          className={cx('customFormItem', {
            customFormItemRow: displayRowInfo.displayRow,
            isFilledByAi,
          })}
          style={formItemStyle}
          id={`formItem-${worksheetId}-${item.controlId}`}
          key={`formItem-${worksheetId}-${item.controlId}`}
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

          {!_.includes([22, 52], item.type) && (
            <FormLabel
              from={from}
              worksheetId={worksheetId}
              recordId={recordId}
              item={item}
              currentErrorItem={currentErrorItemsMap[item.controlId] || EMPTY_OBJECT}
              loading={!!_.get(props.loadingItems, item.controlId)}
              widgetStyle={labelWidgetStyle}
              disabled={disabled}
              formDisabled={item.disabled}
              updateErrorState={stableWidgetCallbacks.updateErrorState}
              handleChange={stableWidgetCallbacks.handleChange}
              isFirstItem={isFirstItem}
            />
          )}

          {/* 他表字段需使用 getValueStyle 解析后的源字段类型，否则无法生成对应的字段值样式 */}
          <CustomFormItemControlWrap
            className="customFormItemControl"
            $size={itemValueStyle.size}
            $type={itemValueStyle.type}
            $valueStyle={itemValueStyle.valueStyle}
            $isShowRefreshBtn={isShowRefreshBtn}
          >
            <MobileFormWidget
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
              renderData={renderData}
              formData={fullFormData}
              {...stableWidgetCallbacks}
              item={widgetItem}
            />

            {isShowRefreshBtn && (
              <RefreshBtn {...refreshButtonProps} item={item} onChange={stableWidgetCallbacks.handleChange} />
            )}
            {currentRenderVerifyCode(item)}
          </CustomFormItemControlWrap>
        </div>,
      );

      prevRow = item.row;
      preIsSection = item.type === 22 || item.type === 10010;
      if (isFirstItem) {
        firstFieldRendered = true;
      }
    });

    return formList;
  };

  const stableRenderForm = useEventCallback(renderForm);
  const stableSectionTriggerCustomEvent = useEventCallback(value => triggerCustomEvent({ ...props, ...value }));
  const stableSetActiveTabControlId = useEventCallback(props.setActiveTabControlId);
  const stableSectionOnChange = useEventCallback((value, cid, control) => handleChange(value, cid, control));

  const renderTab = (commonData, tabControls) => {
    const { from, isDraft, activeTabControlId, mobileApprovalRecordInfo } = props;
    const sectionProps = {
      disabled: props.disabled,
      tabControlProp,
      recordId: props.recordId,
      viewId: props.viewId,
      projectId: props.projectId,
      worksheetId: props.worksheetId,
      appId: props.appId,
      widgetStyle,
      flag: props.flag,
      from,
      view: props.view,
      tabControls,
      data: fullFormData,
      loadMoreRelateCards: props.loadMoreRelateCards,
      hasCommon: commonData.length > 0,
      activeTabControlId: activeTabControlId || _.get(tabControls[0], 'controlId'),
      isDraft: isDraft || from === FROM.DRAFT,
      errorItemsMap,
      mobileApprovalRecordInfo,
      setActiveTabControlId: stableSetActiveTabControlId,
      renderForm: stableRenderForm,
      renderVerifyCode,
      triggerCustomEvent: stableSectionTriggerCustomEvent,
      onChange: stableSectionOnChange,
    };

    return <MobileWidgetSection {...sectionProps} />;
  };

  if (rulesLoading) {
    return (
      <div style={{ height: '100%', paddingTop: 50 }}>
        <LoadDiv />
      </div>
    );
  }

  return (
    <FormEmSizeProvider containerRef={containerRef}>
      <Fragment>
        <div
          ref={containerRef}
          className={cx('customMobileFormContainer', {
            pBottom60: !_.isEmpty(commonData),
            [`${className}`]: className,
          })}
        >
          {renderForm(commonData)}
        </div>

        {!!tabData.length && renderTab(commonData, tabData)}
      </Fragment>
    </FormEmSizeProvider>
  );
};

MobileForm.propTypes = mobileFormPropTypes;

export default memo(MobileForm);
