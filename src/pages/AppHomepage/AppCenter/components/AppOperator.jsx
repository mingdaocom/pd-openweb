import React from 'react';
import update from 'immutability-helper';
import _ from 'lodash';
import styled from 'styled-components';
import Icon from 'ming-ui/components/Icon';
import Menu from 'ming-ui/components/Menu';
import MenuItem from 'ming-ui/components/MenuItem';
import { hasPermission } from 'src/components/checkPermission';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';
import { APP_ROLE_TYPE } from 'src/pages/worksheet/constants/enum.js';
import { getCurrentProject } from 'src/utils/project';
import EditGroupMenuItem from './EditGroupMenuItem';

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
    { type: 'del', icon: 'trash', text: _l('删除应用%01009'), className: 'delApp' },
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
  { type: 'del', icon: 'trash', text: _l('删除'), className: 'delApp' },
];

const Divider = styled.div`
  border-top: 1px solid #ddd;
  margin: 5px 0;
`;

export default ({
  groupType,
  projectId,
  disabledCopy,
  onClick,
  role,
  onClickAway,
  onUpdateAppBelongGroups,
  isLock,
  createType,
  isDashboard,
  allowCreate,
  sourceType,
  isGoodsStatus,
  isExternalApp,
  ...propsRest
}) => {
  const allowDelete = !isExternalApp
    ? !_.get(getCurrentProject(projectId, true), 'cannotDeleteApp') ||
      hasPermission(propsRest.myPermissions, PERMISSION_ENUM.CREATE_APP)
    : true;
  let list = [...(ROLE_OPERATION[role] || DEFAULT_ROLE_OPERATION)].filter(v => (allowDelete ? true : v.type !== 'del'));
  if (!list.length) return null;
  if (disabledCopy) {
    list = update(list, { $splice: [[1, 1]] });
  }

  if (!allowCreate) {
    _.remove(list, o => o.type === 'copy');
  }

  if (_.includes(['external', 'star', 'personal'], groupType)) {
    _.remove(list, o => o.type === 'setGroup');
  }

  if (isLock || createType === 1) {
    list = _.filter(list, it => _.includes(['setGroup', 'edit'], it.type));
  }

  if (isDashboard) {
    list = _.filter(list, o => o.type !== 'setGroup');
  }

  if (sourceType === 60) {
    _.remove(list, o => o.type === 'copy');

    if (!isGoodsStatus) {
      _.remove(list, o => o.type === 'edit');
    }
    if (!_.find(list, { type: 'del' })) {
      list.push(EXTERNAL_LINK_OPERATION[2]);
    }
  }

  return (
    <Menu className="Relative" onClickAway={onClickAway}>
      {list.map(({ type, icon, text, ...rest }) =>
        type === 'setGroup' ? (
          <EditGroupMenuItem
            {...propsRest}
            projectId={projectId}
            onUpdateAppBelongGroups={onUpdateAppBelongGroups}
            icon="___"
          />
        ) : (
          <MenuItem
            key={type}
            icon={<Icon className="operationIcon" icon={icon} />}
            onClick={e => {
              e.stopPropagation();
              onClick(type);
            }}
            {...rest}
          >
            {text}
          </MenuItem>
        ),
      )}
      {createType === 1 && role >= APP_ROLE_TYPE.ADMIN_ROLE && (
        <React.Fragment>
          <Divider />
          {EXTERNAL_LINK_OPERATION.filter(item => (role < APP_ROLE_TYPE.POSSESS_ROLE ? item.type !== 'del' : true)).map(
            ({ type, icon, text, className }) => (
              <MenuItem
                key={type}
                className={className}
                icon={<Icon className="operationIcon" icon={icon} />}
                onClick={e => {
                  e.stopPropagation();
                  onClick(type);
                }}
              >
                {text}
              </MenuItem>
            ),
          )}
        </React.Fragment>
      )}
    </Menu>
  );
};
