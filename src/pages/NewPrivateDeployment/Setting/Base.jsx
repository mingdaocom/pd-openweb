import React, { Fragment, useEffect, useState } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import _ from 'lodash';
import { Input, Icon, Switch, Dialog, Menu, MenuItem } from 'ming-ui';
import { Button, Divider } from 'antd';
import Trigger from 'rc-trigger';
import privatePushAjax from 'src/api/privatePush';
import ServerStateDialog from './components/ServerStateDialog';
import InstallCaptainDialog from './components/InstallCaptainDialog';
import IOSAppPushDialog from './components/IOSAppPushDialog';
import AddPushSetting from './components/AddPushSetting';
import AndroidPushSettingDialog from './components/AndroidPushSetting';
import { updateSysSettings, ANDROID_APPS, APP_PUSH_CONFIG } from '../common';

const Card = styled.div`
  width: 100%;
  height: 48px;
  border-radius: 3px;
  border: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  img {
    width: 20px;
    height: 20px;
  }
`;

const MenuWrap = styled(Menu)`
  width: 160px !important;
  position: static !important;
  .red {
    color: #f51744 !important;
  }
  .ming.MenuItem .Item-content:not(.disabled):hover {
    background-color: #f5f5f5 !important;
  }
`;

const Base = props => {
  const { IsPlatformLocal, IsCluster } = md.global.Config;
  const { SysSettings } = md.global;
  const [sysSettings, setSysSettings] = useSetState({
    hidePlugin: false,
    ...SysSettings,
    serverStateDialogVisible: false,
    installCaptainDialogVisible: false,
    iOSPushDialogVisible: false,
    androidPushDialog: { visible: false, type: 'mi' },
    pushSetting: {},
    pushSettingOptionVisible: undefined,
  });
  const {
    hideHelpTip,
    hideIntegration,
    hideIntegrationLibrary,
    hideDownloadApp,
    downloadAppRedirectUrl,
    serviceStatusWebhookUrl,
    serverStateDialogVisible,
    enableCreateProject,
    installCaptainUrl,
    installCaptainDialogVisible,
    hidePlugin,
    iOSPushDialogVisible,
    androidPushDialog,
    pushSetting,
    pushSettingOptionVisible,
  } = sysSettings;

  useEffect(() => {
    getPushSetting();
  }, []);

  const getPushSetting = () => {
    privatePushAjax
      .getPushSetting()
      .then(res => setSysSettings({ pushSetting: { ...res, ios: res.ios || { status: 0, first: true } } }));
  };

  const saveDownloadAppUrl = e => {
    if (SysSettings.downloadAppRedirectUrl === e.target.value) return;

    updateSysSettings({ downloadAppRedirectUrl: e.target.value }, () => {
      md.global.SysSettings.downloadAppRedirectUrl = downloadAppRedirectUrl;
    });
  };

  const handleChangePushStatus = (value, key) => {
    const status = value ? 0 : 1;
    const item = pushSetting[key];

    if (status && _.get(item, 'first')) {
      setSysSettings({ iOSPushDialogVisible: true });
    } else {
      privatePushAjax.setPushSettingEnable({ pushMode: APP_PUSH_CONFIG[key].value, status }).then(res => {
        res && setSysSettings({ pushSetting: { ...pushSetting, [key]: { ...item, status } } });
      });
    }
  };

  const onEdit = key => {
    const param = { pushSettingOptionVisible: undefined };

    if (key === 'ios') param.iOSPushDialogVisible = true;
    else param.androidPushDialog = { visible: true, type: key };

    setSysSettings(param);
  };

  const onDelete = key => {
    setSysSettings({ pushSettingOptionVisible: undefined });
    privatePushAjax.deletePushSetting({ pushMode: APP_PUSH_CONFIG[key].value }).then(res => {
      if (res) {
        alert(_l('删除成功'));
        setSysSettings({ pushSetting: _.omit(pushSetting, [key]) });
      } else {
        alert(_l('删除失败'));
      }
    });
  };

  const onUpdate = (key, value) => {
    setSysSettings({
      androidPushDialog: { visible: false, type: 'mi' },
      pushSetting: {
        ...pushSetting,
        [key]: pushSetting[key] ? { ...pushSetting[key], ...value } : value,
      },
    });
  };

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
            <div className="Font14 bold mBottom7">{_l('下载入口')}</div>
            <div className="Gray_9e mBottom30">{_l('开启后，在个人头像下拉列表显示App下载入口')}</div>
            {!hideDownloadApp && (
              <Fragment>
                <div className="Font14 bold mBottom7">{_l('下载地址')}</div>
                <div className="Gray_9e mBottom10">{_l('为空时，默认使用通用App下载地址')}</div>
                <Input
                  className="w100"
                  value={downloadAppRedirectUrl}
                  onChange={value => setSysSettings({ downloadAppRedirectUrl: value })}
                  onBlur={saveDownloadAppUrl}
                />
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

  const renderAppPushCard = key => {
    const appConfig = APP_PUSH_CONFIG[key];
    const data = pushSetting[key];
    const iOS = key === 'ios';

    if (!pushSetting[key] && !iOS) return null;

    return (
      <Card className={iOS ? '' : 'mBottom12'} key={`appPushCard-${key}`}>
        <img className="mLeft20 " src={appConfig.icon} />
        <span className="name mLeft8 flex ellipsis">{appConfig.name}</span>
        <Switch
          className="mLeft16"
          size="small"
          checked={data && data.status === 1}
          onClick={value => handleChangePushStatus(value, key)}
        />
        <Trigger
          popupVisible={pushSettingOptionVisible === key}
          onPopupVisibleChange={visible => setSysSettings({ pushSettingOptionVisible: visible ? key : undefined })}
          action={['click']}
          popupAlign={{
            points: ['tr', 'br'],
            offset: [0, 10],
            overflow: { adjustX: true, adjustY: true },
          }}
          popup={() => (
            <MenuWrap>
              <MenuItem key="edit" onClick={() => onEdit(key)}>
                <span className="Gray">{_l('编辑配置')}</span>
              </MenuItem>
              {key !== 'ios' && (
                <MenuItem key="delete" onClick={() => onDelete(key)}>
                  <span className="red">{_l('删除')}</span>
                </MenuItem>
              )}
            </MenuWrap>
          )}
        >
          <Icon icon="more_vert" className="Font18 Gray_bd mLeft16 mRight10" />
        </Trigger>
      </Card>
    );
  };

  const renderAppSetting = () => {
    return (
      <div className="privateCardWrap flexColumn">
        <div className="Font17 bold mBottom25">{_l('APP')}</div>
        {renderDownloadApp()}
        <Divider className="mTop20 mBottom20" />
        <div className="Font14 bold mBottom7">{_l('定制版App消息推送通道配置')}</div>
        <div className="Gray_9e mBottom20">{_l('未开启配置则使用默认消息推送通道')}</div>
        <div className="Font13 Gray mBottom10">{_l('iOS')}</div>
        {renderAppPushCard('ios')}
        <div className="Font13 Gray mBottom10 mTop20">{_l('安卓')}</div>
        {ANDROID_APPS.map(l => renderAppPushCard(l.key))}
        <AddPushSetting
          selectList={ANDROID_APPS.filter(l => !!pushSetting[l.key]).map(l => l.key)}
          className=""
          onAdd={onEdit}
        />
        <IOSAppPushDialog
          visible={iOSPushDialogVisible}
          data={_.pick(pushSetting.ios, [
            'certName',
            'certPath',
            'certFullPath',
            'certExpireTime',
            'keyName',
            'keyPath',
            'keyFullPath',
            'bundleId',
            'password',
          ])}
          onOk={() => {
            setSysSettings({ iOSPushDialogVisible: false });
            getPushSetting();
          }}
          onCancel={() => setSysSettings({ iOSPushDialogVisible: false })}
        />
        {androidPushDialog.visible && (
          <AndroidPushSettingDialog
            visible={androidPushDialog.visible}
            type={androidPushDialog.type}
            data={pushSetting[androidPushDialog.type]}
            onOk={onUpdate}
            onClose={() => setSysSettings({ androidPushDialog: { visible: false, type: 'mi' } })}
          />
        )}
      </div>
    );
  };

  return (
    <Fragment>
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
        {renderServerState()}
        {/*!IsCluster && (
          <Fragment>
            <Divider className="mTop20 mBottom20" />
            {renderInstallCaptainUrl()}
          </Fragment>
        )*/}
      </div>
      {renderAppSetting()}
    </Fragment>
  );
};

export default Base;
