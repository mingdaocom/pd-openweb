import { getRequest } from 'src/util';
import './paySuccess.css'
import doT from '@mdfe/dot';
import rowsTpl from './tpl/paySuccess.html';
import commonHeader from 'components/commonHeader';
import orderController from 'src/api/order';
import moment from 'moment';

var paySuccess = {};
var ORDERTYPE = {
  NORMAL: 0, // 未知
  NEW: 1, // 新订单
  AGAINFIRST: 2, // 首次续约
  RECHARGE: 3, // 充值
  AGAINOTHER: 4, // 再次续约
  ADDPERSON: 6, // 增补人数
  ONEDAY: 9, // 一天包
  TRIAL: 10, // 试用订单
  UPGRADE: 11, // 升级订单
};

paySuccess.options = {
  orderId: '',
};
// 首次调用
paySuccess.init = function () {
  document.querySelector('#app').innerHTML = '<div id="paySuccess"></div>';
  commonHeader($('#app'));
  var request = getRequest();
  if (request['orderId']) {
    paySuccess.options.orderId = request['orderId'];
  }
  paySuccess.getPayResult();
};

// /*获取支付结果*/
paySuccess.getPayResult = function () {
  orderController
    .getProjectPayResult({
      orderId: paySuccess.options.orderId,
    })
    .then(function (data) {
      if (data) {
        var strHtml = doT.template(rowsTpl)({
          data: data,
          ORDERTYPE: ORDERTYPE,
          moment,
        });
        $('#paySuccess').html(strHtml.toString());
      } else {
        alert(_l('加载失败'), 2, false);
      }
    });
};

paySuccess.init();
