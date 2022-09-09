import React, { Component } from 'react';
import { Icon, Tooltip, Button } from 'ming-ui';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import Overview from './components/Overview';
import ByApp from './components/ByApp';
import ByUser from './components/ByUser';
import UpgradeVersion from '../components/UpgradeVersion';
import { getFeatureStatus } from '../../../util';
import cx from 'classnames';
import './index.less';

const TABS = [
  { key: 'overview', label: _l('总览') },
  { key: 'byApp', label: _l('按应用') },
  { key: 'byUser', label: _l('按成员') },
];
const FEATURE_ID = 17;

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
    const featureType = getFeatureStatus(params.projectId, FEATURE_ID);
    if (featureType === '2') {
      return (
        <div className="useAnalyticsContainer">
          <AdminTitle prefix={_l('使用分析')} />
          <UpgradeVersion projectId={params.projectId} featureId={FEATURE_ID} />
        </div>
      );
    }
    let deadLine = moment().subtract(1, 'days').format(_l('YYYY年MM月DD日'));

    return (
      <div className="useAnalyticsContainer flexColumn">
        <AdminTitle prefix={_l('使用分析')} />
        <div className="header">
          <div className="tabs">
            {TABS.map(item => (
              <span
                key={item.key}
                className={cx('tabItem Hand', { currentTab: currentTab === item.key })}
                onClick={() => this.changeTab(item)}
              >
                {item.label}
              </span>
            ))}
          </div>
          <div>
            {_l('截止到%0的最新数据', deadLine)}
            <Tooltip
              tooltipClass="analyticsTooltip"
              popupPlacement="bottom"
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
