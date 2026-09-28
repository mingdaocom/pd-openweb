import React from 'react';
import { Icon } from 'ming-ui';
import { Dropdown, Modal } from 'ming-ui/antd-components';

const stopMenuEvent = event => event?.domEvent?.stopPropagation();
const getBodyPopupContainer = () => document.body;

export const handleCopyOptionClick = ({ event, setFn, onCopy }) => {
  event?.stopPropagation();
  setFn({ showMoreOption: false });
  onCopy();
};

export const handleExtraOptionClick = ({ event, option, setFn }) => {
  event?.stopPropagation();
  if (option.disabled) {
    option.onDisabledClick?.();
    return;
  }

  setFn({ showMoreOption: false });
  option.onClick?.();
};

export const openDeleteConfirm = ({ setFn, deleteFn, delTxt, description }) => {
  setFn({
    isRename: false,
    showMoreOption: false,
  });

  return Modal.confirm({
    title: <span className="Red textError">{delTxt || _l('删除模板')}</span>,
    content: description || _l('删除后将无法恢复'),
    okButtonProps: {
      danger: true,
    },
    onOk: deleteFn,
  }).destroy;
};

export const getMoreOptionItems = ({
  setFn,
  delTxt,
  description,
  deleteFn,
  disabledRename,
  showDisabledRename,
  showCopy,
  onCopy,
  showEnableSwitch,
  disabled,
  onToggleEnable,
  extraOptions = [],
}) => {
  const items = [];

  if (!disabledRename || showDisabledRename) {
    items.push({
      key: 'rename',
      icon: <Icon icon="edit" />,
      label: _l('重命名'),
      disabled: disabledRename,
      onClick: event => {
        stopMenuEvent(event);
        setFn({
          isRename: true,
          showMoreOption: false,
        });
      },
    });
  }

  if (showCopy) {
    items.push({
      key: 'copy',
      icon: <Icon icon="copy" />,
      label: _l('复制'),
      onClick: event => handleCopyOptionClick({ event: event.domEvent, setFn, onCopy }),
    });
  }

  extraOptions.forEach(option => {
    items.push({
      key: option.key,
      icon: <Icon icon={option.icon} />,
      disabled: option.disabled,
      label: (
        <span
          className="flexRow alignItemsCenter"
          onClick={event => {
            if (!option.disabled) return;
            event.stopPropagation();
            option.onDisabledClick?.();
          }}
        >
          <span className="flex">{option.label}</span>
          {option.suffix}
        </span>
      ),
      onClick: event => handleExtraOptionClick({ event: event.domEvent, option, setFn }),
    });
  });

  if (showEnableSwitch) {
    items.push(
      {
        key: 'toggleEnable',
        icon: <Icon icon={disabled ? 'arrow-right-tip' : 'rounded_square'} />,
        label: disabled ? _l('启用') : _l('停用'),
        danger: !disabled,
        onClick: event => {
          stopMenuEvent(event);
          setFn({ showMoreOption: false });
          onToggleEnable(!disabled);
        },
      },
      { type: 'divider' },
    );
  }

  items.push({
    key: 'delete',
    icon: <Icon icon="trash" />,
    label: delTxt || _l('删除'),
    danger: true,
    onClick: event => {
      stopMenuEvent(event);
      openDeleteConfirm({ setFn, deleteFn, delTxt, description });
    },
  });

  return items;
};

export default function MoreOption({
  open,
  onOpenChange,
  placement = 'bottomRight',
  getPopupContainer = getBodyPopupContainer,
  children,
  ...menuProps
}) {
  return (
    <Dropdown
      open={open}
      trigger={['click']}
      placement={placement}
      getPopupContainer={getPopupContainer}
      onOpenChange={onOpenChange}
      menu={{ items: getMoreOptionItems(menuProps) }}
    >
      {children}
    </Dropdown>
  );
}
