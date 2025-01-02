import React, { useEffect, useState } from 'react';
import { Icon } from 'ming-ui';
import { Drawer } from 'antd';
import ActionLogs from './components/ActionLogs';
import BackupFiles from './components/BackupFiles';
import CreateAppBackupDialog from './CreateAppBackupDialog';
import backupFromFiles from './components/BackupFromFiles';
import AppSettingHeader from '../AppSettingHeader';
import appManagementAjax from 'src/api/appManagement';
import './less/manageBackupFiles.less';
import styled from 'styled-components';
import _ from 'lodash';

const DrawerWrap = styled(Drawer)`
  .ant-drawer-content-wrapper {
    width: 500px !important;
  }
  .ant-drawer-wrapper-body,
  .ant-drawer-body {
    padding: 0;
  }
  .ant-drawer-body {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
`;

const ActionWrap = styled.div`
  .refresh {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    text-align: center;
    color: #9e9e9e;
    padding-top: 3px;
    box-sizing: border-box;
    margin-right: 30px;
    &:hover {
      background-color: #f5f5f5;
      color: #2196f3;
    }
  }
  .act {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #757575;
    cursor: pointer;
    .icon {
      color: #9e9e9e;
      font-size: 18px;
    }
    &:hover {
      color: #2196f3;
      .icon {
        color: #2196f3;
      }
    }
  }
`;

export default function ManageBackupFiles(props) {
  const { appId, projectId, appName, permissionType, data } = props;
  const [validLimit, setValidLimit] = useState(0);
  const [currentValid, setCurrentValid] = useState(0);
  const [createBackupVisible, setCreateBackUpVisible] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [showBackupFromFiles, setShowBackupFromFiles] = useState(false);
  const [countLoading, setCountLoading] = useState(true);
  const [backupInfo, setBackupInfo] = useState({
    isLoading: false,
    fileList: [],
    pageIndex: 1,
  });
  const { isLoading, fileList } = backupInfo;

  const getList = ({ pageIndex = 1, ...rest } = {}) => {
    if (isLoading) return;
    setBackupInfo({ ...backupInfo, isLoading: true });
    appManagementAjax
      .pageGetBackupRestoreOperationLog({
        pageIndex: pageIndex,
        pageSize: 50,
        projectId,
        appId,
        isBackup: true,
        orderType: rest.orderType || 0,
        ...rest,
      })
      .then(({ list = [], total }) => {
        let temp = pageIndex === 1 ? list : fileList.concat(list);
        setBackupInfo({
          isLoading: false,
          fileList: temp,
          pageIndex,
          total,
        });
      });
  };

  useEffect(() => {
    if (!appId) return;
    getList();
    getBackupCount();
  }, [appId]);

  const getBackupCount = () => {
    appManagementAjax
      .getValidBackupFileInfo({ appId, projectId })
      .then(res => {
        setValidLimit(res.validLimit);
        setCurrentValid(res.currentValid);
        setCountLoading(false);
      })
      .catch(err => {
        setCountLoading(false);
      });
  };

  return (
    <div className="manageBackupFilesWrap flexColumn">
      <AppSettingHeader
        title={_l('备份与还原')}
        addBtnName={_l('备份')}
        description={
          countLoading
            ? ''
            : validLimit === -1
            ? _l('支持仅备份应用或者备份应用和数据，备份后的文件可以下载保存')
            : _l('每个应用最多创建10个备份文件，每个文件仅保留60天有效期。')
        }
        link="https://help.mingdao.com/application/backup-restore"
        extraElement={
          <ActionWrap className="flexRow alignItemsCenter">
            <div
              className="refresh"
              onClick={() => {
                setBackupInfo({ ...backupInfo, pageIndex: 1 });
                getList({ pageIndex: 1, orderType: 0 });
              }}
            >
              <Icon icon="refresh1" className="Font18" />
            </div>

            <div
              className="act mRight16"
              onClick={() => {
                backupFromFiles({ appId, projectId, validLimit, getBackupCount });
              }}
            >
              <Icon icon="upload_file" className="mRight5" />
              <span> {_l('从文件还原')}</span>
            </div>
            <div className="act" onClick={() => setShowLog(true)}>
              <Icon icon="wysiwyg" className="mRight5" />
              <span>{_l('日志')}</span>
            </div>
          </ActionWrap>
        }
        handleAdd={() => setCreateBackUpVisible(true)}
      />

      <BackupFiles
        backupInfo={backupInfo}
        permissionType={permissionType}
        projectId={projectId}
        appId={appId}
        appName={appName}
        data={data}
        validLimit={validLimit}
        currentValid={currentValid}
        getList={getList}
        getBackupCount={getBackupCount}
        handleCreateBackup={() => setCreateBackUpVisible(true)}
      />

      {createBackupVisible && (
        <CreateAppBackupDialog
          projectId={projectId}
          appId={appId}
          appName={appName}
          data={data}
          validLimit={validLimit}
          openManageBackupDrawer={() => setCreateBackUpVisible(true)}
          closeDialog={() => setCreateBackUpVisible(false)}
          getList={getList}
        />
      )}

      {showBackupFromFiles && (
        <BackupFromFiles
          visible={showBackupFromFiles}
          projectId={projectId}
          appId={appId}
          appName={appName}
          onCancel={() => setShowBackupFromFiles(false)}
        />
      )}

      {showLog && (
        <DrawerWrap
          title={_l('操作日志')}
          onClose={() => setShowLog(false)}
          visible={showLog}
          headerStyle={{ display: 'none' }}
        >
          <ActionLogs projectId={projectId} appId={appId} onClose={() => setShowLog(false)} />
        </DrawerWrap>
      )}
    </div>
  );
}
