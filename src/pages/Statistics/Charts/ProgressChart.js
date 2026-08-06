import React, { Component, Fragment } from 'react';
import { Col, Row } from 'antd';
import { TinyColor } from '@ctrl/tinycolor';
import cx from 'classnames';
import _ from 'lodash';
import { formatrChartValue, getChartColors, getStyleColor } from './common';
import loadG2Plot from './loadG2Plot';

const getControlMinAndMax = map => {
  const data = {};

  for (const item in map) {
    const targetValue = map[item].targetValue;
    data[item] = {
      min: 0,
      max: targetValue,
      center: targetValue / 2,
    };
  }

  return data;
};

class ProgressChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dropdownVisible: false,
      offset: {},
      match: null,
    };
    this.ProgressChart = null;
    this.g2plotComponent = null;
    this.isUnmounted = false;
    this.renderTimer = null;
  }
  componentDidMount() {
    loadG2Plot().then(data => {
      if (this.isUnmounted) {
        return;
      }

      this.g2plotComponent = data;
      this.renderProgressChart(this.props);
    });
  }
  componentWillUnmount() {
    this.isUnmounted = true;
    clearTimeout(this.renderTimer);
    this.destroyProgressChart();
  }
  componentDidUpdate(prevProps) {
    const { displaySetup, style } = this.props.reportData;
    const { displaySetup: oldDisplaySetup, style: oldStyle } = prevProps.reportData;
    const shouldRecreate =
      displaySetup.showChartType !== oldDisplaySetup.showChartType ||
      style.columnCount !== oldStyle.columnCount ||
      this.props.direction !== prevProps.direction;
    const shouldUpdate =
      displaySetup.magnitudeUpdateFlag !== oldDisplaySetup.magnitudeUpdateFlag ||
      displaySetup.showNumber !== oldDisplaySetup.showNumber ||
      !_.isEqual(displaySetup.colorRules, oldDisplaySetup.colorRules) ||
      style.showValueType !== oldStyle.showValueType ||
      this.props.color !== prevProps.color;

    if (!this.g2plotComponent) {
      return;
    }

    if (shouldRecreate) {
      this.scheduleRenderProgressChart(this.props);
      return;
    }

    if (shouldUpdate && this.ProgressChart) {
      const { ProgressChartConfig } = this.getComponentConfig(this.props);
      this.ProgressChart.update(ProgressChartConfig);
    }
  }
  destroyProgressChart = () => {
    if (this.ProgressChart) {
      this.ProgressChart.destroy();
      this.ProgressChart = null;
    }
  };
  scheduleRenderProgressChart = props => {
    this.destroyProgressChart();
    clearTimeout(this.renderTimer);
    this.renderTimer = setTimeout(() => {
      this.renderProgressChart(props);
    }, 0);
  };
  renderProgressChart(props) {
    if (!this.chartEl || !this.g2plotComponent || this.isUnmounted) {
      return;
    }

    const { ProgressChartComponent, ProgressChartConfig } = this.getComponentConfig(props);
    this.destroyProgressChart();
    this.ProgressChart = new ProgressChartComponent(this.chartEl, ProgressChartConfig);
    this.ProgressChart.render();
  }
  getComponentConfig(props) {
    const { data, yAxis, controlMinAndMax, isThumbnail, reportData, isDark } = props;
    const { yaxisList, displaySetup, style } = reportData;
    const { showChartType, showNumber, colorRules } = displaySetup;
    const showValueType = style.showValueType === 3 ? '13' : (style.showValueType ?? 1).toString();
    const { clientWidth } = this.chartEl;
    const { clientHeight } = document.querySelector(
      isThumbnail ? `.statisticsCard-${reportData.reportId} .chartWrapper` : '.ChartDialog .chart .flex',
    );
    const size = Math.min(clientWidth, clientHeight);
    const percentValue = data.value / (data.targetValue || 1);
    const rule = _.get(colorRules[0], 'dataBarRule') || {};

    const titleFormatter = () => {
      let values = [];

      if (showValueType.includes('1')) {
        values.push(formatrChartValue(data.value, false, yaxisList, null, false));
      }

      if (showValueType.includes('2')) {
        const { ydot } = yaxisList[0];
        values.push(`${(percentValue * 100).toFixed(ydot ? Number(ydot) : 2)}%`);
      }

      if (showValueType.includes('3')) {
        values.push(formatrChartValue(data.targetValue || 0, false, yaxisList, null, false));
      }

      return `${values.join(' / ')}`;
    };

    const titleCustomHtml = container => {
      const title = titleFormatter();

      container.style.pointerEvents = 'auto';

      if (title) {
        container.setAttribute('title', title);
      } else {
        container.removeAttribute('title');
      }

      return title;
    };

    const getColor = () => {
      if (_.isEmpty(rule)) {
        return props.color;
      } else {
        const controlId = yAxis.controlId;
        const color = getStyleColor({
          value: data.value,
          controlMinAndMax,
          rule,
          controlId,
        });
        return color || props.color;
      }
    };

    const color = getColor();
    const { Progress, RingProgress, Liquid } = this.g2plotComponent;

    if (showChartType === 2) {
      const baseConfig = {
        padding: [10, 10, 10, 10],
        width: size,
        height: size,
        autoFit: false,
        percent: percentValue,
        color: [color || '#f1f1f1', color ? new TinyColor(color).setAlpha(0.3).toString() : '#f1f1f1'],
        innerRadius: 0.9,
        radius: 1,
        statistic: {
          title: showNumber
            ? {
                offsetY: 10,
                style: {
                  color: isDark ? '#ffffffcc' : '#333',
                  fontWeight: 'bold',
                  fontSize: '20px',
                  textAlign: 'center',
                  whiteSpace: 'pre-wrap',
                },
                customHtml: titleCustomHtml,
              }
            : null,
          content: {
            offsetY: 5,
            style: { color: isDark ? '#ffffffcc' : '#333', fontSize: '13px', fontWeight: 400, opacity: 0.65 },
            formatter: () => yAxis.rename || yAxis.controlName,
          },
        },
      };
      return {
        ProgressChartComponent: RingProgress,
        ProgressChartConfig: baseConfig,
      };
    }

    if (showChartType === 3) {
      const baseConfig = {
        width: size,
        height: size,
        autoFit: false,
        percent: percentValue,
        outline: {
          border: 1,
          distance: 0,
          style: {
            stroke: color || '#f1f1f1',
          },
        },
        theme: {
          styleSheet: {
            brandColor: color || '#f1f1f1',
          },
        },
        wave: {
          length: 128,
        },
        statistic: {
          title: showNumber
            ? {
                offsetY: 10,
                style: {
                  color: isDark ? '#ffffffcc' : '#151515',
                  fontWeight: 'bold',
                  fontSize: '20px',
                  textAlign: 'center',
                  textShadow: '#fff 1px 0 10px',
                },
                customHtml: titleCustomHtml,
              }
            : null,
          content: {
            style: {
              color: isDark ? '#ffffffcc' : '#151515',
              fontSize: '13px',
              fontWeight: 400,
              textShadow: '#fff 1px 0 10px',
            },
            formatter: () => yAxis.rename || yAxis.controlName,
          },
        },
      };
      return {
        ProgressChartComponent: Liquid,
        ProgressChartConfig: baseConfig,
      };
    }

    const baseConfig = {
      padding: [0, 0, 0, 0],
      barWidthRatio: 1,
      height: 18,
      width: '100%',
      autoFit: true,
      percent: percentValue,
      color: [color || '#f1f1f1', color ? new TinyColor(color).setAlpha(0.3).toString() : '#f1f1f1'],
    };

    return {
      ProgressChartComponent: Progress,
      ProgressChartConfig: baseConfig,
    };
  }
  renderProgress() {
    const { data, yAxis, reportData } = this.props;
    const { yaxisList, displaySetup, style } = reportData;
    const { currentValueName = _l('实际'), targetValueName = _l('目标') } = style;
    const { ydot } = yaxisList[0];

    return (
      <Fragment>
        <div className="Font13 textSecondary">{yAxis.rename || yAxis.controlName}</div>
        <div className="flexRow alignItemsCenter mTop7 mBottom7 printStatisticSign">
          <div className="flex overflowHidden" style={{ borderRadius: 2 }} ref={el => (this.chartEl = el)} />
          <div
            className="Font20 ellipsis mLeft12 bold textPrimary"
            style={{ lineHeight: '18px' }}
          >{`${((data.value / (data.targetValue || 1)) * 100).toFixed(ydot ? Number(ydot) : 2)}%`}</div>
        </div>
        <div className="Font13 textPrimary">
          {displaySetup.showNumber &&
            `${currentValueName}: ${formatrChartValue(data.value || 0, false, yaxisList, '', false)}`}
          {displaySetup.showNumber && displaySetup.showDimension && ' | '}
          {displaySetup.showDimension &&
            `${targetValueName}: ${formatrChartValue(data.targetValue || 0, false, yaxisList, '', false)}`}
        </div>
      </Fragment>
    );
  }
  renderRingProgress() {
    return (
      <Fragment>
        <div className="alignItemsCenter justifyContentCenter flexRow" ref={el => (this.chartEl = el)} />
      </Fragment>
    );
  }
  render() {
    const { mobileCount = 1, layoutType, reportData, isMobile } = this.props;
    const { displaySetup, style } = reportData;
    const { showChartType } = displaySetup;
    const { columnCount = 1 } = style;
    const count = isMobile || layoutType === 'mobile' ? mobileCount : columnCount;
    const span = Math.ceil(24 / count);
    const isRingChart = [2, 3].includes(showChartType);
    return (
      <Col span={span} className={cx(isRingChart ? 'mBottom10' : 'mBottom24')}>
        {isRingChart ? this.renderRingProgress() : this.renderProgress()}
      </Col>
    );
  }
}

export default props => {
  const { themeColor, projectId, customPageConfig = {}, reportData, isThumbnail } = props;
  const { chartColor, chartColorIndex = 1, pageStyleType = 'light' } = customPageConfig;
  const isDark = window.themeMode === 'dark' || (pageStyleType === 'dark' && isThumbnail);
  const { map, yaxisList, config } = reportData;
  const { targetList } = config;
  const styleConfig = reportData.style || {};
  const style =
    chartColor && chartColorIndex >= (styleConfig.chartColorIndex || 0)
      ? { ...styleConfig, ...chartColor }
      : styleConfig;
  const color = getChartColors(style, themeColor, projectId);
  const controlMinAndMax = getControlMinAndMax(map);
  return (
    <div
      className={cx('flex chartWrapper alignItemsCenter justifyContentCenter flexRow', {
        overflowHidden: yaxisList.length === 1,
      })}
      style={style.allowScroll ? { overflowY: 'scroll', alignItems: 'flex-start' } : null}
    >
      <Row gutter={[8, 0]} className="w100">
        {yaxisList.map((data, index) => (
          <ProgressChart
            key={data.controlId}
            {...props}
            color={map[data.controlId] ? color[index % color.length] : null}
            data={map[data.controlId] || { value: 0, targetValue: targetList[index] ? targetList[index].value : 0 }}
            controlMinAndMax={controlMinAndMax}
            isDark={isDark}
            yAxis={data}
          />
        ))}
      </Row>
    </div>
  );
};
