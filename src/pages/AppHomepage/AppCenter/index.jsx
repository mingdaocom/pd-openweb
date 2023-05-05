import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { emitter, getProject } from 'src/util';
import AppGroups from './AppGroups';
import SideNav from './SideNav';
import AppLib from 'src/pages/AppHomepage/AppLib';
import _ from 'lodash';
import { WaterMark } from 'ming-ui';
import { navigateTo } from 'router/navigateTo';

const Con = styled.div`
  display: flex;
  height: 100%;
`;

const AppLibCon = styled.div`
  flex: 1;
  overflow: hidden;
`;
function AppCenter(props) {
  const projectId = _.get(props, 'match.params.projectId');
  const [currentProject, setCurrentProject] = useState(
    getProject(projectId || localStorage.getItem('currentProjectId')),
  );
  function changeProject(project) {
    navigateTo('/app/my', false, true);
    setCurrentProject(project);
  }
  useEffect(() => {
    emitter.addListener('CHANGE_CURRENT_PROJECT', changeProject);
    return () => {
      emitter.removeListener('CHANGE_CURRENT_PROJECT', changeProject);
    };
  }, []);
  const isLib = location.pathname.startsWith('/app/lib');

  return (
    <WaterMark projectId={_.get(currentProject, 'projectId')}>
      <Con>
        <SideNav active={isLib ? 'lib' : 'app'} currentProject={currentProject} />
        {!isLib && <AppGroups currentProject={currentProject} projectId={_.get(currentProject, 'projectId')} />}
        {isLib && (
          <AppLibCon>
            <AppLib />
          </AppLibCon>
        )}
      </Con>
    </WaterMark>
  );
}

export default withRouter(AppCenter);
