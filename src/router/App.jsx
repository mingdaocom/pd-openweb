import React, { Component, Fragment } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import preall from 'src/common/preall';
import PageHeaderRoute from './PageHeader';
import PortalPageHeaderRoute from 'src/pages/Portal/PageHeader';
import ChatList from 'src/pages/chat/containers/ChatList';
import ChatPanel from 'src/pages/chat/containers/ChatPanel';
import { createDiscussion } from 'src/pages/chat/utils/group';
import genRouteComponent from './genRouteComponent';
import { ROUTE_CONFIG, withoutChatUrl } from './config';
import { ROUTE_CONFIG_PORTAL } from 'src/pages/Portal/config';
import { navigateTo, setHistoryObject } from './navigateTo';
import store from 'redux/configureStore';
import * as actions from 'src/pages/chat/redux/actions';
import socketInit from '../socket';
import './index.less';
import { Dialog, Icon } from 'ming-ui';
import { getAppFeaturesVisible } from 'src/util';
import api from 'src/api/homeApp';
import { getSuffix } from 'src/pages/PortalAccount/util';
import privateGuide from 'src/api/privateGuide';
import Trigger from 'rc-trigger';
import weixinCode from 'src/pages/privateDeployment/images/weixin.png';
import _ from 'lodash';

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
      isSupport: true,
      supportTime: '',
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
      let url = `${pathname}${search}${hash}`;
      //外部门户 worksheet老地址兼容处理
      if (md.global.Account.isPortal && url.startsWith('/worksheet/')) {
        that.compatibleWorksheetRoute(
          url
            .split(/\/worksheet\/(.*)/)
            .filter(o => o)[0]
            .split(/\/(.*)/)[0],
        );
        return;
      }

      if (isMDClient && that.checkClientOpenWindow(url)) {
        window.open(url);
      } else {
        navigateTo(url);
      }
    });

    // 绑定快捷操作
    !md.global.Account.isPortal && this.bindShortcut();

    if ((_.get(md, ['global', 'Account', 'projects']) || []).filter(item => item.licenseType === 1).length === 0) {
      if (!localStorage.getItem('supportTime')) {
        privateGuide.getSupportInfo().then(result => {
          if (!result.isSupport && result.supportTime) {
            this.setState({ isSupport: result.isSupport, supportTime: result.supportTime });
          }
        });
      }
    } else {
      localStorage.removeItem('supportTime');
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location !== this.props.location) {
      this.setState({ prevPath: this.props.location });
    }
  }

  compatibleWorksheetRoute(worksheetId) {
    //工作表老路由id补齐
    api.getAppSimpleInfo({ workSheetId: worksheetId }).then(({ appId, appSectionId, workSheetId }) => {
      if (appId && appSectionId) {
        if (getSuffix(location.href) !== md.global.Account.addressSuffix) {
          navigateTo(`/app/${appId}/${appSectionId}/${workSheetId}`, true);
        } else {
          navigateTo(`/${md.global.Account.addressSuffix}/${appSectionId}/${workSheetId}`, true);
        }
      }
    });
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
  bindShortcut() {
    const callDialog = _.debounce(which => {
      switch (which) {
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

    $(document).on('keypress', function (e) {
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

    if (url.indexOf('hr') > -1 || url.indexOf('dossier') > -1) return true;

    clientOpenList.forEach(item => {
      if (url.indexOf(item) > -1) {
        isContain = true;
      }
    });

    return isContain;
  }

  /**
   * 验证升级
   */
  checkUpgrade() {
    const { isSupport, supportTime } = this.state;

    if (isSupport || localStorage.getItem('supportTime')) return null;

    return (
      <Dialog
        title={<span className="Red Bold">{_l('升级受限提醒')}</span>}
        width="630"
        closable={false}
        visible
        cancelText=""
        okText={_l('我已知晓')}
        onOk={() => {
          this.setState({ isSupport: true });
          localStorage.setItem('supportTime', supportTime);
        }}
      >
        <div className="LineHeight25">
          <span className="Gray_9e">
            {_l(
              '由于当前系统绑定的密钥技术支持时间已到期（%0 到期），无法升级到 %1 版本（发布时间早于到期时间的版本可升级），现已自动降为免费版，',
              supportTime,
              md.global.Config.Version,
            )}
          </span>
          {md.global.Account.superAdmin ? (
            <Fragment>
              <span className="Gray_9e">{_l('您可以')}</span>
              <Trigger
                action={['hover']}
                popup={<img className="card z-depth-2" style={{ width: 300 }} src={weixinCode} />}
                popupAlign={{
                  offset: [0, 7],
                  points: ['tc', 'bc'],
                  overflow: { adjustX: 1, adjustY: 2 },
                }}
              >
                <span
                  style={{
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    color: '#47B14B',
                    padding: '2px 10px',
                  }}
                >
                  <Icon icon="weixin" className="mRight2" />
                  {_l('添加微信')}
                </span>
              </Trigger>
              <span className="Gray_9e">{_l('咨询并延长技术支持或查看 ')}</span>
              <a href="https://docs.pd.mingdao.com/roadmap.html" target="_blank">
                {_l('其他可升级的版本')}
              </a>
            </Fragment>
          ) : (
            <span className="Gray_9e">{_l('请尽快联系系统管理员')}</span>
          )}
        </div>
      </Dialog>
    );
  }

  render() {
    const { rp } = getAppFeaturesVisible();

    if (md.global.Account.isPortal) {
      return (
        <div id="wrapper" className="flexColumn">
          <PortalPageHeaderRoute />
          <section id="containerWrapper" className="flex flexRow">
            <section id="container">
              <Switch>{this.genRouteComponent(ROUTE_CONFIG_PORTAL)}</Switch>
            </section>
          </section>
        </div>
      );
    }

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
              {!window.isPublicApp && rp && <Route path="*" component={ChatList} />}
            </Switch>
          </section>
        </section>
        <section id="chatPanel">{rp && <ChatPanel />}</section>
        {this.checkUpgrade()}
      </div>
    );
  }
}
