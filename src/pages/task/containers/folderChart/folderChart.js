import React, { Component } from 'react';
import './css/folderChart.less';
import { connect } from 'react-redux';
import ajaxRequest from 'src/api/taskFolderStatistics';
import doT from 'dot';
import echarts from 'echarts';
import filterXss from 'xss';
import { listLoadingContent } from '../../utils/taskComm';
import { errorMessage } from '../../utils/utils';
import 'bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';
import '@mdfe/date-picker-tpl/datePickerTpl.css';
import './customed';
import datePickerTpl from '@mdfe/date-picker-tpl';
import config from '../../config/config';
import 'mdDialog';
import folderChart from './tpl/folderChart.html';
import folderChartMaxView from './tpl/folderChartMaxView.html';
import chargeList from './tpl/chargeList.html';
import customDom from './tpl/customDom.html';

const folderChartSettings = {
  type: 1,
  startDate: '',
  endDate: '',
  chartView: '',
  data: '',
  isAuto: true,
  chargeAccountIDs: [],
  sort: 'desc',
};

class FolderChart extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.init();
    this.bindEvents();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.taskConfig.folderId && nextProps.taskConfig.folderId !== this.props.taskConfig.folderId) {
      setTimeout(() => {
        this.init();
      }, 0);
    }
  }

  /**
   * 初始化
   */
  init() {
    listLoadingContent(1);

    folderChartSettings.type = 1;
    folderChartSettings.data = '';
    folderChartSettings.startDate = moment()
      .subtract(6, 'd')
      .format('YYYY-MM-DD');
    folderChartSettings.endDate = moment().format('YYYY-MM-DD');
    folderChartSettings.isAuto = true;
    folderChartSettings.chargeAccountIDs = [];
    folderChartSettings.sort = 'desc';

    const { folderId, viewType } = this.props.taskConfig;

    ajaxRequest
      .getFolderStatisticsNow({
        folderID: folderId,
      })
      .then((source) => {
        if (viewType !== config.folderViewType.folderChart) {
          return;
        }

        $('#taskList').html(
          doT.template(folderChart)({
            isFirst: true,
            type: folderChartSettings.type,
            data: source.data,
            timeTxt:
              moment()
                .subtract(6, 'd')
                .format('YYYY/MM/DD') +
              ' - ' +
              moment().format('YYYY/MM/DD'),
          })
        );

        this.updateCustomFun();
        this.getDailyFolderStatistics();
      });
  }

  /**
   * 初始化事件
   */
  bindEvents() {
    const that = this;

    $('body').off('.folderChart');

    // bar效果切换
    $('#taskList').on(
      {
        mouseover() {
          $(this).addClass('ThemeColor3 ThemeBorderColor3');
        },
        mouseout() {
          $(this).removeClass('ThemeColor3 ThemeBorderColor3');
        },
        click() {
          const $folderChartTime = $('.folderChartNavBox .folderChartTime');
          const $folderChartChargeBox = $('.folderChartNavBox .folderChartChargeBox');
          $(this)
            .addClass('active ThemeColor3 ThemeBorderColor3')
            .siblings()
            .removeClass();

          folderChartSettings.type = $(this).index() + 1;
          $('#taskList .folderChartBox').html(
            doT.template(folderChart)({
              type: folderChartSettings.type,
            })
          );

          // 刷新图表
          if (folderChartSettings.type === 1) {
            $folderChartTime.removeClass('Hidden');
            $folderChartChargeBox.addClass('Hidden');
            that.getDailyFolderStatistics();
          } else if (folderChartSettings.type === 2) {
            $folderChartTime.addClass('Hidden');
            $folderChartChargeBox.removeClass('Hidden');
            that.getTaskChargeStatistics();
          } else if (folderChartSettings.type === 3) {
            $folderChartTime.add($folderChartChargeBox).addClass('Hidden');
            that.getFolderStageStatistics();
          } else if (folderChartSettings.type === 4) {
            $folderChartTime.removeClass('Hidden');
            $folderChartChargeBox.addClass('Hidden');
            that.getCustomData();
          }
        },
      },
      '.folderChartNavBox .folderChartNav li:not(.active)'
    );

    // 日期切换
    $('body').on('click.folderChart', '.folderChartTime li:not(.activeClass):not([data-type=custom])', function () {
      const date = $(this).data('type');
      const isDialog = $(this).closest('#folderChartMaxView').length;
      const $el = isDialog ? $('#folderChartMaxView .folderChartTime li[data-type=custom]') : $('.folderChartNavBox .folderChartTime li[data-type=custom]');

      $(this)
        .addClass('activeClass ThemeBorderColor3 ThemeBGColor3')
        .siblings('li')
        .removeClass();

      $(this)
        .siblings('.folderChartTimeTxt')
        .html(
          moment()
            .subtract(date, 'd')
            .format('YYYY/MM/DD') +
            ' - ' +
            moment().format('YYYY/MM/DD')
        );
      // 重新绑定自定义日期
      that.updateCustomFun($el, moment().subtract(date, 'd'));
      // 刷新图表
      that.updateTimeRefreshChart(
        isDialog,
        moment()
          .subtract(date, 'd')
          .format('YYYY-MM-DD'),
        moment().format('YYYY-MM-DD')
      );
    });

    // sort 排序修改
    $('body').on('click.folderChart', '.folderChartChargeSort', function () {
      $(this).toggleClass('icon-descending-order icon-ascending-order');
      const isDialog = $(this).closest('#folderChartMaxView').length;
      // 刷新图表
      that.updateSortRefreshChart(isDialog);
    });

    // 负责人切换
    $('body').on('click.folderChart', '.folderChartChargeBtn', function () {
      const $folderChartChargeList = $(this).siblings('.folderChartChargeList');
      if (!$folderChartChargeList.length) {
        that.getTaskCharges();
      } else {
        $folderChartChargeList.toggleClass('Hidden');
        if (!$folderChartChargeList.hasClass('Hidden')) {
          that.updateChargeSelect();
        }
      }
    });

    // 负责人全选
    $('body').on('click.folderChart', '.folderChartSelectAll', function () {
      $(this).toggleClass('ThemeBorderColor3 ThemeBGColor3');
      if ($(this).hasClass('ThemeBGColor3')) {
        $(this)
          .closest('.folderChartChargeList')
          .find('.folderChartSelect')
          .addClass('ThemeBorderColor3 ThemeBGColor3');
      } else {
        $(this)
          .closest('.folderChartChargeList')
          .find('.folderChartSelect')
          .removeClass('ThemeBorderColor3 ThemeBGColor3');
      }
    });

    // 负责人选中和取消选中
    $('body').on('click.folderChart', '.folderChartChargeLists .folderChartSelectBtn', function () {
      $(this).toggleClass('ThemeBorderColor3 ThemeBGColor3');
      const $List = $(this).closest('.folderChartChargeList');
      if ($List.find('.folderChartChargeLists .ThemeBGColor3').length === $List.find('.folderChartChargeLists li').length) {
        $List.find('.folderChartSelectAll').addClass('ThemeBorderColor3 ThemeBGColor3');
      } else {
        $List.find('.folderChartSelectAll').removeClass('ThemeBorderColor3 ThemeBGColor3');
      }
    });

    // 负责人清除按钮
    $('body').on('click.folderChart', '.folderChartChargeNo', () => {
      that.updateChargeSelect();
    });

    // 负责人确定按钮
    $('body').on('click.folderChart', '.folderChartChargeYes', function () {
      const $folderChartChargeList = $(this).closest('.folderChartChargeList');
      let isAuto = false;
      const chargeAccountIDs = [];
      const isDialog = $(this).closest('#folderChartMaxView').length;
      if (!$folderChartChargeList.find('.folderChartSelect.ThemeBGColor3').length) {
        alert(_l('请选择负责人!'));
        return false;
      }
      $folderChartChargeList.addClass('Hidden');

      // 全选选中
      if ($folderChartChargeList.find('.folderChartSelectAll.ThemeBGColor3').length) {
        isAuto = true;
      } else {
        $folderChartChargeList.find('.folderChartSelect.ThemeBGColor3').each((i, item) => {
          chargeAccountIDs.push($(item).attr('data-id'));
        });
      }

      // 处理title文本
      const txt = isAuto ? _l('所有负责人') : _l('已选择%0人', chargeAccountIDs.length);
      if (isDialog) {
        $('#folderChartMaxView .folderChartChargeTxt').html(txt);
      } else {
        $('.folderChartNavBox .folderChartChargeTxt').html(txt);
      }

      that.updateChargeRefreshChart(isAuto, chargeAccountIDs, isDialog);
    });

    // 点击放大chart
    $('#taskList').on('click', '.folderChartModel', function () {
      const $folderChartBoxTitle = $(this).siblings('.folderChartBoxTitle');
      const title = $folderChartBoxTitle.text();
      const tipTitle = $folderChartBoxTitle.find('span:last').attr('data-tip');
      const activeTime = $('#taskList')
        .find('.folderChartTimeTxt')
        .html();
      const activeBtn =
        $('#taskList')
          .find('.activeClass')
          .index() - 1;

      folderChartSettings.maxSort = folderChartSettings.sort;
      folderChartSettings.chartView =
        folderChartSettings.type === 4
          ? $(this).data('id')
          : parseInt(
              $(this)
                .attr('id')
                .replace(/\D/g, ''),
              10
            );
      folderChartSettings.isAutoMax = folderChartSettings.isAuto;
      folderChartSettings.chargeAccountIDsMax = folderChartSettings.chargeAccountIDs;

      that.folderChartMaxView({
        title,
        tipTitle,
        activeTime,
        activeBtn,
        type: folderChartSettings.type,
        sort: folderChartSettings.sort,
        isAuto: folderChartSettings.isAuto,
        chargeAccountIDs: folderChartSettings.chargeAccountIDs,
        listSize: folderChartSettings.data.length,
      });
    });

    // resize 重新渲染
    $(window).on('resize', () => {
      if (that.props.taskConfig.viewType === config.folderViewType.folderChart) {
        that.updateCharts();
      }
    });

    $(document).on('click.folderChart', (event) => {
      const $target = $(event.target);

      if (!$target.is($('.folderChartChargeBtn')) && !$target.parent().is($('.folderChartChargeBtn')) && !$target.closest('.folderChartChargeList').length) {
        $('.folderChartChargeList').addClass('Hidden');
      }
    });
  }

  componentWillUnmount() {
    $('body').off('.folderChart');
  }

  /**
   * 项目下任务统计请求数据
   */
  getDailyFolderStatistics(startDate = folderChartSettings.startDate, endDate = folderChartSettings.endDate, isDialog = false) {
    const { folderId } = this.props.taskConfig;

    ajaxRequest
      .getDailyFolderStatistics({
        folderID: folderId,
        startDate,
        endDate,
      })
      .then((source) => {
        if (isDialog) {
          this['folderCharts' + folderChartSettings.chartView]('folderChartsMax', source.data); // 渲染图表
        } else {
          folderChartSettings.data = source.data;
          this.updateCharts();
        }
      });
  }

  /**
   * 获取负责人数据
   */
  getTaskChargeStatistics(isAuto = folderChartSettings.isAuto, chargeAccountIDs = folderChartSettings.chargeAccountIDs, isDialog = false) {
    const { folderId } = this.props.taskConfig;

    ajaxRequest
      .getTaskChargeStatistics({
        folderID: folderId,
        isAuto,
        chargeAccountIDs: chargeAccountIDs,
      })
      .then((source) => {
        if (isDialog) {
          this['folderCharts' + folderChartSettings.chartView]('folderChartsMax', source.data); // 渲染图表
        } else {
          folderChartSettings.data = source.data;
          this.updateCharts();
        }
      });
  }

  /**
   * 获取看板数据
   */
  getFolderStageStatistics() {
    const { folderId } = this.props.taskConfig;

    ajaxRequest
      .getFolderStageStatistics({
        folderID: folderId,
      })
      .then((source) => {
        folderChartSettings.data = source.data;
        this.updateCharts();
      });
  }

  /**
   * 获取全部负责人
   */
  getTaskCharges() {
    const { folderId } = this.props.taskConfig;

    ajaxRequest
      .getTaskCharges({
        folderID: folderId,
      })
      .then((source) => {
        if (source.data) {
          const list = doT.template(chargeList)(source.data);
          if ($('#folderChartMaxView').length) {
            $('#folderChartMaxView .folderChartChargeBox').append(list);
          } else {
            $('.folderChartNavBox .folderChartChargeBox').append(list);
          }

          // 处理选中状态
          this.updateChargeSelect();
        }
      });
  }

  /**
   * 获取定义字段数据 饼图+柱状图
   */
  getCustomData() {
    const { folderId } = this.props.taskConfig;

    const getFolderControlsPieChart = ajaxRequest.getFolderControlsPieChart({
      folderID: folderId,
    });
    const getFolderControlsBarChart = ajaxRequest.getFolderControlsBarChart({
      folderID: folderId,
      startDate: folderChartSettings.startDate,
      endDate: folderChartSettings.endDate,
    });

    $.when(getFolderControlsPieChart, getFolderControlsBarChart).then((pieData, barData) => {
      if (pieData.code === 1 && barData.code === 1) {
        folderChartSettings.data = pieData.data.concat(barData.data);
        // 排序
        folderChartSettings.data.sort((a, b) => (a.row * 1000 + a.col > b.row * 1000 + b.col ? 1 : -1));
        $('#taskList .folderChartBox').html(doT.template(customDom)(folderChartSettings.data));
        this.updateCharts();
      }
    });
  }

  /**
   * 获取柱状图数据
   */
  getFolderControlsBarChart(startDate, endDate) {
    const { folderId } = this.props.taskConfig;

    ajaxRequest
      .getFolderControlsBarChart({
        folderID: folderId,
        startDate,
        endDate,
      })
      .then((source) => {
        if (source.code === 1) {
          this.folderChartsBar('folderChartsMax', _.find(source.data, 'controlId', folderChartSettings.chartView));
        }
      });
  }

  /**
   * 大视图
   */
  folderChartMaxView(data) {
    const content = doT.template(folderChartMaxView)(data);
    // 弹出层参数
    const dialogOpts = {
      dialogBoxID: 'folderChartMaxView',
      container: {
        header: '',
        yesText: null,
        noText: null,
        content,
      },
      width: 860,
      readyFn: () => {
        // 自定义字段
        if (folderChartSettings.type === 4) {
          const type = $('.folderChartModel[data-id=' + folderChartSettings.chartView + ']').data('type');
          const source = _.find(folderChartSettings.data, 'controlId', folderChartSettings.chartView);

          if (type === 9 || type === 10 || type === 11) {
            $('#maxViewUpdateTime').addClass('Hidden');
            // 渲染饼图
            this.folderChartsPie('folderChartsMax', source);
          } else {
            $('#maxViewUpdateTime').removeClass('Hidden');
            // 渲染柱状图
            this.folderChartsBar('folderChartsMax', source);
          }
        } else {
          const date = Math.floor((folderChartSettings.endDate - folderChartSettings.startDate) / 24 / 3600 / 1000);
          this.updateCustomFun($('#folderChartMaxView .folderChartTime li[data-type=custom]'), moment().subtract(date, 'd'));
          // 渲染图表
          this['folderCharts' + folderChartSettings.chartView]('folderChartsMax');
        }
      },
    };

    $.DialogLayer(dialogOpts);
  }

  folderCharts1(id = 'folderCharts1', source = folderChartSettings.data) {
    const myChart = echarts.init($('#' + id)[0], 'customed');
    const xAxisData = [];
    const seriesAmountData = [];
    const seriesCompleteData = [];
    for (const item of source) {
      if (source.length === 7) {
        xAxisData.push(moment(item.date).format('MM/DD ddd'));
      } else {
        xAxisData.push(moment(item.date).format('MM/DD'));
      }
      seriesAmountData.push(item.underway);
      seriesCompleteData.push(item.completed);
    }
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: 'transparent',
          },
        },
      },
      toolbox: { show: true },
      legend: {
        data: [{ name: _l('未完成'), icon: 'pin' }, { name: _l('已完成'), icon: 'pin' }],
        align: 'left',
        bottom: 0,
      },
      grid: {
        top: 10,
        left: 10,
        right: 10,
        bottom: 35,
        containLabel: true,
      },
      color: ['#0091ea', '#ddd'],
      xAxis: [
        {
          type: 'category',
          data: xAxisData,
          axisLine: { show: true },
          axisTick: { show: false },
          splitLine: { show: false },
        },
      ],
      yAxis: [
        {
          type: 'value',
          splitLine: {
            lineStyle: { type: 'dashed' },
          },
          axisLine: { show: false },
          axisTick: { show: false },
          splitNumber: 4,
          minInterval: 1,
        },
      ],
      series: [
        {
          name: _l('未完成'),
          type: 'bar',
          barWidth: '40%',
          stack: 'true',
          data: seriesAmountData,
        },
        {
          name: _l('已完成'),
          type: 'bar',
          stack: 'true',
          data: seriesCompleteData,
        },
      ],
    };
    myChart.setOption(option);
  }

  folderCharts2(id = 'folderCharts2', source = folderChartSettings.data) {
    const myChart = echarts.init($('#' + id)[0], 'customed');
    const xAxisData = [];
    const seriesUnderwayNData = [];
    const seriesUnderwayAData = [];
    const seriesUnderwayUData = [];
    for (const item of source) {
      xAxisData.push(moment(item.date).format('MM/DD'));
      seriesUnderwayNData.push(item.underway_N);
      seriesUnderwayAData.push(item.underway_A);
      seriesUnderwayUData.push(item.underway_U);
    }
    const option = {
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: [_l('正常'), _l('逾期'), _l('未设置')],
        bottom: 0,
      },
      grid: {
        top: 10,
        left: 10,
        right: 20,
        bottom: 35,
        containLabel: true,
      },
      color: ['#22c3aa', '#626c91', '#ddd'],
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: xAxisData,
          axisLine: { show: true },
          axisTick: { show: false },
          splitLine: { show: false },
        },
      ],
      yAxis: [
        {
          type: 'value',
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: {
            lineStyle: { type: 'dashed' },
          },
          splitNumber: 4,
          minInterval: 1,
        },
      ],
      series: [
        {
          name: _l('正常'),
          type: 'line',
          stack: _l('正常'),
          areaStyle: {
            normal: {
              opacity: 0.3,
            },
          },
          data: seriesUnderwayNData,
        },
        {
          name: _l('逾期'),
          type: 'line',
          stack: _l('逾期'),
          areaStyle: {
            normal: {
              opacity: 0.2,
            },
          },
          data: seriesUnderwayAData,
        },
        {
          name: _l('未设置'),
          type: 'line',
          stack: _l('未设置'),
          areaStyle: {
            normal: {
              opacity: 0.1,
            },
          },
          data: seriesUnderwayUData,
        },
      ],
    };
    myChart.setOption(option);
  }

  folderCharts3(id = 'folderCharts3', source = folderChartSettings.data) {
    const myChart = echarts.init($('#' + id)[0], 'customed');
    const xAxisData = [];
    const seriesCompletedNData = [];
    const seriesCompletedAData = [];
    const seriesCompletedUData = [];
    for (const item of source) {
      xAxisData.push(moment(item.date).format('MM/DD'));
      seriesCompletedNData.push(item.completed_N);
      seriesCompletedAData.push(item.completed_A);
      seriesCompletedUData.push(item.completed_U);
    }
    const option = {
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: [_l('按时'), _l('逾期'), _l('未设置')],
        bottom: 0,
      },
      grid: {
        top: 10,
        left: 10,
        right: 20,
        bottom: 35,
        containLabel: true,
      },
      color: ['#0091ea', '#626c91', '#ddd'],
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: xAxisData,
          axisLine: { show: true },
          axisTick: { show: false },
          splitLine: { show: false },
        },
      ],
      yAxis: [
        {
          type: 'value',
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: {
            lineStyle: { type: 'dashed' },
          },
          splitNumber: 4,
          minInterval: 1,
        },
      ],
      series: [
        {
          name: _l('按时'),
          type: 'line',
          stack: _l('按时'),
          areaStyle: {
            normal: {
              opacity: 0.3,
            },
          },
          data: seriesCompletedNData,
        },
        {
          name: _l('逾期'),
          type: 'line',
          stack: _l('逾期'),
          areaStyle: {
            normal: {
              opacity: 0.2,
            },
          },
          data: seriesCompletedAData,
        },
        {
          name: _l('未设置'),
          type: 'line',
          stack: _l('未设置'),
          areaStyle: {
            normal: {
              opacity: 0.1,
            },
          },
          data: seriesCompletedUData,
        },
      ],
    };
    myChart.setOption(option);
  }

  folderCharts4(id = 'folderCharts4', source = folderChartSettings.data) {
    const myChart = echarts.init($('#' + id)[0], 'customed');
    const xAxisData = [];
    const seriesTimespanData = [];
    const seriesTimespanUndData = [];
    const seriesTimespanComData = [];
    for (const item of source) {
      xAxisData.push(moment(item.date).format('MM/DD'));
      seriesTimespanData.push(this.updateChartTime(item.timespan));
      seriesTimespanUndData.push(this.updateChartTime(item.timespan_Und));
      seriesTimespanComData.push(this.updateChartTime(item.timespan_Com));
    }
    const option = {
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: [_l('总时间'), _l('未完成'), _l('已完成')],
        bottom: 0,
      },
      grid: {
        top: 10,
        left: 10,
        right: 20,
        bottom: 35,
        containLabel: true,
      },
      color: ['#0091ea', '#22c3aa', '#ddd'],
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: xAxisData,
          axisLine: { show: true },
          axisTick: { show: false },
          splitLine: { show: false },
        },
      ],
      yAxis: [
        {
          type: 'value',
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: {
            lineStyle: { type: 'dashed' },
          },
          splitNumber: 4,
          minInterval: 1,
        },
      ],
      series: [
        {
          name: _l('总时间'),
          type: 'line',
          stack: _l('总时间'),
          data: seriesTimespanData,
        },
        {
          name: _l('未完成'),
          type: 'line',
          stack: _l('未完成'),
          data: seriesTimespanUndData,
        },
        {
          name: _l('已完成'),
          type: 'line',
          stack: _l('已完成'),
          data: seriesTimespanComData,
        },
      ],
    };
    myChart.setOption(option);
  }

  folderCharts5(id = 'folderCharts5', source = folderChartSettings.data) {
    const myChart = echarts.init($('#' + id)[0], 'customed');
    const xAxisData = [];
    const seriesNewTaskData = [];
    const seriesCompleteTaskData = [];
    for (const item of source) {
      if (source.length === 7) {
        xAxisData.push(moment(item.date).format('MM/DD ddd'));
      } else {
        xAxisData.push(moment(item.date).format('MM/DD'));
      }
      seriesNewTaskData.push(item.newTasks);
      seriesCompleteTaskData.push(item.completedTasks);
    }
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: 'transparent',
          },
        },
      },
      legend: {
        data: [{ name: _l('新增'), icon: 'pin' }, { name: _l('已完成'), icon: 'pin' }],
        align: 'left',
        bottom: 0,
      },
      grid: {
        top: 10,
        left: 10,
        right: 10,
        bottom: 35,
        containLabel: true,
      },
      color: ['#22c3aa', '#ddd'],
      xAxis: [
        {
          type: 'category',
          data: xAxisData,
          axisLine: { show: true },
          axisTick: { show: false },
          splitLine: { show: false },
        },
      ],
      yAxis: [
        {
          type: 'value',
          splitLine: {
            lineStyle: { type: 'dashed' },
          },
          axisLine: { show: false },
          axisTick: { show: false },
          splitNumber: 4,
          minInterval: 1,
        },
      ],
      series: [
        {
          name: _l('新增'),
          type: 'bar',
          barWidth: '40%',
          stack: 'true',
          data: seriesNewTaskData,
        },
        {
          name: _l('已完成'),
          type: 'bar',
          stack: 'true',
          data: seriesCompleteTaskData,
        },
      ],
    };
    myChart.setOption(option);
  }

  folderCharts6(id = 'folderCharts6', source = folderChartSettings.data) {
    const myChart = echarts.init($('#' + id)[0], 'customed');
    const xAxisData = [];
    const seriesMemberAmountData = [];
    for (const item of source) {
      xAxisData.push(moment(item.date).format('MM/DD'));
      seriesMemberAmountData.push(item.memberAmount);
    }
    const option = {
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: [_l('人数')],
        bottom: 0,
      },
      grid: {
        top: 10,
        left: 10,
        right: 20,
        bottom: 35,
        containLabel: true,
      },
      color: ['#626c91'],
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: xAxisData,
          axisLine: { show: true },
          axisTick: { show: false },
          splitLine: { show: false },
        },
      ],
      yAxis: [
        {
          type: 'value',
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: {
            lineStyle: { type: 'dashed' },
          },
          splitNumber: 4,
          minInterval: 1,
        },
      ],
      series: [
        {
          name: _l('人数'),
          type: 'line',
          data: seriesMemberAmountData,
        },
      ],
    };
    myChart.setOption(option);
  }

  folderCharts13(id = 'folderCharts13', source = folderChartSettings.data) {
    const myChart = echarts.init($('#' + id)[0], 'customed');
    const xAxisData = [];
    const seriesTimespanBurnDownData = [];
    for (const item of source) {
      xAxisData.push(moment(item.date).format('MM/DD'));
      seriesTimespanBurnDownData.push(item.timespan_BurnDown);
    }
    const option = {
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: [_l('所有未完成任务的总剩余时间')],
        bottom: 0,
      },
      grid: {
        top: 10,
        left: 10,
        right: 20,
        bottom: 35,
        containLabel: true,
      },
      color: ['#626c91'],
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: xAxisData,
          axisLine: { show: true },
          axisTick: { show: false },
          splitLine: { show: false },
        },
      ],
      yAxis: [
        {
          type: 'value',
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: {
            lineStyle: { type: 'dashed' },
          },
          splitNumber: 4,
          minInterval: 1,
        },
      ],
      series: [
        {
          name: _l('所有未完成任务的总剩余时间'),
          type: 'line',
          data: seriesTimespanBurnDownData,
        },
      ],
    };

    myChart.setOption(option);
  }

  folderCharts14(id = 'folderCharts14', source = folderChartSettings.data) {
    const myChart = echarts.init($('#' + id)[0], 'customed');
    const xAxisData = [];
    const seriesNotStarted = [];
    const seriesNotStarted_A = [];
    for (const item of source) {
      xAxisData.push(moment(item.date).format('MM/DD'));
      seriesNotStarted.push(item.notStarted);
      seriesNotStarted_A.push(item.notStarted_A);
    }
    const option = {
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: [_l('未开始'), _l('延期未开始')],
        bottom: 0,
      },
      grid: {
        top: 10,
        left: 10,
        right: 20,
        bottom: 35,
        containLabel: true,
      },
      color: ['#22c3aa', '#626c91', '#ddd'],
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: xAxisData,
          axisLine: { show: true },
          axisTick: { show: false },
          splitLine: { show: false },
        },
      ],
      yAxis: [
        {
          type: 'value',
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: {
            lineStyle: { type: 'dashed' },
          },
          splitNumber: 4,
          minInterval: 1,
        },
      ],
      series: [
        {
          name: _l('未开始'),
          type: 'line',
          data: seriesNotStarted,
        },
        {
          name: _l('延期未开始'),
          type: 'line',
          data: seriesNotStarted_A,
        },
      ],
    };

    myChart.setOption(option);
  }

  folderCharts15(id = 'folderCharts15', source = folderChartSettings.data) {
    const myChart = echarts.init($('#' + id)[0], 'customed');
    const xAxisData = [];
    const seriesGoing = [];
    const seriesGoing_U = [];
    const seriesGoing_A = [];
    for (const item of source) {
      xAxisData.push(moment(item.date).format('MM/DD'));
      seriesGoing_U.push(item.going_U);
      seriesGoing.push(item.going - item.going_U - item.going_A);
      seriesGoing_A.push(item.going_A);
    }
    const option = {
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: [_l('未设置'), _l('正常'), _l('逾期')],
        bottom: 0,
      },
      grid: {
        top: 10,
        left: 10,
        right: 20,
        bottom: 35,
        containLabel: true,
      },
      color: ['#22c3aa', '#626c91', '#ddd'],
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: xAxisData,
          axisLine: { show: true },
          axisTick: { show: false },
          splitLine: { show: false },
        },
      ],
      yAxis: [
        {
          type: 'value',
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: {
            lineStyle: { type: 'dashed' },
          },
          splitNumber: 4,
          minInterval: 1,
        },
      ],
      series: [
        {
          name: _l('未设置'),
          type: 'line',
          data: seriesGoing_U,
        },
        {
          name: _l('正常'),
          type: 'line',
          data: seriesGoing,
        },
        {
          name: _l('逾期'),
          type: 'line',
          data: seriesGoing_A,
        },
      ],
    };

    myChart.setOption(option);
  }

  folderCharts7(id = 'folderCharts7', source = folderChartSettings.data) {
    const myChart = echarts.init($('#' + id)[0], 'customed');
    const yAxisData = [];
    const seriesAmountData = [];
    const seriesCompleteData = [];
    // 数据排序
    source = this.dataDisposeFun(this.dataSortFun('amount', source));

    for (const item of source) {
      yAxisData.push(filterXss(item.fullName).substr(0, 10));
      seriesAmountData.push(item.underway);
      seriesCompleteData.push(item.completed);
    }
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: 'transparent',
          },
        },
      },
      legend: {
        data: [{ name: _l('未完成'), icon: 'pin' }, { name: _l('已完成'), icon: 'pin' }],
        align: 'left',
        bottom: 0,
      },
      grid: {
        top: 0,
        left: 10,
        right: 20,
        bottom: 35,
        containLabel: true,
      },
      color: ['#0091ea', '#ddd'],
      xAxis: [
        {
          type: 'value',
          position: 'top',
          splitLine: {
            lineStyle: { type: 'dashed' },
          },
          axisTick: { show: false },
          splitNumber: 4,
          minInterval: 1,
        },
      ],
      yAxis: [
        {
          type: 'category',
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          data: yAxisData,
        },
      ],
      series: [
        {
          name: _l('未完成'),
          type: 'bar',
          barWidth: '40%',
          stack: 'true',
          data: seriesAmountData,
        },
        {
          name: _l('已完成'),
          type: 'bar',
          stack: 'true',
          data: seriesCompleteData,
        },
      ],
    };
    myChart.setOption(option);
  }

  folderCharts8(id = 'folderCharts8', source = folderChartSettings.data) {
    const myChart = echarts.init($('#' + id)[0], 'customed');
    const yAxisData = [];
    const seriesCompletedNData = [];
    // 数据排序
    source = this.dataDisposeFun(this.dataSortFun('completed_N', source));

    for (const item of source) {
      yAxisData.push(filterXss(item.fullName).substr(0, 10));
      seriesCompletedNData.push(item.completed_N);
    }
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: 'transparent',
          },
        },
      },
      legend: {
        data: [{ name: _l('按时完成任务数'), icon: 'pin' }],
        align: 'left',
        bottom: 0,
      },
      grid: {
        top: 0,
        left: 10,
        right: 20,
        bottom: 35,
        containLabel: true,
      },
      color: ['#0091ea'],
      xAxis: [
        {
          type: 'value',
          position: 'top',
          splitLine: {
            lineStyle: { type: 'dashed' },
          },
          axisTick: { show: false },
          splitNumber: 4,
          minInterval: 1,
        },
      ],
      yAxis: [
        {
          type: 'category',
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          data: yAxisData,
        },
      ],
      series: [
        {
          name: _l('按时完成任务数'),
          type: 'bar',
          barWidth: '40%',
          stack: 'true',
          data: seriesCompletedNData,
        },
      ],
    };
    myChart.setOption(option);
  }

  folderCharts9(id = 'folderCharts9', source = folderChartSettings.data) {
    const myChart = echarts.init($('#' + id)[0], 'customed');
    const yAxisData = [];
    const seriesUnderwayANData = [];
    const seriesCompletedANData = [];
    // 数据排序
    source = this.dataDisposeFun(this.dataSortFun('underway_A', source));

    for (const item of source) {
      yAxisData.push(filterXss(item.fullName).substr(0, 10));
      seriesUnderwayANData.push(item.underway_A);
      seriesCompletedANData.push(item.completed_A);
    }
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: 'transparent',
          },
        },
      },
      legend: {
        data: [{ name: _l('未完成'), icon: 'pin' }, { name: _l('已完成'), icon: 'pin' }],
        align: 'left',
        bottom: 0,
      },
      grid: {
        top: 0,
        left: 10,
        right: 20,
        bottom: 35,
        containLabel: true,
      },
      color: ['#0091ea', '#ddd'],
      xAxis: [
        {
          type: 'value',
          position: 'top',
          splitLine: {
            lineStyle: { type: 'dashed' },
          },
          axisTick: { show: false },
          splitNumber: 4,
          minInterval: 1,
        },
      ],
      yAxis: [
        {
          type: 'category',
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          data: yAxisData,
        },
      ],
      series: [
        {
          name: _l('未完成'),
          type: 'bar',
          barWidth: '40%',
          stack: 'true',
          data: seriesUnderwayANData,
        },
        {
          name: _l('已完成'),
          type: 'bar',
          stack: 'true',
          data: seriesCompletedANData,
        },
      ],
    };
    myChart.setOption(option);
  }

  folderCharts10(id = 'folderCharts10', source = folderChartSettings.data) {
    const myChart = echarts.init($('#' + id)[0], 'customed');
    const yAxisData = [];
    const seriesTimespanUndNData = [];
    const seriesTimespanComData = [];
    // 数据排序
    source = this.dataDisposeFun(this.dataSortFun('timespan_Und', source));

    for (const item of source) {
      yAxisData.push(filterXss(item.fullName).substr(0, 10));
      seriesTimespanUndNData.push(this.updateChartTime(item.timespan_Und));
      seriesTimespanComData.push(this.updateChartTime(item.timespan_Com));
    }
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: 'transparent',
          },
        },
      },
      legend: {
        data: [{ name: _l('未完成'), icon: 'pin' }, { name: _l('已完成'), icon: 'pin' }],
        align: 'left',
        bottom: 0,
      },
      grid: {
        top: 0,
        left: 10,
        right: 20,
        bottom: 35,
        containLabel: true,
      },
      color: ['#0091ea', '#ddd'],
      xAxis: [
        {
          type: 'value',
          position: 'top',
          splitLine: {
            lineStyle: { type: 'dashed' },
          },
          axisTick: { show: false },
          splitNumber: 4,
          minInterval: 1,
        },
      ],
      yAxis: [
        {
          type: 'category',
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          data: yAxisData,
        },
      ],
      series: [
        {
          name: _l('未完成'),
          type: 'bar',
          barWidth: '40%',
          stack: 'true',
          data: seriesTimespanUndNData,
        },
        {
          name: _l('已完成'),
          type: 'bar',
          stack: 'true',
          data: seriesTimespanComData,
        },
      ],
    };
    myChart.setOption(option);
  }

  folderCharts11(id = 'folderCharts11', source = folderChartSettings.data) {
    const myChart = echarts.init($('#' + id)[0], 'customed');
    const yAxisData = [];
    const seriesCompletedTimeAvgData = [];
    // 数据排序
    source = this.dataDisposeFun(this.dataSortFun('completedTimeAvg', source));

    for (const item of source) {
      yAxisData.push(filterXss(item.fullName).substr(0, 10));
      seriesCompletedTimeAvgData.push(this.updateChartTime(item.completedTimeAvg));
    }
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: 'transparent',
          },
        },
      },
      legend: {
        data: [{ name: _l('已完成'), icon: 'pin' }],
        align: 'left',
        bottom: 0,
      },
      grid: {
        top: 0,
        left: 10,
        right: 20,
        bottom: 35,
        containLabel: true,
      },
      color: ['#22c3aa'],
      xAxis: [
        {
          type: 'value',
          position: 'top',
          splitLine: {
            lineStyle: { type: 'dashed' },
          },
          axisTick: { show: false },
          splitNumber: 4,
          minInterval: 1,
        },
      ],
      yAxis: [
        {
          type: 'category',
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          data: yAxisData,
        },
      ],
      series: [
        {
          name: _l('已完成'),
          type: 'bar',
          barWidth: '40%',
          stack: 'true',
          data: seriesCompletedTimeAvgData,
        },
      ],
    };
    myChart.setOption(option);
  }

  folderCharts12(id = 'folderCharts12') {
    const myChart = echarts.init($('#' + id)[0], 'customed');
    const xAxisData = [];
    const seriesUnderwayData = [];
    const seriesCompleteData = [];
    for (const item of folderChartSettings.data.stages) {
      xAxisData.push(item.stageName);
      seriesUnderwayData.push(item.sUnderway);
      seriesCompleteData.push(item.sCompleted);
    }

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: 'transparent',
          },
        },
      },
      legend: {
        data: [{ name: _l('未完成'), icon: 'pin' }, { name: _l('已完成'), icon: 'pin' }],
        align: 'left',
        bottom: 0,
      },
      grid: {
        top: 10,
        left: 10,
        right: 10,
        bottom: 35,
        containLabel: true,
      },
      color: ['#0091ea', '#ddd'],
      xAxis: [
        {
          type: 'category',
          data: xAxisData,
          axisLine: { show: true },
          axisTick: { show: false },
          splitLine: { show: false },
        },
      ],
      yAxis: [
        {
          type: 'value',
          splitLine: {
            lineStyle: { type: 'dashed' },
          },
          axisLine: { show: false },
          axisTick: { show: false },
          splitNumber: 4,
          minInterval: 1,
        },
      ],
      series: [
        {
          name: _l('未完成'),
          type: 'bar',
          barWidth: '40%',
          stack: 'true',
          data: seriesUnderwayData,
        },
        {
          name: _l('已完成'),
          type: 'bar',
          stack: 'true',
          data: seriesCompleteData,
        },
      ],
    };

    myChart.setOption(option);
  }

  folderChartsPie(id, source) {
    const myChart = echarts.init($('#' + id)[0], 'customed');
    const legendData = [];
    const seriesData = [];
    for (const item of source.options) {
      const name = item.name.length > 6 && id !== 'folderChartsMax' ? item.name.substring(0, 5) + '...' : item.name;
      legendData.push({ name, icon: 'pin' });
      seriesData.push({ name, value: item.count });
    }

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)',
      },
      legend: {
        orient: 'horizontal',
        bottom: 0,
        data: legendData,
      },
      series: [
        {
          name: source.controlName,
          type: 'pie',
          radius: '40%',
          center: ['50%', '45%'],
          data: seriesData,
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };
    myChart.setOption(option);
  }

  folderChartsBar(id, source) {
    const myChart = echarts.init($('#' + id)[0], 'customed');
    const xAxisData = [];
    const seriesUnderwayData = [];
    const seriesCompleteData = [];
    for (const item of source.dailyStatistics) {
      if (source.dailyStatistics.length === 7) {
        xAxisData.push(moment(item.date).format('MM/DD ddd'));
      } else {
        xAxisData.push(moment(item.date).format('MM/DD'));
      }
      seriesUnderwayData.push(item.underway_Sum);
      seriesCompleteData.push(item.completed_Sum);
    }
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: 'transparent',
          },
        },
      },
      toolbox: { show: true },
      legend: {
        data: [{ name: _l('未完成'), icon: 'pin' }, { name: _l('已完成'), icon: 'pin' }],
        align: 'left',
        bottom: 0,
      },
      grid: {
        top: 10,
        left: 10,
        right: 10,
        bottom: 35,
        containLabel: true,
      },
      color: ['#0091ea', '#ddd'],
      xAxis: [
        {
          type: 'category',
          data: xAxisData,
          axisLine: { show: true },
          axisTick: { show: false },
          splitLine: { show: false },
        },
      ],
      yAxis: [
        {
          type: 'value',
          splitLine: {
            lineStyle: { type: 'dashed' },
          },
          axisLine: { show: false },
          axisTick: { show: false },
          splitNumber: 4,
          minInterval: 1,
        },
      ],
      series: [
        {
          name: _l('未完成'),
          type: 'bar',
          barWidth: '40%',
          stack: 'true',
          data: seriesUnderwayData,
        },
        {
          name: _l('已完成'),
          type: 'bar',
          stack: 'true',
          data: seriesCompleteData,
        },
      ],
    };
    myChart.setOption(option);
  }

  folderChartsCustom() {
    $('.folderChartBoxModel .folderChartModel[data-model=custom]').map((i, item) => {
      const id = $(item).data('id');
      const type = $(item).data('type');
      const source = _.find(folderChartSettings.data, 'controlId', id);

      if (type === 9 || type === 10 || type === 11) {
        this.folderChartsPie('folderCharts_' + id, source);
      } else {
        this.folderChartsBar('folderCharts_' + id, source);
      }
    });
  }

  /**
   * 自定义日期
   */
  updateCustomFun($el = $('.folderChartNavBox .folderChartTime li[data-type=custom]'), startDate = moment().subtract(6, 'd')) {
    const that = this;
    const options = {
      parentEl: $('#folderChartMaxView').length ? '#folderChartMaxView .folderChartBox' : '.folderChartNavBox',
      template: datePickerTpl.double,
      linkedCalendars: false,
      startDate,
      minDate: '2010-01-01',
      maxDate: moment(),
      showDropdowns: true,
      buttonClasses: 'taskFolerChartDatePicker',
      opens: 'left',
      locale: {
        format: 'YYYY/MM/DD', // 定义显示格式
        applyLabel: _l('确定'),
        cancelLabel: _l('关闭'),
        fromLabel: _l('开始时间'),
        toLabel: _l('结束时间'),
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6].map((item) => {
          return moment()
            .day(item)
            .format('dd');
        }),
        monthNames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((item) => {
          return moment()
            .month(item)
            .format('MMM');
        }),
        firstDay: 1,
      },
    };
    const callback = function (start, end) {
      let index = 3;
      const timeDiff = Math.floor((end - start) / 24 / 3600 / 1000);
      const isDialog = $el.closest('#folderChartMaxView').length;

      $el.siblings('.folderChartTimeTxt').html(start.format('YYYY/MM/DD') + ' - ' + end.format('YYYY/MM/DD'));
      if (timeDiff === 7) {
        index = 0;
      } else if (timeDiff === 14) {
        index = 1;
      } else if (timeDiff === 30) {
        index = 2;
      }
      $el
        .siblings('li')
        .removeClass()
        .eq(index)
        .addClass('activeClass ThemeBGColor3 ThemeBorderColor3');

      // 刷新图表
      that.updateTimeRefreshChart(isDialog, start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'));
    };
    $el.daterangepicker(options, callback);

    $el.on('show.daterangepicker', (evt) => {
      if (!$(evt.target).siblings('.activeClass').length) {
        $(evt.target).addClass('activeClass ThemeBGColor3 ThemeBorderColor3');
      }
    });

    $el.on('hide.daterangepicker', (evt) => {
      if (!$(evt.target).hasClass('ThemeBGColor3')) {
        $(evt.target).removeClass();
      }
      if (!$(evt.target).siblings('.activeClass').length) {
        $(evt.target).addClass('activeClass ThemeBGColor3 ThemeBorderColor3');
      }
    });
  }

  /**
   * 刷新charts
   */
  updateCharts() {
    if (this.props.taskConfig.viewType !== config.folderViewType.folderChart) {
      return;
    }

    // 任务统计
    if (folderChartSettings.type === 1) {
      this.folderCharts1();
      this.folderCharts2();
      this.folderCharts3();
      this.folderCharts4();
      this.folderCharts5();
      this.folderCharts6();
      this.folderCharts13();
      this.folderCharts14();
      this.folderCharts15();
    } else if (folderChartSettings.type === 2) {
      // 按负责人
      this.folderCharts7();
      this.folderCharts8();
      this.folderCharts9();
      this.folderCharts10();
      this.folderCharts11();
    } else if (folderChartSettings.type === 3) {
      // 按看板
      this.folderCharts12();
    } else if (folderChartSettings.type === 4) {
      // 自定义字段
      this.folderChartsCustom();
    }
  }

  /**
   * 日期切换刷新图表
   */
  updateTimeRefreshChart(isDialog, startDate, endDate) {
    if (!isDialog) {
      folderChartSettings.startDate = startDate;
      folderChartSettings.endDate = endDate;
      // 任务统计
      if (folderChartSettings.type === 1) {
        this.getDailyFolderStatistics();
      } else if (folderChartSettings.type === 4) {
        // 自定义字段 饼图+柱状图数据
        this.getCustomData();
      }
    } else {
      // 任务统计
      if (folderChartSettings.type === 1) {
        this.getDailyFolderStatistics(startDate, endDate, isDialog);
      } else if (folderChartSettings.type === 4) {
        // 自定义字段柱状图更新
        this.getFolderControlsBarChart(startDate, endDate);
      }
    }
  }

  /**
   * 排序刷新图表
   */
  updateSortRefreshChart(isDialog) {
    if (!isDialog) {
      folderChartSettings.sort = folderChartSettings.sort === 'desc' ? 'asc' : 'desc';
      this.updateCharts();
    } else {
      folderChartSettings.maxSort = folderChartSettings.maxSort === 'desc' ? 'asc' : 'desc';
      this['folderCharts' + folderChartSettings.chartView]('folderChartsMax');
    }
  }

  /**
   * 更改负责人刷新图表
   */
  updateChargeRefreshChart(isAuto, chargeAccountIDs, isDialog) {
    if (!isDialog) {
      folderChartSettings.isAuto = isAuto;
      folderChartSettings.chargeAccountIDs = chargeAccountIDs;
      this.getTaskChargeStatistics();
    } else {
      folderChartSettings.isAutoMax = isAuto;
      folderChartSettings.chargeAccountIDsMax = chargeAccountIDs;
      this.getTaskChargeStatistics(isAuto, chargeAccountIDs, isDialog);
    }
  }

  /**
   * 数据呈现个数处理
   */
  dataDisposeFun(source, sourceLength = 5) {
    if (source.length <= sourceLength || $('#folderChartMaxView').length) {
      return source;
    }
    return source.slice(source.length - sourceLength);
  }

  /**
   * 数据排序处理
   */
  dataSortFun(columnName, source) {
    // 降序    图表数据数组最早的在最下面
    const dataDescFun = () => {
      return source.sort((a, b) => {
        return a[columnName] > b[columnName] ? 1 : -1;
      });
    };
    // 升序     图表数据数组最早的在最下面
    const dataAscFun = () => {
      return source.sort((a, b) => {
        return a[columnName] > b[columnName] ? -1 : 1;
      });
    };
    if ($('#folderChartMaxView').length) {
      if (folderChartSettings.maxSort === 'desc') {
        return dataDescFun();
      } else if (folderChartSettings.maxSort === 'asc') {
        return dataAscFun();
      }
    }

    if (folderChartSettings.sort === 'desc') {
      return dataDescFun();
    } else if (folderChartSettings.sort === 'asc') {
      return dataAscFun();
    }
  }

  /**
   * 处理负责人选中未选中
   */
  updateChargeSelect() {
    const isDialog = $('#folderChartMaxView').length;
    let ids;
    if (isDialog) {
      $('#folderChartMaxView .folderChartSelect').toggleClass('ThemeBorderColor3 ThemeBGColor3', folderChartSettings.isAutoMax);
      if (!folderChartSettings.isAutoMax) {
        for (ids of folderChartSettings.chargeAccountIDsMax) {
          $('#folderChartMaxView .folderChartSelect[data-id=' + ids + ']').addClass('ThemeBorderColor3 ThemeBGColor3');
        }
      }
    } else {
      $('.folderChartNavBox .folderChartSelect').toggleClass('ThemeBorderColor3 ThemeBGColor3', folderChartSettings.isAuto);
      if (!folderChartSettings.isAuto) {
        for (ids of folderChartSettings.chargeAccountIDs) {
          $('.folderChartNavBox .folderChartSelect[data-id=' + ids + ']').addClass('ThemeBorderColor3 ThemeBGColor3');
        }
      }
    }
  }

  /**
   * 处理时间向上取值
   */
  updateChartTime(time) {
    return Math.floor(time / 24);
  }

  render() {
    return <div id="taskList" />;
  }
}

export default connect(state => state.task)(FolderChart);
