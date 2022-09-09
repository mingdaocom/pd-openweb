var Calendar = {};

Calendar.Comm = require('../comm/comm');
// calendar.CalendarEdit = require('../calendarEdit/calendarEdit.js');
var calendarEdit = require('../calendarDetail').default;
var afterRefreshOp = require('../calendarDetail/lib/afterRefreshOp').default;
var recurCalendarUpdate = require('../calendarDetail/lib/recurCalendarUpdateDialog').default;
import './calendar.less';
import 'createCalendar';
var moment = require('moment');
var CurrentDate;

const eventLimitNum = () => {
  const height = $(window).height();

  if (height >= 940) {
    return 5;
  } else if (height >= 810) {
    return 4;
  } else if (height >= 680) {
    return 3;
  } else if (height >= 550) {
    return 2;
  }

  return 1;
};

Calendar.settings = {
  isRange: 0, // 记录点击次数
  isRangeTime: [], // 记录点击事件
  isRangeTimeOut: null,
  lastDate: new Date(), // 上次选择的日期
  selectedTime: {
    Start: null,
    End: null,
  },
  isFirstData: null,
  lastTime: null,
  isAllDay: null,
  isResize: false,
  recurTime: null, // 复发时间
};

Calendar.Method = {
  loadFullCalendar: function (parameter) {
    $('#calendar').fullCalendar({
      header: {
        left: 'today prev,next,title',
        center: 'agendaDay,agendaWeek,month',
        right: '',
      },
      timezone: 'local',
      defaultDate: parameter.date, // 默认时间
      firstDay: 0, // 第一列显示周几  0：周日
      startParam: 'startDate', // 提交请求时开始时间的名称:即XXX.aspx?sstart=XXX&eend=YYYY;
      endParam: 'endDate',
      defaultView: parameter.currentView, // 默认视图
      slotMinutes: 30,
      scrollTime: parameter.scrollTime, // 开始时间
      height: $(window).height() - $('.fc-day-grid').height() - $('#topBarContainer').height() - 15, // 高度
      selectable: true, // 允许拖拽
      selectHelper: true,
      editable: true,
      eventLimit: eventLimitNum(),
      handleWindowResize: false,
      eventLimitClick: 'popover',
      axisFormat: 'HH:mm', // 左侧时间列表格式 24小时制
      titleFormat: {
        // 头部标题格式
        month: _l('YYYY 年 MMM'), // ****年 *月
        week: _l('YYYY 年 MMMD日'), // ****年 *月*日
        day: _l('YYYY 年 MMMD日 dddd'), // ****年 *月*日 星期*
      },
      columnFormat: {
        // 列标题格式
        month: 'ddd', // 周*
        week: 'DD ddd', // 15日 周*
        day: '', //
      },
      events: {
        url: Calendar.Comm.ajaxRequest.getCalendars,
        data: {
          isWorkCalendar: Calendar.Comm.settings.isWorkCalendar,
          isTaskCalendar: Calendar.Comm.settings.isTaskCalendar,
          filterTaskType: Calendar.Comm.settings.filterTaskType,
          categoryIDs: Calendar.Method.getCategoryIDsFun(),
          memberIDs: Calendar.Comm.settings.otherUsers.join(','),
        },
      },
      timeFormat: 'H:mm', // 事件日期格式
      eventClick: function (events, jsEvent, view) {
        // 点击 日程时 事件
        if (events.isTask) {
          $('#calendarEdit,.showActiveTitleMessage').remove();
          $('#calendar').trigger('openTask', events.eventID);
        } else {
          Calendar.settings.recurTime = events.recurTime;

          // 成员，日程未锁定 双击时会先进dayclick事件、进行数据重置处理
          Calendar.settings.isRange = 0;
          clearTimeout(Calendar.settings.isRangeTimeOut);

          if (!events.canLook) {
            alert(_l('该日程为他人的私密日程，无法查看'), 3);
            return;
          }

          var pageX = jsEvent.clientX;
          var pageY = $.browser.chrome ? jsEvent.clientY + document.body.scrollTop : jsEvent.clientY + document.documentElement.scrollTop;
          var gapRight = $(window).width() - pageX; // 离右边距离
          var calhoverWidth = 360;

          if (gapRight < calhoverWidth) {
            pageX = pageX - calhoverWidth;
          }

          calendarEdit({
            calendarId: events.id,
            recurTime: events.recurTime ? moment(events.recurTime).toISOString() : '',
            saveCallback: function () {
              Calendar.Method.rememberClick();
            },
          });

          $('.hoverContentColor').removeClass('hoverContentColor');
          $(this).addClass('hoverContentColor');
        }
      },
      eventAfterRender: function (event, element, view) {
        // 事件呈现后触发,可用来做头像显示
        var $fcTitle = $(element).find('.fc-title');
        if (!event.isTask) {
          if (
            Calendar.Comm.settings.otherUsers.length > 1 ||
            (Calendar.Comm.settings.otherUsers.length == 1 && Calendar.Comm.settings.otherUsers[0] != md.global.Account.accountId)
          ) {
            $fcTitle.prepend('<img src="' + event.head + '" style="width:14px;margin-top: 1px; height:14px;margin-bottom:-2px;padding-right: 3px;"/>');
          }
        } else {
          var taskID = event.eventID;
          $fcTitle.prepend(
            '<span class="icon-calendartask" data-endtime="' + moment(event.end._i).format('HH:mm') + '" style="width:14px;display: inline-block;height:14px;margin: 1px 3px -2px 0;font-size: 16px;vertical-align: top;"> </span>'
          );
          $(element)
            .find('.fc-resizer')
            .remove();
        }
      },
      loading: function (isLoading, view) {
        if (isLoading) {
          $('#calendarLoading').show();
          $('#calInvite').removeClass('ThemeBGColor3');
          $('#calendar').css('visibility', 'hidden');
        } else {
          $('#calendarLoading').hide();
          $('#calendar').css('visibility', 'visible');
          // 样式调整
          Calendar.Method.editViewStyle();
        }
      },
      select: function (start, end, jsEvent, view) {
        // 执行 添加
        var multiSelect = '';
        var multiSelectDay = '';
        if ($('.fc-highlight').length > 1 || $('.fc-highlight').attr('colspan') > 1) {
          multiSelectDay = true; // 全天事件多选
        }
        // 判断是否是多选事件
        if ($('.fc-month-view').length > 0 && multiSelectDay) {
          // 月多选
          multiSelect = true;
        }

        Calendar.settings.selectedTime.Start = moment(start).format(); // 开始时间
        Calendar.settings.selectedTime.End = moment(end).format(); // 结束时间
        var settings = {
          Start: Calendar.settings.selectedTime.Start,
          End: Calendar.settings.selectedTime.End,
          AllDay: '',
        };

        var rangeStart = moment(settings.Start).unix();
        var rangeEnd = moment(settings.End).unix();
        if (rangeEnd - rangeStart > 30 * 60 && $('.fc-highlight').attr('colspan') != 1) {
          multiSelect = true; // 周、日视图多选情况(除全天事件外)
        }

        if (multiSelectDay) {
          // 全天事件多选 日期处理
          settings.End = moment(settings.End)
            .add(-1, 'day')
            .format(); // 处理多选的日期多一天
          settings.AllDay = true;
        }

        if (multiSelect) {
          // 多选创建日程
          $.CreateCalendar(settings);
        }
      },
      eventMouseover: function (event, jsEvent, view) {
        Calendar.Method.changeEventColor(event, jsEvent, 0);
      },
      eventMouseout: function (event, jsEvent, view) {
        Calendar.Method.changeEventColor(event, jsEvent, 1);
      },
      // 新方法  需要修改参数
      eventDrop: function (event, delta, revertFunc, jsEvent, ui, view) {
        Calendar.settings.isResize = false;
        Calendar.Method.dropResize(event, delta, revertFunc, jsEvent, ui, view);
      },
      // 新方法  需要修改参数
      eventResize: function (event, delta, revertFunc, jsEvent, ui, view) {
        Calendar.settings.isResize = true;
        Calendar.Method.dropResize(event, delta, revertFunc, jsEvent, ui, view);
      },
      dayClick: function (date, jsEvent, view) {
        // 操作方法
        var calendarClickFun = function () {
          if (Calendar.settings.isRange >= 2) {
            // 双击
            clearTimeout(Calendar.settings.isRangeTimeOut);
            if (Calendar.settings.isRangeTime[1] - Calendar.settings.isRangeTime[0] < 300) {
              var settings = {
                Start: '',
                End: '',
                AllDay: '',
              };
              if (date.format().length <= 10) {
                // 全天事件
                if (date.format() !== moment(new Date()).format('YYYY-MM-DD')) {
                  // 非当天
                  settings.Start = moment(date)
                    .set('hour', 10)
                    .format('YYYY-MM-DD HH:mm:ss');
                  settings.End = moment(date)
                    .set('hour', 11)
                    .format('YYYY-MM-DD HH:mm:ss'); // 结束时间计算
                  settings.AllDay = true;
                }
              } else {
                // 非全天事件
                settings.Start = date.format(); // 开始时间
                settings.End = date.add(30, 'm').format(); // 结束时间计算
              }
              $.CreateCalendar(settings);
            }

            Calendar.settings.lastDate = '';
            Calendar.settings.isRangeTime = [];
            Calendar.settings.isRange = 0;
          } else if (Calendar.settings.isRange == 1) {
            // 单击
            Calendar.settings.isFirstData = date;
            Calendar.settings.isRangeTimeOut = setTimeout(function () {
              Calendar.settings.lastDate = '';
              Calendar.settings.isRangeTime = [];
              Calendar.settings.isRange = 0;
            }, 300);
          }
        };

        var ieVer = parseInt($.browser.version, 10);
        if ($.browser.msie && (ieVer == 7 || ieVer == 8)) {
          var isRangeTime = +new Date();
          Calendar.settings.isRangeTime.push(isRangeTime);
          Calendar.settings.isRange++;

          if (Calendar.settings.isRange == 2) {
            date = Calendar.settings.isFirstData;
          }

          calendarClickFun(); // 操作方法
        } else {
          if (date.toString() != Calendar.settings.lastDate.toString()) {
            Calendar.settings.isRange = 0;
            Calendar.settings.isRangeTime = [];
            Calendar.settings.isRangeTime[0] = +new Date();
          } else {
            Calendar.settings.isRangeTime[1] = +new Date();
          }
          Calendar.settings.lastDate = date;
          Calendar.settings.isRange++;

          calendarClickFun(); // 操作方法
        }
      },
    });

    // 添加列表按钮
    var $fcHeaderCenter = $('.fc-center'); // 重复的fc-header-right对象提取
    $fcHeaderCenter.find('.fc-month-button').removeClass('fc-corner-right'); // 移除月按钮的右侧圆角

    // 插入“列表”按钮
    if ($fcHeaderCenter.find('.fc-list-button').length == 0) {
      // “列表”按钮不存在
      $fcHeaderCenter
        .find('.fc-button-group')
        .append('<button type="button" class="fc-button fc-list-button fc-state-default fc-corner-right" unselectable="on">' + _l('列表') + '</button>');
    }

    // 点击切换视图
    $('.fc-center')
      .find('button')
      .off()
      .on('click', function () {
        $('.hoverTitleMessage').remove();

        if ($(this).hasClass('fc-list-button')) {
          // 点击的是列表选项
          safeLocalStorageSetItem('lastView', 'list');
        } else {
          // 点击的不是列表选项
          $('#calendar').fullCalendar('render');
          $('#calendar')
            .find('.fc-view-container')
            .show();
          $('#calendarList').hide();
          $('#calendar')
            .find('.fc-left')
            .show();
        }

        if ($(this).hasClass('fc-agendaDay-button')) {
          $('#calendar').fullCalendar('changeView', 'agendaDay');
          safeLocalStorageSetItem('lastView', 'agendaDay');
        }

        if ($(this).hasClass('fc-agendaWeek-button')) {
          $('#calendar').fullCalendar('changeView', 'agendaWeek');
          safeLocalStorageSetItem('lastView', 'agendaWeek');
        }

        if ($(this).hasClass('fc-month-button')) {
          $('#calendar').fullCalendar('changeView', 'month');
          safeLocalStorageSetItem('lastView', 'month');
        }

        $(this)
          .addClass('fc-state-active')
          .siblings()
          .removeClass('fc-state-active'); // 当前添加样式，移除同级下面的样式

        Calendar.Method.editViewStyle(); // 视图样式调整
        Calendar.Method.rememberClickRefresh(); // 刷新视图
      });

    // 列表视图数据刷新 ； 用户 创建日程层
    $('.fc-list-button').bind('refreshList', function () {
      Calendar.Method.calendarList(
        moment().format('YYYY-MM-DD HH:mm:ss'),
        moment()
          .add('2', 'months')
          .format('YYYY-MM-01'),
        true
      ); // 刷新列表视图数据
    });

    // 添加新建日程按钮
    var fcToolbar = $('.fc-toolbar');
    if (fcToolbar.children('.addNewCalendarBox').length == 0) {
      fcToolbar.prepend(
        '<div class="addNewCalendarBox ThemeBGColor3 ThemeHoverBGColor2" id="addNewCalendar"><i class="icon-plus"></i>' + _l('新日程') + '</div>'
      );
    }

    var $container = $('#container');
    var hoverTitleTimer;

    // 鼠标经过提示双击创建
    $container.on(
      {
        mousemove: function (event) {
          clearTimeout(hoverTitleTimer);
          $('.hoverTitleMessage,.showActiveTitleMessage').hide();
          if (Calendar.Method.detectLeftButton(event) || $(event.target).hasClass('fc-axis') || $(event.target).closest('.fc-axis').length) {
            return;
          }
          var pointX = event.clientX;
          var pointY = event.clientY;

          hoverTitleTimer = setTimeout(function () {
            if (!$('.hoverTitleMessage').length) {
              $('body').append('<div class="hoverTitleMessage">' + _l('双击创建日程') + '</div>');
            }

            var $hoverTitleMessage = $('.hoverTitleMessage');
            if ($hoverTitleMessage.width() + pointX + 15 > $(window).width()) {
              pointX = pointX - $hoverTitleMessage.width() - 15;
            }

            $hoverTitleMessage.css({ left: pointX + 15, top: pointY + $(window).scrollTop() + 15 }).show();
          }, 250);
        },
        mouseleave: function () {
          clearTimeout(hoverTitleTimer);
          $('.hoverTitleMessage,.showActiveTitleMessage').hide();
        },
      },
      '.fc-view tbody:first'
    );

    // 鼠标经过title显示title内容
    $container.on('mousemove', '.showActiveTitle', function (event) {
      var $this = $(this);
      var pointX = event.clientX;
      var pointY = event.clientY;
      clearTimeout(hoverTitleTimer);
      if (Calendar.Method.detectLeftButton(event)) {
        $('.hoverTitleMessage,.showActiveTitleMessage').hide();
        return;
      }
      $('.showActiveTitleMessage,.hoverTitleMessage').hide();
      hoverTitleTimer = setTimeout(function () {
        var title = $this.find('.fc-title').html();
        if (title) {
          if (!(title.indexOf(_l('全天')) > 0 || (!$this.find('.fc-time').length && title.indexOf('icon-calendartask') < 0))) {
            if (title.indexOf('icon-calendartask') > 0) {
              // 任务
              title = $this.find('.icon-calendartask').attr('data-endtime') + ' ' + title.split('</span>')[1];
            } else {
              // 非任务
              var fcTime = $this.find('.fc-time');
              var time = fcTime.attr('data-start') + ' - ' + fcTime.attr('data-end') + ' ';
              if (title.indexOf('</span>') > 0) {
                title = time + title.split('</span>')[1];
              } else {
                title = time + title;
              }
            }
          }

          if (!$('.showActiveTitleMessage').length) {
            $('body').append('<div class="showActiveTitleMessage">' + title + '</div>');
          }

          var $showActiveTitleMessage = $('.showActiveTitleMessage').html(title);
          if ($showActiveTitleMessage.width() + pointX + 15 > $(window).width()) {
            pointX = pointX - $showActiveTitleMessage.width() - 15;
          }

          $showActiveTitleMessage
            .css({
              left: pointX + 15,
              top: pointY + $(window).scrollTop() + 15,
            })
            .show();
          $('.hoverTitleMessage').hide();
        }
      }, 250);
      event.stopPropagation();
    });

    // 非全天日程经过加背景色
    $container.on(
      {
        mouseover: function () {
          $(this).css(
            'background',
            $(this)
              .attr('data-hoverBgColor')
              .split(':')[1]
          );
        },
        mouseout: function () {
          $(this).css('background', 'none');
        },
      },
      '.notAllDayOver'
    );

    // 创建日程
    $('#addNewCalendar').on('click', function () {
      $.CreateCalendar();
    });

    $('.fc-button-group button').addClass('ThemeColor3 ThemeBorderColor3');
    $('.fc-prev-button,.fc-next-button,.fc-today-button').hover(
      function () {
        $(this).addClass('ThemeBGColor3');
      },
      function () {
        $(this).removeClass('ThemeBGColor3');
      }
    );
    $('.fc-today-button').on('click', function () {
      $(this).removeClass('ThemeBGColor3');
    });
  },

  // 日程初始化
  init: function () {
    var lastView = window.localStorage.getItem('lastView');
    var scrollTime = moment(CurrentDate.getTime() - 170 * 60 * 1000).format('HH:mm:ss'); // 时间轴居中差不多差170分钟
    var parameter = {
      date: CurrentDate,
      scrollTime: scrollTime,
    };

    if (Calendar.Comm.settings.date) {
      parameter.date = Calendar.Comm.settings.date;
      Calendar.Comm.settings.date = '';
    }

    if (Calendar.settings.lastTime) {
      parameter.date = Calendar.settings.lastTime;
    }

    if (lastView == 'list') {
      parameter.currentView = 'agendaDay';
      Calendar.Method.calendarList(
        moment().format('YYYY-MM-DD HH:mm:ss'),
        moment()
          .add('2', 'months')
          .format('YYYY-MM-01'),
        true
      ); // 添加列表数据
      $('#calendar').fullCalendar('destroy');
      Calendar.Method.loadFullCalendar(parameter);

      $('#calendar')
        .find('.fc-view-container,.fc-left')
        .hide();
      $('#calendarList').css('display', 'block');
      $('#calendar').fullCalendar('getView').name = 'list';
    } else {
      if (['agendaDay', 'agendaWeek', 'month'].indexOf(lastView) == -1) {
        lastView = 'agendaDay';
        safeLocalStorageSetItem('lastView', 'agendaDay');
      }

      parameter.currentView = lastView;
      Calendar.Method.loadFullCalendar(parameter);
    }
  },

  // 视图样式调整
  editViewStyle: function () {
    if ($.browser.safari && window.localStorage.getItem('lastView') === 'month') {
      $('.fc-month-view').css('position', 'static');
    } else {
      $('.fc-month-view').css('position', 'relative');
    }

    var viewName = Calendar.Method.getViewName();

    if (viewName == 'agendaWeek') {
      $('.fc-state-highlight').css({
        background: '#fff0f0',
        'border-top-width': '1px',
        'border-top-color': '#ff0',
      });
      $('.fewWeeks').remove();

      $('.fc-toolbar .fc-left h2').append(
        ' <span class="fewWeeks">' +
        _l(
          '第%0周',
          $('#calendar')
            .fullCalendar('getDate')
            .weeks()
        ) +
        '</span>'
      );
    }

    if (viewName == 'agendaDay' || viewName == 'agendaWeek') {
      $('.fc-axis').css('width', '31px');

      // 如果是天 视图 时间轴
      // 只在当天出现
      var agendaActiveDay = moment($('#calendar').fullCalendar('getDate')).format('YYYY-MM-DD'); // 日视图当前时间
      var isToday = false;

      if (viewName == 'agendaDay') {
        if (agendaActiveDay == moment(CurrentDate).format('YYYY-MM-DD')) {
          isToday = true;
        }
      }

      if (viewName == 'agendaWeek') {
        $('.fc-day-header').each(function () {
          if (
            $(this)
              .css('border-bottom-color')
              .indexOf('rgb(255, 153, 153)') >= 0
          ) {
            isToday = true;
          }
        });

        isToday = true;
      }

      if ($('.fc-time-grid').find('.rect').length == 0 && isToday) {
        var data = CurrentDate;
        var time = data.getHours() + parseFloat((data.getMinutes() / 60).toFixed(2));
        var h = time * 40 + ($.browser.mozilla ? 0 : data.getHours()) - 4.5 + 'px';

        var div = '<div style="text-align:right;width: 100%;top:' + h + ';position: absolute;z-index: 8;left:54px;">';
        div += '<div class="rect"></div><div class="rectLine"></div>';
        div += '</div>';
        $('.fc-time-grid-container .fc-time-grid').append(div);
      }

      // 时间轴位置调整
      $('.fc-slats')
        .find('.fc-axis')
        .each(function () {
          var timeVal = $.trim($(this).text());
          if (timeVal != '') {
            var top = timeVal == '00:00' ? '-5px' : '-10px';
            $(this).html('<span style="position: relative;left: 0;top: ' + top + '">' + timeVal + '</span>');
          }
        });

      setTimeout(() => {
        $('.fc-time-grid-container.fc-scroller').scrollTop((moment().hour() + 2) * 40 - $('.fc-time-grid-container.fc-scroller').height() / 2);
      }, 100);
    }

    if (viewName == 'month') {
      $('.fcOld td.fc-today').css('border-style', 'solid');
      $('.fc-state-highlight').css({
        background: '#FCD7D7',
        'border-top-width': '2px',
        'border-top-color': '#F72F37',
      });
      $('.fc-row.fc-widget-header').css({
        'border-right-width': 0,
      });
    }

    if (viewName == 'list') {
      $('.fc-list-button')
        .addClass('fc-state-active')
        .siblings()
        .removeClass('fc-state-active'); // 当前添加样式，移除同级下面的样式
    }

    // 日周视图滚动条处理
    $('.fc-scroller').on('scroll', function (event) {
      var height = $(this).height();
      var scrollTop = $(this)[0].scrollTop;
      var scrollHeight = $(this)[0].scrollHeight;

      if (height + scrollTop >= scrollHeight) {
        $(this).scrollTop(scrollHeight - height - 1);
        event.stopPropagation();
        return false;
      } else if (scrollTop <= 0) {
        $(this).scrollTop(1);
        event.stopPropagation();
        return false;
      }
    });
  },

  dropResize: function (event, delta, revertFunc /* , jsEvent, ui, view*/) {
    $('.showActiveTitleMessage,.hoverTitleMessage').hide();
    if (event.isTask) {
      alert(_l('任务不可更改'), 3);
      revertFunc();
      return;
    }

    if (event.hasMember) {
      // Calendar.Method.afterRefreshOp(event, delta, revertFunc);
      afterRefreshOp(function (...args) {
        Calendar.Method.ajaxAfterDrop(event, delta, revertFunc, args[0], args[1]);
      }, revertFunc);
    } else {
      Calendar.Method.ajaxAfterDrop(event, delta, revertFunc, false, false);
    }
  },

  // 拖拽日程后是否重新发送邀请
  // afterRefreshOp: function (event, delta, revertFunc) {
  //   require.async('./../calendarEdit/tpl/ReInvited.html', function (html) {
  //     var data = {
  //       cancel: true,
  //     };

  //     data.isMembers = true;

  //     var dialog = $.DialogLayer({
  //       dialogBoxID: 'calendarReInviteDialog',
  //       width: 458,
  //       container: {
  //         header: _l('提示'),
  //         content: Calendar.Comm.doT.template(html)(data),
  //         noText: '',
  //         yesText: '',
  //         noFn: function () {
  //           revertFunc();
  //           Calendar.Method.editViewStyle();
  //         },
  //       },
  //       readyFn: function () {
  //         // 取消
  //         $('#dropCancel').on('click', function () {
  //           dialog.closeDialog();
  //           revertFunc();
  //           Calendar.editViewStyle();
  //         });

  //         // 保存
  //         $('#canelJoinGrop').click(function () {
  //           Calendar.Method.ajaxAfterDrop(event, delta, revertFunc, false, true);
  //           dialog.closeDialog();
  //         });

  //         // 保存并发送
  //         $('#enterJoinGroup').click(function () {
  //           Calendar.Method.ajaxAfterDrop(event, delta, revertFunc, true, true);
  //           dialog.closeDialog();
  //         });
  //       },
  //     });
  //   });
  // },

  /**
   * 编辑日程时间
   * @param  {Object} event  拖拽事件
   * @param  {Object} delta  变化时间
   * @param  {Function} reverFunc 还原日程位置
   * @param  {Boolean} reType 是否发送邀请
   * @param  {Boolean} directRun 非重复日发送邀请则无需继续弹框确认
   * @return {[type]}        [description]
   */
  ajaxAfterDrop: function (event, delta, revertFunc, reType, directRun) {
    var editCalendaTimeFun = function (isAllCalendar) {
      var calendarID = event.id;
      var recurTime = event.recurTime; // 复发时间
      var starDate = moment(event.start).format('YYYY-MM-DD HH:mm');
      var endDate = moment(event.end).format('YYYY-MM-DD HH:mm');
      var isAllDay = event.isAllDay;
      var dayDelta = delta._days; // 偏移天数
      var minuteDelta = delta._milliseconds / 60000; // 偏移时间

      if (isAllCalendar) {
        starDate = event.oldStartTime;
        endDate = event.oldEndTime;
      }

      if (isAllDay) {
        starDate = starDate.split(' ')[0];
        endDate = moment(event.end)
          .day(-1)
          .format('YYYY-MM-DD');
      }

      Calendar.Comm.ajaxRequest
        .editCalendarTime({
          calendarID: calendarID,
          start: moment(starDate).toISOString(),
          end: moment(endDate).toISOString(),
          dayDelta: dayDelta,
          minuteDelta: minuteDelta,
          isAll: isAllDay,
          isResize: Calendar.settings.isResize,
          reType: reType,
          recurTime: recurTime ? moment(recurTime).toISOString() : '',
          isAllCalendar: isAllCalendar,
        })
        .then(function (resource) {
          if (resource.code == 1) {
            alert(_l('操作成功'));
            Calendar.Method.rememberClick(); // 刷新日程
          } else {
            alert(_l('操作失败'), 3);
          }
        });
    };

    recurCalendarUpdate(
      { operatorTitle: _l('您确定更改日程信息吗?'), recurTitle: _l('您确定编辑重复日程吗?'), recurCalendarUpdateFun: editCalendaTimeFun },
      { originRecur: event.isRecur, isChildCalendar: event.isChildCalendar },
      { directRun, callback: revertFunc }
    );
  },

  // 返回当前视图的名称
  getViewName: function () {
    return $('#calendar').fullCalendar('getView').name;
  },

  getCategoryIDsFun: function () {
    var ctegoryIDs = '';
    if (Calendar.Comm.settings.categorys.length) {
      ctegoryIDs = Calendar.Comm.settings.categorys.join(',');
    } else if (window.localStorage.getItem('categorys') != '') {
      ctegoryIDs = 'All';
    }
    return ctegoryIDs;
  },

  // 经过颜色
  changeEventColorHover: function (rgbColor) {
    if (rgbColor) {
      if (rgbColor.indexOf('rgb(239, 154, 154)') >= 0) {
        // 红色
        return '#F44336';
      }
      if (rgbColor.indexOf('rgb(206, 147, 216)') >= 0) {
        // 紫色
        return '#9C27B0';
      }
      if (rgbColor.indexOf('rgb(188, 170, 164)') >= 0) {
        // 褐色
        return '#795548';
      }
      if (rgbColor.indexOf('rgb(255, 204, 128)') >= 0) {
        // 橙色
        return '#FF9800';
      }
      if (rgbColor.indexOf('rgb(144, 202, 249)') >= 0) {
        // 蓝色
        return '#1E88E5';
      }
      if (rgbColor.indexOf('rgb(165, 214, 167)') >= 0) {
        // 绿色
        return '#4CAF50';
      }
      if (rgbColor.indexOf('rgb(255, 245, 157)') >= 0) {
        // 黄色
        return '#FFEB3B';
      }
      if (rgbColor.indexOf('rgb(230, 230, 230)') >= 0) {
        // 灰色
        return '#B4B4B4';
      }
    }
  },

  // 离开颜色
  changeEventColorLeave: function (rgbColor) {
    if (rgbColor) {
      if (rgbColor.indexOf('rgb(244, 67, 54)') >= 0) {
        // 红色
        return '#EF9A9A';
      }
      if (rgbColor.indexOf('rgb(156, 39, 176)') >= 0) {
        // 紫色
        return '#CE93D8';
      }
      if (rgbColor.indexOf('rgb(121, 85, 72)') >= 0) {
        // 褐色
        return '#BCAAA4';
      }
      if (rgbColor.indexOf('rgb(255, 152, 0)') >= 0) {
        // 橙色
        return '#FFCC80';
      }
      if (rgbColor.indexOf('rgb(30, 136, 229)') >= 0) {
        // 蓝色
        return '#90CAF9';
      }
      if (rgbColor.indexOf('rgb(76, 175, 80)') >= 0) {
        // 绿色
        return '#A5D6A7';
      }
      if (rgbColor.indexOf('rgb(255, 235, 59)') >= 0) {
        // 黄色
        return '#FFF59D';
      }
      if (rgbColor.indexOf('rgb(180, 180, 180)') >= 0) {
        // 灰色
        return '#E6E6E6';
      }
    }
  },

  // 0 选中状态 1 离开状态
  changeEventColor: function (event, jsEvent, type) {
    if (jsEvent.currentTarget == document) return;
    if (!$(jsEvent.currentTarget).hasClass('notAllDayOver')) {
      var rgbColor = $(jsEvent.currentTarget).css('background-color');
      if (type == 0) {
        $(jsEvent.currentTarget)
          .css('background-color', Calendar.Method.changeEventColorHover(rgbColor))
          .addClass('hoverContentColor');
      } else {
        $(jsEvent.currentTarget)
          .css('background-color', Calendar.Method.changeEventColorLeave(rgbColor))
          .removeClass('hoverContentColor');
      }
    } else {
      if (type == 0) {
        $(jsEvent.currentTarget).addClass('hoverContentColor');
      } else {
        $(jsEvent.currentTarget).removeClass('hoverContentColor');
      }
    }
  },

  // 检测左键是否按下
  detectLeftButton: function (evt) {
    evt = evt || window.event;
    var button = evt.which || evt.button;

    // 处理ie 11经过的时候which是1的bug
    if (evt.type === 'mousemove') {
      button = 0;
    }

    return button == 1;
  },

  // 记住点击  周 天 月 列表
  rememberClick: function () {
    var $calendar = $('#calendar');
    if ($calendar.length > 0) {
      if (Calendar.Method.getViewName() == 'agendaDay') {
        $calendar.fullCalendar('refetchEvents');
      } else if (Calendar.Method.getViewName() == 'agendaWeek') {
        $calendar.fullCalendar('refetchEvents');
      } else if (Calendar.Method.getViewName() == 'month') {
        $calendar.fullCalendar('refetchEvents');
      } else if (Calendar.Method.getViewName() == 'list') {
        $('.fc-list-button').trigger('refreshList');
      }
    }
  },

  rememberClickRefresh: function () {
    $('#calendar').show();
    if (Calendar.Method.getViewName == 'list') {
      $('#calendarList').show();
    }
    $('#invitedMain').hide();

    Calendar.settings.lastTime = $('#calendar').fullCalendar('getDate');
    $('#calendar').fullCalendar('destroy');
    Calendar.Method.init();
    $('#calendar').fullCalendar('refetchEvents');
  },

  // 日程列表加载
  calendarList: function (startDate2, endDate2, isFirst, scrollTop) {
    Calendar.Comm.ajaxRequest
      .getCalendarList2({
        memberIDs: Calendar.Comm.settings.otherUsers.join(','),
        isPrivateCalendar: Calendar.Comm.settings.isPrivateCalendar,
        isTaskCalendar: Calendar.Comm.settings.isTaskCalendar,
        filterTaskType: Calendar.Comm.settings.filterTaskType,
        isWorkCalendar: Calendar.Comm.settings.isWorkCalendar,
        categoryIDs: Calendar.Method.getCategoryIDsFun(),
        startDate: startDate2,
        endDate: endDate2,
      })
      .then(function (resource) {
        if (resource.msg == '操作成功') {
          require(['./tpl/list.html'], function (html) {
            var data = resource.data;
            data.isFirst = isFirst;
            data.colorClass = Calendar.Method.colorClass;
            var queryend = moment(endDate2)
              .add(1, 'M')
              .format('YYYY-MM-DD');
            if (isFirst) {
              data.queryEnd = queryend;
              var nowDate = CurrentDate;
              data.dateTime = _l(' %0年%1月%2日', nowDate.getFullYear(), nowDate.getMonth() + 1, nowDate.getDate());
              var days = [0, 1, 2, 3, 4, 5, 6].map(function (item) {
                return moment()
                  .day(item)
                  .format('dddd');
              });
              data.dateWeek = days[nowDate.getDay()];
              $('#calendar')
                .find('.fc-center h2')
                .html(data.dateTime + ' ' + data.dateWeek);
              var listHeihgt = $(window).height() - $('.nativeHeaderWrap').height() - 118;
              $('#calendarList')
                .html(Calendar.Comm.doT.template(html)(data))
                .find('.calendarList')
                .css('height', listHeihgt); // 往页面添加列表元素
              $('#calendarList .calendarNoList').css('height', listHeihgt + 45);
              $('.calendarList').scrollTop(scrollTop);
            } else if (!isFirst) {
              $('#calendarListMore').attr({ queryend: queryend, restCalCount: data.restCalCount });
              if (parseInt(data.restCalCount, 10) == 0) {
                $('.calendarListMore').hide();
              }
              $('#calendarListMoreData').html(queryend);
              if (data.calendars) {
                $('#calendarList .calendarListMore').before(Calendar.Comm.doT.template(html)(data));
              }
            }
          });
        }
      });
  },

  colorClass: function (val) {
    switch (val) {
      case '#EF9A9A':
        return 'calendarListColorRed'; // 红色
      case '#CE93D8':
        return 'calendarListColorViolet'; // 紫色
      case '#BCAAA4':
        return 'calendarListColorBrown'; // 褐色
      case '#FFCC80':
        return 'calendarListColorOrange'; // 橙色
      case '#90CAF9':
        return 'calendarListColorBlue'; // 蓝色
      case '#A5D6A7':
        return 'calendarListColorGreen'; // 绿色
      case '#FFF59D':
        return 'calendarListColorYellow'; // 黄色
      case '#E6E6E6':
        return 'calendarListColorGrey'; // 灰色
      default:
        break;
    }
  },
};

Calendar.Event = function () {
  window.onresize = function () {
    Calendar.Method.editViewStyle();
  };

  // 列表空白点击创建日程 or 详情 or加载更多
  $('#calendarList')
    .on('click', '.calendarNoListBtn', function () {
      $.CreateCalendar();
    })
    .on('click', '.calendarListModel li', function (event) {
      var $el = $(this);
      var pageX = event.clientX;
      var pageY = $.browser.chrome ? event.clientY + document.body.scrollTop : event.clientY + document.documentElement.scrollTop;
      var gapRight = $(window).width() - pageX; // 离右边距离
      var calhoverWidth = 360;
      var isTask = $el.data('istask');

      if (isTask) {
        $('#calendar').trigger('openTask', $el.attr('data-id'));
        return false;
      }

      if (gapRight < calhoverWidth) {
        pageX = pageX - calhoverWidth;
      }

      calendarEdit({
        calendarId: $el.attr('data-id'),
        recurTime: $el.attr('data-recurtime'),
        saveCallback: function () {
          Calendar.Method.calendarList(
            moment().format('YYYY-MM-DD HH:mm:ss'),
            moment($('.calendarListMore a').attr('queryend')).format('YYYY-MM-DD'),
            true,
            $('.calendarList').scrollTop()
          );
        },
      });
    })
    .on('click', '#calendarListMore', function () {
      var startDate2 = $(this).attr('queryend');
      var restCalCount = $(this).attr('restCalCount');

      if (parseInt(restCalCount, 10) > 0) {
        Calendar.Method.calendarList(
          moment(startDate2)
            .add('month', -1)
            .format('YYYY-MM-DD'),
          startDate2,
          false
        );
      }
    });

  $(document).on('click', function (event) {
    var $target = $(event.target);

    // 隐藏自定义title
    if (!$target.closest('.showActiveTitle').length) {
      $('.hoverContentColor').removeClass('hoverContentColor');
    }
  });
};

Calendar.Export = {
  init: function () {
    CurrentDate = new Date(
      moment().format()
    );
    Calendar.Method.init();
    Calendar.Event();

    setInterval(function () {
      CurrentDate = new Date(
        moment().format()
      );
    }, 6000);
  },
  rememberClickRefresh: Calendar.Method.rememberClickRefresh,
};

module.exports = Calendar.Export;
