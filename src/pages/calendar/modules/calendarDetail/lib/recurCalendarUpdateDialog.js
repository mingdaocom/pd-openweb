import './css/recurUpdate.less';
import tpl from './template/repeatCalendarOperator.html';
import doT from 'dot';
import Dialog from 'ming-ui/components/Dialog';
import React from 'react';

export default function recurCalendarUpdate(
  { operatorTitle, recurTitle, recurCalendarUpdateFun },
  { isChildCalendar, isRecurChange, originRecur },
  { directRun, isEdit, callback } = {}
) {
  var directAll;
  var page = location.href.substr(location.href.lastIndexOf('/'));
  var locationUrl = page.substr(page.indexOf('_') + 1).split('_');
  if (originRecur && page.indexOf('detail') > 0 && locationUrl.length < 2) {
    directAll = true; // 只能修改全部 详情页 重复日程 不带recuTime
  }
  if (originRecur && !isChildCalendar && !directAll) {
    // 重复日程 非子日程 的 单个日程
    Dialog.confirm({
      dialogClasses: 'repeatCalendarOperator',
      width: 410,
      title: recurTitle,
      children: <div dangerouslySetInnerHTML={{ __html: doT.template(tpl)({ isRecurChange, isEdit }) }}></div>,
      noFooter: true,
      handleClose: () => {
        if ($.isFunction(callback)) {
          // 拖拽时取消
          callback();
        }
        $('.repeatCalendarOperator').parent().remove();
      }
    })
    $('#btnOperatorAlone:not(.disabled)').click(function (event) {
      // param: isAllCalendar
      $('.repeatCalendarOperator').parent().remove();
      recurCalendarUpdateFun(false);
      event.stopPropagation();
    });

    $('#btnOperatorAll').click(function (event) {
      // param: isAllCalendar
      $('.repeatCalendarOperator').parent().remove();
      recurCalendarUpdateFun(true);
      event.stopPropagation();
    });
  } else if (directRun) {
    // fullCalendar 拖拽
    recurCalendarUpdateFun(!isChildCalendar);
  } else {
    Dialog.confirm({
      dialogClasses: 'repeatCalendarOperator',
      width: 420,
      title: operatorTitle,
      children: <div></div>,
      onOk: () => {
        recurCalendarUpdateFun(!isChildCalendar);
      },
      handleClose: () => {
        if ($.isFunction(callback)) {
          callback();
        }
        $('.repeatCalendarOperator').parent().remove();
      }
    })
  }
}
