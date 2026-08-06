import React, { useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import { withRouter } from 'react-router-dom';
import ErrorBoundary from 'ming-ui/components/ErrorBoundary';
import preall from 'src/common/preall';
import { addSubPathOfRoute } from 'src/utils/common';
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
        <Route path={addSubPathOfRoute(['/resetPassword*'])} render={props => <ResetPassword {...props} />} />
        <Route path={addSubPathOfRoute(['/login*', '/network*'])} render={props => <Login {...props} />} />
        <Route path={addSubPathOfRoute('/findPassword*')} render={props => <FindPassword {...props} />} />
        <Route path={addSubPathOfRoute('/twofactor*')} render={props => <Twofactor {...props} />} />
        <Route
          path={addSubPathOfRoute([
            '/register*',
            '/linkInvite*',
            '/join*',
            '/enterpriseregister*',
            '/enterpriseRegister*',
          ])}
          render={props => <Register {...props} />}
        />
        <Route path={'*'} render={props => <Login {...props} />} />
      </Switch>
    </ErrorBoundary>
  );
}

const WrappedComp = preall(withRouter(LoginContain), { allowNotLogin: true });

export default WrappedComp;
