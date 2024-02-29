import React from 'react';
import { Icon } from 'ming-ui';
import { Menu } from 'antd';
const HIDDEN_MENU = [
  {
    text: _l('全隐藏%05011'),
    textShow: _l('全显示%05008'),
    key: ['hide', 'show'],
  },
  {
    text: _l('仅在PC端隐藏%05010'),
    textShow: _l('仅在PC端显示%05007'),
    key: ['hpc&sapp', 'spc&happ'],
  },
  {
    text: _l('仅在移动端隐藏%05009'),
    textShow: _l('仅在移动端显示%05006'),
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
            onClick={() => onClick(showhide === HIDDEN_MENU[index].key[type] ? '' : HIDDEN_MENU[index].key[type])}
          >
            {item[showhide !== 'hide' ? 'text' : 'textShow']}
            {showhide === HIDDEN_MENU[index].key[type] && <Icon icon="done" />}
          </Menu.Item>
        );
      })}
    </Menu>
  );
}
