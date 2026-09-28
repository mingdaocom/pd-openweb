import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import { Modal, Typography } from 'ming-ui/antd-components';
import appManagementAjax from 'src/api/appManagement';
import appSandboxAjax from 'src/api/appSandbox';
import { getSandboxEnableDescription } from 'src/components/AppSandbox/sandboxDescriptions';
import {
  getSandboxDataExistingAppIds,
  isDataSyncSettingsDisabled,
  normalizeSandboxAppSettings,
} from 'src/utils/domain/app/sandbox';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import DataSyncSettings from './DataSyncSettings';

const MODAL_STYLES = {
  container: {
    maxHeight: 'calc(100vh - 64px)',
    overflow: 'hidden',
  },
};

const SettingsHeader = styled.div`
  display: flex;
  width: 100%;
  margin: 24px 0 14px;
  color: var(--color-text-secondary);
  font-weight: 600;

  .appColumn {
    width: 40%;
  }

  .dataColumn {
    width: 60%;
  }
`;

const SettingsScroll = styled.div`
  max-height: calc(100vh - 320px);
  margin: 0 -24px;
  padding: 0 24px;
  overflow-x: hidden;
  overflow-y: auto;
`;

export default function DataSyncSettingsModal({
  open,
  appIds = [],
  confirmDisabled,
  confirmLoading = false,
  onConfirm,
  onCancel,
}) {
  const [settingsList, setSettingsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const requestRef = useRef(null);
  const appIdsKey = appIds.join(',');

  useEffect(() => {
    if (!open || !appIdsKey) return;

    const currentAppIds = appIdsKey.split(',');
    const appsRequest = appManagementAjax.getApps({ appIds: currentAppIds });
    const dataExistsRequest = appSandboxAjax.checkAppDataExists({ appIds: currentAppIds }, { silent: true });
    const requests = [appsRequest, dataExistsRequest];

    requestRef.current = requests;

    Promise.all(requests)
      .then(([{ data = [] }, dataExistsResult]) => {
        if (requestRef.current !== requests) return;

        requestRef.current = null;
        setSettingsList(
          normalizeSandboxAppSettings(data, getSandboxDataExistingAppIds(dataExistsResult, currentAppIds)),
        );
        setLoading(false);
      })
      .catch(_requestError => {
        if (requestRef.current !== requests) return;

        requestRef.current = null;
        setLoading(false);
        alertIfNotUnauthorized(_requestError, _l('获取应用数据失败'), 2);
      });

    return () => {
      if (requestRef.current !== requests) return;

      requestRef.current = null;
      requests.forEach(request => request?.abort?.());
    };
  }, [appIdsKey, open]);

  const close = () => {
    if (confirmLoading) return;

    const requests = requestRef.current;
    requestRef.current = null;
    requests?.forEach(request => request?.abort?.());
    setSettingsList([]);
    setLoading(true);
    onCancel();
  };

  const confirm = () => {
    return Promise.resolve(onConfirm(settingsList)).then(success => {
      if (success) {
        setSettingsList([]);
        setLoading(true);
      }

      return success;
    });
  };

  return (
    <Modal
      open={open}
      width={920}
      styles={MODAL_STYLES}
      keyboard
      title={_l('开启沙盒')}
      cancelText={_l('取消')}
      okText={_l('确认')}
      confirmLoading={confirmLoading}
      okDisabled={loading || confirmDisabled || !settingsList.length || isDataSyncSettingsDisabled(settingsList)}
      onOk={confirm}
      onCancel={close}
    >
      <Typography.Paragraph type="secondary" className="Font12 mBottom16">
        {getSandboxEnableDescription()}
      </Typography.Paragraph>
      <SettingsHeader>
        <div className="appColumn">{_l('应用')}</div>
        <div className="dataColumn">{_l('数据同步策略')}</div>
      </SettingsHeader>
      <SettingsScroll>
        {loading ? (
          <LoadDiv className="mTop40 mBottom40" />
        ) : (
          <DataSyncSettings list={settingsList} onChange={setSettingsList} />
        )}
      </SettingsScroll>
    </Modal>
  );
}

DataSyncSettingsModal.propTypes = {
  open: PropTypes.bool,
  appIds: PropTypes.arrayOf(PropTypes.string),
  confirmDisabled: PropTypes.bool,
  confirmLoading: PropTypes.bool,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
