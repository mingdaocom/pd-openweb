import React, { Component, Fragment } from 'react';
import { createRoot } from 'react-dom/client';
import { connect } from 'react-redux';
import cx from 'classnames';
import _ from 'lodash';
import { Checkbox, Dialog, Menu, MenuItem } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import withClickAway from 'ming-ui/decorators/withClickAway';
import ajaxRequest from 'src/api/taskCenter';
import { expireDialogAsync } from 'src/components/upgradeVersion';
import { navigateTo } from 'src/router/navigateTo';
import { getAppFeaturesPath } from 'src/utils/app';
import ShareFolderOrTask from '../../../components/shareFolderOrTask/shareFolderOrTask';
import config, { OPEN_TYPE, RELATION_TYPES } from '../../../config/config';
import {
  addCheckList,
  destroyTask,
  editTaskStatus,
  taskFoldStatus,
  updateTaskLocked,
  updateTaskNotice,
} from '../../../redux/actions';
import {
  afterDeleteTask,
  afterUpdateLock,
  afterUpdateTaskDate,
  afterUpdateTaskDateInfo,
  afterUpdateTaskStatus,
  getLeftMenuCount,
  taskTreeAfterDeleteTask,
} from '../../../utils/taskComm';
import { checkIsProject, errorMessage, taskStatusDialog } from '../../../utils/utils';
import CopyTask from '../copyTask/copyTask';
import './header.less';

const ClickAwayable = createDecoratedComponent(withClickAway);

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showOperator: false,
      showChecklistDialog: false,
    };
  }

  checkboxRef = React.createRef();
  taskStatusCheckboxRef = React.createRef();

  componentDidUpdate() {
    if (this.state.showChecklistDialog) {
      $(this.checklistText).select();
    }
  }

  /**
   * 修改任务状态
   */
  editTaskStatus = () => {
    const { taskId, openType } = this.props;
    const { data } = this.props.taskDetails[taskId];
    const status = data.status ? 0 : 1;
    const callback = (source, isAll) => {
      if (openType === OPEN_TYPE.slide) {
        afterUpdateTaskStatus(source, status, isAll);

        source.tasks.forEach(item => {
          afterUpdateTaskDateInfo(item.taskId, item.startTime, item.deadline, item.actualStartTime, item.completedTime);
        });

        const ids = source.taskIDs.map(id => {
          return {
            taskId: id,
          };
        });
        afterUpdateTaskDate(ids);
      } else {
        this.props.updateCallback({ type: 'UPDATE_TASK_STATUS', tasks: source.tasks });
      }
    };

    taskStatusDialog(status, () => {
      if (data.subTask.length) {
        Dialog.confirm({
          title: status ? _l('标记该任务为已完成') : _l('当前任务下有子任务'),
          okText: _l('确定'),
          closable: false,
          children: (
            <Checkbox
              className="Gray_9"
              defaultChecked={false}
              ref={this.taskStatusCheckboxRef}
              text={status ? _l('同时标记该任务下所有任务为已完成') : _l('同时标记该任务下所有任务为未完成')}
            />
          ),
          onOk: () => {
            let isAllSubTask = this.taskStatusCheckboxRef.current.state.checked;
            if (isAllSubTask && data.auth !== config.auth.Charger) {
              isAllSubTask = false;
              alert(status ? _l('仅负责人可一键标记完成所有子任务') : _l('仅负责人可一键标记未完成所有子任务'));
            }
            this.props.dispatch(editTaskStatus(taskId, status, isAllSubTask, '', callback));
          },
        });
      } else {
        this.props.dispatch(editTaskStatus(taskId, status, false, '', callback));
      }
    });
  };

  /**
   * 刷新
   */
  refresh = _.debounce(this.props.refreshDetail, 500);

  /**
   * 添加子任务
   */
  addSubtask = () => {
    const { taskId } = this.props;
    const { data } = this.props.taskDetails[taskId];
    const isHidden = _.includes(this.props.taskFoldStatus[taskId] || [], 'subTask');
    const callback = () => {
      const fromWhereHeight = $('.taskDetail .fromWhere').height();
      const basicHeight = $('.taskDetail .taskContentBasicBox').height();
      const visibleHeight = $('.taskDetail .taskDetailContent').height();
      const subTaskHeight = data.subTask.length * 46;

      $('.taskDetailScroll .scroll-viewport')?.scrollTop(
        fromWhereHeight + basicHeight + subTaskHeight + 200 - visibleHeight / 2,
      );
      this.props.addSubTask();
    };

    expireDialogAsync(data.projectID).then(() => {
      if (isHidden) {
        this.props.dispatch(
          taskFoldStatus(taskId, 'subTask'),
          setTimeout(() => {
            callback();
          }, 100),
        );
      } else {
        callback();
      }
    });
  };

  /**
   * 修改提醒
   */
  updateTaskNotice = () => {
    const { taskId } = this.props;
    const { data } = this.props.taskDetails[taskId];

    this.props.dispatch(updateTaskNotice(taskId, !data.notice));
  };

  /**
   * 修改锁定状态
   */
  updateTaskLocked = () => {
    const { taskId, openType } = this.props;
    const { data } = this.props.taskDetails[taskId];
    const locked = !data.locked;
    const callback = () => {
      if (openType === OPEN_TYPE.slide) {
        afterUpdateLock(taskId, locked);
      }
    };

    this.props.dispatch(updateTaskLocked(taskId, locked, callback));
  };

  /**
   * 添加清单
   */
  addChecklist = () => {
    const value = _.trim(this.checklistText.value);

    if (!value) {
      $(this.checklistText).addClass('createChecklistError');
    } else {
      this.props.addChecklist();
      this.props.dispatch(addCheckList(this.props.taskId, value));
      this.setState({ showChecklistDialog: false });
    }
  };

  /**
   * 复制任务
   */
  copyTask = () => {
    const { taskId } = this.props;
    const { data } = this.props.taskDetails[taskId];

    this.setState({ showOperator: false });

    expireDialogAsync(data.projectID).then(() => {
      const root = createRoot(document.createElement('div'));

      root.render(
        <CopyTask
          name={_l('%0-副本', data.taskName)}
          taskId={taskId}
          folderID={data.folderID}
          projectId={checkIsProject(data.projectID) ? data.projectID : ''}
          chargeUser={data.charge.accountID}
        />,
      );
    });
  };

  /**
   * 打印任务
   */
  printTask = () => {
    const { taskId } = this.props;
    window.open(`/print/task/${taskId}`);

    this.setState({ showOperator: false });
  };

  /**
   * 分享任务
   */
  shareTask = () => {
    this.setState({ showOperator: false });

    const root = createRoot(document.createElement('div'));

    root.render(
      <ShareFolderOrTask
        shareUrl={md.global.Config.WebUrl + 'apps/task/task_' + this.props.taskId}
        shareMessage={_l('打开App扫一扫，在手机上快速显示查看任务详情')}
        linkText={_l('复制任务链接')}
      />,
    );
  };

  /**
   * 新页面打开
   */
  openNewPage = () => {
    this.setState({ showOperator: false });
    window.open('/apps/task/task_' + this.props.taskId + '?' + getAppFeaturesPath());
  };

  /**
   * 退出任务
   */
  exitTask = () => {
    this.setState({ showOperator: false });
    this.props.removeTaskMember(md.global.Account.accountId);
  };

  /**
   * 删除任务
   */
  delTask = () => {
    this.setState({ showOperator: false });

    const { taskId, taskConfig, openType } = this.props;
    const { data } = this.props.taskDetails[taskId];

    Dialog.confirm({
      title: _l('彻底删除任务'),
      okText: _l('删除'),
      closable: false,
      children: (
        <div>
          <div className="Font14 mBottom20">
            {_l('注意：此操作将彻底删除任务数据，无法恢复。')}
            <span className="deleteFolderColor">{_l('请确认您和任务的其他参与者都不再需要任务中的数据再行删除')}</span>
          </div>
          {!!data.subTask.length && (
            <Checkbox
              className="Gray_9"
              defaultChecked={false}
              ref={this.checkboxRef}
              text={_l('同时删除该任务下的所有子任务')}
            />
          )}
        </div>
      ),
      onOk: () => {
        const deleteAllSubTask = data.subTask.length ? this.checkboxRef.current.state.checked : false;

        if (
          !deleteAllSubTask &&
          data.subTask.length &&
          data.folderID &&
          taskConfig.viewType === config.folderViewType.treeView
        ) {
          taskTreeAfterDeleteTask(taskId, taskConfig.listSort);
        }

        ajaxRequest.deleteTask({ taskID: taskId, isSubTask: deleteAllSubTask }).then(result => {
          if (result.status) {
            alert(_l('删除成功'));

            const parentId = this.props.taskDetails[taskId].data.parentID;
            this.props.dispatch(destroyTask(taskId));

            if (openType === OPEN_TYPE.detail) {
              setTimeout(() => {
                navigateTo('/apps/task/center' + '?' + getAppFeaturesPath());
              }, 300);
            } else {
              this.props.closeDetail();
              if (openType === OPEN_TYPE.slide) {
                _.remove(result.data, id => id === taskId);
                result.data.unshift(taskId);
                afterDeleteTask(result.data, parentId);

                // 不是查看他人时重新拉取计数
                if (!this.props.taskConfig.filterUserId) {
                  getLeftMenuCount('', 'all');
                }
              } else {
                this.props.updateCallback({ type: 'DELETE_TASK', taskId });
              }
            }
          } else {
            errorMessage(result.error);
          }
        });
      },
    });
  };

  render() {
    const { showOperator, showChecklistDialog } = this.state;
    const { taskId, openType, closeDetail } = this.props;
    const { data } = this.props.taskDetails[taskId];
    const isCharge = data.auth === config.auth.Charger;
    const isMember = data.auth === config.auth.Member;

    return (
      <div className={cx('taskDetailHeader boxSizing flexRow')}>
        <div
          className={cx(
            'taskDetailStatusBtn ThemeColor3 ThemeBorderColor3',
            { active: data.status },
            { taskDetailStatusBtnNo: !isCharge && !isMember },
          )}
          onClick={(isCharge || isMember) && this.editTaskStatus}
        >
          <i className="Font16 icon-ok mRight5" />
          {_l('标记完成')}
        </div>

        <div className="flex" />

        <div className="taskDetailHeaderBtn ThemeColor3" onClick={this.refresh}>
          <i className="icon-loop Font16" />
          {_l('刷新')}
        </div>

        {(isCharge || isMember) && (
          <Tooltip title={_l('点击添加子任务')}>
            <div
              className="taskDetailHeaderBtn ThemeColor3 mLeft15"
              onClick={(isCharge || isMember) && this.addSubtask}
            >
              <i className="icon-task-card Font16" />
              {_l('子任务')}
            </div>
          </Tooltip>
        )}

        {data.isTaskMember && (
          <Tooltip title={_l('关闭后将不再接收此任务消息推送（但仍可收到讨论中@你的消息）')} placement="bottomLeft">
            <div className="taskDetailHeaderBtn ThemeColor3 mLeft15" onClick={this.updateTaskNotice}>
              <i className={cx('Font16', data.notice ? 'icon-more_horiz' : 'icon-chat-bell-nopush')} />
              {data.notice ? _l('已开启提醒') : _l('已关闭提醒')}
            </div>
          </Tooltip>
        )}

        {isCharge && (
          <Tooltip title={_l('锁定后任务成员将无法完成和修改任务内容（但仍可参与任务讨论）')} placement="bottomLeft">
            <div className="taskDetailHeaderBtn ThemeColor3 mLeft15" onClick={this.updateTaskLocked}>
              <i className={cx('Font16', data.locked ? 'icon-lock' : 'icon-task-new-no-locked')} />
              {data.locked ? _l('已锁定') : _l('未锁定')}
            </div>
          </Tooltip>
        )}

        <Tooltip title={_l('更多操作')} placement="bottomLeft">
          <div
            className="taskDetailHeaderBtn ThemeColor3 mLeft15 taskDetailHeaderMoreBtn"
            onClick={() => this.setState({ showOperator: !showOperator })}
          >
            <i className="Font16 icon-moreop" />
          </div>
        </Tooltip>

        {openType === OPEN_TYPE.dialog && (
          <Tooltip title={_l('关闭')} placement="bottomLeft">
            <div className="taskDetailHeaderBtn ThemeColor3 mLeft15" onMouseDown={closeDetail}>
              <i className="Font16 icon-delete" />
            </div>
          </Tooltip>
        )}

        <div className="taskContentShadow" />

        {showOperator && (
          <Menu
            className="detaiOperator"
            onClickAway={() => {
              this.setState({ showOperator: false });
            }}
            onClickAwayExceptions={['.taskDetailHeaderMoreBtn']}
          >
            {(isCharge || isMember) && (
              <MenuItem
                icon={<i className="icon-list" />}
                onClick={() => this.setState({ showOperator: false, showChecklistDialog: true })}
              >
                {_l('添加清单')}
              </MenuItem>
            )}

            <MenuItem
              icon={<i className="icon-task-label" />}
              onClick={() => {
                this.setState({ showOperator: false });
                this.props.addTags();
              }}
            >
              {_l('添加标签')}
            </MenuItem>

            {isCharge || isMember ? (
              <Fragment>
                <MenuItem
                  icon={<i className="icon-project-new" />}
                  onClick={() => {
                    this.setState({ showOperator: false });
                    this.props.showRelationControl(RELATION_TYPES.folder);
                  }}
                >
                  {_l('关联项目')}
                </MenuItem>
                <MenuItem
                  icon={<i className="icon-task-new-parent" />}
                  onClick={() => {
                    this.setState({ showOperator: false });
                    this.props.showRelationControl(RELATION_TYPES.task);
                  }}
                >
                  {_l('关联母任务')}
                </MenuItem>
              </Fragment>
            ) : null}

            <div className="detaiOperatorLine" />
            <MenuItem icon={<i className="icon-task-new-copy" />} onClick={this.copyTask}>
              {_l('复制任务')}
            </MenuItem>
            <MenuItem icon={<i className="icon-task-new-print" />} onClick={this.printTask}>
              {_l('打印任务')}
            </MenuItem>
            <MenuItem icon={<i className="icon-link2" />} onClick={this.shareTask}>
              {_l('获取链接与二维码')}
            </MenuItem>
            <MenuItem icon={<i className="icon-task-new-detail" />} onClick={this.openNewPage}>
              {_l('新页面打开')}
            </MenuItem>

            {data.isTaskMember && <div className="detaiOperatorLine" />}

            {data.isTaskMember && data.charge.accountID !== md.global.Account.accountId && (
              <MenuItem icon={<i className="icon-groupExit" />} onClick={this.exitTask}>
                {_l('退出任务')}
              </MenuItem>
            )}
            {isCharge && (
              <MenuItem icon={<i className="icon-trash" />} onClick={this.delTask}>
                {_l('删除任务')}
              </MenuItem>
            )}
          </Menu>
        )}

        {showChecklistDialog && (
          <ClickAwayable
            className="createChecklist boderRadAll_3 boxShadow5"
            onClickAway={() => this.setState({ showChecklistDialog: false })}
          >
            <div className="createChecklistTitle Font15">{_l('添加检查清单')}</div>
            <input
              type="text"
              ref={checklistText => {
                this.checklistText = checklistText;
              }}
              className="createChecklistText ThemeBorderColor3"
              maxLength={100}
              defaultValue={_l('清单')}
              onKeyDown={evt => evt.keyCode === 13 && this.addChecklist()}
            />
            <span
              className="createChecklistBtn ThemeBGColor3 boderRadAll_3 ThemeHoverBGColor2"
              onClick={this.addChecklist}
            >
              {_l('添加')}
            </span>
          </ClickAwayable>
        )}
      </div>
    );
  }
}

export default connect(state => state.task)(Header);
