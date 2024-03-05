/**
 * 选择成员（按部门或群组）
 */
/**
 * 选择成员（按部门或群组）
 */
import React, { Component } from 'react';
import { Checkbox } from 'ming-ui';
import User from './User';
import cx from 'classnames';
import NoData from './NoData';

import './css/user.less';
import _ from 'lodash';

export default class DepartmentGroupUserList extends Component {
  getChecked(user) {
    return !!this.props.selectedUsers.filter(item => item.accountId === user.accountId).length;
  }
  render() {
    let { list = [] } = this.props.data;
    let { selectedUsers = [] } = this.props;
    let { ID, NAME, COUNT } = this.props.getKeys(this.props.tabType);
    if (list.length) {
      return (
        <div>
          {list.map(department => {
            const checked =
              selectedUsers.length && (department.users || []).length
                ? _.every(department.users || [], u => _.find(selectedUsers, s => s.accountId === u.accountId))
                : false;
            return (
              <div key={department[ID]}>
                <div className="GSelect-treeItem">
                  <div className="GSelect-arrow" onClick={() => this.props.toggleUserItem(department[ID])}>
                    <i
                      className={cx(
                        'GSelect-arrow__arrowIcon',
                        department.open ? 'GSelect-arrow__arrowIcon--open' : 'GSelect-arrow__arrowIcon--close',
                      )}
                    />
                  </div>
                  <Checkbox
                    className="GSelect-treeItem--checkbox"
                    disabled={this.props.unique}
                    checked={checked}
                    onClick={() => this.props.allSelectUserItem(department[ID], checked)}
                  />
                  <div className="flex flexRow pointer" onClick={() => this.props.toggleUserItem(department[ID])}>
                    <div className="GSelect-treeItem-name overflow_ellipsis">{department[NAME]}</div>
                    <div className="GSelect-treeItem-number">{`（${department[COUNT]}人）`}</div>
                  </div>
                  {/* {this.props.unique ? null : (
                    <div
                      className="GSelect-treeItem-allSelect ThemeColor3"
                      onClick={() => }
                    >
                      {_l('全选')}
                    </div>
                  )} */}
                </div>
                {!department.open ? null : (
                  <div className="GSelect-userList">
                    {department.users.map(user => {
                      return (
                        <User
                          user={user}
                          checked={this.getChecked(user)}
                          projectId={this.props.projectId}
                          onChange={this.props.onChange}
                          key={user.accountId}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }
    return <NoData>{this.props.keywords ? _l('无搜索结果') : _l('暂无成员')}</NoData>;
  }
}
