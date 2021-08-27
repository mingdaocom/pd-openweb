import 'mdDialog';
import reInvitedFunc from './template/reInvited.tpl';
import './css/reInvite.less';
// 更新日程后操作 是否弹出提示层 发送私信重新确认
export default function (confirmCallback, closeCallback) {
  var dialogId = 'calendarReInviteDialog';
  var dialog = $.DialogLayer({
    dialogBoxID: dialogId,
    width: 458,
    isSameClose: false,
    container: {
      header: _l('提示'),
      content: reInvitedFunc(),
      noText: '',
      yesText: '',
    },
    callback: closeCallback,
    readyFn: function () {
      var $dialog = $('#' + dialogId);
      $dialog.on('click', '.Button', function (event) {
        var btnType = $(this).data('type');
        dialog.closeDialog();
        if (btnType === 'save') {
          // 保存
          confirmCallback(false, true);
        } else if (btnType === 'saveAndInvite') {
          // 保存并私信
          confirmCallback(true, true);
        }
        event.stopPropagation();
      });
    },
  });
}
