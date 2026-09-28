import React, { Component, Fragment, lazy, Suspense } from 'react';
import { Redirect, Route } from 'react-router-dom';
import DocumentTitle from 'react-document-title';
import _ from 'lodash';
import { string } from 'prop-types';
import ErrorBoundary from 'ming-ui/components/ErrorBoundary';
import { addSubPathOfRoute } from 'src/utils/platform/navigation/path';

export class LazyRoute extends Component {
  static propTypes = {
    title: string,
  };

  componentDidMount() {
    this.props.preCallback && this.props.preCallback(this.props);
  }

  renderComponentWithTitle = props => {
    const { title, component: RouteComponent, ...rest } = this.props;

    return (
      <Fragment>
        {title && <DocumentTitle title={title} />}
        <ErrorBoundary>
          <Suspense fallback={null}>
            <RouteComponent {...props} {...rest} />
          </Suspense>
        </ErrorBoundary>
      </Fragment>
    );
  };

  render() {
    const { ...rest } = this.props;
    return <Route {...rest} component={this.renderComponentWithTitle} />;
  }
}

const loadRouteComponent = component => lazy(component);

export function createRouteElements() {
  const routeElements = [];

  return (routeConfig, preCallback) => {
    if (routeElements.length > 0) return routeElements;

    _.keys(routeConfig).forEach((key, index) => {
      const { component, redirect, ...rest } = routeConfig[key];

      if (redirect) {
        routeElements.push(
          <Route key={index} {...rest} render={() => <Redirect to={addSubPathOfRoute(redirect)} />} />,
        );
      } else {
        routeElements.push(
          <LazyRoute key={index} component={loadRouteComponent(component)} {...rest} preCallback={preCallback} />,
        );
      }
    });

    return routeElements;
  };
}
