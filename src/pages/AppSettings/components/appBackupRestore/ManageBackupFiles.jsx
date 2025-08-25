import React, { useEffect, useState } from 'react';
import { Drawer } from 'antd';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Icon, Tooltip, UpgradeIcon } from 'ming-ui';
import appManagementAjax from 'src/api/appManagement';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
import AppSettingHeader from '../AppSettingHeader';
import ActionLogs from './components/ActionLogs';
import BackupFiles from './components/BackupFiles';
import backupFromFiles from './components/BackupFromFiles';
import RegularBackup from './components/RegularBackup';
import CreateAppBackupDialog from './CreateAppBackupDialog';
import { cycleWeekText } from './enum';
import './less/manageBackupFiles.less';

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
const Refresh = styled.span`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  text-align: center;
  color: #9e9e9e;
  padding-top: 3px;
  box-sizing: border-box;
  margin-right: 30px;
  margin-left: 10px;
  cursor: pointer;
  &:hover {
    background-color: #f5f5f5;
    color: #1677ff;
  }
`;
const ActionWrap = styled.div`
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
      color: #1677ff;
      .icon {
        color: #1677ff;
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
  const [backupInfo, setBackupInfo] = useState({ isLoading: false, fileList: [], pageIndex: 1 });
  const [backupTask, setBackupTask] = useState({});
  const [popupVisible, setPopupVisible] = useState(false);
  const [backupTaskText, setBackupTaskText] = useState();
  const { isLoading, fileList } = backupInfo;
  const featureType = getFeatureStatus(projectId, VersionProductType.regularBackup);

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

  const getBackupCount = () => {
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
  };

  // 获取备份定时任务
  const getBackupTask = () => {
    appManagementAjax.getBackupTask({ appId }).then(res => {
      const data = res.status === 1 ? res : { status: 0 };
      setBackupTask(data);
      handleUpdateBackupTxt(data);
    });
  };

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

  const handleUpdateBackupTxt = (data = {}) => {
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
  };

  useEffect(() => {
    if (!appId) return;
    getList();
    getBackupCount();
    getBackupTask();
  }, [appId]);

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
        extraTitleElement={
          <Refresh
            onClick={() => {
              setBackupInfo({ ...backupInfo, pageIndex: 1 });
              getList({ pageIndex: 1, orderType: 0 });
            }}
          >
            <Icon icon="refresh1" className="Font18" />
          </Refresh>
        }
        extraElement={
          <ActionWrap className="flexRow alignItemsCenter">
            {featureType && !_.isEmpty(backupTask) && (
              <div className="mRight16">
                <Trigger
                  action={['click']}
                  popupVisible={popupVisible}
                  popup={
                    <RegularBackup
                      appId={appId}
                      backupTask={backupTask}
                      popupVisible={popupVisible}
                      editBackupTaskInfo={editBackupTaskInfo}
                      updatePopupVisibleChange={visible => setPopupVisible(visible)}
                    />
                  }
                  popupAlign={{
                    points: ['tr', 'br'],
                    offset: [0, 10],
                    overflow: { adjustX: true, adjustY: true },
                  }}
                >
                  <span
                    className="mLeft5 Hand ThemeColor"
                    onClick={() => {
                      if (featureType === '2') {
                        buriedUpgradeVersionDialog(projectId, VersionProductType.regularBackup);
                        return;
                      }
                      setPopupVisible(true);
                    }}
                  >
                    {backupTaskText ? _l('定期备份') + '（' + backupTaskText + '）' : _l('设置定期备份')}
                  </span>
                </Trigger>
                {backupTask.status === 1 && (
                  <Tooltip text={_l('凌晨时段自动执行备份')}>
                    <i className="icon icon-info_outline Gray_9e Font16 Hand" />
                  </Tooltip>
                )}
                {featureType === '2' && <UpgradeIcon />}
              </div>
            )}
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
