import React, { useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Dropdown } from 'ming-ui/antd-components';

const showTyps = [
  {
    value: 1,
    name: _l('不显示'),
  },
  {
    value: 2,
    name: _l('显示'),
  },
];

export default props => {
  const { widget, updateWidget, renderItem } = props;
  const height = _.get(widget.mobile, 'layout.h') || 1;
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const onChangeHeight = value => {
    updateWidget({
      widget,
      mobile: {
        ...widget.mobile,
        layout: {
          ...widget.mobile.layout,
          h: value,
        },
      },
    });
  };

  const handleUpdateDropdownVisible = visible => {
    setDropdownVisible(visible);
  };

  return (
    <Dropdown
      trigger={['hover']}
      placement="bottom"
      open={dropdownVisible}
      onOpenChange={handleUpdateDropdownVisible}
      menu={{
        subMenuOpenDelay: 0.2,
        style: { minWidth: 180 },
        items: [
          {
            key: 'tabLabel',
            disabled: true,
            className: 'pLeft16 textTertiary Font13 cursorDefault',
            label: _l('筛选内容'),
          },
          ...showTyps.map(item => ({
            key: item.value,
            className: 'pLeft16',
            label: (
              <div className="flexRow valignWrapper">
                <div className={cx('flex', { colorPrimary: item.value === height })}>{item.name}</div>
                {item.value === height && <Icon icon="done" className="Font20 colorPrimary" />}
              </div>
            ),
            onClick: () => {
              onChangeHeight(item.value);
            },
          })),
        ],
      }}
    >
      {renderItem({ onClick: () => {} })}
    </Dropdown>
  );
};
