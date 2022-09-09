require('src/components/pay/payFailed/payFailed.css');
var doT = require('dot');
var payFailed = {};
var commonHeader = require('components/commonHeader');
// 首次调用
payFailed.init = function () {
  document.querySelector('#app').innerHTML = '<div id="payFailed"></div>';
  commonHeader($('#app'));
  require(['./tpl/payFailed.html'], function (rowsTpl) {
    var strHtml = doT.template(rowsTpl)({});
    $('#payFailed').html(strHtml.toString());
  });
};
module.exports = payFailed;

payFailed.init();
