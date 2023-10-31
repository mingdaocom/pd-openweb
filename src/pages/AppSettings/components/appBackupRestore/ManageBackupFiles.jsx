import React, { useEffect, useState, Fragment } from 'react';
import { Icon, LoadDiv, Support, Button } from 'ming-ui';
import ActionLogs from './components/ActionLogs';
import BackupFiles from './components/BackupFiles';
import CreateAppBackupDialog from './CreateAppBackupDialog';
import appManagementAjax from 'src/api/appManagement';
import './less/manageBackupFiles.less';
import cx from 'classnames';
import _ from 'lodash';

const PAGESIZE = 30;

const tabInfos = [
  { label: _l('备份文件'), value: 'backupFiles' },
  { label: _l('操作日志'), value: 'actLogs' },
];

export default function ManageBackupFiles(props) {
  const { fixed, appId, projectId, appName, permissionType, data } = props;
  const [currentTab, setCurrentTab] = useState('backupFiles');
  const [fileList, setFileList] = useState([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [actLogList, setActLogList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMore, setIsMore] = useState(false);
  const [validLimit, setValidLimit] = useState(0);
  const [currentValid, setCurrentValid] = useState(0);
  const [countLoading, setCountLoading] = useState(true);
  const [createBackupVisisble, setCreateBackUpVisible] = useState(false);

  useEffect(() => {
    if (!appId) return;
    getList(1);
  }, [currentTab, appId]);

  useEffect(() => {
    if (!appId) return;
    getBackupCount();
  }, [appId]);

  const changeTabs = tab => {
    setCurrentTab(tab);
    setIsLoading(true);
  };

  const getBackupCount = () => {
    appManagementAjax.getValidBackupFileInfo({ appId, projectId }).then(res => {
      setValidLimit(res.validLimit);
      setCurrentValid(res.currentValid);
      setCountLoading(false);
    });
  };

  const getList = pageIndex => {
    if (pageIndex > 1 && ((isLoading && isMore) || !isMore)) return;
    appManagementAjax
      .pageGetBackupRestoreOperationLog({
        pageIndex: pageIndex || 1,
        pageSize: PAGESIZE,
        projectId,
        appId,
        isBackup: currentTab === 'backupFiles' ? true : false,
      })
      .then(res => {
        setIsLoading(false);
        let list = pageIndex === 1 ? res : currentTab === 'backupFiles' ? fileList.concat(res) : actLogList.concat(res);
        if (currentTab === 'backupFiles') {
          setFileList(list);
        } else {
          setActLogList(list);
        }
        setIsMore(_.isArray(res) && res.length === PAGESIZE);
        setPageIndex(pageIndex);
      });
  };
  return (
    <div className="manageBackupFilesWrap flexColumn">
      <div className="flexRow backupRestoreHeader">
        <div>
          <span className="Font17 bold">{_l('备份与还原')}</span>
          <div className="mTop8">
            <span className="Gray_9e TxtMiddle"> {_l('每个应用最多创建10个备份文件，每个文件仅保留60天有效期')}</span>{' '}
            <Support text={_l('帮助')} type={3} href="https://help.mingdao.com/backup" />
          </div>
        </div>
        <Button
          className="pLeft20 pRight20"
          style={{ height: 36 }}
          radius
          type="primary"
          onClick={() => setCreateBackUpVisible(true)}
        >
          <Icon icon="plus" /> {_l('应用备份')}
        </Button>
      </div>

      <div className="tabWrap">
        {tabInfos.map(item => (
          <div
            className={cx('tabItem Hand', { active: item.value === currentTab })}
            onClick={() => {
              changeTabs(item.value);
            }}
          >
            {item.label}
          </div>
        ))}
      </div>
      <div className="listWrap flex">
        {isLoading && <LoadDiv className="mTop15" />}
        {!isLoading && currentTab === 'backupFiles' && (
          <BackupFiles
            fixed={fixed}
            fixRemark={data.fixRemark}
            permissionType={permissionType}
            projectId={projectId}
            appId={appId}
            fileList={fileList}
            getList={getList}
            isMore={isMore}
            pageIndex={pageIndex}
            appName={appName}
            getBackupCount={getBackupCount}
            validLimit={validLimit}
            currentValid={currentValid}
          />
        )}
        {!isLoading && currentTab === 'actLogs' && (
          <ActionLogs
            actLogList={actLogList || []}
            pageIndex={pageIndex}
            setPageIndex={setPageIndex}
            getList={getList}
            isMore={isMore}
          />
        )}
      </div>
      {createBackupVisisble && (
        <CreateAppBackupDialog
          projectId={projectId}
          appId={appId}
          appName={appName}
          getList={getList}
          openManageBackupDrawer={() => setCreateBackUpVisible(true)}
          closeDialog={() => setCreateBackUpVisible(false)}
        />
      )}
    </div>
  );
}
