import React from 'react';
import { connect } from 'react-redux';
import TreeView from '../departmentView';
import CreateBtn from '../departmentView/createBtn';
import { Icon, LoadDiv, ScrollView } from 'ming-ui';
import { Dropdown, Menu } from 'antd';
import {
  loadAllUsers,
  loadDepartments,
  loadUsers,
  loadInactiveUsers,
  loadApprovalUsers,
  updateShowExport,
  updateImportType,
} from '../../actions/entities';
import { updateCursor, updateTypeCursor, fetchInActive } from '../../actions/current';
import { loadJobList, loadJobUsers, updateCursorJobId } from '../../actions/jobs';
import DialogCreatePosition from '../../modules/dialogCreatePosition';
import './index.less';
import cx from 'classnames';
import * as jobController from 'src/api/job';
import { checkSensitive } from 'src/api/fixedData.js';
import { getPssId } from 'src/util/pssId';

const shouldLoadDepartments = props => {
  const { haveSubDepartment, subDepartments, isLoading, isExpired } = props;
  if (isLoading) return false;
  return isExpired || (haveSubDepartment && !subDepartments.length);
};
class TabList extends React.Component {
  constructor(props) {
    super(props);
    const { projectId, fetchInActive = () => {} } = props;
    this.state = {
      showPositionDialog: false,
      isNew: true,
      jobId: '',
      jobName: '',
    };
    fetchInActive(projectId);
  }

  handleClick = typeCursor => {
    const {
      projectId,
      updateCursor = () => {},
      updateTypeCursor = () => {},
      loadAllUsers = () => {},
      loadDepartments = () => {},
      loadUsers = () => {},
      loadInactiveUsers = () => {},
      loadApprovalUsers = () => {},
    } = this.props;
    updateCursor('');
    updateTypeCursor(typeCursor);
    switch (typeCursor) {
      case 0:
        loadAllUsers(projectId, 1);
        break;
      case 1:
        if (shouldLoadDepartments(this.props)) {
          loadDepartments('', 1);
        }
        loadUsers('');
        break;
      case 2:
        loadInactiveUsers(projectId, 1);
        break;
      case 3:
        loadApprovalUsers(projectId, 1);
        break;
    }
  };

  closeFn = () => {
    this.setState({
      showPositionDialog: false,
    });
  };
  onScrollEnd = () => {
    const { isMore, jobListPageIndex, projectId, isLoading, canRequest, jobId, loadJobList } = this.props;
    if (!isMore || isLoading || !canRequest) return;
    loadJobList(projectId, jobId, jobListPageIndex + 1);
  };

  // 导出职位列表
  exportJobList = () => {
    const { projectId } = this.props;
    let projectName = (md.global.Account.projects || []).filter(item => item.projectId === projectId).length
      ? (md.global.Account.projects || []).filter(item => item.projectId === projectId)[0].companyName
      : '';
    fetch(`${md.global.Config.AjaxApiUrl}download/exportProjectJobList`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `md_pss_id ${getPssId()}`,
      },
      body: JSON.stringify({
        userStatus: '1',
        projectId,
      }),
    })
      .then(response => response.blob())
      .then(blob => {
        let date = moment(new Date()).format('YYYYMMDDHHmmss');
        const fileName = `${projectName}_${_l('职位')}_${date}` + '.xlsx';
        const link = document.createElement('a');

        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(link.href);
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
      jobList = [],
      jobId,
      isLoading,
      updateCursorJobId = () => {},
      loadJobList = () => {},
    } = this.props;
    if (typeNum !== 0) {
      return (
        <div className="jobListBox">
          <div className="ThemeColor3 pTop10 pBottom10 flexRow createPosition">
            <span className="Hand mLeft24">
              <span
                className="creatDepartmentTxt"
                onClick={() => {
                  this.setState({
                    showPositionDialog: !this.state.showPositionDialog,
                    isNew: true,
                    jobName: '',
                    jobId: '',
                  });
                }}
              >
                <span className="mRight3 icon-add Font20 TxtMiddle" />
                {_l('创建职位')}
              </span>
            </span>
            <Dropdown
              overlayClassName="createMoreDropDown"
              trigger={['click']}
              placement="bottomLeft"
              overlay={
                <Menu>
                  <Menu.Item
                    key="0"
                    onClick={() => {
                      this.props.updateShowExport(true);
                      this.props.updateImportType('importPosition');
                    }}
                  >
                    {_l('导入职位')}
                  </Menu.Item>
                  <Menu.Item key="1" disabled={_.isEmpty(jobList)} onClick={this.exportJobList}>
                    {_l('导出职位')}
                  </Menu.Item>
                </Menu>
              }
            >
              <Icon icon="moreop" className="Gray_9e Hand Font15" style={{ height: '12px' }} />
            </Dropdown>
          </div>
          {!isLoading && _.isEmpty(jobList) && (
            <div className="Gray_9e Font13 mLeft24 mTop16">
              {_l('暂无职位，可 ')}
              <span
                className="Hand"
                style={{ color: '#2196F3' }}
                onClick={() => {
                  this.props.updateShowExport(true);
                  this.props.updateImportType('importPosition');
                }}
              >
                {_l('批量导入')}
              </span>
            </div>
          )}
          <ScrollView className="jobListUl" onScrollEnd={this.onScrollEnd}>
            {isLoading ? (
              <LoadDiv />
            ) : (
              jobList.map(item => {
                return (
                  <div
                    className={cx('jobItem', { current: jobId === item.jobId })}
                    onClick={() => {
                      updateCursorJobId(item.jobId);
                    }}
                  >
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
                  </div>
                );
              })
            )}
          </ScrollView>
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
                        loadJobList(projectId);
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
                  checkSensitive({ content: name }).then(res => {
                    if (res) {
                      return alert(_l('输入内容包含敏感词，请重新填写'), 3);
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
                          loadJobList(projectId, id);
                        } else if (data == 2) {
                          JobList.showMsg(_l('编辑失败，相同职位名称已经存在'));
                        } else {
                          JobList.showMsg(_l('操作失败'));
                        }
                        this.closeFn();
                      });
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
                      loadJobList(projectId);
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
        <div className="departmentTop mRight24">
          <ul>
            <li
              onClick={() => {
                this.handleClick(0);
              }}
              className={cx({ current: cursor === root && (typeCursor === 1 || typeCursor === 0) })}
            >
              <Icon className={cx('Font16 Gray_9e listName mRight10')} icon="person" />
              <span>{_l('全组织')}</span>
            </li>
            <li
              onClick={() => {
                this.handleClick(2);
              }}
              className={cx({ current: cursor === root && typeCursor === 2 })}
            >
              <Icon className="Font16 Gray_9e listName mRight10" icon="check_circle" />
              <span>
                {_l('未激活')}
                {inActiveNumber > 0 && typeCursor !== 2 && (
                  <span className="numTag">{inActiveNumber > 99 ? '99+' : inActiveNumber}</span>
                )}
              </span>
            </li>
            <li
              onClick={() => {
                this.handleClick(3);
              }}
              className={cx({ current: cursor === root && typeCursor === 3 })}
            >
              <Icon className="Font16 Gray_9e listName mRight10" icon="access_time_filled" />
              <span>
                {_l('待审核')}
                {approveNumber > 0 && typeCursor !== 3 && (
                  <span className="numTag">{approveNumber > 99 ? '99+' : approveNumber}</span>
                )}
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
      isMore,
      canRequest,
      jobListPageIndex,
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
    isMore,
    canRequest,
    jobListPageIndex,
  };
};

export default connect(mapStateToProps, {
  loadAllUsers,
  loadDepartments,
  loadUsers,
  loadInactiveUsers,
  loadApprovalUsers,
  updateShowExport,
  updateCursor,
  updateTypeCursor,
  fetchInActive,
  loadJobList,
  loadJobUsers,
  updateCursorJobId,
  updateImportType,
})(TabList);
