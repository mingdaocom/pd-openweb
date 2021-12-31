import React, { Component } from 'react';
import Config from '../config';
import cx from 'classnames';
import OtherTools from './OtherTools';
import LoginLog from './Loginlog';
import './index.less';

const toolTabList = [
  {
    tabType: 'otherTools',
    tabName: _l('工具'),
  },
  {
    tabType: 'loginLog',
    tabName: _l('登录日志'),
  },
];

export default class AdminTools extends Component {
  constructor(props) {
    super(props);
    Config.setPageTitle(_l('管理工具'));
    this.state = {
      activeTab: localStorage.getItem('userloginLogTab') ? localStorage.getItem('userloginLogTab') : 'otherTools',
    };
  }
  componentWillUnmount(){
    localStorage.removeItem('userloginLogTab')
  }
  // tab切换
  changeTab = item => {
    localStorage.setItem('userloginLogTab', item.tabType);
    this.setState({ activeTab: item.tabType });
  };
  render() {
    let { activeTab } = this.state;
    return (
      <div className="adminToolsBox">
        <div className="adminToolsHeader">
          <div className="tabBox">
            {toolTabList.map(item => {
              return (
                <div
                  key={item.tabType}
                  className={cx('adminToolTab', { active: item.tabType === activeTab })}
                  onClick={() => this.changeTab(item)}
                >
                  {item.tabName}
                </div>
              );
            })}
          </div>
        </div>
        <div className="adminToolsContent">
          {activeTab === 'otherTools' && <OtherTools />}
          {activeTab === 'loginLog' && <LoginLog />}
        </div>
      </div>
    );
  }
}
