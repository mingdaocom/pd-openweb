import React, { Component, Fragment } from 'react';
import { Checkbox, UserHead, Tooltip } from 'ming-ui';
import departmentAjax from 'src/api/department.js';
import cx from 'classnames';
import _ from 'lodash';

export default class User extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleClick = this.handleClick.bind(this);
    this.promise = null;
  }

  handleClick() {
    if (this.props.disabled) return;

    this.props.onChange(this.props.user);
  }

  getFullDepartment = departmentId => {
    let { projectId } = this.props;

    if (this.promise) {
      this.promise.abort();
    }

    this.promise = departmentAjax.getDepartmentFullNameById({ departmentId, projectId });
    this.promise.then(res => {
      this.setState({ currentFullDepartment: res, departmentId });
    });
  };

  render() {
    let {
      projectId,
      user,
      checked,
      includeMySelf,
      includeUndefinedAndMySelf,
      currentId,
      disabled = false,
    } = this.props;
    const shouldShowInfo = !(
      (includeMySelf || includeUndefinedAndMySelf) &&
      user.accountId === md.global.Account.accountId
    );
    let { departmentName, departmentId } = _.get(user, 'departmentInfo') || {};
    let { currentFullDepartment = '' } = this.state;

    if (!user.accountId) return null;

    return (
      <div
        className={cx('GSelect-User', { hoverSearchUserItem: currentId === user.accountId })}
        onClick={this.handleClick}
        id={`GSelect-User-${user.accountId}`}
      >
        <Tooltip text={_l('已加入')} disable={!disabled || !checked}>
          <span>
            <Checkbox className="GSelect-User--checkbox" checked={checked} disabled={disabled} />
          </span>
        </Tooltip>
        <div className="GSelect-User__avatar">
          <UserHead
            className="circle"
            user={{
              userHead: user.avatar,
              accountId: user.accountId,
            }}
            size={28}
            projectId={projectId}
          />
        </div>
        {!shouldShowInfo ? (
          <div className="GSelect-User__fullname">{_l('我自己')}</div>
        ) : (
          <div className="GSelect-User__fullname">
            <span className="Gray">{user.fullname}</span>
          </div>
        )}

        {shouldShowInfo && (departmentName || user.job || user.companyName) && (
          <div className="GSelect-User__companyName">
            {projectId ? (
              <Fragment>
                <Tooltip text={currentFullDepartment} mouseEnterDelay={0.8}>
                  <span
                    onMouseEnter={() => {
                      this.timer = setTimeout(() => this.getFullDepartment(departmentId), 500);
                    }}
                    onMouseLeave={() => {
                      clearTimeout(this.timer);
                      if (this.promise) {
                        this.promise.abort();
                      }
                    }}
                  >
                    {departmentName}
                  </span>
                </Tooltip>
                {departmentName && user.job && ' | '}
                <span>{user.job}</span>
              </Fragment>
            ) : (
              [user.companyName, user.job].filter(item => item).join(' | ')
            )}
          </div>
        )}
      </div>
    );
  }
}
