/**
 * @module addFriend
 * @desc 根据邮箱或者手机号搜索用户
 * @example
 * require.async('addFriend', function(addFriend) {
 *   addFriend(opts);
 * });
 */
/**
 * @module addFriend
 * @desc 根据邮箱或者手机号搜索用户
 * @example
 * require.async('addFriend', function(addFriend) {
 *   addFriend(opts);
 * });
 */
import './css/style.css';
import RegExp from 'src/util/expression';

var doT = require('dot');
var Invite = require('src/components/common/inviteMember/inviteMember');
/**
 * addFriend
 * @class addFriend
 * @param {object} opts
 * @constructor
 */
var AddFriends = function (opts) {
  var DEFAULTS = {};
  this.Settings = $.extend({}, DEFAULTS, opts);

  this.init();
};
var Requests = require('src/api/addressBook');
$.extend(AddFriends.prototype, {
  init: function () {
    var _this = this;
    _this.render();
  },
  render: function () {
    const { projects = [] } = md.global.Account;
    var _this = this;
    const { IsLocal } = md.global.Config;
    _this.isPayUsers = projects.some(item => item.licenseType !== 0) || IsLocal;

    require(['./tpl/addNewFriendsLayer.html', 'mdDialog', 'chooseInvite'], function (tpl, dialog) {
      var $content = $(doT.template(tpl)());
      var $dialog = dialog.index({
        dialogBoxID: 'addNewFriends',
        width: 500,
        height: 550,
        container: {
          header: _l('邀请好友'),
          content: $content.html(),
          yesText: '', // hide btn
          noText: '', // hide btn
        },
        drag: true,
        fixed: false,
        callback: function () {
          if (_this.Settings.callback && $.isFunction(_this.Settings.callback)) {
            _this.Settings.callback.call(null);
          }
        },
        readyFn: function () {
          _this.$container = $('#addNewFriends');
          _this.$input = _this.$container.find('.mobilePhoneMailbox');
          _this.$btn = _this.$container.find('.searchBtn');
          _this.$searchClear = _this.$container.find('.searchClear');
          _this.$searchResult = _this.$container.find('.addFriendSearchResult');
          _this.$inviteBox = _this.$container.find('.inviteBox');
          _this.$safeWarning = _this.$container.find('.safeWarning');
          _this.bindEvent();

          _this.$container.find('.inviteBox').chooseInvite({
            sourceId: md.global.Account.accountId,
            fromType: 0,
            viewHistory: false,
            zIndex: 15,
            callback: function (data, cb) {
              Invite.inviteToFriend(data, cb);
            },
          });
          _this.$input.focus();
          if (_this.isPayUsers) {
            _this.$safeWarning.addClass('hidden');
          } else {
            _this.$searchResult.addClass('hidden');
          }
        },
      });
    });
  },
  bindEvent: function () {
    var _this = this;
    var $inputWrapper = _this.$input.parent();
    _this.$input.on({
      keyup: function (event) {
        if (_this.Settings.account === _this.$input.val()) return;
        _this.$searchResult.html('');
        _this.toggleBtnState();
        if (event.keyCode === 13) {
          _this.getResult();
        }
      },
      focus: function () {
        $inputWrapper.addClass('ThemeBorderColor4');
        _this.toggleBtnState();
      },
      blur: function () {
        $inputWrapper.removeClass('ThemeBorderColor4');
        _this.toggleBtnState();
      },
    });

    _this.$btn.on({
      click: function () {
        if (_this.Settings.account === _this.$input.val() || !$.trim(_this.$input.val()) || !_this.isPayUsers) return;
        _this.getResult();
      },
    });

    _this.$searchClear.on('click', function () {
      _this.Settings.account = '';
      _this.$input.val(_this.Settings.account);
      _this.$searchResult.html('');
      $(this).hide();
      _this.toggleBtnState();
    });

    _this.$searchResult.on('click', '.addFriend', function () {
      var $this = $(this);
      _this.callAddConfirm($this);
    });

    _this.$searchResult.on('click', '.inviteFriend', function () {
      var $this = $(this);
      Invite.inviteToFriend(
        [
          {
            account: _this.Settings.account,
            fullname: '',
          },
        ],
        function (data) {
          if (!data || !data.sendMessageResult) return;
          $this.parent().text(_l('已邀请'));
        },
      );
    });
  },
  toggleBtnState: function () {
    var _this = this;
    if (!$.trim(_this.$input.val()) || !_this.isPayUsers) {
      _this.$btn.removeClass('active');
      _this.$searchClear.hide();
      _this.$inviteBox.fadeIn();
    } else {
      _this.$btn.addClass('active');
      _this.$searchClear.show();
    }
  },

  getResult: function () {
    var _this = this;
    var Settings = _this.Settings;
    var keywords = $.trim(_this.$input.val());
    if (!RegExp.isEmail(keywords) && keywords.indexOf('+') === -1) {
      keywords = '+86' + keywords;
    }
    // cache account
    Settings.account = keywords;

    if (Settings.promise && Settings.promise.abort && Settings.promise.state() === 'pending') {
      Settings.promise.abort();
    }

    Settings.promise = Requests.getAccountByAccount({
      account: keywords,
    })
      .done($.proxy(_this.renderList, _this))
      .fail(err => {
        if (err) {
          alert(_l('请输入手机号/邮箱地址'), 3);
        }
      });
  },
  renderList: function (data) {
    var _this = this;
    _this.$inviteBox.fadeOut();
    data.accoutKeyWords = this.Settings.account;
    require(['./tpl/itemUser.html'], function (tpl, dialog) {
      _this.$searchResult.html(doT.template(tpl)(data));
    });
  },
  callAddConfirm: function ($item) {
    var $user = $item.parents('.addUserItem');
    require(['addFriendConfirm'], function (confirm) {
      new confirm({
        accountId: $user.find('.userOperation').data('accountid'),
        callback: function () {
          $user.find('.userOperation').text(_l('已邀请'));
        },
      });
    });
  },
});

/**
 * init function
 * @param {object} [opts]
 * @return {object} addFriendConfrim object
 */
module.exports = function (opts) {
  return new AddFriends(opts);
};
