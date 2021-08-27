import React, { Component } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import preall from 'src/common/preall';
import PageHeaderRoute from './PageHeader';
import ChatList from 'src/pages/chat/containers/ChatList';
import ChatPanel from 'src/pages/chat/containers/ChatPanel';
import { createDiscussion } from 'src/pages/chat/utils/group';
import genRouteComponent from './genRouteComponent';
import { ROUTE_CONFIG, withoutChatUrl } from './config';
import { navigateTo, setHistoryObject } from './navigateTo';
import store from 'redux/configureStore';
import * as actions from 'src/pages/chat/redux/actions';
import socketInit from '../socket';
import './index.less';

@preall
@errorBoundary(true)
@withRouter
export default class App extends Component {
  constructor(props) {
    super(props);
    setHistoryObject(props.history);
    props.history.listen(location => {
      if (md.global.updated) {
        md.global.updated = false;
        window.location.reload();
      }
      if (window.ga) {
        window.ga('set', 'page', location.pathname + location.search);
        window.ga('send', 'pageview', location.pathname + location.search);
      }
    });

    this.state = {
      prevPath: '',
    };
    this.genRouteComponent = genRouteComponent();
    if (!window.isPublicApp) {
      socketInit();
    }
  }

  componentDidMount() {
    const that = this;
    const isMDClient = window.navigator.userAgent.indexOf('MDClient') > -1;
    // 拦截 a 标签跳转
    // TODO: 这个会拦截掉 react 的事件
    $('body').on('click', 'a', function interceptLinkClick(e) {
      if (e.which !== 1) return;
      if (e.ctrlKey || e.shiftKey || e.metaKey) return;
      if (e.originalEvent && e.originalEvent.defaultPrevented) return;
      if ($(e.target).closest('.mdEditorContent').length) return;
      const $a = $(this);
      if (
        $a.hasClass('DisableInterceptClick') ||
        $a.attr('download') ||
        $a.attr('rel') === 'external' ||
        (!isMDClient && $a.attr('target'))
      ) {
        return;
      }
      const link = $a.attr('href');
      if (!link && link !== '') return;
      const parsedLink = that.parseUrl(link);
      const currentLink = window.location;
      if (
        parsedLink.protocol !== currentLink.protocol ||
        parsedLink.hostname !== currentLink.hostname ||
        parsedLink.port !== currentLink.port
      ) {
        return;
      }
      if (/\/form|worksheetshare\/\w*/.test(parsedLink.pathname)) {
        return;
      }
      e.preventDefault();

      // 系统消息 有的带protocol和hostname有的不带
      // 从parsedLink里取出pathname, search和hash
      const { pathname, search, hash } = parsedLink;
      const url = `${pathname}${search}${hash}`;

      if (isMDClient && that.checkClientOpenWindow(url)) {
        window.open(url);
      } else {
        navigateTo(url);
      }
    });

    // 绑定快捷操作
    this.bindMSTC();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location !== this.props.location) {
      this.setState({ prevPath: this.props.location });
    }
  }

  parseUrl(url) {
    var a = document.createElement('a');
    a.href = url;
    return {
      protocol: a.protocol,
      hostname: a.hostname,
      port: a.port,
      pathname: ('/' + a.pathname).replace('//', '/'),
      search: a.search,
      hash: a.hash,
      origin: a.origin,
    };
  }

  /**
   * 绑定快捷操作
   */
  bindMSTC() {
  const feedVisible = !md.global.SysSettings.forbidSuites.includes('1');
  const taskVisible = !md.global.SysSettings.forbidSuites.includes('2');
  const calendarVisible = !md.global.SysSettings.forbidSuites.includes('3');
  const knowledgeVisible = !md.global.SysSettings.forbidSuites.includes('4');
    const callDialog = _.debounce(which => {
      switch (which) {
        case 115:
          if (feedVisible) {
            require(['s'], function(s) {
              s();
            });
          }
          break;
        case 116:
          if (taskVisible) {
            require(['t'], function(t) {
              t();
            });
          }
          break;
        case 99:
          if (calendarVisible) {
            require(['c'], function(c) {
              c();
            });
          }
          break;
        case 117:
          if (knowledgeVisible) {
            require(['u'], function(u) {
              u();
            });
          }
          break;
        case 96:
          const { visible } = store.getState().chat;
          store.dispatch(actions.setVisible(!visible));
          break;
        case 113:
          createDiscussion(undefined, (result, isGroup) => {
            if (!isGroup) {
              const { accountId, avatar, fullname } = result[0];
              const msg = {
                logo: avatar,
                uname: fullname,
                sysType: 1,
              };
              store.dispatch(actions.addUserSession(accountId, msg));
            }
          });
          break;
        case 101:
          store.dispatch(actions.setShowAddressBook(true));
          break;
        case 102:
          $('.commonUserHandleWrap .icon-search').click();
          $('.globalSearch').focus();
          break;
        default:
          break;
      }
    }, 200);

    $(document).on('keypress', function(e) {
      if (e.ctrlKey || e.shiftKey || e.altKey || e.cmdKey || e.metaKey) return;
      var tag = e.target.tagName && e.target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || $(e.target).is('[contenteditable]')) return;
      callDialog(e.which);
    });
  }

  /**
   * 验证客户端是否新开窗口
   */
  checkClientOpenWindow(url) {
    const clientOpenList = localStorage.getItem('clientOpenList')
      ? JSON.parse(localStorage.getItem('clientOpenList'))
      : [];
    let isContain = false;

    clientOpenList.forEach(item => {
      if (url.indexOf(item) > -1) {
        isContain = true;
      }
    });

    return isContain;
  }

  render() {
    return (
      <div id="wrapper" className="flexColumn">
        <PageHeaderRoute />
        <section id="containerWrapper" className="flex flexRow">
          <section id="container">
            <Switch>
              {this.genRouteComponent(ROUTE_CONFIG)}
              <Route
                path="*"
                render={({ location }) => {
                  if (
                    location.pathname === '/form/edit' ||
                    /(\/upgrade\/choose|\/admin\/expansionservice|\/admin\/upgradeservice|\/upgrade\/upgrade|\/upgrade\/temp).*/.test(
                      location.pathname,
                    )
                  ) {
                    window.location.reload();
                  } else {
                    window.location.goto('/app/my');
                  }
                  return null;
                }}
              />
            </Switch>
          </section>
          <section id="chat">
            <Switch>
              <Route path={withoutChatUrl} component={null} />
              {!window.isPublicApp && <Route path="*" component={ChatList} />}
            </Switch>
          </section>
        </section>
        <section id="chatPanel">
          <ChatPanel />
        </section>
      </div>
    );
  }
}
