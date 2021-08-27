import React from 'react';
import classNames from 'classnames';
import { Route } from 'react-router-dom';

import { Button, Icon } from 'ming-ui';
import Link from 'src/router/Link.jsx';

import RoleAuthCommon from './common/common';
import RoleList from './roleList';
import RoleDetail from './roleDetail';
import RoleLog from './roleLog';

import CreateRole from './createEditRole';
import ApplyRole from './applyForRole';
import Config from '../config'
import { navigateTo } from 'src/router/navigateTo';

import './common/style.less';

export default class RoleAuth extends React.Component {
  state = {
    count: 0,
    isSuperAdmin: false,

    showCreateRole: false,
    showApplyForRole: false,
    detailTitle: ''
  };

  componentWillMount() {
    const {
      match: { params },
    } = this.props;

    this.getCount();

    RoleAuthCommon.checkIsSuperAdmin(params.projectId).then(isSuperAdmin => {
      this.setState({
        isSuperAdmin,
      });
    });
  }

  getCount() {
    const {
      match: { params },
    } = this.props;
    RoleAuthCommon.getUnauditedCount(params.projectId).then(count => {
      this.setState({
        count,
      });
    });
  }

  setDetailTitle(detailTitle) {
    this.setState({ detailTitle })
  }

  renderMenu() {
    const {
      match: { params },
    } = this.props;
    const projectId = params.projectId;
    const roleId = params.roleId
    const { count } = this.state;
    const routeList = [
      {
        routeType: 'rolelist',
        tabName: _l('权限管理'),
        pageTitle: _l('权限管理'),
      },
      {
        routeType: 'rolelog',
        tabName: _l('日志'),
        pageTitle: _l('权限管理'),
      },
    ];

    if(roleId) {
      return (
        <div className="roleAuthHeader">
          <div className="detailTitle">
            <Icon
              icon="backspace"
              className="Hand mRight18 TxtMiddle Font24 adminHeaderIconColor"
              onClick={() => navigateTo('/admin/rolelist/' + projectId)}></Icon>
            <span className="Font17 Bold">{this.state.detailTitle}</span>
          </div>
        </div>
      )
    }

    return (
      <div className="roleAuthHeader">
        <ul className="menuTab">
          {_.map(routeList, ({ routeType, tabName, pageTitle }) => {
            Config.setPageTitle(pageTitle);
            return (
              <Route
                key={routeType}
                path={`/admin/${routeType}/:projectId`}
                children={({ match }) => {
                  return (
                    <li className={classNames({ 'menuTab-active': !!match })}>
                      <Link to={`/admin/${routeType}/${projectId}`}>{tabName}</Link>
                    </li>
                  );
                }}
              />
            );
          })}
        </ul>
        <Route
          path={'/admin/rolelist/:projectId'}
          render={({ match }) => {
            if (!this.state.isSuperAdmin) return null;
            return (
              <div className="roleListAction">
                <Button
                  type="link"
                  className="roleApplyRecord"
                  onClick={e => {
                    this.setState({ showApplyForRole: true });
                  }}>
                  {_l('申请角色请求')}
                  {count ? <span className="applyRecordCount">{count}</span> : null}
                </Button>

                {md.global.Account.projects.find(o => o.projectId === params.projectId).isHrVisible && (
                  <button
                    type="button"
                    className="ming Button Button--primary roleCreateBtn"
                    onClick={e => {
                      this.setState({ showCreateRole: true });
                    }}>
                    {_l('创建角色权限')}
                  </button>
                )}

                {this.state.showCreateRole ? (
                  <CreateRole
                    projectId={params.projectId}
                    visible={this.state.showCreateRole}
                    type={CreateRole.TYPES.CREATE}
                    onOk={res => {
                      if (res) {
                        alert(_l('创建成功'));
                        this.setState({ showCreateRole: false });
                        if (this.roleList) {
                          this.roleList.fetchRoles(true);
                        }
                      } else {
                        alert(_l('创建失败'), 2);
                      }
                    }}
                    onClose={() => {
                      this.setState({ showCreateRole: false });
                    }}
                  />
                ) : null}
                {this.state.showApplyForRole ? (
                  <ApplyRole
                    projectId={params.projectId}
                    visible={this.state.showApplyForRole}
                    onClose={() => {
                      this.setState({ showApplyForRole: false });
                      this.getCount();
                    }}
                    onOk={() => {
                      this.setState({ showApplyForRole: false });
                      this.getCount();
                    }}
                  />
                ) : null}
              </div>
            );
          }}
        />
      </div>
    );
  }

  render() {
    return (
      <div className="roleAuthContainer">
        {this.renderMenu()}
        <div className="roleAuthContent">
          <Route
            path={'/admin/rolelist/:projectId'}
            exact
            render={({ match: { params } }) => {
              return (
                <RoleList
                  {...params}
                  manualRef={comp => {
                    this.roleList = comp;
                  }}
                />
              );
            }}
          />
          <Route
            path={'/admin/rolelist/:projectId/:roleId'}
            exact
            render={({ match: { params } }) => {
              return <RoleDetail {...params} setDetailTitle={this.setDetailTitle.bind(this)}/>;
            }}
          />
          <Route
            path={'/admin/rolelog/:projectId'}
            exact
            render={({ match: { params } }) => {
              return <RoleLog {...params} />;
            }}
          />
        </div>
      </div>
    );
  }
}
