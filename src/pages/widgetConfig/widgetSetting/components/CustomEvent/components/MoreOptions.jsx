import React, { Fragment, useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import update from 'immutability-helper';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import { v4 as uuidv4 } from 'uuid';
import { Checkbox, Dialog, Dropdown, Icon, Menu, MenuItem } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { SettingItem } from 'src/pages/widgetConfig/styled';
import { filterSysControls } from 'src/pages/widgetConfig/util';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';
import { getPathById } from '../../../../util/widgets';
import { ACTION_VALUE_ENUM, dealEventDisplay, EVENT_MORE_OPTIONS, FILTER_VALUE_ENUM, getEventDisplay } from '../config';
import { IconWrap } from '../style';
import '../../../../styled/style.less';

// 查询工作表不支持复制
const dealEventActions = eventActions => {
  const { filters = [], actions = [] } = eventActions || {};
  const formatFilters = filters.filter(i => i.valueType !== FILTER_VALUE_ENUM.SEARCH_WORKSHEET);
  function dealActions() {
    const formatActions = actions.map(i => {
      const newActionItems = (i.actionItems || []).filter(a => a.type !== '2');
      return { ...i, actionItems: newActionItems };
    });
    return formatActions.filter(i => i.actionType !== ACTION_VALUE_ENUM.SEARCH_WORKSHEET);
  }

  return { ...eventActions, filters: formatFilters, actions: _.isEmpty(actions) ? [] : dealActions() };
};

function CopyCustomEvent(props) {
  const { data, allControls = [], index, widgets = [], onCancel, setWidgets, eventId, onChange } = props;
  const [{ copyId, copyEventType, copyAction }, setData] = useSetState({
    copyId: '',
    copyEventType: '',
    copyAction: false,
  });

  const filterControls = filterSysControls(allControls).map(i => ({ value: i.controlId, text: i.controlName }));

  const currentControl = _.find(allControls, a => a.controlId === copyId);
  const customEvent = getAdvanceSetting(data, 'custom_event') || [];
  const getEventData = () => {
    return currentControl ? dealEventDisplay(currentControl, getEventDisplay(currentControl)) : [];
  };

  const handleOk = () => {
    if (currentControl) {
      // 当前复制的事件
      const copyEvent = _.find(customEvent, c => c.eventId === eventId);
      let currentCopyEventActions = _.get(copyEvent, ['eventActions', index]) || {};
      currentCopyEventActions = copyAction ? currentCopyEventActions : { ...currentCopyEventActions, actions: [] };
      currentCopyEventActions = dealEventActions(currentCopyEventActions);

      // 复制到新控件
      const targetControlEvent = getAdvanceSetting(currentControl, 'custom_event') || [];

      let newEvent = [];
      if (targetControlEvent.some(t => t.eventType === copyEventType)) {
        newEvent = targetControlEvent.map(item => {
          if (item.eventType === copyEventType) {
            return { ...item, eventActions: (item.eventActions || []).concat([currentCopyEventActions]) };
          }
          return item;
        });
      } else {
        newEvent = targetControlEvent.concat([
          {
            eventId: uuidv4(),
            eventType: copyEventType,
            eventActions: [currentCopyEventActions],
          },
        ]);
      }

      if (copyId === data.controlId) {
        onChange(handleAdvancedSettingChange(data, { custom_event: JSON.stringify(newEvent) }));
      } else {
        const [row, col] = getPathById(widgets, currentControl.controlId);
        const newWidgets = update(widgets, {
          [row]: {
            [col]: {
              $set: handleAdvancedSettingChange(currentControl, { custom_event: JSON.stringify(newEvent) }),
            },
          },
        });
        setWidgets(newWidgets);
      }
      alert(_l('复制成功'));
    }
  };

  return (
    <Dialog
      width={480}
      visible={true}
      okDisabled={!(copyId && copyEventType)}
      title={_l('复制条件')}
      onCancel={onCancel}
      className="SearchWorksheetDialog"
      onOk={() => {
        handleOk();
        onCancel();
      }}
    >
      <SettingItem className="mTop0">
        <div className="settingItemTitle">{_l('复制到')}</div>
        <Dropdown
          data={filterControls}
          border
          isAppendToBody
          openSearch
          value={copyId || undefined}
          placeholder={_l('选择字段')}
          onChange={value => {
            if (copyId === value) return;
            setData({ copyId: value, copyEventType: '' });
          }}
        />
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle">{_l('事件')}</div>
        <Dropdown
          data={getEventData()}
          border
          isAppendToBody
          openSearch
          value={copyEventType || undefined}
          placeholder={_l('选择事件')}
          onChange={value => setData({ copyEventType: value })}
        />
      </SettingItem>
      <Checkbox
        className="mTop16"
        checked={copyAction}
        text={_l('包含执行动作')}
        onClick={checked => setData({ copyAction: !checked })}
      />
    </Dialog>
  );
}

export default function MoreOptions(props) {
  const { data, eventId, index, onChange, setFocusKey } = props;
  const customEvent = getAdvanceSetting(data, 'custom_event') || [];
  const [visible, setVisible] = useState(false);
  const [copyVisible, setCopyVisible] = useState(false);

  const handleClick = key => {
    if (key === 'edit') {
      setFocusKey(`${eventId}-${index}`);
      return;
    }
    if (key === 'copy') {
      setCopyVisible(true);
      return;
    }
    if (key === 'delete') {
      const newCustomEvent = customEvent.map(i => {
        if (i.eventId === eventId) {
          return update(i, {
            eventActions: {
              $splice: [[index, 1]],
            },
          });
        }
        return i;
      });
      onChange(handleAdvancedSettingChange(data, { custom_event: JSON.stringify(newCustomEvent) }));
      return;
    }
  };

  const menu = (
    <Menu className="customEventMoreOptions">
      {EVENT_MORE_OPTIONS.map(i => {
        const isDelete = i.value === 'delete';
        const eventActions = _.get(_.head(customEvent.filter(i => i.eventId === eventId)), 'eventActions') || [];

        const disabled = isDelete && eventActions.length === 1;
        return (
          <MenuItem
            className={cx({ isDanger: isDelete, disabled })}
            icon={<Icon icon={i.icon} className="Font15" />}
            onClick={e => {
              if (disabled) return;
              e.stopPropagation();
              handleClick(i.value);
              setVisible(false);
            }}
          >
            {i.text}
          </MenuItem>
        );
      })}
    </Menu>
  );
  return (
    <Fragment>
      <Trigger
        popup={menu}
        popupVisible={visible}
        onPopupVisibleChange={visible => {
          setVisible(visible);
        }}
        action={['click']}
        popupAlign={{
          points: ['tr', 'br'],
          offset: [-180, 5],
          overflow: { adjustX: true, adjustY: true },
        }}
        getPopupContainer={() => document.body}
      >
        <Tooltip title={_l('更多')} placement="bottom">
          <IconWrap className="icon-more_horiz mLeft16" />
        </Tooltip>
      </Trigger>

      {copyVisible && <CopyCustomEvent {...props} onCancel={() => setCopyVisible(false)} />}
    </Fragment>
  );
}
