import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { PAGE_HEADER_ROUTE_CONFIG } from './config';
import { withoutHeaderUrl } from '../config';
import genRouteComponent from 'src/router/genRouteComponent';
import { formatPortalHref } from 'src/pages/Portal/util.js';

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
