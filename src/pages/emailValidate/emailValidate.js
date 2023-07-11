import accountController from 'src/api/account';
import { getRequest } from 'src/util';
var token = getRequest()['token'];
import doT from '@mdfe/dot';
import './style.css';
import tpl from './template.html';

var ACTIONRESULTS = {
  BindSuccessfully: 1, // 邮箱绑定已经成功
  LinkAuthInvalid: 2, // 邮箱验证链接失效
  BoundEmail: 3, // 已经验证过邮箱
};

var render = function (result) {
  $('#app').append(`
    <div class="staticPageForm">
    <div class="header">
        <div class="content">
            <div class="logoContainer">
            </div>
        </div>
    </div>

    <div class="main"></div>
  </div>`);
  $('.main').html(
    doT.template(tpl)({
      result: result || ACTIONRESULTS.LinkAuthInvalid,
      ACTIONRESULTS: ACTIONRESULTS,
    }),
  );
};

if (token) {
  accountController
    .emailValidate({
      token: token,
    })
    .then(render);
} else {
  render();
}
