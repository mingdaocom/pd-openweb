import './style.less';
import doT from '@mdfe/dot';
import mobileDialogHtml from './tpl/mobileDialog.htm';
var dialogTpl = doT.template(mobileDialogHtml);
import { index as DialogLayer} from 'src/components/mdDialog/dialog';
import qs from 'query-string';
import { ATTACHMENT_TYPE } from './enum';
var { getShareLocalAttachmentUrl, getShortUrl } = require('src/api/attachment');

var ToMobileDialog = function (options) {
  var DEFAULTS = {
    sendToType: 1,
    attachmentType: 1,
    file: {},
  };
  this.options = _.assign({}, DEFAULTS, options);
  this.openDialog();
};

ToMobileDialog.prototype = {
  getTip(type) {
    switch (type) {
      case ATTACHMENT_TYPE.COMMON:
        return _l('发送文件副本');
      case ATTACHMENT_TYPE.KC:
        return _l('发送文件分享链接');
      case ATTACHMENT_TYPE.WORKSHEET:
        return _l('发送工作表分享链接');
      case ATTACHMENT_TYPE.WORKSHEETROW:
        return _l('发送工作表记录分享链接');
      default:
        return '';
    }
  },
  getTargetText(type) {
    switch (type) {
      case 3:
        return _l('微信扫码');
      case 6:
        return _l('手机QQ扫码');
      default:
        return _l('扫描二维码');
    }
  },
  openDialog: function () {
    var TMD = this;
    var options = TMD.options;
    TMD.dialog = new DialogLayer({
      dialogBoxID: 'sendToMobile',
      className: 'sendToMobile',
      width: 540,
      isSameClose: false,
      container: {
        header: _l('分享'),
        content: dialogTpl({
          tip: TMD.getTip(options.attachmentType),
          targetText: TMD.getTargetText(options.sendToType),
          attachmentType: options.attachmentType,
          fileName: options.file.fullName,
        }),
        yesText: '',
        noText: '',
      },
      readyFn: () => {
        TMD.$dialog = $('#sendToMobile');
        TMD.$QRCode = TMD.$dialog.find('.urlQrCode');
        this.renderQR();
      },
    });
  },
  renderQR() {
    var TMD = this;
    var options = TMD.options;
    var attachmentType = options.attachmentType;
    var img;
    var urlPromise = $.Deferred();
    switch (attachmentType) {
      case ATTACHMENT_TYPE.COMMON:
        urlPromise = getShareLocalAttachmentUrl({
          fileID: options.file.fileID,
        });
        break;
      case ATTACHMENT_TYPE.KC:
        urlPromise = options.file.shareUrl;
        break;
      case ATTACHMENT_TYPE.QINIU:
        urlPromise = TMD.genQiniuFileShareUrl();
        break;
      case ATTACHMENT_TYPE.WORKSHEET:
      case ATTACHMENT_TYPE.WORKSHEETROW:
        urlPromise = options.file.shareUrl;
        break;
      default:
        break;
    }
    $.when(urlPromise)
      .then(function (url) {
        var imgUrl = TMD.getQRCodeLink(url);
        img = TMD.getImg(imgUrl, function () {
          TMD.$QRCode.empty().append($('<p class="loadError">加载二维码失败</p>'));
        });
        TMD.$QRCode.empty().append(img);
      })
      .fail(function () {
        TMD.$QRCode.empty().append($('<p class="loadError">加载二维码失败</p>'));
      });
  },
  genQiniuFileShareUrl: function () {
    var TMD = this;
    var promise = $.Deferred();
    var options = TMD.options;
    var file = options.file;
    getShareLocalAttachmentUrl({
      filePath: options.file.qiniuPath,
      hours: 48,
    }).then(function (url) {
      var qiniuParams = qs.parse(url.slice(url.indexOf('?') + 1));
      url = url.slice(0, url.indexOf('?') > 0 ? url.indexOf('?') : undefined);
      var urlParams = qs.stringify({
        qiniuPath: url,
        qiniutoken: qiniuParams.token,
        e: qiniuParams.e,
        name: file.name,
        ext: file.ext,
        size: file.size,
        genTime: new Date().getTime(),
      });
      getShortUrl({
        url: escape(md.global.Config.WebUrl + 'apps/kc/shareLocalAttachment.aspx?' + urlParams),
      }).then(function (result) {
        promise.resolve(result.shortUrl || result);
      });
    });
    return promise;
  },
  getQRCodeLink: function (url) {
    return md.global.Config.AjaxApiUrl + 'code/CreateQrCodeImage?url=' + encodeURIComponent(url);
  },
  getImg: function (src, errorCallback) {
    var img = document.createElement('img');
    img.setAttribute('src', src);
    img.addEventListener(
      'error',
      function () {
        if (errorCallback) {
          errorCallback();
        }
      },
      false,
    );
    return img;
  },
};

export default function (options) {
  return new ToMobileDialog(options);
}
