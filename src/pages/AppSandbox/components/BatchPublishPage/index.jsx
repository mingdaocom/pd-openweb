import React, { useEffect, useMemo, useState } from 'react';
import DocumentTitle from 'react-document-title';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon, LoadDiv, ScrollView, SvgIcon } from 'ming-ui';
import appSandboxAjax from 'src/api/appSandbox';
import AppVersionContent from 'src/components/AppSandbox/version/components/AppVersionContent';
import {
  SANDBOX_VERSION_DETAIL_MODE,
  VERSION_DETAIL_HORIZONTAL_PADDING,
} from 'src/components/AppSandbox/version/constants';
import {
  getPublishContrastErrorMessage,
  isPublishContrastSuccess,
  normalizePublishContrast,
} from 'src/components/AppSandbox/version/contrast/publishContrast';
import { getReleaseVersionDefaults, isVersionGreaterThan } from 'src/components/AppSandbox/version/versionNumber';
import { isSandboxEnvironment } from 'src/utils/domain/app/sandbox';
import { useEsc } from 'src/utils/platform/react/interaction';
import Footer from './Footer';
import Header from './Header';

const Page = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  width: 100vw;
  height: 100vh;
  overflow-x: auto;
  overflow-y: hidden;
  background-color: var(--color-background-primary);
`;

const PageLayout = styled.div`
  display: flex;
  width: 100%;
  min-width: 1000px;
  height: 100%;
  flex-direction: column;
`;

const ContentScroll = styled(ScrollView)`
  min-height: 0;
  flex: 1;
`;

const Content = styled.main`
  width: 100%;
  padding: 30px ${VERSION_DETAIL_HORIZONTAL_PADDING};
  box-sizing: border-box;
`;

const AppPanel = styled.section`
  margin-bottom: 16px;
  overflow: hidden;
  border: 1px solid var(--color-border-secondary);
  border-radius: 4px;
  background-color: var(--color-background-primary);
`;

const AppPanelHeader = styled.div`
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 20px;
  cursor: pointer;
`;

const AppIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-right: 12px;
  border-radius: 5px;
  flex-shrink: 0;
`;

const AppName = styled.span`
  min-width: 0;
  overflow: hidden;
  color: var(--color-text-primary);
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
`;

const StatusText = styled.span`
  margin-right: 10px;
  color: var(--color-error);
  font-size: 13px;
`;

const StatusIcon = styled(Icon)`
  margin-right: 14px;
  color: ${({ $valid }) => ($valid ? 'var(--color-success)' : 'var(--color-text-disabled)')};
  font-size: 16px;
`;

const ExpandIcon = styled(Icon)`
  color: var(--color-text-secondary);
  font-size: 22px;
  transform: rotate(${({ $expanded }) => ($expanded ? 180 : 0)}deg);
  transition: transform 0.2s;
`;

const ContrastError = styled.div`
  padding: 32px 20px;
  color: var(--color-error);
  text-align: center;
`;

const CONTRAST_STATUS = {
  LOADING: 'loading',
  LOADED: 'loaded',
  ERROR: 'error',
};

const createVersionForms = apps =>
  apps.reduce(
    (forms, app) => ({
      ...forms,
      [app.appId]: {
        ...getReleaseVersionDefaults(app.latestVersionNo),
        description: '',
        changes: {},
      },
    }),
    {},
  );

const noop = () => {};

export default function BatchPublishPage({ apps, submitting = false, onClose = noop, onSubmit = noop }) {
  const [versionForms, setVersionForms] = useState(() => createVersionForms(apps));
  const [expandedAppIds, setExpandedAppIds] = useState(() => new Set(apps[0] ? [apps[0].appId] : []));
  const [contrastStatuses, setContrastStatuses] = useState(() =>
    Object.fromEntries(apps.map(app => [app.appId, CONTRAST_STATUS.LOADING])),
  );
  const [contrastErrors, setContrastErrors] = useState({});
  const isSubmitDisabled = useMemo(
    () =>
      submitting ||
      apps.some(
        app =>
          contrastStatuses[app.appId] !== CONTRAST_STATUS.LOADED ||
          !isVersionGreaterThan(versionForms[app.appId]?.version, versionForms[app.appId]?.minimumVersion) ||
          !versionForms[app.appId]?.description.trim(),
      ),
    [apps, contrastStatuses, submitting, versionForms],
  );

  useEsc(onClose, !submitting);

  // 批量发布页打开后逐应用获取真实差异，发布新版时不传 versionId。
  useEffect(() => {
    let canceled = false;
    const requests = apps.map(app => {
      const request = appSandboxAjax.getPublishContrast({ appId: app.appId }, { silent: true });

      request
        .then(result => {
          if (canceled) return;
          if (!isPublishContrastSuccess(result)) {
            setContrastStatuses(current => ({ ...current, [app.appId]: CONTRAST_STATUS.ERROR }));
            setContrastErrors(current => ({ ...current, [app.appId]: getPublishContrastErrorMessage(result) }));
            return;
          }

          const contrast = normalizePublishContrast(result, {
            isRelease: true,
            reverse: !isSandboxEnvironment(),
          });

          setVersionForms(currentForms => ({
            ...currentForms,
            [app.appId]: { ...currentForms[app.appId], ...contrast },
          }));
          setContrastStatuses(current => ({ ...current, [app.appId]: CONTRAST_STATUS.LOADED }));
        })
        .catch(error => {
          if (!canceled) {
            setContrastStatuses(current => ({ ...current, [app.appId]: CONTRAST_STATUS.ERROR }));
            setContrastErrors(current => ({
              ...current,
              [app.appId]: error?.message || _l('获取应用变更失败，请稍后重试'),
            }));
          }
        });

      return request;
    });

    return () => {
      canceled = true;
      requests.forEach(request => request?.abort?.());
    };
  }, [apps]);

  const updateVersion = (appId, changes) => {
    setVersionForms(currentForms => ({
      ...currentForms,
      [appId]: { ...currentForms[appId], ...changes },
    }));
  };

  const toggleExpanded = appId => {
    setExpandedAppIds(currentIds => {
      const nextIds = new Set(currentIds);
      nextIds.has(appId) ? nextIds.delete(appId) : nextIds.add(appId);
      return nextIds;
    });
  };

  const handleSubmit = () => {
    if (isSubmitDisabled) return;
    onSubmit(apps.map(app => ({ app, ...versionForms[app.appId] })));
  };

  return (
    <Page>
      <PageLayout>
        <DocumentTitle title={_l('发布新版本')} />
        <Header onClose={submitting ? noop : onClose} />
        <ContentScroll>
          <Content>
            {apps.map(app => {
              const version = versionForms[app.appId];
              const expanded = expandedAppIds.has(app.appId);
              const hasDescription = Boolean(version.description.trim());
              const contrastStatus = contrastStatuses[app.appId];

              return (
                <AppPanel key={app.appId}>
                  <AppPanelHeader onClick={() => toggleExpanded(app.appId)}>
                    <AppIcon style={{ backgroundColor: app.iconColor }}>
                      <SvgIcon url={app.iconUrl} fill="var(--color-white)" size={18} />
                    </AppIcon>
                    <AppName>{app.appName}</AppName>
                    {!hasDescription && <StatusText>{_l('请填写发布说明')}</StatusText>}
                    <StatusIcon icon="check_circle" $valid={hasDescription} />
                    <ExpandIcon icon="expand_more" $expanded={expanded} />
                  </AppPanelHeader>
                  {expanded && contrastStatus === CONTRAST_STATUS.LOADING && <LoadDiv className="mTop20 mBottom20" />}
                  {expanded && contrastStatus === CONTRAST_STATUS.ERROR && (
                    <ContrastError>{contrastErrors[app.appId] || _l('获取应用变更失败，请稍后重试')}</ContrastError>
                  )}
                  {expanded && contrastStatus === CONTRAST_STATUS.LOADED && (
                    <AppVersionContent
                      appId={app.appId}
                      version={version}
                      mode={SANDBOX_VERSION_DETAIL_MODE.RELEASE}
                      onVersionChange={value => updateVersion(app.appId, { version: value })}
                      onDescriptionChange={value => updateVersion(app.appId, { description: value })}
                    />
                  )}
                </AppPanel>
              );
            })}
          </Content>
        </ContentScroll>
        <Footer submitting={submitting} submitDisabled={isSubmitDisabled} onClose={onClose} onSubmit={handleSubmit} />
      </PageLayout>
    </Page>
  );
}

BatchPublishPage.propTypes = {
  apps: PropTypes.arrayOf(
    PropTypes.shape({
      appId: PropTypes.string.isRequired,
      appName: PropTypes.string.isRequired,
      iconColor: PropTypes.string,
      iconUrl: PropTypes.string,
      latestVersionNo: PropTypes.string,
    }),
  ).isRequired,
  submitting: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
};
