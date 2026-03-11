import React, { useState } from 'react';
import { Dropdown, Menu } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';

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
  const [placement, setPlacement] = useState('bottom');

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
    if (visible) {
      const className = `filter-${widget.id || widget.uuid}`;
      const container = document.querySelector('.customPageContentWrap');
      const card = _.get(
        document.querySelector(`.${className}`),
        widget.sectionId || widget.tabId ? 'parentNode.parentNode.parentNode' : 'parentNode.parentNode',
      );
      const tuneIcon = card.querySelector('.widgetContentTools .icon-tune');
      if (container && tuneIcon) {
        const elementRect = tuneIcon.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const elementBottomToContainerTop = elementRect.bottom - containerRect.top;
        const containerVisibleHeight = container.clientHeight;
        setPlacement(containerVisibleHeight - elementBottomToContainerTop < 200 ? 'top' : 'bottom');
      }
    }
  };

  return (
    <Dropdown
      trigger={['hover']}
      placement={placement}
      visible={dropdownVisible}
      onVisibleChange={handleUpdateDropdownVisible}
      overlay={
        <Menu
          className="chartMenu"
          expandIcon={<Icon icon="arrow-right-tip" />}
          subMenuOpenDelay={0.2}
          style={{ width: 180 }}
        >
          <Menu.Item key="tabLabel" disabled={true} className="pLeft16 textTertiary Font13 cursorDefault">
            {_l('筛选内容')}
          </Menu.Item>
          {showTyps.map(item => (
            <Menu.Item
              key={item.value}
              className="pLeft16"
              onClick={() => {
                onChangeHeight(item.value);
              }}
            >
              <div className="flexRow valignWrapper">
                <div className={cx('flex', { colorPrimary: item.value === height })}>{item.name}</div>
                {item.value === height && <Icon icon="done" className="Font20 colorPrimary" />}
              </div>
            </Menu.Item>
          ))}
        </Menu>
      }
    >
      {renderItem({ onClick: () => {} })}
    </Dropdown>
  );
};
