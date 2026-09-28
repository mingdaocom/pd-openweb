import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { createRouteElements } from '../components/LazyRoute';
import { withoutHeaderUrl } from '../routes/main';
import { PAGE_HEADER_ROUTE_CONFIG } from '../routes/pageHeader';

const renderHeaderRoutes = createRouteElements();
export default () => (
  <Switch>
    <Route path={withoutHeaderUrl} component={null} />
    <Route
      render={() => (
        <header>
          <Switch>{renderHeaderRoutes(PAGE_HEADER_ROUTE_CONFIG)}</Switch>
        </header>
      )}
    />
  </Switch>
);
