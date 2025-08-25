import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { LoadDiv, UpgradeIcon } from 'ming-ui';
import roleAjax from 'src/api/role';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { getFeatureStatus } from 'src/utils/project';
import Config from '../../config';
import Ding from './ding';
import FeiShu from './feishu';
import dingIng from './images/ding.png';
import feishuImg from './images/feishu.png';
import welinkImg from './images/welink.png';
import workwxImg from './images/workwx.png';
import Welink from './welink';
import Workwx from './workwx';
import './index.less';

const configs = [
  {
    type: 'workwx',
    src: workwxImg,
    text: _l('企业微信'),
    featureId: 19,
    projectIntergrationType: 3,
    privatePermission: 'hideWorkWeixin',
  },
  {
    type: 'ding',
    src: dingIng,
    text: _l('钉钉'),
    featureId: 10,
    projectIntergrationType: 1,
    privatePermission: 'hideDingding',
  },
  {
    type: 'welink',
    src: welinkImg,
    text: _l('Welink'),
    featureId: 18,
    projectIntergrationType: 4,
    privatePermission: 'hideWelink',
  },
  {
    type: 'feishu',
    src: feishuImg,
    text: _l('飞书'),
    featureId: 12,
    projectIntergrationType: 6,
    privatePermission: 'hideFeishu',
  },
  {
    type: 'lark',
    src: feishuImg,
    text: _l('Lark'),
    featureId: 12,
    projectIntergrationType: 6,
  },
];

export default class PlatformIntegration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
    Config.setPageTitle(_l('第三方平台'));
  }

  componentDidMount() {
    const { projectId } = _.get(this.props, 'match.params') || {};

    roleAjax
      .getProjectPermissionsByUser({ projectId })
      .then(({ projectIntergrationType }) => {
        if (projectIntergrationType) {
          let currentIntegrationType = (
            _.find(configs, item => item.projectIntergrationType === projectIntergrationType) || {}
          ).type;
          this.setState({ [`${currentIntegrationType}Visible`]: true, loading: false, projectIntergrationType });
        } else {
          this.setState({ loading: false, projectIntergrationType: 0 });
        }
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  }

  handleClick = ({ type, featureId, featureType }) => {
    const { projectId } = _.get(this.props, 'match.params') || {};

    if (featureType === '2') {
      return buriedUpgradeVersionDialog(projectId, featureId, { dialogType: 'dialog' });
    }

    this.setState({ [`${type}Visible`]: true });
  };

  handleShowIntegration = () => {
    const { projectId } = _.get(this.props, 'match.params') || {};
    const { workwxVisible, dingVisible, welinkVisible, feishuVisible, larkVisible, projectIntergrationType } =
      this.state;
    const { featureId } = _.find(configs, ({ type }) => this.state[`${type}Visible`]) || {};
    let featureType = getFeatureStatus(projectId, featureId);

    if (workwxVisible) {
      return (
        <Workwx
          projectId={projectId}
          featureType={featureType}
          featureId={featureId}
          onClose={() => this.setState({ workwxVisible: false })}
        />
      );
    } else if (dingVisible) {
      return (
        <Ding
          projectId={projectId}
          featureType={featureType}
          featureId={featureId}
          onClose={() => this.setState({ dingVisible: false })}
        />
      );
    } else if (welinkVisible) {
      return <Welink projectId={projectId} onClose={() => this.setState({ welinkVisible: false })} />;
    } else if (feishuVisible || larkVisible) {
      return (
        <FeiShu
          type={feishuVisible ? 'feishu' : 'lark'}
          featureType={featureType}
          featureId={featureId}
          projectIntergrationType={projectIntergrationType}
          projectId={projectId}
          onClose={() => this.setState({ feishuVisible: false, larkVisible: false })}
        />
      );
    }
    return null;
  };

  render() {
    const { projectId } = _.get(this.props, 'match.params') || {};
    const { loading } = this.state;

    const showIntegration = _.some(configs, ({ type }) => this.state[`${type}Visible`]);

    if (loading) {
      return <LoadDiv className="mTop30" />;
    }

    if (showIntegration) {
      return <Fragment>{this.handleShowIntegration()}</Fragment>;
    }

    return (
      <div className="orgManagementWrap platform">
        <div className="platformIntegrationWrap">
          <div className="mBottom16 Font22 bold TxtCenter">{_l('第三方平台')}</div>
          <div className="Gray_9e Font14 mBottom40 TxtCenter">{_l('从第三方同步通讯录，只能集成一个平台')}</div>
          {configs.map(item => {
            const { src, text, featureId, privatePermission } = item;
            if (md.global.SysSettings[privatePermission]) return;
            let featureType = getFeatureStatus(projectId, featureId);
            if (!featureType) return null;

            return (
              <div
                className="integrationItem flexRow alignItemsCenter Hand"
                onClick={() => this.handleClick({ featureType, ...item })}
              >
                <img src={src} />
                <div className="flex Font15 bold mLeft8">
                  {text}
                  {featureType === '2' && <UpgradeIcon />}
                </div>
                <div className="integrationTxt">{_l('集成')}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
