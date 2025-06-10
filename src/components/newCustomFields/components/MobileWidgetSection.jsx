import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Tabs } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, SvgIcon } from 'ming-ui';
import RelationList from 'mobile/RelationRow/RelationList';
import RelateRecord from 'src/components/newCustomFields/widgets/RelateRecord';
import RelationSearch from 'src/components/newCustomFields/widgets/RelationSearch';
import { browserIsMobile } from 'src/utils/common';
import { ADD_EVENT_ENUM } from '../../../pages/widgetConfig/widgetSetting/components/CustomEvent/config';
import { FROM } from '../tools/config';

const TabCon = styled.div`
  .md-adm-tabs {
    background-color: #fff;
    border-bottom: 1px solid #ccc;
    .adm-tabs-header {
      border: none !important;
    }
  }
  &.fixedTabs {
    z-index: 999;
    &.top {
      top: 49px;
    }
    &.top41 {
      top: 41px;
    }
    &.top0 {
      top: 0 !important;
    }
  }
  &.addStyle {
    margin: 0 -20px 8px;
  }
  .adm-tabs-tab {
    display: flex;
  }
  .adm-tabs-tab .tabName {
    color: #757575;
    max-width: 100px;
    display: block;
  }
  .adm-tabs-tab {
    color: #757575;
  }
  .adm-tabs-tab-active .tabName,
  .adm-tabs-tab-active .count {
    color: #108ee9;
  }

  .tabLine {
    height: 12px;
    width: 1px;
    left: -12px;
    top: 15px;
    position: absolute;
    background-color: #ddd;
  }
`;

const IconCon = styled.span`
  line-height: 18px;
  display: inline-block;
  margin-right: 6px;
`;

const RelateTabCon = styled.div`
  height: calc(100% - 44px);
`;

function TabIcon({ control = {}, widgetStyle = {}, activeTabControlId }) {
  let iconUrl = control.iconUrl;
  const showIcon = _.get(widgetStyle, 'showicon') || '1';
  const isActiveCurrentTab = control.controlId === activeTabControlId;
  const icon = _.get(control, 'advancedSetting.icon');
  const showType = _.get(control, 'advancedSetting.showtype');

  if (_.includes([29, 51], control.type) && showType === '2') {
    return showIcon === '1' && icon ? (
      <IconCon>
        <Icon icon={icon} className="Font14" style={{ color: isActiveCurrentTab ? '#108ee9' : '#757575' }} />
      </IconCon>
    ) : null;
  }

  if (control.type === 52 && showIcon === '1') {
    if (!icon) {
      return (
        <IconCon>
          <Icon icon="subheader" className="Font14" style={{ color: isActiveCurrentTab ? '#108ee9' : '#757575' }} />
        </IconCon>
      );
    }
    iconUrl = safeParse(icon).iconUrl;
  }

  return iconUrl ? (
    <IconCon>
      <SvgIcon url={iconUrl} fill={isActiveCurrentTab ? '#108ee9' : '#757575'} size={16} addClassName="mTop1" />
    </IconCon>
  ) : null;
}

export default function MobileWidgetSection(props) {
  const {
    tabControlProp = {},
    recordId,
    widgetStyle,
    flag,
    from,
    viewId,
    worksheetId,
    appId,
    disabled,
    activeTabControlId,
    setActiveTabControlId = () => {},
    renderForm = () => {},
    onChange = () => {},
    data = [],
    tabControls,
    isDraft,
    view = {},
    mobileApprovalRecordInfo = {},
  } = props;
  const { otherTabs = [], changeMobileTab = () => {} } = tabControlProp;
  const [newFlag, setNewFlag] = useState(flag);
  const $sectionControls = useRef([]);
  const hideTab = _.get(widgetStyle, 'hidetab') === '1' && tabControls.length === 1 && _.isEmpty(otherTabs);

  useEffect(() => {
    changeMobileTab(tabControls[0]);
  }, []);

  useEffect(() => {
    setActiveTabControlId(_.get(tabControls[0], 'controlId'));
    changeMobileTab(tabControls[0]);
  }, [flag]);

  useEffect(() => {
    sectionCustomEvent();
  }, [tabControls.length]);

  const sectionCustomEvent = () => {
    let changeControls = [];
    let triggerType = '';
    const preControls = _.get($sectionControls, 'current') || [];
    if (preControls.length > tabControls.length) {
      // 卸载
      changeControls = _.differenceBy(preControls, tabControls, 'controlId');
      triggerType = ADD_EVENT_ENUM.HIDE;
    } else {
      // 挂载
      changeControls = _.differenceBy(tabControls, preControls, 'controlId');
      triggerType = ADD_EVENT_ENUM.SHOW;
    }
    if (_.isFunction(props.triggerCustomEvent) && changeControls.length && triggerType) {
      changeControls.forEach(itemControl => {
        props.triggerCustomEvent({ ...itemControl, triggerType });
      });
    }
    $sectionControls.current = tabControls;
  };

  const getCount = (control = {}) => {
    const { value } = control;

    if (!value || (_.isString(value) && value.startsWith('deleteRowIds'))) return '';
    if (_.isNumber(value)) return value;

    const data = _.isArray(value) ? value : value ? JSON.parse(value) : [];

    if (_.isArray(data) && data.length) return data.length;
  };

  const TabsContent = () => {
    const tabs = tabControls.concat(otherTabs).filter(v => v);

    return (
      <Tabs
        className="md-adm-tabs flexUnset"
        activeLineMode="fixed"
        activeKey={activeTabControlId}
        onChange={tab => {
          setNewFlag(Date.now());
          setActiveTabControlId(tab);
          changeMobileTab(_.find(tabs, t => t.controlId === tab));
        }}
      >
        {tabs.map((tab, index) => {
          const count = getCount(tab);
          return (
            <Tabs.Tab
              key={tab.controlId}
              title={
                <Fragment>
                  {tab.showTabLine && <i className="tabLine" />}
                  <span className={cx('tabName ellipsis bold', { mLeft8: index === 0 })}>
                    <TabIcon control={tab} widgetStyle={widgetStyle} activeTabControlId={activeTabControlId} />
                    {tab.controlName}
                  </span>
                  {_.get(tab, 'advancedSetting.showcount') !== '1' && tab.type === 29 && tab.value && count ? (
                    <span className="count">{`(${count})`}</span>
                  ) : (
                    ''
                  )}
                </Fragment>
              }
            />
          );
        })}
      </Tabs>
    );
  };

  const renderContent = () => {
    const activeControl =
      _.find(tabControls.concat(otherTabs), i => i.controlId === activeTabControlId) ||
      _.get(tabControls[0], 'controlId') ||
      {};

    // 自定义tab
    if (otherTabs.filter(it => it.controlId === activeTabControlId).length) {
      return activeControl.tabContentNode;
    }

    // 标签页
    if (activeControl.type === 52) {
      const desc = activeControl.desc;
      return (
        <Fragment>
          {desc && (
            <div
              className={cx('mTop16 mBottom16 Font13 Gray_9e', {
                'pLeft20 pRight20': browserIsMobile() && !_.includes([FROM.H5_ADD], from),
              })}
            >
              {desc}
            </div>
          )}
          <div
            className={cx('customFieldsContainer mobileContainer pBottom20', {
              wxContainer: _.includes([FROM.H5_ADD, FROM.H5_EDIT, FROM.RECORDINFO], from) && !disabled,
              pTop0: _.includes([FROM.H5_ADD, FROM.H5_EDIT, FROM.RECORDINFO], from),
              mTop8: disabled,
            })}
          >
            {renderForm(activeControl.child)}
          </div>
        </Fragment>
      );
    }

    // 列表多条、查询记录 呈现态
    if (recordId && (disabled || activeControl.disabled)) {
      return (
        <div className="flexColumn h100">
          <RelationList
            rowId={recordId}
            worksheetId={worksheetId}
            appId={appId}
            viewId={viewId}
            controlId={activeControl.controlId}
            control={activeControl}
            getType={from}
            data={data}
            workId={mobileApprovalRecordInfo.workId}
            instanceId={mobileApprovalRecordInfo.instanceId}
          />
        </div>
      );
    }

    // 列表多条 新增
    if (activeControl.type === 29) {
      const initC = _.find(props.tabControls, v => v.controlId === activeControl.controlId);
      const c = { ...activeControl, disabled: initC.disabled, value: initC.value, isDraft };
      return (
        <RelateTabCon className="pTop10 pRight8">
          <RelateRecord
            {...c}
            worksheetId={worksheetId}
            appId={appId}
            from={from}
            flag={newFlag}
            recordId={recordId}
            widgetStyle={widgetStyle}
            formData={data}
            showRelateRecordEmpty={true}
            onChange={(value, cid = activeControl.controlId) => {
              props.triggerCustomEvent({ ...activeControl, triggerType: ADD_EVENT_ENUM.CHANGE });
              onChange(value, cid, activeControl);
            }}
          />
        </RelateTabCon>
      );
    }

    // 查询记录列表 新增
    if (activeControl.type === 51) {
      return (
        <div className={cx({ 'pLeft10 pRight10 pTop5': !_.includes([FROM.H5_ADD], from) })}>
          <RelationSearch
            {...activeControl}
            viewId={viewId}
            worksheetId={worksheetId}
            appId={appId}
            from={from}
            flag={flag}
            recordId={recordId}
            widgetStyle={widgetStyle}
            formData={data}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <Fragment>
      {hideTab ? null : (
        <Fragment>
          <TabCon className={cx(`tabsWrapper`, { addStyle: _.includes([FROM.H5_ADD], from) })}>{TabsContent()}</TabCon>
          <TabCon
            className={cx(`fixedTabs Fixed w100 hide top`, {
              addStyle: _.includes([FROM.H5_ADD], from),
              hide: !disabled,
              top0: view.viewType === 6 && view.childType === 1 && location.pathname.includes('mobile/mobileView'),
            })}
          >
            {TabsContent()}
          </TabCon>
        </Fragment>
      )}
      {renderContent()}
    </Fragment>
  );
}
