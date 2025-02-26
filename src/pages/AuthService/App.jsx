import React, { useEffect } from 'react';
import preall from 'src/common/preall';
import { Route, Switch } from 'react-router-dom';
import { withRouter } from 'react-router-dom';
import ErrorBoundary from 'src/ming-ui/components/ErrorWrapper';
import Login from './login';
import FindPassword from './findPassword';
import Register from './register';
import Twofactor from './twofactor';
import ResetPassword from './resetPassword';

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
