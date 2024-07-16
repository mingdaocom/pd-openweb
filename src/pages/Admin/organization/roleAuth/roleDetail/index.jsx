import React, { useState, useRef, useEffect } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import cx from 'classnames';
import { Drawer } from 'antd';
import { Button, Icon, Input, LoadDiv, Checkbox, ScrollView, Tooltip } from 'ming-ui';
import RoleUserList from './RoleUserList';
import PermissionList from '../createEditRole/PermissionList';
import roleApi from 'src/api/role';
import { getCurrentProject } from 'src/util';
import { filterMyPermissions } from '../utils';

const DetailDrawer = styled(Drawer)`
  .ant-drawer-mask {
    background-color: transparent;
  }
  .ant-drawer-header {
    border: none;
    padding-bottom: 8px;
    .ant-drawer-close {
      display: none;
    }
    .nameInput {
      width: 280px;
      font-size: 17px;
      font-weight: bold;
      border: none;
      border-radius: 0;
      border-bottom: 1px solid #eaeaea;
      border-color: #eaeaea !important;
      padding: 0;
    }
  }
  .ant-drawer-body {
    padding: 0px 0px 16px;
  }
  .tabList {
    display: flex;
    margin: 0 24px;
    border-bottom: 1px solid #eaeaea;
    .tabItem {
      padding: 10px 8px;
      margin-right: 24px;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      &.isActive {
        border-color: #2196f3;
        color: #2196f3;
        font-weight: bold;
      }
    }
  }
  .hrPermissionsHeader {
    padding: 20px 0;
    border-top: 1px solid #eaeaea;
    &.noBorder {
      border: none;
    }
  }
  .Checkbox {
    span {
      font-size: 14px !important;
    }
  }
`;

const ROLE_TAB_LIST = [
  { key: 'member', text: _l('成员') },
  { key: 'auth', text: _l('权限') },
];

export default function RoleDetail(props) {
  const { onClose, projectId, role = {}, onOpenDrawer, onUpdateSuccess, onUpdateRoleName, defaultTab } = props;
  const [currentTab, setCurrentTab] = useState(defaultTab || 'member');
  const [roleInfo, setRoleInfo] = useSetState({
    roleName: role.roleName,
    allowAddMembers: false,
    permissions: [],
    hrPermissions: [],
  });
  const [loading, setLoading] = useState(false);
  const [nameEditing, setNameEditing] = useState(false);
  const inputRef = useRef();
  const { isHrVisible, isSuperAdmin } = getCurrentProject(projectId);
  const isRoleSuperAdmin = role.isSuperAdmin;

  useEffect(() => {
    role.roleId && currentTab === 'auth' && getPermissions();
    setRoleInfo({ roleName: role.roleName });
  }, [role, currentTab]);

  const getPermissions = async () => {
    setLoading(true);
    const standardPermission = await roleApi.getRoleStandardPermission({ projectId, roleId: role.roleId });
    let hrPermission = {};

    isHrVisible && (hrPermission = await roleApi.getRoleHRPermission({ projectId, roleId: role.roleId }));
    setRoleInfo({
      allowAddMembers: (standardPermission || {}).allowAddMembers,
      permissions: filterMyPermissions((standardPermission || {}).permissions),
      hrPermissions: isHrVisible ? filterMyPermissions((hrPermission || {}).permissions) : [],
    });

    setLoading(false);
  };

  const title = !nameEditing ? (
    <div className="flexRow alignItemsCenter">
      <span className="Font17 bold Block LineHeight36">{roleInfo.roleName}</span>
      {isSuperAdmin && !isRoleSuperAdmin && (
        <Icon
          icon="edit"
          className="Font16 mLeft5 Gray_9d Hand Hover_21"
          onClick={() => {
            setNameEditing(true);
            setTimeout(() => {
              inputRef.current && inputRef.current.focus();
            }, 300);
          }}
        />
      )}
    </div>
  ) : (
    <Input
      manualRef={inputRef}
      className="nameInput"
      value={roleInfo.roleName}
      maxLength={30}
      onChange={roleName => setRoleInfo({ roleName })}
      onBlur={e => {
        setNameEditing(false);
        if (!e.target.value.trim()) {
          setRoleInfo({ roleName: role.roleName });
        } else {
          roleApi.editRoleName({ projectId, roleId: role.roleId, roleName: e.target.value.trim() }).then(res => {
            if (res) {
              onUpdateRoleName(e.target.value.trim());
            } else {
              alert(_l('名称修改失败'), 2);
            }
          });
        }
      }}
    />
  );

  return (
    <DetailDrawer
      className="roleDetailDrawer"
      visible={true}
      mask={false}
      width={720}
      title={title}
      extra={<Icon icon="close" className="Font20 Gray_9e Hand" onClick={onClose} />}
      onClose={onClose}
    >
      <div className="flexColumn h100 overflowHidden">
        <div className="tabList">
          {ROLE_TAB_LIST.map((item, index) => (
            <div
              key={index}
              className={cx('tabItem', { isActive: currentTab === item.key })}
              onClick={() => setCurrentTab(item.key)}
            >
              {item.text}
            </div>
          ))}
        </div>

        {currentTab === 'member' ? (
          <RoleUserList
            projectId={projectId}
            roleId={role.roleId}
            isHrVisible={isHrVisible}
            allowManageUser={isSuperAdmin || role.allowAssignSamePermission}
            isRoleSuperAdmin={isRoleSuperAdmin}
            onUpdateSuccess={onUpdateSuccess}
          />
        ) : (
          <React.Fragment>
            {loading && <LoadDiv className="mTop10" />}
            {!loading &&
              (!roleInfo.permissions.length && !roleInfo.hrPermissions.length ? (
                <div className="flex flexColumn justifyContentCenter TxtCenter">
                  <div className="Gray_75 mBottom12">{_l('没有任何权限')}</div>
                  {(isSuperAdmin || role.allowAssignSamePermission) && (
                    <div className="ThemeColor3 ThemeHoverColor2 pointer" onClick={() => onOpenDrawer('editRole')}>
                      {_l('前往编辑')}
                    </div>
                  )}
                </div>
              ) : (
                <ScrollView className="flex">
                  <div className="mLeft24 mRight24">
                    {isSuperAdmin && !isRoleSuperAdmin && (
                      <div className="flexRow alignItemsCenter mTop20">
                        <div className="bold flex Gray_75">{_l('拥有权限')}</div>
                        <div className="flex" />
                        <Checkbox
                          checked={roleInfo.allowAddMembers}
                          text={_l('允许成员自行加人')}
                          onClick={() => {
                            setRoleInfo({ allowAddMembers: !roleInfo.allowAddMembers });
                            roleApi
                              .setAllowAssignSamePermission({
                                projectId,
                                roleId: role.roleId,
                                allowAssignSamePermission: !roleInfo.allowAddMembers,
                              })
                              .then(res => {
                                res ? alert(_l('设置成功')) : alert(_l('设置失败'), 2);
                              });
                          }}
                        />
                        <Tooltip text={_l('勾选后，角色下成员可以添加、移除其他成员')}>
                          <Icon icon="info_outline" className="Gray_9e Font16 mLeft4 mRight20" />
                        </Tooltip>
                        <Button type="ghost" size="small" onClick={() => onOpenDrawer('editRole')}>
                          {_l('编辑')}
                        </Button>
                      </div>
                    )}

                    {!!roleInfo.permissions.length && (
                      <div className="mTop20">
                        <PermissionList projectId={projectId} permissions={roleInfo.permissions} canEdit={false} />
                      </div>
                    )}

                    {!!roleInfo.hrPermissions.length && (
                      <React.Fragment>
                        <div
                          className={cx('flexRow alignItemsCenter hrPermissionsHeader', {
                            noBorder: !roleInfo.permissions.length,
                          })}
                        >
                          <div className="bold Font14 flex">{_l('人事权限')}</div>
                          {isSuperAdmin && !isRoleSuperAdmin && (
                            <Button type="ghost" size="small" onClick={() => onOpenDrawer('editHrRole')}>
                              {_l('编辑')}
                            </Button>
                          )}
                        </div>
                        <PermissionList permissions={roleInfo.hrPermissions} canEdit={false} />
                      </React.Fragment>
                    )}
                  </div>
                </ScrollView>
              ))}
          </React.Fragment>
        )}
      </div>
    </DetailDrawer>
  );
}
