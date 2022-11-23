import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Icon, Dialog } from 'ming-ui';
import { reportTypes } from '../Charts/common';
import { exportExcel } from '../common';
import Share from 'src/pages/worksheet/components/Share';
import PageMove from '../components/PageMove';
import reportConfig from '../api/reportConfig';
import { Dropdown, Menu, Divider } from 'antd';
import reportApi from 'statistics/api/report';
import sheetApi from 'src/api/worksheet';

const confirm = Dialog.confirm;

export default class MoreOverlay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shareVisible: false,
      showPageMove: false,
    };
  }
  handleExportExcel = exportType => {
    const { report, worksheetId, exportData } = this.props;
    const {
      filters = [],
      filtersGroup = [],
      sorts,
      filterControls,
      filterRangeId,
      rangeType,
      rangeValue,
      particleSizeType,
    } = exportData;
    reportApi
      .export({
        exportType,
        reportId: report.id,
        pageId: worksheetId,
        particleSizeType,
        filterRangeId,
        rangeType,
        rangeValue,
        sorts,
        filters: [filters, filtersGroup, filterControls].filter(n => !_.isEmpty(n)),
      })
      .then(result => {
        if (!result) {
          alert(_l('导出错误'), 2);
        }
      })
      .fail(error => {
        alert(error, 2);
      });
  }
  handleDelete = () => {
    const { report, filter, appId } = this.props;
    const { id, name } = report;
    confirm({
      title: <span className="Red">{_l('您确定要删除表“%0” ?', name)}</span>,
      onOk: () => {
        reportConfig
          .deleteReport({
            reportId: id,
          })
          .then(result => {
            this.props.onRemove(id);
            if (filter.filterId) {
              sheetApi
                .deleteWorksheetFilter({
                  appId: appId,
                  filterId: filter.filterId,
                })
                .then();
            }
          });
      },
    });
  }
  handleCopy = () => {
    const { report } = this.props;
    const el = document.querySelector('.panelTab.active');
    reportConfig.copyReport({
      move: false,
      reportId: report.id,
      current: true,
    }).then(data => {
      if (data.reportId) {
        alert(_l('复制成功'));
        el && el.click();
      }
    });
  }
  handleUpdateOwnerId = () => {
    const { ownerId, report } = this.props;
    reportConfig
      .updateOwnerId({
        ownerId: ownerId ? '' : md.global.Account.accountId,
        reportId: report.id,
      })
      .then(result => {
        if (result) {
          alert(_l('移出成功'));
          this.props.onRemove(report.id);
        }
      });
  }
  renderOverlay() {
    const {
      reportType,
      report,
      ownerId,
      reportStatus,
      isMove,
      isCharge,
      onOpenFilter,
      onOpenSetting,
      onRemove,
      getPopupContainer,
    } = this.props;
    const isSheetView = ![reportTypes.PivotTable, reportTypes.NumberChart].includes(reportType);
    return (
      <Menu
        className="chartMenu"
        expandIcon={<Icon icon="arrow-right-tip" />}
        getPopupContainer={getPopupContainer}
        style={{ width: 180 }}
      >
        {onOpenSetting && (
          <Menu.Item className="pLeft10" onClick={onOpenSetting}>
            <div className="flexRow valignWrapper">
              <Icon className="Gray_9e Font18 mLeft5 mRight5" icon="settings" />
              <span>{_l('设置')}</span>
            </div>
          </Menu.Item>
        )}
        {onOpenFilter && !!reportStatus && (
          <Menu.Item className="pLeft10" onClick={onOpenFilter}>
            <div className="flexRow valignWrapper">
              <Icon className="Gray_9e Font18 mLeft5 mRight5" icon="filter" />
              <span>{_l('筛选')}</span>
            </div>
          </Menu.Item>
        )}
        {!md.global.Account.isPortal && (
          <Menu.Item
            className="pLeft10"
            onClick={() => {
              this.setState({ shareVisible: true });
            }}
          >
            <div className="flexRow valignWrapper">
              <Icon className="Gray_9e Font18 mLeft5 mRight5" icon="share" />
              <span>{_l('分享')}</span>
            </div>
          </Menu.Item>
        )}
        {reportTypes.NumberChart !== reportType && !!reportStatus && (
          <Menu.SubMenu
            popupClassName="chartMenu"
            title={_l('导出Excel')}
            icon={<Icon className="Gray_9e Font18 mRight5" icon="file_download" />}
            popupOffset={[0, 0]}
          >
            <Menu.Item
              style={{ width: 180 }}
              className="pLeft20"
              onClick={() => {
                this.handleExportExcel(0);
              }}
            >
              <div className="flexRow valignWrapper">{_l('按照原值导出')}</div>
            </Menu.Item>
            <Menu.Item
              style={{ width: 180 }}
              className="pLeft20"
              onClick={() => {
                this.handleExportExcel(1);
              }}
            >
              <div className="flexRow valignWrapper">{_l('按显示单位导出')}</div>
            </Menu.Item>
          </Menu.SubMenu>
        )}
        {isMove && isCharge && (
          <Fragment>
            <Divider className="mTop5 mBottom5" />
            <Menu.Item className="pLeft10" onClick={this.handleUpdateOwnerId}>
              <div className="flexRow valignWrapper">
                <Icon className="Gray_9e Font18 mLeft5 mRight5" icon={ownerId ? 'worksheet_public' : 'minus-square'} />
                <span>{ownerId ? _l('转为公共图表') : _l('从公共中移出')}</span>
              </div>
            </Menu.Item>
            <Menu.SubMenu
              popupClassName="chartMenu"
              title={_l('复制到')}
              icon={<Icon className="Gray_9e Font18 mRight5" icon="content-copy" />}
              popupOffset={[0, 0]}
            >
              <Menu.Item
                style={{ width: 180 }}
                className="pLeft20"
                onClick={this.handleCopy}
              >
                <div className="flexRow valignWrapper">{_l('当前统计')}</div>
              </Menu.Item>
              <Menu.Item
                style={{ width: 180 }}
                className="pLeft20"
                onClick={() => {
                  this.setState({ showPageMove: true });
                }}
              >
                <div className="flexRow valignWrapper">{_l('自定义页面')}</div>
              </Menu.Item>
            </Menu.SubMenu>
          </Fragment>
        )}
        {onRemove && (
          <Fragment>
            <Divider className="mTop5 mBottom5" />
            <Menu.Item className="pLeft10" onClick={this.handleDelete}>
              <div className="flexRow valignWrapper">
                <Icon className="Gray_9e Font18 mLeft5 mRight5" icon="task-new-delete" />
                <span>{_l('删除')}</span>
              </div>
            </Menu.Item>
          </Fragment>
        )}
      </Menu>
    );
  }
  render() {
    const { shareVisible, showPageMove } = this.state;
    const { appId, worksheetId, report, className, permissions, isCharge, getPopupContainer } = this.props;
    return (
      <Fragment>
        <Dropdown
          trigger={['click']}
          placement="bottomRight"
          getPopupContainer={getPopupContainer}
          overlay={this.renderOverlay()}
        >
          <Icon className={className} icon="more_horiz" />
        </Dropdown>
        {shareVisible && (
          <Share
            title={_l('分享统计图: %0', report.name)}
            from="report"
            isCharge={permissions || isCharge}
            params={{
              appId,
              sourceId: report.id,
              worksheetId,
              title: report.name,
            }}
            getCopyContent={(type, url) => (type === 'private' ? url : `${url} ${report.name}`)}
            onClose={() => this.setState({ shareVisible: false })}
          />
        )}
        {showPageMove && (
          <PageMove
            appId={appId}
            reportId={report.id}
            onCancel={() => {
              this.setState({ showPageMove: false });
            }}
          />
        )}
      </Fragment>
    );
  }
}
