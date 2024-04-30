import React, { Component, Fragment } from 'react';
import { Icon, UpgradeIcon } from 'ming-ui';
import CustomIcon from './components/CustomIcon';
import Config from '../config';
import { getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';
import { VersionProductType } from 'src/util/enum';
import cx from 'classnames';
import styled from 'styled-components';
import CustomColor from './components/CustomColor/index';

const ConfigItemWrap = styled.div`
  padding: 0 32px;
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
  },
  {
    key: 'customColor',
    title: _l('自定义颜色'),
    descrption: _l('自定义颜色可用于应用、自定义页面等地方'),
    clickFunc: 'openCustomColor',
  },
];
export default class GeneralSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uploadSvg: false,
      customColor: false,
    };
    Config.setPageTitle(_l('通用设置'));
  }

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

  render() {
    let { uploadSvg, customColor } = this.state;

    if (uploadSvg) {
      return <CustomIcon onClose={() => this.setState({ uploadSvg: false })} projectId={Config.projectId} />;
    }

    if (customColor) {
      return <CustomColor onClose={() => this.setState({ customColor: false })} projectId={Config.projectId} />;
    }

    return (
      <div className="orgManagementWrap">
        <div className="orgManagementHeader Font17">{_l('通用设置')}</div>
        <Fragment>
          {CONFIGS.map(item => {
            const { key, title, descrption, clickFunc } = item;
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
                      {title}
                      {key === 'customIcon' && featureType === '2' && <UpgradeIcon />}
                    </div>
                    <div className="Gray_9e">{descrption}</div>
                  </div>
                  <div>
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
