import React, { useState } from 'react';
import update from 'immutability-helper';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Dropdown, Tooltip } from 'ming-ui/antd-components';
import { withOpeners } from 'ming-ui/hooks/useFunctionWrapComponent';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { FILTER_VALUE_TYPE, getActionDisplay, SPLICE_TYPE_ENUM } from '../config';
import { useCustomAction } from '../CustomAction';
import { useCustomFilter } from '../CustomFilter';
import { AddEventWrap, IconWrap } from '../style';

function EventOptions(props) {
  const {
    data,
    eventKey,
    eventId,
    index,
    childIndex,
    onChange,
    isItemOptions = false,
    openCustomAction,
    openCustomFilter,
  } = props;
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
                openCustomFilter({ ...props, filterData: viewData, handleOk });
              } else {
                openCustomAction({ ...props, actionData: viewData, handleOk });
              }
            }}
          />
        </Tooltip>
        <Tooltip title={_l('删除')} placement="bottom">
          <IconWrap
            className="icon-trash"
            $type="danger"
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
    const filterItems = FILTER_VALUE_TYPE.map(item => ({
      key: item.value,
      label: item.text,
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        openCustomFilter({
          ...props,
          filterData: { ...getData(), valueType: item.value, spliceType: getSpliceType() },
          handleOk,
        });
        setFilterVisible(false);
      },
    }));
    return (
      <Dropdown
        open={filterVisible}
        onOpenChange={setFilterVisible}
        trigger={['click']}
        placement="bottomRight"
        menu={{ items: filterItems, style: { width: 200 } }}
      >
        <div>
          <Tooltip title={_l('添加条件')} placement="bottom">
            <IconWrap
              className="icon-add_circle_outline"
              onClick={e => {
                e.stopPropagation();
                setFilterVisible(true);
              }}
            />
          </Tooltip>
        </div>
      </Dropdown>
    );
  }

  if (eventKey === 'actions') {
    const ACTION_DISPLAY = getActionDisplay(data);

    const actionItems = ACTION_DISPLAY.filter(
      item => !(item.value === '8' && md.global.SysSettings.hideIntegration),
    ).map(item => ({
      key: item.value,
      label: item.text,
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        openCustomAction({
          ...props,
          actionData: { ...getData(), actionType: item.value },
          handleOk,
        });
        setActionVisible(false);
      },
    }));
    return (
      <Dropdown
        open={actionVisible}
        onOpenChange={setActionVisible}
        trigger={['click']}
        placement="bottomLeft"
        getPopupContainer={() => document.body}
        menu={{ items: actionItems, style: { width: 286 } }}
      >
        <AddEventWrap $type="action">
          <Icon icon="add" />
          {_l('执行动作')}
        </AddEventWrap>
      </Dropdown>
    );
  }

  return null;
}

export default withOpeners(EventOptions, {
  openCustomFilter: useCustomFilter,
  openCustomAction: useCustomAction,
});
