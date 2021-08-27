var doT = require('dot');
var InviteDialog = function (opts = { friendVisible: true }) {
  this.opts = opts;
  this.init();
};
var addFriend = require('addFriends');
var invite = require('src/components/common/inviteMember/inviteMember');
import './style.css';

InviteDialog.prototype.init = function () {
  var _this = this;
  if (md.global.Account.projects.length) {
    require(['mdDialog'], function (DialogLayer) {
      _this.Dialog = DialogLayer.index({
        dialogBoxID: 'inviteDialog',
        width: 420,
        container: {
          header: _l('邀请到'),
          yesText: '',
          noText: '',
        },
        readyFn: function () {
          _this.Dialog.dialogCenter();
          _this.bindEvent();
        },
      });
      _this.render();
    });
  } else {
    // 没有网络， 直接邀请好友
    this.invite();
  }
};

InviteDialog.prototype.render = function () {
  this.$content = $('#inviteDialog');
  this.Dialog.showContent(doT.template(require('./content.html'))(this.opts));
};

InviteDialog.prototype.bindEvent = function () {
  var _this = this;
  var $content = this.$content;
  $content.on('click', '.projectItem', function () {
    var projectId = $(this).data('projectid');
    _this.invite(projectId);
    // _this.Dialog.closeDialog();
  });
};

InviteDialog.prototype.invite = function (projectId) {
  if (!projectId) {
    addFriend();
  } else {
    invite.inviteMembers(projectId, this.opts.accountId, () => {
      setTimeout(() => {
        this.$content.find('.dialogCloseBtn').click();
      }, 1000);
    });
  }
};

module.exports = function (opts) {
  var invite = new InviteDialog(opts);
};
