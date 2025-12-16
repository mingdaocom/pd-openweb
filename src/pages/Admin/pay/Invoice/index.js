import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Button, Icon, LoadDiv } from 'ming-ui';
import merchantInvoiceApi from 'src/api/merchantInvoice';
import { getMyPermissions, hasPermission } from 'src/components/checkPermission';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import { navigateTo } from 'src/router/navigateTo';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
import Config from '../../config';
import InvoiceList from './components/InvoiceList';
import TaxNumber from './components/TaxNumber';
import { TABS } from './config';

export default class Invoice extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      currentTab: 'taxNo',
      disabledExportBtn: true,
      createTaxVisible: false,
      curTaxNo: '',
      showCreateTaxBtn: false,
      myPermissions: [],
    };
  }

  componentDidMount() {
    const { type } = this.props.match.params;
    const myPermissions = getMyPermissions(Config.projectId);
    const tabKeys = TABS.filter(item => hasPermission(myPermissions, item.permissionKey)).map(item => item.key);

    if (type) {
      const initialTab = ['create', 'taxNo'].includes(type) ? 'taxNo' : 'list';
      this.setState({
        myPermissions,
        loading: false,
        currentTab: tabKeys.includes(initialTab) ? initialTab : tabKeys[0],
        createTaxVisible: type === 'create',
      });
      return;
    }

    if (!tabKeys.includes('taxNo')) {
      this.setState({ myPermissions, loading: false, currentTab: 'list' });
      window.history.replaceState({}, '', `${location.origin}/admin/invoice/${Config.projectId}/list`);
      return;
    }

    merchantInvoiceApi
      .getTaxInfoList({ projectId: Config.projectId, pageFilter: { pageIndex: 1, pageSize: 50 } })
      .then(({ taxInfos }) => {
        const initialTab = taxInfos?.length ? 'list' : 'taxNo';
        const currentTab = tabKeys.includes(initialTab) ? initialTab : tabKeys[0];
        this.setState({
          myPermissions,
          loading: false,
          currentTab,
          showCreateTaxBtn: !!taxInfos?.length,
          taxList: taxInfos || [],
        });
        window.history.replaceState({}, '', `${location.origin}/admin/invoice/${Config.projectId}/${currentTab}`);
      });
  }

  render() {
    const {
      loading,
      currentTab,
      createTaxVisible,
      curTaxNo,
      showCreateTaxBtn,
      disabledExportBtn,
      myPermissions,
      taxList,
    } = this.state;
    const featureType = getFeatureStatus(Config.projectId, VersionProductType.invoice);

    const handleActionClick = ({ type, taxNo }) => {
      const { projectId } = Config;

      //导出
      if (type === 'export') {
        this.com && this.com.handleExport();
        return;
      }

      if (featureType === '2') {
        buriedUpgradeVersionDialog(projectId, VersionProductType.invoice);
        return;
      }

      if (md.global.Config.IsLocal && !taxNo) {
        merchantInvoiceApi.getInvoiceInfoUsage({ projectId }).then(res => {
          res?.canCreate < 1
            ? alert(_l('开票税号数量已达上限，请先购买'), 3)
            : this.setState({ createTaxVisible: true });
        });
        return;
      }

      this.setState({ createTaxVisible: true, curTaxNo: taxNo });
    };

    if (loading) {
      return <LoadDiv className="mTop10" />;
    }

    return (
      <div className="orgManagementWrap">
        <AdminTitle prefix={_l(`支付与开票 - ${(_.find(TABS, v => v.key === currentTab) || {}).label || '开票'}`)} />
        <div className="orgManagementHeader">
          <div className="tabBox">
            {createTaxVisible ? (
              <Fragment>
                <Icon
                  icon="backspace"
                  className="Font22 ThemeHoverColor3 pointer mRight10"
                  onClick={() => {
                    this.setState({ createTaxVisible: false, curTaxNo: '' });
                    navigateTo(`/admin/invoice/${Config.projectId}/taxNo`);
                  }}
                />
                <span>{_l('创建开票税号')}</span>
              </Fragment>
            ) : (
              TABS.filter(item => hasPermission(myPermissions, item.permissionKey)).map(item => (
                <span
                  key={item.key}
                  className={cx('tabItem Hand', { active: currentTab === item.key })}
                  onClick={() => {
                    this.setState({ currentTab: item.key });
                    navigateTo(`/admin/invoice/${Config.projectId}/${item.key}`);
                  }}
                >
                  {item.label}
                </span>
              ))
            )}
          </div>
          {(currentTab === 'list' || showCreateTaxBtn) && !createTaxVisible && (
            <div className="flexRow alignItemsCenter">
              <Icon
                icon="task-later"
                className="Gray_9 hoverText Font17"
                onClick={() => {
                  if (this.com) {
                    if (currentTab === 'list') {
                      this.com.getInvoiceList();
                      this.com.getSummary();
                    } else {
                      this.com.getTaxList();
                    }
                  }
                }}
              />
              <Button
                type="primary"
                className="export mLeft24"
                disabled={currentTab === 'list' && disabledExportBtn}
                onClick={() => handleActionClick({ type: currentTab === 'list' ? 'export' : 'create' })}
              >
                {currentTab === 'list' ? _l('导出') : _l('创建')}
              </Button>
            </div>
          )}
        </div>

        <div className={`flexColumn orgManagementContent ${createTaxVisible ? '' : 'overflowHidden'}`}>
          {currentTab === 'taxNo' && (
            <TaxNumber
              ref={ele => (this.com = ele)}
              projectId={Config.projectId}
              featureType={featureType}
              createTaxVisible={createTaxVisible}
              curTaxNo={curTaxNo}
              onCreateTax={taxNo => handleActionClick({ type: 'create', taxNo })}
              taxList={taxList}
              onShowCreateTaxBtn={() => this.setState({ showCreateTaxBtn: true })}
            />
          )}

          {currentTab === 'list' && (
            <InvoiceList
              ref={ele => (this.com = ele)}
              projectId={Config.projectId}
              updateDisabledExportBtn={disabledExportBtn => this.setState({ disabledExportBtn })}
            />
          )}
        </div>
      </div>
    );
  }
}
