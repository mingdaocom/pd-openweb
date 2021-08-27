import './style.css';
import { htmlEncodeReg } from 'src/util';

module.exports = (function ($) {
  $.fn.selection = function () {
    var s, e, range, stored_range;
    if (this[0].selectionStart == undefined) {
      var selection = document.selection;
      if (this[0].tagName.toLowerCase() != 'textarea') {
        var val = this.val();
        range = selection.createRange().duplicate();
        range.moveEnd('character', val.length);
        s = range.text == '' ? val.length : val.lastIndexOf(range.text);
        range = selection.createRange().duplicate();
        range.moveStart('character', -val.length);
        e = range.text.length;
      } else {
        (range = selection.createRange()), (stored_range = range.duplicate());
        stored_range.moveToElementText(this[0]);
        stored_range.setEndPoint('EndToEnd', range);
        s = stored_range.text.length - range.text.length;
        e = s + range.text.length;
      }
    } else {
      (s = this[0].selectionStart), (e = this[0].selectionEnd);
    }
    var te = this[0].value.substring(s, e);
    return {
      start: s,
      end: e,
      text: te,
    };
  };

  $.GrowingInput = function (element, options) {
    var value, lastValue, calc;
    options = $.extend(
      {
        min: 0,
        max: null,
        startWidth: 15,
        correction: 15,
      },
      options
    );
    element = $(element).data('growing', this);

    var self = this;
    var init = function () {
      calc = $('<span></span>')
        .css({
          float: 'left',
          display: 'inline-block',
          position: 'absolute',
          left: -1000,
        })
        .insertAfter(element);
      $.each(
        [
          'font-size',
          'font-family',
          'padding-left',
          'padding-top',
          'padding-bottom',
          'padding-right',
          'border-left',
          'border-right',
          'border-top',
          'border-bottom',
          'word-spacing',
          'letter-spacing',
          'text-indent',
          'text-transform',
        ],
        function (i, p) {
          calc.css(p, element.css(p));
        }
      );
      element
        .blur(resize)
        .keyup(resize)
        .keydown(resize)
        .keypress(resize);
      resize();
    };

    var calculate = function (chars) {
      calc.text(chars);
      var width = calc.width();
      return (width || options.startWidth) + options.correction;
    };

    var resize = function () {
      lastValue = value;
      value = element.val();
      var retValue = value;
      if (chk(options.min) && value.length < options.min) {
        if (chk(lastValue) && lastValue.length <= options.min) return;
        retValue = str_pad(value, options.min, '-');
      } else if (chk(options.max) && value.length > options.max) {
        if (chk(lastValue) && lastValue.length >= options.max) return;
        retValue = value.substr(0, options.max);
      }
      element.width(calculate(retValue));
      return self;
    };
    this.resize = resize;
    init();
  };

  var chk = function (v) {
    return !!(v || v === 0);
  };
  var str_repeat = function (str, times) {
    return new Array(times + 1).join(str);
  };
  var str_pad = function (self, length, str, dir) {
    if (self.length >= length) return this;
    str = str || ' ';
    var pad = str_repeat(str, length - self.length).substr(0, length - self.length);
    if (!dir || dir == 'right') return self + pad;
    if (dir == 'left') return pad + self;
    return pad.substr(0, (pad.length / 2).floor()) + self + pad.substr(0, (pad.length / 2).ceil());
  };

  $.TextboxList = function (element, _options) {
    var original,
      container,
      list,
      current,
      focused = false,
      index = [],
      blurtimer,
      events = {};
    var options = $.extend(
      true,
      {
        prefix: 'textboxlist',
        max: null,
        unique: true,
        uniqueInsensitive: true,
        showAddBtn: false,
        endEditableBit: true,
        startEditableBit: false,
        hideEditableBits: true,
        editableBitMark: true,
        focusWithBorder: true,
        editableBitMarkText: '添加更多人',
        inBetweenEditableBits: false,
        keysEnble: true,
        keys: {
          previous: 37,
          next: 39,
          backspace: 8,
          del: 46,
        },
        bitsOptions: {
          editable: {
            addKeys: [188, 186, 13],
          },
          box: {},
        },
        plugins: {},
        valueReg: {
          reg: '[^,;，；]',
          insensitive: true,
        },
        immediate: {
          enble: false,
          add: {
            url: '',
            parm: ['name'],
            extraParams: {},
            callback: null,
          },
          remove: {
            url: '',
            parm: ['id'],
            extraParams: {},
            callback: null,
          },
        },
        encode: function (o) {
          return $.grep(
            $.map(o, function (v) {
              v = chk(v[0]) ? v[0] : v[1];
              return chk(v) ? v.toString().replace(/,/, '') : null;
            }),
            function (o) {
              return o != undefined;
            }
          ).join(',');
        },
        decode: function (o) {
          return o.split(',');
        },
        innerWidth: null,
        width: null,
      },
      _options
    );

    element = $(element);

    var self = this;
    var init = function () {
      original = element
        .css('display', 'none')
        .attr('autocomplete', 'off')
        .focus(focusLast);
      container = $('<div/>')
        .addClass(options.prefix)
        .insertAfter(element)
        .click(function (e) {
          if (
            (e.target == list.get(0) || e.target == container.get(0)) &&
            (!focused || (current && current.toElement().get(0) != list.find(':last-child').get(0)))
          ) {
            focusLast();
          }
        });
      if (original.attr('id') && original.attr('id').length) {
        $.extend(true, options, {
          id: original.attr('id'),
        });
        container.attr('id', 'textboxlist_' + original.attr('id'));
      }
      if (!options.width && original[0]) {
        var tempwidth = parseInt(original[0].clientWidth);
        if (!tempwidth) tempwidth = parseInt(original[0].style.width);
        if (!tempwidth) tempwidth = parseInt(original.width());
        if (!tempwidth) tempwidth = parseInt(original.css('width'));
        if (!tempwidth) tempwidth = 100;
        options.width = tempwidth;
      }
      if (options.showAddBtn) {
        options.width -= 80;
      }
      container.width(options.width);
      list = $('<ul/>')
        .addClass(options.prefix + '-bits')
        .appendTo(container);
      if (options.showAddBtn) {
        container.append(
          '<div class="addCancelCon"><span class="add boderRadAll_3 ThemeBGColor3">添加</span><span class="cancel boderRadAll_3">取消</span></div>'
        );
        container.find('.addCancelCon .add').mousedown(function () {
          container
            .find('.textboxlist-bit-editable-input')
            .parent()
            .trigger('toBox');
        });
      }
      for (var name in options.plugins) enablePlugin(name, options.plugins[name]);
      if (!options.keysEnble) {
        options.bitsOptions.editable.addKeys = false;
        options.keys = {};
      }
      afterInit();
    };

    var enablePlugin = function (name, options) {
      self.plugins[name] = new $.TextboxList[(camelCase(capitalize(name)))](self, options);
    };

    var afterInit = function () {
      if (options.endEditableBit) {
        create('editable', null, {
          tabIndex: original.tabIndex,
          mark: options.editableBitMark,
          markText: options.editableBitMarkText,
        }).inject(list);
      }
      addEvent('bitAdd', update, true);
      addEvent('bitRemove', update, true);
      $(document)
        .click(function (e) {
          if (!focused) return;
          if (e.target.className.indexOf(options.prefix) != -1) {
            if (e.target == $(container).get(0)) return;
            var parent = $(e.target).parents('div.' + options.prefix);
            if (parent.get(0) == container.get(0)) return;
          }
          blur();
        })
        .keydown(function (ev) {
          if (!focused || !current) return;
          var caret = current.is('editable') ? current.getCaret() : null;
          var value = current.getValue()[1];
          var special = !!$.map(['shift', 'alt', 'meta', 'ctrl'], function (e) {
            return ev[e];
          }).length;
          var custom = special || (current.is('editable') && current.isSelected());
          var evStop = function () {
            ev.stopPropagation();
            ev.preventDefault();
          };
          switch (ev.which) {
            case options.keys.backspace:
              if (current.is('box')) {
                evStop();
                return current.remove();
              }
            case options.keys.previous:
              if (current.is('box') || ((caret == 0 || !value.length) && !custom)) {
                evStop();
                focusRelative('prev');
              }
              break;
            case options.keys.del:
              if (current.is('box')) {
                evStop();
                return current.remove();
              }
            case options.keys.next:
              if (current.is('box') || (caret == value.length && !custom)) {
                evStop();
                focusRelative('next');
              }
          }
        });
      setValues(options.decode(original.val() || ''));
    };

    var create = function (klass, value, opt, isPreset) {
      if (klass == 'box') {
        if (!value[0]) {
          if (!chk($.trim(value[1]))) return false;
          if (options.valueReg && chk(options.valueReg.reg)) {
            var reg = new RegExp(options.valueReg.reg, options.valueReg.insensitive ? 'i' : '');
            if (!reg.test(value[1])) return false;
          }
        }
        if (chk(options.max) && list.children('.' + options.prefix + '-bit-box').length + 1 > options.max) return false;
        if (options.unique && $.inArray(uniqueValue(value), index) != -1) return false;
      }
      return new $.TextboxListBit(klass, value, self, $.extend(true, options.bitsOptions[klass], opt), isPreset);
    };

    var uniqueValue = function (value) {
      return chk(value[0]) ? value[0] : options.uniqueInsensitive ? value[1].toLowerCase() : value[1];
    };

    var add = function (plain, id, html, afterEl, isPreset, opts) {
      var tempopts = null;
      if (opts) tempopts = opts;
      var b = create('box', [id, plain, html], tempopts, isPreset);
      if (b) {
        if (!afterEl || !afterEl.length) afterEl = list.find('.' + options.prefix + '-bit-box').filter(':last');
        b.inject(afterEl.length ? afterEl : list, afterEl.length ? 'after' : 'top');
      }
      return self;
    };

    var focusRelative = function (dir, to) {
      var el = getBit(to && $(to).length ? to : current).toElement();
      var b = getBit(el[dir]());
      if (b) b.focus();
      return self;
    };

    var focusLast = function () {
      var lastElement = list.children().filter(':last');
      if (lastElement) getBit(lastElement).focus();
      return self;
    };

    var blur = function () {
      if (!focused) return self;
      if (current) current.blur();
      focused = false;
      return fireEvent('blur');
    };

    var getBit = function (obj) {
      return obj.type && (obj.type == 'editable' || obj.type == 'box') ? obj : $(obj).data('textboxlist:bit');
    };

    var getValues = function () {
      var values = [];
      list.children().each(function () {
        var bit = getBit(this);
        if (!bit.is('editable')) values.push(bit.getValue());
      });
      return values;
    };

    var setValues = function (values) {
      if (!values) return;
      $.each(values, function (i, v) {
        if (v) add.apply(self, $.isArray(v) ? [v[1], v[0], v[2]] : [v]);
      });
    };

    var update = function () {
      original.val(options.encode(getValues()));
      if (options.plugins.autocomplete.onValueChange) {
        options.plugins.autocomplete.onValueChange.call(this, arguments);
      }
    };

    var addEvent = function (type, fn) {
      if (events[type] == undefined) events[type] = [];
      var exists = false;
      $.each(events[type], function (f) {
        if (f === fn) {
          exists = true;
          return;
        }
      });
      if (!exists) events[type].push(fn);
      return self;
    };

    var fireEvent = function (type, args, delay) {
      if (!events || !events[type]) return self;
      $.each(events[type], function (i, fn) {
        (function () {
          args = args != undefined ? splat(args) : Array.prototype.slice.call(arguments);
          var returns = function () {
            return fn.apply(self || null, args);
          };
          if (delay) return setTimeout(returns, delay);
          return returns();
        })();
      });
      return self;
    };

    var removeEvent = function (type, fn) {
      if (events[type]) {
        for (var i = events[type].length; i--; i) {
          if (events[type][i] === fn) events[type].splice(i, 1);
        }
      }
      return self;
    };

    var isDuplicate = function (v) {
      return $.inArray(uniqueValue(v), index);
    };

    this.focus = function (ev) {
      focusLast();
    };
    this.onFocus = function (bit) {
      if (current) current.blur();
      clearTimeout(blurtimer);
      current = bit;
      container.addClass(options.prefix + '-focus');
      if (options.focusWithBorder) {
        container.parent().addClass('textboxlist-bits-focus');
        container.find('.addCancelCon').show();
      }
      if (!focused) {
        focused = true;
        fireEvent('focus', bit);
      }
    };

    this.onAdd = function (bit) {
      if (options.unique && bit.is('box')) {
        if (options.immediate.enble) {
          var tempvalue = bit.getValue();
          if (chk(tempvalue[0])) index.push(uniqueValue(tempvalue));
        } else index.push(uniqueValue(bit.getValue()));
      }
      if (bit.is('box')) {
        var prior = getBit(bit.toElement().prev());
        if ((prior && prior.is('box') && options.inBetweenEditableBits) || (!prior && options.startEditableBit)) {
          var priorEl = prior && prior.toElement().length ? prior.toElement() : false;
          var b = create('editable').inject(priorEl || list, priorEl ? 'after' : 'top');
          if (options.hideEditableBits) b.hide();
        }
        update();
      }
      if ($.isFunction(options.beforeAdd)) {
        options.beforeAdd(bit);
      }
    };
    this.onRemove = function (bit) {
      // if (!focused) return;
      if (options.unique && bit.is('box')) {
        var i = isDuplicate(bit.getValue());
        if (i != -1) index.splice(i, 1);
      }
      var prior = getBit(bit.toElement().prev());
      if (prior && prior.is('editable')) prior.remove();
      focusRelative('next', bit);
    };

    this.onBlur = function (bit, all) {
      current = null;
      container.removeClass(options.prefix + '-focus');
      container.parent().removeClass('textboxlist-bits-focus');
      container.find('.addCancelCon').hide();
      // 失去焦点以前执行代码
      if ($.isFunction(options.beforeBlur)) {
        options.beforeBlur();
      }
      blurtimer = setTimeout(blur, all ? 0 : 200);
    };

    this.setOptions = function (opt, opt2) {
      if (opt2) {
        for (let name in opt) {
          for (let name2 in options) {
            if (name == name2) {
              $.extend(true, opt2[name], options[name]);
              break;
            }
          }
        }
        options = $.extend(true, options, opt);
        return opt2;
      } else options = $.extend(true, options, opt);
    };

    this.getOptions = function () {
      return options;
    };

    this.getContainer = function () {
      return container;
    };

    this.isDuplicate = isDuplicate;
    this.addEvent = addEvent;
    this.uniqueValue = uniqueValue;
    this.removeEvent = removeEvent;
    this.fireEvent = fireEvent;
    this.create = create;
    this.add = add;
    this.getValues = getValues;
    this.index = index;
    this.plugins = [];
    init();
  };

  $.TextboxListBit = function (type, value, textboxlist, _options, isPreset) {
    var element,
      bit,
      prefix,
      typeprefix,
      close,
      hidden = true,
      focused = false,
      name = capitalize(type);
    var pOptions = textboxlist.getOptions();
    var options = $.extend(
      true,
      type == 'box'
        ? {
            deleteButton: true,
          }
        : {
            tabIndex: null,
            growing: true,
            growingOptions: {},
            stopEnter: true,
            addOnBlur: false,
            addKeys: [13],
          },
      _options
    );

    this.type = type;
    this.value = value;

    var self = this;
    var init = function () {
      prefix = textboxlist.getOptions().prefix + '-bit';
      typeprefix = prefix + '-' + type;
      bit = $('<li />')
        .addClass(prefix)
        .addClass(typeprefix)
        .data('textboxlist:bit', self)
        .hover(
          function () {
            bit.addClass(prefix + '-hover').addClass(typeprefix + '-hover');
          },
          function () {
            bit.removeClass(prefix + '-hover').removeClass(typeprefix + '-hover');
          }
        );
      bit.on('toBox', toBox);
      if (type == 'editable') {
        element = $('<input/>')
          .attr('type', 'text')
          .addClass(typeprefix + '-input')
          .attr('autocomplete', 'off')
          .val(self.value ? self.value[1] : '')
          .appendTo(bit);
        element
          .focus(function () {
            focus(true);
          })
          .blur(function () {
            blur(true);
            if (options.addOnBlur) toBox();
          });
        if (options.addKeys || options.stopEnter) {
          element.keydown(function (ev) {
            if (!focused) return;
            var evStop = function () {
              ev.stopPropagation();
              ev.preventDefault();
            };
            if (options.stopEnter && ev.which === 13) evStop();
            if ($.inArray(ev.which, splat(options.addKeys)) != -1) {
              evStop();
              toBox();
            }
          });
        }
        if (chk(options.tabIndex)) element.tabIndex = options.tabIndex;
        if (options.growing) new $.GrowingInput(element, options.growingOptions);
        if (hidden) element.hide();
        if (options.mark) {
          element.mark = $('<span/>')
            .addClass(typeprefix + '-addtag ThemeColor4')
            .html(options.markText)
            .click(function (event) {
              $(this).hide();
              event.stopPropagation();
              event.preventDefault();
              element.show();
              element.focus();
            })
            .appendTo(bit);
        }
      } else if (type == 'box') {
        if (pOptions.immediate.enble && !isPreset) {
          if (pOptions.innerWidth != null) {
            bit.text = $('<span/>')
              .addClass('overflowellipsis')
              .css({
                'max-width': pOptions.innerWidth + 'px',
                width: pOptions.innerWidth + 'px',
                width: 'auto!important',
              })
              .html(_l('加载中…'))
              .appendTo(bit);
          } else {
            bit.text = $('<span/>')
              .html(_l('加载中…'))
              .appendTo(bit);
          }

          if (options.deleteButton) {
            bit.addClass(typeprefix + '-deletable');
            bit.close = $('<a/>')
              .addClass(typeprefix + '-deletebutton')
              .click(remove)
              .appendTo(bit);
            bit.close.hide();
          }
          bit.isload = true;
          var data = pOptions.immediate.add.extraParams;
          // 任务中心
          if ($.isFunction(pOptions.immediate.add.beforeAdd)) {
            pOptions.immediate.add.beforeAdd(data);
          }

          if (chk(value[0])) data[pOptions.immediate.add.param[0]] = value[0];
          data[pOptions.immediate.add.param[0]] = value[2];
          pOptions.immediate.add.param.length == 2 ? (data[pOptions.immediate.add.param[1]] = value[2]) : false;
          if (pOptions.innerWidth != null) {
            data.CatID = data.CatID.SpecialCharacters();
            data.CatNameStr = data.CatNameStr.SpecialCharacters();
          }
          if (pOptions.immediate.add.url) {
            $.ajax({
              url: pOptions.immediate.add.url,
              data: data,
              cache: false,
              async: true,
              dataType: 'JSON',
              success: function (r) {
                bit.isload = false;
                textboxlist.index.push(textboxlist.uniqueValue(r));
                if (pOptions.immediate.add.callback) {
                  pOptions.immediate.add.callback(r, bit);
                } else {
                  bit.text.html(htmlEncodeReg(r[1]));
                  if (bit.close) bit.close.show();
                }
                textboxlist.onRemove(self);
              },
            });
          } else if (typeof pOptions.immediate.add.action === 'function') {
            pOptions.immediate.add.action(data).then(function (result) {
              result = pOptions.immediate.add.resultFilter ? pOptions.immediate.add.resultFilter(result) : [result.id, htmlEncodeReg(result.value)];
              bit.isload = false;
              textboxlist.index.push(textboxlist.uniqueValue(result));
              if (pOptions.immediate.add.callback) {
                pOptions.immediate.add.callback(result, bit);
              } else {
                bit.text.html(result[1]);
                if (bit.close) {
                  bit.close.show();
                }
              }
              textboxlist.onRemove(self);
            });
          }
        } else {
          if (pOptions.innerWidth != null) {
            if (self.value[2] != '' && self.value[2] != undefined) {
              bit.text = $('<span/>')
                .addClass('overflowellipsis')
                .css({
                  'max-width': pOptions.innerWidth + 'px',
                  width: pOptions.innerWidth + 'px',
                  width: 'auto!important',
                })
                .html(htmlEncodeReg(chk(self.value[2].SpecialCharacters()) ? self.value[2].SpecialCharacters() : self.value[1].SpecialCharacters()))
                .appendTo(bit);
            } else {
              return;
            }
          } else {
            bit.text = $('<span/>')
              .html(htmlEncodeReg(chk(self.value[2]) ? self.value[2] : self.value[1]))
              .appendTo(bit);
          }
          bit.attr('id', 'textboxlistbit_' + self.value[0]).attr('sign', self.value[0]);
          if (options.deleteButton) {
            bit.addClass(typeprefix + '-deletable');
            close = $('<a/>')
              .addClass(typeprefix + '-deletebutton')
              .click(remove)
              .appendTo(bit);
          }
        }
        if (pOptions.keysEnble) bit.click(focus);
        bit.children().click(function (e) {
          $('#hoverMember').hide();
          e.stopPropagation();
          e.preventDefault();
        });
      }
    };

    var inject = function (el, where) {
      switch (where || 'bottom') {
        case 'top':
          bit.prependTo(el);
          break;
        case 'bottom':
          bit.appendTo(el);
          break;
        case 'before':
          bit.insertBefore(el);
          break;
        case 'after':
          bit.insertAfter(el);
          break;
        case 'replace':
          bit.replaceAll(el);
          break;
      }
      textboxlist.onAdd(self);
      return fireBitEvent('add');
    };

    var focus = function (noReal) {
      if (focused) return self;
      show();
      focused = true;
      textboxlist.onFocus(self);
      bit.addClass(prefix + '-focus').addClass(prefix + '-' + type + '-focus');
      fireBitEvent('focus');
      if (type == 'editable' && !noReal) {
        if (options.mark) element.mark.hide();
        element.show().select();
      }
      return self;
    };

    var blur = function (noReal) {
      if (!focused) return self;
      focused = false;
      textboxlist.onBlur(self);
      bit.removeClass(prefix + '-focus').removeClass(prefix + '-' + type + '-focus');
      fireBitEvent('blur');
      if (type == 'editable') {
        if (!noReal) {
          element.blur();
        }
        if (hidden && !element.val().length) hide();
      }
      return self;
    };

    var remove = function () {
      if (bit.isload) return;
      blur();
      textboxlist.onRemove(self);
      pOptions = textboxlist.getOptions();
      if (pOptions.immediate.enble) {
        var value = $(bit).data('textboxlist:bit').value;
        if (value) {
          var tagId = value[0];
          var data = pOptions.immediate.remove.extraParams;
          data[pOptions.immediate.remove.param[0]] = value[0];
          pOptions.immediate.remove.param.length == 2 ? (data[pOptions.immediate.remove.param[1]] = value[2]) : false;
          if (pOptions.immediate.remove.url) {
            $.ajax({
              url: pOptions.immediate.remove.url,
              data: data,
              cache: false,
              async: true,
              dataType: 'JSON',
              success: function (r) {
                if (pOptions.immediate.remove.callback) pOptions.immediate.remove.callback(tagId, bit);
              },
            });
          } else if (typeof pOptions.immediate.remove.action === 'function') {
            pOptions.immediate.remove.action(data).then(function (result) {
              result = pOptions.immediate.remove.action.resultFilter ? pOptions.immediate.remove.action.resultFilter(result) : result;
              pOptions.immediate.remove.callback && pOptions.immediate.remove.callback(tagId, bit);
            });
          }
        }
      }

      if (!pOptions.immediate.isTaskLabelMatch) {
        bit.remove();
      }

      return fireBitEvent('remove');
    };

    var show = function () {
      bit.css('display', 'block');
      return self;
    };

    var hide = function () {
      if (options.mark) {
        bit.children('.' + typeprefix + '-addtag').show();
        bit.children('.' + typeprefix + '-input').hide();
      } else bit.css('display', 'none');
      hidden = true;
      return self;
    };

    var fireBitEvent = function (type) {
      type = capitalize(type);
      textboxlist.fireEvent('bit' + type, self).fireEvent('bit' + name + type, self);
      return self;
    };

    this.is = function (t) {
      return type == t;
    };

    this.setValue = function (v) {
      if (type == 'editable') {
        element.val(chk(v[0]) ? v[0] : v[1]);
        if (options.growing) element.data('growing').resize();
      } else value = v;
      return self;
    };

    this.getValue = function () {
      return type == 'editable' ? [null, element.val(), element.val()] : value;
    };

    if (type == 'editable') {
      this.getCaret = function () {
        var el = element.get(0);
        if (el.createTextRange) {
          var r = document.selection.createRange().duplicate();
          r.moveEnd('character', el.value.length);
          if (r.text === '') return el.value.length;
          return el.value.lastIndexOf(r.text);
        } else return el.selectionStart;
      };

      this.getCaretEnd = function () {
        var el = element.get(0);
        if (el.createTextRange) {
          var r = document.selection.createRange().duplicate();
          r.moveStart('character', -el.value.length);
          return r.text.length;
        } else return el.selectionEnd;
      };

      this.isSelected = function () {
        return focused && self.getCaret() !== self.getCaretEnd();
      };

      var toBox = function () {
        var value = self.getValue();
        var b = textboxlist.create('box', value);
        if (b) {
          b.inject(bit, 'before');
          self.setValue([null, '', null]);
          return b;
        }
        return null;
      };

      this.toBox = toBox;
    }

    this.toElement = function () {
      return bit;
    };

    this.focus = focus;
    this.blur = blur;
    this.remove = remove;
    this.inject = inject;
    this.show = show;
    this.hide = hide;
    this.fireBitEvent = fireBitEvent;
    init();
  };

  var chk = function (v) {
    return !!(v || v === 0);
  };
  var splat = function (a) {
    return $.isArray(a) ? a : [a];
  };
  var camelCase = function (str) {
    return str.replace(/-\D/g, function (match) {
      return match.charAt(1).toUpperCase();
    });
  };
  var capitalize = function (str) {
    return str.replace(/\b[a-z]/g, function (A) {
      return A.toUpperCase();
    });
  };

  $.fn.extend({
    textboxlist: function (options) {
      return this.each(function () {
        new $.TextboxList(this, options);
      });
    },
  });

  $.TextboxList.Autocomplete = function (textboxlist, _options) {
    var index,
      prefix,
      method,
      container,
      list,
      values = [],
      searchValues = [],
      results = [],
      placeholder = false,
      current,
      currentInput,
      hidetimer,
      doAdd,
      currentSearch,
      currentRequest;
    var options = $.extend(
      true,
      {
        minLength: 1,
        maxResults: 10,
        insensitive: true,
        highlight: false,
        highlightSelector: null,
        mouseInteraction: true,
        onlyFromValues: false,
        defaultOftenCollaborate: false,
        autoSelectFocus: false,
        notOnlyFromValueValidate: function (value) {
          return true;
        },
        onValueChange: null, // 当添加Labe时触发
        queryRemote: true,
        remote: {
          url: '',
          param: 'keywords',
          extraParams: {
            r: new Date().toString(),
          },
          collaborateParam: {
            type: 'OftenCollaborate',
          }, // 常用联系人
          loadPlaceholder: '查询中，请稍候...',
        },
        method: 'standard',
        bitsOptions: {
          editable: {},
          box: {},
        },
        placeholder: '输入同事姓名或Email...',
      },
      _options
    );
    var pOptions = textboxlist.getOptions();
    var init = function () {
      textboxlist
        .addEvent('bitEditableAdd', setupBit)
        .addEvent('bitEditableFocus', search)
        .addEvent('bitEditableBlur', hide);
      if ($.browser.msie) {
        options = textboxlist.setOptions(
          {
            bitsOptions: {
              editable: {
                addOnBlur: false,
              },
            },
          },
          options
        );
      }
      options = textboxlist.setOptions(
        {
          bitsOptions: {
            editable: {
              addKeys: false,
              stopEnter: false,
            },
          },
        },
        options
      );
      if (!pOptions.keysEnble) options.bitsOptions.editable.addKeys = [13];
      prefix = textboxlist.getOptions().prefix + '-autocomplete';
      method = $.TextboxList.Autocomplete.Methods[options.method];
      container = $('<div/>')
        .addClass(prefix)
        .width(textboxlist.getOptions().width)
        .appendTo(textboxlist.getContainer());
      if (chk(options.placeholder)) {
        placeholder = $('<div/>')
          .addClass(prefix + '-placeholder')
          .html(options.placeholder)
          .appendTo(container);
      }
      list = $('<ul/>')
        .addClass(prefix + '-results')
        .appendTo(container)
        .click(function (ev) {
          ev.stopPropagation();
          ev.preventDefault();
        });
    };

    var setupBit = function (bit) {
      var a = 0;
      bit
        .toElement()
        .keydown(navigate)
        .keyup(function (e) {
          search(null, e);
        });
    };

    var search = function (bit, e) {
      if (bit) currentInput = bit;
      if (!options.queryRemote && !values.length) return;
      var search = $.trim(currentInput.getValue()[1]);

      if (!options.defaultOftenCollaborate) {
        if (search.length < options.minLength) {
          showPlaceholder();
        }
        if (search == currentSearch) return;
      } else {
        if (search == currentSearch && list.is(':visible')) {
          if (e) {
            //! options.autoSelectFocus
            var e = window.event ? window.event : arguments.callee.caller.arguments[0];
            if (e.keyCode == 38 || e.keyCode == 40) return;
          }
        }
      }
      currentSearch = search;
      list.css('display', 'none');
      if (!options.defaultOftenCollaborate) {
        if (search.length < options.minLength) return;
      }
      if (options.queryRemote) {
        var data = options.remote.extraParams;
        if (options.defaultOftenCollaborate && currentSearch == '') {
          data = options.remote.collaborateParam;
        }
        data[options.remote.param] = search;
        if (currentRequest) currentRequest.abort();
        if (options.remote.url) {
          currentRequest = $.ajax({
            url: options.remote.url,
            data: data,
            type: 'POST',
            cache: false,
            dataType: 'JSON',
            success: function (r) {
              values = r;
              showResults(search);
            },
          });
        } else if (typeof options.remote.action === 'function') {
          currentRequest = options.remote.action(data);
          currentRequest.then(function (result) {
            result = options.remote.resultFilter ? options.remote.resultFilter(result) : result;
            values = result;
            showResults(search);
          });
        }
      }
      // showResults(search);
    };

    // 只分类使用
    var f = false;

    var showResults = function (search, from) {
      var results = method.filter(values, search, options.insensitive, options.maxResults);
      if (textboxlist.getOptions().unique) {
        results = $.grep(results, function (v) {
          return textboxlist.isDuplicate(v) == -1;
        });
      }
      hidePlaceholder();
      blur();
      if (!results.length) {
        showPlaceholder();
        return;
      }
      list.empty().css('display', 'block');
      $.each(results, function (i, r) {
        addResult(r, search);
      });
      if (options.defaultOftenCollaborate) focusFirst();
      results = results;
    };

    var addResult = function (r, searched) {
      // var element = $('<li/>').addClass(prefix + '-result').html(r[3] ? r[3] : r[1]).data('textboxlist:auto:value', r);
      var element;

      if (r[5]) {
        element = $('<li title="' + r[4] + '"/>')
          .addClass(prefix + '-result')
          .html(htmlEncodeReg(r[3] + ' (' + r[5] + ' ' + r[6] + ')'))
          .data('textboxlist:auto:value', r);
      } else {
        if (r[0] == 'title') {
          f = true;
          element = $('<li/>')
            .addClass(prefix + '-unresult')
            .html(htmlEncodeReg(r[3] ? r[3] : r[1]));
        } else {
          if (f) {
            element = $('<li/>')
              .addClass(prefix + '-resultItem')
              .html(htmlEncodeReg(r[3] ? r[3] : r[1]))
              .data('textboxlist:auto:value', r);
          } else {
            element = $('<li/>')
              .addClass(prefix + '-result')
              .html(htmlEncodeReg(r[3] ? r[3] : r[1]))
              .data('textboxlist:auto:value', r);
          }
        }
      }
      element.appendTo(list);
      if (options.highlight) {
        $(options.highlightSelector ? element.find(options.highlightSelector) : element).each(function () {
          if ($(this).html()) method.highlight($(this), searched, options.insensitive, prefix + '-highlight');
        });
      }
      if (options.mouseInteraction) {
        element
          .css('cursor', 'pointer')
          .hover(function () {
            focus(element);
          })
          .mousedown(function (ev) {
            ev.stopPropagation();
            ev.preventDefault();
            clearTimeout(hidetimer);
            doAdd = true;
          })
          .mouseup(function () {
            if (doAdd) {
              addCurrent();
              currentInput.focus();
              if ($('#dialogSendMessage #txtContent').length > 0) {
                $('#dialogSendMessage #txtContent').focus();
              } else {
                search();
              }
              doAdd = false;
            }
          });
        if (!options.onlyFromValues) {
          element.mouseleave(function () {
            if (current && current.get(0) == element.get(0)) blur();
          });
        }
      }
    };

    var hide = function () {
      hidetimer = setTimeout(function () {
        hidePlaceholder();
        list.css('display', 'none');
        currentSearch = null;
      }, $.browser.msie ? 150 : 0);
    };

    var showPlaceholder = function () {
      if (placeholder) placeholder.css('display', 'block');
    };

    var hidePlaceholder = function () {
      if (placeholder) placeholder.css('display', 'none');
    };

    var focus = function (element) {
      if (!element || !element.length) return;
      blur();
      if (element.attr('class').indexOf('-unresult') == -1) {
        current = element.addClass(prefix + '-result-focus');
      } else {
        element.removeAttr('style');
      }
    };

    var blur = function () {
      if (current && current.length) {
        current.removeClass(prefix + '-result-focus');
        current = null;
      }
    };

    var focusFirst = function () {
      if (list.find('.textboxlist-autocomplete-resultItem').length > 0 && list.is(':visible')) {
        return focus(list.find('.textboxlist-autocomplete-resultItem').eq(0));
      } else {
        return focus(list.find(':first'));
      }
    };

    var focusRelative = function (dir) {
      if (!current || !current.length) return self;
      var element = current[dir]();
      if (element.attr('class').indexOf('-unresult') != -1) {
        element = element[dir]();
      }
      return focus(element);
    };

    var addCurrent = function () {
      var value = current.data('textboxlist:auto:value');
      var b = textboxlist.create('box', value.slice(0, 3), {
        deleteButton: true,
      });
      if (b) {
        b.autoValue = value;
        if ($.isArray(index)) index.push(value);
        currentInput.setValue([null, '', null]);
        b.inject(currentInput.toElement(), 'before');
      }
      blur();
      return self;
    };

    var navigate = function (ev) {
      var evStop = function () {
        ev.stopPropagation();
        ev.preventDefault();
      };
      if (
        (options.bitsOptions &&
          $.inArray(
            ev.which,
            $.isArray(options.bitsOptions.editable.addKeys) ? options.bitsOptions.editable.addKeys : [options.bitsOptions.editable.addKeys]
          ) != -1) ||
        ev.which == 13
      ) {
        evStop();
        if (current && current.length) {
          addCurrent();
          if ($('#overlay #txtContent').length > 0) {
            $('#overlay #txtContent').focus();
          }
        } else if (!options.onlyFromValues && options.notOnlyFromValueValidate(currentInput.getValue())) {
          var value = currentInput.getValue();
          var b = textboxlist.create('box', value);
          if (b) {
            b.inject(currentInput.toElement(), 'before');
            currentInput.setValue([null, '', null]);
          }
        }
      }
      switch (ev.which) {
        case 38:
          evStop();
          !options.onlyFromValues && current && current.get(0) === list.find(':first').get(0) ? blur() : focusRelative('prev');
          break;
        case 40:
          evStop();
          current && current.length ? focusRelative('next') : focusFirst();
          break;
      }
    };

    this.setValues = function (v) {
      values = v;
    };

    init();
  };

  $.TextboxList.Autocomplete.Methods = {
    standard: {
      filter: function (values, search, insensitive, max) {
        if (!values || !values.length) {
          return [];
        }
        var newvals = [],
          regexp = new RegExp('' + escapeRegExp(search), insensitive ? 'i' : '');
        for (var i = 0; i < values.length; i++) {
          if (newvals.length === max) {
            break;
          }
          if (regexp.test(values[i][1]) || values[i][0] == 'title') {
            newvals.push(values[i]);
          }
        }

        return newvals;
      },

      highlight: function (element, search, insensitive, klass) {
        var regex = new RegExp('(<[^>]*>)|(' + escapeRegExp(search) + ')', insensitive ? 'i' : '');
        return element.html(
          element.html().replace(regex, function (a, b, c) {
            return a.charAt(0) == '<' ? a : '<strong class="' + klass + '">' + c + '</strong>';
          })
        );
      },
    },
  };

  var chk = function (v) {
    return !!(v || v === 0);
  };
  var escapeRegExp = function (str) {
    return str.replace(/([-.*+?^${}()|[\]\/\\])/g, '\\$1');
  };

  $.TextboxList.Autocomplete.Methods.binary = {
    filter: function (values, search, insensitive, max) {
      var method = insensitive ? 'toLowerCase' : 'toString',
        low = 0,
        high = values.length - 1,
        lastTry;
      search = search[method]();
      while (high >= low) {
        var mid = parseInt((low + high) / 2);
        var curr = values[mid][1].substr(0, search.length)[method]();
        var result = search == curr ? 0 : search > curr ? 1 : -1;
        if (result < 0) {
          high = mid - 1;
          continue;
        }
        if (result > 0) {
          low = mid + 1;
          continue;
        }
        if (result === 0) break;
      }
      if (high < low) return [];
      var newvalues = [values[mid]],
        checkNext = true,
        checkPrev = true,
        v1,
        v2;
      for (var i = 1; i <= values.length - mid; i++) {
        if (newvalues.length === max) break;
        if (checkNext) v1 = values[mid + i] ? values[mid + i][1].substr(0, search.length)[method]() : false;
        if (checkPrev) v2 = values[mid - i] ? values[mid - i][1].substr(0, search.length)[method]() : false;
        checkNext = checkPrev = false;
        if (v1 === search) {
          newvalues.push(values[mid + i]);
          checkNext = true;
        }
        if (v2 === search) {
          newvalues.unshift(values[mid - i]);
          checkPrev = true;
        }
        if (!(checkNext || checkPrev)) break;
      }
      return newvalues;
    },

    highlight: function (element, search, insensitive, klass) {
      var regex = new RegExp('(<[^>]*>)|(\\b' + search.replace(/([-.*+?^${}()|[\]\/\\])/g, '\\$1') + ')', insensitive ? 'ig' : 'g');
      return element.html(
        element.html().replace(regex, function (a, b, c, d) {
          return a.charAt(0) == '<' ? a : '<strong class="' + klass + '">' + c + '</strong>';
        })
      );
    },
  };

  // html 转义
  String.prototype.SpecialCharacters = function () {
    return this.replace(/"/g, '&quot;')
      .replace(/'/g, '&acute;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };
})($);
