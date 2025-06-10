import React, { Component } from 'react';
import { connect, Provider } from 'react-redux';
import cx from 'classnames';
import _ from 'lodash';
import LoadDiv from 'ming-ui/components/LoadDiv';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { Inbox } from '../../components/Inbox';
import * as actions from '../../redux/actions';
import * as ajax from '../../utils/ajax';
import * as socket from '../../utils/socket';
import ChatPanelSession from '../ChatPanelSession';
import './index.less';

const ClickAwayable = createDecoratedComponent(withClickAway);

class ChatPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      isError: false,
      error: undefined,
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
    const { currentSession, currentSessionList, currentInboxList } = this.props;
    const sessionSuperfluous = currentSessionList.filter(
      item => (item.groupId || item.accountId) === newCurrentSession.value,
    );
    const inboxSuperfluous = currentInboxList.filter(item => item.id === newCurrentSession.value);
    const isExist = sessionSuperfluous.length || inboxSuperfluous.length;
    if (
      isExist &&
      'isContact' in newCurrentSession &&
      !newCurrentSession.isContact &&
      newCurrentSession.value !== currentSession.value
    ) {
      this.props.dispatch(actions.removeCurrentSession(newCurrentSession.value));
      this.props.dispatch(actions.removeMessages(newCurrentSession.value));
      this.chatSessionItem(newCurrentSession);
    }
    if (isExist || _.isEmpty(newCurrentSession)) {
      return;
    }
    if (newCurrentSession.value !== currentSession.value) {
      if (newCurrentSession.iconType) {
        this.inboxSessionItem(newCurrentSession);
      } else {
        this.chatSessionItem(newCurrentSession);
      }
    }
  }
  chatSessionItem(session) {
    this.setState({ isError: false, loading: true });
    if (this.ajax && this.ajax.abort) {
      this.ajax.abort();
    }
    this.ajax = ajax.chatSessionItem(session);
    this.ajax.then(result => {
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
    }).catch(error => {
      this.setState({
        isError: true,
        error: _.get(error, 'errorMessage'),
      });
    });
  }
  inboxSessionItem(session) {
    this.setState({ isError: false });
    this.props.dispatch(actions.addCurrentInbox(session));
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
  renderInbox(item) {
    const { currentSession = {} } = this.props;
    return (
      <div
        className={cx('ChatPanel ChatPanel-inbox', { 'ChatPanel-active': currentSession.value === item.id })}
        key={item.id}
      >
        <i onClick={this.handleClosePanel.bind(this)} className="ChatPanel-inbox-close icon-close ThemeColor3" />
        <Inbox
          inboxType={item.id}
          count={currentSession.value === item.id ? currentSession.count : 0}
          weak_count={currentSession.value === item.id ? currentSession.weak_count : 0}
          requestNow={currentSession.value === item.id ? item.requestNow : undefined}
        />
      </div>
    );
  }
  render() {
    const { loading, isError, error } = this.state;
    const { currentSession, currentSessionList = [], currentInboxList = [], visible } = this.props;
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
      '.addMembersMoreAction',
      '.ChatList-ContextMenu',
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
        {currentInboxList.map(item => this.renderInbox(item))}
        {loading ? (
          <div className="ChatPanel ChatPanel-loading">
            {isError ? (
              <div className="ChatPanel-error ThemeColor3" onClick={error ? undefined : this.handleReset.bind(this)}>
                {error ? error : _l('加载失败，点击重新加载。')}
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
  const { currentSession, currentSessionList, currentInboxList, visible } = state.chat;
  return {
    currentSession,
    currentSessionList,
    currentInboxList,
    visible,
  };
})(ChatPanel);
