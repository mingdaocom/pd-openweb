import React, { Component } from 'react';
import cx from 'classnames';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import OutsourcingList from './OutsourcingList.jsx';
import PortalList from './PortalList.jsx';

const routeList = [
  {
    routeType: 'portal',
    tabName: _l('外部门户'),
  },
  {
    routeType: 'outsourcing',
    tabName: _l('外协'),
  },
];

export default class Portal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: 'portal',
    };
  }
  render() {
    const { currentTab } = this.state;
    const { projectId } = this.props.match.params;

    return (
      <div className="orgManagementWrap">
        <AdminTitle prefix={_l('外部门户')} />
        <div className="orgManagementHeader">
          <div className="tabBox">
            {routeList.map(item => (
              <span
                key={item.routeType}
                className={cx('tabItem Hand', { active: currentTab === item.routeType })}
                onClick={() => this.setState({ currentTab: item.routeType })}
              >
                {item.tabName}
              </span>
            ))}
          </div>
        </div>
        <div className="orgManagementContent">
          {currentTab === 'portal' ? <PortalList projectId={projectId} /> : <OutsourcingList />}
        </div>
      </div>
    );
  }
}
