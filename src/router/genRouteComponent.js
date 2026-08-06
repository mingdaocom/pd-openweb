import React, { lazy } from 'react';
import { Redirect, Route } from 'react-router-dom';
import _ from 'lodash';
import WithTitleRoute from './withTitle';

const getComponent = component => lazy(component);

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
        components.push(
          <WithTitleRoute key={i} component={getComponent(component)} {...rest} preCallback={preCallback} />,
        );
      }
    });

    return components;
  };
};
