import React, { lazy, Suspense, useMemo, useState } from 'react';
import DocumentTitle from 'react-document-title';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv, MdLink, ScrollView, SearchInput, SvgIcon } from 'ming-ui';
import { Modal, Tooltip, Typography } from 'ming-ui/antd-components';
import appSandboxAjax from 'src/api/appSandbox';
import { useAccessibleSandboxProjects } from 'src/components/AppSandbox/hooks/useSandboxAccess';
import { useSandboxHomeApps } from 'src/components/AppSandbox/hooks/useSandboxHomeApps';
import TableEmpty from 'src/pages/Admin/common/TableEmpty';
import AppTransfer from 'src/pages/Admin/components/AppTransfer';
import { getAppIconColors } from 'src/utils/domain/app/color';
import { isSandboxSupportedProject } from 'src/utils/domain/app/sandbox';
import { getAppNavigateUrl, getFilterApps, transferExternalLinkUrl } from 'src/utils/services/appCenter';
import AppSandboxHeader from './components/Header';
import QuotaDrawer from './components/QuotaDrawer';
import { useBatchPublish, useSandboxQuota } from './core/hooks';

const MAX_PUBLISH_APP_COUNT = 20;
const EMPTY_APP_DETAIL = { icon: 'icon-worksheet_public', desc: _l('暂无数据') };
const EMPTY_SEARCH_DETAIL = { icon: 'icon-worksheet_public', desc: _l('无搜索结果') };
const PUBLISH_PENDING_STATUS_LABELS = {
  0: _l('存在待审核版本'),
  1: _l('存在待升级版本'),
};
const PUBLISH_PENDING_STATUSES = new Set([0, 1]);
const BatchPublishPage = lazy(() => import('./components/BatchPublishPage'));

const SandboxHome = styled.main`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  background-color: var(--color-background-secondary);
`;

const ContentScroll = styled(ScrollView)`
  flex: 1;
  min-width: 0;
  min-height: 0;
`;

const PageContent = styled.div`
  box-sizing: border-box;
  width: 100%;
  min-width: 800px;
  padding: 32px 78px 28px;
`;

const Card = styled.section`
  box-sizing: border-box;
  border: 1px solid var(--color-border-secondary);
  border-radius: 12px;
  background: var(--color-background-card);
  box-shadow: 0 1px 4px var(--color-border-secondary);
`;

const AppsCard = styled(Card)`
  min-height: 536px;
  padding: 24px 32px 28px;
`;

const AppsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SearchActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const QuotaButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  box-sizing: border-box;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;

  &:hover {
    background: var(--color-background-hover);
  }
`;

const PublishButton = styled.button`
  flex: none;
  box-sizing: border-box;
  min-width: 92px;
  height: 36px;
  padding: 0 32px;
  border: 0;
  border-radius: 33px;
  background: var(--color-primary);
  color: var(--color-white);
  font-size: 14px;
  font-weight: 600;
  line-height: 36px;
  text-align: center;
  white-space: nowrap;
  cursor: pointer;
  &:not(:disabled):hover {
    background: var(--color-primary-light);
  }
  &:not(:disabled):active {
    background: var(--color-primary-dark);
  }

  &:disabled {
    background: var(--color-background-disabled);
    color: var(--color-text-disabled);
    cursor: not-allowed;
  }
`;

const AppGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, 132px);
  justify-content: space-between;
  column-gap: 12px;
  row-gap: 16px;
  margin-top: 22px;
`;

const AppItem = styled(MdLink)`
  display: flex;
  align-items: center;
  flex-direction: column;
  box-sizing: border-box;
  width: 132px;
  min-height: 133px;
  padding: 10px 0 8px;
  border-radius: 12px;
  text-decoration: none;
  cursor: pointer;
  transition: 0.2s ease-out;

  &:hover {
    background: var(--color-background-hover);
    transform: translateY(-4px);
  }
`;

const AppIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
`;

const AppName = styled.div`
  display: -webkit-box;
  width: 100%;
  margin-top: 10px;
  padding: 0 8px;
  overflow: hidden;
  box-sizing: border-box;
  color: var(--color-text-primary);
  font-size: 14px;
  line-height: 18px;
  text-align: center;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
`;

const AppsEmpty = styled(TableEmpty)`
  height: 430px;
  padding-top: 0;
`;

const PublishAppStatus = styled.span`
  flex: none;
  margin-left: 10px;
  padding: 0 8px;
  border-radius: 10px;
  background: var(--color-background-secondary);
  color: var(--color-text-tertiary);
  font-size: 12px;
  line-height: 20px;
`;

const requestPublishApps = ({ projectId, keyword }) =>
  appSandboxAjax.getPublishApps({ projectId, keyword }, { silent: true });

const isPublishAppDisabled = app => PUBLISH_PENDING_STATUSES.has(app.pendingStatus);

const renderPublishAppStatus = app => {
  if (!isPublishAppDisabled(app)) return null;

  return <PublishAppStatus>{PUBLISH_PENDING_STATUS_LABELS[app.pendingStatus]}</PublishAppStatus>;
};

function handleAppClick(event, app, projectId) {
  if (app.createType === 1) {
    event.stopPropagation();
    event.preventDefault();
    window.open(transferExternalLinkUrl(app.urlTemplate, projectId, app.id), '_blank');
  }
}

export default function AppSandbox() {
  const allProjects = useMemo(() => _.get(md, 'global.Account.projects', []) || [], []);
  const { projects, checking: projectsChecking } = useAccessibleSandboxProjects(allProjects);
  const [selectedProjectId, setSelectedProjectId] = useState(() => localStorage.getItem('currentProjectId'));
  const currentProject =
    _.find(projects, { projectId: selectedProjectId }) ||
    _.find(projects, { projectId: localStorage.getItem('currentProjectId') }) ||
    projects[0];
  const [keywords, setKeywords] = useState('');
  const [quotaVisible, setQuotaVisible] = useState(false);
  const [publishVisible, setPublishVisible] = useState(false);
  const [batchPublishVisible, setBatchPublishVisible] = useState(false);
  const [selectedApps, setSelectedApps] = useState([]);
  const currentProjectId = currentProject && currentProject.projectId;
  const sandboxSupported = isSandboxSupportedProject(currentProjectId);
  const canViewQuota = Boolean(currentProject?.isSuperAdmin);
  const { apps, loading: appsLoading } = useSandboxHomeApps(currentProjectId);
  const visibleApps = useMemo(() => getFilterApps(apps, keywords), [apps, keywords]);
  const isPublishDisabled = !sandboxSupported || !selectedApps.length || selectedApps.length > MAX_PUBLISH_APP_COUNT;
  const { publish: batchPublish, publishing: batchPublishing } = useBatchPublish(currentProjectId);
  const {
    data: quotaData,
    loading: quotaLoading,
    error: quotaError,
    loadQuota,
    cancelQuota,
  } = useSandboxQuota(currentProjectId);

  const changeProject = project => {
    cancelQuota();
    setSelectedProjectId(project.projectId);
    setQuotaVisible(false);
  };

  const openQuota = () => {
    setQuotaVisible(true);
    loadQuota();
  };

  const closeQuota = () => {
    cancelQuota();
    setQuotaVisible(false);
  };

  const openPublish = () => {
    if (!currentProject || !sandboxSupported) return;

    setSelectedApps([]);
    setPublishVisible(true);
  };

  const closePublish = () => {
    setPublishVisible(false);
    setSelectedApps([]);
  };

  const confirmPublish = () => {
    if (isPublishDisabled) return;

    console.log('Sandbox publish applications:', selectedApps);
    setPublishVisible(false);
    setBatchPublishVisible(true);
  };

  const closeBatchPublish = () => {
    setBatchPublishVisible(false);
    setSelectedApps([]);
  };

  const submitBatchPublish = versions => {
    if (!sandboxSupported) return;

    const request = batchPublish(versions);

    request?.then(success => {
      if (success) closeBatchPublish();
    });
  };

  return (
    <SandboxHome className="appSandboxHome">
      <DocumentTitle title={_l('工作台')} />
      <AppSandboxHeader currentProject={currentProject} projects={projects} onProjectChange={changeProject} />
      <ContentScroll>
        <PageContent>
          <AppsCard>
            <AppsHeader>
              <SearchActions>
                <SearchInput placeholder={_l('搜索应用')} value={keywords} onChange={setKeywords} />
                {canViewQuota && (
                  <Tooltip title={_l('额度')} placement="bottom">
                    <QuotaButton type="button" aria-label={_l('额度')} onClick={openQuota}>
                      <Icon icon="storage" className="Font20" />
                    </QuotaButton>
                  </Tooltip>
                )}
              </SearchActions>
              <PublishButton type="button" disabled={!currentProject || !sandboxSupported} onClick={openPublish}>
                {_l('发布')}
              </PublishButton>
            </AppsHeader>
            {(projectsChecking && !currentProject) || appsLoading ? (
              <LoadDiv className="mTop30" />
            ) : visibleApps.length ? (
              <AppGrid>
                {visibleApps.map(item => {
                  const { backgroundColor, iconColor } = getAppIconColors(item);

                  return (
                    <AppItem
                      key={item.id}
                      to={getAppNavigateUrl(item.id, item.pcNaviStyle, item.selectAppItmeType)}
                      title={item.name}
                      onClick={event => handleAppClick(event, item, currentProjectId)}
                    >
                      <AppIcon style={{ backgroundColor }}>
                        <SvgIcon url={item.iconUrl} fill={iconColor} size={44} />
                      </AppIcon>
                      <AppName>{item.name}</AppName>
                    </AppItem>
                  );
                })}
              </AppGrid>
            ) : (
              <AppsEmpty detail={keywords.trim() ? EMPTY_SEARCH_DETAIL : EMPTY_APP_DETAIL} />
            )}
          </AppsCard>
        </PageContent>
      </ContentScroll>
      <QuotaDrawer
        open={quotaVisible && canViewQuota}
        data={quotaData}
        loading={quotaLoading}
        error={quotaError}
        onClose={closeQuota}
      />
      {publishVisible && (
        <Modal
          open={publishVisible}
          width={920}
          keyboard
          title={_l('选择应用')}
          cancelText={_l('取消')}
          okText={_l('确定')}
          okDisabled={isPublishDisabled}
          onOk={confirmPublish}
          onCancel={closePublish}
        >
          <Typography.Paragraph type="secondary" className="mBottom20">
            {_l(
              '选择沙盒应用进行发布，若选择了多个应用，则需每个应用管理员都审核通过/组织管理员一键通过后，再一起升级',
            )}
          </Typography.Paragraph>
          {currentProject && (
            <AppTransfer
              projectId={currentProject.projectId}
              value={selectedApps}
              maxCount={MAX_PUBLISH_APP_COUNT}
              isAppDisabled={isPublishAppDisabled}
              renderAppExtra={renderPublishAppStatus}
              requestApps={requestPublishApps}
              showSelectedAppCount={false}
              onChange={setSelectedApps}
            />
          )}
        </Modal>
      )}
      {batchPublishVisible && (
        <Suspense fallback={null}>
          <BatchPublishPage
            apps={selectedApps}
            submitting={batchPublishing}
            onClose={closeBatchPublish}
            onSubmit={submitBatchPublish}
          />
        </Suspense>
      )}
    </SandboxHome>
  );
}
