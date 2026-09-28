import React, { Component } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import Icon from 'ming-ui/components/Icon';
import Commenter from 'src/components/comment/commenter';
import { htmlDecodeReg } from 'src/utils/core/string';
import { addTaskDiscussions, discussionsAddMembers } from '../../../redux/actions';
import './taskComment.less';

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
            <span className="taskTopicCount hoverColorPrimary">
              <Icon icon="textsms" className="Font20 TxtMiddle Hand" />
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
            forReacordDiscussion
            atData={getTaskAtData(data)}
            projectId={data.projectID}
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
