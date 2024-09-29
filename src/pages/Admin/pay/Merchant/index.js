import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import { Button, UpgradeIcon } from 'ming-ui';
import cx from 'classnames';
import { TABS } from './config';
import { navigateTo } from 'src/router/navigateTo';
import MerchantCom from './components/MerchantCom';
import TransactionDetails from './components/TransactionDetails';
import RefundOrder from './components/RefundOrder';
import { getRequest, getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';
import { VersionProductType } from 'src/util/enum';
import Config from '../../config';
import _ from 'lodash';
import styled from 'styled-components';

const CreateButton = styled(Button)`
  &.createDisabled {
    background: #eee !important;
  }
`;

const Comp = {
  merchant: MerchantCom,
  transaction: TransactionDetails,
  refund: RefundOrder,
};

export default class Merchant extends Component {
  constructor(props) {
    super(props);
    const { iscreate } = getRequest();
    this.state = {
      currentTab: _.isArray(Config.params) && Config.params.length ? Config.params[1] : 'merchant',
      showHeader: iscreate === 'true' ? false : true,
      disabledExportBtn: true,
    };
  }

  changeTab = key => {
    const projectId = Config.projectId;
    this.setState({ currentTab: key });
    navigateTo(`/admin/${key}/${projectId}`);
  };

  render() {
    const { currentTab, showHeader, showCreateMerchant, disabledExportBtn } = this.state;
    const { iscreate } = getRequest();
    const featureType = getFeatureStatus(Config.projectId, VersionProductType.PAY);
    const hasMerchant = localStorage.getItem(`${Config.projectId}-hasMerchant`) === 'true';

    return (
      <div className="orgManagementWrap">
        <AdminTitle prefix={_l(`支付 - ${(_.find(TABS, v => v.key === currentTab) || {}).label || '商户'}`)} />
        {showHeader ? (
          <div className="orgManagementHeader">
            <div className="tabBox">
              {TABS.filter(v => (hasMerchant ? true : !_.includes(['transaction', 'refund'], v.key))).map(item => (
                <span
                  key={item.key}
                  className={cx('tabItem Hand', { active: currentTab === item.key })}
                  onClick={() => this.changeTab(item.key)}
                >
                  {item.label}
                </span>
              ))}
            </div>
            {showCreateMerchant && (
              <CreateButton
                className={cx('pLeft15 pRight15', { 'Gray createDisabled': featureType === '2' })}
                type="primary"
                radius={featureType === '2'}
                onClick={() => {
                  if (this.com && this.com.changeCreateMerchant) {
                    this.com.changeCreateMerchant('createMerchantVisible', true);
                  }
                }}
              >
                {featureType === '2' && <i className="icon icon-add Font17 TxtMiddle mRight4" />}
                <span className="TxtMiddle"> {_l('创建商户')}</span>
                {featureType === '2' && <UpgradeIcon />}
              </CreateButton>
            )}
            {_.includes(['transaction', 'refund'], currentTab) && (
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
            )}
          </div>
        ) : (
          ''
        )}
        <div
          className={cx('flexColumn overflowHidden', {
            orgManagementContent: showHeader,
            orgManagementWrap: !showHeader,
          })}
        >
          {TABS.filter(v => (hasMerchant ? true : !_.includes(['transaction', 'refund'], v.key))).map(item => {
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
                    isCreate={iscreate}
                    changeTab={this.changeTab}
                    changeShowHeader={visible => this.setState({ showHeader: visible })}
                    changeShowCreateMerchant={visible => this.setState({ showCreateMerchant: visible })}
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
