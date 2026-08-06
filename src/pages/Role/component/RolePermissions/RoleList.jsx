import React from 'react';
import styled from 'styled-components';
import { SortableList } from 'ming-ui';
import { sysRoleType } from 'src/pages/Role/config.js';
import ItemCon from './ItemCon';

const Wrap = styled.p`
  font-size: 12px;
  font-weight: bold;
  color: var(--color-text-tertiary);
  padding-left: 18px;
  margin: 10px 0 4px 0;
`;

const ROLE_ACTION_MANAGE_MEMBERS = 10;

export default class Con extends React.Component {
  handleSortEnd = list => {
    const { handleMoveApp, roleList, isForPortal } = this.props;
    const sysList = roleList.filter(o => sysRoleType.includes(o.roleType));
    const newList = isForPortal ? list : [...sysList, ...list];
    this.props.onChange({ roleList: newList });
    handleMoveApp && handleMoveApp(newList);
  };

  handleChoose = roleId => {
    // 切换角色前先处理未保存配置，避免外部门户等场景先切到新角色后再保存旧角色。
    this.props.handleChangePage(() => {
      this.props.onSelect(roleId);
      this.props.onChange({
        roleId,
      });
    });
  };

  handleAction = (action, data) => {
    // “管理角色/管理用户”会离开当前角色配置页，也需要先处理未保存配置；复制、删除等原地操作不拦截。
    if (action.key === ROLE_ACTION_MANAGE_MEMBERS) {
      this.props.handleChangePage(() => {
        this.props.onAction(action, data);
      });
      return;
    }

    this.props.onAction(action, data);
  };

  render() {
    const { appId, dataList, roleId, isForPortal, roleList } = this.props;
    const sysList = roleList.filter(o => sysRoleType.includes(o.roleType));
    const List = roleList.filter(o => !sysRoleType.includes(o.roleType));

    return (
      <ul>
        {!isForPortal && sysList.length > 0 && <Wrap>{_l('系统')}</Wrap>}
        {!isForPortal &&
          sysList.map(o => {
            // item, dataList, onAction, roleId, onChoose, isForPortal
            return (
              <ItemCon
                appId={appId}
                item={o}
                onChoose={roleId => {
                  this.handleChoose(roleId);
                }}
                isForPortal={isForPortal}
                roleId={roleId}
                dataList={dataList}
                onAction={(o, data) => {
                  this.handleAction(o, data);
                }}
              />
            );
          })}
        {sysList.length > 0 && <div style={{ paddingTop: 6 }}></div>}
        {!isForPortal && List.length > 0 && <Wrap>{_l('自定义')}</Wrap>}
        {List && (
          <SortableList
            items={List}
            useDragHandle
            itemKey="roleId"
            onSortEnd={this.handleSortEnd}
            renderItem={options => (
              <ItemCon
                {...options}
                appId={appId}
                onChoose={roleId => {
                  this.handleChoose(roleId);
                }}
                dataList={dataList}
                onAction={(o, data) => {
                  this.handleAction(o, data);
                }}
                isForPortal={isForPortal}
                roleId={roleId}
              />
            )}
          />
        )}
      </ul>
    );
  }
}
