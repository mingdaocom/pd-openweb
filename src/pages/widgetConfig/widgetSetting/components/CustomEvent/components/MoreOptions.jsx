import React, { Fragment, useState } from 'react';
import { useSetState } from 'react-use';
import update from 'immutability-helper';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { Icon } from 'ming-ui';
import { Dropdown as AntdDropdown, Checkbox, Modal, Select, Tooltip } from 'ming-ui/antd-components';
import { SettingItem } from 'src/pages/widgetConfig/styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { filterSysControls } from 'src/utils/domain/control/filters';
import { getPathById } from 'src/utils/domain/control/layout';
import { ACTION_VALUE_ENUM, dealEventDisplay, EVENT_MORE_OPTIONS, FILTER_VALUE_ENUM, getEventDisplay } from '../config';
import { IconWrap } from '../style';
import '../../../../styled/style.less';

const SELECT_FIELD_NAMES = { label: 'text', value: 'value' };

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

  const filterControls = filterSysControls(allControls).map(i => ({ value: i.controlId, label: i.controlName }));

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
    <Modal
      width={480}
      open={true}
      mask={{ closable: true }}
      keyboard
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
        <Select
          className="w100"
          options={filterControls}
          showPopupSearch
          optionFilterProp="label"
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
        <Select
          className="w100"
          options={getEventData()}
          fieldNames={SELECT_FIELD_NAMES}
          showPopupSearch
          optionFilterProp="text"
          value={copyEventType || undefined}
          placeholder={_l('选择事件')}
          onChange={value => setData({ copyEventType: value })}
        />
      </SettingItem>
      <Checkbox
        className="mTop16"
        checked={copyAction}
        onChange={event =>
          setData({
            copyAction: event.target.checked,
          })
        }
      >
        {_l('包含执行动作')}
      </Checkbox>
    </Modal>
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

  const eventActions =
    _.get(
      _.find(customEvent, item => item.eventId === eventId),
      'eventActions',
    ) || [];
  const menuItems = EVENT_MORE_OPTIONS.map(item => {
    const danger = item.value === 'delete';
    const disabled = danger && eventActions.length === 1;
    return {
      key: item.value,
      danger,
      disabled,
      icon: <Icon icon={item.icon} className="Font15" />,
      label: item.text,
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        handleClick(item.value);
        setVisible(false);
      },
    };
  });
  return (
    <Fragment>
      <AntdDropdown
        open={visible}
        onOpenChange={setVisible}
        trigger={['click']}
        placement="bottomRight"
        getPopupContainer={() => document.body}
        menu={{ items: menuItems }}
      >
        <div>
          <Tooltip title={_l('更多')} placement="bottom">
            <IconWrap className="icon-more_horiz mLeft16" />
          </Tooltip>
        </div>
      </AntdDropdown>

      {copyVisible && <CopyCustomEvent {...props} onCancel={() => setCopyVisible(false)} />}
    </Fragment>
  );
}
