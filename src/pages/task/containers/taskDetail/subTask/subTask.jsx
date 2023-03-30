import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import './subTask.less';
import { connect } from 'react-redux';
import { formatTaskTime, checkIsProject, taskStatusDialog } from '../../../utils/utils';
import Textarea from 'ming-ui/components/Textarea';
import config, { OPEN_TYPE } from '../../../config/config';
import withClickAway from 'ming-ui/decorators/withClickAway';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import quickSelectUser from 'ming-ui/functions/quickSelectUser';
import { addSubTask, editTaskStatus, updateTaskName, updateTaskCharge, taskFoldStatus } from '../../../redux/actions';
import { expireDialogAsync } from 'src/components/common/function';
import UserHead from 'src/pages/feed/components/userHead';
import dialogSelectUser from 'src/components/dialogSelectUser/dialogSelectUser';
import {
  afterUpdateTaskName,
  afterUpdateTaskStatus,
  afterAddTask,
  afterUpdateTaskCharge,
} from '../../../utils/taskComm';
import _ from 'lodash';

const ClickAwayable = createDecoratedComponent(withClickAway);
const statusTip = [
  _l('任务已锁定，无法操作'),
  _l('标记为未完成'),
  _l('任务已锁定，但我是创建者或负责人可以操作'),
  _l('标记完成'),
];

// 单条子任务
class SingleItem extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    if (_.isEqual(nextProps, this.props)) {
      return false;
    }

    return true;
  }

  /**
   * 回车失去焦点
   */
  updateTaskNameKeyDown = evt => {
    if (evt.keyCode === 13) {
      evt.currentTarget.blur();
      evt.preventDefault();
    }
  };

  /**
   * opHtml
   */
  renderOpHtml() {
    return `
      <span class="Gray_9e ThemeHoverColor3 pointer w100 oaButton updateSubTaskCharge">
        ${_l('更改负责人')}
      </span>
    `;
  }

  render() {
    const { item } = this.props;
    const {
      charge,
      status,
      startTime,
      deadline,
      actualStartTime,
      completeTime,
      taskName,
      auth,
      locked,
      taskID,
      projectID,
    } = item;
    const hasAuth = auth === config.auth.Charger || auth === config.auth.Member;
    let subTaskStatus = '';
    let tipMessage = '';

    if (auth === config.auth.None || auth === config.auth.Look) {
      if (status) {
        subTaskStatus = 'slideCompleteTask';
      } else if (locked) {
        subTaskStatus = 'slideMarkTaskLockedDisable';
        tipMessage = statusTip[0];
      } else {
        subTaskStatus = 'slideMarkDisable';
      }
    } else {
      if (status) {
        subTaskStatus = 'slideCompleteTask';
        tipMessage = statusTip[1];
      } else if (locked) {
        subTaskStatus = 'slideMarkTaskLocked';
        tipMessage = statusTip[2];
      } else {
        subTaskStatus = 'slideMarkTask';
        tipMessage = statusTip[3];
      }
    }

    return (
      <li className="flexRow">
        <div className="subTasksStatusWidth">
          <span
            className={cx('updateTaskStatus tip-bottom-right', subTaskStatus)}
            data-tip={tipMessage}
            onClick={() => hasAuth && this.props.editTaskStatus(taskID, status ? 0 : 1)}
          />
        </div>
        <Textarea
          disabled={!hasAuth}
          className="flex subTaskName"
          minHeight={20}
          maxLength={100}
          defaultValue={taskName}
          spellCheck={false}
          onKeyDown={this.updateTaskNameKeyDown}
          onBlur={evt => this.props.updateTaskName(evt, taskID, taskName)}
        />
        <div className="subTaskOperator">
          <span
            className="subTaskTimer"
            dangerouslySetInnerHTML={{
              __html: formatTaskTime(status, startTime, deadline, actualStartTime, completeTime),
            }}
          />
          <span
            className="subTaskMembers"
            onClick={evt => hasAuth && this.props.clickChargeAvatar(evt, charge.accountID, taskID)}
          >
            <UserHead
              className={cx({ gray: charge.status !== 1 }, { opacity6: status })}
              user={{
                userHead: charge.avatar,
                accountId: charge.accountID,
              }}
              lazy={'false'}
              size={26}
              showOpHtml={hasAuth}
              opHtml={this.renderOpHtml()}
              readyFn={evt => this.props.readyFn(evt, projectID, taskID, charge.accountID)}
            />
          </span>
          <span
            className="subTaskLink tip-bottom-left"
            data-tip={_l('查看子任务详情和评论')}
            onClick={() => this.props.switchTaskDetail(taskID)}
          >
            {item.totalItemCount || item.topicCount || item.subCount ? (
              <i className="icon-task-signal Font13" />
            ) : (
              <i className="icon-arrow-right-border" />
            )}
          </span>
        </div>
      </li>
    );
  }
}

class Subtask extends Component {
  constructor(props) {
    super(props);

    const isMe = props.taskDetails[props.taskId].data.charge.accountID === md.global.Account.accountId;

    this.state = {
      addSubTask: props.addSubTask,
      accountId: isMe ? 'user-undefined' : md.global.Account.accountId,
      avatar: isMe ? md.global.SystemAccounts.undefined.avatar : md.global.Account.avatar,
      value: '',
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.addSubTask) {
      this.setState({ addSubTask: nextProps.addSubTask });
      this.props.closeAddSubTask();
    }

    if (nextProps.taskId !== this.props.taskId) {
      const isMe = nextProps.taskDetails[nextProps.taskId].data.charge.accountID === md.global.Account.accountId;
      this.setState({
        accountId: isMe ? 'user-undefined' : md.global.Account.accountId,
        avatar: isMe ? md.global.SystemAccounts.undefined.avatar : md.global.Account.avatar,
      });
    }
  }

  /**
   * 更改任务状态
   */
  editTaskStatus = (taskId, status) => {
    const callback = source => {
      if (this.props.openType === OPEN_TYPE.slide) {
        afterUpdateTaskStatus(source, status, false);
      } else {
        this.props.updateCallback({ type: 'UPDATE_TASK_STATUS', tasks: source.tasks });
      }
    };

    taskStatusDialog(status, () => {
      this.props.dispatch(editTaskStatus(this.props.taskId, status, false, taskId, callback));
    });
  };

  /**
   * 更改任务名称
   */
  updateTaskName = (evt, taskID, oldTaskName) => {
    const taskName = _.trim(evt.currentTarget.value);
    const callback = () => {
      if (this.props.openType === OPEN_TYPE.slide) {
        afterUpdateTaskName(taskID, taskName);
      } else {
        this.props.updateCallback({ type: 'UPDATE_NAME', taskName });
      }
    };

    if (taskName === oldTaskName) {
      return;
    }

    if (taskName) {
      this.props.dispatch(updateTaskName(this.props.taskId, taskName, taskID, callback));
    } else {
      evt.currentTarget.value = oldTaskName;
    }
  };

  /**
   * 渲染添加任务
   */
  renderAddTask() {
    const { accountId, avatar, value } = this.state;

    return (
      <ClickAwayable
        component="li"
        className="flexRow ThemeBGColor5 addSubTask"
        onClickAwayExceptions={['.selectUserBox', '#dialogBoxSelectUser_container']}
        onClickAway={this.addTask}
      >
        <div className="subTasksStatusWidth">
          <span className="slideAddMarkTask cursorDefault" />
        </div>
        <Textarea
          className="flex subTaskName"
          minHeight={20}
          maxLength={100}
          value={value}
          isSelect
          spellCheck={false}
          onKeyDown={evt => this.addTask(evt)}
          onChange={value => this.setState({ value: value.replace(/[\r\n]/, '') })}
        />
        <div className="subTaskOperator">
          <span className="subTaskMembers">
            <img className="subChargeAvatar" src={avatar} onClick={evt => this.clickChargeAvatar(evt, accountId)} />
          </span>
          <span className="subTaskLink" />
        </div>
      </ClickAwayable>
    );
  }

  /**
   * 显示添加子任务块
   */
  showAddSubTaskModule = () => {
    const { data } = this.props.taskDetails[this.props.taskId];

    expireDialogAsync(data.projectID).then(() => {
      this.setState({ addSubTask: true });
    });
  };

  /**
   * 点击切换负责人
   */
  clickChargeAvatar = (evt, accountId, taskId = '') => {
    const { data } = this.props.taskDetails[this.props.taskId];
    const updateChargeCallback = user => {
      if (this.props.openType === OPEN_TYPE.slide) {
        afterUpdateTaskCharge(taskId, user.avatar, user.accountId);
      } else {
        this.props.updateCallback({ type: 'UPDATE_CHARGE', user });
      }
    };
    const callback = users => {
      const user = users[0];

      if (taskId) {
        this.props.dispatch(updateTaskCharge(this.props.taskId, user, taskId, () => updateChargeCallback(user)));
      } else {
        this.setState({ accountId: user.accountId, avatar: user.avatar });
      }
    };

    quickSelectUser(evt.target, {
      sourceId: data.taskID,
      projectId: data.projectID,
      fromType: 2,
      filterAccountIds: [accountId],

      showMoreInvite: false,
      includeUndefinedAndMySelf: true,
      SelectUserSettings: {
        filterAccountIds: [accountId],
        projectId: checkIsProject(data.projectID) ? data.projectID : '',
        callback,
      },
      selectCb: callback,
    });
  };

  /**
   * 新建任务
   */
  addTask = evt => {
    const { accountId } = this.state;
    const { taskId, openType } = this.props;
    const { data } = this.props.taskDetails[taskId];
    const value = _.trim(this.state.value);
    const callback = source => {
      if (openType === OPEN_TYPE.slide) {
        source.stageID = data.stageID;
        source.taskName = source.name;
        source.parentID = taskId;
        afterAddTask(source);
      }
    };

    if (evt && evt.keyCode === 13) {
      evt.preventDefault();
    }

    // 点击外部全部关闭创建
    if (
      !$(evt || {})
        .add(evt.target)
        .closest('.addSubTask').length
    ) {
      this.setState({ addSubTask: false });
    }

    // 回车内容为空的时候
    if (!value && evt && evt.keyCode === 13) {
      alert(_l('任务名称不能为空'), 3);
      return;
    }

    if (
      (!$(evt || {})
        .add(evt.target)
        .closest('.addSubTask').length ||
        evt.keyCode === 13) &&
      value
    ) {
      this.props.dispatch(addSubTask(data.taskID, value, accountId, data.projectID, callback));
      this.setState({ value: '' });
    }
  };

  /**
   * 获取操作权限
   */
  getOperatorAuth() {
    const { data } = this.props.taskDetails[this.props.taskId];

    return data.auth === config.auth.Charger || data.auth === config.auth.Member;
  }

  /**
   * op操作
   */
  readyFn = (evt, projectId, taskId, accountId) => {
    const that = this;
    const callback = user => {
      if (this.props.openType === OPEN_TYPE.slide) {
        afterUpdateTaskCharge(taskId, user.avatar, user.accountId);
      } else {
        this.props.updateCallback({ type: 'UPDATE_CHARGE', user });
      }
    };

    evt.on('click', '.updateSubTaskCharge', function () {
      dialogSelectUser({
        sourceId: taskId,
        title: _l('选择负责人'),
        showMoreInvite: false,
        fromType: 2,
        SelectUserSettings: {
          includeUndefinedAndMySelf: true,
          filterAccountIds: [accountId],
          projectId: checkIsProject(projectId) ? projectId : '',
          unique: true,
          callback(users) {
            const user = users[0];
            that.props.dispatch(updateTaskCharge(that.props.taskId, user, taskId, () => callback(user)));
          },
        },
      });
    });
  };

  /**
   * 更改任务详情的收起展开
   */
  updateTaskFoldStatus = () => {
    this.props.dispatch(taskFoldStatus(this.props.taskId, 'subTask'));
  };

  render() {
    const { addSubTask } = this.state;
    const { data } = this.props.taskDetails[this.props.taskId];
    const subTask = data.subTask;
    const isHidden = _.includes(this.props.taskFoldStatus[this.props.taskId] || [], 'subTask');

    if (!subTask.length && !addSubTask) {
      return null;
    }

    return (
      <div className="taskContentBox">
        <div className="subTaskBox">
          <span className="subTaskIcon" data-tip={_l('子任务')}>
            <i className="icon-task-card" />
          </span>
          <div className="subTaskHeader Font14">
            {_l('子任务')}
            <span className="subTaskComplete mLeft5">{_.filter(data.subTask, item => item.status === 1).length}</span>/
            <span className="subTaskSum">{data.subTask.length}</span>
            <span
              className="subTaskMessage mLeft5"
              data-tip={_l(
                '如果分解后的任务比较复杂、需要分别指派负责人，或需要在每条任务中分别记录跟进情况的，建议使用子任务。其他情况下，建议使用检查清单来做关键结果追踪，支持将重要检查项一键转为任务',
              )}
            >
              <i className="icon-info Font16" />
            </span>
            <span className="Right" data-tip={isHidden ? _l('展开') : _l('收起')}>
              <i
                className={cx('pointer ThemeColor3', isHidden ? 'icon-arrow-down-border' : 'icon-arrow-up-border')}
                onClick={this.updateTaskFoldStatus}
              />
            </span>
          </div>
          {!isHidden ? (
            <Fragment>
              <ul className="subTaskList">
                {subTask.map(item => (
                  <SingleItem
                    key={item.taskID}
                    item={item}
                    editTaskStatus={this.editTaskStatus}
                    updateTaskName={this.updateTaskName}
                    clickChargeAvatar={this.clickChargeAvatar}
                    readyFn={this.readyFn}
                    switchTaskDetail={this.props.switchTaskDetail}
                  />
                ))}
                {addSubTask && this.renderAddTask()}
              </ul>
              {!addSubTask && this.getOperatorAuth() && (
                <span className="addSubTaskBtn pointer ThemeColor3" onClick={this.showAddSubTaskModule}>
                  <i className="icon-plus" />
                  {_l('添加子任务')}
                </span>
              )}
            </Fragment>
          ) : null}
        </div>
      </div>
    );
  }
}

export default connect(state => state.task)(Subtask);
