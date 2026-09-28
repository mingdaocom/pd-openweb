import React from 'react';
import { Dropdown } from 'ming-ui/antd-components';

const NOOP = () => {};

const EMPTY_ITEM = {};
const MENU_STYLE = { minWidth: 240 };
const PAUSE_LABEL_STYLE = { color: 'var(--color-error)' };
const RECOVER_LABEL_STYLE = { color: 'var(--color-success)' };

const getRunDateOptions = () => [
  { value: 0, label: _l('直到手动恢复') },
  { value: 1, label: _l('暂停1小时') },
  { value: 2, label: _l('暂停2小时') },
  { value: 3, label: _l('暂停3小时') },
  { value: 4, label: _l('暂停4小时') },
  { value: 5, label: _l('暂停5小时') },
  { value: 6, label: _l('暂停6小时') },
];

export const getPauseTimeItems = waiting =>
  getRunDateOptions().map(({ value, label }) => {
    if (value === 0) {
      return {
        key: String(value),
        label: waiting ? (
          <span style={RECOVER_LABEL_STYLE}>{_l('恢复消费')}</span>
        ) : (
          <span>
            <span style={PAUSE_LABEL_STYLE}>{_l('暂停')}</span>
            {` （${label}）`}
          </span>
        ),
      };
    }

    return {
      key: String(value),
      label: waiting ? _l('继续') + label : label,
    };
  });

export default function PauseTimeList(props) {
  const { changeOperation = NOOP, clickRecover = NOOP, item = EMPTY_ITEM } = props;
  const { waiting } = item;

  return (
    <Dropdown
      getPopupContainer={props.getPopupContainer}
      menu={{
        items: getPauseTimeItems(waiting),
        style: MENU_STYLE,
        onClick: ({ key }) => {
          const value = Number(key);

          if (value === 0 && waiting) {
            clickRecover(item);
            return;
          }

          changeOperation(item, value);
        },
      }}
      trigger={['click']}
      placement="bottomLeft"
    >
      <span>{props.children}</span>
    </Dropdown>
  );
}
