import 'src/components/mdDialog/dialog';
import doT from '@mdfe/dot';
import tpl from './tpl/alipayDialog.html';
var PayDia = {};

PayDia.options = {
  projectId: null,
  orderId: null,
  url: '',
};
// 首次调用
PayDia.init = function (opts) {
  PayDia.options = $.extend(PayDia.options, opts);
  var dialog = $.DialogLayer({
    dialogBoxID: 'PayDialogBox',
    width: 460,
    container: {
      content: doT.template(tpl)({
        url: PayDia.options.url,
      }),
      noText: '',
      yesText: '',
    },
    readyFn: function () {
      $('#PayDialogBox').on('click', '.closeDialogBtn', function () {
        if (dialog && dialog.closeDialog) dialog.closeDialog();
      });
    },
    callback: function () {},
  });
  return dialog;
};

export default PayDia;
