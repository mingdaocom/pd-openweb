import React, { Component } from 'react';
import { connect, Provider } from 'react-redux';
import _ from 'lodash';
import cx from 'classnames';
import LoadDiv from 'ming-ui/components/LoadDiv';
import withClickAway from 'ming-ui/decorators/withClickAway';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import './index.less';
import * as actions from '../../redux/actions';
import * as ajax from '../../utils/ajax';
import * as socket from '../../utils/socket';
import ChatPanelSession from '../ChatPanelSession';
import { Inbox } from '../../components/Inbox';
const ClickAwayable = createDecoratedComponent(withClickAway);

class ChatPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      isError: false,
    };
  }
  shouldComponentUpdate(nextProps, nextState) {
    const { currentSession } = nextProps;
    if ('isRender' in currentSession && !currentSession.isRender) {
      return false;
    }
    // 个人聊天不是好友，每次点击时拉取数据
    if ('isContact' in currentSession && !currentSession.isContact) {
      return true;
    }
    if (
      nextProps.visible !== this.props.visible &&
      (!currentSession.value || currentSession.value !== this.props.currentSession.value)
    ) {
      return false;
    }
    return true;
  }
  componentWillReceiveProps(nextProps) {
    const { currentSession: newCurrentSession } = nextProps;
    const { currentSession, currentSessionList } = this.props;
    const superfluous = currentSessionList.filter(item => (item.groupId || item.accountId) === newCurrentSession.value);
    if (superfluous.length && 'isContact' in newCurrentSession && !newCurrentSession.isContact) {
      this.props.dispatch(actions.removeCurrentSession(newCurrentSession.value));
      this.props.dispatch(actions.removeMessages(newCurrentSession.value));
      this.chatSessionItem(newCurrentSession);
    }
    if (superfluous.length || newCurrentSession.iconType || _.isEmpty(newCurrentSession)) {
      return;
    }
    if (newCurrentSession.value !== currentSession.value) {
      this.chatSessionItem(newCurrentSession);
    }
  }
  chatSessionItem(session) {
    this.setState({ isError: false, loading: true });
    if (this.ajax && this.ajax.state() === 'pending') {
      this.ajax.abort();
    }
    this.ajax = ajax
      .chatSessionItem(session)
      .done(result => {
        this.setState({ loading: false });
        if (result.groupId) {
          if (result.groupId && !result.isMember) {
            alert(_l('已不在该群组中，请联系管理员'), 2);
            this.handleClosePanel();
            return;
          }
          if (result.groupId && result.status !== 1) {
            alert(_l('该群组已关闭或删除'), 2);
            this.handleClosePanel();
            return;
          }
          this.props.dispatch(actions.addCurrentSession(result));
        } else if (result.accountId) {
          if (result.accountId === 'file-transfer') {
            result.isContact = true;
          }
          this.props.dispatch(actions.addCurrentSession(result));
          if (!result.isContact) {
            this.props.dispatch(
              actions.updateSessionList({
                id: session.value,
                isContact: false,
              }),
            );
          }
        }
      })
      .fail(error => {
        this.setState({
          isError: true,
        });
      });
  }
  handleClosePanel() {
    const { currentSession } = this.props;
    if (currentSession.value) {
      this.props.dispatch(actions.setNewCurrentSession({}));
      socket.Contact.recordAction({ id: '' });
    }
  }
  handleClickAway() {
    this.handleClosePanel();
  }
  handleReset() {
    const { currentSession } = this.props;
    this.setState({ isError: false });
    this.chatSessionItem(currentSession);
  }
  renderInbox() {
    const { currentSession } = this.props;

    return (
      <div className="ChatPanel ChatPanel-inbox">
        <i onClick={this.handleClosePanel.bind(this)} className="ChatPanel-inbox-close icon-close ThemeColor3" />
        <Inbox inboxType={currentSession.iconType} count={currentSession.count} />
      </div>
    );
  }
  render() {
    const { loading, isError } = this.state;
    const { currentSession, currentSessionList = [], visible } = this.props;
    const exceptions = [
      '.ChatList-wrapper',
      // '.ChatList-wrapper .SessionList-scrollView',
      // '.ChatList-wrapper .SessionList-clearAll',
      '.dialogScroll',
      '.ant-modal',
      '.mdModal',
      '.ChatPanel-Trigger',
      '.attachmentsPreview',
      '.Tooltip',
      '.mui-dialog-container',
      '.mdAlertDialog',
      '.confirm',
      '.PositionContainer-wrapper',
      '.groupSettingAvatarSelect',
      '.ui-timepicker-list',
      '.selectUserBox',
      '.warpDatePicker',
      '.dropdownTrigger',
      '.rc-trigger-popup',
      '.workflowStepListWrap',
      '.ant-select-dropdown',
      '.ant-cascader-menus',
      '.InboxFilterWrapper',
      '.ant-picker-dropdown',
      'addMembersMoreAction',
    ];
    return (
      <ClickAwayable
        component="div"
        onClickAwayExceptions={exceptions}
        onClickAway={this.handleClickAway.bind(this)}
        className={cx('ChatPanel-wrapper ChatPanel-position tipBoxShadow', {
          'ChatPanel-close': _.isEmpty(currentSession),
          'ChatPanel-up': visible ? false : true,
          'ChatPanel-small': window.innerHeight < 700,
          'ChatPanel-big': window.innerHeight > 2000,
        })}
      >
        {currentSessionList.map(item => (
          <ChatPanelSession session={item} key={item.id} />
        ))}
        {currentSession.iconType ? this.renderInbox() : undefined}
        {loading ? (
          <div className="ChatPanel ChatPanel-loading">
            {isError && !loading ? (
              <div className="ChatPanel-error ThemeColor3" onClick={this.handleReset.bind(this)}>
                {_l('加载失败，点击重新加载。')}
              </div>
            ) : (
              <LoadDiv size="middle" />
            )}
          </div>
        ) : undefined}
      </ClickAwayable>
    );
  }
}

export default connect(state => {
  const { currentSession, currentSessionList, visible } = state.chat;
  return {
    currentSession,
    currentSessionList,
    visible,
  };
})(ChatPanel);
