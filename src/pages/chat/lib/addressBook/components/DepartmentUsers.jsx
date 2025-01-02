import React, { Component, Fragment } from 'react';
import UserDetail from './/UserDetail';
import styled from 'styled-components';
import { ScrollView, Icon, LoadDiv } from 'ming-ui';
import _ from 'lodash';

const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const UsersWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  .justifyCenter {
    justify-content: center;
  }
  .GSelect-User {
    padding-left: 15px !important;
  }
  .projectInfo {
    font-size: 13px;
    margin: 16px 30px 24px 24px;
  }
  .userListContainer {
    position: relative;
  }
`;

const UserItem = styled.div`
  display: flex;
  padding: 6px 0 6px 24px;
  margin-bottom: 10px;
  font-size: 14px;
  line-height: 32px;
  cursor: pointer;
  &:hover {
    background-color: #f5f5f5;
  }
  .avatar {
    margin-right: 10px;
    img {
      width: 32px;
      height: 32px;
      border-radius: 50%;
    }
  }
  .fullname,
  .jobs {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .fullname {
    color: #151515;
  }
  .jobs {
    color: #757575;
  }
  .rightArrow {
    width: 32px;
    height: 32px;
    .icon {
      display: none;
    }
  }
  &:hover {
    .rightArrow {
      .icon {
        display: inline-block;
      }
    }
  }
`;

export default class DepartmentUsers extends Component {
  constructor(props) {
    super(props);
    this.state = { showDetail: props.selectedAccountId ? true : false, selectedAccountId: props.selectedAccountId };
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.groupId, nextProps.groupId)) {
      this.setState({ showDetail: false });
    }
    if (nextProps.selectedAccountId && !_.isEqual(this.props.selectedAccountId, nextProps.selectedAccountId)) {
      this.setState({ selectedAccountId: nextProps.selectedAccountId, showDetail: true });
    }
  }

  handleScrollEnd = () => {
    const { groupId, isMoreUsers, projectId } = this.props;
    const project = _.find(md.global.Account.projects, { projectId });
    if (isMoreUsers) {
      if (project.projectId === groupId) {
        this.props.handleLoadAll();
      } else {
        this.props.handleSelectGroup();
      }
    }
  };
  render() {
    const { usersLoading, groupList = [], allCount, groupName } = this.props;
    let { showDetail, selectedAccountId } = this.state;
    return (
      <Fragment>
        {usersLoading && (
          <LoadingWrapper className="flexColumn h100 ">
            <LoadDiv />
          </LoadingWrapper>
        )}
        {!showDetail && !usersLoading && (
          <UsersWrapper className="flex">
            {groupName && <div className="projectInfo">{`${groupName}${allCount ? `(${allCount})` : ''}`}</div>}
            {groupList.length > 0 && (
              <div className="userListContainer flex">
                <ScrollView className="flex" onScrollEnd={this.handleScrollEnd}>
                  {groupList.length ? (
                    <Fragment>
                      {groupList.map((item, index) => {
                        let jobs = (item.jobInfos || []).map(n => n.jobName).join(';');
                        return (
                          <UserItem
                            key={`${item.accountId}-${index}`}
                            onClick={() => {
                              this.setState({ selectedAccountId: item.accountId, showDetail: true });
                            }}
                          >
                            <div className="avatar">
                              <img src={item.avatar} alt="" />
                            </div>
                            <div className="fullname flex" title={item.fullname}>
                              {item.fullname}
                            </div>
                            <div className="jobs flex" title={jobs}>
                              {jobs}
                            </div>
                            <div className="rightArrow pRight16">
                              <Icon icon="arrow-right-border" />
                            </div>
                          </UserItem>
                        );
                      })}
                    </Fragment>
                  ) : (
                    <div className="Gray_75 TxtCenter justifyCenter flexRow valignWrapper h100">{_l('暂无成员')}</div>
                  )}
                </ScrollView>
              </div>
            )}
          </UsersWrapper>
        )}

        {showDetail && (
          <UserDetail
            accountId={selectedAccountId}
            projectId={this.props.projectId}
            hideBackBtn={this.props.hideBackBtn}
            back={() => {
              this.setState({ showDetail: false });
            }}
          />
        )}
      </Fragment>
    );
  }
}
