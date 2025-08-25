import React from 'react';
import styled from 'styled-components';
import { SortableList } from 'ming-ui';
import { sysRoleType } from 'src/pages/Role/config.js';
import ItemCon from './ItemCon';

const Wrap = styled.p`
  font-size: 12px;
  font-weight: bold;
  color: #9e9e9e;
  padding-left: 18px;
  margin: 10px 0 4px 0;
`;

export default class Con extends React.Component {
  handleSortEnd = list => {
    const { handleMoveApp, roleList, isForPortal } = this.props;
    const sysList = roleList.filter(o => sysRoleType.includes(o.roleType));
    const newList = isForPortal ? list : [...sysList, ...list];
    this.props.onChange({ roleList: newList });
    handleMoveApp && handleMoveApp(newList);
  };

  render() {
    const { dataList, roleId, isForPortal, roleList } = this.props;
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
                item={o}
                onChoose={roleId => {
                  this.props.onSelect(roleId);
                  this.props.handleChangePage(() => {
                    this.props.onChange({
                      roleId,
                    });
                  });
                }}
                isForPortal={isForPortal}
                roleId={roleId}
                dataList={dataList}
                onAction={(o, data) => {
                  this.props.onAction(o, data);
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
                onChoose={roleId => {
                  this.props.onSelect(roleId);
                  this.props.handleChangePage(() => {
                    this.props.onChange({
                      roleId,
                    });
                  });
                }}
                dataList={dataList}
                onAction={(o, data) => {
                  this.props.onAction(o, data);
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
