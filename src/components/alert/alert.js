let alertTimerArr = [];
import './style.css';

const alert = function(param) {
  var defaults = {
    msg: '',
    type: '1',
    timeout: 0,
    callback: function() {},
  };

  var options = $.extend(defaults, param);

  var _this = {};

  _this.timer = null;
  _this.init = function() {
    _this.clearTimer();
    var alterDialog = $('<span/>').attr('class', 'mdAlertDialog');
    if (options.type) {
      if (options.type == 2) {
        alterDialog.addClass('errorDialog');
      } else if (options.type == 3) {
        alterDialog.addClass('warningDialog');
      }
    }
    var tipMark = $('<span/>')
      .addClass('tipMark')
      .appendTo(alterDialog);
    var message = $('<span/>')
      .addClass('message')
      .html(options.msg)
      .appendTo(alterDialog);
    var close = $('<span/>')
      .addClass('mdClose')
      .text('×')
      .click(function(e) {
        e.stopPropagation();
        _this.close();
        _this.clearTimer();
      })
      .appendTo(alterDialog);
    $('<div/>')
      .addClass('Clear')
      .appendTo(alterDialog);
    $(document.body).append(alterDialog);

    $('.mdAlertDialog').css({
      top: ($(window).height() - ($('.mdAlertDialog').height() + 50)) / 2 + 'px',
      left: ($(window).width() - ($('.mdAlertDialog').width() + 50)) / 2 + 'px',
    });

    if (options.timeout != 0) {
      _this.timer = setTimeout(function() {
        _this.close();
      }, options.timeout);

      alertTimerArr.push(_this.timer);
    }
  };
  _this.close = function(isInit) {
    $('.mdAlertDialog').remove();
    _this.callback();
  };
  _this.clearTimer = function() {
    $('.mdAlertDialog').remove();
    for (var i = 0; i < alertTimerArr.length; i++) {
      var timer = alertTimerArr[i];
      if (timer) {
        clearTimeout(timer);
      }
    }
    alertTimerArr = [];
  };
  _this.callback = function() {
    if (options.callback) {
      options.callback();
    }
  };
  _this.init();
};

export default function(msg, type, timeout, callback) {
  if (timeout === undefined) {
    timeout = 3000;
  }
  var dfd = $.Deferred();
  alert({
    msg: msg,
    type: type,
    timeout: timeout,
    callback: function() {
      if (callback) {
        callback();
      }
      dfd.resolve();
    },
  });
  return dfd.promise();
}
