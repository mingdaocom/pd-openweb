import React, { Component } from 'react';
import Config from '../config';
import cx from 'classnames';
import OtherTools from './OtherTools';
import './index.less';

const toolTabList = [
  {
    tabType: 'otherTools',
    tabName: _l('管理工具'),
  },
];

export default class AdminTools extends Component {
  constructor(props) {
    super(props);
    Config.setPageTitle(_l('管理工具'));
    this.state = {
      activeTab: 'otherTools',
    };
  }

  // tab切换
  changeTab = item => {
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
                <div key={item.tabType} className="adminToolTab" onClick={() => this.changeTab(item)}>
                  {item.tabName}
                </div>
              );
            })}
          </div>
        </div>
        <div className="adminToolsContent">{activeTab === 'otherTools' && <OtherTools />}</div>
      </div>
    );
  }
}
