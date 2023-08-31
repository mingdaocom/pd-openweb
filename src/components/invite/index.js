import doT from 'dot';
import tpl from './content.html';
import { index as DialogLayer } from 'src/components/mdDialog/dialog';

var InviteDialog = function (opts = { friendVisible: true }) {
  this.opts = opts;
  this.init();
};
import addFriend from 'src/components/addFriends/addFriends';
import './style.css';

InviteDialog.prototype.init = function () {
  var _this = this;
  if (md.global.Account.projects.length) {
    _this.Dialog = DialogLayer({
      dialogBoxID: 'inviteDialog',
      width: 420,
      container: {
        header: _l('邀请到'),
        content: doT.template(tpl)(this.opts),
        yesText: '',
        noText: '',
      },
      readyFn: function () {
        _this.$content = $('#inviteDialog');
        _this.Dialog.dialogCenter();
        _this.bindEvent();
      },
    });
  } else {
    // 没有网络， 直接邀请好友
    this.invite();
  }
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
  setTimeout(() => {
    // 4网络，0个人好友
    addFriend({ fromType: projectId ? 4 : 0, projectId });
  }, 300);
};

export default function (opts) {
  new InviteDialog(opts);
}
