import './emotion.css';
import { getCaretPosition, setCaretPosition } from 'src/util';
var twemoji = require('twemoji');
twemoji.base = '/images/emotion/twemoji/';
twemoji.size = 72;
twemoji.className = 'emotion-twemoji';
var emotionData = require('./data');

const isRetina = !!(window.devicePixelRatio && window.devicePixelRatio > 1);

function insertImageToEditor(container, elemstr) {
  var selection = window.getSelection ? window.getSelection() : document.selection;
  var range = selection.createRange ? selection.createRange() : selection.getRangeAt(0);
  if (window.lastEditRange) {
    // 存在最后光标对象，选定对象清除所有光标并添加最后光标还原之前的状态
    selection.removeAllRanges();
    selection.addRange(window.lastEditRange);
  }
  if (!window.getSelection) {
    container.focus();
    selection.getRangeAt(0);
    range.pasteHTML(elemstr);
    range.collapse(false);
    range.select();
  } else {
    container.focus();
    range.collapse(false);
    var hasR = range.createContextualFragment(elemstr);
    var hasR_lastChild = hasR.lastChild;
    while (
      hasR_lastChild &&
      hasR_lastChild.nodeName.toLowerCase() == 'br' &&
      hasR_lastChild.previousSibling &&
      hasR_lastChild.previousSibling.nodeName.toLowerCase() == 'br'
    ) {
      var e = hasR_lastChild;
      hasR_lastChild = hasR_lastChild.previousSibling;
      hasR.removeChild(e);
    }
    range = selection.getRangeAt(0);
    range.insertNode(hasR);
    if (hasR_lastChild) {
      range.setEndAfter(hasR_lastChild);
      range.setStartAfter(hasR_lastChild);
    }
    // 清除选定对象的所有光标对象
    selection.removeAllRanges();
    // 插入新的光标对象
    selection.addRange(range);
    window.lastEditRange = selection.getRangeAt(0);
  }
  container.focus();
}

function Emotion(el, options) {
  this.$el = $(el);

  // 当最近表情为空时，将默认显示默认表情，否则将显示最近表情
  // 有指定的参数传进来时将以传进来的传进来的参数为准，这样用户就能强制性地显示他们想要默认显示的tab
  options.defaultTab = this.getDefaultTab(options);
  this.options = $.extend({}, Emotion.options, options);
  this._init();
}

/**
 * 获取默认表情
 * @param options
 * @returns {number}
 */
Emotion.prototype.getDefaultTab = function getDefaultTab(options) {
  var historyKey = '';
  options = options || {};
  historyKey = options.historyKey || Emotion.options.historyKey;

  if (!window.localStorage || !window.localStorage[historyKey]) {
    return 1;
  }
  return 0;
};

Emotion.options = {
  input: '', // 要绑定的表单元素的选择器
  imgPath: '/images/emotion/',
  defaultTab: 0, // 默认显示哪一列表情
  mdBear: false, // 是否显示表情
  showAru: false, // 是否显示ARU表情
  divEditor: false, // 输入框是不是 content edit div
  offset: 24, // 尖角的位置偏移
  history: true, // 是否显示历史表情
  historySize: 40,
  autoHide: true,
  historyKey: `${md.global.Account.accountId || ''}_mdEmotions`,
  relatedLeftSpace: 0, // 与相对元素的位置
  relatedTopSpace: 0, // 与相对元素的位置
  placement: 'left top', // 表情面板显示的位置，第一个值x轴 left or right，第二个值y轴 top or bottom
  onSelect: function () {
    // 当选中表情时触发
  },
  onMDBearSelect: function () {},
};

Emotion.prototype._init = function _init() {
  this.isOpen = false;
  this.$target = $(this.options.input);
  this.$el.on('click', $.proxy(this.toggle, this));
  this.$target.on('keyup', $.proxy(this.hide, this));
  if (this.options.divEditor) {
    this.$target
      .on('keyup', function (e) {
        // 获取选定对象
        var selection = getSelection();
        // 设置最后光标对象
        window.lastEditRange = selection.getRangeAt(0);
      })
      .on('click', function (e) {
        // 获取选定对象
        var selection = getSelection();
        // 设置最后光标对象
        window.lastEditRange = selection.getRangeAt(0);
      });
  }
};

/**
 * 获取emotion
 */
Emotion.prototype.emotion = function emotion() {
  var $mdEmotion = $(
    '<div class="mdEmotion"><span class="arrow"></span> <div class="mdEmotionWrapper"></div><div class="mdEmotionTab"></div></div>',
  );
  var tab = '';
  var content = '';
  var _this = this;
  var result = null;

  if (this.$emotion) {
    result = this.$emotion;
    return result;
  }

  $.each(emotionData, function (index, item) {
    if ((!_this.options.mdBear && item.tab.name === _l('笨笨熊')) || (!_this.options.history && index === 0)) {
      return;
    }
    if ((!_this.options.showAru && item.tab.name === 'Aru') || (!_this.options.history && index === 0)) {
      return;
    }

    // 设置默认显示
    tab +=
      '<span class="tip-top tabItem tab' +
      (index + 1) +
      ' ' +
      (index === _this.options.defaultTab ? ' active' : '') +
      '" data-emotion-index="' +
      index +
      '" data-tip="' +
      item.tab.name +
      '">' +
      '<img src="/staticfiles/emotionimages/' +
      item.tab.imageName +
      '.png' +
      '" class="' +
      'tabItem-images' +
      '"/> ' +
      (item.tab.text || '') +
      '</span>';
    content +=
      '<div class="mdEmotionPanel panel' +
      (index + 1) +
      (index === _this.options.defaultTab ? ' active' : '') +
      '"></div>';
  });

  $mdEmotion.find('.mdEmotionTab').html(tab).end().find('.mdEmotionWrapper').html(content);

  result = $mdEmotion;
  this.$emotion = result;
  return result;
};

/**
 * 获取角标
 * @returns {*}
 */
Emotion.prototype.arrow = function arrow() {
  this.$arrow = this.$arrow || this.emotion().find('.arrow');
  return this.$arrow;
};

/**
 * 获取表情面板的位置
 * @returns {{}}
 * @private
 */
Emotion.prototype._getPosition = function _getPosition() {
  var position = {
    top: 0,
    left: 0,
  };
  var placements = this.options.placement.split(' ');
  var btnTop = this.$el.offset().top;
  var elemHeight = this.emotion().outerHeight() + 8; // 8 是箭头的高度
  var elemWidth = this.emotion().outerWidth() + 8; // 8 是箭头的高度

  if (this.$el.length) {
    position.left = this.$el.offset().left + this.options.relatedLeftSpace;
    position.top = this.$el.offset().top;
    if ($(window).height() - (btnTop - $(window).scrollTop()) - 30 < elemHeight) {
      this.options.placement = placements[0] + ' top';
    } else {
      this.options.placement = placements[0] + ' bottom';
    }

    if (position.right - elemWidth < 0) {
      this.options.placement = 'left ' + placements[1];
    } else {
      // this.options.placement = 'right';
    }

    placements = this.options.placement.split(' ');

    // 各个边界的计算
    if (placements[0] === 'left') {
      position.left += 0;
    } else if (placements[0] === 'right') {
      position.left -= elemWidth - this.$el.outerWidth();
    }
    if (placements[1] === 'top') {
      position.top -= elemHeight;
    } else if (placements[1] === 'bottom') {
      position.top += this.$el.outerHeight() + 8;
    }
  }
  return position;
};

/**
 * 设置表情元素的位置
 * @private
 */
Emotion.prototype._setPosition = function _setPosition(left, top) {
  this.$emotion.removeClass('emotion-top emotion-bottom');
  this.$emotion.addClass('emotion-' + this.options.placement.split(' ')[1]);
  /*    // 垂直方向
   if (this.options.placement === 'top' || this.options.placement === 'bottom') { // 水平方向越界
   //this.arrow().css('left', this.$el.length ? Math.min(this.options.offset, this.$el.innerWidth() / 2) : this.options.offset);
   this.arrow().css('left', this.options.offset);
   }

   // 水平方向
   if (this.options.placement === 'left' || this.options.placement === 'right') { // 垂直方向越界
   //this.arrow().css('top', this.$el.length ? Math.min(this.options.offset, this.$el.outerHeight() / 2) : this.options.offset);
   this.arrow().css('left', this.options.offset);
   }*/
  var axisX = this.options.placement.split(' ')[0];
  if (axisX === 'left') {
    this.arrow().css('left', this.options.offset);
  } else if (axisX == 'right') {
    this.arrow().css('left', this.$emotion.outerWidth() - this.options.offset);
  }

  this.emotion().offset({
    left: left,
    top: top,
  });
};

/**
 * 选中表情
 * @param event
 */
Emotion.prototype.select = function select(event) {
  event.stopPropagation();
  var targetEmotion = event.currentTarget.outerHTML;
  var targetEmotionSrc = event.currentTarget.getElementsByTagName('img')[0].getAttribute('src');
  var $currentTarget = $(event.currentTarget);
  var _val = '';
  if (this.options.autoHide) {
    this.hide();
  }
  if (!this.options.divEditor) {
    // 对于图片类的表情，由于其图片过大，无法跟文字在一起排版，所以一般单独做一条信息处理，所以不会在输入框中显示，需要单独处理
    if ($currentTarget.hasClass('emotionItemBear')) {
      targetEmotion = targetEmotion.replace(' active', '').replace('.gif', '.png');
      targetEmotionSrc = targetEmotionSrc.replace('.png', '.gif');
      this._storeHistory(targetEmotion);

      // 当点击选中萌熊表情时，返回表情的图片和名称
      if (typeof this.options.onMDBearSelect === 'function') {
        this.options.onMDBearSelect.call(
          this,
          event.currentTarget.getAttribute('title'),
          targetEmotionSrc.replace(this.options.imgPath, '').replace('/images/emotion/', ''),
          targetEmotionSrc,
        );
      }
    } else if ($currentTarget.hasClass('emotionItemAru')) {
      this._storeHistory(targetEmotion);

      // 当点击选中萌熊表情时，返回表情的图片和名称
      if (typeof this.options.onMDBearSelect === 'function') {
        this.options.onMDBearSelect.call(
          this,
          event.currentTarget.getAttribute('title'),
          targetEmotionSrc.replace(this.options.imgPath, ''),
          targetEmotionSrc,
        );
      }
    } else if ($currentTarget.hasClass('emoji')) {
      this._storeHistory(targetEmotion);
      _val = $currentTarget.attr('title');
      if (typeof this.options.onSelect === 'function') {
        this.options.onSelect.call(this, event.currentTarget.getAttribute('title'), targetEmotionSrc);
      }
    } else {
      this._storeHistory(targetEmotion);
      _val = '[' + event.currentTarget.getAttribute('title') + ']';

      if (typeof this.options.onSelect === 'function') {
        this.options.onSelect.call(this, event.currentTarget.getAttribute('title'), targetEmotionSrc, _val);
      }
    }
    // 重新设置光标位置
    var oldVal = this.$target.val();
    var target = this.$target.get(0);
    if (target) {
      var _currentPos = getCaretPosition(target);
      this.$target.val(oldVal.slice(0, _currentPos) + _val + oldVal.slice(_currentPos));
      var newPos = _currentPos + _val.length;
      setCaretPosition(target, newPos);
      this.$target.focus();
    }
  } else {
    if ($currentTarget.hasClass('emotionItemBear')) {
      targetEmotion = targetEmotion.replace(' active', '').replace('.gif', '.png');
      targetEmotionSrc = targetEmotionSrc.replace('.png', '.gif');
      this._storeHistory(targetEmotion);

      // 当点击选中萌熊表情时，返回表情的图片和名称
      if (typeof this.options.onMDBearSelect === 'function') {
        this.options.onMDBearSelect.call(
          this,
          event.currentTarget.getAttribute('title'),
          targetEmotionSrc.replace(this.options.imgPath, ''),
          targetEmotionSrc,
        );
      }
    } else if ($currentTarget.hasClass('emoji')) {
      _val = $currentTarget.attr('title');
      insertImageToEditor(this.$target.get(0), this.parse(_val));
      this._storeHistory(targetEmotion);
    } else {
      _val = '[' + $currentTarget.attr('title') + ']';
      insertImageToEditor(this.$target.get(0), this.parse(_val));
      this._storeHistory(targetEmotion);
    }
    var $imgs = this.$target.find('img');
    for (var i = 0; i < $imgs.length; ++i) {
      $imgs[i].contentEditable = false;
      $imgs.get(i).setAttribute('unselectable', 'on');
    }
  }
};

/**
 * 存储最近使用的表情
 * @param emotionStr
 * @private
 */
Emotion.prototype._storeHistory = function _storeHistory(emotionStr) {
  if (window.localStorage) {
    if (!window.localStorage[this.options.historyKey]) {
      window.localStorage[this.options.historyKey] = JSON.stringify([emotionStr]);
      return;
    }
    var htyEmotions = JSON.parse(window.localStorage[this.options.historyKey]);
    // 如果要记录的表情已存在，则将该表情的位置提前
    var index = $.inArray(emotionStr, htyEmotions);
    if (index !== -1) {
      htyEmotions.splice(index, 1);
    }
    htyEmotions.unshift(emotionStr);

    if (htyEmotions.length > this.options.historySize) {
      htyEmotions.pop();
    }

    window.localStorage[this.options.historyKey] = JSON.stringify(htyEmotions);
  }
};

Emotion.prototype.clearHistory = function () {
  if (window.localStorage) {
    window.localStorage[this.options.historyKey] = [];
  }
};

/**
 * 显示表情
 */
Emotion.prototype.show = function show(left, top) {
  var _this = this;
  this.$emotion = this.emotion()
    .on('click', '.emotionItem', $.proxy(this.select, this))
    .insertAfter(this.$el)
    .on('click', '.mdEmotionTab .tabItem', function () {
      var $this = $(this);
      if (!$this.hasClass('active')) {
        $this.siblings('.active').removeClass('active').end().addClass('active');
        _this.emotion().find('.mdEmotionPanel').removeClass('active').eq($this.index()).addClass('active');
        _this.load($this.data('emotion-index'));
      }
      return false;
    })
    .on('mouseover', '.emotionItemBear', function () {
      //  鼠标移过来时，显示gif图片
      var $bear = $(this).toggleClass('active').find('img');
      $bear.attr('src', $bear.attr('src').replace('.png', '.gif'));
    })
    .on('mouseout', '.emotionItemBear', function () {
      // 鼠标移出时，显示png
      var $bear = $(this).toggleClass('active').find('img');
      $bear.attr('src', $bear.attr('src').replace('.gif', '.png'));
    });
  var currentPosition = _this._getPosition();
  left = left || currentPosition.left;
  top = top || currentPosition.top;

  this._setPosition(left, top);
  this.load(_this.options.defaultTab);

  $(document).on('click.mdEmotion', function (e) {
    if (
      !$(e.target).closest('.mdEmotion').length &&
      !($.contains(_this.$el[0], e.target) || _this.$el[0] === e.target)
    ) {
      _this.hide();
    }
  });
  this.isOpen = true;
  return this.$emotion;
};

/**
 * 载入表情
 * @param index
 */
Emotion.prototype.load = function (index) {
  var $targetEmotion = this.emotion().find('.panel' + (index + 1));
  var _this = this;
  var content = '';

  // 加载历史记录
  if (_this.options.history && index === 0 && window.localStorage && window.localStorage[this.options.historyKey]) {
    $.each(JSON.parse(window.localStorage[_this.options.historyKey]), function (i, item) {
      // 如果设置不显示熊，则在历史中过滤熊表情
      if (_this.options.mdBear || (!_this.options.mdBear && item.indexOf('emotionItemBear') === -1)) {
        content += item;
      } else if (_this.options.showAru || (!_this.options.showAru && item.indexOf('emotionItemAru') === -1)) {
        content += item;
      }
    });
    $targetEmotion.html(content);
  }
  if (!$targetEmotion.data('loaded')) {
    if (emotionData[index].tab.type === 'emoji') {
      $.each(emotionData[index].content, function (i, item) {
        content +=
          '<a class="emotionItem ' +
          emotionData[index].tab.type +
          '" title="' +
          item +
          '">' +
          twemoji.parse(item) +
          '</a>';
      });
    } else {
      $.each(emotionData[index].content, function (i, item) {
        var extraClassName = '';
        if (emotionData[index].tab.name === _l('笨笨熊')) {
          extraClassName = 'emotionItemBear';
        } else if (emotionData[index].tab.name === 'Aru') {
          extraClassName = 'emotionItemAru';
        } else {
          extraClassName = '';
        }
        if (emotionData[index].tab.name === 'Aru') {
          content +=
            '<a class="emotionItem ' +
            extraClassName +
            '">' +
            '<img src="' +
            _this.options.imgPath +
            emotionData[index].tab.path +
            (isRetina && emotionData[index].tab.showRetina ? 'retina/' : '') +
            item.img +
            '">' +
            ' </a>';
        } else {
          content +=
            '<a class="emotionItem ' +
            extraClassName +
            '" title="' +
            item.key +
            '">' +
            '<img src="' +
            _this.options.imgPath +
            emotionData[index].tab.path +
            (isRetina && emotionData[index].tab.showRetina ? 'retina/' : '') +
            item.img +
            '">' +
            ' </a>';
        }
      });
    }
    $targetEmotion.html(content).data('loaded', true);
  }
};

Emotion.prototype.hide = function () {
  if (this.$emotion) {
    this.$emotion.remove();
    $(document).off('click.mdEmotion');
    this.isOpen = false;
  }
};

/**
 * 切换表情的状态
 * @returns {boolean}
 */
Emotion.prototype.toggle = function () {
  if (!this.isOpen) {
    this.show();
  } else {
    this.hide();
  }
};

/**
 * 表情的解析
 * @param str
 */
Emotion.prototype.parse = function (str) {
  str = str || '';
  // str = str.replace(/\[失望\]/ig, '[难过]');
  emotionData.forEach(function (item, index) {
    item.content.forEach(function (emotion, index2) {
      var reg = new RegExp('\\[' + emotion.key + '\\]', 'gi');
      if (str.search(reg) > -1) {
        // 对于熊表情，将静态的转化成动态的
        if (emotionData[index].tab.name === _l('笨笨熊')) {
          emotion.img = emotion.img.replace('.png', '.gif');
        }
        var src =
          Emotion.options.imgPath +
          emotionData[index].tab.path +
          (isRetina && emotionData[index].tab.showRetina ? 'retina/' : '') +
          emotion.img;
        str = str.replace(
          reg,
          '<img alt="[' +
            emotion.key +
            ']" src="' +
            src +
            '" class="' +
            emotionData[index].itemClassName +
            '" height=' +
            item.tab.size +
            ' />',
        );
      }
    });
  });
  return twemoji.parse(str);
};

Emotion.parse = Emotion.prototype.parse;

if (typeof $ !== 'undefined' && $.fn) {
  $.fn.emotion = function (options) {
    options = options || {};
    return this.each(function () {
      new Emotion(
        this,
        $.extend(
          {},
          {
            input: '#' + $(this).data('target'),
          },
          options,
        ),
      );
    });
  };

  $.fn.emotion.parse = function (str) {
    return Emotion.prototype.parse(str, { size: 20 });
  };
  $.fn.emotion.show = function (left, top) {
    return new Emotion().show(left, top);
  };

  $.fn.emotion.clearHistory = function () {
    return new Emotion().clearHistory();
  };

  $.fn.emotion.Constructor = Emotion;
}

module.exports = Emotion;
