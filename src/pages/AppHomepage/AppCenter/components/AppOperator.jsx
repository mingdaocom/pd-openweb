import React, { Component } from 'react';
import Icon from 'ming-ui/components/Icon';
import Menu from 'ming-ui/components/Menu';
import MenuItem from 'ming-ui/components/MenuItem';
import EditGroupMenuItem from './EditGroupMenuItem';
import update from 'immutability-helper';

const ROLE_OPERATION = {
  // 无权限
  0: [{ type: 'setGroup' }],
  // 拥有者
  200: [
    { type: 'edit', icon: 'edit', text: _l('修改名称和图标') },
    { type: 'copy', icon: 'content-copy', text: _l('复制应用') },
    { type: 'setGroup' },
    { type: 'del', icon: 'delete2', text: _l('删除应用'), className: 'delApp' },
  ],
  // 管理员
  100: [
    { type: 'edit', icon: 'edit', text: _l('修改名称和图标') },
    { type: 'copy', icon: 'content-copy', text: _l('复制应用') },
    { type: 'setGroup' },
    { type: 'quit', icon: 'exit', text: _l('退出应用') },
  ],
  // map管理员
  300: [
    { type: 'edit', icon: 'edit', text: _l('修改名称和图标') },
    { type: 'copy', icon: 'content-copy', text: _l('复制应用') },
    { type: 'setGroup' },
    { type: 'quit', icon: 'exit', text: _l('退出应用') },
  ],
};

const DEFAULT_ROLE_OPERATION = [{ type: 'quit', icon: 'exit', text: _l('退出应用') }];

export default ({
  groupType,
  projectId,
  disabledCopy,
  onClick,
  role,
  onClickAway,
  onUpdateAppBelongGroups,
  ...propsRest
}) => {
  let list = [...(ROLE_OPERATION[role] || DEFAULT_ROLE_OPERATION)];
  if (!list.length) return null;
  if (disabledCopy) {
    list = update(list, { $splice: [[1, 1]] });
  }

  if ((_.find(md.global.Account.projects, o => o.projectId === projectId) || {}).cannotCreateApp) {
    _.remove(list, o => o.type === 'copy');
  }

  if (_.includes(['external', 'star', 'personal'], groupType)) {
    _.remove(list, o => o.type === 'setGroup');
  }

  return (
    <Menu className="Relative" onClickAway={onClickAway}>
      {list.map(({ type, icon, text, ...rest }) =>
        type === 'setGroup' ? (
          <EditGroupMenuItem {...propsRest} onUpdateAppBelongGroups={onUpdateAppBelongGroups} icon="___" />
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
    </Menu>
  );
};
