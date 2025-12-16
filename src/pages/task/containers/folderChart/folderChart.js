import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { connect } from 'react-redux';
import doT from 'dot';
import _ from 'lodash';
import moment from 'moment';
import filterXss from 'xss';
import { Icon } from 'ming-ui';
import { Dialog, LoadDiv } from 'ming-ui';
import ajaxRequest from 'src/api/taskFolderStatistics';
import DateFilter from 'src/components/DateFilter';
import config from '../../config/config';
import { listLoadingContent } from '../../utils/taskComm';
import chargeList from './tpl/chargeList.html';
import customDom from './tpl/customDom.html';
import folderChart from './tpl/folderChart.html';
import folderChartMaxView from './tpl/folderChartMaxView.html';
import './css/folderChart.less';

const loading = renderToString(<LoadDiv />);

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

let rootFolderChartTime;
let rootMaxViewUpdateTime;

class FolderChart extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    import('@antv/g2plot').then(data => {
      this.Column = data.Column;
      this.Pie = data.Pie;

      this.init();
      this.bindEvents();
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.taskConfig.folderId && nextProps.taskConfig.folderId !== this.props.taskConfig.folderId) {
      setTimeout(() => {
        this.init();
      }, 0);
    }
  }

  componentWillUnmount() {
    $('body').off('.folderChart');

    delete window.feedSelectDate;
    delete window.feedCustomDate;
    rootFolderChartTime && rootFolderChartTime.unmount();
  }

  /**
   * 初始化
   */
  init() {
    listLoadingContent(1);

    folderChartSettings.type = 1;
    folderChartSettings.data = '';
    folderChartSettings.startDate = moment().subtract(6, 'd').format('YYYY-MM-DD');
    folderChartSettings.endDate = moment().format('YYYY-MM-DD');
    folderChartSettings.isAuto = true;
    folderChartSettings.chargeAccountIDs = [];
    folderChartSettings.sort = 'desc';

    const { folderId, viewType } = this.props.taskConfig;

    ajaxRequest
      .getFolderStatisticsNow({
        folderID: folderId,
      })
      .then(source => {
        if (viewType !== config.folderViewType.folderChart) {
          return;
        }

        $('#taskList').html(
          doT.template(folderChart)({
            isFirst: true,
            type: folderChartSettings.type,
            data: source.data,
            timeTxt: moment().subtract(6, 'd').format('YYYY/MM/DD') + ' - ' + moment().format('YYYY/MM/DD'),
            loading,
          }),
        );

        this.getDailyFolderStatistics();
        this.renderCustomTime();
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
          $(this).addClass('active ThemeColor3 ThemeBorderColor3').siblings().removeClass();

          folderChartSettings.type = $(this).index() + 1;
          $('#taskList .folderChartBox').html(
            doT.template(folderChart)({
              type: folderChartSettings.type,
              loading,
            }),
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
      '.folderChartNavBox .folderChartNav li:not(.active)',
    );

    // 日期切换
    $('body').on('click.folderChart', '.folderChartTime li:not(.activeClass):not([data-type=custom])', function () {
      const date = $(this).data('type');
      const isDialog = $(this).closest('.folderChartMaxView').length;

      $(this).addClass('activeClass ThemeBorderColor3 ThemeBGColor3').siblings('li').removeClass();

      $(this)
        .siblings('.folderChartTimeTxt')
        .html(moment().subtract(date, 'd').format('YYYY/MM/DD') + ' - ' + moment().format('YYYY/MM/DD'));

      // 刷新图表
      that.updateTimeRefreshChart(
        isDialog,
        moment().subtract(date, 'd').format('YYYY-MM-DD'),
        moment().format('YYYY-MM-DD'),
      );
    });

    // sort 排序修改
    $('body').on('click.folderChart', '.folderChartChargeSort', function () {
      $(this).toggleClass('icon-descending-order icon-ascending-order');
      const isDialog = $(this).closest('.folderChartMaxView').length;
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
      if (
        $List.find('.folderChartChargeLists .ThemeBGColor3').length === $List.find('.folderChartChargeLists li').length
      ) {
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
      const isDialog = $(this).closest('.folderChartMaxView').length;
      if (!$folderChartChargeList.find('.folderChartSelect.ThemeBGColor3').length) {
        alert(_l('请选择负责人!'), 3);
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
        $('.folderChartMaxView .folderChartChargeTxt').html(txt);
      } else {
        $('.folderChartNavBox .folderChartChargeTxt').html(txt);
      }

      that.updateChargeRefreshChart(isAuto, chargeAccountIDs, isDialog);
    });

    // 点击放大chart
    $('#taskList').on('click', '.folderChartModel', function () {
      const $folderChartBoxTitle = $(this).siblings('.folderChartBoxTitle');
      const title = $folderChartBoxTitle.text();
      const tipTitle = $folderChartBoxTitle.find('span:last').attr('title');
      const activeTime = $('#taskList').find('.folderChartTimeTxt').html();
      const activeBtn = $('#taskList').find('.activeClass').index() - 1;

      folderChartSettings.maxSort = folderChartSettings.sort;
      folderChartSettings.chartView =
        folderChartSettings.type === 4 ? $(this).data('id') : parseInt($(this).attr('id').replace(/\D/g, ''), 10);
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

    $(document).on('click.folderChart', event => {
      const $target = $(event.target);

      if (
        !$target.is($('.folderChartChargeBtn')) &&
        !$target.parent().is($('.folderChartChargeBtn')) &&
        !$target.closest('.folderChartChargeList').length
      ) {
        $('.folderChartChargeList').addClass('Hidden');
      }
    });
  }

  /**
   * 项目下任务统计请求数据
   */
  getDailyFolderStatistics(
    startDate = folderChartSettings.startDate,
    endDate = folderChartSettings.endDate,
    isDialog = false,
  ) {
    const { folderId } = this.props.taskConfig;

    ajaxRequest
      .getDailyFolderStatistics({
        folderID: folderId,
        startDate,
        endDate,
      })
      .then(source => {
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
  getTaskChargeStatistics(
    isAuto = folderChartSettings.isAuto,
    chargeAccountIDs = folderChartSettings.chargeAccountIDs,
    isDialog = false,
  ) {
    const { folderId } = this.props.taskConfig;

    ajaxRequest
      .getTaskChargeStatistics({
        folderID: folderId,
        isAuto,
        chargeAccountIDs: chargeAccountIDs,
      })
      .then(source => {
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
      .then(source => {
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
      .then(source => {
        if (source.data) {
          const list = doT.template(chargeList)(source.data);
          if ($('.folderChartMaxView').length) {
            $('.folderChartMaxView .folderChartChargeBox').append(list);
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

    Promise.all([getFolderControlsPieChart, getFolderControlsBarChart]).then(([pieData, barData]) => {
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
      .then(source => {
        if (source.code === 1) {
          this.folderChartsBar(
            'folderChartsMax',
            _.find(source.data, ({ controlId }) => controlId === folderChartSettings.chartView),
          );
        }
      });
  }

  /**
   * 大视图
   */
  folderChartMaxView(data) {
    const content = doT.template(folderChartMaxView)(data);
    // 弹出层
    Dialog.confirm({
      dialogClasses: 'folderChartMaxView',
      noFooter: true,
      width: 860,
      children: <div dangerouslySetInnerHTML={{ __html: content }}></div>,
      handleClose: () => {
        rootMaxViewUpdateTime && rootMaxViewUpdateTime.unmount();
        $('.folderChartMaxView').parent().remove();
      },
    });

    setTimeout(() => {
      if (folderChartSettings.type === 4) {
        const type = $('.folderChartModel[data-id=' + folderChartSettings.chartView + ']').data('type');
        const source = _.find(folderChartSettings.data, ({ controlId }) => controlId === folderChartSettings.chartView);

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
        this.renderMaxCustomTime();
        // 渲染图表
        this['folderCharts' + folderChartSettings.chartView]('folderChartsMax');
      }
    }, 200);
  }

  folderCharts1(id = 'folderCharts1', source = folderChartSettings.data) {
    const data = [];
    for (const item of source) {
      const date = moment(item.date).format(`MM/DD${source.length === 7 ? ' ddd' : ''}`);
      data.push({
        date,
        name: _l('未完成'),
        value: item.underway,
      });
      data.push({
        date,
        name: _l('已完成'),
        value: item.completed,
      });
    }

    // 绘制图表
    const config = {
      label: {
        position: 'middle',
        layout: [],
      },
      data,
      isGroup: true,
      xField: 'name',
      yField: 'value',
      seriesField: 'name',
    };
    $('#' + id).empty();
    new this.Column($('#' + id)[0], config).render();
  }

  folderCharts2(id = 'folderCharts2', source = folderChartSettings.data) {
    const data = [];
    for (const item of source) {
      const date = moment(item.date).format(`MM/DD`);
      data.push({
        date,
        name: _l('正常'),
        value: item.underway_N,
      });
      data.push({
        date,
        name: _l('逾期'),
        value: item.underway_A,
      });
      data.push({
        date,
        name: _l('未设置'),
        value: item.underway_U,
      });
    }

    // 绘制图表
    const config = {
      label: {
        position: 'middle',
        layout: [],
      },
      data,
      isGroup: true,
      xField: 'name',
      yField: 'value',
      seriesField: 'name',
    };
    $('#' + id).empty();
    new this.Column($('#' + id)[0], config).render();
  }

  folderCharts3(id = 'folderCharts3', source = folderChartSettings.data) {
    const data = [];
    for (const item of source) {
      const date = moment(item.date).format(`MM/DD`);
      data.push({
        date,
        name: _l('正常'),
        value: item.completed_N,
      });
      data.push({
        date,
        name: _l('逾期'),
        value: item.completed_A,
      });
      data.push({
        date,
        name: _l('未设置'),
        value: item.completed_U,
      });
    }

    // 绘制图表
    const config = {
      label: {
        position: 'middle',
        layout: [],
      },
      data,
      isGroup: true,
      xField: 'name',
      yField: 'value',
      seriesField: 'name',
    };
    $('#' + id).empty();
    new this.Column($('#' + id)[0], config).render();
  }

  folderCharts4(id = 'folderCharts4', source = folderChartSettings.data) {
    const data = [];
    for (const item of source) {
      const date = moment(item.date).format(`MM/DD`);
      data.push({
        date,
        name: _l('总时间'),
        value: item.timespan,
      });
      data.push({
        date,
        name: _l('未完成'),
        value: item.timespan_Und,
      });
      data.push({
        date,
        name: _l('已完成'),
        value: item.timespan_Com,
      });
    }

    // 绘制图表
    const config = {
      label: {
        position: 'middle',
        layout: [],
      },
      data,
      isGroup: true,
      xField: 'name',
      yField: 'value',
      seriesField: 'name',
    };
    $('#' + id).empty();
    new this.Column($('#' + id)[0], config).render();
  }

  folderCharts5(id = 'folderCharts5', source = folderChartSettings.data) {
    const data = [];
    for (const item of source) {
      const date = moment(item.date).format(`MM/DD${source.length === 7 ? ' ddd' : ''}`);
      data.push({
        date,
        name: _l('新增'),
        value: item.newTasks,
      });
      data.push({
        date,
        name: _l('已完成'),
        value: item.completedTasks,
      });
    }

    // 绘制图表
    const config = {
      label: {
        position: 'middle',
        layout: [],
      },
      data,
      isGroup: true,
      xField: 'name',
      yField: 'value',
      seriesField: 'name',
    };
    $('#' + id).empty();
    new this.Column($('#' + id)[0], config).render();
  }

  folderCharts6(id = 'folderCharts6', source = folderChartSettings.data) {
    const data = [];
    for (const item of source) {
      const date = moment(item.date).format(`MM/DD`);
      data.push({
        date,
        name: _l('人数'),
        value: item.memberAmount,
      });
    }

    // 绘制图表
    const config = {
      label: {
        position: 'middle',
        layout: [],
      },
      data,
      isGroup: true,
      xField: 'name',
      yField: 'value',
      seriesField: 'name',
    };
    $('#' + id).empty();
    new this.Column($('#' + id)[0], config).render();
  }

  folderCharts13(id = 'folderCharts13', source = folderChartSettings.data) {
    const data = [];
    for (const item of source) {
      const date = moment(item.date).format(`MM/DD`);
      data.push({
        date,
        name: _l('所有未完成任务的总剩余时间'),
        value: item.timespan_BurnDown,
      });
    }

    // 绘制图表
    const config = {
      label: {
        position: 'middle',
        layout: [],
      },
      data,
      isGroup: true,
      xField: 'name',
      yField: 'value',
      seriesField: 'name',
    };
    $('#' + id).empty();
    new this.Column($('#' + id)[0], config).render();
  }

  folderCharts14(id = 'folderCharts14', source = folderChartSettings.data) {
    const data = [];
    for (const item of source) {
      const date = moment(item.date).format(`MM/DD`);
      data.push({
        date,
        name: _l('未开始'),
        value: item.notStarted,
      });
      data.push({
        date,
        name: _l('延期未开始'),
        value: item.notStarted_A,
      });
    }

    // 绘制图表
    const config = {
      label: {
        position: 'middle',
        layout: [],
      },
      data,
      isGroup: true,
      xField: 'name',
      yField: 'value',
      seriesField: 'name',
    };
    $('#' + id).empty();
    new this.Column($('#' + id)[0], config).render();
  }

  folderCharts15(id = 'folderCharts15', source = folderChartSettings.data) {
    const data = [];
    for (const item of source) {
      const date = moment(item.date).format(`MM/DD`);
      data.push({
        date,
        name: _l('未设置'),
        value: item.going_U,
      });
      data.push({
        date,
        name: _l('正常'),
        value: item.going - item.going_U - item.going_A,
      });
      data.push({
        date,
        name: _l('逾期'),
        value: item.going_A,
      });
    }

    // 绘制图表
    const config = {
      label: {
        position: 'middle',
        layout: [],
      },
      data,
      isGroup: true,
      xField: 'name',
      yField: 'value',
      seriesField: 'name',
    };
    $('#' + id).empty();
    new this.Column($('#' + id)[0], config).render();
  }

  folderCharts7(id = 'folderCharts7', source = folderChartSettings.data) {
    // 数据排序
    source = this.dataDisposeFun(this.dataSortFun('amount', source));
    const data = [];
    for (const item of source) {
      const date = filterXss(item.fullName).substr(0, 10);
      data.push({
        date,
        name: _l('未完成'),
        value: item.underway,
      });
      data.push({
        date,
        name: _l('已完成'),
        value: item.completed,
      });
    }

    // 绘制图表
    const config = {
      label: {
        position: 'middle',
        layout: [],
      },
      data,
      isGroup: true,
      xField: 'name',
      yField: 'value',
      seriesField: 'name',
    };
    $('#' + id).empty();
    new this.Column($('#' + id)[0], config).render();
  }

  folderCharts8(id = 'folderCharts8', source = folderChartSettings.data) {
    // 数据排序
    source = this.dataDisposeFun(this.dataSortFun('completed_N', source));
    const data = [];
    for (const item of source) {
      const date = filterXss(item.fullName).substr(0, 10);
      data.push({
        date,
        name: _l('按时完成任务数'),
        value: item.completed_N,
      });
    }

    // 绘制图表
    const config = {
      label: {
        position: 'middle',
        layout: [],
      },
      data,
      isGroup: true,
      xField: 'name',
      yField: 'value',
      seriesField: 'name',
    };
    $('#' + id).empty();
    new this.Column($('#' + id)[0], config).render();
  }

  folderCharts9(id = 'folderCharts9', source = folderChartSettings.data) {
    // 数据排序
    source = this.dataDisposeFun(this.dataSortFun('underway_A', source));
    const data = [];
    for (const item of source) {
      const date = filterXss(item.fullName).substr(0, 10);
      data.push({
        date,
        name: _l('未完成'),
        value: item.underway_A,
      });
      data.push({
        date,
        name: _l('已完成'),
        value: item.completed_A,
      });
    }

    // 绘制图表
    const config = {
      label: {
        position: 'middle',
        layout: [],
      },
      data,
      isGroup: true,
      xField: 'name',
      yField: 'value',
      seriesField: 'name',
    };
    $('#' + id).empty();
    new this.Column($('#' + id)[0], config).render();
  }

  folderCharts10(id = 'folderCharts10', source = folderChartSettings.data) {
    // 数据排序
    source = this.dataDisposeFun(this.dataSortFun('timespan_Und', source));
    const data = [];
    for (const item of source) {
      const date = filterXss(item.fullName).substr(0, 10);
      data.push({
        date,
        name: _l('未完成'),
        value: this.updateChartTime(item.timespan_Und),
      });
      data.push({
        date,
        name: _l('已完成'),
        value: this.updateChartTime(item.timespan_Com),
      });
    }

    // 绘制图表
    const config = {
      label: {
        position: 'middle',
        layout: [],
      },
      data,
      isGroup: true,
      xField: 'name',
      yField: 'value',
      seriesField: 'name',
    };
    $('#' + id).empty();
    new this.Column($('#' + id)[0], config).render();
  }

  folderCharts11(id = 'folderCharts11', source = folderChartSettings.data) {
    // 数据排序
    source = this.dataDisposeFun(this.dataSortFun('completedTimeAvg', source));
    const data = [];
    for (const item of source) {
      const date = filterXss(item.fullName).substr(0, 10);
      data.push({
        date,
        name: _l('已完成'),
        value: this.updateChartTime(item.completedTimeAvg),
      });
    }

    // 绘制图表
    const config = {
      label: {
        position: 'middle',
        layout: [],
      },
      data,
      isGroup: true,
      xField: 'name',
      yField: 'value',
      seriesField: 'name',
    };
    $('#' + id).empty();
    new this.Column($('#' + id)[0], config).render();
  }

  folderCharts12(id = 'folderCharts12') {
    // 数据排序
    const data = [];
    for (const item of folderChartSettings.data.stages) {
      const date = item.stageName;
      data.push({
        date,
        name: _l('已完成'),
        value: item.sUnderway,
      });
      data.push({
        date,
        name: _l('已完成'),
        value: item.sCompleted,
      });
    }

    // 绘制图表
    const config = {
      label: {
        position: 'middle',
        layout: [],
      },
      data,
      isGroup: false,
      xField: 'name',
      yField: 'value',
      seriesField: 'name',
    };
    $('#' + id).empty();
    new this.Column($('#' + id)[0], config).render();
  }

  folderChartsPie(id, source) {
    // 数据排序
    const data = [];
    for (const item of source.options) {
      const name = item.name.length > 6 && id !== 'folderChartsMax' ? item.name.substring(0, 5) + '...' : item.name;
      const count = item.count;
      data.push({ name, count });
    }

    // 绘制图表
    const config = {
      appendPadding: 10,
      data,
      angleField: 'count',
      colorField: 'type',
      radius: 0.9,
    };
    $('#' + id).empty();
    new this.Pie($('#' + id)[0], config).render();
  }

  /**
   * 绘制柱状图
   */
  folderChartsBar(id, source) {
    // 数据排序
    const data = [];
    for (const item of source.dailyStatistics) {
      const date = moment(item.date).format(`MM/DD${source.length === 7 ? ' ddd' : ''}`);
      data.push({
        date,
        name: _l('已完成'),
        value: item.underway_Sum,
      });
      data.push({
        date,
        name: _l('已完成'),
        value: item.completed_Sum,
      });
    }

    // 绘制图表
    const config = {
      label: {
        position: 'middle',
        layout: [],
      },
      data,
      isGroup: true,
      xField: 'name',
      yField: 'value',
      seriesField: 'name',
    };
    $('#' + id).empty();
    new this.Column($('#' + id)[0], config).render();
  }

  folderChartsCustom() {
    $('.folderChartBoxModel .folderChartModel[data-model=custom]').map((i, item) => {
      const id = $(item).data('id');
      const type = $(item).data('type');
      const source = _.find(folderChartSettings.data, ({ controlId }) => controlId === id);

      if (type === 9 || type === 10 || type === 11) {
        this.folderChartsPie('folderCharts_' + id, source);
      } else {
        this.folderChartsBar('folderCharts_' + id, source);
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
    if (source.length <= sourceLength || $('.folderChartMaxView').length) {
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
    if ($('.folderChartMaxView').length) {
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
    const isDialog = $('.folderChartMaxView').length;
    let ids;
    if (isDialog) {
      $('.folderChartMaxView .folderChartSelect').toggleClass(
        'ThemeBorderColor3 ThemeBGColor3',
        folderChartSettings.isAutoMax,
      );
      if (!folderChartSettings.isAutoMax) {
        for (ids of folderChartSettings.chargeAccountIDsMax) {
          $('.folderChartMaxView .folderChartSelect[data-id=' + ids + ']').addClass('ThemeBorderColor3 ThemeBGColor3');
        }
      }
    } else {
      $('.folderChartNavBox .folderChartSelect').toggleClass(
        'ThemeBorderColor3 ThemeBGColor3',
        folderChartSettings.isAuto,
      );
      if (!folderChartSettings.isAuto) {
        for (ids of folderChartSettings.chargeAccountIDs) {
          $('.folderChartNavBox .folderChartSelect[data-id=' + ids + ']').addClass('ThemeBorderColor3 ThemeBGColor3');
        }
      }
    }
  }

  renderCustomTime() {
    rootFolderChartTime = createRoot(document.querySelector('.folderChartTime'));

    if (rootFolderChartTime) {
      rootFolderChartTime.render(
        <DateFilter
          noClear={true}
          onChange={(startDate, endDate) => {
            startDate = startDate ? startDate.format('YYYY-MM-DD') : undefined;
            endDate = endDate ? endDate.format('YYYY-MM-DD') : undefined;
            this.updateTimeRefreshChart(false, startDate, endDate);
          }}
        >
          <div className="mTop10 mRight10 pointer">
            <Icon icon="calander" className="Font16 Gray_9" />
          </div>
        </DateFilter>,
      );
    }
  }

  renderMaxCustomTime() {
    const node = document.querySelector('#maxViewUpdateTime');

    if (!node) return;

    rootMaxViewUpdateTime = createRoot(node);

    if (rootMaxViewUpdateTime) {
      rootMaxViewUpdateTime.render(
        <DateFilter
          noClear={true}
          onChange={(startDate, endDate) => {
            startDate = startDate ? startDate.format('YYYY-MM-DD') : undefined;
            endDate = endDate ? endDate.format('YYYY-MM-DD') : undefined;
            this.updateTimeRefreshChart(true, startDate, endDate);
          }}
        >
          <div className="mTop10 mRight10 pointer">
            <Icon icon="calander" className="Font16 Gray_9" />
          </div>
        </DateFilter>,
      );
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
