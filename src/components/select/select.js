import './style.css';
(function ($) {
  $.fn.MDSelect = function (param) {
    var _this = $(this);
    if (typeof param === 'string' && arguments.length > 1) {
      var _select = _this.data('select');
      var args = Array.prototype.slice.call(arguments, 1);
      _select[param].apply(_select, args);
    } else {
      _this.each(function () {
        $(this).data('select', new $MDSelect(this, param));
      });
    }
    return $(this);
  };

  var $MDSelect = function (el, param) {
    var $this = this; // 当前类实例化对象
    $this.el = el; // input对象
    var settings = $.extend(
      {
        defaultOptionText: '',
        defaultOptionValue: '',
        isHtml: false,
        defualtSelectedValue: '', // 默认选中值
        url: '', // 根据URL地址直接获取符合数据 与dataArr格式一致 返回的变量名为 list { id,name}
        dataArr: [], // 数据 格式({ name: 'iso20252认证小组', id: '1' }, { name: 'Workspace开发小组', id: '2' })  name和id固定
        appendArr: [], // 附加数据 格式({ name: 'iso20252认证小组', id: '1' })
        imageType: '1', // 1 三角图标  2 上下箭头
        width: 110,
        maxWidth: null,
        align: 'left',
        lineHeight: 30,
        fontSize: 12,
        filterSelect: false, // 是否过滤以选择项
        positionDiretion: 'bottom',
        showType: '1', // "1":默认呈现方式 "2":没有hover效果的呈现方式 3 hover 出下划线 4 带边框
        style: '',
        zIndex: 'initial',
        wordLength: 14,
        className: null, // 另外增加的类名
        hasSearch: false,
        onChange: function (value, text, activeThis) {},
      },
      param
    );
    var options = {
      linkStyle: 'bgImageLink',
      clickStyle: 'bgImageClick',
    };
    $this.init = function () {
      if (settings.imageType == '2') {
        options.linkStyle = 'bgImageOrderByLink';
        options.clickStyle = 'bgImageOrderByClick';
      }

      $(document).on('click', function (event) {
        if ($(event.target).parents('div.customSelect').length == 0) {
          $('.csList').hide();
          $(el)
            .next('div.customSelect')
            .find('.spanShow')
            .removeClass('titleClick')
            .addClass('titleLink');
          $(el)
            .next('div.customSelect')
            .find('.icon-arrow-down-border')
            .removeClass(options.clickStyle)
            .addClass(options.linkStyle);
        }
      });

      settings.style = 'height:' + settings.lineHeight + 'px;line-height:' + settings.lineHeight + 'px;text-align:' + settings.align + ';';
      settings.style2 = 'height:20px;line-height:20px;text-align:' + settings.align + ';';
      if ($(el).next('div.customSelect').length == 0) {
        var view = $('<div/>')
          .addClass('customSelect')
          .addClass(settings.className)
          .css('z-index', settings.zIndex);
        var top = settings.showType == '3' ? '28px;' : Number(settings.lineHeight) + 5 + 'px;';
        var list = $('<div/>', {
          id: 'csList',
          class: 'csList',
          scroll: 0,
        }).css({
          'min-width': settings.width,
          'max-width': settings.maxWidth,
          top: top,
        });

        if (settings.hasSearch) {
          list.append(
            '<div class="searchBox"><div class="searchIcon"></div><input type="text" class="flex" placeholder="' + _l('搜索') + '" id="searchList" /></div>'
          );
        }

        var ul = $('<ul/>').appendTo(list);
        var container = $('<span/>')
          .addClass('spanShow title')
          .attr('style', settings.showType == '3' ? settings.style2 : settings.style + 'font-size:' + settings.fontSize + 'px;')
          .appendTo(view)
          .after(list);
        container
          .mouseover(function () {
            if (settings.showType == '1') {
              $(this)
                .removeClass('titleLink')
                .addClass('titleHover');
            } else if (settings.showType == '3') {
              $(this)
                .find('span:first')
                .addClass('Underline');
            } else if (settings.showType == '4') {
              $(this)
                .find('span:first')
                .parent()
                .addClass('hoverBorder');
            }
          })
          .mouseout(function () {
            if (settings.showType == '1') {
              $(this)
                .removeClass('titleHover')
                .addClass('titleLink');
            } else if (settings.showType == '3') {
              $(this)
                .find('span:first')
                .removeClass('Underline');
            } else if (settings.showType == '4') {
              $(this)
                .find('span:first')
                .parent()
                .removeClass('hoverBorder');
            }
          })
          .click(function () {
            var $csList = $(el)
              .next('div.customSelect')
              .find('.csList');
            if ($csList && $csList.is(':visible')) {
              $csList.hide();
            } else {
              $this.showList(this);
            }
          });
        if (settings.showType == '2') container.addClass('ThemeColor3');
        else if (settings.showType == '3') {
          container.addClass('titleBorder ThemeBorderColor4');
        } else if (settings.showType == '4') {
          container.addClass('normalBorder borderRadius5');
        } else {
          container.addClass('borderRadius5');
        }

        if (settings.showType == '3') {
          $('<span/>')
            .addClass('txtBox ThemeColor3')
            .attr('first', '1')
            .attr('style', settings.style2)
            .attr('itemValue', settings.defaultOptionValue)
            .text(settings.defaultOptionText)
            .appendTo(container);
          $('<span/>')
            .addClass('icon-arrow-down-border TxtTop ThemeColor3 font10')
            .attr('style', settings.style2 + (settings.showType == '3' ? ';margin-left:5px' : ''))
            .appendTo(container);
        } else {
          $('<span/>')
            .addClass('txtBox')
            .attr('first', '1')
            .attr('style', settings.style)
            .attr('itemValue', settings.defaultOptionValue)
            .text(settings.defaultOptionText)
            .appendTo(container);
          $('<span/>')
            .addClass('icon-arrow-down-border TxtTop font10')
            .addClass('bgImageLink')
            .attr('style', settings.style + (settings.showType == '2' ? ';margin-left:5px' : ''))
            .addClass(options.linkStyle)
            .appendTo(container);
        }

        container.find('.txtBox').css('max-width', settings.maxWidth - 32);

        $(el).after(view);
        if (settings.defualtSelectedValue != '' || settings.defaultOptionValue == '') {
          $this.getData();
        } else {
          $this.setValue(settings.defaultOptionValue, settings.defaultOptionText);
        }

        $('#searchList').on('keyup', function () {
          $this.createList($(this).val());
        });
      }
    };
    // 创建下拉列表
    $this.createList = function (searchText) {
      var ul = $(el)
        .next('div.customSelect')
        .find('.csList ul')
        .empty();
      var newList = new Array();
      if (settings.defaultOptionText != '') {
        newList.push({
          id: settings.defaultOptionValue,
          name: settings.defaultOptionText,
        });
      }
      newList = newList.concat(
        settings.dataArr.filter(function (item) {
          return item.name.indexOf(searchText || '') > -1;
        })
      );
      newList = newList.concat(
        $this.list.filter(function (item) {
          return item.name.indexOf(searchText || '') > -1;
        })
      );
      newList = newList.concat(settings.appendArr);

      for (var i = 0; i < newList.length; i++) {
        var item = newList[i];
        ul.append($this.createItem(item.id, item.name, item.disabled));
      }

      if (!newList.length) {
        ul.append('<div class="Gray_c TxtCenter" style="padding: 50px 0;">' + _l('暂无搜索结果') + '</div>');
      }

      if (settings.appendArr.length > 0) {
        ul.find('li')
          .eq(newList.length - settings.appendArr.length)
          .addClass('topLine');
      }
      if (
        ($(el)
          .next('div.customSelect')
          .find('.txtBox')
          .text() == '' ||
          el.value == '') &&
        newList.length > 0 &&
        !searchText
      ) {
        $this.setValue(newList[0].id, newList[0].name);
      }
    };
    $this.setValue = function (id, name) {
      $(el).val(id);
      var cur = $(el)
        .next('div.customSelect')
        .find('.txtBox')
        .attr('itemValue', id);
      if (settings.isHtml) {
        cur.html(name);
      } else {
        cur.text($this.CutString(name, settings.wordLength)).attr('title', name);
      }
    };
    // 创建下拉列表项
    $this.createItem = function (id, name, disabled) {
      if (settings.defualtSelectedValue != '' && id == settings.defualtSelectedValue) {
        $this.setValue(id, name);
      }
      var li = $('<li/>')
        .attr('style', settings.style)
        .attr({ itemValue: id, title: name });
      if (!disabled) {
        li.mouseover(function () {
          $(this)
            .addClass('listSpanHover')
            .addClass('ThemeBGColor3');
        })
          .mouseout(function () {
            $(this)
              .removeClass('listSpanHover')
              .removeClass('ThemeBGColor3');
          })
          .click(function () {
            $this.OnChange(this);
          });
      } else {
        li.addClass('Gray_a');
      }
      if (settings.isHtml) {
        li.html(name);
      } else {
        li.text(name);
      }
      return li;
    };
    // 获取数据
    $this.getData = function (callback) {
      if (settings.url != '') {
        $.ajax({
          type: 'POST',
          url: settings.url,
          success: function (result) {
            if (result.MSG == 'T') {
              if (result.list != null) {
                $this.list = result.list;
                $this.createList();

                if (callback) {
                  callback.call(this);
                }
                if ($.isFunction(settings.LoadAfterCallback)) {
                  settings.LoadAfterCallback();
                }
              }
            }
          },
        });
      } else {
        $this.list = [];
        $this.createList();
        if (callback) {
          callback.call(this);
        }
      }
    };
    // 显示列表
    $this.showList = function (obj) {
      $('.csList').hide();
      /* 还原原始状态*/
      if (settings.showType == '1' || settings.showType == '4') {
        if (settings.showType == '4') {
          $('.spanShow').removeClass('titleHover titleClick');
        } else {
          $('.spanShow')
            .removeClass('titleHover')
            .removeClass('titleClick')
            .addClass('titleLink');
        }
        $('.icon-arrow-down-border').each(function () {
          if (
            $(this)
              .attr('class')
              .indexOf('OrderBy') > -1
          ) {
            $(this)
              .removeClass('bgImageOrderByClick')
              .addClass('bgImageOrderByLink');
          } else {
            $(this)
              .removeClass('bgImageClick')
              .addClass('bgImageLink');
          }
        });
        /* 设置当前状态*/
        if (settings.showType == '1') {
          $(obj)
            .removeClass('titleHover')
            .removeClass('titleLink')
            .addClass('titleClick');
          $(obj)
            .find('.icon-arrow-down-border')
            .removeClass(options.linkStyle)
            .addClass(options.clickStyle);
        }
      }

      if (
        $(el)
          .next('div.customSelect')
          .find('.csList ul li').length == 0
      ) {
        $this.getData(function () {
          $this.show(obj);
          $this.ChangeWidth();
        });
      } else {
        $this.show(obj);
        $this.ChangeWidth();
      }

      $('.searchBox input').focus();
    };
    $this.show = function (obj) {
      if (settings.filterSelect) {
        var selectedValue = $(el).val();
        $(el)
          .next('div.customSelect')
          .find('li')
          .show();
        $(el)
          .next('div.customSelect')
          .find("li[itemvalue='" + selectedValue + "']")
          .hide();
      }

      $(el)
        .next('div.customSelect')
        .find('.csList')
        .show();
      if ($(obj).attr('first') == '1') {
        $(obj).attr('first', '0');
      }
    };
    $this.CutString = function (msg, cutLength) {
      if (!msg) return '';
      var strLength = 0;
      var cutStr = '';
      if (cutLength >= msg.length) {
        cutStr = msg;
      } else {
        for (var i = 0; i < msg.length; i++) {
          if (msg.charAt(i) > '~') {
            strLength += 2;
          } else {
            strLength += 1;
          }
          if (strLength > cutLength) {
            cutStr = msg.substring(0, i) + '...';
            break;
          }
        }
      }
      return cutStr;
    };
    $this.OnChange = function (obj) {
      var name = $(obj).text();
      if (settings.isHtml) {
        name = $(obj).html();
      }
      var cur = $(el)
        .next('div.customSelect')
        .find('.txtBox');
      if (settings.isHtml) {
        cur.html(name);
      } else {
        cur.text($this.CutString(name, settings.wordLength)).attr('title', name);
      }
      cur
        .parent()
        .removeClass('titleClick titleHover')
        .addClass('titleLink');
      // 下拉箭头
      if (settings.showType != '3') {
        cur
          .next()
          .removeClass(options.clickStyle)
          .addClass(options.linkStyle);
      }
      $(el)
        .next('div.customSelect')
        .find('.csList')
        .hide();
      $(el).val($(obj).attr('itemValue'));
      if (settings.onChange) {
        settings.onChange.call(this, $(obj).attr('itemValue'), name, $(obj));
      }
    };
    $this.ChangeWidth = function () {
      if (
        $(el)
          .next('div.customSelect')
          .find('.csList')
          .height() >= 300 &&
        $(el)
          .next('div.customSelect')
          .find('.csList')
          .attr('scroll') == '0'
      ) {
        $(el)
          .next('div.customSelect')
          .find('.csList')
          .width(
            $(el)
              .next('div.customSelect')
              .find('.csList')
              .width() + 15
          );
        $(el)
          .next('div.customSelect')
          .find('.csList')
          .attr('scroll', '1');
      }

      if (settings.positionDiretion == 'top') {
        var top =
          Number(
            $(el)
              .next('div.customSelect')
              .find('.csList')
              .height()
          ) +
          Number(settings.lineHeight) -
          10;
        $(el)
          .next('div.customSelect')
          .find('.csList')
          .css('top', '-' + top + 'px');
      }
    };
    $this.init();
  };
})(jQuery);
