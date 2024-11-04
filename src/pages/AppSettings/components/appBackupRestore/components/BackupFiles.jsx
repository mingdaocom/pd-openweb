import React, { Fragment, useEffect } from 'react';
import { ScrollView, Icon, Dialog, Tooltip, LoadDiv, Menu, MenuItem, Support } from 'ming-ui';
import { Dropdown } from 'antd';
import { useSetState } from 'react-use';
import RestoreAppDialog from './RestoreAppDialog';
import EmptyStatus from '../../EmptyStatus';
import EditInput from './EditInput.jsx';
import HomeApiController from 'api/homeApp';
import appManagementAjax from 'src/api/appManagement';
import styled from 'styled-components';
import { downloadFile, getCurrentProject, getFeatureStatus, dateConvertToUserZone } from 'src/util';
import _ from 'lodash';
import cx from 'classnames';
import moment from 'moment';
import { APP_ROLE_TYPE } from 'src/pages/worksheet/constants/enum.js';
import SelectDBInstance from 'src/pages/AppHomepage/AppCenter/components/SelectDBInstance';
import { VersionProductType } from 'src/util/enum';
import { checkPermission } from 'src/components/checkPermission';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';

const ListWrap = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  .name,
  .backupType,
  .backupTime,
  .operator,
  .size,
  .status,
  .action {
    padding-left: 10px;
  }
  .backupType,
  .operator,
  .status {
    width: 90px;
  }
  .size,
  .action {
    width: 130px;
  }
  .backupTime {
    width: 160px;
  }
  .header,
  .row {
    border-bottom: 1px solid #dddddd;
    .actionContent {
      display: none;
    }
    .icon-edit {
      display: none !important;
    }
    .order {
      transform: scale(0.8);
      margin-left: 4px;
    }
  }
  .header {
    height: 40px;
  }
  .row {
    height: 60px;
    &:hover {
      background: #f5f5f5;
      .actionContent {
        display: block;
      }
      .icon-edit {
        display: inline-block !important;
      }
    }
    .warningColor {
      color: #ff9a2d;
    }
  }
`;

const DataDBInstances = [{ label: _l('系统默认数据库'), value: '' }];

export default function BackupFiles(props) {
  const { appId, projectId, currentValid, validLimit, permissionType, backupInfo = {}, getList = () => {} } = props;

  const [
    {
      isLoading,
      fileList,
      pageIndex,
      total,
      orderType,
      actCurrentFileInfo,
      restoreAppVisible,
      appDetail,
      token,
      DBInstancesDialog,
      dataDBInstances,
      restoreItem,
      dbInstanceId,
    },
    setData,
  ] = useSetState({
    isLoading: true,
    fileList: [],
    pageIndex: 1,
    total: 0,
    orderType: 0,
    actCurrentFileInfo,
    restoreAppVisible,
    appDetail,
    token,
    DBInstancesDialog,
    dataDBInstances,
    restoreItem,
    dbInstanceId: undefined,
  });

  useEffect(() => {
    setData(backupInfo);
  }, [backupInfo]);

  // 获取token
  const getToken = () => {
    appManagementAjax.getApps({ appIds: [appId] }).then(({ token }) => {
      setData({ token });
    });
  };
  // 还原应用
  const restoreApp = item => {
    getToken();
    HomeApiController.getApp({
      appId,
    }).then(res => {
      setData({ appDetail: res });
    });
    setData({
      actCurrentFileInfo: item,
      restoreAppVisible: true,
    });
  };

  const onRestore = (it, dbInstanceId) => {
    const item = it || restoreItem;

    let params = {
      projectId,
      appId,
      id: item.id,
      autoEndMaintain: false,
      backupCurrentVersion: false,
      isRestoreNew: true,
      dbInstanceId,
    };
    appManagementAjax.restore(params).then(res => {
      if (res) {
        getList({ pageIndex: 1 });
      } else {
        alert(_l('还原失败'), 2);
      }
    });
  };

  // 还原为新应用
  const restoreNewApp = item => {
    Dialog.confirm({
      width: 500,
      className: 'restoreNewAppDialog',
      title: _l('还原为新应用'),
      description: (
        <Fragment>
          <div className="mBottom10">{_l('确定将备份文件“%0”还原为一个新的应用吗？', item.backupFileName)}</div>
          <div className="Red">{_l('注意：还原为新应用并不会还原数据')}</div>
        </Fragment>
      ),
      onOk: () => {
        const hasDataBase =
          getFeatureStatus(projectId, VersionProductType.dataBase) === '1' && !md.global.Config.IsPlatformLocal;
        const hasAppResourceAuth = checkPermission(projectId, PERMISSION_ENUM.APP_RESOURCE_SERVICE);

        if (hasDataBase && hasAppResourceAuth) {
          HomeApiController.getMyDbInstances({ projectId }).then(res => {
            const list = res.map(l => {
              return {
                label: l.name,
                value: l.id,
              };
            });
            if (res && res.length) {
              setData({
                dataDBInstances: DataDBInstances.concat(list),
                DBInstancesDialog: true,
                restoreItem: item,
              });
            } else {
              onRestore(item);
            }
          });
          return;
        }
        onRestore(item);
      },
    });
  };

  // 下载备份（应用）
  const downloadBackup = item => {
    window.open(
      downloadFile(
        `${md.global.Config.AjaxApiUrl}Download/DownloadBackupFile?id=${item.id}&projectId=${projectId}&appId=${appId}`,
      ),
    );
  };

  // 下载备份（数据）
  const downloadData = item => {
    const { dataStatus, id } = item;
    if (dataStatus !== 1) return;

    window.open(
      downloadFile(
        `${md.global.Config.AjaxApiUrl}Download/DownloadBackupDataFile?id=${id}&projectId=${projectId}&appId=${appId}`,
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
        appManagementAjax
          .deleteBackupFile({
            id: item.id,
            projectId,
            appId,
            fileName: item.backupFileName,
          })
          .then(res => {
            if (res) {
              alert(_l('删除成功 '));
              getList({ pageIndex: 1 });
            } else {
              alert(_l('删除失败 '), 2);
            }
          });
      },
    });
  };

  // 下拉加载分页
  const onScrollEnd = () => {
    if (!isLoading && fileList.length < total) {
      getList({ pageIndex: pageIndex + 1 });
    }
  };

  const updateFileList = obj => {
    let temp = fileList.map(item => {
      if (item.id === obj.id) {
        return obj;
      }
      return item;
    });
    setData({ fileList: temp });
  };

  const canCreateApp = !Object.assign({ cannotCreateApp: true }, getCurrentProject(projectId)).cannotCreateApp;

  if (isLoading && pageIndex === 1) {
    return <LoadDiv className="mTop15" />;
  }

  return (
    <Fragment>
      {_.isEmpty(fileList) ? (
        <EmptyStatus
          icon="cloud_sync"
          radiusSize={130}
          iconClassName="Font50"
          emptyTxt={_l('暂无备份文件')}
          emptyTxtClassName="Gray_9e Font17 mTop20"
        />
      ) : (
        <ListWrap>
          <div className="header Gray_9e flexRow alignItemsCenter">
            <div className="name flex">{_l('备份文件名称')}</div>
            <div className="backupType">{_l('备份类型')}</div>
            <div className="backupTime flexRow alignItemsCenter">
              {_l('备份时间')}
              <div
                className="flexColumn order Hand"
                onClick={() => {
                  setData({ orderType: orderType === 0 ? 1 : 0 });
                  getList({ pageIndex: 1, orderType: orderType === 0 ? 1 : 0 });
                }}
              >
                <Icon icon="arrow-up" className={cx({ ThemeColor3: orderType === 1 })} />
                <Icon icon="arrow-down" className={cx({ ThemeColor3: orderType === 0 })} />
              </div>
            </div>
            <div className="size flexRow alignItemsCenter">
              {_l('数据文件大小')}
              <div
                className="flexColumn order Hand"
                onClick={() => {
                  setData({ orderType: orderType === 2 ? 3 : 2 });
                  getList({ pageIndex: 1, orderType: orderType === 2 ? 3 : 2 });
                }}
              >
                <Icon icon="arrow-up" className={cx({ ThemeColor3: orderType === 3 })} />
                <Icon icon="arrow-down" className={cx({ ThemeColor3: orderType === 2 })} />
              </div>
            </div>
            <div className="operator">{_l('操作人')}</div>
            <div className="status">{_l('备份状态')}</div>
            <div className="action"></div>
          </div>
          <div className="flex">
            <ScrollView onScrollEnd={onScrollEnd}>
              {fileList.map(item => {
                const {
                  id,
                  operator = {},
                  operationDateTime,
                  status,
                  containData,
                  usage,
                  operationType,
                  dataStatus,
                } = item;

                const size =
                  usage / Math.pow(1024, 2) >= 1024
                    ? (usage / Math.pow(1024, 3)).toFixed(2) + 'GB'
                    : (usage / Math.pow(1024, 2)).toFixed(2) + 'MB';

                // 已过期
                const expired =
                  (validLimit === -1
                    ? moment(item.operationDateTime).add(1, 'year').format('YYYYMMDDHHmmss')
                    : moment(item.operationDateTime).add(60, 'days').format('YYYYMMDDHHmmss')) <
                  moment().format('YYYYMMDDHHmmss');
                // 即将过期
                const expiredSoon =
                  (validLimit === -1
                    ? moment(item.operationDateTime).add(1, 'year').subtract(10, 'days').format('YYYYMMDDHHmmss')
                    : moment(item.operationDateTime).add(50, 'days').format('YYYYMMDDHHmmss')) <
                  moment().format('YYYYMMDDHHmmss');

                return (
                  <div key={id} className="row flexRow alignItemsCenter">
                    <div className="backupFileName pLeft10 flex ellipsis">
                      <EditInput
                        actCurrentFileInfo={item}
                        projectId={projectId}
                        appId={appId}
                        updateFileList={updateFileList}
                      />
                    </div>
                    <div className="backupType">{containData ? _l('应用、数据') : _l('应用')}</div>
                    <div className="backupTime">{createTimeSpan(dateConvertToUserZone(operationDateTime))}</div>
                    <div className="size">{containData ? size : '-'}</div>
                    <div className="operator ellipsis">{operator.fullname}</div>
                    <div
                      className={cx('status', {
                        ThemeColor: _.includes([1, 2], status),
                        Gray_75: expired,
                        warningColor: expiredSoon && status === 0,
                      })}
                    >
                      {status === 1
                        ? _l('排队中...')
                        : status === 2
                        ? _l('备份中...')
                        : status === 10
                        ? _l('失败')
                        : expired
                        ? _l('已过期')
                        : expiredSoon
                        ? _l('即将过期')
                        : _l('完成')}

                      {validLimit !== -1 && (expired || expiredSoon) ? (
                        <Tooltip
                          text={
                            expired ? (
                              <span>
                                {_l('备份文件已过期，升级旗舰版后可恢复下载')}
                                <Support
                                  text={_l('了解更多')}
                                  type={3}
                                  href={`/upgrade/choose?projectId=${projectId}&select=3`}
                                />
                              </span>
                            ) : (
                              <span>
                                {_l('备份文件即将到期，升级旗舰版延长有效期')}
                                <Support
                                  text={_l('了解更多')}
                                  type={3}
                                  href={`/upgrade/choose?projectId=${projectId}&select=3`}
                                />
                              </span>
                            )
                          }
                        >
                          <Icon icon="info_outline" className="Gray_bd mLeft4" />
                        </Tooltip>
                      ) : (
                        ''
                      )}
                    </div>
                    {_.includes([0, 10], status) ? (
                      <div className="action">
                        <div className="actionContent pRight10 TxtRight">
                          {!expired && status === 0 && (
                            <span className="ThemeColor Hand mRight20" onClick={() => restoreApp(item)}>
                              {_l('还原')}
                            </span>
                          )}
                          {!expired && permissionType !== APP_ROLE_TYPE.DEVELOPERS_ROLE && status === 0 && (
                            <Dropdown
                              trigger={['click']}
                              placement={['bottomRight']}
                              overlayClassName="moreActionDropdown"
                              overlay={
                                <Menu>
                                  <MenuItem onClick={() => downloadBackup(item)}>{_l('下载应用')}</MenuItem>
                                  {containData && dataStatus === 1 ? (
                                    <MenuItem onClick={() => downloadData(item)}>
                                      <span> {_l('下载数据')}</span>
                                    </MenuItem>
                                  ) : (
                                    <Tooltip
                                      text={
                                        !containData ? (
                                          ''
                                        ) : dataStatus === 0 ? (
                                          <span>{_l('不支持下载老数据')}</span>
                                        ) : dataStatus === 2 ? (
                                          <span>{_l('数据大于1GB，无法下载')}</span>
                                        ) : (
                                          ''
                                        )
                                      }
                                    >
                                      <MenuItem disabled={true}>
                                        <span> {_l('下载数据')}</span>
                                      </MenuItem>
                                    </Tooltip>
                                  )}
                                </Menu>
                              }
                            >
                              <span className="ThemeColor Hand mRight20">{_l('下载')}</span>
                            </Dropdown>
                          )}
                          <Dropdown
                            trigger={['click']}
                            placement={['bottomRight']}
                            overlayClassName="moreActionDropdown"
                            overlay={
                              <Menu>
                                {/* 备份文件列表中，开发者无“下载备份和还原为新应用”权限 */}
                                {!expired &&
                                  permissionType !== APP_ROLE_TYPE.DEVELOPERS_ROLE &&
                                  canCreateApp &&
                                  status === 0 && (
                                    <MenuItem onClick={() => restoreNewApp(item)}>
                                      <span>{_l('还原为新应用')}</span>
                                    </MenuItem>
                                  )}
                                <MenuItem className="delete" onClick={() => deleteBackup(item)}>
                                  <span>{_l('删除')}</span>
                                </MenuItem>
                              </Menu>
                            }
                          >
                            <Icon icon="more_horiz" className="Gray_9e Hand Font18 more_horiz" />
                          </Dropdown>
                        </div>
                      </div>
                    ) : (
                      <div className="action"></div>
                    )}
                  </div>
                );
              })}
              {isLoading && pageIndex > 1 && <LoadDiv className="mTop15" />}
            </ScrollView>
          </div>
        </ListWrap>
      )}
      <RestoreAppDialog
        visible={restoreAppVisible}
        actCurrentFileInfo={actCurrentFileInfo}
        projectId={projectId}
        appId={appId}
        token={token}
        changeRestoreAppVisible={() => setData({ restoreAppVisible: false })}
        getList={getList}
        getBackupCount={props.getBackupCount}
        currentValid={currentValid}
        validLimit={validLimit}
      />
      <SelectDBInstance
        visible={DBInstancesDialog}
        options={dataDBInstances}
        onOk={id => onRestore(undefined, id)}
        onCancel={() => setData({ DBInstancesDialog: false, restoreItem: undefined })}
      />
    </Fragment>
  );
}
