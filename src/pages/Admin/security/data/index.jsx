import React, { Component, Fragment } from 'react';
import { Support } from 'ming-ui';
import dataLimitAjax from 'src/api/dataLimit';
import projectSettingController from 'src/api/projectSetting';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import { VersionProductType } from 'src/utils/enum';
import FeatureListWrap from '../../components/FeatureListWrap';
import Config from '../../config';
import AppAccess from './AppAccess';
import EncryptRules from './encryptRules';
import { LIMIT_FILE_DOWNLOAD_USE_TYPE_ENUM } from './enum';
import LimitFileDownloadSetting from './LimitFileDownloadSetting';
import WaterMarkSettingDialog from './WaterMarkSettingDialog';
import WebProxySetting from './WebProxySetting';

export default class DataCom extends Component {
  constructor(props) {
    super(props);
    const { type } = props.match.params || {};

    this.state = {
      watermark: false,
      showWebProxySetting: false,
      showLimitDownload: false,
      enabledWatermarkTxt: undefined,
      showAppAccess: false,
      attachmentSettingInfo: {},
      showEncryptRules: type === 'isShowEncryptRules',
    };
  }

  componentDidMount() {
    this.getEnabledWatermark();
    this.getApiProxyState();
    this.getAttachmentSetting();
  }

  getEnabledWatermark = () => {
    projectSettingController.getEnabledWatermark({ projectId: Config.projectId }).then(res => {
      this.setState({ watermark: res.enabledWatermark, enabledWatermarkTxt: res.enabledWatermarkTxt });
    });
  };

  getApiProxyState = () => {
    projectSettingController.getApiProxyState({ projectId: Config.projectId }).then(res => {
      this.setState({ webProxy: res });
    });
  };

  getAttachmentSetting = () => {
    dataLimitAjax.getAttachmentSetting({ projectId: Config.projectId }).then(res => {
      this.setState({
        limitFileDownload: res.status,
        limitType: res.limitType,
        attachmentSettingInfo: res,
      });
    });
  };

  setEnabledWatermark = () => {
    const { watermark } = this.state;

    projectSettingController
      .setEnabledWatermark({ projectId: Config.projectId, enabledWatermark: !watermark })
      .then(res => {
        if (res) {
          this.setState({ watermark: !watermark });
          setTimeout(() => {
            location.reload();
          }, 500);
        }
      });
  };

  updateWebProxyState = () => {
    const { webProxy } = this.state;
    projectSettingController
      .setApiProxyState({
        projectId: Config.projectId,
        state: !webProxy,
      })
      .then(res => {
        if (!res) {
          alert(_l('操作失败'), 2);
        } else {
          this.setState({ webProxy: !webProxy });
        }
      });
  };

  setLimitDownloadStatus = () => {
    const { limitFileDownload, limitType } = this.state;
    dataLimitAjax
      .editAttachmentSetting({
        projectId: Config.projectId,
        status: limitFileDownload ? 0 : 1,
        limitType,
      })
      .then(res => {
        if (res) {
          this.setState({
            limitFileDownload: !limitFileDownload,
          });
        }
      });
  };

  renderWaterMarkSetting = () => {
    const { showWaterMarkSetting, enabledWatermarkTxt } = this.state;

    if (!showWaterMarkSetting) return null;

    return (
      <WaterMarkSettingDialog
        visible={showWaterMarkSetting}
        defaultValue={enabledWatermarkTxt || ''}
        onClose={() => this.setState({ showWaterMarkSetting: false })}
      />
    );
  };

  renderAttachmentSetting = () => {
    const { attachmentSettingInfo, limitFileDownload } = this.state;
    const { limitType, useType, modelType, ipList = [] } = attachmentSettingInfo;
    if (!limitFileDownload) return null;

    return (
      <div className="flexRow">
        {modelType === 1 ? (
          <Fragment>
            <span className="mRight3 flex-shrink-0">{_l('已设置：IP')}</span>
            <span>{LIMIT_FILE_DOWNLOAD_USE_TYPE_ENUM.find(item => item.value === useType)?.text}</span>
            <span className="minWidth0 ellipsis mLeft3 mRight3">{ipList.join(',')}</span>
          </Fragment>
        ) : (
          <Fragment>
            <span className="mRight3">{_l('已设置：设备类型')}</span>
            <span>{LIMIT_FILE_DOWNLOAD_USE_TYPE_ENUM.find(item => item.value === useType)?.text}</span>
            <span className="ellipsis mLeft3 mRight3">
              {limitType === 0 ? _l('所有设备') : limitType === 2 ? _l('PC端') : _l('移动端')}
            </span>
          </Fragment>
        )}

        <span className="flex-shrink-0">{_l('限制下载')}</span>
      </div>
    );
  };

  render() {
    const {
      showEncryptRules,
      watermark,
      showWebProxySetting,
      webProxy,
      limitFileDownload,
      showLimitDownload,
      showAppAccess,
      attachmentSettingInfo,
    } = this.state;
    const projectId = Config.projectId;

    if (showAppAccess) {
      return <AppAccess projectId={projectId} onClose={() => this.setState({ showAppAccess: false })} />;
    }

    if (showEncryptRules) {
      return <EncryptRules onClose={() => this.setState({ showEncryptRules: false })} projectId={projectId} />;
    }

    if (showWebProxySetting) {
      return <WebProxySetting onClose={() => this.setState({ showWebProxySetting: false })} projectId={projectId} />;
    }
    if (showLimitDownload) {
      return (
        <LimitFileDownloadSetting
          projectId={projectId}
          attachmentSettingInfo={attachmentSettingInfo}
          onClose={() => this.setState({ showLimitDownload: false })}
          updateSettingData={newAttachmentSettingInfo =>
            this.setState({
              attachmentSettingInfo: newAttachmentSettingInfo,
              limitType: attachmentSettingInfo.limitType,
            })
          }
        />
      );
    }

    return (
      <div className="orgManagementWrap">
        <AdminTitle prefix={_l('安全 - 数据')} />
        <div className="orgManagementHeader Font17">{_l('数据')}</div>
        <div className="orgManagementContent pAll0">
          <FeatureListWrap
            projectId={projectId}
            configs={[
              {
                key: 'appAccess',
                title: _l('应用访问'),
                description: _l('设置访问应用策略。保护组织应用数据安全'),
                showSlideIcon: true,
                featureId: VersionProductType.appAccessPolicy,
                onClick: () => this.setState({ showAppAccess: true }),
              },
              {
                key: 'limitFileDownload',
                title: _l('附件下载'),
                description: _l('禁止成员下载应用、讨论附件，保护组织文件安全'),
                showSlideIcon: false,
                showSwitch: true,
                showSetting: limitFileDownload ? true : false,
                switchChecked: limitFileDownload ? true : false,
                customContent: this.renderAttachmentSetting(),
                featureId: VersionProductType.attachmentDownPolicy,
                clickSwitch: this.setLimitDownloadStatus,
                clickSetting: () => this.setState({ showLimitDownload: true }),
              },
              {
                key: 'watermark',
                title: _l('屏幕水印'),
                description: _l('启用水印配置后，将在组织所有应用内显示水印。可自定义水印文字'),
                showSlideIcon: false,
                showSwitch: true,
                switchChecked: watermark,
                showSetting: watermark,
                clickSwitch: this.setEnabledWatermark,
                clickSetting: () => this.setState({ showWaterMarkSetting: true }),
              },
              {
                key: 'addressVisibleRange',
                title: _l('加密规则'),
                description: _l('配置工作表字段加密存储时可以选择的加密方式'),
                showSlideIcon: true,
                featureId: VersionProductType.dataEnctypt,
                onClick: () => this.setState({ showEncryptRules: true }),
              },
              {
                key: 'webProxy',
                title: _l('API网络代理'),
                description: (
                  <span>
                    {_l('在发送API请求时可选择通过设置的代理服务器发送')}
                    <Support text={_l('帮助')} type={3} href="https://help.mingdao.com/org/security#apiproxy" />
                  </span>
                ),
                showSlideIcon: false,
                showSetting: webProxy,
                showSwitch: true,
                switchChecked: webProxy,
                featureId: VersionProductType.apiRequestProxy,
                clickSwitch: this.updateWebProxyState,
                clickSetting: () => this.setState({ showWebProxySetting: true }),
              },
            ]}
          />
        </div>
        {this.renderWaterMarkSetting()}
      </div>
    );
  }
}
