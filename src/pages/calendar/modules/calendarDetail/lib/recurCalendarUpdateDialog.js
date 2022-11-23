import 'src/components/mdDialog/dialog';
import './css/recurUpdate.less';
import tplFunc from './template/repeatCalendarOperator.tpl';

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
    var dialog = $.DialogLayer({
      dialogBoxID: 'repeatCalendarOperator',
      width: 410,
      container: {
        header: recurTitle,
        content: tplFunc({ isRecurChange, isEdit }),
        noText: '',
        yesText: '',
      },
      readyFn: function () {
        $('#btnOperatorAlone:not(.disabled)').click(function (event) {
          // param: isAllCalendar
          dialog.closeDialog();
          recurCalendarUpdateFun(false);
          event.stopPropagation();
        });

        $('#btnOperatorAll').click(function (event) {
          // param: isAllCalendar
          dialog.closeDialog();
          recurCalendarUpdateFun(true);
          event.stopPropagation();
        });
      },
      callback: function () {
        if ($.isFunction(callback)) {
          // 拖拽时取消
          callback();
        }
      },
    });
  } else if (directRun) {
    // fullCalendar 拖拽
    recurCalendarUpdateFun(!isChildCalendar);
  } else {
    var dialog = $.DialogLayer({
      dialogBoxID: 'repeatCalendarOperator',
      width: 350,
      container: {
        content: '<div></div>',
        header: operatorTitle,
        yesFn: function () {
          recurCalendarUpdateFun(!isChildCalendar);
        },
      },
      callback: function () {
        if ($.isFunction(callback)) {
          callback();
        }
      },
    });
  }
}
