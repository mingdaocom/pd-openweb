import React, { Component } from 'react';
import { DualAxes } from '@antv/g2plot';
import {
  formatControlInfo,
  formatrChartValue,
  formatrChartAxisValue,
  reportTypes,
  getLegendType,
  formatYaxisList,
  getMinValue,
  getChartColors
} from './common';
import { formatChartData as formatLineChartData } from './LineChart';
import { formatChartData as formatBarChartData } from './BarChart';
import { formatSummaryName } from 'src/pages/worksheet/common/Statistics/common';

const getLineChartXAxis = (controlId, data) => {
  if (controlId) {
    const result = [];
    data.forEach((item, index) => {
      const { id } = formatControlInfo(item.groupName);
      if (id === controlId) {
        result.push(item);
      }
    });
    return result.map(item => item.name);
  } else {
    return _.uniq(data.map(item => item.name));
  }
};

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      originalLeftCount: 0,
      leftCount: 0,
      originalRightCount: 0,
      rightCount: 0,
    }
    this.DualAxes = null;
  }
  componentDidMount() {
    const config = this.getComponentConfig(this.props);
    this.DualAxes = new DualAxes(this.chartEl, config);
    this.DualAxes.render();
  }
  componentWillUnmount() {
    this.DualAxes.destroy();
  }
  componentWillReceiveProps(nextProps) {
    const { map, displaySetup, rightY } = nextProps.reportData;
    const { displaySetup: oldDisplaySetup, rightY: oldRightY } = this.props.reportData;

    if (_.isEmpty(rightY)) {
      return;
    }

    const rightYDisplay = rightY.display.ydisplay;
    const oldRightYDisplay = oldRightY.display.ydisplay;

    // 显示设置
    if (
      displaySetup.fontStyle !== oldDisplaySetup.fontStyle ||
      displaySetup.showLegend !== oldDisplaySetup.showLegend ||
      displaySetup.legendType !== oldDisplaySetup.legendType ||
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
      displaySetup.ydisplay.lineStyle !== oldDisplaySetup.ydisplay.lineStyle ||
      rightYDisplay.showDial !== oldRightYDisplay.showDial ||
      rightYDisplay.showTitle !== oldRightYDisplay.showTitle ||
      rightYDisplay.title !== oldRightYDisplay.title ||
      rightYDisplay.minValue !== oldRightYDisplay.minValue ||
      rightYDisplay.maxValue !== oldRightYDisplay.maxValue
    ) {
      const config = this.getComponentConfig(nextProps);
      this.DualAxes.update(config);
    }
    // 堆叠 & 累计
    if (
      displaySetup.isPile !== oldDisplaySetup.isPile ||
      displaySetup.isAccumulate !== oldDisplaySetup.isAccumulate ||
      rightY.display.isAccumulate !== oldRightY.display.isAccumulate ||
      rightY.display.isPile !== oldRightY.display.isPile
    ) {
      this.DualAxes.destroy();
      const config = this.getComponentConfig(nextProps);
      this.DualAxes = new DualAxes(this.chartEl, config);
      this.DualAxes.render();
    }
  }
  getComponentConfig(props) {
    const { map, contrastMap, displaySetup, yaxisList, rightY, yreportType, xaxes, splitId, sorts, style } = props.reportData;
    const { xdisplay, ydisplay } = displaySetup;
    const { position } = getLegendType(displaySetup.legendType);
    const sortsKey = sorts.map(n => _.findKey(n));
    const leftSorts = yaxisList.filter(item => sortsKey.includes(item.controlId));
    const rightSorts = rightY.yaxisList.filter(item => sortsKey.includes(item.controlId));
    const isLeftSort = splitId || !_.isEmpty(leftSorts);
    const isRightSort = rightY.splitId || !_.isEmpty(rightSorts);
    const rightYDisplay = rightY.display.ydisplay;
    const colors = getChartColors(style);

    let sortLineXAxis = [];
    let data =
      yreportType === reportTypes.LineChart
        ? formatLineChartData(map, yaxisList, displaySetup)
        : formatBarChartData(map, yaxisList);
    let lineData = _.isEmpty(contrastMap) ? [] : formatLineChartData(contrastMap, rightY.yaxisList, { ...rightY.display });
    let names = [];

    const newYaxisList = formatYaxisList(data, yaxisList);
    const newRightYaxisList = formatYaxisList(lineData, rightY.yaxisList);

    if (isLeftSort) {
      names = data.map(item => item.name);
      sortLineXAxis = getLineChartXAxis(splitId ? null : leftSorts[0].controlId, data);
    }
    if (isRightSort) {
      names = _.uniq(lineData.map(item => item.name));
      sortLineXAxis = getLineChartXAxis(rightY.splitId ? null : rightSorts[0].controlId, lineData);
    }
    if (!(isLeftSort || isRightSort)) {
      names = data.map(item => item.name);
      sortLineXAxis = getLineChartXAxis(null, data);
    }
    if (sortLineXAxis.length) {
      data = data.filter(item => {
        return sortLineXAxis.includes(item.name);
      }).map(item => {
        item.sortIndex = names.indexOf(item.name);
        return item;
      }).sort((a, b) => a.sortIndex - b.sortIndex);
      lineData = lineData.filter(item => {
        return sortLineXAxis.includes(item.name);
      }).map(item => {
        item.sortIndex = names.indexOf(item.name);
        return item;
      }).sort((a, b) => a.sortIndex - b.sortIndex);
    }

    this.setCount(newYaxisList, newRightYaxisList);

    this.lineData = lineData;

    const columnConfig = {
      geometry: 'column',
      isGroup: !displaySetup.isPile,
      isStack: displaySetup.isPile,
      seriesField: 'groupName',
      color: colors,
      label: displaySetup.showNumber
        ? {
            position: displaySetup.isPile ? 'middle' : 'top',
            layout: [
              displaySetup.hideOverlapText ? { type: 'hide-overlap' } : null,
              { type: 'adjust-color' },
              { type: 'limit-in-plot' },
            ],
            content: ({ value, groupName }) => {
              return formatrChartValue(value, false, newYaxisList);
            },
          }
        : false,
    };

    const lineConfig = {
      connectNulls: true,
      smooth: true,
      geometry: 'line',
      seriesField: 'groupName',
      lineStyle: {
        lineWidth: 3,
      },
      color: _.clone(colors).reverse(),
      point: displaySetup.showNumber
        ? {
            shape: 'point',
            size: 3,
          }
        : false,
      label: displaySetup.showNumber
        ? {
            layout: [displaySetup.hideOverlapText ? { type: 'hide-overlap' } : null],
            content: ({ rightValue, groupName }) => {
              const { id } = formatControlInfo(groupName);
              return formatrChartValue(rightValue, false, newRightYaxisList);
            },
          }
        : false,
    };

    lineData.forEach(item => {
      item.rightValue = item.value;
    });

    const rightMinValue = getMinValue(lineData, []);

    const baseConfig = {
      data: [data, lineData],
      appendPadding: [15, 0, 5, 0],
      xField: 'name',
      yField: ['value', 'rightValue'],
      yAxis: {
        value: {
          min: ydisplay.minValue || null,
          max: ydisplay.maxValue || null,
          title:
            ydisplay.showTitle && ydisplay.title
              ? {
                  text: ydisplay.title,
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
          label: ydisplay.showDial
            ? {
                formatter: value => {
                  return value ? formatrChartAxisValue(Number(value), false, newYaxisList) : null;
                },
              }
            : null,
        },
        rightValue: {
          // min: rightMinValue > 0 ? 0 : rightMinValue,
          min: rightYDisplay.minValue || null,
          max: rightYDisplay.maxValue || null,
          title:
            rightYDisplay.showTitle && rightYDisplay.title
              ? {
                  text: rightYDisplay.title,
                }
              : null,
          // grid: {
          //   line: {
          //     style: {
          //       lineDash: rightYDisplay.lineStyle === 1 ? [] : [4, 5]
          //     }
          //   }
          // },
          label: rightYDisplay.showDial
            ? {
                formatter: value => {
                  return value ? formatrChartAxisValue(Number(value), false, newRightYaxisList) : null;
                }
              }
            : null,
        },
      },
      meta: {
        name: {
          type: 'cat',
          ...(sortLineXAxis.length ? { values: sortLineXAxis } : _.object()),
        },
        groupName: {
          formatter: value => formatControlInfo(value).name,
        },
      },
      tooltip: {
        formatter: ({ value, rightValue, groupName }) => {
          const { name } = formatControlInfo(groupName);
          if (_.isNumber(value)) {
            return {
              name,
              value: value ? value.toLocaleString() : value,
            };
          }
          if (_.isNumber(rightValue)) {
            return {
              name,
              value: rightValue ? rightValue.toLocaleString() : rightValue,
            };
          }
          return {
            name,
            value: _l('--'),
          };
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
      legend: displaySetup.showLegend
        ? {
            position,
            flipPage: true,
            itemHeight: 20,
          }
        : false,
    };

    if (yreportType === reportTypes.BarChart) {
      baseConfig.geometryOptions = [columnConfig, lineConfig];
    }
    if (yreportType === reportTypes.LineChart) {
      baseConfig.geometryOptions = [Object.assign(_.object(), lineConfig, { color: colors }), lineConfig];
    }

    return baseConfig;
  }
  setCount(yaxisList, rightYaxisList) {
    const { summary, rightY } = this.props.reportData;
    const leftValue = summary.sum;
    const rightValue = rightY ? rightY.summary.sum : 0;
    const leftCount = formatrChartValue(leftValue, false, yaxisList, null, false);
    const rightCount = formatrChartValue(rightValue, false, rightYaxisList, null, false);
    this.setState({
      originalLeftCount: leftValue.toLocaleString() == leftCount ? 0 : leftValue.toLocaleString(),
      leftCount,
      originalRightCount: rightValue.toLocaleString() == rightCount ? 0 : rightValue.toLocaleString(),
      rightCount,
    });
  }
  render() {
    const { leftCount, originalLeftCount, rightCount, originalRightCount } = this.state;
    const { rightY, displaySetup, contrastMap, summary } = this.props.reportData;
    const dualAxesSwitchChecked = summary.showTotal || (rightY ? rightY.summary.showTotal : null);
    return (
      <div className="flex flexColumn chartWrapper">
        {dualAxesSwitchChecked && (
          <div className="flexRow spaceBetween pBottom10">
            {summary.showTotal ? (
              <div>
                <span>{formatSummaryName(summary)}: </span>
                <span data-tip={originalLeftCount ? originalLeftCount : null} className="count">{leftCount}</span>
              </div>
            ) : (
              <div></div>
            )}
            {rightY && rightY.summary.showTotal ? (
              <div>
                <span>{formatSummaryName(rightY.summary)}: </span>
                <span data-tip={originalRightCount ? originalRightCount : null} className="count">{rightCount}</span>
              </div>
            ) : (
              <div></div>
            )}
          </div>
        )}
        <div className={dualAxesSwitchChecked ? 'showTotalHeight' : 'flex'} ref={el => (this.chartEl = el)}></div>
      </div>
    );
  }
}
