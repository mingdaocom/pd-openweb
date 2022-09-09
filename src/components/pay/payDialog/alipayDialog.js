import 'mdDialog';
var doT = require('dot');
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
      content: doT.template(require('./tpl/alipayDialog.html'))({
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

module.exports = PayDia;
