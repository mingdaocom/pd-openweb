import React, { Component, forwardRef, useImperativeHandle, useMemo } from 'react';
import { Provider } from 'react-redux';
import { Popover, Tooltip } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import reportApi from '../api/report';
import login from 'src/api/login';
import ErrorBoundary from 'src/ming-ui/components/ErrorWrapper';
import { defaultTitleStyles, replaceTitleStyle } from 'src/pages/customPage/components/ConfigSideWrap/util';
import { VIEW_DISPLAY_TYPE } from 'src/pages/worksheet/constants/enum';
import { configureStore } from 'src/redux/configureStore';
import { fillUrl } from 'src/router/navigateTo';
import { getTranslateInfo } from 'src/utils/app';
import { getAppFeaturesPath } from 'src/utils/app';
import { getFilledRequestParams } from 'src/utils/common';
import ChartDialog from '../ChartDialog';
import charts from '../Charts';
import { reportTypes } from '../Charts/common';
import { chartNav, fillValueMap, isOptionControl } from '../common';
import { Abnormal, Loading, WithoutData } from '../components/ChartStatus';
import Sort from '../components/Sort';
import MoreOverlay from './MoreOverlay';
import './Card.less';

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
      sorts: undefined,
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
    const { customPageConfig = {} } = this.props;
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
    const { isLinkageFilter, sorts } = this.state;
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
      sorts,
      filters: printFilter
        ? printFilter
        : [filters, filtersGroup, isLinkageFilter && linkageFiltersGroup].filter(_ => _),
      ...getFilledRequestParams({}),
    });
    this.request
      .then(result => {
        result.reportId = report.id;
        this.setState({
          reportData: fillValueMap(result, pageId),
          loading: false,
        });
        this.props.onLoad(result);
      })
      .catch(() => {
        if (!window.shareState.id) return;
        const result = {
          reportId: report.id,
          status: 0,
        };
        this.setState({
          reportData: result,
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
    const { pageEditable = false, linkageMatch = {}, onUpdateLinkageFiltersGroup = _.noop, filtersGroup } = this.props;
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
          filtersGroup={filtersGroup}
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
    const { xaxes, reportType, map, contrastMap, data } = this.state.reportData;
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
    const { loading, reportData } = this.state;

    return (
      <div className="content flexColumn">
        {loading ? <Loading /> : reportData.status > 0 ? this.renderContent() : <Abnormal status={reportData.status} />}
      </div>
    );
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
      DragHandle,
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
    const { reportType, yaxisList = [], xaxes = {}, style } = reportData;
    const { titleStyle = 0, pageBgColor, pageStyleType = 'light' } = customPageConfig;
    const pageTitleStyles = customPageConfig.titleStyles || {};
    const titleStyles = _.get(style, 'titleStyles') || defaultTitleStyles;
    const newTitleStyles = pageTitleStyles.index >= titleStyles.index ? pageTitleStyles : titleStyles;
    const isLight = pageStyleType === 'light';
    const permissions = sourceType ? permissionType > 0 : ownerId || isCharge;
    const isSheetView = ![reportTypes.PivotTable].includes(reportType);
    const translateInfo = getTranslateInfo(appId, null, report.id);
    const getBgColor = () => {
      const hideNumberChartName = [reportTypes.NumberChart].includes(reportType)
        ? (yaxisList.length === 1 && !xaxes.controlId) || !showTitle
        : !showTitle;
      if (this.state.loading) {
        return {};
      }
      if (titleStyle === 1) {
        return {
          '--title-color': hideNumberChartName ? undefined : '#fff',
          '--icon-color': hideNumberChartName ? undefined : '#fff',
          '--widget-title-color': isLight && !hideNumberChartName ? '#fff' : undefined,
          '--widget-icon-color': isLight && !hideNumberChartName ? '#ffffffcc' : undefined,
          '--widget-icon-hover-color': isLight && !hideNumberChartName ? '#ffffffcc' : undefined,
          marginBottom: 8,
          backgroundColor: themeColor,
        };
      }
      if (titleStyle === 2) {
        return {
          '--title-color': hideNumberChartName ? undefined : '#fff',
          '--icon-color': hideNumberChartName ? undefined : '#fff',
          '--widget-title-color': isLight && !hideNumberChartName ? '#fff' : undefined,
          '--widget-icon-color': isLight && !hideNumberChartName ? '#ffffffcc' : undefined,
          '--widget-icon-hover-color': isLight && !hideNumberChartName ? '#ffffffcc' : undefined,
          marginBottom: 8,
          background: `linear-gradient(to right, ${themeColor}, ${pageBgColor})`,
        };
      }
      if (titleStyle === 3) {
        return {
          margin: '0 10px 8px',
          padding: 0,
          borderBottom: `2px solid transparent`,
          borderImage: `linear-gradient(to right, ${themeColor}, ${pageBgColor}) 1`,
        };
      }
      return {};
    };
    return (
      <div
        className={cx(`statisticsCard statisticsCard-${report.id} statisticsCard-${reportData.reportType}`, className, {
          hideChartHeader: !showTitle,
          hideNumberChartName: !showTitle,
          headerHover: showTitle,
        })}
      >
        <div className="header" style={getBgColor()}>
          {(sourceType ? false : permissions) && DragHandle && (
            <DragHandle>
              <Tooltip title={_l('拖拽')} placement="bottom">
                <span className="iconItem dragWrap Gray_9e">
                  <Icon icon="drag" />
                </span>
              </Tooltip>
            </DragHandle>
          )}
          <div
            className={cx('flex valignWrapper', { justifyContentCenter: newTitleStyles.textAlign === 'center' })}
            style={{ minWidth: 0 }}
          >
            <div
              className="pointer ellipsis reportName"
              style={{ maxWidth: '80%', ...replaceTitleStyle(newTitleStyles, themeColor) }}
            >
              {translateInfo.name || reportData.name}
            </div>
            {reportData.desc && (
              <Tooltip title={translateInfo.description || reportData.desc} placement="bottom" autoCloseDelay={0}>
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
                <Tooltip title={_l('作用于图表的条件')} placement="bottom">
                  <span className={cx('mLeft7 pTop5 filterCriteriaIcon', { 'tip-bottom-right': !showTitle })}>
                    <Icon icon="filter_criteria" className="Font18 pointer Gray_9e" />
                  </span>
                </Tooltip>
              </Popover>
            )}
          </div>
          <div className="operateIconWrap valignWrapper Relative">
            {needEnlarge && !this.isPublicShare && (sourceType ? reportData.status > 0 : true) && (
              <Tooltip title={_l('筛选')} placement="bottom">
                <span
                  className="iconItem Gray_9e"
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
              </Tooltip>
            )}
            {needEnlarge && reportData.status > 0 && (
              <Sort
                reportId={report.id}
                pageId={pageId}
                sourceType={sourceType}
                currentReport={{
                  ...reportData,
                  pivotTable: {
                    columns: reportData.columns,
                    lines: reportData.lines,
                  },
                }}
                reportType={reportData.reportType}
                map={reportData.map}
                valueMap={reportData.valueMap}
                reportData={reportData}
                onChangeCurrentReport={data => {
                  const { sorts } = data;
                  this.setState(
                    {
                      sorts,
                    },
                    this.getData,
                  );
                }}
              >
                <span className="iconItem Gray_9e">
                  <Tooltip title={_l('排序')} placement="bottom">
                    <Icon icon="import_export" className="Font20 Bold" />
                  </Tooltip>
                </span>
              </Sort>
            )}
            {needRefresh && reportData.status > 0 && (
              <Tooltip title={_l('刷新')} placement="bottom">
                <span onClick={() => this.getData(this.props, true)} className="iconItem Gray_9e freshDataIconWrap">
                  <Icon className="Font20" icon="refresh1" />
                </span>
              </Tooltip>
            )}
            {needEnlarge && reportData.status > 0 && (
              <Tooltip title={_l('放大')} placement="bottom">
                <span
                  className="iconItem Gray_9e"
                  onClick={() => {
                    this.handleOperateClick({
                      settingVisible: false,
                      activeData: undefined,
                    });
                  }}
                >
                  <Icon className="Font20" icon="task-new-fullscreen" />
                </span>
              </Tooltip>
            )}
            {needEnlarge && !this.isPublicShare && (
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
                  sorts: this.state.sorts,
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
                customPageConfig={customPageConfig}
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
