/**
 * 选择群组
 */
/**
 * 选择群组
 */
import React, { Component } from 'react';
import User from './User';
import NoData from './NoData';
import Group from './Group';
import autobind from './autobind';

export default class GroupList extends Component {
  getChecked(group) {
    return !!this.props.selectedGroups.filter(item => item.groupId === group.groupId).length;
  }
  render() {
    let data = this.props.data;
    if (data.normalGroups && data.normalGroups.list.length) {
      return (
        <div className="GSlect-groupContent">
          {!data.sharedGroups.length ? null : (
            <div>
              <div className="GSelect-navTitle">{_l('最常使用的群组')}</div>
              {data.sharedGroups.map(group => {
                return <Group group={group} key={`share-${group.groupId}`} onChange={this.props.toggleGroupSelect} checked={this.getChecked(group)} />;
              })}
            </div>
          )}
          <div>
            <div className="GSelect-navTitle">{_l('按字母A-Z顺序')}</div>
            {data.normalGroups.list.map(group => {
              return <Group group={group} key={`normal-${group.groupId}`} onChange={this.props.toggleGroupSelect} checked={this.getChecked(group)} />;
            })}
          </div>
        </div>
      );
    }
    return <NoData>{this.props.keywords ? _l('搜索无结果') : _l('无结果')}</NoData>;
  }
}
