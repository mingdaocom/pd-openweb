import React, { Component } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import { htmlDecodeReg } from 'src/util';
import Commenter from 'src/components/comment/commenter';
import Icon from 'ming-ui/components/Icon';
import './taskComment.less';
import { addTaskDiscussions, discussionsAddMembers } from '../../../redux/actions';

class TaskComment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showCount: true,
    };
  }

  /**
   * 发表任务讨论
   */
  onSubmit = data => {
    const { taskId } = this.props;
    this.props.dispatch(addTaskDiscussions(taskId, data));

    if (data.newAccounts.length) {
      this.props.dispatch(discussionsAddMembers(taskId, data.newAccounts));
    }
    this.props.scrollToComment();
  };

  render() {
    const { taskId, taskDetails } = this.props;
    const { data } = taskDetails[taskId] || {};

    return (
      <div className="taskComment clearfix">
        <div className="avatarBox">
          <img className="circle userAvatar" src={md.global.Account.avatar} />
        </div>
        {this.state.showCount ? (
          <div
            className="Right TxtCenter"
            style={{ width: '40px' }}
            onClick={() => {
              this.props.scrollToComment();
            }}
          >
            <span className="taskTopicCount ThemeHoverColor3">
              <Icon icon={'ic_textsms_black'} className="Font20 TxtMiddle Hand" />
            </span>
          </div>
        ) : null}
        <div className={cx('commenterBox', { mRight0: !this.state.showCount })}>
          <Commenter
            sourceId={taskId}
            sourceType={Commenter.TYPES.TASK}
            appId={md.global.APPInfo.taskAppID}
            remark={taskId + '|' + htmlDecodeReg(data.taskName) + '|' + _l('任务')}
            storageId={taskId}
            mentionsOptions={{ position: 'top' }}
            selectGroupOptions={{ projectId: data.projectID, position: 'top' }}
            onSubmit={this.onSubmit}
            onFocusStateChange={isFocus => this.setState({ showCount: !isFocus })}
          />
        </div>
      </div>
    );
  }
}

export default connect(state => state.task)(TaskComment);
