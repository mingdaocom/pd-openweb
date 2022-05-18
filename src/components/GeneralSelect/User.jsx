import React, { Component, Fragment } from 'react';
import { Checkbox } from 'ming-ui';
import UserHead from 'src/pages/feed/components/userHead';
import UserName from 'src/pages/feed/components/userName';
import { Tooltip } from 'antd';

export default class User extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    this.props.onChange(this.props.user);
  }
  render() {
    let { projectId, user, checked, includeUndefinedAndMySelf } = this.props;
    const shouldShowInfo = !(includeUndefinedAndMySelf && user.accountId === md.global.Account.accountId);
    let department = user.fullDepartment ? user.fullDepartment.departmentFullName : user.department;

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

        {shouldShowInfo &&
          ((user.fullDepartment && user.fullDepartment.departmentName) ||
            user.department ||
            user.job ||
            user.companyName) && (
            <div className="GSelect-User__companyName">
              {projectId ? (
                <Fragment>
                  <Tooltip title={department}>
                    <span>{user.fullDepartment ? user.fullDepartment.departmentName : user.department}</span>
                  </Tooltip>
                  {department && user.job && ' / '}
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
