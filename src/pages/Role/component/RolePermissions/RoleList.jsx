import React from 'react';
import _ from 'lodash';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { sysRoleType } from 'src/pages/Role/config.js';
import ItemCon from './ItemCon';
import styled from 'styled-components';
const Wrap = styled.p`
  font-size: 12px;
  font-weight: bold;
  color: #9e9e9e;
  padding-left: 18px;
  margin: 10px 0 4px 0;
`;

const Item = SortableElement(data => <ItemCon {...data} />);
const SortableList = SortableContainer(props => {
  return (
    <div>
      {_.map(props.items, (item, index) => {
        return <Item {...props} item={item} index={index} />;
      })}
    </div>
  );
});

export default class Con extends React.Component {
  handleSortEnd = ({ oldIndex, newIndex }) => {
    const { handleMoveApp, roleList, isForPortal } = this.props;
    const sysList = roleList.filter(o => sysRoleType.includes(o.roleType));
    const otherList = roleList.filter(o => !sysRoleType.includes(o.roleType));
    if (oldIndex === newIndex) return;
    const list = otherList.slice();
    const currentItem = list.splice(oldIndex, 1)[0];
    list.splice(newIndex, 0, currentItem);
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
            isForPortal={isForPortal}
            roleId={roleId}
            useDragHandle
            onSortEnd={this.handleSortEnd}
            helperClass={''}
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
          />
        )}
      </ul>
    );
  }
}
