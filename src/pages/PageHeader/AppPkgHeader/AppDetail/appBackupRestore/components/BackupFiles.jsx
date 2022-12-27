import React, { useState, Fragment, useEffect } from 'react';
import { ScrollView, Icon, Dialog } from 'ming-ui';
import { Dropdown, Menu } from 'antd';
import RestoreAppDialog from './RestoreAppDialog';
import '../less/manageBackupFilesDialog.less';
import EditInput from './EditInput.jsx';
import CreateAppBackupDialog from '../CreateAppBackupDialog';
import HomeApiController from 'api/homeApp';
import appManagementAjax from 'src/api/appManagement';
import styled from 'styled-components';
import { downloadFile } from 'src/util';
import _ from 'lodash';
import moment from 'moment';

const EmptyStatusWrap = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .con {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: #f5f5f5;
    text-align: center;
    .icon {
      font-size: 36px;
      color: #bdbdbd;
      line-height: 100px;
    }
  }
  .emptyTxt {
    margin-top: 12px;
    font-size: 15px;
    color: #bdbdbd;
  }
  .createBackupBtn {
    width: 107px;
    height: 36px;
    background: #2196f3;
    border-radius: 2px;
    color: #fff;
    margin-top: 24px;
    text-align: center;
    line-height: 36px;
  }
`;
export default function BackupFiles(props) {
  const { fixed, appId, projectId, getList = () => {}, pageIndex, isMore, currentValid, validLimit, appName } = props;
  const [actCurrentFileInfo, setActCurrentFileInfo] = useState({});
  const [restoreAppVisible, setRestoreAppVisible] = useState(false);
  const [appDetail, setAppDetail] = useState({});
  const [createBackupVisible, setCreateBackupVisible] = useState(false);
  const [fileList, setFileList] = useState(props.fileList);
  useEffect(() => {
    setFileList(props.fileList);
  }, [props.fileList]);
  const [token, setToken] = useState('');
  const noDueList =
    fileList.filter(
      item =>
        moment(item.operationDateTime).add(60, 'days').format('YYYYMMDDHHmmss') > moment().format('YYYYMMDDHHmmss'),
    ) || []; // 未过期
  const alreadyDueList =
    fileList.filter(
      item =>
        moment(item.operationDateTime).add(60, 'days').format('YYYYMMDDHHmmss') < moment().format('YYYYMMDDHHmmss'),
    ) || []; // 已过期

  // 获取token
  const getToken = () => {
    appManagementAjax.getApps({ appIds: [appId] }).then(({ token }) => {
      setToken(token);
    });
  };
  // 还原应用
  const restoreApp = item => {
    getToken();
    HomeApiController.getAppDetail({
      appId,
    }).then(res => {
      setAppDetail(res);
    });
    setActCurrentFileInfo(item);
    setRestoreAppVisible(true);
  };
  // 还原为新应用
  const restoreNewApp = item => {
    Dialog.confirm({
      className: 'restoreNewAppDialog',
      title: _l('还原为新应用'),
      description: _l('确定将备份文件“%0”还原为一个新的应用吗？', item.backupFileName),
      onOk: () => {
        let params = {
          projectId,
          appId,
          id: item.id,
          autoEndMaintain: false,
          backupCurrentVersion: false,
          isRestoreNew: true,
        };
        appManagementAjax.restore(params).then(res => {
          getList(1);
        });
      },
    });
  };
  // 下载备份
  const downloadBackup = item => {
    window.open(
      downloadFile(
        `${md.global.Config.AjaxApiUrl}Download/DownloadBackupFile?id=${item.id}&projectId=${projectId}&appId=${appId}`
      ),
    );
  };
  // 删除备份
  const deleteBackup = item => {
    Dialog.confirm({
      className: 'deleteBackupDialog',
      title: _l('删除备份'),
      description: _l('确定将备份文件“%0”删除吗？', item.backupFileName),
      onOk: () => {
        appManagementAjax.deleteBackupFile({
          id: item.id,
          projectId,
          appId,
          fileName: item.backupFileName,
        }).then(res => {
          if (res) {
            alert(_l('删除成功 '));
            getList(1);
            getBackupCount();
          } else {
            alert(_l('删除失败 '), 2);
          }
        });
      },
    });
  };

  // 下拉加载分页
  const onScrollEnd = _.throttle(() => {
    if (isMore) {
      getList(pageIndex + 1);
    }
  }, 200);

  const updateFileList = obj => {
    let temp = fileList.map(item => {
      if (item.id === obj.id) {
        return obj;
      }
      return item;
    });
    setFileList(temp);
  };
  return (
    <Fragment>
      {_.isEmpty(fileList) ? (
        <EmptyStatusWrap>
          <div className="con">
            <Icon icon="refresh" />
          </div>
          <div className="emptyTxt mTop12">{_l(' 暂无备份文件')}</div>
          <div className="createBackupBtn Hand" onClick={() => setCreateBackupVisible(true)}>
            {_l('创建备份')}
          </div>
        </EmptyStatusWrap>
      ) : (
        <ScrollView onScrollEnd={onScrollEnd} className="backupFilesWrap">
          {noDueList.map((item, index) => {
            return (
              <div className="filesCard">
                <div className="flexRow row">
                  <EditInput
                    actCurrentFileInfo={item}
                    projectId={projectId}
                    appId={appId}
                    updateFileList={updateFileList}
                  />
                  <Dropdown
                    trigger={['click']}
                    placement={['bottomRight']}
                    overlayClassName="moreActionDropdown"
                    overlay={
                      <Menu>
                        <Menu.Item
                          onClick={() => {
                            restoreApp(item);
                          }}
                        >
                          <Icon icon="update" className="mRight13" />
                          <span>{_l('还原应用')}</span>
                        </Menu.Item>
                        <Menu.Item onClick={() => restoreNewApp(item)}>
                          <Icon icon="update" className="mRight13" />
                          <span>{_l('还原为新应用')}</span>
                        </Menu.Item>
                        <Menu.Item onClick={() => downloadBackup(item)}>
                          <Icon icon="file_download" className="mRight13" />
                          <span>{_l('下载备份')}</span>
                        </Menu.Item>
                        <Menu.Item onClick={() => deleteBackup(item)}>
                          <Icon icon="delete2" className="mRight13" />
                          <span>{_l('删除备份')}</span>
                        </Menu.Item>
                      </Menu>
                    }
                  >
                    <Icon icon="more_horiz" className="Gray_9e Hand Font18 more_horiz" />
                  </Dropdown>
                </div>
                <div className="flexRow row">
                  <div className="name Gray_9e">{item.operatorName}</div>
                  <div className="date Gray_9e">{moment(item.operationDateTime).format('YYYY-MM-DD HH:mm:ss')}</div>
                </div>
              </div>
            );
          })}
          {alreadyDueList.map(item => {
            return (
              <div className="dueCard">
                <div className="flexRow row">
                  <div className="flex">{item.backupFileName}</div>
                  <div className="dueTxt">{_l('已过期')}</div>
                  <div className="deleteIcon">
                    <Icon
                      icon="delete2"
                      className="Hand"
                      onClick={() => {
                        deleteBackup(item);
                      }}
                    />
                  </div>
                </div>
                <div className="flexRow row">
                  <div className="name Gray_9e">{item.operatorName}</div>
                  <div className="date Gray_9e">{moment(item.operationDateTime).format('YYYY-MM-DD HH:mm:ss')}</div>
                </div>
              </div>
            );
          })}
        </ScrollView>
      )}
      <RestoreAppDialog
        fixed={fixed}
        onChangeFixStatus={props.onChangeFixStatus}
        appDetail={appDetail}
        visible={restoreAppVisible}
        actCurrentFileInfo={actCurrentFileInfo}
        projectId={projectId}
        appId={appId}
        onChangeStatus={props.onChangeStatus}
        token={token}
        changeRestoreAppVisible={() => {
          setRestoreAppVisible(false);
          props.onChangeFixStatus(false);
        }}
        getList={getList}
        getBackupCount={props.getBackupCount}
        currentValid={currentValid}
        validLimit={validLimit}
      />
      {createBackupVisible && (
        <CreateAppBackupDialog
          appId={appId}
          projectId={projectId}
          appName={appName}
          getList={getList}
          closeDialog={() => {
            setCreateBackupVisible(false);
          }}
        />
      )}
    </Fragment>
  );
}
