import React, { useCallback, useEffect, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, UpgradeIcon } from 'ming-ui';
import { Button, Drawer, Tooltip } from 'ming-ui/antd-components';
import appManagementAjax from 'src/api/appManagement';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { isAppSandboxInProduction } from 'src/utils/domain/app/sandbox';
import { VersionProductType } from 'src/utils/domain/shared/productFeatures';
import { getFeatureStatus } from 'src/utils/services/project';
import AppSettingHeader from '../AppSettingHeader';
import ActionLogs from './components/ActionLogs';
import BackupFiles from './components/BackupFiles';
import { useBackupFromFiles } from './components/BackupFromFiles';
import openRegularBackupModal from './components/RegularBackup';
import CreateAppBackupDialog from './CreateAppBackupDialog';
import { cycleWeekText } from './enum';
import './less/manageBackupFiles.less';

const DrawerWrap = styled(({ className, rootClassName, width, height, size, ...props }) => (
  <Drawer
    rootClassName={[className, rootClassName].filter(Boolean).join(' ') || undefined}
    size={size ?? width ?? height}
    {...props}
  />
))`
  .hap-drawer-content-wrapper {
    width: 500px !important;
  }
  .hap-drawer-wrapper-body,
  .hap-drawer-body {
    padding: 0;
  }
  .hap-drawer-body {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
`;

export default function ManageBackupFiles(props) {
  const { appId, projectId, appName, permissionType, data, sandboxStatus } = props;
  const [validLimit, setValidLimit] = useState(0);
  const [currentValid, setCurrentValid] = useState(0);
  const [createBackupVisible, setCreateBackUpVisible] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [countLoading, setCountLoading] = useState(true);
  const [backupInfo, setBackupInfo] = useState({ isLoading: true, fileList: [], pageIndex: 1 });
  const [backupTask, setBackupTask] = useState({});
  const [backupTaskText, setBackupTaskText] = useState();
  const { open: openBackupFromFiles, holder: backupFromFilesHolder } = useBackupFromFiles();
  const { isLoading } = backupInfo;
  const featureType = getFeatureStatus(projectId, VersionProductType.regularBackup);
  const readonly = isAppSandboxInProduction(sandboxStatus);

  const requestList = useCallback(
    ({ pageIndex = 1, ...rest } = {}) =>
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
          setBackupInfo(currentBackupInfo => ({
            isLoading: false,
            fileList: pageIndex === 1 ? list : currentBackupInfo.fileList.concat(list),
            pageIndex,
            total,
          }));
        })
        .catch(() => {
          setBackupInfo(currentBackupInfo => ({ ...currentBackupInfo, isLoading: false }));
        }),
    [appId, projectId],
  );

  const getList = useCallback(
    ({ pageIndex = 1, ...rest } = {}) => {
      if (isLoading) return;
      setBackupInfo(currentBackupInfo => ({ ...currentBackupInfo, isLoading: true }));
      requestList({ pageIndex, ...rest });
    },
    [isLoading, requestList],
  );

  const getBackupCount = useCallback(() => {
    appManagementAjax
      .getValidBackupFileInfo({ appId, projectId })
      .then(res => {
        setValidLimit(res.validLimit);
        setCurrentValid(res.currentValid);
        setCountLoading(false);
      })
      .catch(() => {
        setCountLoading(false);
      });
  }, [appId, projectId]);

  const handleUpdateBackupTxt = useCallback((data = {}) => {
    if (data.status === 0) {
      setBackupTaskText('');
      return;
    }

    let text = '';

    switch (data.cycleType) {
      case 1:
        // 每天
        text = _l('每天');
        break;
      case 2:
        // 每周
        text = cycleWeekText[data.cycleValue] || _l('每周一');
        break;
      case 3:
        // 每月
        text = _l(`每月%0日`, data.cycleValue);
        break;
      default:
    }

    setBackupTaskText(text);
  }, []);

  // 获取备份定时任务
  const getBackupTask = useCallback(() => {
    appManagementAjax.getBackupTask({ appId }).then(res => {
      const data = res.status === 1 ? res : { status: 0 };
      setBackupTask(data);
      handleUpdateBackupTxt(data);
    });
  }, [appId, handleUpdateBackupTxt]);

  // 编辑备份定时任务
  const editBackupTaskInfo = (params = {}) => {
    appManagementAjax
      .editBackupTaskInfo({
        appId,
        cycleType: params.cycleType,
        cycleValue: params.cycleValue || 1,
        datum: params.datum,
        status: params.status,
      })
      .then(res => {
        if (res) {
          const newData = params.status === 1 ? { ...backupTask, ...params } : { status: 0 };
          setBackupTask(newData);
          handleUpdateBackupTxt(newData);

          const alertText =
            backupTask.status === 1 && params.status === 1
              ? _l('定期备份已更新')
              : params.status === 1
                ? _l('定期备份已开启')
                : params.status === 0
                  ? _l('定期备份已关闭')
                  : '';

          alert(alertText);
        } else {
          alert(_l('定期备份失败'));
        }
      });
  };

  useEffect(() => {
    if (!appId) return;
    requestList();
    getBackupCount();
    getBackupTask();
  }, [appId, getBackupCount, getBackupTask, requestList]);

  return (
    <div className="manageBackupFilesWrap flexColumn">
      {backupFromFilesHolder}
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
        extraTitleElement={
          <Button
            className="mLeft10 mRight30"
            color="default"
            variant="text"
            size="small"
            icon={<Icon icon="refresh1" />}
            onClick={() => {
              getList({ pageIndex: 1, orderType: 0 });
            }}
          />
        }
        extraElement={
          <div className="flexRow alignItemsCenter">
            {featureType && !_.isEmpty(backupTask) && (
              <div className="flexRow alignItemsCenter mRight16">
                <Button
                  color="primary"
                  variant="text"
                  size="small"
                  onClick={() => {
                    if (featureType === '2') {
                      buriedUpgradeVersionDialog(projectId, VersionProductType.regularBackup);
                      return;
                    }

                    openRegularBackupModal({ backupTask, editBackupTaskInfo });
                  }}
                >
                  {backupTaskText ? _l('定期备份') + '（' + backupTaskText + '）' : _l('设置定期备份')}
                  {featureType === '2' && <UpgradeIcon />}
                </Button>
                {backupTask.status === 1 && (
                  <Tooltip title={_l('凌晨时段自动执行备份')}>
                    <i className="icon icon-info_outline textTertiary Font16 Hand" />
                  </Tooltip>
                )}
              </div>
            )}
            {!readonly && (
              <Button
                className="mRight16"
                color="default"
                variant="text"
                size="small"
                icon={<Icon icon="upload_file" />}
                onClick={() => {
                  openBackupFromFiles({ appId, projectId, validLimit, getBackupCount });
                }}
              >
                {_l('从文件还原')}
              </Button>
            )}
            <Button
              color="default"
              variant="text"
              size="small"
              icon={<Icon icon="wysiwyg" />}
              onClick={() => setShowLog(true)}
            >
              {_l('日志')}
            </Button>
          </div>
        }
        handleAdd={() => setCreateBackUpVisible(true)}
      />

      <BackupFiles
        backupInfo={backupInfo}
        readonly={readonly}
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

      {showLog && (
        <DrawerWrap
          title={_l('操作日志')}
          onClose={() => setShowLog(false)}
          open={showLog}
          styles={{ header: { display: 'none' } }}
        >
          <ActionLogs projectId={projectId} appId={appId} onClose={() => setShowLog(false)} />
        </DrawerWrap>
      )}
    </div>
  );
}
