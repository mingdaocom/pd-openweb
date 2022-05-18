/**
 * 选择成员（全部）
 */
/**
 * 选择成员（全部）
 */
import React, { Component } from 'react';
import User from './User';
import NoData from './NoData';

export default class DefaultUserList extends Component {
  getChecked(user) {
    return !!this.props.selectedUsers.filter(item => item.accountId === user.accountId).length;
  }
  render() {
    let data = this.props.data;
    const includeUndefinedAndMySelf = { includeUndefinedAndMySelf: this.props.includeUndefinedAndMySelf || false };
    if (
      (data.oftenUsers && data.oftenUsers.list && data.oftenUsers.list.length) ||
      (data.users && data.users.list.length)
    ) {
      return (
        <div className="GSlect-defaultUsersContent">
          {data.oftenUsers && data.oftenUsers.list && data.oftenUsers.list.length ? (
            <div>
              <div className="GSelect-navTitle">{_l('与我经常协作的联系人')}</div>
              {data.oftenUsers.list.map(user => (
                <User
                  user={user}
                  {...includeUndefinedAndMySelf}
                  onChange={this.props.onChange}
                  projectId={this.props.projectId}
                  checked={this.getChecked(user)}
                  key={'oftenUser' + user.accountId}
                />
              ))}
            </div>
          ) : null}
          {data.users && data.users.list.length ? (
            <div>
              <div className="GSelect-navTitle">{_l('按拼音A-Z排序')}</div>
              {data.users.list.map(user => (
                <User
                  user={user}
                  onChange={this.props.onChange}
                  projectId={this.props.projectId}
                  checked={this.getChecked(user)}
                  key={'user' + user.accountId}
                />
              ))}
            </div>
          ) : null}
        </div>
      );
    }
    return <NoData>{this.props.keywords ? _l('搜索无结果') : _l('无结果')}</NoData>;
  }
}
