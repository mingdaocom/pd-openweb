import React, { Fragment, useState } from 'react';
import { CaretRightOutlined } from '@ant-design/icons';
import { Collapse, Tooltip } from 'antd';
import update from 'immutability-helper';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import { v4 as uuidv4 } from 'uuid';
import { Dropdown, Icon, LoadDiv, Menu, MenuItem } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import { getTextById } from 'src/pages/FormSet/components/columnRules/config.js';
import { getFilterControls } from '../../util/data';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../util/setting';
import EventOptions from '../components/CustomEvent/components/EventOptions';
import MoreOptions from '../components/CustomEvent/components/MoreOptions';
import {
  ACTION_VALUE_ENUM,
  ADD_EVENT_DISPLAY,
  ADD_EVENT_ENUM,
  ALERT_TYPE_OPTIONS,
  dealEventDisplay,
  EVENT_DETAIL,
  FILTER_SPLICE_TYPE,
  FILTER_VALUE_ENUM,
  FILTER_VALUE_TYPE,
  getActionTextByValue,
  getEventDisplay,
  RESULT_DISPLAY,
  SPLICE_TYPE_ENUM,
  VOICE_FILE_LIST,
} from '../components/CustomEvent/config';
import { ActionWrap, AddEventWrap, EventActionWrap, IconWrap, SpliceWrap } from '../components/CustomEvent/style';
import DynamicText from '../components/DynamicDefaultValue/components/DynamicText';
import { FilterItemTexts } from '../components/FilterData';
import WidgetWarning from '../components/WidgetBase/WidgetWarning';
import { SettingCollapseWrap } from './styled';

const { Panel } = Collapse;

export default function CustomEvent(props) {
  const { data, onChange, allControls = [] } = props;
  const [visible, setVisible] = useState(false);

  const customEvent = getAdvanceSetting(data, 'custom_event') || [];
  const EVENT_DISPLAY = getEventDisplay(data);
  // 过滤已配置的事件，每个事件只支持配一次
  const FILTER_EVENT_DISPLAY = EVENT_DISPLAY.filter(i => !_.find(customEvent, c => c.eventType === i.value));
  const originExpandKeys = EVENT_DISPLAY.map(i => i.value);

  const [expandKeys, setExpandKeys] = useState(originExpandKeys);
  const [closeKeys, setCloseKeys] = useState([]);
  const [focusKey, setFocusKey] = useState('');
  const [loadingItems, setLoading] = useState({});

  /**
   * 调用已集成api、封装业务流程api需要接口获取数据
   */
  const getApiInfo = (dataSource, actionType) => {
    if (!dataSource || loadingItems[dataSource]) return {};
    if (window.IntegratedApi[dataSource]) return window.IntegratedApi[dataSource];
    setLoading({ ...loadingItems, [dataSource]: true });
    worksheetAjax.getApiControlDetail({ apiTemplateId: dataSource, actionType }).then(res => {
      window.IntegratedApi[dataSource] = res;
      setLoading({ ...loadingItems, [dataSource]: false });
    });
  };

  /**
   * 编辑筛选条件名称
   */
  const handleEdit = ({ eventId, index, value }) => {
    const newCustomEvent = customEvent.map(i => {
      if (i.eventId === eventId) {
        return update(i, {
          eventActions: {
            [index]: {
              eventName: { $set: value },
            },
          },
        });
      }
      return i;
    });
    onChange(handleAdvancedSettingChange(data, { custom_event: JSON.stringify(newCustomEvent) }));
  };

  /**
   * 且或切换
   */
  const handleSplice = ({ eventId, index, value }) => {
    const newCustomEvent = customEvent.map(i => {
      if (i.eventId === eventId) {
        return update(i, {
          eventActions: {
            [index]: {
              filters: (itemFilter = []) => {
                return itemFilter.map(item => ({ ...item, spliceType: value }));
              },
            },
          },
        });
      }
      return i;
    });
    onChange(handleAdvancedSettingChange(data, { custom_event: JSON.stringify(newCustomEvent) }));
  };

  /**
   * 渲染面板header
   */
  const renderHeader = item => {
    const { eventType, eventActions = [] } = item;
    const curIndex = eventActions.length;
    const cannotSupport = !_.find(EVENT_DISPLAY, a => a.value === eventType);
    return (
      <div className="flexCenter w100">
        <span className="flex" style={cannotSupport ? { color: '#9e9e9e', textDecoration: 'line-through' } : {}}>
          {_.get(
            _.find(dealEventDisplay(data, ADD_EVENT_DISPLAY), a => a.value === eventType),
            'text',
          )}

          {eventType === ADD_EVENT_ENUM.SHOW && (
            <Tooltip placement="bottom" title={_l('字段在当前页面中可见时触发此事件')}>
              <i className="icon-help Gray_9e Font16 Hand mLeft8"></i>
            </Tooltip>
          )}
        </span>
        <EventOptions {...props} eventKey="filters" eventId={item.eventId} index={curIndex} />
        <IconWrap
          className="icon-trash mLeft12"
          type="danger"
          onClick={e => {
            e.stopPropagation();
            const newCustomEvent = customEvent.filter(i => i.eventId !== item.eventId);
            onChange(handleAdvancedSettingChange(data, { custom_event: JSON.stringify(newCustomEvent) }));
          }}
        />
      </div>
    );
  };

  /**
   * 渲染执行动作内容
   */
  const renderActionContent = (actionData = {}) => {
    const { customQueryConfig = [] } = props;
    const { actionType, actionItems = [], isAll, message, advancedSetting = {}, dataSource } = actionData;

    // 用默认值那套配置的呈现
    const renderDynamicValue = (value, controlId) => {
      const dynamicValue = safeParse(value, 'array');

      let currentControl = { type: 2 };
      if (controlId) {
        currentControl = _.find(allControls, a => a.controlId === controlId);
      }

      return <DynamicText {...props} dynamicValue={dynamicValue} data={currentControl} controls={allControls} />;
    };

    switch (actionType) {
      // 显示/隐藏/只读/可编辑
      case ACTION_VALUE_ENUM.SHOW:
      case ACTION_VALUE_ENUM.HIDE:
      case ACTION_VALUE_ENUM.READONLY:
      case ACTION_VALUE_ENUM.EDIT:
      case ACTION_VALUE_ENUM.ACTIVATE_TAB:
        const textArr = getTextById(allControls, actionItems, actionType) || [];
        return (
          <div className="textCon breakAll">{isAll ? _l('所有字段') : textArr.map(cur => cur.name).join(', ')}</div>
        );
      // 错误提示
      case ACTION_VALUE_ENUM.ERROR:
        return (
          <Fragment>
            {actionItems.map(i => {
              return (
                <div className="textCon LineHeight30">
                  <span>{_.get(getTextById(allControls, [i], actionType) || [], '0.name')}</span>
                  <span className="title mLeft10 mRight10">{_l('提示')}</span>
                  {renderDynamicValue(i.value)}
                </div>
              );
            })}
          </Fragment>
        );
      case ACTION_VALUE_ENUM.SET_VALUE:
        return (
          <Fragment>
            {actionItems.map(i => {
              const controlInfo = _.head(getTextById(allControls, [i], 1)) || {};
              if (controlInfo.isDel) {
                return <div className="textCon LineHeight30 Red">{_l('字段已删除')}</div>;
              }
              return (
                <div className="textCon LineHeight30">
                  <span className="title">{_l('将')}</span>
                  <span className="Max215 mLeft10 mRight10 overflow_ellipsis" title={_.get(controlInfo, 'name')}>
                    {_.get(controlInfo, 'name')}
                  </span>
                  <span className="title mRight10">{_l('值设为')}</span>
                  {i.type === '1'
                    ? _l('函数计算')
                    : i.type === '2'
                      ? _l('查询工作表')
                      : renderDynamicValue(i.value, i.controlId)}
                </div>
              );
            })}
          </Fragment>
        );
      case ACTION_VALUE_ENUM.REFRESH_VALUE:
        const refreshArr = getTextById(allControls, actionItems, 1) || [];
        return <div className="textCon breakAll">{refreshArr.map(cur => cur.name).join(', ')}</div>;
      case ACTION_VALUE_ENUM.MESSAGE:
        return (
          <div className="textCon LineHeight30">
            <span className="title mRight10">
              [
              {_.get(
                _.find(ALERT_TYPE_OPTIONS, a => a.value === advancedSetting.alerttype),
                'text',
              )}
              ]
            </span>
            {renderDynamicValue(message)}
          </div>
        );
      case ACTION_VALUE_ENUM.VOICE:
        const { fileKey, voicefiles } = advancedSetting;
        const voiceFiles = VOICE_FILE_LIST.concat(safeParse(voicefiles, 'array'));
        const curFile = _.find(voiceFiles, v => v.fileKey === fileKey);
        if (!fileKey || !curFile) return;
        return <div className="textCon breakAll">{_.get(curFile, 'fileName')}</div>;
      case ACTION_VALUE_ENUM.OPERATION_FLOW:
      case ACTION_VALUE_ENUM.API:
        const { basicInfo = {}, enabled } = getApiInfo(dataSource, actionType) || {};
        const { linkName, name } = basicInfo;

        if (loadingItems[dataSource]) {
          return <LoadDiv />;
        }

        if ((!linkName && !name) || !enabled) {
          return <div className="textCon Red">{_l('已删除')}</div>;
        }

        return (
          <Fragment>
            <div className="textCon">
              {linkName && <span className="title mRight10">{`[${linkName}]`}</span>}
              {name}
            </div>
            <div className="textCon mTop8">
              {_.isEmpty(safeParse(advancedSetting.responsemap)) ? (
                <span className="Gray_9e">{_l('未设置数据写入字段')}</span>
              ) : (
                <span>{_l('已设置数据写入字段')}</span>
              )}
            </div>
          </Fragment>
        );
      // TODO：这两个暂时用不上、按钮才能配
      case ACTION_VALUE_ENUM.LINK:
        return <div className="textCon LineHeight30">{renderDynamicValue(message)}</div>;
      case ACTION_VALUE_ENUM.CREATE:
        return <div className="textCon">{_l('%0 - %1', advancedSetting.appName, advancedSetting.sheetName)}</div>;
      case ACTION_VALUE_ENUM.SEARCH_WORKSHEET:
        const queryId = _.get(safeParse(advancedSetting.dynamicsrc || '{}'), 'id');
        const { appName, sourceName, templates = [] } = _.find(customQueryConfig, q => q.id === queryId) || {};
        const isDelete = !_.get(templates, [0, 'controls', 'length']);
        return (
          <Fragment>
            {isDelete ? (
              <div className="Red">{_l('工作表已删除')}</div>
            ) : (
              <div className="textCon title">{_l('%0 - %1', appName, sourceName)}</div>
            )}
          </Fragment>
        );
    }
  };

  /**
   * 渲染筛选条件
   */
  const renderFilterContent = (filterData = {}) => {
    const { customQueryConfig = [] } = props;
    const { valueType, filterItems = [], advancedSetting = {}, dataSource } = filterData;
    switch (valueType) {
      case FILTER_VALUE_ENUM.CONTROL_VALUE:
        return (
          <FilterItemTexts
            className="customEventFilterValue"
            {...props}
            filters={filterItems}
            loading={false}
            controls={allControls}
          />
        );
      case FILTER_VALUE_ENUM.SEARCH_WORKSHEET:
        const queryId = _.get(safeParse(advancedSetting.dynamicsrc || '{}'), 'id');
        const {
          appName,
          sourceName,
          resultType = 0,
          templates = [],
        } = _.find(customQueryConfig, q => q.id === queryId) || {};
        const isDelete = !_.get(templates, [0, 'controls', 'length']);
        return (
          <Fragment>
            {isDelete ? (
              <div className="Red">{_l('工作表已删除')}</div>
            ) : (
              <div className="textCon title">{_l('%0 - %1', appName, sourceName)}</div>
            )}

            <div className="textCon mTop8">
              <span className="title mRight10">{_l('当')}</span>
              {_.get(
                _.find(RESULT_DISPLAY, r => r.value === resultType),
                'text',
              )}
            </div>
          </Fragment>
        );
      case FILTER_VALUE_ENUM.API:
        const { basicInfo = {}, responseControls = [] } = getApiInfo(dataSource) || {};
        const { linkName, name } = basicInfo;

        if (loadingItems[dataSource]) {
          return <LoadDiv />;
        }
        return (
          <Fragment>
            <div className="textCon">
              <span className="title">{_l('%0 - %1', linkName, name)}</span>
            </div>
            <FilterItemTexts
              className="customEventFilterValue"
              {...props}
              filters={filterItems}
              controls={getFilterControls(responseControls)}
            />
          </Fragment>
        );
      case FILTER_VALUE_ENUM.CUSTOM_FUN:
        return (
          <div className="textCon">
            <span className="title mRight10">{_l('当')}</span>
            {_l('返回 true')}
          </div>
        );
    }
  };

  /**
   * 渲染默认条件
   */
  const renderDefaultFilter = showSplice => {
    return (
      <Fragment>
        <ActionWrap>{_l('在详情页新建或打开记录')}</ActionWrap>
        {showSplice && (
          <SpliceWrap>
            <div className="spliceLine"></div>
            <Dropdown isAppendToBody disabled={true} data={FILTER_SPLICE_TYPE} value={SPLICE_TYPE_ENUM.AND} />
          </SpliceWrap>
        )}
      </Fragment>
    );
  };

  /**
   * 渲染配置内容
   * eventData
   */
  const renderContent = (eventData = {}) => {
    const { eventId, eventActions = [] } = eventData;

    return (
      <Fragment>
        {eventActions.map((item, index) => {
          const { eventName, filters = [], actions = [] } = item;
          const { color, bgColor } = EVENT_DETAIL[index % EVENT_DETAIL.length];
          const eventActionKey = `${eventId}-${index}`;
          const isClose = _.includes(closeKeys, eventActionKey);
          const hasFilters = filters.length > 0;

          return (
            <EventActionWrap eventColor={color} bgColor={bgColor}>
              {isClose ? null : <div className="eventLine" />}
              <div className="eventHeader">
                <div
                  className="flex flexRow flexCenter mRight16"
                  onClick={() => {
                    if (focusKey === eventActionKey) return;
                    const $dom = $(`#${eventActionKey}`);
                    let newCloseKeys = [];
                    if (isClose) {
                      $($dom).slideDown(200);
                      newCloseKeys = closeKeys.filter(i => i !== eventActionKey);
                    } else {
                      $($dom).slideUp(200);
                      newCloseKeys = closeKeys.concat([eventActionKey]);
                    }
                    setCloseKeys(newCloseKeys);
                  }}
                >
                  <div className="eventIcon">
                    <Icon icon={isClose ? 'minus' : 'add'} />
                  </div>
                  <span className="titleEvent">{index ? _l('否则如果') : _l('如果')}</span>
                  {focusKey === eventActionKey ? (
                    <input
                      className="customEventInput"
                      value={eventName}
                      autoFocus
                      onFocus={e => {
                        e.target && e.target.setSelectionRange(0, eventName.length);
                      }}
                      onChange={e => {
                        e.stopPropagation();
                        handleEdit({ eventId, index, value: e.target.value });
                      }}
                      onBlur={e => {
                        e.stopPropagation();
                        handleEdit({ eventId, index, value: e.target.value || _l('满足条件%0', index + 1) });
                        setFocusKey('');
                      }}
                    />
                  ) : (
                    <span className="flex overflow_ellipsis" title={eventName}>
                      {eventName}
                    </span>
                  )}
                </div>
                <EventOptions
                  {...props}
                  eventKey="filters"
                  eventId={eventId}
                  index={index}
                  childIndex={filters.length}
                />
                <MoreOptions {...props} eventId={eventId} index={index} setFocusKey={setFocusKey} />
              </div>
              <div className="eventContent" id={eventActionKey}>
                {/**渲染默认条件 */}
                {renderDefaultFilter(hasFilters)}
                {/**渲染filters */}
                {filters.map((itemFilter, filterIndex) => {
                  return (
                    <Fragment>
                      <ActionWrap>
                        <div className="actionHeader">
                          <span className="title">
                            {_.get(
                              _.find(FILTER_VALUE_TYPE, f => f.value === itemFilter.valueType),
                              'text',
                            )}
                          </span>
                          <EventOptions
                            {...props}
                            eventKey="filters"
                            eventId={eventId}
                            index={index}
                            childIndex={filterIndex}
                            isItemOptions={true}
                          />
                        </div>
                        {renderFilterContent(itemFilter)}
                      </ActionWrap>
                      {filterIndex < filters.length - 1 && (
                        <SpliceWrap>
                          <div className="spliceLine"></div>
                          <Dropdown
                            isAppendToBody
                            disabled={filterIndex}
                            data={FILTER_SPLICE_TYPE}
                            value={_.get(filters[filterIndex], 'spliceType')}
                            onChange={value => handleSplice({ eventId, index, value })}
                          />
                        </SpliceWrap>
                      )}
                    </Fragment>
                  );
                })}

                <span className="actionText">{_l('那么')}</span>
                {/**渲染actions */}
                {actions.map((itemAction, actionIndex) => {
                  return (
                    <ActionWrap>
                      <div className="actionHeader">
                        <span className="title">{getActionTextByValue(itemAction.actionType)}</span>
                        <EventOptions
                          {...props}
                          eventKey="actions"
                          eventId={eventId}
                          index={index}
                          childIndex={actionIndex}
                          isItemOptions={true}
                        />
                      </div>
                      {renderActionContent(itemAction)}
                    </ActionWrap>
                  );
                })}
                <div className="mTop12">
                  <EventOptions
                    {...props}
                    eventKey="actions"
                    eventId={eventId}
                    index={index}
                    childIndex={actions.length}
                  />
                </div>
              </div>
            </EventActionWrap>
          );
        })}
      </Fragment>
    );
  };

  /**
   * 添加事件
   */
  const renderAddEvent = () => {
    const disabled = !FILTER_EVENT_DISPLAY.length;
    const menu = (
      <Menu style={{ width: 310, position: 'relative' }}>
        {dealEventDisplay(data, FILTER_EVENT_DISPLAY).map(item => (
          <MenuItem
            onClick={() => {
              setVisible(false);
              const newCustomEvent = customEvent.concat([
                {
                  eventId: uuidv4(),
                  eventType: item.value,
                  eventActions: [{ eventName: _l('满足条件1'), filters: [], actions: [] }],
                },
              ]);
              onChange(handleAdvancedSettingChange(data, { custom_event: JSON.stringify(newCustomEvent) }));
            }}
          >
            {item.text}
          </MenuItem>
        ))}
      </Menu>
    );
    return (
      <Trigger
        popup={menu}
        popupVisible={visible}
        onPopupVisibleChange={visible => {
          if (disabled) return;
          setVisible(visible);
        }}
        action={['click']}
        popupAlign={{
          points: ['tl', 'bl'],
          offset: [0, 5],
          overflow: { adjustX: true, adjustY: true },
        }}
        getPopupContainer={() => document.body}
      >
        <AddEventWrap disabled={disabled}>
          <Icon icon="add" />
          {_l('事件')}
        </AddEventWrap>
      </Trigger>
    );
  };

  return (
    <Fragment>
      {customEvent.length ? (
        <SettingCollapseWrap
          bordered={false}
          activeKey={expandKeys}
          expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
          onChange={value => setExpandKeys(value)}
        >
          {customEvent.map(item => {
            return (
              <Panel header={renderHeader(item)} key={item.eventType}>
                {renderContent(item)}
              </Panel>
            );
          })}
        </SettingCollapseWrap>
      ) : (
        <WidgetWarning type="event" />
      )}

      {renderAddEvent()}
    </Fragment>
  );
}
