import React, { Fragment, useEffect, useState } from 'react';
import { SpinLoading } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import homeAppApi from 'src/api/homeApp';
import reportApi from 'statistics/api/report';
import { reportTypes } from 'statistics/Charts/common';
import VerificationDataLength from 'statistics/Charts/VerificationDataLength';
import { isOptionControl } from 'statistics/common/controlUtils';
import { Abnormal, WithoutData } from 'statistics/components/ChartStatus';
import { defaultTitleStyles, replaceTitleStyle } from 'src/pages/customPage/components/ConfigSideWrap/util';
import { VIEW_DISPLAY_TYPE } from 'src/pages/worksheet/constants/enum';
import { getTranslateInfo } from 'src/utils/app';
import { pathCompletion } from 'src/utils/common';
import './index.less';

const Content = styled.div`
  flex: 1;
  .showTotalHeight {
    height: 100%;
  }
  .g2-tooltip {
    background-color: var(--color-background-card) !important;
  }
  .g2-html-annotation {
    display: block !important;
  }
`;

const CHART_LOADERS = {
  [reportTypes.LineChart]: () => import('statistics/Charts/LineChart'),
  [reportTypes.BarChart]: () => import('statistics/Charts/BarChart'),
  [reportTypes.PieChart]: () => import('statistics/Charts/PieChart'),
  [reportTypes.NumberChart]: () => import('statistics/Charts/NumberChart'),
  [reportTypes.RadarChart]: () => import('statistics/Charts/RadarChart'),
  [reportTypes.FunnelChart]: () => import('statistics/Charts/FunnelChart'),
  [reportTypes.DualAxes]: () => import('statistics/Charts/DualAxes'),
  [reportTypes.PivotTable]: () => import('statistics/Charts/PivotTable'),
  [reportTypes.CountryLayer]: () => import('statistics/Charts/CountryLayer'),
  [reportTypes.BidirectionalBarChart]: () => import('statistics/Charts/BidirectionalBarChart'),
  [reportTypes.ScatterChart]: () => import('statistics/Charts/ScatterChart'),
  [reportTypes.WordCloudChart]: () => import('statistics/Charts/WordCloudChart'),
  [reportTypes.GaugeChart]: () => import('statistics/Charts/GaugeChart'),
  [reportTypes.ProgressChart]: () => import('statistics/Charts/ProgressChart'),
  [reportTypes.TopChart]: () => import('statistics/Charts/TopChart'),
  [reportTypes.WorldMap]: () => import('statistics/Charts/WorldMap'),
};

const VERIFY_CHART_TYPES = [
  reportTypes.LineChart,
  reportTypes.BarChart,
  reportTypes.PieChart,
  reportTypes.RadarChart,
  reportTypes.FunnelChart,
  reportTypes.DualAxes,
  reportTypes.WordCloudChart,
];

const chartComponentCache = {};

const loadChartComponent = reportType => {
  const normalizedReportType = Number(reportType);

  if (chartComponentCache[normalizedReportType]) {
    return Promise.resolve(chartComponentCache[normalizedReportType]);
  }

  const loader = CHART_LOADERS[normalizedReportType];

  if (!loader) {
    return Promise.resolve(null);
  }

  return loader().then(component => {
    const ChartComponent = component.default;
    chartComponentCache[normalizedReportType] = VERIFY_CHART_TYPES.includes(normalizedReportType)
      ? VerificationDataLength(ChartComponent)
      : ChartComponent;

    return chartComponentCache[normalizedReportType];
  });
};

function Chart({
  data,
  mobileCount,
  mobileFontSize,
  isHorizontal,
  projectId,
  themeColor,
  pageConfig = {},
  linkageMatch,
  onUpdateLinkageFiltersGroup,
}) {
  const reportType = Number(data.reportType);
  const [chart, setChart] = useState(() => ({
    reportType,
    Component: chartComponentCache[reportType],
  }));

  useEffect(() => {
    let isMounted = true;

    if (!reportType || data.status <= 0) {
      return;
    }

    const cachedChart = chartComponentCache[reportType];

    if (cachedChart) {
      setChart({ reportType, Component: cachedChart });
      return;
    }

    setChart({ reportType, Component: null });
    loadChartComponent(reportType).then(Component => {
      if (isMounted) {
        setChart({ reportType, Component });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [reportType, data.status]);

  if (data.status <= 0) {
    return <Abnormal status={data.status} />;
  }

  const isMapEmpty = _.isEmpty(data.map);
  const isContrastMapEmpty = _.isEmpty(data.contrastMap);
  const Charts = chart.reportType === reportType ? chart.Component : null;
  const WithoutDataComponent = <WithoutData />;
  const { drillParticleSizeType } = data.country || {};
  const filter = data.filter || {};
  const { filterRangeId, rangeType, rangeValue, dynamicFilter, today = false, customRangeValue } = filter;
  const { filters, filtersGroup, autoLinkage } = pageConfig;

  const viewOriginalSheet = params => {
    reportApi
      .getReportSingleCacheId({
        ...params,
        appId: data.appId,
        filterRangeId,
        rangeType,
        rangeValue,
        dynamicFilter,
        today,
        customRangeValue,
        filters: [filters, filtersGroup].filter(_ => _),
        particleSizeType: drillParticleSizeType,
        isPersonal: true,
        reportId: data.reportId,
      })
      .then(result => {
        if (result.id) {
          const workSheetId = data.appId;

          if (window.isMingDaoApp) {
            const url = `/worksheet/${workSheetId}/view/${filter.viewId}?chartId=${result.id}`;
            window.location.href = pathCompletion(url);
          } else {
            homeAppApi.getAppSimpleInfo({ workSheetId }).then(data => {
              const url = `/mobile/recordList/${data.appId}/${data.appSectionId}/${workSheetId}/${filter.viewId}?chartId=${result.id}`;
              window.mobileNavigateTo(url);
            });
          }
        }
      });
  };

  const isPublicShare = window.shareAuthor || _.get(window, 'shareState.shareId');
  const isViewOriginalData =
    filter.viewId && [VIEW_DISPLAY_TYPE.sheet].includes(filter.viewType.toString()) && !isPublicShare;
  const isDisplayEmptyData =
    [
      reportTypes.BarChart,
      reportTypes.LineChart,
      reportTypes.DualAxes,
      reportTypes.RadarChart,
      reportTypes.PieChart,
      reportTypes.BidirectionalBarChart,
    ].includes(reportType) && isOptionControl(data.xaxes.controlType);

  if (!CHART_LOADERS[reportType]) {
    return WithoutDataComponent;
  }

  if (!Charts) {
    return (
      <div className="flexRow justifyContentCenter alignItemsCenter h100">
        <SpinLoading color="primary" />
      </div>
    );
  }

  const ChartComponent = (
    <Charts
      reportData={data}
      isThumbnail={true}
      isMobile={true}
      isViewOriginalData={isViewOriginalData}
      isLinkageData={autoLinkage}
      onOpenChartDialog={viewOriginalSheet}
      onUpdateLinkageFiltersGroup={onUpdateLinkageFiltersGroup}
      linkageMatch={linkageMatch}
      mobileCount={mobileCount}
      mobileFontSize={mobileFontSize}
      isHorizontal={isHorizontal}
      projectId={projectId}
      themeColor={themeColor}
      customPageConfig={pageConfig}
    />
  );

  switch (reportType) {
    case reportTypes.BarChart:
    case reportTypes.PieChart:
    case reportTypes.RadarChart:
    case reportTypes.FunnelChart:
    case reportTypes.CountryLayer:
    case reportTypes.WordCloudChart:
    case reportTypes.BidirectionalBarChart:
    case reportTypes.ScatterChart:
    case reportTypes.TopChart:
      return isMapEmpty && !isDisplayEmptyData ? WithoutDataComponent : ChartComponent;
    case reportTypes.DualAxes:
    case reportTypes.LineChart:
      return isMapEmpty && isContrastMapEmpty && !isDisplayEmptyData ? WithoutDataComponent : ChartComponent;
    case reportTypes.NumberChart:
      return ChartComponent;
    case reportTypes.PivotTable:
      return _.isEmpty(data.data.data) ? WithoutDataComponent : ChartComponent;
    default:
      return ChartComponent;
  }
}

function ChartWrapper(props) {
  const {
    widget,
    loading,
    pageComponents = [],
    onOpenFilterModal,
    onOpenZoomModal,
    onLoadBeforeData,
    onLoadNextData,
    ...chartProps
  } = props;
  const { data, isHorizontal, themeColor, pageConfig } = chartProps;
  const isVertical = window.orientation === 0;
  const isMobileChartPage = location.href.includes('mobileChart');
  const index = _.findIndex(pageComponents, { value: data.reportId });
  const beforeAllow = pageComponents.length - index < pageComponents.length;
  const nextAllow = index < pageComponents.length - 1;
  const translateInfo = getTranslateInfo(props.appId, null, data.reportId);
  const { showTitle = true } = _.get(data, 'displaySetup') || {};
  const pageTitleStyles = pageConfig.titleStyles || {};
  const titleStyles = _.get(data, 'style.titleStyles') || { ...defaultTitleStyles, fontSize: 17 };
  const newTitleStyles = pageTitleStyles.index >= titleStyles.index ? pageTitleStyles : titleStyles;
  const { titleStyle = 0, pageBgColor } = pageConfig;

  const getBgColor = () => {
    const { reportType, xaxes, yaxisList } = data;
    const hideNumberChartName = [reportTypes.NumberChart].includes(reportType)
      ? (yaxisList.length === 1 && !xaxes.controlId) || !showTitle
      : !showTitle;

    if (loading) {
      return {};
    }

    if (titleStyle === 1) {
      return {
        '--title-color': hideNumberChartName ? undefined : '#fff',
        '--icon-color': hideNumberChartName ? undefined : '#fff',
        backgroundColor: themeColor,
      };
    }

    if (titleStyle === 2) {
      return {
        '--title-color': hideNumberChartName ? undefined : '#fff',
        '--icon-color': hideNumberChartName ? undefined : '#fff',
        background: `linear-gradient(to right, ${themeColor}, ${pageBgColor})`,
      };
    }

    return {};
  };

  return (
    <Fragment>
      {!loading && (
        <div
          className={cx('mBottom10 flexRow valignWrapper chartHeader Relative', { mRight20: isHorizontal })}
          style={getBgColor()}
        >
          <div
            className={cx('ellipsis name flex', { centerAlign: newTitleStyles.textAlign === 'center' })}
            style={{
              ...replaceTitleStyle(newTitleStyles, themeColor),
            }}
          >
            {showTitle ? translateInfo.name || data.name : ''}
          </div>
          {data.status > 0 && (
            <Fragment>
              {isHorizontal && (
                <Fragment>
                  <Icon
                    icon="navigate_before"
                    className={cx('Font24 textTertiary mRight10', { allow: beforeAllow })}
                    onClick={beforeAllow && onLoadBeforeData.bind(this, index - 1)}
                  />
                  <Icon
                    icon="navigate_next"
                    className={cx('Font24 textTertiary mRight20', { allow: nextAllow })}
                    onClick={nextAllow && onLoadNextData.bind(this, index + 1)}
                  />
                </Fragment>
              )}
              <Icon className="Font20 textTertiary mRight10" icon="import_export" onClick={onOpenFilterModal} />
              {isHorizontal ? (
                <Icon className="Font20 textTertiary" icon="close" onClick={onOpenZoomModal} />
              ) : (
                isVertical && (
                  <Icon
                    className={cx('Font18 textTertiary', { Visibility: isMobileChartPage })}
                    icon="task-new-fullscreen"
                    onClick={onOpenZoomModal}
                  />
                )
              )}
            </Fragment>
          )}
          {titleStyle === 3 && showTitle && (
            <div
              className="headerBottomLine"
              style={{ background: `linear-gradient(to right, ${themeColor}, ${pageBgColor})` }}
            />
          )}
        </div>
      )}
      <Content className={cx('flexColumn overflowHidden', `statisticsCard-${_.get(widget, 'value') || data.reportId}`)}>
        {loading ? (
          <div className="flexRow justifyContentCenter alignItemsCenter h100">
            <SpinLoading color="primary" />
          </div>
        ) : (
          <Chart {...chartProps} />
        )}
      </Content>
    </Fragment>
  );
}

export default ChartWrapper;
