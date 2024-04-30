import React from 'react';
import { Route } from 'react-router-dom';
import { Button, Icon, Checkbox } from 'ming-ui';
import RoleAuthCommon from './common/common';
import RoleList from './roleList';
import RoleDetail from './roleDetail';
import CreateRole from './createEditRole';
import ApplyRole from './applyForRole';
import { navigateTo } from 'src/router/navigateTo';
import projectSettingAjax from 'src/api/projectSetting';
import Config from '../../config';

import './index.less';
import _ from 'lodash';
import { getCurrentProject } from 'src/util';

export default class RoleAuth extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      showCreateRole: false,
      showApplyForRole: false,
      detailTitle: '',
      allowApplyManage: false,
      isSuperAdmin: false,
    };
    Config.setPageTitle(_l('管理员'));
  }

  componentWillMount() {
    const {
      match: { params },
    } = this.props;
    RoleAuthCommon.checkIsSuperAdmin(params.projectId).then(isSuperAdmin => {
      this.setState({
        isSuperAdmin,
      });

      if (isSuperAdmin) {
        this.getCount();
        this.getAllowApplyManageRole(params);
      }
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

  getAllowApplyManageRole = params => {
    projectSettingAjax.getAllowApplyManageRole({ projectId: params.projectId }).then(res => {
      this.setState({ allowApplyManage: res });
    });
  };

  setDetailTitle(detailTitle) {
    this.setState({ detailTitle });
  }

  // 允许申请管理员
  allowApplyAdmin = checked => {
    this.setState({ allowApplyManage: !checked }, () => {
      projectSettingAjax
        .setAllowApplyManageRole({
          projectId: _.get(this.props, 'match.params.projectId'),
          allowApplyManageRole: !checked,
        })
        .then(res => {
          if (res) {
            alert(_l('设置成功'));
          } else {
            alert(_l('设置失败'), 2);
          }
        });
    });
  };

  renderMenu() {
    const {
      match: { params },
    } = this.props;
    const projectId = params.projectId;
    const roleId = params.roleId;
    const { count, allowApplyManage } = this.state;

    if (roleId) {
      return (
        <div className="roleAuthHeader">
          <div className="flexRow alignItemsCenter">
            <Icon
              icon="backspace"
              className="Hand mRight10 TxtMiddle Font22 ThemeHoverColor3"
              onClick={() => navigateTo('/admin/sysroles/' + projectId)}
            ></Icon>
            <span className="Font17 Bold">{this.state.detailTitle}</span>
          </div>
        </div>
      );
    }

    if (!this.state.isSuperAdmin) return null;

    return (
      <div className="roleListAction flexRow alignItemsCenter Normal Font13">
        <Checkbox className="LineHeight36" checked={allowApplyManage} onClick={this.allowApplyAdmin}>
          {_l('允许申请管理员')}
        </Checkbox>
        <div className="Hand Gray_75 bold mRight32 mLeft32" onClick={() => this.setState({ showApplyForRole: true })}>
          {_l('申请角色请求')}
          {count ? <span className="applyRecordCount">{count}</span> : null}
        </div>

        {getCurrentProject(params.projectId, true).isHrVisible && !md.global.Config.IsLocal && (
          <Button
            type="primary"
            radius
            onClick={e => {
              this.setState({ showCreateRole: true });
            }}
          >
            {_l('角色')}
          </Button>
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
  }

  render() {
    const {
      match: { params },
    } = this.props;
    const { roleId } = params || {};
    const { isSuperAdmin } = this.state;

    return (
      <div className="orgManagementWrap">
        <div className="orgManagementHeader">
          {!roleId && <div>{isSuperAdmin ? _l('配置管理角色') : _l('我的角色')}</div>}
          {this.renderMenu()}
        </div>
        <div className="orgManagementContent">
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
        </div>
      </div>
    );
  }
}
