import React from 'react';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Button, Checkbox, Tooltip } from 'ming-ui/antd-components';
import projectSettingAjax from 'src/api/projectSetting';
import roleApi from 'src/api/role';
import Config from '../../config';
import ApplyRole from './applyForRole';
import CreateEditRole from './createEditRole';
import DefaultFeatureDrawer from './DefaultFeatureDrawer';
import RoleList from './roleList';
import './index.less';

export default class RoleAuth extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSuperAdmin: false,
      allowApplyManage: false,
      applyCount: 0,
      showApplyForRole: false,
      showCreateRole: false,
      showDefaultFeatureDrawer: false,
    };
    Config.setPageTitle(_l('组织 - 权限管理'));
  }

  componentDidMount() {
    const projectId = _.get(this.props, 'match.params.projectId');
    roleApi.isSuperAdmin({ projectId }).then(isSuperAdmin => {
      this.setState({ isSuperAdmin });

      if (isSuperAdmin) {
        this.getApplyCount();
        this.getAllowApplyManageRole(projectId);
      }
    });
  }

  getApplyCount() {
    const projectId = _.get(this.props, 'match.params.projectId');
    roleApi.getUnauditedUserCount({ projectId }).then(applyCount => {
      this.setState({ applyCount });
    });
  }

  getAllowApplyManageRole = projectId => {
    projectSettingAjax.getAllowApplyManageRole({ projectId }).then(res => {
      this.setState({ allowApplyManage: res });
    });
  };

  // 允许申请权限组
  allowApplyPermission = checked => {
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
    const projectId = _.get(this.props, 'match.params.projectId');
    const { isSuperAdmin, applyCount, allowApplyManage } = this.state;

    if (!isSuperAdmin) return null;

    return (
      <div className="roleListAction flexRow alignItemsCenter Normal Font13">
        <Checkbox
          className="LineHeight36 mRight5"
          checked={allowApplyManage}
          onChange={event => this.allowApplyPermission(!event.target.checked, undefined, event)}
        >
          {_l('允许申请权限')}
        </Checkbox>
        <Tooltip title={_l('勾选后，组织下所有人都可查看权限组（超级管理员除外），并申请加入')}>
          <Icon icon="help" className="Font16 textTertiary" />
        </Tooltip>
        <div
          className="Hand textSecondary bold mRight32 mLeft32"
          onClick={() => this.setState({ showApplyForRole: true })}
        >
          {_l('权限申请')}
          {applyCount ? <span className="applyRecordCount">{applyCount}</span> : null}
        </div>
        <Button
          type="primary"
          shape="round"
          icon={<Icon icon="add" />}
          onClick={() => this.setState({ showCreateRole: true })}
        >
          {_l('权限组')}
        </Button>

        {this.state.showCreateRole && (
          <CreateEditRole
            projectId={projectId}
            onClose={() => this.setState({ showCreateRole: false })}
            onSaveSuccess={() => {
              if (this.roleList) {
                this.roleList.getMyRoles(true);
              }
            }}
          />
        )}
        {this.state.showApplyForRole ? (
          <ApplyRole
            projectId={projectId}
            visible={this.state.showApplyForRole}
            onClose={() => {
              this.setState({ showApplyForRole: false });
              this.getApplyCount();
            }}
            onOk={() => {
              this.setState({ showApplyForRole: false });
              this.getApplyCount();
            }}
          />
        ) : null}
      </div>
    );
  }

  render() {
    const { isSuperAdmin, showDefaultFeatureDrawer } = this.state;
    const projectId = _.get(this.props, 'match.params.projectId');

    return (
      <div className="orgManagementWrap">
        <div className="orgManagementHeader">
          <div>{isSuperAdmin ? _l('权限管理') : _l('我的权限组')}</div>
          {this.renderMenu()}
        </div>
        <div className="explainCon">
          {_l(
            '超级管理员可创建权限组、分配权限并管理权限组成员。其他管理员只能看到自己加入的权限组，或按配置添加同权限组成员。',
          )}
        </div>
        <div className="orgManagementContent roleAuth">
          {isSuperAdmin && (
            <div className="defaultFeatureCard flexRow alignItemsCenter">
              <div className="flex">
                <div className="bold mBottom6 Font15">{_l('全员默认功能')}</div>
                <div className="textTertiary">
                  {_l('配置全员默认拥有的功能权限。关闭后，该功能将仅对特定【权限组】的授权成员开放。')}
                </div>
              </div>
              <span
                className="colorPrimary hoverColorPrimaryDark bold Font14 pointer mLeft24"
                onClick={() => this.setState({ showDefaultFeatureDrawer: true })}
              >
                {_l('设置')}
              </span>
            </div>
          )}
          <RoleList
            projectId={projectId}
            authority={this.props.authority}
            manualRef={comp => {
              this.roleList = comp;
            }}
          />
        </div>
        {showDefaultFeatureDrawer && (
          <DefaultFeatureDrawer
            projectId={projectId}
            onClose={() => this.setState({ showDefaultFeatureDrawer: false })}
          />
        )}
      </div>
    );
  }
}
