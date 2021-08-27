import React, { Component } from 'react';
import Icon from 'ming-ui/components/Icon';
import Menu from 'ming-ui/components/Menu';
import MenuItem from 'ming-ui/components/MenuItem';
import update from 'immutability-helper';

const {app: {appInfo}} = window.private

const ROLE_OPERATION = {
  // 拥有者
  200: [
    { type: 'edit', icon: 'edit', text: _l('修改名称和图标') },
    { type: 'copy', icon: 'content-copy', text: _l('复制应用') },
    { type: 'del', icon: 'delete2', text: _l('删除应用'), className: 'delApp' },
  ].filter(item => !appInfo[item.type]),
  // 管理员
  100: [
    { type: 'edit', icon: 'edit', text: _l('修改名称和图标') },
    { type: 'copy', icon: 'content-copy', text: _l('复制应用') },
    { type: 'quit', icon: 'exit', text: _l('退出应用') },
  ].filter(item => !appInfo[item.type]),
  // map管理员
  300: [
    { type: 'edit', icon: 'edit', text: _l('修改名称和图标') },
    { type: 'copy', icon: 'content-copy', text: _l('复制应用') },
    { type: 'quit', icon: 'exit', text: _l('退出应用') },
  ].filter(item => !appInfo[item.type]),
};

const DEFAULT_ROLE_OPERATION = [{ type: 'quit', icon: 'exit', text: _l('退出应用') }];

export default ({ projectId, disabledCopy, onClick, role, onClickAway }) => {
  let list = ROLE_OPERATION[role] || DEFAULT_ROLE_OPERATION;
  if (!list.length) return null;
  if (disabledCopy) {
    list = update(list, { $splice: [[1, 1]] });
  }

  if ((_.find(md.global.Account.projects, o => o.projectId === projectId) || {}).cannotCreateApp) {
    _.remove(list, o => o.type === 'copy');
  }

  return (
    <Menu onClickAway={onClickAway}>
      {list.map(({ type, icon, text, ...rest }) => (
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
      ))}
    </Menu>
  );
};
