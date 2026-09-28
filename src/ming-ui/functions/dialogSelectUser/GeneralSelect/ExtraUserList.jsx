import React, { Component } from 'react';
import _ from 'lodash';
import NoData from './NoData';
import { isAccountChecked, isAccountIncluded } from './selection';
import User from './User';

export default class ExtraUserList extends Component {
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
                  checked={isAccountChecked(user, this.props.selectedUsers, this.props.selectedAccountIds)}
                  key={'user' + user.accountId}
                  currentId={currentId}
                  disabled={isAccountIncluded(user, this.props.selectedAccountIds)}
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
