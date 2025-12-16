import React, { Component } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import _ from 'lodash';
import LoadDiv from 'ming-ui/components/LoadDiv';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { Inbox } from '../../components/Inbox';
import * as actions from '../../redux/actions';
import * as ajax from '../../utils/ajax';
import ChatPanelSession from '../ChatPanelSession';
import './index.less';

const ClickAwayable = createDecoratedComponent(withClickAway);

const exceptions = [
  '.ChatList-wrapper',
  '.dialogScroll',
  '.ant-modal',
  '.mdModal',
  '.ChatPanel-Trigger',
  '.attachmentsPreview',
  '.mui-dialog-container',
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

class ChatPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      isError: false,
      error: undefined,
    };
  }
  shouldComponentUpdate(nextProps) {
    const { currentSession } = nextProps;
    if ('isRender' in currentSession && !currentSession.isRender) {
      return false;
    }
    // 个人聊天不是好友，每次点击时拉取数据
    if ('isContact' in currentSession && !currentSession.isContact) {
      return true;
    }
    if (!_.isEqual(nextProps.toolbarConfig, this.props.toolbarConfig)) {
      return true;
    }
    if (
      nextProps.toolbarConfig.sessionListVisible !== this.props.toolbarConfig.sessionListVisible &&
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
    this.ajax
      .then(result => {
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
      .catch(error => {
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
    this.props.dispatch(actions.closeSessionPanel());
  }
  handleClickAway() {
    this.handleClosePanel();
  }
  handleReset() {
    const { currentSession } = this.props;
    this.setState({ isError: false });
    this.chatSessionItem(currentSession);
  }
  getRightValue = () => {
    const { toolbarConfig } = this.props;
    const rightToolbarWidth = 56;
    if (toolbarConfig.sessionListVisible) {
      const drawerWidth = Number(localStorage.getItem(`sessionListDrawerWidth`) || 0) || 250;
      return drawerWidth + rightToolbarWidth;
    }
    if (toolbarConfig.mingoVisible) {
      const drawerWidth = Number(localStorage.getItem(`mingoDrawerWidth`) || 0) || 400;
      return drawerWidth + rightToolbarWidth;
    }
    if (toolbarConfig.favoriteVisible) {
      const drawerWidth = Number(localStorage.getItem(`favoriteDrawerWidth`) || 0) || 400;
      return drawerWidth + rightToolbarWidth;
    }
    return undefined;
  };
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
    const { currentSession, currentSessionList = [], currentInboxList = [], embed = false } = this.props;
    return (
      <ClickAwayable
        component="div"
        onClickAwayExceptions={exceptions}
        onClickAway={embed ? _.noop : this.handleClickAway.bind(this)}
        style={{ right: this.getRightValue() }}
        className={cx('ChatPanel-wrapper', {
          'ChatPanel-position': !embed,
          tipBoxShadow: !embed,
          'ChatPanel-close': _.isEmpty(currentSession),
          'ChatPanel-small': embed ? undefined : window.innerHeight < 700,
          'ChatPanel-big': embed ? undefined : window.innerHeight > 2000,
        })}
      >
        {currentSessionList.map(item => (
          <ChatPanelSession session={item} key={item.id} />
        ))}
        {currentInboxList.map(item => this.renderInbox(item))}
        {loading && (
          <div className="ChatPanel ChatPanel-loading">
            {isError ? (
              <div className="ChatPanel-error ThemeColor3" onClick={error ? undefined : this.handleReset.bind(this)}>
                {error ? error : _l('加载失败，点击重新加载。')}
              </div>
            ) : (
              <LoadDiv size="middle" />
            )}
          </div>
        )}
      </ClickAwayable>
    );
  }
}

export default connect(state => {
  const { currentSession, currentSessionList, currentInboxList, toolbarConfig } = state.chat;
  return {
    currentSession,
    currentSessionList,
    currentInboxList,
    toolbarConfig,
  };
})(ChatPanel);
