import React, { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import { Dialog, Icon, Menu, MenuItem } from 'ming-ui';
import { dialogSelectUser } from 'ming-ui/functions';
import roleApi from 'src/api/role';
import { getCurrentProject } from 'src/utils/project';

export default function RoleItem(props) {
  const { role, projectId, isApply, onRefreshRoleList, onOpenDrawer } = props;
  const [hasApply, setHasApply] = useState(false);
  const [popupVisibleId, setPopupVisibleId] = useState(null);
  const [isMembersOverflow, setIsMembersOverflow] = useState(false);
  const [isAuthOverflow, setIsAuthOverflow] = useState(false);
  const { isHrVisible, isSuperAdmin, projectStatus } = getCurrentProject(projectId, true);
  const membersRef = useRef();
  const authRef = useRef();

  useEffect(() => {
    setIsMembersOverflow(membersRef.current && membersRef.current.scrollHeight > 40);
  }, [membersRef.current]);

  useEffect(() => {
    setIsAuthOverflow(authRef.current && authRef.current.scrollHeight > 40);
  }, [authRef.current]);

  const onClickHandle = (e, type) => {
    e.stopPropagation();

    switch (type) {
      case 'addMember':
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
              roleApi
                .addUserToRole({
                  projectId,
                  roleId: role.roleId,
                  accountIds,
                })
                .then(data => {
                  if (data) {
                    alert(_l('操作成功'));
                    onRefreshRoleList();
                  } else {
                    alert(_l('操作失败'), 2);
                  }
                });
            },
          },
        });
        break;
      case 'applyRole':
        roleApi
          .applyRole({
            projectId,
            roleId: role.roleId,
          })
          .then(function (data) {
            if (data === 1) {
              setHasApply(true);
              alert(_l('申请成功'));
            } else if (data === -1) {
              alert(_l('不允许申请管理员'), 3);
            } else if (data === 0) {
              alert(_l('申请失败'), 2);
            }
          });
        break;
      case 'delete':
        setPopupVisibleId(null);
        Dialog.confirm({
          title: <span className="Red">{_l('确定删除角色') + `"${role.roleName}"?`}</span>,
          description: <span className="Gray">{_l('删除后无法恢复')}</span>,
          buttonType: 'danger',
          onOk: () => {
            roleApi
              .removeRole({
                projectId,
                roleId: role.roleId,
              })
              .then(res => {
                const { message, deleteSuccess } = res;
                if (deleteSuccess) {
                  alert(_l('操作成功'));
                  onRefreshRoleList();
                } else {
                  alert(message || _l('操作失败'), 2);
                }
              });
          },
        });
        break;
      case 'editRole':
        onOpenDrawer(type);
        setPopupVisibleId(null);
        break;
      case 'editHrRole':
        onOpenDrawer(type);
        setPopupVisibleId(null);
        break;
      default:
        break;
    }
  };

  return (
    <React.Fragment>
      <div className={cx('roleItem', { disabled: isApply })} onClick={() => !isApply && onOpenDrawer()}>
        <div className="roleName">
          {role.roleName}
          {role.isSuperAdmin && <Icon icon="people_5" className="Font15 mLeft4 superIcon" />}
        </div>
        <div className="roleMembers">
          <span className="content" ref={membersRef}>
            {(role.memberNames || []).join('、')}
          </span>
          {isMembersOverflow && <span>{_l('等') + role.memberNames.length + _l('人')}</span>}
        </div>
        <div className="roleAuth">
          <span className="content" ref={authRef}>
            {role.isSuperAdmin ? _l('所有权限') : (role.permissionNames || []).join('、')}
          </span>
          {isAuthOverflow && <span>{_l('等') + role.permissionNames.length + _l('项')}</span>}
        </div>
        {isApply && projectStatus !== 2 ? (
          <div className="roleOperation">
            <span
              onClick={e => !hasApply && onClickHandle(e, 'applyRole')}
              className={cx(hasApply ? 'Gray_bd' : 'ThemeColor3 adminHoverColor Hand')}
            >
              {_l('申请')}
            </span>
          </div>
        ) : (
          <div className={cx('roleOperation', { ThemeColor3: role.allowAssignSamePermission || isSuperAdmin })}>
            {(role.allowAssignSamePermission || isSuperAdmin) && (
              <span className="adminHoverColor" onClick={e => onClickHandle(e, 'addMember')}>
                {_l('添加成员')}
              </span>
            )}
            {isSuperAdmin && !role.isSuperAdmin && (
              <Trigger
                popupVisible={role.entityId === popupVisibleId}
                onPopupVisibleChange={visible => setPopupVisibleId(visible ? role.entityId : null)}
                action={['click']}
                popupAlign={{
                  offset: [0, 5],
                  points: ['tr', 'br'],
                  overflow: { adjustX: true, adjustY: true },
                }}
                popup={
                  <Menu style={{ minWidth: 120, maxWidth: 200, position: 'unset' }}>
                    <MenuItem onClick={e => onClickHandle(e, 'editRole')}>{_l('编辑权限')}</MenuItem>
                    {isHrVisible && (
                      <MenuItem onClick={e => onClickHandle(e, 'editHrRole')}>{_l('编辑人事权限')}</MenuItem>
                    )}
                    <MenuItem className="Red" onClick={e => onClickHandle(e, 'delete')}>
                      {_l('删除')}
                    </MenuItem>
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
          </div>
        )}
      </div>
    </React.Fragment>
  );
}
