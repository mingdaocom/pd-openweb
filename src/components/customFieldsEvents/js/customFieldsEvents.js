import React from 'react';
var attachments = [];
var ajaxRequest = require('src/api/form');
import RelationControl from 'src/components/relationControl/relationControl';
import ReactDom from 'react-dom';
import 'src/components/mdBusinessCard/mdBusinessCard';
import 'src/components/mdDialog/dialog';
import { getClassNameByExt } from 'src/util';
import nzh from 'nzh';
let nzhCn = nzh.cn;
import 'src/components/autoTextarea/autoTextarea';
import 'src/components/uploadAttachment/uploadAttachment';
import 'src/components/selectLocation/selectLocation';
import { initUserListItem, initGroupListItem, initDatetimeItem, initDatetimeRangeItem, initMultipleDropdownItem } from '../init';

const URL_REG = /((?:(https?(?::\/\/)(www\.)?)|(www\.))[a-z0-9-_.]+(?:\.[a-z0-9]{2,})(?:[-a-z0-9:%_+.~#?&//=@]*))/gi;
const linkify = text => {
  return text.replace(URL_REG, url => {
    return `<a href='${url.indexOf('//') >= 0 ? url : '//' + url}' target='_blank'>${url}</a>`;
  });
};
const positionLast = obj => {
  obj.focus();
  if (window.getSelection) {
    let maxLen = obj.value.length;
    obj.setSelectionRange(maxLen, maxLen);
  } else if (document.selection) {
    let range = obj.createTextRange();
    range.collapse(false);
    range.select();
  }
};

// 1234.00 => 1,234.00
const parseNumber = value => {
  let str = value;
  let a = value;
  let b = '';

  const dotIndex = value.indexOf('.');
  if (dotIndex > 0) {
    a = value.substring(0, dotIndex);
    b = value.substring(dotIndex + 1);
  }

  if (a) {
    const length = a.length;
    const list = [];
    for (let i = 1; i <= length; i++) {
      list.push(a[length - i]);
      if (i % 3 === 0 && i !== length) {
        list.push(',');
      }
    }

    list.reverse();

    str = list.join('');

    if (b) {
      str += `.${b}`;
    }
  }

  return str;
};

window.__parseNumber = parseNumber;

let accAdd = (arg1, arg2) => {
  var r1, r2, m;
  try {
    r1 = arg1.toString().split('.')[1].length;
  } catch (e) {
    r1 = 0;
  }
  try {
    r2 = arg2.toString().split('.')[1].length;
  } catch (e) {
    r2 = 0;
  }
  m = Math.pow(10, Math.max(r1, r2));
  return ((arg1 * m) + (arg2 * m)) / m;
};

let sum = (list) => {
  const len = list.length;
  if (!len) {
    return 0;
  } else if (len === 1) {
    return list[0];
  } else {
    const res = accAdd(list[0], list[1]);
    const newList = list.slice(1);
    newList[0] = res;

    return sum(newList);
  }
};
let calculateEvaluationValue = (ids) => {
  var result = [];
  var inputValue;
  var newData;

  ids.map((idData, i, list) => {
    let id = idData.id;
    let type = idData.type;
    let dot;

    $('.customDetailSingle[data-id=' + id + ']').each(function (i, item) {
      inputValue = $.trim($(item).find('input').val());
      dot = $(item).find('input').data('dot');
      if (inputValue
          && !isNaN(parseFloat(inputValue))) {

        inputValue = inputValue.replace(/,/g, '');
        result.push(parseFloat(inputValue));
      }
    });

    if (type === 2) {
      newData = sum(result);
    } else if (type === 3) {
      newData = (sum(result) / result.length) ? (sum(result) / result.length) : 0;
    } else if (type === 4) {
      newData = result.length ? _.min(result) : '';
    } else if (type === 5) {
      newData = result.length ? _.max(result) : '';
    } else {
      var product = 1;
      result.forEach(function (data) {
        product = product * data;
      });
      newData = product;
    }

    newData = dot ? newData.toFixed(dot) : newData;

    $('#detailTop_' + id).html(newData.toString().replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
    if ($('#detailTop_' + id).attr('data-money') === 'true') {
      $('#detailTop_' + id).siblings('span').html(nzhCn.toMoney(newData).substring(3));
    }

    $('#detailBottom_' + id).html(newData.toString().replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
    if ($('#detailBottom_' + id).attr('data-money') === 'true') {
      $('#detailBottom_' + id).siblings('span').html(nzhCn.toMoney(newData).substring(3));
    }
  });
}
/**
 * 显示或隐藏未填写警告
 * @param {*} target
 * @param {boolean} isError
 */
let formItemError = (target, isEmpty) => {
  if (isEmpty) {
    target.addClass('error');
  } else {
    target.removeClass('error');
  }
};

// 验证组件
var MDValidation = function (settings) {
  var _this = this;
  var defaults = {
    errorText: {
      Required: _l('必填项'),
      Phone: _l('请填写正确的手机号'),
      Telephone: _l('请填写正确的座机号'),
      Email: _l('请填写正确的邮箱'),
      IDcard: _l('请填写正确的身份证号码'),
      Passport: _l('请填写正确的护照'),
      HKPassport: _l('请填写正确的港澳通行证'),
      TWPassport: _l('请填写正确的台湾通行证'),
    },
    validationAfterPost: null,
  };
  this.settings = $.extend({}, defaults, settings);
  // 正则
  this.settings.regular = {
    Phone: /^[+]?[0-9]{5,}$/,
    Telephone: /^[+]?((\d){3,4}([ ]|[-]))?((\d){3,9})(([ ]|[-])(\d){1,12})?$/,
    Email: /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)*\.[\w-]+$/i,
    IDcard: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
    Passport: /^[a-zA-Z0-9]{5,17}$/,
    HKPassport: /.*/,
    TWPassport: /.*/,
  };

  Object.keys(this.settings.regular).forEach(function (type) {
    _this.settings.$el.find('[data-validation=' + type + ']').on({
      blur: function () {
        _this.validation($(this), type);
      },
      keydown: function (event) {
        if (event.keyCode === 13) {
          if (type !== 'Phone' && type !== 'Email') {
            $(this).blur();
            return false;
          }
        }
      },
    });
  });

  // 必填验证
  _this.settings.$el.find('input[data-required=true], textarea[data-required=true]').on({
    blur: function () {
      _this.inputCheckRequired(this);
    },
  });

  // 明细必填项验证
  _this.settings.$el.find('.customDetailBox[data-required=true]').on(
    {
      blur: function () {
        if ($.trim($(this).val())) {
          var $parentNode = $(this).closest('.customDetailBox');
          $parentNode.find('.validationError,.validationErrorArrow').remove();
        }
      },
      keydown: function (event) {
        if (event.keyCode === 13) {
          $(this).blur();
          return false;
        }
      },
    },
    'input, textarea'
  );

  // 数值验证
  this.settings.$el.find('[data-validation=Number]').on({
    'keyup paste': function (event) {
      if (event.keyCode === 36 || event.keyCode === 37 || event.keyCode === 39) {
        return;
      }
      var num = $(this)
        .val()
        .replace(/[^-\d.]/g, '')
        .replace(/^\./g, '')
        .replace(/^-/, '$#$')
        .replace(/-/g, '')
        .replace('$#$', '-')
        .replace(/^-\./, '-')
        .replace('.', '$#$')
        .replace(/\./g, '')
        .replace('$#$', '.');
      $(this).val(num);
    },
    keydown: function (event) {
      if (event.keyCode === 13) {
        $(this).blur();
        return false;
      }
    },
    blur: function () {
      var num = $(this)
        .val()
        .replace(/[^-\d.]/g, '')
        .replace(/^\./g, '')
        .replace(/^-/, '$#$')
        .replace(/-/g, '')
        .replace('$#$', '-')
        .replace(/^-\./, '-')
        .replace('.', '$#$')
        .replace(/\./g, '')
        .replace('$#$', '.');

      if (num === '.' || num === '-') {
        num = '';
      }
      $(this).val(num);
      var dot = $(this).data('dot');
      var number = $.trim($(this).val());
      var isEmpty = true;
      var $customFieldsNumberBox = $(this).siblings('.customFieldsNumberBox');

      if (number) {
        var dotSize = number.length > 16 ? 15 - number.split('.')[0].length : dot;
        number = parseFloat(number).toFixed(dotSize < 0 ? 0 : dotSize);
        isEmpty = false;
      }

      // 切换内容块
      $(this).addClass('Hidden');
      $customFieldsNumberBox.removeClass('Hidden');

      // 设置新值
      $customFieldsNumberBox
        .find('.customFieldsNumber')
        .html(parseNumber(number) || $(this).attr('placeholder'))
        .toggleClass('grayColor', number === '');
      $customFieldsNumberBox.find('.customUnits').toggleClass('Hidden', number === '');

      // 设置大写金额内容
      let bindId = `$${$(this).data('id')}$`;

      let moneyCn = null;
      let detailMain = $(this).closest('.customDetailMain');

      if (detailMain && detailMain.length) {
        moneyCn = detailMain.find(`.moneyCn[data-bind="${bindId}"]`);
      } else {
        moneyCn = $(`.moneyCn[data-bind="${bindId}"]`);
      }

      if (moneyCn) {
        let text = '';
        if (number) {
          text = nzhCn.toMoney(number).substring(3);
        } else {
          text = _l('未填写');
        }
        moneyCn.text(text);
      }

      formItemError(
        $(this)
          .closest('.flexRow')
          .find('.customFieldsLabel'),
        $(this).data('required') && isEmpty
      );
      formItemError(
        $(this)
          .closest('.customDetailSingle')
          .find('.detailControlName'),
        $(this).data('required') && isEmpty
      );

      $(this).val(number);
      _this.ajaxPost($(this), number);

      submitCalculate({
        type: _this.settings.type,
        $el: _this.settings.$el,
        target: this,
        number: number,
      });
    },
  });
};

$.extend(MDValidation.prototype, {
  inputCheckRequired: function (item) {
    var isEmpty = false;
    if ($.trim($(item).val()) === '' || ($(item).hasClass('customLocation') && !$(item).attr('selectvalue'))) {
      isEmpty = true;
    }
    formItemError(
      $(item)
        .closest('.flexRow')
        .find('.customFieldsLabel'),
      isEmpty
    );
    formItemError(
      $(item)
        .closest('.customDetailSingle')
        .find('.detailControlName'),
      isEmpty
    );
    // 验证格式
    if (!isEmpty && $(item).data('validate') && $(item).data('validate') !== null && $(item).data('validation')) {
      this.validation($(item), $(item).data('validation'));
    }

    return isEmpty;
  },
  checkItemRequired: function ($parent) {
    var _this = this;

    let errorCount = 0;
    // 验证input 和 textarea
    $parent.find('input[data-required=true], textarea[data-required=true]').each(function (i, item) {
      let isEmpty = _this.inputCheckRequired(item);
      if (isEmpty) {
        errorCount += 1;
      }
    });

    // 下拉框非空验证
    $parent.find('.customDropdownBox[data-required=true]').each(function (i, item) {
      let value = $(item).data('type');
      let isEmpty = !value || value === '0';
      formItemError(
        $(item)
          .closest('.flexRow')
          .find('.customFieldsLabel'),
        isEmpty
      );
      formItemError(
        $(item)
          .closest('.customDetailSingle')
          .find('.detailControlName'),
        isEmpty
      );

      if (isEmpty) {
        errorCount += 1;
      }
    });

    // 单选、多选必填验证
    $parent.find('.customOptionsBox[data-required=true]').each(function (i, item) {
      let isEmpty = !$(item).find('.customChecked').length;
      formItemError(
        $(item)
          .closest('.flexRow')
          .find('.customFieldsLabel'),
        isEmpty
      );
      formItemError(
        $(item)
          .closest('.customDetailSingle')
          .find('.detailControlName'),
        isEmpty
      );

      if (isEmpty) {
        errorCount += 1;
      }
    });

    $parent.find('.customFileUploader[data-required=true]').each(function (i, item) {
      let isEmpty = !$(item).data('files-length');
      formItemError(
        $(item)
          .closest('.customRowBox')
          .find('.customFieldsLabel'),
        isEmpty
      );
      formItemError(
        $(item)
          .closest('.customDetailSingle')
          .find('.detailControlName'),
        isEmpty
      );

      if (isEmpty) {
        errorCount += 1;
      }
    });

    // 人员选择必填验证
    $parent.find('.customUserList[data-required=true]').each(function (i, item) {
      let isEmpty = !$(item).data('users');
      formItemError(
        $(item)
          .closest('.customContents')
          .find('.customFieldsLabel'),
        isEmpty
      );
      formItemError(
        $(item)
          .closest('.customDetailSingle')
          .find('.detailControlName'),
        isEmpty
      );

      if (isEmpty) {
        errorCount += 1;
      }
    });

    // 部门选择必填验证
    $parent.find('.customGroupList[data-required=true]').each(function (i, item) {
      let isEmpty = !$(item).data('group');
      formItemError(
        $(item)
          .closest('.customContents')
          .find('.customFieldsLabel'),
        isEmpty
      );
      formItemError(
        $(item)
          .closest('.customDetailSingle')
          .find('.detailControlName'),
        isEmpty
      );

      if (isEmpty) {
        errorCount += 1;
      }
    });

    // 时间必填验证
    $parent.find('.datetime[data-required=true]').each(function (i, item) {
      let isEmpty = !$(item).data('time');
      formItemError(
        $(item)
          .closest('.customContents')
          .find('.customFieldsLabel'),
        isEmpty
      );
      formItemError(
        $(item)
          .closest('.customDetailSingle')
          .find('.detailControlName'),
        isEmpty
      );

      if (isEmpty) {
        errorCount += 1;
      }
    });

    // 时间段必填验证
    $parent.find('.datetimeRange[data-required=true]').each(function (i, item) {
      let isEmpty = !$(item).data('range');
      formItemError(
        $(item)
          .closest('.customContents')
          .find('.customFieldsLabel'),
        isEmpty
      );
      formItemError(
        $(item)
          .closest('.customDetailSingle')
          .find('.detailControlName'),
        isEmpty
      );

      const errorMsg = $(item).data('error');
      if (isEmpty || errorMsg) {
        errorCount += 1;
      }
    });

    // 下拉菜单（数据源）必填验证
    $parent.find('.multipleDropdownContainer[data-required=true]').each(function (i, item) {
      let isEmpty = !$(item).data('value');
      formItemError(
        $(item)
          .closest('.customContents')
          .find('.customFieldsLabel'),
        isEmpty
      );
      formItemError(
        $(item)
          .closest('.customDetailSingle')
          .find('.detailControlName'),
        isEmpty
      );

      if (isEmpty) {
        errorCount += 1;
      }
    });

    return errorCount;
  },
  required: function () {
    let _this = this;
    /**
     * 整个表单的状态
     */
    let errorCount = 0;
    /**
     * 非明细区域
     */
    let notDetailedErrorCount = _this.checkItemRequired(_this.settings.$el.find('.customContents'));
    errorCount += notDetailedErrorCount;
    /**
     * 明细区域
     */
    let detailedErrorCount = _this.checkItemRequired(_this.settings.$el.find('.customDetailMain:not(.Hidden)'));
    errorCount += detailedErrorCount;

    return _this.settings.$el.find('.validationError').length === 0 && !errorCount;
  },
  errorMsg: function ($el, isError, msg) {
    // 错误层
    $el.siblings('.validationError,.validationErrorArrow').remove();
    if (isError) {
      $el.after('<span class="validationError">' + msg + '</span><i class="validationErrorArrow"></i>');
    }
  },
  validation: function ($el, type) {
    var isError = !this.settings.regular[type].test($.trim($el.val()));
    var $item = $el.closest('.flexRow').find('.customFieldsLabel');
    if ($el.data('required') !== true && !$.trim($el.val())) {
      isError = false;
    }

    // 控件允许不验证
    if ($el.data('validate') === false) {
      isError = false;
    }

    // 必填
    if ($el.data('required') === true && !$.trim($el.val())) {
      isError = true;
      type = 'Required';
    }

    // 是否是明细处
    if ($el.closest('.customDetail').length) {
      $item = $el;
    }

    // 错误处理
    $item.removeClass('error');
    if (type === 'Required') {
      $item.addClass('error');
    } else {
      this.errorMsg($item, isError, this.settings.errorText[type]);
    }

    // 验证通过
    if (!isError) {
      this.ajaxPost($el, $.trim($el.val()));
    }
  },
  ajaxPost: function ($el, value) {
    if ($.isFunction(this.settings.validationAfterPost)) {
      this.settings.validationAfterPost($el, value);
    }
  },
});

var customEvents = function (settings) {
  attachments = [];
  var validationAfterPost = function ($el, value, callback) {
    if ($.isFunction(settings.validationAfterPost)) {
      settings.validationAfterPost($el, value, callback);
    }
  };
  // 移除必填项
  var removeErrorMeaasge = function ($el) {
    formItemError($el.closest('.customContents').find('.customFieldsLabel'), false);
    formItemError($el.closest('.customDetailSingle').find('.detailControlName'), false);
  };

  // 只读
  settings.$el.find('.customFieldsNoAuth').attr('disabled', 'disabled');

  // 文本域高度自动
  settings.$el.find('.customRowBox textarea.customTextarea').autoTextarea({
    minHeight: 24,
    maxHeight: 1000000,
  });

  // 文本框
  settings.$el.find('[data-keydownblursave=true]').on({
    blur: function () {
      validationAfterPost($(this), $.trim($(this).val()));
    },
    keydown: function (event) {
      if (event.keyCode === 13) {
        $(this).blur();
        return false;
      }
    },
  });

  // autofill
  settings.$el.find('[data-autofill=true]').on({
    focus: event => {
      $(event.target)
        .parent()
        .find('.custom-autofill')
        .data('current', '')
        .addClass('show');

      $(event.target)
        .parent()
        .find('.custom-autofill li')
        .removeClass('active');
    },
    blur: event => {
      $(event.target)
        .parent()
        .find('.custom-autofill')
        .removeClass('show');
    },
    keydown: event => {
      const list = $(event.target)
        .parent()
        .find('.custom-autofill');
      // BUG: not work well
      if (event.keyCode === 27) {
        // ESC
        event.preventDefault();
        event.stopPropagation();

        list.removeClass('show');
      }

      if ($(list).hasClass('show')) {
        const items = $(list).find('li');
        $(items).removeClass('active');

        let current = parseInt($(list).data('current'), 10);
        if (event.keyCode === 38) {
          // ↑
          event.preventDefault();

          if (!current || current <= 1) {
            current = items.length;
          } else {
            current = current - 1;
          }
        } else if (event.keyCode === 40) {
          // ↓
          event.preventDefault();

          if (!current || current > items.length) {
            current = 1;
          } else {
            current = current + 1;
          }
        } else if (event.keyCode === 13 && current) {
          // ENTER
          event.preventDefault();

          const value = $(list)
            .find(`li:nth-child(${current})`)
            .text();

          $(event.target)
            .val(value)
            .blur();
          list.removeClass('show');
        }

        if (current && current <= items.length) {
          $(list).data('current', current);

          $(list)
            .find(`li:nth-child(${current})`)
            .addClass('active');
        }
      }
    },
  });
  settings.$el.find('.custom-autofill li').on({
    mouseover: event => {
      $(event.target)
        .parent()
        .data('current', '');
      $(event.target)
        .parent()
        .find('li')
        .removeClass('active');
    },
    mousedown: event => {
      const value = $(event.target).text();
      $(event.target)
        .parent()
        .parent()
        .find('.customTextarea, .customText')
        .val(value);
    },
  });
  // 文本域进入编辑状态
  settings.$el.find('.customRowBox .customTextareaEdit').on('click', function (event) {
    if (!$(event.target).is($('.customTextareaEdit a'))) {
      let $textarea = $(this)
        .addClass('Hidden')
        .siblings('textarea')
        .removeClass('Hidden');
      positionLast($textarea[0]);
    }
  });

  // 文本域
  settings.$el.find('[data-blursave=true]').on('blur', function () {
    let text = $.trim($(this).val());
    validationAfterPost($(this), text);

    if (text) {
      $(this)
        .addClass('Hidden')
        .siblings('div.customTextarea')
        .removeClass('Hidden')
        .html(linkify(text));
    } else {
      $(this)
        .siblings('div.customTextarea')
        .html('');
    }
  });

  // 切换input
  settings.$el.find('.customFieldsNumberBox').on('click', function () {
    var $customText = $(this).siblings('.customText');

    $(this).addClass('Hidden');
    $customText
      .removeClass('Hidden')
      .focus()
      .val($customText.val());
  });

  // 地区绑定
  settings.$el.find('.customLocation').on('mousedown', function () {
    var $this = $(this);
    var level = $this.data('level');
    var hideCallback = function ($el, value) {
      removeErrorMeaasge($this);
      $el.attr('title', $el.val());
      $('.locationLayerContainer').css('zIndex', 20);
      validationAfterPost($el, value);
    };
    $this.selectLocation({
      level: level,
      hideCallback: hideCallback,
    });
  });

  // 下拉框
  settings.$el.find('.customDropdownBox').on('click', function () {
    $('.customDropdownList').addClass('Hidden');
    $(this)
      .find('.customDropdownList')
      .toggleClass('Hidden');
  });
  // 下拉框list点击
  settings.$el.find('.customDropdownList li').on('click', function (event) {
    var $this = $(this);
    var type = $this.attr('data-type');
    var txt = type === '0' ? $this.closest('.customDropdownBox').data('hint') : $this.text();

    $this
      .closest('.customDropdownBox')
      .toggleClass('empty', type === '0')
      .data('type', type)
      .attr('data-type', type)
      .find('.customDropdownName')
      .text(txt)
      .attr('title', txt);

    $this
      .closest('.customDropdownList')
      .addClass('Hidden')
      .find('.customDropdownClear')
      .toggleClass('Hidden', type === '0');

    removeErrorMeaasge($this);
    validationAfterPost($this, type);
    event.stopPropagation();
  });

  $(document).on('click.customDropdownBox', function (event) {
    var $target = $(event.target);

    if ($target.closest('.customDropdownBox').length === 0) {
      $('.customDropdownList').addClass('Hidden');
    }
  });

  // 单选
  settings.$el.find('.customRowBox .customRadio').on('click', function () {
    if ($(this).hasClass('customChecked')) {
      $(this).removeClass('customChecked');
      validationAfterPost($(this), '');
    } else {
      $(this)
        .addClass('customChecked')
        .siblings()
        .removeClass('customChecked');
      removeErrorMeaasge($(this));
      validationAfterPost($(this), $(this).attr('data-type'));
    }
  });
  // 多选
  settings.$el.find('.customRowBox .customCheckox').on('click', function () {
    var $this = $(this);
    var value = '';
    var key = '';
    var arrs = [];
    $this.toggleClass('customChecked');

    removeErrorMeaasge($this);
    $this
      .closest('.customFieldsBox')
      .find('.customCheckox.customChecked')
      .each(function (i, checkbox) {
        key = $(checkbox).attr('data-type');

        if (!value) {
          value = key;
        } else if (value.length > key.length) {
          arrs = value.split('');
          arrs.splice(value.length - key.length, 1, '1');
          value = arrs.join('');
        } else {
          value = key.substr(0, key.length - value.length) + value;
        }
      });
    validationAfterPost($this, value);
  });

  // 明细
  const updateCustomDetailNum = function () {
    $.map($('.customDetailBox'), function (item) {
      $.map(
        $(item)
          .find('.customDetailNum')
          .not('.customDetailMainClone'),
        function (num, index) {
          $(num).html(index + 1);
        }
      );
    });
  };
  settings.$el.find('.customDetailBox .customDetailAdd').on('click', function () {
    // check valid
    let valid = true;
    let errorElmts = settings.$el.find('.customDetailMain .validationError');
    if (errorElmts && errorElmts.length) {
      valid = false;
    }

    if (!valid) {
      return;
    }

    var $customDetailMainClone = $(this)
      .parent()
      .prev();
    $customDetailMainClone.before($customDetailMainClone.clone(true).removeClass('customDetailMainClone Hidden'));

    // moneyCn
    $(this)
      .parent()
      .prev()
      .prev()
      .find('.moneyCn')
      .text('未填写');

    // customUserList
    let userListItem = $(this)
      .parent()
      .prev()
      .prev()
      .find('.customUserList');
    userListItem.each((i, item) => {
      initUserListItem(item);
    });

    // customGroupList
    let groupListItem = $(this)
      .parent()
      .prev()
      .prev()
      .find('.customGroupList');
    groupListItem.each((i, item) => {
      initGroupListItem(item);
    });

    // multipleDropdown
    let multipleDropdownItem = $(this)
      .parent()
      .prev()
      .prev()
      .find('.multipleDropdown');
    multipleDropdownItem.each((i, item) => {
      initMultipleDropdownItem(item);
    });

    // datetime
    let datetimeItem = $(this)
      .parent()
      .prev()
      .prev()
      .find('.datetime');
    datetimeItem.each((i, item) => {
      let config = {
        value: '',
        type: 15,
      };
      let configText = $(item).attr('data-config');
      if (configText && JSON.parse(configText)) {
        config = JSON.parse(configText);
      }
      initDatetimeItem(item, config, validationAfterPost);
    });

    // datetimeRange
    let datetimeRangeItem = $(this)
      .parent()
      .prev()
      .prev()
      .find('.datetimeRange');
    datetimeRangeItem.each((i, item) => {
      let config = {
        value: '',
        type: 17,
        enumDefault2: 0,
      };
      let configText = $(item).attr('data-config');
      if (configText && JSON.parse(configText)) {
        config = JSON.parse(configText);
      }
      initDatetimeRangeItem(item, config, settings.$el, settings.type);
    });

    updateCustomDetailNum();
  });
  // 删除明细
  settings.$el.find('.customDetailBox .customDetailDel').on('click', function () {
    var $customDetailBox = $(this).closest('.customDetailBox');
    $(this)
      .closest('.customDetailMain')
      .remove();
    if ($customDetailBox.find('.customDetailMain:not(.Hidden)').length === 0) {
      $customDetailBox.find('.customDetailTitle').after(
        $customDetailBox
          .find('.customDetailMain')
          .clone(true)
          .removeClass('customDetailMainClone Hidden')
      );
      $customDetailBox.find('.moneyCn').text('未填写');

      // customUserList
      let userListItem = $customDetailBox.find('.customUserList');
      userListItem.each((i, item) => {
        initUserListItem(item);
      });

      // customGroupList
      let groupListItem = $customDetailBox.find('.customGroupList');
      groupListItem.each((i, item) => {
        initGroupListItem(item);
      });

      // multipleDropdown
      let multipleDropdownItem = $customDetailBox.find('.multipleDropdown');
      multipleDropdownItem.each((i, item) => {
        initMultipleDropdownItem(item);
      });

      // datetime
      let datetimeItem = $customDetailBox.find('.datetime');
      datetimeItem.each((i, item) => {
        let config = {
          value: '',
          type: 15,
        };
        let configText = $(item).attr('data-config');
        if (configText && JSON.parse(configText)) {
          config = JSON.parse(configText);
        }
        initDatetimeItem(item, config, validationAfterPost);
      });

      // datetimeRange
      let datetimeRangeItem = $customDetailBox.find('.datetimeRange');
      datetimeRangeItem.each((i, item) => {
        let config = {
          value: '',
          type: 17,
          enumDefault2: 0,
        };
        let configText = $(item).attr('data-config');
        if (configText && JSON.parse(configText)) {
          config = JSON.parse(configText);
        }
        initDatetimeRangeItem(item, config, settings.$el, settings.type);
      });
    }
    updateCustomDetailNum();

    let ids = [];
    $('.customDetailMainClone')
      .find('.customDetailSingle[data-needevaluate="true"]')
      .each((i, elmt) => {
        ids.push({
          id: $(elmt).data('id'),
          type: $(elmt).data('type'),
        });
      });

    calculateEvaluationValue(ids);
  });

  // 显示隐藏 添加按钮 上限100个
  const showHideAddRelationBtn = ($this, isDel) => {
    let size = $this.closest('.customFieldsBox').find('.customRelationBox li').length;
    if (isDel) {
      size -= 1;
    }
    $this
      .closest('.customFieldsBox')
      .find('.addRelationBtn')
      .toggleClass('Hidden', size >= 100);
  };

  // 关联控件删除
  settings.$el.find('.customRelationBox').on('click', '.customRelationDel', function (event) {
    event.stopPropagation();
    let $li = $(this).closest('li');
    let type = $li.data('type');
    let typeName = ['', _l('任务'), _l('项目'), _l('日程'), _l('文件'), _l('表单'), '', _l('日程')];
    let relationName = $li.find('.customRelationDelete').length ? '' : '"' + $li.find('.overflow_ellipsis').text() + '"';
    $.DialogLayer({
      container: {
        content: `<div class="Font16">${_l('您确定删除关联的%0%1吗？', typeName[type], relationName)}</div>`,
        yesFn: () => {
          validationAfterPost($(this), JSON.stringify({ type: $li.data('type'), sid: $li.data('id'), isd: true, sidext: $li.data('sidext') }), () => {
            alert(_l('刪除成功'));
            showHideAddRelationBtn($li, true);
            $li.remove();
          });
        },
      },
    });
  });

  // 关联控件名片层
  settings.$el.find('.customRelationBox').on('mouseover', '.circle', function () {
    let $this = $(this);
    if (!$this.data('md.businesscard')) {
      $this.mdBusinessCard({ accountId: $(this).data('id') }).mouseenter();
    }
  });

  // 关联控件点击添加
  settings.$el.find('.addRelationBtn').on('click', function (event) {
    // 阻止连续点击
    if (!settings.isAppendSucceed) return false;
    let $this = $(this);
    let type = $this.data('type') === 0 ? [] : [$this.data('type')];
    let controlId = $this.data('id');
    let icon = [
      '',
      'icon-task-responsible',
      'icon-knowledge_file',
      'icon-task_custom_today',
      'icon-file',
      'icon-content_paste2',
      'icon-task_custom_today',
      'icon-task_custom_today',
    ];
    let iconDom = item => {
      return `<i class="${item.type === 4 ? getClassNameByExt(item.ext1) : icon[item.type]} customRelationIcon"></i>`;
    };

    let callback = item => {
      let ext1 = item.ext1
        ? '<span class="' + (item.type === 4 ? '' : 'mLeft20') + '">' + (item.type === 3 ? moment(item.ext1).format('YYYY-MM-DD HH:mm') : item.ext1) + '</span>'
        : '';
      let ext2 = item.ext2 ? '<span class="mLeft20">' + (item.type === 3 ? moment(item.ext2).format('YYYY-MM-DD HH:mm') : item.ext2) + '</span>' : '';
      $this.siblings('.customRelationBox').append(`
        <li data-id="${item.sid}" data-type="${item.type}" data-link="${item.link}" data-sidext="${item.sidext}" data-relation=${JSON.stringify(item)}>
          <div class="flexRow">
            ${iconDom(item)}
            <span class="mLeft10 overflow_ellipsis ThemeColor3 ${item.type === 4 ? '' : 'flex'}">${item.name}</span>
            ${ext1}
            ${ext2}
            ${item.type === 4 ? '<span class="flex"></span>' : ''}
            <img class="circle" data-id="${item.accountId}" src="${item.avatar}" />
          </div>
          <i class="customRelationDel icon-cancel ThemeColor3"></i>
        </li>
      `);
      settings.isAppendSucceed = true;
      showHideAddRelationBtn($this);
    };

    let onSubmit = item => {
      settings.isAppendSucceed = false;
      validationAfterPost($this, JSON.stringify({ type: item.type, sid: item.sid, sidext: item.sidext, isd: false }), function (data) {
        let _item = item;
        if (data) {
          _item = JSON.parse(data)[0];
        }
        alert(_l('已关联成功！'));
        callback(_item);
      });
    };

    ReactDom.render(
      <RelationControl title={_l('关联')} types={type} sourceId={settings.sourceID} sourceType={settings.sourceType} onSubmit={onSubmit} />,
      document.createElement('div')
    );
  });
};

export function cuntomFieldsEvents(settings) {
  var defaults = {
    $el: '', // 必要
    isAppendSucceed: true, // dom 是否已经插入
    validationAfterPost: null,
  };
  settings = $.extend({}, defaults, settings);

  new MDValidation(settings);
  customEvents(settings);
}

// 验证必填
export function checkRequired(settings) {
  return new MDValidation(settings).required();
}

// 获取所有表单的值
export function getAllCustomValues(settings) {
  var data = {
    controls: [],
    formControls: [],
  };

  var getCustomValue = function ($list) {
    var value;
    var obj;
    var $item;
    var dataSource = [];

    $list.each(function (i, item) {
      value = '';
      obj = {};
      $item = $(item);

      // input
      if ($item.find('.customText').length) {
        let unit = $item.find('.customText').data('unit');
        let type = $item.find('.customText').data('type');
        value = $item.find('.customText').val();

        if (type === 20) {
          value = value.replace(/,/g, '');
        }

        if (unit) {
          let index = value.indexOf(unit);

          if (index >= 0) {
            value = value.substring(0, index - 1);
          }
        }
      }

      // textarea
      if ($item.find('div.customTextarea').length) {
        value = $.trim($item.find('div.customTextarea').text());
      }

      // 地区
      if ($item.find('.customLocation').length) {
        value = $item.find('.customLocation').attr('selectvalue') || '';
      }

      // customRadio
      if ($item.find('.customRadio').length) {
        value = $item.find('.customRadio.customChecked').attr('data-type') || '';
      }

      // customDropdownBox
      if ($item.find('.customDropdownBox').length) {
        value = $item.find('.customDropdownBox').attr('data-type');
      }

      // multipleDropdown
      if ($item.find('.multipleDropdownContainer').length) {
        value = $item.find('.multipleDropdownContainer').data('value') || '';
      }

      // checkbox
      if ($item.find('.customCheckox.customChecked').length) {
        value = '';
        var key = '';
        var arrs = [];
        $item.find('.customCheckox.customChecked').each(function (j, checkbox) {
          key = $(checkbox).attr('data-type');
          if (!value) {
            value = key;
          } else if (value.length > key.length) {
            arrs = value.split('');
            arrs.splice(value.length - key.length, 1, '1');
            value = arrs.join('');
          } else {
            value = key.substr(0, key.length - value.length) + value;
          }
        });
      }

      // attachment
      if ($item.find('.customFileUploader').length) {
        value = $item.find('.customFileUploader').data('files') || '';
        /**
         * value = {
         *   attachments: [], // 本地附件
         *   knowledgeAtt: [], // 知识附件
         * };
         */
      }

      // userpicker
      if ($item.find('.customUserList').length) {
        value = $item.find('.customUserList').data('users') || '';
      }

      // grouppicker
      if ($item.find('.customGroupList').length) {
        value = $item.find('.customGroupList').data('group') || '';
      }

      // datetime
      if ($item.find('.datetime').length) {
        value = $item.find('.datetime').data('time') || '';
      }

      // datetimerange
      if ($item.find('.datetimeRange').length) {
        value = $item.find('.datetimeRange').data('range') || '';
      }

      // score
      if ($item.find('.customScore').length) {
        value = $item.find('.customScore').data('score');
      }

      //relation
      if ($item.find('.customRelationBox').length) {
        var values = [];
        $item.find('.customRelationBox li').each(function (j, relation) {
          value = $(relation).attr('data-relation');
          values.push(JSON.parse(value));
        });
        value = JSON.stringify(values);
      }

      obj[$item.data('id')] = value;
      dataSource.push(obj);
    });

    return dataSource;
  };

  data.controls = getCustomValue(settings.$el.find('.customFieldsBox:not(.customDetailBox)'));

  settings.$el.find('.customDetailBox').each(function (i, item) {
    var obj = {};
    var $item = $(item);
    var dataSource = [];

    $item.find('.customDetailMain:not(.customDetailMainClone)').each(function (j, forms) {
      dataSource.push(getCustomValue($(forms).find('.customDetailSingle')));
    });

    obj[$item.data('id')] = dataSource;
    data.formControls.push(obj);
  });

  return data;
}

// 公式计算
export function submitCalculate(config) {
  let type = config.type;
  let $el = config.$el;
  let target = config.target;
  let number = config.number;

  if (type !== 'task') {
    var isDetail = $(target).closest('.customDetailMain').length; // 明细
    var controlId;
    var cidValueDic;
    var index;
    // 更新统计数据方法
    var updateCalculationFun = function (id, type) {
      calculateEvaluationValue([
        {
          id,
          type,
        },
      ]);
    };

    if (isDetail) {
      var formId = $(target)
        .closest('.customDetailBox')
        .data('id');
      index = $(target)
        .closest('.customDetailBox')
        .find('.customDetailMain')
        .index($(target).closest('.customDetailMain'));
      controlId = $(target)
        .closest('.customDetailSingle')
        .data('id');

      // 更新统计数据
      if (
        $(target)
          .closest('.customDetailSingle')
          .data('needevaluate')
      ) {
        updateCalculationFun(
          controlId,
          $(target)
            .closest('.customDetailSingle')
            .data('type')
        );
      }

      // 不存在公式结束
      if (
        !$(target)
          .closest('.customDetailBox')
          .find('input[data-type=20]').length
      ) {
        return false;
      }

      getAllCustomValues({ $el: $el }).formControls.forEach(function (item) {
        if (item[formId]) {
          cidValueDic = item[formId][index];
        }
      });
    } else {
      // 不存在公式结束
      if (
        !$(target)
          .closest('.customContentBox')
          .parent()
          .find('.customFieldsBox:not(.customDetailBox)')
          .find('input[data-type=20]').length
      ) {
        return false;
      }
      controlId = $(target)
        .closest('.customFieldsBox')
        .data('id');
      cidValueDic = getAllCustomValues({ $el: $el }).controls;
    }

    var cidValueDicObj = {};
    var key;
    cidValueDic.forEach(function (item) {
      key = Object.keys(item)[0];
      cidValueDicObj[key] = item[key];
    });

    ajaxRequest
      .getFormulaControlValue({
        controlId: controlId,
        value: number.toString(),
        cidValueDic: cidValueDicObj,
        index: index,
      })
      .then(function (result) {
        if (result.code === 1) {
          result.data.forEach(function (item) {
            if (isDetail) {
              // 检查是否有单位（公式）
              var target = $el.find('.customDetailBox .customDetailSingle[data-id=' + item.id + ']').eq(index);
            let value = item.value.toString().replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
              let unit = target.find('input').data('unit');
              if (unit) {
                value += ` ${unit}`;
              }
              target.find('input').val(value);
              // 更新统计数据
              if (target.data('needevaluate')) {
                updateCalculationFun(item.id, target.data('type'));
              }
              // 大写金额逻辑
              let bindId = `$${item.id}$`;
              let moneyCn = null;
              let detailMain = $(target).closest('.customDetailMain');

              if (detailMain && detailMain.length) {
                moneyCn = detailMain.find(`.moneyCn[data-bind="${bindId}"]`);
              } else {
                moneyCn = $(`.moneyCn[data-bind="${bindId}"]`);
              }

              if (moneyCn) {
                let text = '';
                if (item.value) {
                  text = nzhCn.toMoney(item.value).substring(3);
                } else {
                  text = '未填写';
                }
                moneyCn.text(text);
              }
            } else {
              // 检查是否有单位（公式）
              let target = $('.customFieldsBox[data-id=' + item.id + '] input');
            let value = item.value.toString().replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
              let unit = target.data('unit');
              if (unit) {
                value += ` ${unit}`;
              }
              target.val(value);
              // 大写金额逻辑
              let bindId = `$${item.id}$`;
              let moneyCn = $(`.moneyCn[data-bind="${bindId}"]`);

              if (moneyCn) {
                let text = '';
                if (item.value) {
                  text = nzhCn.toMoney(item.value).substring(3);
                } else {
                  text = '未填写';
                }
                moneyCn.text(text);
              }
            }
          });
        }
      });
  }
}
