import React, { Component, Fragment } from 'react';
import { Switch, Icon } from 'ming-ui';
import CustomIcon from './components/CustomIcon';
import EncryptRules from './components/EncryptRules';
import Config from '../config';
import projectSettingController from 'src/api/projectSetting';
import { getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';
import { VersionProductType } from 'src/util/enum';
import cx from 'classnames';
import styled from 'styled-components';
import CustomColor from './components/CustomColor/index';

const ConfigItemWrap = styled.div`
  padding: 0 24px;
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
    key: 'customIcon',
    title: _l('自定义图标'),
    descrption: _l('上传的图标可用于应用、应用项、工作表等地方'),
    clickFunc: 'openCustomSvg',
    icon: 'style',
  },
  {
    key: 'customColor',
    title: _l('自定义颜色'),
    descrption: _l('自定义颜色可用于应用、自定义页面等地方'),
    clickFunc: 'openCustomColor',
    icon: 'color_lens',
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
  },
];
export default class GeneralSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      watermark: false,
      uploadSvg: false,
      customColor: false,
    };
    Config.setPageTitle(_l('通用设置'));
  }
  componentDidMount() {
    projectSettingController.getEnabledWatermark({ projectId: Config.projectId }).then(res => {
      this.setState({ watermark: res.enabledWatermark });
    });
    if (location.pathname.includes('isShowEncryptRules')) {
      this.setEncryptRules();
    }
  }
  setEncryptRules = () => {
    this.setState({ showEncryptRules: true });
  };
  /**
   * 打开自定义图标
   */
  openCustomSvg = () => {
    const featureType = getFeatureStatus(Config.projectId, VersionProductType.customIcon);
    if (featureType === '2') {
      buriedUpgradeVersionDialog(Config.projectId, VersionProductType.customIcon);
    } else {
      this.setState({ uploadSvg: true });
    }
  };

  openCustomColor = () => {
    this.setState({ customColor: true });
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

  render() {
    let { watermark, uploadSvg, showEncryptRules, customColor } = this.state;

    if (uploadSvg) {
      return <CustomIcon onClose={() => this.setState({ uploadSvg: false })} projectId={Config.projectId} />;
    }

    if (showEncryptRules) {
      return <EncryptRules onClose={() => this.setState({ showEncryptRules: false })} projectId={Config.projectId} />;
    }

    if (customColor) {
      return <CustomColor onClose={() => this.setState({ customColor: false })} projectId={Config.projectId} />;
    }

    return (
      <div className="orgManagementWrap">
        <div className="orgManagementHeader Font17">{_l('通用设置')}</div>
        <Fragment>
          {CONFIGS.map(item => {
            const { key, title, descrption, clickFunc, showSwitch } = item;
            const featureType = getFeatureStatus(Config.projectId, VersionProductType.customIcon);
            if (key === 'customIcon' && !featureType) return;
            return (
              <ConfigItemWrap
                className={cx({ hoverStyle: clickFunc, Hand: clickFunc })}
                onClick={clickFunc ? this[clickFunc] : () => {}}
              >
                <Item key={key}>
                  <div className="flex">
                    <div className="bold mBottom5 Font14">
                      <Icon icon={item.icon} className="Gray_9e Font18 mRight8"/>
                      {title}
                    </div>
                    <div className="Gray_9e">{descrption}</div>
                  </div>
                  <div>
                    {showSwitch && <Switch checked={watermark} onClick={this.setEnabledWatermark} />}
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
        </Fragment>
      </div>
    );
  }
}
