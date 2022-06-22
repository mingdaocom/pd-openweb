import React, { useState } from 'react';
import styled from 'styled-components';
import SortableAppList from './SortableAppList';
import './AppList.less';

const Con = styled.div`
  display: flex;
  padding-bottom: 24px;
  margin: 0 -30px;
`;

export default function AppList(props) {
  const { projectId, groupType, groupId, apps = [], actions = {} } = props;
  const [newAppItemId, setNewAppItemId] = useState();
  return (
    <Con className="myAppGroupDetail">
      <SortableAppList
        {...props}
        newAppItemId={newAppItemId}
        projectId={projectId}
        items={apps}
        clearNewAppItemId={() => setNewAppItemId(undefined)}
        onUpdateAppBelongGroups={actions.updateAppBelongGroups}
        handleModify={app => {
          actions.updateApp(app);
        }}
        onAppChange={app => {
          actions.saveApp(app);
        }}
        onCopy={({ id, appId }) => {
          actions.copyApp({ id, groupId }, appId);
        }}
        createAppFromEmpty={app => {
          actions.createAppFromEmpty({ ...app, groupId, groupType }, setNewAppItemId);
        }}
        handleApp={({ mode, ...args }) => {
          if (mode === 'del') {
            actions.deleteApp(args);
          } else if (mode === 'quit') {
            actions.quitApp(args);
          } else if (mode === 'mark') {
            actions.markApp(args);
          }
        }}
        onAppSorted={args => {
          actions.updateAppSort(args);
        }}
      />
    </Con>
  );
}
