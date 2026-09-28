import React, { Component } from 'react';
import cx from 'classnames';
import downloadAjax from 'src/api/download';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import { navigateTo } from 'src/router/navigation/navigateTo';
import Details from './details';
import Statistics from './statistics';

const TABS = [
  { key: 'statistics', label: _l('统计') },
  { key: 'details', label: _l('明细') },
];

const getCurrentTab = tab => (TABS.some(item => item.key === tab) ? tab : 'statistics');

export function getExportParams(requestParams) {
  if (![2, 3].includes(requestParams?.transactionType)) return null;

  const params = { ...requestParams };
  delete params.pageIndex;
  delete params.pageSize;

  return {
    ...params,
    fileName: params.transactionType === 2 ? _l('自动扣费') : _l('扣费退回'),
  };
}

export default class Billing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: getCurrentTab(props.match.params.tab),
      exportParams: null,
      exporting: false,
    };
    this.requestPending = false;
  }

  componentDidUpdate(prevProps) {
    const previousTab = getCurrentTab(prevProps.match.params.tab);
    const currentTab = getCurrentTab(this.props.match.params.tab);

    if (previousTab !== currentTab && this.state.currentTab !== currentTab) {
      this.setState({ currentTab, exportParams: null });
    }
  }

  handleRequestParamsChange = requestParams => {
    this.setState({ exportParams: getExportParams(requestParams) });
  };

  handleExport = () => {
    const { exportParams } = this.state;
    if (this.requestPending || !exportParams) return;

    this.requestPending = true;
    this.setState({ exporting: true });
    downloadAjax
      .exportCreditPointRecords(exportParams)
      .then(result => {
        if (!result) alert(_l('导出失败'), 2);
      })
      .catch(() => {})
      .finally(() => {
        this.requestPending = false;
        this.setState({ exporting: false });
      });
  };

  render() {
    const { currentTab, exporting, exportParams } = this.state;
    const { projectId } = this.props.match.params;

    return (
      <div className="orgManagementWrap">
        <AdminTitle prefix={_l('组织 - 新账务')} />
        <div className="orgManagementHeader">
          <div className="tabBox">
            {TABS.map(item => (
              <span
                key={item.key}
                className={cx('tabItem', { active: currentTab === item.key })}
                onClick={() => {
                  if (currentTab === item.key) return;

                  this.setState({ currentTab: item.key, exportParams: null });
                  navigateTo(`/admin/billing/${projectId}/${item.key}`);
                }}
              >
                {item.label}
              </span>
            ))}
          </div>
          <div className="billingHeaderActions flexRow Font15">
            <span
              className="colorPrimary adminHoverColor pointer"
              onClick={() => navigateTo(`/admin/billinfo/${projectId}`)}
            >
              {_l('返回旧版')}
            </span>
            {currentTab === 'details' && exportParams && (
              <span
                className={cx('mLeft32', exporting ? 'textDisabled' : 'colorPrimary adminHoverColor pointer')}
                aria-disabled={exporting || undefined}
                onClick={exporting ? undefined : this.handleExport}
              >
                {_l('导出')}
              </span>
            )}
          </div>
        </div>
        <div className="orgManagementContent">
          {currentTab === 'statistics' ? (
            <Statistics projectId={projectId} />
          ) : (
            <Details projectId={projectId} onRequestParamsChange={this.handleRequestParamsChange} />
          )}
        </div>
      </div>
    );
  }
}
