/**
 * 选择成员（按部门或群组）
 */
import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Checkbox, Tooltip } from 'ming-ui';
import NoData from './NoData';
import User from './User';
import './css/user.less';

export default class DepartmentGroupUserList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      onlyJoinGroupChecked: localStorage.getItem('isCheckedGroupOnlyMyJoin')
        ? safeParse(localStorage.getItem('isCheckedGroupOnlyMyJoin'))
        : true,
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

  onlyShowJoinGroup = checked => {
    this.setState({ onlyJoinGroupChecked: !checked });
    safeLocalStorageSetItem('isCheckedGroupOnlyMyJoin', !checked);
    this.props.userAction();
  };

  render() {
    let { list = [] } = this.props.data;
    let { selectedUsers = [], selectedAccountIds = [], tabType } = this.props;
    let { ID, NAME, COUNT } = this.props.getKeys(tabType);
    const { onlyJoinGroupChecked } = this.state;

    if (list.length) {
      return (
        <div className="flexColumn flex">
          <Checkbox className="mBottom10 pLeft7 mTop10" checked={onlyJoinGroupChecked} onClick={this.onlyShowJoinGroup}>
            {_l('只看我加入的群组')}
          </Checkbox>
          <div className="flex">
            {list.map(department => {
              const checked =
                (selectedUsers.length || selectedAccountIds.length) && (department.users || []).length
                  ? _.every(department.users || [], u =>
                      _.includes(selectedUsers.map(l => l.accountId).concat(selectedAccountIds), u.accountId),
                    )
                  : false;
              const isAllSelectedAccountIds =
                checked &&
                !(department.users || []).filter(l => !selectedAccountIds.includes(l.accountId)).length &&
                !!department[COUNT];

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
                    <Tooltip
                      text={tabType === 'department' ? _l('部门下所有人已加入') : _l('群组下所有人已加入')}
                      disable={!isAllSelectedAccountIds}
                    >
                      <span>
                        <Checkbox
                          className="GSelect-treeItem--checkbox"
                          disabled={this.props.unique || isAllSelectedAccountIds}
                          checked={checked}
                          onClick={() => this.props.allSelectUserItem(department[ID], checked)}
                        />
                      </span>
                    </Tooltip>

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
                            disabled={this.getIncluded(user)}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return <NoData>{this.props.keywords ? _l('无搜索结果') : _l('暂无成员')}</NoData>;
  }
}
