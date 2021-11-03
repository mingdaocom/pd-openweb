/** *********************************************************
插件名称?.mdAutocomplete
功能描述???出?
编写日期?015/7/15
程序作者： zhongping
调用方式
bug记录?
************************************************************/

import './css/mdAutocomplete.css';

var MdAutocomplete = function (settings) {
  var defaults = {
    element: '', // input?d
    appendTo: 'body', // 添加到的容器 默认?ody
    minLength: 0, // 文本框的输入几个字符开始搜?
    maxRows: 10, // 显示搜素的最大行?
    source: null, // 搜索?一?rl
    clearBtn: true,
    nullText: _l('未搜索到结果'),
    data: {}, // 请求参数
    autoUlStyle: {
      hoverClass: 'autocomActive ThemeBGColor3',
      width: null, // 搜索结果的宽?
      height: null,
      zIndex: 99,
      x: 0,
      y: 5,
    },
    clearStyle: { color: null, x: 0, y: 0 }, // 位置偏移?
    isFirstSelect: true,
    vdsIgnore: false, // vds ignore
    // callback
    readyFn: null,
    beforeSearch: null, // 搜索前，可以修改 data 中的内容
    change: null, // 点击搜索到的结果 两次点击的不一样才触发
    select: null, // 点击搜索结果
    selectResult: true,
    clear: null,
    render: null, // 渲染 结果
    focusIsSerach: false,
  };
  // 配置
  this.settings = $.extend(true, defaults, settings);

  var settings = this.settings;

  // 初始?
  this.init();
};

$.extend(MdAutocomplete.prototype, {
  // 初始?
  init: function () {
    this._bindInputEvent();
  },

  // 绑定 input 事件
  _bindInputEvent: function () {
    var _this = this,
      settings = _this.settings;

    $('#' + settings.element).on({
      // 键按?
      keydown: function (event) {
        var $autocomplete = $('#' + settings.autocompleteId);

        if ($autocomplete.length > 0) {
          var $autocomActive = $autocomplete.find('.autocomActive'),
            index = $autocomActive.index();
          // ?
          if (event.keyCode == 38) {
            if (index > 0) {
              while (
                $autocomActive.prev().hasClass('searching') ||
                ($autocomActive.prev().hasClass('emptyItem') && index > 0)
              ) {
                $autocomActive = $autocomActive.prev();
                index -= 1;
              }
              if ($autocomActive.prev().length > 0) {
                $autocomActive
                  .prev()
                  .addClass(settings.autoUlStyle.hoverClass)
                  .siblings()
                  .removeClass(settings.autoUlStyle.hoverClass);
              }
            }
            // 滚动条位?
            _this._scrollPosition(true);
          } else if (event.keyCode == 40) {
            // ?
            var autoCount = $autocomplete.find('li').length - 1;
            if (index < autoCount) {
              while (
                $autocomActive.next().hasClass('searching') ||
                ($autocomActive.next().hasClass('emptyItem') && index < autoCount)
              ) {
                $autocomActive = $autocomActive.next();
                index += 1;
              }
              if (index < autoCount) {
                $autocomActive
                  .next()
                  .addClass(settings.autoUlStyle.hoverClass)
                  .siblings()
                  .removeClass(settings.autoUlStyle.hoverClass);
              }
            }
            // 滚动条位?
            _this._scrollPosition(false);
          }
        }
      },

      focus: function () {
        var $autocomplete = $('#' + settings.autocompleteId);
        if ($autocomplete.length > 0 && $(this).val().trim() != '') {
          var autoUlStyle = settings.autoUlStyle,
            gapRight = 5,
            btnWidth = 16;
          // 联想位置
          $autocomplete.css({
            top: settings.$element.height() + autoUlStyle.y,
            left: autoUlStyle.x,
          });
          $autocomplete.show();
        } else if (settings.focusIsSerach && $.trim($(this).val()) === '') {
          $(this).keyup();
        }
      },

      // 键弹?
      keyup: function (event) {
        // 上下左右返回
        if (event.keyCode > 36 && event.keyCode < 41) {
          return;
        }

        // 回车
        if (event.keyCode == 13) {
          var $autocomplete = $('#' + settings.element + '_autocomplete'),
            $autocomActive = $autocomplete.find('.autocomActive');
          $(this).blur();

          // 防止直接回车
          if ($autocomplete.length > 0) {
            // 选中回调
            if ($.isFunction(settings.select)) {
              settings.select($autocomActive);
            }
            // 改变回调
            if (!$autocomActive.is(settings.$prev) && $.isFunction(settings.change)) {
              settings.change($autocomActive);
            }
            settings.$prev = $autocomActive;
          }

          $autocomplete.hide();

          return;
        }

        // 清除按钮
        if (settings.clearBtn) {
          // 是否显示清除按钮
          if (settings.$element.val().length > 0) {
            $('#' + settings.btnId).show();
          } else {
            $('#' + settings.btnId).hide();
          }
        }

        settings.data.pageIndex = 1;
        // 搜索
        _this._search();
      },
    });
  },

  // 绑定
  _bindSearchEvent: function ($ul) {
    var _this = this;
    var settings = _this.settings;
    $ul.on('scroll', function () {
      if (!settings.isMore || !settings.data.pageIndex || settings.ajaxRequest) {
        return;
      }

      var $this = $(this);
      var nDivHight = $this.height();
      var nScrollHight = $this[0].scrollHeight;
      var nScrollTop = $this[0].scrollTop;

      if (nScrollTop + nDivHight + 30 >= nScrollHight) {
        settings.data.pageIndex++;
        _this._search();
      }
    });

    $ul.on(
      {
        mouseover: function () {
          var $this = $(this);
          // 查找 为空 不做处理
          if ($this.hasClass('searching') || $this.hasClass('emptyItem')) {
            return;
          }
          // 选中
          $this.addClass(settings.autoUlStyle.hoverClass).siblings().removeClass(settings.autoUlStyle.hoverClass);
        },

        click: function (event) {
          var $this = $(this);

          // 选中回调
          if ($.isFunction(settings.select)) {
            settings.selectResult = settings.select($this);
          }
          // 改变回调
          if (!$this.is(settings.$prev) && $.isFunction(settings.change)) {
            settings.selectResult = settings.change($this);
          }

          settings.$prev = $this;

          if (settings.selectResult == false) {
            event.stopPropagation();
          }
        },
      },
      'li',
    );

    // 清除
    if (settings.clearBtn) {
      $('#' + settings.btnId).on('click', function () {
        $(this).hide();
        settings.$element.val('');
        // 清空内容隐藏
        $('#' + settings.autocompleteId)
          .empty()
          .hide();

        if ($.isFunction(settings.clear)) {
          settings.clear();
        }
      });
    }

    if ($.isFunction(settings.readyFn)) {
      settings.readyFn.call(this);
    }

    $(document).on('click', function (event) {
      let $target = $(event.target);

      if (!$target.is($('#' + settings.element))) {
        $('#' + settings.autocompleteId).hide();
      }
    });
  },

  // 滚动条位?
  _scrollPosition: function (isUp) {
    // 参数
    var settings = this.settings,
      $searchContent = $('#' + settings.element + '_autocomplete'),
      $selected = $searchContent.find('.autocomActive'),
      scrollTop = '';

    if (isUp) {
      scrollTop =
        $selected &&
        $selected.offset() &&
        $selected.offset().top &&
        $searchContent &&
        $searchContent.offset() &&
        $searchContent.offset().top
          ? $selected.offset().top - $searchContent.offset().top
          : 0;
      // 是否看不到了
      if (scrollTop < 0) {
        scrollTop = $searchContent.scrollTop() + scrollTop;
        $searchContent.scrollTop(scrollTop);
      }
    } else {
      var scrollTop =
        $selected &&
        $selected.offset() &&
        $searchContent &&
        $searchContent.offset() &&
        ($selected.offset().top || $selected.offset().top === 0) &&
        ($searchContent.offset().top || $searchContent.offset().top === 0)
          ? $selected.offset().top + $selected.height() - $searchContent.offset().top - $searchContent.height()
          : 0;
      // 是否看不到了
      if (scrollTop > 0) {
        scrollTop = $searchContent.scrollTop() + scrollTop;
        $searchContent.scrollTop(scrollTop);
      }
    }
  },

  // 搜索
  _search: function () {
    var _this = this,
      settings = _this.settings,
      keywords = settings.$element.val().trim();

    if (settings.ajaxRequest) {
      settings.ajaxRequest.abort();
    }

    // 没到搜索的长?
    if (keywords.length < settings.minLength) {
      return;
    }

    settings.autocompleteId = settings.element + '_autocomplete';

    var $ul = $('#' + settings.autocompleteId);
    // 页面上不存在元素
    if ($ul.length <= 0) {
      $ul = $('<ul/>');
      $ul.prop('id', settings.autocompleteId);
      if (settings.vdsIgnore) {
        $ul.attr('growing-ignore', true);
      }
      $ul.addClass('mdAutocomplete boderRadAll_3');

      var autoUlStyle = settings.autoUlStyle;
      // 样式设置
      if (autoUlStyle.width && autoUlStyle.width != 'auto') {
        $ul.css('width', autoUlStyle.width);
      }
      if (autoUlStyle.height && autoUlStyle.height != 'auto') {
        $ul.css('max-height', autoUlStyle.height);
      }
      $ul.css('z-index', autoUlStyle.zIndex);

      if (settings.appendTo != 'body') {
        $(settings.appendTo).addClass('Relative');
      }

      $(settings.appendTo).append($ul);

      if (settings.clearBtn) {
        // 清除按钮
        settings.btnId = settings.element + '_clearAutoSearch';
        $(settings.appendTo).append(
          '<span id="' +
            settings.btnId +
            '" class="icon-closeelement-bg-circle clearAutoSearch ThemeColor8" title="' +
            _l('清除搜索') +
            '"></span>',
        );

        var $clearAutoSearch = $('#' + settings.btnId);

        // 关闭按钮位置
        var gapRight = 5,
          btnWidth = 16,
          inputWidth = settings.$element.width(),
          inputHeight = settings.$element.height();
        var gapTop = (inputHeight - btnWidth) / 2;
        $clearAutoSearch.css({
          top: gapTop + settings.clearStyle.y,
          left: inputWidth - gapRight - btnWidth + settings.clearStyle.x,
        });

        // 按钮颜色
        if (settings.clearStyle.color) {
          $clearAutoSearch.css('color', settings.clearStyle.color);
        }
        $clearAutoSearch.css('z-index', autoUlStyle.zIndex);
      }

      var gapRight = 5,
        btnWidth = 16,
        inputWidth = settings.$element.width(),
        inputHeight = settings.$element.height();
      // 联想位置
      $ul.css({
        top: settings.$element.height() + autoUlStyle.y,
        left: autoUlStyle.x,
      });

      _this._bindSearchEvent($ul);
    } else {
      var autoUlStyle = settings.autoUlStyle,
        gapRight = 5,
        btnWidth = 16,
        inputWidth = settings.$element.width(),
        inputHeight = settings.$element.height();
      // 联想位置
      $ul.css({
        top: settings.$element.height() + autoUlStyle.y,
        left: autoUlStyle.x,
      });
    }

    if (!settings.data.pageIndex || settings.data.pageIndex === 1) {
      // 清空 显示  正在加载
      $ul
        .empty()
        .append('<li class="searching">' + LoadDiv() + '</li>')
        .show();
    }

    // 搜索文本
    settings.data.keywords = keywords;

    // 可以修改 data 中的内容
    if ($.isFunction(settings.beforeSearch)) {
      settings.beforeSearch(settings.data);
    }

    // 开始搜索
    settings.ajaxRequest = settings.source[settings.op](settings.data);
    settings.ajaxRequest.then(function (source) {
      settings.ajaxRequest = false;
      if (source.status) {
        var html;
        var isInsert = false;
        // 自己渲染
        if ($.isFunction(settings.render)) {
          settings.isMore = source.data && source.data.length === 20;
          html = settings.render(source.data, function (renderHtml) {
            if (!settings.data.pageIndex || settings.data.pageIndex === 1) {
              $ul.html(renderHtml);
            } else {
              $ul.append(renderHtml);
            }
            if (settings.isFirstSelect) {
              $ul.find('li:first').addClass(settings.autoUlStyle.hoverClass);
            }
          });
        } else {
          var searchList = source.data.items,
            searchCount = searchList.length > settings.maxRows ? settings.maxRows : searchList.length;
          if (searchCount == 0) {
            html = '<li class="emptyItem">' + settings.nullText + '</li>';
          } else {
            var sb = '',
              item;
            for (var i = 0; i < searchCount; i++) {
              item = searchList[i];
              sb = sb + `<li data-id="${item.ID}">${item.Name}</li> `;
            }
            html = sb;
          }
        }
        // 填充内容 并选中 第一?异步的话 回调返回 false
        if (html) {
          if (!settings.data.pageIndex || settings.data.pageIndex === 1) {
            $ul.html(html).show();
          } else {
            $ul.append(html);
          }
          if (settings.isFirstSelect) {
            $ul.find('li:first').addClass(settings.autoUlStyle.hoverClass);
          }
        }
      } else {
        return $.Deferred().reject();
      }
    });
  },
});

// 导出
exports.index = function (opts) {
  return new MdAutocomplete(opts);
};

// 加载???行 绑定 jquery
(function ($) {
  // 是否绑定?
  if (!$.fn.mdAutocomplete) {
    // 全局函数
    $.fn.mdAutocomplete = function (opts) {
      if (opts && opts.element) {
        opts.$element = $('#' + opts.element);
      } else {
        var $this = $(this);
        if (!opts) {
          opts = {};
        }
        opts.element = $this.attr('id');
        opts.$element = $this;
      }
      new MdAutocomplete(opts);
      return this;
    };
  }
})(jQuery);
