import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { LoadDiv } from 'ming-ui';
import { Modal, Typography } from 'ming-ui/antd-components';
import DataSyncSettingsModal from 'src/components/AppSandbox/dataSync/DataSyncSettingsModal';
import { useSandboxProjectAccess } from 'src/components/AppSandbox/hooks/useSandboxAccess';
import { useSandboxDeployment } from 'src/components/AppSandbox/hooks/useSandboxDeployment';
import {
  getCloseSandboxAppDescription,
  getSandboxEnableDescription,
} from 'src/components/AppSandbox/sandboxDescriptions';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import TableEmpty from 'src/pages/Admin/common/TableEmpty';
import AppTransfer from 'src/pages/Admin/components/AppTransfer';
import { isSandboxSupportedProject } from 'src/utils/domain/app/sandbox';
import { VersionProductType } from 'src/utils/domain/shared/productFeatures';
import { SandboxPage, SandboxPageScroll } from '../components/SandboxPageLayout';
import SandboxAppList from './components/SandboxAppList';
import { AVAILABLE_APP_REQUEST_PARAMS } from './constants';
import { useBatchDisableSandboxApps, useBatchEnableSandboxApps } from './hooks/useSandboxAdmin';

const MAX_SANDBOX_APP_COUNT = 20;
const UNDEPLOYED_DETAIL = { icon: 'icon-worksheet_public', desc: _l('请先部署沙盒环境') };
const UNSUPPORTED_DETAIL = { icon: 'icon-worksheet_public', desc: _l('当前版本不支持沙盒功能') };

export default function AppSandbox({ match }) {
  const projectId = match?.params?.projectId;
  const sandboxSupported = isSandboxSupportedProject(projectId);
  const { checking: accessChecking, canAccess } = useSandboxProjectAccess(projectId);
  const { checking: deployChecking, deployed } = useSandboxDeployment(projectId);
  const { enabling: batchEnabling, batchEnable } = useBatchEnableSandboxApps(projectId);
  const { disabling: batchDisabling, batchDisable } = useBatchDisableSandboxApps(projectId);
  const openSandboxDisabled = deployChecking || !deployed || batchEnabling || batchDisabling;
  const [openSandboxVisible, setOpenSandboxVisible] = useState(false);
  const [selectedApps, setSelectedApps] = useState([]);
  const [sandboxSettingsVisible, setSandboxSettingsVisible] = useState(false);
  const [listRefreshKey, setListRefreshKey] = useState(0);
  const [closingAppIds, setClosingAppIds] = useState([]);
  const closeSandboxSuccessCallbackRef = useRef(null);

  const openSandbox = () => {
    if (!sandboxSupported) {
      buriedUpgradeVersionDialog(projectId, VersionProductType.appSandbox);
      return;
    }

    if (openSandboxDisabled) return;

    setSelectedApps([]);
    setOpenSandboxVisible(true);
  };

  const closeOpenSandbox = () => {
    setOpenSandboxVisible(false);
    setSelectedApps([]);
  };

  const closeSandboxSettings = () => {
    setSandboxSettingsVisible(false);
    setSelectedApps([]);
  };

  const confirmOpenSandbox = () => {
    if (selectedApps.length > MAX_SANDBOX_APP_COUNT) {
      alert(_l('选择的应用共%0个，已超过上限%1个，请重新选择', selectedApps.length, MAX_SANDBOX_APP_COUNT), 3);
      return;
    }

    setOpenSandboxVisible(false);
    setSandboxSettingsVisible(true);
  };

  const confirmSandboxSettings = sandboxSettingsList => {
    return batchEnable(sandboxSettingsList).then(success => {
      if (!success) return false;

      closeSandboxSettings();
      setListRefreshKey(key => key + 1);
      return true;
    });
  };

  const confirmCloseSandboxApps = () => {
    return batchDisable(closingAppIds).then(success => {
      if (!success) return false;

      closeSandboxSuccessCallbackRef.current?.();
      closeSandboxSuccessCallbackRef.current = null;
      setClosingAppIds([]);
      setListRefreshKey(key => key + 1);
      return true;
    });
  };

  const openCloseSandboxConfirm = (appIds, onSuccess) => {
    closeSandboxSuccessCallbackRef.current = onSuccess;
    setClosingAppIds(appIds);
  };

  const closeCloseSandboxConfirm = () => {
    if (batchDisabling) return;

    closeSandboxSuccessCallbackRef.current = null;
    setClosingAppIds([]);
  };

  return (
    <>
      <SandboxPageScroll>
        <SandboxPage className="orgManagementWrap">
          <AdminTitle prefix={_l('沙盒环境 - 应用沙盒')} />
          {accessChecking || (canAccess && deployChecking) ? (
            <LoadDiv className="mTop20" />
          ) : !canAccess ? (
            <TableEmpty className="w100 h100 pTop0" detail={UNSUPPORTED_DETAIL} />
          ) : !deployed ? (
            <>
              <div className="orgManagementHeader">
                <div className="tabBox">{_l('应用沙盒')}</div>
              </div>
              <TableEmpty className="w100 h100 pTop0" detail={UNDEPLOYED_DETAIL} />
            </>
          ) : (
            <SandboxAppList
              projectId={projectId}
              refreshKey={listRefreshKey}
              batchDisabling={batchDisabling}
              batchEnabling={batchEnabling}
              openSandboxDisabled={openSandboxDisabled}
              onCloseSandbox={openCloseSandboxConfirm}
              onOpenSandbox={openSandbox}
            />
          )}
        </SandboxPage>
      </SandboxPageScroll>

      <Modal
        open={openSandboxVisible}
        width={920}
        keyboard
        title={_l('开启沙盒')}
        cancelText={_l('取消')}
        okText={_l('确认')}
        okDisabled={!selectedApps.length}
        onOk={confirmOpenSandbox}
        onCancel={closeOpenSandbox}
      >
        <Typography.Paragraph type="secondary" className="Font12 mBottom16">
          {getSandboxEnableDescription()}
        </Typography.Paragraph>
        {openSandboxVisible && (
          <AppTransfer
            projectId={projectId}
            extraRequestParams={AVAILABLE_APP_REQUEST_PARAMS}
            value={selectedApps}
            maxCount={MAX_SANDBOX_APP_COUNT}
            onChange={setSelectedApps}
          />
        )}
      </Modal>

      <DataSyncSettingsModal
        open={sandboxSettingsVisible}
        appIds={selectedApps.map(app => app.appId)}
        confirmLoading={batchEnabling}
        onConfirm={confirmSandboxSettings}
        onCancel={closeSandboxSettings}
      />

      <Modal
        open={Boolean(closingAppIds.length)}
        keyboard
        focusable={{ focusTriggerAfterClose: false }}
        width={560}
        title={_l('关闭应用沙盒')}
        cancelText={_l('取消')}
        okText={_l('确认关闭')}
        confirmLoading={batchDisabling}
        onOk={confirmCloseSandboxApps}
        onCancel={closeCloseSandboxConfirm}
      >
        <div className="textPrimary">{getCloseSandboxAppDescription()}</div>
      </Modal>
    </>
  );
}

AppSandbox.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      projectId: PropTypes.string,
    }),
  }),
};
