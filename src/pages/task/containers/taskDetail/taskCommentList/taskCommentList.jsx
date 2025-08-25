import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import Commenter from 'src/components/comment/commenter';
import CommentList from 'src/components/comment/commentList';
import { htmlDecodeReg } from 'src/utils/common';
import {
  addTaskDiscussions,
  discussionsAddMembers,
  removeTaskDiscussions,
  updateCommentList,
} from '../../../redux/actions';
import './taskCommentList.less';

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
            <i className="operationCheckbox icon-ok ThemeBGColor3 ThemeBorderColor3" />
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
