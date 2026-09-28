import React, { useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import { Icon, LoadDiv } from 'ming-ui';
import { Checkbox, Input, Tabs, Tooltip } from 'ming-ui/antd-components';
import roleApi from 'src/api/role';
import RoleDrawer from '../RoleDrawer';
import { getCheckedPermissionIds, hasPermissionEditChanged } from '../utils';
import PermissionList from './PermissionList';

export default function CreateEditRole(props) {
  const { onClose, projectId, roleId, roleName = '', isEditHr, onSaveSuccess = () => {} } = props;
  const [loading, setLoading] = useState(true);
  const [roleInfo, setRoleInfo] = useSetState({ roleName, allowAddMembers: false, groups: [], hrPermissions: [] });
  const [selectedIds, setSelectedIds] = useState([]);
  const [permissionTab, setPermissionTab] = useState(0);
  const [initialValue, setInitialValue] = useState();
  const requestPending = useRef(false);

  useEffect(() => {
    (isEditHr ? roleApi.getRoleHRPermission : roleApi.getRoleStandardPermission)({ projectId, roleId }).then(res => {
      if (res) {
        const hrPermissions = res.permissions || [];
        const groups = res.groups || [];

        setRoleInfo({
          ..._.pick(res, ['allowAddMembers']),
          ...(isEditHr ? { hrPermissions } : { groups }),
        });
        const checkedPermissionIds = roleId
          ? getCheckedPermissionIds(isEditHr ? hrPermissions : groups.flatMap(group => group.permissions || []))
          : [];

        setSelectedIds(checkedPermissionIds);
        setInitialValue({
          roleName,
          allowAddMembers: res.allowAddMembers,
          selectedIds: checkedPermissionIds,
        });

        setLoading(false);
      }
    });
  }, [isEditHr, projectId, roleId, roleName, setRoleInfo]);

  const onSave = () => {
    if (requestPending.current) return;

    if (roleInfo.roleName.trim() === '') {
      alert(_l('请输入权限组名称'), 3);
      return false;
    }

    if (roleInfo.roleName.trim().length > 30) {
      alert(_l('权限组名称长度最大为30'), 3);
      return false;
    }

    requestPending.current = true;
    return (!roleId ? roleApi.addRole : isEditHr ? roleApi.editRoleHR : roleApi.editRole)({
      projectId,
      roleId,
      roleName: roleInfo.roleName.trim(),
      permissionIds: selectedIds,
      allowAssignSamePermission: roleInfo.allowAddMembers,
    })
      .then(res => {
        if (res) {
          alert(roleId ? _l('修改成功') : _l('创建成功'));
          onClose();
          onSaveSuccess();
        } else {
          alert(roleId ? _l('修改失败') : _l('创建失败'), 2);
        }
      })
      .finally(() => {
        requestPending.current = false;
      });
  };

  const permissionListProps = {
    projectId,
    selectedIds,
    onChangePermission: setSelectedIds,
  };
  const hasUnsavedChanges = hasPermissionEditChanged(initialValue, {
    roleName: roleInfo.roleName,
    allowAddMembers: roleInfo.allowAddMembers,
    selectedIds,
  });

  return (
    <RoleDrawer
      open={true}
      width={720}
      mask={{ closable: !hasUnsavedChanges }}
      title={roleId ? (isEditHr ? _l('编辑人事权限') : _l('编辑权限')) : _l('新建权限组')}
      extra={<Icon icon="close" className="Font20 textTertiary Hand" onClick={onClose} />}
      okText={roleId ? _l('保存') : _l('新建')}
      onOk={onSave}
      onClose={onClose}
    >
      {loading && <LoadDiv />}
      {!loading && (
        <React.Fragment>
          <div className="mBottom20">
            <div className="mBottom12 bold">{_l('权限组名称')}</div>
            <Input
              placeholder={_l('请输入权限组名称')}
              className="w100"
              value={roleInfo.roleName}
              autoFocus
              onChange={e => setRoleInfo({ roleName: e.target.value })}
            />
          </div>

          {isEditHr ? (
            <React.Fragment>
              <div className="permissionsHeader">
                <div className="bold flex textSecondary">{_l('分配权限')}</div>
              </div>
              <PermissionList {...permissionListProps} permissions={roleInfo.hrPermissions} />
            </React.Fragment>
          ) : (
            <Tabs
              className="permissionTabs"
              activeKey={String(permissionTab)}
              onChange={key => setPermissionTab(Number(key))}
              tabBarExtraContent={
                <div className="flexRow alignItemsCenter">
                  <Checkbox
                    checked={roleInfo.allowAddMembers}
                    onChange={() => setRoleInfo({ allowAddMembers: !roleInfo.allowAddMembers })}
                  >
                    {_l('允许成员自行加人')}
                  </Checkbox>
                  <Tooltip title={_l('勾选后，权限组下成员可以添加、移除其他成员')} placement="topLeft">
                    <Icon icon="info_outline" className="textTertiary Font16 mLeft4" />
                  </Tooltip>
                </div>
              }
              items={roleInfo.groups.map((group, index) => ({
                key: String(index),
                label: group.groupName,
                children: <PermissionList {...permissionListProps} permissions={group.permissions || []} />,
              }))}
            />
          )}
        </React.Fragment>
      )}
    </RoleDrawer>
  );
}
