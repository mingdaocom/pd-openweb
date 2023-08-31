import 'src/components/mdDialog/dialog';
import './style.less';
import { verifyPassword } from 'src/util';
import doT from 'dot';
import tpl from './validatePassword.html';

var ajax = null;

const defaultOpts = {
  btnText: _l('确认'),
  header: _l('请输入登录密码，以验证管理员身份'),
  callback: () => {},
};

export default function(opt) {
  var dialogId = 'validatePasswordDialog';
  if ($('#' + dialogId).length) return;

  const options = $.extend({}, defaultOpts, opt);
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
    callback: function() {
      if (ajax && ajax.state() === 'pending' && ajax.abort) {
        ajax.abort();
      }
    },
    readyFn: function() {
      var $dialog = $('#' + dialogId);
      var $passWInput = $dialog.find('.inputBox');
      var $unBindBtn = $dialog.find('.btnUnBind');
      $passWInput.focus().on('keyup', function(event) {
        if (event.keyCode === 13) {
          $unBindBtn.click();
        }
      });
      $unBindBtn.on('click', function() {
        var password = $passWInput.val();
        if (!password) {
          alert(_l('请输入登录密码'), 3);
          $passWInput.focus();
          return;
        }

        verifyPassword({
          password,
          success: () => {
            options.callback(password);
          },
        });
      });
    },
  });
}
