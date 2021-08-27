import React, { Component } from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Switch, withRouter, Redirect } from 'react-router-dom';
import { navigateTo } from 'src/router/navigateTo';
import preall from 'src/common/preall';
import genRouteComponent from 'src/router/genRouteComponent';
import store from 'src/redux/configureStore';
import { socketInit } from 'src/socket/mobileSocketInit';
import { ROUTE_CONFIG } from './config';
import './index.less';

const isWxWork = window.navigator.userAgent.toLowerCase().includes('wxwork');
const isWeLink = window.navigator.userAgent.toLowerCase().includes('huawei-anyoffice');

const isIphonex = () => {
  if (typeof window !== 'undefined' && window) {
    return /iphone/gi.test(window.navigator.userAgent) && window.screen.height >= 812;
  }
  return false;
};

@preall
@withRouter
class App extends Component {
  constructor(props) {
    super(props);
    this.genRouteComponent = genRouteComponent();
    if (isWxWork && isIphonex()) {
      document.body.classList.add('wxworkBody');
    }
    if (isWeLink) {
      $.getScript('https://open-doc.welink.huaweicloud.com/docs/jsapi/2.0.4/hwh5-cloudonline.js');
    }
    socketInit();
  }
  componentDidMount() {
    this.switchPath(this.props.location);
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
    return (
      <Switch>
        {this.genRouteComponent(ROUTE_CONFIG)}
        <Route
          path="*"
          render={({ location }) => {
            const home = '/mobile/appHome';
            const page = '/mobile/recordList/';
            if (location.pathname.includes(page)) {
              const param = location.pathname.replace(page, '').split('/');
              return navigateTo(param.length === 1 ? `/mobile/app/${param[0]}` : home);
            } else {
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
