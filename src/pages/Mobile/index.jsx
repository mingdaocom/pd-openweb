import React, { Component } from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Switch, withRouter, Redirect } from 'react-router-dom';
import { navigateTo } from 'src/router/navigateTo';
import DeclareConfirm from './components/DeclareConfirm';
import preall from 'src/common/preall';
import genRouteComponent from 'src/router/genRouteComponent';
import store from 'src/redux/configureStore';
import { socketInit } from 'src/socket/mobileSocketInit';
import { ROUTE_CONFIG, PORTAL } from './config';
import './index.less';
import _ from 'lodash';

const isIphonex = () => {
  if (typeof window !== 'undefined' && window) {
    return /iphone/gi.test(window.navigator.userAgent) && window.screen.height >= 812;
  }
  return false;
};

const isMiniprogram = window.navigator.userAgent.toLowerCase().includes('miniprogram');
const { IsLocal } = md.global.Config;
const isWxWork = window.navigator.userAgent.toLowerCase().includes('wxwork');
const isWx = window.navigator.userAgent.toLowerCase().includes('micromessenger') && !IsLocal && !isWxWork;
const isWeLink = window.navigator.userAgent.toLowerCase().includes('huawei-anyoffice');
const isDing = window.navigator.userAgent.toLowerCase().includes('dingtalk');
const isFeishu = window.navigator.userAgent.toLowerCase().includes('feishu');

@preall
@withRouter
@DeclareConfirm
class App extends Component {
  constructor(props) {
    super(props);

    socketInit();

    // 处理底部导航缓存内容过多localStorage溢出问题
    Object.keys(localStorage).forEach(key => {
      if (key.indexOf('currentNavWorksheetInfo') > -1) {
        localStorage.removeItem(key);
      }
    });

    this.genRouteComponent = genRouteComponent();
    if (isIphonex() && (isMiniprogram || isWxWork)) {
      document.body.classList.add('iphoneBody');
    }

    if (isDing) {
      $.getScript('https://g.alicdn.com/dingding/dingtalk-jsapi/2.6.41/dingtalk.open.js');
    }
    if (isWeLink) {
      $.getScript('https://open-doc.welink.huaweicloud.com/docs/jsapi/2.0.4/hwh5-cloudonline.js');
    }
    if (isWx) {
      $.getScript('https://res2.wx.qq.com/open/js/jweixin-1.6.0.js');
    }
    if (isWxWork) {
      $.getScript('https://res.wx.qq.com/open/js/jweixin-1.2.0.js');
    }
    if (isFeishu) {
      $.getScript('https://lf1-cdn-tos.bytegoofy.com/goofy/lark/op/h5-js-sdk-1.5.19.js');
    }
  }
  componentDidMount() {
    this.switchPath(this.props.location);
    if (window.navigator.userAgent.toLowerCase().includes('iphone')) {
      sessionStorage.setItem('entryUrl', location.href);
    }
    window.mobileNavigateTo = (url, isReplace) => {
      url = (window.subPath || '') + url;

      if (window.isPublicApp && !new URL('http://z.z' + url).hash) {
        url = url + '#publicapp' + window.publicAppAuthorization;
      }
      if (isReplace) {
        this.props.history.replace(url);
      } else {
        this.props.history.push(url);
      }
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.location.pathname !== this.props.location.pathname) {
      this.switchPath(nextProps.location);
    }
  }
  switchPath(url) {
    const { hash, pathname } = url;
    if (hash.includes('noredirect')) {
      sessionStorage.setItem('noredirect', true);
      return;
    } else if (sessionStorage.getItem('noredirect')) {
      return;
    }
  }
  render() {
    const isPortal = md.global.Account.isPortal;
    const ROUTER = isPortal ? _.pick(ROUTE_CONFIG, PORTAL) : ROUTE_CONFIG;
    return (
      <Switch>
        {this.genRouteComponent(ROUTER)}
        <Route
          path="*"
          render={({ location }) => {
            const home = '/mobile/appHome';
            const page = '/mobile/recordList/';
            if (location.pathname.includes(page)) {
              const param = location.pathname.replace(page, '').split('/');
              return navigateTo(param.length === 1 ? `/mobile/app/${param[0]}` : home);
            } else if (!isPortal) {
              return navigateTo(home);
            }
          }}
        />
      </Switch>
    );
  }
}

class Mobile extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <App />
        </Router>
      </Provider>
    );
  }
}

render(<Mobile />, document.getElementById('app'));
