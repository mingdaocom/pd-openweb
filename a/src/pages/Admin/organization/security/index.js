import React, { Component, Fragment } from 'react';
import { Switch, Icon, UpgradeIcon } from 'ming-ui';
import EncryptRules from './components/encryptRules';
import ContactsHiddenWrap from './components/contactsHidden';
import Config from '../../config';
import projectSettingController from 'src/api/projectSetting';
import { getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';
import { VersionProductType } from 'src/util/enum';
import cx from 'classnames';
import styled from 'styled-components';

const ConfigItemWrap = styled.div`
  &.hoverStyle:hover {
    background: #f5f5f5;
  }
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  padding: 24px 24px 24px 0;
  border-bottom: 1px solid #eaeaea;
`;

const CONFIGS = [
  {
    key: 'addressVisibleRange',
    title: _l('通讯录可见范围'),
    descrption: _l('设置成员在可以看到的组织架构范围+手机号后4位或邮箱前缀'),
    clickFunc: 'settingAddressRange',
    icon: 'person_off_a',
    featureId: VersionProductType.contactsHide,
  },
  {
    key: 'watermark',
    title: _l('水印设置'),
    descrption: _l('启用水印配置后，将在组织所有应用内显示当前使用者的姓名+手机号后4位或邮箱前缀'),
    showSwitch: true,
    icon: 'watermark',
  },
  {
    key: 'encryptRules',
    title: _l('加密规则'),
    descrption: _l('配置工作表字段加密存储时可以选择的加密方式'),
    clickFunc: 'setEncryptRules',
    icon: 'lock',
    featureId: VersionProductType.dataEnctypt,
  },
  {
    key: 'PasswordFreeVerification',
    title: _l('免密验证'),
    descrption: _l('关闭后，全组织下的自定义按钮、审批配置了登录密码验证的地方必须每次验证密码后方可继续操作'),
    showSwitch: true,
    icon: 'how_to_reg',
  },
];
export default class SecurityCom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      watermark: false,
      noneVerificationEnabled: false,
    };
    Config.setPageTitle(_l('安全'));
  }
  componentDidMount() {
    projectSettingController.getEnabledWatermark({ projectId: Config.projectId }).then(res => {
      this.setState({ watermark: res.enabledWatermark });
    });
    projectSettingController.getEnabledNoneVerification({ projectId: Config.projectId }).then(res => {
      this.setState({ noneVerificationEnabled: res.noneVerificationEnabled });
    });
    if (location.pathname.includes('isShowEncryptRules')) {
      this.setEncryptRules();
    }
  }
  setEncryptRules = () => {
    this.setState({ showEncryptRules: true });
  };
  settingAddressRange = () => {
    this.setState({ showAddressRange: true });
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

  render() {
    let { watermark, showEncryptRules, noneVerificationEnabled, showAddressRange } = this.state;

    if (showEncryptRules) {
      return <EncryptRules onClose={() => this.setState({ showEncryptRules: false })} projectId={Config.projectId} />;
    }

    if (showAddressRange) {
      return (
        <ContactsHiddenWrap onClose={() => this.setState({ showAddressRange: false })} projectId={Config.projectId} />
      );
    }

    return (
      <div className="orgManagementWrap">
        <div className="orgManagementHeader Font17">{_l('安全')}</div>
        <div className="orgManagementContent pTop0">
          {CONFIGS.map(item => {
            const { key, title, descrption, clickFunc, showSwitch, featureId } = item;
            const featureType = getFeatureStatus(Config.projectId, featureId);
            if (featureId && !featureType) return;

            return (
              <ConfigItemWrap
                className={cx({ hoverStyle: clickFunc, Hand: clickFunc })}
                onClick={() => {
                  if (featureType === '2' && key === 'addressVisibleRange') {
                    buriedUpgradeVersionDialog(Config.projectId, featureId);
                    return;
                  }
                  if (clickFunc) {
                    this[clickFunc]();
                  }
                }}
              >
                <Item key={key}>
                  <div className="flex">
                    <div className="bold mBottom5 Font14">
                      <Icon icon={item.icon} className="Gray_9e Font18 mRight8" />
                      {title}
                      {featureType === '2' && <UpgradeIcon />}
                    </div>
                    <div className="Gray_9e">{descrption}</div>
                  </div>
                  <div>
                    {showSwitch && (
                      <Switch
                        checked={key === 'watermark' ? watermark : noneVerificationEnabled}
                        onClick={() => {
                          if (key === 'watermark') {
                            this.setEnabledWatermark();
                          } else {
                            this.setEnabledNoneVerification();
                          }
                        }}
                      />
                    )}
                    {clickFunc && (
                      <Icon
                        icon="sidebar-more"
                        className="Font18 Gray_9d Right Hand"
                        onClick={() => this[clickFunc]()}
                      />
                    )}
                  </div>
                </Item>
              </ConfigItemWrap>
            );
          })}
        </div>
      </div>
    );
  }
}
