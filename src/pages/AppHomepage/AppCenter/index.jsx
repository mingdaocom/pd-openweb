import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import DocumentTitle from 'react-document-title';
import { withRouter } from 'react-router-dom';
import { LoadDiv, WaterMark } from 'ming-ui';
import { emitter, getCurrentProject } from 'src/util';
import AppGroups from './AppGroups';
import SideNav from './SideNav';
import AppLib from 'src/pages/AppHomepage/AppLib';
import _ from 'lodash';
import { getTodoCount } from 'src/pages/workflow/MyProcess/Entry';
import Dashboard from '../Dashboard';
import RecordFav from '../RecordFav';
import { getDashboardColor } from '../Dashboard/utils';
import homeAppAjax from 'src/api/homeApp';
import { navigateTo } from 'src/router/navigateTo';
import { getMyPermissions } from 'src/components/checkPermission';
import moment from 'moment';

const Con = styled.div`
  display: flex;
  height: 100%;
  position: relative;
  background-repeat: no-repeat;
  background-size: 100%;
  background-position: bottom;
  background-blend-mode: normal;
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

function AppCenter(props) {
  const projectId = _.get(props, 'match.params.projectId');
  const projects = _.get(md, 'global.Account.projects');
  const project = getCurrentProject(projectId || localStorage.getItem('currentProjectId'));
  const [currentProject, setCurrentProject] = useState(
    !_.isEmpty(project) ? project : projects[0] || { companyName: _l('外部协作'), projectId: 'external' },
  );
  const [countData, setCountData] = useState({});
  const [platformSetting, setPlatformSetting] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [myPermissions, setMyPermissions] = useState([]);
  const [advancedThemes, setAdvancedThemes] = useState([]);

  const isWWW = location.host.includes('www.mingdao.com');
  const themeFileUrlPrefix = `https://fp1.mingdaoyun.cn/dashboard/${isWWW ? 'www' : 'meihua'}`;

  const currentThemeKey = _.get(platformSetting, 'advancedSetting.themeKey');
  const currentTheme = currentThemeKey
    ? _.get(platformSetting, 'advancedSetting.appIcon')
      ? platformSetting.advancedSetting
      : {
          themeKey: currentThemeKey,
          appIcon: `${themeFileUrlPrefix}/${currentThemeKey}/app.png`,
          appCollectIcon: `${themeFileUrlPrefix}/${currentThemeKey}/app_collect.png`,
          chartCollectIcon: `${themeFileUrlPrefix}/${currentThemeKey}/chart.png`,
          recordFavIcon: `${themeFileUrlPrefix}/${currentThemeKey}/record.png`,
          processIcon: `${themeFileUrlPrefix}/${currentThemeKey}/process.png`,
          recentIcon: `${themeFileUrlPrefix}/${currentThemeKey}/recent.png`,
          bgImg: `${themeFileUrlPrefix}/${currentThemeKey}/background.png`,
        }
    : {};
  const dashboardColor = getDashboardColor((platformSetting || {}).color);

  useEffect(() => {
    emitter.addListener('CHANGE_CURRENT_PROJECT', changeProject);
    loadPlatformSetting(currentProject.projectId);
    getTodoCount().then(data => setCountData(data));
    currentProject.project !== 'external' &&
      getMyPermissions(currentProject.projectId, false).then(permissionIds => setMyPermissions(permissionIds));

    !md.global.Config.IsLocal &&
      fetch(`${themeFileUrlPrefix}/themes.js?${moment().format('YYYY_MM_DD_') + Math.floor(moment().hour() / 24)}`)
        .then(res => res.text())
        .then(res => {
          const data = eval(res) || [];
          const themes = data.map(item => ({
            ...item,
            themeIcon: `${themeFileUrlPrefix}/${item.themeKey}/main.png`,
            bulletinPic: `${themeFileUrlPrefix}/${item.themeKey}/banner.jpg`,
          }));
          setAdvancedThemes(themes);
        });

    return () => {
      emitter.removeListener('CHANGE_CURRENT_PROJECT', changeProject);
    };
  }, []);

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
    getKey() === 'app' && navigateTo('/app/my', false, true);
    setCurrentProject(project);
    loadPlatformSetting(project.projectId);
    project.projectId !== 'external' &&
      getMyPermissions(project.projectId, false).then(permissionIds => setMyPermissions(permissionIds));
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
        }
      })
      .catch(() => setIsLoading(false));
  };

  const updatePlatformSetting = (updateObj, cb) => {
    const oldValue = platformSetting;
    const newSetting = { ...oldValue, ...updateObj };
    setPlatformSetting(newSetting);

    if (updateObj.editingKey !== 'logo') {
      homeAppAjax
        .editPlatformSetting(newSetting)
        .then(res => {
          if (res) {
            cb && cb();
          }
        })
        .catch(() => {
          alert(_l('更新工作台配置失败！'), 2);
          setPlatformSetting(oldValue);
        });
    }
  };

  const renderCon = () => {
    switch (keyStr) {
      case 'lib':
        return (
          <AppLibCon>
            <DocumentTitle title={_l('应用库')} />
            <AppLib />
          </AppLibCon>
        );
      case 'favorite':
        return (
          <React.Fragment>
            <DocumentTitle title={_l('收藏')} />
            <RecordFav currentProject={currentProject} projectId={currentProject.projectId} />
          </React.Fragment>
        );

      case 'dashboard':
        return (
          <React.Fragment>
            <DocumentTitle title={_l('工作台')} />
            <Dashboard
              currentProject={currentProject}
              projectId={currentProject.projectId}
              countData={countData}
              updateCountData={data => setCountData(data)}
              platformSetting={platformSetting}
              updatePlatformSetting={updatePlatformSetting}
              dashboardColor={dashboardColor}
              hasBgImg={keyStr === 'dashboard' && currentThemeKey}
              myPermissions={myPermissions}
              advancedThemes={advancedThemes}
              currentTheme={currentTheme}
            />
          </React.Fragment>
        );
      default:
        return (
          <React.Fragment>
            <DocumentTitle title={_l('我的应用')} />
            <AppGroups
              currentProject={currentProject}
              projectId={currentProject.projectId}
              dashboardColor={dashboardColor}
              myPermissions={myPermissions}
            />
          </React.Fragment>
        );
    }
  };

  if (isLoading) {
    return <LoadDiv className="mTop10" />;
  }

  return (
    <WaterMark projectId={currentProject.projectId}>
      <Con
        style={{
          backgroundImage: keyStr === 'dashboard' && currentThemeKey ? `url(${currentTheme.bgImg})` : 'unset',
          backgroundColor: keyStr === 'dashboard' && currentThemeKey ? dashboardColor.bgColor : 'unset',
        }}
      >
        {!(keyStr === 'lib' && !md.global.Config.IsLocal) && (
          <SideNav
            active={keyStr}
            currentProject={currentProject}
            countData={countData}
            dashboardColor={dashboardColor}
            hasBgImg={keyStr === 'dashboard' && currentThemeKey}
            myPermissions={myPermissions}
          />
        )}
        {renderCon()}
      </Con>
    </WaterMark>
  );
}

export default withRouter(AppCenter);
