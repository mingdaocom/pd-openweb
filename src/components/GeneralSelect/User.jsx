import React, { Component, Fragment } from 'react';
import { Checkbox } from 'ming-ui';
import UserHead from 'src/pages/feed/components/userHead';
import UserName from 'src/pages/feed/components/userName';
import { getDepartmentFullNameById } from 'src/api/department.js';
import { Tooltip } from 'antd';

export default class User extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleClick = this.handleClick.bind(this);
    this.promise = null;
  }
  handleClick() {
    this.props.onChange(this.props.user);
  }
  getFullDepartment = departmentId => {
    let { projectId } = this.props;
    if (this.promise && this.promise.state && this.promise.state() === 'pending') {
      this.promise.abort();
    }
    this.promise = getDepartmentFullNameById({ departmentId, projectId });
    this.promise.then(res => {
      this.setState({ currentFullDepartment: res, departmentId });
    });
  };
  render() {
    let { projectId, user, checked, includeUndefinedAndMySelf } = this.props;
    const shouldShowInfo = !(includeUndefinedAndMySelf && user.accountId === md.global.Account.accountId);
    let { departmentName, departmentId } = _.get(user, 'departmentInfo') || {};
    let { currentFullDepartment = '' } = this.state;
    return (
      <div className="GSelect-User" onClick={this.handleClick}>
        <Checkbox className="GSelect-User--checkbox" checked={checked} />
        <div className="GSelect-User__avatar">
          <UserHead
            className="circle"
            user={{
              userHead: user.avatar,
              accountId: user.accountId,
            }}
            lazy={'false'}
            size={32}
          />
        </div>
        {!shouldShowInfo ? (
          <div className="GSelect-User__fullname">{_l('我自己')}</div>
        ) : (
          <div className="GSelect-User__fullname">
            <UserName
              className="Gray"
              isSecretary
              user={{
                userName: user.fullname,
                accountId: user.accountId,
              }}
            />
          </div>
        )}

        {shouldShowInfo && (departmentName || user.job || user.companyName) && (
          <div className="GSelect-User__companyName">
            {projectId ? (
              <Fragment>
                <Tooltip title={currentFullDepartment} mouseEnterDelay={0.5}>
                  <span
                    onMouseEnter={() => this.getFullDepartment(departmentId)}
                    onMouseLeave={() => {
                      if (this.promise && this.promise.state && this.promise.state() === 'pending') {
                        this.promise.abort();
                      }
                    }}
                  >
                    {departmentName}
                  </span>
                </Tooltip>
                {departmentName && user.job && ' / '}
                <span>{user.job}</span>
              </Fragment>
            ) : (
              [user.companyName, user.job].filter(item => item).join(' / ')
            )}
          </div>
        )}
      </div>
    );
  }
}
