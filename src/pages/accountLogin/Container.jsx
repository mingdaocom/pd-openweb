import React, { useEffect } from 'react';
import preall from 'src/common/preall';
import { Route, Switch } from 'react-router-dom';
import { withRouter } from 'react-router-dom';
import ErrorBoundary from 'src/ming-ui/components/ErrorWrapper';
import Login from './login';
import FindPassword from './findPassword';
import Register from './register';
import Twofactor from './login/twofactor';
import Header from './components/Header';
import { Wrap } from './style';
import WrapBg from './components/Bg';
import Footer from './components/Footer';

function LoginContain(props) {
  useEffect(() => {
    window.reactRouterHistory = props.history;
  }, []);

  return (
    <ErrorBoundary>
      <Wrap className="flexColumn">
        <WrapBg />
        <div className="loginBox flex">
          <div className="loginContainer">
            <Header />
            <Switch>
              <Route path={['/login*', '/network*']} render={props => <Login {...props} />} />
              <Route path={'/findPassword*'} render={props => <FindPassword {...props} />} />
              <Route path={'/twofactor*'} render={props => <Twofactor {...props} />} />
              <Route
                path={['/register*', '/linkInvite*', '/join*', '/enterpriseregister*', '/enterpriseRegister*']}
                render={props => <Register {...props} />}
              />
              <Route path={'*'} render={props => <Login {...props} />} />
            </Switch>
          </div>
        </div>
        {_.get(md, 'global.SysSettings.enableFooterInfo') && <Footer />}
      </Wrap>
    </ErrorBoundary>
  );
}

const WrappedComp = preall(withRouter(LoginContain), { allowNotLogin: true });

export default WrappedComp;
