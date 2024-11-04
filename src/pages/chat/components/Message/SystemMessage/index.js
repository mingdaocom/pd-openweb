import React, { Component } from 'react';
import cx from 'classnames';
import './index.less';
import Constant from '../../../utils/constant';
import { addFriendConfirm } from 'ming-ui/functions';
import addFriends from 'src/components/addFriends';

export default class SystemMessage extends Component {
  constructor(props) {
    super(props);
  }
  addFriend() {
    const { session } = this.props;
    addFriendConfirm({
      accountId: session.id,
    });
  }
  invite() {
    addFriends({
      selectProject: true,
      friendVisible: false,
    });
  }
  handleClick(event) {
    const { target } = event;
    if (target.tagName === 'SPAN') {
      target.classList.contains('addFriend') && this.addFriend();
      target.classList.contains('invite') && this.invite();
    }
  }
  handleResetEdit = () => {
    const { message, session } = this.props;
    const textarea = $(`#ChatPanel-${session.id}`).find('.ChatPanel-Textarea .Textarea');
    const currentValue = textarea.val();
    const onChangeChatValue = window[`onChangeChatValue-${session.id}`] || _.noop;
    if (currentValue) {
      onChangeChatValue(`${currentValue} ${message.msg.oldCon}`);
    } else {
      onChangeChatValue(message.msg.oldCon);
    }
    setTimeout(() => {
      textarea.focus();
    }, 0);
  }
  render() {
    const { message, session } = this.props;
    const isFileTransfer = session.id === 'file-transfer';
    return (
      <div className="Message-sysType">
        <div
          className={cx('Message-sysType-icon', {
            'Message-sysType-reduceIcon': message.sysType === Constant.MSGTYPE_SYSTEM_ERROR,
          })}
        >
          <i className="icon-wc-sysmsg" />
        </div>
        {'isContact' in message ? (
          <div
            onClick={this.handleClick.bind(this)}
            className="Message-sysType-text"
            dangerouslySetInnerHTML={{
              __html: _l(
                `对方不是您的联系人，可以%0或%1成为组织成员`,
                `<span class="ThemeColor3 Font13 pointer addFriend">${_l('添加好友')}</span>`,
                `<span class="ThemeColor3 Font13 pointer invite">${_l('邀请')}</span>`,
              ),
            }}
          />
        ) : (
          <div onClick={this.handleClick.bind(this)} className="Message-sysType-text">
            {message.msg.con}
          </div>
        )}
        {_.get(message.msg, 'oldCon') && message.type === Constant.MSGTYPE_TEXT && !isFileTransfer && <div className="Font13 pointer ThemeColor mLeft8" onClick={this.handleResetEdit}>{_l('重新编辑')}</div>}
      </div>
    );
  }
}
