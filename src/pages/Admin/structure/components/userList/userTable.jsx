import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import DropDownCheck from './dropDownCheck';
import UserItem from './userItem';
import { LoadDiv, Icon, Checkbox, Tooltip } from 'ming-ui';
import { Dropdown } from 'antd';
import classNames from 'classnames';
import { updateUserOpList, removeUserFromSet, addUserToSet, updateSelectAll } from '../../actions/current';
import cx from 'classnames';
import './userItem.less';

const clearActiveDialog = props => {
  const { dispatch } = props;
  dispatch(updateUserOpList(null));
};

class UserTable extends React.Component {
  state = {
    isMinSc: false, //document.body.clientWidth <= 1380
    columnsInfo: [
      { value: 'name', label: _l('姓名'), checked: true, width: 200 },
      { value: 'status', label: _l('状态'), checked: true, typeCursor: 3, width: 32 },
      { value: 'position', label: _l('职位'), checked: true, width: 160 },
      { value: 'department', label: _l('部门'), checked: true, width: 160 },
      { value: 'adress', label: _l('工作地点'), checked: true, width: 120 },
      { value: 'jobNum', label: _l('工号'), checked: true, width: 120 },
      { value: 'phone', label: _l('手机'), checked: true, width: 160 },
      { value: 'email', label: _l('邮箱'), checked: true, width: 180 },
      { value: 'applyDate', label: _l('申请日期'), checked: true, typeCursor: 3, width: 160 },
      { value: 'operator', label: _l('操作者'), checked: true, typeCursor: 3, width: 160 },
      { value: 'joinDate', label: _l('加入时间'), checked: true, typeCursor: 0, width: 120 },
    ],
  };

  componentWillUnmount() {
    clearActiveDialog(this.props);
    localStorage.removeItem('columnsInfoData');
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
    let temp = (!_.isEmpty(columnsInfoData) && columnsInfoData) || columnsInfo;
    let checkedLength = temp.filter(
      item => (!item['typeCursor'] || item.typeCursor === this.props.typeCursor) && item.checked,
    ).length;
    let colLength = typeCursor === 3 ? 11 : 8;
    return (
      <div className="showColumnsBox">
        <div className="statistics" className={classNames('statistics', { checkBoxHalf: checkedLength !== colLength })}>
          <Checkbox checked={_.every(temp, item => item.checked)} onClick={this.handleClickStastics}>
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
    const {
      isThisPageCheck,
      isSelectAll,
      dispatch,
      selectCount,
      typeCursor,
      usersCurrentPage = [],
      chargeUsers,
      searchId = [],
    } = props;
    let { columnsInfo, dropDownVisible } = this.state;
    let columnsInfoData = JSON.parse(localStorage.getItem('columnsInfoData')) || [];
    let temp = (!_.isEmpty(columnsInfoData) && columnsInfoData) || columnsInfo;
    let isCheck = isThisPageCheck || isSelectAll;
    let checkedLength = temp.filter(
      item => (!item['typeCursor'] || item.typeCursor === this.props.typeCursor) && item.checked,
    ).length;
    let isSetShowColumn = typeCursor === 3 ? checkedLength !== 11 : checkedLength !== 8;
    let totalColWidth = 0;
    temp.forEach(item => {
      if (this.isHideCurrentColumn(item.value)) {
        totalColWidth += item.width;
      }
    });
    let setWidth = $('.listInfo') && totalColWidth > $('.listInfo').width();
    let actWidth = $('.listInfo').height() > 48 * usersCurrentPage.length || searchId.length ? 80 : 90;
    return (
      <thead>
        <tr>
          {(typeCursor === 0 || typeCursor === 1) && (
            <th
              className={classNames('checkBox', {
                showCheckBox: isCheck || selectCount > 0,
                hasSelectCount: selectCount > 0,
                // opacity0: typeCursor === 2 || typeCursor === 3,
                checkBoxHalf: selectCount > 0 && selectCount !== usersCurrentPage.length,
              })}
            >
              <Checkbox
                ref="example"
                className="TxtMiddle InlineBlock mRight0 checked_selected"
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
          )}
          {this.isHideCurrentColumn('name') && (
            <th
              className={cx('TxtLeft nameTh', { left0: typeCursor !== 0 })}
              style={{ width: setWidth ? 200 : 'unset' }}
            >
              {_l('姓名')}
            </th>
          )}
          {props.typeCursor === 3 && this.isHideCurrentColumn('status') && <th className="statusTh">{_l('状态')}</th>}
          {this.isHideCurrentColumn('position') && <th className="TxtLeft jobTh">{_l('职位')}</th>}
          {/* {props.isSearch ? <th>{_l('部门')}</th> : null} */}
          {this.isHideCurrentColumn('department') && <th className="departmentTh">{_l('部门')}</th>}
          {this.isHideCurrentColumn('adress') && <th className="workSiteTh">{_l('工作地点')}</th>}
          {this.isHideCurrentColumn('jobNum') && <th className="jobNumberTh">{_l('工号')}</th>}
          {this.isHideCurrentColumn('phone') && <th className="mobileTh">{_l('手机')}</th>}
          {!this.state.isMinSc && this.isHideCurrentColumn('email') && <th className="emailTh">{_l('邮箱')}</th>}
          {!this.state.isMinSc && props.typeCursor === 3 && (
            <React.Fragment>
              {this.isHideCurrentColumn('applyDate') && <th className="dateTh">{_l('申请日期')}</th>}
              {this.isHideCurrentColumn('operator') && <th className="actMenTh">{_l('操作者')}</th>}
            </React.Fragment>
          )}
          {this.isHideCurrentColumn('joinDate') && props.typeCursor === 0 && (
            <th className="joinDateTh">{_l('加入时间')}</th>
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
          isHideCurrentColumn={this.isHideCurrentColumn}
          columnsInfo={temp}
          dateNow={Date.now()}
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
    const { isLoading } = this.props;
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
