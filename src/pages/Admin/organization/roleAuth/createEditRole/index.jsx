import React, { useEffect, useState } from 'react';
import { useSetState } from 'react-use';
import { Drawer } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';
import { Button, Checkbox, Icon, Input, LoadDiv } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import roleApi from 'src/api/role';
import { getCheckedPermissionIds } from '../utils';
import PermissionList from './PermissionList';

const RoleDrawer = styled(Drawer)`
  .ant-drawer-header {
    border: none;
    .ant-drawer-close {
      display: none;
    }
  }
  .ant-drawer-body {
    padding: 8px 24px 16px 24px;
  }
  .ant-drawer-footer {
    padding: 12px 24px;
    border: none;
  }

  .permissionsHeader {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #eaeaea;
    padding-bottom: 16px;
    padding-top: 24px;
    .Checkbox {
      span {
        font-size: 14px !important;
      }
    }
  }
`;

export default function CreateEditRole(props) {
  const { onClose, projectId, roleId, roleName = '', isEditHr, onSaveSuccess = () => {} } = props;
  const [loading, setLoading] = useState(true);
  const [roleInfo, setRoleInfo] = useSetState({ roleName, allowAddMembers: false, permissions: [] });
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    (isEditHr ? roleApi.getRoleHRPermission : roleApi.getRoleStandardPermission)({ projectId, roleId }).then(res => {
      if (res) {
        setRoleInfo(_.pick(res, ['allowAddMembers', 'permissions']));
        roleId && setSelectedIds(getCheckedPermissionIds(res.permissions));
        setLoading(false);
      }
    });
  }, []);

  const onSave = () => {
    if (roleInfo.roleName.trim() === '') {
      alert(_l('请输入角色名称'), 3);
      return false;
    }

    if (roleInfo.roleName.trim().length > 30) {
      alert(_l('角色名称长度最大为30'), 3);
      return false;
    }

    (!roleId ? roleApi.addRole : isEditHr ? roleApi.editRoleHR : roleApi.editRole)({
      projectId,
      roleId,
      roleName: roleInfo.roleName.trim(),
      permissionIds: selectedIds,
      allowAssignSamePermission: roleInfo.allowAddMembers,
    }).then(res => {
      if (res) {
        alert(roleId ? _l('修改成功') : _l('创建成功'));
        onClose();
        onSaveSuccess();
      } else {
        alert(roleId ? _l('修改失败') : _l('创建失败'), 2);
      }
    });
  };

  return (
    <RoleDrawer
      visible={true}
      width={720}
      maskClosable={false}
      title={roleId ? (isEditHr ? _l('编辑人事权限') : _l('编辑权限')) : _l('新建管理员角色')}
      extra={<Icon icon="close" className="Font20 Gray_9e Hand" onClick={onClose} />}
      footer={
        <div className="flexRow alignItemsCenter">
          <Button type="primary" onClick={onSave}>
            {roleId ? _l('保存') : _l('新建')}
          </Button>
          <Button type="link" className="mLeft12" onClick={onClose}>
            {_l('取消')}
          </Button>
        </div>
      }
      onClose={onClose}
    >
      {loading && <LoadDiv />}
      {!loading && (
        <React.Fragment>
          <div className="mBottom20">
            <div className="mBottom12 bold">{_l('角色名称')}</div>
            <Input
              placeholder={_l('请输入角色名称')}
              className="w100"
              value={roleInfo.roleName}
              autoFocus
              onChange={roleName => setRoleInfo({ roleName })}
            />
            <div className="permissionsHeader">
              <div className="bold flex Gray_75">{_l('分配权限')}</div>
              {!isEditHr && (
                <React.Fragment>
                  <Checkbox
                    checked={roleInfo.allowAddMembers}
                    text={_l('允许成员自行加人')}
                    onClick={() => setRoleInfo({ allowAddMembers: !roleInfo.allowAddMembers })}
                  />
                  <Tooltip title={_l('勾选后，角色下成员可以添加、移除其他成员')} placement="topLeft">
                    <Icon icon="info_outline" className="Gray_9e Font16 mLeft4" />
                  </Tooltip>
                </React.Fragment>
              )}
            </div>
          </div>

          <PermissionList
            projectId={projectId}
            permissions={roleInfo.permissions}
            selectedIds={selectedIds}
            onChangePermission={ids => setSelectedIds(ids)}
          />
        </React.Fragment>
      )}
    </RoleDrawer>
  );
}
