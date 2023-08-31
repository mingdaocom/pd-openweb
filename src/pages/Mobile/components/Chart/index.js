import React, { Fragment } from 'react';
import { Icon } from 'ming-ui';
import cx from 'classnames';
import { Flex, ActivityIndicator } from 'antd-mobile';
import charts from 'statistics/Charts';
import { WithoutData, Abnormal } from 'statistics/components/ChartStatus';
import { reportTypes } from 'statistics/Charts/common';
import styled from 'styled-components';
import { getAppFeaturesPath } from 'src/util';
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

function Chart({ data, mobileCount, isHorizontal }) {
  if (data.status <= 0) {
    return <Abnormal status={data.status} />;
  }

  const isMingdao = navigator.userAgent.toLowerCase().includes('mingdao application');
  const isIOS = navigator.userAgent.toLowerCase().includes('iphone');
  const isWeixin = isIOS && navigator.userAgent.toLowerCase().includes('micromessenger');
  const isSafari = isIOS && navigator.userAgent.toLowerCase().includes('safari');
  const isMapEmpty = _.isEmpty(data.map);
  const isContrastMapEmpty = _.isEmpty(data.contrastMap);
  const isContrastEmpty = _.isEmpty(data.contrast);
  const Charts = charts[data.reportType];
  const WithoutDataComponent = <WithoutData />;
  const filter = data.filter || {};
  const viewOriginalSheet = (params) => {
    reportApi.getReportSingleCacheId({
      ...filter,
      ...params,
      isPersonal: true,
      reportId: data.reportId
    }).then(result => {
      if (result.id) {
        const workSheetId = data.appId;
        if (isMingdao) {
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
  const isPublicShare = location.href.includes('public/page') || window.shareAuthor || window.share;
  const isViewOriginalData = filter.viewId && [VIEW_DISPLAY_TYPE.sheet].includes(filter.viewType.toString()) && !isPublicShare;
  const ChartComponent = <Charts reportData={data} isThumbnail={true} isViewOriginalData={isViewOriginalData} onOpenChartDialog={viewOriginalSheet} mobileCount={mobileCount} isHorizontal={isHorizontal} />;

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
    case reportTypes.GaugeChart:
    case reportTypes.ProgressChart:
      return isMapEmpty ? WithoutDataComponent : ChartComponent;
      break;
    case reportTypes.DualAxes:
    case reportTypes.LineChart:
      return isMapEmpty && isContrastMapEmpty ? WithoutDataComponent : ChartComponent;
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

function ChartWrapper({ data, loading, mobileCount, onOpenFilterModal, onOpenZoomModal, onLoadBeforeData, onLoadNextData, pageComponents = [], isHorizontal }) {
  const isVertical = window.orientation === 0;
  const isMobileChartPage = location.href.includes('mobileChart');
  const index = _.findIndex(pageComponents, { value: data.reportId });
  const beforeAllow = (pageComponents.length - index) < pageComponents.length;
  const nextAllow = index < pageComponents.length - 1;
  return (
    <Fragment>
      <div className="mBottom10 flexRow valignWrapper">
        <div className="Font17 Gray ellipsis name flex">{data.name}</div>
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
      </div>
      <Content className={cx('flexColumn overflowHidden', `statisticsCard-${data.reportId}`)}>
        {loading ? (
          <Flex justify="center" align="center" className="h100">
            <ActivityIndicator size="large" />
          </Flex>
        ) : (
          <Chart data={data} mobileCount={mobileCount} isHorizontal={isHorizontal} />
        )}
      </Content>
    </Fragment>
  );
}

export default ChartWrapper;
