import React, { Component } from 'react';
import { Icon } from 'ming-ui';
import Config from '../../config';
import GroupsList from './GroupList';
import MemberList from './MemberList';
import './index.less';

export default class GroupDept extends Component {
  constructor() {
    super();
    Config.setPageTitle(_l('群组'));
    this.state = {
      level: 'index', // index | member
      name: '',
      groupId: '',
    };
  }

  setLevel(level, name = '', groupId = '') {
    this.setState({ level, name, groupId });
  }

  render() {
    const { level, name, groupId } = this.state;
    return (
      <div id="groupDept" className="orgManagementWrap">
        <div className="orgManagementHeader">
          {level === 'index' ? (
            _l('群组')
          ) : (
            <div className="subTabBox">
              <Icon
                icon="backspace"
                className="Hand mRight18 TxtMiddle Font24 adminHeaderIconColor"
                onClick={() => this.setLevel('index')}
              ></Icon>
              <span className="Font17 Bold">{_l('成员管理 - %0', name)}</span>
            </div>
          )}
        </div>
        <div className="groupContent">
          {level === 'index' ? <GroupsList setLevel={this.setLevel.bind(this)} /> : <MemberList groupId={groupId} />}
        </div>
      </div>
    );
  }
}
