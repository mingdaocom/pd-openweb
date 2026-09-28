import React, { useState } from 'react';
import { Icon } from 'ming-ui';
import { Dropdown } from 'ming-ui/antd-components';

export default function DropOption(props) {
  const { dataList = [], onAction, placement = 'bottomLeft', title } = props;
  const [optionShow, setOptionShow] = useState(false);

  if (dataList.length <= 0) {
    return null;
  }

  const menuItems = dataList.flatMap((option, index) => {
    const optionKey = option.value ?? index;
    const actionItem = {
      key: optionKey,
      danger: option.type === 'err',
      label: option.text,
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        onAction(option);
        setOptionShow(false);
      },
    };

    return option.showLine ? [{ key: `divider-${optionKey}`, type: 'divider' }, actionItem] : [actionItem];
  });
  const items = title
    ? [
        {
          key: 'dropdown-title',
          type: 'group',
          label: title,
          children: menuItems,
        },
      ]
    : menuItems;

  return (
    <Dropdown
      open={optionShow}
      trigger={['click']}
      onOpenChange={setOptionShow}
      menu={{ items }}
      getPopupContainer={() => document.body}
      placement={placement}
    >
      <Icon
        className="TxtMiddle Hand moreop Font20"
        type={props.iconType || 'moreop'}
        onClick={e => {
          e.stopPropagation();
        }}
      />
    </Dropdown>
  );
}
