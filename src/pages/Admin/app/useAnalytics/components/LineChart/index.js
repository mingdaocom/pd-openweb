import React from 'react';
import { formatter } from '../../util';
import _ from 'lodash';
import moment from 'moment';

export default class LineChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data: props.data };
    this.lineChart = null;
  }
  componentDidMount() {
    import('@antv/g2plot').then(data => {
      this.g2plotComponent = data;
      this.renderChart();
    });
  }
  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.data, nextProps.data)) {
      this.setState({ data: nextProps.data }, () => this.renderChart());
    }
  }
  componentWillUnmount() {
    this.lineChart && this.lineChart.destroy();
  }
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
  renderChart = () => {
    const { isDualAxes, configObj = {}, chartInfo = {}, currentDimension } = this.props;
    const { type, total, total1, total2 } = chartInfo;
    const { data = [] } = this.state;
    const { Line, DualAxes } = this.g2plotComponent;
    if (!this.lineChartEle) return;

    if (isDualAxes) {
      let data1 = !_.isEmpty(data)
        ? (!_.isEmpty(data[0]) && data[0].every(item => item.value === 0)) || _.isEmpty(data[0])
          ? [...data[0], { value1: 10000, value: 10000 }]
          : data[0]
        : [{ value1: 10000, value: 10000 }];
      let data2 = !_.isEmpty(data)
        ? (!_.isEmpty(data[1]) && data[1].every(item => item.value === 0)) || _.isEmpty(data[1])
          ? [...data[1], { value1: 10000, value: 10000 }]
          : data[1]
        : [{ value1: 10000, value: 10000 }];
      let max1 = this.getMax(data1);
      let max2 = this.getMax(data2);
      let alias1 = data.length && data[0].length ? data[0][0].category : '';
      let alias2 = data.length && data[1].length ? data[1][0].category : '';
      this.workflowChart = new DualAxes(this.lineChartEle, {
        data: [data1, data2],
        xField: 'date',
        yField: ['value1', 'value2'],
        seriesField: 'category',
        xAxis: {
          label: {
            formatter: text => {
              return moment(text).date() === 1 ? moment(text).format('MM月DD日') : moment(text).format('DD');
            },
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
          offsetX: 50,
          itemName: {
            formatter: (text, item, index) => {
              let total = index === 0 ? total1 : total2;
              return text + '：' + total;
            },
            style: {
              fontSize: 13,
              fill: '#333',
            },
          },
          itemSpacing: 50,
          itemHeight: 30,
        },
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
            let unit = datum.value1 ? _l('次') : _l('人');
            let name =
              type === 'app'
                ? datum.value1 || datum.value1 === 0
                  ? _l('次数')
                  : datum.value2 || datum.value2 === 0
                  ? _l('人数')
                  : ''
                : datum.value1 || datum.value1 === 0
                ? _l('行记录数')
                : datum.value2 || datum.value2 === 0
                ? _l('人数')
                : '';
            return {
              name,
              value:
                datum.value1 > 0
                  ? formatter(datum.value1) + ' ' + unit
                  : datum.value2 > 0
                  ? formatter(datum.value2) + ' ' + unit
                  : 0 + ' ' + unit,
            };
          },
        },
        ...configObj,
      });
    } else {
      let isAllZero = _.isEmpty(data) || data.every(item => item.value === 0);
      let maxValue = !_.isEmpty(data) && !isAllZero ? Math.max(...data.map(item => item.value)) : 1000;
      this.workflowChart = new Line(this.lineChartEle, {
        data: isAllZero ? [...data, { value: 1000 }] : data,
        appendPadding: [0, 20, 0, 0],
        xField: 'date',
        yField: 'value',
        seriesField: 'category',
        autoFit: true,
        legend: {
          layout: 'horizontal',
          position: 'top-left',
          offsetX: 10,
          itemName: {
            formatter: text => {
              return total;
            },
            style: {
              fontSize: 13,
              fill: '#333',
            },
          },
          marker: {
            style: {
              lineWidth: 0,
            },
          },
          itemHeight: 30,
        },
        xAxis: {
          label: {
            formatter: text => {
              return moment(text).date() === 1 ? moment(text).format('MM月DD日') : moment(text).format('DD');
            },
          },
        },
        yAxis: {
          tickInterval: this.getCeil(maxValue) / 5,
          max: this.getCeil(maxValue),
          min: 0,
        },
        color: ['#2196F3', '#61DDAA'],
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
        ...configObj,
      });
    }
    if (_.includes(['1w', '1M'], currentDimension)) {
      const isWeek = currentDimension === '1w';

      this.workflowChart.update({
        xAxis: {
          label: {
            formatter: text => {
              return isWeek ? `${moment(text).year()} w${moment(text).week()}` : _l('%0月', moment(text).month() + 1);
            },
          },
        },
      });
    }

    this.workflowChart.render();
  };
  render() {
    return <div className="w100 h100" ref={ele => (this.lineChartEle = ele)}></div>;
  }
}
