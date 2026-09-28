import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { Icon, LoadDiv, SvgIcon } from 'ming-ui';
import { WaterMark } from 'ming-ui/antd-components';
import { useAccessibleSandboxProjects } from 'src/components/AppSandbox/hooks/useSandboxAccess';
import { useSandboxHomeApps } from 'src/components/AppSandbox/hooks/useSandboxHomeApps';
import { getAppIconColors } from 'src/utils/domain/app/color';
import { getFilterApps, transferExternalLinkUrl } from 'src/utils/services/appCenter';
import { addBehaviorLog } from 'src/utils/services/project';
import SelectProject from '../components/SelectProject';
import TabBar from '../components/TabBar';

const Page = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-background-primary);
`;

const Header = styled.header`
  flex: none;
  padding-top: 12px;
  background: var(--color-background-secondary);
`;

const SearchBox = styled.label`
  display: flex;
  align-items: center;
  flex: none;
  box-sizing: border-box;
  height: 36px;
  margin: 0 16px 15px;
  padding: 0 13px;
  border-radius: 18px;
  background: var(--color-background-primary);
  color: var(--color-text-tertiary);

  input {
    flex: 1;
    min-width: 0;
    margin-left: 8px;
    border: 0;
    outline: none;
    background: transparent;
    color: var(--color-text-primary);
    font-size: 14px;

    &::placeholder {
      color: var(--color-text-disabled);
    }
  }
`;

const Content = styled.main`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  border-top: 10px solid var(--color-background-secondary);
`;

const SectionTitle = styled.h1`
  margin: 0;
  padding: 18px 16px 16px;
  color: var(--color-text-primary);
  font-size: 17px;
  font-weight: 600;
  line-height: 24px;
`;

const AppGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding: 0 16px calc(24px + env(safe-area-inset-bottom));
`;

const AppItem = styled.button`
  display: flex;
  align-items: center;
  box-sizing: border-box;
  min-width: 0;
  height: 64px;
  padding: 0 12px;
  border: 0;
  border-radius: 8px;
  background: var(--color-background-tertiary);
  color: var(--color-text-primary);
  text-align: left;

  .appIcon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 44px;
    height: 44px;
    margin-right: 10px;
    border-radius: 50%;
    color: var(--color-white);
    font-size: 28px;

    > div,
    .Icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      line-height: 1;
    }
  }

  .appName {
    display: -webkit-box;
    min-width: 0;
    overflow: hidden;
    font-size: 14px;
    line-height: 18px;
    text-overflow: ellipsis;
    word-break: break-all;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
`;

const Loading = styled(LoadDiv)`
  margin-top: 80px;
`;

const Empty = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding-top: 100px;
  color: var(--color-text-tertiary);

  .emptyText {
    margin-top: 12px;
    font-size: 15px;
  }
`;

const openApp = (event, app, projectId) => {
  addBehaviorLog('app', app.id);

  if (app.createType === 1) {
    event.preventDefault();
    window.open(transferExternalLinkUrl(app.urlTemplate, projectId, app.id));
    return;
  }

  localStorage.removeItem('currentNavWorksheetId');
  safeLocalStorageSetItem('currentGroupInfo', JSON.stringify({}));
  window.mobileNavigateTo(`/mobile/app/${app.id}`);
};

export default function MobileAppSandbox() {
  const allProjects = useMemo(() => md.global.Account.projects || [], []);
  const { projects, checking: projectsChecking } = useAccessibleSandboxProjects(allProjects);
  const [selectedProjectId, setSelectedProjectId] = useState(() => localStorage.getItem('currentProjectId'));
  const currentProject = projects.find(project => project.projectId === selectedProjectId) || projects[0];
  const [keywords, setKeywords] = useState('');
  const currentProjectId = currentProject?.projectId;
  const { apps, loading } = useSandboxHomeApps(currentProjectId);
  const visibleApps = useMemo(
    () =>
      getFilterApps(
        apps.filter(app => app && !(window.isMingDaoApp ? app.appDisplay : app.webMobileDisplay)),
        keywords,
      ),
    [apps, keywords],
  );

  const handleProjectChange = ({ project }) => {
    safeLocalStorageSetItem('currentProjectId', project.projectId);
    setSelectedProjectId(project.projectId);
  };

  return (
    <WaterMark projectId={currentProjectId}>
      <Page>
        <Header>
          <SelectProject
            noCache
            filterExternal
            className="overflowHidden"
            projectId={currentProjectId}
            projects={projects}
            changeProject={handleProjectChange}
          />
          <SearchBox>
            <Icon icon="h5_search" className="Font16" />
            <input
              type="search"
              aria-label={_l('搜索应用')}
              placeholder={_l('搜索应用')}
              value={keywords}
              onChange={event => setKeywords(event.target.value)}
            />
            {keywords && <Icon icon="workflow_cancel" onClick={() => setKeywords('')} />}
          </SearchBox>
        </Header>
        <Content>
          <SectionTitle>{_l('应用')}</SectionTitle>
          {(projectsChecking && !currentProject) || loading ? (
            <Loading />
          ) : visibleApps.length ? (
            <AppGrid>
              {visibleApps.map(app => {
                const { backgroundColor, iconColor } = getAppIconColors(app);

                return (
                  <AppItem key={app.id} type="button" onClick={event => openApp(event, app, currentProjectId)}>
                    <span className="appIcon" style={{ backgroundColor }}>
                      {app.iconUrl ? (
                        <SvgIcon url={app.iconUrl} fill={iconColor} size={30} />
                      ) : (
                        <Icon icon={app.icon} />
                      )}
                    </span>
                    <span className="appName">{app.name}</span>
                  </AppItem>
                );
              })}
            </AppGrid>
          ) : (
            <Empty>
              <Icon icon="application_library" className="Font48" />
              <div className="emptyText">{keywords.trim() ? _l('无搜索结果') : _l('暂无数据')}</div>
            </Empty>
          )}
        </Content>
        <TabBar action="appHome" />
      </Page>
    </WaterMark>
  );
}
