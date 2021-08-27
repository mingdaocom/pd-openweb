import React, { Component } from 'react';
import { Funnel } from '@antv/g2plot';
import { getLegendType, formatrChartValue, formatYaxisList, getChartColors } from './common';
import { formatSummaryName } from 'src/pages/worksheet/common/Statistics/common';

const mergeDataTime = (data, contrastData) => {
  const maxLengthData = data.length > contrastData.length ? data : contrastData;
  const maxLength = maxLengthData.length;
  const newData = (maxLength !== data.length ? data.concat(Array.from({ length: maxLength - data.length })) : data).map(
    (item, index) => {
      if (item) {
        item.name = maxLengthData[index].name;
        return item;
      } else {
        return {
          groupName: maxLengthData[index].groupName,
          name: maxLengthData[index].name,
          value: 0,
        };
      }
    },
  );
  const newContrastData = (maxLength !== contrastData.length
    ? contrastData.concat(Array.from({ length: maxLength - contrastData.length }))
    : contrastData
  ).map((item, index) => {
    let groupName = _l('上一期');
    if (item) {
      item.groupName = groupName;
      item.originalName = item.name;
      item.name = maxLengthData[index].name;
      return item;
    } else {
      return {
        groupName,
        name: maxLengthData[index].name,
        value: 0,
      };
    }
  });
  return newData.concat(newContrastData);
};

// 调整空值位置
const formatEmptyDataPosition = (data, isAccumulate, xaxisEmpty) => {

  const cloneData = _.cloneDeep(data);

  if (xaxisEmpty) {
    cloneData.forEach(item => {
      const { value } = item;
      const last = value[value.length - 1];
      value.pop();
      if (isAccumulate && last.x == '空') {
        last.x = _l('全部');
      }
      value.unshift(last);
    });
  }

  return cloneData;
}

const formatChartData = (data, { isAccumulate }, { xaxisEmpty }) => {
  const result = [];
  const cloneData = formatEmptyDataPosition(_.cloneDeep(data), isAccumulate, xaxisEmpty);
  const { value } = cloneData[0];
  if (isAccumulate) {
    cloneData.map(item => {
      item.value.reverse().map((n, index) => {
        const lastn = item.value[index - 1];
        n.v = n.v + (lastn ? lastn.v : 0);
        return n;
      });
      item.value.reverse();
      return item;
    });
  }
  value.forEach(item => {
    const name = item.x;
    cloneData.forEach((element, index) => {
      const target = element.value.filter(n => n.x === name);
      if (target.length && target[0].v) {
        result.push({
          groupName: element.key,
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
    this.contrastData = null;
    this.FunnelChart = null;
  }
  componentDidMount() {
    const config = this.getComponentConfig(this.props);
    this.FunnelChart = new Funnel(this.chartEl, config);
    this.FunnelChart.render();
  }
  componentWillUnmount() {
    this.FunnelChart.destroy();
  }
  componentWillReceiveProps(nextProps) {
    const { map, displaySetup } = nextProps.reportData;
    const { displaySetup: oldDisplaySetup } = this.props.reportData;
    // 显示设置
    if (
      displaySetup.showLegend !== oldDisplaySetup.showLegend ||
      displaySetup.legendType !== oldDisplaySetup.legendType ||
      displaySetup.showNumber !== oldDisplaySetup.showNumber ||
      displaySetup.magnitudeUpdateFlag !== oldDisplaySetup.magnitudeUpdateFlag
    ) {
      const config = this.getComponentConfig(nextProps);
      this.FunnelChart.update(config);
    }
    // 切换图表类型 & 累计
    if (
      displaySetup.showChartType !== oldDisplaySetup.showChartType ||
      displaySetup.isAccumulate !== oldDisplaySetup.isAccumulate
    ) {
      this.FunnelChart.destroy();
      const config = this.getComponentConfig(nextProps);
      this.FunnelChart = new Funnel(this.chartEl, config);
      this.FunnelChart.render();
    }
  }
  getComponentConfig(props) {
    const { map, contrastMap, displaySetup, yaxisList, xaxes, style } = props.reportData;
    const data = formatChartData(map, displaySetup, xaxes);
    const { position } = getLegendType(displaySetup.legendType);
    const newYaxisList = formatYaxisList(data, yaxisList);
    const colors = getChartColors(style);

    this.setCount(newYaxisList);

    const baseConfig = {
      appendPadding: displaySetup.showChartType === 2 ? [50, 0, 50, 0] : [0, 100, 0, 100],
      xField: 'name',
      yField: 'value',
      meta: {
        name: {
          type: 'cat',
        },
      },
      tooltip: {
        formatter: ({ name, value }) => {
          return {
            name,
            value: value ? value.toLocaleString() : value,
          };
        },
      },
      isTransposed: displaySetup.showChartType === 2,
      color: colors,
      legend: displaySetup.showLegend
        ? {
            position: position == 'top-left' ? 'top' : position,
            flipPage: true,
            itemHeight: 20,
          }
        : false,
      conversionTag: displaySetup.showNumber
        ? {
            formatter: data => {
              return _l('转化率%0', `${(data.$$percentage$$ * 100).toFixed(2)}%`);
            },
          }
        : false,
      label: {
        callback: (xField, yField) => {
          return {
            content: `${xField} ${formatrChartValue(yField, false, newYaxisList)}`,
          };
        },
        layout: [{ type: 'adjust-color' }],
      },
    };

    if (_.isEmpty(contrastMap)) {
      this.contrastData = null;
      baseConfig.data = data;
    } else {
      const contrastData = formatChartData(contrastMap, displaySetup, xaxes);
      const newData = mergeDataTime(data, contrastData);
      this.contrastData = newData;
      baseConfig.compareField = 'groupName';
      baseConfig.data = newData;
    }

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
