import React, { useMemo, useReducer, useEffect, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import { string, shape } from 'prop-types';
import styled from 'styled-components';
import { navigateTo } from 'router/navigateTo';
import NoProjectsStatus from './components/NoProjectsStatus';
import CreateFirstApp from './components/CreateFirstApp';
import Groups from './components/Groups';
import AppGrid from './components/AppGrid';
import './AppGroups.less';
import { initialState, reducer, CreateActions } from './appHomeReducer';

const Con = styled.div`
  display: flex;
  flex: 1;
  background: #fff;
`;

function filter(apps, keywords) {
  if (!keywords.trim()) {
    return apps;
  }
  return apps.filter(
    app =>
      new RegExp((keywords || '').trim().toUpperCase()).test(app.name) ||
      new RegExp((keywords || '').trim().toUpperCase()).test((app.enName || '').toUpperCase()),
  );
}

function AppGroups(props) {
  const activeGroupId = _.get(props, 'match.params.groupId');
  const activeGroupType = _.get(props, 'match.params.groupType');
  const { currentProject, projectId } = props;
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
    activeGroup,
  } = state;
  const isAdmin = currentProject && (currentProject.isSuperAdmin || currentProject.isProjectAppManager);
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
  if (!(groupsLoading || appsLoading) && noApps && !projectId) {
    return <NoProjectsStatus />;
  }
  if (!(groupsLoading || appsLoading) && noApps && projectId) {
    return <CreateFirstApp projectId={projectId} />;
  }
  return (
    <Con>
      {projectId && projectId !== 'external' && (
        <Groups
          isAdmin={isAdmin}
          loading={groupsLoading}
          activeGroupId={activeGroupId}
          activeGroup={activeGroupId && activeGroup}
          projectId={projectId}
          currentProject={currentProject}
          markedGroup={markedGroup}
          groups={groups}
          actions={actions}
        />
      )}
      <AppGrid
        setting={origin.homeSetting}
        isAdmin={isAdmin}
        loading={groupsLoading || appsLoading}
        keywords={keywords}
        activeGroup={activeGroupId && activeGroup}
        actions={actions}
        projectId={projectId}
        currentProject={currentProject}
        markedGroup={markedGroup}
        markedApps={filter(markedApps, keywords)}
        myApps={filter(apps, keywords)}
        externalApps={filter(externalApps, keywords)}
        aloneApps={filter(aloneApps, keywords)}
        activeGroupApps={filter(activeGroupApps, keywords)}
        groups={groups}
      />
    </Con>
  );
}
AppGroups.propTypes = {
  projectId: string,
  currentProject: shape({}),
};

export default withRouter(AppGroups);
