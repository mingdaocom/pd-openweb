import React, { Component } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Collapse, Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import ManageOftenUserDialog from './ManageOftenUserDialog';
import NoData from './NoData';
import User from './User';

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 2px 2px 6px;
  border-radius: 3px;
  cursor: pointer;
  .icon {
    margin-top: 1px;
    margin-left: 2px;
    font-size: 18px;
    ${({ open }) => open && 'transform: rotate(-90deg); display: none;'}
  }
  &:hover {
    background-color: var(--color-background-hover);
    .icon {
      ${({ open }) => open && 'display: inline-block;'}
    }
  }
`;

export default class DefaultUserList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      manageOftenUserVisible: false,
      oftenUsersCollapseOpen: true,
      usersCollapseOpen: true,
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

  setOftenUsersCollapseOpen = () => {
    const { oftenUsersCollapseOpen } = this.state;
    this.setState({ oftenUsersCollapseOpen: !oftenUsersCollapseOpen });
  };

  setUsersCollapseOpen = () => {
    const { usersCollapseOpen } = this.state;
    this.setState({ usersCollapseOpen: !usersCollapseOpen });
  };

  renderOftenEmpty = () => {
    return <div className="textDisabled mTop16 mBottom16">{_l('暂无最常协作人员')}</div>;
  };

  render() {
    const { hideOftenUsers, keywords } = this.props;
    const { oftenUsersCollapseOpen, usersCollapseOpen } = this.state;
    let data = this.props.data;
    const otherOptions = {
      includeMySelf: this.props.includeMySelf || false,
      includeUndefinedAndMySelf: this.props.includeUndefinedAndMySelf || false,
    };
    const oftenUsersList = data.oftenUsers?.list;
    const showOftenUsers = !hideOftenUsers && (keywords ? oftenUsersList?.length > 0 : !!oftenUsersList);

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
          {showOftenUsers ? (
            <div>
              <div className="GSelect-navTitle">
                <TitleWrapper open={oftenUsersCollapseOpen} onClick={this.setOftenUsersCollapseOpen}>
                  <span>{_l('最常协作')}</span>
                  <Icon icon="navigate_before" />
                </TitleWrapper>
                {!this.props.hideManageOftenUsers && !window.isPublicApp && !md.global.Account.isPortal && (
                  <Tooltip title={_l('管理最常协作人员')}>
                    <span className="listBtn Hand" onClick={() => this.setState({ manageOftenUserVisible: true })}>
                      <Icon icon="list" className="var(--color-text-tertiary) Font20" />
                    </span>
                  </Tooltip>
                )}
              </div>
              {!data.oftenUsers.list.length && this.renderOftenEmpty()}
              <Collapse open={oftenUsersCollapseOpen}>
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
              </Collapse>
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
              <div className="GSelect-navTitle">
                <TitleWrapper open={usersCollapseOpen} onClick={this.setUsersCollapseOpen}>
                  <span>{_l('按拼音A-Z排序')}</span>
                  <Icon icon="navigate_before" />
                </TitleWrapper>
              </div>
              <Collapse open={usersCollapseOpen}>
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
              </Collapse>
            </div>
          ) : null}
        </div>
      );
    }

    return <NoData>{this.props.keywords ? _l('无搜索结果') : _l('暂无成员')}</NoData>;
  }
}
