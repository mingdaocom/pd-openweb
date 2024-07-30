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
import store from 'redux/configureStore';
import * as actions from 'src/pages/chat/redux/actions';
import socketInit from '../socket';
import './index.less';
import { Dialog, Icon } from 'ming-ui';
import { getAppFeaturesVisible } from 'src/util';
import GlobalSearch from 'src/pages/PageHeader/components/GlobalSearch/index';
import privateGuide from 'src/api/privateGuide';
import Trigger from 'rc-trigger';
import weixinCode from 'src/pages/NewPrivateDeployment/images/weixin.png';
import _ from 'lodash';
import globalEvents from './globalEvents';

@preall
@errorBoundary(true)
@withRouter
export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isSupport: true,
      supportTime: '',
    };

    window.reactRouterHistory = props.history;
    this.genRouteComponent = genRouteComponent();
    !window.isPublicApp && socketInit();
  }

  componentDidMount() {
    // 全局注入事件
    globalEvents();

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
          let path = location.pathname.split('/');
          GlobalSearch({
            match: {
              params: {
                appId:
                  location.pathname.startsWith('/app/') && path.length > 2 && path[2].length > 20 ? path[2] : undefined,
              },
            },
            onClose: () => {},
          });
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
                  {_l('提交工单')}
                </span>
              </Trigger>
              <span className="Gray_9e">{_l('咨询并延长技术支持或查看 ')}</span>
              <a href="https://docs-pd.mingdao.com/version" target="_blank">
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
    const { rp, ch } = getAppFeaturesVisible();

    if (md.global.Account.isPortal) {
      return (
        <div id="wrapper" className="flexColumn">
          <PortalPageHeaderRoute />
          <section id="containerWrapper" className="flex flexRow minHeight0">
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
        <section id="containerWrapper" className="flex flexRow minHeight0">
          <section id="container">
            <Switch>
              {this.genRouteComponent(ROUTE_CONFIG)}
              <Route
                path="*"
                render={() => {
                  window.location.replace('/dashboard');
                  return null;
                }}
              />
            </Switch>
          </section>
          {ch && (
            <section id="chat">
              <Switch>
                <Route path={withoutChatUrl} component={null} />
                {!window.isPublicApp && rp && <Route path="*" component={ChatList} />}
              </Switch>
            </section>
          )}
        </section>
        <section id="chatPanel">{rp && <ChatPanel />}</section>
        {this.checkUpgrade()}
      </div>
    );
  }
}
