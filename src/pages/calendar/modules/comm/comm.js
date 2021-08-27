// 页面 初始化
// 公用配置
// 页面 初始化
// 公用配置
var Comm = {};
// 公共设置
Comm.settings = {
  date: '',
  categorys: window.localStorage.getItem('categorys') ? window.localStorage.getItem('categorys').split(',') : [], // 已选择的分类
  isWorkCalendar: window.localStorage.getItem('isWorkCalendar') == null || window.localStorage.getItem('isWorkCalendar') == 'true',
  isTaskCalendar: window.localStorage.getItem('isTaskCalendar') == null || window.localStorage.getItem('isTaskCalendar') == 'true',
  filterTaskType: window.localStorage.getItem('filterTaskType') == null ? 2 : window.localStorage.getItem('filterTaskType'),
  otherUsers: [],
};

Comm.doT = require('dot');

// 请求方法集合
Comm.ajaxRequest = require('src/api/calendar');

// url参数
Comm.getQueryString = function (name) {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
  var r = window.location.search.substr(1).match(reg);
  if (r != null) return unescape(r[2]);
  return null;
};

// state:1 确认参加 or state:2 拒绝参加
Comm.inviteCalendar = {
  confirm: function (calendarId, recurTime, catID) {
    // 存在日程ID
    if (!calendarId) {
      alert(_l('操作失败'), 3);
      return;
    }
    // 确认参加
    Comm.confirmOrUnconfirmInviteMe(calendarId, 1, '', recurTime, catID);
  },
  refuse: function (calendarId, recurTime, catID) {
    require(['./tpl/refuserDialogHtml.html'], function (inviteSingleTpl) {
      $.DialogLayer({
        dialogBoxID: 'inviteDirectMessages',
        width: 488,
        container: {
          header: '<span class="resuserTitle ThemeColor3">请回复您不能参加的原因</span>',
          content: Comm.doT.template(inviteSingleTpl)({}),
          noText: '',
          yesText: '不能参加',
          yesFn: function () {
            // 其他
            var $selectRadio = $('#refuserstd input:radio:checked');
            var reason =
              $selectRadio.attr('id') == 'radOther'
                ? $('#txtrefuseReason')
                    .val()
                    .trim()
                : $selectRadio.val();

            if (reason === '' || reason == _l('输入您拒绝邀请的理由')) {
              alert('请输入不能参加的理由', 3);
              $('#txtrefuseReason').focus();
              return false;
            }

            Comm.confirmOrUnconfirmInviteMe(calendarId, 2, reason, recurTime, '');
          },
        },
        readyFn: function () {
          // 不能参加的理由
          $('#refuserstd').on('change', 'input:radio', function () {
            if ($('#radOther').attr('checked')) {
              $('#txtrefuseReason').show();
            } else {
              $('#txtrefuseReason').hide();
            }
          });
        },
      });
    });
  },
};

// 发送请求 state:1 确认参加 or state:2 拒绝参加
Comm.confirmOrUnconfirmInviteMe = function (calendarId, status, remark, recurTime, catID) {
  Comm.ajaxRequest
    .changeMember({
      calendarID: calendarId,
      recurTime: recurTime,
      catID: catID,
      newStatus: status,
      remark: remark,
    })
    .then(function (source) {
      if (source.code == 1) {
        alert(status == 2 ? '您已发送不能参加的原因' : _l('您已确认参加该日程'));

        var page = location.href.substr(location.href.lastIndexOf('/'));
        if (page.indexOf('detail') > 0) {
          setTimeout(function () {
            location.reload();
          }, 1000);
        } else {
          var $calendarNumber = $('#calendarNumber');
          var count = parseInt($calendarNumber.text(), 10) - 1;
          $calendarNumber.html(count);
          if (count === 0) {
            $calendarNumber.hide();
          }

          // 收起动画
          $('#inviteSinlge_' + calendarId).slideUp(600, function () {
            $(this).remove();
            if ($('#invitedCalendars .inviteSinlge').length === 0) {
              $('#calInvite').click();
            }
          });
        }
      } else if (source.code === 3) {
        alert('日程已被删除', 3);
      } else {
        alert(_l('修改失败'), 3);
      }
    });
};

// 报错处理
Comm.errorMessage = function (error) {
  console.log(error);
};

// 查找用户所有分类
Comm.getUserAllCalCategories = function (callback) {
  Comm.ajaxRequest.getUserAllCalCategories().then(function (source) {
    if (source.code == 1) {
      if ($.isFunction(callback)) {
        callback(source.data);
      }
    } else {
      Comm.errorMessage(source.msg);
    }
  });
};

// 导出配置
module.exports = Comm;
