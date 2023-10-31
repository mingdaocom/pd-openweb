import React, { Fragment, useEffect, useState, useMemo } from 'react';
import { Tabs } from 'antd-mobile';
import { Icon } from 'ming-ui';
import SvgIcon from 'src/components/SvgIcon';
import RelateRecord from 'src/components/newCustomFields/widgets/RelateRecord';
import RelationSearch from 'src/components/newCustomFields/widgets/RelationSearch';
import RelationList from 'mobile/RelationRow/RelationList';
import styled from 'styled-components';
import { FROM } from '../tools/config';
import cx from 'classnames';
import _ from 'lodash';

const TabCon = styled.div`
  height: 44px;
  &.fixedTabs {
    z-index: 2;
    &.top {
      top: 49px;
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
    padding: 0 16px !important;
    position: relative;
    .tabName {
      max-width: 100px;
      position: relative;
    }
    &:after {
      content: none !important;
    }
    &:first-child {
      margin-left: 4px;
    }
  }
  .am-tabs-default-bar-tab-active .tabName {
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

const handleTabControls = (props, { otherTabs = [], activeRelationTab = {} }) => {
  const { tabControls = [], recordId, disabled, mobileApprovalRecordInfo, from } = props;
  let copyTabControls = _.clone(tabControls).filter(v => v);
  let index = copyTabControls.findIndex(({ controlId }) => controlId === activeRelationTab.controlId);
  if (index > -1) {
    copyTabControls[index] = activeRelationTab;
  }
  return copyTabControls.concat(otherTabs);
};

function TabIcon({ control = {}, widgetStyle = {}, activeTabControlId }) {
  let iconUrl = control.iconUrl;
  const showIcon = _.get(widgetStyle, 'showicon') || '1';
  const isActiveCurrentTab = control.controlId === activeTabControlId;

  if (control.type === 52 && showIcon === '1' && control.controlId !== 'detail') {
    const icon = _.get(control, 'advancedSetting.icon');
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
    mobileApprovalRecordInfo,
    data = [],
  } = props;
  const { otherTabs = [], changeMobileTab = () => {}, activeRelationTab } = tabControlProp;
  const [tabControls, setTabControls] = useState(handleTabControls(props, otherTabs));

  const activeControl =
    _.find(tabControls, i => i.controlId === activeTabControlId) || _.get(tabControls[0], 'controlId') || {};
  const index = activeTabControlId ? _.findIndex(tabControls, { controlId: activeTabControlId }) : 0;

  useEffect(() => {
    setActiveTabControlId(_.get(tabControls[0], 'controlId'));
  }, [flag]);

  useEffect(() => {
    const temp = props.tabControls.map(v => {
      if (v.type === 29 && !_.isEmpty(tabControls)) {
        return _.find(tabControls, t => t.controlId === v.controlId);
      }
      return v;
    });
    setTabControls(handleTabControls({ ...props, tabControls: temp }, { otherTabs, activeRelationTab }));
  }, [props.tabControls, activeRelationTab]);

  const TabsContent = useMemo(() => {
    return (
      <Tabs
        tabBarPosition="bottom"
        tabBarInactiveTextColor="#757575"
        prerenderingSiblingsNumber={0}
        destroyInactiveTab={true}
        animated={false}
        swipeable={false}
        page={index}
        tabs={tabControls.filter(item =>
          recordId && !disabled && !mobileApprovalRecordInfo ? !_.includes([29, 51], item.type) : true,
        )}
        activeTab={activeTabControlId}
        renderTab={tab => {
          return (
            <Fragment>
              {tab.showTabLine && <i className="tabLine" />}
              <span className="tabName ellipsis mRight2">
                <TabIcon control={tab} widgetStyle={widgetStyle} activeTabControlId={activeTabControlId} />
                {tab.controlName}
              </span>
              {tab.type === 29 && tab.value && _.includes([FROM.H5_EDIT], from) ? <span>{`(${tab.value})`}</span> : ''}
            </Fragment>
          );
        }}
        onChange={tab => {
          setActiveTabControlId(tab.controlId);
          changeMobileTab(tab);
        }}
      ></Tabs>
    );
  }, [tabControls, activeTabControlId]);

  const renderContent = () => {
    // 自定义tab
    if (
      _.includes(
        otherTabs.map(it => it.controlId),
        activeTabControlId,
      )
    ) {
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
                'pLeft20 pRight20': _.includes([FROM.H5_EDIT], from),
              })}
            >
              {desc}
            </div>
          )}
          <div
            className={cx('customFieldsContainer mobileContainer', {
              wxContainer: _.includes([FROM.H5_ADD, FROM.H5_EDIT], from) && !disabled,
              pTop0: _.includes([FROM.H5_ADD, FROM.H5_EDIT], from),
              mTop8: disabled,
            })}
          >
            {renderForm(activeControl.child)}
          </div>
        </Fragment>
      );
    }

    // 列表多条、查询记录 呈现态
    if ((recordId && disabled) || mobileApprovalRecordInfo) {
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
          />
        </div>
      );
    }

    // 列表多条 新增
    if (activeControl.type === 29 && !recordId) {
      return (
        <div className="mTop20">
          <RelateRecord
            {...activeControl}
            viewId={viewId}
            worksheetId={worksheetId}
            from={from}
            flag={flag}
            recordId={recordId}
            widgetStyle={widgetStyle}
            formData={data}
            onChange={(value, cid = activeControl.controlId) => onChange(value, cid, activeControl)}
          />
        </div>
      );
    }

    // 查询记录列表 新增
    if (activeControl.type === 51 && !recordId) {
      return (
        <RelationSearch
          {...activeControl}
          viewId={viewId}
          worksheetId={worksheetId}
          from={from}
          flag={flag}
          recordId={recordId}
          widgetStyle={widgetStyle}
          formData={data}
        />
      );
    }

    return null;
  };

  return (
    <Fragment>
      <TabCon className={cx(`tabsWrapper`, { addStyle: _.includes([FROM.H5_ADD], from) })}>{TabsContent}</TabCon>
      <TabCon className={cx(`fixedTabs Fixed w100 hide top`, { addStyle: _.includes([FROM.H5_ADD], from) })}>
        {TabsContent}
      </TabCon>
      {renderContent()}
    </Fragment>
  );
}
