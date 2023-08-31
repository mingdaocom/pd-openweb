import { getRequest } from 'src/util';
import DoT from 'dot';
import loginController from 'src/api/login';
import './style.css';
import tpl from './tpl/noticeMessage.html';

var WorkWeiXin = {};

WorkWeiXin.options = {
  type: null,
  projectId: null,
  suiteId: null,
  authCode: null,
  loginState: {
    success: 1,
    failed: 10001,
    notBindProject: 10002,
    notJoinProject: 10003,
    userFromError: 10004,
  },
  authTypes: {
    default: '', // 服务商后台跳转
    login: 'login', // 扫二维码登录
    install: 'install', // 安装应用
  },
};

WorkWeiXin.init = function () {
  $('#app').append(`<div class="header">
    <div class="content">
        <a href="/home" target="_blank" class="InlineBlock">
            <div class="mingdaoLogo"></div>
        </a>
    </div>
  </div>

  <div class="main">

    <div class="shade">
        <div class="loading"></div>
        <div class="loginTip">[[[登录中...]]]</div>
    </div>

    <div class="tpLoginContent">
    </div>
  </div>`);
  var request = getRequest();

  WorkWeiXin.options.authCode = request.auth_code;

  var params = request.p; // login 或者 install_projectid_suiteid
  if (params) {
    var arr = params.split('_');
    WorkWeiXin.options.type = arr[0];
    if (WorkWeiXin.options.type == WorkWeiXin.options.authTypes.install) {
      WorkWeiXin.options.projectId = arr[1];
      WorkWeiXin.options.suiteId = arr[2];
    }
  } else {
    WorkWeiXin.options.type = WorkWeiXin.options.authTypes.default;
  }
  WorkWeiXin.login();
};

WorkWeiXin.login = function () {
  if (WorkWeiXin.options.type == WorkWeiXin.options.authTypes.install) {
    loginController
      .workWeiXinInstallAuthLogin({
        authCode: WorkWeiXin.options.authCode,
        suiteId: WorkWeiXin.options.suiteId,
        projectId: WorkWeiXin.options.projectId,
      })
      .then(function (data) {
        if (data.loginState == WorkWeiXin.options.loginState.success) {
          window.location.href = '/admin/home/' + data.projectId;
        } else if (data.loginState == WorkWeiXin.options.loginState.userFromError) {
          WorkWeiXin.userFromError();
        } else {
          WorkWeiXin.loginFaild();
        }
      });
  } else {
    loginController
      .workWeiXinLogin({
        authCode: WorkWeiXin.options.authCode,
      })
      .then(function (data) {
        if (data.loginState == WorkWeiXin.options.loginState.success) {
          $('.loginTip').show();
          if (WorkWeiXin.options.type == WorkWeiXin.options.authTypes.default) {
            if (data.isAdmin) {
              window.location.href = '/admin/home/' + data.projectId;
            } else {
              WorkWeiXin.notProjectAdmin();
            }
          } else if (WorkWeiXin.options.type == WorkWeiXin.options.authTypes.login) {
            // 扫码登录
            if (data.isAdmin) {
              window.location.href = '/admin/home/' + data.projectId;
            } else {
              window.location.href = '/app/my';
            }
          }
        } else if (data.loginState == WorkWeiXin.options.loginState.notBindProject) {
          WorkWeiXin.notBindProject();
        } else if (data.loginState == WorkWeiXin.options.loginState.notJoinProject) {
          WorkWeiXin.notJoinProject();
        } else if (data.loginState == WorkWeiXin.options.loginState.userFromError) {
          WorkWeiXin.userFromError();
        } else {
          WorkWeiXin.loginFaild();
        }
      });
  }
};

WorkWeiXin.loginFaild = function () {
  $('.shade').hide();
  $('.tpLoginContent').html('<div class="noticeMessage contianerBGStyle">' + _l('登录失败') + '</div>');
};

WorkWeiXin.notBindProject = function () {
  $('.shade').hide();
  var html = DoT.template(tpl)({
    title: _l('您的企业微信还未安装应用，无法进入系统'),
    desc: _l('请提醒您的企业微信管理员去企业微信后台安装应用'),
  });
  $('.tpLoginContent').html(html);
};

WorkWeiXin.notJoinProject = function () {
  $('.shade').hide();
  var html = DoT.template(tpl)({
    title: _l('您的企业微信账号还未同步，无法进入系统'),
    desc: _l('请提醒您的企业微信管理员去系统后台同步企业微信通讯录'),
  });
  $('.tpLoginContent').html(html);
};

WorkWeiXin.userFromError = function () {
  $('.shade').hide();
  var html = DoT.template(tpl)({
    title: _l('账号来源类型受限'),
    desc: '',
  });
  $('.tpLoginContent').html(html);
};

WorkWeiXin.notProjectAdmin = function () {
  $('.shade').hide();
  var html = DoT.template(tpl)({
    title: _l('您的账号没有后台的管理员权限，无法进入'),
    desc: _l('请提醒您的管理员去系统后台将您添加为管理员'),
  });
  $('.tpLoginContent').html(html);
};

WorkWeiXin.init();
