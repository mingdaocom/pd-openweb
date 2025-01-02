import UploadFiles from 'src/components/UploadFiles';
import React from 'react';
import { createRoot } from 'react-dom/client';
import './css/createCalendar.less';
import { quickSelectUser } from 'ming-ui/functions';
import ajaxRequest from 'src/api/calendar';
import timezone from './timezone';
import SelectTimezone from './component/SelectTimezone';
import { htmlEncodeReg, htmlDecodeReg } from 'src/util';
import doT from 'dot';
import taskHtml from './tpl/createCalendar.html';
import 'src/components/autoTextarea/autoTextarea';
import '@mdfe/jquery-plupload';
import createShare from 'src/components/createShare/createShare';
import moment from 'moment';
import _ from 'lodash';
import { Dialog, Dropdown, Tooltip, UserCard, DatePicker } from 'ming-ui';

const RangePicker = DatePicker.RangePicker;

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

    // 阻止重复按键导致多个创建框的生成
    if ($('.' + settings.frameid).length > 0) {
      return;
    }
    // 创建弹出层
    Dialog.confirm({
      dialogClasses: `${settings.frameid} createCalendar_container`,
      title: _l('创建日程'),
      width: 800,
      noFooter: true,
      onOk: () => {
        _this.send();
      },
      onCancel: () => {},
      handleClose: () => {
        $('.createCalendar_container').parent().remove();
        $('.PositionContainer-wrapper').remove();
      },
      children: (
        <div
          className="dialogContent"
          dangerouslySetInnerHTML={{ __html: doT.template(taskHtml)(Object.assign({}, settings, { moment })) }}
        ></div>
      ),
    });

    setTimeout(() => {
      _this.eventInit();
      $('#txtCalendarName').focus();
    }, 200);
  },

  // 事件初始化
  eventInit: function () {
    var _this = this;
    var settings = this.settings;

    // 分类事件
    _this.initCategoryEvent();

    // 时间事件
    _this.initDateEvent();

    /**
     * 点击时区,出现时区选择框
     */
    $('.timezone').click(function () {
      if ($('.timezoneWrap').length) {
        $('.timezoneWrap').show();
      } else {
        const root = createRoot(document.getElementById('selectTimezone'));
        root.render(<SelectTimezone data={timezone} selectTimezone={timezone => (settings.timezone = timezone)} />);
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

      _this.initDateEvent();
    });

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
        case 'address':
          $('#addressContent').removeClass('Hidden');
          $('#txtAddress').focus();
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
        $('.' + settings.frameid)
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
    const rangePickerProps = {
      offset: {
        left: 0,
        top: 5,
      },
      allowClear: false,
      selectedValue: [moment(settings.Start), moment(settings.End)],
      timePicker: !$('#allDay').prop('checked'),
      onOk: selectValue => {
        settings.Start = selectValue[0].format('YYYY-MM-DD HH:mm');
        settings.End = selectValue[1].format('YYYY-MM-DD HH:mm');
      },
      autoFillEndTime: 1,
    };
    const root = createRoot(document.getElementById('calendarDate'));

    root.render(
      <div className="Relative">
        <RangePicker {...rangePickerProps}></RangePicker>
      </div>,
    );
  },

  // 重复结束日期
  initOverTimeEvent: function () {
    var settings = this.settings;
    const overTimeRoot = createRoot($('.repeatDialogConfirm #createCalendarOverTime')[0]);
    overTimeRoot.render(
      <div className="Relative">
        <DatePicker
          timePicker={false}
          allowClear={false}
          min={moment(settings.Start)}
          selectedValue={settings.overTime ? moment(settings.overTime) : moment()}
          onOk={value => {
            settings.overTime = value.format('YYYY-MM-DD');
            CreateCalendar.methods.repeatResult();
          }}
        ></DatePicker>
      </div>,
    );
  },

  // 初始化提醒事件
  initRemindEvent: function () {
    var allDay = this.settings.AllDay;

    $('#remindSelectCreate').val(allDay ? '2' : '1');

    const root = createRoot(document.getElementById('remindSelectCreateBox'));
    root.render(
      <Dropdown
        data={[
          { text: _l('分钟'), value: '1' },
          { text: _l('小时'), value: '2' },
          { text: _l('天'), value: '3' },
          { text: _l('无'), value: '0' },
        ]}
        defaultValue={allDay ? '2' : '1'}
        onChange={value => {
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

          $('#remindSelectCreate').val(value);
        }}
      />,
    );

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
    var settings = this.settings;
    // 重复类型
    const root = createRoot($('.repeatDialogConfirm #tab_repeatTypeBox')[0]);
    root.render(
      <Dropdown
        data={[
          { text: _l('每天'), value: '0' },
          { text: _l('每周'), value: '1' },
          { text: _l('每月'), value: '2' },
          { text: _l('每年'), value: '3' },
        ]}
        defaultValue={$('.repeatDialogConfirm #tab_repeatType').val()}
        isAppendToBody
        onChange={value => {
          if (value == 1) {
            $('.repeatDialogConfirm #repeatTypeGroup').show();
          } else {
            $('.repeatDialogConfirm #repeatTypeGroup').hide();
          }

          var $repeatTypeLabel = $('.repeatDialogConfirm #createRepeatTypeLabel');
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

          $('.repeatDialogConfirm #tab_repeatType').val(value);
          $('.repeatDialogConfirm #tab_repeatType').siblings('.customSelect').find('.txtBox').attr('itemvalue', value);
          CreateCalendar.methods.repeatResult();
        }}
      />,
    );

    // 重复次数
    $('.repeatDialogConfirm #repetitionFrequency')
      .keyup(function () {
        if (!_.isNumber(parseInt($(this).val())) || _.isNaN($(this).val())) {
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
        if (!_.isNumber(parseInt($(this).val())) || _.isNaN($(this).val())) {
          $(this).attr('value', $(this).attr('defaultValue'));
        }
        if (parseInt($(this).val(), 10) === 0) {
          $(this).attr('value', 1);
        }
        CreateCalendar.methods.repeatResult();
      });

    // 点击按钮
    $('.repeatDialogConfirm #repeatTypeGroup .repeatTypeGroupBtn').on('click', function () {
      $(this).toggleClass('ThemeBGColor3');
      CreateCalendar.methods.repeatResult();
    });

    // 结束类型
    const endRoot = createRoot($('.repeatDialogConfirm #tab_repeatTimeBox')[0]);
    endRoot.render(
      <Dropdown
        data={[
          { text: _l('永不'), value: '0' },
          { text: _l('次数'), value: '1' },
          { text: _l('日期'), value: '2' },
        ]}
        defaultValue={$('.repeatDialogConfirm #tab_repeatTime').val()}
        isAppendToBody
        onChange={value => {
          switch (parseInt(value, 10)) {
            case 0:
              $('.repeatDialogConfirm #overCount').hide();
              $('.repeatDialogConfirm #createCalendarOverTime').removeClass('InlineBlock');
              break;
            case 1:
              $('.repeatDialogConfirm #createCalendarOverTime').removeClass('InlineBlock');
              $('.repeatDialogConfirm #overCount').show();
              break;
            case 2:
              $('.repeatDialogConfirm #overCount').hide();
              $('.repeatDialogConfirm #createCalendarOverTime').addClass('InlineBlock');
              break;
            default:
              break;
          }

          $('.repeatDialogConfirm #tab_repeatTime').val(value);
          $('.repeatDialogConfirm #tab_repeatTime').siblings('.customSelect').find('.txtBox').attr('itemvalue', value);
          CreateCalendar.methods.repeatResult();
        }}
      />,
    );

    // 重复结束次数
    $('.repeatDialogConfirm #txtOverCount')
      .keyup(function () {
        if (!$(this).val().trim()) {
          return;
        }

        if (!_.isNumber(parseInt($(this).val(), 10)) || _.isNaN(parseInt($(this).val(), 10))) {
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
        if (!_.isNumber(parseInt($(this).val(), 10)) || _.isNaN(parseInt($(this).val(), 10))) {
          $(this).attr('value', $(this).attr('defaultValue'));
        }
        if (parseInt($(this).val(), 10) === 0) {
          $(this).attr('value', 1);
        }
        CreateCalendar.methods.repeatResult();
      });

    this.initOverTimeEvent();

    CreateCalendar.methods.repeatResult();
  },

  // 初始化更改重复事件
  initUpdateRepeat: function ($el) {
    var _this = this;

    Dialog.confirm({
      dialogClasses: 'repeatDialogConfirm createCalendar_container',
      title: _l('重复'),
      width: 570,
      okText: _l('确定'),
      children: <div className="dialogContent" dangerouslySetInnerHTML={{ __html: $('#repeatDialog').html() }}></div>,
      onOk: () => {
        $('#repeatContent').removeClass('Hidden').find('.chekboxIcon').addClass('checked');
        if ($el) {
          $el.remove();
        }
        $('.repeatDialogConfirm .customSelect').remove();
        $('#repeatDialog.Hidden').html('');
        $('#repeatDialog.Hidden').html($('.repeatDialogConfirm .dialogContent').html());
      },
      onCancel: () => {
        $('.repeatDialogConfirm .customSelect').remove();
      },
      handleClose: () => {
        $('.repeatDialogConfirm .customSelect').remove();
        $('.repeatDialogConfirm').parent().remove();
      },
    });

    setTimeout(() => {
      _this.initRepeatEvent();
    }, 200);
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
      const parentEle = $(this).parents('.imgMemberBox');
      let removeAccountId = parentEle.attr('data-id');
      $('.imgMemberMessage_' + removeAccountId) &&
        $('.imgMemberMessage_' + removeAccountId)
          .parents('div[style]')
          .remove();
      parentEle.remove();
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
            alert(_l('不能添加自己'));
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

        quickSelectUser(_this[0], {
          sourceId: '',
          projectId: '',
          offset: {
            top: 27,
            left: 0,
          },
          fromType: 5,
          zIndex: 1111,
          selectedAccountIds: existsIds,
          isDynamic: true,
          SelectUserSettings: {
            selectedAccountIds: existsIds,
            projectId: settings.ProjectID,
            callback: function (users) {
              updateMemberFun(users);
            },
          },
          selectCb: function (users) {
            updateMemberFun(users);
          },
        });
      },
    });
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

    const root = createRoot(document.getElementById('createCalendarAttachment_updater'));
    root.render(
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
        memberList += `<span class="imgMemberBox noInsert" data-id="${users[i].accountId || ''}" data-account="${
          users[i].account || ''
        }" data-name="${htmlEncodeReg(users[i].fullname) || ''}"></span>`;
      }
    }
    var $memberList = $(memberList);
    $memberList.each(function (index, elem) {
      CreateCalendar.methods.checkUserBusyState($(elem));
    });
    $('.createAddMember').before($memberList);
    $('.createAddMemberBox')
      .find('.imgMemberBox.noInsert')
      .each((i, ele) => {
        const user = users[i];
        $(ele).removeClass('noInsert');

        const root = createRoot(ele);
        root.render(
          <span>
            <UserCard className={`imgMemberMessage_${user.accountId}`} sourceId={user.accountId}>
              <span>
                <span className="removeMember circle ">
                  <i className="icon-delete Icon"></i>
                </span>
                <img
                  className="createMember circle imgWidth"
                  src={user.avatar}
                  data-account={user.account}
                  data-id={user.accountId || ''}
                  data-name={htmlEncodeReg(user.fullname) || ''}
                />
              </span>
            </UserCard>
            <span className="busyIconWrap">
              <span className="busyIcon pointer"></span>
            </span>
          </span>,
        );
      });
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
    var type = parseInt($('.repeatDialogConfirm #tab_repeatType').val(), 10);
    var recurType = parseInt($('.repeatDialogConfirm #tab_repeatTime').val(), 10);
    var day = $('.repeatDialogConfirm #repetitionFrequency').val();
    var count = $('.repeatDialogConfirm #txtOverCount').val();
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

      for (var i = 0; i < $('.repeatDialogConfirm #repeatTypeGroup .ThemeBGColor3').length; i++) {
        weeks = $('.repeatDialogConfirm #repeatTypeGroup .ThemeBGColor3').eq(i).attr('index');
        weeks = weeks == 7 ? 0 : weeks;
        weekDay.push(weeks);
      }

      // 无选中 取今天
      if ($('.repeatDialogConfirm #repeatTypeGroup .ThemeBGColor3').length === 0) {
        weeks = $('.repeatDialogConfirm #repeatTypeGroup .today').attr('index');
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
          messages += weekDayArray[weekDay[index]] || '';
        });
      }
    } else if (type === 2) {
      // 每月
      messages += _l('每%0月 在第 %1 天', day == 1 ? '' : ' ' + day + ' ', moment(settings.Start).format('DD'));
    } else if (type === 3) {
      // 每年
      messages += _l('每%0年 在 %1', day == 1 ? '' : ' ' + day + ' ', moment(settings.Start).format(_l('MM月DD日')));
    }

    if (recurType == 1) {
      messages += '，' + _l('共 %0 次', count);
    } else if (recurType == 2) {
      var day = moment(settings.overTime).format(_l('YYYY年MM月DD日'));
      messages += '，' + _l('截止到 %0', day);
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
      .catch(function () {
        alert(_l('操作失败，请稍后再试'), 3);
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
    var $imgMemberMessage = $('.imgMemberMessage_' + accountId);
    const getFormatText = (date, format) => {
      var currentYear = moment(new Date()).years();
      let formatString = moment(date).years() === currentYear ? format.replace('YYYY-', '') : format;
      return formatString;
    };

    // 外部成员不进行检查
    if (!accountId) {
      return false;
    }

    ajaxRequest
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

            var calendars = data.calendars;

            const root = createRoot($elem.find('.busyIconWrap')[0]);
            root.render(
              <Tooltip
                placement="bottom"
                themeColor="white"
                tooltipStyle={{
                  width: 280,
                }}
                text={
                  <div className="memberBusyCalendarsWrap">
                    <div
                      style={{
                        color: '#de2c00',
                      }}
                      className="mBottom5"
                    >
                      {_l('他的日程与您创建的日程有冲突')}
                    </div>
                    <div className="memberCalendars mBottom20">
                      {calendars.map(calendar => {
                        var calendarTime = '';
                        if (calendar.allDay == 'true') {
                          calendarTime =
                            moment(calendar.startTime).format(getFormatText(calendar.startTime, 'YYYY-MM-DD')) +
                            ' - ' +
                            moment(calendar.endTime).format(getFormatText(calendar.endTime, 'YYYY-MM-DD ')) +
                            _l('(全天)');
                        } else {
                          calendarTime =
                            moment(calendar.startTime).format(getFormatText(calendar.startTime, 'YYYY-MM-DD HH:mm')) +
                            ' - ' +
                            moment(calendar.endTime).format(getFormatText(calendar.endTime, 'YYYY-MM-DD HH:mm'));
                        }

                        return (
                          <div className="memberCalendarItem">
                            <div className="memberCalendarTime Gray_9e">{calendarTime}</div>
                            <div className="memberCalendarName overflow_ellipsis">
                              <a
                                className="overflow_ellipsis"
                                target="_blank"
                                href={`/apps/calendar/detail_${calendar.calendarID}`}
                              >
                                {htmlEncodeReg(calendar.calendarName)}
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="loobCalendars">
                      <a
                        className="lookAllCalendars"
                        target="_blank"
                        href={`/apps/calendar/home?userID=${accountId}&date=${start}&view=agendaWeek`}
                      >
                        {_l('查看他的空闲时间 >')}
                      </a>
                    </div>
                  </div>
                }
              >
                <span className="busyIcon pointer"></span>
              </Tooltip>,
            );
          } else {
            $imgMemberMessage.find('.hoverMemberContainer').hide();
            $elem.attr('busy', '').removeClass('imgMemberBusy');
          }
        }
      });
  },

  // 获取日程时间
  getDialogTime: function () {
    var settings = CreateCalendar.settings;
    var startDate = settings.Start;
    var endDate = settings.End;

    return {
      start: $('#allDay').prop('checked') ? moment(startDate).format('YYYY-MM-DD') + ' 00:00' : startDate,
      end: $('#allDay').prop('checked') ? moment(endDate).format('YYYY-MM-DD') + ' 23:59' : endDate,
    };
  },

  // 是否查看创建的日程
  yesSelCalendar: function (data) {
    createShare({
      linkURL: md.global.Config.WebUrl + 'apps/calendar/detail_' + data.calendarID,
      content: _l('日程创建成功'),
      isCalendar: true,
      calendarOpt: {
        title: _l('分享日程'),
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
      },
    });
  },

  // 创建
  send: function () {
    var settings = CreateCalendar.settings;
    var $submitBtn = $('#calendarSubmitBtn');

    // 附件是否上传完成
    if (!settings.isAttachComplete) {
      alert(_l('文件上传中，请稍等'), 3);
      $submitBtn.removeAttr('disabled');
      return false;
    }

    var eventName = $.trim($('#txtCalendarName').val());

    // 日程名称是否为空
    if (eventName === '') {
      alert(_l('请输入日程标题'), 3);
      $('#txtCalendarName').focus();
      $submitBtn.removeAttr('disabled');
      return false;
    }

    var address = $.trim($('#txtAddress').val());
    var desc = $.trim($('#txtDesc').val());
    var startDate = settings.Start;
    var endDate = settings.End;
    var isAll = $('#allDay').prop('checked');
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

    const { timezone } = settings;
    let timezoneOffset = isAll ? 0 : timezone + moment().utcOffset();

    const start = moment(`${isAll ? moment(startDate).format('YYYY-MM-DD 00:00') : startDate}`).add(
      timezoneOffset,
      'm',
    );
    const end = moment(`${isAll ? moment(endDate).format('YYYY-MM-DD 00:00') : endDate}`).add(timezoneOffset, 'm');

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
      untilDate = time == 2 ? moment(settings.overTime).toISOString() : ''; // 截至日期
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
          $('.createCalendar_container').parent().remove();

          if ($.isFunction(settings.callback)) {
            settings.callback(source.data);
          }
        } else if (source.code === 9) {
          alert(_l('邀请短信发送数量已达最大限制，请移除外部用户创建日程'));
        }
      })
      .catch(function () {
        alert(_l('操作失败，请稍后再试'), 2);
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
export default function (opts) {
  return new CreateCalendar(opts);
}

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
