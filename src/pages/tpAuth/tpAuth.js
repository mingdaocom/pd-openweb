import { getRequest } from 'src/util';
import loginController from 'src/api/login';
import { setPssId } from 'src/util/pssId';
import './style.css';
import './account-common.less';

var TPAuth = {};

TPAuth.options = {
  actionResult: {
    failed: 0,
    accountSuccess: 1, // 帐号验证成功
    accountError: 2, // 账号不存在
    passwordError: 3, // 密码错误
    verifyCodeError: 4, // 验证码输入错误
    accountFrequentLoginError: 5, // 频繁登录错误，需要验证码
    userFromError: 8, // 账号来源类型受限
  },
  tpParams: {
    account: '',
    password: '',
    unionId: '',
    state: '',
    tpType: '',
    returnUrl: '',
    autoLogin: false,
  },
  tpTypes: {
    weixin: 1,
    qq: 2,
    xiaomi: 4,
    sso: 5,
    haers: 7,
  },
};

TPAuth.init = function() {
  $('#app').after(`
  <div class="header">
      <div class="content">
          <a href="/" class="InlineBlock"><span class="mingdaoLogo"></span></a>
      </div>
  </div>

  <div class="main">
      <div class="shade">
          <div class="loading"></div>
      </div>
      <div class="tpLoginContent">
      </div>
  </div>`);
  var request = getRequest();
  var unionId = request.unionId;
  var state = request.state;
  var tpType = request.tpType;
  var account = request.account;
  var password = request.password;
  if ((unionId && state && tpType) || (account && password)) {
    TPAuth.options.tpParams.account = account;
    TPAuth.options.tpParams.password = password;
    TPAuth.options.tpParams.unionId = unionId;
    TPAuth.options.tpParams.state = state;
    TPAuth.options.tpParams.tpType = tpType;
    TPAuth.options.tpParams.returnUrl = request.ReturnUrl || request.returnUrl || '';
    TPAuth.options.tpParams.autoLogin = request.autoLogin || false;
    TPAuth.login();
  } else {
    window.location.href = '/login.htm';
  }
};

// 未绑定微信的情况
TPAuth.unBind = function() {
  var params =
    '?state=' +
    TPAuth.options.tpParams.state +
    '&tpType=' +
    TPAuth.options.tpParams.tpType +
    '&unionId=' +
    TPAuth.options.tpParams.unionId;
  var html = `<div class="tpLoginContentArea contianerBGStyle"><div class="title">
  ${_l('还未绑定帐号')}</div><div class="desc">请选择绑定已有帐户，或创建新帐号</div>
  <div class="mBottom20"><a href="/login.htm${params}" class="btn btnEnabled btnBind">
  ${_l('登录并绑定')}</a></div><div><a href="/register.htm${params}" class="btn btnEnabled btnReg">
  ${_l('注册新帐号')}</a></div></div>
  `;
  $('.tpLoginContent').html(html);
};

TPAuth.autoBindSuc = function() {
  var html = `<div class="tpAutoBind"><div class="Left sucIcon"></div><div class="Left txt">
  ${_l('绑定成功')}</div><div class="Clear"></div></div>
  `;
  $('.tpLoginContent').html(html);

  setTimeout(function() {
    if (!!window.ActiveXObject || 'ActiveXObject' in window) {
      window.open('', '_top');
      window.top.close();
    } else {
      window.close();
    }

    if (window.opener) {
      window.opener.location.href = window.opener.location.href;
    }
  }, 2000);
};

TPAuth.login = function() {
  let login;

  if (TPAuth.options.tpParams.account && TPAuth.options.tpParams.password) {
    login = loginController.tPMDAccountLogin({
      account: decodeURIComponent(TPAuth.options.tpParams.account),
      password: decodeURIComponent(TPAuth.options.tpParams.password),
    });
  } else {
    login = loginController.tPLogin({
      unionId: TPAuth.options.tpParams.unionId,
      state: TPAuth.options.tpParams.state,
      tpType: TPAuth.options.tpParams.tpType,
    });
  }

  login.then(function(data) {
    if (!data) {
      // 没有对应的unionid记录
      window.location.replace('/login.htm');
    } else {
      if (!data.accountId) {
        // 没有绑定过账号
        $('.shade').hide();
        if (TPAuth.options.tpParams.tpType == TPAuth.options.tpTypes.sso) {
          alert(_l('登录失败'), 2, 5000);
        } else {
          TPAuth.unBind();
        }
      } else {
        var actionResult = TPAuth.options.actionResult;
        if (data.accountResult === actionResult.accountSuccess) {
            setPssId(data.sessionId, TPAuth.options.tpParams.autoLogin);
          // 登录成功
          if (data.isLoginState) {
            $('.shade').hide();
            TPAuth.autoBindSuc();
          } else {
            $('.loginTip').show();
            var redirectUrl = TPAuth.options.tpParams.returnUrl || '/app/my';
            window.location.replace(redirectUrl);
          }
        } else {
          // 登录失败
          $('.shade').hide();
          alert(data.accountResult === actionResult.userFromError ? _l('账号来源类型受限') : _l('登录失败'), 2, 5000);
        }
      }
    }
  });
};

TPAuth.init();
