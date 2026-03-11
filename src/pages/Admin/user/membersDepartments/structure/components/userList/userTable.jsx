import React from 'react';
import { connect } from 'react-redux';
import { Dropdown } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import { Checkbox, Icon, LoadDiv } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import {
  addUserToSet,
  fetchApproval,
  fetchCancelImportUser,
  fetchInActive,
  fetchReInvite,
  removeUserFromSet,
  updateUserOpList,
} from '../../actions/current';
import {
  loadAllUsers,
  loadApprovalUsers,
  loadInactiveUsers,
  loadUsers,
  updateApplyDateOrderBy,
} from '../../actions/entities';
import EditUser from '../EditUser';
import SortTopUp from '../SortTopUp';
import UserItem from './userItem';
import './userItem.less';

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
      { value: 'role', label: _l('角色'), checked: true, width: 160 },
      { value: 'position', label: _l('职位'), checked: true, width: 160 },
      { value: 'phone', label: _l('手机'), checked: true, width: 160 },
      { value: 'email', label: _l('邮箱'), checked: true, width: 180 },
      { value: 'jobNum', label: _l('工号'), checked: true, width: 120 },
      { value: 'adress', label: _l('工作地点'), checked: true, width: 120 },
      { value: 'joinDate', label: _l('加入时间'), checked: true, typeCursor: 0, width: 120 },
      { value: 'applyDate', label: _l('申请时间'), checked: true, typeCursor: 3, width: 160 },
      { value: 'operator', label: _l('操作者'), checked: true, typeCursor: 3, width: 160 },
    ],
    savedScrollLeft: 0, // 暂存移动位置
  };

  get columns() {
    const {
      isThisPageCheck,
      isSelectAll,
      dispatch,
      selectCount,
      typeCursor,
      usersCurrentPage = [],
      searchId = [],
      isSearch,
      searchAccountIds,
      applyDateOrderBy,
      projectId,
      isLoading,
    } = this.props;
    let { columnsInfo, dropDownVisible } = this.state;
    let columnsInfoData = JSON.parse(localStorage.getItem('columnsInfoData')) || [];
    let temp = (!_.isEmpty(columnsInfoData) && columnsInfoData) || columnsInfo;
    let isCheck = isThisPageCheck || isSelectAll;
    let checkedLength = temp.filter(
      item => (!item['typeCursor'] || item.typeCursor === this.props.typeCursor) && item.checked,
    ).length;
    let isSetShowColumn = typeCursor === 3 ? checkedLength !== 11 : checkedLength !== 9;
    let totalColWidth = 0;
    temp.forEach(item => {
      if (this.isHideCurrentColumn(item.value)) {
        totalColWidth += item.width;
      }
    });
    let setWidth = $('.listInfo') && totalColWidth > $('.listInfo').width();
    let actWidth =
      $('.listInfo').height() > 48 * usersCurrentPage.length || searchId.length || window.isFirefox ? 80 : 90;
    const selectDatas =
      isSearch && !!searchId[0] && searchAccountIds.length > 0
        ? searchAccountIds.filter(user => user.accountId === searchId[0])
        : usersCurrentPage;

    const cols = [
      {
        dataIndex: 'checkBox',
        label: '',
        checked: true,
        width: 44,
        className: cx('checkBox', {
          showCheckBox: isCheck || selectCount > 0,
          hasSelectCount: selectCount > 0,
        }),
        renderHeader: () => {
          return (
            <Checkbox
              ref="example"
              className="TxtMiddle InlineBlock mRight0 checked_selected"
              clearselected={selectCount > 0 && selectCount !== selectDatas.length && !isThisPageCheck}
              checked={isCheck}
              disabled={isLoading}
              onClick={() => {
                if (isLoading) return;
                let accountIds = _.map(selectDatas, user => user.accountId);
                if (!isCheck) {
                  dispatch(addUserToSet(accountIds));
                } else {
                  dispatch(removeUserFromSet(accountIds));
                }
              }}
            ></Checkbox>
          );
        },
      },
      {
        dataIndex: 'name',
        label: _l('姓名'),
        checked: true,
        width: 200,
        className: cx('nameTh', { left0: typeCursor !== 0, pLeft12: typeCursor !== 0 }),
        style: { width: setWidth ? 200 : 'unset' },
      },
      { dataIndex: 'department', label: _l('部门'), checked: true, width: 160, className: 'departmentTh' },
      { dataIndex: 'role', label: _l('角色'), checked: true, width: 160, className: 'roleTh' },
      { dataIndex: 'position', label: _l('职位'), checked: true, width: 160, className: 'jobTh' },
      { dataIndex: 'phone', label: _l('手机'), checked: true, width: 160, className: 'mobileTh' },
      { dataIndex: 'email', label: _l('邮箱'), checked: true, width: 180, className: 'emailTh' },
      { dataIndex: 'jobNum', label: _l('工号'), checked: true, width: 120, className: 'jobNumberTh' },
      { dataIndex: 'adress', label: _l('工作地点'), checked: true, width: 120, className: 'workSiteTh' },
      {
        dataIndex: 'joinDate',
        label: _l('加入时间'),
        checked: true,
        typeCursor: 0,
        width: 120,
        className: 'joinDateTh',
      },
      {
        dataIndex: 'applyDate',
        label: _l('申请时间'),
        checked: true,
        typeCursor: 3,
        width: 160,
        className: 'dateTh',
        renderHeader: () => {
          return (
            <div
              className="flexRow alignItemsCenter Hand"
              onClick={() => {
                const currentScrollLeft = this.tbodyContainer ? this.tbodyContainer.scrollLeft : 0;
                this.setState({ savedScrollLeft: currentScrollLeft });
                dispatch(updateApplyDateOrderBy(applyDateOrderBy === 10 ? 11 : 10));
                dispatch(loadApprovalUsers(projectId, 1));
              }}
            >
              {_l('申请时间')}
              <div className="sorter flexColumn mLeft3">
                <Icon icon="arrow-up" className={cx({ colorPrimary: applyDateOrderBy === 10 })} />
                <Icon
                  icon="arrow-down"
                  className={cx({ colorPrimary: applyDateOrderBy === 11 })}
                  style={{ marginTop: -4 }}
                />
              </div>
            </div>
          );
        },
      },
      { dataIndex: 'operator', label: _l('操作者'), checked: true, typeCursor: 3, width: 160, className: 'actMenTh' },
      {
        dataIndex: 'action',
        label: '',
        checked: true,
        typeCursor: 3,
        width: 80,
        className: 'actTh',
        style: { width: actWidth },
        renderHeader: () => {
          return (
            <Dropdown
              overlay={this.renderShowColumns}
              trigger={['click']}
              visible={dropDownVisible}
              onVisibleChange={this.handleVisibleChange}
              placement="bottomRight"
            >
              <Tooltip title={_l('自定义显示列')}>
                <Icon
                  icon="visibility"
                  className="visibiliityIcon"
                  style={isSetShowColumn ? { color: 'var(--color-primary)' } : {}}
                />
              </Tooltip>
            </Dropdown>
          );
        },
      },
    ];

    return cols;
  }

  componentWillUnmount() {
    clearActiveDialog(this.props);
  }

  componentDidUpdate(prevProps) {
    const { isLoading, typeCursor } = this.props;
    const { savedScrollLeft } = this.state;

    if (typeCursor !== 3) {
      return;
    }

    if (isLoading && savedScrollLeft) {
      if (this.tbodyContainer && this.tbodyContainer.scrollLeft !== savedScrollLeft) {
        this.tbodyContainer.scrollLeft = savedScrollLeft;
      }
      if (this.headContainer && this.headContainer.scrollLeft !== savedScrollLeft) {
        this.headContainer.scrollLeft = savedScrollLeft;
      }
    }

    if (prevProps.isLoading && !isLoading && savedScrollLeft) {
      requestAnimationFrame(() => {
        if (this.tbodyContainer) {
          this.tbodyContainer.scrollLeft = savedScrollLeft;
        }
        if (this.headContainer) {
          this.headContainer.scrollLeft = savedScrollLeft;
        }

        requestAnimationFrame(() => {
          if (this.tbodyContainer && this.tbodyContainer.scrollLeft !== savedScrollLeft) {
            this.tbodyContainer.scrollLeft = savedScrollLeft;
          }
          if (this.headContainer && this.headContainer.scrollLeft !== savedScrollLeft) {
            this.headContainer.scrollLeft = savedScrollLeft;
          }
          this.setState({ savedScrollLeft: 0 });
        });
      });
    }
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
            className="textSecondary"
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

  renderThead = () => {
    const { typeCursor } = this.props;

    return (
      <thead>
        <tr>
          {this.columns.map(({ dataIndex, className, label, width, style, renderHeader }) => {
            if (!this.isHideCurrentColumn(dataIndex) && !_.includes(['checkBox', 'action'], dataIndex)) return;

            if (typeCursor !== 0 && dataIndex === 'joinDate') return;

            if (typeCursor !== 3 && _.includes(['applyDate', 'operator'], dataIndex)) return;

            return (
              <th key={dataIndex} className={className} style={style ? style : { width }}>
                {_.isFunction(renderHeader) ? renderHeader() : label}
              </th>
            );
          })}
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

    if (_.isEmpty(usersCurrentPage)) return '';

    return usersCurrentPage.map((user, index) => {
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
          isLastTopUp={_.findLastIndex(usersCurrentPage, user => user.displayOrder > 0) === index}
          clickRow={() => {
            this.setState({
              openChangeUserInfoDrawer: true,
              editCurrentUser: {
                ...user,
                departmentInfos: (user.departmentInfos || user.departments).map(v => ({
                  departmentId: v.departmentId || v.id,
                  departmentName: v.departmentName || v.name,
                })),
                orgRoles: user.orgRoles || user.orgRoleInfos,
              },
            });
          }}
          handleSortTopUp={() => this.setState({ openSortTopUpDialog: true })}
        />
      );
    });
  };

  bodyScroll = () => {
    const { savedScrollLeft } = this.state;
    const { isLoading } = this.props;

    // 如果正在加载且有保存的滚动位置，保持滚动位置不变
    if (isLoading && savedScrollLeft !== null && savedScrollLeft !== 0) {
      if (this.tbodyContainer && this.tbodyContainer.scrollLeft !== savedScrollLeft) {
        this.tbodyContainer.scrollLeft = savedScrollLeft;
      }
      if (this.headContainer && this.headContainer.scrollLeft !== savedScrollLeft) {
        this.headContainer.scrollLeft = savedScrollLeft;
      }
      return;
    }

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
    const { savedScrollLeft } = this.state;
    const { isLoading } = this.props;

    // 如果正在加载且有保存的滚动位置，保持滚动位置不变
    if (isLoading && savedScrollLeft !== null && savedScrollLeft !== 0) {
      if (this.tbodyContainer && this.tbodyContainer.scrollLeft !== savedScrollLeft) {
        this.tbodyContainer.scrollLeft = savedScrollLeft;
      }
      if (this.headContainer && this.headContainer.scrollLeft !== savedScrollLeft) {
        this.headContainer.scrollLeft = savedScrollLeft;
      }
      return;
    }

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
    const {
      isLoading,
      projectId,
      dispatch,
      typeCursor,
      pageIndex,
      departmentId,
      authority = [],
      departmentName,
    } = this.props;
    const { openChangeUserInfoDrawer, editCurrentUser = {}, openSortTopUpDialog } = this.state;

    return (
      <div className="tableContent">
        <div className="theadContainer" ref={node => (this.headContainer = node)} onScroll={this.headScroll}>
          <table className="usersTable overflowTable" cellSpacing="0">
            {this.renderThead()}
          </table>
        </div>
        <div className="tbodyContainer" ref={node => (this.tbodyContainer = node)} onScroll={this.bodyScroll}>
          {isLoading ? (
            <LoadDiv size="small" className="mTop30" />
          ) : (
            <table className="usersTable overflowTable" cellSpacing="0">
              <tbody>{this.renderCon()}</tbody>
            </table>
          )}
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
        {openSortTopUpDialog && (
          <SortTopUp
            visible={openSortTopUpDialog}
            projectId={projectId}
            departmentId={departmentId}
            departmentName={departmentName}
            onOk={() => refreshData(departmentId, typeCursor, projectId, 1, dispatch)}
            onCancel={() => this.setState({ openSortTopUpDialog: false })}
          />
        )}
      </div>
    );
  }
}

UserTable.propTypes = {};

const mapStateToProp = state => {
  const {
    pagination: { userList = {} },
    entities: { users, departments, searchUsers, applyDateOrderBy },
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
  let departmentInfos = departments[departmentId];

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
    isSearch: userList?.isSearchResult,
    searchId,
    showSeachResult,
    departmentId,
    pageIndex,
    departmentName: departmentInfos ? departmentInfos.departmentName : '',
    applyDateOrderBy,
    isLoading: userList?.isLoading,
  };
};

const connectedUserTable = connect(mapStateToProp)(UserTable);

export default connectedUserTable;
