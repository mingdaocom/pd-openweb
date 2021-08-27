var DropDown = function (elem, opts) {
  this.$elem = null;
  this.$list = null;
  this.$downArrow = null;

  this.init(elem, opts);
};
import './style.css';
import { htmlEncodeReg } from 'src/util';
DropDown.DEFAULTS = {
  list: [], // datalist
  defaultValue: '', // 默认选中?
  downArrow: '<i class="icon-arrow-down-border mLeft5 Font12 Hand"></i>', // arrowTemplate
  extraClass: '',
  arrowClass: '', // arrow add-on className
  listClass: '', // list add-on className
  cutStringCount: 0, // 0表示不限制显示长?
  offset: {
    left: 0,
    top: 0,
  }, // list offset
  clickCb: function (id, name) {},
};

$.extend(DropDown.prototype, {
  getOptions: function (opts) {
    this.options = $.extend({}, DropDown.DEFAULTS, opts);
  },
  render: function () {
    var _this = this;
    var options = this.options;
    var list = options.list;
    if (list.length <= 0) {
      throw new Error("list length can't be zero");
    }

    var selectId = list[0].id;
    let contentHtml = '';
    $.each(list, function (index, item) {
      contentHtml =
        contentHtml +
        `
      ${
        !item.tip
          ? `<li data-id="${item.id}" title="${htmlEncodeReg(item.name)}" class="listItem ThemeBGColor3">`
          : `<li data-id="${item.id}" class="listItem ThemeBGColor3">`
      }
      ${htmlEncodeReg(item.name)}
      ${item.tip ? `<span class="icon-help Font16 dropDownItemTip mLeft5"></span>` : ''}
      </li>
      `;

      if (options.defaultValue && options.defaultValue === item.id) {
        selectId = item.id;
      }
    });
    var html = `<div class="Relative InlineBlock"><ul class="dropDownList Hidden">${contentHtml}</ul></div>`;

    // store
    _this.$container = $(html);
    _this.$list = _this.$container.find('.dropDownList');
    _this.$downArrow = $(options.downArrow);
    if (list.length > 1) {
      _this.$container.prepend(_this.$downArrow);
      _this.applyStyle();
    }
    _this.select(selectId);
    // append dom
    _this.$elem.after(_this.$container);
  },
  applyStyle: function () {
    var _this = this;
    var options = this.options;
    var $list = _this.$list;
    var $downArrow = _this.$downArrow;

    $list.css({
      left: options.offset.left,
      top: options.offset.top,
    });

    if (options.extraClass) {
      _this.$container.addClass(options.extraClass);
    }
    if (options.arrowClass) {
      $downArrow.addClass(options.arrowClass);
    }
    if (options.listClass) {
      $list.addClass(options.listClass);
    }
  },
  initEvent: function () {
    var _this = this;
    var options = this.options;
    var $elem = _this.$elem;
    var $list = _this.$list;
    var $downArrow = _this.$downArrow;

    $downArrow.on('click.dropdown', function (event) {
      var currentId = $elem.attr('data-id') || options.list[0].id;
      $list.toggleClass('Hidden');
      $list
        .children('.listItem')
        .removeClass('ThemeColor3')
        .filter('[data-id=' + currentId + ']')
        .addClass('ThemeColor3');
      event.stopPropagation();
    });

    $list.on('click.dropdown', '.listItem', function (event) {
      var $this = $(this);
      var id = $this.attr('data-id');
      _this.select(id, true);
      $list.addClass('Hidden');
      event.stopPropagation();
    });

    $list.on('mouseover', '.dropDownItemTip', function () {
      var $this = $(this);
      if ($this.data('bind')) return;
      require(['tooltip'], function () {
        $this
          .MD_UI_Tooltip({
            text: _l('Ta们是被您的好友或同事邀请加入协作模块与您共同协作'),
            arrowLeft: 140,
            offsetLeft: -150,
            offsetTop: -5,
          })
          .data('bind', true)
          .trigger('mouseenter');
      });
    });

    $(document).on('click.dropdown', function (event) {
      if (
        $list.is(':visible') &&
        ($(event.target).closest($list).length <= 0 || $(event.target).closest($elem).length <= 0)
      ) {
        $list.addClass('Hidden');
      }
    });
  },
  select: function (id, isCallback) {
    var _this = this;
    var options = this.options;
    var $elem = _this.$elem;

    var matchItem = null;
    options.list.map(function (item) {
      if (item.id == id) {
        matchItem = item;
        return false;
      }
    });

    if (matchItem != null) {
      var lblName = htmlEncodeReg(matchItem.name);
      if (options.cutStringCount) {
        lblName = lblName.substr(0, options.cutStringCount);
      }
      $elem.html(lblName).attr('data-id', matchItem.id).attr('title', matchItem.name);

      if (isCallback) {
        $.isFunction(options.clickCb) && options.clickCb(matchItem.id, matchItem.name);
      }
    }
  },
  init: function (elem, opts) {
    this.$elem = $(elem);
    this.getOptions(opts);

    this.render();
    this.initEvent();
  },
});

(function ($) {
  $.fn.dropDown = function (opts) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('md.dropDown');
      var options = typeof opts === 'object' && opts;
      if (!data) {
        $(this).data('md.dropDown', (data = new DropDown(this, options)));
      }
    });
  };
})(jQuery);
