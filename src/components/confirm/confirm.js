/**
 * Created by @henry on 2015/8/4.
 */

/**
 * Created by @henry on 2015/8/4.
 */

var doT = require('dot');
import 'modernizr';
import './confirm.css';
// require('draggabilly');

var animEndEventNames = {
  WebkitAnimation: 'webkitAnimationEnd',
  OAnimation: 'oAnimationEnd',
  msAnimation: 'MSAnimationEnd',
  animation: 'animationend',
};
var animEndEventName = animEndEventNames[Modernizr.prefixed('animation')];

var defaultOptions = {
  className: 'uploadConfirm',
  title: _l('确认框'),
  content: '',
  cancel: _l('取消'),
  confirm: _l('确认'),
  width: '350px',
};

var Confirm = function (options, onConfirm) {
  var _this = this;
  _this.options = $.extend({}, defaultOptions, options);

  if (this.options.content) {
    this.$confirm = this.confirm()
      .on('click', '.btnCancel', $.proxy(this.hide, this))
      .on('click', '.btnConfirm', function () {
        _this.hide(onConfirm);
      });
    this.show();
  } else {
    if (typeof onConfirm === 'function') onConfirm.call();
  }
};

Confirm.prototype.confirm = function () {
  var $confirm = this.$confirm || $(doT.template(require('./confirm.html'))(this.options));

  /*    // 添加拖拽
   $confirm.appendTo("body").find('.confirmContainer').draggabilly({
   handle: '.confirmTitle',
   });*/

  $confirm.appendTo('body');
  return $confirm;
};

Confirm.prototype.show = function () {
  var $confirmContainer = this.confirm().find('.confirmContainer');
  $confirmContainer.css({
    width: this.options.width,
    'margin-top': ($(window).height() - $confirmContainer.height() - 50) / 2 + 'px',
  });
  this.confirm().addClass('open');
};

Confirm.prototype.hide = function (callback) {
  var _this = this,
    endFn = function () {
      _this.confirm().remove();
      if (typeof callback === 'function') callback.call();
    };
  _this
    .confirm()
    .removeClass('open')
    .addClass('close')
    .one(animEndEventName, endFn);
};

module.exports = function (...args) {
  // if (!new.target) {
  //   return new Confirm(...args);
  // } else {
  //   new.target.apply(new.target, args);
  // }
  if (!(this instanceof Confirm)) {
    return new Confirm(...args);
  } else {
    return Confirm.apply(this, args);
  }
};
