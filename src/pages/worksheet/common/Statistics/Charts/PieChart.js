import React, { Component } from 'react';
import { Pie } from '@antv/g2plot';
import { getLegendType, formatrChartValue, formatYaxisList, getChartColors, getAlienationColor } from './common';
import { formatSummaryName, getIsAlienationColor } from 'src/pages/worksheet/common/Statistics/common';

const formatChartData = data => {
  const result = data
    .map(item => {
      return {
        name: item.x,
        originalName: item.originalX,
        value: Math.abs(item.v),
        originalValue: item.v,
      };
    })
    .filter(item => item.originalValue);
  return result;
};

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      originalCount: 0,
      count: 0,
    }
    this.PieChart = null;
  }
  componentDidMount() {
    this.PieChart = new Pie(this.chartEl, this.getPieConfig(this.props));
    this.PieChart.render();
  }
  componentWillUnmount() {
    this.PieChart.destroy();
  }
  componentWillReceiveProps(nextProps) {
    const { displaySetup } = nextProps.reportData;
    const { displaySetup: oldDisplaySetup } = this.props.reportData;
    if (
      displaySetup.showTotal !== oldDisplaySetup.showTotal ||
      displaySetup.showLegend !== oldDisplaySetup.showLegend ||
      displaySetup.legendType !== oldDisplaySetup.legendType ||
      displaySetup.showDimension !== oldDisplaySetup.showDimension ||
      displaySetup.showNumber !== oldDisplaySetup.showNumber ||
      displaySetup.showPercent !== oldDisplaySetup.showPercent ||
      displaySetup.magnitudeUpdateFlag !== oldDisplaySetup.magnitudeUpdateFlag
    ) {
      const pieConfig = this.getPieConfig(nextProps);
      this.PieChart.update(pieConfig);
    }
    if (displaySetup.showChartType !== oldDisplaySetup.showChartType) {
      this.PieChart.destroy();
      this.PieChart = new Pie(this.chartEl, this.getPieConfig(nextProps));
      this.PieChart.render();
    }
  }
  getPieConfig(props) {
    const { aggregations, displaySetup, yaxisList, summary, style, xaxes, reportId } = props.reportData;
    const data = formatChartData(aggregations, displaySetup);
    const { position } = getLegendType(displaySetup.legendType);
    const isLabelVisible = displaySetup.showDimension || displaySetup.showNumber || displaySetup.showPercent;
    const newYaxisList = formatYaxisList(data, yaxisList);
    const isAnnular = displaySetup.showChartType === 1;
    const colors = getChartColors(style);
    const isNewChart = _.isUndefined(reportId) && _.isEmpty(style);
    const isAlienationColor = getIsAlienationColor(props.reportData);
    const isOptionsColor = isNewChart ? isAlienationColor : (style ? (style.colorType === 0 && isAlienationColor) : false);

    this.setCount(newYaxisList);

    const findName = (value) => {
      const item = _.find(data, { originalName: value });
      return item ? item.name : value;
    }

    const baseConfig = {
      data,
      appendPadding: [10, 0, 10, 0],
      radius: 0.7,
      innerRadius: isAnnular ? 0.6 : 0,
      angleField: 'value',
      colorField: 'originalName',
      meta: {
        originalName: {
          type: 'cat',
          formatter: findName
        },
      },
      color: isOptionsColor ? getAlienationColor.bind(this, xaxes) : colors,
      legend: displaySetup.showLegend
        ? {
            position,
            flipPage: true,
            itemHeight: 20,
          }
        : false,
      statistic: displaySetup.showTotal
        ? {
            title: {
              offsetY: -20,
              style: {
                fontSize: 14,
                fontWeight: 300,
              },
              formatter: datum => (datum ? (datum.name || datum.originalName) : formatSummaryName(summary)),
            },
            content: {
              style: {
                fontSize: 22,
                fontWeight: 500,
              },
              formatter: datum => {
                const value = datum ? datum.originalValue : summary.sum;
                return formatrChartValue(value, false, newYaxisList);
              },
            },
          }
        : false,
      label: isLabelVisible
        ? {
            type: 'outer',
            formatter: item => {
              const dimensionText = displaySetup.showDimension ? `${findName(item.originalName)}` : '';
              const numberText = displaySetup.showNumber
                ? `${displaySetup.showDimension ? ` ` : ''}${formatrChartValue(
                    item.originalValue,
                    false,
                    newYaxisList,
                  )}`
                : '';
              const percentText = displaySetup.showPercent ? `(${(item.percent * 100).toFixed(0)}%)` : '';
              return `${dimensionText} ${numberText} ${percentText}`;
            },
          }
        : false,
      interactions: [{ type: isAnnular ? 'pie-statistic-active' : 'element-active' }],
      // events: {
      //   onRingMouseenter: (event) => {
      //     if (event.data.value !== event.data.originalValue) {
      //       event.data._value = event.data.value;
      //       event.data.value = event.data.originalValue;
      //     }
      //   },
      //   onRingMouseleave: (event) => {
      //     if (event.data._value) {
      //       event.data.value = event.data._value;
      //       delete event.data._value;
      //     }
      //   }
      // }
    };
    return baseConfig;
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
    const showTotal = displaySetup ? displaySetup.showTotal : false;
    const showChartType = displaySetup ? displaySetup.showChartType : 0;
    return (
      <div className="flex flexColumn chartWrapper">
        {showTotal && showChartType === 2 ? (
          <div className="pBottom10">
            <span>{formatSummaryName(summary)}: </span>
            <span data-tip={originalCount ? originalCount : null} className="count">{count}</span>
          </div>
        ) : null}
        <div className={showTotal ? 'showTotalHeight' : 'flex'} ref={el => (this.chartEl = el)}></div>
      </div>
    );
  }
}
