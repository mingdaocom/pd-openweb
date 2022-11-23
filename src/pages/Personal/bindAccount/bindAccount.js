import './bindAccount.css';
import 'src/components/mdDialog/dialog';
import intlTelInput from '@mdfe/intl-tel-input';
import '@mdfe/intl-tel-input/build/css/intlTelInput.min.css';
import utils from '@mdfe/intl-tel-input/build/js/utils';
import captcha from 'src/components/captcha';
import { encrypt } from 'src/util';
import RegExp from 'src/util/expression';
import tpl from './bindAccount.html';
import doT from '@mdfe/dot';

var accountController = require('src/api/account');
var BindAccount = {};
BindAccount.options = {
  isUpdateEmail: true, // 对邮箱的更新
  des: '', // 标题下的说明
  accountTitle: '',
  type: 'email', // 默认为邮箱
  callback: null,
  verifyCodeTimer: null,
  iti: '',
};
// 绑定（邮箱、手机）
BindAccount.bindAccountEmailMobile = function (opts) {
  // type, accountTitle
  BindAccount.options = $.extend(BindAccount.options, opts);
  var accountTitleString = '';
  var html = '';
  var verifyText = ''
  if (BindAccount.options.isUpdateEmail) {
    verifyText = md.global.SysSettings.allowBindAccountNoVerify ? _l('邮箱地址') : _l('验证邮箱地址')
  } else {
    verifyText = md.global.SysSettings.allowBindAccountNoVerify ? _l('新手机号码') : _l('验证新手机号码')
  }
  html = doT.template(tpl)({
    data: BindAccount.options.isUpdateEmail,
    des: BindAccount.options.des,
    verifyText,
    isVerified: md.global.SysSettings.allowBindAccountNoVerify,
  });
  if (BindAccount.options.accountTitle) {
    accountTitleString = BindAccount.options.accountTitle;
  } else {
    accountTitleString = BindAccount.options.isUpdateEmail ? _l('绑定邮箱') : _l('绑定手机');
  }
  BindAccount.options.bindAccountDialog = $.DialogLayer({
    dialogBoxID: 'bindAccountDialog',
    className: 'bindAccountDialog',
    width: 400,
    isSameClose: false,
    container: {
      header: accountTitleString,
      content: html,
      noText: '',
      yesText: '',
    },
    drag: false,
    callback: function () { },
    readyFn: function () {
      var $updateAccountDialog = $('#bindAccountDialog');
      var $txtLoginPassword = $updateAccountDialog.find('.txtLoginPassword');
      var $btnPasswordValidate = $updateAccountDialog.find('.btnPasswordValidate');
      $txtLoginPassword.focus().select();
      BindAccount.bindValidatePasswordEvent($txtLoginPassword, $btnPasswordValidate);
    },
  });
};
// 验证账号相应密码
BindAccount.bindValidatePasswordEvent = function ($txtLoginPassword, $btnPasswordValidate) {
  // 密码禁止粘贴
  $txtLoginPassword.bind('cut copy paste', function (e) {
    alert(_l('禁止粘贴'), 3);
    e.preventDefault();
  });
  var $updateAccountDialog = $('#bindAccountDialog');
  //  点击下一步
  $btnPasswordValidate.off('click').on('click', function () {
    BindAccount.validateBindAccount(this, $txtLoginPassword, function (data) {
      $updateAccountDialog.find('.step1').hide(0, function () {
        $updateAccountDialog.find('.step2').show();
        BindAccount.bindUpdateAccountStep2Event(data);
      });
    });
  });
  //  键入enter下一步
  $txtLoginPassword.on({
    keypress: function (event) {
      if (event.keyCode === 13) {
        $btnPasswordValidate.click();
      }
    },
  });
};
// 验证新的账号（手机或邮箱）
BindAccount.bindUpdateAccountStep2Event = function (data) {
  var $updateAccountDialog = $('#bindAccountDialog');
  var $step2 = $updateAccountDialog.find('.step2');
  if (!BindAccount.options.isUpdateEmail) {
    var $txtMobilePhone = document.querySelector('.step2 .txtMobilePhone');
    // $txtMobilePhone.intlTelInput();
    // 绑定国际号码插件
    BindAccount.options.iti = intlTelInput($txtMobilePhone, {
      initialCountry: 'cn',
      loadUtils: '',
      preferredCountries: ['cn'],
      utilsScript: utils,
      separateDialCode: true,
    });
    if (data.mobilePhone) {
      var mobilePhone = data.mobilePhone;
      if (RegExp.isMobile(mobilePhone)) {
        mobilePhone = '+86' + mobilePhone;
      }
      // $txtMobilePhone.intlTelInput('setNumber', mobilePhone);
      BindAccount.options.iti.setNumber(mobilePhone);
    }
  }
  var firstStep = $('.stepPlan:eq(0)');
  var secondStep = $('.stepPlan:eq(1)');
  firstStep
    .find('div:eq(0)')
    .removeClass('stepPlanLine')
    .addClass('step-leftRadius-line ThemeBGColor3');
  secondStep
    .find('div:eq(0)')
    .removeClass('stepPlanLine lineUnfinsh')
    .addClass('step-rightRadius-line lineFinsh ThemeBGColor3');
  secondStep
    .find('.stepCircle')
    .removeClass('lineUnfinsh')
    .addClass('lineFinsh ThemeBGColor3');
  secondStep.find('.stepCircleS').remove();
  $('.stepName td:eq(1)').addClass('stepTitleChecked');
  // 发送验证码到手机或邮箱
  const $btnVerifyCode = $step2.find('.btnVerifyCode');
  $step2.find('.btnVerifyCode').on('click', function () {
    BindAccount.sendChangeAccountVerifyCode(this);
  });

  // 确认--发送验证码验证--绑定帐号
  var $btnUpdateAccount = $step2.find('.btnUpdateAccount');
  $btnUpdateAccount.on('click', function () {
    BindAccount.updateAccount(this);
  });
  // 点击enter验证码
  $step2.find('.inputBox').on('keyup', function (event) {
    if (event.keyCode === 13) {
      $btnUpdateAccount.click();
    }
  });
};
// 发送更新帐号验证码到手机或邮箱
BindAccount.sendChangeAccountVerifyCode = function (obj) {
  var accountInfo = BindAccount.accountVerifyCodeValidate();
  if (!accountInfo) {
    return false;
  }

  var callback = function (res) {
    if (res.ret !== 0) {
      return;
    }

    $('#updateAccountDialog')
      .find('.txtVerifyCode')
      .focus()
      .select();
    $(obj)
      .val(_l('发送中...'))
      .attr('disabled', true)
      .removeClass('btnBootstrap-primary')
      .addClass('btnBootstrap-black');
    accountController
      .sendVerifyCode({
        account: accountInfo,
        ticket: res.ticket,
        randStr: res.randstr,
        captchaType: md.staticglobal.getCaptchaType(),
      })
      .then(function (data) {
        if (data === 1) {
          alert(_l('验证码发送成功'), 1);
          BindAccount.countdown(obj);
        } else {
          var accountTypeDesc = BindAccount.options.isUpdateEmail ? _l('邮箱') : _l('手机号');
          var $account = BindAccount.getAccountElement();
          if (data === 2) {
            alert(_l('发送失败，新%0与现有%1一致', accountTypeDesc, accountTypeDesc), 2);
            $account.focus().select();
          } else if (data === 8) {
            alert(_l('验证码错误'), 3);
          }
          if (data === 9) {
            alert(_l('此%0已被其它帐号绑定', accountTypeDesc), 2);
            $account.focus().select();
          } else {
            alert(_l('验证码发送失败'), 2);
          }
          $(obj)
            .val(_l('获取验证码'))
            .attr('disabled', false)
            .removeClass('btnBootstrap-black')
            .addClass('btnBootstrap-primary');
        }
      })
      .fail(() => {
        $(obj)
            .val(_l('获取验证码'))
            .attr('disabled', false)
            .removeClass('btnBootstrap-black')
            .addClass('btnBootstrap-primary');
      });
  };

  if (md.staticglobal.getCaptchaType() === 1) {
    new captcha(callback);
  } else {
    new TencentCaptcha(md.global.Config.CaptchaAppId.toString(), callback).show();
  }
};
// 更新绑定帐号
BindAccount.updateAccount = function (obj) {
  var accountInfo = BindAccount.accountVerifyCodeValidate();
  if (!accountInfo) {
    return false;
  }

  var $updateAccountDialog = $('#bindAccountDialog');
  var $step2 = $updateAccountDialog.find('.step2');

  if (!md.global.SysSettings.allowBindAccountNoVerify) {
    var $txtVerifyCode = $step2.find('.txtVerifyCode');
    var code = $.trim($txtVerifyCode.val());
    if (!code || code === _l('请输入验证码')) {
      alert(_l('请输入验证码'), 3);
      $txtVerifyCode.focus();
      return;
    }
  }

  $(obj)
    .val(_l('提交中'))
    .attr('disabled', true);
  accountController
    .editAccount({
      account: accountInfo,
      verifyCode: code,
    })
    .then(function (data) {
      var accountTypeDesc = BindAccount.options.isUpdateEmail ? _l('邮箱') : _l('手机号');
      $(obj)
      .val(_l('确认'))
      .attr('disabled', false);
      if (data) {
        var $accountElement = BindAccount.getAccountElement();

        var actionResult = BindAccount.options.actionResult;
        if (data === 1) {
          BindAccount.options.bindAccountDialog.closeDialog();
          alert(_l('%0修改绑定成功', accountTypeDesc), 1);
          // 删除自动登录
          window.localStorage.removeItem('LoginCheckList');
          // 修改cookie
          var loginName = window.localStorage.getItem('LoginName');
          if (
            loginName &&
            ((RegExp.isEmail(loginName) && BindAccount.options.isUpdateEmail) ||
              (!RegExp.isEmail(loginName) && !BindAccount.options.isUpdateEmail))
          ) {
            safeLocalStorageSetItem('LoginName', accountInfo);
          }
          setTimeout(function () {
            BindAccount.options.callback();
          }, 2000);
        } else if (data === 8) {
          alert(_l('验证码错误'), 2);
          $txtVerifyCode.focus().select();
        } else if (data === 2) {
          alert(_l('修改的账号与原来相同'), 3);
          $txtVerifyCode.focus().select();
        } else {
          alert(_l('%0修改失败', accountTypeDesc), 2);
        }
      } else {
        alert(_l('{0}修改失败').format(accountTypeDesc), 2);
      }
    })
    .fail();
};
//  验证登录密码
BindAccount.validateBindAccount = function (obj, $txtLoginPassword, callback) {
  var throttled = function (res) {
    if (res.ret !== 0) {
      return;
    }

    var password = $txtLoginPassword.val();
    $(obj)
      .val(_l('密码验证中···'))
      .attr('disabled', true);

    accountController
      .checkAccount({
        ticket: res.ticket,
        randStr: res.randstr,
        captchaType: md.staticglobal.getCaptchaType(),
        password: encrypt(password),
      })
      .then(function (data) {
        if (data) {
          $(obj)
            .val(_l('下一步'))
            .attr('disabled', false);
          if (data === 1) {
            // 进入下一步
            callback(data);
          } else if (data === 6) {
            alert(_l('密码错误'), 2);
            $txtLoginPassword.focus().select();
          } else if (data === 8) {
            alert(_l('验证码错误'), 2);
          } else {
            alert(_l('操作失败'), 2);
          }
        }
      })
      .fail();
  };

  if (md.staticglobal.getCaptchaType() === 1) {
    new captcha(throttled);
  } else {
    new TencentCaptcha(md.global.Config.CaptchaAppId.toString(), throttled).show();
  }
};
// 向手机或邮箱发送验证码
BindAccount.accountVerifyCodeValidate = function () {
  var $updateAccountDialog = $('#bindAccountDialog');
  var $step2 = $updateAccountDialog.find('.step2');

  var accountInfo = '';
  if (BindAccount.options.isUpdateEmail) {
    var $txtEmail = $step2.find('.txtEmail');
    accountInfo = $.trim($txtEmail.val());
    if (!accountInfo) {
      alert(_l('请输入邮箱'), 3);
      $txtEmail.focus();
      return;
    }
    if (!RegExp.isEmail(accountInfo)) {
      alert(_l('请输入正确的邮箱'), 3);
      $txtEmail.focus().select();
      return;
    }
  } else {
    var $txtMobilePhone = $step2.find('.txtMobilePhone');
    var isValid = BindAccount.options.iti.isValidNumber();
    if (!isValid) {
      alert(_l('请输入正确的手机号码'), 3);
      $txtMobilePhone.focus().select();
      return false;
    }
    accountInfo = BindAccount.options.iti.getNumber();
  }
  return accountInfo;
};
BindAccount.getAccountElement = function () {
  var $account = null;
  var $updateAccountDialog = $('#bindAccountDialog');
  var $step2 = $updateAccountDialog.find('.step2');
  if (BindAccount.options.isUpdateEmail) {
    $account = $step2.find('.txtEmail');
  } else {
    $account = $step2.find('.txtMobilePhone');
  }
  return $account;
};
// 验证码倒计时
BindAccount.countdown = function (obj) {
  var seconds = 30;
  BindAccount.options.verifyCodeTimer = setInterval(function () {
    if (seconds <= 0) {
      $(obj)
        .val(_l('重新发送验证码'))
        .attr('disabled', false)
        .removeClass('btnBootstrap-black')
        .addClass('btnBootstrap-primary');
      clearInterval(BindAccount.options.verifyCodeTimer);
      BindAccount.options.verifyCodeTimer = null;
    } else {
      $(obj).val('' + seconds + _l('秒后重新发送'));
      seconds--;
    }
  }, 1000);
};
export default BindAccount;
