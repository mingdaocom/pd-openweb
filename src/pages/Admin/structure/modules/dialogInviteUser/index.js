import './style.less';
import { index as mdDialog} from 'src/components/mdDialog/dialog';
import render from './main';

var DialogInviteUser = function (opts) {
  var defaults = {
    projectId: '',
    departmentId: '',
  };
  this.options = $.extend({}, defaults, opts);

  this.dialog = null;

  this.init();
};

DialogInviteUser.prototype.init = function () {
  var options = this.options;
  var _this = this;
  this.dialog = mdDialog({
    dialogBoxID: options.dialogBoxID,
    className: 'dialogInviteUser',
    container: {
      header: _l('添加成员'),
      yesText: '',
      noText: '',
      content: '<div class="app"></div>',
    },
    callback: function () {
      options.callback.call(null);
    },
    readyFn: function () {
      let renderFn = data => {
        render($('.dialogInviteUser .app')[0], {
          projectId: options.projectId,
          jobInfos: options.jobInfos,
          departmentInfos: !options.departmentInfos ? [] : [options.departmentInfos],
          closeDialog: function () {
            _this.dialog.closeDialog();
          },
          dialogCenter: function () {
            _this.dialog.dialogCenter();
          },
        });
      };
      renderFn();
    },
  });
};

export default function (opts) {
  return new DialogInviteUser(opts);
};
