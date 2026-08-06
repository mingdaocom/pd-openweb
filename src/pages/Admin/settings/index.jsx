import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, UpgradeIcon } from 'ming-ui';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { navigateTo } from 'src/router/navigateTo';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
import Config from '../config';
import AppEmailService from './components/AppEmailService';
import CustomColor from './components/CustomColor/index';
import CustomIcon from './components/CustomIcon';

const ConfigItemWrap = styled.div`
  padding: 0 32px;
  &.hoverStyle:hover {
    background: var(--color-background-hover);
  }
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  padding: 24px 24px 24px 0;
  border-bottom: 1px solid var(--color-border-secondary);
`;

const CONFIGS = [
  {
    featureId: VersionProductType.customIcon,
    key: 'customIcon',
    title: _l('自定义图标'),
    descrption: _l('上传并管理自定义图标，用于应用配置，支持 SVG 格式'),
    clickFunc: 'openCustomSvg',
  },
  {
    key: 'customColor',
    title: _l('自定义颜色'),
    descrption: _l('自定义颜色可用于应用、自定义页面等地方'),
    clickFunc: 'openCustomColor',
  },
  {
    featureId: VersionProductType.appAccessPolicy,
    key: 'appEmailService',
    title: _l('应用邮件服务'),
    descrption: _l('配置应用于工作流、外部门户的邮件通知使用的发送服务'),
    clickFunc: 'openAppEmailService',
  },
];
export default class GeneralSettings extends Component {
  constructor(props) {
    super(props);
    const type = _.get(props, 'match.params.type');
    this.state = {
      uploadSvg: type === 'customicon',
      customColor: type === 'customcolor',
      appEmailService: type === 'appemailservice',
      projectId: _.get(props, 'match.params.projectId'),
    };
    Config.setPageTitle(_l('应用管理 - 通用设置'));
  }

  componentDidMount() {
    const { uploadSvg, customColor, appEmailService } = this.state;

    if (uploadSvg || customColor || appEmailService) {
      if (uploadSvg) {
        this.openCustomSvg(false);
      } else if (customColor) {
        this.openCustomColor(false);
      } else {
        this.openAppEmailService(false);
      }
    }
  }

  /**
   * 打开自定义图标
   */
  openCustomSvg = (toLink = true) => {
    const featureType = getFeatureStatus(Config.projectId, VersionProductType.customIcon);

    if (featureType === '2') {
      buriedUpgradeVersionDialog(Config.projectId, VersionProductType.customIcon);
      return;
    }

    toLink && navigateTo(`/admin/settings/${this.state.projectId}/customicon`);
  };

  openCustomColor = (toLink = true) => {
    this.setState({ customColor: true });
    toLink && navigateTo(`/admin/settings/${this.state.projectId}/customcolor`);
  };

  openAppEmailService = (toLink = true) => {
    const featureType = getFeatureStatus(Config.projectId, VersionProductType.appAccessPolicy);

    if (featureType === '2') {
      buriedUpgradeVersionDialog(Config.projectId, VersionProductType.appAccessPolicy);
      return;
    }

    this.setState({ appEmailService: true });
    toLink && navigateTo(`/admin/settings/${this.state.projectId}/appemailservice`);
  };

  render() {
    let { uploadSvg, customColor, appEmailService } = this.state;

    if (uploadSvg) {
      return <CustomIcon projectId={Config.projectId} />;
    }

    if (customColor) {
      return <CustomColor projectId={Config.projectId} />;
    }

    if (appEmailService) {
      return <AppEmailService projectId={Config.projectId} />;
    }

    return (
      <div className="orgManagementWrap">
        <div className="orgManagementHeader Font17">{_l('通用设置')}</div>
        <Fragment>
          {CONFIGS.map(item => {
            const { key, title, descrption, clickFunc, featureId } = item;
            const featureType = getFeatureStatus(Config.projectId, featureId);

            if (featureId && !featureType) return;

            return (
              <ConfigItemWrap
                key={key}
                className={cx({ hoverStyle: clickFunc, Hand: clickFunc })}
                onClick={clickFunc ? this[clickFunc] : () => {}}
              >
                <Item>
                  <div className="flex">
                    <div className="bold mBottom5 Font14">
                      {title}
                      {key === 'customIcon' && featureType === '2' && <UpgradeIcon />}
                    </div>
                    <div className="textTertiary">{descrption}</div>
                  </div>
                  <div>
                    {clickFunc && (
                      <Icon
                        icon="arrow-right-border"
                        className="Font18 textTertiary Right Hand"
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
