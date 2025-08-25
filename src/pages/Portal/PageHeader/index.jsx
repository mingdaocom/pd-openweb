import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { formatPortalHref } from 'src/pages/Portal/util.js';
import genRouteComponent from 'src/router/genRouteComponent';
import { withoutHeaderUrl } from '../config';
import { PAGE_HEADER_ROUTE_CONFIG } from './config';

const genHeaderRouteComponent = genRouteComponent();
export default () => (
  <Switch>
    <Route path={withoutHeaderUrl} component={null} />
    <Route
      render={() => (
        <Switch>
          {genHeaderRouteComponent(PAGE_HEADER_ROUTE_CONFIG, params => {
            formatPortalHref(params);
          })}
        </Switch>
      )}
    />
  </Switch>
);
