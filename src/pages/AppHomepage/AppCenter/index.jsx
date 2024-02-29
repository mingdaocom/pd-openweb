import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { LoadDiv } from 'ming-ui';
import { emitter, getCurrentProject } from 'src/util';
import AppGroups from './AppGroups';
import SideNav from './SideNav';
import AppLib from 'src/pages/AppHomepage/AppLib';
import _ from 'lodash';
import { WaterMark } from 'ming-ui';
import { getTodoCount } from 'src/pages/workflow/MyProcess/Entry';
import Dashboard from '../Dashboard';
import RecordFav from '../RecordFav';
import { getDashboardColor } from '../Dashboard/utils';
import homeAppAjax from 'src/api/homeApp';
import { navigateTo } from 'src/router/navigateTo';

const Con = styled.div`
  display: flex;
  height: 100%;
  position: relative;
`;

const AppLibCon = styled.div`
  flex: 1;
  overflow: hidden;
`;
const list = [
  { str: '/app/lib', key: 'lib' },
  { str: '/dashboard', key: 'dashboard' },
  { str: '/favorite', key: 'favorite' },
];

let cachePlatformSetting = {};
let cacheCountData = {};

function AppCenter(props) {
  const projectId = _.get(props, 'match.params.projectId');
  const projects = _.get(md, 'global.Account.projects');
  const project = getCurrentProject(projectId || localStorage.getItem('currentProjectId'));
  const [currentProject, setCurrentProject] = useState(
    !_.isEmpty(project) ? project : projects[0] || { companyName: _l('外部协作'), projectId: 'external' },
  );
  const [countData, setCountData] = useState(cacheCountData);
  const [platformSetting, setPlatformSetting] = useState(cachePlatformSetting[currentProject.projectId] || {});
  const [isLoading, setIsLoading] = useState(true);
  const dashboardColor = getDashboardColor((platformSetting || {}).color);

  const getKey = () => {
    let key = 'app';
    list.map(o => {
      if (location.pathname.startsWith(o.str)) {
        key = o.key;
      }
    });
    return key;
  };
  const keyStr = getKey();

  function changeProject(project) {
    keyStr === 'app' && navigateTo('/app/my', false, true);
    setCurrentProject(project);
    if (!cachePlatformSetting[project.projectId]) {
      loadPlatformSetting(project.projectId);
    } else {
      setPlatformSetting(cachePlatformSetting[project.projectId]);
    }
  }

  const loadPlatformSetting = projectId => {
    if (projectId === 'external') {
      setPlatformSetting({});
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    homeAppAjax
      .getHomePlatformSetting({ projectId })
      .then(res => {
        if (res) {
          setPlatformSetting(res);
          setIsLoading(false);
          cachePlatformSetting[projectId] = res;
        }
      })
      .fail(() => setIsLoading(false));
  };

  const updatePlatformSetting = (updateObj, cb) => {
    const oldValue = cachePlatformSetting[currentProject.projectId];
    const newSetting = { ...oldValue, ...updateObj };
    setPlatformSetting(newSetting);

    if (updateObj.editingKey !== 'logo') {
      homeAppAjax
        .editPlatformSetting(newSetting)
        .then(res => {
          if (res) {
            cachePlatformSetting[currentProject.projectId] = newSetting;
            cb && cb();
          }
        })
        .fail(() => {
          alert(_l('更新工作台配置失败！'), 2);
          setPlatformSetting(oldValue);
        });
    } else {
      cachePlatformSetting[currentProject.projectId] = newSetting;
    }
  };

  useEffect(() => {
    if (!cachePlatformSetting[currentProject.projectId]) {
      loadPlatformSetting(currentProject.projectId);
    } else {
      setIsLoading(false);
    }

    if (_.isEmpty(cacheCountData)) {
      getTodoCount().then(data => {
        setCountData(data);
        cacheCountData = data;
      });
    }
    emitter.addListener('CHANGE_CURRENT_PROJECT', changeProject);
    return () => {
      emitter.removeListener('CHANGE_CURRENT_PROJECT', changeProject);
    };
  }, []);

  const renderCon = () => {
    switch (keyStr) {
      case 'lib':
        return (
          <AppLibCon>
            <AppLib />
          </AppLibCon>
        );
      case 'favorite':
        return <RecordFav currentProject={currentProject} projectId={currentProject.projectId} />;
      case 'dashboard':
        return (
          <Dashboard
            currentProject={currentProject}
            projectId={currentProject.projectId}
            countData={countData}
            updateCountData={data => {
              setCountData(data);
              cacheCountData = data;
            }}
            platformSetting={platformSetting}
            updatePlatformSetting={updatePlatformSetting}
            dashboardColor={dashboardColor}
          />
        );
      default:
        return (
          <AppGroups
            currentProject={currentProject}
            projectId={currentProject.projectId}
            dashboardColor={dashboardColor}
          />
        );
    }
  };

  if (isLoading) {
    return <LoadDiv className="mTop10" />;
  }

  return (
    <WaterMark projectId={currentProject.projectId}>
      <Con>
        <SideNav
          active={keyStr}
          currentProject={currentProject}
          countData={countData}
          dashboardColor={dashboardColor}
        />
        {renderCon()}
      </Con>
    </WaterMark>
  );
}

export default withRouter(AppCenter);
