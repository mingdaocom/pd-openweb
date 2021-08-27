import ValidatePassword from './validatePasswordDialog';
import accountController from 'src/api/account';
import { encrypt } from 'src/util';

var UnBindAccount = {};
UnBindAccount.options = {
  isUnBindEmail: true,
  unBindAccountDialog: null,
  callback: function() {},
};

UnBindAccount.init = function(opt) {
  UnBindAccount.options = $.extend(UnBindAccount.options, opt);
  UnBindAccount.options.unBindAccountDialog = ValidatePassword({
    header: UnBindAccount.options.isUnBindEmail ? _l('解绑邮箱') : _l('解绑手机号'),
    callback: UnBindAccount.unBindFnEmailOrMobile,
  });
};

UnBindAccount.unBindFnEmailOrMobile = function(password) {
  if (UnBindAccount.options.isUnBindEmail) {
    accountController
      .unbindEmail({
        password: encrypt(password),
      })
      .then(function(data) {
        UnBindAccount.unBindResult(data);
      })
      .fail();
  } else {
    accountController
      .unbindMobile({
        password: encrypt(password),
      })
      .then(function(data) {
        UnBindAccount.unBindResult(data);
      })
      .fail();
  }
};

UnBindAccount.unBindResult = function(data) {
  UnBindAccount.options.unBindAccountDialog.closeDialog();
  switch (data) {
    case 0:
      alert(_l('解绑失败'), 2);
      break;
    case 1:
      alert(_l('解绑成功'), 1, 3000, function() {
        UnBindAccount.options.callback();
      });
      break;
    case 5:
      alert(_l('解绑失败，账号不存在'), 2);
      break;
    case 6:
      alert(_l('解绑失败，密码错误'), 2);
      break;
    case 7:
      alert(_l('解绑失败，邮箱和手机，请至少保留其一'), 2);
      break;
  }
};

module.exports = UnBindAccount;
