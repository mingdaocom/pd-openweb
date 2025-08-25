import React, { useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import { withRouter } from 'react-router-dom';
import preall from 'src/common/preall';
import ErrorBoundary from 'src/ming-ui/components/ErrorWrapper';
import FindPassword from './findPassword';
import Login from './login';
import Register from './register';
import ResetPassword from './resetPassword';
import Twofactor from './twofactor';

function LoginContain(props) {
  useEffect(() => {
    window.reactRouterHistory = props.history;
  }, []);

  return (
    <ErrorBoundary>
      <Switch>
        <Route path={['/resetPassword*']} render={props => <ResetPassword {...props} />} />
        <Route path={['/login*', '/network*']} render={props => <Login {...props} />} />
        <Route path={'/findPassword*'} render={props => <FindPassword {...props} />} />
        <Route path={'/twofactor*'} render={props => <Twofactor {...props} />} />
        <Route
          path={['/register*', '/linkInvite*', '/join*', '/enterpriseregister*', '/enterpriseRegister*']}
          render={props => <Register {...props} />}
        />
        <Route path={'*'} render={props => <Login {...props} />} />
      </Switch>
    </ErrorBoundary>
  );
}

const WrappedComp = preall(withRouter(LoginContain), { allowNotLogin: true });

export default WrappedComp;
