import React from 'react';
import PropTypes from 'prop-types';

import Dialog from 'ming-ui/components/Dialog';
import Input from 'ming-ui/components/Input';
import LoadDiv from 'ming-ui/components/LoadDiv';

import RoleController from 'src/api/role';
import RoleAuthCommon from '../common/common';

import PermissionList from './permissionsEdit';

import './style.less';

const TYPES = {
  EDIT: 'EDIT',
  CREATE: 'CREATE',
};

export default class CreateEditRoleDialog extends React.Component {
  static TYPES = TYPES;

  static propTypes = {
    type: PropTypes.oneOf(_.values(TYPES)),
    roleId: PropTypes.string,
    projectId: PropTypes.string,
  };

  static defaultProps = {
    type: 'create',
    onClose: () => {},
    onOk: () => {},
  };

  constructor() {
    super();
    this.state = {
      isLoading: true,
      roleName: '',
      permissions: null,
      rolePermissions: {},
      grantPermission: null,
    };

    this.submit = this.submit.bind(this);
  }

  componentWillMount() {
    this.fetchAuth();
  }

  getGrantPermission(permissionTypes) {
    const rolePermissionType = _.find(permissionTypes, permission => permission.typeId === 1);
    const grantPermission = _.find(rolePermissionType.subPermissions, permission => permission.permissionId === 101);
    this.setState({
      grantPermission,
    });
  }

  fetchAuth() {
    const { type, projectId, roleId } = this.props;
    if (type === TYPES.EDIT) {
      return $
        .when(
          RoleController.getUserPermissions({
            projectId,
            roleId,
          }),
          RoleController.getRolePermisson({
            projectId,
            roleId,
          })
        )
        .then((userPermissions, rolePermissions) => {
          RoleAuthCommon.formatRoleAuth(rolePermissions, false);
          this.getGrantPermission(userPermissions);
          const _dict = {};
          _.each(rolePermissions.permissionTypes, function (type) {
            _.each(type.subPermissions, function (item) {
              _dict[item.permissionId] = item;
            });
          });
          this.setState({
            isLoading: false,
            roleName: rolePermissions.roleName,
            rolePermissions: _dict,
            permissions: {
              permissionTypes: userPermissions,
            },
          });
        });
    } else {
      return RoleController.getUserPermissions({
        projectId,
        roleId,
      }).then(data => {
        var _data = {
          permissionTypes: data,
        };
        this.getGrantPermission(data);
        RoleAuthCommon.formatRoleAuth(_data, false);
        // 创建角色时默认勾选`允许授予他人角色相同权限`
        this.setState(prevState => ({
          isLoading: false,
          rolePermissions: {
            [prevState.grantPermission.permissionId]: prevState.grantPermission,
          },
          permissions: _data,
        }));
      });
    }
  }

  submit() {
    const { rolePermissions, roleName } = this.state;
    const { projectId, roleId, type, onOk } = this.props;
    const permissionIds = _.keys(rolePermissions);
    if ($.trim(roleName) === '') {
      alert(_l('请输入角色名称'), 3);
      return false;
    } else if ($.trim(roleName).length > 30) {
      alert(_l('角色名称长度最大为30'), 3);
      return false;
    } else if (!permissionIds.length) {
      alert(_l('角色权限不能为空'), 3);
      return false;
    }
    RoleController.editRole({
      projectId,
      roleId: type === TYPES.CRETAE ? undefined : roleId,
      roleName: $.trim(roleName),
      permissionIds,
    }).then(data => {
      onOk(data);
    });
  }

  render() {
    const { visible, type, onClose } = this.props;
    const { isLoading, rolePermissions, permissions, grantPermission, roleName } = this.state;
    const dialogProps = {
      className: TYPES.CREATE ? 'createRoleDialog' : 'editRoleDialog',
      width: 950,
      title: type === TYPES.CREATE ? _l('创建角色权限') : _l('编辑角色权限'),
      visible,
      onOk: this.submit,
      onCancel: onClose,
    };

    return (
      <Dialog {...dialogProps}>
        {isLoading ? (
          <LoadDiv />
        ) : (
          <React.Fragment>
            <div>
              <Input
                placeholder={_l('请输入角色名称')}
                className="roleNameInput"
                value={roleName}
                onChange={value => {
                  this.setState({ roleName: value });
                }}
              />
            </div>
            <PermissionList
              selectedPermissions={rolePermissions}
              permissions={permissions}
              grantPermission={grantPermission}
              updateSelectedAuth={(isAdd, permission) => {
                if (isAdd) {
                  this.setState(prevState => ({
                    rolePermissions: {
                      ...prevState.rolePermissions,
                      [permission.permissionId]: permission,
                    },
                  }));
                } else {
                  this.setState(prevState => ({
                    rolePermissions: _.omit(prevState.rolePermissions, permission.permissionId),
                  }));
                }
              }}
            />
          </React.Fragment>
        )}
      </Dialog>
    );
  }
}
