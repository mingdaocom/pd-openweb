import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import Commenter from 'src/components/comment/commenter';
import CommentList from 'src/components/comment/commentList';
import { htmlDecodeReg } from 'src/utils/core/string';
import {
  addTaskDiscussions,
  discussionsAddMembers,
  removeTaskDiscussions,
  updateCommentList,
} from '../../../redux/actions';
import './taskCommentList.less';

const getTaskAtData = data => {
  const accounts = [
    {
      accountId: data.charge.accountID,
      avatar: data.charge.avatar,
      fullname: data.charge.fullName,
      job: _l('负责人'),
    },
    ...(data.member || [])
      .filter(item => item.type === 0 && item.status !== 2)
      .map(item => ({
        accountId: item.account.accountID,
        avatar: item.account.avatar,
        fullname: item.account.fullName || item.account.fullname,
        job: _l('参与者'),
      })),
  ];
  const accountIds = new Set();

  return accounts
    .filter(({ accountId }) => {
      if (!accountId || accountId === md.global.Account.accountId || accountIds.has(accountId)) {
        return false;
      }

      accountIds.add(accountId);
      return true;
    })
    .slice(0, 20);
};

class TaskCommentList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      onlyLookMe: false,
    };
  }

  static defaultProps = {
    taskId: '',
    addPostSuccessCount: () => {},
    scrollToComment: () => {},
    manualRef: () => {},
  };

  /**
   * 更新讨论列表
   */
  updateCommentList = data => {
    const { taskId, addPostSuccessCount } = this.props;

    addPostSuccessCount();
    this.props.dispatch(updateCommentList(taskId, data));
  };

  /**
   * 回复讨论
   */
  onSubmit = data => {
    const { taskId } = this.props;

    this.props.dispatch(addTaskDiscussions(taskId, data));
    if (data.newAccounts.length) {
      this.props.dispatch(discussionsAddMembers(taskId, data.newAccounts));
    }

    this.props.scrollToComment();
  };

  /**
   * 删除讨论回调
   */
  removeDiscussionsCallback = discussionId => {
    this.props.dispatch(removeTaskDiscussions(this.props.taskId, discussionId));
  };

  render() {
    const { onlyLookMe } = this.state;
    const { taskId, taskDetails, manualRef } = this.props;
    const { data } = taskDetails[taskId];
    const discussions = this.props.taskDiscussions[taskId] || [];
    const commenterProps = {
      sourceId: taskId,
      sourceType: Commenter.TYPES.TASK,
      appId: md.global.APPInfo.taskAppID,
      remark: taskId + '|' + htmlDecodeReg(data.taskName) + '|' + _l('任务'),
      storageId: taskId,
      forReacordDiscussion: true,
      atData: getTaskAtData(data),
      projectId: data.projectID,
      selectGroupOptions: { projectId: data.projectID },
      onSubmit: this.onSubmit,
    };

    return (
      <Fragment>
        <div className="isOnlyLookBox">
          <span
            className={cx('isOnlyLook', { checked: onlyLookMe })}
            onClick={() => this.setState({ onlyLookMe: !onlyLookMe })}
          >
            <i className="operationCheckbox icon-ok bgColorPrimary borderColorPrimary" />
            {_l('只显示与我有关')}
          </span>
        </div>
        <CommentList
          isFocus={onlyLookMe}
          sourceId={taskId}
          sourceType={CommentList.TYPES.TASK}
          commentList={discussions}
          updateCommentList={this.updateCommentList}
          removeComment={this.removeDiscussionsCallback}
          manualRef={manualRef}
        >
          <Commenter {...commenterProps} />
        </CommentList>
      </Fragment>
    );
  }
}

export default connect(state => state.task)(TaskCommentList);
