import React, { Component } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import MessageView from '../MessageView';
import MessageSendText from '../../components/MessageSendText';
import CardToolbar from '../../components/CardToolbar';
import SendToolbar from '../../components/SendToolbar';
import Textarea from '../../components/Textarea';
import * as socket from '../../utils/socket';
import * as actions from '../../redux/actions';
import * as utils from '../../utils';
import ChatPanelHeader from '../ChatPanelHeader';
import ChatPanelSessionInfo from '../ChatPanelSessionInfo';
import Constant from '../../utils/constant';
import { notification, NotificationContent } from 'ming-ui/components/Notification';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import { setCaretPosition } from 'src/util';

@errorBoundary
class ChatPanelSession extends Component {
  constructor(props) {
    super(props);
    const { session } = this.props;
    const { id, isGroup } = session;
    this.currentHeight = 0;
    this.isFocus = true;
    this.state = {
      value: localStorage.getItem(`textareaValue${id}`) || '',
      infoVisible: isGroup ? (!localStorage.getItem('chatInfoHidden')) : false,
      searchText: '',
      isOpenFile: false,
      isContact: 'isContact' in session ? session.isContact : true,
    };
  }
  shouldComponentUpdate(nextProps, nextState) {
    const { session } = this.props;
    if (nextProps.currentSession.value === session.id) {
      return true;
    }
    return false;
  }
  componentWillReceiveProps(nextProps) {
    const value = nextProps.currentSession.value;
    value && this.focus(value);
  }
  focus(id) {
    if (typeof id !== 'string') return;
    $(`#ChatPanel-${id} .ChatPanel-Textarea`).find('.Textarea').focus();
  }
  jointMessageText(value, emotionText) {
    const { currentCursortPosition } = window;
    const start = value.slice(0, currentCursortPosition);
    const end = value.slice(currentCursortPosition, value.length);
    window.currentCursortPosition = currentCursortPosition + emotionText.length;
    return {
      length: start.length + emotionText.length,
      msg: `${start}${emotionText}${end}`,
    };
  }
  handleSetInfoVisible(visible) {
    const { isGroup } = this.props.session;
    if (isGroup) {
      visible ? localStorage.removeItem('chatInfoHidden') : safeLocalStorageSetItem('chatInfoHidden', true);
    }
    this.setState({
      infoVisible: visible,
      isOpenFile: false,
    });
  }
  handleSearchText(searchText) {
    const { session } = this.props;
    const { infoVisible, isOpenFile } = this.state;
    this.setState({
      searchText,
      infoVisible: searchText ? true : session.isGroup ? infoVisible : false,
      isOpenFile: searchText ? false : isOpenFile,
    });
  }
  handleOpenFile(isOpenFile) {
    const { session } = this.props;
    const { infoVisible, searchText } = this.state;
    this.setState({
      isOpenFile,
      infoVisible: isOpenFile ? true : session.isGroup ? infoVisible : false,
      searchText: '',
    });
  }
  handlePrepareUpload(temporaryMessage) {
    const { session, messages } = this.props;
    const currentMessages = messages[session.id] || [];
    const messageType = session.isGroup ? Constant.SESSIONTYPE_GROUP : Constant.SESSIONTYPE_USER;
    const sendMsg = {
      ...temporaryMessage,
      waitingid: temporaryMessage.file.id,
      isPrepare: true,
    };
    if (session.isGroup) {
      sendMsg.togroup = session.id;
    } else {
      sendMsg.touser = session.id;
    }
    this.props.dispatch(actions.addMessage(sendMsg, currentMessages[currentMessages.length - 1]));
  }
  handleSendEmotionTextMsg(emotionText) {
    const { value } = this.state;
    const { currentSession } = this.props;
    const { msg, length } = this.jointMessageText(value, emotionText);
    const textarea = $(`#ChatPanel-${currentSession.value}`).find('.ChatPanel-textarea textarea');
    this.setState({
      value: msg,
    });
    setCaretPosition(textarea.get(0), length);
  }
  handleBlur(value) {
    // 草稿
    const { id } = this.props.session;
    this.props.dispatch(
      actions.updateSessionList({
        id,
        sendMsg: value,
      })
    );
    this.updateValue(value);
  }
  handleChange(value) {
    this.updateValue(value);
    window.currentCursortPosition = value.length;
  }
  updateValue(value) {
    const { session, isWindow } = this.props;
    const { id } = session;
    value ? safeLocalStorageSetItem(`textareaValue${id}`, value) : localStorage.removeItem(`textareaValue${id}`);
    this.setState({
      value,
    });
    if (isWindow && window.opener && window.opener.updateChatSessionList) {
      window.opener.updateChatSessionList(id, value);
    }
  }
  handleSelectedUser(user) {
    const { session } = this.props;
    const textarea = $(`#ChatPanel-${session.id}`).find('.ChatPanel-textarea textarea');
    const value = textarea.val();
    this.setState({
      value,
    });
  }
  /**
   * 取消引用消息
   */
  handleRemoveReferMessage() {
    const { session } = this.props;
    this.props.dispatch(actions.removeReferMessage(session.id));
  }
  /**
   * 文字消息
   */
  handleSendMsg(value) {
    if (IM.socket.connected) {
      const sendMsg = {
        type: 1,
        msg: value || this.state.value,
      };
      this.sendMessage(sendMsg);
      this.handleRemoveReferMessage();
      this.updateValue('');
    } else {
      if (!notification.is('chat')) {
        const props = {
          themeColor: 'error',
          header: <div>{_l('连接失败，请重新刷新页面')}</div>,
          footer: <div className="ThemeColor3" style={{ cursor: 'pointer' }} onClick={() => { location.reload() }}>{_l('刷新')}</div>,
        }
        notification.open({
          content: <NotificationContent {...props} />,
          key: 'connectedError',
          duration: null,
        });
      }
      alert(_l('消息无法发送，请刷新页面重新连接'));
    }
  }
  /**
   * 卡片消息
   */
  handleSendCardMsg(card) {
    const cardSender = utils.cardDisposeName(card.card);
    const value = `[${cardSender.name}] ${card.card.title}`;
    const sendMsg = {
      msg: value,
      ...card,
    };
    this.sendMessage(sendMsg);
  }
  /**
   * 表情图片消息
   */
  handleSendEmotionPicMsg(pic) {
    const sendMsg = {
      msg: pic.file.name,
      ...pic,
    };
    this.sendMessage(sendMsg);
  }
  /**
   * 图片&附件消息
   */
  handleSendFileMsg(file, msg) {
    const { session } = this.props;
    const sendMsg = {
      waitingid: utils.getUUID(),
      msg,
      ...file,
    };
    this.props.dispatch(actions.removeMessage(session.id, file.file.id));
    this.sendMessage(sendMsg);
  }
  /**
   * 个人发送抖动消息
   */
  handleShake() {
    const { session, messages } = this.props;
    const currentMessages = messages[session.id] || [];
    socket.Message.sendShake(Constant.SESSIONTYPE_USER, {
      aid: session.id,
    }).then((result) => {
      const sendMsg = {
        waitingid: utils.getUUID(),
        msg: _l('你发送了一个抖动'),
        sysType: Constant.MSGTYPE_SYSTEM_SUCCESS,
        touser: session.id,
      };
      utils.shake(session.id);
      this.props.dispatch(actions.addMessage(sendMsg, currentMessages[currentMessages.length - 1]));
    });
  }
  /**
   * 发送消息
   */
  sendMessage(param) {
    const { session, messages, referMessage } = this.props;
    const currentMessages = messages[session.id] || [];
    const currentReferMessage = referMessage[session.id];
    const messageType = session.isGroup ? Constant.SESSIONTYPE_GROUP : Constant.SESSIONTYPE_USER;
    const atParam = session.isGroup ? this.getAtParam(session.id) : false;
    const sendMsg = {
      ...param,
      atParam,
    };
    sendMsg.waitingid = param.waitingid ? param.waitingid : utils.getUUID();
    if (session.isGroup) {
      sendMsg.togroup = session.id;
    } else {
      sendMsg.touser = session.id;
    }
    if (currentReferMessage && currentReferMessage.id) {
      sendMsg.referMessage = currentReferMessage;
      sendMsg.refer = {
        msgid: currentReferMessage.id,
      };
    }
    this.props.dispatch(actions.addMessage(sendMsg, currentMessages[currentMessages.length - 1]));
    this.props.dispatch(
      actions.updateSessionList({
        id: session.id,
        addMsg: `${_l('我')}: ${sendMsg.msg}`,
      })
    );
    socket.Message.send(messageType, Object.assign({}, sendMsg)).then((result) => {
      const { socket: message } = result;
      this.props.dispatch(actions.updateMessage({
        to: session.id,
        referMessage: sendMsg.referMessage,
        ...result,
      }));
      // this.props.dispatch(actions.updateMessage(message));
      // 包含 at 消息
      if (atParam) {
        socket.Message.sendShake(Constant.SESSIONTYPE_GROUP, {
          ...atParam,
          messageId: result.id,
        });
      }
    }, (result) => {
      const { error } = result;
      if (error === 'not my contract') {
        this.setState({
          isContact: false,
        });
        this.props.dispatch(actions.updateMessage({
          to: session.id,
          waitingid: sendMsg.waitingid,
          id: sendMsg.waitingid,
          isContact: false,
        }));
        this.props.dispatch(actions.updateSessionList({
          id: session.id,
          isContact: false,
        }));
      }
    });
  }
  getAtParam(id) {
    const textarea = $(`#ChatPanel-${id}`).find('.ChatPanel-textarea textarea');
    let atList = [];
    textarea.wcMentionsInput('getMentions', (users) => {
      for (let i = 0; i < users.length; i++) {
        if (users[i].id === 'all') {
          atList = 'all';
          break;
        }
        atList.push(users[i].id);
      }
    });
    if (atList.length || atList === 'all') {
      return {
        gid: id,
        toUser: atList,
      };
    } else {
      return false;
    }
  }
  render() {
    const { value, infoVisible, searchText, isOpenFile, isContact } = this.state;
    const { session, referMessage } = this.props;
    const { id } = session;
    return (
      <div>
        <ChatPanelHeader
          session={session}
          searchText={searchText}
          isOpenFile={isOpenFile}
          infoVisible={infoVisible}
          onSetInfoVisible={this.handleSetInfoVisible.bind(this)}
          onSearchText={this.handleSearchText.bind(this)}
          onOpenFile={this.handleOpenFile.bind(this)}
        />
        <div className="ChatPanel-body">
          <div className="ChatPanel-sessionWrapper">
            <MessageView session={session} />
            <div className="ChatPanel-textarea">
              <div className={cx('sessionTextarea', { disable: !isContact })}>
                {isContact ? null : <div className="mask"></div>}
                <CardToolbar session={session} onSendCardMsg={this.handleSendCardMsg.bind(this)} />
                <Textarea
                  disabled={!isContact}
                  value={value}
                  session={session}
                  placeholder={isContact ? _l('说点什么…') : ''}
                  referMessage={referMessage[id]}
                  onSendMsg={this.handleSendMsg.bind(this)}
                  onBlur={this.handleBlur.bind(this)}
                  onChange={this.handleChange.bind(this)}
                  onRemoveReferMessage={this.handleRemoveReferMessage.bind(this)}
                />
                <SendToolbar
                  session={session}
                  onSendEmotionTextMsg={this.handleSendEmotionTextMsg.bind(this)}
                  onSendEmotionPicMsg={this.handleSendEmotionPicMsg.bind(this)}
                  onSendFileMsg={this.handleSendFileMsg.bind(this)}
                  onPrepareUpload={this.handlePrepareUpload.bind(this)}
                  onSelectedUser={this.handleSelectedUser.bind(this)}
                  onShake={this.handleShake.bind(this)}
                />
              </div>
              <MessageSendText value={value} onSendMsg={this.handleSendMsg.bind(this)} />
            </div>
          </div>
          <ChatPanelSessionInfo session={session} searchText={searchText} isOpenFile={isOpenFile} infoVisible={infoVisible} />
        </div>
      </div>
    );
  }
}

const ChatPanelSessionConnect = connect((state) => {
  const { currentSession, messages, referMessage, currentSessionList, isWindow } = state.chat;

  return {
    currentSession,
    messages,
    referMessage,
    currentSessionList,
    isWindow,
  };
})(ChatPanelSession);

class ChatPanelWrapper extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { session, currentSession } = this.props;
    const { id } = session;
    return (
      <div id={`ChatPanel-${id}`} className={cx('ChatPanel', { 'ChatPanel-active': currentSession.value === id })}>
        <ChatPanelSessionConnect session={session} />
      </div>
    );
  }
}

export default connect((state) => {
  const { currentSession } = state.chat;
  return {
    currentSession,
  };
})(ChatPanelWrapper);
