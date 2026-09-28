import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { LoadDiv, ScrollView } from 'ming-ui';
import { Button } from 'ming-ui/antd-components';
import { useEsc } from 'src/utils/platform/react/interaction';
import AppVersionContent from '../components/AppVersionContent';
import ConfirmVersionActionDialog from '../components/ConfirmVersionActionDialog';
import {
  SANDBOX_VERSION_DETAIL_MODE,
  VERSION_ACTION,
  VERSION_DETAIL_FROM,
  VERSION_DETAIL_HORIZONTAL_PADDING,
} from '../constants';
import usePublishContrast from '../contrast/hooks/usePublishContrast';
import { compareVersions, isVersionComplete } from '../versionNumber';
import versionPropType from '../versionPropType';
import Footer from './components/Footer';
import Header from './components/Header';

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
  flex: 1;
  min-height: 0;
`;

const ContentLayout = styled.main`
  width: 100%;
  padding: 30px ${VERSION_DETAIL_HORIZONTAL_PADDING};
  box-sizing: border-box;
`;

const ContrastError = styled.div`
  display: flex;
  min-height: 240px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: var(--color-text-secondary);
  font-size: 14px;

  .retryButton {
    margin-top: 12px;
  }
`;

const noop = () => {};

const createVersionState = (version, isRelease) =>
  version
    ? {
        ...version,
        ...(isRelease && !version.description ? { description: undefined } : {}),
      }
    : null;

export default function VersionDetailPage({
  open = false,
  appId,
  version = null,
  mode = SANDBOX_VERSION_DETAIL_MODE.VIEW,
  from = VERSION_DETAIL_FROM.APP_MANAGEMENT,
  onClose = noop,
  onApprove = noop,
  onReject = noop,
  onRestore = noop,
  onWithdraw = noop,
  onSubmit = noop,
  submitting = false,
}) {
  const [confirmAction, setConfirmAction] = useState(null);
  const isRelease = mode === SANDBOX_VERSION_DETAIL_MODE.RELEASE;
  const [releaseVersion, setReleaseVersion] = useState(() => createVersionState(version, isRelease));
  const versionId = isRelease ? undefined : version?.versionId || version?.id;
  const {
    data: contrast,
    error: contrastError,
    loading: contrastLoading,
    retry: retryContrast,
  } = usePublishContrast({
    appId,
    versionId,
    enabled: open && Boolean(appId) && (isRelease || Boolean(versionId)),
  });
  const baseVersion = isRelease ? releaseVersion : version;
  const currentVersion =
    baseVersion && contrast
      ? {
          ...baseVersion,
          ...contrast,
          ...(isRelease && baseVersion.description !== undefined ? { description: baseVersion.description } : {}),
        }
      : baseVersion;
  const isVersionNotGreaterThanMinimum =
    isRelease &&
    isVersionComplete(currentVersion?.minimumVersion) &&
    isVersionComplete(currentVersion?.version) &&
    compareVersions(currentVersion.version, currentVersion.minimumVersion) <= 0;
  const isSubmitDisabled =
    isRelease &&
    (submitting ||
      contrastLoading ||
      isVersionNotGreaterThanMinimum ||
      !isVersionComplete(currentVersion?.version) ||
      !currentVersion?.description?.trim());

  const handleClose = () => {
    if (submitting) return;

    setConfirmAction(null);
    setReleaseVersion(createVersionState(version, isRelease));
    onClose();
  };

  useEsc(handleClose, open && Boolean(version) && !confirmAction && !submitting);

  if (!open || !currentVersion) return null;

  const updateReleaseVersion = changes => {
    setReleaseVersion(current => ({ ...current, ...changes }));
  };

  const handleSubmit = () => {
    if (submitting || isSubmitDisabled) return;
    onSubmit(currentVersion);
  };

  const handleConfirm = ({ action, rejectReason }) => {
    if (action === VERSION_ACTION.REJECT && !rejectReason.trim()) {
      alert(_l('请填写应用审核不通过的理由'), 3);
      return;
    }

    setConfirmAction(null);

    if (action === VERSION_ACTION.REJECT) onReject({ version, rejectReason });
    if (action === VERSION_ACTION.APPROVE) onApprove(version);
    if (action === VERSION_ACTION.RESTORE) onRestore(version);
  };

  return (
    <Page className="versionDetailPage">
      <PageLayout>
        <Header
          mode={mode}
          from={from}
          status={currentVersion.status}
          app={currentVersion.app}
          onClose={handleClose}
          onWithdraw={() => onWithdraw(version)}
          onRestore={() => setConfirmAction(VERSION_ACTION.RESTORE)}
          onReject={() => setConfirmAction(VERSION_ACTION.REJECT)}
          onApprove={() => setConfirmAction(VERSION_ACTION.APPROVE)}
        />
        <ContentScroll>
          {/* 对比完成前不渲染表单，避免用户基于尚未获取的变更数据提交。 */}
          {contrastLoading ? (
            <LoadDiv className="mTop20" />
          ) : contrastError ? (
            <ContrastError>
              <div>{contrastError.message || _l('获取应用变更失败，请稍后重试')}</div>
              <Button type="link" className="retryButton" onClick={retryContrast}>
                {_l('重新加载')}
              </Button>
            </ContrastError>
          ) : (
            <ContentLayout>
              <AppVersionContent
                appId={appId}
                version={currentVersion}
                mode={mode}
                onVersionChange={value => updateReleaseVersion({ version: value })}
                onDescriptionChange={value => updateReleaseVersion({ description: value })}
              />
            </ContentLayout>
          )}
        </ContentScroll>
        <Footer
          mode={mode}
          submitting={submitting}
          submitDisabled={isSubmitDisabled}
          onClose={handleClose}
          onSubmit={handleSubmit}
        />
      </PageLayout>
      {confirmAction && (
        <ConfirmVersionActionDialog
          open
          action={confirmAction}
          version={version}
          onClose={() => setConfirmAction(null)}
          onConfirm={handleConfirm}
        />
      )}
    </Page>
  );
}

VersionDetailPage.propTypes = {
  open: PropTypes.bool,
  appId: PropTypes.string,
  version: versionPropType,
  mode: PropTypes.oneOf(Object.values(SANDBOX_VERSION_DETAIL_MODE)),
  from: PropTypes.oneOf(Object.values(VERSION_DETAIL_FROM)),
  onClose: PropTypes.func,
  onApprove: PropTypes.func,
  onReject: PropTypes.func,
  onRestore: PropTypes.func,
  onWithdraw: PropTypes.func,
  onSubmit: PropTypes.func,
  submitting: PropTypes.bool,
};
