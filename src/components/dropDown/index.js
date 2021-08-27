import './style.css';

function DropDown(settings) {
  this.options = $.extend({
    element: null,
    defaultValue: null,
    data: [],
    callback: function (key, value) {
    }
  }, settings);

  //参数错误
  if (!this.options.element || !this.options.data.length) {
    return;
  }

  this.render();

  return this;
}

DropDown.prototype = {
  render: function () {

    var _this = this;
    var options = _this.options;

    var defaultItem = null;
    $.each(options.data, function (index, item) {
      if (item.value == options.defaultValue) {
        defaultItem = item;
        return false;
      }
    });

    if (!defaultItem) {
      defaultItem = options.data[0];
    }

    if (!options.element.next('.wrapperDropdown').length) {
      var html = '<div class="wrapperDropdown">';
      html += '<div class="dropdownText">' + defaultItem.key + '</div><div class="wrapperDropdownArrowDown"></div>';
      html += '<ul class="dropdown">';
      options.data.forEach(function (item) {
        var value = item.value;
        var display = item.display;
        var key = item.key || item.display;
        html += '<li val="' + value + '" display="' + display + '">' + key + '</li>';
      });
      html += '</ul>';
      html += '</div>';
      options.element.after(html);
    }

    _this.dd = options.element.next('.wrapperDropdown');

    _this.placeholder = _this.dd.children('div.dropdownText');

    _this.opts = _this.dd.find('ul.dropdown > li');

    options.element.val(defaultItem.value);
    _this.placeholder.text(defaultItem.display);

    _this.bindEvent();

  },

  bindEvent: function () {

    var _this = this;

    var options = _this.options;

    $(document).click(function () {
      $('.wrapperDropdown').removeClass('active');
    });

    _this.dd.on('click', function (event) {
      $(this).toggleClass('active');
      return false;
    });

    _this.opts.on('click', function () {
      var opt = $(this);
      var key = opt.text();
      var val = opt.attr('val');
      var display = opt.attr('display');
      _this.placeholder.text(display);
      options.element.val(val);
      options.callback(key, val);
    });
  },

  setValue: function (defaultValue) {

    defaultValue = defaultValue || '';

    var _this = this;

    var options = _this.options;
    var item = options.data.find(function (item) {
      return item.value == defaultValue;
    });
    if (item) {
      options.defaultValue = defaultValue;
      options.element.val(item.value);
      _this.placeholder.text(item.key);
    }
  },

  getData: function () {

    var _this = this;
    var options = _this.options;

    return {
      key: _this.placeholder.text(),
      value: options.element.val()
    };
  }
}

module.exports = DropDown;
