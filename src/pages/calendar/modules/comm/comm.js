import doT from 'dot';
import inviteSingleTpl from './tpl/refuserDialogHtml.html';
import calendarController from 'src/api/calendar';
import Dialog from 'ming-ui/components/Dialog';
import React from 'react';

// 页面 初始化
// 公用配置
// 页面 初始化
// 公用配置
var Comm = {};
// 公共设置
Comm.settings = {
  date: '',
  categorys: window.localStorage.getItem('categorys') ? window.localStorage.getItem('categorys').split(',') : [], // 已选择的分类
  isWorkCalendar:
    window.localStorage.getItem('isWorkCalendar') == null || window.localStorage.getItem('isWorkCalendar') == 'true',
  isTaskCalendar:
    window.localStorage.getItem('isTaskCalendar') == null || window.localStorage.getItem('isTaskCalendar') == 'true',
  filterTaskType:
    window.localStorage.getItem('filterTaskType') == null ? 2 : window.localStorage.getItem('filterTaskType'),
  otherUsers: [],
};

Comm.doT = doT;

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
    Dialog.confirm({
      dialogClasses: 'inviteDirectMessages',
      width: 488,
      title: <span className="resuserTitle ThemeColor3">{_l('请回复您不能参加的原因')}</span>,
      children: <div dangerouslySetInnerHTML={{ __html: Comm.doT.template(inviteSingleTpl)({}) }}></div>,
      okText: _l('不能参加'),
      removeCancelBtn: true,
      onOk: () => {
        // 其他
        var $selectRadio = $('#refuserstd input:radio:checked');
        var reason = $selectRadio.attr('id') == 'radOther' ? $('#txtrefuseReason').val().trim() : $selectRadio.val();

        if (reason === '' || reason == _l('输入您拒绝邀请的理由')) {
          alert('请输入不能参加的理由', 3);
          $('#txtrefuseReason').focus();
          return false;
        }

        Comm.confirmOrUnconfirmInviteMe(calendarId, 2, reason, recurTime, '');
      },
    });
    // 不能参加的理由
    $('#refuserstd').on('change', 'input:radio', function () {
      if ($('#radOther')[0].checked) {
        $('#txtrefuseReason').show();
      } else {
        $('#txtrefuseReason').hide();
      }
    });
  },
};

// 发送请求 state:1 确认参加 or state:2 拒绝参加
Comm.confirmOrUnconfirmInviteMe = function (calendarId, status, remark, recurTime, catID) {
  calendarController
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
  calendarController.getUserAllCalCategories().then(function (source) {
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
export default Comm;
