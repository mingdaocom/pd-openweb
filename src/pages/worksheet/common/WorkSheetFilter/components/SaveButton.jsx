import React from 'react';
import { Button, Dropdown, Space } from 'ming-ui/antd-components';

const SAVE_OPTIONS_TRIGGER = ['click'];

export default function SaveButton(props) {
  const { disabled, downList, onClick } = props;
  const hasDownList = Array.isArray(downList) && downList.length > 0;
  const menuItems = hasDownList
    ? downList.map((item, index) => ({
        key: index,
        label: item.name,
        disabled: item.disabled,
        onClick: () => item.onClick(),
      }))
    : [];

  return (
    <Space.Compact>
      <Button
        style={{ '--hap-control-height': '32px' }}
        shape="round"
        className="Bold Font13"
        disabled={disabled}
        onClick={onClick}
      >
        {_l('保存')}
      </Button>
      {hasDownList && (
        <Dropdown
          disabled={disabled}
          trigger={SAVE_OPTIONS_TRIGGER}
          placement="bottomRight"
          menu={{ items: menuItems }}
        >
          <Button
            style={{ '--hap-control-height': '32px' }}
            shape="round"
            className="Font13"
            disabled={disabled}
            aria-label={_l('更多保存选项')}
            icon={<i className="icon icon-arrow-down" />}
          />
        </Dropdown>
      )}
    </Space.Compact>
  );
}
