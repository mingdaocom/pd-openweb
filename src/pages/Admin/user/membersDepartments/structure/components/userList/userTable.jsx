import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import UserItem from './userItem';
import { LoadDiv, Icon, Checkbox, Tooltip } from 'ming-ui';
import { Dropdown } from 'antd';
import EditUser from '../EditUser';
import classNames from 'classnames';
import {
  updateUserOpList,
  removeUserFromSet,
  addUserToSet,
  updateSelectAll,
  fetchInActive,
  fetchApproval,
  fetchReInvite,
  fetchCancelImportUser,
} from '../../actions/current';
import { loadUsers, loadInactiveUsers, loadApprovalUsers, loadAllUsers } from '../../actions/entities';
import cx from 'classnames';
import './userItem.less';
import _ from 'lodash';

const clearActiveDialog = props => {
  const { dispatch } = props;
  dispatch(updateUserOpList(null));
};

const refreshData = (departmentId, typeCursor, projectId, pageIndex, dispatch) => {
  if (departmentId) {
    dispatch(loadUsers(departmentId, pageIndex));
  } else {
    switch (typeCursor) {
      case 0:
        dispatch(loadAllUsers(projectId, pageIndex));
        break;
      case 1:
        dispatch(loadUsers(departmentId, pageIndex));
        break;
      case 2:
        dispatch(loadInactiveUsers(projectId, pageIndex));
        break;
      case 3:
        dispatch(loadApprovalUsers(projectId, pageIndex));
        break;
    }
  }
};

class UserTable extends React.Component {
  state = {
    isMinSc: false, //document.body.clientWidth <= 1380
    columnsInfo: [
      { value: 'name', label: _l('姓名'), checked: true, width: 200 },
      { value: 'department', label: _l('部门'), checked: true, width: 160 },
      { value: 'position', label: _l('职位'), checked: true, width: 160 },
      { value: 'phone', label: _l('手机'), checked: true, width: 160 },
      { value: 'email', label: _l('邮箱'), checked: true, width: 180 },
      { value: 'jobNum', label: _l('工号'), checked: true, width: 120 },
      { value: 'adress', label: _l('工作地点'), checked: true, width: 120 },
      { value: 'joinDate', label: _l('加入时间'), checked: true, typeCursor: 0, width: 120 },
      { value: 'applyDate', label: _l('申请时间'), checked: true, typeCursor: 3, width: 160 },
      { value: 'operator', label: _l('操作者'), checked: true, typeCursor: 3, width: 160 },
    ],
  };

  componentWillUnmount() {
    clearActiveDialog(this.props);
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
            className="Gray_75"
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
  handleClickStastics = checked => {
    let { columnsInfo } = this.state;
    let copyColumnsInfo = [];
    if (checked) {
      copyColumnsInfo = columnsInfo.map(item => {
        if (item.value !== 'name') {
          return { ...item, checked: false };
        }
        return item;
      });
    } else {
      copyColumnsInfo = columnsInfo.map(item => ({ ...item, checked: true }));
    }
    safeLocalStorageSetItem('columnsInfoData', JSON.stringify(copyColumnsInfo));
    this.setState({ columnsInfo: copyColumnsInfo });
  };
  handleSingleColumn = (checked, value) => {
    let { columnsInfo } = this.state;
    let columnsInfoData = JSON.parse(localStorage.getItem('columnsInfoData')) || [];
    let temp = (!_.isEmpty(columnsInfoData) && columnsInfoData) || columnsInfo;
    let copyColumnsInfo = temp.map(item => {
      if (item.value === value) {
        return { ...item, checked: !checked };
      }
      return item;
    });
    safeLocalStorageSetItem('columnsInfoData', JSON.stringify(copyColumnsInfo));
    this.setState({ columnsInfo: copyColumnsInfo });
  };
  renderShowColumns = () => {
    const { typeCursor } = this.props;
    let { columnsInfo } = this.state;
    let columnsInfoData = JSON.parse(localStorage.getItem('columnsInfoData')) || [];
    let temp = ((!_.isEmpty(columnsInfoData) && columnsInfoData) || columnsInfo || []).filter(
      item => _.isUndefined(item.typeCursor) || item.typeCursor === typeCursor,
    );
    let checkedLength = temp.filter(it => it.checked).length;
    let colLength = temp.length;

    return (
      <div className="showColumnsBox">
        <div className="statistics">
          <Checkbox
            clearselected={checkedLength !== colLength}
            checked={_.every(temp, item => item.checked)}
            onClick={this.handleClickStastics}
          >
            <span className="verticalAlign">{_l('显示列 %0/%1', checkedLength, colLength)}</span>
          </Checkbox>
        </div>
        <ul>
          {temp.map(item => {
            if (
              (item['typeCursor'] && item.typeCursor !== this.props.typeCursor) ||
              (item.typeCursor === 0 && this.props.typeCursor !== 0)
            ) {
              return null;
            } else {
              return (
                <li key={item.value}>
                  <Checkbox
                    checked={item.checked}
                    onClick={checked => this.handleSingleColumn(checked, item.value)}
                    disabled={item.value === 'name'}
                  >
                    <span className="verticalAlign">{item.label}</span>
                  </Checkbox>
                </li>
              );
            }
          })}
        </ul>
      </div>
    );
  };

  isHideCurrentColumn = fields => {
    let { columnsInfo } = this.state;
    let columnsInfoData = JSON.parse(localStorage.getItem('columnsInfoData')) || [];
    let temp = (!_.isEmpty(columnsInfoData) && columnsInfoData) || columnsInfo;
    let obj = temp.filter(item => item.value === fields)[0] || {};
    return obj.checked;
  };
  handleVisibleChange = flag => {
    this.setState({ dropDownVisible: flag });
  };

  renderThead = props => {
    let {
      isThisPageCheck,
      isSelectAll,
      dispatch,
      selectCount,
      typeCursor,
      usersCurrentPage = [],
      searchId = [],
      isSearch,
      searchAccountIds,
    } = props;
    let { columnsInfo, dropDownVisible } = this.state;
    let columnsInfoData = JSON.parse(localStorage.getItem('columnsInfoData')) || [];
    let temp = (!_.isEmpty(columnsInfoData) && columnsInfoData) || columnsInfo;
    let isCheck = isThisPageCheck || isSelectAll;
    let checkedLength = temp.filter(
      item => (!item['typeCursor'] || item.typeCursor === this.props.typeCursor) && item.checked,
    ).length;
    let isSetShowColumn = typeCursor === 3 ? checkedLength !== 10 : checkedLength !== 8;
    let totalColWidth = 0;
    temp.forEach(item => {
      if (this.isHideCurrentColumn(item.value)) {
        totalColWidth += item.width;
      }
    });
    let setWidth = $('.listInfo') && totalColWidth > $('.listInfo').width();
    let actWidth = $('.listInfo').height() > 48 * usersCurrentPage.length || searchId.length ? 80 : 90;
    const selectDatas =
      isSearch && !!searchId[0] && searchAccountIds.length > 0
        ? searchAccountIds.filter(user => user.accountId === searchId[0])
        : usersCurrentPage;

    return (
      <thead>
        <tr>
          <th
            className={classNames('checkBox', {
              showCheckBox: isCheck || selectCount > 0,
              hasSelectCount: selectCount > 0,
            })}
          >
            <Checkbox
              ref="example"
              className="TxtMiddle InlineBlock mRight0 checked_selected"
              clearselected={selectCount > 0 && selectCount !== selectDatas.length && !isThisPageCheck}
              checked={isCheck}
              onClick={(checked, id) => {
                let accountIds = _.map(selectDatas, user => user.accountId);
                if (!isCheck) {
                  dispatch(addUserToSet(accountIds));
                } else {
                  dispatch(removeUserFromSet(accountIds));
                }
              }}
            ></Checkbox>
          </th>
          {this.isHideCurrentColumn('name') && (
            <th
              className={cx('TxtLeft nameTh', { left0: typeCursor !== 0, pLeft12: typeCursor !== 0 })}
              style={{ width: setWidth ? 200 : 'unset' }}
            >
              {_l('姓名')}
            </th>
          )}
          {this.isHideCurrentColumn('department') && <th className="departmentTh">{_l('部门')}</th>}
          {this.isHideCurrentColumn('position') && <th className="TxtLeft jobTh">{_l('职位')}</th>}
          {this.isHideCurrentColumn('phone') && <th className="mobileTh">{_l('手机')}</th>}
          {!this.state.isMinSc && this.isHideCurrentColumn('email') && <th className="emailTh">{_l('邮箱')}</th>}
          {this.isHideCurrentColumn('jobNum') && <th className="jobNumberTh">{_l('工号')}</th>}
          {this.isHideCurrentColumn('adress') && <th className="workSiteTh">{_l('工作地点')}</th>}
          {this.isHideCurrentColumn('joinDate') && props.typeCursor === 0 && (
            <th className="joinDateTh">{_l('加入时间')}</th>
          )}
          {!this.state.isMinSc && props.typeCursor === 3 && (
            <React.Fragment>
              {this.isHideCurrentColumn('applyDate') && <th className="dateTh">{_l('申请时间')}</th>}
              {this.isHideCurrentColumn('operator') && <th className="actMenTh">{_l('操作者')}</th>}
            </React.Fragment>
          )}
          <th width="80px" className="actTh" style={{ width: actWidth }}>
            <Dropdown
              overlay={this.renderShowColumns}
              trigger={['click']}
              visible={dropDownVisible}
              onVisibleChange={this.handleVisibleChange}
              placement="bottomRight"
            >
              <Tooltip text={<span>{_l('自定义显示列')} </span>} popupPlacement="top">
                <Icon
                  icon="visibility"
                  className="visibiliityIcon"
                  style={isSetShowColumn ? { color: '#2196f3' } : {}}
                />
              </Tooltip>
            </Dropdown>
          </th>
        </tr>
      </thead>
    );
  };

  renderCon = () => {
    if (this.props.allCount !== 0) {
      return this.renderUsers(this.props);
    } else {
      return this.renderNullState();
    }
  };
  renderUsers = props => {
    let { columnsInfo } = this.state;
    let columnsInfoData = JSON.parse(localStorage.getItem('columnsInfoData')) || [];
    let temp = (!_.isEmpty(columnsInfoData) && columnsInfoData) || columnsInfo;
    let { usersCurrentPage = [], projectId, searchAccountIds, searchId = [], isSearch, authority = [] } = props;
    if (isSearch && !!searchId[0] && searchAccountIds.length > 0) {
      usersCurrentPage = searchAccountIds.filter(user => user.accountId === searchId[0]);
    }

    if (usersCurrentPage.length <= 0) return '';

    return _.sortBy(usersCurrentPage, user => !user.isDepartmentChargeUser).map((user, index) => {
      return (
        <UserItem
          authority={authority}
          isSearch={props.isSearch}
          user={user}
          projectId={projectId}
          key={user.accountId || index}
          isHideCurrentColumn={this.isHideCurrentColumn}
          columnsInfo={temp}
          dateNow={Date.now()}
          editCurrentUser={this.state.editCurrentUser}
          clickRow={() => {
            this.setState({
              openChangeUserInfoDrawer: true,
              editCurrentUser: {
                ...user,
                departmentInfos: (user.departmentInfos || user.departments).map(v => ({
                  departmentId: v.departmentId || v.id,
                  departmentName: v.departmentName || v.name,
                })),
              },
            });
          }}
        />
      );
    });
  };

  bodyScroll = () => {
    let bodyScrollLeft = this.tbodyContainer && this.tbodyContainer.scrollLeft;
    if (this.headContainer) {
      this.headContainer.scrollLeft = bodyScrollLeft;
    }
    if (bodyScrollLeft > 0) {
      $('.nameTh').addClass('fixedLeft');
    } else if (bodyScrollLeft === 0) {
      $('.nameTh').removeClass('fixedLeft');
    }

    if (this.tbodyContainer.scrollWidth - this.tbodyContainer.scrollLeft === this.tbodyContainer.clientWidth) {
      $('.actTh').removeClass('fixedRight');
    } else if (this.tbodyContainer.scrollWidth - this.tbodyContainer.scrollLeft !== this.tbodyContainer.clientWidth) {
      $('.actTh').addClass('fixedRight');
    }
  };
  headScroll = () => {
    let headScrollLeft = this.headContainer && this.headContainer.scrollLeft;
    if (this.headContainer) {
      this.tbodyContainer.scrollLeft = headScrollLeft;
    }
    if (headScrollLeft > 0) {
      $('.nameTh').addClass('fixedLeft');
    } else if (headScrollLeft === 0) {
      $('.nameTh').removeClass('fixedLeft');
    }

    if (this.headContainer.scrollWidth - this.headContainer.scrollLeft === this.headContainer.clientWidth) {
      $('.actTh').removeClass('fixedRight');
    } else if (this.headContainer.scrollWidth - this.headContainer.scrollLeft !== this.headContainer.clientWidth) {
      $('.actTh').addClass('fixedRight');
    }
  };
  render() {
    const { isLoading, projectId, dispatch, typeCursor, pageIndex, departmentId, authority = [] } = this.props;
    const { openChangeUserInfoDrawer, editCurrentUser = {} } = this.state;
    if (isLoading) return <LoadDiv />;

    return (
      <div className="tableContent">
        <div className="theadContainer" ref={node => (this.headContainer = node)} onScroll={this.headScroll}>
          <table className="usersTable overflowTable" cellSpacing="0">
            {this.renderThead(this.props)}
          </table>
        </div>
        <div className="tbodyContainer" ref={node => (this.tbodyContainer = node)} onScroll={this.bodyScroll}>
          <table className="usersTable overflowTable" cellSpacing="0">
            <tbody>{this.renderCon()}</tbody>
          </table>
        </div>
        {openChangeUserInfoDrawer && (
          <EditUser
            projectId={projectId}
            typeCursor={typeCursor}
            actType={'edit'}
            key={`editUserInfo_${editCurrentUser.accountId}`}
            accountId={editCurrentUser.accountId}
            editCurrentUser={editCurrentUser}
            departmentId={departmentId}
            openChangeUserInfoDrawer={openChangeUserInfoDrawer}
            clickSave={() => {
              refreshData(departmentId, typeCursor, projectId, pageIndex, dispatch);
              this.setState({ openChangeUserInfoDrawer: false });
            }}
            onClose={() => {
              this.setState({ openChangeUserInfoDrawer: false, editCurrentUser: {} });
            }}
            cancelInviteRemove={() => {
              dispatch(loadInactiveUsers(projectId, 1));
            }}
            fetchInActive={() => dispatch(fetchInActive(projectId))}
            fetchApproval={() => dispatch(fetchApproval(projectId))}
            fetchReInvite={(accountIds, callback) => dispatch(fetchReInvite(accountIds, callback))}
            fetchCancelImportUser={(accountIds, callback) => dispatch(fetchCancelImportUser(accountIds, callback))}
            authority={authority}
          />
        )}
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
    search: { showSeachResult = false },
  } = state;
  const usersPagination = userList && userList.ids ? userList : { ids: [] };

  const { ids = [], searchId = [], pageIndex } = userList;
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
    usersCurrentPage: users,
    typeCursor,
    isThisPageCheck,
    selectCount: selectedAccountIds.length,
    searchAccountIds: searchUsers,
    isSearch: userList && userList.isSearchResult,
    searchId,
    showSeachResult,
    departmentId,
    pageIndex,
  };
};

const connectedUserTable = connect(mapStateToProp)(UserTable);

export default connectedUserTable;
