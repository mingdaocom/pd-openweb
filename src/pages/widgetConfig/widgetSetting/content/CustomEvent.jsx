import { Collapse } from 'antd';
import Trigger from 'rc-trigger';
import { v4 as uuidv4 } from 'uuid';
import React, { Fragment, useState } from 'react';
import { Menu, MenuItem, Icon, LoadDiv, Dropdown } from 'ming-ui';
import { SettingCollapseWrap } from './styled';
import { CaretRightOutlined } from '@ant-design/icons';
import WidgetWarning from '../components/WidgetBase/WidgetWarning';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../util/setting';
import {
  AddEventWrap,
  IconWrap,
  EventActionWrap,
  ActionWrap,
  SpliceWrap,
  CustomDynamicContent,
  CustomFieldList,
} from '../components/CustomEvent/style';
import {
  FILTER_VALUE_TYPE,
  EVENT_DETAIL,
  getEventDisplay,
  ACTION_VALUE_ENUM,
  getActionTextByValue,
  ALERT_TYPE_OPTIONS,
  FILTER_VALUE_ENUM,
  RESULT_DISPLAY,
  FILTER_SPLICE_TYPE,
} from '../components/CustomEvent/config';
import { getTextById } from 'src/pages/FormSet/components/columnRules/config.js';
import _ from 'lodash';
import MoreOptions from '../components/CustomEvent/components/MoreOptions';
import EventOptions from '../components/CustomEvent/components/EventOptions';
import { FilterItemTexts } from '../components/FilterData';
import update from 'immutability-helper';
import worksheetAjax from 'src/api/worksheet';
import { OtherFieldList, OtherField } from '../components/DynamicDefaultValue/components';
import cx from 'classnames';
import { getFilterControls } from '../../util/data';

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
   * 调用已集成api需要接口获取数据
   */
  const getApiInfo = dataSource => {
    if (!dataSource || loadingItems[dataSource]) return {};
    if (window.IntegratedApi[dataSource]) return window.IntegratedApi[dataSource];
    setLoading({ ...loadingItems, [dataSource]: true });
    worksheetAjax.getApiControlDetail({ apiTemplateId: dataSource }).then(res => {
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
  const handleSplice = ({ eventId, index, childIndex, value }) => {
    const newCustomEvent = customEvent.map(i => {
      if (i.eventId === eventId) {
        return update(i, {
          eventActions: {
            [index]: {
              filters: {
                [childIndex]: {
                  spliceType: { $set: value },
                },
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
    const curIndex = eventActions.reduce((total, cur) => {
      if (!_.isEmpty(_.get(cur, 'filters'))) {
        total = total + 1;
      }
      return total;
    }, 0);
    return (
      <div className="flexCenter w100">
        <span className="flex">
          {_.get(
            _.find(EVENT_DISPLAY, a => a.value === eventType),
            'text',
          )}
        </span>
        <EventOptions {...props} eventKey="filters" eventId={item.eventId} index={curIndex} />
        <IconWrap
          className="icon-delete1 mLeft12"
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
    const { actionType, actionItems = [], isAll, message, advancedSetting = {}, dataSource } = actionData;

    // 用默认值那套配置的呈现
    const renderDynamicValue = (value, controlId) => {
      const dynamicValue = safeParse(value, 'array');
      if (_.isEmpty(dynamicValue)) return null;

      let currentControl = { type: 2 };
      if (controlId) {
        const curControl = _.find(allControls, a => a.controlId === controlId);
        if (!curControl) return null;
        currentControl = curControl;
      }

      const isText = currentControl.type === 2;

      if (currentControl.type && !_.includes([2, 9, 10, 11], currentControl.type)) {
        return (
          <CustomFieldList>
            <OtherFieldList {...props} controls={allControls} dynamicValue={dynamicValue} data={currentControl} />
          </CustomFieldList>
        );
      }

      return (
        <CustomDynamicContent>
          {dynamicValue.map(item => {
            if (item.cid) {
              return (
                <OtherField
                  className={cx('tagTextField overflow_ellipsis', { mRight: isText })}
                  item={item}
                  {...props}
                  controls={allControls}
                />
              );
            } else if (_.includes([9, 10, 11], currentControl.type)) {
              const option = _.find(currentControl.options || [], o => o.key === item.staticValue) || {};
              return (
                <div className={cx('option pointer overflow_ellipsis mRight6', { isDeleted: _.isEmpty(option) })}>
                  {currentControl.enumDefault2 === 1 && option.color && (
                    <div className="colorWrap" style={{ backgroundColor: option.color }}></div>
                  )}
                  <div className="text overflow_ellipsis">{option.value || _l('已删除')}</div>
                </div>
              );
            } else {
              return <span className="mRight6">{item.staticValue}</span>;
            }
          })}
        </CustomDynamicContent>
      );
    };

    switch (actionType) {
      // 显示/隐藏/只读/可编辑
      case ACTION_VALUE_ENUM.SHOW:
      case ACTION_VALUE_ENUM.HIDE:
      case ACTION_VALUE_ENUM.READONLY:
      case ACTION_VALUE_ENUM.EDIT:
        const textArr = getTextById(allControls, actionItems, actionType) || [];
        return <div className="textCon">{isAll ? _l('所有字段') : textArr.map(cur => cur.name).join(', ')}</div>;
      // 错误提示
      case ACTION_VALUE_ENUM.ERROR:
        return (
          <Fragment>
            {actionItems.map(i => {
              return (
                <div className="textCon">
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
              return (
                <div className="textCon mTop6">
                  <span className="title">{_l('将')}</span>
                  <span className="mLeft10 mRight10">{_.get(getTextById(allControls, [i], 1) || [], '0.name')}</span>
                  <span className="title mRight10">{_l('值设为')}</span>
                  {i.type === '1' ? _l('函数计算') : renderDynamicValue(i.value, i.controlId)}
                </div>
              );
            })}
          </Fragment>
        );
      case ACTION_VALUE_ENUM.REFRESH_VALUE:
        const refreshArr = getTextById(allControls, actionItems, 1) || [];
        return <div className="textCon">{refreshArr.map(cur => cur.name).join(', ')}</div>;
      case ACTION_VALUE_ENUM.MESSAGE:
        return (
          <div className="textCon">
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
        const curFile = _.find(
          safeParse(advancedSetting.voicefiles, 'array'),
          f => f.filePath === advancedSetting.file,
        );
        return <div className="textCon">{_.get(curFile, 'fileName')}</div>;
      case ACTION_VALUE_ENUM.API:
        const { basicInfo = {} } = getApiInfo(dataSource) || {};
        const { linkName, name } = basicInfo;

        if (loadingItems[dataSource]) {
          return <LoadDiv />;
        }
        return (
          <Fragment>
            <div className="textCon">
              <span className="title mRight10">{`[${linkName}]`}</span>
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
        return <div className="textCon">{renderDynamicValue(message)}</div>;
      case ACTION_VALUE_ENUM.CREATE:
        return <div className="textCon">{_l('%0 - %1', advancedSetting.appName, advancedSetting.sheetName)}</div>;
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
          <FilterItemTexts className="customEventFilterValue" {...props} filters={filterItems} controls={allControls} />
        );
      case FILTER_VALUE_ENUM.SEARCH_WORKSHEET:
        const queryId = _.get(safeParse(advancedSetting.dynamicsrc || '{}'), 'id');
        const { appName, sourceName, resultType = 0 } = _.find(customQueryConfig, q => q.id === queryId) || {};
        return (
          <Fragment>
            <div className="textCon title">{_l('%0 - %1', appName, sourceName)}</div>
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
   * 渲染配置内容
   * eventData
   */
  const renderContent = (eventData = {}) => {
    const { eventId, eventActions = [] } = eventData;

    return (
      <Fragment>
        {eventActions.map((item, index) => {
          const { eventName, filters = [], actions = [] } = item;
          const { text, color, bgColor } = EVENT_DETAIL[index % EVENT_DETAIL.length];
          const eventActionKey = `${eventId}-${index}`;
          const isClose = _.includes(closeKeys, eventActionKey);

          if (_.isEmpty(filters) && _.isEmpty(actions)) {
            return <EventOptions {...props} eventKey="actions" eventId={eventId} index={index} />;
          }

          return (
            <EventActionWrap eventColor={color} bgColor={bgColor}>
              {isClose ? null : <div className="eventLine" />}
              <div className="eventHeader">
                <div
                  className="flex flexRow flexCenter mRight16"
                  onClick={() => {
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
                  <span className="titleEvent">{text}</span>
                  {focusKey === eventActionKey ? (
                    <input
                      className="customEventInput"
                      value={eventName}
                      autoFocus
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
                    <span className="flex overflow_ellipsis">{eventName}</span>
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
                {/**渲染filters */}
                {filters.map((itemFilter, filterIndex) => {
                  return (
                    <Fragment>
                      {filterIndex > 0 && (
                        <SpliceWrap>
                          <div className="spliceLine"></div>
                          <Dropdown
                            isAppendToBody
                            data={FILTER_SPLICE_TYPE}
                            value={_.get(filters[filterIndex - 1], 'spliceType')}
                            onChange={value => handleSplice({ eventId, index, childIndex: filterIndex - 1, value })}
                          />
                        </SpliceWrap>
                      )}
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
                    </Fragment>
                  );
                })}

                <span className="actionText">{_l('那么就')}</span>
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
      <Menu style={{ width: 310 }}>
        {FILTER_EVENT_DISPLAY.map(item => (
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
        disabled={disabled}
        popupVisible={visible}
        onPopupVisibleChange={visible => {
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
        <WidgetWarning type="custom_event" />
      )}

      {renderAddEvent()}
    </Fragment>
  );
}
