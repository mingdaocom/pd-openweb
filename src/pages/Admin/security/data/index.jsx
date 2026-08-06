import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import { Dialog, LoadDiv, Support, Switch, VerifyPasswordConfirm } from 'ming-ui';
import dataLimitAjax from 'src/api/dataLimit';
import openAuthorAjax from 'src/api/openAuthor';
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

const PERSONAL_API_ACCESS_DEFAULT_SETTING = {
  enabled: false,
  patEnabled: false,
};

const PersonalApiAccessPolicyWrap = styled.div`
  min-height: 190px;
`;

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
      showPersonalApiAccessPolicy: false,
      initApiAccessSetting: PERSONAL_API_ACCESS_DEFAULT_SETTING,
      editingPersonalApiAccessSetting: PERSONAL_API_ACCESS_DEFAULT_SETTING,
      personalApiAccessLoading: false,
      personalApiAccessSaveLoading: false,
      attachmentSettingInfo: {},
      showEncryptRules: type === 'isShowEncryptRules',
      showCliAccessPolicy: false,
      initCliAccessSetting: { enabled: false },
      editingCliAccessSetting: { enabled: false },
      cliAccessPolicyLoading: false,
      cliAccessPolicySaveLoading: false,
    };
  }

  componentDidMount() {
    this.getEnabledWatermark();
    this.getApiProxyState();
    this.getAttachmentSetting();
    this.getPersonalApiAccessSetting();
    this.getCliAccessPolicySetting();
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

  getPersonalApiAccessSetting = () => {
    this.setState({ personalApiAccessLoading: true });
    openAuthorAjax
      .getSetting({ projectId: Config.projectId })
      .then(({ enabled, patEnabled } = {}) => {
        this.setState({
          editingPersonalApiAccessSetting: { enabled, patEnabled },
          initApiAccessSetting: { enabled, patEnabled },
        });
      })
      .catch(() => {})
      .finally(() => {
        this.setState({ personalApiAccessLoading: false });
      });
  };

  getCliAccessPolicySetting = () => {
    this.setState({ cliAccessPolicyLoading: true });
    openAuthorAjax
      .getCliAccessPolicySetting({ projectId: Config.projectId })
      .then(data => {
        this.setState({
          initCliAccessSetting: { enabled: !!data },
          editingCliAccessSetting: { enabled: !!data },
        });
      })
      .catch(() => {})
      .finally(() => {
        this.setState({ cliAccessPolicyLoading: false });
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

  savePersonalApiAccessPolicy = () => {
    const { editingPersonalApiAccessSetting } = this.state;
    const { enabled, patEnabled } = editingPersonalApiAccessSetting;

    this.setState({ personalApiAccessSaveLoading: true });
    openAuthorAjax
      .editSetting({
        projectId: Config.projectId,
        enabled: enabled,
        patEnabled: patEnabled,
      })
      .then(res => {
        if (res) {
          alert(_l('操作成功'));
          this.setState({ showPersonalApiAccessPolicy: false, initApiAccessSetting: editingPersonalApiAccessSetting });
        } else {
          alert(_l('操作失败'), 2);
        }
      })
      .catch(() => {})
      .finally(() => {
        this.setState({ personalApiAccessSaveLoading: false });
      });
  };

  verifyAndSavePersonalApiAccessPolicy = () => {
    VerifyPasswordConfirm.confirm({
      onOk: this.savePersonalApiAccessPolicy,
    });
  };

  saveCliAccessPolicy = () => {
    const { editingCliAccessSetting } = this.state;

    this.setState({ cliAccessPolicySaveLoading: true });
    openAuthorAjax
      .editCliAccessPolicySetting({
        projectId: Config.projectId,
        enabled: editingCliAccessSetting.enabled,
      })
      .then(res => {
        if (res) {
          alert(_l('操作成功'));
          this.setState({ showCliAccessPolicy: false, initCliAccessSetting: { ...editingCliAccessSetting } });
        } else {
          alert(_l('操作失败'), 2);
        }
      })
      .catch(() => {})
      .finally(() => {
        this.setState({ cliAccessPolicySaveLoading: false });
      });
  };

  verifyAndSaveCliAccessPolicy = () => {
    VerifyPasswordConfirm.confirm({
      onOk: this.saveCliAccessPolicy,
    });
  };

  renderPersonalApiAccessPolicyEnabledContent = () => {
    const { initApiAccessSetting } = this.state;
    const enabledStrategies = [
      initApiAccessSetting.enabled ? _l('平台级 OAuth 应用') : '',
      initApiAccessSetting.patEnabled ? _l('个人访问令牌') : '',
    ].filter(Boolean);

    if (!enabledStrategies.length) return null;

    return (
      <div>
        {_l('已开启：')}
        {enabledStrategies.join('、')}
      </div>
    );
  };

  openPersonalApiAccessPolicy = () => {
    const { initApiAccessSetting } = this.state;

    this.setState({
      showPersonalApiAccessPolicy: true,
      editingPersonalApiAccessSetting: { ...initApiAccessSetting },
    });
  };

  openCliAccessPolicy = () => {
    const { initCliAccessSetting } = this.state;

    this.setState({
      showCliAccessPolicy: true,
      editingCliAccessSetting: { ...initCliAccessSetting },
    });
  };

  renderPolicyItem = ({ checked, onChange, title, description }) => {
    return (
      <div className="flexRow mBottom24">
        <Switch className="mRight16 mTop3" checked={checked} onClick={value => onChange(!value)} />
        <div className="flex minWidth0">
          <div className="textTitle Font14 bold">{title}</div>
          <div className="textSecondary mTop5">{description}</div>
        </div>
      </div>
    );
  };

  renderPersonalApiAccessPolicyDialog = () => {
    const {
      showPersonalApiAccessPolicy,
      personalApiAccessLoading,
      personalApiAccessSaveLoading,
      editingPersonalApiAccessSetting,
      initApiAccessSetting,
    } = this.state;

    const { enabled, patEnabled } = editingPersonalApiAccessSetting;

    if (!showPersonalApiAccessPolicy) return null;

    return (
      <Dialog
        visible
        title={_l('API 访问策略')}
        width={600}
        okText={_l('保存')}
        okDisabled={
          personalApiAccessSaveLoading ||
          (editingPersonalApiAccessSetting.enabled === initApiAccessSetting.enabled &&
            editingPersonalApiAccessSetting.patEnabled === initApiAccessSetting.patEnabled)
        }
        onOk={this.verifyAndSavePersonalApiAccessPolicy}
        showCancel={false}
        overlayClosable={false}
        onCancel={() => this.setState({ showPersonalApiAccessPolicy: false })}
      >
        <PersonalApiAccessPolicyWrap>
          {personalApiAccessLoading ? (
            <LoadDiv />
          ) : (
            <Fragment>
              <div className="textSecondary mBottom24">
                {_l('允许使用以下授权方式，按个人身份权限调用 API 访问组织数据')}
              </div>
              {this.renderPolicyItem({
                checked: enabled,
                onChange: value =>
                  this.setState({
                    editingPersonalApiAccessSetting: { ...this.state.editingPersonalApiAccessSetting, enabled: value },
                  }),
                title: _l('平台级 OAuth 应用'),
                description: _l('关闭后，用户将不允许使用平台级 OAuth 应用的方式访问数据，等同于关闭OAuth应用集成'),
              })}
              {this.renderPolicyItem({
                checked: patEnabled,
                onChange: value =>
                  this.setState({
                    editingPersonalApiAccessSetting: {
                      ...this.state.editingPersonalApiAccessSetting,
                      patEnabled: value,
                    },
                  }),
                title: _l('个人访问令牌'),
                description: _l('关闭后，用户将不允许选择当前组织生成个人访问令牌，且已生成的令牌会立即失效'),
              })}
            </Fragment>
          )}
        </PersonalApiAccessPolicyWrap>
      </Dialog>
    );
  };

  renderCliAccessPolicyDialog = () => {
    const {
      showCliAccessPolicy,
      cliAccessPolicyLoading,
      cliAccessPolicySaveLoading,
      editingCliAccessSetting,
      initCliAccessSetting,
    } = this.state;

    if (!showCliAccessPolicy) return null;

    return (
      <Dialog
        visible
        title={_l('CLI 访问策略')}
        width={600}
        okText={_l('保存')}
        okDisabled={cliAccessPolicySaveLoading || editingCliAccessSetting.enabled === initCliAccessSetting.enabled}
        onOk={this.verifyAndSaveCliAccessPolicy}
        showCancel={false}
        overlayClosable={false}
        onCancel={() => this.setState({ showCliAccessPolicy: false })}
      >
        <div>
          {cliAccessPolicyLoading ? (
            <LoadDiv />
          ) : (
            <Fragment>
              <div className="textSecondary mBottom24">{_l('控制是否允许 CLI 工具以用户身份访问本组织数据')}</div>
              {this.renderPolicyItem({
                checked: editingCliAccessSetting.enabled,
                onChange: value => this.setState({ editingCliAccessSetting: { enabled: value } }),
                title: _l('启用 CLI 访问'),
                description: _l('关闭后，将禁止 CLI 工具以用户身份权限访问组织数据'),
              })}
            </Fragment>
          )}
        </div>
      </Dialog>
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
      initApiAccessSetting,
      initCliAccessSetting,
    } = this.state;

    const projectId = Config.projectId;
    const personalApiAccessPolicyEnabled = !!initApiAccessSetting.enabled || !!initApiAccessSetting.patEnabled;

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
                key: 'personalApiAccessPolicy',
                title: _l('API 访问策略'),
                description: _l('限制成员使用个人身份权限（OAuth 授权、个人访问令牌）直接调用 API，降低数据泄露风险。'),
                showSlideIcon: true,
                customContent: this.renderPersonalApiAccessPolicyEnabledContent(),
                isEnabled: personalApiAccessPolicyEnabled,
                onClick: this.openPersonalApiAccessPolicy,
              },
              {
                key: 'webProxy',
                title: _l('API 网络代理'),
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
              md.global.SysSettings.enableAIConnector !== false && {
                key: 'cliAccessPolicy',
                title: _l('CLI 访问策略'),
                description: _l('控制是否允许 CLI 工具以用户身份访问本组织数据，保障组织数据安全'),
                showSlideIcon: true,
                isEnabled: !!initCliAccessSetting.enabled,
                onClick: this.openCliAccessPolicy,
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
            ].filter(Boolean)}
          />
        </div>
        {this.renderWaterMarkSetting()}
        {this.renderPersonalApiAccessPolicyDialog()}
        {this.renderCliAccessPolicyDialog()}
      </div>
    );
  }
}
