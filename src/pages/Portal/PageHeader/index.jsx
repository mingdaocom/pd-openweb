import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { formatPortalHref } from 'src/pages/Portal/util.js';
import { createRouteElements } from 'src/router/components/LazyRoute';
import { withoutHeaderUrl } from '../config';
import { PAGE_HEADER_ROUTE_CONFIG } from './config';

const renderHeaderRoutes = createRouteElements();
export default () => (
  <Switch>
    <Route path={withoutHeaderUrl} component={null} />
    <Route
      render={() => (
        <Switch>
          {renderHeaderRoutes(PAGE_HEADER_ROUTE_CONFIG, params => {
            formatPortalHref(params);
          })}
        </Switch>
      )}
    />
  </Switch>
);
