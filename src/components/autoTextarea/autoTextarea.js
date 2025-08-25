import _ from 'lodash';

var prefixer = '.autoTextarea';
var KEYDOWN = 'keydown' + prefixer;
var EVENTS = _.map(['keyup', 'blur', 'focus'], function (e) {
  return e + prefixer;
}).join(' ');

export default (function ($) {
  $.fn.autoTextarea = function (options) {
    return $(this).each(function () {
      var $this = $(this);
      var opts = $.extend(
        {
          maxHeight: $this.height(),
          minHeight: $this.height(),
          gap: $this.outerHeight() - $this.height(),
        },
        options,
      );

      var initTextArea = function () {
        $this.css('height', 0);
        var origHeight = $.trim($this.val()) === '' ? opts.minHeight : $this.get(0).scrollHeight - opts.gap;

        if (origHeight > opts.maxHeight) {
          origHeight = opts.maxHeight;
        } else if (origHeight < opts.minHeight) {
          origHeight = opts.minHeight;
        }

        $this.height(origHeight).scrollTop($this.scrollTop());
        $this.data('autoTextarea', {
          setOpts: function (newOpts) {
            opts = Object.assign({}, opts, newOpts);
          },
        });

        $this.on(KEYDOWN, function (event) {
          if (event.keyCode === 13) {
            var height = this.scrollHeight - opts.gap;
            if (height > opts.maxHeight) {
              height = opts.maxHeight;
            }
            $this.height(height);
          }
        });

        $this.on(EVENTS, function () {
          if (!$this.val()) {
            $this.height(opts.minHeight);
          }
          var height;
          if (this.scrollHeight > opts.minHeight + opts.gap) {
            if (opts.maxHeight && this.scrollHeight > opts.maxHeight + opts.gap) {
              height = opts.maxHeight;
              $(this).css('overflowY', 'scroll');
              // zhongpng 增加改变方法
              if ($.isFunction(opts.onChange)) {
                opts.onChange(opts.maxHeight);
              }
            } else {
              height = this.scrollHeight - opts.gap;
              $(this).css('overflowY', 'hidden');
            }
            $(this).height(height);
            //
            if ($.isFunction(opts.onChange)) {
              opts.onChange(height);
            }
          } else {
            $(this).height(opts.minHeight);
            $(this).css('overflowY', 'hidden');
            if ($.isFunction(opts.onChange)) {
              opts.onChange(opts.minHeight);
            }
          }
        });
      };

      var exist = $this.data('autoTextarea');

      if (exist) {
        exist.setOpts(opts);
        _.forEach(EVENTS.split(' '), function (e) {
          $this.off(e);
        });
        $this.off(KEYDOWN);
      }

      initTextArea();
    });
  };
})($);
