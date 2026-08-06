import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import { formatFileSize } from 'src/utils/common';
import { formatter } from '../../util';

let g2plotPromise;

const loadG2Plot = () => {
  if (!g2plotPromise) {
    g2plotPromise = import('@antv/g2plot');
  }

  return g2plotPromise;
};

const getDualAxesData = (data = []) => {
  if (_.isEmpty(data)) {
    return [{ date: '', value: 10000, value1: 10000, value2: 10000, category: 'virtual' }];
  } else if (data.length === 1) {
    const current = data[0];
    const virtualPre = {
      ...current,
      date: moment(current.date).subtract(1, 'day').format('YYYY-MM-DD'),
      value: null,
      value1: null,
      value2: null,
      category: 'virtual',
    };
    const virtualNext = {
      ...current,
      date: moment(current.date).add(1, 'day').format('YYYY-MM-DD'),
      value: null,
      value1: null,
      value2: null,
      category: 'virtual',
    };
    return [virtualPre, current, virtualNext];
  } else if (data.every(item => item.value === 0)) {
    return [
      ...data,
      {
        date: moment().format('YYYY-MM-DD'),
        value: 10000,
        value1: null,
        value2: null,
        category: 'virtual',
      },
    ];
  }

  return data;
};

export default class LineChart extends React.Component {
  constructor(props) {
    super(props);
    this.chart = null;
    this.chartType = null;
    this.g2plotComponent = null;
    this.isMountedComponent = false;
  }
  componentDidMount() {
    this.isMountedComponent = true;
    loadG2Plot().then(data => {
      if (!this.isMountedComponent) return;

      this.g2plotComponent = data;
      this.renderChart();
    });
  }
  componentDidUpdate(prevProps) {
    if (
      this.g2plotComponent &&
      (!_.isEqual(prevProps.data, this.props.data) ||
        !_.isEqual(prevProps.chartInfo, this.props.chartInfo) ||
        prevProps.currentDimension !== this.props.currentDimension ||
        prevProps.selectedDate !== this.props.selectedDate)
    ) {
      this.renderChart();
    }
  }
  componentWillUnmount() {
    this.isMountedComponent = false;
    this.destroyChart();
  }
  destroyChart = () => {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
      this.chartType = null;
    }
  };
  getMax = data => {
    let arr = data.map(item => item.value);
    return _.isArray(arr) && !_.isEmpty(arr) ? Math.max(...arr) : 0;
  };
  getCeil = max => {
    let bite = 0;

    if (max < 10) {
      return 10;
    }

    while (max >= 10) {
      max /= 10;
      bite += 1;
    }

    return Math.ceil(max) * Math.pow(10, bite);
  };
  getLegendOffsetX = defaultOffset => {
    const totalTxtWidth = Number(_.get(this.props, 'chartInfo.totalTxtWidth')) || 0;

    return totalTxtWidth ? totalTxtWidth + 12 : defaultOffset;
  };
  renderChart = () => {
    const { chartInfo = {}, currentDimension, selectedDate, data = [] } = this.props;
    const { type, total, total1, total2, subTypeTotal = [], hideLegendValue } = chartInfo;
    const { Line, DualAxes } = this.g2plotComponent || {};
    if (!this.lineChartEle || !Line || !DualAxes) return;

    let isAllZero = _.isEmpty(data) || data.every(item => item.value === 0);
    let maxValue = !_.isEmpty(data) && !isAllZero ? Math.max(...data.map(item => item.value)) : 1000;
    const showEveryXaxis =
      (_.includes([0, 1, 5], selectedDate) && currentDimension === '1d') ||
      (_.includes([0, 1, 2, 5], selectedDate) && currentDimension === '1w');
    let ChartComponent;
    let chartConfig;

    switch (type) {
      case 'app':
      case 'record':
        const data1 = getDualAxesData(data.length ? data[0] : []);
        const data2 = getDualAxesData(data.length > 1 ? data[1] : []);
        let max1 = this.getMax(data1);
        let max2 = this.getMax(data2);
        let alias1 = data.length && data[0].length ? data[0][0].category : '';
        let alias2 = data.length && data[1].length ? data[1][0].category : '';
        const legendOffsetX = this.getLegendOffsetX(50);
        ChartComponent = DualAxes;
        chartConfig = {
          data: [data1, data2],
          xField: 'date',
          yField: ['value1', 'value2'],
          seriesField: 'category',
          xAxis: {
            label: {
              formatter: text => {
                const isVirtual =
                  (_.find(data1, v => v.date === text) || {}).category === 'virtual' ||
                  (_.find(data2, v => v.date === text) || {}).category === 'virtual';
                if (isVirtual) return null;
                return moment(text).date() === 1 ? moment(text).format(_l('MM月DD日')) : moment(text).format('DD');
              },
              autoHide: !showEveryXaxis,
            },
          },
          yAxis: {
            value1: {
              tickInterval: this.getCeil(max1) / 5,
              max: this.getCeil(max1),
              min: 0,
              tickLine: {
                alignTick: true,
                length: 0,
              },
            },
            value2: {
              tickInterval: this.getCeil(max2) / 5,
              max: this.getCeil(max2),
              min: 0,
              tickLine: {
                alignTick: true,
                length: 0,
              },
            },
          },
          meta: {
            value1: {
              alias: alias1,
            },
            value2: {
              alias: alias2,
            },
          },
          geometryOptions: [
            {
              geometry: 'line',
              color: '#5B8FF9',
            },
            {
              geometry: 'line',
              color: '#5AD8A6',
            },
          ],
          legend: {
            layout: 'horizontal',
            position: 'top-left',
            offsetX: legendOffsetX,
            itemName: {
              formatter: (text, item, index) => {
                let total = index === 0 ? total1 : total2;
                return text + '：' + total;
              },
              style: {
                fontSize: 13,
                fill: window.themeMode === 'dark' ? '#fafafa' : '#151515',
              },
            },
            itemSpacing: 50,
            itemHeight: 30,
            maxWidth: Math.max(200, this.lineChartEle.clientWidth - legendOffsetX - 20),
            maxRow: 2,
            flipPage: false,
          },
          tooltip: {
            customContent: (title, items) => {
              const isVirtual = (_.find(items, v => _.get(v, 'data.date') === title) || {}).category === 'virtual';
              if (isVirtual) return null;

              const currentDate = moment(title).format('YYYY/MM/DD');
              const isWeek = currentDimension === '1w';
              const isMonth = currentDimension === '1M';
              let nextDate = isWeek
                ? moment(title).endOf('week').format('YYYY/MM/DD')
                : isMonth
                  ? moment(title).endOf('month').format('YYYY/MM/DD')
                  : '';

              if (nextDate && moment().isBefore(nextDate)) {
                nextDate = moment().format('YYYY/MM/DD');
              }

              const customTitle = nextDate
                ? `${currentDate}-${nextDate}${isWeek ? '(' + _l('第%0周', moment(title).week()) + ')' : ''}`
                : currentDate;

              return `<div class="g2TooltipWrap bgCard">
              <div class="g2-tooltip-title">${customTitle}</div>
              <ul class="g2-tooltip-list">
              ${(function () {
                return items
                  .map(it =>
                    it
                      ? `<li class="g2-tooltip-list-item">
                  <span class="g2-tooltip-marker" style="background-color: ${it.color};"></span>
                  <span class="g2-tooltip-name">${it.name}</span>:
                  <span class="g2-tooltip-value">${
                    it.value > 0 ? formatter(it.value) + ' ' + it.data.unit : 0 + ' ' + it.data.unit
                  }</span>
                  </li>`
                      : ``,
                  )
                  .join('');
              })()}
              </ul>
            </div>`;
            },
          },
        };
        break;
      case 'workflow':
        const workflowLegendOffsetX = this.getLegendOffsetX(10);
        ChartComponent = Line;
        chartConfig = {
          data: isAllZero ? [...data, { value: 1000, category: '工作流执行数' }] : data,
          appendPadding: [0, 20, 0, 0],
          xField: 'date',
          yField: 'value',
          seriesField: 'category',
          autoFit: true,
          legend: {
            layout: 'horizontal',
            position: 'top-left',
            offsetX: workflowLegendOffsetX,
            itemName: {
              formatter: () => {
                return hideLegendValue ? '' : total;
              },
              style: {
                fontSize: 13,
                fill: window.themeMode === 'dark' ? '#fafafa' : '#151515',
                opacity: hideLegendValue ? 0 : 1,
              },
            },
            marker: {
              style: {
                lineWidth: 0,
                opacity: hideLegendValue ? 0 : 1,
              },
            },
            itemHeight: 30,
          },
          xAxis: {
            range: data.length > 1 ? [0, 1] : undefined,
            label: {
              formatter: text => {
                return moment(text).date() === 1 ? moment(text).format(_l('MM月DD日')) : moment(text).format('DD');
              },
              autoHide: !showEveryXaxis,
            },
          },
          yAxis: {
            tickInterval: this.getCeil(maxValue) / 5,
            max: this.getCeil(maxValue),
            min: 0,
          },
          color: ['#1677ff', '#61DDAA'],
          tooltip: {
            title: date => {
              const currentDate = moment(date).format('YYYY/MM/DD');
              const isWeek = currentDimension === '1w';
              const isMonth = currentDimension === '1M';
              let nextDate = isWeek
                ? moment(date).endOf('week').format('YYYY/MM/DD')
                : isMonth
                  ? moment(date).endOf('month').format('YYYY/MM/DD')
                  : '';

              if (nextDate && moment().isBefore(nextDate)) {
                nextDate = moment().format('YYYY/MM/DD');
              }

              return nextDate
                ? `${currentDate}-${nextDate}${isWeek ? '(' + _l('第%0周', moment(date).week()) + ')' : ''}`
                : currentDate;
            },
            formatter: datum => {
              let unit = type === 'attachment' && total ? total.slice(total.length - 2) : _l('次');
              return {
                name: datum.category,
                value: datum.value > 0 ? formatter(datum.value) + ' ' + unit : 0 + ' ' + unit,
              };
            },
          },
        };
        break;
      case 'attachment':
        const attachmentLegendOffsetX = this.getLegendOffsetX(135);
        ChartComponent = Line;
        chartConfig = {
          limitInPlot: false,
          xField: 'date',
          yField: 'value',
          data,
          appendPadding: [0, 20, 0, 0],
          seriesField: 'category',
          autoFit: true,
          xAxis: {
            range: data.length > 6 ? [0, 1] : undefined,
            label: {
              formatter: text => {
                return moment(text).date() === 1 ? moment(text).format(_l('MM月DD日')) : moment(text).format('DD');
              },
              autoHide: !showEveryXaxis,
            },
          },
          yAxis: {
            tickInterval: this.getCeil(maxValue) / 5,
            max: this.getCeil(maxValue),
            min: 0,
          },
          legend: {
            layout: 'horizontal',
            position: 'top-left',
            offsetX: attachmentLegendOffsetX,
            itemName: {
              formatter: (text, item, index) => {
                const total = (_.find(subTypeTotal, v => v.subType === index + 1) || { size: 0 }).size;
                return text + '：' + formatFileSize(total, 2);
              },
              style: {
                fontSize: 13,
                fill: window.themeMode === 'dark' ? '#fafafa' : '#151515',
              },
            },
            maxWidth: Math.min(
              this.lineChartEle.clientWidth <= 1100 ? 800 : 1200,
              Math.max(200, this.lineChartEle.clientWidth - attachmentLegendOffsetX - 20),
            ),
            maxItemWidth: 200,
            itemHeight: 30,
            flipPage: false,
            itemSpacing: 10,
            maxRow: 2,
          },
          tooltip: {
            customContent: (title, items) => {
              const currentTotal = _.reduce(items, (sum, item) => (sum = sum + Number(item.value)), 0);
              let unit = currentTotal > 0 ? _.get(items, '[0].data.unit') : total.slice(total.length - 2);

              return `<div class="g2TooltipWrap bgCard">
                <div class="g2-tooltip-title">${title}</div>
                <div class="bold mTop12">${_l('总计：')}${
                  currentTotal > 0 ? formatter(currentTotal.toFixed(2)) + ' ' + unit : 0 + ' ' + unit
                }</div>
                <ul class="g2-tooltip-list">
                ${(function () {
                  return items
                    .map(it =>
                      it
                        ? `<li class="g2-tooltip-list-item">
                    <span class="g2-tooltip-marker" style="background-color: ${it.color};"></span>
                    <span class="g2-tooltip-name">${it.name}</span>:
                    <span class="g2-tooltip-value">${
                      it.value > 0 ? formatter(it.value) + ' ' + it.data.unit : 0 + ' ' + it.data.unit
                    }</span>
                    </li>`
                        : ``,
                    )
                    .join('');
                })()}
                </ul>
              </div>`;
            },
          },
          color: ['#27A1E4', '#2EC29B', '#F8A239', '#FB704A', '#8D67D3', '#B97036'],
        };
        break;
      default:
        this.destroyChart();
        return;
    }

    if (_.includes(['1w', '1M'], currentDimension)) {
      const isWeek = currentDimension === '1w';

      chartConfig.xAxis = Object.assign({}, chartConfig.xAxis, {
        label: Object.assign({}, chartConfig.xAxis.label, {
          formatter: text => {
            return isWeek ? `${moment(text).year()} w${moment(text).week()}` : _l('%0月', moment(text).month() + 1);
          },
        }),
      });
    }

    if (this.chart && this.chartType === type) {
      this.chart.update(chartConfig);
      return;
    }

    this.destroyChart();
    this.chart = new ChartComponent(this.lineChartEle, chartConfig);
    this.chartType = type;
    this.chart.render();
  };
  render() {
    return <div className="w100 h100" ref={ele => (this.lineChartEle = ele)}></div>;
  }
}
