import React from 'react';
import classNames from 'classnames';
import { Route } from 'react-router-dom';
import { Button, Icon, Checkbox } from 'ming-ui';
import { Link } from 'react-router-dom';
import RoleAuthCommon from './common/common';
import RoleList from './roleList';
import RoleDetail from './roleDetail';
import RoleLog from './roleLog';
import CreateRole from './createEditRole';
import ApplyRole from './applyForRole';
import Config from '../config';
import { navigateTo } from 'src/router/navigateTo';
import projectSettingAjax from 'src/api/projectSetting';
import './common/style.less';
import _ from 'lodash';

export default class RoleAuth extends React.Component {
  state = {
    count: 0,
    isSuperAdmin: false,

    showCreateRole: false,
    showApplyForRole: false,
    detailTitle: '',
    allowApplyManage: false,
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
    this.getAllowApplyManageRole(params);
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

  getAllowApplyManageRole = params => {
    projectSettingAjax.getAllowApplyManageRole({ projectId: params.projectId }).then(res => {
      this.setState({ allowApplyManage: res });
    });
  };

  setDetailTitle(detailTitle) {
    this.setState({ detailTitle });
  }

  renderMenu() {
    const {
      match: { params },
    } = this.props;
    const projectId = params.projectId;
    const roleId = params.roleId;
    const { count, allowApplyManage } = this.state;
    const routeList = [
      {
        routeType: 'sysroles',
        tabName: _l('管理配置角色'),
        pageTitle: _l('管理员'),
      },
      {
        routeType: 'rolelog',
        tabName: _l('日志'),
        pageTitle: _l('管理员'),
      },
    ];

    if (roleId) {
      return (
        <div className="roleAuthHeader">
          <div className="detailTitle">
            <Icon
              icon="backspace"
              className="Hand mRight18 TxtMiddle Font24 adminHeaderIconColor"
              onClick={() => navigateTo('/admin/sysroles/' + projectId)}
            ></Icon>
            <span className="Font17 Bold">{this.state.detailTitle}</span>
          </div>
        </div>
      );
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
          path={'/admin/sysroles/:projectId'}
          render={({ match }) => {
            if (!this.state.isSuperAdmin) return null;
            return (
              <div className="roleListAction flexRow">
                <Checkbox
                  className="mRight40 lineHeight36 "
                  checked={allowApplyManage}
                  onClick={val => {
                    this.setState({ allowApplyManage: !val }, () => {
                      projectSettingAjax.setAllowApplyManageRole({
                        projectId,
                        allowApplyManageRole: !val,
                      }).then(res => {
                        if (res) {
                          alert(_l('设置成功'));
                        } else {
                          alert(_l('设置失败'), 2);
                        }
                      });
                    });
                  }}
                >
                  {_l('允许申请管理员')}
                </Checkbox>
                <Button
                  type="link"
                  className="roleApplyRecord"
                  onClick={e => {
                    this.setState({ showApplyForRole: true });
                  }}
                >
                  {_l('申请角色请求')}
                  {count ? <span className="applyRecordCount">{count}</span> : null}
                </Button>

                {/*md.global.Account.projects.find(o => o.projectId === params.projectId).isHrVisible && (
                  <button
                    type="button"
                    className="ming Button Button--primary roleCreateBtn"
                    onClick={e => {
                      this.setState({ showCreateRole: true });
                    }}
                  >
                    {_l('创建角色权限')}
                  </button>
                )*/}

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
            path={'/admin/sysroles/:projectId'}
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
            path={'/admin/sysroles/:projectId/:roleId'}
            exact
            render={({ match: { params } }) => {
              return <RoleDetail {...params} setDetailTitle={this.setDetailTitle.bind(this)} />;
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
