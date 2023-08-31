import store from 'redux/configureStore';
import * as actions from 'src/pages/chat/redux/actions';
import * as utils from 'src/pages/chat/utils';
import departmentController from 'src/api/department';
import doT from 'dot';
import userController from 'src/api/user';
import groupController from 'src/api/group';
import cardTpl from './tpl/mdBusinessCard.html';

var BusinessCard = function (element, options) {
  this.type = null;
  this.options = null;
  this.enabled = null;
  this.timeout = null;
  this.hoverState = null;
  this.$element = null;
  this.inState = null;
  this.dialogReadyState = null;

  this.init('businesscard', element, options);
};

/**
 * @typedef {object} cardTypeEnum
 * @type {{USER: number, GROUP: number, SECRET: number}}
 * @description USER： 1 GROUP: 2 SECRET: 3
 */
var TYPES = {
  USER: 1,
  GROUP: 2,
  SECRET: 3, // mingdao 小秘书
};

import './css/mdBusinessCard.less';
import _ from 'lodash';

BusinessCard.DEFAULTS = {
  id: 'businessCard',
  className: '',
  readyFn: null,
  delay: 500,
  viewport: {
    selector: 'body',
    padding: 0,
  },
  container: 'body',
  trigger: 'hover focus',

  inviterAccount: null, // 呈现 *** 邀请 {accountId: '', fullName: ''}

  noRequestData: false,

  canLinkToUser: true, // 点击名字能否跳转到个人主页
  data: {
    avatar: '', // 头像
    detail_closed: false, // 帐号是否关闭
    fullname: '', // 名称
    status: '', // 状态
    accountId: '', // id
    companyName: '', // 公司名称
    profession: '', // 职位
    email: '', // email
    mobilePhone: '', // 联系方式,
    sameProjectIds: [], // 当前用户和这个 Account 加入的相同的网络的
    currentProjectName: true, //是否是本组织人员
    currentJobNumber: '', //工号
    orgName: '', //本组织（部门+职位）
  },
  fullDepartmentPath: {},
  reset: false,
  force: false,
  opHtml: null,
  sourceId: '',
  type: TYPES.USER,
  secretType: 0, // 0 1 小秘书两种 0: 通用 1： 任务 文件夹 群组
  offset: {
    x: 0,
    y: 0,
  },

  TYPES: TYPES,
};

/**
 * @function init
 * @public
 * @param {object} options - options
 * @param {cardTypeEnum} [options.type]
 * @param {string} [options.secretType=0] 0 | 1 小秘书两种 0: 通用 1： 任务 文件夹 群组
 * @param {string} [options.accountId] userId
 * @param {string} [options.groupId] groupId
 * @param {int} [options.delay = 500] show hide delay
 * @param {object} [options.inviteAccount] task inviter info
 * @param {boolean} [options.reset] cache or not
 * @param {boolean} [options.noRequestData] 静态数据
 * @param {object} [options.data] 数据
 * @param {callback} options.readyFn 回调
 * @returns {BusinessCard}
 */
BusinessCard.prototype.init = function (type, element, options) {
  this.enabled = true;
  this.type = type;
  this.$element = $(element);
  this.options = this.getOptions(options);
  this.$viewport = $(this.options.viewport.selector || this.options.viewport);
  this.inState = {
    hover: false,
    focus: false,
  };
  this.dialogReadyState = false;
  // check accountId or groupId exists
  this.getAccountOrGroupId();
  // bind event
  var triggers = this.options.trigger.split(' ');

  this.$element.one('destroyed', () => {
    this.dialog() && this.dialog().remove();
  });

  for (var i = triggers.length; i--; ) {
    var trigger = triggers[i];
    var eventIn = trigger === 'hover' ? 'mouseenter' : 'focusin';
    var eventOut = trigger === 'hover' ? 'mouseleave' : 'focusout';

    this.$element.on(eventIn + '.' + this.type, $.proxy(this.enter, this));
    this.$element.on(eventOut + '.' + this.type, $.proxy(this.leave, this));
  }
};

BusinessCard.prototype.getAccountOrGroupId = function () {
  var options = this.options;
  var $element = this.$element;
  var accountId = options.accountId || $element.data('accountid') || $element.data('accountId');
  var groupId = options.groupId || $element.data('groupid') || $element.data('groupId');
  if (options.sourceId && options.type) return true;
  if (accountId) {
    options.type = TYPES.USER;
    options.sourceId = accountId;
  } else if (groupId) {
    options.type = TYPES.GROUP;
    options.sourceId = groupId;
  } else {
    options.type = TYPES.SECRET;
    options.sourceId = (Date.now() / 1000) | 0;
  }
  return true;
};

BusinessCard.prototype.getOptions = function (options) {
  options = $.extend(true, {}, BusinessCard.DEFAULTS, options);

  if (options.delay && typeof options.delay === 'number') {
    options.delay = {
      show: options.delay,
      hide: options.delay,
    };
  }

  return options;
};

BusinessCard.prototype.enter = function (event) {
  var self = this;
  if (event instanceof $.Event) {
    this.inState[event.type === 'focusin' ? 'focus' : 'hover'] = true;
  }
  var $dialog = this.dialog();

  if (($dialog && $dialog.hasClass('in')) || self.hoverState === 'in') {
    self.hoverState = 'in';
    return;
  }

  if (self.options.isChatGroup) return;

  clearTimeout(self.timeout);

  self.hoverState = 'in';

  if (!self.options.delay || !self.options.delay.show) return self.show();

  self.timeout = setTimeout(function () {
    if (self.hoverState === 'in') {
      self.show();
    }
  }, self.options.delay.show);
};

BusinessCard.prototype.leave = function (event) {
  var self = this;
  if (event instanceof $.Event) {
    self.inState[event.type === 'focusout' ? 'focus' : 'hover'] = false;
  }
  if (self.isInStateTrue()) return;

  clearTimeout(self.timeout);

  self.hoverState = 'out';

  if (self.$promise) {
    self.$promise.abort();
  }

  if (!self.options.delay || !self.options.delay.hide) return self.hide();

  self.timeout = setTimeout(function () {
    if (self.hoverState === 'out') {
      self.hide();
    }
  }, self.options.delay.hide);
};

BusinessCard.prototype.show = function () {
  var e = $.Event('show.md.' + this.type);
  var that = this;

  if (this.enabled) {
    this.$element.trigger(e);

    var inDom = $.contains(this.$element[0].ownerDocument.documentElement, this.$element[0]);
    if (e.isDefaultPrevented() || !inDom) return;

    var $dialog = this.dialog();

    if (this.options.reset && $dialog) {
      $dialog.remove();
      $dialog = null;
    }

    if ($dialog && !this.options.reset && this.dialogReadyState) {
      this.applyPlacement();
    } else {
      this.render();
    }
  }
};

BusinessCard.prototype.hide = function (callback) {
  var e = $.Event('hide.md' + this.type);

  this.$element && this.$element.trigger(e);
  if (this.dialog()) {
    this.dialog().removeClass('in useFadeIn animationsDown').addClass('useFadeOut');
  }
  this.hoverState = null;

  if ($.isFunction(callback)) {
    callback();
  }
};

BusinessCard.prototype.isInStateTrue = function () {
  for (var key in this.inState) {
    if (this.inState[key]) {
      return true;
    }
  }
  return false;
};

BusinessCard.prototype.dialog = function () {
  var id = this.getId();
  var $div = $();
  try {
    $div = $('#' + id);
  } catch (err) {}

  return $div.length ? $div : null;
};

BusinessCard.prototype.bindEvent = function () {
  var self = this;
  var options = this.options;
  var $dialog = this.dialog();
  $dialog.on({
    mouseenter: function () {
      clearTimeout(self.timeout);
    },
    mouseleave: $.proxy(this.hide, this),
  });

  $dialog.on('click', '.startChat', function () {
    self.hide();
    // if (options.data.isContact) {
    const { isWindow } = store.getState().chat;
    const { fullname } = options.data;
    const { sourceId } = options;
    if (options.type === TYPES.USER) {
      isWindow ? utils.windowOpen(sourceId, fullname, false) : store.dispatch(actions.addUserSession(sourceId));
    } else if (options.type === TYPES.GROUP) {
      isWindow ? utils.windowOpen(sourceId, fullname, true) : store.dispatch(actions.addGroupSession(sourceId));
    }
  });

  // 飞入效果
  $dialog.on('webkitAnimationEnd animationend', function () {
    $(this).removeClass('animationsUp animationsDown');
  });

  $dialog.on('hover', '.orgName', function () {
    const { departmentId } = options.data || {};
    if (!departmentId || options.fullDepartmentPath[departmentId]) {
      const fullPath = options.fullDepartmentPath[departmentId];
      $(this).attr('title', fullPath);
      return;
    }
    departmentController
      .getDepartmentFullNameByIds({
        projectId: options.projectId,
        departmentIds: [JSON.parse(JSON.stringify(departmentId))],
      })
      .then(res => {
        options.fullDepartmentPath[departmentId] = res[0].name.split('/').join('/');
        $(this).attr('title', options.fullDepartmentPath[departmentId]);
      });
  });
};

BusinessCard.prototype.applyPlacement = function () {
  var options = this.options;
  var $container = $(this.options.container);
  var $dialog = this.dialog();
  var width = $dialog.width();
  var height = $dialog.height();
  var isVisible = $dialog.is(':visible');

  var $element = this.$element;
  var offset = $element.offset();
  var pointX = offset.left - 15; // 15, 27
  var pointY = offset.top - 10;

  var $arrow = $dialog.find('.arrowBox');
  var arrowWidth = $arrow.width();
  var arrowHeight = $arrow.height();
  var $cardContentBox = $dialog.find('.cardContentBox');

  var arrowX = 17 + $element.width() / 2 - arrowWidth / 2; // 17, 29
  if (pointX + width > $container.width()) {
    var _pointX = pointX;
    // 加10px的gap 避免出滚动条
    pointX = $container.width() - width - 10;
    arrowX = arrowX - (pointX - _pointX);
  }

  $arrow.css('left', arrowX);

  var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
  var className = 'useFadeIn ';
  // set maxHeight to fix loading position
  if (pointY - scrollTop - arrowHeight < 200) {
    // bottom placement
    if (!isVisible) {
      className += 'animationsDown';
    }
    pointY += $element.height() + arrowHeight;
    $arrow.addClass('arrowTop').removeClass('arrowBottom arrowBottomDarkgray');
  } else {
    // top placement
    if (!isVisible) {
      className += 'animationsDown';
    }
    pointY = pointY - height - arrowHeight;
    // 个人用户
    if ((options.type == 1 && (options.data.sameProjectIds || []).length) || options.opHtml) {
      $arrow.addClass('arrowBottomDarkgray');
    }
    $arrow.addClass('arrowBottom').removeClass('arrowTop');
  }

  $dialog
    .css({
      top: pointY + options.offset.y,
      left: pointX + options.offset.x,
    })
    .addClass(className)
    .removeClass('useFadeOut');
};

BusinessCard.prototype.formatData = function (result) {
  var type = this.options.type;
  var data = {};
  if (md.global.Account.isPortal || (_.get(this.options, ['accountId']) || '').indexOf('#') > -1) {
    data.status = 3;
    data.isPortal = true;
    data.fullname = result.fullname;
    data.mobilePhone = result.mobilePhone;
    data.avatar = result.avatar;
  } else if (type === TYPES.USER) {
    data.isContact = result.isContact;
    data.avatar = result.avatar;
    data.detail_closed = result.accountStatus == 2;
    data.fullname = result.fullname;
    data.status = result.accountStatus;
    data.accountId = result.accountId;
    data.companyName = result.companyName;
    data.profession = result.profession;
    data.email = result.email;
    data.mobilePhone = result.mobilePhone;
    data.sameProjectIds = result.sameProjectIds || [];
    data.currentProjectName = this.options.projectId ? !!result.currentProjectName : true;
    data.currentJobNumber = result.currentJobNumber;
    data.orgName = result.currentDepartmentName;
    data.profession = result.profession;
    data.nodata = !!data.currentProjectName ? data.orgName && data.currentJobNumber : data.companyName;
    data.departmentId = result.currentDepartmentId;
  } else if (type === TYPES.GROUP) {
    data.groupName = result.name;
    data.avatar = result.avatar;
    data.groupId = result.groupId;
    data.project = result.project || null;
    data.sameProjectIds = result.sameProjectIds || [];
  }
  return data;
};

BusinessCard.prototype.render = function (refresh = false) {
  var self = this;
  var options = this.options;
  var $div = this.dialog();
  var dfd = $.Deferred();

  if (!$div) {
    $div = $('<div/>', {
      id: this.getId(),
      class: 'businessCardSite',
    });
    if (options.className) {
      $div.addClass(options.className);
    }
    $(options.container).append($div);
    $div.html(
      [
        '<div class="cardContentBox">',
        '<div class="cardContent">',
        LoadDiv(),
        '</div>',
        '<span class="arrowBox"><span class="arrow"></span></span>',
        '</div>',
      ].join(''),
    );
    this.applyPlacement();
  }

  if (options.noRequestData || options.type === TYPES.SECRET) {
    self.setContent(doT.template(cardTpl)(options));
    dfd.resolve();
  } else {
    // console.log('sourceId:' + options.sourceId);
    // test network delay
    self.$promise =
      options.type === TYPES.USER
        ? userController.getAccountBaseInfo({
            accountId: options.sourceId,
            onProjectId: options.projectId,
            withSameProjectId: true,
            refresh,
          })
        : groupController.getGroupCardInfo({
            groupId: options.sourceId,
          });
    self.$promise.done(function (result) {
      // if (self.isChatGroup(result)) {
      //   self.options.isChatGroup = true;
      //   self.dialog().remove();
      //   dfd.reject();
      //   return;
      // }
      if (result) {
        options.data = self.formatData(result);
        self.setContent(doT.template(cardTpl)(options));

        $div.find('.refreshCardBtn').on('click', (event) => {
          event.stopPropagation();

          self.render(true)
        });
      } else {
        var text = options.type === TYPES.USER ? _l('用户') : self.isChatGroup(result) ? _l('聊天') : _l('群组');
        self.setContent('<div class="pLeft15 pRight15 Gray_c">' + _l('未找到此%0', text) + '</div>');
      }
      dfd.resolve();
    });
  }

  dfd.then(function () {
    // async render, if not hover, do not show the new card
    if (self.hoverState === 'in') {
      self.applyPlacement();
    }
    // dialog ready
    self.dialogReadyState = true;
    self.bindEvent();
    if ($.isFunction(options.readyFn)) {
      // arguments: businesscardDialog
      options.readyFn(options, self.dialog());
    }
  });
};

BusinessCard.prototype.setContent = function (content) {
  this.dialog().find('.cardContent').html(content);
};

BusinessCard.prototype.getId = function () {
  var options = this.options;
  // 兼容外部门户id
  var formatSourceId = (options.sourceId + '').replace('#', 'portal');
  return `${options.id}_${formatSourceId}${options.projectId ? `_${options.projectId}` : ''}`;
};

/**
 * check is Group is chatGroup
 * @param result
 * @returns {boolean}
 */
BusinessCard.prototype.isChatGroup = function (data) {
  return data && data.isPost === false;
};

BusinessCard.prototype.destroy = function () {
  var that = this;
  clearTimeout(this.timeout);
  this.hide(function () {
    that.$element
      .off('.' + that.type)
      .removeData('md.' + that.type)
      .off();
    if (that.dialog()) {
      that.dialog().detach();
    }
    that.$viewport = null;
    that.$element = null;
  });
};

// PLUGIN DEFINITION
function Plugin(option) {
  return this.each(function () {
    var $this = $(this);
    var data = $this.data('md.businesscard');
    var options = typeof option === 'object' && option;
    if (data && options.force) {
      data.destroy();
      data = null;
    }
    if (
      (data && (data.accountId === 'user-undefined' || data.sourceId === 'user-undefined')) ||
      (options && (options.accountId === 'user-undefined' || options.sourceId === 'user-undefined'))
    ) {
      return true;
    }
    if (!data) {
      $this.data('md.businesscard', (data = new BusinessCard(this, options)));
    }
    if (typeof option === 'string' && option === 'destroy') {
      data[option]();
    }
  });
}

var old = $.fn.mdBusinessCard;
$.fn.mdBusinessCard = Plugin;
$.fn.mdBusinessCard.Constructor = BusinessCard;

$.fn.mdBusinessCard.noConflict = function () {
  $.fn.tooltip = old;
  return this;
};
