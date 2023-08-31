import React, { Component } from 'react';
import Config from '../config';
import OtherTools from './OtherTools';
import './index.less';

export default class AdminTools extends Component {
  constructor(props) {
    super(props);
    Config.setPageTitle(_l('管理工具'));
    this.state = {
      activeTab: 'otherTools',
    };
  }

  render() {
    let { activeTab } = this.state;
    return (
      <div className="orgManagementWrap adminToolsBox">
        <div className="orgManagementHeader">
          {_l('管理工具')}
        </div>
        <div className="adminToolsContent">{activeTab === 'otherTools' && <OtherTools />}</div>
      </div>
    );
  }
}
