import React, { Component } from 'react';
import { Line, Area } from '@antv/g2plot';
import {
  getLegendType,
  formatControlInfo,
  formatrChartValue,
  formatrChartAxisValue,
  reportTypes,
  formatYaxisList,
  getMaxValue,
  getMinValue,
  getChartColors
} from './common';
import { formatSummaryName } from 'src/pages/worksheet/common/Statistics/common';

const lastDateText = _l('上一期');

const mergeDataTime = (data, contrastData) => {
  const maxLengthData = data.length > contrastData.length ? data : contrastData;
  const newData = data.map((item, index) => {
    item.originalName = item.name;
    item.name = maxLengthData[index].name;
    return item;
  });
  const newcontrastData = contrastData.map((item, index) => {
    // item.groupName = lastDateText;
    item.originalName = item.name;
    item.name = maxLengthData[index].name;
    return item;
  });
  return newData.concat(newcontrastData);
};

const formatPerPileChartData = result => {
  const groupResult = _.groupBy(result, 'name');
  const perPileResult = [];

  for (let key in groupResult) {
    const current = groupResult[key];
    const count = current.reduce((count, item) => {
      return count + item.value;
    }, 0);
    current.map(item => {
      item.value = ((item.value || 0) / count) * 1;
      return item;
    });
    perPileResult.push(...current);
  }
  return perPileResult;
};

export const formatChartData = (data, yaxisList, { isPile, isAccumulate }) => {
  if (_.isEmpty(data)) return [];
  const result = [];
  const cloneData = _.cloneDeep(data);
  const { value } = cloneData[0];
  if (isAccumulate) {
    cloneData.map(item => {
      item.value.map((n, index) => {
        const lastn = item.value[index - 1];
        n.v = n.v + (lastn ? lastn.v : 0);
        return n;
      });
      return item;
    });
  }
  value.forEach(item => {
    const name = item.x;
    cloneData.forEach((element, index) => {
      const lastElement = cloneData[index - 1];
      const lastValue = lastElement && isPile ? lastElement.value.filter(n => n.x === name)[0].v : 0;
      const current = element.value.filter(n => {
        if (isPile && n.x === name) {
          n.v = n.v + lastValue;
        }
        return n.x === name;
      });
      // if (current.length && current[0].v !== null) {
      if (current.length) {
        const { rename } = _.find(yaxisList, { controlId: element.c_id }) || _.object();
        result.push({
          groupName: `${rename || element.key}-md-${reportTypes.LineChart}-chart-${element.c_id || index}`,
          value: current[0].v,
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
    this.LineChart = null;
  }
  componentDidMount() {
    const { LineChartComponent, LineChartConfig } = this.getComponentConfig(this.props);
    this.LineChart = new LineChartComponent(this.chartEl, LineChartConfig);
    this.LineChart.render();
  }
  componentWillUnmount() {
    this.LineChart.destroy();
  }
  componentWillReceiveProps(nextProps) {
    const { displaySetup } = nextProps.reportData;
    const { displaySetup: oldDisplaySetup } = this.props.reportData;
    // 显示设置
    if (
      displaySetup.fontStyle !== oldDisplaySetup.fontStyle ||
      displaySetup.showLegend !== oldDisplaySetup.showLegend ||
      displaySetup.legendType !== oldDisplaySetup.legendType ||
      displaySetup.lifecycleValue !== oldDisplaySetup.lifecycleValue ||
      displaySetup.showNumber !== oldDisplaySetup.showNumber ||
      displaySetup.hideOverlapText !== oldDisplaySetup.hideOverlapText ||
      displaySetup.magnitudeUpdateFlag !== oldDisplaySetup.magnitudeUpdateFlag ||
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
      const { LineChartConfig } = this.getComponentConfig(nextProps);
      this.LineChart.update(LineChartConfig);
      this.LineChart.render();
    }
    // 切换图表类型 & 堆叠 & 累计 & 百分比
    if (
      displaySetup.showChartType !== oldDisplaySetup.showChartType ||
      displaySetup.isPile !== oldDisplaySetup.isPile ||
      displaySetup.isAccumulate !== oldDisplaySetup.isAccumulate ||
      displaySetup.isPerPile !== oldDisplaySetup.isPerPile
    ) {
      this.LineChart.destroy();
      const { LineChartComponent, LineChartConfig } = this.getComponentConfig(nextProps);
      this.LineChart = new LineChartComponent(this.chartEl, LineChartConfig);
      this.LineChart.render();
    }
  }
  getComponentConfig(props) {
    const { map, contrastMap, displaySetup, xaxes, yaxisList, splitId, style } = props.reportData;
    const { xdisplay, ydisplay } = displaySetup;
    const { position } = getLegendType(displaySetup.legendType);
    const { length } = _.isEmpty(map) ? contrastMap[0].value : map[0].value;
    const isPercentStackedArea = displaySetup.showChartType == 2 && displaySetup.isPerPile;
    const LineValue = isPercentStackedArea ? 0 : (displaySetup.lifecycleValue / length) * (displaySetup.isAccumulate ? length : 1);
    const sortData = formatChartData(map, yaxisList, displaySetup);
    const newYaxisList = formatYaxisList(sortData, yaxisList);
    const maxValue = getMaxValue(sortData, contrastMap.length ? formatChartData(contrastMap, yaxisList, displaySetup) : null);
    const minValue = getMinValue(sortData, contrastMap.length ? formatChartData(contrastMap, yaxisList, displaySetup) : null);
    const ChartComponent = displaySetup.showChartType === 2 ? Area : Line;
    const colors = getChartColors(style);
    const yAxisLabel = {
      formatter: (value, obj) => {
        return value ? formatrChartAxisValue(Number(value), isPercentStackedArea, newYaxisList) : null;
      }
    };
    this.setCount(newYaxisList);
    const baseConfig = {
      appendPadding: [15, 0, 5, 0],
      seriesField: 'groupName',
      xField: 'name',
      yField: 'value',
      meta: {
        name: {
          type: 'cat',
          range: [0, 1],
        },
        groupName: {
          formatter: value => formatControlInfo(value).name,
        },
        value: {
          nice: false,
        },
      },
      connectNulls: true,
      smooth: displaySetup.showChartType,
      animation: true,
      legend: displaySetup.showLegend
        ? {
            position,
            flipPage: true,
            itemHeight: 20,
          }
        : false,
      yAxis: {
        minLimit: ydisplay.minValue || null,
        maxLimit: ydisplay.maxValue || (LineValue > maxValue ? parseInt(LineValue) + parseInt(LineValue / 5) : null),
        title:
          ydisplay.showTitle && ydisplay.title
            ? {
                text: ydisplay.title,
              }
            : null,
        label: ydisplay.showDial ? yAxisLabel : null,
        grid: {
          line: ydisplay.showDial
            ? {
                style: {
                  lineDash: ydisplay.lineStyle === 1 ? [] : [4, 5],
                },
              }
            : null,
        },
      },
      xAxis: {
        title:
          xdisplay.showTitle && xdisplay.title
            ? {
                text: xdisplay.title,
              }
            : null,
        label: xdisplay.showDial
          ? {
              autoRotate: displaySetup.fontStyle ? true : false,
              autoHide: true,
              formatter: (name, item) => {
                return xaxes.particleSizeType === 6 ? _l('%0时', name) : name;
              },
            }
          : null,
        line: ydisplay.lineStyle === 1 ? _.object() : null,
      },
      tooltip: {
        shared: true,
        showCrosshairs: true,
        formatter: ({ value, groupName }) => {
          const { name } = formatControlInfo(groupName);
          if (isPercentStackedArea) {
            return {
              name,
              value: `${(value * 100).toFixed(Number.isInteger(value) ? 0 : 2)}%`
            }
          } else {
            return {
              name,
              value: _.isNumber(value) ? value.toLocaleString() : _l('空')
            }
          }
        }
      },
      point: displaySetup.showNumber
        ? {
            shape: 'point',
            size: 3,
          }
        : false,
      label: displaySetup.showNumber
        ? {
            layout: [
              displaySetup.hideOverlapText ? { type: 'hide-overlap' } : null,
              (ydisplay.maxValue && ydisplay.maxValue < maxValue) || (ydisplay.minValue && ydisplay.minValue > minValue) ? { type: 'limit-in-plot' } : null,
            ],
            content: ({ value, groupName }) => {
              return formatrChartValue(value, isPercentStackedArea, newYaxisList);
            },
          }
        : false,
      annotations: LineValue
        ? [
            {
              type: 'line',
              start: ['min', LineValue],
              end: ['max', LineValue],
              style: {
                stroke: '#333',
              },
            },
          ]
        : null,
    };
    if ([0, 1].includes(displaySetup.showChartType)) {
      baseConfig.lineStyle = {
        lineWidth: 3,
      };
    }
    if (displaySetup.showChartType == 2) {
      baseConfig.isStack = displaySetup.isPerPile;
      baseConfig.isPercent = displaySetup.isPerPile;
      baseConfig.line = {
        size: 2,
      };
    }

    if (_.isEmpty(contrastMap)) {
      return {
        LineChartComponent: ChartComponent,
        LineChartConfig: Object.assign(_.object(), baseConfig, {
          data: sortData,
          color: colors,
        }),
      };
    } else {
      const contrastData = formatChartData(
        contrastMap.map(item => {
          item.key = lastDateText;
          return item;
        }),
        yaxisList,
        displaySetup,
      );
      const newData = mergeDataTime(sortData, contrastData);
      return {
        LineChartComponent: ChartComponent,
        LineChartConfig: Object.assign(_.object(), baseConfig, {
          data: newData,
          color: ['#64B5F6', '#CCC'],
          tooltip: {
            showTitle: false,
            shared: true,
            showCrosshairs: true,
            formatter: ({ value, groupName, name: xName }) => {
              const { name } = formatControlInfo(groupName);
              const newValue = _.isNumber(value) ? value.toLocaleString() : _l('空');
              if (name === lastDateText) {
                const { originalName } = _.find(contrastData, { name: xName }) || _.object();
                return {
                  name: moment(originalName).isValid() ? `${name} ${originalName} ` : name,
                  value: newValue,
                }
              } else {
                const { originalName } = _.find(sortData, { name: xName }) || _.object();
                return {
                  name: moment(originalName).isValid() ? `${name} ${originalName} ` : name,
                  value: newValue,
                }
              }
            },
          },
        }),
      };
    }
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
