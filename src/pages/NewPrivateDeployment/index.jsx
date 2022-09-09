import React, { Fragment, useEffect, useState } from 'react';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import Sidebar from './Sidebar';
import Loadable from 'react-loadable';
import { getRequest } from 'src/util';
import { menuGroup } from './router.config';
import { navigateTo } from 'src/router/navigateTo';
import { Switch, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import privateGuideApi from 'src/api/privateGuide';
import AuthorizationIntercept from './Platform/AuthorizationIntercept';

const Wrap = styled.div`
  width: 100%;
  height: 100%;

  .privateCardWrap {
    width: 880px;
    margin: 20px auto 0;
    padding: 30px;
    border-radius: 4px;
    background-color: #fff;
    box-shadow: 0px 1px 4px 1px rgba(0, 0, 0, 0.16);
    &.big {
      width: 95%;
    }
    &:last-child {
      margin-bottom: 20px;
    }
  }
  .content {
    overflow-y: auto;
  }

  .ant-input {
    border-radius: 4px !important;
    box-shadow: none !important;
  }
  .ant-btn {
    height: 30px;
    padding: 2px 15px;
    border-radius: 3px;
    &.ant-btn-primary {
      background-color: #2196F3;
      border-color: #2196F3;
    }
    &.ant-btn-background-ghost {
      background: transparent !important;
    }
  }
  .ant-checkbox-input {
    position: absolute;
  }
  .ant-select {
    &.ant-select:not(.ant-select-disabled):hover .ant-select-selector, &.ant-select-focused:not(.ant-select-disabled).ant-select-single:not(.ant-select-customize-input) .ant-select-selector {
      border-color: #2196F3 !important;
    }
    .ant-select-selector {
      border-radius: 4px !important;
      box-shadow: none !important;
    }
    .ant-select-selector, .ant-select-selection-item {
      height: 32px;
      line-height: 30px;
    }
    .ant-select-arrow {
      width: auto;
      height: auto;
      top: 40%;
    }
    &.ant-select-single.ant-select-show-arrow .ant-select-selection-item, .ant-select-single.ant-select-show-arrow .ant-select-selection-placeholder {
      opacity: 1;
      font-size: 13px;
    }
    &.ant-select-single.ant-select-open .ant-select-selection-item {
      color: inherit;
    }
  }
`;

const App = () => {
  const [loading, setLoading] = useState(true);
  const [authorizationState, setAuthorizationState] = useState(false);
  const menus = _.flatten(menuGroup.map(m => _.flatten(m.menus.map(n => n.routes))));
  const getComponent = component => Loadable({
    loader: component,
    loading: () => null
  });

  useEffect(() => {
    privateGuideApi.getPlatformLicenseInfo().then(data => {
      setLoading(false);
      setAuthorizationState(!!data);
    });
  }, []);

  const renderContent = () => {
    return (
      <Wrap className="flexRow valignWrapper">
        <Sidebar />
        <div className="flex h100 flexColumn content">
          <ConfigProvider autoInsertSpaceInButton={false}>
            <Switch>
              {menus.map(({ path, component }) => {
                return <Route key={path} path={path} component={getComponent(component)} />
              })}
              <Route
                path="*"
                render={({ location }) => {
                  navigateTo('/privateDeployment/base');
                  return null;
                }}
              />
            </Switch>
          </ConfigProvider>
        </div>
      </Wrap>
    );
  }

  if (loading) {
    return (
      <LoadDiv className="mTop30" />
    );
  } else {
    return (
      authorizationState ? (
        <Switch>
          <Route path="/privateDeployment/:routeType">{renderContent()}</Route>
          <Route
            path="*"
            render={({ location }) => {
              navigateTo('/privateDeployment/base');
              return null;
            }}
          />
        </Switch>
      ) : (
        <Wrap>
          <ConfigProvider autoInsertSpaceInButton={false}>
            <AuthorizationIntercept />
          </ConfigProvider>
        </Wrap>
      )
    );
  }
}

export default App;
