import React, { Component, Fragment } from 'react';
import { Row, Col } from 'antd';
import { formatYaxisList, formatrChartValue, formatControlInfo, getChartColors, getStyleColor } from './common';
import { formatSummaryName, isFormatNumber } from 'statistics/common';
import tinycolor from '@ctrl/tinycolor';
import cx from 'classnames';
import { browserIsMobile } from 'src/util';
const isMobile = browserIsMobile();

const getControlMinAndMax = (map) => {
  const data = {};
  for(const item in map) {
    const targetValue = map[item].targetValue;
    data[item] = {
      min: 0,
      max: targetValue,
      center: targetValue / 2
    }
  }
  return data;
}

class ProgressChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dropdownVisible: false,
      offset: {},
      match: null,
    };
    this.ProgressChart = null;
  }
  componentDidMount() {
    import('@antv/g2plot').then(data => {
      this.g2plotComponent = data;
      this.renderProgressChart(this.props);
    });
  }
  componentWillUnmount() {
    this.ProgressChart && this.ProgressChart.destroy();
  }
  componentWillReceiveProps(nextProps) {
    const { displaySetup, style } = nextProps.reportData;
    const { displaySetup: oldDisplaySetup, style: oldStyle } = this.props.reportData;
    if (
      displaySetup.magnitudeUpdateFlag !== oldDisplaySetup.magnitudeUpdateFlag ||
      displaySetup.showNumber !== oldDisplaySetup.showNumber ||
      !_.isEqual(displaySetup.colorRules, oldDisplaySetup.colorRules) ||
      style.showValueType !== oldStyle.showValueType ||
      nextProps.color !== this.props.color
    ) {
      const { ProgressChartConfig } = this.getComponentConfig(nextProps);
      this.ProgressChart.update(ProgressChartConfig);
    }
    if (
      displaySetup.showChartType !== oldDisplaySetup.showChartType ||
      style.columnCount !== oldStyle.columnCount ||
      nextProps.direction !== this.props.direction
    ) {
      this.ProgressChart.destroy();
      setTimeout(() => {
        this.renderProgressChart(nextProps);
      }, 0);
    }
  }
  renderProgressChart(props) {
    const { ProgressChartComponent, ProgressChartConfig } = this.getComponentConfig(props);
    this.ProgressChart = new ProgressChartComponent(this.chartEl, ProgressChartConfig);
    this.ProgressChart.render();
  }
  getComponentConfig(props) {
    const { data = {}, yAxis, controlMinAndMax, isThumbnail, reportData } = props;
    const { yaxisList, displaySetup, style } = reportData;
    const { showChartType, showNumber, colorRules } = displaySetup;
    const { showValueType = 1 } = style;
    const { clientWidth } = this.chartEl;
    const { clientHeight } = document.querySelector(isThumbnail ? `.statisticsCard-${reportData.reportId} .chartWrapper` : '.ChartDialog .chart .flex');
    const size = Math.min(clientWidth, clientHeight);
    const percentValue = data.value / (data.targetValue || 1);
    const rule = _.get(colorRules[0], 'dataBarRule') || {};
    const titleFormatter = () => {
      if (showValueType == 1) {
        return formatrChartValue(data.value, false, yaxisList, null, false);
      }
      if (showValueType == 2) {
        return `${(percentValue * 100).toFixed(2)} %`;
      }
      return `${formatrChartValue(data.value, false, yaxisList, null, false)}/${formatrChartValue(data.targetValue, false, yaxisList)}`;
    }
    const getColor = () => {
      if (_.isEmpty(rule)) {
        return props.color;
      } else {
        const controlId = yAxis.controlId;
        const color = getStyleColor({
          value: data.value,
          controlMinAndMax,
          rule,
          controlId
        });
        return color || props.color;
      }
    }
    const color = getColor();
    const { Progress, RingProgress, Liquid } = this.g2plotComponent;

    if (showChartType === 2) {
      const baseConfig = {
        padding: [10, 10, 10, 10],
        width: size,
        height: size,
        autoFit: false,
        percent: percentValue,
        color: [color, tinycolor(color).setAlpha(0.3).toString()],
        innerRadius: 0.9,
        radius: 1,
        statistic: {
          title: showNumber ? {
            offsetY: 10,
            style: { color: '#333', fontWeight: 'bold', fontSize: '20px', textAlign: 'center' },
            formatter: titleFormatter
          } : null,
          content: {
            offsetY: 5,
            style: { color: '#333', fontSize: '13px', fontWeight: 400, opacity: 0.65 },
            formatter: () => yAxis.rename || yAxis.controlName,
          }
        },
      };
      return {
        ProgressChartComponent: RingProgress,
        ProgressChartConfig: baseConfig
      }
    }

    if (showChartType === 3) {
      const baseConfig = {
        width: size,
        height: size,
        autoFit: false,
        percent: percentValue,
        outline: {
          border: 4,
          distance: 4,
          style: {
            stroke: '#ddd'
          }
        },
        theme: {
          styleSheet: {
            brandColor: color,
          },
        },
        wave: {
          length: 128,
        },
        statistic: {
          title: showNumber ? {
            offsetY: 10,
            style: { color: '#333', fontWeight: 'bold', fontSize: '20px', textAlign: 'center', textShadow: '#fff 1px 0 10px' },
            formatter: titleFormatter
          } : null,
          content: {
            style: { color: '#333', fontSize: '13px', fontWeight: 400, textShadow: '#fff 1px 0 10px' },
            formatter: () => yAxis.rename || yAxis.controlName,
          }
        },
      };
      return {
        ProgressChartComponent: Liquid,
        ProgressChartConfig: baseConfig
      }
    }

    const baseConfig = {
      padding: [0, 0, 0, 0],
      barWidthRatio: 1,
      height: 18,
      width: '100%',
      autoFit: true,
      percent: percentValue,
      color: [color, tinycolor(color).setAlpha(0.3).toString()],
    };

    return {
      ProgressChartComponent: Progress,
      ProgressChartConfig: baseConfig
    }
  }
  renderProgress() {
    const { data, yAxis, reportData } = this.props;
    const { yaxisList, displaySetup, style } = reportData;
    const { currentValueName = _l('实际'), targetValueName = _l('目标') } = style;

    return (
      <Fragment>
        <div className="Gray_75 Font13">{yAxis.rename || yAxis.controlName}</div>
        <div className="flexRow alignItemsCenter mTop7 mBottom7 printStatisticSign">
          <div className="flex overflowHidden" style={{ borderRadius: 2 }}  ref={el => this.chartEl = el} />
          <div className="Gray Font20 ellipsis mLeft12 bold" style={{ lineHeight: '18px' }}>{`${(data.value / (data.targetValue || 1) * 100).toFixed(2)}%`}</div>
        </div>
        <div className="Gray Font13">
          {displaySetup.showNumber && (
            `${currentValueName}: ${formatrChartValue(data.value, false, yaxisList)}`
          )}
          {displaySetup.showNumber && displaySetup.showDimension && (
            ' | '
          )}
          {displaySetup.showDimension && (
            `${targetValueName}: ${formatrChartValue(data.targetValue, false, yaxisList)}`
          )}
        </div>
      </Fragment>
    );
  }
  renderRingProgress() {
    return (
      <Fragment>
        <div className="alignItemsCenter justifyContentCenter flexRow" ref={el => this.chartEl = el} />
      </Fragment>
    );
  }
  render() {
    const { mobileCount = 1, layoutType, reportData } = this.props;
    const { displaySetup, style } = reportData;
    const { showChartType } = displaySetup;
    const { columnCount = 1 } = style;
    const count = (isMobile || layoutType === 'mobile') ? mobileCount : columnCount;
    const span = Math.ceil(24 / count);
    const isRingChart = [2, 3].includes(showChartType);
    return (
      <Col span={span} className={cx(isRingChart ? 'mBottom10' : 'mBottom24')}>
        {isRingChart ? this.renderRingProgress() : this.renderProgress()}
      </Col>
    );
  }
}


export default (props) => {
  const { themeColor, projectId, customPageConfig, reportData } = props;
  const { chartColor } = customPageConfig;
  const { map, yaxisList, style } = reportData;
  const color = getChartColors(chartColor || style, themeColor, projectId);
  const controlMinAndMax = getControlMinAndMax(map);
  return (
    <div
      className="flex chartWrapper alignItemsCenter justifyContentCenter flexRow overflowHidden"
      style={style.allowScroll ? { overflowY: 'scroll', alignItems: 'flex-start' } : null}
    >
      <Row gutter={[8, 0]} className="w100">
        {yaxisList.map((data, index) => (
          <ProgressChart
            key={data.controlId}
            {...props}
            color={color[index % color.length]}
            data={map[data.controlId] || {}}
            controlMinAndMax={controlMinAndMax}
            yAxis={data}
          />
        ))}
      </Row>
    </div>
  );
}
