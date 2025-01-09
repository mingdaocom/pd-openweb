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
import favoriteApi from 'src/api/favorite';
import { getFilledRequestParams } from 'src/pages/worksheet/util';
import _ from 'lodash';

const confirm = Dialog.confirm;

export default class MoreOverlay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shareVisible: false,
      showPageMove: false,
      favorite: props.favorite,
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.favorite !== this.props.favorite) {
      this.setState({ favorite: nextProps.favorite });
    }
  }
  handleExportExcel = exportType => {
    const { report, pageId, exportData, filter, sourceType } = this.props;
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
        pageId: sourceType === 2 ? undefined : pageId,
        particleSizeType,
        filterRangeId,
        rangeType,
        rangeValue,
        dynamicFilter: rangeType ? filter.dynamicFilter : undefined,
        sorts,
        filters: [filters, filtersGroup, filterControls].filter(n => !_.isEmpty(n)),
        ...getFilledRequestParams({}),
      })
      .then(result => {})
      .catch(error => {
        alert(error, 2);
      });
  };
  handleDelete = () => {
    const { report, filter, appId } = this.props;
    const { id, name } = report;
    this.handleUpdateDropdownVisible(false);
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
  };
  handleCopy = () => {
    const { report } = this.props;
    const el = document.querySelector('.panelTab.active');
    reportConfig
      .copyReport({
        move: false,
        reportId: report.id,
        current: true,
      })
      .then(data => {
        if (data.reportId) {
          alert(_l('复制成功'));
          el && el.click();
        }
      });
  };
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
          !ownerId && this.removeReportFavoritesExcludeAccountId();
          this.props.onRemove(report.id);
        }
      });
  };
  removeReportFavoritesExcludeAccountId = () => {
    const { projectId, report, reportData } = this.props;
    const createdAccountId = _.get(reportData, 'createdBy.accountId') || md.global.Account.accountId;
    favoriteApi.removeReportFavoritesExcludeAccountId({
      projectId,
      reportId: report.id,
      accountId: createdAccountId,
    });
  };
  handleChangeFavorite = favorite => {
    const { report, worksheetId, projectId, pageId, onCancelFavorite } = this.props;
    const params = {
      type: 2,
      projectId,
      worksheetId,
      pageId,
      reportId: report.id,
    };
    if (favorite) {
      favoriteApi.addFavorite(params).then(data => {
        if (data) {
          alert(_l('收藏成功'));
          this.setState({ favorite });
        }
      });
    } else {
      favoriteApi.removeFavorite(params).then(data => {
        if (data) {
          alert(_l('已取消收藏'));
          this.setState({ favorite });
          onCancelFavorite && onCancelFavorite();
        }
      });
    }
  };
  handleUpdateDropdownVisible = dropdownVisible => {
    const { report } = this.props;
    this.setState({ dropdownVisible });
    const card = document.querySelector(`.statisticsCard-${report.id}`);
    if (dropdownVisible) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  };
  renderOverlay() {
    const {
      themeColor,
      reportType,
      report,
      sourceType,
      ownerId,
      reportStatus,
      isMove,
      isCharge,
      permissionType,
      projectId,
      customPageConfig = {},
      onSheetView,
      onOpenSetting,
      onRemove,
    } = this.props;
    const { favorite } = this.state;
    const isSheetView = ![reportTypes.PivotTable].includes(reportType);
    const { chartShare = true, chartExportExcel = true } = customPageConfig;
    const isEmbedPage = location.href.includes('embed/page');
    const isEmbedChart = location.href.includes('embed/chart');
    const isFavorite =
      _.find(md.global.Account.projects, { projectId }) &&
      !window.isPublicApp &&
      !window.shareState.id &&
      !md.global.Account.isPortal &&
      sourceType !== 2;
    return (
      <Menu className="chartMenu chartOperate" expandIcon={<Icon icon="arrow-right-tip" />} style={{ width: 180 }}>
        {onOpenSetting && (
          <Menu.Item
            data-event="setting"
            className="pLeft10"
            onClick={() => {
              onOpenSetting();
              this.handleUpdateDropdownVisible(false);
            }}
          >
            <div className="flexRow valignWrapper">
              <Icon className="Gray_9e Font18 mLeft5 mRight5" icon="settings" />
              <span>{_l('设置')}</span>
            </div>
          </Menu.Item>
        )}
        {isFavorite && (
          <Menu.Item
            data-event="collect"
            className="pLeft10"
            onClick={() => {
              this.handleChangeFavorite(!favorite);
              this.handleUpdateDropdownVisible(false);
            }}
          >
            <div className="flexRow valignWrapper">
              <Icon
                className="Font18 mLeft5 mRight5"
                icon={favorite ? 'task-star' : 'star-hollow'}
                style={{ color: favorite ? '#ffc402' : '#9e9e9e' }}
              />
              <span>{favorite ? _l('取消收藏') : _l('收藏')}</span>
            </div>
          </Menu.Item>
        )}
        {onSheetView && reportStatus > 0 && (
          <Menu.Item
            data-event="sheetDisplay"
            className="pLeft10"
            onClick={() => {
              onSheetView();
              this.handleUpdateDropdownVisible(false);
            }}
          >
            <div className="flexRow valignWrapper">
              <Icon className="Gray_9e Font18 mLeft5 mRight5" icon="table" />
              <span>{_l('以表格显示')}</span>
            </div>
          </Menu.Item>
        )}
        {!md.global.Account.isPortal &&
          !(isEmbedPage || isEmbedChart) &&
          reportStatus > 0 &&
          sourceType !== 3 &&
          chartShare && (
            <Menu.Item
              data-event="share"
              className="pLeft10"
              onClick={() => {
                this.setState({ shareVisible: true });
                this.handleUpdateDropdownVisible(false);
              }}
            >
              <div className="flexRow valignWrapper">
                <Icon className="Gray_9e Font18 mLeft5 mRight5" icon="share" />
                <span>{_l('分享')}</span>
              </div>
            </Menu.Item>
          )}
        {!window.isPublicApp && reportStatus > 0 && chartExportExcel && (
          <Menu.SubMenu
            data-event="export"
            popupClassName="chartMenu chartSubOperate_export"
            title={_l('导出Excel%06002')}
            icon={<Icon className="Gray_9e Font18 mRight5" icon="file_download" />}
            popupOffset={[0, 0]}
          >
            <Menu.Item
              data-event="exportOriginal"
              style={{ width: 180 }}
              className="pLeft20"
              onClick={() => {
                this.handleExportExcel(0);
              }}
            >
              <div className="flexRow valignWrapper">{_l('按照原值导出%06000')}</div>
            </Menu.Item>
            <Menu.Item
              data-event="exportUnit"
              style={{ width: 180 }}
              className="pLeft20"
              onClick={() => {
                this.handleExportExcel(1);
              }}
            >
              <div className="flexRow valignWrapper">{_l('按显示单位导出%06001')}</div>
            </Menu.Item>
          </Menu.SubMenu>
        )}
        {[reportTypes.PivotTable].includes(reportType) && !md.global.Account.isPortal && (
          <Menu.Item
            data-event="print"
            className="pLeft10"
            onClick={() => {
              const { filters = [], filtersGroup = [] } = this.props.exportData;
              const printFilter = [filters, filtersGroup].filter(n => !_.isEmpty(n));
              this.handleUpdateDropdownVisible(false);
              sessionStorage.setItem(`printFilter-${report.id}`, JSON.stringify(printFilter));
              window.open(`/printPivotTable/${report.id}/${encodeURIComponent(themeColor || '')}`);
            }}
          >
            <div className="flexRow valignWrapper">
              <Icon className="Gray_9e Font18 mLeft5 mRight5" icon="print" />
              <span>{_l('打印')}</span>
            </div>
          </Menu.Item>
        )}
        {isMove && (
          <Fragment>
            <Divider className="mTop5 mBottom5" />
            <Menu.Item data-event="publicTransform" className="pLeft10" onClick={this.handleUpdateOwnerId}>
              <div className="flexRow valignWrapper">
                <Icon className="Gray_9e Font18 mLeft5 mRight5" icon={ownerId ? 'worksheet_public' : 'minus-square'} />
                <span>{ownerId ? _l('转为公共图表') : _l('从公共中移出')}</span>
              </div>
            </Menu.Item>
            <Menu.SubMenu
              data-event="copy"
              popupClassName="chartMenu chartSubOperate_copy"
              title={_l('复制到')}
              icon={<Icon className="Gray_9e Font18 mRight5" icon="content-copy" />}
              popupOffset={[0, 0]}
            >
              <Menu.Item data-event="curStatistic" style={{ width: 180 }} className="pLeft20" onClick={this.handleCopy}>
                <div className="flexRow valignWrapper">{_l('当前统计')}</div>
              </Menu.Item>
              {permissionType !== 2 && (
                <Menu.Item
                  data-event="customPage"
                  style={{ width: 180 }}
                  className="pLeft20"
                  onClick={() => {
                    this.setState({ showPageMove: true });
                    this.handleUpdateDropdownVisible(false);
                  }}
                >
                  <div className="flexRow valignWrapper">{_l('自定义页面')}</div>
                </Menu.Item>
              )}
            </Menu.SubMenu>
          </Fragment>
        )}
        {onRemove && (
          <Fragment>
            <Divider className="mTop5 mBottom5" />
            <Menu.Item data-event="delete" className="pLeft10" onClick={this.handleDelete}>
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
    const { shareVisible, showPageMove, dropdownVisible } = this.state;
    const {
      appId,
      worksheetId,
      pageId,
      report,
      className,
      permissions,
      isCharge,
      isLock,
      reportType,
      permissionType,
      sourceType,
      customPageConfig,
      onSheetView,
    } = this.props;
    const { chartExportExcel = true } = customPageConfig;
    const moreVisible = (function () {
      if (md.global.Account.isPortal) {
        if (reportType === reportTypes.PivotTable) {
          return chartExportExcel;
        } else {
          return chartExportExcel || onSheetView;
        }
      }
      return true;
    })();
    return (
      <Fragment>
        {moreVisible && (
          <Dropdown
            trigger={['click']}
            placement="bottomRight"
            visible={dropdownVisible}
            onVisibleChange={this.handleUpdateDropdownVisible}
            overlay={this.renderOverlay()}
          >
            <Icon className={className} icon="more_horiz" />
          </Dropdown>
        )}
        {shareVisible && (
          <Share
            title={_l('分享统计图: %0', report.name)}
            from="report"
            isCharge={
              permissions ||
              (isLock ? [100, 200, 1, 2, 3].includes(permissionType) : isCharge || [2].includes(permissionType))
            }
            params={{
              appId,
              sourceId: report.id,
              worksheetId,
              title: report.name,
              pageId: sourceType === 1 ? pageId : undefined,
              privateVisible: sourceType === 1 || !sourceType,
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
