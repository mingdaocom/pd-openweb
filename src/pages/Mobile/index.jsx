import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import { Route, BrowserRouter as Router, Switch, withRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Dialog, Modal } from 'antd-mobile';
import _ from 'lodash';
import preall from 'src/common/preall';
import { formatPortalHref } from 'src/pages/Portal/util';
import store from 'src/redux/configureStore';
import genRouteComponent from 'src/router/genRouteComponent';
import { navigateTo } from 'src/router/navigateTo';
import { socketInit } from 'src/socket/mobileSocketInit';
import { getRequest } from 'src/utils/common';
import DeclareConfirm from './components/DeclareConfirm';
import { PORTAL, ROUTE_CONFIG } from './config';
import './index.less';

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
  }
  componentDidMount() {
    this.switchPath(this.props.location);
    sessionStorage.setItem('entryUrl', location.href);
    const { pc_slide = '' } = getRequest();
    if (pc_slide.includes('true')) {
      sessionStorage.setItem('dingtalk_pc_slide', 'true');
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
      Dialog.clear();
      Modal.clear();
      this.switchPath(nextProps.location);
    }
  }
  switchPath(url) {
    const { hash } = url;
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
        {this.genRouteComponent(ROUTER, params => {
          formatPortalHref(params);
        })}
        <Route
          path="*"
          render={({ location }) => {
            const home = '/mobile/dashboard';
            const page = '/mobile/recordList/';
            const record = '/mobile/record/';
            const setHash = url => navigateTo(url + decodeURIComponent(location.hash), true);
            if (location.pathname.includes(record)) {
              const param = location.pathname.replace(record, '').split('/');
              const [appId, worksheetId, viewId, rowId] = param;
              if (!viewId) {
                return setHash(`${record}${appId}/${worksheetId}/null/${rowId}`);
              } else {
                return setHash(home);
              }
            } else if (location.pathname.includes(page)) {
              const param = location.pathname.replace(page, '').split('/');
              return setHash(param.length === 1 ? `/mobile/app/${param[0]}` : home);
            } else if (!isPortal) {
              return setHash(home);
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

const root = createRoot(document.getElementById('app'));

root.render(<Mobile />);
