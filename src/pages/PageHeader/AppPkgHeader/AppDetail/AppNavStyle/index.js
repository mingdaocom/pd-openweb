import React from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import './index.less';

const mobileNavList = [
  {
    name: _l('列表'),
    value: 0,
    icon: 'Application_List',
  },
  {
    name: _l('宫格'),
    value: 1,
    icon: 'Application_Bottom',
  },
  {
    name: _l('底部导航'),
    value: 2,
    icon: 'Application_Grid',
  },
];

export const pcNavList = [
  {
    name: _l('经典'),
    value: 0,
    icon: 'web_classic',
    defaultDisplayIcon: '011',
  },
  {
    name: _l('分组列表'),
    value: 1,
    icon: 'web_group',
    defaultDisplayIcon: '011',
  },
  {
    name: _l('树形列表'),
    value: 3,
    icon: 'web_tree',
    defaultDisplayIcon: '100',
  },
  {
    name: _l('卡片'),
    value: 2,
    icon: 'web_card',
    defaultDisplayIcon: '011',
  },
];

export default function AppNavStyle(props) {
  const { type, data, onChangeApp, className = '' } = props;
  const navList = type === 'pcNaviStyle' ? pcNavList : mobileNavList;
  const naviStyle = data[type];

  const handleEditAppINfo = item => {
    const data = { [type]: item.value };

    if (item.defaultDisplayIcon) {
      data.displayIcon = item.defaultDisplayIcon;
    }

    onChangeApp(data);
  };

  return (
    <div className={cx('AppNavStyleWrap', className)}>
      {/*<div className="mBottom20">{_l('设置的导航方式对所有应用成员生效')}</div>*/}
      <div className="flexRow valignWrapper navListWrap">
        {navList.map(item => (
          <div
            key={item.value}
            className="flexColumn valignWrapper Relative pointer iconWrap"
            onClick={() => {
              handleEditAppINfo(item);
            }}
          >
            {naviStyle === item.value && (
              <div className="flexRow valignWrapper activeIcon">
                <Icon icon="done" />
              </div>
            )}
            <div
              className={cx('navImg flexRow alignItemsCenter justifyContentCenter', type, {
                activeNav: naviStyle === item.value,
              })}
            >
              <Icon icon={item.icon} style={{ fontSize: 90 }} />
            </div>
            <span className={cx({ colorPrimary: naviStyle === item.value })}>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
