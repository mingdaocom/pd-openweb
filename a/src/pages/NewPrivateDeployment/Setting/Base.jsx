import React, { Fragment, useState } from 'react';
import { Icon, Switch, Input, Dialog } from 'ming-ui';
import { Button, Divider } from 'antd';
import ServerStateDialog from './components/ServerStateDialog';
import InstallCaptainDialog from './components/InstallCaptainDialog';
import WorkWXIntegrationDialog from './components/WorkWXIntegrationDialog';
import { updateSysSettings } from '../common';

const Base = (props) => {
  const { IsPlatformLocal, IsCluster } = md.global.Config;
  const { SysSettings } = md.global;
  const [hideHelpTip, setHideHelpTip] = useState(SysSettings.hideHelpTip);
  const [hideIntegration, setHideIntegration] = useState(SysSettings.hideIntegration);
  const [hideIntegrationLibrary, setHideIntegrationLibrary] = useState(SysSettings.hideIntegrationLibrary);
  const [hideDownloadApp, setHideDownloadApp] = useState(SysSettings.hideDownloadApp);
  const [downloadAppRedirectUrl, setDownloadAppRedirectUrl] = useState(SysSettings.downloadAppRedirectUrl);
  const [appDialogVisible, setAppDialogVisible] = useState(false);
  const [serviceStatusWebhookUrl, setServiceStatusWebhookUrl] = useState(SysSettings.serviceStatusWebhookUrl);
  const [allowBindAccountNoVerify, setAllowBindAccountNoVerify] = useState(SysSettings.allowBindAccountNoVerify);
  const [serverStateDialogVisible, setServerStateDialogVisible] = useState(false);
  const [enableCreateProject, setEnableCreateProject] = useState(SysSettings.enableCreateProject);
  const [installCaptainUrl, setInstallCaptainUrl] = useState(SysSettings.installCaptainUrl);
  const [installCaptainDialogVisible, setInstallCaptainDialogVisible] = useState(false);
  const [workWXIntegrationVisible, setWorkWXIntegrationVisible] = useState(false);
  const [workWxSelfBuildNoticUrl, setWorkWxSelfBuildNoticUrl] = useState(SysSettings.workWxSelfBuildNoticUrl);

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
            updateSysSettings({
              hideHelpTip: value
            }, () => {
              setHideHelpTip(value);
              md.global.SysSettings.hideHelpTip = value;
            });
          }}
        />
      </div>
    );
  }

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
                  updateSysSettings({
                    hideIntegrationLibrary: value
                  }, () => {
                    setHideIntegrationLibrary(value);
                    md.global.SysSettings.hideIntegrationLibrary = value;
                  });
                }}
              />
              <div className="mLeft8">{_l('显示明道云API库')}</div>
            </div>
          )}
        </div>
        <Switch
          checked={!hideIntegration}
          onClick={value => {
            updateSysSettings({
              hideIntegration: value,
              hideIntegrationLibrary: value,
            }, () => {
              setHideIntegration(value);
              setHideIntegrationLibrary(value);
              md.global.SysSettings.hideIntegration = value;
              md.global.SysSettings.hideIntegrationLibrary = value;
            });
          }}
        />
      </div>
    );
  }

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
                    onClick={() => { setAppDialogVisible(true) }}
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
              updateSysSettings({
                hideDownloadApp: value
              }, () => {
                setHideDownloadApp(value);
                md.global.SysSettings.hideDownloadApp = value;
              });
            }}
          />
        </div>
        <Dialog
          visible={appDialogVisible}
          title={_l('App 下载地址')}
          okText={_l('保存')}
          onOk={() => {
            updateSysSettings({
              downloadAppRedirectUrl
            }, () => {
              md.global.SysSettings.downloadAppRedirectUrl = downloadAppRedirectUrl;
            });
            setAppDialogVisible(false);
          }}
          onCancel={() => { setAppDialogVisible(false) }}
        >
          <Input
            className="w100"
            placeholder={_l('请输入')}
            value={downloadAppRedirectUrl}
            onChange={value => setDownloadAppRedirectUrl(value)}
          />
        </Dialog>
      </Fragment>
    );
  }

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
                onClick={() => { setServerStateDialogVisible(true) }}
              >
                {_l('设置')}
              </Button>
            </div>
          </div>
        </div>
        <ServerStateDialog
          visible={serverStateDialogVisible}
          onChange={(value) => {
            setServiceStatusWebhookUrl(value);
          }}
          onCancel={() => {
            setServerStateDialogVisible(false);
          }}
        />
      </Fragment>
    );
  }

  const renderAllowBindAccountNoVerify = () => {
    return (
      <div className="flexRow valignWrapper">
        <div className="flex flexColumn">
          <div className="Font14 bold mBottom8">{_l('邮箱和手机号验证')}</div>
          <div className="Gray_9e">{_l('开启后绑定邮箱或手机号时，需要验证合法性')}</div>
        </div>
        <Switch
          checked={!allowBindAccountNoVerify}
          onClick={value => {
            updateSysSettings({
              allowBindAccountNoVerify: value
            }, () => {
              setAllowBindAccountNoVerify(value);
              md.global.SysSettings.allowBindAccountNoVerify = value;
            });
          }}
        />
      </div>
    );
  }

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
            updateSysSettings({
              enableCreateProject: value
            }, () => {
              setEnableCreateProject(value);
              md.global.SysSettings.enableCreateProject = value;
            });
          }}
        />
      </div>
    );
  }

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
                onClick={() => { setInstallCaptainDialogVisible(true) }}
              >
                {_l('设置')}
              </Button>
            </div>
          </div>
        </div>
        <InstallCaptainDialog
          visible={installCaptainDialogVisible}
          onSave={value => {
            setInstallCaptainUrl(value);
          }}
          onCancel={() => setInstallCaptainDialogVisible(false)}
        />
      </Fragment>
    );
  };
  const renderWorkWXIntegrationUrl = () => {
    return (
      <Fragment>
        <div className="flexRow">
          <div className="flex flexColumn">
            <div className="Font14 bold mBottom7">{_l('申请上架企业微信通知')}</div>
            <div className="Gray_9e mBottom15">
              {_l('平台用户申请将应用上架到企业微信工作台，通过接口将平台用户申请通知到平台管理员')}
            </div>
            <div className="mBottom15 valignWrapper">
              <span className="Gray_9e mRight18">{_l('通知地址')}</span>
              <span>{workWxSelfBuildNoticUrl || _l('未配置')}</span>
              {workWxSelfBuildNoticUrl && (
                <Icon
                  icon="task-new-detail"
                  className="Font12 Gray_bd mLeft5 mTop3 pointer"
                  onClick={() => {
                    window.open(workWxSelfBuildNoticUrl);
                  }}
                />
              )}
            </div>
            <div>
              <Button
                ghost
                type="primary"
                onClick={() => {
                  setWorkWXIntegrationVisible(true);
                }}
              >
                {_l('设置')}
              </Button>
            </div>
          </div>
        </div>
        <WorkWXIntegrationDialog
          visible={workWXIntegrationVisible}
          onSave={value => {
            setWorkWxSelfBuildNoticUrl(value);
          }}
          onCancel={() => setWorkWXIntegrationVisible(false)}
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
      {IsPlatformLocal && (
        <Fragment>
          {renderEnableCreateProject()}
          <Divider className="mTop20 mBottom20" />
        </Fragment>
       )}
      {!IsPlatformLocal && (
        <Fragment>
          {renderAllowBindAccountNoVerify()}
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
      {(IsPlatformLocal || !md.global.SysSettings.hideWorkWeixin) && (
        <Fragment>
          <Divider className="mTop20 mBottom20" />
          {renderWorkWXIntegrationUrl()}
        </Fragment>
      )}
    </div>
  );
};

export default Base;
