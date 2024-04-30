import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { dialogSelectUser } from 'ming-ui/functions';
import { Dialog, Icon, Menu, MenuItem } from 'ming-ui';
import RoleController from 'src/api/role';
import { navigateTo } from 'src/router/navigateTo';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import EditRoleDialog from '../createEditRole';
import _ from 'lodash';
class RoleItem extends React.Component {
  constructor() {
    super();
    this.state = {
      showEdit: false,
      hasClick: false,
    };
  }

  clickHandler = (e, type) => {
    e.stopPropagation();

    const { role, projectId, callback } = this.props;

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
    } else if (type === 'delete') {
      this.setState({ popupVisibleId: undefined });
      Dialog.confirm({
        title: _l('您确定删除该角色？'),
        onOk: () => {
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
      });
    } else if (type === 'applyrole' && !this.state.hasClick) {
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
    }
  };

  render() {
    const { isHrVisible, role, projectId, isApply, entry, callback } = this.props;
    const { popupVisibleId } = this.state;
    const auth = role.auth || {};
    const isNormal = entry === 'myRole';

    return (
      <tr
        className={classNames('roleItem', { disabled: isApply })}
        onClick={() => {
          if (!isApply && !isNormal) {
            navigateTo('/admin/sysroles/' + projectId + '/' + role.roleId);
          }
        }}
      >
        <td className="roleName">{role.roleName}</td>
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
                onClick={e => this.clickHandler(e, 'applyrole')}
                className={cx(this.state.hasClick ? 'Gray_bd' : 'ThemeColor3 adminHoverColor Hand')}
              >
                {_l('申请')}
              </span>
            )}
          </td>
        ) : (
          <td className={classNames('roleOperation', { ThemeColor3: !role.noAuth })}>
            <span className="adminHoverColor" onClick={e => this.clickHandler(e, 'addmember')}>
              {role.noAuth ? '' : _l('添加成员')}
            </span>
            {isHrVisible && (auth.edit || (auth.delete && role.userCount === 0)) && (
              <Trigger
                popupVisible={role.entityId === popupVisibleId}
                onPopupVisibleChange={visible => this.setState({ popupVisibleId: visible ? role.entityId : undefined })}
                action={['click']}
                popupAlign={{
                  offset: [-100, 15],
                  points: ['tr', 'tl'],
                  overflow: { adjustX: true, adjustY: true },
                }}
                popup={
                  <Menu style={{ width: 120 }}>
                    <MenuItem
                      onClick={e => {
                        e.stopPropagation();
                        this.setState({ showEdit: true, popupVisibleId: undefined });
                      }}
                    >
                      {_l('编辑角色权限')}
                    </MenuItem>
                    <MenuItem onClick={e => this.clickHandler(e, 'delete')}>{_l('删除')}</MenuItem>
                  </Menu>
                }
              >
                <Icon
                  icon="moreop"
                  className="Gray_9e Hand Font18 Hover_49 TxtMiddle"
                  onClick={e => e.stopPropagation()}
                />
              </Trigger>
            )}
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
