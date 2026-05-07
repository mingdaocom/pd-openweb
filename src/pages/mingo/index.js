import React from 'react';
import { createRoot } from 'react-dom/client';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import preall from 'src/common/preall';
import MingoLand from './MingoLand';
import MingoPublicLand from './MingoPublicLand';
import MingoShareLand from './MingoShareLand';

const root = createRoot(document.getElementById('app'));
const WrappedComp = preall(
  () => (
    <Router>
      <Switch>
        <Route path="/mingo/chat/:chatId" component={MingoLand} />
        <Route path="/mingo/share/:chatId" component={MingoShareLand} />
        <Route path="/public/mingo/:shareId" component={MingoPublicLand} />
        <Route component={MingoLand} />
      </Switch>
    </Router>
  ),
  { allowNotLogin: true },
);

root.render(<WrappedComp />);
