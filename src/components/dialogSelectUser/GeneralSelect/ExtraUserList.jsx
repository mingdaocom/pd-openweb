import React, { Component } from 'react';
import User from './User';
import NoData from './NoData';

export default class ExtraUserList extends Component {
  getChecked(user) {
    return !!this.props.selectedUsers.filter(item => item.accountId === user.accountId).length;
  }
  render() {
    let data = this.props.data;
    if (data.list && data.list.length) {
      const currentId = _.get(
        _.find(data.list || [], (i, idx) => idx === this.props.currentIndex),
        'accountId',
      );
      return (
        <div>
          {data.list.length ? (
            <div>
              {data.list.map(user => (
                <User
                  user={user}
                  projectId={this.props.projectId}
                  onChange={this.props.onChange}
                  checked={this.getChecked(user)}
                  key={'user' + user.accountId}
                  currentId={currentId}
                />
              ))}
            </div>
          ) : null}
        </div>
      );
    }
    return <NoData>{this.props.keywords ? _l('无搜索结果') : _l('暂无成员')}</NoData>;
  }
}
