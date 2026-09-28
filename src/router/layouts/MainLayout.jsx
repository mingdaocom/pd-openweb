import React, { Component, Fragment } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Modal, Popover } from 'ming-ui/antd-components';
import ErrorBoundary from 'ming-ui/components/ErrorBoundary';
import privateGuide from 'src/api/privateGuide';
import globalEvents from 'src/common/entries/globalEvents';
import preall from 'src/common/entries/preall';
import ChatList from 'src/pages/chat/containers/ChatList';
import ChatPanel from 'src/pages/chat/containers/ChatPanel';
import { registerChatEvents } from 'src/pages/chat/runtime/chatEvents';
import { ROUTE_CONFIG_PORTAL } from 'src/pages/Portal/config';
import PortalPageHeaderRoute from 'src/pages/Portal/PageHeader';
import { getAppFeaturesVisible } from 'src/utils/platform/navigation/query';
import socketInit from '../../socket';
import { createRouteElements } from '../components/LazyRoute';
import { ROUTE_CONFIG, withoutChatUrl } from '../routes/main';
import weixinCode from './images/weixin.png';
import PageHeaderRouter from './PageHeaderRouter';
import './MainLayout.less';

class MainLayout extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isSupport: true,
      supportTime: '',
    };

    window.reactRouterHistory = props.history;
    this.createRouteElements = createRouteElements();
    !window.isPublicApp && socketInit();
  }

  componentDidMount() {
    // 全局注入事件
    globalEvents();
    this.unregisterChatEvents = registerChatEvents();

    if (
      (_.get(md, ['global', 'Account', 'projects']) || []).filter(item => item.licenseType === 1).length === 0 &&
      (window.platformENV.isOverseas || window.platformENV.isLocal)
    ) {
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

  componentWillUnmount() {
    this.unregisterChatEvents?.();
  }

  /**
   * 验证升级
   */
  checkUpgrade() {
    const { isSupport, supportTime } = this.state;

    if (isSupport || localStorage.getItem('supportTime')) return null;

    return (
      <Modal
        title={<span className="Red Bold">{_l('升级受限提醒')}</span>}
        width={630}
        closable={false}
        open
        mask={{ closable: true }}
        keyboard
        cancelButtonProps={{ style: { display: 'none' } }}
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
              <Popover arrow={true} content={<img style={{ width: 300 }} src={weixinCode} />} placement="bottom">
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
              </Popover>
              <span className="Gray_9e">{_l('咨询并延长技术支持或查看')}</span>
              <a href="https://docs-pd.mingdao.com/version" target="_blank" className="mLeft3">
                {_l('其他可升级的版本')}
              </a>
            </Fragment>
          ) : (
            <span className="Gray_9e">{_l('请尽快联系系统管理员')}</span>
          )}
        </div>
      </Modal>
    );
  }

  render() {
    const { rp, ch } = getAppFeaturesVisible();

    if (md.global.Account.isPortal) {
      return (
        <div id="wrapper" className="flexColumn">
          <div className="flexColumn flex" id="containerWrapper">
            <PortalPageHeaderRoute />
            <section id="container">
              <Switch>{this.createRouteElements(ROUTE_CONFIG_PORTAL)}</Switch>
            </section>
          </div>
        </div>
      );
    }

    return (
      <div id="wrapper" className="flexRow">
        <div className="flexColumn flex" id="containerWrapper">
          <PageHeaderRouter />
          <section id="container">
            <Switch>
              {this.createRouteElements(ROUTE_CONFIG)}
              <Route
                path="*"
                render={() => {
                  location.href = md.global.Config.PlatformUrl + '404';
                  return null;
                }}
              />
            </Switch>
          </section>
        </div>
        <section id="chatPanel">{rp && <ChatPanel />}</section>

        {this.checkUpgrade()}

        {ch && (
          <section id="chat">
            <Switch>
              <Route path={withoutChatUrl} component={null} />
              {!window.isPublicApp && rp && <Route path="*" component={ChatList} />}
            </Switch>
          </section>
        )}
      </div>
    );
  }
}

export default preall(ErrorBoundary.wrap(withRouter(MainLayout), true));
