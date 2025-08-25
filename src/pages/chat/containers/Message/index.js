import React, { Component } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import _ from 'lodash';
import { UserCard } from 'ming-ui';
import AudioMessage from '../../components/Message/AudioMessage';
import CardMessage from '../../components/Message/CardMessage';
import FileMessage from '../../components/Message/FileMessage';
import ImageMessage from '../../components/Message/ImageMessage';
import KcFileMessage from '../../components/Message/KcFileMessage';
import MapMessage from '../../components/Message/MapMessage';
import MessageRefer from '../../components/Message/MessageRefer';
import MessageRetry from '../../components/Message/MessageRetry';
import MessageToolbar from '../../components/Message/MessageToolbar';
import SystemMessage from '../../components/Message/SystemMessage';
import TextMessage from '../../components/Message/TextMessage';
import WorksheetFileMessage from '../../components/Message/WorksheetFileMessage';
import * as actions from '../../redux/actions';
import * as utils from '../../utils';
import Constant from '../../utils/constant';
import * as socket from '../../utils/socket';
import './index.less';

class Message extends Component {
  constructor(props) {
    super(props);
    this.state = {
      moreVisible: false,
    };
  }
  shouldComponentUpdate(nextProps) {
    const { currentSession } = this.props;
    if (currentSession.value == nextProps.currentSession.value) {
      return true;
    }
    return false;
  }

  handleSetMessageMoreVisible(visible) {
    this.setState({
      moreVisible: visible,
    });
  }
  handleMouseLeave() {
    this.handleSetMessageMoreVisible(false);
  }
  handleUpdateKcFile(newMessage) {
    const { session } = this.props;
    this.props.dispatch(actions.updateFileMessage(newMessage, session.id));
  }
  handleWithdrawMessage() {
    const { session, message } = this.props;
    const { to } = message;
    const { isAdmin } = session;
    const param = {
      messageId: message.id,
      [session.isGroup ? 'groupid' : 'touser']: message.to,
      time: message.time,
    };
    const type = session.isGroup ? Constant.SESSIONTYPE_GROUP : Constant.SESSIONTYPE_USER;
    if (isAdmin) {
      param.adminid = md.global.Account.accountId;
    }
    socket.Message.sendWithdrawMessgae(type, param).then(result => {
      const { socket: newMessage } = result;
      this.props.dispatch(actions.updateWithdrawMessage(to, newMessage));
      this.props.dispatch(
        actions.updateSessionList({
          id: to,
          addMsg: newMessage.msg.con,
        }),
      );
    });
  }
  handleAddReferMessage() {
    const { currentSession, message } = this.props;
    this.props.dispatch(actions.setReferMessage(currentSession.value, message));
    utils.highlightReferMessage(currentSession.value);
  }
  handleRetry() {
    const { message, session } = this.props;
    const messageType = session.isGroup ? Constant.SESSIONTYPE_GROUP : Constant.SESSIONTYPE_USER;
    const { sendMsg } = message;
    socket.Message.send(messageType, sendMsg).then(result => {
      const { atParam } = sendMsg;
      this.props.dispatch(
        actions.updateMessage({
          to: session.id,
          referMessage: sendMsg.referMessage,
          video: sendMsg.video,
          ...result,
        }),
      );
      // 包含 at 消息
      if (atParam) {
        socket.Message.sendShake(Constant.SESSIONTYPE_GROUP, {
          ...atParam,
          messageId: result.id,
        });
      }
    });
  }
  renderMessageContent() {
    const { message, session, messages } = this.props;

    switch (message.type) {
      case Constant.MSGTYPE_TEXT:
        return <TextMessage message={message} />;
      case Constant.MSGTYPE_PIC:
        return (
          <ImageMessage message={message} session={session} messageLength={_.get(messages[session.id], 'length')} />
        );
      case Constant.MSGTYPE_FILE:
        return <FileMessage message={message} session={session} />;
      case Constant.MSGTYPE_CARD:
        // 知识文件是卡片类型的，要按照文件类型显示...
        if (message.card.md === 'kcfile') {
          return (
            <KcFileMessage onUpdateKcFile={this.handleUpdateKcFile.bind(this)} message={message} session={session} />
          );
        } else if (message.card.md === 'worksheet') {
          return <WorksheetFileMessage message={message} session={session} />;
        } else {
          return <CardMessage session={session} message={message} />;
        }
      case Constant.MSGTYPE_AUDIO:
        return <AudioMessage message={message} />;
      case Constant.MSGTYPE_APP_VIDEO:
        return <FileMessage message={message} session={session} />;
      case Constant.MSGTYPE_MAP:
        return <MapMessage message={message} />;
      default:
        break;
    }
  }
  renderUserMessage() {
    const { moreVisible } = this.state;
    const { message, nextMessage, session } = this.props;
    const { fromAccount = {}, timestamp, isMine, unreadLine, isMineMessage } = message;
    const isDuplicated = message.isDuplicated && message.from === nextMessage.from;

    return (
      <div data-isminemessage={isMineMessage || false}>
        {unreadLine ? (
          <div className="Message-unreadLine">
            <span className="Message-unreadLineTxt">{_l('以下是新消息')}</span>
          </div>
        ) : undefined}
        {timestamp && !isDuplicated ? (
          <div className="Message-timestamp">
            <div className="Message-timestamp-content">{timestamp}</div>
          </div>
        ) : undefined}
        <div
          className={cx('Message-container', {
            'Message-container-continuous': isDuplicated,
            'Message-toolbar-moreHover': moreVisible,
          })}
          onMouseLeave={this.handleMouseLeave.bind(this)}
        >
          <MessageToolbar
            session={session}
            moreVisible={moreVisible}
            message={message}
            isDuplicated={isDuplicated}
            onAddReferMessage={this.handleAddReferMessage.bind(this)}
            onWithdrawMessage={this.handleWithdrawMessage.bind(this)}
            onSetMessageMoreVisible={this.handleSetMessageMoreVisible.bind(this)}
          />
          {!isDuplicated ? (
            <div className="Message-from">
              <UserCard
                sourceId={fromAccount.id}
                disabled={!fromAccount}
                projectId={_.get(session, 'project.projectId')}
              >
                <img
                  ref={avatar => {
                    this.avatar = avatar;
                  }}
                  className="Message-from-avatar"
                  src={fromAccount.logo}
                  draggable={false}
                />
              </UserCard>
            </div>
          ) : undefined}
          <div className="Message-body">
            {!isDuplicated ? (
              <div className="Message-title ellipsis">
                <div className={cx('Message-from-name', { ThemeColor3: isMine })}>
                  {isMine ? _l('我') : fromAccount.name}
                </div>
              </div>
            ) : undefined}
            {message.refer ? (
              <MessageRefer message={message.refer} onGotoMessage={this.props.onGotoMessage} />
            ) : undefined}
            <div className="Message-content">
              {this.renderMessageContent()}
              {isMine && !message.id && !message.isPrepare ? (
                <MessageRetry message={message} onRetry={this.handleRetry.bind(this)} />
              ) : undefined}
            </div>
          </div>
        </div>
      </div>
    );
  }
  render() {
    const { message, session } = this.props;
    const { sysType, iswd } = message;
    return (
      <div id={`Message-${message.id}`}>
        {sysType || iswd ? <SystemMessage message={message} session={session} /> : this.renderUserMessage()}
      </div>
    );
  }
}

export default connect(state => {
  const { currentSession, messages } = state.chat;

  return {
    currentSession,
    messages,
  };
})(Message);
