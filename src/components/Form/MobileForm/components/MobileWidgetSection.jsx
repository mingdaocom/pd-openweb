import React, { Fragment, memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Tabs } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon, SvgIcon } from 'ming-ui';
import RelationList from 'mobile/RelationRow/RelationList';
import { ADD_EVENT_ENUM } from 'src/utils/domain/control/formEnum';
import { getTitleStyle } from 'src/utils/domain/control/style';
import RelationSearchCount from '../../components/RelationSearchCount';
import { isSameControlList } from '../../core/renderDataUtils';
import RelateRecord from '../widgets/RelateRecord';
import RelationSearch from '../widgets/RelationSearch';

const TabCon = styled.div`
  user-select: none;
  .md-adm-tabs {
    background-color: var(--color-background-primary);
    border-bottom: 1px solid var(--color-border-primary);
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
    top: 44px !important;
  }

  .adm-tabs-tab {
    display: flex;
  }
  .adm-tabs-tab .tabName {
    color: var(--color-text-secondary);
    max-width: 100px;
    display: block;
  }
  .adm-tabs-tab {
    color: var(--color-text-secondary);
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
    background-color: var(--color-border-primary);
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

const RelationTabContent = styled.div`
  margin: unset !important;
  flex: 1;
  min-height: 0;
  box-sizing: border-box;
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
          style={{ color: isActiveCurrentTab ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}
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
            style={{ color: isActiveCurrentTab ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}
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
        fill={isActiveCurrentTab ? 'var(--color-primary)' : 'var(--color-text-secondary)'}
        size={16}
        addClassName="mTop1"
      />
    </IconCon>
  ) : null;
}

const parseStyleString = str => {
  return str.split(';').reduce((acc, item) => {
    if (!item.trim()) return acc;
    const [key, value] = item.split(':');
    const jsKey = key.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    acc[jsKey] = value.trim();
    return acc;
  }, {});
};

const getCount = (control = {}) => {
  const { value } = control;

  if (!value || (_.isString(value) && value.startsWith('deleteRowIds'))) return '';
  if (_.isNumber(value)) return value;

  const data = _.isArray(value) ? value : value ? JSON.parse(value) : [];

  if (_.isArray(data)) return data.length;
};

const tabCountCache = new Map();

const StableTabCount = memo(function StableTabCount({ cacheKey, count }) {
  const cachedCount = tabCountCache.get(cacheKey);
  const hasCount = !_.isUndefined(count) && count !== null && count !== '';

  useEffect(() => {
    if (hasCount) {
      tabCountCache.set(cacheKey, count);
    }
  }, [cacheKey, count, hasCount]);

  const displayCount = hasCount ? count : cachedCount;

  return displayCount ? <span className="count bold">{`(${displayCount})`}</span> : null;
});

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
    errorItemsMap,
    loadMoreRelateCards,
    mobileApprovalRecordInfo = {},
    setActiveTabControlId = () => {},
    renderForm = () => {},
    renderVerifyCode,
    onChange = () => {},
    triggerCustomEvent,
  } = props;
  const { otherTabs = [], changeMobileTab = () => {}, relationActionData = {}, resetTabToFirstFlag } = tabControlProp;
  const [newFlag, setNewFlag] = useState(flag);
  const $sectionControls = useRef([]);
  const allTabs = useMemo(() => tabControls.concat(otherTabs).filter(Boolean), [otherTabs, tabControls]);
  const hideTab = _.get(widgetStyle, 'hidetab') === '1' && tabControls.length === 1 && _.isEmpty(otherTabs);
  const activeControl = useMemo(
    () => _.find(allTabs, i => i.controlId === activeTabControlId) || tabControls[0] || {},
    [activeTabControlId, allTabs, tabControls],
  );
  const initialTabControlsRef = useRef(tabControls);
  const initialChangeMobileTabRef = useRef(changeMobileTab);
  const resetTabToFirstFlagRef = useRef(resetTabToFirstFlag);
  const flagEffectRef = useRef({ activeTabControlId, allTabs, changeMobileTab, setActiveTabControlId, tabControls });

  useLayoutEffect(() => {
    flagEffectRef.current = { activeTabControlId, allTabs, changeMobileTab, setActiveTabControlId, tabControls };
  }, [activeTabControlId, allTabs, changeMobileTab, setActiveTabControlId, tabControls]);

  useEffect(() => {
    initialChangeMobileTabRef.current(initialTabControlsRef.current[0]);
  }, []);

  useEffect(() => {
    if (resetTabToFirstFlagRef.current === resetTabToFirstFlag) return;

    resetTabToFirstFlagRef.current = resetTabToFirstFlag;
    const firstTab = tabControls[0];

    if (!firstTab) return;

    setActiveTabControlId(firstTab.controlId);
    changeMobileTab(firstTab);
  }, [changeMobileTab, resetTabToFirstFlag, setActiveTabControlId, tabControls]);

  useEffect(() => {
    const current = flagEffectRef.current;

    if (_.some(current.allTabs, { controlId: current.activeTabControlId })) {
      return;
    }

    current.setActiveTabControlId(_.get(current.tabControls[0], 'controlId'));
    current.changeMobileTab(current.tabControls[0]);
  }, [flag]);

  useEffect(() => {
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

    if (_.isFunction(triggerCustomEvent) && changeControls.length && triggerType) {
      changeControls.forEach(itemControl => {
        triggerCustomEvent({ ...itemControl, triggerType });
      });
    }

    $sectionControls.current = tabControls;
  }, [tabControls, triggerCustomEvent]);

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
          const titleStyle = getTitleStyle(tab.advancedSetting?.titlestyle);
          const titleColor = tab.advancedSetting?.titlecolor;
          const style = {};

          if (titleStyle) {
            Object.assign(style, parseStyleString(titleStyle));
          }

          if (titleColor) {
            style.color = titleColor;
          }

          return (
            <Tabs.Tab
              key={tab.controlId}
              title={
                <Fragment>
                  {tab.showTabLine && <i className="tabLine" />}
                  <span className={cx('tabName ellipsis bold', { mLeft8: index === 0 })} style={style}>
                    <TabIcon control={tab} widgetStyle={widgetStyle} activeTabControlId={activeTabControlId} />
                    {tab.controlName}
                  </span>
                  {_.get(tab, 'advancedSetting.showcount') !== '1' && tab.type === 29 ? (
                    <StableTabCount cacheKey={`${recordId || ''}:${tab.controlId}`} count={count} />
                  ) : (
                    ''
                  )}
                  {_.get(tab, 'advancedSetting.showcount') !== '1' && tab.type === 51 && (
                    <span className="count bold">
                      <RelationSearchCount control={tab} recordId={recordId} keepPrevious />
                    </span>
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
          {desc && <div className="mTop16 mBottom16 pLeft20 pRight20 textTertiary">{desc}</div>}
          <div className="customMobileFormContainer pBottom60 mTop8">
            {/* 稳定 renderForm 在 layout effect 后才更新闭包，验证码需使用本次渲染的回调。 */}
            {renderForm(activeControl.child, errorItemsMap, renderVerifyCode)}
          </div>
        </div>
      );
    }

    // 其他标签页呈现态
    if (recordId && (disabled || activeControl.disabled) && !_.includes([29, 51], activeControl.type)) {
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

    // 关联记录列表新增、编辑、呈现态统一按 H5 配置渲染
    if (activeControl.type === 29) {
      const initC = _.find(props.tabControls, v => v.controlId === activeControl.controlId) || activeControl;
      const c = {
        ...activeControl,
        disabled: disabled || initC.disabled || activeControl.disabled,
        value: initC.value,
        isDraft,
      };
      return (
        <RelationTabContent className="customMobileFormContainer mobileTabContentContainer pTop10">
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
              triggerCustomEvent({ ...activeControl, triggerType: ADD_EVENT_ENUM.CHANGE });
              onChange(value, cid, activeControl);
            }}
            loadMoreRelateCards={loadMoreRelateCards}
            relationActionRows={relationActionData.rows}
            relationActionCount={relationActionData.count}
            relationActionControlId={relationActionData.controlId}
            relationActionParams={relationActionData.actionParams}
            updateRelationActionParams={relationActionData.updateActionParams}
          />
        </RelationTabContent>
      );
    }

    // 查询记录列表 新增
    if (activeControl.type === 51) {
      return (
        <RelationTabContent className="customMobileFormContainer mobileTabContentContainer pTop10 mLeft0 mRight0">
          <RelationSearch
            {...activeControl}
            disabled={disabled || activeControl.disabled}
            formDisabled={disabled || activeControl.disabled}
            worksheetId={worksheetId}
            appId={appId}
            from={from}
            flag={flag}
            recordId={recordId}
            widgetStyle={widgetStyle}
            formData={data}
            showRelateRecordEmpty={true}
          />
        </RelationTabContent>
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
  errorItemsMap: PropTypes.object,
  loadMoreRelateCards: PropTypes.bool, // 分页加载关联记录
  setActiveTabControlId: PropTypes.func,
  renderForm: PropTypes.func,
  renderVerifyCode: PropTypes.func,
  onChange: PropTypes.func,
};

const getActiveControl = props => {
  const { activeTabControlId, tabControlProp = {}, tabControls = [] } = props;
  const allTabs = tabControls.concat(tabControlProp.otherTabs || []).filter(Boolean);

  return _.find(allTabs, control => control.controlId === activeTabControlId) || tabControls[0];
};

const arePropsEqual = (prevProps, nextProps) => {
  const prevActiveControl = getActiveControl(prevProps);
  const nextActiveControl = getActiveControl(nextProps);
  const keys = _.uniq(Object.keys(prevProps).concat(Object.keys(nextProps)));

  return keys.every(key => {
    if (key === 'tabControls') {
      return isSameControlList(prevProps.tabControls, nextProps.tabControls);
    }

    if (key === 'data' && prevActiveControl?.type === 52 && nextActiveControl?.type === 52) {
      return true;
    }

    return Object.is(prevProps[key], nextProps[key]);
  });
};

export default memo(MobileWidgetSection, arePropsEqual);
