import UploadFiles from 'src/components/UploadFiles';
import React from 'react';
import ReactDom from 'react-dom';
import './css/createCalendar.less';
import 'mdBusinessCard';
import 'quickSelectUser';
var moment = require('moment');
var ajaxRequest = require('src/api/calendar');
import timezone from './timezone';
import SelectTimezone from './component/SelectTimezone';
import RegExp from 'src/util/expression';
import { htmlEncodeReg, htmlDecodeReg } from 'src/util';

var CreateCalendar = function (opts) {
  var _this = this;
  var defaults = {
    frameid: 'createCalendar',
    Start: null, // 结束时间 String
    End: null, // 开始时间 String
    AllDay: false, // 是否全天
    MemberArray: [], // at到的人
    Message: null,
    ColorClass: [
      'calendarColorRed',
      'calendarColorViolet',
      'calendarColorBrown',
      'calendarColorOrange',
      'calendarColorBlue',
      'calendarColorGreen',
      'calendarColorYellow',
    ],
    isShowHoverMember: false,
    timer: '',
    timezone: -moment().utcOffset(),
    dialog: null,
    isAttachComplete: true,
    calendarMembers: null,
    defaultAttachmentData: [],
    defaultKcAttachmentData: [],
    createCalendarAttachments: {
      attachmentData: [],
      kcAttachmentData: [],
    },
    callback: null,
    createShare: true,
    ajaxRequest: require('src/api/calendar'),
  };

  _this.settings = $.extend(defaults, opts);

  // 参数处理
  var settings = _this.settings;
  settings.ColorClass[99] = 'calendarColorYellow';
  settings.ColorClass[100] = 'calendarColorBlue';

  var start = settings.Start;
  var end = settings.End;
  var msg = settings.Message;
  var datetime = msg ? CreateCalendar.methods.getDate(msg) : null;

  if (datetime && datetime !== 'Invalid Date') {
    settings.Start = datetime;
  }
  if (!start && !end) {
    settings.Start = moment().minute() < 30 ? moment().set('minute', 30).toDate() : moment().set('minute', 60).toDate();
    settings.End = moment(settings.Start).add(1, 'hour').toDate();
  } else {
    settings.Start = moment(start).toDate();
    settings.End = moment(end).toDate();
  }

  CreateCalendar.settings = settings;

  // 初始化
  _this.init();
};

$.extend(CreateCalendar.prototype, {
  // 初始化
  init: function () {
    var _this = this;
    var settings = this.settings;

    require([
      'mdDialog',
      'mdDatePicker',
      '@mdfe/timepicker',
      'md.select',
      'textboxList',
      'autoTextarea',
      'plupload',
    ], function () {
      // 阻止重复按键导致多个创建框的生成
      if ($('#' + settings.frameid).length > 0) {
        return;
      }

      // 创建弹出层
      settings.dialog = $.DialogLayer({
        dialogBoxID: settings.frameid,
        className: 'createCalendar_container',
        callback: function () {
          // 每次删除所有名片层
          $("[id^='messageDiv_']").remove();
          // mdDatePicker 移除
          $('#txtBeginDate, #txtEndDate, #txtOverDate').mdDatePicker('destroy');
        },
        container: {
          header: _l('创建日程'),
          yesText: '',
          noText: '',
          yesFn: function () {
            return _this.send();
          },
        },
        width: 570,
        readyFn: function () {
          $('#txtCalendarName').focus();
        },
        isSameClose: false,
      });

      // 加载模板
      require(['dot', './tpl/createCalendar.html'], function (doT, taskHtml) {
        settings.dialog.content(doT.template(taskHtml)(settings));

        _this.eventInit();
        settings.dialog.dialogCenter();
      });
    });
  },

  // 事件初始化
  eventInit: function () {
    var _this = this;
    var settings = this.settings;

    // 分类事件
    _this.initCategoryEvent();

    // 绑定名片层
    _this.showCalendarMessageFun();

    // 时间事件
    _this.initDateEvent();

    // 初始化成员事件
    _this.initMemberEvent();

    // 日程提醒
    _this.initRemindEvent();

    // 私密日程
    _this.initIsPrivate();

    // 初始化附件
    _this.initAttachmentEvent();

    // tabs click
    $('#calendarTabs span').on('click', function (event) {
      var $this = $(this);
      var type = $this.attr('data-type');

      event.stopPropagation();

      switch (type) {
        case 'repeat':
          _this.initUpdateRepeat($this);
          break;
        case 'addMember':
          $('#addCalendarMembers').removeClass('Hidden');
          event.stopPropagation();
          $this.remove();
          break;
        case 'address':
          $('#addressContent').removeClass('Hidden');
          $('#txtAddress').focus();
          $this.remove();
          break;
        case 'desc':
          $('#createCalendarDesc').removeClass('Hidden');
          $('#txtDesc').focus();
          $this.remove();
          break;
        default:
          break;
      }
    });

    // 重复前面复选框勾选
    $('#repeatContent .createCalendarLabel').on('click', function () {
      $(this).find('.chekboxIcon').toggleClass('checked');
      $('#noRepeatContent,#existRepeatContent').toggleClass('Hidden');
    });

    // 更改重复时间
    $('#updateRepeatBtn').on('click', function () {
      _this.initUpdateRepeat();
    });

    if (settings.Message) {
      $('#txtDesc').val(htmlDecodeReg(settings.Message));
      $('#createCalendarDesc').show();
      $('#calendarTabs span[data-type=desc]').remove();
    }

    // 回车创建
    $('#txtCalendarName').on('keypress', function (event) {
      if (event.keyCode === 13) {
        $('#' + settings.frameid)
          .find('#calendarSubmitBtn')
          .click();
      }
    });

    // 创建
    $('#calendarSubmitBtn').on('click', function () {
      if ($(this).attr('disabled')) {
        return false;
      }
      $(this).attr('disabled', 'disabled');
      CreateCalendar.methods.send();
    });

    // 创建hover变色
    $('#calendarSubmitBtn').hover(
      function () {
        $(this).removeClass('ThemeBGColor3').addClass('ThemeBGColor2');
      },
      function () {
        $(this).removeClass('ThemeBGColor2').addClass('ThemeBGColor3');
      },
    );

    $(document).on('click', function (event) {
      var $target = $(event.target);

      // 隐藏分类
      if (!$target.closest('#calendarColorMain').length && !$target.closest('#createCategoryID').length) {
        $('#calendarColorMain').hide();
      }
    });
  },

  // 初始化分类事件
  initCategoryEvent: function () {
    var settings = this.settings;

    // 更改日程分类
    $('#createCategoryID').on('click', function () {
      var $calendarColorMain = $('#calendarColorMain');
      if ($calendarColorMain.html() === '') {
        CreateCalendar.methods.getCategory();
      } else {
        $calendarColorMain.show();
      }
    });

    // 日程分类列表点击
    $('#calendarColorMain').on('click', 'li', function () {
      // 取到当前分类
      var catid = $(this).attr('data-catid');
      var className = $(this).find('i').attr('class');
      var title = $(this).find('span').text();
      var $categoryID = $('#createCategoryID');

      if (catid !== $categoryID.attr('data-catid')) {
        $(this).addClass('selected').siblings().removeClass('selected');
        $categoryID
          .attr({
            'data-catid': catid,
            title: title,
          })
          .removeClass()
          .addClass('calendarColorModel boderRadAll_3 ' + className);
        $(this).parent().find('.selectIcon').prependTo($(this));
      }

      $('#calendarColorMain').hide();
    });
  },

  // 初始化日期事件
  initDateEvent: function () {
    var settings = this.settings;

    $('#txtBeginDatebox span, #txtEndDatebox span').on('click', function (event) {
      $(this).siblings('input').click();
      console.log(111);
    });

    // 开始日期
    $('#txtBeginDate').mdDatePicker({
      dialogStyle: {
        offsetLeft: -85, // 左偏移量
        offsetTop: 20, // 上偏移量
      },
      isShowClear: false,
      zIndex: 1002,
      onChange: function (dateText) {
        $('#txtOverDate').attr('value', moment(dateText).add(1, 'day').format('YYYY-MM-DD'));
        CreateCalendar.methods.checkDateTimeOption();
        CreateCalendar.methods.checkAllUserBusy();

        var week = moment($('#txtBeginDate').mdDatePicker('getDate')).day();
        $('#repeatTypeGroup .repeatTypeGroupBtn').removeClass('today').eq(week).addClass('ThemeBGColor3 today');
        CreateCalendar.methods.repeatResult();
      },
    });

    // 开始时间
    $('#txtBeginTimeCreate')
      .timepicker({
        timeFormat: 'H:i',
        'selectOnBlur ': 'true',
        closeOnWindowScroll: 'true',
        forceRoundTime: false,
        step: 15,
      })
      .change(function () {
        CreateCalendar.methods.checkDateTimeOption(1);
        CreateCalendar.methods.checkAllUserBusy();
        $('#txtBeginTimeCreate').blur();
      });

    // 结束日期
    $('#txtEndDate').mdDatePicker({
      dialogStyle: {
        offsetLeft: -85, // 左偏移量
        offsetTop: 20, // 上偏移量
      },
      isShowClear: false,
      zIndex: 1002,
      onChange: function (dateText) {
        CreateCalendar.methods.checkDateTimeOption();
        CreateCalendar.methods.checkAllUserBusy();
        $(this).blur();
      },
    });

    // 结束时间
    $('#txtEndTimeCreate')
      .timepicker({
        timeFormat: 'H:i',
        closeOnWindowScroll: 'true',
        forceRoundTime: false,
        disableTimeRanges: [['0:00', moment(settings.Start).format('HH:mm')]],
        minTime: moment(settings.Start).format('HH:mm'),
        maxTime: '23:45',
        step: 15,
        showDuration: true,
        lang: {
          decimal: '.',
          mins: _l('分钟'),
          hr: _l('小时'),
          hrs: _l('小时'),
        },
      })
      .change(function () {
        CreateCalendar.methods.checkDateTimeOption(2);
        CreateCalendar.methods.checkAllUserBusy();
        $('#txtEndTimeShow').find('span:first').text($('#txtEndTimeCreate').val());
        $('#txtEndTimeCreate').blur();
      });

    // 设置最小时间
    $('#txtEndDate').mdDatePicker('setMinDate', settings.Start);

    // 点击时间下拉
    $('#txtBeginDate')
      .next()
      .click(function () {
        $('#txtBeginDate').focus();
      });

    $('#txtEndDate')
      .next()
      .click(function () {
        $('#txtEndDate').focus();
      });

    // 时间 赋值
    var currentDate = new Date();
    if (settings.Start) {
      $('#txtBeginDate').mdDatePicker('setDate', moment(settings.Start).format('YYYY-MM-DD'));
      $("#txtBeginTimeCreate option[text='" + moment(settings.Start).format('HH:mm') + "']").attr('selected', true);
      $('#txtBeginTimeCreate')
        .children()
        .each(function (i, obj) {
          if ($(obj).text() === moment(settings.Start).format('HH:mm')) {
            $(obj).attr('selected', true);
          }
        });
      $('#txtBeginTimeCreate').val(moment(settings.Start).format('HH:mm'));
    }
    if (settings.End) {
      $('#txtEndDate').mdDatePicker('setDate', moment(settings.End).format('YYYY-MM-DD'));
      $("#txtEndTimeCreate option[text='" + moment(settings.End).format('H:mm') + "']").attr('selected', true);
      $('#txtEndTimeCreate')
        .children()
        .each(function (i, obj) {
          if ($(obj).text() === moment(settings.End).format('H:mm')) {
            $(obj).attr('selected', true);
          }
        });
      $('#txtEndTimeCreate').val(moment(settings.End).format('HH:mm'));
    }
    if (settings.AllDay) {
      $('#allDay').prop('checked', true).addClass('selected ThemeBorderColor3 ThemeColor3');
      $('#txtBeginTimeCreate,#txtEndTimeCreate').hide();
      $('#remindSelectCreate').val('2').siblings().find('.txtBox').attr('title', '小时').html('小时');
    }

    // 全天
    $('#allDay').on('click', function () {
      if ($(this).hasClass('selected')) {
        $('#txtBeginTimeCreate,#txtEndTimeCreate').show();
        $('#remindSelectCreate').val('1').siblings().find('.txtBox').attr('title', '分钟').html('分钟');
        $('#remindTextCreate').val('15');
      } else {
        $('#txtBeginTimeCreate,#txtEndTimeCreate').hide();
        $('#remindSelectCreate').val('2').siblings().find('.txtBox').attr('title', '小时').html('小时');
        $('#remindTextCreate').val('15');
      }
      $('#remindTextLableCreate, #remindTextCreate').show();
      $('.ui-timepicker-list').hide();
      $(this).toggleClass('selected');
    });

    /**
     * 点击时区,出现时区选择框
     */
    $('.timezone').click(function () {
      if ($('.timezoneWrap').length) {
        $('.timezoneWrap').show();
      } else {
        ReactDom.render(
          <SelectTimezone data={timezone} selectTimezone={timezone => (settings.timezone = timezone)} />,
          document.getElementById('selectTimezone'),
        );
      }
      $(this).hide();
    });

    $('#allDay').click(function () {
      const checked = $(this).prop('checked');
      if (checked) {
        $('.timezone').hide();
        $('.timezoneWrap').hide();
      } else {
        $('.timezone').show();
      }
    });

    // 初始化选中今天周几
    var week = moment($('#txtBeginDate').mdDatePicker('getDate')).day();
    $('#repeatTypeGroup .repeatTypeGroupBtn').eq(week).addClass('ThemeBGColor3 today');
    // 初始化设置选中时间
    $('#txtOverDate').attr('value', moment($('#txtBeginDate')).add(1, 'day').format('YYYY-MM-DD'));
  },

  // 初始化提醒事件
  initRemindEvent: function () {
    var allDay = this.settings.AllDay;
    // 提醒
    $('#remindSelectCreate').MDSelect({
      dataArr: [
        {
          name: _l('分钟'),
          id: '1',
        },
        {
          name: _l('小时'),
          id: '2',
        },
        {
          name: _l('天'),
          id: '3',
        },
        {
          name: _l('无'),
          id: '0',
        },
      ],
      zIndex: 1002,
      defualtSelectedValue: allDay ? '2' : '1',
      onChange: function (value, text) {
        var $remindText = $('#remindTextCreate');
        var $remindBox = $('#remindTextLableCreate');
        var $telRemid = $('.telRemindLabel');
        if (value == 0) {
          $remindBox.hide();
          $remindText.hide();
          $telRemid.addClass('Hidden').removeClass('InlineBlock');
        } else {
          if (value === '1') {
            $remindText.val('15');
          } else {
            $remindText.val('1');
          }
          $remindText.show().focus();
          $remindBox.show();
          $telRemid.removeClass('Hidden').addClass('InlineBlock');
        }
      },
    });

    $('.telRemindLabel')
      .find('label')
      .on('click', function () {
        $(this).find('.chekboxIcon').toggleClass('checked');
      });

    // 增加字体hover色
    $('.calendarRemind').on('mouseover', '.customSelect', function () {
      $(this).find('span').addClass('ThemeColor3');
    });

    // 提醒失去焦点
    $('#remindTextCreate').blur(function () {
      var remindText = parseInt($(this).val(), 10) || 1;
      $(this).val(remindText); // 可能有字母

      if (remindText > 99) {
        $(this).val(99);
      } else if (remindText < 1) {
        $(this).val(1);
      } else if (!(remindText >= 1 && remindText <= 99)) {
        $(this).val(1);
      }
    });
  },

  // 私密日程
  initIsPrivate: function () {
    if (!md.global.Account.projects.length) {
      $('#calendarPrivate').hide();
    }
    $('.isPrivateLabel').on('click', function () {
      $(this).find('.chekboxIcon').toggleClass('checked');
    });
  },

  // 初始化重复事件
  initRepeatEvent: function () {
    // 重复类型
    $('#tab_repeatType').MDSelect({
      dataArr: [
        {
          name: _l('每天'),
          id: '0',
        },
        {
          name: _l('每周'),
          id: '1',
        },
        {
          name: _l('每月'),
          id: '2',
        },
        {
          name: _l('每年'),
          id: '3',
        },
      ],
      defualtSelectedValue: $('#tab_repeatType').val(),
      width: '70',
      lineHeight: '24',
      zIndex: 100,
      onChange: function (value) {
        if (value == 1) {
          $('#repeatTypeGroup').show();
        } else {
          $('#repeatTypeGroup').hide();
        }

        var $repeatTypeLabel = $('#createRepeatTypeLabel');
        switch (parseInt(value, 10)) {
          case 0:
            $repeatTypeLabel.text(_l('天'));
            break;
          case 1:
            $repeatTypeLabel.text(_l('周'));
            break;
          case 2:
            $repeatTypeLabel.text(_l('月'));
            break;
          case 3:
            $repeatTypeLabel.text(_l('年'));
            break;
          default:
            break;
        }
        $('#tab_repeatType').siblings('.customSelect').find('.txtBox').attr('itemvalue', value);
        CreateCalendar.methods.repeatResult();
      },
    });

    // 重复次数
    $('#repetitionFrequency')
      .keyup(function () {
        if (!RegExp.isNum($(this).val())) {
          if (!$(this).val().trim()) {
            return;
          }
          $(this).attr('value', $(this).attr('defaultValue'));
          return false;
        }

        var value = $(this).val();
        var len = value.length;
        if (len > 2) {
          $(this).attr('value', value.substring(0, 2));
          return;
        }
        if (parseInt(value, 10) > 30) {
          $(this).attr('value', 30);
          return;
        }
        $(this).attr({ defaultValue: value, value: value });
      })
      .blur(function () {
        if (!RegExp.isNum($(this).val())) {
          $(this).attr('value', $(this).attr('defaultValue'));
        }
        if (parseInt($(this).val(), 10) === 0) {
          $(this).attr('value', 1);
        }
        CreateCalendar.methods.repeatResult();
      });

    // 点击按钮
    $('#repeatTypeGroup .repeatTypeGroupBtn').on('click', function () {
      $(this).toggleClass('ThemeBGColor3');
      CreateCalendar.methods.repeatResult();
    });

    // 结束类型
    $('#tab_repeatTime').MDSelect({
      dataArr: [
        {
          name: _l('永不'),
          id: '0',
        },
        {
          name: _l('次数'),
          id: '1',
        },
        {
          name: _l('日期'),
          id: '2',
        },
      ],
      defualtSelectedValue: $('#tab_repeatTime').val(),
      width: '70',
      lineHeight: '24',
      onChange: function (value) {
        switch (parseInt(value, 10)) {
          case 0:
            $('#overCount').hide();
            $('#overTime').hide();
            break;
          case 1:
            $('#overTime').hide();
            $('#overCount').show();
            break;
          case 2:
            $('#overCount').hide();
            $('#overTime').show();
            break;
          default:
            break;
        }

        $('#tab_repeatTime').siblings('.customSelect').find('.txtBox').attr('itemvalue', value);
        CreateCalendar.methods.repeatResult();
      },
    });

    // 重复结束次数
    $('#txtOverCount')
      .keyup(function () {
        if (!RegExp.isNum($(this).val())) {
          if (!$(this).val().trim()) {
            return;
          }
          $(this).attr('value', $(this).attr('defaultValue'));
          return false;
        }

        var value = $(this).val();
        var len = value.length;
        if (len > 2) {
          $(this).attr('value', value.substring(0, 2));
          return;
        }
        if (parseInt(value, 10) > 30) {
          $(this).attr('value', 30);
          return;
        }
        $(this).attr({ defaultValue: value, value: value });
      })
      .blur(function () {
        if (!RegExp.isNum($(this).val())) {
          $(this).attr('value', $(this).attr('defaultValue'));
        }
        if (parseInt($(this).val(), 10) === 0) {
          $(this).attr('value', 1);
        }
        CreateCalendar.methods.repeatResult();
      });

    // 重复结束日期
    $('#txtOverDate')
      .removeClass('hasDatepicker')
      .mdDatePicker({
        dialogStyle: {
          offsetLeft: -85, // 左偏移量
          offsetTop: 20, // 上偏移量
        },
        isShowClear: false,
        zIndex: 1002,
        onChange: function (dateText, inst) {
          $('#txtOverDate').attr('value', dateText);
          CreateCalendar.methods.repeatResult();
        },
      });

    // 设置最小时间
    $('#txtOverDate').mdDatePicker('setMinDate', $('#txtBeginDate').mdDatePicker('getDate'));

    CreateCalendar.methods.repeatResult();
  },

  // 初始化更改重复事件
  initUpdateRepeat: function ($el) {
    var _this = this;
    var $repeatDialogMain = $.DialogLayer({
      dialogBoxID: 'repeatDialogMain',
      className: 'createCalendar_container',
      container: {
        header: _l('重复'),
        yesText: _l('确定'),
        content: $('#repeatDialog').html(),
        yesFn: function () {
          $('#repeatContent').removeClass('Hidden').find('.chekboxIcon').addClass('checked');
          if ($el) {
            $el.remove();
          }
        },
      },
      width: 570,
      isSameClose: false,
      readyFn: function () {
        $('#repeatDialog').html('');
        _this.initRepeatEvent();
      },
      callback: function () {
        $('#repeatDialogMain .customSelect').remove();
        $('#repeatDialog').html($('#repeatDialogMain .dialogContent').html());
      },
    });
  },

  // 初始化成员事件
  initMemberEvent: function () {
    var settings = this.settings;
    var memberList = '';
    var newMembers = [];
    var memberArr = settings.MemberArray;
    var has;
    var i;

    // hover移除成员
    $('#addCalendarMembers').on('click', '.imgMemberBox .removeMember', function (event) {
      $('#imgMemberMessage_' + $(this).parent().attr('data-id')).remove();
      $(this).parent().remove();
      event.stopPropagation();
    });

    // 外部传入的member
    if (memberArr.length) {
      memberArr.forEach(function (member) {
        newMembers.push({
          accountId: member.accountId, // 兼容动态chat
          avatar: member.avatar,
          fullname: member.fullname,
        });
      });

      $('#addCalendarMembers').removeClass('Hidden');
      $('#calendarTabs span[data-type=addMember]').remove();
      CreateCalendar.methods.insertMembers(newMembers);
    }

    // 添加成员
    $('#addCalendarMembers .createAddMember').on({
      click: function () {
        var _this = $(this);
        var existsIds = [];
        var updateMemberFun = function (users) {
          if (users.length === 1 && md.global.Account.accountId === users[0].accountId) {
            alert('不能添加自己');
            return;
          }
          CreateCalendar.methods.insertMembers(users);
        };

        // 页面上已经存在的成员
        $('.createAddMemberBox .createMember').each(function () {
          if ($(this).data('id')) {
            existsIds.push($(this).data('id'));
          }
        });

        _this.quickSelectUser({
          sourceId: '',
          projectId: '',
          offset: {
            top: 27,
            left: 0,
          },
          fromType: 5,
          zIndex: 1111,
          filterAccountIds: existsIds,
          SelectUserSettings: {
            filterAccountIds: existsIds,
            projectId: settings.ProjectID,
            callback: function (users) {
              updateMemberFun(users);
            },
          },
          selectCb: function (users) {
            updateMemberFun(users);
          },
          ChooseInviteSettings: {
            callback: function (users, callbackInviteResult) {
              if (typeof callbackInviteResult === 'function') {
                callbackInviteResult({ status: 1 });
              }
              updateMemberFun(users);
            },
          },
        });
      },
    });
  },

  // 绑定名片层
  showCalendarMessageFun: function () {
    $('#' + this.settings.frameid).on(
      {
        mouseover: function (event) {
          var $that = $(this);
          var accountId = $that.attr('data-id');
          var account = $that.attr('data-account');
          var userName = $that.attr('data-name');
          if (!$that.data('hasbusinesscard')) {
            var avatar = $that.find('.createMember').attr('src');
            var email = RegExp.isEmail(account) ? account : '';
            var mobile = !email ? account : '';
            var status = accountId ? 1 : 3;
            $that.mdBusinessCard({
              id: 'imgMemberMessage',
              noRequestData: !accountId,
              accountId: accountId || new Date().getTime(),
              data: {
                avatar: avatar,
                userName: userName,
                accountId: email || mobile,
                status: status,
                email: email || '',
                mobilePhone: mobile || '',
              },
              readyFn: function (settings) {
                accountId = settings.accountId;
                email = settings.data.email;
                mobile = settings.data.mobilePhone;
                var $imgMemberBox;
                if (typeof accountId === 'string') {
                  // 判断是不是时间戳,时间戳则为老用户
                  $imgMemberBox = $(".imgMemberBox[data-id='" + accountId + "']");
                } else {
                  $imgMemberBox = $(".imgMemberBox[data-account='" + (email || mobile) + "']");
                }
                var busyContainer =
                  '<div class="hoverMemberContainer Hidden">' + '<div class="hoverMember">' + '</div>' + '</div>';
                $('#imgMemberMessage_' + accountId).append(busyContainer);
                CreateCalendar.methods.checkUserBusyState($imgMemberBox);
                CreateCalendar.methods.getUserBusyHeight($imgMemberBox);
              },
            });
            $that.data('hasbusinesscard', true).mouseenter();
          }
        },
      },
      '.imgMemberBox',
    );
  },

  // 初始化附件事件
  initAttachmentEvent: function () {
    var settings = this.settings;
    // 描述
    $('#txtDesc').autoTextarea({
      minHeight: 24,
      maxHeight: 72,
    });

    settings.createCalendarAttachments.attachmentData = settings.defaultAttachmentData;
    settings.createCalendarAttachments.kcAttachmentData = settings.defaultKcAttachmentData;

    ReactDom.render(
      <UploadFiles
        isInitCall={true}
        maxWidth={220}
        onUploadComplete={res => {
          settings.isAttachComplete = res;
        }}
        temporaryData={settings.createCalendarAttachments.attachmentData}
        kcAttachmentData={settings.createCalendarAttachments.kcAttachmentData}
        onTemporaryDataUpdate={res => {
          settings.createCalendarAttachments.attachmentData = res;
        }}
        onKcAttachmentDataUpdate={res => {
          settings.createCalendarAttachments.kcAttachmentData = res;
        }}
      />,
      document.getElementById('createCalendarAttachment_updater'),
    );

    // 如果有默认文件
    if (settings.defaultAttachmentData.length || settings.defaultKcAttachmentData.length) {
      $('#createCalendarDesc').removeClass('Hidden');
      $('#calendarTabs span[data-type=desc]').remove();
    }
  },
});

CreateCalendar.methods = {
  // 插入成员到dom
  insertMembers: function (users) {
    var memberList = '';
    var isExistes;
    var existsIds = [];
    var existsAccounts = [];

    // 页面上已经存在的成员
    $('.createAddMemberBox .createMember').each(function () {
      if ($(this).data('id')) {
        existsIds.push($(this).data('id'));
      } else {
        existsAccounts.push($(this).data('account'));
      }
    });

    var existsIdsCheckFun = function (i, id) {
      if (id === users[i].accountId) {
        isExistes = true;
        return false;
      }
    };

    var existsAccountsCheckFun = function (i, account) {
      if (account === users[i].account) {
        isExistes = true;
        var $imgMemberBox = $(".imgMemberBox[data-account='" + account + "']");
        $imgMemberBox.attr('data-name', htmlEncodeReg(users[i].fullname));
        $imgMemberBox.find('.createMember').attr({
          'data-name': htmlEncodeReg(users[i].fullname),
          src: users[i].avatar,
        });
        return false;
      }
    };

    for (var i = 0; i < users.length; i++) {
      isExistes = false;
      if (users[i].accountId === md.global.Account.accountId) {
        isExistes = true;
        continue;
      }

      $.each(existsIds, function (index, id) {
        existsIdsCheckFun(i, id);
      });
      $.each(existsAccounts, function (index, account) {
        existsAccountsCheckFun(i, account);
      });

      if (!isExistes) {
        memberList +=
          '<span class="imgMemberBox" data-id="' +
          (users[i].accountId || '') +
          '" data-account="' +
          (users[i].account || '') +
          '" data-name="' +
          (htmlEncodeReg(users[i].fullname) || '') +
          '">';
        memberList += '<span class="removeMember circle "><i class="icon-delete Icon"></i></span>';
        memberList += '<span class="busyIcon pointer"></span>';
        memberList +=
          '<img class="createMember circle imgWidth" data-id="' +
          (users[i].accountId || '') +
          '"data-account="' +
          (users[i].account || '') +
          '" data-name="' +
          (htmlEncodeReg(users[i].fullname) || '') +
          '" src="' +
          users[i].avatar +
          '" />';
        memberList += '</span>';
      }
    }
    var $memberList = $(memberList);
    $memberList.each(function (index, elem) {
      CreateCalendar.methods.checkUserBusyState($(elem));
    });
    $('.createAddMember').before($memberList);
  },
  // 从文本中提取时间
  getDate: function (msg) {
    // 从日期中匹配出时间
    var date = null;
    var time = null;
    var regDate =
      /(今天)|(明天)|(后天)|下周([一二三四五六日])|周([一二三四五六日])|(([0-9]{2,4})年)?([0-9]{1,2})月([0-9]{1,2})[日,号]|([0-9]{1,2})[日,号]|([0-9]{1,2}[号,日])|([0-9]{1,2})[.]([0-9]{1,2})/g;
    var resultDate = null;
    var weekDay;
    var year;

    while (true) {
      resultDate = regDate.exec(msg);
      if (!regDate.lastIndex) {
        break;
      }
      if (date !== null) {
        continue;
      }
      if (resultDate[1]) {
        // 今天
        date = CreateCalendar.methods.addDay(0);
      } else if (resultDate[2]) {
        // 明天
        date = CreateCalendar.methods.addDay(1);
      } else if (resultDate[3]) {
        // 后天
        date = CreateCalendar.methods.addDay(2);
      } else if (resultDate[4]) {
        // result[4]==下周几中的"一"或者"二"....
        weekDay = CreateCalendar.methods.getWeekDay(resultDate[4]);
        var today = new Date();
        var firstDay = -today.getDay();
        date = CreateCalendar.methods.addDay(firstDay + 7 + weekDay);
      } else if (resultDate[5]) {
        // result[5]==周几中的"一“或者"二"或者。。。
        weekDay = CreateCalendar.methods.getWeekDay(resultDate[5]);
        var todayWeekDay = new Date().getDay();
        date = CreateCalendar.methods.addDay(weekDay - todayWeekDay);
      } else if (resultDate[8] && resultDate[9]) {
        // 年 7:月,8:日,年可为空
        year = !resultDate[7] ? new Date().getFullYear() : resultDate[7];
        date = resultDate[8] + '/' + resultDate[9] + '/' + year;
      } else if (resultDate[10]) {
        // 12日
        year = !resultDate[7] ? new Date().getFullYear() : resultDate[7];
        var month = !resultDate[8] ? new Date().getMonth() : resultDate[7];
        date = month + 1 + '/' + resultDate[10] + '/' + year;
      } else if (resultDate[12] && resultDate[13]) {
        // 7.12
        year = !resultDate[7] ? new Date().getFullYear() : resultDate[7];
        date = resultDate[12] + '/' + resultDate[13] + '/' + year;
      }
    }

    var regTime = /(([上|下])午)?([0-9]{1,2})点(([0-9]{1,2}))?|(([0-9]{1,2}):([0-9]{1,2}))/g;
    var timeResult = null;

    while (true) {
      timeResult = regTime.exec(msg);
      if (!regTime.lastIndex) {
        break;
      }
      if (time !== null) {
        continue;
      }
      if (timeResult[3]) {
        // 上午10点30分
        if (timeResult[2] == '上') {
          time = timeResult[3];
          time += timeResult[4] ? ':' + timeResult[5] : ':00';
        } else if (timeResult[2] == '下') {
          var start = parseInt(timeResult[3], 10) + 12;
          time += timeResult[4] ? start + ':' + timeResult[5] : start + ':00';
        } else {
          time = timeResult[3];
          time += timeResult[4] ? ':' + timeResult[5] : ':00';
        }
      } else if (timeResult[6]) {
        if (timeResult[7] && timeResult[8]) {
          time = timeResult[7] + ':' + timeResult[8];
        }
      }
    }

    if (time === null) {
      time = '00:00';
    }
    var dateTime = null;

    if (date) {
      dateTime = new Date(date + ' ' + time);
    }
    if (dateTime) {
      return dateTime;
    }
    return null;
  },

  // 从今天加减日期,返回字符串
  addDay: function (n) {
    var uom = new Date(new Date() - 0 + n * 86400000);
    uom = uom.getMonth() + 1 + '/' + uom.getDate() + '/' + uom.getFullYear();
    return uom;
  },

  // 获取星期几
  getWeekDay: function (str) {
    switch (str) {
      case '一':
        return 1;
      case '二':
        return 2;
      case '三':
        return 3;
      case '四':
        return 4;
      case '五':
        return 5;
      case '六':
        return 6;
      case '日':
        return 7;
      default:
        break;
    }
  },

  // 重复日程返回结果
  repeatResult: function () {
    var settings = CreateCalendar.settings;
    // 重复日程
    var type = parseInt($('#tab_repeatType').val(), 10);
    var recurType = parseInt($('#tab_repeatTime').val(), 10);
    var day = $('#repetitionFrequency').val();
    var count = $('#txtOverCount').val();
    var messages = '';
    var weekDay = [];
    var weekDayArray = [0, 1, 2, 3, 4, 5, 6].map(function (item) {
      return moment().day(item).format('dd');
    });
    var weeks;

    // 每天
    if (type === 0) {
      messages += _l('每') + (day == 1 ? '' : ' ' + day + ' ') + _l('天');
    } else if (type === 1) {
      // 每周
      messages += _l('每') + (day == 1 ? '' : ' ' + day + ' ') + _l('周') + ' ';

      for (var i = 0; i < $('#repeatTypeGroup .ThemeBGColor3').length; i++) {
        weeks = $('#repeatTypeGroup .ThemeBGColor3').eq(i).attr('index');
        weeks = weeks == 7 ? 0 : weeks;
        weekDay.push(weeks);
      }

      // 无选中 取今天
      if ($('#repeatTypeGroup .ThemeBGColor3').length === 0) {
        weeks = $('#repeatTypeGroup .today').attr('index');
        weeks = weeks == 7 ? 0 : weeks;
        weekDay.push(weeks);
      }

      weekDay = weekDay.sort();
      if (weekDay.length === 5 && weekDay[0] == 1 && weekDay[4] == 5) {
        messages += _l('在 工作日');
      } else {
        $.map(weekDay, function (item, index) {
          if (index === 0) {
            messages += _l('星期');
          } else {
            messages += '、';
          }
          messages += weekDayArray[weekDay[index]];
        });
      }
    } else if (type === 2) {
      // 每月
      messages += _l(
        '每%0月 在第 %1 天',
        day == 1 ? '' : ' ' + day + ' ',
        moment($('#txtBeginDate').mdDatePicker('getDate')).date(),
      );
    } else if (type === 3) {
      // 每年
      messages += _l(
        '每%0年 在 %1',
        day == 1 ? '' : ' ' + day + ' ',
        moment($('#txtBeginDate').mdDatePicker('getDate')).format(_l('MM月DD日')),
      );
    }

    if (recurType == 1) {
      messages += '，' + _l('共 %0 次', count);
    } else if (recurType == 2) {
      messages += '，' + _l('截止到 %0', moment($('#txtOverDate').val()).format(_l('YYYY年MM月DD日')));
    }

    $('#repeatReault,#existRepeatContent .repeatResultText').text(messages);
  },

  // 获取日程分类
  getCategory: function () {
    ajaxRequest
      .getUserAllCalCategories()
      .then(function (source) {
        if (source.code === 1) {
          var categorys = source.data || [];
          var listHtml =
            '<li class="ThemeBGColor3 selected" data-catid="1"><i class="icon-ok selectIcon"></i><i class="calendarColorBlue"></i><span class="ThemeColor3">' +
            _l('工作日程') +
            '</span></li>';

          for (var i = 0; i < categorys.length; i++) {
            listHtml +=
              '<li class="ThemeBGColor3" data-catid="' +
              categorys[i].catID +
              '"><i class="' +
              CreateCalendar.settings.ColorClass[categorys[i].color] +
              '"></i><span class="ThemeColor3">' +
              htmlEncodeReg(categorys[i].catName) +
              '</span></li>';
          }
          $('#calendarColorMain').html(listHtml).show();
        }
      })
      .fail(function () {
        alert('操作失败，请稍后再试', 3);
      });
  },

  // 日程成员忙碌状态
  checkAllUserBusy: function () {
    $('.createAddMemberBox .imgMemberBox').each(function () {
      CreateCalendar.methods.checkUserBusyState($(this));
    });
  },

  /**
   * 查看用户状态
   * @param  {object} [$elem] - 单个imgMemberBox的jquery元素对象
   */
  checkUserBusyState: function ($elem) {
    if (!md.global.Account.projects.length) {
      return;
    }
    var settings = CreateCalendar.settings;
    var selectedDate = CreateCalendar.methods.getDialogTime();
    var start = selectedDate.start;
    var end = selectedDate.end;
    var accountId = $elem.attr('data-id');
    var $imgMemberMessage = $('#imgMemberMessage_' + accountId);

    // 外部成员不进行检查
    if (!accountId) {
      return false;
    }

    settings.ajaxRequest
      .getUserBusyStatus({
        accountID: accountId,
        startDate: moment(start).toISOString(),
        endDate: moment(end).toISOString(),
      })
      .then(function (source) {
        if (source.code === 1) {
          var data = source.data;
          if (data.isBusy) {
            $elem.attr('busy', 'busy').addClass('imgMemberBusy');
            // 如果没有名片层则不填充数据
            if ($imgMemberMessage.length === 0) return;

            var top = $elem.offset().top;
            var left = $elem.offset().left;
            var tooltip =
              '<div style="color: #de2c00">' +
              '他的日程与您创建的日程有冲突' +
              '</div>' +
              '<div class="memberCalendars"></div>' +
              '<div class="loobCalendars">' +
              '<a class="lookAllCalendars" href="javascript:void(0);">查看他的空闲时间 ></a>' +
              '</div>';
            $imgMemberMessage.find('.hoverMember').html(tooltip);
            // 查看他的日程
            $imgMemberMessage.find('.lookAllCalendars').on('click', function () {
              var tartDate = $('#txtBeginDate').val();
              var queryUrl = 'userID=' + accountId + '&date=' + start + '&view=agendaWeek';
              window.open('/apps/calendar/home?' + queryUrl);
            });

            var memberCalendar = '';
            var calendarTime = '';
            var calendars = data.calendars;
            var calendarCount = calendars.length;
            var calendar;
            for (var i = 0; i < calendarCount; i++) {
              calendar = calendars[i];
              if (calendar.allDay == 'true') {
                calendarTime =
                  moment(calendar.startTime).format('YYYY-MM-DD') +
                  ' - ' +
                  moment(calendar.endTime).format('YYYY-MM-DD') +
                  ' (全天)';
              } else {
                calendarTime =
                  moment(calendar.startTime).format('YYYY-MM-DD HH:mm') +
                  ' - ' +
                  moment(calendar.endTime).format('YYYY-MM-DD HH:mm');
              }
              memberCalendar += '<div>';
              memberCalendar += '<span class="memberCalendarTime">' + calendarTime + '</span>';
              memberCalendar +=
                '<span class="memberCalendarName overflow_ellipsis"><a class="overflow_ellipsis" target="_blank" href="/apps/calendar/detail_' +
                calendar.calendarID +
                '">' +
                htmlEncodeReg(calendar.calendarName) +
                '</a></span>';
              memberCalendar += '</div>';
            }
            $imgMemberMessage.find('.memberCalendars').html(memberCalendar);
            $imgMemberMessage.find('.cardContentBox').css('min-height', '154px'); // 名片和冲突层等高
            $imgMemberMessage.find('.hoverMemberContainer').show();
          } else {
            $imgMemberMessage.find('.hoverMemberContainer').hide();
            $elem.attr('busy', '').removeClass('imgMemberBusy');
          }
        }
      });
  },

  // 调整日程冲突层的高度
  getUserBusyHeight: function ($elem) {
    var accountId = $elem.attr('data-id');
    var $imgMemberMessage = $('#imgMemberMessage_' + accountId);
    var height = $imgMemberMessage.find('.cardContentBox').height();
    $imgMemberMessage.find('.hoverMember').css('height', height);
    // 如果超出范围就出现在左边
    if ($imgMemberMessage && $imgMemberMessage.offset() && $imgMemberMessage.offset().left + 500 > $(window).width()) {
      $imgMemberMessage.find('.hoverMemberContainer').css({
        left: 'auto',
        right: 240,
      });
    }
  },

  // 获取日程时间
  getDialogTime: function () {
    var startDate = $('#txtBeginDate').mdDatePicker('getDate');
    var endDate = $('#txtEndDate').mdDatePicker('getDate');
    var startTime = $('#txtBeginTimeCreate').val();
    var endTime = $('#txtEndTimeCreate').val();
    var start = '';
    var end = '';

    if ($('#allDay').hasClass('selected')) {
      // 全天
      start = moment(startDate).format('YYYY-MM-DD') + ' 00:00';
      end = moment(endDate).format('YYYY-MM-DD') + ' 23:59';
    } else {
      start = moment(startDate).format('YYYY-MM-DD') + ' ' + startTime;
      end = moment(endDate).format('YYYY-MM-DD') + ' ' + endTime;
    }
    return {
      start: start,
      end: end,
    };
  },

  // type: 1 点击开始时间  2 结束时间  改变日程时间
  checkDateTimeOption: function (type) {
    // 点击开始时间
    var bDate = moment($('#txtBeginDate').val());
    var eDate = moment($('#txtEndDate').val());
    $('#txtEndDate').mdDatePicker('setMinDate', bDate.format('YYYY-MM-DD'));

    if (type == 1 && !bDate.isBefore(eDate)) {
      CreateCalendar.methods.checkDateTimeOptionFun(bDate, eDate);
    } else if (type == 2) {
      // 点击结束时间
      if (bDate.isSame(eDate)) {
        // 同一天
        var startTime = moment($('#txtBeginTimeCreate').timepicker('getTime')).format('HH:mm');
        var endTime = moment($('#txtEndTimeCreate').timepicker('getTime')).format('HH:mm');
        var startTimeBranch = parseInt(startTime.split(':')[0] * 60, 10) + parseInt(startTime.split(':')[1], 10);
        var endTimeBranch = parseInt(endTime.split(':')[0] * 60, 10) + parseInt(endTime.split(':')[1], 10);
        // 结束时间小于开始时间
        if (endTimeBranch < startTimeBranch) {
          $('#txtEndDate').val(bDate.add(1, 'day').format('YYYY-MM-DD'));
          CreateCalendar.methods.txtEndTimeRemoveFun();
        }
      }
    } else {
      // 点击日期
      if (!bDate.isBefore(eDate)) {
        CreateCalendar.methods.checkDateTimeOptionFun(bDate, eDate);
      } else {
        CreateCalendar.methods.txtEndTimeRemoveFun();
      }
    }
  },

  // 结束时间移除方法
  txtEndTimeRemoveFun: function () {
    $('#txtEndTimeCreate').timepicker('remove');
    $('#txtEndTimeCreate').timepicker({
      timeFormat: 'H:i',
      closeOnWindowScroll: 'true',
      forceRoundTime: false,
    });
  },

  // 检测日期时间
  checkDateTimeOptionFun: function (bDate, eDate) {
    var startTime = moment('2016-01-01 ' + $('#txtBeginTimeCreate').val());
    var endTime = moment('2016-01-01 ' + $('#txtEndTimeCreate').val());

    $('#txtEndTimeCreate').timepicker('remove');
    $('#txtEndTimeCreate').timepicker({
      timeFormat: 'H:i',
      closeOnWindowScroll: 'true',
      forceRoundTime: false,
      disableTimeRanges: [['0:00', startTime.format('HH:mm')]],
      minTime: startTime.format('HH:mm'),
      maxTime: '23:45',
      step: 15,
      showDuration: true,
      lang: {
        decimal: '.',
        mins: _l('分钟'),
        hr: _l('小时'),
        hrs: _l('小时'),
      },
    });

    if ((bDate.isSame(eDate) || bDate.isAfter(eDate)) && startTime.unix() >= endTime.unix()) {
      var timeHours = startTime.hours() + 1;
      startTime.add(1, 'hour');
      if (timeHours >= 24) {
        $('#txtEndDate').val(bDate.add(1, 'day').format('YYYY-MM-DD'));
        CreateCalendar.methods.txtEndTimeRemoveFun();
      }

      $('#txtEndTimeCreate').timepicker('setTime', startTime.format('HH:mm'));
    }
  },

  // 是否查看创建的日程
  yesSelCalendar: function (data) {
    require(['createShare'], function (createShare) {
      createShare.init({
        linkURL: md.global.Config.WebUrl + 'apps/calendar/detail_' + data.calendarID,
        content: '日程创建成功',
        isCalendar: true,
        calendarOpt: {
          title: '分享日程',
          openURL: md.global.Config.WebUrl + 'm/detail/calendar/',
          isAdmin: true,
          keyStatus: true,
          name: data.name,
          startTime: data.startDate,
          endTime: data.endDate,
          address: data.address,
          shareID: data.calendarID,
          recurTime: '',
          token: data.token,
          ajaxRequest: CreateCalendar.settings.ajaxRequest,
        },
      });
    });
  },

  // 创建
  send: function () {
    var settings = CreateCalendar.settings;
    var $submitBtn = $('#calendarSubmitBtn');

    // 附件是否上传完成
    if (!settings.isAttachComplete) {
      alert('文件上传中，请稍等', 3);
      $submitBtn.removeAttr('disabled');
      return false;
    }

    var eventName = $.trim($('#txtCalendarName').val());

    // 日程名称是否为空
    if (eventName === '') {
      alert('请输入日程名称', 3);
      $('#txtCalendarName').focus();
      $submitBtn.removeAttr('disabled');
      return false;
    }

    var address = $.trim($('#txtAddress').val());
    var desc = $.trim($('#txtDesc').val());
    var startDate = $('#txtBeginDate').val();
    var endDate = $('#txtEndDate').val();
    var startTime = $('#txtBeginTimeCreate').val();
    var endTime = $('#txtEndTimeCreate').val();
    var isAll = $('#allDay').hasClass('selected');
    var isRecur = $('#repeatContent .chekboxIcon').hasClass('checked');
    var categoryID = $('#createCategoryID').attr('data-catid');
    var remindType = $('#remindSelectCreate').val();
    var remindTime = remindType == 0 ? 0 : $('#remindTextCreate').val();
    var voiceRemind = $('.telRemindLabel').is(':visible') && $('.telRemindLabel .chekboxIcon').hasClass('checked');
    var isPrivate = $('.isPrivateLabel .chekboxIcon').hasClass('checked');
    var frequency = 0;
    var interval = '';
    var recurCount = 0;
    var untilDate = '';
    var weekDay = 0;

    if (isAll) {
      startTime = '00:00';
      endTime = '23:59';
    }

    const { timezone } = settings;
    let timezoneOffset = isAll ? 0 : timezone + moment().utcOffset();

    const start = moment(`${startDate} ${startTime}`).add(timezoneOffset, 'm');
    const end = moment(`${endDate} ${endTime}`).add(timezoneOffset, 'm');

    if (!moment(end).isAfter(moment(start))) {
      $('#calendarSubmitBtn').removeAttr('disabled');
      alert('开始时间不能小于结束时间', 3);
      return false;
    }

    // 重复日程
    if (isRecur) {
      frequency = parseInt($('#tab_repeatType').val(), 10) + 1; // 类型
      weekDay = 0;

      // 重复为周
      if (frequency === 2) {
        var weekCount = 0;
        var $weekThis = $('#repeatTypeGroup .ThemeBGColor3');
        for (var i = 0; i < $weekThis.length; i++) {
          weekCount += parseInt($weekThis.eq(i).attr('week'), 10);
        }
        // 如果全部未选默认今天
        if (weekCount == 0) {
          weekCount += parseInt($('#repeatTypeGroup .today').attr('week'), 10);
        }
        weekDay = weekCount;

        const bjDay = moment(start).utcOffset(8).format('YYYY-MM-DD');
        const currentDay = moment(start)
          .utcOffset((timezone / 60) * -1)
          .format('YYYY-MM-DD');
        const diffDay = (moment(bjDay) - moment(currentDay)) / 24 / 60 / 60 / 1000;
        if (diffDay !== 0) {
          const weekDayArr = weekDay.toString(2).split('');
          let square;
          let newDays = 0;

          weekDayArr.forEach((num, i) => {
            num = parseInt(num);
            if (num === 1) {
              square = weekDayArr.length - i - 1 + diffDay;

              if (square > 6) {
                square = square - 7;
              } else if (square < 0) {
                square = square + 7;
              }

              newDays += Math.pow(2, square);
            }
          });
          weekDay = newDays;
        }
      }

      interval = $('#repetitionFrequency').val(); // 频率

      var time = $('#tab_repeatTime').val();
      recurCount = time == 1 ? parseInt($('#txtOverCount').val(), 10) : 0; // 次数
      untilDate = time == 2 ? moment($('#txtOverDate').val()).toISOString() : ''; // 截至日期
    }

    // 日程成员
    var members = [];
    var specialAccounts = {};
    $('#addCalendarMembers .createMember').each(function (index, item) {
      if ($(item).attr('data-id')) {
        members.push($(item).attr('data-id'));
      } else {
        specialAccounts[$(item).attr('data-account')] = $(item).attr('data-name');
      }
    });

    ajaxRequest
      .insertCalendar({
        name: eventName,
        address: address,
        desc: desc,
        startDate: moment(start).toISOString(),
        endDate: moment(end).toISOString(),
        isAll: isAll,
        membersIDs: members.join(','),
        specialAccounts: specialAccounts,
        categoryID: categoryID,
        isRecur: isRecur,
        attachments: JSON.stringify(settings.createCalendarAttachments.attachmentData),
        knowledgeAtt: JSON.stringify(settings.createCalendarAttachments.kcAttachmentData),
        remindTime: remindTime,
        remindType: remindType,
        frequency: frequency,
        interval: interval,
        recurCount: recurCount,
        untilDate: untilDate,
        weekDay: weekDay,
        isPrivate: isPrivate,
        voiceRemind,
      })
      .then(function (source) {
        if (source.code === 1) {
          source.data.name = eventName;

          if (window.location.href.indexOf('calendar') >= 0 && $('#calendar').length > 0) {
            // 日程列表刷新
            var viewName = $('#calendar').fullCalendar('getView').name;
            if (viewName === 'list') {
              $('.fc-list-button').trigger('refreshList');
            } else {
              $('#calendar').fullCalendar('refetchEvents');
            }
          }

          source.data.address = address;
          source.data.startDate = start;
          source.data.endDate = end;
          source.data.isRecur = isRecur;
          settings.dialog.closeDialog();
          if (settings.createShare) {
            CreateCalendar.methods.yesSelCalendar(source.data);
          }

          if ($.isFunction(settings.callback)) {
            settings.callback(source.data);
          }
        } else if (source.code === 9) {
          alert('邀请短信发送数量已达最大限制，请移除外部用户创建日程');
        }
      })
      .fail(function () {
        alert('操作失败，请稍后再试', 2);
      });
  },
};

// 导出
/**
 * 创建日程
 * @param  {object} [opts] 传入参数
 * @param {string} opts.start 日程开始时间 '2016-08-24 13:13:13'
 * @param {string} opts.end 日程结束时间 '2016-08-24 13:13:13'
 * @param {string} opts.Message 日程摘要
 * @param {object[]} opts.MemberArray 日程成员
 * @param {string} opts.MemberArray[].accountId 日程成员id
 * @param {string} opts.MemberArray[].avatar 日程成员头像地址
 * @param {string} opts.MemberArray[].fullname 日程成员名字
 * @return {object} 创建日程对象
 */
exports.index = function (opts) {
  return new CreateCalendar(opts);
};

// 加载时 执行 绑定 jquery
(function ($) {
  // 是否绑定过
  if (!$.CreateCalendar) {
    /**
     * 创建日程方法
     * @function external:$.CreateCalendar
     * @param {object} [opts] 传入参数
     * @param {string} opts.start 日程开始时间 '2016-08-24 13:13:13'
     * @param {string} opts.end 日程结束时间 '2016-08-24 13:13:13'
     * @param {string} opts.Message 日程摘要
     * @param {object[]} opts.MemberArray 日程成员
     * @param {string} opts.MemberArray[].accountId 日程成员id
     * @param {string} opts.MemberArray[].avatar 日程成员头像地址
     * @param {string} opts.MemberArray[].fullname 日程成员名字
     * @param {boolean} opts.AllDay 是否全天
     * @param {requestCallback} opts.callback 创建完成后的回调
     */
    $.CreateCalendar = function (opts) {
      return new CreateCalendar(opts);
    };
  }
})(jQuery);
