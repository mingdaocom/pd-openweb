import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import 'dialogSelectUser';
import Confirm from 'confirm';
// import RoleAuthCommon from '../common/common';
import RoleController from 'src/api/role';
import { navigateTo } from 'src/router/navigateTo';
import cx from 'classnames';

import EditRoleDialog from '../createEditRole';
class RoleItem extends React.Component {
  constructor() {
    super();
    this.state = {
      showEdit: false,
      hasClick: false,
    };
  }

  render() {
    const { isHrVisible, role, projectId, isApply, callback } = this.props;
    // RoleAuthCommon.formatRoleAuth(role);
    const auth = role.auth;
    const clickHandler = type => {
      if (role.noAuth) return () => {};
      const _this = this;
      const cb = data => {
        if (data) {
          alert(_l('操作成功'));
          callback();
        } else {
          alert(_l('操作失败'), 2);
        }
      };
      if (type === 'addmember') {
        return e => {
          e.stopPropagation();
          $({}).dialogSelectUser({
            sourceId: 0,
            fromType: 0,
            showMoreInvite: false,
            SelectUserSettings: {
              filterAll: true, // 过滤全部
              filterFriend: true, // 是否过滤好友
              filterOthers: true,
              filterOtherProject: true,
              projectId,
              inProject: true,
              callback(users) {
                const accountIds = _.map(users, user => user.accountId);
                RoleController.addUserToRole({
                  projectId,
                  roleId: role.roleId,
                  accountIds,
                }).then(cb);
              },
            },
          });
        };
      } else if (type === 'delete') {
        return e => {
          e.stopPropagation();
          new Confirm(
            {
              content: '<span></span>',
              title: _l('您确定删除该角色？'),
            },
            function () {
              RoleController.removeRole({
                projectId,
                roleId: role.roleId,
              }).then(res => {
                const { message, deleteSuccess } = res;
                if (deleteSuccess) {
                  alert(_l('操作成功'));
                } else {
                  alert(message || _l('操作失败'), 2);
                }
              });
            },
          );
        };
      } else if (type === 'applyrole' && !this.state.hasClick) {
        return e => {
          e.stopPropagation();
          RoleController.applyRole({
            projectId: projectId,
            roleId: role.roleId,
          }).then(function (data) {
            if (data === 1) {
              _this.setState({ hasClick: true });
              alert(_l('申请成功'));
            } else if (data === -1) {
              alert(_l('不允许申请管理员'), 3);
            } else if (data === 0) {
              alert(_l('申请失败'), 2);
            }
          });
        };
      }
    };
    return (
      <tr
        className={classNames('roleItem', { 'Gray_9 disabled': !isApply && role.noAuth })}
        onClick={() => {
          if (!isApply) {
            navigateTo('/admin/sysroles/' + projectId + '/' + role.roleId);
          }
        }}
      >
        <td className={classNames('roleName overflow_ellipsis', { ThemeColor3: isApply || !role.noAuth })}>
          {role.roleName}
        </td>
        <td className="roleCount">{role.userCount}</td>
        <td className="roleAuth">
          {role.permissionTypes.length ? (
            _.map(role.permissionTypes, ({ isAdmin, typeName, typeId }) => (
              <span className="mRight30" key={typeId}>
                {_l(typeName)}
                <span className="Gray_9e mLeft5">({isAdmin ? _l('所有权限') : _l('部分权限')})</span>
              </span>
            ))
          ) : (
            <span className="Gray_9">{_l('暂无权限')}</span>
          )}
        </td>
        {isApply ? (
          <td className="roleOperation">
            {role.isJoined || role.noAuth ? null : (
              <span
                onClick={clickHandler('applyrole')}
                className={cx(this.state.hasClick ? 'Gray_bd' : 'ThemeColor3 adminHoverColor')}
              >
                {_l('申请该角色权限')}
              </span>
            )}
          </td>
        ) : (
          <td className={classNames('roleOperation', { ThemeColor3: !role.noAuth })}>
            <span className="adminHoverColor" onClick={clickHandler('addmember')}>
              {_l('添加成员')}
            </span>
            {isHrVisible && auth.edit ? (
              <span
                className="mLeft10 adminHoverColor"
                onClick={e => {
                  e.stopPropagation();
                  this.setState({ showEdit: true });
                }}
              >
                {_l('编辑角色权限')}
              </span>
            ) : null}
            {isHrVisible && auth.delete && role.userCount === 0 ? (
              <span className="adminHoverColor mLeft10" onClick={clickHandler('delete')}>
                {_l('删除')}
              </span>
            ) : null}
            {this.state.showEdit ? (
              <EditRoleDialog
                type={EditRoleDialog.TYPES.EDIT}
                visible
                roleId={role.roleId}
                projectId={projectId}
                onOk={res => {
                  if (res) {
                    alert(_l('修改成功'));
                    callback();
                    this.setState({
                      showEdit: false,
                    });
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
          </td>
        )}
      </tr>
    );
  }
}

RoleItem.propTypes = {
  role: PropTypes.shape({
    isHrVisible: PropTypes.bool,
    roleId: PropTypes.string,
    roleName: PropTypes.string,
    permissionTypes: PropTypes.arrayOf(PropTypes.object),
    userCount: PropTypes.number,
  }),
};

export default RoleItem;
