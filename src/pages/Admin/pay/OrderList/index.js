import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import cx from 'classnames';
import _ from 'lodash';
import { Button, Icon } from 'ming-ui';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import { navigateTo } from 'src/router/navigateTo';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
import Config from '../../config';
import { TABS } from '../config';
import RefundOrder from './components/RefundOrder';
import TransactionDetails from './components/TransactionDetails';

const Comp = {
  transaction: TransactionDetails,
  refund: RefundOrder,
};

export default class Merchant extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: _.isArray(Config.params) && Config.params.length ? Config.params[1] : 'merchant',
      showHeader: true,
      disabledExportBtn: true,
    };
  }

  changeTab = key => {
    const projectId = Config.projectId;
    this.setState({ currentTab: key });
    navigateTo(`/admin/${key}/${projectId}`);
  };

  render() {
    const { currentTab, showHeader, disabledExportBtn } = this.state;
    const featureType = getFeatureStatus(Config.projectId, VersionProductType.PAY);

    return (
      <div className="orgManagementWrap">
        <AdminTitle prefix={_l(`支付与开票 - ${(_.find(TABS, v => v.key === currentTab) || {}).label || '订单'}`)} />
        {showHeader && (
          <div className="orgManagementHeader">
            <div className="tabBox">
              {TABS.map(item => (
                <span
                  key={item.key}
                  className={cx('tabItem Hand', { active: currentTab === item.key })}
                  onClick={() => this.changeTab(item.key)}
                >
                  {item.label}
                </span>
              ))}
            </div>
            <div className="flexRow alignItemsCenter">
              <Icon
                icon="task-later"
                className="Gray_9 hoverText Font17"
                onClick={() => {
                  if (this.com) {
                    if (currentTab === 'transaction') {
                      this.com.getDataList();
                      this.com.getPayOrderSummary();
                    } else {
                      this.com.getDataList();
                    }
                  }
                }}
              />
              <Button
                type="primary"
                className="export mLeft24"
                disabled={disabledExportBtn}
                onClick={() => {
                  if (featureType === '2') {
                    buriedUpgradeVersionDialog(Config.projectId, VersionProductType.PAY);
                    return;
                  }
                  if (this.com) {
                    this.com.handleExport();
                  }
                }}
              >
                {_l('导出')}
              </Button>
            </div>
          </div>
        )}
        <div
          className={cx('flexColumn overflowHidden', {
            orgManagementContent: showHeader,
            orgManagementWrap: !showHeader,
          })}
        >
          {TABS.map(item => {
            const Component = Comp[item.key];
            return (
              <Route
                key={item.path}
                path={item.path}
                render={({ match: { params } }) => (
                  <Component
                    ref={ele => (this.com = ele)}
                    {...params}
                    featureType={featureType}
                    changeTab={this.changeTab}
                    changeShowHeader={visible => this.setState({ showHeader: visible })}
                    updateDisabledExportBtn={disabledExportBtn => this.setState({ disabledExportBtn })}
                  />
                )}
              />
            );
          })}
        </div>
      </div>
    );
  }
}
