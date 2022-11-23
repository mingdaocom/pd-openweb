import './style.css';

var fixeddataController = require('src/api/fixedData');

export default (function ($) {
  $.fn.selectLocation = function (param) {
    return new SelectLocation(this, param);
  };
  var SelectLocation = function (el, param) {
    var _this = this;

    var defaults = {
      selectValue: '',
      style: {
        top: '',
        left: '',
        zIndex: 20,
      },
      time: new Date().getTime(),
      callback: function () {},
      hideCallback: function () {},
      level: 3,
    };

    var options = $.extend(defaults, param);

    var $el = $(el);

    _this.init = function () {
      // 点击其它地方层掩藏
      $(document).on('click', function (event) {
        if ($(event.target).parents('div.locationLayerContainer').length == 0 && $('.locationLayer').length) {
          if ($('div.locationLayer').data('time') === options.time) {
            $('div.locationLayer').remove();
            if ($.isFunction(options.hideCallback)) {
              options.hideCallback($el, $el.attr('selectvalue'));
            }
          }
        }
      });

      $el.on('focus', function (event) {
        // 如果当前focus元素位置没有地区选择层
        if ($el.next('.locationLayer').length == 0) {
          if ($el.parent('.locationLayerContainer').length == 0) {
            $el.wrapAll("<div class='locationLayerContainer' style='z-index:" + options.style.zIndex + "'></div>");
          }

          // 移除页面上多余的
          $('.locationLayerContainer .locationLayer').not($el.next('.locationLayer')).remove();
          $('.locationLayerContainer').css('z-index', options.style.zIndex);
          $el.parent('.locationLayerContainer').css('z-index', options.style.zIndex + 10000);

          // 区域选择层
          var locationLayer = $('<div>').addClass('locationLayer');

          if (options.style.top) locationLayer.css({ top: options.style.top + 'px' });
          else if (options.style.bottom) locationLayer.css({ bottom: options.style.bottom + 'px' });

          if (
            $el.offset().left + 304 > $(window).width() ||
            ($('.dialogContent').length &&
              $el.offset().left - $('.dialogContent').offset().left + 304 > $('.dialogContent').width())
          ) {
            locationLayer.css('right', 0);
          } else if (options.style.left) {
            locationLayer.css({ left: options.style.left + 'px' });
          }

          // tab切换
          var locationTabs = $('<div>').addClass('locationTabs');

          if (options.level === 1) {
            locationTabs.append("<ul><li tag='province' class='ThemeBorderColor3'>" + _l('省份') + '</li></ul>');
          } else if (options.level === 2) {
            locationTabs.append(
              "<ul><li tag='province' class='ThemeBorderColor3'>" +
                _l('省份') +
                "</li><li tag='city' class='ThemeBorderColor3'>" +
                _l('城市') +
                '</li></ul>',
            );
          } else {
            locationTabs.append(
              "<ul><li tag='province' class='ThemeBorderColor3'>" +
                _l('省份') +
                "</li><li tag='city' class='ThemeBorderColor3'>" +
                _l('城市') +
                "</li><li tag='county' class='ThemeBorderColor3'>" +
                _l('区县') +
                '</li></ul>',
            );
          }
          locationTabs.append("<div class='Clear'></div>");

          var locationContent = $('<div>').addClass('locationContent');
          // 省份地区
          var provinceLocationContent = $('<div>')
            .addClass('locationList')
            .attr('tag', 'province')
            .append(_this.loadDiv(_l('加载中...')));
          // 城市地区
          var cityLocationContent = $('<div>').addClass('locationList Hidden').attr('tag', 'city');
          // 区县地区
          var countyLocationContent = $('<div>').addClass('locationList Hidden').attr('tag', 'county');

          locationContent.append(provinceLocationContent);
          locationContent.append(cityLocationContent);
          locationContent.append(countyLocationContent);

          locationLayer.append(locationTabs);
          locationLayer.append(locationContent);

          $el.after(locationLayer);

          _this.bindDefaultEvent();

          _this.loadProvince();
        }

        $el.next('.locationLayer').data('time', options.time);
      });

      if (options.selectValue) {
        _this.loadCity(options.selectValue);
      }
    };

    _this.loadDiv = function (msg) {
      return "<div class='loadDiv'><span class='iconLoading'></span><span>" + msg + '</span></div>';
    };

    // 默认tab切换事件
    _this.bindDefaultEvent = function () {
      var $locationTabs = $el.next('.locationLayer').find('.locationTabs');
      $locationTabs.find('li').on('click', function () {
        var $this = $(this);
        if (!$this.hasClass('activeTab') && !$this.hasClass('disbaleTab')) {
          var tag = $this.attr('tag');
          _this.showActiveTag(tag);
        }
      });
    };

    // 当前激活Tab
    _this.showActiveTag = function (tag) {
      var $locationTabs = $el.next('.locationLayer').find('.locationTabs');
      $locationTabs.find('li').removeClass('activeTab ThemeColor3 disbaleTab').addClass('Hand');
      $locationTabs
        .find("li[tag='" + tag + "']")
        .addClass('activeTab ThemeColor3')
        .removeClass('Hand');
      $locationTabs
        .find("li[tag='" + tag + "']")
        .nextAll()
        .addClass('disbaleTab')
        .removeClass('Hand');

      var $locationContent = $el.next('.locationLayer').find('.locationContent');
      $locationContent.find('.locationList').hide();
      $locationContent.find(".locationList[tag='" + tag + "']").show();
      $locationContent
        .find(".locationList[tag='" + tag + "']")
        .nextAll()
        .html('');
    };

    // 加载省份
    _this.loadProvince = function () {
      fixeddataController.loadProvince({}).then(function (res) {
        if (res && res.provinces && res.provinces.length) {
          var $locationContent = $el.next('.locationLayer').find('.locationContent');
          $locationContent.find(".locationList[tag='province']").html(_this.getLocationData(res.provinces));

          _this.showActiveTag('province');

          _this.bindDataItemEvent('province', 'city');
        }
      });
    };

    // 绑定每项的事件
    _this.bindDataItemEvent = function (tag, nextTag) {
      var $locationContent = $el.next('.locationLayer').find('.locationContent');

      var $locationList = $locationContent.find(".locationList[tag='" + tag + "']");

      $locationList.find('li').on('click', function () {
        var id = $(this).attr('itemValue');
        _this.loadCity(id, nextTag);
      });
    };

    // 加载城市 或 区县
    _this.loadCity = function (id, tag) {
      fixeddataController.loadCityCountyById({ id }).then(function (res) {
        if (res) {
          if (res.values) {
            var result = res.values;
            $el.val(result.displayText);
            $el.attr('selectValue', result.selectValue);

            if (options.callback) options.callback();
          }

          var removeLocationLayer = function (selectValue) {
            $el.next('.locationLayer').remove();
            if ($.isFunction(options.hideCallback)) {
              options.hideCallback($el, selectValue);
            }
          };

          if ((options.level === 1 && tag === 'city') || (options.level === 2 && tag === 'county')) {
            removeLocationLayer(res.values.selectValue);
          }

          // 加载城市
          if (tag && res.citys && res.citys.length > 0) {
            var $locationContent = $el.next('.locationLayer').find('.locationContent');
            $locationContent.find(".locationList[tag='" + tag + "']").html(_this.getLocationData(res.citys));

            _this.showActiveTag(tag);

            _this.bindDataItemEvent(tag, 'county');
          } else {
            removeLocationLayer(res.values.selectValue);
          }
        }
      });
    };

    _this.getLocationData = function (dataArr) {
      var html = '';
      for (var i = 0, len = dataArr.length; i < len; i++) {
        var item = dataArr[i];
        html = html + `<li itemValue='${item.id}'>${item.name}</li>`;
      }

      return `<ul>${html}<ul/><div class='Clear'></div>`;
    };

    _this.init();
  };
})(jQuery);
