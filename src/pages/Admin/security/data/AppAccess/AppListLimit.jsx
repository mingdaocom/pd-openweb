import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { dialogSelectApp } from 'ming-ui/functions';
import AuthAppList from 'src/pages/Admin/components/AuthAppList';

const AppListLimitContainer = styled.div`
  .noDataContent {
    height: 50px;
    line-height: 50px;
  }
  .appList {
    height: unset !important;
    max-height: 300px;
  }
`;

export default function AppListLimit({ projectId, appList = [], onChange = () => {} }) {
  const [authApps, setAuthApps] = useState(appList || []);

  useEffect(() => {
    setAuthApps(appList || []);
  }, [appList]);

  return (
    <AppListLimitContainer>
      <span
        className="colorPrimary Hand"
        onClick={() => {
          dialogSelectApp({
            projectId,
            title: _l('添加应用'),
            onOk: selectedApps => {
              const newAuthApps = _.uniqBy(authApps.concat(selectedApps), 'appId');
              setAuthApps(newAuthApps);
              onChange(newAuthApps);
            },
          });
        }}
      >
        <Icon icon="add" />
        <span className="bold mLeft4">{_l('添加应用')}</span>
      </span>
      <AuthAppList
        className="appListLimit mTop10"
        authApps={authApps}
        onRemove={id => {
          const apps = authApps.filter(app => app.appId !== id);
          setAuthApps(apps);
          onChange(apps);
        }}
      />
    </AppListLimitContainer>
  );
}
