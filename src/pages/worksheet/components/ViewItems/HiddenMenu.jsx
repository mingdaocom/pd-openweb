import React from 'react';
import { Icon } from 'ming-ui';
import { Menu } from 'antd';
const HIDDEN_MENU = [
  {
    text: '全',
    key: ['hide', 'show'],
  },
  {
    text: '仅在PC端',
    key: ['hpc&sapp', 'spc&happ'],
  },
  {
    text: '仅在移动端',
    key: ['spc&happ', 'hpc&sapp'],
  },
];

export default function HiddenMenu(props) {
  const { onClick, current = 0, showhide, ...rest } = props;
  let type = showhide === 'hide' ? 1 : 0;

  return (
    <Menu className="hiddenMenu" {...rest}>
      {HIDDEN_MENU.map((item, index) => {
        return (
          <Menu.Item
            key={'hiddenMenu' + index}
            className={`hiddenMenuItem ${showhide === HIDDEN_MENU[index].key[type] ? 'current' : ''}`}
            onClick={() => onClick(HIDDEN_MENU[index].key[type])}
          >
            {_l('%0', `${item.text}${showhide !== 'hide' ? '隐藏' : '显示'}`)}
            {showhide === HIDDEN_MENU[index].key[type] && <Icon icon="done" />}
          </Menu.Item>
        );
      })}
    </Menu>
  );
}
