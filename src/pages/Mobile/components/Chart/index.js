import React, { Fragment } from 'react';
import { Icon } from 'ming-ui';
import cx from 'classnames';
import { Flex, ActivityIndicator } from 'antd-mobile';
import charts from 'src/pages/worksheet/common/Statistics/Charts';
import { WithoutData, Abnormal } from 'src/pages/worksheet/common/Statistics/components/ChartStatus';
import { reportTypes } from 'src/pages/worksheet/common/Statistics/Charts/common';
import styled from 'styled-components';
import './index.less';

const Content = styled.div`
  flex: 1;
  .showTotalHeight {
    height: 100%;
  }
`;

function Chart({ data }) {
  if (!data.status) {
    return <Abnormal />;
  }

  const isMapEmpty = _.isEmpty(data.map);
  const isContrastMapEmpty = _.isEmpty(data.contrastMap);
  const Charts = charts[data.reportType];
  const WithoutDataComponent = <WithoutData />;
  const ChartComponent = <Charts reportData={data} isThumbnail={true} />;

  switch (data.reportType) {
    case reportTypes.BarChart:
      return isMapEmpty ? WithoutDataComponent : ChartComponent;
      break;
    case reportTypes.LineChart:
      return isMapEmpty && isContrastMapEmpty ? WithoutDataComponent : ChartComponent;
      break;
    case reportTypes.PieChart:
      return _.isEmpty(data.aggregations) ? WithoutDataComponent : ChartComponent;
      break;
    case reportTypes.NumberChart:
      return ChartComponent;
      break;
    case reportTypes.RadarChart:
      return isMapEmpty ? WithoutDataComponent : ChartComponent;
      break;
    case reportTypes.FunnelChart:
      return isMapEmpty ? WithoutDataComponent : ChartComponent;
      break;
    case reportTypes.DualAxes:
      return isMapEmpty && isContrastMapEmpty ? WithoutDataComponent : ChartComponent;
      break;
    case reportTypes.PivotTable:
      return _.isEmpty(data.data.data) ? WithoutDataComponent : ChartComponent;
      break;
    case reportTypes.CountryLayer:
      return isMapEmpty ? WithoutDataComponent : ChartComponent;
      break;
    default:
      break;
  }
}

function ChartWrapper({ data, loading, onOpenFilterModal, onOpenZoomModal, isHorizontal }) {
  const isVertical = window.orientation === 0;
  const isMobileChartPage = location.href.includes('mobileChart');
  return (
    <Fragment>
      <div className="mBottom10 flexRow valignWrapper">
        <div className="Font17 Gray ellipsis name flex">{data.name}</div>
        <Icon className="Font20 Gray_9e mRight10" icon="swap_vert" onClick={onOpenFilterModal} />
        {isHorizontal ? (
          <Icon className="Font20 Gray_9e" icon="close" onClick={onOpenZoomModal} />
        ) : (
          isVertical && <Icon className={cx('Font18 Gray_9e', { Visibility: isMobileChartPage })} icon="task-new-fullscreen" onClick={onOpenZoomModal} />
        )}
      </div>
      <Content className="flexColumn overflowHidden">
        {loading ? (
          <Flex justify="center" align="center" className="h100">
            <ActivityIndicator size="large" />
          </Flex>
        ) : (
          <Chart data={data} />
        )}
      </Content>
    </Fragment>
  );
}

export default ChartWrapper;
