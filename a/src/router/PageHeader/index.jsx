import React from 'react';
import { string } from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import { PAGE_HEADER_ROUTE_CONFIG } from './config';
import { withoutHeaderUrl } from '../config';
import genRouteComponent from '../genRouteComponent';

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
