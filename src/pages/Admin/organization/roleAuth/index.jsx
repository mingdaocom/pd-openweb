import React from 'react';
import { Button, Checkbox, Icon, Tooltip } from 'ming-ui';
import './index.less';
import _ from 'lodash';
import RoleList from './roleList';
import CreateEditRole from './createEditRole';
import ApplyRole from './applyForRole';
import projectSettingAjax from 'src/api/projectSetting';
import Config from '../../config';
import roleApi from 'src/api/role';

export default class RoleAuth extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSuperAdmin: false,
      allowApplyManage: false,
      applyCount: 0,
      showApplyForRole: false,
      showCreateRole: false,
    };
    Config.setPageTitle(_l('管理员'));
  }

  componentWillMount() {
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
    const projectId = _.get(this.props, 'match.params.projectId');
    const { isSuperAdmin, applyCount, allowApplyManage } = this.state;

    if (!isSuperAdmin) return null;

    return (
      <div className="roleListAction flexRow alignItemsCenter Normal Font13">
        <Checkbox className="LineHeight36 mRight5" checked={allowApplyManage} onClick={this.allowApplyAdmin}>
          {_l('允许申请管理员')}
        </Checkbox>
        <Tooltip text={_l('勾选后，组织下所有人都可查看组织中的管理员角色（除超级管理员外），并申请加入')}>
          <Icon icon="workflow_help" className="Font16 Gray_9e" />
        </Tooltip>
        <div className="Hand Gray_75 bold mRight32 mLeft32" onClick={() => this.setState({ showApplyForRole: true })}>
          {_l('申请角色请求')}
          {applyCount ? <span className="applyRecordCount">{applyCount}</span> : null}
        </div>
        <Button type="primary" className="addRoleBtn" radius onClick={() => this.setState({ showCreateRole: true })}>
          <Icon icon="add" />
          <span className="mLeft4">{_l('角色')}</span>
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
    const { isSuperAdmin } = this.state;

    return (
      <div className="orgManagementWrap">
        <div className="orgManagementHeader">
          <div>{isSuperAdmin ? _l('管理员') : _l('我的角色')}</div>
          {this.renderMenu()}
        </div>
        <div className='explainCon'>
          {_l(
            '超级管理员可创建和分配角色权限，管理角色下的成员。其他管理员只能看到自己加入的角色或添加同角色成员（按配置）',
          )}
        </div>
        <div className="orgManagementContent roleAuth">
          <RoleList
            projectId={_.get(this.props, 'match.params.projectId')}
            authority={this.props.authority}
            manualRef={comp => {
              this.roleList = comp;
            }}
          />
        </div>
      </div>
    );
  }
}
