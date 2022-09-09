import 'mdDialog';
import AccountController from 'src/api/account';
import './style.less';
import { encrypt } from 'src/util';
import captcha from 'src/components/captcha';
var doT = require('dot');

var ajax = null;

const defaultOpts = {
  btnText: _l('确认'),
  header: _l('请输入登录密码，以验证管理员身份'),
  callback: () => {},
};

const errorMsg = {
  6: _l('密码错误'),
  8: _l('验证码错误'),
};

module.exports = function (opt) {
  var dialogId = 'validatePasswordDialog';
  if ($('#' + dialogId).length) return;

  const options = $.extend({}, defaultOpts, opt);
  var tpl = require('./validatePassword.html');
  var html = doT.template(tpl)({
    btnText: options.btnText,
  });
  return $.DialogLayer({
    dialogBoxID: dialogId,
    width: 480,
    isSameClose: false,
    container: {
      header: options.header,
      content: html,
      noText: '',
      yesText: '',
    },
    drag: false,
    callback: function () {
      if (ajax && ajax.state() === 'pending' && ajax.abort) {
        ajax.abort();
      }
    },
    readyFn: function () {
      var $dialog = $('#' + dialogId);
      var $passWInput = $dialog.find('.inputBox');
      var $unBindBtn = $dialog.find('.btnUnBind');
      $passWInput.focus().on('keyup', function (event) {
        if (event.keyCode === 13) {
          $unBindBtn.click();
        }
      });
      $unBindBtn.on('click', function () {
        var password = $passWInput.val();
        if (!password) {
          alert(_l('请输入登录密码'), 3);
          $passWInput.focus();
          return;
        }

        var throttled = function (res) {
          if (res.ret !== 0) {
            return;
          }
          ajax = AccountController.checkAccount({
            ticket: res.ticket,
            randStr: res.randstr,
            captchaType: md.staticglobal.getCaptchaType(),
            password: encrypt(password),
          });
          ajax.then(function (data) {
            if (data === 1) {
              options.callback(password);
            } else {
              $unBindBtn.html(options.btnText).prop('disabled', false);
              alert(errorMsg[data] || _l('操作失败'), 2);
              $passWInput.focus().select();
            }
          });
        };

        if (md.staticglobal.getCaptchaType() === 1) {
          new captcha(throttled);
        } else {
          new TencentCaptcha(md.global.Config.CaptchaAppId.toString(), throttled).show();
        }
      });
    },
  });
};
