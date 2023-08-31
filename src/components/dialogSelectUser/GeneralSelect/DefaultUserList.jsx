/**
 * 选择成员（全部）
 */
/**
 * 选择成员（全部）
 */
import React, { Component } from 'react';
import User from './User';
import NoData from './NoData';
import _ from 'lodash';

export default class DefaultUserList extends Component {
  getChecked(user) {
    return !!this.props.selectedUsers.filter(item => item.accountId === user.accountId).length;
  }
  render() {
    let data = this.props.data;
    const otherOptions = {
      includeMySelf: this.props.includeMySelf || false,
      includeUndefinedAndMySelf: this.props.includeUndefinedAndMySelf || false,
    };
    if (
      (data.oftenUsers && data.oftenUsers.list && data.oftenUsers.list.length) ||
      (data.users && data.users.list.length)
    ) {
      const totalList = (_.get(data, 'oftenUsers.list') || []).concat(_.get(data, 'users.list') || []);
      const currentId = _.get(
        _.find(totalList, (i, idx) => idx === this.props.currentIndex),
        'accountId',
      );
      const isOften = this.props.currentIndex <= (_.get(data, 'oftenUsers.list') || []).length - 1;
      return (
        <div className="GSlect-defaultUsersContent">
          {data.oftenUsers && data.oftenUsers.list && data.oftenUsers.list.length ? (
            <div>
              <div className="GSelect-navTitle">{_l('最常协作')}</div>
              {data.oftenUsers.list.map(user => (
                <User
                  {...otherOptions}
                  user={user}
                  onChange={this.props.onChange}
                  projectId={this.props.projectId}
                  checked={this.getChecked(user)}
                  key={'oftenUser' + user.accountId}
                  currentId={isOften ? currentId : ''}
                />
              ))}
            </div>
          ) : null}
          {data.users && data.users.list.length ? (
            <div>
              <div className="GSelect-navTitle">{_l('按拼音A-Z排序')}</div>
              {data.users.list.map(user => (
                <User
                  {...otherOptions}
                  user={user}
                  onChange={this.props.onChange}
                  projectId={this.props.projectId}
                  checked={this.getChecked(user)}
                  key={'user' + user.accountId}
                  currentId={isOften ? '' : currentId}
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
