import 'mdDialog';
import './css/recurUpdate.less';
/**
 * 重复日程操作
 * @param  {String}     operatorTitle       操作提示文字
 * @param  {String}     reCurTitle          重复操作提示文字
 * @param  {Function}   recurCalendarUpdateFun  操作函数
 * @param  {Boolean}    originRecur             是否重复
 * @param  {Boolean}    isChildCalendar     是否是特殊子日程
 * @param  {Object}     addSettings         额外变量 fullCalendar 拖拽使用
 * @return {Undefined}
 */
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
    var tplFunc = require('./template/repeatCalendarOperator.tpl');
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
