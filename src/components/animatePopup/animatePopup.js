/** *********************************************************
 过程名称： animatePopup
 功能描述： 新建分享
 编写日期： 2015/12/30
 程序作者： Rocky
 ************************************************************/

/** *********************************************************
 过程名称： animatePopup
 功能描述： 新建分享
 编写日期： 2015/12/30
 程序作者： Rocky
 ************************************************************/

import './animatePopup.less';

var tpl = require('./animatePopup.html');
var doT = require('dot');

var animatePopup = function (options) {
  var defaultOptions = {
    title: '',
    content: '',
    status: 1, // 1 √ ，2 ！3 sync
    btnL: '', // 左按钮
    btnR: '', // 右按钮
    btnLFn: null, // 左按钮回调
    btnRFn: null, // 右按钮回调
    showClose: true, // 是否显示close按钮
    closeFn: null, // 关闭回调
    timeout: 5000, // 定时关闭时间
  };
  var settings = $.extend({}, defaultOptions, options);
  var timeOut;
  // 关闭上一个
  $('#animatePopup').remove();
  var statusClass = null;
  var iconClass = null;
  switch (settings.status) {
    case 1:
    default:
      statusClass = 'animatePopupSuccess';
      iconClass = 'icon-plus-interest';
      break;
    case 2:
      statusClass = 'animatePopupWarning';
      iconClass = 'icon-task-folder-message';
      break;
    case 3:
      statusClass = 'animatePopupSuccess';
      iconClass = 'icon-sync';
      break;
  }
  // 不同状态的颜色和图标
  var popupTpl = doT.template(tpl)({
    settings: settings,
    statusClass: statusClass,
    iconClass: iconClass,
  });
  var $animatePopup = $(popupTpl);
  $('body').append($animatePopup);
  var closeFn = function () {
    clearTimeout(timeOut);
    $animatePopup.addClass('ns-hide');
    if (typeof settings.closeFn === 'function') {
      settings.closeFn();
    }
  };
  $animatePopup.on('webkitAnimationEnd animationend', function () {
    var $this = $(this);
    if ($this.hasClass('ns-hide')) {
      $this.remove();
    }
    $this.removeClass('ns-show');
  });
  $animatePopup.on('click', '.animatePopupBtnL', function () {
    if (settings.btnLFn) {
      settings.btnLFn();
      closeFn();
    }
  });
  $animatePopup.on('click', '.animatePopupBtnR', function () {
    if (settings.btnRFn) {
      settings.btnRFn();
      closeFn();
    }
  });
  // 关闭
  $animatePopup.find('.animatePopupClose').on('click', function () {
    clearTimeout(timeOut);
    $animatePopup.addClass('ns-hide');
    if (typeof settings.closeFn === 'function') {
      settings.closeFn();
    }
  });

  $animatePopup.destroy = function () {
    $animatePopup.addClass('ns-hide');
    clearTimeout(timeOut);
    timeOut = null;
  };

  if (settings.timeout > 0) {
    timeOut = setTimeout(function () {
      $animatePopup.addClass('ns-hide');
    }, settings.timeout);
  }

  return $animatePopup;
};
module.exports = animatePopup;
