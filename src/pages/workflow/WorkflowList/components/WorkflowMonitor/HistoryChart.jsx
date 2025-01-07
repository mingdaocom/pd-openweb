import React, { PureComponent, Fragment } from 'react';
import { Dropdown, LoadDiv } from 'ming-ui';
import flowMonitor from 'src/pages/workflow/api/processVersion.js';
import { formatter } from './enum';
import moment from 'moment';

export default class HistoryChart extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showDate: 1, // 最近1小时
      accumulateAdd: 0,
      accumulateConsumer: 0,
      loadingChart: true,
    };
    this.lineChart = null;
  }

  componentDidMount() {
    import('@antv/g2plot').then(data => {
      this.g2plotComponent = data;
      this.renderChart();
    });
    this.getChartData();
  }

  getChartData = () => {
    const { projectId } = this.props;
    flowMonitor
      .getHistoryDifferenceByCompanyId({
        companyId: projectId,
        startDate: moment().subtract(24, 'h').format('YYYY-MM-DD HH:mm:ss'),
        endDate: moment().format('YYYY-MM-DD HH:mm:ss'),
      })
      .then(res => {
        if (res && _.isArray(res)) {
          this.setState({ historyChartData: res }, this.getHistoryAccumulateData);
          this.dealChartData(res);
        } else {
          this.setState({ loadingChart: false });
        }
      });
  };

  renderChart = () => {
    const _this = this;
    let initChartData = [];
    let diffMinite = Math.floor(moment().subtract(5, 'm').format('mm') % 5);
    let currentDate = moment().minute(moment().add(5, 'm').format('mm') - diffMinite);
    const { Line } = this.g2plotComponent;
    for (let i = 12; i > 0; i--) {
      let date = moment(currentDate)
        .subtract(i * 5, 'm')
        .format('YYYY-MM-DD HH:mm');
      initChartData.push(
        { category: _l('排队'), value: 0, date },
        { category: _l('新增'), value: 0, date },
        { category: _l('消费'), value: 0, date },
      );
    }
    initChartData.push({ value: 50 });
    this.lineChart = new Line(this.chantRef, {
      data: initChartData,
      xField: 'date',
      yField: 'value',
      seriesField: 'category',
      appendPadding: [20, 0],
      smooth: true,
      color: ['#F51744', '#2196F3', '#61DDAA'],
      xAxis: {
        label: {
          style: {
            fill: '#2C3542',
            opacity: 0.45,
          },
          formatter: date => moment(date).format('HH:mm'),
        },
        line: {
          style: {
            stroke: '#416180',
            opacity: 0.45,
            lineWidth: 0.5,
          },
        },
        tickLine: {
          style: {
            fill: '#BDBDBD',
            opacity: 1,
          },
        },
      },
      yAxis: {
        label: {
          type: 'inner',
          offsetY: -3,
          // 数值格式化为千分位
          formatter: v => `${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, s => `${s},`),
          style: {
            fill: '#2C3542',
            opacity: 0.45,
          },
          grid: {
            line: {
              style: {
                stroke: 'rgba(65, 97, 128, 0.15)',
                lineWidth: 0.5,
              },
            },
          },
        },
      },
      legend: {
        position: 'top-right',
        offsetY: 5,
      },
      tooltip: {
        enterable: true,
        fields: ['category', 'value'],
        formatter: datum => {
          return { name: datum.category, value: datum.value };
        },
        showTitle: true,
        title: v => `${moment(v).format('MMMDo HH:mm')}`,
        showContent: true,
        offset: -40,
        offsetY: -50,
        domStyles: {
          'g2-tooltip-list-item': { textAlign: 'left', color: '#151515' },
          'g2-tooltip-title': { color: '#757575' },
        },
        customContent: (title, items) => {
          const [data1 = {}, data2 = {}, data3 = {}] = items;
          const date = _.get(data1, 'data.date');

          return `<div class="g2TooltipWrap">
            <div class="g2-tooltip-title">${title}</div>
            <ul class="g2-tooltip-list">
            ${(function () {
              return items
                .map(it =>
                  it
                    ? `<li class="g2-tooltip-list-item">
                <span class="g2-tooltip-marker" style="background-color: ${it.color};"></span>
                <span class="g2-tooltip-name">${it.name}</span>:
                <span class="g2-tooltip-value">${it.value}</span>
                </li>`
                    : ``,
                )
                .join('');
            })()}
            </ul>
            <li class="g2-tooltip-list-item TxtCenter">
              <span class="g2-tooltip-name ThemeColor Hand customContent" data-date=${JSON.stringify(
                date,
              )} date1=${date}>查看详情</span>
            </li>
          </div>`;
        },
      },
      slider: {
        height: 16,
        start: 23 / 24,
        end: 1,
        foregroundStyle: {
          fill: '#2196F3',
          opacity: 0.11,
        },
        TrendCfg: {
          backgroundStyle: {
            fill: '#F5F7F9',
            opacity: 1,
          },
          lineStyle: {
            fill: '#DBDBDB',
            opacity: 1,
          },
        },
      },
    });
    this.lineChart.on('slider:click', e => {
      this.setState({ showDate: undefined });
    });
    this.lineChart.render();

    $(this.chantRef).on('click', '.customContent', () => {
      const ele = $('.customContent');
      const dateStr = ele.data('date');
      let temp = _this.state.historyChartData.filter(
        item =>
          moment(new Date(dateStr)) <= moment(item.lastModifiedDate) &&
          moment(item.lastModifiedDate) < moment(new Date(dateStr)).add(5, 'm'),
      );
      const historyIds = temp.map(it => it.id);

      this.props.updateHistoryDetail({ showHistoryDetail: true, dateStr, historyIds });
    });
  };

  // 整理chart数据
  dealChartData = data => {
    // 当前时间的整5分钟数（向下取整）
    let diffMinite = Math.floor(moment().subtract(5, 'm').format('mm') % 5);
    let currentDate = moment().minute(moment().add(5, 'm').format('mm') - diffMinite);
    let result = [];
    let emptyChartData = [];

    for (let i = (24 * 60) / 5; i > 0; i--) {
      let startDate = moment(currentDate).subtract(i * 5, 'm');
      let endDate = moment(currentDate).subtract((i - 1) * 5, 'm');
      let date = endDate.format('YYYY-MM-DD HH:mm');
      let currentGroupData = data.filter(
        item => startDate <= moment(item.lastModifiedDate) && moment(item.lastModifiedDate) < endDate,
      );
      if (_.isEmpty(data)) {
        emptyChartData.push(
          { category: _l('新增'), value: 0, date },
          { category: _l('消费'), value: 0, date },
          { category: _l('排队'), value: 0, date },
        );
      } else {
        result.push(
          {
            category: _l('排队'),
            date,
            value: currentGroupData.reduce((total, curent) => total + curent.difference, 0),
          },
          {
            category: _l('新增'),
            date,
            value: currentGroupData.reduce((total, curent) => total + curent.producer, 0),
          },
          {
            category: _l('消费'),
            date,
            value: currentGroupData.reduce((total, curent) => total + curent.consumer, 0),
          },
        );
      }
    }
    if (!_.isEmpty(emptyChartData)) {
      emptyChartData.push({ value: 50 });
    }
    this.setState({ loadingChart: false });
    if (!this.lineChart) return;
    !_.isEmpty(result) ? this.lineChart.changeData(result) : this.lineChart.changeData(emptyChartData);
  };

  getHistoryAccumulateData = (hour = 1) => {
    const { historyChartData } = this.state;
    const date = moment().subtract(hour, 'h');
    const temp = _.filter(historyChartData, item => {
      return moment(item.lastModifiedDate) >= date;
    });
    const accumulateAdd = temp.reduce((total, curent) => total + curent.producer, 0);
    const accumulateConsumer = temp.reduce((total, curent) => total + curent.consumer, 0);
    this.setState({ accumulateAdd, accumulateConsumer });
  };

  render() {
    const { showDate, loadingChart, accumulateAdd, accumulateConsumer } = this.state;

    return (
      <Fragment>
        <div className="pBottom25">
          <div className="subTitle">{_l('历史')}</div>
        </div>
        <div className="Relative">
          <div className="historyStatistics">
            <Dropdown
              className="selectDate mRight35"
              placeholder={_l('自定义')}
              value={showDate}
              border
              menuStyle={{ width: 220 }}
              data={[
                { value: 1, text: _l('最近1小时') },
                { value: 3, text: _l('最近3小时') },
                { value: 12, text: _l('最近12小时') },
                { value: 24, text: _l('最近24小时') },
              ]}
              onChange={value => {
                this.setState({ showDate: value });
                this.getHistoryAccumulateData(value);
                this.lineChart.update({
                  slider: {
                    start: (24 - value) / 24,
                  },
                });
              }}
            />
            {showDate && (
              <Fragment>
                <span className="mRight30 Font12">
                  <span className="Gray_75">{_l('累计新增')} </span>
                  <span className="Font14 bold">{formatter(accumulateAdd)}</span>
                </span>
                <span className="mRight30 Font12">
                  <span className="Gray_75">{_l('累计消费')} </span>
                  <span className="Font14 bold">{formatter(accumulateConsumer)}</span>
                </span>
              </Fragment>
            )}
          </div>
          <div className="chartBox" ref={node => (this.chantRef = node)} />
          {loadingChart && (
            <div className="loadingWrap">
              <LoadDiv />
            </div>
          )}
        </div>
      </Fragment>
    );
  }
}
