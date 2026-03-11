import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import cx from 'classnames';
import _ from 'lodash';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import { navigateTo } from 'src/router/navigateTo';
import Config from '../../config';
import CertInfo from './component/CertInfo';
import ProjectInfo from './component/ProjectInfo';

const TABS = [
  { key: 'sysinfo', label: _l('组织信息'), path: '/admin/sysinfo/:projectId' },
  { key: 'certinfo', label: _l('认证信息'), path: '/admin/certinfo/:projectId' },
];

const Comp = { sysinfo: ProjectInfo, certinfo: CertInfo };

export default class SystemSetting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: _.isArray(Config.params) && Config.params.length ? Config.params[1] : 'sysinfo',
      showHeader: true,
    };
  }

  changeTab = key => {
    const projectId = Config.projectId;
    this.setState({ currentTab: key });
    navigateTo(`/admin/${key}/${projectId}`);
  };

  render() {
    const { currentTab, showHeader } = this.state;

    return (
      <div className="orgManagementWrap">
        <AdminTitle prefix={_l(`${(_.find(TABS, v => v.key === currentTab) || {}).label || '组织信息'}`)} />
        {showHeader && (
          <div className="orgManagementHeader">
            <div className="tabBox">
              {TABS.map(item => {
                return (
                  <span
                    key={item.key}
                    className={cx('tabItem Hand', { active: currentTab === item.key })}
                    onClick={() => this.changeTab(item.key)}
                  >
                    {item.key === 'certinfo' && (window.platformENV.isOverseas || window.platformENV.isLocal)
                      ? _l('短信签名')
                      : item.label}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className={cx('flexColumn', { orgManagementContent: showHeader, orgManagementWrap: !showHeader })}>
          {TABS.map(item => {
            const Component = Comp[item.key];
            return (
              <Route
                key={item.path}
                path={item.path}
                render={({ match: { params } }) => (
                  <Component
                    ref={ele => (this.com = ele)}
                    {...params}
                    changeTab={this.changeTab}
                    changeShowHeader={visible => this.setState({ showHeader: visible })}
                  />
                )}
              />
            );
          })}
        </div>
      </div>
    );
  }
}
