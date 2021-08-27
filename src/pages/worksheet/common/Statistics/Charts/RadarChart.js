import React, { Component } from 'react';
import { Radar } from '@antv/g2plot';
import {
  formatControlInfo,
  formatrChartValue,
  formatrChartAxisValue,
  getLegendType,
  reportTypes,
  formatYaxisList,
  getChartColors
} from './common';
import { formatSummaryName } from 'src/pages/worksheet/common/Statistics/common';

const formatChartData = (data, yaxisList) => {
  const result = [];
  const { value } = data[0];
  value.forEach(item => {
    const name = item.x;
    data.forEach((element, index) => {
      const target = element.value.filter(n => n.x === name);
      if (target.length) {
        const { rename } = _.find(yaxisList, { controlId: element.c_id }) || _.object();
        result.push({
          groupName: `${rename || element.key}-md-${reportTypes.RadarChart}-chart-${element.c_id || index}`,
          value: target[0].v,
          name,
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
    this.RadarChart = null;
  }
  componentDidMount() {
    const config = this.getComponentConfig(this.props);
    this.RadarChart = new Radar(this.chartEl, config);
    this.RadarChart.render();
  }
  componentWillUnmount() {
    this.RadarChart.destroy();
  }
  componentWillReceiveProps(nextProps) {
    const { displaySetup } = nextProps.reportData;
    const { displaySetup: oldDisplaySetup } = this.props.reportData;
    // 显示设置
    if (
      displaySetup.showLegend !== oldDisplaySetup.showLegend ||
      displaySetup.legendType !== oldDisplaySetup.legendType ||
      displaySetup.showNumber !== oldDisplaySetup.showNumber ||
      displaySetup.magnitudeUpdateFlag !== oldDisplaySetup.magnitudeUpdateFlag
    ) {
      const config = this.getComponentConfig(nextProps);
      this.RadarChart.update(config);
    }
  }
  getComponentConfig(props) {
    const { map, displaySetup, yaxisList, style } = props.reportData;
    const data = formatChartData(map, yaxisList);
    const { position } = getLegendType(displaySetup.legendType);
    const newYaxisList = formatYaxisList(data, yaxisList);
    const colors = getChartColors(style);
    const baseConfig = {
      data,
      appendPadding: [5, 0, 5, 0],
      xField: 'name',
      yField: 'value',
      seriesField: 'groupName',
      meta: {
        name: {
          type: 'cat',
        },
        groupName: {
          formatter: value => formatControlInfo(value).name,
        },
        value: {
          min: 0,
        },
      },
      xAxis: {
        line: null,
        tickLine: null,
        grid: {
          line: {
            style: {
              lineDash: null,
            },
          },
        },
      },
      yAxis: {
        line: null,
        tickLine: null,
        grid: {
          line: {
            type: 'line',
            style: {
              lineDash: null,
            },
          },
          alternateColor: 'rgba(250, 250, 250, 0.7)',
        },
        label: {
          formatter: value => {
            return formatrChartAxisValue(Number(value), false, newYaxisList);
          },
        },
      },
      limitInPlot: true,
      area: {},
      color: colors,
      tooltip: {
        shared: true,
        showCrosshairs: false,
        showMarkers: true,
        formatter: ({ value, groupName }) => {
          const { name } = formatControlInfo(groupName);
          return {
            name,
            value: value ? value.toLocaleString() : value,
          };
        },
      },
      legend: displaySetup.showLegend
        ? {
            position,
            flipPage: true,
            itemHeight: 20,
          }
        : false,
      point: displaySetup.showNumber
        ? {
            shape: 'circle',
            size: 3,
          }
        : false,
      label: displaySetup.showNumber
        ? {
            content: ({ value }) => {
              return formatrChartValue(value, false, newYaxisList);
            },
          }
        : false,
    };

    this.setCount(newYaxisList);

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
    return (
      <div className="flex flexColumn chartWrapper">
        {displaySetup.showTotal ? (
          <div>
            <span>{formatSummaryName(summary)}: </span>
            <span data-tip={originalCount ? originalCount : null} className="count">{count}</span>
          </div>
        ) : null}
        <div className={displaySetup.showTotal ? 'showTotalHeight' : 'flex'} ref={el => (this.chartEl = el)}></div>
      </div>
    );
  }
}
