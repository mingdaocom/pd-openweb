import React, { useState } from 'react';
import Trigger from 'rc-trigger';
import { Menu, MenuItem, Icon } from 'ming-ui';
import { Tooltip } from 'antd';
import update from 'immutability-helper';
import { FILTER_VALUE_TYPE, getActionDisplay, SPLICE_TYPE_ENUM } from '../config';
import { IconWrap, AddEventWrap } from '../style';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../../util/setting';
import renderCustomAction from '../CustomAction';
import renderCustomFilter from '../CustomFilter';

export default function EventOptions(props) {
  const { data, eventKey, eventId, index, childIndex, onChange, isItemOptions = false } = props;
  const [filterVisible, setFilterVisible] = useState(false);
  const [actionVisible, setActionVisible] = useState(false);
  const customEvent = getAdvanceSetting(data, 'custom_event') || [];

  /**
   * 获取当前数据
   */
  const getData = () => {
    const { eventActions = [] } = _.find(customEvent, c => c.eventId === eventId) || {};
    return _.get(eventActions, [index, eventKey, childIndex]) || {};
  };

  /**
   * 获取且或
   */
  const getSpliceType = () => {
    const { eventActions = [] } = _.find(customEvent, c => c.eventId === eventId) || {};
    const curSpliceType = _.get(eventActions, [index, 'filters', 0, 'spliceType']);
    return curSpliceType || SPLICE_TYPE_ENUM.AND;
  };

  /**
   * 更新数据
   * eventKey: 'filters' | 'actions'
   */
  const handleOk = (newValue, isDelete) => {
    const newCustomEvent = customEvent.map(i => {
      if (i.eventId === eventId) {
        return update(i, {
          eventActions: {
            $apply: (item = []) => {
              const originItem = item[index] || {
                eventName: _l('满足条件%0', item.length + 1),
                filters: [],
                actions: [],
              };
              const newItem = update(originItem, {
                [eventKey]: {
                  $splice: isDelete ? [[childIndex, 1]] : [[childIndex, 1, newValue]],
                },
              });
              if (item[index]) {
                return update(item, { $splice: [[index, 1, newItem]] });
              } else {
                return update(item, { $push: [newItem] });
              }
            },
          },
        });
      }
      return i;
    });
    onChange(handleAdvancedSettingChange(data, { custom_event: JSON.stringify(newCustomEvent) }));
  };

  if (isItemOptions) {
    const viewData = getData();
    return (
      <span className="iconBox">
        <Tooltip title={_l('编辑')} placement="bottom">
          <IconWrap
            className="icon-edit mRight16"
            onClick={e => {
              e.stopPropagation();
              if (eventKey === 'filters') {
                renderCustomFilter({ ...props, filterData: viewData, handleOk });
              } else {
                renderCustomAction({ ...props, actionData: viewData, handleOk });
              }
            }}
          />
        </Tooltip>
        <Tooltip title={_l('删除')} placement="bottom">
          <IconWrap
            className="icon-delete1"
            type="danger"
            onClick={e => {
              e.stopPropagation();
              handleOk(viewData, true);
            }}
          />
        </Tooltip>
      </span>
    );
  }

  if (eventKey === 'filters') {
    const filterMenu = (
      <Menu style={{ width: 200 }}>
        {FILTER_VALUE_TYPE.map(i => (
          <MenuItem
            onClick={e => {
              e.stopPropagation();
              renderCustomFilter({
                ...props,
                filterData: { ...getData(), valueType: i.value, spliceType: getSpliceType() },
                handleOk,
              });
              setFilterVisible(false);
            }}
          >
            {i.text}
          </MenuItem>
        ))}
      </Menu>
    );
    return (
      <Trigger
        popup={filterMenu}
        popupVisible={filterVisible}
        onPopupVisibleChange={visible => {
          setFilterVisible(visible);
        }}
        action={['click']}
        popupAlign={{
          points: ['tr', 'br'],
          offset: [-180, 5],
          overflow: { adjustX: true, adjustY: true },
        }}
        getPopupContainer={() => document.body}
      >
        <Tooltip title={_l('添加条件')} placement="bottom">
          <IconWrap className="icon-add_circle_outline" onClick={e => e.stopPropagation()} />
        </Tooltip>
      </Trigger>
    );
  }

  if (eventKey === 'actions') {
    const ACTION_DISPLAY = getActionDisplay(data);

    const actionMenu = (
      <Menu style={{ width: 286, position: 'relative' }}>
        {ACTION_DISPLAY.filter(v => !(v.value === '8' && md.global.SysSettings.hideIntegration)).map(i => (
          <MenuItem
            onClick={e => {
              e.stopPropagation();
              renderCustomAction({
                ...props,
                actionData: { ...getData(), actionType: i.value },
                handleOk,
              });
              setActionVisible(false);
            }}
          >
            {i.text}
          </MenuItem>
        ))}
      </Menu>
    );
    return (
      <Trigger
        popup={actionMenu}
        popupVisible={actionVisible}
        onPopupVisibleChange={visible => {
          setActionVisible(visible);
        }}
        action={['click']}
        popupAlign={{
          points: ['tl', 'bl'],
          offset: [0, 5],
          overflow: { adjustX: true, adjustY: true },
        }}
        getPopupContainer={() => document.body}
      >
        <AddEventWrap type="action">
          <Icon icon="add" />
          {_l('执行动作')}
        </AddEventWrap>
      </Trigger>
    );
  }
  return null;
}
