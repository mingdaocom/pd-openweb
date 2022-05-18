import React, { useEffect, useState, Fragment } from 'react';
import { Drawer, Tabs } from 'antd';
import { Icon, LoadDiv, Support } from 'ming-ui';
import ActionLogs from './ActionLogs';
import BackupFiles from './BackupFiles';
import { pageGetBackupRestoreOperationLog, getValidBackupFileInfo } from 'src/api/appManagement';
import './less/manageBackupFilesDialog.less';

const { TabPane } = Tabs;
const PAGESIZE = 30;

export default function ManageBackupFilesDialog(props) {
  const { onClose, visible, fixed, appId, projectId, appName, manageBackupFilesKey } = props;
  const [currentTab, setCurrentTab] = useState('backupFiles');
  const [fileList, setFileList] = useState([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [actLogList, setActLogList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMore, setIsMore] = useState(false);
  const [validLimit, setValidLimit] = useState(0);
  const [currentValid, setCcurrentValid] = useState(0);
  const [countloading, setCountloading] = useState(true);

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
    getValidBackupFileInfo({ appId, projectId }).then(res => {
      setValidLimit(res.validLimit);
      setCcurrentValid(res.currentValid);
      setCountloading(false);
    });
  };

  const getList = pageIndex => {
    if (pageIndex > 1 && ((isLoading && isMore) || !isMore)) return;
    pageGetBackupRestoreOperationLog({
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
              <Support text={_l('帮助')} type={3} href="https://help.mingdao.com/backup.html" />
            </div>
            <Icon icon="close" className="Font20 Hand closeIcon Gray_9e" onClick={onClose} />
          </div>
          {!isLoading && !countloading && currentValid >= validLimit && (
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
      <Tabs defaultActiveKey="backupFiles" onChange={changeTabs} activeKey={currentTab}>
        <TabPane tab={_l('备份文件')} key="backupFiles">
          {isLoading ? (
            <LoadDiv />
          ) : (
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
        </TabPane>
        <TabPane tab={_l('操作日志')} key="actLogs">
          {isLoading ? (
            <LoadDiv />
          ) : (
            <ActionLogs
              actLogList={actLogList || []}
              pageIndex={pageIndex}
              setPageIndex={setPageIndex}
              getList={getList}
              isMore={isMore}
            />
          )}
        </TabPane>
      </Tabs>
    </Drawer>
  );
}
