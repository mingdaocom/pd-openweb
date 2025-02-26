import React, { Fragment } from 'react';
import { Icon } from 'ming-ui';
import cx from 'classnames';
import { SpinLoading } from 'antd-mobile';
import charts from 'statistics/Charts';
import { WithoutData, Abnormal } from 'statistics/components/ChartStatus';
import { reportTypes } from 'statistics/Charts/common';
import { isOptionControl } from 'statistics/common';
import styled from 'styled-components';
import { getAppFeaturesPath, getTranslateInfo } from 'src/util';
import reportApi from 'statistics/api/report';
import { VIEW_DISPLAY_TYPE } from 'src/pages/worksheet/constants/enum';
import homeAppApi from 'src/api/homeApp';
import './index.less';
import _ from 'lodash';

const Content = styled.div`
  flex: 1;
  .showTotalHeight {
    height: 100%;
  }
`;

function Chart({ data, mobileCount, mobileFontSize, isHorizontal, projectId, themeColor, pageConfig = {}, linkageMatch, onUpdateLinkageFiltersGroup }) {
  if (data.status <= 0) {
    return <Abnormal status={data.status} />;
  }

  const isMapEmpty = _.isEmpty(data.map);
  const isContrastMapEmpty = _.isEmpty(data.contrastMap);
  const Charts = charts[data.reportType];
  const WithoutDataComponent = <WithoutData />;
  const { drillParticleSizeType } = data.country || {};
  const filter = data.filter || {};
  const { filterRangeId, rangeType, rangeValue, dynamicFilter, today = false, customRangeValue } = filter;
  const { filters, filtersGroup, autoLinkage } = pageConfig;
  const viewOriginalSheet = (params) => {
    reportApi.getReportSingleCacheId({
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
      reportId: data.reportId
    }).then(result => {
      if (result.id) {
        const workSheetId = data.appId;
        if (window.isMingDaoApp) {
          const url = `/worksheet/${workSheetId}/view/${filter.viewId}?chartId=${result.id}&${getAppFeaturesPath()}`;
          window.location.href = url;
        } else {
          homeAppApi.getAppSimpleInfo({ workSheetId }).then(data => {
            const url = `/mobile/recordList/${data.appId}/${data.appSectionId}/${workSheetId}/${filter.viewId}?chartId=${result.id}`;
            window.mobileNavigateTo(url);
          });
        }
      }
    });
  }
  const isPublicShare = window.shareAuthor || _.get(window, 'shareState.shareId');
  const isViewOriginalData = filter.viewId && [VIEW_DISPLAY_TYPE.sheet].includes(filter.viewType.toString()) && !isPublicShare;
  const isDisplayEmptyData = [reportTypes.BarChart, reportTypes.LineChart, reportTypes.DualAxes, reportTypes.RadarChart, reportTypes.PieChart, reportTypes.BidirectionalBarChart].includes(data.reportType) && isOptionControl(data.xaxes.controlType);

  const ChartComponent = (
    <Charts
      reportData={data}
      isThumbnail={true}
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

  switch (data.reportType) {
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
      break;
    case reportTypes.DualAxes:
    case reportTypes.LineChart:
      return isMapEmpty && isContrastMapEmpty && !isDisplayEmptyData ? WithoutDataComponent : ChartComponent;
      break;
    case reportTypes.NumberChart:
      return ChartComponent;
      break;
    case reportTypes.PivotTable:
      return _.isEmpty(data.data.data) ? WithoutDataComponent : ChartComponent;
      break;
    default:
      return ChartComponent;
      break;
  }
}

function ChartWrapper(props) {
  const { loading, pageComponents = [], onOpenFilterModal, onOpenZoomModal, onLoadBeforeData, onLoadNextData, ...chartProps } = props;
  const { data, isHorizontal } = chartProps;
  const isVertical = window.orientation === 0;
  const isMobileChartPage = location.href.includes('mobileChart');
  const index = _.findIndex(pageComponents, { value: data.reportId });
  const beforeAllow = (pageComponents.length - index) < pageComponents.length;
  const nextAllow = index < pageComponents.length - 1;
  const translateInfo = getTranslateInfo(props.appId, null, data.reportId);
  const { showTitle = true } = _.get(data, 'displaySetup') || {};

  return (
    <Fragment>
      <div className={cx('mBottom10 flexRow valignWrapper', { mRight20: isHorizontal })}>
        <div className="Font17 Gray ellipsis name flex">{showTitle ? translateInfo.name || data.name : ''}</div>
        {data.status > 0 && (
          <Fragment>
            {isHorizontal && (
              <Fragment>
                <Icon
                  icon="navigate_before"
                  className={cx('Font24 Gray_9e mRight10', { allow: beforeAllow })}
                  onClick={beforeAllow && onLoadBeforeData.bind(this, index - 1)}
                />
                <Icon
                  icon="navigate_next"
                  className={cx('Font24 Gray_9e mRight20', { allow: nextAllow })}
                  onClick={nextAllow && onLoadNextData.bind(this, index + 1)}
                />
              </Fragment>
            )}
            <Icon className="Font20 Gray_9e mRight10" icon="swap_vert" onClick={onOpenFilterModal} />
            {isHorizontal ? (
              <Icon className="Font20 Gray_9e" icon="close" onClick={onOpenZoomModal} />
            ) : (
              isVertical && <Icon className={cx('Font18 Gray_9e', { Visibility: isMobileChartPage })} icon="task-new-fullscreen" onClick={onOpenZoomModal} />
            )}
          </Fragment>
        )}
      </div>
      <Content className={cx('flexColumn overflowHidden', `statisticsCard-${data.reportId}`)}>
        {loading ? (
          <div className="flexRow justifyContentCenter alignItemsCenter h100">
            <SpinLoading color='primary' />
          </div>
        ) : (
          <Chart
            {...chartProps}
          />
        )}
      </Content>
    </Fragment>
  );
}

export default ChartWrapper;
