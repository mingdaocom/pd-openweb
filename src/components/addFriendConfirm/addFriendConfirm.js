import doT from '@mdfe/dot';
import addressBookController from 'src/api/addressBook';
import userController from 'src/api/user';
import tpl from './tpl/addFriendConfirm.html'
import './css/style.css';
import { index as dialog } from 'src/components/mdDialog/dialog';
import _ from 'lodash';

/**
 * addFriendConfirm
 * @class addFriendConfirm
 * @param {object} opts
 * @constructor
 */
var RecommendDialog = function (opts) {
  var DEFAULTS = {
    accountId: '',
    callback: $.noop(),
  };
  this.Settings = $.extend(DEFAULTS, opts);
  this.init();
};

$.extend(RecommendDialog.prototype, {
  init: function () {
    this.getUserInfo();
  },
  render: function (data) {
    var _this = this;
    var Settings = this.Settings;
    Settings.showExtraInput = !data.companyName || !data.profession;
    data.showExtraInput = Settings.showExtraInput;
    _this.dialog = dialog({
      dialogBoxID: 'recommendDialog',
      container: {
        header: _l('添加为好友'),
        content: doT.template(tpl)(data),
        yesFn: $.proxy(_this.send, _this),
      },
      status: Settings.showExtraInput ? 'disabled' : 'enable',
      readyFn: () => {
        _this.$dialog = $('#recommendDialog');
      },
    });

    _this.dialog.dialogCenter();
    _this.checkInput();
  },
  getUserInfo: function () {
    var _this = this;
    userController
      .getAccountBaseInfo({
        accountId: md.global.Account.accountId,
      })
      .then(function (data) {
        if (data) {
          _this.render(data);
        }
      });
  },
  checkInput: function () {
    var _this = this;
    var $dialog = this.$dialog;
    $dialog
      .find('.inputControl')
      .filter(function () {
        return this.value === '';
      })
      .first()
      .trigger('focus');
    if (this.Settings.showExtraInput) {
      this.$extraInputs = $dialog.find('.inputControl[data-type]');
      // disable submit button
      _this.dialog.disable();
      this.$extraInputs.on('keyup focus keypress blur', function () {
        var flag = _.every(_this.$extraInputs, function (elem) {
          return $.trim($(elem).val());
        });
        if (flag) {
          _this.dialog.enable();
        } else {
          _this.dialog.disable();
        }
      });
    }
  },

  send: function () {
    var _this = this;
    var message = this.$dialog.find('.applyMsg').val();
    var company;
    var profession;
    if (this.Settings.showExtraInput) {
      company = this.$extraInputs.filter('[data-type=company]').val();
      profession = this.$extraInputs.filter('[data-type=profession]').val();
    }
    addressBookController
      .addFriend({
        accountId: _this.Settings.accountId,
        message: message,
        companyName: company,
        profession: profession,
      })
      .done(function (data) {
        if (data.status === 1) {
          if ($.isFunction(_this.Settings.callback)) {
            _this.Settings.callback.call(null);
          }
          alert(_l('发送成功'));
        } else if (data.status === 2) {
          alert(_l('对方已是您的好友'), 3);
        } else {
          if (data.joinFriendType === 2) {
            alert(_l('对方暂不允许他人加其为好友'), 3);
          } else {
            alert(_l('发送失败'), 2);
          }
        }
      })
      .fail(function () {
        alert(_l('发送失败'), 2);
      });
  },
});
/**
 * init function
 * @param {object} opts options
 * @param {string} opts.accountId userAccountId
 * @param [opts.callback] callback after send message
 * @return {object} addFriendConfrim object
 */
export default function (opts) {
  /* eslint-disable no-new */
  new RecommendDialog(opts);
};
