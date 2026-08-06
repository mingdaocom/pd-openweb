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

const COLUMN_INFO_STORAGE_KEY = 'columnsInfoData';
const CHECKBOX_COLUMN_WIDTH = 44;
const NAME_COLUMN_WIDTH = 200;
const ACTION_COLUMN_WIDTH = 80;
const ACTION_COLUMN_WIDTH_WITH_SCROLLBAR = 90;
const ROW_HEIGHT = 48;

const isCurrentTypeColumn = (column, typeCursor) =>
  _.isUndefined(column.typeCursor) || column.typeCursor === typeCursor;

const getDefaultCheckedLength = typeCursor => {
  if (typeCursor === 3) return 10;
  if (typeCursor === 0) return 9;
  return 8;
};

const getSavedColumnsInfo = columnsInfo => {
  const savedColumnsInfo = safeParse(localStorage.getItem(COLUMN_INFO_STORAGE_KEY), 'array');
  return _.isEmpty(savedColumnsInfo) ? columnsInfo : savedColumnsInfo;
};

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
    columnsInfo: [
      { value: 'name', label: _l('姓名'), checked: true, width: 200 },
      { value: 'department', label: _l('部门'), checked: true, width: 160 },
      { value: 'role', label: _l('角色'), checked: true, width: 160 },
      { value: 'position', label: _l('职位'), checked: true, width: 160 },
      { value: 'phone', label: _l('手机'), checked: true, width: 160 },
      { value: 'email', label: _l('邮箱'), checked: true, width: 180 },
      { value: 'jobNum', label: _l('工号'), checked: true, width: 120 },
      { value: 'adress', label: _l('工作地点'), checked: true, width: 120 },
      { value: 'joinDate', label: _l('加入时间'), checked: true, typeCursor: 0, width: 160 },
      { value: 'applyDate', label: _l('申请时间'), checked: true, typeCursor: 3, width: 160 },
      { value: 'operator', label: _l('操作者'), checked: true, typeCursor: 3, width: 160 },
    ],
    savedScrollLeft: 0, // 暂存移动位置
    scrollbarWidth: 0,
  };

  get columns() {
    const {
      isSelectAll,
      dispatch,
      selectCount,
      selectedAccountIds = [],
      typeCursor,
      usersCurrentPage = [],
      searchId = [],
      isSearch,
      searchAccountIds = [],
      applyDateOrderBy,
      projectId,
      isLoading,
    } = this.props;
    let { dropDownVisible } = this.state;
    const currentTypeColumnsInfo = this.getCurrentTypeColumnsInfo();
    const checkedLength = currentTypeColumnsInfo.filter(item => item.checked).length;
    const isSetShowColumn = checkedLength !== getDefaultCheckedLength(typeCursor);
    const actWidth = this.getActionColumnWidth(usersCurrentPage, searchId);
    const hasHorizontalScroll = this.hasHorizontalScroll(currentTypeColumnsInfo, actWidth);
    const selectDatas =
      isSearch && !!searchId[0] && searchAccountIds.length > 0
        ? searchAccountIds.filter(user => user.accountId === searchId[0])
        : usersCurrentPage;
    const selectedCurrentPageCount = isSelectAll
      ? selectDatas.length
      : selectDatas.filter(user => _.includes(selectedAccountIds, user.accountId)).length;
    const isCheck = !!selectDatas.length && selectedCurrentPageCount === selectDatas.length;
    const isCurrentPagePartialChecked = selectedCurrentPageCount > 0 && selectedCurrentPageCount < selectDatas.length;

    const cols = [
      {
        dataIndex: 'checkBox',
        label: '',
        checked: true,
        width: 44,
        className: cx('checkBox', {
          showCheckBox: isCheck || isCurrentPagePartialChecked,
          hasSelectCount: selectCount > 0,
        }),
        renderHeader: () => {
          return (
            <Checkbox
              className="TxtMiddle InlineBlock mRight0 checked_selected"
              clearselected={isCurrentPagePartialChecked}
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
        width: NAME_COLUMN_WIDTH,
        className: 'nameTh',
        style: { width: hasHorizontalScroll ? NAME_COLUMN_WIDTH : 'unset' },
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
        width: 160,
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

  getColumnsInfo = () => {
    return getSavedColumnsInfo(this.state.columnsInfo);
  };

  getCurrentTypeColumnsInfo = (columnsInfo = this.getColumnsInfo()) => {
    return columnsInfo.filter(item => isCurrentTypeColumn(item, this.props.typeCursor));
  };

  getActionColumnWidth = (
    usersCurrentPage = this.props.usersCurrentPage || [],
    searchId = this.props.searchId || [],
  ) => {
    const $listInfo = $('.listInfo');
    const listInfoHeight = $listInfo && $listInfo.length ? $listInfo.height() : 0;

    return listInfoHeight > ROW_HEIGHT * usersCurrentPage.length || searchId.length || window.isFirefox
      ? ACTION_COLUMN_WIDTH
      : ACTION_COLUMN_WIDTH_WITH_SCROLLBAR;
  };

  getTableClientWidth = () => {
    if (this.tbodyContainer) {
      return this.tbodyContainer.clientWidth;
    }

    if (this.headContainer) {
      return this.headContainer.clientWidth;
    }

    const $listInfo = $('.listInfo');
    return $listInfo && $listInfo.length ? $listInfo.width() : 0;
  };

  hasHorizontalScroll = (currentTypeColumnsInfo, actionWidth = this.getActionColumnWidth()) => {
    const tableClientWidth = this.getTableClientWidth();

    if (!tableClientWidth) return false;

    const visibleColumnsWidth = currentTypeColumnsInfo
      .filter(item => item.checked)
      .reduce((sum, item) => sum + item.width, 0);

    return visibleColumnsWidth + CHECKBOX_COLUMN_WIDTH + actionWidth > tableClientWidth;
  };

  componentDidMount() {
    this.updateScrollbarWidth();
  }

  componentWillUnmount() {
    clearActiveDialog(this.props);
  }

  componentDidUpdate(prevProps) {
    const { isLoading, typeCursor } = this.props;
    const { savedScrollLeft } = this.state;

    if (prevProps.isLoading !== isLoading) {
      this.updateScrollbarWidth();
    }

    if (typeCursor !== 3) {
      return;
    }

    if (isLoading && savedScrollLeft) {
      this.syncTableScrollLeft(savedScrollLeft);
    }

    if (prevProps.isLoading && !isLoading && savedScrollLeft) {
      requestAnimationFrame(() => {
        this.syncTableScrollLeft(savedScrollLeft);

        requestAnimationFrame(() => {
          this.syncTableScrollLeft(savedScrollLeft);

          this.setState({ savedScrollLeft: 0 });
        });
      });
    }
  }

  updateScrollbarWidth = () => {
    if (!this.tbodyContainer) return;

    const scrollbarWidth = this.tbodyContainer.offsetWidth - this.tbodyContainer.clientWidth;

    if (scrollbarWidth !== this.state.scrollbarWidth) {
      this.setState({ scrollbarWidth });
    }
  };

  syncTableScrollLeft = scrollLeft => {
    if (this.tbodyContainer && this.tbodyContainer.scrollLeft !== scrollLeft) {
      this.tbodyContainer.scrollLeft = scrollLeft;
    }

    if (this.headContainer && this.headContainer.scrollLeft !== scrollLeft) {
      this.headContainer.scrollLeft = scrollLeft;
    }
  };

  keepSavedScrollLeft = () => {
    const { savedScrollLeft } = this.state;
    const { isLoading } = this.props;

    if (isLoading && savedScrollLeft) {
      this.syncTableScrollLeft(savedScrollLeft);
      return true;
    }

    return false;
  };

  updateFixedColumnState = (scrollContainer, scrollLeft) => {
    const $tableContent = this.tableContent ? $(this.tableContent) : null;

    if (!$tableContent || !scrollContainer) return;

    $tableContent.find('.nameTh').toggleClass('fixedLeft', scrollLeft > 0);
    $tableContent
      .find('.actTh')
      .toggleClass('fixedRight', scrollContainer.scrollWidth - scrollLeft !== scrollContainer.clientWidth);
  };

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
    const columnsInfo = this.getColumnsInfo();
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

    safeLocalStorageSetItem(COLUMN_INFO_STORAGE_KEY, JSON.stringify(copyColumnsInfo));
    this.setState({ columnsInfo: copyColumnsInfo });
  };
  handleSingleColumn = (checked, value) => {
    const columnsInfo = this.getColumnsInfo();
    let copyColumnsInfo = columnsInfo.map(item => {
      if (item.value === value) {
        return { ...item, checked: !checked };
      }

      return item;
    });
    safeLocalStorageSetItem(COLUMN_INFO_STORAGE_KEY, JSON.stringify(copyColumnsInfo));
    this.setState({ columnsInfo: copyColumnsInfo });
  };
  renderShowColumns = () => {
    let temp = this.getCurrentTypeColumnsInfo();
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
          {temp.map(item => (
            <li key={item.value}>
              <Checkbox
                checked={item.checked}
                onClick={checked => this.handleSingleColumn(checked, item.value)}
                disabled={item.value === 'name'}
              >
                <span className="verticalAlign">{item.label}</span>
              </Checkbox>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  isHideCurrentColumn = (fields, columnsInfo = this.getColumnsInfo()) => {
    let obj = _.find(columnsInfo, item => item.value === fields) || {};
    return obj.checked;
  };
  handleVisibleChange = flag => {
    this.setState({ dropDownVisible: flag });
  };

  renderThead = () => {
    const { typeCursor } = this.props;
    const { scrollbarWidth } = this.state;
    const columnsInfo = this.getColumnsInfo();
    const currentTypeColumnsInfo = this.getCurrentTypeColumnsInfo(columnsInfo);
    const showScrollbarPlaceholder =
      scrollbarWidth > 0 && this.hasHorizontalScroll(currentTypeColumnsInfo, this.getActionColumnWidth());

    return (
      <thead>
        <tr>
          {this.columns.map(({ dataIndex, className, label, width, style, renderHeader }) => {
            if (!this.isHideCurrentColumn(dataIndex, columnsInfo) && !_.includes(['checkBox', 'action'], dataIndex))
              return;

            if (typeCursor !== 0 && dataIndex === 'joinDate') return;

            if (typeCursor !== 3 && _.includes(['applyDate', 'operator'], dataIndex)) return;

            return (
              <th key={dataIndex} className={className} style={style ? style : { width }}>
                {_.isFunction(renderHeader) ? renderHeader() : label}
              </th>
            );
          })}
          {showScrollbarPlaceholder && (
            <th
              key="scrollbarPlaceholder"
              style={{ width: scrollbarWidth, minWidth: scrollbarWidth, padding: 0, border: 'none' }}
            />
          )}
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
    let columnsInfo = this.getColumnsInfo();
    let { usersCurrentPage = [], projectId, searchAccountIds = [], searchId = [], isSearch, authority = [] } = props;

    if (isSearch && !!searchId[0] && searchAccountIds.length > 0) {
      usersCurrentPage = searchAccountIds.filter(user => user.accountId === searchId[0]);
    }

    if (_.isEmpty(usersCurrentPage)) return '';

    const currentTypeColumnsInfo = this.getCurrentTypeColumnsInfo(columnsInfo);
    const hasHorizontalScroll = this.hasHorizontalScroll(
      currentTypeColumnsInfo,
      this.getActionColumnWidth(usersCurrentPage, searchId),
    );
    const nameColumnStyle = { width: hasHorizontalScroll ? NAME_COLUMN_WIDTH : 'unset' };

    return usersCurrentPage.map((user, index) => {
      return (
        <UserItem
          authority={authority}
          user={user}
          projectId={projectId}
          key={user.accountId || index}
          isHideCurrentColumn={this.isHideCurrentColumn}
          columnsInfo={columnsInfo}
          nameColumnStyle={nameColumnStyle}
          editCurrentUser={this.state.editCurrentUser}
          isLastTopUp={_.findLastIndex(usersCurrentPage, user => user.displayOrder > 0) === index}
          clickRow={() => {
            this.setState({
              openChangeUserInfoDrawer: true,
              editCurrentUser: {
                ...user,
                departmentInfos: (user.departmentInfos || user.departments || []).map(v => ({
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
    if (this.keepSavedScrollLeft()) return;

    let bodyScrollLeft = this.tbodyContainer ? this.tbodyContainer.scrollLeft : 0;

    if (this.headContainer) {
      this.headContainer.scrollLeft = bodyScrollLeft;
    }

    this.updateFixedColumnState(this.tbodyContainer, bodyScrollLeft);
  };
  headScroll = () => {
    if (this.keepSavedScrollLeft()) return;

    let headScrollLeft = this.headContainer ? this.headContainer.scrollLeft : 0;

    if (this.tbodyContainer) {
      this.tbodyContainer.scrollLeft = headScrollLeft;
    }

    this.updateFixedColumnState(this.headContainer, headScrollLeft);
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
      <div className="tableContent" ref={node => (this.tableContent = node)}>
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
    current: { selectedAccountIds = [], typeCursor, isSelectAll, departmentId },
  } = state;
  const usersPagination = userList && userList.ids ? userList : { ids: [] };

  const { searchId = [], pageIndex } = userList;
  let departmentInfos = departments[departmentId];

  return {
    ...usersPagination,
    isSelectAll,
    selectedAccountIds,
    usersCurrentPage: users,
    typeCursor,
    selectCount: selectedAccountIds.length,
    searchAccountIds: searchUsers,
    isSearch: userList?.isSearchResult,
    searchId,
    departmentId,
    pageIndex,
    departmentName: departmentInfos ? departmentInfos.departmentName : '',
    applyDateOrderBy,
    isLoading: userList?.isLoading,
  };
};

const connectedUserTable = connect(mapStateToProp)(UserTable);

export default connectedUserTable;
