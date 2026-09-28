import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import { Button } from 'ming-ui/antd-components';
import DataSyncSettingsModal from 'src/components/AppSandbox/dataSync/DataSyncSettingsModal';
import { useSandboxProjectAccess } from 'src/components/AppSandbox/hooks/useSandboxAccess';
import { useSandboxDeployment } from 'src/components/AppSandbox/hooks/useSandboxDeployment';
import SandboxGuide from 'src/components/AppSandbox/SandboxGuide';
import { VERSION_STATUS } from 'src/components/AppSandbox/version/constants';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { isAppSandboxEnabled, isSandboxEnvironment, isSandboxSupportedProject } from 'src/utils/domain/app/sandbox';
import { VersionProductType } from 'src/utils/domain/shared/productFeatures';
import Overview from './components/Overview';
import VersionList from './components/VersionList';
import useActivation from './hooks/useActivation';

const Page = styled.main`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 720px;
  height: 100%;
  padding: 24px 30px 28px;
  background-color: var(--color-background-secondary);
`;

const DEFAULT_APP_NAME = _l('应用');

export default function AppSandbox({
  appId,
  appName = DEFAULT_APP_NAME,
  projectId,
  sandboxStatus,
  sandboxRecordId,
  onChangeData,
}) {
  const [versionListRefreshKey, setVersionListRefreshKey] = useState(0);
  const [versionListState, setVersionListState] = useState({
    appId: '',
    hasPendingVersion: true,
    latestVersionNo: '',
  });
  const { checking: accessChecking, canAccess } = useSandboxProjectAccess(projectId);
  const { checking: deployChecking, deployed } = useSandboxDeployment(canAccess ? projectId : undefined);
  const activation = useActivation({
    status: sandboxStatus,
    recordId: sandboxRecordId,
    onChange: onChangeData,
  });
  const sandboxEnabled = isSandboxEnvironment() || isAppSandboxEnabled(sandboxStatus);
  const sandboxSupported = isSandboxSupportedProject(projectId);
  const actionDisabled = activation.initializing || deployChecking || !deployed;
  // 列表尚未返回或存在待审核/待升级版本时，禁止继续发布新版本。
  const publishDisabled = !sandboxSupported || versionListState.appId !== appId || versionListState.hasPendingVersion;
  const handleVersionsChange = useCallback(
    versions => {
      setVersionListState({
        appId,
        // 版本列表按申请时间倒序返回，首条即当前最新版本。
        latestVersionNo: versions[0]?.versionNo || '',
        hasPendingVersion: versions.some(version =>
          [VERSION_STATUS.PENDING_APPROVAL, VERSION_STATUS.PENDING_UPDATE].includes(version.status),
        ),
      });
    },
    [appId],
  );

  const openSandbox = () => {
    if (!sandboxSupported) {
      buriedUpgradeVersionDialog(projectId, VersionProductType.appSandbox);
      return;
    }

    if (actionDisabled) return;

    activation.openSettings();
  };

  return (
    <>
      {accessChecking || (canAccess && deployChecking) ? (
        <Page>
          <LoadDiv className="mTop10" />
        </Page>
      ) : !canAccess ? (
        <SandboxGuide
          actionSlot={
            <Button className="sandbox-guide-action" type="primary" onClick={openSandbox}>
              {_l('开启沙盒')}
            </Button>
          }
        />
      ) : sandboxEnabled && deployed ? (
        <Page>
          <Overview
            appId={appId}
            appName={appName}
            latestVersionNo={versionListState.appId === appId ? versionListState.latestVersionNo : ''}
            publishDisabled={publishDisabled}
            onChangeData={onChangeData}
            onVersionPublished={() => {
              setVersionListState(current => ({ ...current, appId, hasPendingVersion: true }));
              setVersionListRefreshKey(current => current + 1);
            }}
          />
          <VersionList
            key={`${appId}-${versionListRefreshKey}`}
            appId={appId}
            onVersionsChange={handleVersionsChange}
          />
        </Page>
      ) : (
        <>
          <SandboxGuide
            actionTip={!deployed ? _l('请先部署沙盒环境') : null}
            actionSlot={
              <Button
                className="sandbox-guide-action"
                type="primary"
                loading={activation.initializing}
                disabled={!deployed}
                onClick={openSandbox}
              >
                {activation.initializing ? _l('正在初始化沙盒') : _l('开启沙盒')}
              </Button>
            }
          />
          <DataSyncSettingsModal
            open={activation.settingsVisible}
            appIds={[appId]}
            confirmDisabled={activation.confirming}
            confirmLoading={activation.confirming}
            onConfirm={activation.confirm}
            onCancel={activation.closeSettings}
          />
        </>
      )}
    </>
  );
}

AppSandbox.propTypes = {
  appId: PropTypes.string.isRequired,
  appName: PropTypes.string,
  projectId: PropTypes.string,
  sandboxStatus: PropTypes.number,
  sandboxRecordId: PropTypes.string,
  onChangeData: PropTypes.func.isRequired,
};
