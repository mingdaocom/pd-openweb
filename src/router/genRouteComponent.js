import React from 'react';
import WithTitleRoute from './withTitle';
import { Route, Redirect } from 'react-router-dom';
import Loadable from 'react-loadable';
import ErrorPage from 'src/components/errorPage/errorPage';
import _ from 'lodash';

function Loading(props) {
  const { error } = props;
  if (error) {
    console.error(error);
    return <ErrorPage />;
  } else {
    return null;
  }
}

const getComponent = component =>
  Loadable({
    loader: component,
    loading: Loading,
  });

export default () => {
  const components = [];
  return (ROUTE_CONFIG, preCallback) => {
    /**
     * 缓存生成的路由组件
     */
    if (components.length > 0) return components;
    _.keys(ROUTE_CONFIG).forEach((key, i) => {
      const { component, redirect, ...rest } = ROUTE_CONFIG[key];

      if (redirect) {
        components.push(<Route key={i} {...rest} render={() => <Redirect to={redirect} />} />);
      } else {
        components.push(<WithTitleRoute key={i} component={getComponent(component)} {...rest} preCallback={preCallback} />);
      }
    });
    return components;
  };
};
