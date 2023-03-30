import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import RoleController from 'src/api/role';
import { Dialog, Button } from 'ming-ui';
import RoleAuthCommon from '../common/common';
import { navigateTo } from 'src/router/navigateTo';

import UserList from './userList';
import PermissionsList from './permissionList';

import EditRoleDialog from '../createEditRole';
import { Input } from 'antd';

import dialogSelectUser from 'src/components/dialogSelectUser/dialogSelectUser';
import './style.less';
import _ from 'lodash';
const { Search } = Input;
class RoleDetail extends React.Component {
  static propTypes = {
    projectId: PropTypes.string,
    roleId: PropTypes.string,
    isApply: PropTypes.bool,
  };

  static defaultProps = {
    isApply: false,
  };

  constructor() {
    super();

    this.state = {
      tab: '',
      showEdit: false,

      roleName: '',
      addAuth: false,
      userOpAuth: false,
      editOpAuth: false,
      deleteOpAuth: false,
      isSuperAdmin: false,
      permissionTypes: [],
      hasMember: undefined,
      keywords: '',
    };

    this.getRolePermission = this.getRolePermission.bind(this);
  }

  componentWillMount() {
    this.getRolePermission();
  }

  addMemberHander = e => {
    const { projectId, roleId } = this.props;
    e.stopPropagation();
    dialogSelectUser({
      sourceId: 0,
      fromType: 0,
      fromAdmin: true,
      SelectUserSettings: {
        filterAll: true, // 过滤全部
        filterFriend: true, // 是否过滤好友
        filterOthers: true,
        filterOtherProject: true,
        projectId,
        inProject: true,
        callback: users => {
          const accountIds = _.map(users, user => user.accountId);
          RoleController.addUserToRole({
            projectId,
            roleId,
            accountIds,
          }).then(data => {
            if (data) {
              alert(_l('操作成功'));
              if (this.userList && this.userList.getUserList) {
                this.userList.getUserList();
              }
            } else {
              alert(_l('操作失败'), 2);
            }
          });
        },
      },
    });
  };

  getRolePermission() {
    const { projectId, roleId } = this.props;

    return RoleController.getRolePermisson({
      projectId,
      roleId,
    }).then(roleDetail => {
      RoleAuthCommon.formatRoleAuth(roleDetail);
      const { roleName, auth, addAuth, isSuperAdmin, permissionTypes } = roleDetail;
      this.props.setDetailTitle(roleName);
      this.setState({
        roleName,
        addAuth,
        userOpAuth: auth.add,
        editOpAuth: auth.edit,
        deleteOpAuth: auth.delete,
        isSuperAdmin,
        permissionTypes,
      });
    });
  }

  render() {
    const { projectId, roleId, isApply } = this.props;
    const { hasMember, userOpAuth, editOpAuth, deleteOpAuth, isSuperAdmin, addAuth, permissionTypes, tab, keywords } =
      this.state;
    const isHrVisible = md.global.Account.projects.find(o => o.projectId === projectId).isHrVisible;

    const path = isApply ? '/admin/index/' + projectId : '/admin/sysroles/' + projectId;
    return (
      <div className="roleAuthDetailContainer">
        <div className="clearfix pTop20 pBottom20">
          {isApply ? (
            <div className="Left">
              <Button
                type="ghost"
                size="small"
                className="mLeft20"
                onClick={e => {
                  RoleController.applyRole({
                    projectId: projectId,
                    roleId,
                  }).then(function (data) {
                    if (data === 1) {
                      alert(_l('申请成功'));
                    } else if (data === -1) {
                      alert(_l('不允许申请管理员'), 3);
                    } else if (data === 0) {
                      alert(_l('申请失败'), 2);
                    }
                  });
                }}
              >
                {_l('申请该角色权限')}
              </Button>
            </div>
          ) : (
            <div className="Left">
              {!md.global.Config.IsLocal && isHrVisible && deleteOpAuth && hasMember === false ? (
                <Button
                  type="danger"
                  size="small"
                  onClick={() => {
                    Dialog.confirm({
                      title: _l('您确定删除该角色？'),
                      description: '',
                      onOk: () => {
                        RoleController.removeRole({
                          projectId: projectId,
                          roleId,
                        }).then(data => {
                          const { message, deleteSuccess } = data;
                          if (deleteSuccess) {
                            alert(_l('操作成功'));
                          } else {
                            alert(message || _l('操作失败'), 2);
                          }
                          navigateTo('/admin/sysroles/' + projectId);
                        });
                      },
                    });
                  }}
                >
                  {_l('删除')}
                </Button>
              ) : null}
              {!md.global.Config.IsLocal && isHrVisible && editOpAuth ? (
                <Button
                  type="ghost"
                  size="small"
                  className="mLeft20"
                  onClick={e => {
                    e.stopPropagation();
                    this.setState({ showEdit: true });
                  }}
                >
                  {_l('编辑角色权限')}
                </Button>
              ) : null}
              <Button
                type="primary"
                disabled={!userOpAuth}
                size="small"
                className="mLeft20"
                onClick={this.addMemberHander}
              >
                {_l('添加成员')}
              </Button>
            </div>
          )}
          <div className="Right" style={{ width: '192px' }}>
            <Search allowClear placeholder={_l('搜索')} onSearch={keywords => this.setState({ keywords })} />
          </div>
        </div>
        {this.state.showEdit ? (
          <EditRoleDialog
            type={EditRoleDialog.TYPES.EDIT}
            visible
            roleId={roleId}
            projectId={projectId}
            onOk={res => {
              if (res) {
                alert(_l('修改成功'));
                this.setState({
                  showEdit: false,
                });
                // fetch permissions
                this.getRolePermission();
              } else {
                alert(_l('修改失败'), 2);
              }
            }}
            onClose={() => {
              this.setState({
                showEdit: false,
              });
            }}
          />
        ) : null}
        <div className="tabList clearfix">
          <span
            className={classNames('tabItem', { 'menuTab-active': tab === 'users' || tab === '' })}
            onClick={() => {
              this.setState({
                tab: 'users',
              });
            }}
          >
            {_l('成员列表')}
          </span>
          <span
            className={classNames('tabItem', { 'menuTab-active': tab === 'permissions' })}
            onClick={() => {
              this.setState({
                tab: 'permissions',
              });
            }}
          >
            {_l('权限详情')}
          </span>
          {addAuth && tab === 'permissions' ? (
            <span className="Right LineHeight30 Gray_9e">{_l('允许角色成员授予他人拥有相同权限（已开启）')}</span>
          ) : null}
        </div>
        {tab !== 'permissions' ? (
          <UserList
            userOpAuth={userOpAuth}
            isSuperAdmin={isSuperAdmin}
            isApply={isApply}
            projectId={projectId}
            roleId={roleId}
            keywords={keywords}
            manualDef={el => (this.userList = el)}
            callback={hasMember => {
              this.setState({ hasMember });
            }}
          />
        ) : (
          <PermissionsList permissionTypes={permissionTypes} />
        )}
      </div>
    );
  }
}

export default RoleDetail;
