import React, { Fragment, PureComponent } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { LoadDiv } from 'ming-ui';
import { Select } from 'ming-ui/antd-components';
import flowMonitor from 'src/pages/workflow/api/processVersion.js';
import { formatter } from './enum';

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
    this.unmounted = false;
    this.themeObserver = new MutationObserver(this.updateChartTheme);
    this.themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    this.chantRef.addEventListener('click', this.handleTooltipClick);
    import('@antv/g2plot').then(data => {
      if (this.unmounted) return;

      this.g2plotComponent = data;
      this.renderChart();
    });
    this.getChartData();
  }

  componentWillUnmount() {
    this.unmounted = true;
    this.themeObserver.disconnect();
    this.chantRef.removeEventListener('click', this.handleTooltipClick);
    this.lineChart?.destroy();
    this.lineChart = null;
  }

  getChartThemeOptions = () => {
    // Canvas 需要实际色值，从图表容器读取以保留所在作用域的主题变量。
    const style = getComputedStyle(this.chantRef);
    const color = name => style.getPropertyValue(name).trim();
    const textColor = color('--color-text-secondary');
    const borderColor = color('--color-border-primary');
    const gridColor = color('--color-border-secondary');

    return {
      xAxis: {
        label: { style: { fill: textColor, opacity: 1 } },
        line: { style: { stroke: borderColor, opacity: 1, lineWidth: 0.5 } },
        tickLine: { style: { stroke: borderColor, opacity: 1 } },
      },
      yAxis: {
        label: { style: { fill: textColor, opacity: 1 } },
        grid: { line: { style: { stroke: gridColor, lineWidth: 0.5 } } },
      },
      legend: {
        itemName: { style: { fill: textColor } },
      },
      slider: {
        textStyle: { fill: textColor, opacity: 1 },
        // Slider 背景绘制在趋势图上方，保持透明，避免只露出底边的折线。
        backgroundStyle: { opacity: 0 },
        foregroundStyle: { fill: color('--color-primary-transparent'), opacity: 1 },
        handlerStyle: {
          fill: color('--color-background-card'),
          stroke: borderColor,
          highLightFill: color('--color-background-hover'),
        },
        trendCfg: {
          backgroundStyle: { fill: color('--color-background-tertiary'), opacity: 1 },
          lineStyle: { stroke: color('--color-text-tertiary'), strokeOpacity: 1 },
          areaStyle: { fill: gridColor },
        },
      },
    };
  };

  updateChartTheme = () => {
    if (!this.lineChart) return;

    // G2Plot 更新配置会重建图表，需保留用户实际拖选的时间范围。
    const slider = this.lineChart.chart.getController('slider').getComponents()[0]?.component;
    const [start, end] = slider
      ? slider.getValue()
      : [this.lineChart.options.slider.start, this.lineChart.options.slider.end];
    const categoryFilter = this.lineChart.chart.getOptions().filters?.category;
    const options = this.getChartThemeOptions();

    this.lineChart.update({ ...options, slider: { ...options.slider, start, end } });
    if (categoryFilter) {
      this.lineChart.chart.filter('category', categoryFilter);
      this.lineChart.chart.render(true);
    }
  };

  handleTooltipClick = event => {
    const target = event.target.closest('.customContent');

    if (!target || !this.chantRef.contains(target)) return;

    const dateStr = target.dataset.date;
    const temp = this.state.historyChartData.filter(
      item =>
        moment(new Date(dateStr)) <= moment(item.lastModifiedDate) &&
        moment(item.lastModifiedDate) < moment(new Date(dateStr)).add(5, 'm'),
    );
    const historyIds = temp.map(it => it.id);

    this.props.updateHistoryDetail({ showHistoryDetail: true, dateStr, historyIds });
  };

  getChartData = () => {
    const { projectId } = this.props;
    flowMonitor
      .getHistoryDifferenceByCompanyId({
        companyId: projectId,
        startDate: moment().subtract(24, 'h').format('YYYY-MM-DD HH:mm:ss'),
        endDate: moment().format('YYYY-MM-DD HH:mm:ss'),
      })
      .then(res => {
        if (this.unmounted) return;

        if (res && _.isArray(res)) {
          this.setState({ historyChartData: res }, this.getHistoryAccumulateData);
          this.dealChartData(res);
        } else {
          this.setState({ loadingChart: false });
        }
      });
  };

  renderChart = () => {
    let initChartData = [];
    const currentDate = moment();
    currentDate.add(5 - (currentDate.minute() % 5), 'm');
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
    const options = {
      data: initChartData,
      xField: 'date',
      yField: 'value',
      seriesField: 'category',
      appendPadding: [20, 0],
      smooth: true,
      color: ['#F51744', '#1677ff', '#61DDAA'],
      xAxis: {
        label: {
          formatter: date => moment(date).format('HH:mm'),
        },
      },
      yAxis: {
        label: {
          type: 'inner',
          offsetY: -3,
          // 数值格式化为千分位
          formatter: v => `${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, s => `${s},`),
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
          'g2-tooltip': {
            backgroundColor: 'var(--color-background-card)',
            boxShadow: 'var(--shadow-lg)',
          },
          'g2-tooltip-list-item': { textAlign: 'left', color: 'var(--color-text-title)' },
          'g2-tooltip-title': { color: 'var(--color-text-secondary)' },
        },
        customContent: (title, items) => {
          const [data1 = {}] = items;
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
              <span class="g2-tooltip-name colorPrimary Hand customContent" data-date=${JSON.stringify(
                date,
              )} date1=${date}>${_l('查看详情')}</span>
            </li>
          </div>`;
        },
      },
      slider: {
        height: 16,
        start: 23 / 24,
        end: 1,
      },
    };

    this.lineChart = new Line(this.chantRef, _.merge(options, this.getChartThemeOptions()));
    this.lineChart.on('slider:click', () => {
      this.setState({ showDate: undefined });
    });
    this.lineChart.render();
  };

  // 整理chart数据
  dealChartData = data => {
    // 保留原有秒和毫秒分组边界，通过增加分钟处理跨小时和跨日进位
    const currentDate = moment();
    currentDate.add(5 - (currentDate.minute() % 5), 'm');
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
            <Select
              className="selectDate mRight35"
              placeholder={_l('自定义')}
              value={showDate}
              options={[
                { value: 1, label: _l('最近1小时') },
                { value: 3, label: _l('最近3小时') },
                { value: 12, label: _l('最近12小时') },
                { value: 24, label: _l('最近24小时') },
              ]}
              onChange={value => {
                this.setState({ showDate: value });
                this.getHistoryAccumulateData(value);
                this.lineChart.update({
                  slider: {
                    start: (24 - value) / 24,
                    end: 1,
                  },
                });
              }}
            />
            {showDate && (
              <Fragment>
                <span className="mRight30 Font12">
                  <span className="textSecondary">{_l('累计新增')} </span>
                  <span className="Font14 bold">{formatter(accumulateAdd)}</span>
                </span>
                <span className="mRight30 Font12">
                  <span className="textSecondary">{_l('累计消费')} </span>
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
