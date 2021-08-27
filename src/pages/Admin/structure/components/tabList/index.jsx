import React from 'react';
import { connect } from 'react-redux';
import TreeView from '../departmentView';
import CreateBtn from '../departmentView/createBtn';
import { Icon, LoadDiv } from 'ming-ui';
import { loadAllUsers, loadDepartments, loadUsers, loadInactiveUsers, loadApprovalUsers } from '../../actions/entities';
import { updateCursor, updateTypeCursor } from '../../actions/current';
import { loadJobList, loadJobUsers, updateCursorJobId } from '../../actions/jobs';
import DialogCreatePosition from '../../modules/dialogCreatePosition';
import './index.less';
import cx from 'classnames';
import * as jobController from 'src/api/job';

const shouldLoadDepartments = props => {
  const { haveSubDepartment, subDepartments, isLoading, isExpired } = props;
  if (isLoading) return false;
  return isExpired || (haveSubDepartment && !subDepartments.length);
};
class TabList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showPositionDialog: false,
      isNew: true,
      jobId: '',
      jobName: '',
    };
  }

  handleClick = typeCursor => {
    const { dispatch, projectId } = this.props;
    dispatch(updateCursor(''));
    dispatch(updateTypeCursor(typeCursor));
    switch (typeCursor) {
      case 0:
        dispatch(loadAllUsers(projectId, 1));
        break;
      case 1:
        if (shouldLoadDepartments(this.props)) {
          dispatch(loadDepartments(''));
        }
        dispatch(loadUsers(''));
        break;
      case 2:
        dispatch(loadInactiveUsers(projectId, 1));
        break;
      case 3:
        dispatch(loadApprovalUsers(projectId, 1));
        break;
    }
  };

  closeFn = () => {
    this.setState({
      showPositionDialog: false,
    });
  };

  render() {
    const {
      typeNum = 0,
      typeCursor = 0,
      projectId,
      approveNumber,
      inActiveNumber,
      root,
      cursor,
      departmentName,
      jobList = [],
      dispatch,
      jobId,
      isLoading,
    } = this.props;
    if (typeNum !== 0) {
      return (
        <div className="jobListBox">
          <div className="ThemeColor3 pTop10 pBottom10">
            <span
              className="Hand mLeft24 creatDepartment"
              onClick={() => {
                this.setState({
                  showPositionDialog: !this.state.showPositionDialog,
                  isNew: true,
                  jobName: '',
                  jobId: '',
                });
              }}>
              <span className="mRight8 icon-add Font20" />
              {_l('创建职位')}
            </span>
          </div>
          <ul
            className="pBottom20 jobListUl box-sizing"
            style={{ height: document.documentElement.clientHeight - 300 }}>
            {isLoading ? (
              <LoadDiv />
            ) : (
              jobList.map(item => {
                return (
                  <li
                    className={cx({ current: jobId === item.jobId })}
                    onClick={() => {
                      dispatch(updateCursorJobId(item.jobId));
                    }}>
                    <Icon className="Font16 Gray_9e mRight10" icon="limit-principal" />
                    <span className={cx('overflow_ellipsis WordBreak jobNameLi')}>{item.jobName}</span>
                    <Icon
                      className="Font16 Gray_9e Right editIcon"
                      icon="edit_17"
                      onClick={e => {
                        this.setState({
                          showPositionDialog: !this.state.showPositionDialog,
                          isNew: false,
                          jobId: item.jobId,
                          jobName: item.jobName,
                        });
                      }}
                    />
                  </li>
                );
              })
            )}
          </ul>
          {this.state.showPositionDialog && (
            <DialogCreatePosition
              showPositionDialog={this.state.showPositionDialog}
              jobList={jobList}
              setValue={data => {
                let isShow = data.showPositionDialog;
                let name = data.jobName;
                let id = data.jobId;
                let isOk = data.isOk;
                if (!isOk) {
                  this.setState({
                    showPositionDialog: false,
                  });
                }
                if (isOk && this.state.isNew) {
                  // 创建职位
                  jobController
                    .addJob({
                      jobName: name,
                      projectId,
                    })
                    .then(data => {
                      if (data == 1) {
                        alert(_l('创建成功'));
                        dispatch(loadJobList(projectId));
                      } else if (data == 2) {
                        alert(_l('创建失败，相同职位名称已经存在'), 3);
                      } else {
                        alert(_l('创建失败'), 3);
                      }
                      this.closeFn();
                    });
                } else if (isOk && !this.state.isNew) {
                  if (!name) {
                    alert(_l('请输入职位名称'), 3);
                  }
                  // 创建职位
                  jobController
                    .editJobName({
                      jobId: id,
                      jobName: name,
                      projectId,
                    })
                    .then(data => {
                      if (data === 1) {
                        alert(_l('编辑成功'));
                        dispatch(loadJobList(projectId, id));
                      } else if (data == 2) {
                        JobList.showMsg(_l('编辑失败，相同职位名称已经存在'));
                      } else {
                        JobList.showMsg(_l('操作失败'));
                      }
                      this.closeFn();
                    });
                }
              }}
              delFn={() => {
                jobController
                  .deleteJobs({
                    jobIds: [this.state.jobId],
                    projectId,
                  })
                  .then(data => {
                    if (data) {
                      alert(_l('删除成功'));
                      dispatch(loadJobList(projectId));
                    } else {
                      alert(_l('职位存在成员，无法删除'), 2);
                    }
                    this.closeFn();
                  });
              }}
              jobName={this.state.jobName}
              isNew={this.state.isNew}
              jobId={this.state.jobId}
            />
          )}
        </div>
      );
    }
    return (
      <React.Fragment>
        <div className="departmentTop">
          <ul>
            <li
              onClick={() => {
                this.handleClick(0);
              }}
              className={cx({ current: cursor === root && (typeCursor === 1 || typeCursor === 0) })}>
              <Icon className={cx('Font16 Gray_9e listName mRight10')} icon="user_company" />
              <span>{_l('全组织')}</span>
            </li>
            <li
              onClick={() => {
                this.handleClick(2);
              }}
              className={cx({ current: cursor === root && typeCursor === 2 })}>
              <Icon className="Font16 Gray_9e listName mRight10" icon="user_activation" />
              <span>
                {_l('未激活')}
                {inActiveNumber > 0 && typeCursor !== 2 && <span className="numTag">{inActiveNumber > 99 ? '99+' : inActiveNumber}</span>}
              </span>
            </li>
            <li
              onClick={() => {
                this.handleClick(3);
              }}
              className={cx({ current: cursor === root && typeCursor === 3 })}>
              <Icon className="Font16 Gray_9e listName mRight10" icon="user_Review" />
              <span>
                {_l('待审核')}
                {approveNumber > 0 && typeCursor !== 3 && <span className="numTag">{approveNumber > 99 ? '99+' : approveNumber}</span>}
              </span>
            </li>
          </ul>
        </div>
        <div className="w100">
          <CreateBtn />
          <TreeView />
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  const {
    current: {
      departmentId,
      projectId,
      selectedAccountIds,
      approveNumber,
      inActiveNumber,
      isSearch,
      typeNum,
      typeCursor,
      root,
    },
    pagination,
    jobs: {
      jobList,
      jobId = '', //当前的职位ID
      isLoading,
    },
  } = state;
  const { departments } = state.entities;
  const department = departments[''];
  return {
    pagination,
    projectId,
    departmentId,
    selectedAccountIds,
    selectCount: selectedAccountIds.length,
    approveNumber,
    inActiveNumber,
    isSearch,
    typeNum,
    typeCursor,
    root,
    cursor: departmentId,
    departmentName: department ? department.departmentName : '',
    jobList,
    jobId,
    isLoading,
  };
};

export default connect(mapStateToProps)(TabList);
