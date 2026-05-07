import React, { Component } from 'react';
import _ from 'lodash';
import projectSettingController from 'src/api/projectSetting';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import FeatureListWrap from '../../components/FeatureListWrap';
import Config from '../../config';
import limitFeatureDialogFunc from './LimitFeatureDialog';
import PwdFreeVerifyDialog from './PwdFreeVerify';

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
          superSearchOnlyManager = false,
        }) => {
          this.setState({
            apiIntgOnlyManager,
            dataPipeOnlyManager,
            onlyManagerCreateApp,
            pluginsOnlyManager,
            onlyManagerDeleteApp,
            superSearchOnlyManager,
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
      superSearchOnlyManager,
    } = this.state;

    const limitInfo = {
      onlyManagerCreateApp: _l('创建应用'),
      apiIntgOnlyManager: _l('创建 API 连接'),
      // dataPipeOnlyManager: _l('数据集成'),
      pluginsOnlyManager: _l('开发插件'),
      onlyManagerDeleteApp: _l('删除应用'),
      superSearchOnlyManager: _l('超级搜索 - 搜索记录'),
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
        <AdminTitle prefix={_l('安全 - 功能')} />
        <div className="orgManagementHeader Font17">{_l('功能')}</div>
        <FeatureListWrap
          projectId={projectId}
          configs={[
            { key: 'desc', description: _l('统一管理组织成员可使用的功能与安全相关能力') },
            {
              key: 'limitSystemFeature',
              title: _l('成员功能管控'),
              description: _l('限制全员使用的功能范围，仅允许授权的管理员使用相关功能'),
              showSlideIcon: true,
              customContent: !_.isEmpty(settings) ? (
                <div>
                  <span>{_l('已限制：')}</span>
                  <span className="bold">{settingsTxt}</span>
                </div>
              ) : undefined,
              onClick: () =>
                limitFeatureDialogFunc({
                  projectId,
                  data: {
                    onlyManagerCreateApp,
                    apiIntgOnlyManager,
                    dataPipeOnlyManager,
                    pluginsOnlyManager,
                    onlyManagerDeleteApp,
                    superSearchOnlyManager,
                  },
                  updateData: data => this.setState({ ...data }),
                }),
            },
            {
              key: 'passwordFreeVerification',
              title: _l('密码免验证策略'),
              description: _l('对审批、自定义动作禁用1小时内免验证功能，要求成员在每次操作时进行密码验证'),
              showSlideIcon: true,
              customContent: (
                <div>
                  <span>{_l('当前设置：')}</span>
                  <span className="bold">
                    {noneVerificationEnabled ? _l('允许一小时内免验证') : _l('每次操作均需验证')}
                  </span>
                </div>
              ),
              onClick: () =>
                PwdFreeVerifyDialog({
                  projectId,
                  enabled: noneVerificationEnabled,
                  updateEnabled: enabled => this.setState({ noneVerificationEnabled: enabled }),
                }),
            },
          ]}
        />
      </div>
    );
  }
}
