import React, { Fragment, Component } from 'react';
import { Icon } from 'ming-ui';
import SvgIcon from 'src/components/SvgIcon';
import Overview from '../Overview';
import ByUser from '../ByUser';
import cx from 'classnames';
import './index.less';

const tabs = [
  { key: 1, label: _l('总览') },
  { key: 2, label: _l('按成员') },
];
export default class AppAnalytics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: 1,
    };
  }
  render() {
    const { currentAppInfo = {}, projectId, isIndividual } = this.props;
    const { name, iconColor, iconUrl, appId } = currentAppInfo;
    let { currentTab } = this.state;
    return (
      <div className="appAnalyticsWrapper">
        <div className="header">
          <div className="appInfo flexRow">
            <div className="appIconWrapper" style={{ backgroundColor: iconColor }}>
              <SvgIcon url={iconUrl} fill="#fff" size={16} />
            </div>
            <div className="mLeft7 bold Font15">{name}</div>
          </div>
          {!isIndividual && (
            <span data-tip={_l('关闭')}>
              <Icon icon="close" className="pointer Font28 Gray_9d ThemeHoverColor3" onClick={this.props.onCancel} />
            </span>
          )}
        </div>
        <div className="appAnalyticsContent">
          <div className="appAnalytics flexColumn">
            <div className="tabs">
              {tabs.map(item => (
                <div
                  key={item.key}
                  className={cx('tabItem Hand', { currentTab: currentTab === item.key })}
                  onClick={() => {
                    this.setState({ currentTab: item.key });
                  }}
                >
                  {item.label}
                </div>
              ))}
            </div>
            <div className="flex">
              {currentTab === 1 && <Overview appId={appId} projectId={projectId} />}
              {currentTab === 2 && <ByUser appId={appId} projectId={projectId} />}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
