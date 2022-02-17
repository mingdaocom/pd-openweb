import React from 'react';
import { connect } from 'react-redux';
import {
  emptyJobUserSet,
  loadJobUsers,
  loadJobList,
  updateSelectJobUser,
  updateAllSelectJobUser,
} from '../../actions/jobs';
import userBoard from '../../modules/dialogUserBoard';
import { Icon, LoadDiv, Checkbox } from 'ming-ui';
import DropDownCheck from './dropDownCheck';
import classNames from 'classnames';
import 'dialogSelectUser';
import { Pagination } from 'antd';
import * as jobController from 'src/api/job';

class JopList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { jobId, projectId, dispatch } = this.props;
    if (!!jobId) {
      dispatch(loadJobUsers(projectId, jobId, 1));
    }
  }

  componentWillReceiveProps(nextProps) {
    const { jobId, projectId, dispatch } = nextProps;
    if (this.props.jobId !== jobId) {
      dispatch(loadJobUsers(projectId, jobId, 1));
    }
  }

  addUser = () => {
    const { projectId, jobId, dispatch } = this.props;
    const SelectUserSettingsForAdd = {
      unique: false,
      projectId: projectId,
      filterAll: true,
      filterFriend: true,
      filterOthers: true,
      filterOtherProject: true,
      dataRange: 2,
      callback: accountIds => {
        //添加到职位
        jobController
          .addJobUser({
            projectId,
            jobId: jobId,
            accountIds: _.map(accountIds, user => user.accountId),
          })
          .then(data => {
            if (data) {
              dispatch(loadJobUsers(projectId, jobId, 1));
              alert(_l('添加成功'));
            } else alert(_l('添加失败'), 2);
          });
      },
    };
    import('dialogSelectUser').then(() => {
      $({}).dialogSelectUser({
        showMoreInvite: false,
        SelectUserSettings: SelectUserSettingsForAdd,
      });
    });
  };

  handleExportUser = () => {
    const { userIds = [], projectId, dispatch, isSelectAll } = this.props;
    userBoard({
      type: 'export',
      projectId,
      accountIds: isSelectAll ? [] : userIds.map(it => it.accountId),
      noFn() {
        dispatch(emptyJobUserSet()); //清空所选
      },
    });
  };

  renderUserTableWithNum = () => {
    const { userIds = [], isSelectAll, projectId, jobId, dispatch } = this.props;
    return (
      <React.Fragment>
        <span className="Font16 Gray">{!isSelectAll ? _l('已选择 %0 条', userIds.length) : _l('已选择所有')}</span>
        <div className="actionBox Right">
          <span
            onClick={e => {
              var reqData = {
                accountIds: userIds.map(it => it.accountId),
                projectId: projectId,
                jobId,
              };
              jobController.deleteJobUsers(reqData).then(function (data) {
                if (data) {
                  dispatch(loadJobUsers(projectId, jobId, 1));
                  dispatch(emptyJobUserSet()); //清空所选
                  alert(_l('移出成功'));
                } else alert(_l('移出失败'), 2);
              });
            }}
            className="selectedAccountAction Hand Font15"
          >
            <Icon className="Font16 listName mRight15" icon="delete_out" />
            {_l('移出')}
          </span>
          <span
            onClick={e => {
              this.handleExportUser();
            }}
            className="selectedAccountAction Hand mLeft40 Font15"
          >
            <Icon className="Font16 listName mRight15" icon="Export_user" />
            {_l('导出选中用户')}
          </span>
        </div>
      </React.Fragment>
    );
  };

  renderUserCount() {
    const { allCount = 0 } = this.props;
    return <span className="colorBD mLeft5 mRight15">({allCount})</span>;
  }
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
    const { jobId, projectId, dispatch } = this.props;
    if (!!jobId) {
      dispatch(loadJobUsers(projectId, jobId, page));
    }
  };
  renderHeader = () => {
    const {
      jobId,
      projectId,
      dispatch,
      jobName,
      userIds = [],
      allCount,
      pageIndex,
      pageSize,
      isSelectAll,
    } = this.props;
    return (
      <React.Fragment>
        {userIds.length > 0 || isSelectAll ? (
          <div className="Font15 departmentTitle">{this.renderUserTableWithNum()}</div>
        ) : (
          ''
        )}
        {userIds.length <= 0 && !isSelectAll ? (
          <div className="Font15 departmentTitle">
            <span
              title={jobName}
              className={classNames('overflow_ellipsis WordBreak')}
              style={{
                maxWidth: 500,
                display: 'inline-block',
                verticalAlign: 'middle',
              }}
            >
              {jobName}
            </span>
            {this.renderUserCount()}
          </div>
        ) : (
          ''
        )}
      </React.Fragment>
    );
  };

  renderThead = () => {
    const { isSelectAll, isThisPageCheck, userIds, user, dispatch, hasSelectCount } = this.props;
    let isCheck = isThisPageCheck || isSelectAll;
    return (
      <thead>
        <tr>
          <th className={classNames('checkBox', { showCheckBox: isCheck, hasSelectCount: hasSelectCount })}>
            <Checkbox
              ref="example"
              className="TxtMiddle InlineBlock mRight0"
              checked={isCheck}
              // id="1"
              onClick={(checked, id) => {
                let list = _.cloneDeep(userIds);
                if (!isCheck) {
                  let ids = _.map(user, it => it.accountId);
                  list = userIds.filter(it => !_.includes(ids, it.accountId));
                  user.map(it => list.push(it));
                } else {
                  let ids = _.map(user, it => it.accountId);
                  list = userIds.filter(it => !_.includes(ids, it.accountId));
                  dispatch(updateAllSelectJobUser(false));
                }
                dispatch(updateSelectJobUser(list));
              }}
            ></Checkbox>
            {/* <DropDownCheck
              className='Gray_75'
              chooseThisPage={() => {
                let list = _.cloneDeep(userIds);
                let ids = _.map(user, it => it.accountId);
                list = userIds.filter(it => !_.includes(ids, it.accountId))
                user.map(it => list.push(it))
                dispatch(updateSelectJobUser(list))
              }} chooseAll={() => {
                dispatch(updateAllSelectJobUser(true))
              }} /> */}
          </th>
          <th className="TxtLeft nameTh">{_l('姓名')}</th>
          <th className="TxtLeft">{_l('部门')}</th>
          <th width="50px" className="pRight15">
            <span
              className="Hand mLeft24 ThemeColor3 addMenberBtns"
              onClick={evt => {
                this.addUser(evt);
              }}
            >
              <span className="mRight8 icon-add Font20" />
              {_l('添加')}
            </span>
          </th>
        </tr>
      </thead>
    );
  };

  handleCheckbox = () => {
    const { dispatch } = this.props;
    dispatch(updateSelectJobUser(list));
  };

  renderUsers = () => {
    const { user = [], isSelectAll = false, dispatch, userIds, hasSelectCount } = this.props;
    return user.map(item => {
      let isCheck = !!_.find(userIds, it => item.accountId === it.accountId) || isSelectAll;
      return (
        <tr key={item.accountId} className={classNames('userItem', { isChecked: isCheck })}>
          <td className={classNames('checkBox', { showCheckBox: isCheck, hasSelectCount: hasSelectCount })}>
            <Checkbox
              ref="example"
              className="TxtMiddle InlineBlock"
              checked={isCheck}
              // id="1"
              onClick={(checked, id) => {
                let list = _.cloneDeep(userIds);
                if (!isCheck) {
                  list.push(item);
                } else {
                  list = userIds.filter(it => it.accountId !== item.accountId);
                  dispatch(updateAllSelectJobUser(false));
                }
                dispatch(updateSelectJobUser(list));
              }}
            ></Checkbox>
          </td>
          <td className="TxtLeft nameTh">
            <table className="fixedTable">
              <tbody>
                <tr>
                  <td width="32px">
                    <img src={item.avatar} alt="" className="avatar" ref={avatar => (this.avatar = avatar)} />
                  </td>
                  <td className="TxtMiddle">
                    <div className="name mLeft10">
                      <a href={'/user_' + item.accountId} className="Gray" title={item.fullname}>
                        {item.fullname}
                      </a>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
          {
            <td
              title={item.departments.map((it, i) => {
                if (item.departments.length - 1 > i) {
                  return `${it.name};`;
                }
                return `${it.name}`;
              })}
            >
              {item.departments.map((it, i) => {
                if (item.departments.length - 1 > i) {
                  return `${it.name};`;
                }
                return `${it.name}`;
              })}
            </td>
          }
          <td width="50px" className="pRight15"></td>
        </tr>
      );
    });
  };

  renderNullList = () => {
    return (
      <div className="TxtCenter noData">
        <div>
          <div className="nullState">
            <Icon className="" icon="Empty_Noposition" />
          </div>
          <p className="Gray_c mTop20">
            {_l('可以根据成员属性去创建职位，如，技术、生产、销售，设置后应用和工作流可以直接选择职位')}
          </p>
        </div>
      </div>
    );
  };

  renderNullState = () => {
    return (
      <div className="TxtCenter noData">
        <div>
          <div className="nullState">
            <Icon className="" icon="Empty_data" />
          </div>
          <p className="Gray_c mTop20">{_l('数据空')}</p>
        </div>
      </div>
    );
  };

  renderCon = () => {
    const { isUserLoading, user, allCount, pageIndex, pageSize } = this.props;
    return isUserLoading ? (
      <LoadDiv />
    ) : (
      <div className="jobListContainer">
        <div className="jobListHead">
          <table className="fixedTable usersTable" cellSpacing="0">
            {this.renderThead()}
          </table>
        </div>
        <div className="jobListBody flex">
          <table className="fixedTable usersTable" cellSpacing="0">
            <tbody>{user.length <= 0 ? this.renderNullState() : this.renderUsers()}</tbody>
          </table>
        </div>
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
      </div>
    );
  };

  render() {
    const { user = [], jobList = [] } = this.props;
    return (
      <div className="jobList">
        {jobList.length > 0 ? (
          <React.Fragment>
            <div className="headerJop">{this.renderHeader()}</div>
            <div className="jobCon">{this.renderCon()}</div>
          </React.Fragment>
        ) : (
          this.renderNullList()
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  const {
    jobs,
    current,
    pagination: { userList = [] },
  } = state;
  const { projectId, typeNum, typeCursor } = current;
  const {
    user, ///当前职位下的成员
    jobId = '', //当前的职位ID
    userIds = [], //选择的成员
    allCount, //成员个数
    jobList = [], //职位列表
    isUserLoading,
    pageIndex,
    pageSize,
    isSelectAll,
    jobName,
  } = jobs;
  let ids = userIds.map(it => it.accountId);
  let isThisPageCheck = user.length > 0 && ids.length > 0 && !user.find(it => !_.includes(ids, it.accountId));
  return {
    projectId,
    isSearch: userList && userList.isSearchResult,
    user, ///当前职位下的成员
    jobId, //当前的职位ID
    userIds, //选择的成员
    allCount, //成员个数
    jobList, //职位列表
    isUserLoading,
    pageIndex,
    pageSize,
    isSelectAll,
    jobName,
    isThisPageCheck,
    hasSelectCount: userIds.length > 0,
  };
};

const connectedJopList = connect(mapStateToProps)(JopList);

export default connectedJopList;
