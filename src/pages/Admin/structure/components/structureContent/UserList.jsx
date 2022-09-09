import React, { Component, Fragment } from 'react';
import { Icon, LoadDiv, Checkbox, Tooltip } from 'ming-ui';
import { Dropdown, Table, Pagination } from 'antd';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../../actions/current';
import OpList from '../userList/OpList';
import cx from 'classnames';

class UserList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkedCols: ['fullname'],
      columnsInfo: [
        { value: 'fullname', label: _l('姓名'), checked: true, width: 200 },
        { value: 'status', label: _l('状态'), checked: true, typeCursor: 3, width: 32 },
        { value: 'position', label: _l('职位'), checked: true, width: 160 },
        { value: 'department', label: _l('部门'), checked: true, width: 160 },
        { value: 'adress', label: _l('工作地点'), checked: true, width: 120 },
        { value: 'jobNumber', label: _l('工号'), checked: true, width: 120 },
        { value: 'phoneNumber', label: _l('手机'), checked: true, width: 160 },
        { value: 'email', label: _l('邮箱'), checked: true, width: 180 },
        { value: 'applyDate', label: _l('申请日期'), checked: true, typeCursor: 3, width: 160 },
        { value: 'operator', label: _l('操作者'), checked: true, typeCursor: 3, width: 160 },
        { value: 'joinDate', label: _l('加入时间'), checked: true, typeCursor: 0, width: 120 },
      ],
    };
    this.columns = () => {
      const { typeCursor, projectId } = this.props;
      let { columnsInfo, dropDownVisible } = this.state;
      let columnsInfoData = JSON.parse(localStorage.getItem('columnsInfoData')) || [];
      let temp = (!_.isEmpty(columnsInfoData) && columnsInfoData) || columnsInfo;
      let checkedLength = temp.filter(
        item => (!item['typeCursor'] || item.typeCursor === this.props.typeCursor) && item.checked,
      ).length;
      let isSetShowColumn = typeCursor === 3 ? checkedLength !== 11 : checkedLength !== 8;
      let columns = [
        {
          title: _l('姓名'),
          width: 200,
          dataIndex: 'fullname',
          key: 'fullname',
          fixed: 'left',
          isShow: this.isHideCurrentColumn('fullname'),
          render: (t, record) => {
            return (
              <div>
                <img src={record.avatar} alt="" className="avatar" ref={avatar => (this.avatar = avatar)} />
                <a href={'/user_' + record.accountId} className="Gray overflow_ellipsis" title={record.fullname}>
                  {record.fullname}
                </a>
                {this.props.isChargeUser ? (
                  <Tooltip text={<span>{_l('部门负责人')}</span>} action={['hover']}>
                    <span className="icon-ic-head Font16 mLeft5 chargeIcon" title={_l('部门负责人')} />
                  </Tooltip>
                ) : null}
              </div>
            );
          },
        },
        {
          title: _l('状态'),
          width: 100,
          dataIndex: 'status',
          key: 'status',
          isShow: typeCursor === 3 && this.isHideCurrentColumn('status'),
          render: t => {
            <span className={cx({ ThemeColor3: t == 3, Red: t == 2 })}>
              {t == 3 && _l('待审核')}
              {t == 2 && _l('已拒绝')}
            </span>;
          },
        },
        {
          title: _l('职位'),
          width: 160,
          dataIndex: 'position',
          key: 'position',
          isShow: this.isHideCurrentColumn('position'),
          render: (t, record) => {
            const { jobs = [], job } = record;
            let jobData = typeCursor === 2 ? job : jobs;
            return (
              <div
                className="job WordBreak overflow_ellipsis"
                title={
                  typeCursor === 2
                    ? jobData
                    : jobData.map((it, i) => {
                        if (jobData.length - 1 > i) {
                          return `${it.name || it.jobName};`;
                        }
                        return `${it.name || it.jobName}`;
                      })
                }
              >
                {typeCursor === 2
                  ? jobData
                  : jobData.map((it, i) => {
                      if (jobData.length - 1 > i) {
                        return `${it.name || it.jobName};`;
                      }
                      return `${it.name || it.jobName}`;
                    })}
              </div>
            );
          },
        },
        {
          title: _l('部门'),
          width: 160,
          dataIndex: 'department',
          key: 'department',
          isShow: this.isHideCurrentColumn('department'),
          render: (t, record) => {
            const { departments = [], department } = record;
            let departmentData = typeCursor === 2 ? department : departments;
            return (
              <div
                className="WordBreak overflow_ellipsis"
                title={
                  typeCursor === 2
                    ? departmentData
                    : departmentData.map((it, i) => {
                        if (departmentData.length - 1 > i) {
                          return `${it.name || it.departmentName};`;
                        }
                        return `${it.name || it.departmentName}`;
                      })
                }
              >
                {typeCursor === 2
                  ? departmentData
                  : departmentData.map((it, i) => {
                      if (departmentData.length - 1 > i) {
                        return `${it.name || it.departmentName};`;
                      }
                      return `${it.name || it.departmentName}`;
                    })}
              </div>
            );
          },
        },
        {
          title: _l('地址'),
          width: 120,
          dataIndex: 'adress',
          key: 'adress',
          isShow: this.isHideCurrentColumn('adress'),
          render: (r, record) => {
            return <span className="">{record.workSiteName || record.workSite}</span>;
          },
        },
        {
          title: _l('工号'),
          width: 120,
          dataIndex: 'jobNumber',
          key: 'jobNumber',
          isShow: this.isHideCurrentColumn('jobNumber'),
        },
        {
          title: _l('手机号'),
          width: 160,
          dataIndex: 'phoneNumber',
          key: 'phoneNumber',
          isShow: this.isHideCurrentColumn('phoneNumber'),
          render: (t, record) => {
            return this.renderContact(record);
          },
        },
        {
          title: _l('邮箱'),
          width: 180,
          dataIndex: 'email',
          key: 'email',
          isShow: this.isHideCurrentColumn('emial'),
          render: (t, record) => {
            return this.renderEmail(record);
          },
        },
        {
          title: _l('申请日期'),
          width: 160,
          dataIndex: 'updateTime',
          key: 'updateTime',
          isShow: typeCursor === 3 && this.isHideCurrentColumn('updateTime'),
          render: (t, record) => {
            return <span>{moment(t).format('YYYY-MM-DD')}</span>;
          },
        },
        {
          title: _l('操作者'),
          width: 160,
          dataIndex: 'operator',
          key: 'operator',
          isShow: typeCursor === 3 && this.isHideCurrentColumn('operator'),
          render: (t, record) => {
            return (
              <span>
                {!record.lastModifyUser || !record.lastModifyUser.fullname ? '' : record.lastModifyUser.fullname}
              </span>
            );
          },
        },
        {
          title: _l('加入时间'),
          width: 120,
          dataIndex: 'joinDate',
          key: 'joinDate',
          isShow: typeCursor === 0 && this.isHideCurrentColumn('joinDate'),
          render: (t, record) => {
            return (
              <span>
                {moment(record.addProjectTime).format('YYYY-MM-DD') || moment(record.createTime).format('YYYY-MM-DD')}
              </span>
            );
          },
        },
        {
          title: (
            <Dropdown
              overlay={this.renderShowColumns}
              trigger={['click']}
              visible={dropDownVisible}
              onVisibleChange={this.handleVisibleChange}
            >
              <Tooltip text={<span>{_l('自定义显示列')} </span>} popupPlacement="top">
                <Icon
                  icon="visibility"
                  className="visibiliityIcon"
                  style={isSetShowColumn ? { color: '#2196f3' } : {}}
                />
              </Tooltip>
            </Dropdown>
          ),
          width: 80,
          fixed: 'right',
          dataIndex: 'act',
          key: 'act',
          isShow: true,
          align: 'center',
          render: (t, record) => {
            return (
              <Dropdown overlayClassName="dropDownOptBox" overlay={<OpList user={record} projectId={projectId} />}>
                <Tooltip text={<span>{_l('更多操作')}</span>} popupPlacement="top">
                  <span className="tip-top Hand" onClick={() => this.handleOpBtnClick(record.accountId)}>
                    <span className="icon-moreop TxtMiddle Font18 Gray_9e" />
                  </span>
                </Tooltip>
              </Dropdown>
            );
          },
        },
      ];
      return columns.filter(item => item.isShow);
    };
  }
  isHideCurrentColumn = fields => {
    let { columnsInfo } = this.state;
    let columnsInfoData = JSON.parse(localStorage.getItem('columnsInfoData')) || [];
    let temp = (!_.isEmpty(columnsInfoData) && columnsInfoData) || columnsInfo;
    let obj = temp.filter(item => item.value === fields)[0] || {};
    return obj.checked;
  };
  renderContact(user) {
    const { contactPhone, mobilePhone, isPrivateMobile, accountId } = user;
    let mobileTpl = null;
    if (mobilePhone) {
      mobileTpl = (
        <div className="ellipsis w100">
          <span className="Remind w100 overflow_ellipsis WordBreak">{mobilePhone}</span>
        </div>
      );
    } else {
      if (isPrivateMobile) {
        mobileTpl = (
          <span title={_l('保密')} className="overLimi_130 overflow_ellipsis Remind">
            *********
          </span>
        );
      } else {
        mobileTpl = (
          <div className="Gray_9e ellipsis forRemind w100 overflow_ellipsis WordBreak">
            <span onClick={this.sendNotice(1)} className="Remind w100 overflow_ellipsis WordBreak">
              {_l('提醒填写')}
            </span>
          </div>
        );
      }
    }

    return mobileTpl;
  }
  renderContact(user) {
    const { contactPhone, mobilePhone, isPrivateMobile, accountId } = user;
    let mobileTpl = null;
    if (mobilePhone) {
      mobileTpl = (
        <div className="ellipsis w100">
          <span className="Remind w100 overflow_ellipsis WordBreak">{mobilePhone}</span>
        </div>
      );
    } else {
      if (isPrivateMobile) {
        mobileTpl = (
          <span title={_l('保密')} className="overLimi_130 overflow_ellipsis Remind">
            *********
          </span>
        );
      } else {
        mobileTpl = (
          <div className="Gray_9e ellipsis forRemind w100 overflow_ellipsis WordBreak">
            <span onClick={this.sendNotice(1)} className="Remind w100 overflow_ellipsis WordBreak">
              {_l('提醒填写')}
            </span>
          </div>
        );
      }
    }

    return mobileTpl;
  }
  renderEmail(user) {
    let emailTpl = null;
    const { email, isPrivateEmail } = user;
    if (email) {
      emailTpl = <span title={email}>{email}</span>;
    } else if (isPrivateEmail) {
      emailTpl = (
        <span title={_l('保密')} className="overLimi_130 overflow_ellipsis">
          *********
        </span>
      );
    }
    return emailTpl;
  }
  sendNotice(type) {
    const { projectId, accountId } = this.props;
    return event => {
      event.stopPropagation();
      require(['mdFunction'], MDFunction => {
        MDFunction.sendNoticeInvite([accountId], '', projectId, type);
      });
    };
  }
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
  handleOpBtnClick = accountId => {
    this.props.updateUserOpList(accountId);
  };
  handleVisibleChange = flag => {
    this.setState({ dropDownVisible: flag });
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
        <div className="statistics" className={cx('statistics', { checkBoxHalf: checkedLength !== colLength })}>
          <Checkbox checked={_.every(temp, item => item.checked)} onClick={this.handleClickStastics}>
            {_l('显示列 %0/%1', checkedLength, colLength)}
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
                    disabled={item.value === 'fullname'}
                  >
                    {item.label}
                  </Checkbox>
                </li>
              );
            }
          })}
        </ul>
      </div>
    );
  };
  handleClickStastics = checked => {
    let { columnsInfo } = this.state;
    let copyColumnsInfo = [];
    if (checked) {
      copyColumnsInfo = columnsInfo.map(item => {
        if (item.value !== 'fullname') {
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
  changeCheckedData = selectedAccountIds => {
    this.props.updateSelectedAccountIds(selectedAccountIds);
  };
  customizeRenderEmpty = () => {
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
  };
  itemRender(current, type, originalElement) {
    if (type === 'prev') {
      return <a className="page">{_l('上一页')}</a>;
    }
    if (type === 'next') {
      return <a className="page">{_l('下一页')}</a>;
    }
    return originalElement;
  }
  // 分页
  changPage = page => {
    this.props.loadData(page);
  };
  render() {
    let {
      usersCurrentPage = [],
      chargeUsers = [],
      searchId = [],
      searchAccountIds = [],
      isLoading = false,
      allCount,
      pageIndex,
      pageSize,
      isSearch,
    } = this.props;

    if (isSearch && !!searchId[0] && searchAccountIds.length > 0) {
      usersCurrentPage = searchAccountIds.filter(user => user.accountId === searchId[0]);
    }
    let dataSource = _.sortBy(usersCurrentPage, user => !_.includes(chargeUsers, user.accountId));
    return (
      <Fragment>
        <Table
          rowKey={record => record.accountId}
          columns={this.columns().filter(item => item.isShow)}
          dataSource={dataSource}
          pagination={false}
          scroll={{ x: 1300, y: `calc(100vh - 290px)` }}
          rowSelection={{ type: 'checkbox', onChange: this.changeCheckedData }}
        />
        {_.isEmpty(dataSource) && this.customizeRenderEmpty()}
        {allCount > pageSize && (
          <div className="pagination">
            <Pagination
              total={allCount}
              itemRender={this.itemRender}
              onChange={this.changPage}
              current={pageIndex}
              pageSize={pageSize || 50}
            />
          </div>
        )}
      </Fragment>
    );
  }
}

export default connect(
  state => {
    const {
      pagination: { userList = {} },
      entities: { users, departments, searchUsers },
      current: { selectedAccountIds = [], activeAccountId, typeCursor, isSelectAll, departmentId },
      search: { accountIds = [], showSeachResult = false },
    } = state;
    let data = departments[departmentId] || {};
    const { chargeUsers = [] } = data;
    const usersPagination = userList && userList.ids ? userList : { ids: [] };
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
      isSelectAll,
      chargeUsers,
      usersCurrentPage: users,
      typeCursor,
      isThisPageCheck,
      selectCount: selectedAccountIds.length,
      searchAccountIds: searchUsers,
      isSearch: userList && userList.isSearchResult,
      allCount: userList && userList.allCount,
      pageIndex: userList && userList.pageIndex,
      pageSize: userList && userList.pageSize,
      searchId,
      showSeachResult,
    };
  },
  dispatch =>
    bindActionCreators(
      {
        ..._.pick(actions, ['updateUserOpList', 'updateSelectedAccountIds']),
      },
      dispatch,
    ),
)(UserList);
