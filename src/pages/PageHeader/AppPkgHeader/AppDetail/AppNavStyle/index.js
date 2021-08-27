import React, { useState, useEffect } from 'react';
import { Icon } from 'ming-ui';
import cx from 'classnames';
import homeApp from 'src/api/homeApp';
import './index.less';

const navList = [{
  name: _l('列表'),
  value: 0,
  style: 'list',
  activeStyle: 'list_active',
}, {
  name: _l('九宫格'),
  value: 1,
  style: 'sudoku',
  activeStyle: 'sudoku_active',
}, {
  name: _l('底部导航'),
  value: 2,
  style: 'nav',
  activeStyle: 'nav_active',
}];

export default function AppNavStyle(props) {
  const { data, onChangeData } = props;
  const { appNaviStyle, projectId, id } = data;

  const handleEditAppINfo = value => {
    onChangeData({
      ...data,
      appNaviStyle: value
    });
    homeApp.editAppInfo({
      projectId,
      appId: id,
      appNaviStyle: value
    }).then(res => {});
  }

  return (
    <div className="AppNavStyleWrap">
      <div className="mBottom20">{_l('设置的导航方式对所有应用成员生效')}</div>
      <div className="content flexRow valignWrapper">
        {
          navList.map(item => (
            <div
              key={item.value}
              className="flexColumn valignWrapper Relative"
              onClick={() => {
                handleEditAppINfo(item.value);
              }}
            >
              {appNaviStyle === item.value && (
                <div className="flexRow valignWrapper activeIcon">
                  <Icon icon="done"/>
                </div>
              )}
              <div className={cx('img', appNaviStyle === item.value ? item.activeStyle : item.style)}></div>
              <span>{item.name}</span>
            </div>
          ))
        }
      </div>
    </div>
  );
}
