/**
 * 选择成员（按部门或群组）
 */
import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Checkbox, Tooltip } from 'ming-ui/antd-components';
import NoData from './NoData';
import { isAccountChecked, isAccountIncluded } from './selection';
import User from './User';
import './css/user.less';

export default class DepartmentGroupUserList extends Component {
  constructor(props) {
    super(props);
    const isCheckedGroupOnlyMyJoin = localStorage.getItem('isCheckedGroupOnlyMyJoin');
    this.state = {
      onlyJoinGroupChecked: isCheckedGroupOnlyMyJoin ? safeParse(isCheckedGroupOnlyMyJoin) : true,
    };
  }

  onlyShowJoinGroup = checked => {
    this.setState({ onlyJoinGroupChecked: !checked });
    safeLocalStorageSetItem('isCheckedGroupOnlyMyJoin', !checked);
    if (_.isFunction(this.props.userAction)) {
      this.props.userAction();
    }
  };

  render() {
    let { list = [] } = this.props.data;
    let { selectedUsers = [], selectedAccountIds = [], tabType } = this.props;
    let { ID, NAME, COUNT } = this.props.getKeys(tabType);
    const { onlyJoinGroupChecked } = this.state;

    return (
      <div className="flexColumn flex">
        <Checkbox
          className="mBottom10 pLeft7 mTop10"
          checked={onlyJoinGroupChecked}
          onChange={event => this.onlyShowJoinGroup(!event.target.checked, undefined, event)}
        >
          {_l('只看我加入的群组')}
        </Checkbox>
        {list.length > 0 ? (
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
                      title={
                        !isAllSelectedAccountIds
                          ? ''
                          : tabType === 'department'
                            ? _l('部门下所有人已加入')
                            : _l('群组下所有人已加入')
                      }
                    >
                      <span>
                        <Checkbox
                          className="GSelect-treeItem--checkbox"
                          disabled={this.props.unique || isAllSelectedAccountIds}
                          checked={checked}
                          onChange={() => this.props.allSelectUserItem(department[ID], checked)}
                        />
                      </span>
                    </Tooltip>

                    <div className="flex flexRow pointer" onClick={() => this.props.toggleUserItem(department[ID])}>
                      <div className="GSelect-treeItem-name overflow_ellipsis">{department[NAME]}</div>
                      <div className="GSelect-treeItem-number">{`（${department[COUNT]}人）`}</div>
                    </div>
                    {/* {this.props.unique ? null : (
                    <div
                      className="GSelect-treeItem-allSelect colorPrimary"
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
                            checked={isAccountChecked(user, this.props.selectedUsers, this.props.selectedAccountIds)}
                            projectId={this.props.projectId}
                            onChange={this.props.onChange}
                            key={user.accountId}
                            disabled={isAccountIncluded(user, this.props.selectedAccountIds)}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <NoData>{this.props.keywords ? _l('无搜索结果') : _l('暂无成员')}</NoData>
        )}
      </div>
    );
  }
}
