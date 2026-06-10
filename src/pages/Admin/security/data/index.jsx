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
      enabledWatermark: false,
      showWebProxySetting: false,
      showLimitDownload: false,
      enabledWatermarkTxt: '',
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
      this.setState(res);
    });
  };

  getApiProxyState = () => {
    projectSettingController.getApiProxyState({ projectId: Config.projectId }).then(res => {
      this.setState({ apiProxyEnabled: res });
    });
  };

  getAttachmentSetting = () => {
    dataLimitAjax.getAttachmentSetting({ projectId: Config.projectId }).then(res => {
      this.setState({ attachmentSettingInfo: res });
    });
  };

  updateWebProxyState = () => {
    const { apiProxyEnabled } = this.state;
    projectSettingController
      .setApiProxyState({
        projectId: Config.projectId,
        state: !apiProxyEnabled,
      })
      .then(res => {
        if (!res) {
          alert(_l('操作失败'), 2);
        } else {
          this.setState({ apiProxyEnabled: !apiProxyEnabled });
        }
      });
  };

  renderWaterMarkSetting = () => {
    const { showWaterMarkSetting, enabledWatermarkTxt, enabledWatermark } = this.state;

    if (!showWaterMarkSetting) return null;

    return (
      <WaterMarkSettingDialog
        visible={showWaterMarkSetting}
        enabledWatermarkTxt={enabledWatermarkTxt}
        enabledWatermark={enabledWatermark}
        updateEnabledWatermark={newEnabledWatermark => this.setState({ enabledWatermark: newEnabledWatermark })}
        onClose={() => this.setState({ showWaterMarkSetting: false })}
      />
    );
  };

  renderAttachmentSetting = () => {
    const { attachmentSettingInfo } = this.state;
    const { limitType, useType, modelType, ipList = [], status } = attachmentSettingInfo;
    if (!status) return null;

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
      enabledWatermark,
      showWebProxySetting,
      apiProxyEnabled,
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
      return (
        <WebProxySetting
          projectId={projectId}
          apiProxyEnabled={apiProxyEnabled}
          updateApiProxyEnabled={newApiProxyEnabled => this.setState({ apiProxyEnabled: newApiProxyEnabled })}
          onClose={() => this.setState({ showWebProxySetting: false })}
        />
      );
    }

    if (showLimitDownload) {
      return (
        <LimitFileDownloadSetting
          projectId={projectId}
          attachmentSettingInfo={attachmentSettingInfo}
          onClose={() => this.setState({ showLimitDownload: false })}
          updateSettingData={newAttachmentSettingInfo =>
            this.setState({ attachmentSettingInfo: newAttachmentSettingInfo })
          }
        />
      );
    }

    return (
      <div className="orgManagementWrap">
        <AdminTitle prefix={_l('安全 - 数据与访问')} />
        <div className="orgManagementHeader Font17">{_l('数据与访问')}</div>
        <div className="orgManagementContent pAll0">
          <FeatureListWrap
            projectId={projectId}
            configs={[
              {
                key: 'desc',
                description: _l('对组织成员的数据访问、下载与关键操作进行统一管控，降低数据泄露与误操作风险'),
              },
              {
                key: 'appAccess',
                title: _l('应用访问策略'),
                description: _l('限制成员在特定网络和设备环境下可访问应用，可基于 IP、设备类型等设置访问范围'),
                showSlideIcon: true,
                featureId: VersionProductType.appAccessPolicy,
                onClick: () => this.setState({ showAppAccess: true }),
              },
              {
                key: 'limitFileDownload',
                title: _l('限制附件下载'),
                description: _l('限制成员在特定网络或设备环境下下载附件，防止文件外泄'),
                showSlideIcon: true,
                customContent: this.renderAttachmentSetting(),
                featureId: VersionProductType.attachmentDownPolicy,
                isEnabled: !!attachmentSettingInfo.status,
                onClick: () => this.setState({ showLimitDownload: true }),
              },
              {
                key: 'watermark',
                title: _l('屏幕水印'),
                description: _l('为组织内所有应用内容显示屏幕水印，防止截图、拍照等场景下的数据外泄'),
                showSlideIcon: true,
                isEnabled: enabledWatermark,
                onClick: () => this.setState({ showWaterMarkSetting: true }),
              },
              {
                key: 'webProxy',
                title: _l('API网络代理'),
                description: (
                  <span>
                    {_l('通过设置的代理服务发送API请求，适用于内网部署、专线访问或网络合规场景')}
                    <Support text={_l('帮助')} type={3} href="https://help.mingdao.com/org/security#apiproxy" />
                  </span>
                ),
                showSlideIcon: true,
                featureId: VersionProductType.apiRequestProxy,
                isEnabled: apiProxyEnabled,
                onClick: () => this.setState({ showWebProxySetting: true }),
              },
              {
                key: 'addressVisibleRange',
                title: _l('加密规则'),
                description: (
                  <span>
                    {_l('配置工作表字段的加密存储规则，用于保护敏感数据的数据库安全')}
                    <Support text={_l('帮助')} type={3} href="https://help.mingdao.com/org/security#encryption" />
                  </span>
                ),
                showSlideIcon: true,
                featureId: VersionProductType.dataEnctypt,
                onClick: () => this.setState({ showEncryptRules: true }),
              },
            ]}
          />
        </div>
        {this.renderWaterMarkSetting()}
      </div>
    );
  }
}
