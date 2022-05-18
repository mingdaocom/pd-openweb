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
import { Dropdown, Menu } from 'antd';
import { formatSummaryName, isFormatNumber } from 'src/pages/worksheet/common/Statistics/common';

const lastDateText = _l('上一期');

const mergeDataTime = (data, contrastData) => {
  const maxLengthData = data.length > contrastData.length ? data : contrastData;
  const newData = data.map((item, index) => {
    item.originalName = item.originalId;
    item.originalId = maxLengthData[index].originalId;
    return item;
  });
  const newcontrastData = contrastData.map((item, index) => {
    item.originalName = item.originalId;
    item.originalId = maxLengthData[index].originalId;
    item.isContrast = true;
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
    const name = item.originalX;
    cloneData.forEach((element, index) => {
      const lastElement = cloneData[index - 1];
      const lastValue = lastElement && isPile ? lastElement.value.filter(n => n.originalX === item.originalX)[0].v : 0;
      const current = element.value.filter(n => {
        if (isPile && n.originalX === name) {
          n.v = n.v + lastValue;
        }
        return n.originalX === name;
      });
      if (current.length) {
        const { rename } = _.find(yaxisList, { controlId: element.c_id }) || {};
        result.push({
          groupName: `${rename || element.key}-md-${reportTypes.LineChart}-chart-${element.c_id || index}`,
          groupKey: element.originalKey,
          value: current[0].v,
          name: item.x,
          originalId: item.originalX || item.x
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
      dropdownVisible: false,
      offset: {},
      contrastType: false,
      match: null
    }
    this.LineChart = null;
  }
  componentDidMount() {
    this.renderLineChart(this.props);
  }
  componentWillUnmount() {
    this.LineChart && this.LineChart.destroy();
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
      this.renderLineChart(nextProps);
    }
  }
  renderLineChart(props) {
    const { reportData, isViewOriginalData } = props;
    const { displaySetup } = reportData;
    const { LineChartComponent, LineChartConfig } = this.getComponentConfig(props);
    this.LineChart = new LineChartComponent(this.chartEl, LineChartConfig);
    if (displaySetup.showRowList && isViewOriginalData) {
      this.LineChart.on('element:click', this.handleClick);
    }
    this.LineChart.render();
  }
  handleClick = ({ data, gEvent }) => {
    const { xaxes, split, displaySetup } = this.props.reportData;
    const { contrastType } = displaySetup;
    const currentData = data.data;
    const isNumber = isFormatNumber(xaxes.controlType);
    const param = {
      [xaxes.cid]: contrastType ? currentData.name : (isNumber ? Number(currentData.originalId) : currentData.originalId)
    }
    if (split.controlId) {
      const isNumber = isFormatNumber(split.controlType);
      param[split.cid] = isNumber ? Number(currentData.groupKey) : currentData.groupKey;
    }
    this.setState({
      dropdownVisible: true,
      offset: {
        x: gEvent.x + 20,
        y: gEvent.y
      },
      contrastType: currentData.isContrast ? contrastType : undefined,
      match: param
    });
  }
  handleRequestOriginalData = () => {
    const { isThumbnail } = this.props;
    const { match, contrastType } = this.state;
    this.setState({ dropdownVisible: false });
    const data = {
      isPersonal: false,
      contrastType,
      match
    }
    if (isThumbnail) {
      this.props.onOpenChartDialog(data);
    } else {
      this.props.requestOriginalData(data);
    }
  }
  getComponentConfig(props) {
    const { map, contrastMap, displaySetup, xaxes, yaxisList, style } = props.reportData;
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
      xField: 'originalId',
      yField: 'value',
      meta: {
        originalId: {
          type: 'cat',
          range: [0, 1],
          formatter: value => {
            const item = _.find(sortData, { originalId: value });
            return item ? item.name : value;
          }
        },
        groupName: {
          formatter: value => formatControlInfo(value).name,
        },
        value: {
          nice: false,
        },
      },
      connectNulls: xaxes.emptyType !== 3,
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
        minLimit: _.isNumber(ydisplay.minValue) ? ydisplay.minValue : null,
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
        line: ydisplay.lineStyle === 1 ? {} : null,
      },
      tooltip: {
        shared: true,
        showCrosshairs: true,
        formatter: ({ value, groupName }) => {
          const { name, id } = formatControlInfo(groupName);
          if (isPercentStackedArea) {
            return {
              name,
              value: `${(value * 100).toFixed(Number.isInteger(value) ? 0 : 2)}%`
            }
          } else {
            const { dot } = _.find(yaxisList, { controlId: id }) || {};
            return {
              name,
              value: _.isNumber(value) ? value.toLocaleString('zh', { minimumFractionDigits: dot }) : '--'
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
        LineChartConfig: Object.assign({}, baseConfig, {
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
        LineChartConfig: Object.assign({}, baseConfig, {
          data: newData,
          color: ['#64B5F6', '#CCC'],
          tooltip: {
            showTitle: false,
            shared: true,
            showCrosshairs: true,
            formatter: ({ value, groupName, originalId: xName }) => {
              const { name, id } = formatControlInfo(groupName);
              const { dot } = _.find(yaxisList, { controlId: id }) || {};
              const newValue = _.isNumber(value) ? value.toLocaleString('zh', { minimumFractionDigits: dot }) : '--';
              if (name === lastDateText) {
                const { originalName } = _.find(contrastData, { originalId: xName }) || {};
                return {
                  name: moment(originalName).isValid() ? `${name} ${originalName} ` : name,
                  value: newValue,
                }
              } else {
                const { originalName } = _.find(sortData, { originalId: xName }) || {};
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
  renderOverlay() {
    return (
      <Menu className="chartMenu" style={{ width: 160 }}>
        <Menu.Item onClick={this.handleRequestOriginalData}>
          <div className="flexRow valignWrapper">
            <span>{_l('查看原始数据')}</span>
          </div>
        </Menu.Item>
      </Menu>
    );
  }
  render() {
    const { count, originalCount, dropdownVisible, offset } = this.state;
    const { summary, displaySetup } = this.props.reportData;
    return (
      <div className="flex flexColumn chartWrapper">
        <Dropdown
          visible={dropdownVisible}
          onVisibleChange={(dropdownVisible) => {
            this.setState({ dropdownVisible });
          }}
          trigger={['click']}
          placement="bottomLeft"
          overlay={this.renderOverlay()}
        >
          <div className="Absolute" style={{ left: offset.x, top: offset.y }}></div>
        </Dropdown>
        {displaySetup.showTotal ? (
          <div className="pBottom10">
            <span>{formatSummaryName(summary)}: </span>
            <span data-tip={originalCount ? originalCount : null} className="count">{count}</span>
          </div>
        ) : null}
        <div className={displaySetup.showTotal ? 'showTotalHeight' : 'h100'} ref={el => (this.chartEl = el)}></div>
      </div>
    );
  }
}
