import React, { Component } from 'react';
import _ from 'lodash';
import projectSettingController from 'src/api/projectSetting';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import FeatureListWrap from '../../components/FeatureListWrap';
import Config from '../../config';
import limitFeatureDialogFunc from './LimitFeatureDialog';

export default class SecurityOthers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      noneVerificationEnabled: false,
      onlyManagerCreateApp: false,
    };
  }

  componentDidMount() {
    this.getEnabledNoneVerification();
    this.getOnlyManagerSettings();
  }

  getEnabledNoneVerification = () => {
    projectSettingController
      .getEnabledNoneVerification({ projectId: Config.projectId })
      .then(({ noneVerificationEnabled }) => {
        this.setState({ noneVerificationEnabled });
      });
  };

  setEnabledNoneVerification = () => {
    const { noneVerificationEnabled } = this.state;
    projectSettingController
      .setEnabledNoneVerification({ projectId: Config.projectId, enabledNoneVerification: !noneVerificationEnabled })
      .then(res => {
        if (res) {
          this.setState({ noneVerificationEnabled: !noneVerificationEnabled });
        }
      });
  };

  getOnlyManagerSettings() {
    projectSettingController
      .getOnlyManagerSettings({ projectId: Config.projectId })
      .then(
        ({
          apiIntgOnlyManager = false,
          dataPipeOnlyManager = false,
          onlyManagerCreateApp = false,
          pluginsOnlyManager = false,
          onlyManagerDeleteApp = false,
        }) => {
          this.setState({
            apiIntgOnlyManager,
            dataPipeOnlyManager,
            onlyManagerCreateApp,
            pluginsOnlyManager,
            onlyManagerDeleteApp,
          });
        },
      );
  }

  render() {
    const projectId = Config.projectId;
    const {
      noneVerificationEnabled,
      onlyManagerCreateApp,
      apiIntgOnlyManager,
      dataPipeOnlyManager,
      pluginsOnlyManager,
      onlyManagerDeleteApp,
    } = this.state;

    const limitInfo = {
      onlyManagerCreateApp: _l('创建应用'),
      apiIntgOnlyManager: _l('创建 API 连接'),
      // dataPipeOnlyManager: _l('数据集成'),
      pluginsOnlyManager: _l('开发插件'),
      onlyManagerDeleteApp: _l('删除应用'),
    };

    const settings = Object.keys(limitInfo).filter(
      v =>
        !(v === 'pluginsOnlyManager' && md.global.SysSettings.hidePlugin) &&
        !(v === 'apiIntgOnlyManager' && md.global.SysSettings.hideIntegration) &&
        this.state[v],
    );
    const settingsTxt = settings.map(item => limitInfo[item]).join('、');

    return (
      <div className="orgManagementWrap">
        <AdminTitle prefix={_l('安全 - 其他')} />
        <div className="orgManagementHeader Font17">{_l('其他')}</div>
        <FeatureListWrap
          projectId={projectId}
          configs={[
            {
              key: 'limitSystemFeature',
              title: _l('功能限制'),
              description: _l('开启限制后，全员无法使用，只允许授权的管理员使用'),
              showSlideIcon: true,
              customContent: !_.isEmpty(settings) ? _l(_l('已限制:%0', settingsTxt)) : undefined,
              onClick: () =>
                limitFeatureDialogFunc({
                  projectId,
                  data: {
                    onlyManagerCreateApp,
                    apiIntgOnlyManager,
                    dataPipeOnlyManager,
                    pluginsOnlyManager,
                    onlyManagerDeleteApp,
                  },
                  updateData: data => this.setState({ ...data }),
                }),
            },

            {
              key: 'passwordFreeVerification',
              title: _l('操作免验证'),
              description: _l(
                '关闭后，全组织下的自定义按钮、审批配置了登录密码验证的地方必须每次验证密码后方可继续操作',
              ),
              showSlideIcon: false,
              showSwitch: true,
              switchChecked: noneVerificationEnabled,
              clickSwitch: this.setEnabledNoneVerification,
            },
          ].filter(v => (md.global.Config.IsLocal ? true : v.key !== 'limitFileDownload'))}
        />
      </div>
    );
  }
}
