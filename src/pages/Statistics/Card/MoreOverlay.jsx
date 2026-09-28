import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Dropdown, Modal } from 'ming-ui/antd-components';
import reportConfig from '../api/reportConfig';
import favoriteApi from 'src/api/favorite';
import sheetApi from 'src/api/worksheet';
import reportApi from 'statistics/api/report';
import Share from 'src/pages/worksheet/components/Share';
import { reportTypes } from 'src/utils/domain/statistics/reportTypes';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import { getFilledRequestParams } from 'src/utils/platform/navigation/query';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import PageMove from '../components/PageMove';

const renderMenuIcon = (icon, props = {}) => <Icon className="Font18" icon={icon} {...props} />;

export default class MoreOverlay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shareVisible: false,
      showPageMove: false,
      favorite: props.favorite,
      placement: 'bottomRight',
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (this.props.favorite !== prevProps.favorite) {
        this.setState({
          favorite: this.props.favorite,
        });
      }
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
      .then(() => {})
      .catch(error => {
        alertIfNotUnauthorized(error, error, 2);
      });
  };
  handleDelete = () => {
    const { report, filter, appId } = this.props;
    const { id, name } = report;
    this.handleUpdateDropdownVisible(false);
    Modal.confirm({
      title: <span className="Red textError">{_l('您确定要删除表“%0” ?', name)}</span>,
      okButtonProps: { danger: true },
      onOk: () => {
        reportConfig
          .deleteReport({
            reportId: id,
          })
          .then(() => {
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
      const container = document.querySelector('#componentsWrap');
      const moreIcon = card.querySelector('.chartCardMoreIcon');

      if (container && moreIcon) {
        const elementRect = moreIcon.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const elementBottomToContainerTop = elementRect.bottom - containerRect.top;
        const containerVisibleHeight = container.clientHeight;
        this.setState({
          placement: containerVisibleHeight - elementBottomToContainerTop < 200 ? 'topRight' : 'bottomRight',
        });
      }

      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  };
  handleMenuClick = ({ key }) => {
    const { themeColor, report, onSheetView, onOpenSetting } = this.props;

    switch (key) {
      case 'setting':
        onOpenSetting();
        this.handleUpdateDropdownVisible(false);
        break;
      case 'collect':
        this.handleChangeFavorite(!this.state.favorite);
        this.handleUpdateDropdownVisible(false);
        break;
      case 'sheetDisplay':
        onSheetView();
        this.handleUpdateDropdownVisible(false);
        break;
      case 'share':
        this.setState({ shareVisible: true });
        this.handleUpdateDropdownVisible(false);
        break;
      case 'exportOriginal':
        this.handleExportExcel(0);
        break;
      case 'exportUnit':
        this.handleExportExcel(1);
        break;
      case 'print': {
        const { filters = [], filtersGroup = [] } = this.props.exportData;
        const printFilter = [filters, filtersGroup].filter(n => !_.isEmpty(n));

        this.handleUpdateDropdownVisible(false);
        sessionStorage.setItem(`printFilter-${report.id}`, JSON.stringify(printFilter));
        window.open(pathCompletion(`/printPivotTable/${report.id}/${encodeURIComponent(themeColor || '')}`));
        break;
      }

      case 'publicTransform':
        this.handleUpdateOwnerId();
        break;
      case 'curStatistic':
        this.handleCopy();
        break;
      case 'customPage':
        this.setState({ showPageMove: true });
        this.handleUpdateDropdownVisible(false);
        break;
      case 'delete':
        this.handleDelete();
        break;
      default:
        break;
    }
  };
  getMenuItems() {
    const {
      reportType,
      sourceType,
      ownerId,
      reportStatus,
      isMove,
      permissionType,
      projectId,
      customPageConfig = {},
      reportData,
      onSheetView,
      onOpenSetting,
      onRemove,
    } = this.props;
    const { favorite } = this.state;
    const { chartShare = true, chartExportExcel = true } = customPageConfig;
    const isEmbedPage = location.href.includes('embed/page');
    const isEmbedChart = location.href.includes('embed/chart');
    const isFavorite =
      _.find(md.global.Account.projects, { projectId }) &&
      !window.isPublicApp &&
      !window.shareState.id &&
      !md.global.Account.isPortal &&
      sourceType !== 2;

    return [
      onOpenSetting && {
        key: 'setting',
        icon: renderMenuIcon('settings'),
        label: _l('设置'),
      },
      isFavorite && {
        key: 'collect',
        icon: renderMenuIcon(favorite ? 'task-star' : 'star-hollow', {
          style: { color: favorite ? 'var(--color-yellow)' : undefined },
        }),
        label: favorite ? _l('取消收藏') : _l('收藏'),
      },
      onSheetView &&
        reportStatus > 0 && {
          key: 'sheetDisplay',
          icon: renderMenuIcon('table'),
          label: _l('以表格显示'),
        },
      !md.global.Account.isPortal &&
        !(isEmbedPage || isEmbedChart) &&
        reportStatus > 0 &&
        sourceType !== 3 &&
        chartShare && {
          key: 'share',
          icon: renderMenuIcon('share'),
          label: _l('分享'),
        },
      !window.isPublicApp &&
        reportStatus > 0 &&
        chartExportExcel &&
        _.get(reportData, 'xaxes.controlType') !== 40 && {
          key: 'export',
          popupClassName: 'chartSubOperate_export',
          popupOffset: [0, 0],
          icon: renderMenuIcon('worksheet_export'),
          label: _l('导出Excel%06002'),
          popupStyle: { minWidth: 180 },
          children: [
            {
              key: 'exportOriginal',
              label: _l('按照原值导出%06000'),
            },
            {
              key: 'exportUnit',
              label: _l('按显示单位导出%06001'),
            },
          ],
        },
      [reportTypes.PivotTable].includes(reportType) &&
        !md.global.Account.isPortal && {
          key: 'print',
          icon: renderMenuIcon('print'),
          label: _l('打印'),
        },
      isMove && {
        key: 'moveDivider',
        type: 'divider',
        className: 'mTop5 mBottom5',
      },
      isMove && {
        key: 'publicTransform',
        icon: renderMenuIcon(ownerId ? 'worksheet_public' : 'minus-square'),
        label: ownerId ? _l('转为公共图表') : _l('从公共中移出'),
      },
      isMove && {
        key: 'copy',
        popupClassName: 'chartSubOperate_copy',
        popupOffset: [0, 0],
        icon: renderMenuIcon('content-copy'),
        label: _l('复制到'),
        popupStyle: { minWidth: 180 },
        children: [
          {
            key: 'curStatistic',
            label: _l('当前统计'),
          },
          permissionType !== 2 && {
            key: 'customPage',
            label: _l('自定义页面'),
          },
        ].filter(Boolean),
      },
      onRemove && {
        key: 'removeDivider',
        type: 'divider',
        className: 'mTop5 mBottom5',
      },
      onRemove && {
        key: 'delete',
        icon: renderMenuIcon('trash'),
        label: _l('删除'),
        danger: true,
      },
    ].filter(Boolean);
  }
  render() {
    const { shareVisible, showPageMove, dropdownVisible, placement } = this.state;
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
            placement={placement}
            open={dropdownVisible}
            onOpenChange={this.handleUpdateDropdownVisible}
            menu={{
              items: this.getMenuItems(),
              onClick: this.handleMenuClick,
              style: { minWidth: 180 },
            }}
          >
            <span className={className}>
              <Icon className="chartCardMoreIcon" icon="more_horiz" />
            </span>
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
