import React, { Fragment, useMemo } from 'react';
import { createPortal } from 'react-dom';
import cx from 'classnames';
import _ from 'lodash';
import { LoadDiv } from 'ming-ui';
import { FROM } from '../core/config';
import { desktopFormPropTypes } from '../core/formPropTypes';
import { controlState, getControlsByTab, getWidgetDisplayRow } from '../core/utils';
import DeskFormWidget from './components/DeskFormWidget';
import FormLabel from './components/FormLabel';
import WidgetSection from './components/WidgetSection';
import './style.less';

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
    setLoadingInfo,
    recordId,
    instanceId,
    tabFocusArr,
  } = props;
  const { otherTabs = [] } = tabControlProp;
  let { commonData, tabData } = getControlsByTab(renderData, widgetStyle, from, ignoreSection, otherTabs);
  tabData = tabData.filter(control => controlState(control, from).visible).filter(c => !c.hidden);

  // 是否新建记录
  const isCreated = useMemo(() => !recordId || recordId === '_FAKE_RECORD_ID', [recordId]);

  /**
   * 渲染表单
   */
  const renderForm = (formData = []) => {
    const {
      disabled,
      worksheetId,
      filledByAiMap = {},
      controlProps,
      forceFull,
      isDraft,
      tabControlProp: { setNavVisible } = {},
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
        >
          {item.type === 22 && _.includes([FROM.H5_ADD, FROM.H5_EDIT], from) && (
            <div className="relative" style={{ height: 10 }}>
              <div
                className="Absolute"
                style={{
                  background: 'var(--color-background-tertiary)',
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
            {...props}
            item={{
              ...item,
              ...controlProps,
              setLoadingInfo,
              richTextControlCount,
              formItemId,
              isDraft: isDraft || from === FROM.DRAFT,
              ...(item.type === 22 ? { setNavVisible } : {}),
            }}
            isCreated={isCreated}
            renderData={renderData}
            tabFocusId={tabFocusArr[0]}
          />
        </div>,
      );

      prevRow = item.row;
      preIsSection = (item.type === 22 || item.type === 10010) && data.filter(d => d.row === item.row).length === 1;
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
