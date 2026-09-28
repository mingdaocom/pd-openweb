import React, { useCallback, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Dropdown, Modal } from 'ming-ui/antd-components';
import { dialogSelectUser } from 'ming-ui/functions';
import roleApi from 'src/api/role';
import { getCurrentProject } from 'src/utils/services/project';

export default function RoleItem(props) {
  const { role, projectId, isApply, onRefreshRoleList, onOpenDrawer, selectedRole } = props;
  const [hasApply, setHasApply] = useState(false);
  const [popupVisibleId, setPopupVisibleId] = useState(null);
  const [isMembersOverflow, setIsMembersOverflow] = useState(false);
  const [isAuthOverflow, setIsAuthOverflow] = useState(false);
  const { isHrVisible, isSuperAdmin, projectStatus } = getCurrentProject(projectId, true);
  const memberNames = role.memberNames || [];
  const permissionNames = role.permissionNames || [];
  const memberNamesText = memberNames.join('、');
  const permissionNamesText = permissionNames.join('、');

  const membersRef = useCallback(
    node => {
      node && setIsMembersOverflow(Boolean(memberNamesText) && node.scrollHeight > 40);
    },
    [memberNamesText],
  );

  const authRef = useCallback(
    node => {
      node && setIsAuthOverflow(Boolean(permissionNamesText) && node.scrollHeight > 40);
    },
    [permissionNamesText],
  );

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
              alert(_l('不允许申请权限组'), 3);
            } else if (data === 0) {
              alert(_l('申请失败'), 2);
            }
          });
        break;
      case 'delete':
        setPopupVisibleId(null);
        Modal.confirm({
          title: <span className="Red textError">{_l('确定删除权限组') + `"${role.roleName}"?`}</span>,
          content: <span className="textPrimary">{_l('删除后无法恢复')}</span>,
          okButtonProps: {
            danger: true,
          },
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
      <div className={cx('roleItem', { disabled: isApply, selectedRole })} onClick={() => !isApply && onOpenDrawer()}>
        <div className="roleName">
          {role.roleName}
          {role.isSuperAdmin && <Icon icon="people_5" className="Font15 mLeft4 superIcon" />}
        </div>
        <div className="roleMembers">
          <span className="content" ref={membersRef}>
            {memberNamesText}
          </span>
          {isMembersOverflow && <span>{_l('等') + memberNames.length + _l('人')}</span>}
        </div>
        <div className="roleAuth">
          <span className="content" ref={authRef}>
            {role.isSuperAdmin ? _l('所有权限') : permissionNamesText}
          </span>
          {isAuthOverflow && <span>{_l('等') + permissionNames.length + _l('项')}</span>}
        </div>
        {isApply && projectStatus !== 2 ? (
          <div className="roleOperation">
            <span
              onClick={e => !hasApply && onClickHandle(e, 'applyRole')}
              className={cx(hasApply ? 'textDisabled' : 'colorPrimary adminHoverColor Hand')}
            >
              {_l('申请')}
            </span>
          </div>
        ) : (
          <div className={cx('roleOperation', { colorPrimary: role.allowAssignSamePermission || isSuperAdmin })}>
            {(role.allowAssignSamePermission || isSuperAdmin) && (
              <span className="adminHoverColor" onClick={e => onClickHandle(e, 'addMember')}>
                {_l('添加成员')}
              </span>
            )}
            {isSuperAdmin && !role.isSuperAdmin && (
              <Dropdown
                open={role.entityId === popupVisibleId}
                onOpenChange={visible => setPopupVisibleId(visible ? role.entityId : null)}
                trigger={['click']}
                menu={{
                  items: [
                    { key: 'editRole', label: _l('编辑权限') },
                    ...(isHrVisible ? [{ key: 'editHrRole', label: _l('编辑人事权限') }] : []),
                    { key: 'delete', danger: true, label: _l('删除') },
                  ],
                  onClick: ({ key, domEvent }) => onClickHandle(domEvent, key),
                }}
              >
                <Icon
                  icon="moreop"
                  className="textTertiary Hand Font18 hoverColorPrimaryLight TxtMiddle"
                  onClick={e => e.stopPropagation()}
                />
              </Dropdown>
            )}
          </div>
        )}
      </div>
    </React.Fragment>
  );
}
