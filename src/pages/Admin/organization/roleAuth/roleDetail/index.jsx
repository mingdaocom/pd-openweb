import React, { useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon, LoadDiv, ScrollView } from 'ming-ui';
import { Button, Checkbox, Drawer, Input, Segmented, Tooltip } from 'ming-ui/antd-components';
import roleApi from 'src/api/role';
import { getCurrentProject } from 'src/utils/services/project';
import PermissionList from '../createEditRole/PermissionList';
import { filterMyPermissions } from '../utils';
import RoleUserList from './RoleUserList';

const DETAIL_DRAWER_STYLES = { mask: { background: 'transparent' } };
const CLOSABLE_MASK = { closable: true };

const DetailDrawer = styled(({ className, rootClassName, width, height, size, ...props }) => (
  <Drawer
    rootClassName={[className, rootClassName].filter(Boolean).join(' ') || undefined}
    size={size ?? width ?? height}
    {...props}
  />
))`
  .hap-drawer-header {
    padding-bottom: 8px;
    .hap-drawer-close {
      display: none;
    }
    .nameInput {
      width: 280px;
      font-size: 17px;
      font-weight: bold;
      border: none;
      border-radius: 0;
      border-bottom: 1px solid var(--color-border-secondary);
      border-color: var(--color-border-secondary) !important;
      padding: 0;
    }
  }
  .hap-drawer-body {
    padding: 0px 0px 16px;
  }
  .tabList {
    display: flex;
    margin: 0 24px;
    border-bottom: 1px solid var(--color-border-secondary);
    .tabItem {
      padding: 10px 8px;
      margin-right: 24px;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      &.isActive {
        border-color: var(--color-primary);
        color: var(--color-primary);
        font-weight: bold;
      }
    }
  }
  .hrPermissionsHeader {
    padding: 20px 0;
    border-top: 1px solid var(--color-border-secondary);
    &.noBorder {
      border: none;
    }
  }
  .permissionTypeHeader {
    display: flex;
    align-items: center;
    margin-top: 20px;
  }
  .permissionEmpty {
    padding: 80px 0;
  }
`;

const ROLE_TAB_LIST = [
  { key: 'member', text: _l('成员') },
  { key: 'auth', text: _l('权限') },
];

export default function RoleDetail(props) {
  const { onClose, projectId, role = {}, onOpenDrawer, onUpdateSuccess, onUpdateRoleName, defaultTab } = props;
  const { roleId, roleName, isSuperAdmin: isRoleSuperAdmin, allowAssignSamePermission } = role;
  const [currentTab, setCurrentTab] = useState(defaultTab || 'member');
  const [roleInfo, setRoleInfo] = useSetState({
    roleName,
    allowAddMembers: false,
    groups: [],
    hrPermissions: [],
  });
  const [loading, setLoading] = useState(defaultTab === 'auth');
  const [nameEditing, setNameEditing] = useState(false);
  const [permissionTab, setPermissionTab] = useState(0);
  const inputRef = useRef();
  const { isHrVisible, isSuperAdmin } = getCurrentProject(projectId);

  useEffect(() => {
    if (!roleId || currentTab !== 'auth') return;

    let cancelled = false;
    const standardPermissionRequest = roleApi.getRoleStandardPermission({ projectId, roleId });
    const hrPermissionRequest = isHrVisible ? roleApi.getRoleHRPermission({ projectId, roleId }) : Promise.resolve({});

    Promise.all([standardPermissionRequest, hrPermissionRequest])
      .then(([standardPermission, hrPermission]) => {
        if (cancelled) return;

        const groups = (standardPermission || {}).groups || [];

        setRoleInfo({
          allowAddMembers: (standardPermission || {}).allowAddMembers,
          groups: groups.map(group => ({
            ...group,
            permissions: filterMyPermissions(group.permissions || []),
          })),
          hrPermissions: isHrVisible ? filterMyPermissions((hrPermission || {}).permissions) : [],
        });
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentTab, isHrVisible, projectId, roleId, setRoleInfo]);

  const title = !nameEditing ? (
    <div className="flexRow alignItemsCenter">
      <span className="Font17 bold Block LineHeight36">{roleInfo.roleName}</span>
      {isSuperAdmin && !isRoleSuperAdmin && (
        <Icon
          icon="edit"
          className="Font16 mLeft5 textTertiary Hand hoverColorPrimary"
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
      ref={inputRef}
      className="nameInput"
      value={roleInfo.roleName}
      maxLength={30}
      onChange={e => setRoleInfo({ roleName: e.target.value })}
      onBlur={e => {
        setNameEditing(false);
        if (!e.target.value.trim()) {
          setRoleInfo({ roleName });
        } else {
          roleApi.editRoleName({ projectId, roleId, roleName: e.target.value.trim() }).then(res => {
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

  const activePermissions = roleInfo.groups[permissionTab]?.permissions || [];
  const isFirstPermissionGroup = permissionTab === 0;
  const hasCurrentPermissions = activePermissions.length || (isFirstPermissionGroup && roleInfo.hrPermissions.length);

  return (
    <DetailDrawer
      rootClassName="roleDetailDrawer"
      open={true}
      mask={CLOSABLE_MASK}
      styles={DETAIL_DRAWER_STYLES}
      width={720}
      title={title}
      extra={<Icon icon="close" className="Font20 textTertiary Hand" onClick={onClose} />}
      onClose={onClose}
    >
      <div className="flexColumn h100 overflowHidden">
        <div className="tabList">
          {ROLE_TAB_LIST.map((item, index) => (
            <div
              key={index}
              className={cx('tabItem', { isActive: currentTab === item.key })}
              onClick={() => {
                if (item.key === currentTab) return;

                item.key === 'auth' && setLoading(true);
                setCurrentTab(item.key);
              }}
            >
              {item.text}
            </div>
          ))}
        </div>

        {currentTab === 'member' ? (
          <RoleUserList
            projectId={projectId}
            roleId={roleId}
            isHrVisible={isHrVisible}
            allowManageUser={isSuperAdmin || allowAssignSamePermission}
            isRoleSuperAdmin={isRoleSuperAdmin}
            onUpdateSuccess={onUpdateSuccess}
          />
        ) : (
          <React.Fragment>
            {loading && <LoadDiv className="mTop10" />}
            {!loading && (
              <ScrollView className="flex">
                <div className="mLeft24 mRight24">
                  <div className="permissionTypeHeader">
                    <Segmented
                      value={permissionTab}
                      options={roleInfo.groups.map((group, index) => ({
                        value: index,
                        label: group.groupName,
                      }))}
                      onChange={setPermissionTab}
                    />
                    <div className="flex" />
                    {isSuperAdmin && !isRoleSuperAdmin && (
                      <React.Fragment>
                        <Checkbox
                          checked={roleInfo.allowAddMembers}
                          onChange={() => {
                            setRoleInfo({
                              allowAddMembers: !roleInfo.allowAddMembers,
                            });
                            roleApi
                              .setAllowAssignSamePermission({
                                projectId,
                                roleId,
                                allowAssignSamePermission: !roleInfo.allowAddMembers,
                              })
                              .then(res => {
                                res ? alert(_l('设置成功')) : alert(_l('设置失败'), 2);
                              });
                          }}
                        >
                          {_l('允许成员自行加人')}
                        </Checkbox>
                        <Tooltip title={_l('勾选后，权限组下成员可以添加、移除其他成员')}>
                          <Icon icon="info_outline" className="textTertiary Font16 mLeft4 mRight20" />
                        </Tooltip>
                        <Button color="primary" variant="outlined" onClick={() => onOpenDrawer('editRole')}>
                          {_l('编辑')}
                        </Button>
                      </React.Fragment>
                    )}
                  </div>

                  {!hasCurrentPermissions ? (
                    <div className="permissionEmpty TxtCenter">
                      <div className="textSecondary mBottom12">{_l('没有任何权限')}</div>
                      {(isSuperAdmin || allowAssignSamePermission) && (
                        <div
                          className="colorPrimary hoverColorPrimaryDark pointer"
                          onClick={() => onOpenDrawer('editRole')}
                        >
                          {_l('前往编辑')}
                        </div>
                      )}
                    </div>
                  ) : (
                    <React.Fragment>
                      {!!activePermissions.length && (
                        <div className="mTop20">
                          <PermissionList projectId={projectId} permissions={activePermissions} canEdit={false} />
                        </div>
                      )}

                      {isFirstPermissionGroup && !!roleInfo.hrPermissions.length && (
                        <React.Fragment>
                          <div
                            className={cx('flexRow alignItemsCenter hrPermissionsHeader', {
                              noBorder: !activePermissions.length,
                            })}
                          >
                            <div className="bold Font14 flex">{_l('人事权限')}</div>
                            {isSuperAdmin && !isRoleSuperAdmin && (
                              <Button color="primary" variant="outlined" onClick={() => onOpenDrawer('editHrRole')}>
                                {_l('编辑')}
                              </Button>
                            )}
                          </div>
                          <PermissionList permissions={roleInfo.hrPermissions} canEdit={false} />
                        </React.Fragment>
                      )}
                    </React.Fragment>
                  )}
                </div>
              </ScrollView>
            )}
          </React.Fragment>
        )}
      </div>
    </DetailDrawer>
  );
}
