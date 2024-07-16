import React, { useMemo, useReducer, useEffect, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import { string, shape } from 'prop-types';
import styled from 'styled-components';
import { navigateTo } from 'router/navigateTo';
import CreateFirstApp from './components/CreateFirstApp';
import Groups from './components/Groups';
import AppGrid from './components/AppGrid';
import './AppGroups.less';
import { initialState, reducer, CreateActions } from './appHomeReducer';
import _ from 'lodash';
import { getFilterApps } from './utils';

const Con = styled.div`
  display: flex;
  flex: 1;
  background: #fff;
`;

function AppGroups(props) {
  const activeGroupId = _.get(props, 'match.params.groupId');
  const activeGroupType = _.get(props, 'match.params.groupType');
  const { currentProject, projectId, dashboardColor, myPermissions = [] } = props;
  const cache = useRef({});
  const [state, dispatch] = useReducer(reducer, initialState);
  const actions = useMemo(() => new CreateActions({ dispatch, state }), [state]);
  const {
    origin = {},
    noApps,
    groupsLoading,
    appsLoading,
    keywords,
    groups,
    markedGroup = [],
    apps = [],
    markedApps = [],
    externalApps = [],
    aloneApps = [],
    activeGroupApps = [],
    recentApps = [],
    appLang = [],
    activeGroup,
    projectGroupsLang = [],
  } = state;
  function load(projectIdForLoad) {
    cache.current.projectLoaded = true;
    actions.updateKeywords('');
    actions.loadAppAndGroups({
      projectId: projectIdForLoad,
      ...(location.pathname !== '/app/my' ? { activeGroupId, activeGroupType } : {}),
    });
  }
  useEffect(() => {
    if (cache.current.projectLoaded && activeGroupId) {
      actions.updateKeywords('');
      actions.loadGroup({ activeGroupId, activeGroupType, projectId });
    }
  }, [activeGroupId]);
  useEffect(() => {
    if (cache.current.projectLoaded && location.pathname !== '/app/my') {
      navigateTo('/app/my', false, true);
    }
    load(projectId);
  }, [projectId]);

  if (!(groupsLoading || appsLoading) && noApps && projectId && projectId !== 'external') {
    return <CreateFirstApp projectId={projectId} myPermissions={myPermissions} />;
  }
  return (
    <Con>
      {projectId && projectId !== 'external' && (
        <Groups
          loading={groupsLoading}
          activeGroupId={activeGroupId}
          activeGroup={activeGroupId && activeGroup}
          projectId={projectId}
          currentProject={currentProject}
          markedGroup={markedGroup}
          groups={groups}
          actions={actions}
          dashboardColor={dashboardColor}
          projectGroupsLang={projectGroupsLang}
          myPermissions={myPermissions}
        />
      )}
      <AppGrid
        setting={origin.homeSetting}
        loading={groupsLoading || appsLoading}
        keywords={keywords}
        activeGroup={activeGroupId && activeGroup}
        actions={actions}
        projectId={projectId}
        currentProject={currentProject}
        markedGroup={markedGroup}
        markedApps={getFilterApps(markedApps, keywords)}
        myApps={getFilterApps(apps, keywords)}
        externalApps={getFilterApps(externalApps, keywords)}
        aloneApps={getFilterApps(aloneApps, keywords)}
        activeGroupApps={getFilterApps(activeGroupApps, keywords)}
        recentApps={getFilterApps(recentApps, keywords)}
        appLang={appLang}
        groups={groups}
        dashboardColor={dashboardColor}
        projectGroupsLang={projectGroupsLang}
        myPermissions={myPermissions}
      />
    </Con>
  );
}
AppGroups.propTypes = {
  projectId: string,
  currentProject: shape({}),
};

export default withRouter(AppGroups);
