(function ($) {
  var moment = require('moment');
  require('./css/mdDatePicker.css');

  $.fn.mdDatePicker = function () {
    var method = arguments[0];
    var args = arguments;
    if (methods[method]) {
      method = methods[method];
      args = Array.prototype.slice.call(args, 1);
    } else if (typeof method === 'object' || !method) {
      method = function (options) {
        return this.each(function () {
          if (!$(this).data('settings')) {
            var DatePicker = new mdDatePicker(options);
            DatePicker.$el = $(this);
            DatePicker.init();
          }
        });
      };
    } else {
      $.error('Method' + method + 'does not exist on jQuery.mdDatePicker');
      return this;
    }
    return method.apply(this, args);
  };

  var methods = {
    destroy: function () {
      return $(this).each(function () {
        var settings = $(this).data('settings');
        if (settings) {
          $('#warpDatePicker_' + settings.uid).remove();
          $(this).removeData('settings');
          $(document).off('click.mdDatePicker' + settings.uid);
        }
      });
    },

    hide: function () {
      return $(this).each(function () {
        var settings = $(this).data('settings');
        $('#warpDatePicker_' + settings.uid).hide();
      });
    },

    getDate: function (format) {
      if (!format) {
        format = 'YYYY-MM-DD';
      }
      return $(this).data('settings') && $(this).data('settings').selectDate ? moment($(this).data('settings').selectDate).format(format) : '';
    },

    setDate: function (date) {
      return $(this).each(function () {
        var settings = $(this).data('settings');
        if (!settings) {
          return;
        }
        if (date) settings.selectDate = moment(date.replaceH());
        else settings.selectDate = '';
        $(this)
          .val(date)
          .data('settings', settings);
      });
    },

    // 设置最小日期
    setMinDate: function (date) {
      return $(this).each(function () {
        var settings = $(this).data('settings');
        if (!settings) {
          return;
        }
        if (date) {
          settings.minDate = date;
          if (settings.selectDate && settings.selectDate.isBefore(moment(date))) {
            $(this).val(moment(date).format('YYYY-MM-DD'));
            settings.selectDate = moment(date.replaceH());
          }
        } else {
          settings.minDate = '';
        }

        $(this).data('settings', settings);
      });
    },
    // 设置最大日期
    setMaxDate: function (date) {
      var settings = $(this).data('settings');
      settings.maxDate = date;
      $(this).data('settings', settings);
    },
  };

  var mdDatePicker = function (options) {
    this._defaults = {
      showOn: 'click',
      selectDate: '',
      titleFormat: 'YYYY-MM', // 标题日期
      format: 'YYYY-MM-DD',
      leftTitle: _l('上一月'),
      rightTitle: _l('下一月'),
      isdialog: true, // 默认弹层
      isClickHide: true, // 是否点击后隐藏
      selectToday: true, // 默认选中今天
      dialogStyle: {
        offsetLeft: 0, // 左偏移量
        offsetTop: 0, // 上偏移量
      },
      position: 'absolute',
      weekArr: [0, 1, 2, 3, 4, 5, 6].map(function (item) {
        return moment()
          .day(item)
          .format('dd');
      }),
      isElastic: true, // 日期不足高度伸缩
      minDate: '', // 最小日期
      maxDate: '', // 最大日期
      date: new Date(), // 默认日期
      isShowToday: true, // 显示今天按钮
      isShowTomorrow: true, // 显示明天按钮
      isShowClear: true, // 显示清除按钮
      zIndex: '10',
      toDayTitle: _l('今天'),
      tomorrowTitle: _l('明天'),
      clearTitle: _l('清除'),
      hideCalendarCallback: function () {},
      onChange: function () {},
    };

    this.$el = null;
    this.$cal = null;
    this.settings = $.extend({}, this._defaults, options);
  };

  $.extend(mdDatePicker.prototype, {
    // 初始化方法
    init: function () {
      this.getDefaultDate(); // 获取初始setting
      this.createDom(); // 填充初始框架
      this.createDatePicker(this.settings.year, this.settings.month, this.settings.selectDate); // 生成日历
      this.bindEvents(); // 绑定操作方法
    },
    // 初次加载生成setting
    getDefaultDate: function () {
      var $el = this.$el;
      var settings = this.settings;
      var date = '';

      // 值为空或者值不是日期字符串，采用setting中默认的日期
      if ($el.val() == '' || isNaN(new Date($el.val().replaceH()).getDate())) {
        date = moment(settings.date);
      } else {
        date = moment($el.val().replaceH());
        // selectDate => moment obj
        settings.selectDate = date;
      }

      settings.uid = new Date().getTime();
      settings.oldValue = $el.val();
      settings.year = date.format('YYYY');
      settings.month = date.format('MM');

      // 缓存参数
      $el.data('settings', settings);
    },
    // 创建基础dom
    createDom: function () {
      var _this = this;
      var settings = _this.settings;
      var $el = _this.$el;
      // 日历容器生成
      _this.$cal = $('<div/>').attr({
        id: 'warpDatePicker_' + settings.uid,
        class: 'warpDatePicker',
      });
      // 日历头部和尾部
      _this.createCalHeader();
      _this.createFooterBtns();
      // 更新位置
      _this.updatePosition();
    },
    // dom生成
    createCalHeader: function () {
      var $weekItems = $('<div/>').addClass('warpWeek clearfix'),
        settings = this.settings;
      var $calHeader = $('<div/>')
        .addClass('warpYearAndMonth')
        .html(
          '<span class="Left LeftSelect" title="' +
            settings.leftTitle +
            '"><i class="icon-arrow-left-border"></i></span>' +
            '<span class="lbYearAndMonth"></span>' +
            '<span class="Right RightSelect" title="' +
            settings.rightTitle +
            '"><i class="icon-arrow-right-border"></i></span>'
        );

      $.each(settings.weekArr, function (i, e) {
        $weekItems.append(
          $('<li>')
            .addClass('weekItem')
            .html(e)
        );
      });
      // header and Weekdays item
      this.$cal.append($calHeader.add($weekItems));
    },
    // buttons
    createFooterBtns: function () {
      var settings = this.settings;
      var hasToday = settings.isShowToday,
        hasTomorrow = settings.isShowTomorrow,
        hasClear = settings.isShowClear;

      var $btns = $('<div/>').addClass('warpDatePickerOperator'),
        $todayBtn = $('<span/>').html($('<span class="warpDatePickerToday">' + settings.toDayTitle + '</span>')),
        $tomorrowBtn = $('<span/>').html($('<span class="warpDatePickerTomorrow">' + settings.tomorrowTitle + '</span>')),
        $clearBtn = $('<span/>').html($('<span class="warpDatePickerClear">' + settings.clearTitle + '</span>'));
      if (hasToday) {
        $btns.append($todayBtn);
      }
      if (hasTomorrow) {
        $btns.append($tomorrowBtn);
      }
      if (hasClear) {
        $btns.append($clearBtn);
      }
      this.$cal.append($btns);
    },

    // 创建日期组件
    createDatePicker: function (year, month, selectDate) {
      var _this = this;
      var $el = _this.$el,
        $warpDatePicker = _this.$cal;
      var settings = _this.settings;

      settings.year = year;
      settings.month = month;
      settings.selectDate = selectDate;

      $warpDatePicker.find('.lbYearAndMonth').html(moment(new Date(year + '/' + month + '/1')).format(settings.titleFormat));
      // 填充日期
      var dayList = $('<div/>')
        .addClass('warpDay')
        .html(_this.createDayDom());

      $warpDatePicker
        .find('.warpDay')
        .empty()
        .end()
        .find('.warpWeek')
        .after(dayList);
    },

    // 返回日期数组列表
    createDayArr: function () {
      var _this = this;
      var settings = _this.settings;
      // local variable
      var resultDayArr = [],
        weekArr = [];

      var day = 1, // 时间增量
        startWeek = new Date(settings.year + '/' + settings.month + '/' + 1).getDay(), // 计算第一天开始位置
        dayCount = _this.getLastDay(); // 当月天数

      for (var i = 0; i < Math.ceil((startWeek + dayCount) / 7); i++) {
        weekArr = []; // 每行数据
        for (var j = 0; j < 7; j++) {
          var index = i * 7 + j,
            dateNum = index - startWeek + 1;

          if (dateNum <= 0) {
            weekArr.push(0);
            continue;
          } else if (dateNum > dayCount) {
            break;
          }

          var dateModel = _this.renderDayModel(dateNum, j);
          weekArr.push(dateModel);
        }
        resultDayArr.push(weekArr.slice(0));
      }
      return resultDayArr;
    },

    // 获取最后一天
    getLastDay: function () {
      var settings = this.settings;
      var year = settings.year; // 取当前的年份
      var month = settings.month;
      return new Date(year, month, '0').getDate(); // 获取当月最后一天日期, 月天数
    },

    // 数据原型
    DayModel: function (year, month, week, day, isToday, isSelect, isOverdue) {
      this.year = year;
      this.week = week;
      this.day = day;
      this.month = month;
      this.isToday = isToday;
      this.isSelect = isSelect;
      this.isOverdue = isOverdue;
    },

    renderDayModel: function (dateNum, dayNum) {
      var _this = this;
      var settings = _this.settings;
      var addDay = dateNum, // 添加时间
        toDay = new Date(),
        isToday = false,
        isSelect = false,
        isOverdue = false;

      // 判断是否今天
      if (moment(new Date(settings.year, parseInt(settings.month) - 1, addDay)).isSame(new Date(), 'day')) {
        isToday = true;
      }

      // 判断当前选中的天
      if (
        settings.selectDate !== '' &&
        addDay == parseInt(settings.selectDate.format('DD')) &&
        settings.month == settings.selectDate.format('MM') &&
        settings.year == settings.selectDate.format('YYYY')
      ) {
        isSelect = true;
      }

      // 判断是否小于minDate 或者大于maxDate
      if (
        (settings.minDate && moment(settings.year + '/' + settings.month + '/' + addDay) < moment(settings.minDate)) ||
        (settings.maxDate && moment(settings.year + '/' + settings.month + '/' + addDay) > moment(settings.maxDate.replaceH()))
      ) {
        isOverdue = true;
      }

      return new _this.DayModel(settings.year, settings.month, dayNum, addDay, isToday, isSelect, isOverdue);
    },

    // 返回日期列表dom
    createDayDom: function () {
      var days = this.createDayArr();
      // 构造日期
      var strHtml = ''; // html
      var toDay = ''; // 今天
      var currSelect = ''; // 选择天
      var overdue = ''; // 过期天
      for (var i = 0; i < days.length; i++) {
        strHtml += '<ul class="clearfix">';
        for (var j = 0; j < days[i].length; j++) {
          if (days[i][j] === 0) strHtml += '<li class="dayItemNone"></li>';
          else {
            toDay = days[i][j].isToday ? 'toDay' : '';
            currSelect = days[i][j].isSelect ? 'currSelect' : '';
            overdue = days[i][j].isOverdue ? 'overdue' : '';
            strHtml +=
              '<li class="ThemeColor3 ThemeBGColor3 ThemeBorderColor3 dayItem ' +
              currSelect +
              ' ' +
              toDay +
              ' ' +
              overdue +
              '" data-day="' +
              days[i][j].day +
              '">' +
              days[i][j].day +
              '</li>';
          }
        }
        strHtml += '</ul>';
      }
      return strHtml;
    },

    // 更新位置
    updatePosition: function () {
      var _this = this;
      var settings = _this.settings;

      if (settings.isdialog) {
        $('body').append(_this.$cal);
      } else {
        _this.$el.append(_this.$cal);
      }

      if (settings.isdialog) {
        var $warpDatePicker = _this.$cal;

        var offset = _this.$el.offset();
        var top = '',
          left = '';

        // 日历宽高
        var cWidth = $warpDatePicker.width();
        var cHeight = $warpDatePicker.height() + 17;

        // 窗体宽高
        var winWidth = $(window).width();
        var winHeight = $(window).height();

        // 偏移量宽高
        var offsetTop = settings.dialogStyle.offsetTop;
        var offsetLeft = settings.dialogStyle.offsetLeft;

        if (offset.left + cWidth + offsetLeft > winWidth && cWidth + offsetLeft <= offset.left) {
          left = offset.left - cWidth - offsetLeft;
        } else {
          left = offset.left + offsetLeft;
        }

        if (offset.top + cHeight + offsetTop > winHeight && cHeight + offsetTop <= offset.top) {
          top = offset.top - cHeight;
        } else {
          top = offset.top + offsetTop;
        }

        $warpDatePicker.css({
          left: left,
          top: top,
          'z-index': settings.zIndex,
          position: settings.position,
        });
      }
    },

    // 绑定操作方法
    bindEvents: function () {
      var _this = this;
      var $el = _this.$el;
      var $warpDatePicker = _this.$cal;
      var settings = _this.settings;

      $el.on(settings.showOn, function () {
        console.time('showon');
        settings.oldValue = $el.val();
        var selectDate = settings.selectDate ? settings.selectDate : '';

        _this.createDatePicker(
          selectDate ? selectDate.format('YYYY') : moment(new Date()).format('YYYY'),
          selectDate ? selectDate.format('MM') : moment(new Date()).format('MM'),
          selectDate
        );

        // 更新位置
        _this.updatePosition();
        $warpDatePicker.show();
        console.timeEnd('showon');
      });

      // 左右箭头点击事件
      $warpDatePicker.find('.LeftSelect').on('click', function (event) {
        var preDate = moment([settings.year, settings.month - 1]).subtract(1, 'M');
        settings.year = preDate.year();
        settings.month = preDate.month() + 1;
        _this.createDatePicker(settings.year, settings.month, settings.selectDate);

        event.stopPropagation();
      });

      $warpDatePicker.find('.RightSelect').on('click', function (event) {
        var nextDate = moment([settings.year, settings.month - 1]).add(1, 'M');
        settings.year = nextDate.year();
        settings.month = nextDate.month() + 1;
        _this.createDatePicker(settings.year, settings.month, settings.selectDate);

        event.stopPropagation();
      });

      // 点击移除日历
      var DatePickerClickHide = function (refreshDatePicker) {
        // refreshDatePicker: 是否刷新日历列表
        if (settings.isClickHide) {
          $warpDatePicker.hide();
        }

        var CurrYear = new Date().getFullYear();
        var CurrMonth = new Date().getMonth() + 1;
        if (refreshDatePicker && (settings.year != CurrYear || settings.month != CurrMonth)) {
          var txtValue = $el.val().replaceH();
          settings.selectDate = txtValue != '' ? moment(txtValue) : '';
          settings.year = CurrYear;
          settings.month = CurrMonth;
          _this.createDatePicker(settings.year, settings.month, settings.selectDate);
        }
      };

      // 日期回调方法
      var onChangeCallback = function () {
        settings.oldValue = $el.val();
        if ($.isFunction(settings.onChange)) settings.onChange.call(_this, $el.val());
      };

      // 移除选中
      var ramoveCurrSelect = function () {
        $warpDatePicker.find('.dayItem').removeClass('currSelect');
      };

      // 日期列表点击
      $warpDatePicker.on('click', '.dayItem:not(".overdue,.currSelect")', function (event) {
        var txtValue = settings.year + '/' + settings.month + '/' + $(this).data('day');
        $el.val(moment(txtValue).format(settings.format));
        settings.selectDate = moment(txtValue);

        DatePickerClickHide(false);
        ramoveCurrSelect();
        $(this).addClass('currSelect');
        onChangeCallback();

        settings.selectDate = moment(txtValue);
        $el.data('settings', settings);

        event.stopPropagation();
      });

      // 点击今天
      $warpDatePicker.on('click', '.warpDatePickerToday', function (event) {
        $el.val(moment(new Date()).format(settings.format));
        DatePickerClickHide(true);

        ramoveCurrSelect();
        $warpDatePicker.find('.toDay').addClass('currSelect');
        onChangeCallback();

        settings.selectDate = moment(new Date());
        $el.data('settings', settings);

        event.stopPropagation();
      });

      // 点击明天
      $warpDatePicker.on('click', '.warpDatePickerTomorrow', function (event) {
        $el.val(
          moment(new Date())
            .add('days', 1)
            .format(settings.format)
        );
        DatePickerClickHide(true);

        ramoveCurrSelect();
        var $li = $warpDatePicker.find('.warpDay li');
        var $toDay = $warpDatePicker.find('.toDay');
        if ($toDay.length) {
          var index = $li.index($toDay) + 1;
          $li.eq(index).addClass('currSelect');
        }
        onChangeCallback();

        settings.selectDate = moment(new Date()).add('days', 1);
        $el.data('settings', settings);

        event.stopPropagation();
      });

      // 点击清除
      $warpDatePicker.on('click', '.warpDatePickerClear', function (event) {
        if ($el.val() != '') {
          $warpDatePicker.find('.dayItem').removeClass('currSelect');
          $el.val('');

          settings.selectDate = '';
          $el.data('settings', settings);

          DatePickerClickHide(false);

          onChangeCallback();
        } else {
          // 清除
          if ($.isFunction(settings.onClean)) {
            settings.onClean('');
          }
        }

        event.stopPropagation();
      });

      $(document).on('click.mdDatePicker' + settings.uid, function (event) {
        if (
          !$(event.target).is($el) &&
          !$(event.target)
            .parents()
            .is($el) &&
          !$(event.target)
            .prev()
            .is($el) &&
          !$(event.target).closest('.warpDatePicker').length &&
          $('.warpDatePicker').is(':visible')
        ) {
          if (settings.isdialog) $warpDatePicker.hide();

          // 点击body 隐藏回调
          if ($.isFunction(settings.hideCalendarCallback)) {
            settings.hideCalendarCallback.call(_this);
          }

          if (moment($el.val().replaceH()).unix() != moment(settings.oldValue).unix() && $el.val() != settings.oldValue) {
            // 失去焦点时判断值是否改变
            onChangeCallback();
          }
        }
      });
    },
  });

  // 扩展替换日期横杠为斜杠
  String.prototype.replaceH = function () {
    return this.replace(/-/g, '/');
  };
})(jQuery);
