import React from 'react';
import doT from 'dot';
import { Dialog } from 'ming-ui';
import tpl from './template/reInvited.html';
import './css/reInvite.less';

// 更新日程后操作 是否弹出提示层 发送私信重新确认
export default function (confirmCallback, closeCallback) {
  var dialogId = 'calendarReInviteDialog';
  Dialog.confirm({
    dialogClasses: dialogId,
    width: 458,
    title: _l('提示'),
    noFooter: true,
    children: <div dangerouslySetInnerHTML={{ __html: doT.template(tpl)() }}></div>,
    handleClose: closeCallback,
  });

  setTimeout(() => {
    var $dialog = $('.' + dialogId);
    $dialog.on('click', '.Button', function (event) {
      var btnType = $(this).data('type');
      $('.calendarReInviteDialog').parent().remove();
      if (btnType === 'save') {
        // 保存
        confirmCallback(false, true);
      } else if (btnType === 'saveAndInvite') {
        // 保存并私信
        confirmCallback(true, true);
      }
      event.stopPropagation();
    });
  }, 200);
}
