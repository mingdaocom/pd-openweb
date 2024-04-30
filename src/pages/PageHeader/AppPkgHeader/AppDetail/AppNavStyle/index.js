import React, { useState, useEffect } from 'react';
import { Icon } from 'ming-ui';
import cx from 'classnames';
import homeApp from 'src/api/homeApp';
import './index.less';

const mobileNavList = [{
  name: _l('列表'),
  value: 0,
  style: 'list',
  activeStyle: 'list_active',
}, {
  name: _l('宫格'),
  value: 1,
  style: 'sudoku',
  activeStyle: 'sudoku_active',
}, {
  name: _l('底部导航'),
  value: 2,
  style: 'nav',
  activeStyle: 'nav_active',
}];

export const pcNavList = [{
  name: _l('经典'),
  value: 0,
  style: 'classic',
  activeStyle: 'classic_active',
  defaultDisplayIcon: '011'
}, {
  name: _l('分组列表'),
  value: 1,
  style: 'left_group',
  activeStyle: 'left_group_active',
  defaultDisplayIcon: '011'
}, {
  name: _l('树形列表'),
  value: 3,
  style: 'left_tree',
  activeStyle: 'left_tree_active',
  defaultDisplayIcon: '100'
}, {
  name: _l('卡片'),
  value: 2,
  style: 'card',
  activeStyle: 'card_active',
  defaultDisplayIcon: '011'
}];

export default function AppNavStyle(props) {
  const { type, data, onChangeApp } = props;
  const { projectId, id } = data;
  const navList = type === 'pcNaviStyle' ? pcNavList : mobileNavList;
  const naviStyle = data[type];

  const handleEditAppINfo = item => {
    const data = { [type]: item.value }
    if (item.defaultDisplayIcon) {
      data.displayIcon = item.defaultDisplayIcon;
    }
    onChangeApp(data);
    // homeApp.editAppInfo({
    //   projectId,
    //   appId: id,
    //   [type]: value
    // }).then(res => {});
  }

  return (
    <div className="AppNavStyleWrap">
      {/*<div className="mBottom20">{_l('设置的导航方式对所有应用成员生效')}</div>*/}
      <div className="flexRow valignWrapper">
        {
          navList.map(item => (
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
              <div className={cx('navImg', type, naviStyle === item.value ? item.activeStyle : item.style)}></div>
              <span className={cx({ ThemeColor: naviStyle === item.value })}>{item.name}</span>
            </div>
          ))
        }
      </div>
    </div>
  );
}
