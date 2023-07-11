import React, { Component, Fragment } from 'react';
import Config from '../config';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import GroupsList from './GroupList';
import OthersList from './OthersList';
import MemberList from './MemberList';
import './index.less';

const routeList = [
  {
    routeType: 'groups',
    tabName: _l('群组管理'),
  },
  {
    routeType: 'others',
    tabName: _l('外协人员'),
  },
];

export default class GroupDept extends Component {
  constructor() {
    super();
    Config.setPageTitle(_l('群组与外协'));
    this.state = {
      activeTab: 'groups',
      level: 'index', // index | member
      name: '',
      groupId: ''
    };
  }

  handleChangeTab(item) {
    this.setState({
      activeTab: item.routeType,
    });
  }

  setLevel(level, name = '', groupId = '') {
    this.setState({ level, name, groupId });
  }

  render() {
    const { activeTab, level, name, groupId } = this.state;
    return (
      <div id="groupDept" className="orgManagementWrap">
        <div className="orgManagementHeader">
          {level === 'index' ? (
            <div className="tabBox">
              {routeList.map(item => {
                return (
                  <div
                    className={cx('tabItem', {active: item.routeType === activeTab })}
                    onClick={this.handleChangeTab.bind(this, item)}>
                    {item.tabName}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className='subTabBox'>
              <Icon
                icon="backspace"
                className="Hand mRight18 TxtMiddle Font24 adminHeaderIconColor"
                onClick={() => this.setLevel('index')}></Icon>
              <span className="Font17 Bold">{_l('成员管理 - %0', name)}</span>
            </div>
          )}
        </div>
        <div className="groupContent">
          {level === 'index' ? (
            <Fragment>{activeTab === 'groups' ? <GroupsList setLevel={this.setLevel.bind(this)} /> : <OthersList />}</Fragment>
          ) : (
            <MemberList groupId={groupId} />
          )}
        </div>
      </div>
    );
  }
}
