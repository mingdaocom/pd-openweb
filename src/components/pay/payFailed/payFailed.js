import 'src/components/pay/payFailed/payFailed.css';
import doT from '@mdfe/dot';
import rowsTpl from './tpl/payFailed.html';
import commonHeader from 'components/commonHeader';

var payFailed = {};

// 首次调用
payFailed.init = function () {
  document.querySelector('#app').innerHTML = '<div id="payFailed"></div>';
  commonHeader($('#app'));
  var strHtml = doT.template(rowsTpl)({});
  $('#payFailed').html(strHtml.toString());
};

payFailed.init();
