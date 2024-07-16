import React, { Component, Fragment, useMemo, useImperativeHandle, forwardRef } from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { Tooltip, Popover } from 'antd';
import ChartDialog from '../ChartDialog';
import login from 'src/api/login';
import reportApi from '../api/report';
import ErrorBoundary from 'src/ming-ui/components/ErrorWrapper';
import { Provider } from 'react-redux';
import { configureStore } from 'src/redux/configureStore';
import { fillValueMap, chartNav, isOptionControl } from '../common';
import { reportTypes } from '../Charts/common';
import { Loading, WithoutData, Abnormal } from '../components/ChartStatus';
import { VIEW_DISPLAY_TYPE } from 'src/pages/worksheet/constants/enum';
import MoreOverlay from './MoreOverlay';
import charts from '../Charts';
import { browserIsMobile, getAppFeaturesPath, getTranslateInfo } from 'src/util';
import { fillUrl } from 'src/router/navigateTo';
import './Card.less';
import _ from 'lodash';

const isMobile = browserIsMobile();

let isCheckLogin = true;

class Card extends Component {
  static defaultProps = {
    needEnlarge: true,
    needTimingRefresh: true,
    onLoad: _.noop,
  };
  constructor(props) {
    super(props);
    this.state = {
      dialogVisible: false,
      reportData: {},
      loading: true,
      settingVisible: true,
      scopeVisible: false,
      sheetVisible: false,
      isLinkageFilter: true,
      activeData: undefined,
    };
    this.isPublicShare = window.shareAuthor || _.get(window, 'shareState.shareId');
  }
  componentDidMount() {
    this.getData(this.props);
  }
  componentWillReceiveProps(nextProps) {
    if (
      nextProps.needUpdate !== this.props.needUpdate ||
      !_.isEqual(nextProps.filtersGroup, this.props.filtersGroup) ||
      !_.isEqual(nextProps.linkageFiltersGroup, this.props.linkageFiltersGroup)
    ) {
      this.getData(nextProps);
    }
  }
  componentWillUnmount = () => {
    clearInterval(this.timer);
    this.abortRequest();
  };
  initInterval = () => {
    clearInterval(this.timer);
    const { report, customPageConfig = {} } = this.props;
    const { refresh } = customPageConfig;
    if (!refresh) return;
    this.timer = setInterval(() => {
      this.getData(this.props, false, true);
      if (isCheckLogin) {
        isCheckLogin = false;
        login.checkLogin({}).then(data => {
          isCheckLogin = data;
        });
      }
    }, refresh * 1000);
  };
  abortRequest = () => {
    if (this.request && this.request.abort) {
      this.request.abort();
    }
  };
  getData = (props, reload = false, refresh = false) => {
    const {
      needTimingRefresh,
      needRefresh = true,
      report = {},
      filters,
      filtersGroup,
      linkageFiltersGroup,
      pageId,
      sourceType,
    } = props || this.props;
    const isEmbed = location.href.includes('embed/chart');
    const { isLinkageFilter } = this.state;
    const printFilter =
      location.href.includes('printPivotTable') && JSON.parse(sessionStorage.getItem(`printFilter-${report.id}`));
    this.setState({ loading: true });
    this.abortRequest();
    const api = sourceType === 3 || isEmbed ? 'getFavoriteData' : refresh ? 'refreshData' : 'getData';
    this.request = reportApi[api]({
      reportId: report.id,
      pageId,
      version: '6.5',
      reload,
      filters: printFilter
        ? printFilter
        : [filters, filtersGroup, isLinkageFilter && linkageFiltersGroup].filter(_ => _),
    });
    this.request.then(result => {
      result.reportId = report.id;
      this.setState({
        reportData: fillValueMap(result),
        loading: false,
      });
      this.props.onLoad(result);
    });
    needTimingRefresh && needRefresh && this.initInterval();
  };
  handleOperateClick = ({ settingVisible, sheetVisible = false, activeData }) => {
    this.setState({
      dialogVisible: true,
      settingVisible,
      scopeVisible: false,
      sheetVisible,
      activeData,
    });
  };
  handleOpenChartDialog = data => {
    const { report, filters, filtersGroup, linkageFiltersGroup } = this.props;
    const { reportData, isLinkageFilter } = this.state;
    const { appId, filter, style, country } = reportData;
    const { filterRangeId, rangeType, rangeValue, dynamicFilter, today = false, customRangeValue } = filter;
    const { drillParticleSizeType } = country || {};
    const viewDataType = style ? style.viewDataType || 1 : 1;
    if (viewDataType === 2 && filter.viewId && [VIEW_DISPLAY_TYPE.sheet].includes(filter.viewType.toString())) {
      reportApi
        .getReportSingleCacheId({
          ...data,
          appId,
          filterRangeId,
          rangeType,
          rangeValue,
          dynamicFilter,
          today,
          customRangeValue,
          particleSizeType: drillParticleSizeType,
          filters: [filters, filtersGroup, isLinkageFilter && linkageFiltersGroup].filter(_ => _),
          isPersonal: true,
          reportId: report.id,
        })
        .then(result => {
          if (result.id) {
            window.open(
              fillUrl(`/worksheet/${appId}/view/${filter.viewId}?chartId=${result.id}&${getAppFeaturesPath()}`),
            );
          }
        });
    } else {
      this.handleOperateClick({
        settingVisible: false,
        sheetVisible: true,
        activeData: data,
      });
    }
  };
  renderChart() {
    const {
      projectId,
      report,
      mobileCount,
      mobileFontSize,
      layoutType,
      sourceType,
      themeColor,
      customPageConfig = {},
    } = this.props;
    const { pageEditable = false, linkageMatch = {}, onUpdateLinkageFiltersGroup = _.noop } = this.props;
    const { id } = report;
    const { loading, reportData } = this.state;
    const { reportType } = reportData;
    const Chart = charts[reportType];
    return (
      <ErrorBoundary>
        <Chart
          projectId={projectId}
          loading={loading}
          isThumbnail={true}
          isViewOriginalData={!this.isPublicShare}
          isLinkageData={sourceType === 1 && customPageConfig.autoLinkage && !pageEditable}
          onOpenChartDialog={this.handleOpenChartDialog}
          onUpdateLinkageFiltersGroup={onUpdateLinkageFiltersGroup}
          mobileCount={mobileCount}
          mobileFontSize={mobileFontSize}
          layoutType={layoutType}
          sourceType={sourceType}
          customPageConfig={customPageConfig}
          themeColor={themeColor}
          reportData={{
            ...reportData,
            reportId: id,
          }}
          linkageMatch={linkageMatch}
        />
      </ErrorBoundary>
    );
  }
  renderContent() {
    const { xaxes, reportType, map, contrastMap, contrast, data } = this.state.reportData;
    const isDisplayEmptyData =
      [
        reportTypes.BarChart,
        reportTypes.LineChart,
        reportTypes.DualAxes,
        reportTypes.RadarChart,
        reportTypes.PieChart,
        reportTypes.BidirectionalBarChart,
      ].includes(reportType) && isOptionControl(xaxes.controlType);
    if (
      [
        reportTypes.BarChart,
        reportTypes.LineChart,
        reportTypes.RadarChart,
        reportTypes.FunnelChart,
        reportTypes.DualAxes,
        reportTypes.CountryLayer,
        reportTypes.BidirectionalBarChart,
        reportTypes.ScatterChart,
        reportTypes.WordCloudChart,
        reportTypes.TopChart,
      ].includes(reportType)
    ) {
      return map.length || contrastMap.length || isDisplayEmptyData ? this.renderChart() : <WithoutData />;
    }
    if ([reportTypes.PieChart].includes(reportType)) {
      return map.length || isDisplayEmptyData ? this.renderChart() : <WithoutData />;
    }
    if ([reportTypes.GaugeChart, reportTypes.ProgressChart].includes(reportType)) {
      return this.renderChart();
    }
    if ([reportTypes.NumberChart].includes(reportType)) {
      return this.renderChart();
    }
    if ([reportTypes.PivotTable].includes(reportType)) {
      return _.isEmpty(data.data) ? <WithoutData /> : this.renderChart();
    }
  }
  renderBody() {
    const { needRefresh } = this.props;
    const { loading, reportData } = this.state;

    if (reportData.reportType === reportTypes.CountryLayer && needRefresh) {
      return (
        <Fragment>
          {loading && (
            <div className="fixedLoading">
              <Loading />
            </div>
          )}
          {reportData.status > 0 ? this.renderContent() : <Abnormal status={reportData.status} />}
        </Fragment>
      );
    } else {
      return (
        <div className="content flexColumn">
          {loading ? (
            <Loading />
          ) : reportData.status > 0 ? (
            this.renderContent()
          ) : (
            <Abnormal status={reportData.status} />
          )}
        </div>
      );
    }
  }
  render() {
    const { dialogVisible, reportData, settingVisible, scopeVisible, sheetVisible, activeData, isLinkageFilter } =
      this.state;
    const { showTitle = true } = reportData.displaySetup || {};
    const {
      sourceType,
      filtersGroup,
      linkageFiltersGroup,
      initiateChartInfo,
      customPageConfig = {},
      themeColor,
    } = this.props;
    const {
      report = {},
      appId,
      pageId,
      ownerId,
      needEnlarge,
      needRefresh = true,
      filters,
      className,
      onRemove,
      isCharge,
      permissionType,
      isLock,
      projectId,
      onCancelFavorite,
    } = this.props;
    const permissions = sourceType ? permissionType > 0 : ownerId || isCharge;
    const isSheetView = ![reportTypes.PivotTable].includes(reportData.reportType);
    const translateInfo = getTranslateInfo(appId, null, report.id);

    return (
      <div
        className={cx(`statisticsCard statisticsCard-${report.id} statisticsCard-${reportData.reportType}`, className, {
          hideChartHeader: !showTitle,
          hideNumberChartName: !showTitle,
        })}
      >
        <div className="header">
          {(sourceType ? false : permissions) && (
            <span data-tip={_l('拖拽')} className="iconItem dragWrap Gray_9e">
              <Icon icon="drag" />
            </span>
          )}
          <div className="flex valignWrapper" style={{ minWidth: 0 }}>
            <div className="pointer ellipsis bold reportName" style={{ maxWidth: '80%' }}>
              {translateInfo.name || reportData.name}
            </div>
            {reportData.desc && (
              <Tooltip title={translateInfo.description || reportData.desc} placement="bottom">
                <Icon icon="info" className="Font18 pointer Gray_9e mLeft7 reportDesc" />
              </Tooltip>
            )}
            {sourceType && !_.isEmpty(initiateChartInfo) && (
              <Popover
                visible={undefined}
                trigger="click"
                placement="bottom"
                overlayClassName="customPageAutoLinkagePopoverWrap"
                content={
                  <div className="customPageAutoLinkagePopover">
                    <div className="Font14 bold mBottom5">
                      {_l('作用于图表的条件')} · <span>{initiateChartInfo.length}</span>
                    </div>
                    {initiateChartInfo.map(item => (
                      <div className="linkageFilter">
                        {item.filters.map((n, index) => (
                          <div className="flexRow alignItemsCenter" key={n.controlId}>
                            {!index && (
                              <Icon
                                className="Font16 mRight5 ThemeColor"
                                icon={_.find(chartNav, { type: item.reportType }).icon}
                              />
                            )}
                            <div
                              className={cx({ mLeft20: index })}
                              dangerouslySetInnerHTML={{
                                __html: _l(
                                  '%0是%1',
                                  `<span class="bold mRight2">${n.controlName}</span>`,
                                  `<span class="bold mLeft2">${n.controlValue || '--'}</span>`,
                                ),
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                }
              >
                <span
                  className={cx('mLeft7 pTop5 filterCriteriaIcon', { 'tip-bottom-right': !showTitle })}
                  data-tip={_l('作用于图表的条件')}
                >
                  <Icon icon="filter_criteria" className="Font18 pointer Gray_9e" />
                </span>
              </Popover>
            )}
            {/*sourceType && !_.isEmpty(initiateChartInfo) && (
              <span className="mLeft7 pTop5" data-tip={_l('取消联动筛选')}>
                <Icon
                  icon="link_Dismiss flex"
                  className={cx('Font18 pointer', isLinkageFilter ? 'Gray_9e' : 'ThemeColor')}
                  onClick={() => {
                    this.setState(
                      {
                        isLinkageFilter: !isLinkageFilter,
                      },
                      () => {
                        this.getData();
                      },
                    );
                  }}
                />
              </span>
            )*/}
          </div>
          <div className="operateIconWrap valignWrapper Relative">
            {needEnlarge && !this.isPublicShare && (sourceType ? reportData.status > 0 : true) && (
              <span
                className="iconItem Gray_9e"
                data-tip={_l('筛选')}
                onClick={() => {
                  this.setState({
                    dialogVisible: true,
                    sheetVisible: false,
                    settingVisible: false,
                    scopeVisible: true,
                    activeData: undefined,
                  });
                }}
              >
                <Icon className="Font20" icon="filter" />
              </span>
            )}
            {needRefresh && reportData.status > 0 && (
              <span
                onClick={() => this.getData(this.props, true)}
                data-tip={_l('刷新')}
                className="iconItem Gray_9e freshDataIconWrap"
              >
                <Icon className="Font20" icon="refresh1" />
              </span>
            )}
            {needEnlarge && reportData.status > 0 && (
              <span
                className="iconItem Gray_9e"
                data-tip={_l('放大')}
                onClick={() => {
                  this.handleOperateClick({
                    settingVisible: false,
                    activeData: undefined,
                  });
                }}
              >
                <Icon icon="task-new-fullscreen" />
              </span>
            )}
            {needEnlarge && !this.isPublicShare && (sourceType === 3 ? true : reportData.status > 0) && (
              <MoreOverlay
                className="iconItem Gray_9e Font20"
                projectId={projectId}
                pageId={pageId}
                themeColor={themeColor}
                permissions={permissions}
                permissionType={permissionType}
                isLock={isLock}
                isCharge={isCharge}
                reportData={reportData}
                reportStatus={reportData.status}
                reportType={reportData.reportType}
                favorite={reportData.favorite}
                onCancelFavorite={onCancelFavorite}
                filter={reportData.filter}
                sourceType={sourceType}
                isMove={sourceType ? false : permissions && isCharge}
                onRemove={sourceType ? false : permissions && onRemove}
                exportData={{
                  filters,
                  filtersGroup,
                  linkageFiltersGroup: isLinkageFilter && linkageFiltersGroup,
                }}
                report={{
                  id: report.id,
                  name: reportData.name,
                  desc: reportData.desc,
                }}
                ownerId={ownerId}
                appId={appId}
                worksheetId={reportData.appId}
                onOpenSetting={
                  (sourceType === 1 ? isCharge : permissions)
                    ? () => {
                        this.handleOperateClick({
                          settingVisible: true,
                          activeData: undefined,
                        });
                      }
                    : null
                }
                onSheetView={
                  isSheetView
                    ? () => {
                        this.setState({
                          dialogVisible: true,
                          sheetVisible: true,
                          settingVisible: false,
                          scopeVisible: false,
                          activeData: undefined,
                        });
                      }
                    : null
                }
              />
            )}
          </div>
        </div>
        {this.renderBody()}
        {dialogVisible && (
          <ChartDialog
            {...this.props}
            linkageFiltersGroup={isLinkageFilter && linkageFiltersGroup}
            report={{
              ...report,
              name: reportData.name,
              desc: reportData.desc,
            }}
            pageId={pageId}
            customPageConfig={customPageConfig}
            themeColor={themeColor}
            activeData={activeData}
            worksheetId={reportData.appId}
            settingVisible={settingVisible}
            scopeVisible={scopeVisible}
            sheetVisible={sheetVisible}
            permissions={permissions}
            dialogVisible={dialogVisible}
            updateDialogVisible={({ dialogVisible, isRequest, reportId, reportName, reportDesc }) => {
              this.setState({ dialogVisible });
              if (reportName !== reportData.name || reportDesc !== reportData.desc) {
                this.setState({
                  reportData: {
                    ...reportData,
                    name: reportName,
                    desc: reportDesc,
                  },
                });
              }
              if (isRequest) {
                this.getData({
                  ...this.props,
                  report: { id: reportId },
                });
              }
            }}
            onRemove={onRemove}
          />
        )}
      </div>
    );
  }
}

function SingleCard(props, ref) {
  const store = useMemo(configureStore, []);

  useImperativeHandle(ref, () => ({
    dispatch: store.dispatch,
    getState: store.getState,
  }));

  return (
    <Provider store={store}>
      <Card {...props} ref={props.$cardRef} />
    </Provider>
  );
}

export default forwardRef(SingleCard);
