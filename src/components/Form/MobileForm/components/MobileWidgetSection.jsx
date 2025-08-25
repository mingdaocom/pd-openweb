import React, { Fragment, memo, useEffect, useRef, useState } from 'react';
import { Tabs } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon, SvgIcon } from 'ming-ui';
import RelationList from 'mobile/RelationRow/RelationList';
import { ADD_EVENT_ENUM } from '../../core/enum';
import RelateRecord from '../widgets/RelateRecord';
import RelationSearch from '../widgets/RelationSearch';

const TabCon = styled.div`
  .md-adm-tabs {
    background-color: var(--color-third);
    border-bottom: 1px solid var(--gray-e0);
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
  &.shareRecord.fixedTabs {
    top: 0 !important;
  }

  .adm-tabs-tab {
    display: flex;
  }
  .adm-tabs-tab .tabName {
    color: var(--gray-75);
    max-width: 100px;
    display: block;
  }
  .adm-tabs-tab {
    color: var(--gray-75);
  }
  .adm-tabs-tab-active .tabName,
  .adm-tabs-tab-active .count {
    color: var(--color-primary);
  }

  .tabLine {
    height: 12px;
    width: 1px;
    left: -12px;
    top: 15px;
    position: absolute;
    background-color: var(--gray-e0);
  }
  &.hide {
    display: block !important;
    opacity: 0;
    z-index: -1;
  }
`;

const IconCon = styled.span`
  line-height: 18px;
  display: inline-block;
  margin-right: 6px;
`;

const RelateTabCon = styled.div`
  margin: unset !important;
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
        <Icon
          icon={icon}
          className="Font14"
          style={{ color: isActiveCurrentTab ? 'var(--color-primary)' : 'var(--gray-75)' }}
        />
      </IconCon>
    ) : null;
  }

  if (control.type === 52 && showIcon === '1') {
    if (!icon) {
      return (
        <IconCon>
          <Icon
            icon="subheader"
            className="Font14"
            style={{ color: isActiveCurrentTab ? 'var(--color-primary)' : 'var(--gray-75)' }}
          />
        </IconCon>
      );
    }
    iconUrl = safeParse(icon).iconUrl;
  }

  return iconUrl ? (
    <IconCon>
      <SvgIcon
        url={iconUrl}
        fill={isActiveCurrentTab ? 'var(--color-primary)' : 'var(--gray-75)'}
        size={16}
        addClassName="mTop1"
      />
    </IconCon>
  ) : null;
}

function MobileWidgetSection(props) {
  const {
    disabled,
    activeTabControlId,
    tabControlProp,
    recordId,
    viewId,
    projectId,
    worksheetId,
    appId,
    widgetStyle,
    flag,
    from,
    isDraft,
    view = {},
    tabControls = [],
    data = [],
    loadMoreRelateCards,
    mobileApprovalRecordInfo = {},
    setActiveTabControlId = () => {},
    renderForm = () => {},
    onChange = () => {},
  } = props;
  const { otherTabs = [], changeMobileTab = () => {} } = tabControlProp;
  const [newFlag, setNewFlag] = useState(flag);
  const $sectionControls = useRef([]);
  const allTabs = tabControls.concat(otherTabs).filter(v => v);
  const hideTab = _.get(widgetStyle, 'hidetab') === '1' && tabControls.length === 1 && _.isEmpty(otherTabs);
  const activeControl =
    _.find(allTabs, i => i.controlId === activeTabControlId) || _.get(tabControls[0], 'controlId') || {};

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
    return (
      <Tabs
        className="md-adm-tabs flexUnset"
        activeLineMode="fixed"
        activeKey={activeTabControlId}
        onChange={tab => {
          setNewFlag(Date.now());
          setActiveTabControlId(tab);
          changeMobileTab(_.find(allTabs, t => t.controlId === tab));
        }}
      >
        {allTabs.map((tab, index) => {
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
                    <span className="count bold">{`(${count})`}</span>
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
    // 自定义tab
    if (otherTabs.filter(it => it.controlId === activeTabControlId).length) {
      return activeControl.tabContentNode;
    }

    // 标签页
    if (activeControl.type === 52) {
      const desc = activeControl.desc;
      return (
        <div className="flex">
          {desc && <div className="mTop16 mBottom16 pLeft20 pRight20 Gray_9e">{desc}</div>}
          <div className="customMobileFormContainer pBottom60 mTop8">{renderForm(activeControl.child)}</div>
        </div>
      );
    }

    // 列表多条、查询记录 呈现态
    if (recordId && (disabled || activeControl.disabled)) {
      return (
        <div className="flexColumn h100">
          <RelationList
            worksheetId={worksheetId}
            appId={appId}
            from={from === 3 ? 1 : from}
            recordId={recordId}
            widgetStyle={widgetStyle}
            formData={data}
            viewId={viewId}
            controlId={activeControl.controlId}
            control={activeControl}
            workId={mobileApprovalRecordInfo.workId}
            instanceId={mobileApprovalRecordInfo.instanceId}
          />
        </div>
      );
    }

    // 列表多条 新增/编辑
    if (activeControl.type === 29) {
      const initC = _.find(props.tabControls, v => v.controlId === activeControl.controlId);
      const c = { ...activeControl, disabled: initC.disabled, value: initC.value, isDraft };
      return (
        <RelateTabCon className="customMobileFormContainer pTop10">
          <RelateRecord
            {...c}
            projectId={projectId}
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
            loadMoreRelateCards={loadMoreRelateCards}
          />
        </RelateTabCon>
      );
    }

    // 查询记录列表 新增
    if (activeControl.type === 51) {
      return (
        <div className="customMobileFormContainer pTop10 mLeft0 mRight0">
          <RelationSearch
            {...activeControl}
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
    <div className="h100 flexColumn">
      {/* 标签 */}
      {hideTab ? null : (
        <Fragment>
          <TabCon className="tabsWrapper">{TabsContent()}</TabCon>
          <TabCon
            className={cx(`fixedTabs Fixed w100 hide top`, {
              hide: !disabled,
              shareRecord: window.shareState.isPublicRecord,
              top0: view.viewType === 6 && view.childType === 1 && location.pathname.includes('mobile/mobileView'),
            })}
          >
            {TabsContent()}
          </TabCon>
        </Fragment>
      )}
      {/* 表单内容 */}
      {renderContent()}
    </div>
  );
}

MobileWidgetSection.propTypes = {
  disabled: PropTypes.bool,
  activeTabControlId: PropTypes.string,
  tabControlProp: PropTypes.object,
  recordId: PropTypes.string, // 记录id
  viewId: PropTypes.string, // 视图id
  worksheetId: PropTypes.string, // 表id
  appId: PropTypes.string, // 应用id
  widgetStyle: PropTypes.object, // 字段样式配置
  flag: PropTypes.string,
  from: PropTypes.number,
  isDraft: PropTypes.bool, // 是否是草稿记录
  tabControls: PropTypes.array, // 标签页字段
  data: PropTypes.array, // formData
  loadMoreRelateCards: PropTypes.bool, // 分页加载关联记录
  setActiveTabControlId: PropTypes.func,
  renderForm: PropTypes.func,
  onChange: PropTypes.func,
};

export default memo(MobileWidgetSection);
