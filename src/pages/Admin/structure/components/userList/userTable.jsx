import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import DropDownCheck from './dropDownCheck';
import UserItem from './userItem';
import { LoadDiv, Icon, Checkbox } from 'ming-ui';
import classNames from 'classnames';
import { updateUserOpList, removeUserFromSet, addUserToSet, updateSelectAll } from '../../actions/current';
import './userItem.less';
const renderUsers = props => {
  let { usersCurrentPage = [], projectId, chargeUsers = [], searchAccountIds, searchId = [], isSearch } = props;
  if (isSearch && !!searchId[0] && searchAccountIds.length > 0) {
    usersCurrentPage = searchAccountIds.filter(user => user.accountId === searchId[0]);
  }
  if (usersCurrentPage.length <= 0) return '';
  return _.sortBy(usersCurrentPage, user => !_.includes(chargeUsers, user.accountId)).map((user, index) => {
    const isChargeUser = _.includes(chargeUsers, user.accountId);
    return (
      <UserItem
        isSearch={props.isSearch}
        isChargeUser={isChargeUser}
        user={user}
        projectId={projectId}
        key={user.accountId || index}
        // onInputChange={handleInputChange}
      />
    );
  });
};

const clearActiveDialog = props => {
  const { dispatch } = props;
  dispatch(updateUserOpList(null));
};

class UserTable extends React.Component {
  state = {
    isMinSc: false, //document.body.clientWidth <= 1380
  };

  componentWillUnmount() {
    clearActiveDialog(this.props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    //搜索结果层出现时不需要更新数据
    return !nextProps.showSeachResult;
  }

  renderNullState() {
    const { typeCursor } = this.props;
    return (
      <div className="TxtCenter listPhContent">
        <div>
          <div className="nullState InlineBlock">
            <Icon className="" icon={'Empty_data'} />
          </div>
          <h6 className="Bold Font15 txtCenter mTop20 mBottom0">
            {typeCursor === 2 ? _l(`无未激活成员`) : typeCursor === 3 ? _l(`无待审核成员`) : ''}
          </h6>
          <p
            className="Gray_c"
            style={{
              maxWidth: '270px',
              margin: '10px auto',
            }}
          >
            {typeCursor === 2
              ? _l(`管理员通过手机和邮箱添加的成员未激活时会显示在这里`)
              : typeCursor === 3
              ? _l(`通过链接、搜索企业账号、非管理员通过邮箱或手机号邀请的成员会显示在这里`)
              : _l('暂无成员，您可以点击顶部操作添加成员')}
          </p>
        </div>
      </div>
    );
  }

  renderThead = props => {
    const { isThisPageCheck, isSelectAll, dispatch, selectCount, typeCursor } = props;
    let isCheck = isThisPageCheck || isSelectAll;
    return (
      <thead>
        <tr>
          {
            <th
              className={classNames('checkBox', {
                showCheckBox: isCheck,
                hasSelectCount: selectCount > 0,
                opacity0: typeCursor === 2 || typeCursor === 3,
              })}
            >
              <Checkbox
                ref="example"
                className="TxtMiddle InlineBlock mRight0"
                checked={isCheck}
                // id="1"
                onClick={(checked, id) => {
                  let accountIds = _.map(props.usersCurrentPage, user => user.accountId);
                  if (!isCheck) {
                    dispatch(addUserToSet(accountIds));
                  } else {
                    dispatch(removeUserFromSet(accountIds));
                  }
                }}
              ></Checkbox>
              {/* <DropDownCheck
              className='Gray_75'
              chooseThisPage={() => {
                let accountIds = _.map(props.usersCurrentPage, user => user.accountId);
                // if (!isCheck) {
                //   dispatch(addUserToSet(accountIds));
                // } else {
                //   dispatch(removeUserFromSet(accountIds));
                // }
                dispatch(addUserToSet(accountIds));
              }} chooseAll={() => {
                dispatch(updateSelectAll(true))
              }} /> */}
            </th>
          }
          <th className="TxtLeft nameTh">{_l('姓名')}</th>
          {props.typeCursor === 3 && <th className="statusTh">{_l('状态')}</th>}
          <th className="TxtLeft jobTh">{_l('职位')}</th>
          {/* {props.isSearch ? <th>{_l('部门')}</th> : null} */}
          <th className="departmentTh">{_l('部门')}</th>
          <th className="workSiteTh">{_l('工作地点')}</th>
          <th className="jobNumberTh">{_l('工号')}</th>
          <th className="mobileTh">{_l('手机')}</th>
          {!this.state.isMinSc && <th className="emailTh">{_l('邮箱')}</th>}
          {!this.state.isMinSc && props.typeCursor === 3 && (
            <React.Fragment>
              <th className="dateTh">{_l('申请日期')}</th>
              <th className="actMenTh">{_l('操作者')}</th>
            </React.Fragment>
          )}
          <th width="50px" className="pRight15 actTh">
            {_l('操作')}
          </th>
        </tr>
      </thead>
    );
  };

  renderCon = () => {
    if (this.props.allCount !== 0) {
      return renderUsers(this.props);
    } else {
      return this.renderNullState();
    }
  };

  render() {
    const { isLoading } = this.props;
    if (isLoading) return <LoadDiv />;
    return (
      <div>
        <table className="usersTable overflowTable" cellSpacing="0">
          {this.renderThead(this.props)}
          <tbody>{this.renderCon()}</tbody>
        </table>
      </div>
    );
  }
}

UserTable.propTypes = {};

const mapStateToProp = (state, ownProps) => {
  const {
    pagination: { userList = {} },
    entities: { users, departments, searchUsers },
    current: { selectedAccountIds = [], activeAccountId, typeCursor, isSelectAll, departmentId },
    search: { accountIds = [], showSeachResult = false },
  } = state;
  let data = departments[departmentId] || {};
  const { chargeUsers = [] } = data;
  const usersPagination = userList && userList.ids ? userList : { ids: [] };
  // const usersCurrentPage = []
  // usersPagination.ids.map(id => {
  //   if (!!users[id]) {
  //     usersCurrentPage.push(users[id])
  //   }
  // });

  const { ids = [], searchId = [] } = userList;
  let isThisPageCheck = selectedAccountIds.length > 0 ? true : false;
  ids.map(it => {
    if (!_.includes(selectedAccountIds, it)) {
      isThisPageCheck = false;
    }
  });

  return {
    ...usersPagination,
    activeAccountId,
    // isChecked,
    isSelectAll,
    chargeUsers,
    usersCurrentPage: users,
    typeCursor,
    isThisPageCheck,
    selectCount: selectedAccountIds.length,
    searchAccountIds: searchUsers,
    isSearch: userList && userList.isSearchResult,
    searchId,
    showSeachResult,
  };
};

const connectedUserTable = connect(mapStateToProp)(UserTable);

export default connectedUserTable;
