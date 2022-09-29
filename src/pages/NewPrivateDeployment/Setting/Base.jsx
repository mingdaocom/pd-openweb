import React, { Fragment, useState } from 'react';
import { Icon, Switch, Input, Dialog } from 'ming-ui';
import { Button, Divider } from 'antd';
import ServerStateDialog from './components/ServerStateDialog';
import InstallCaptainDialog from './components/InstallCaptainDialog';
import { updateSysSettings } from '../common';

const Base = (props) => {
  const { IsPlatformLocal, IsCluster } = md.global.Config;
  const { SysSettings } = md.global;
  const [hideHelpTip, setHideHelpTip] = useState(SysSettings.hideHelpTip);
  const [hideDownloadApp, setHideDownloadApp] = useState(SysSettings.hideDownloadApp);
  const [downloadAppRedirectUrl, setDownloadAppRedirectUrl] = useState(SysSettings.downloadAppRedirectUrl);
  const [appDialogVisible, setAppDialogVisible] = useState(false);
  const [hideTemplateLibrary, setHideTemplateLibrary] = useState(SysSettings.hideTemplateLibrary);
  const [serviceStatusWebhookUrl, setServiceStatusWebhookUrl] = useState(SysSettings.serviceStatusWebhookUrl);
  const [allowBindAccountNoVerify, setAllowBindAccountNoVerify] = useState(SysSettings.allowBindAccountNoVerify);
  const [serverStateDialogVisible, setServerStateDialogVisible] = useState(false);
  const [enableCreateProject, setEnableCreateProject] = useState(SysSettings.enableCreateProject);
  const [installCaptainUrl, setInstallCaptainUrl] = useState(SysSettings.installCaptainUrl);
  const [installCaptainDialogVisible, setInstallCaptainDialogVisible] = useState(false);

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

  const renderTemplateLibrary = () => {
    return (
      <div className="flexRow valignWrapper">
        <div className="flex flexColumn">
          <div className="Font14 bold mBottom8">{_l('应用库')}</div>
          <div className="Gray_9e">{_l('显示应用库')}</div>
        </div>
        <Switch
          checked={!hideTemplateLibrary}
          onClick={value => {
            updateSysSettings({
              hideTemplateLibrary: value
            }, () => {
              setHideTemplateLibrary(value);
              md.global.SysSettings.hideTemplateLibrary = value;
            });
          }}
        />
      </div>
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
          onSave={(value) => {
            setInstallCaptainUrl(value);
          }}
          onCancel={() => setInstallCaptainDialogVisible(false)}
        />
      </Fragment>
    );
  }

  return (
    <div className="privateCardWrap flexColumn">
      <div className="Font17 bold mBottom25">{_l('通用')}</div>
      {renderHelpTip()}
      <Divider className="mTop20 mBottom20" />
      {renderTemplateLibrary()}
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
    </div>
  );
}

export default Base;
