import React, { Component } from 'react';
import _ from 'lodash';
import aiModelAuthAjax from 'src/api/dataLimit.js';
import projectSettingController from 'src/api/projectSetting';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import { VersionProductType } from 'src/utils/enum';
import FeatureListWrap from '../../components/FeatureListWrap';
import Config from '../../config';
import AIModelRule from './AIModelRule';
import limitFeatureDialogFunc from './LimitFeatureDialog';
import PwdFreeVerifyDialog from './PwdFreeVerify';

export default class SecurityOthers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      noneVerificationEnabled: false,
      onlyManagerCreateApp: false,
      aiModelRuleList: [],
      aiModelRuleListLoaded: false,
      aiModelRuleListLoading: false,
      showAIModelRule: false,
    };
  }

  componentDidMount() {
    this.getEnabledNoneVerification();
    this.getOnlyManagerSettings();
    this.getAIModelAuthRuleList();
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

  getAIModelAuthRuleList = ({ force = false } = {}) => {
    if (this.aiModelRuleListRequest) {
      return this.aiModelRuleListRequest;
    }

    if (!force && this.state.aiModelRuleListLoaded) {
      return Promise.resolve(this.state.aiModelRuleList);
    }

    this.setState({ aiModelRuleListLoading: true });
    this.aiModelRuleListRequest = aiModelAuthAjax
      .getAIModelAuthRuleList({ projectId: Config.projectId }, { silent: true })
      .then(res => {
        const aiModelRuleList = res || [];

        this.setState({
          aiModelRuleList,
          aiModelRuleListLoaded: true,
          aiModelRuleListLoading: false,
        });

        return aiModelRuleList;
      })
      .catch(() => {
        this.setState({ aiModelRuleListLoading: false });
        return this.state.aiModelRuleList;
      })
      .finally(() => {
        this.aiModelRuleListRequest = null;
      });

    return this.aiModelRuleListRequest;
  };

  updateAIModelRuleList = aiModelRuleList => {
    this.setState({
      aiModelRuleList: aiModelRuleList || [],
      aiModelRuleListLoaded: true,
    });
  };

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
      aiModelRuleList,
      aiModelRuleListLoaded,
      aiModelRuleListLoading,
      showAIModelRule,
    } = this.state;

    if (showAIModelRule) {
      return (
        <AIModelRule
          projectId={projectId}
          onClose={() => this.setState({ showAIModelRule: false })}
          aiModelRuleList={aiModelRuleList}
          aiModelRuleListLoaded={aiModelRuleListLoaded}
          aiModelRuleListLoading={aiModelRuleListLoading}
          loadAIModelRuleList={this.getAIModelAuthRuleList}
          updateAIModelRuleList={this.updateAIModelRuleList}
        />
      );
    }

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
    const isCustomRule = (aiModelRuleList || []).some(r => r.isEnable);
    const globalStatus = isCustomRule ? _l('按自定义规则控制') : _l('全部应用可用全部模型');

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
            {
              key: 'aiModelRule',
              title: _l('AI 模型授权规则'),
              description: _l('控制组织内应用可使用的 AI 模型范围，支持按应用配置可用模型'),
              showSlideIcon: true,
              featureId: VersionProductType.aIModelAppLicenseManagement,
              customContent: (
                <div>
                  <span>{_l('当前状态：')}</span>
                  <span className="bold">{globalStatus}</span>
                </div>
              ),
              onClick: () => this.setState({ showAIModelRule: true }),
            },
          ]}
        />
      </div>
    );
  }
}
