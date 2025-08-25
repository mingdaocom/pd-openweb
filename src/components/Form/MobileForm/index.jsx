import React, { Fragment, memo, useEffect, useRef } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import { FROM } from '../core/config';
import { mobileFormPropTypes } from '../core/formPropTypes';
import { controlState, getControlsByTab, getHideTitleStyle } from '../core/utils';
import { useFormStore } from '../index';
import { updateEmSizeNumAction } from '../store/actions';
import FormLabel from './components/FormLabel';
import MobileWidgetSection from './components/MobileWidgetSection';
import RefreshBtn from './components/RefreshBtn';
// import { FIELD_SIZE_OPTIONS } from './tools/config';
import { getValueStyle, showRefreshBtn, supportDisplayRow } from './tools/utils';
import widgets from './widgets';
import './style.less';

const CONTROL_HEIGHT_MAP = {
  '1em': '39px',
  '1.2em': '44px',
  '1.4em': '49px',
  '1.6em': '53px',
  '1.8em': '58px',
};

const CustomFormItemControlWrap = styled.div`
  ${props => props.isShowRefreshBtn && (props.type === 14 || props.type === 41) && 'padding-right: 30px !important;'}
  .controlValueHeight {
    ${props =>
      props.size
        ? `height: ${CONTROL_HEIGHT_MAP[props.size]}!important;line-height: ${CONTROL_HEIGHT_MAP[props.size]}!important`
        : ''};
  }
  .customFormTextarea {
    ${props => (props.size ? `font-size: ${props.size} !important; height: ${CONTROL_HEIGHT_MAP[props.size]};` : '')}
  }
  .customFormControlBox {
    ${props => (props.size ? `font-size: ${props.size} !important; height: ${CONTROL_HEIGHT_MAP[props.size]};` : '')}
    ${props => (_.includes([25, 31, 32, 33, 37, 38, 53], props.type) ? props.valueStyle : '')}
    ${props => props.isShowRefreshBtn && 'padding-right: 30px !important;'}
    & > span:first-child {
      ${props => (_.includes([2, 3, 4, 5, 6, 7, 8, 15, 16, 19, 23, 24, 46], props.type) ? props.valueStyle : '')}
    }
  }
  .controlMinHeight {
    ${props => `min-height: ${CONTROL_HEIGHT_MAP[props.size || '1em']} !important;`}
  }
`;

const MobileForm = props => {
  const {
    from,
    widgetStyle = {},
    ignoreSection,
    tabControlProp = {},
    className,
    renderData,
    rulesLoading,
    handleChange,
    renderFormItem,
    renderVerifyCode,
    triggerCustomEvent,
    setLoadingInfo,
  } = props;
  const { otherTabs = [] } = tabControlProp;
  const { dispatch } = useFormStore();
  let { commonData, tabData } = getControlsByTab(renderData, widgetStyle, from, ignoreSection, otherTabs);
  tabData = tabData.filter(control => controlState(control, from).visible).filter(c => !c.hidden);

  const containerRef = useRef(null);

  /**
   * 渲染表单
   */
  const renderForm = (renderData = []) => {
    const {
      disabled,
      worksheetId,
      recordId,
      controlProps,
      isDraft,
      tabControlProp: { setNavVisible } = {},
      mobileApprovalRecordInfo = {},
      errorItems,
      uniqueErrorItems,
      loadingItems,
      updateErrorState,
    } = props;
    const { instanceId, workId } = mobileApprovalRecordInfo;
    const { titlelayout_app = '1' } = widgetStyle;
    const formList = [];
    let prevRow = -1;
    let preIsSection;
    let data = [].concat(renderData).filter(item => !item.hidden && controlState(item, from).visible);
    const richTextControlCount = data.filter(c => c.type === 41).length;

    data.forEach(item => {
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

      const hideTitleStyle = getHideTitleStyle(item, data) || {};
      const displayRow = titlelayout_app === '2' && supportDisplayRow(item);
      const isShowRefreshBtn = showRefreshBtn({ ..._.pick(props, ['disabledFunctions', 'recordId', 'from']), item });

      formList.push(
        <div
          className={cx('customFormItem', { customFormItemRow: displayRow || hideTitleStyle.displayRow })}
          style={{
            width: '100%',
            display: item.type === 49 && disabled ? 'none' : 'flex',
          }}
          id={`formItem-${worksheetId}-${item.controlId}`}
          key={`formItem-${worksheetId}-${item.controlId}`}
        >
          {item.type === 22 && _.includes([FROM.H5_ADD, FROM.H5_EDIT], from) && (
            <div className="relative" style={{ height: 10 }}>
              <div
                className="Absolute"
                style={{ background: 'var(--gray-f5)', height: 10, left: -1000, right: -1000, top: -7 }}
              />
            </div>
          )}

          {!_.includes([22, 52], item.type) && (
            <FormLabel
              from={from}
              worksheetId={worksheetId}
              recordId={recordId}
              item={item}
              errorItems={errorItems}
              uniqueErrorItems={uniqueErrorItems}
              loadingItems={loadingItems}
              widgetStyle={{ ...widgetStyle, displayRow, ...hideTitleStyle }}
              disabled={disabled}
              formDisabled={item.disabled}
              updateErrorState={updateErrorState}
              handleChange={handleChange}
            />
          )}

          <CustomFormItemControlWrap
            className="customFormItemControl"
            {...getValueStyle(item)}
            isShowRefreshBtn={isShowRefreshBtn}
          >
            {renderFormItem(
              Object.assign({}, item, controlProps, {
                instanceId,
                workId,
                richTextControlCount,
                isDraft: isDraft || from === FROM.DRAFT,
                ...(item.type === 22 ? { setNavVisible } : {}),
                setLoadingInfo,
              }),
              widgets,
            )}
            {isShowRefreshBtn && (
              <RefreshBtn
                {..._.pick(props, ['disabledFunctions', 'worksheetId', 'recordId', 'from'])}
                item={item}
                onChange={handleChange}
              />
            )}
            {renderVerifyCode(item)}
          </CustomFormItemControlWrap>
        </div>,
      );

      prevRow = item.row;
      preIsSection = item.type === 22 || item.type === 10010;
    });

    return formList;
  };

  const renderTab = (commonData, tabControls) => {
    const { from, isDraft, activeTabControlId, updateActiveTabControlId, mobileApprovalRecordInfo } = props;
    const sectionProps = {
      ...props,
      tabControls,
      hasCommon: commonData.length > 0,
      activeTabControlId: activeTabControlId || _.get(tabControls[0], 'controlId'),
      isDraft: isDraft || from === FROM.DRAFT,
      mobileApprovalRecordInfo,
      setActiveTabControlId: value => updateActiveTabControlId(value),
      renderForm: value => renderForm(value),
      triggerCustomEvent: value => triggerCustomEvent({ ...props, ...value }),
    };

    return (
      <MobileWidgetSection {...sectionProps} onChange={(value, cid, control) => handleChange(value, cid, control)} />
    );
  };

  // 计算表单控件高度
  useEffect(() => {
    if (containerRef.current) {
      setTimeout(() => {
        const emSize = window.getComputedStyle(containerRef.current).fontSize || '16px';
        const emSizeNum = emSize.split('px')[0];
        updateEmSizeNumAction(dispatch, emSizeNum);
        // 14 = 上下内边距12 + 上下边框2
        // 1.5 = 行高
        // Object.values(FIELD_SIZE_OPTIONS).forEach(fontSize => {
        //   CONTROL_HEIGHT_MAP[fontSize] = `${
        //     Math.max(Math.round(emSizeNum * fontSize.split('em')[0] * 1.5 + 14), 36) + 1
        //   }px`;
        // });
      }, 0);
    }
  }, []);

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
  );
};

MobileForm.propTypes = mobileFormPropTypes;

export default memo(MobileForm);
