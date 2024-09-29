import React, { Fragment, useState } from 'react';
import { useSetState } from 'react-use';
import { Input, Icon, Switch, Dialog } from 'ming-ui';
import { Button, Divider } from 'antd';
import ServerStateDialog from './components/ServerStateDialog';
import InstallCaptainDialog from './components/InstallCaptainDialog';
import { updateSysSettings } from '../common';

const Base = props => {
  const { IsPlatformLocal, IsCluster } = md.global.Config;
  const { SysSettings } = md.global;
  const [sysSettings, setSysSettings] = useSetState({
    hidePlugin: false,
    ...SysSettings,
    appDialogVisible: false,
    serverStateDialogVisible: false,
    installCaptainDialogVisible: false,
  });
  const {
    hideHelpTip,
    hideIntegration,
    hideIntegrationLibrary,
    hideDownloadApp,
    downloadAppRedirectUrl,
    appDialogVisible,
    serviceStatusWebhookUrl,
    serverStateDialogVisible,
    enableCreateProject,
    installCaptainUrl,
    installCaptainDialogVisible,
    hidePlugin,
  } = sysSettings;

  const renderHelpTip = () => {
    return (
      <div className="flexRow valignWrapper">
        <div className="flex flexColumn">
          <div className="Font14 bold mBottom8">{_l('帮助')}</div>
          <div className="Gray_9e">{_l('显示功能帮助引导')}</div>
        </div>
        <Switch
          checked={!hideHelpTip}
          onClick={value => {
            updateSysSettings(
              {
                hideHelpTip: value,
              },
              () => {
                setSysSettings({ hideHelpTip: value });
                md.global.SysSettings.hideHelpTip = value;
              },
            );
          }}
        />
      </div>
    );
  };

  const renderIntegration = () => {
    return (
      <div className="flexRow valignWrapper">
        <div className="flex flexColumn">
          <div className="Font14 bold mBottom8">{_l('集成中心')}</div>
          <div className="Gray_9e">{_l('平台集成中心入口')}</div>
          {!hideIntegration && (
            <div className="flexRow valignWrapper mTop10">
              <Switch
                checked={!hideIntegrationLibrary}
                onClick={value => {
                  updateSysSettings(
                    {
                      hideIntegrationLibrary: value,
                    },
                    () => {
                      setSysSettings({ hideIntegrationLibrary: value });
                      md.global.SysSettings.hideIntegrationLibrary = value;
                    },
                  );
                }}
              />
              <div className="mLeft8">{_l('显示官方API库')}</div>
            </div>
          )}
        </div>
        <Switch
          checked={!hideIntegration}
          onClick={value => {
            updateSysSettings(
              {
                hideIntegration: value,
                hideIntegrationLibrary: value,
              },
              () => {
                setSysSettings({ hideIntegration: value });
                setSysSettings({ hideIntegrationLibrary: value });
                md.global.SysSettings.hideIntegration = value;
                md.global.SysSettings.hideIntegrationLibrary = value;
              },
            );
          }}
        />
      </div>
    );
  };

  const renderDownloadApp = () => {
    return (
      <Fragment>
        <div className="flexRow">
          <div className="flex flexColumn">
            <div className="Font14 bold mBottom7">{_l('APP下载入口')}</div>
            <div className="Gray_9e">{_l('定制版APP下载地址设置')}</div>
            {!hideDownloadApp && (
              <Fragment>
                <div className="mBottom15 mTop15 valignWrapper">
                  <span className="Gray_9e mRight18">{_l('下载地址')}</span>
                  <span>{downloadAppRedirectUrl || _l('未配置')}</span>
                </div>
                <div>
                  <Button
                    ghost
                    disabled={hideDownloadApp}
                    type="primary"
                    onClick={() => {
                      setSysSettings({ appDialogVisible: true });
                    }}
                  >
                    {_l('设置')}
                  </Button>
                </div>
              </Fragment>
            )}
          </div>
          <Switch
            checked={!hideDownloadApp}
            onClick={value => {
              updateSysSettings(
                {
                  hideDownloadApp: value,
                },
                () => {
                  setSysSettings({ hideDownloadApp: value });
                  md.global.SysSettings.hideDownloadApp = value;
                },
              );
            }}
          />
        </div>
        <Dialog
          visible={appDialogVisible}
          title={_l('App 下载地址')}
          okText={_l('保存')}
          onOk={() => {
            updateSysSettings(
              {
                downloadAppRedirectUrl,
              },
              () => {
                md.global.SysSettings.downloadAppRedirectUrl = downloadAppRedirectUrl;
              },
            );
            setSysSettings({ appDialogVisible: false });
          }}
          onCancel={() => {
            setSysSettings({ appDialogVisible: false });
          }}
        >
          <Input
            className="w100"
            placeholder={_l('请输入')}
            value={downloadAppRedirectUrl}
            onChange={value => setSysSettings({ downloadAppRedirectUrl: value })}
          />
        </Dialog>
      </Fragment>
    );
  };

  const renderServerState = () => {
    return (
      <Fragment>
        <div className="flexRow">
          <div className="flex flexColumn">
            <div className="Font14 bold mBottom7">{_l('服务运行状态推送')}</div>
            <div className="Gray_9e mBottom15">{_l('平台服务运行健康状态推送，通过配置 Webhook 地址接收状态消息')}</div>
            <div className="mBottom15 valignWrapper">
              <span className="Gray_9e mRight18">{_l('Webhook 地址')}</span>
              <span>{serviceStatusWebhookUrl || _l('未配置')}</span>
            </div>
            <div>
              <Button
                ghost
                // disabled={hideDownloadApp}
                type="primary"
                onClick={() => {
                  setSysSettings({ serverStateDialogVisible: true });
                }}
              >
                {_l('设置')}
              </Button>
            </div>
          </div>
        </div>
        <ServerStateDialog
          visible={serverStateDialogVisible}
          onChange={value => {
            setSysSettings({ serviceStatusWebhookUrl: value });
          }}
          onCancel={() => {
            setSysSettings({ serverStateDialogVisible: false });
          }}
        />
      </Fragment>
    );
  };

  const renderHidePlugin = () => {
    return (
      <div className="flexRow valignWrapper">
        <div className="flex flexColumn">
          <div className="Font14 bold mBottom8">{_l('插件中心')}</div>
          <div className="Gray_9e">{_l('开启后，开放插件中心入口，且支持在系统内使用插件能力')}</div>
        </div>
        <Switch
          checked={!hidePlugin}
          onClick={value => {
            updateSysSettings(
              {
                hidePlugin: value,
              },
              () => {
                setSysSettings({ hidePlugin: value });
                md.global.SysSettings.hidePlugin = value;
              },
            );
          }}
        />
      </div>
    );
  };

  const renderEnableCreateProject = () => {
    return (
      <div className="flexRow valignWrapper">
        <div className="flex flexColumn">
          <div className="Font14 bold mBottom8">{_l('创建组织')}</div>
          <div className="Gray_9e">{_l('允许非平台管理员创建组织（若禁用，仅平台管理员可创建组织）')}</div>
        </div>
        <Switch
          checked={enableCreateProject}
          onClick={value => {
            value = !value;
            updateSysSettings(
              {
                enableCreateProject: value,
              },
              () => {
                setSysSettings({ enableCreateProject: value });
                md.global.SysSettings.enableCreateProject = value;
              },
            );
          }}
        />
      </div>
    );
  };

  const renderInstallCaptainUrl = () => {
    const url = installCaptainUrl || location.protocol + '//' + location.hostname + ':38881/settings';
    return (
      <Fragment>
        <div className="flexRow">
          <div className="flex flexColumn">
            <div className="Font14 bold mBottom7">{_l('管理器')}</div>
            <div className="Gray_9e mBottom15">{_l('升级、重启服务，请打开管理器')}</div>
            <div className="mBottom15 valignWrapper">
              <span className="Gray_9e mRight18">{_l('访问地址')}</span>
              <span>{url}</span>
              <Icon
                icon="task-new-detail"
                className="Font12 Gray_bd mLeft5 mTop3 pointer"
                onClick={() => {
                  window.open(url);
                }}
              />
            </div>
            <div>
              <Button
                ghost
                type="primary"
                onClick={() => {
                  setSysSettings({ installCaptainDialogVisible: true });
                }}
              >
                {_l('设置')}
              </Button>
            </div>
          </div>
        </div>
        <InstallCaptainDialog
          visible={installCaptainDialogVisible}
          onSave={value => {
            setSysSettings({ installCaptainUrl: value });
          }}
          onCancel={() => setSysSettings({ installCaptainDialogVisible: false })}
        />
      </Fragment>
    );
  };

  return (
    <div className="privateCardWrap flexColumn">
      <div className="Font17 bold mBottom25">{_l('通用')}</div>
      {renderHelpTip()}
      <Divider className="mTop20 mBottom20" />
      {renderIntegration()}
      <Divider className="mTop20 mBottom20" />
      {renderHidePlugin()}
      <Divider className="mTop20 mBottom20" />
      {IsPlatformLocal && (
        <Fragment>
          {renderEnableCreateProject()}
          <Divider className="mTop20 mBottom20" />
        </Fragment>
      )}
      {renderDownloadApp()}
      <Divider className="mTop20 mBottom20" />
      {renderServerState()}
      {!IsCluster && (
        <Fragment>
          <Divider className="mTop20 mBottom20" />
          {renderInstallCaptainUrl()}
        </Fragment>
      )}
    </div>
  );
};

export default Base;
