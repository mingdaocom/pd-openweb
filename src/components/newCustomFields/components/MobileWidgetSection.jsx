import React, { Fragment, useEffect, useState } from 'react';
import { Tabs } from 'antd-mobile';
import { Icon, SvgIcon } from 'ming-ui';
import RelateRecord from 'src/components/newCustomFields/widgets/RelateRecord';
import RelationSearch from 'src/components/newCustomFields/widgets/RelationSearch';
import RelationList from 'mobile/RelationRow/RelationList';
import styled from 'styled-components';
import { FROM } from '../tools/config';
import { browserIsMobile } from 'src/util';
import cx from 'classnames';
import _ from 'lodash';

const TabCon = styled.div`
  height: 44px;
  &.fixedTabs {
    z-index: 999;
    &.top {
      top: 49px;
    }
    &.top43 {
      top: 43px;
    }
  }
  &.addStyle {
    margin: 0 -20px 8px;
  }
  .am-tabs-tab-bar-wrap {
    display: block !important;
    border-bottom: 1px solid #f5f5f5;
  }
  .am-tabs-default-bar-tab {
    font-size: 14px;
    font-weight: 500;
    width: auto !important;
    border-bottom: none !important;
    padding: 0 12px !important;
    position: relative;
    .tabName {
      max-width: 100px;
      position: relative;
      color: #757575;
    }
    &:after {
      content: none !important;
    }
    &:first-child {
      margin-left: 8px;
    }
  }
  .am-tabs-default-bar-tab-active .tabName {
    color: #108ee9;
    &:before {
      content: '';
      height: 3px;
      background-color: #108ee9;
      width: 80%;
      position: absolute;
      bottom: 0;
      transform: translateX(-50%);
      left: 50%;
    }
  }
  .am-tabs-default-bar-tab::before,
  .am-tabs-default-bar-underline {
    display: none !important;
  }
  .tabLine {
    height: 12px;
    width: 1px;
    left: 2px;
    top: 18px;
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
          <Icon icon="tab" className="Font14" style={{ color: isActiveCurrentTab ? '#108ee9' : '#757575' }} />
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
    loadMoreRelateCards,
  } = props;
  const { otherTabs = [], changeMobileTab = () => {} } = tabControlProp;
  const [newFlag, setNewFlag] = useState(flag);

  useEffect(() => {
    setActiveTabControlId(_.get(tabControls[0], 'controlId'));
    changeMobileTab(_.get(tabControls[0], 'controlId'));
  }, [flag]);

  const getCount = (control = {}) => {
    const { value } = control;

    if (!value || (_.isString(value) && value.startsWith('deleteRowIds'))) return '';
    if (_.isNumber(value)) return value;

    const data = JSON.parse(value);
    if (_.isArray(data) && data.length) return data.length;
  };

  const TabsContent = () => {
    const tabs = tabControls.concat(otherTabs).filter(v => v);

    return (
      <Tabs
        tabBarPosition="bottom"
        tabBarInactiveTextColor="#7575758d"
        prerenderingSiblingsNumber={0}
        destroyInactiveTab={true}
        animated={false}
        swipeable={false}
        page={activeTabControlId ? _.findIndex(tabs, { controlId: activeTabControlId }) : 0}
        tabs={tabs}
        activeTab={activeTabControlId}
        renderTab={tab => {
          const count = getCount(tab);
          return (
            <Fragment>
              {tab.showTabLine && <i className="tabLine" />}
              <span className="tabName ellipsis mRight2">
                <TabIcon control={tab} widgetStyle={widgetStyle} activeTabControlId={activeTabControlId} />
                {tab.controlName}
              </span>
              {_.get(tab, 'advancedSetting.showcount') !== '1' && tab.type === 29 && tab.value && count ? (
                <span>{`(${count})`}</span>
              ) : (
                ''
              )}
            </Fragment>
          );
        }}
        onChange={tab => {
          setNewFlag(Date.now());
          setActiveTabControlId(tab.controlId);
          changeMobileTab(tab);
        }}
      ></Tabs>
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
    if (recordId && disabled) {
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
          />
        </div>
      );
    }

    // 列表多条 新增
    if (activeControl.type === 29) {
      const initC = _.find(props.tabControls, v => v.controlId === activeControl.controlId);
      const c = { ...activeControl, disabled: initC.disabled, value: initC.value };
      return (
        <RelateTabCon className="pTop10">
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
            onChange={(value, cid = activeControl.controlId) => onChange(value, cid, activeControl)}
            loadMoreRelateCards={loadMoreRelateCards}
          />
        </RelateTabCon>
      );
    }

    // 查询记录列表 新增
    if (activeControl.type === 51) {
      return (
        <div
          className={cx({ 'pLeft10 pRight10 pTop5': !_.includes([FROM.H5_ADD], from) })}
          style={{ margin: '0 -10px' }}
        >
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
      <TabCon className={cx(`tabsWrapper`, { addStyle: _.includes([FROM.H5_ADD], from) })}>{TabsContent()}</TabCon>
      <TabCon
        className={cx(`fixedTabs Fixed w100 hide top`, { addStyle: _.includes([FROM.H5_ADD], from), hide: !disabled })}
      >
        {TabsContent()}
      </TabCon>
      {renderContent()}
    </Fragment>
  );
}
