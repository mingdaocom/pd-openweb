import './tooltip.css';
import { htmlEncodeReg } from 'src/util';

/*
tooltip
调用方法：
<input type="text" id="test" tip="test" />
$("test").MD_UI_Tooltip({
text: "这是一个tip",  //如果这里为空 ，则取$("test") 里的tip 属性
arrowLeft: 0,           //tip箭头的左位移，可以负数
offsetLeft: -8,         //tip的左位移，可以负数
offsetTop: 0,          //tip的上位移，可以负数
location: "down",    //tip在上面还是下面 选项："up","down"
width:200               //tip的宽度
});
*/

var createTooltipTemplate = function (_width) {
  return _width
    ? '<div class="md_tooltip" style="max-width:' +
        _width +
        'px; width: expression(this.width >' +
        _width +
        '? "' +
        _width +
        'px" : "auto");"><div class="md_tooltip_arrow_up"></div><div class="md_tooltip_content"></div><div class="md_tooltip_arrow_down"></div></div>'
    : '<div class="md_tooltip"><div class="md_tooltip_arrow_up"></div><div class="md_tooltip_content"></div><div class="md_tooltip_arrow_down"></div></div>';
};

(function ($) {
  $.fn.titletip = function (key) {
    if (!key) {
      key = 'title';
    }
    return $(this).each(function () {
      return $(this)
        .on('mouseenter.titleTip', '*', function () {
          var $this = $(this);

          var title = $this.attr(key) || $this.data('titleTipTitle');
          if (!title) {
            return;
          }
          if (key === 'title') {
            $this.data('titleTipTitle', title);
            $this.removeAttr(key);
          }

          $('.md_tooltip').remove();

          var $tip = $(createTooltipTemplate(180))
            .css({ position: 'absolute' })
            .hide()
            .find('.md_tooltip_content')
            .html(title)
            .end()
            .appendTo('body');
          var top = $(this).offset().top + $(this).height();
          var left = $(this).offset().left + $(this).outerWidth() / 2 - $tip.width() / 2;

          var $win = $(window);
          var winWidth = $win.width();
          var winHeight = $win.height();
          var scrollTop = $win.scrollTop();
          var scrollLeft = $win.scrollLeft();

          var tipWith = $tip.width();
          var tipHeight = $tip.height();
          var arrowPos = 'top';
          var arrowWidth =
            parseFloat($tip.find('.md_tooltip_arrow_up').css('border-left-width')) + parseFloat($tip.find('.md_tooltip_arrow_up').css('border-right-width'));

          var tipTop, tipLeft, arrowLeft;

          if (top < scrollTop) {
            tipTop = scrollTop;
          } else if (top + tipHeight > winHeight + scrollTop) {
            arrowPos = 'bottom';
            tipTop = top - $(this).height() - tipHeight;
          } else {
            tipTop = top;
          }
          arrowLeft = tipWith / 2 - arrowWidth / 2;
          if (left < scrollLeft) {
            tipLeft = scrollLeft;
            arrowLeft = arrowLeft - scrollLeft + tipLeft;
          } else if (left + tipWith > winWidth + scrollLeft) {
            tipLeft = winWidth + scrollLeft - tipWith;
            arrowLeft = arrowLeft + left + tipWith - winWidth - scrollLeft;
          } else {
            tipLeft = left;
          }

          if (top < scrollTop) {
            top = scrollTop;
          }
          if (top > winHeight + scrollTop) {
            top = $(this).offset().top - $tip.height();
            arrowPos = 'bottom';
          }
          if (top > winHeight + scrollTop) {
            top = winHeight + scrollTop - $tip.height();
          }
          if (left < scrollLeft) {
            left = scrollLeft;
          }
          if (left > winWidth + scrollLeft - $tip.width()) {
            left = winWidth + scrollLeft - $tip.width();
          }

          $tip.offset({
            left: tipLeft,
            top: tipTop,
          });

          if (arrowPos === 'top') {
            $tip
              .find('.md_tooltip_arrow_up')
              .css('left', arrowLeft)
              .show();
            $tip.find('.md_tooltip_arrow_down').hide();
          } else {
            $tip.find('.md_tooltip_arrow_up').hide();
            $tip
              .find('.md_tooltip_arrow_down')
              .css('left', arrowLeft)
              .show();
          }
          $this.data('titleTip', $tip.fadeIn('normal'));
          $tip.data(
            'checkTargetInterval',
            setInterval(function () {
              if (!$.contains(document, $this[0]) || !$this.is(':visible')) {
                clearInterval($tip.data('checkTargetInterval'));
                $tip.fadeOut(function () {
                  $tip.remove();
                });
                $(this).data('titleTip', null);
              }
            }, 1000)
          );
        })
        .on('mouseleave.titleTip', '*', function (e) {
          var $tip = $(this).data('titleTip');
          if ($tip) {
            clearInterval($tip.data('checkTargetInterval'));
            $tip.fadeOut(function () {
              $tip.remove();
            });
            $(this).data('titleTip', null);
          }
        });
    });
  };
})(jQuery);

(function ($) {
  $.fn.mdTooltip = $.fn.MD_UI_Tooltip = function (settins) {
    new $.MD_UI_Tooltip(this, settins);
    return $(this);
  };
  $.MD_UI_Tooltip = function (el, options) {
    var opts = $.extend(
      {
        text: '',
        arrowLeft: 0,
        offsetLeft: 0,
        offsetTop: 0,
        width: 0,
        showEvent: 'mouseover',
        hideEvent: 'mouseout',
        location: 'down',
        key: 'tip',
        checkWidth: false, // 判断是否超过浏览器宽度 || 任务详情使用 rocky
        checkHeight: false, // 判断是否超过浏览器高度 || 任务详情使用 rocky
        theme: 'black', // Raven Added  black为黑色,white为白色
      },
      options
    );

    if (opts.showEvent != '') {
      $(el).bind(opts.showEvent + '.Tip', function () {
        if ($('body').find('.md_tooltip').length >= 0) {
          $('.md_tooltip').remove();
        }

        $('body').append(createTooltipTemplate(opts.width));
        if (opts.theme == 'white') {
          var toolTipObj = $('body').find('.md_tooltip');
          $(toolTipObj)
            .find('.md_tooltip_arrow_up')
            .addClass('md_tooltip_arrow_up_white');
          $(toolTipObj)
            .find('.md_tooltip_content')
            .addClass('md_tooltip_content_white');
          $(toolTipObj)
            .find('.md_tooltip_arrow_down')
            .addClass('md_tooltip_arrow_down_white');
        }

        $('.md_tooltip').css('position', 'absolute');
        if (opts.text) {
          $('.md_tooltip')
            .find('.md_tooltip_content')
            .html(opts.text.indexOf('<hr') > -1 || opts.text.indexOf('<br') > -1 ? opts.text : htmlEncodeReg(opts.text));
        } else {
          opts.text = $(this).attr(opts.key);
          $('.md_tooltip')
            .find('.md_tooltip_content')
            .html(opts.text && (opts.text.indexOf('<hr') > -1 || opts.text.indexOf('<br') > -1) ? opts.text : htmlEncodeReg(opts.text));
          opts.text = '';
        }
        var top;
        var left;
        var arrowleft;
        var isHidden = $(this).hasClass('Hidden');
        // 处理任务详情隐藏元素hover的时候先失去焦点  定位错误问题   rocky: 2015-5-8
        $(this).removeClass('Hidden');
        top = $(this).offset().top + $(this).height() + opts.offsetTop;

        // 判断右边宽度不够往左移 rocky
        if (opts.checkWidth) {
          if ($(this).offset().left + opts.offsetLeft + $('.md_tooltip').width() > $(document).width()) {
            left = $(document).width() + opts.offsetLeft - $('.md_tooltip').width();
            arrowleft = $(this).offset().left - left;
          } else {
            left = $(this).offset().left + opts.offsetLeft;
            arrowleft = 10 + opts.arrowLeft;
          }
        } else {
          left = $(this).offset().left + opts.offsetLeft;
          arrowleft = 10 + opts.arrowLeft;
        }
        // 获取left 和 top 你tm 不加回去 #177
        isHidden && $(this).addClass('Hidden');

        $('.md_tooltip').css('top', top);
        $('.md_tooltip').css('left', left);
        $('.md_tooltip')
          .find('.md_tooltip_arrow_up')
          .css('left', arrowleft);
        $('.md_tooltip')
          .find('.md_tooltip_arrow_down')
          .css('left', arrowleft);

        $('.md_tooltip_arrow_down').hide();
        $('.md_tooltip_arrow_up').hide();

        // 任务详情处理纯数字不换行的问题 rocky
        if (opts.checkHeight) {
          $('.md_tooltip').css({ 'max-width': opts.width ? opts.width : $(document).width() - left - 20, 'word-break': 'break-word' });

          if ($('.md_tooltip').height() + top + 14 > $(document).height()) {
            $('.md_tooltip').css('top', top - $('.md_tooltip').height() - $(this).height() - 5);
            $('.md_tooltip_arrow_down').show();
          } else {
            if (opts.location == 'down') {
              $('.md_tooltip_arrow_up').show();
            } else if (opts.location == 'up') {
              $('.md_tooltip_arrow_down').show();
            }
          }
        } else {
          if (opts.location == 'down') {
            $('.md_tooltip_arrow_up').show();
          } else if (opts.location == 'up') {
            $('.md_tooltip_arrow_down').show();
          }
        }

        $('.md_tooltip')
          .show()
          .addClass('tooltipAnimate');
      });
    } else {
      $(el).unbind();
    }
    $(el)
      .die()
      .live(opts.hideEvent + '.Tip', function () {
        $('.md_tooltip').one('transitionend', function () {
          $(this).remove();
        });
        $('.md_tooltip').removeClass('tooltipAnimate');
      });
  };
})(jQuery);
