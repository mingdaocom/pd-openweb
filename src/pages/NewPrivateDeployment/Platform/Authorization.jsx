import React, { Fragment, useState, useEffect } from 'react';
import { Icon, LoadDiv, Dialog } from 'ming-ui';
import { Button, Table, Tooltip, Checkbox } from 'antd';
import styled from 'styled-components';
import copy from 'copy-to-clipboard';
import cx from 'classnames';
import PrivateKeyDialog from './PrivateKeyDialog';
import TrialDialog from './TrialDialog';
import privateGuideApi from 'src/api/privateGuide';
import privateSysSettingApi from 'src/api/privateSysSetting';
import Projects from '../Management/PrivateKey/Projects';
import { updateSysSettings, LicenseVersions, useClientRect } from '../common';
import moment from 'moment';
import _ from 'lodash';

const Wrap = styled.div`
  padding: 20px 25px;
  .authorizationInfo {
    .versionsType {
      color: #20CA86;
      border: 1px solid #20CA86;
      border-radius: 4px;
      padding: 2px 4px;
    }
    .updatePrivateKey {
      color: #333;
      border-radius: 4px;
      padding: 2px 4px;
      border: 1px solid #EAEAEA;
    }
  }
  .appreciationServer {
    flex: 3;
    .dpWrap, .diciWrap, .sseWrap {
      height: 100%;
      padding: 10px 20px;
      border-radius: 7px;
      justify-content: center;
      &:hover {
        background-color: #FAFAFA;
      }
    }
    .iconWrap {
      padding: 8px;
      border-radius: 50%;
      background-color: rgba(33, 33, 33, 0.03);
      &.active {
        background-color: rgba(33, 150, 243, 0.04);
      }
    }
  }
  .card {
    padding: 20px;
    border-radius: 3px;
    box-shadow: 0px 1px 4px 1px rgba(0, 0, 0, 0.16);
  }
  .versionsInfo, .appreciationServer {
    height: 174px;
    min-width: 0;
  }
  .versionsInfo {
    flex: 1;
    .label {
      margin-right: 10px;
      white-space: nowrap;
    }
    .newVersionWrap {
      color: #20CA86;
      padding: 2px 5px;
      border-radius: 18px;
      background-color: #f5f5f5;
    }
  }
  .ant-table-thead th {
    color: #757575;
    background: #fff;
  }
`;

const Trial = styled.div`
  color: #fff;
  padding: 5px;
  border-radius: 13px;
  background-color: #FF9A2E;
`;

const columns = [
  {
    title: _l('更新密钥时间'),
    dataIndex: 'logTime',
    key: 'logTime',
    width: 170
  },
  {
    title: _l('密钥生效时间'),
    dataIndex: 'startDate',
    key: 'startDate',
    render: (_, data) => moment(data.startDate).format('YYYY-MM-DD')
  },
  {
    title: _l('密钥到期时间'),
    dataIndex: 'expirationDate',
    key: 'expirationDate',
    render: (_, data) => moment(data.expirationDate).format('YYYY-MM-DD')
  },
  {
    title: _l('升级服务到期时间'),
    dataIndex: 'upgradeExpirationDate',
    key: 'upgradeExpirationDate',
    render: (_, data) => data.upgradeExpirationDate ? moment(data.upgradeExpirationDate).format('YYYY-MM-DD') : '-',
    width: 150
  },
  {
    title: _l('内部用户配额'),
    dataIndex: 'internalUserNum',
    key: 'internalUserNum',
    render: (_, data) => data.internalUserNum.toLocaleString()
  },
  {
    title: _l('外部用户配额'),
    dataIndex: 'externalUserNum',
    key: 'externalUserNum',
    render: (_, data) => data.externalUserNum.toLocaleString()
  },
  {
    title: _l('操作人'),
    dataIndex: 'fullname',
    key: 'fullname',
    render: (_, data) => data.operater ? data.operater.fullname : '-'
  },
  {
    title: _l('操作'),
    dataIndex: 'operate',
    key: 'operate',
    render: () => {
      return <a className="viewOriginCode">{_l('查看')}</a>
    }
  }
];

const AuthorizationInfo = props => {
  const { loading, platformLicenseInfo, onUpdatePage } = props;
  const [privateKeyDialogVisible, setPrivateKeyDialogVisible] = useState(false);

  const formatDate = (date) => {
    const current = moment().format('YYYY-MM-DD');
    const year = moment(date).format('YYYY');
    const diff = moment(date).diff(moment(current), 'd') + 1;
    if (year == 9999) {
      return <span style={{ color: '#4CAF50' }}>{_l('永久有效')}</span>;
    }
    if (diff <= 0) {
      return <span style={{ color: '#F44336' }}>{_l('已到期')}</span>;
    }
    return _l('剩余%0天', diff);
  };

  return (
    <div className="authorizationInfo card flex">
      <div className="valignWrapper mBottom25">
        <div className="valignWrapper flex">
          <div className="Font15 bold">{_l('授权信息')}</div>
          {!loading && (
            <div className="versionsType Font12 mLeft10">
              {platformLicenseInfo.isPlatform ? _l('平台版') : LicenseVersions[platformLicenseInfo.licenseVersion]}
            </div>
          )}
        </div>
        <div
          className="updatePrivateKey pointer"
          onClick={() => setPrivateKeyDialogVisible(true)}
        >
          <Icon className="Gray_bd mRight2" icon="key1" />
          {_l('更新密钥')}
        </div>
      </div>
      {loading ? (
        <LoadDiv />
      ) : (
        <Fragment>
          <div className="flexRow">
            <div className="flexColumn valignWrapper flex">
              <div className="Font14 Gray_9e mBottom5 pBottom2">{_l('密钥到期时间')}</div>
              <div className="Font17 mBottom5 bold">{formatDate(platformLicenseInfo.expirationDate)}</div>
              <div className="Font13 Gray_bd">{_l('%0到期', moment(platformLicenseInfo.expirationDate).format('YYYY年MM月DD日'))}</div>
            </div>
            <div className="flexColumn valignWrapper flex">
              <div className="Font14 Gray_9e mBottom5 pBottom2">{_l('升级服务到期时间')}</div>
              <div className="Font17 mBottom5 bold">{platformLicenseInfo.upgradeExpirationDate ? formatDate(platformLicenseInfo.upgradeExpirationDate) : '-'}</div>
              <div className="Font13 Gray_bd">{platformLicenseInfo.upgradeExpirationDate ? _l('%0到期', moment(platformLicenseInfo.upgradeExpirationDate).format('YYYY年MM月DD日')) : '-'}</div>
            </div>
            <div className="flexColumn valignWrapper flex">
              <div className="Font14 Gray_9e mBottom5 pBottom2">{_l('内部用户配额')}</div>
              <div className="Font17 mBottom5 bold">{_l('%0 人', (platformLicenseInfo.internalUserNum || 0).toLocaleString())}</div>
              <div className="Font13 Gray_bd">{_l('已使用 %0 人', (platformLicenseInfo.internalUsedUserNum || 0).toLocaleString())}</div>
            </div>
            <div className="flexColumn valignWrapper flex">
              <div className="Font14 Gray_9e mBottom5 pBottom2">{_l('外部用户配额')}</div>
              <div className="Font17 mBottom5 bold">{_l('%0 人', (platformLicenseInfo.externalUserNum || 0).toLocaleString())}</div>
              <div className="Font13 Gray_bd">{_l('已使用 %0 人', (platformLicenseInfo.externalUsedUserNum || 0).toLocaleString())}</div>
            </div>
            {!platformLicenseInfo.isPlatform && (
              <div className="flexColumn valignWrapper flex">
                <div className="Font14 Gray_9e mBottom5 pBottom2">{_l('组织数')}</div>
                <div className="Font17 mBottom5 bold">{`${_.get(platformLicenseInfo, 'projectIds.length')}/${platformLicenseInfo.projectNum}`}</div>
                <div className="Font13 ThemeColor pointer">
                  <Projects usable={true} onSave={onUpdatePage} />
                </div>
              </div>
            )}
          </div>
          {!platformLicenseInfo.isPlatform && (
            <Fragment>
              <div className="mBottom20 mTop20" style={{ height: 1, backgroundColor: '#EAEAEA' }} />
              <div className="flexRow">
                <div className="flexColumn valignWrapper flex">
                  <div className="Font14 Gray_9e mBottom5 pBottom2">{_l('应用总数上限')}</div>
                  <div className="Font17 mBottom5 bold">{platformLicenseInfo.applicationNum === 2147483647 ? _l('不限') : platformLicenseInfo.applicationNum}</div>
                </div>
                <div className="flexColumn valignWrapper flex">
                  <div className="Font14 Gray_9e mBottom5 pBottom2">{_l('工作表总数上限')}</div>
                  <div className="Font17 mBottom5 bold">{platformLicenseInfo.worktableNum === 2147483647 ? _l('不限') : platformLicenseInfo.worktableNum}</div>
                </div>
                <div className="flexColumn valignWrapper flex">
                  <div className="Font14 Gray_9e mBottom5 pBottom2">{_l('行记录总数上限/单表')}</div>
                  <div className="Font17 mBottom5 bold">{platformLicenseInfo.worktableRowNum === 2147483647 ? _l('不限') : platformLicenseInfo.worktableRowNum}</div>
                </div>
                <div className="flexColumn valignWrapper flex">
                  <div className="Font14 Gray_9e mBottom5 pBottom2">{_l('工作流总数上限/单月')}</div>
                  <div className="Font17 mBottom5 bold">{platformLicenseInfo.workflowNum >= 1000000 ? _l('不限') : platformLicenseInfo.workflowNum * 1000 }</div>
                </div>
                <div className="flex" />
              </div>
            </Fragment>
          )}
        </Fragment>
      )}
      <PrivateKeyDialog
        codeInfo={null}
        visible={privateKeyDialogVisible}
        onCancel={() => {
          setPrivateKeyDialogVisible(false);
        }}
        onSave={onUpdatePage}
      />
    </div>
  );
}

const AppreciationServer = props => {
  const { loading, platformLicenseInfo, setPlatformLicenseInfo } = props;
  const [serverInfo, setServerInfo] = useState(null);
  const [trialServer, setTrialServer] = useState(null);
  const renderDpState = () => {
    if (platformLicenseInfo.dp && platformLicenseInfo.dp.isTrial) {
      const current = moment().format('YYYY-MM-DD');
      const diff = moment(platformLicenseInfo.dp.expirationDate).diff(moment(current), 'd') + 1;
      if (diff >= 1) {
        return (
          <div style={{ color: '#FF9D2E' }}>{_l('试用还剩 %0 天', diff)}</div>
        )
      } else {
        return (
          <div
            className="ThemeColor pointer"
            onClick={(e) => {
              e.stopPropagation();
              setTrialServer(2);
            }}
          >
            {_l('更新试用密钥')}
          </div>
        );
      }
    }
    if (!platformLicenseInfo.dp) {
      return (
        <div
          className="ThemeColor pointer"
          onClick={(e) => {
            e.stopPropagation();
            setTrialServer(2);
          }}
        >
          {_l('试用')}
        </div>
      );
    }
  }
  const renderDiCiState = () => {
    if (platformLicenseInfo.dici) {
      return null;
    }

    return (
      <div
        className="ThemeColor pointer"
        onClick={(e) => {
          e.stopPropagation();
          setTrialServer(3);
        }}
      >
        {_l('绑定密钥')}
      </div>
    );
  }
  const renderDidbState = () => {
    if (platformLicenseInfo.didb) {
      return null;
    }

    return (
      <div
        className="ThemeColor pointer"
        onClick={(e) => {
          e.stopPropagation();
          setTrialServer(4);
        }}
      >
        {_l('绑定密钥')}
      </div>
    );
  }
  const renderSseState = () => {
    if (platformLicenseInfo.sse && platformLicenseInfo.sse.isTrial) {
      const current = moment().format('YYYY-MM-DD');
      const diff = moment(platformLicenseInfo.sse.expirationDate).diff(moment(current), 'd') + 1;
      if (diff >= 1) {
        return (
          <div style={{ color: '#FF9D2E' }}>{_l('试用还剩 %0 天', diff)}</div>
        )
      } else {
        return (
          <div
            className="ThemeColor pointer"
            onClick={(e) => {
              e.stopPropagation();
              setTrialServer(1);
            }}
          >
            {_l('更新试用密钥')}
          </div>
        );
      }
    }
    if (!platformLicenseInfo.sse) {
      return (
        <div
          className="ThemeColor pointer"
          onClick={(e) => {
            e.stopPropagation();
            setTrialServer(1);
          }}
        >
          {_l('试用')}
        </div>
      );
    }
  }
  const renderServerInfoDialog = () => {
    const current = moment().format('YYYY-MM-DD');
    const expirationDateDiff = moment(serverInfo.expirationDate).diff(moment(current), 'd') + 1;
    return (
      <Dialog
        visible={true}
        anim={false}
        width={560}
        footer={null}
        title={(
          <div className="flexRow alignItemsCenter">
            <div className="valignWrapper flex">
              <Icon className="Font30 ThemeColor" icon={serverInfo.icon} />
              <div className="Font17 Gray bold mLeft5">{serverInfo.title}</div>
              {serverInfo.isTrial && <Trial className="Font12 mLeft10">{_l('试用中')}</Trial>}
            </div>
            {(serverInfo.isTrial || serverInfo.type === 'dici' || serverInfo.type === 'didb') && <div className="Font12 ThemeColor pointer mTop20" onClick={() => setTrialServer(serverInfo.extendFunType)}>{_l('更新密钥')}</div>}
          </div>
        )}
        onCancel={() => {
          setServerInfo(null);
        }}
      >
        <div className="flexRow">
          <div className="flexColumn flex">
            <div className="Gray_9e mBottom2">{_l('到期时间')}</div>
            <div className="flexRow">
              <div className="Gray">{moment(serverInfo.expirationDate).format('YYYY-MM-DD')}</div>
              {expirationDateDiff >= 1 ? (
                <div className="flexRow mLeft10">
                  {_l('剩余')}
                  <span className="mLeft2 mRight2" style={{ color: '#FF9A2E' }}>{expirationDateDiff}</span>
                  {_l('天')}
                </div>
              ) : (
                <div className="flexRow mLeft10 Red">{_l('已过期')}</div>
              )}
            </div>
          </div>
          {serverInfo.type === 'dp' && (
            <div className="flexColumn flex">
              <div className="Gray_9e mBottom2">{_l('数据同步任务数')}</div>
              <div className="Gray">{serverInfo.dataPipelineJobNum.toLocaleString()}</div>
            </div>
          )}
        </div>
        {serverInfo.type === 'dp' && (
          <div className="flexColumn flex mTop20">
            <div className="Gray_9e mBottom2">{_l('数据同步算力数')}</div>
            <div className="Gray">{serverInfo.dataPipelineRowNum.toLocaleString()}</div>
          </div>
        )}
        {['dici', 'didb'].includes(serverInfo.type) && (
          <div className="flexColumn flex mTop20">
            <div className="Gray_9e mBottom2">{_l('服务实例数')}</div>
            <div className="flexRow">
              <div className="mRight5 Gray">{_l('剩余%0个', serverInfo.instanceNum - serverInfo.usedInstanceNum)}</div>
              <div className="Gray_9e">{_l('共%0个', serverInfo.instanceNum)}</div>
            </div>
          </div>
        )}
      </Dialog>
    );
  }
  return (
    <div className="appreciationServer flexColumn card flex">
      <div className="Font15 bold">{_l('增值产品')}</div>
      {loading ? (
        <LoadDiv className="mTop20" />
      ) : (
        <div className="flexRow valignWrapper">
          <div
            className="dpWrap flex flexColumn alignItemsCenter pointer"
            onClick={() => {
              platformLicenseInfo.dp && setServerInfo({
                ...platformLicenseInfo.dp,
                title: _l('数据集成'),
                icon: 'a-Data_integration1',
                type: 'dp',
                extendFunType: 2
              });
            }}
          >
            <div className={cx('iconWrap valignWrapper justifyContentCenter', { active: platformLicenseInfo.dp })}>
              <Icon className={cx('Font40', platformLicenseInfo.dp ? 'ThemeColor' : 'Gray_bd')} icon="a-Data_integration1" />
            </div>
            <div className="Font14 mTop2">{_l('数据集成')}</div>
            {renderDpState()}
          </div>
          <div
            className="diciWrap flex flexColumn alignItemsCenter pointer"
            onClick={() => {
              platformLicenseInfo.dici && setServerInfo({
                ...platformLicenseInfo.dici,
                title: _l('专属算力'),
                icon: 'dns1',
                type: 'dici',
                extendFunType: 3
              });
            }}
          >
            <div className={cx('iconWrap valignWrapper justifyContentCenter', { active: platformLicenseInfo.dici })}>
              <Icon className={cx('Font40', platformLicenseInfo.dici ? 'ThemeColor' : 'Gray_bd')} icon="dns1" />
            </div>
            <div className="Font14 mTop2">{_l('专属算力')}</div>
            {renderDiCiState()}
          </div>
          {!md.global.Config.IsPlatformLocal && (<div
            className="diciWrap flex flexColumn alignItemsCenter pointer"
            onClick={() => {
              platformLicenseInfo.didb && setServerInfo({
                ...platformLicenseInfo.didb,
                title: _l('专属数据库'),
                icon: 'database',
                type: 'didb',
                extendFunType: 4
              });
            }}
          >
            <div className={cx('iconWrap valignWrapper justifyContentCenter', { active: platformLicenseInfo.didb })}>
              <Icon className={cx('Font40', platformLicenseInfo.didb ? 'ThemeColor' : 'Gray_bd')} icon="database" />
            </div>
            <div className="Font14 mTop2">{_l('专属数据库')}</div>
            {renderDidbState()}
          </div>)}
          <div
            className="sseWrap flex flexColumn alignItemsCenter pointer"
            onClick={() => {
              platformLicenseInfo.sse && setServerInfo({
                ...platformLicenseInfo.sse,
                title: _l('超级搜索'),
                icon: 'search',
                type: 'sse',
                extendFunType: 1
              });
            }}
          >
            <div className={cx('iconWrap valignWrapper justifyContentCenter', { active: platformLicenseInfo.sse })}>
              <Icon className={cx('Font40', platformLicenseInfo.sse ? 'ThemeColor' : 'Gray_bd')} icon="search" />
            </div>
            <div className="Font14 mTop2">{_l('超级搜索')}</div>
            {renderSseState()}
          </div>
        </div>
      )}
      {!!serverInfo && renderServerInfoDialog()}
      {trialServer && (
        <TrialDialog
          visible={true}
          extendFunType={trialServer}
          onCancel={() => setTrialServer(null)}
          onSave={(result) => {
            const data = {
              isTrial: true,
              startDate: result.startDate,
              expirationDate: result.expirationDate,
            }
            if (result.extendFunType === 1) {
              platformLicenseInfo.sse = data;
            }
            if (result.extendFunType === 2) {
              platformLicenseInfo.dp = data;
              platformLicenseInfo.dp.dataPipelineJobNum = result.trialInfo.dptq;
              platformLicenseInfo.dp.dataPipelineRowNum = result.trialInfo.dpsd;
            }
            if (result.extendFunType === 3) {
              platformLicenseInfo.dici = data;
              platformLicenseInfo.dici.usedInstanceNum = 0;
              platformLicenseInfo.dici.instanceNum = result.trialInfo.dici;
            }
            if (result.extendFunType === 4) {
              platformLicenseInfo.didb = data;
              platformLicenseInfo.didb.usedInstanceNum = 0;
              platformLicenseInfo.didb.instanceNum = result.trialInfo.didb;
            }
            if (serverInfo) {
              setServerInfo({
                ...serverInfo,
                ...data
              });
            }
            setPlatformLicenseInfo(platformLicenseInfo);
          }}
        />
      )}
    </div>
  );
}

const VersionsInfo = props => {
  const { SysSettings } = md.global;
  const [loading, setLoading] = useState(true);
  const [serverInfo, setServerInfo] = useState({});
  const [newVersion, setNewVersion] = useState(null);
  const [enablePromptNewVersion, setEnablePromptNewVersion] = useState(SysSettings.enablePromptNewVersion);

  useEffect(() => {
    privateGuideApi.getServerInfo().then(data => {
      setLoading(false);
      setServerInfo(data);
    });
  }, []);

  const handleChangeEnablePromptNewVersion = checked => {
    updateSysSettings({
      enablePromptNewVersion: checked
    }, () => {
      setEnablePromptNewVersion(checked);
      md.global.SysSettings.enablePromptNewVersion = checked;
    });
  }

  const getNewVersionInfo = () => {
    privateSysSettingApi.getNewVersionInfo().then(data => {
      if (data) {
        setNewVersion(data);
        alert(_l('发现新版本'));
      } else {
        alert(_l('当前已是最新版'));
      }
    });
  }

  return (
    <div className="versionsInfo flexColumn card mRight20">
      <div className="flexRow valignWrapper mBottom20">
        <div className="Font15 bold flex">{_l('版本信息')}</div>
        <div className="">
          <Tooltip title={_l('勾选后，若存在新版本，将会在平台管理员首页的头像旁显示提醒图标')} placement="top">
            <Checkbox
              className="mRight15"
              checked={enablePromptNewVersion}
              onChange={event => handleChangeEnablePromptNewVersion(event.target.checked)}
            >
              {_l('新版本提示')}
            </Checkbox>
          </Tooltip>
        </div>
      </div>
      {
        loading ? (
          <LoadDiv />
        ) : (
          <Fragment>
            <div className="flexRow valignWrapper mBottom15">
              <div className="Gray_75 Font13 label">{_l('平台版本')}</div>
              <div>{serverInfo.systemVersion}</div>
              {newVersion && (
                <Tooltip title={_l('发现新版本：%0，点击查看', newVersion)} placement="top">
                  <div className="newVersionWrap flexRow valignWrapper mLeft2 mRight2 pointer" onClick={() => window.open('https://docs-pd.mingdao.com/version')}>
                    <Icon icon="score-up" className="Font15 mRight2" />
                    <span className="bold">{newVersion}</span>
                    <Icon icon="task-new-detail" className="font10 Gray_75" />
                  </div>
                </Tooltip>
              )}
              <div className="ThemeColor pointer mLeft5" onClick={getNewVersionInfo}>{_l('检测')}</div>
            </div>
            <div className="flexRow valignWrapper mBottom15">
              <div className="Gray_75 Font13 label">{_l('密钥版本')}</div>
              <div>{serverInfo.licenseTemplateVersion}</div>
            </div>
            <div className="flexRow valignWrapper mBottom15">
              <div className="Gray_75 Font13 label">{_l('服务器ID')}</div>
              <Tooltip title={serverInfo.serverId} placement="bottom">
                <div className="ellipsis">{serverInfo.serverId}</div>
              </Tooltip>
              <Icon
                icon="copy"
                className="Gray_9e Font17 pointer mLeft5"
                onClick={() => {
                  copy(serverInfo.serverId);
                  alert(_l('复制成功'));
                }}
              />
            </div>
          </Fragment>
        )
      }
    </div>
  );
}

const Log = props => {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [total, setTotal] = useState(0);
  const [privateKeyDialogVisible, setPrivateKeyDialogVisible] = useState(false);
  const [codeInfo, setCodeInfo] = useState(null);
  const [rect, ref] = useClientRect();
  const pageSize = 10;
  const tableHeight = _.get(rect, 'height');

  const getPlatformLicenseLogs = () => {
    setLoading(true);
    privateGuideApi.getPlatformLicenseLogs({
      pageIndex,
      pageSize,
    }).then(data => {
      const { allCount, list } = data;
      setLoading(false);
      setList(list);
      setTotal(allCount);
    });
  }

  useEffect(() => {
    getPlatformLicenseLogs();
  }, [pageIndex]);

  return (
    <div className="flex card flexColumn mTop20 tableWrapper" ref={ref}>
      <div className="flexRow valignWrapper">
        <div className="Font15 bold flex">{_l('授权日志')}</div>
      </div>
      <PrivateKeyDialog
        codeInfo={codeInfo}
        visible={privateKeyDialogVisible}
        onCancel={() => {
          setCodeInfo(null);
          setPrivateKeyDialogVisible(false);
        }}
        onSave={() => {
          setPageIndex(1);
        }}
      />
      <Table
        loading={loading}
        columns={columns}
        dataSource={list}
        locale={{
          emptyText: _l('暂无数据')
        }}
        pagination={{
          position: ['none', 'bottomCenter'],
          pageSize: 10,
          total,
          onChange: (page) => {
            setPageIndex(page);
          }
        }}
        scroll={{
          scrollToFirstRowOnChange: false,
          y: `${tableHeight > 500 ? (tableHeight - 130) : 500}px`,
        }}
        onRow={(record) => {
          return {
            onClick: e => {
              const { target } = e;
              if (target.classList.contains('viewOriginCode')) {
                setPrivateKeyDialogVisible(true);
                setCodeInfo(record);
              }
            }
          }
        }}
      />
    </div>
  );
}

const Authorization = props => {
  const { SysSettings } = md.global;
  const [loading, setLoading] = useState(true);
  const [platformLicenseInfo, setPlatformLicenseInfo] = useState({});

  const handleUpdatePage = () => {
    document.querySelector('.privateDeploymentSidebar .menuItem.active').click();
  }

  useEffect(() => {
    privateGuideApi.getPlatformLicenseInfo().then(data => {
      setLoading(false);
      setPlatformLicenseInfo(data);
    });
  }, []);

  return (
    <Wrap className="flexColumn h100">
      <div className="flexRow valignWrapper">
        <VersionsInfo />
        <AppreciationServer
          loading={loading}
          platformLicenseInfo={platformLicenseInfo}
          setPlatformLicenseInfo={setPlatformLicenseInfo}
        />
      </div>
      <div className="flexRow valignWrapper mTop20">
        <AuthorizationInfo
          loading={loading}
          platformLicenseInfo={platformLicenseInfo}
          onUpdatePage={handleUpdatePage}
        />
      </div>
      <Log />
    </Wrap>
  );
}

export default Authorization;
