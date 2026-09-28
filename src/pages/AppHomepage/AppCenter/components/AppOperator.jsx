import React, { useState } from 'react';
import { Icon } from 'ming-ui';
import { Dropdown } from 'ming-ui/antd-components';
import { APP_ROLE_TYPE } from 'src/utils/domain/worksheet/constants';
import { FEATURE_PERMISSION, hasFeaturePermission } from 'src/utils/services/security/permission';
import EditGroupModal from './EditGroupMenuItem';

const ROLE_OPERATION = {
  // 无权限
  0: [{ type: 'setGroup' }],
  1: [{ type: 'edit', icon: 'edit', text: _l('修改名称和图标%01007') }, { type: 'setGroup' }],
  2: [{ type: 'edit', icon: 'edit', text: _l('修改名称和图标%01007') }, { type: 'setGroup' }],
  3: [{ type: 'edit', icon: 'edit', text: _l('修改名称和图标%01007') }, { type: 'setGroup' }],
  // 拥有者
  200: [
    { type: 'edit', icon: 'edit', text: _l('修改名称和图标%01007') },
    { type: 'copy', icon: 'content-copy', text: _l('复制应用%01008') },
    { type: 'setGroup' },
    { type: 'del', icon: 'trash', text: _l('删除应用%01009') },
  ],
  // 管理员
  100: [
    { type: 'edit', icon: 'edit', text: _l('修改名称和图标%01007') },
    { type: 'copy', icon: 'content-copy', text: _l('复制应用%01008') },
    { type: 'setGroup' },
  ],
  // map管理员
  300: [
    { type: 'edit', icon: 'edit', text: _l('修改名称和图标%01007') },
    { type: 'copy', icon: 'content-copy', text: _l('复制应用%01008') },
    { type: 'setGroup' },
  ],
};

const DEFAULT_ROLE_OPERATION = [{ type: 'setGroup' }];

const EXTERNAL_LINK_OPERATION = [
  { type: 'setExternalLink', icon: 'settings', text: _l('设置外部链接') },
  { type: 'manageUser', icon: 'group', text: _l('管理用户') },
  { type: 'del', icon: 'trash', text: _l('删除') },
];

export default ({
  children,
  open,
  groupType,
  projectId,
  disabledCopy,
  onClick,
  role,
  onOpenChange,
  getPopupContainer,
  onUpdateAppBelongGroups,
  isLock,
  createType,
  isDashboard,
  allowCreate,
  sourceType,
  isGoodsStatus,
  isExternalApp,
  exported,
  ...propsRest
}) => {
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const allowDelete = !isExternalApp ? hasFeaturePermission(projectId, FEATURE_PERMISSION.DELETE_APP) : true;
  let list = [...(ROLE_OPERATION[role] || DEFAULT_ROLE_OPERATION)].filter(item => allowDelete || item.type !== 'del');

  if (disabledCopy) {
    list = list.filter(item => item.type !== 'copy');
  }

  if (!allowCreate) {
    list = list.filter(item => item.type !== 'copy');
  }

  if (['external', 'star', 'personal'].includes(groupType)) {
    list = list.filter(item => item.type !== 'setGroup');
  }

  if (isLock || createType === 1) {
    list = list.filter(item => ['setGroup', 'edit'].includes(item.type));
  }

  if (isDashboard) {
    list = list.filter(item => item.type !== 'setGroup');
  }

  if (sourceType === 60) {
    if (!exported) {
      list = list.filter(item => item.type !== 'copy');
    }

    if (!isGoodsStatus) {
      list = list.filter(item => item.type !== 'edit');
    }

    if (!list.some(item => item.type === 'del')) {
      list.push(EXTERNAL_LINK_OPERATION[2]);
    }
  }

  const getOperationItem = ({ type, icon, text }) =>
    type === 'setGroup'
      ? {
          key: type,
          icon: <Icon icon="addto-folder" />,
          label: _l('设置分组%01010'),
          onClick: ({ domEvent }) => {
            domEvent.stopPropagation();
            setGroupModalVisible(true);
            onOpenChange(false);
          },
        }
      : {
          key: type,
          icon: <Icon icon={icon} />,
          label: text,
          danger: type === 'del',
          onClick: ({ domEvent }) => {
            domEvent.stopPropagation();
            onClick(type);
          },
        };

  const menuItems = list.map(getOperationItem);

  if (createType === 1 && role >= APP_ROLE_TYPE.ADMIN_ROLE) {
    const externalLinkItems = EXTERNAL_LINK_OPERATION.filter(
      item =>
        (role >= APP_ROLE_TYPE.POSSESS_ROLE || item.type !== 'del') &&
        !list.some(operation => operation.type === item.type),
    );

    if (externalLinkItems.length) {
      menuItems.push({ type: 'divider' }, ...externalLinkItems.map(getOperationItem));
    }
  }

  if (!menuItems.length) return null;

  return (
    <React.Fragment>
      <Dropdown
        trigger={['click']}
        open={open}
        placement="bottomLeft"
        menu={{ items: menuItems, style: { minWidth: 220 } }}
        onOpenChange={onOpenChange}
        getPopupContainer={getPopupContainer}
        destroyOnHidden
      >
        {children}
      </Dropdown>

      {groupModalVisible && (
        <EditGroupModal
          {...propsRest}
          open
          projectId={projectId}
          onUpdateAppBelongGroups={onUpdateAppBelongGroups}
          onCancel={() => setGroupModalVisible(false)}
        />
      )}
    </React.Fragment>
  );
};
