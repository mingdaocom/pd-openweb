import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { withoutHeaderUrl } from '../config';
import genRouteComponent from '../genRouteComponent';
import { PAGE_HEADER_ROUTE_CONFIG } from './config';

const genHeaderRouteComponent = genRouteComponent();
export default () => (
  <Switch>
    <Route path={withoutHeaderUrl} component={null} />
    <Route
      render={() => (
        <header>
          <Switch>{genHeaderRouteComponent(PAGE_HEADER_ROUTE_CONFIG)}</Switch>
        </header>
      )}
    />
  </Switch>
);
