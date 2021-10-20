import React, { Component } from 'react';
import { Column, Bar } from '@antv/g2plot';
import {
  getLegendType,
  formatControlInfo,
  formatrChartValue,
  formatrChartAxisValue,
  reportTypes,
  getMaxValue,
  getMinValue,
  formatYaxisList,
  getChartColors,
  getAlienationColor
} from './common';
import { formatSummaryName, getIsAlienationColor } from 'src/pages/worksheet/common/Statistics/common';

const formatDataCount = (data, isVertical, newYaxisList) => {
  const result = _.toArray(_.groupBy(data, 'originalName'));
  return result.map(item => {
    const { originalName } = item[0];
    const count = item.reduce((count, item) => count + item.value, 0);
    const value = formatrChartValue(count, false, newYaxisList);
    const data = {
      type: 'text',
      position: {
        originalName,
        value: count,
      },
      content: value,
      style: {
        textAlign: 'center',
      },
    };
    if (isVertical) {
      data.offsetY = -15;
    } else {
      data.offsetX = 15;
    }
    return data;
  });
};

export const formatChartData = (data, yaxisList) => {
  if (_.isEmpty(data)) return [];
  const result = [];
  const { value } = data[0];
  value.forEach(item => {
    const name = item.x;
    data.forEach((element, index) => {
      const target = element.value.filter(n => n.originalX === item.originalX);
      if (target.length) {
        const { rename } = _.find(yaxisList, { controlId: element.c_id }) || {};
        result.push({
          groupName: `${rename || element.key}-md-${reportTypes.BarChart}-chart-${element.c_id || index}`,
          value: target[0].v,
          name,
          originalName: item.originalX || name
        });
      }
    });
  });
  return result;
};

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      originalCount: 0,
      count: 0,
    }
    this.BarChart = null;
  }
  componentDidMount() {
    const { BarChartComponent, BarChartConfig } = this.getComponentConfig(this.props);
    this.BarChart = new BarChartComponent(this.chartEl, BarChartConfig);
    this.BarChart.render();
  }
  componentWillUnmount() {
    this.BarChart && this.BarChart.destroy();
  }
  componentWillReceiveProps(nextProps) {
    const { displaySetup } = nextProps.reportData;
    const { displaySetup: oldDisplaySetup } = this.props.reportData;
    // 显示设置
    if (
      displaySetup.fontStyle !== oldDisplaySetup.fontStyle ||
      displaySetup.showLegend !== oldDisplaySetup.showLegend ||
      displaySetup.legendType !== oldDisplaySetup.legendType ||
      displaySetup.showNumber !== oldDisplaySetup.showNumber ||
      displaySetup.magnitudeUpdateFlag !== oldDisplaySetup.magnitudeUpdateFlag ||
      displaySetup.showPileTotal !== oldDisplaySetup.showPileTotal ||
      displaySetup.hideOverlapText !== oldDisplaySetup.hideOverlapText ||
      displaySetup.xdisplay.showDial !== oldDisplaySetup.xdisplay.showDial ||
      displaySetup.xdisplay.showTitle !== oldDisplaySetup.xdisplay.showTitle ||
      displaySetup.xdisplay.title !== oldDisplaySetup.xdisplay.title ||
      displaySetup.ydisplay.showDial !== oldDisplaySetup.ydisplay.showDial ||
      displaySetup.ydisplay.showTitle !== oldDisplaySetup.ydisplay.showTitle ||
      displaySetup.ydisplay.title !== oldDisplaySetup.ydisplay.title ||
      displaySetup.ydisplay.minValue !== oldDisplaySetup.ydisplay.minValue ||
      displaySetup.ydisplay.maxValue !== oldDisplaySetup.ydisplay.maxValue ||
      displaySetup.ydisplay.lineStyle !== oldDisplaySetup.ydisplay.lineStyle
    ) {
      const { BarChartConfig } = this.getComponentConfig(nextProps);
      this.BarChart.update(BarChartConfig);
    }
    // 切换图表类型 & 堆叠 & 百分比
    if (
      displaySetup.showChartType !== oldDisplaySetup.showChartType ||
      displaySetup.isPile !== oldDisplaySetup.isPile ||
      displaySetup.isPerPile !== oldDisplaySetup.isPerPile
    ) {
      this.BarChart.destroy();
      const { BarChartComponent, BarChartConfig } = this.getComponentConfig(nextProps);
      this.BarChart = new BarChartComponent(this.chartEl, BarChartConfig);
      this.BarChart.render();
    }
  }
  getCustomColor(data, colors, { originalName }) {
    const inedx = _.findIndex(data, { originalName });
    return colors[inedx % colors.length];
  }
  getComponentConfig(props) {
    const { map, displaySetup, xaxes, yaxisList, splitId, style, reportId } = props.reportData;
    const {
      isPile,
      isPerPile,
      showPileTotal,
      hideOverlapText,
      fontStyle,
      legendType,
      showChartType,
      showLegend,
      showNumber,
      ydisplay,
    } = displaySetup;
    const { position } = getLegendType(legendType);
    const data = formatChartData(map, yaxisList);
    const isVertical = showChartType === 1;
    const newYaxisList = formatYaxisList(data, yaxisList);
    const countConfig = showPileTotal && isPile && (yaxisList.length > 1 || splitId) ? formatDataCount(data, isVertical, newYaxisList) : null;
    const maxValue = getMaxValue(data);
    const minValue = getMinValue(data);
    const colors = getChartColors(style);
    const isNewChart = _.isUndefined(reportId) && _.isEmpty(style);
    const isAlienationColor = getIsAlienationColor(props.reportData);
    const isOptionsColor = isNewChart ? isAlienationColor : (style ? (style.colorType === 0 && isAlienationColor) : false);
    const isCustomColor = style ? (style.colorType === 2 && isAlienationColor) : false;

    const baseConfig = {
      data,
      appendPadding: isVertical ? [20, 0, 5, 0] : [10, 50, 0, 0],
      seriesField: (isOptionsColor || isCustomColor) ? 'originalName' : 'groupName',
      meta: {
        originalName: {
          type: 'cat',
          formatter: value => {
            const item = _.find(data, { originalName: value });
            return item ? item.name : value;
          }
        },
        groupName: {
          formatter: value => formatControlInfo(value).name,
        },
      },
      xField: isVertical ? 'originalName' : 'value',
      yField: isVertical ? 'value' : 'originalName',
      xAxis: isVertical
        ? this.getxAxis(displaySetup, xaxes.particleSizeType)
        : this.getyAxis(displaySetup, newYaxisList),
      yAxis: isVertical
        ? this.getyAxis(displaySetup, newYaxisList)
        : this.getxAxis(displaySetup, xaxes.particleSizeType),
      animation: true,
      color: isOptionsColor ? getAlienationColor.bind(this, xaxes) : (isCustomColor ? this.getCustomColor.bind(this, data, colors) : colors),
      legend: showLegend
        ? {
            position,
            flipPage: true,
            itemHeight: 20
          }
        : false,
      tooltip: {
        shared: true,
        showMarkers: false,
        formatter: (item) => {
          if (isOptionsColor || isCustomColor) {
            const { value } = item;
            const name = yaxisList[0].controlName;
            return {
              name,
              value
            }
          }
          const { value, groupName } = item;
          const { name } = formatControlInfo(groupName);
          if (isPerPile) {
            return {
              name,
              value: `${(value * 100).toFixed(Number.isInteger(value) ? 0 : 2)}%`
            }
          } else {
            return {
              name,
              value: _.isNumber(value) ? value.toLocaleString() : _l('--')
            }
          }
        }
      },
      label: showNumber
        ? {
            position: isPile || isPerPile ? 'middle' : isVertical ? 'top' : 'right',
            layout: [
              hideOverlapText ? { type: 'hide-overlap' } : null,
              { type: 'adjust-color' },
              (ydisplay.maxValue && ydisplay.maxValue < maxValue) || (ydisplay.minValue && ydisplay.minValue > minValue) ? { type: 'limit-in-plot' } : null,
            ],
            content: ({ value, groupName }) => {
              return formatrChartValue(value, isPerPile, newYaxisList);
            },
          }
        : false,
      annotations: countConfig,
    };

    this.setCount(newYaxisList);

    if (isPile) {
      // 堆叠
      baseConfig.isStack = true;
    } else if (isPerPile) {
      // 百分比
      baseConfig.isPercent = true;
      baseConfig.isStack = true;
    } else {
      // 分组
      baseConfig.isGroup = (isOptionsColor || isCustomColor) ? false : true;
    }

    return {
      BarChartComponent: isVertical ? Column : Bar,
      BarChartConfig: baseConfig,
    };
  }
  getyAxis(displaySetup, yaxisList) {
    const { isPerPile, ydisplay } = displaySetup;
    return {
      minLimit: _.isNumber(ydisplay.minValue) ? ydisplay.minValue : null,
      maxLimit: isPerPile ? 1 : ydisplay.maxValue || null,
      title:
        ydisplay.showTitle && ydisplay.title
          ? {
              text: ydisplay.title,
            }
          : null,
      label: ydisplay.showDial
        ? {
            formatter: (value, obj) => {
              return value ? formatrChartAxisValue(Number(value), isPerPile, yaxisList) : null;
            },
          }
        : null,
      grid: {
        line: ydisplay.showDial
          ? {
              style: {
                lineDash: ydisplay.lineStyle === 1 ? [] : [4, 5],
              },
            }
          : null,
      },
    };
  }
  getxAxis(displaySetup, particleSizeType) {
    const { fontStyle, xdisplay, ydisplay } = displaySetup;
    return {
      title:
        xdisplay.showTitle && xdisplay.title
          ? {
              text: xdisplay.title,
            }
          : null,
      label: xdisplay.showDial
        ? {
            autoRotate: fontStyle ? true : false,
            autoHide: true,
            formatter: (name, item) => {
              return particleSizeType === 6 ? _l('%0时', name) : name;
            },
          }
        : null,
      line: ydisplay.lineStyle === 1 ? {} : null,
    };
  }
  setCount(yaxisList) {
    const { summary } = this.props.reportData;
    const value = summary.sum;
    const count = formatrChartValue(value, false, yaxisList);
    this.setState({
      originalCount: value.toLocaleString() == count ? 0 : value.toLocaleString(),
      count
    });
  }
  render() {
    const { count, originalCount } = this.state;
    const { summary, displaySetup } = this.props.reportData;
    return (
      <div className="flex flexColumn chartWrapper">
        {displaySetup.showTotal ? (
          <div className="pBottom10">
            <span>{formatSummaryName(summary)}: </span>
            <span data-tip={originalCount ? originalCount : null} className="count">{count}</span>
          </div>
        ) : null}
        <div className={displaySetup.showTotal ? 'showTotalHeight' : 'flex'} ref={el => (this.chartEl = el)}></div>
      </div>
    );
  }
}
