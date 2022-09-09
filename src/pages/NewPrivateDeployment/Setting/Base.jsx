import React, { Fragment, useState } from 'react';
import { Switch, Input, Dialog } from 'ming-ui';
import { Button, Divider } from 'antd';
import ServerStateDialog from './components/ServerStateDialog';
import { updateSysSettings } from '../common';

const Base = (props) => {
  const { IsPlatformLocal } = md.global.Config;
  const { SysSettings } = md.global;
  const [hideHelpTip, setHideHelpTip] = useState(SysSettings.hideHelpTip);
  const [hideDownloadApp, setHideDownloadApp] = useState(SysSettings.hideDownloadApp);
  const [downloadAppRedirectUrl, setDownloadAppRedirectUrl] = useState(SysSettings.downloadAppRedirectUrl);
  const [appDialogVisible, setAppDialogVisible] = useState(false);
  const [hideTemplateLibrary, setHideTemplateLibrary] = useState(SysSettings.hideTemplateLibrary);
  const [serviceStatusWebhookUrl, setServiceStatusWebhookUrl] = useState(SysSettings.serviceStatusWebhookUrl);
  const [allowBindAccountNoVerify, setAllowBindAccountNoVerify] = useState(SysSettings.allowBindAccountNoVerify);
  const [serverStateDialogVisible, setServerStateDialogVisible] = useState(false);

  const renderHelpTip = () => {
    return (
      <div className="flexRow valignWrapper">
        <div className="flex flexColumn">
          <div className="Font14 bold mBottom8">{_l('帮助')}</div>
          <div className="Gray_9e">{_l('关闭/隐藏平台跳转至帮助中心的“帮助”图标')}</div>
        </div>
        <Switch
          checked={hideHelpTip}
          onClick={value => {
            value = !value;
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
                  <span className="Gray_9e mRight18">{_l('下载入口')}</span>
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
          <div className="Gray_9e">{_l('关闭/隐藏应用库')}</div>
        </div>
        <Switch
          checked={hideTemplateLibrary}
          onClick={value => {
            value = !value;
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
            <div className="Gray_9e mBottom15">{_l('平台服务运行健康状态推送，通过配置Webhook地址接收状态消息')}</div>
            <div className="mBottom15 valignWrapper">
              <span className="Gray_9e mRight18">{_l('服务推送 Webhook')}</span>
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

  return (
    <div className="privateCardWrap flexColumn">
      <div className="Font17 bold mBottom25">{_l('通用')}</div>
      {renderHelpTip()}
      <Divider className="mTop20 mBottom20" />
      {renderTemplateLibrary()}
      <Divider className="mTop20 mBottom20" />
      {!IsPlatformLocal && renderAllowBindAccountNoVerify()}
      {!IsPlatformLocal && <Divider className="mTop20 mBottom20" /> }
      {renderDownloadApp()}
      <Divider className="mTop20 mBottom20" />
      {renderServerState()}
    </div>
  );
}

export default Base;
