import React, { Component } from 'react';
import _ from 'lodash';
import { Icon, Tooltip } from 'ming-ui';
import ManageOftenUserDialog from './ManageOftenUserDialog';
import NoData from './NoData';
import User from './User';

export default class DefaultUserList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      manageOftenUserVisible: false,
    };
  }

  getChecked(user) {
    return (
      !!this.props.selectedUsers.filter(item => item.accountId === user.accountId).length || this.getIncluded(user)
    );
  }

  getIncluded(user) {
    return _.includes(this.props.selectedAccountIds || [], user.accountId);
  }

  renderOftenEmpty = () => {
    return <div className="Gray_bd mTop16 mBottom16">{_l('暂无最常协作人员')}</div>;
  };

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
      const { manageOftenUserVisible } = this.state;
      const totalList = (_.get(data, 'oftenUsers.list') || []).concat(_.get(data, 'users.list') || []);
      const currentId = _.get(
        _.find(totalList, (i, idx) => idx === this.props.currentIndex),
        'accountId',
      );
      const isOften = this.props.currentIndex <= (_.get(data, 'oftenUsers.list') || []).length - 1;
      return (
        <div className="GSlect-defaultUsersContent">
          {!this.props.hideOftenUsers && data.oftenUsers && data.oftenUsers.list ? (
            <div>
              <div className="GSelect-navTitle">
                {_l('最常协作')}
                {!this.props.hideManageOftenUsers && !window.isPublicApp && !md.global.Account.isPortal && (
                  <Tooltip text={_l('管理最常协作人员')}>
                    <span className="listBtn Hand" onClick={() => this.setState({ manageOftenUserVisible: true })}>
                      <Icon icon="list" className="#9E9E9E Font20" />
                    </span>
                  </Tooltip>
                )}
              </div>
              {!data.oftenUsers.list.length && this.renderOftenEmpty()}
              {data.oftenUsers.list.map(user => (
                <User
                  {...otherOptions}
                  user={user}
                  onChange={this.props.onChange}
                  projectId={this.props.projectId}
                  checked={this.getChecked(user)}
                  key={'oftenUser' + user.accountId}
                  currentId={isOften ? currentId : ''}
                  disabled={this.getIncluded(user)}
                />
              ))}
              <ManageOftenUserDialog
                userOptions={{
                  ...otherOptions,
                  projectId: this.props.projectId,
                  onChange: this.props.onChange,
                  currentId: currentId,
                }}
                visible={manageOftenUserVisible}
                onOk={this.props.refreshOftenUser}
                onClose={() => this.setState({ manageOftenUserVisible: false })}
                dialogSelectUser={this.props.dialogSelectUser}
              />
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
                  disabled={this.getIncluded(user)}
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
