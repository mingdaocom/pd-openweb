import React, { Component, Fragment } from 'react';
import { createRoot } from 'react-dom/client';
import { connect } from 'react-redux';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, ScrollView } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import LoadDiv from 'ming-ui/components/LoadDiv';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import withClickAway from 'ming-ui/decorators/withClickAway';
import GroupController from 'src/api/group';
import { getRequest } from 'src/utils/common';
import SessionItem from '../../components/SessionItem';
import * as actions from '../../redux/actions';
import * as utils from '../../utils/';
import * as ajax from '../../utils/ajax';
import Constant from '../../utils/constant';
import * as socket from '../../utils/socket';
import './index.less';

const ClickAwayable = createDecoratedComponent(withClickAway);

class ContextMenu extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this.popup = document.createElement('div');
    this.popup.className = 'ChatList-ContextMenu';
    document.querySelector('body').appendChild(this.popup);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible) {
      this.renderLayer(nextProps);
    } else {
      $(this.popup).hide();
    }
  }
  handleShow(offset) {
    $(this.popup).show().css({
      left: offset.x,
      top: offset.y,
    });
  }
  renderLayer(props) {
    let { children, offset } = props;
    const root = createRoot(this.popup);

    root.render(children);

    setTimeout(() => {
      this.handleShow(offset);
    }, 200);
  }
  render() {
    return <noscript />;
  }
}

const getOffsetData = function (rootW, rootH, nativeEvent) {
  const { clientX, clientY } = nativeEvent;
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;
  const right = screenW - clientX > rootW;
  const left = !right;
  const top = screenH - clientY > rootH;
  const bottom = !top;
  const offset = {};

  if (right) {
    offset.x = clientX + 5;
  }

  if (left) {
    offset.x = clientX - rootW - 5;
  }

  if (top) {
    offset.y = clientY + 5;
  }

  if (bottom) {
    offset.y = clientY - rootH - 5;
  }
  return offset;
};

class SessionList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageIndex: 1,
      loading: false,
      isMore: true,
      menuVisible: false,
      offset: [],
      hoverItem: {},
      isFeed: false,
      isClear: false,
      chatCount: 0,
      showSessionCount: 0,
    };
    this.isWindowChat = location.href.includes('windowChat');
  }
  componentDidMount() {
    // const { visible } = this.props;
    // 会话列表
    this.getChatSessionList(this.state.pageIndex);
    // 全局打开会话窗口
    window.handleOpenChatPanel = this.handleOpenChatPanel.bind(this);
    // !visible && this.handleResizeObserver();
  }
  componentWillUnmount() {
    this.resizeObserver && this.resizeObserver.unobserve(this.sessionListWrap);
  }
  componentWillReceiveProps(nextProps) {
    const { chatCount } = this.state;
    const { sessionList, currentSession } = nextProps;
    if (!sessionList.length) {
      this.getChatSessionList(1);
      return;
    }
    const currentChatCount = sessionList.reduce((count, item) => {
      if (item.count && 'isSilent' in item) {
        return item.isSilent ? count : (count += item.count);
      } else if (item.count && ('isPush' in item ? item.isPush : true)) {
        return (count += item.count);
      } else {
        return count;
      }
    }, 0);
    window.setUnreadCount && window.setUnreadCount(currentChatCount);
    if (currentChatCount !== chatCount) {
      this.setState({
        chatCount: currentChatCount,
      });
    }
    if (this.props.currentSession.id && currentSession.id !== this.props.currentSession.id) {
      const { id } = getRequest();
      if (this.isWindowChat && id) {
        history.replaceState(null, '', window.location.pathname);
      }
    }
    if (this.props.messageListShowType !== nextProps.messageListShowType) {
      this.props.dispatch(actions.setSessionList(sessionList));
    }
    if (this.isWindowChat && sessionList.length && _.isEmpty(currentSession)) {
      const { id, type } = getRequest();
      const target = _.find(sessionList, { value: id });
      if (target) {
        this.handleOpenPanel(target);
      } else if (utils.getIsInbox(id)) {
        id && this.addInbox({ id, type });
      } else {
        id && this.addSession({ id, type });
      }
    }
  }
  handleResizeObserver() {
    this.resizeObserver = new ResizeObserver(() => {
      const { clientHeight } = this.sessionListWrap;
      const sessionHeight = 42;
      const marginBottom = 5;
      const count = parseInt((clientHeight + marginBottom) / sessionHeight);
      this.setState({
        showSessionCount: count > 0 ? count - 1 : count,
      });
    });
    if (this.sessionListWrap) {
      this.resizeObserver.observe(this.sessionListWrap);
    }
  }
  getChatSessionList(pageIndex) {
    const { loading, isMore } = this.state;
    if (this.loading || loading || !isMore) {
      return;
    }
    this.loading = true;
    this.setState({
      loading: true,
    });
    ajax
      .chatSessionList({
        pageIndex,
        pageSize: 30,
      })
      .then(sessionList => {
        if (_.isEmpty(sessionList)) {
          this.setState({
            isMore: false,
          });
        }
        if (pageIndex === 1) {
          this.props.dispatch(actions.setSessionList(sessionList));
        } else {
          this.props.dispatch(actions.addSessionList(sessionList));
        }
        this.setState({
          pageIndex: pageIndex + 1,
          loading: false,
        });
        this.loading = false;
        // 页面刚加加载完看是否存在未读消息，有的话加新消息提醒
        if (pageIndex === 1 && sessionList.length) {
          for (let i = 0; i < sessionList.length; i++) {
            const session = sessionList[i] || {};
            const hasPush = 'isPush' in session ? session.isPush : true;
            const notSilient = 'isSilent' in session ? !session.isSilent || [1, 2].includes(session.showBadge) : true;
            if (session && session.count && hasPush && notSilient) {
              utils.flashTitle();
              continue;
            }
          }
        }
      });
  }
  addInbox = ({ id, type }) => {
    const message = {
      count: 0,
      id,
      type: Number(type),
      dtype: id,
    };
    socket.Contact.recordAction({
      id: message,
      type: 3,
    });
    socket.Contact.clearUnread({
      type: message.type,
      value: id,
    }).then(() => {
      this.props.dispatch(
        actions.updateSessionList({
          id,
          clearCount: 0,
        }),
      );
    });
    this.props.dispatch(actions.addSysSession(id, message));
  };
  addSession = ({ id, type = 1 }) => {
    ajax
      .chatSessionItem({
        type,
        value: id,
      })
      .then(result => {
        let data = {};
        if (type == Constant.SESSIONTYPE_USER) {
          data = {
            isGroup: false,
            uname: result.fullname,
            count: 0,
            from: result.accountId,
            logo: result.avatar,
            sysType: 1,
            msg: { con: '' },
          };
        } else if (type == Constant.SESSIONTYPE_GROUP) {
          data = {
            isGroup: true,
            groupname: result.name,
            count: 0,
            to: result.groupId,
            from: result.from,
            avatar: result.avatar,
            sysType: 1,
            msg: { con: '' },
          };
        }
        this.props.dispatch(actions.addSession(data));
        // this.props.dispatch(actions.addCurrentSession(result));
        this.handleOpenPanel(data);
      });
  };
  handleScrollEnd() {
    this.getChatSessionList(this.state.pageIndex);
  }
  handleRemoveFlashTitle(value) {
    const { sessionList } = this.props;
    utils.removeFlashTitle(value, sessionList);
  }
  handleOpenChatPanel(id) {
    const { sessionList } = this.props;
    const item = sessionList.filter(item => item.value === id)[0];
    item && this.handleOpenPanel(item);
  }
  handleOpenPanel(item) {
    // 看是否打开过全局窗口
    // if (utils.chatWindow.is(item.value)) {
    //   return;
    // }
    // 设置当前会话窗口
    if ('showBadge' in item) {
      item.showBadge = 0;
    }
    this.props.dispatch(actions.setNewCurrentSession(item));

    // 同步窗口
    const param = {
      id: item.value,
      type: item.isGroup ? 2 : 1,
    };
    if ('showBadge' in item) {
      param.showBadge = 0;
    }
    socket.Contact.recordAction(param);

    // 清除计数
    if (item.count || item.weak_count) {
      socket.Contact.clearUnread(Object.assign({}, item)).then(() => {
        this.props.dispatch(
          actions.updateSessionList({
            id: item.value,
            clearCount: item.count,
          }),
        );
      });
    }
    // 清除 @
    if (item.atlist && item.atlist.length) {
      this.props.dispatch(
        actions.updateSessionList({
          id: item.value,
          atlist: [],
        }),
      );
    }
    // 清除回复我
    if (item.refer) {
      this.props.dispatch(
        actions.updateSessionList({
          id: item.value,
          refer: null,
        }),
      );
    }
    // 如果不存在其他计数关闭新消息提醒
    this.handleRemoveFlashTitle(item.value);
  }
  handleRemoveSession(item, event) {
    event.stopPropagation();
    // 看是否打开过全局窗口
    // if (utils.chatWindow.is(item.value)) {
    //   return;
    // }
    utils.chatWindow.remove(item.value);
    socket.Contact.remove({
      id: item.value,
      type: item.type,
    }).then(() => {});
  }
  handleContextMenu(item, event) {
    event.preventDefault();
    const isFeed = 'isPost' in item ? item.isPost : item.type > 2 ? false : true;
    const isFileTransfer = item.value === Constant.FILE_TRANSFER.id;
    const rootW = 190;
    const rootH = isFeed ? 150 : 110;
    const offset = getOffsetData(rootW, rootH, event.nativeEvent);
    this.setState({
      offset,
      menuVisible: true,
      hoverItem: item,
      isFeed: isFileTransfer ? false : isFeed,
    });
  }
  handleContextClearMenu(event) {
    event.preventDefault();
    const rootW = 190;
    const rootH = 110;
    const offset = getOffsetData(rootW, rootH, event.nativeEvent);
    this.setState({
      offset,
      menuVisible: true,
      isClear: true,
    });
  }
  handleMenuChange() {
    const { menuVisible } = this.state;
    this.setState({
      menuVisible: !menuVisible,
    });
  }
  handleClickAway() {
    const { menuVisible } = this.state;
    if (menuVisible) {
      this.setState({
        menuVisible: false,
        hoverItem: {},
        isClear: false,
      });
    }
  }
  handleStick() {
    const { type, value, top_info } = this.state.hoverItem;
    const isTop = top_info ? top_info.isTop : false;
    this.props.dispatch(
      actions.sendSetTop({
        type,
        value,
        isTop: !isTop,
      }),
    );
    this.handleClickAway();
  }
  handleOpenFeed() {
    const { hoverItem } = this.state;
    const { type, value } = hoverItem;
    if (type === Constant.SESSIONTYPE_USER) {
      window.open(`/user_${value}`);
    } else if (type === Constant.SESSIONTYPE_GROUP) {
      window.open(`/feed?groupId=${value}`);
    }
    this.handleClickAway();
  }
  handleClearAllCount(visible) {
    const { chatCount } = this.state;
    if (visible) {
      chatCount && socket.Contact.clearAllUnread();
      this.handleClickAway();
    } else {
      this.handleGotoSession();
    }
  }
  handleGotoSession() {
    // const { chatCount } = this.state;
    // const { sessionList } = this.props;
    // const scrollView = this.scrollView;
    // if (chatCount) {
    //   const sessions = sessionList.filter(item => item.count);
    //   const sessionEls = sessions.map(item => {
    //     const el = $(`[data-id=${item.value}]`);
    //     return el.size() ? el.position().top : 0;
    //   });
    //   const { contentScrollTop } = scrollView;
    //   const gotoCount = this.gotoCount || 0;
    //   if (gotoCount === sessionEls.length - 1) {
    //     this.gotoCount = 0;
    //   } else {
    //     this.gotoCount = gotoCount + 1;
    //   }
    //   this.scrollView.current.scrollTo(sessionEls[gotoCount] + contentScrollTop);
    // } else {
    //   this.scrollView.current.scrollTo(0);
    // }
  }
  handleUpdatePushNotice() {
    const { hoverItem } = this.state;
    const { type, isPush, value, isSilent } = hoverItem;

    switch (type) {
      case Constant.SESSIONTYPE_GROUP:
        GroupController.updateGroupPushNotice({
          groupId: value,
          isPushNotice: !isPush,
        }).then(() => {
          this.props.dispatch(actions.updateGroupPushNotice(value, !isPush));
          this.handleClickAway();
        });
        break;
      default:
        this.props.dispatch(
          actions.sendSetSlience({
            type,
            AccountID: md.global.Account.accountId,
            isSilent: !isSilent,
          }),
        );
        setTimeout(() => {
          this.handleClickAway();
        }, 500);
        break;
    }
  }
  renderMenu() {
    const { isFeed, hoverItem } = this.state;
    const { top_info, type, isPush, isSilent } = hoverItem;
    const isTop = top_info ? top_info.isTop : false;
    const isSet = 'isSession' in hoverItem ? (type === Constant.SESSIONTYPE_GROUP ? true : false) : true;
    const isPushNotice = ('isPush' in hoverItem && type === Constant.SESSIONTYPE_GROUP) || 'isSilent' in hoverItem;
    const isPushNoticeValue = type === 2 ? isPush : !isSilent;

    return (
      <div className="ChatPanel-addToolbar-menu">
        {isSet ? (
          <div className="menuItem ThemeBGColor3" onClick={this.handleStick.bind(this)}>
            <Icon icon={isTop ? 'unpin' : 'set_top'} className="Font16" />
            <div className="menuItem-text">{isTop ? _l('取消置顶') : _l('置顶')}</div>
          </div>
        ) : undefined}
        {isFeed ? (
          <div className="menuItem ThemeBGColor3" onClick={this.handleOpenFeed.bind(this)}>
            <Icon icon="chat1" className="Font16" />
            <div className="menuItem-text">{_l('查看动态')}</div>
          </div>
        ) : undefined}
        {isPushNotice && (
          <div className="menuItem ThemeBGColor3" onClick={this.handleUpdatePushNotice.bind(this)}>
            <Icon icon={isPushNoticeValue ? 'notifications_off' : 'notifications'} className="Font16" />
            <div className="menuItem-text">{isPushNoticeValue ? _l('消息免打扰') : _l('允许提醒')}</div>
          </div>
        )}
        <div
          className="menuItem ThemeBGColor3"
          onClick={event => {
            this.handleRemoveSession(this.state.hoverItem, event);
            this.handleClickAway();
          }}
        >
          <Icon icon="clear" className="Font16" />
          <div className="menuItem-text">{_l('移除会话')}</div>
        </div>
      </div>
    );
  }
  renderClearMenu() {
    return (
      <div className="ChatPanel-addToolbar-menu">
        <div className="menuItem ThemeBGColor3" onClick={this.handleClearAllCount.bind(this, true)}>
          <div className="menuItem-text">{_l('忽略全部消息')}</div>
        </div>
      </div>
    );
  }
  renderEmpty() {
    return (
      <div className="ChatList-sessionList-nodata">
        <div className="image"></div>
        <div className="text">{_l('添加人员进行聊天吧')}</div>
      </div>
    );
  }
  renderClearAllCount() {
    const { chatCount } = this.state;
    const { visible, socketState } = this.props;
    if (visible) {
      return (
        <div className="SessionList-clearAll ThemeBGColor9">
          {socketState === 0 && (
            <Fragment>
              <div onClick={this.handleGotoSession.bind(this)}>
                <h3 className="ThemeColor10">{_l('消息')}</h3>
                <div className={cx('text', { red: chatCount })}>
                  {chatCount ? _l('%0条新消息', chatCount) : _l('暂无新消息')}
                </div>
              </div>
              <Tooltip title={_l('忽略全部消息')} placement="left">
                <div className="clearAll" onClick={this.handleClearAllCount.bind(this, visible)}>
                  <i className="icon-clean_all ThemeColor3"></i>
                </div>
              </Tooltip>
            </Fragment>
          )}
          {socketState === 1 && (
            <Fragment>
              <div>
                <h3 className="ThemeColor10">{_l('消息')}</h3>
                <div className="text red">{_l('网络已断开，正在重新连接')}</div>
              </div>
              <div className="clearAll">
                <LoadDiv size="small" />
              </div>
            </Fragment>
          )}
          {socketState === 2 && (
            <Fragment>
              <div>
                <h3 className="ThemeColor10">{_l('消息')}</h3>
                <div className="text red">{_l('网络已断开')}</div>
              </div>
              <Tooltip title={_l('刷新页面')} placement="left">
                <div className="clearAll" onClick={() => location.reload()}>
                  <i className="icon-network_disconnection red"></i>
                </div>
              </Tooltip>
            </Fragment>
          )}
        </div>
      );
    } else {
      return (
        <div
          className="SessionList-clearAll ThemeBGColor9"
          onClick={socketState === 0 ? this.handleClearAllCount.bind(this, visible) : undefined}
          onContextMenu={event => {
            socketState === 0 && this.handleContextClearMenu(event);
          }}
        >
          {socketState === 0 && (
            <Tooltip placement="left" title={chatCount ? _l('%0条未读消息', chatCount) : _l('暂无新消息')}>
              <div className="SessionList-bell" style={{ cursor: chatCount ? 'pointer' : 'initial' }}>
                <i className="icon-notifications"></i>
                {chatCount ? <span>{chatCount >= 99 ? '99+' : chatCount}</span> : undefined}
              </div>
            </Tooltip>
          )}
          {socketState === 1 && (
            <Tooltip placement="left" title={_l('网络已断开，正在重新连接')}>
              <div className="SessionList-bell">
                <LoadDiv size="small" />
              </div>
            </Tooltip>
          )}
          {socketState === 2 && (
            <Tooltip placement="left" title={_l('网络已断开，点击刷新页面')}>
              <div className="SessionList-bell" onClick={() => location.reload()}>
                <i className="icon-network_disconnection red Font20"></i>
              </div>
            </Tooltip>
          )}
        </div>
      );
    }
  }
  render() {
    const { loading, menuVisible, offset, hoverItem, isClear, chatCount } = this.state;
    const { currentSession, visible, sessionList, isOpenCommonApp } = this.props;
    return (
      <div
        className={cx('ChatList-sessionList-wrapper flexColumn minHeight0', {
          'ChatList-sessionList-show': visible,
        })}
        ref={el => {
          this.sessionListWrap = el;
        }}
      >
        <div className="flex minHeight0">
          <ScrollView
            onScrollEnd={this.handleScrollEnd.bind(this)}
            className="SessionList-scrollView ThemeBGColor9"
            options={{ scrollbars: visible ? {} : { visibility: 'hidden' } }}
            ref={scrollView => {
              this.scrollView = scrollView;
            }}
          >
            {sessionList.map(item => (
              <SessionItem
                onOpenPanel={this.handleOpenPanel.bind(this, item)}
                onRemoveSession={this.handleRemoveSession.bind(this, item)}
                onContextMenu={event => {
                  this.handleContextMenu(item, event);
                }}
                item={item}
                visible={visible}
                key={item.value}
                isActive={item.value === currentSession.value}
                isHover={item.value === hoverItem.value}
              />
            ))}
            {!sessionList.length && visible && !loading ? this.renderEmpty() : undefined}
            {loading && (
              <div className={cx('ChatList-sessionList-loading', { visible: !visible, nodata: !sessionList.length })}>
                <LoadDiv size="small" />
              </div>
            )}
            <ClickAwayable
              component="div"
              onClickAway={this.handleClickAway.bind(this)}
              onClickAwayExceptions={['.ChatPanel-addToolbar-menu']}
            >
              <ContextMenu visible={menuVisible} offset={offset}>
                {isClear ? this.renderClearMenu() : this.renderMenu()}
              </ContextMenu>
            </ClickAwayable>
          </ScrollView>
        </div>
        {!visible && (isOpenCommonApp ? !!chatCount : true) && (
          <div
            className="flexRow alignItemsCenter justifyContentCenter mTop5"
            onClick={() => {
              document.querySelector('.toolbarWrap .sessionList').click();
            }}
          >
            <Tooltip title={chatCount ? _l('未读消息') : _l('展开')} placement="left" align={{ offset: [-3, 0] }}>
              <div className="countWrap pointer Font12">
                {chatCount ? chatCount >= 99 ? '99+' : chatCount : <Icon icon="arrow-left-border" />}
              </div>
            </Tooltip>
          </div>
        )}
      </div>
    );
  }
}

export default connect(state => {
  const { currentSession, currentSessionList, sessionList, socketState, toolbarConfig } = state.chat;
  return {
    currentSession,
    currentSessionList,
    sessionList,
    socketState,
    messageListShowType: toolbarConfig.messageListShowType,
    isOpenCommonApp: toolbarConfig.isOpenCommonApp && toolbarConfig.hideOpenCommonApp !== true,
  };
})(SessionList);
