import React, { Fragment, useState } from 'react';
import Trigger from 'rc-trigger';
import { Menu, MenuItem, Icon, Dropdown, Checkbox, Dialog } from 'ming-ui';
import { Tooltip } from 'antd';
import { EVENT_MORE_OPTIONS, ADD_EVENT_DISPLAY, getEventDisplay, dealEventDisplay } from '../config';
import { IconWrap } from '../style';
import { useSetState } from 'react-use';
import cx from 'classnames';
import update from 'immutability-helper';
import '../../../../styled/style.less';
import { SettingItem } from 'src/pages/widgetConfig/styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';
import { filterSysControls } from 'src/pages/widgetConfig/util';
import { v4 as uuidv4 } from 'uuid';
import { getPathById } from '../../../../util/widgets';

function CopyCustomEvent(props) {
  const { data, allControls = [], index, widgets = [], onCancel, setWidgets } = props;
  const [{ copyId, copyEventId, copyAction }, setData] = useSetState({
    copyId: '',
    copyEventId: '',
    copyAction: false,
  });

  const filterControls = filterSysControls(allControls)
    .filter(i => i.controlId !== data.controlId)
    .filter(i => !_.includes([34], i.type))
    .map(i => ({ value: i.controlId, text: i.controlName }));

  const currentControl = _.find(allControls, a => a.controlId === copyId);
  const customEvent = getAdvanceSetting(data, 'custom_event') || [];
  const getEventData = () => {
    if (currentControl) {
      const supportEvent = getEventDisplay(currentControl);
      return customEvent
        .filter(c => _.find(supportEvent, s => s.value === c.eventType))
        .map(c => {
          return {
            value: c.eventId,
            text: _.get(
              _.find(dealEventDisplay(data, ADD_EVENT_DISPLAY), e => e.value === c.eventType),
              'text',
            ),
          };
        });
    }
    return [];
  };

  const handleOk = () => {
    const currentEvent = _.find(customEvent, c => c.eventId === copyEventId);
    const currentEventActions = _.get(currentEvent, ['eventActions', index]) || {};

    if (currentControl) {
      const copyEvent = copyAction ? currentEventActions : { ...currentEventActions, actions: [] };
      let newControlEvent = getAdvanceSetting(currentControl, 'custom_event') || [];
      // 有相同事件叠加
      if (newControlEvent.some(n => n.eventType === currentEvent.eventType)) {
        newControlEvent = newControlEvent.map(newItem => {
          if (newItem.eventType === currentEvent.eventType) {
            return {
              ...newItem,
              eventActions: (newItem.eventActions || []).concat(copyEvent),
            };
          }
          return newItem;
        });
      } else {
        newControlEvent.push({
          eventId: uuidv4(),
          eventType: currentEvent.eventType,
          eventActions: [{ ...copyEvent }],
        });
      }

      const [row, col] = getPathById(widgets, currentControl.controlId);
      const newWidgets = update(widgets, {
        [row]: {
          [col]: {
            $set: handleAdvancedSettingChange(currentControl, { custom_event: JSON.stringify(newControlEvent) }),
          },
        },
      });
      setWidgets(newWidgets);
      alert(_l('复制成功'));
    }

    let newCurrentEvent = update(currentEvent, {
      eventActions: {
        $apply: (item = []) => {
          const currentItem = item[index] || {};
          if (!copyAction) {
            return [_.omit(currentItem, ['actions'])];
          }
          return [currentItem];
        },
      },
    });
    newCurrentEvent.eventId = uuidv4();
  };

  return (
    <Dialog
      width={480}
      visible={true}
      okDisabled={!(copyId && copyEventId)}
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
          value={copyId || undefined}
          placeholder={_l('选择字段')}
          onChange={value => setData({ copyId: value })}
        />
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle">{_l('事件')}</div>
        <Dropdown
          data={getEventData()}
          border
          isAppendToBody
          value={copyEventId || undefined}
          placeholder={_l('选择事件')}
          onChange={value => setData({ copyEventId: value })}
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
