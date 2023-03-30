import React, { useEffect, useState, Fragment } from 'react';
import { Drawer } from 'antd';
import { Icon, LoadDiv, Support } from 'ming-ui';
import ActionLogs from './components/ActionLogs';
import BackupFiles from './components/BackupFiles';
import appManagementAjax from 'src/api/appManagement';
import './less/manageBackupFilesDialog.less';
import cx from 'classnames';
import _ from 'lodash';

const PAGESIZE = 30;

const tabInfos = [
  { label: _l('备份文件'), value: 'backupFiles' },
  { label: _l('操作日志'), value: 'actLogs' },
];

export default function ManageBackupFilesDialog(props) {
  const { onClose, visible, fixed, appId, projectId, appName, manageBackupFilesKey } = props;
  const [currentTab, setCurrentTab] = useState('backupFiles');
  const [fileList, setFileList] = useState([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [actLogList, setActLogList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMore, setIsMore] = useState(false);
  const [validLimit, setValidLimit] = useState(0);
  const [currentValid, setCurrentValid] = useState(0);
  const [countLoading, setCountLoading] = useState(true);

  useEffect(() => {
    if (!appId) return;
    getList(1);
  }, [currentTab, appId, manageBackupFilesKey]);

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
    appManagementAjax.pageGetBackupRestoreOperationLog({
      pageIndex: pageIndex || 1,
      pageSize: PAGESIZE,
      projectId,
      appId,
      isBackup: currentTab === 'backupFiles' ? true : false,
    }).then(res => {
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
    <Drawer
      title={
        <Fragment>
          <div className="headerInfo">
            <div className="title">{_l('管理备份文件')}</div>
            <div className="subTitle">
              {_l('每个应用最多创建10个备份文件，每个文件仅保留60天有效期')}
              <Support text={_l('帮助')} type={3} href="https://help.mingdao.com/zh/backup.html" />
            </div>
            <Icon icon="close" className="Font20 Hand closeIcon Gray_9e" onClick={onClose} />
          </div>
          {!isLoading && !countLoading && currentValid >= validLimit && (
            <div className="limitMax">
              <Icon icon="info" className="mRight8" />
              {_l('该应用已备份文件数达到上限%0个，删除一些备份文件后方可再次备份', validLimit)}
            </div>
          )}
        </Fragment>
      }
      className="manageBackupFilesDrawer"
      width={480}
      closable={false}
      placement="right"
      onClose={onClose}
      visible={visible}
      maskStyle={{ background: 'rgba(0, 0, 0, 0.7) ' }}
    >
      <div className="manageBackupFilesWrap flexColumn ">
        <div className="headerInfo">
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
              onChangeFixStatus={props.onChangeFixStatus}
              projectId={projectId}
              appId={appId}
              onChangeStatus={props.onChangeStatus}
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
      </div>
    </Drawer>
  );
}
