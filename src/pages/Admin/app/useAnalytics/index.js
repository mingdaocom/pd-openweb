import React, { Component } from 'react';
import cx from 'classnames';
import { Icon, Tooltip } from 'ming-ui';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
import ByApp from './components/ByApp';
import ByUser from './components/ByUser';
import Overview from './components/Overview';
import './index.less';

const TABS = [
  { key: 'overview', label: _l('总览') },
  { key: 'byApp', label: _l('按应用') },
  { key: 'byUser', label: _l('按成员') },
];
export default class UseAnalytics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: 'overview',
    };
  }
  changeTab = item => {
    this.setState({ currentTab: item.key });
  };

  render() {
    const { match = {} } = this.props;
    const { params = {} } = match;
    const { currentTab } = this.state;
    const featureType = getFeatureStatus(params.projectId, VersionProductType.analysis);
    if (featureType === '2') {
      return (
        <div className="orgManagementWrap">
          {buriedUpgradeVersionDialog(params.projectId, VersionProductType.analysis, { dialogType: 'content' })}
        </div>
      );
    }

    return (
      <div className="useAnalyticsContainer orgManagementWrap">
        <AdminTitle prefix={_l('使用分析')} />
        <div className="orgManagementHeader">
          <div className="tabBox">
            {TABS.map(item => (
              <span
                key={item.key}
                className={cx('tabItem Hand', { active: currentTab === item.key })}
                onClick={() => this.changeTab(item)}
              >
                {item.label}
              </span>
            ))}
          </div>
          <div className="extraInfo">
            {_l('截止到今天0点的最新数据')}
            <Tooltip
              tooltipClass="analyticsTooltip"
              popupPlacement="bottom"
              autoCloseDelay={0}
              text={
                <span className="tooltipCon">
                  {_l(
                    '保留最近一年的使用分析数据，使用分析上线后隔天对使用数据进行分析，且只有开通相应的版本方可使用此功能',
                  )}
                </span>
              }
            >
              <Icon icon="info" className="Font16 Gray_9e hover_f3 mLeft5" />
            </Tooltip>
          </div>
        </div>
        <div className="flex useAnalyticsContent">
          {currentTab === 'overview' && <Overview projectId={params.projectId} />}
          {currentTab === 'byApp' && <ByApp projectId={params.projectId} />}
          {currentTab === 'byUser' && <ByUser projectId={params.projectId} />}
        </div>
      </div>
    );
  }
}
