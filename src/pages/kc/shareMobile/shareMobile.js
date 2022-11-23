import './css/mobileShare.less';
import doT from '@mdfe/dot';
import qs from 'query-string';
import { downloadFile, formatFileSize, getClassNameByExt } from 'src/util';
import mobileShareHtml from './tpl/mobileShare.htm';
var mobileShareTpl = doT.template(mobileShareHtml);
import { ATTACHMENT_TYPE } from 'src/components/shareAttachment/enum';
import saveToKnowledge from 'src/components/saveToKnowledge/saveToKnowledge';
var shareajax = require('src/api/share');
var { getPreviewLink } = require('src/api/chat');
var { getWeiXinConfig } = require('src/api/weixin');
var attachmentAjax = require('src/api/attachment');
var { getDetailUrl } = require('src/api/kc');

var RENDER_BY_SERVICE_TYPE = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'pdf'];

$('html').addClass('AppKc AppKcShare');
function urlAddParams(originurl, value) {
  if (!originurl) return '';
  // 如果是带 token 的链接，换参数会导致 token 失效。所以直接返回
  if (originurl.indexOf('token=') > -1) return originurl;
  const origin = originurl.split('?')[0];
  const query = qs.parse(originurl.replace(origin, '').slice(1));
  return origin + '?' + qs.stringify(Object.assign(query, value)).replace(/=&/g, '&').replace(/=$/g, '');
}

var MobileSharePreview = function (options) {
  var MSP = this;
  this.options = Object.assign({}, options);
  this.$container = $(this.options.container || '#app');
  MSP.urlParams = qs.parse(unescape(unescape(window.location.search.slice(1))));
  var shareId;
  try {
    shareId = location.pathname.match(/.*\/apps\/kcshare\/(\w+)/)[1];
  } catch (err) {}
  if (MSP.options.node) {
    MSP.nodeData = MSP.options.node;
    MSP.init();
    return;
  }
  if (shareId) {
    shareajax.getShareNode({ shareId }).then(data => {
      if (data.node) {
        MSP.nodeData = data.node;
        MSP.init();
      } else {
        if (data.actionResult === 2) {
          window._alert(_l('请先登录'));
          location.href = md.global.Config.WebUrl + 'login?ReturnUrl=' + location.href;
        } else {
          window._alert(_l('当前文件不存在或您没有查看权限'));
        }
      }
    });
  } else if (MSP.urlParams.fileID) {
    shareajax.getShareLocalAttachment({ fileId: MSP.urlParams.fileID }).then(data => {
      if (data.attachment) {
        MSP.nodeData = data.attachment;
        MSP.nodeData.deadLine = data.deadLine;
        MSP.nodeData.isValid = data.isValid;
        MSP.init();
      } else {
        _alert(_l('当前文件不存在或您没有查看权限'));
      }
    });
  } else {
    MSP.init();
  }
};

MobileSharePreview.prototype = {
  init: function () {
    var MSP = this;
    MSP.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    MSP.isWeiXin = /micromessenger/i.test(navigator.userAgent);
    MSP.sourceData = MSP.nodeData && MSP.nodeData.data ? MSP.nodeData.data : MSP.nodeData;
    this.setAttachmentType();
    if (MSP.attachmentType === ATTACHMENT_TYPE.COMMON) {
      MSP.deadLine = MSP.nodeData.deadLine;
    } else if (MSP.attachmentType === ATTACHMENT_TYPE.QINIU) {
      MSP.deadLine = new Date(parseInt(MSP.urlParams.genTime, 10) + 3600 * 1000 * 48);
    }
    if (!MSP.checkValid()) {
      MSP.renderOverDue();
      return;
    }
    this.file = this.formatToFile();
    if (MSP.isWeiXin) {
      MSP.loadWeiXinShare();
    }
    if (MSP.nodeData && MSP.nodeData.name) {
      document.title = `${MSP.nodeData.name}.${MSP.nodeData.ext}`;
    }
    MSP.render();
  },
  checkValid: function () {
    var MSP = this;
    if (MSP.attachmentType === ATTACHMENT_TYPE.KC) {
      return true;
    } else if (MSP.attachmentType === ATTACHMENT_TYPE.COMMON) {
      return MSP.nodeData.isValid;
    } else if (MSP.attachmentType === ATTACHMENT_TYPE.QINIU) {
      return (new Date().getTime() - MSP.urlParams.genTime) / (3600 * 1000) < 48;
    }
  },
  setAttachmentType: function () {
    var MSP = this;
    var sourceData = MSP.sourceData;
    var urlParams = MSP.urlParams;
    if ((sourceData && sourceData.fileID) || (MSP.nodeData && MSP.nodeData.deadLine)) {
      MSP.attachmentType = ATTACHMENT_TYPE.COMMON;
    } else if (sourceData && sourceData.id) {
      MSP.attachmentType = ATTACHMENT_TYPE.KC;
    } else if (urlParams.qiniuPath) {
      MSP.attachmentType = ATTACHMENT_TYPE.QINIU;
    }
  },
  formatToFile: function () {
    var MSP = this;
    var sourceData = MSP.sourceData;
    var file = {};
    switch (MSP.attachmentType) {
      case ATTACHMENT_TYPE.COMMON:
        file.fileID = sourceData.fileID;
        file.name = sourceData.originalFilename;
        file.ext = !sourceData.ext ? '' : sourceData.ext.slice(1);
        file.size = sourceData.filesize;
        file.canDownload = sourceData.allowDown;
        file.downloadUrl = sourceData.downloadUrl;
        break;
      case ATTACHMENT_TYPE.KC:
        file.id = sourceData.id;
        file.name = sourceData.name;
        file.ext = sourceData.ext;
        file.size = sourceData.size;
        file.canDownload = sourceData.canDownload;
        file.downloadUrl = sourceData.downloadUrl;
        file.viewUrl = sourceData.viewUrl;
        break;
      case ATTACHMENT_TYPE.QINIU:
        var urlParams = MSP.urlParams;
        file.name = urlParams.name;
        file.ext = urlParams.ext;
        file.size = parseInt(urlParams.size, 10);
        file.canDownload = true;
        file.downloadUrl = urlParams.qiniuPath + '?e=' + urlParams.e + '&token=' + urlParams.qiniutoken;
        file.qiniuPath = urlParams.qiniuPath;
        break;
      default:
        break;
    }
    if (File.isPicture('.' + file.ext)) {
      file.imageSrc = MSP.getImageLink();
      if (!file.downloadUrl) {
        file.downloadUrl = file.imageSrc.match(/.*(?=\?)|.*/)[0];
      }
    }
    return file;
  },
  formatTime: function (date) {
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
  },
  renderOverDue: function () {
    var MSP = this;
    MSP.$html = $(
      mobileShareTpl({
        overDue: true,
        deadLineStr: MSP.deadLine ? MSP.formatTime(MSP.deadLine) : undefined,
      }),
    );
    MSP.$container.html(MSP.$html);
  },
  render: function () {
    var MSP = this;
    MSP.$html = $(
      mobileShareTpl({
        deadLineStr: MSP.deadLine ? MSP.formatTime(MSP.deadLine) : undefined,
        isPicture: File.isPicture('.' + MSP.file.ext),
        canPreview: RENDER_BY_SERVICE_TYPE.indexOf(MSP.file.ext.toLowerCase()) > -1,
        isIOS: MSP.isIOS,
        node: MSP.file,
        iconClass: getClassNameByExt('.' + MSP.file.ext),
        size: formatFileSize(MSP.file.size),
        hideOpenApp: !!MSP.options.shareFolderId || MSP.attachmentType === ATTACHMENT_TYPE.COMMON,
      }),
    );
    MSP.$container.html(MSP.$html);
    MSP.$footer = MSP.$html.find('.footer');
    MSP.$saveToMingDao = MSP.$html.find('.saveToMingDao');
    MSP.$downloadBtn = MSP.$html.find('.downloadBtn');
    MSP.$openAPP = MSP.$html.find('.openAPP');
    MSP.$filePreview = MSP.$html.find('.fileIcon');
    MSP.$openIniOS = MSP.$html.find('.openIniOS');
    MSP.preview = {
      width: $('.mobileShareCon').width(),
      height: $('.mobileShareCon').height() - 50 - 112 - (MSP.deadLine ? 30 : 0),
    };
    MSP.bindEvent();
    if (File.isPicture('.' + MSP.file.ext)) {
      MSP.renderImage();
    }
  },
  bindEvent: function () {
    var MSP = this;
    MSP.$saveToMingDao.on('click', function () {
      if (!md.global.Account || !md.global.Account.accountId) {
        MSP.alert(_l('请先登录'));
        setTimeout(function () {
          window.location =
            '/login.htm?ReturnUrl=' + encodeURIComponent(window.location.href.replace('checked=login', ''));
        }, 1000);
      } else if (!MSP.file.canDownload) {
        MSP.alert(_l('您权限不足，无法保存。请联系文件夹管理员或文件上传者'));
      } else {
        MSP.saveToKnowledge();
      }
    });
    MSP.$downloadBtn.on('click', function () {
      var attachmentType = MSP.attachmentType;
      var canDownload = MSP.file.canDownload || File.isPicture('.' + MSP.file.ext);
      if (MSP.isWeiXin) {
        MSP.openMask();
      } else if (!canDownload) {
        MSP.alert(_l('您权限不足，无法下载。请联系文件夹管理员或文件上传者'));
      } else if (attachmentType === ATTACHMENT_TYPE.QINIU) {
        MSP.downloadFile(MSP.file.downloadUrl);
      } else {
        let url =
          MSP.file.downloadUrl +
          (MSP.attachmentType === ATTACHMENT_TYPE.KC && MSP.options.shareFolderId
            ? '&shareFolderId=' + MSP.options.shareFolderId
            : '');
        window.open(downloadFile(url));
      }
    });
    if (MSP.$filePreview[0] && RENDER_BY_SERVICE_TYPE.indexOf(MSP.file.ext) > -1) {
      MSP.$filePreview.on('click', function () {
        if (MSP.isIOS && MSP.isWeiXin) {
          MSP.openMask();
          return;
        }
        MSP.previewFile();
      });
    }
    MSP.$openIniOS.on('click', function () {
      var needService = RENDER_BY_SERVICE_TYPE.indexOf(MSP.file.ext.toLowerCase()) > -1;
      if (!needService && MSP.isIOS && MSP.isWeiXin) {
        MSP.openMask();
        return;
      }
      MSP.previewFile();
    });
    MSP.$openAPP.on('click', function () {
      if (MSP.isWeiXin) {
        MSP.openMask();
        return;
      }
      var file = MSP.file;
      console.log('open ', 'mingdao://kcshare/' + file.id);
      window.open('mingdao://kcshare/' + file.id);
    });
  },
  downloadFile: function (url) {
    var a = document.createElement('a');
    a.setAttribute('download', true);
    a.href = url;
    a.click();
  },
  previewFile: function () {
    var promise = $.Deferred();
    var MSP = this;
    var needService = RENDER_BY_SERVICE_TYPE.indexOf(MSP.file.ext.toLowerCase()) > -1;
    var file = MSP.file;
    var attachmentType = MSP.attachmentType;
    if (attachmentType === ATTACHMENT_TYPE.COMMON) {
      promise = needService ? MSP.getCommonPreviewLink(file) : file.downloadUrl;
    } else if (attachmentType === ATTACHMENT_TYPE.KC) {
      promise = MSP.isIOS
        ? file.ext === 'txt' || !file.canDownload || MSP.isWeiXin
          ? file.viewUrl
          : file.downloadUrl
        : file.viewUrl;
    } else if (attachmentType === ATTACHMENT_TYPE.QINIU) {
      const fetchPromise = getPreviewLink({
        id: Math.random().toString(16).slice(2),
        path: file.qiniuPath,
      });
      promise = needService
        ? MSP.isIOS && !MSP.isWeiXin
          ? { viewUrl: file.downloadUrl }
          : fetchPromise
        : { viewUrl: file.downloadUrl };
    }
    $.when(promise).then(function (data) {
      var viewUrl = attachmentType === ATTACHMENT_TYPE.QINIU ? data.viewUrl : data;
      if (!viewUrl) {
        MSP.alert(_l('获取预览链接失败'));
        return;
      }
      if (attachmentType === ATTACHMENT_TYPE.QINIU && viewUrl === file.qiniuPath) {
        var urlParams = MSP.urlParams;
        viewUrl = urlAddParams(viewUrl, {
          e: urlParams.e,
          token: urlParams.qiniutoken,
        });
      }
      if (MSP.options.shareFolderId && data.indexOf('owa' > -1)) {
        viewUrl = urlAddParams(viewUrl, {
          shareFolderId: MSP.options.shareFolderId,
        });
      }
      window.location = viewUrl;
    });
  },
  saveToKnowledge: function () {
    var MSP = this;
    var sourceData = {};
    var kcPath = {
      type: 1,
      node: {
        id: null,
        name: _l('我的文件'),
      },
    };
    var attachmentType = MSP.attachmentType;
    if (attachmentType === ATTACHMENT_TYPE.COMMON) {
      sourceData.fileID = MSP.file.fileID;
    } else if (attachmentType === ATTACHMENT_TYPE.KC) {
      sourceData.nodeId = MSP.file.id;
    } else if (attachmentType === ATTACHMENT_TYPE.QINIU) {
      sourceData.name = MSP.file.name + (MSP.file.ext ? '.' + MSP.file.ext : '');
      sourceData.filePath = MSP.file.qiniuPath;
    }
    sourceData.isShareFolder = !!MSP.options.shareFolderId;
    saveToKnowledge(attachmentType, sourceData, {
      createShare: false,
    })
      .save(kcPath)
      .then(function () {
        MSP.alert(_l('已存入 知识“我的文件” 中'));
      })
      .fail(function () {
        MSP.alert(_l('保存失败'));
      });
  },
  renderImage: function () {
    var MSP = this;
    MSP.$imageLink = MSP.$html.find('.previewImage');
    MSP.$image = MSP.$html.find('.previewImage img');
    if (MSP.$imageLink[0]) {
      MSP.$imageLink.attr('href', MSP.file.imageSrc.match(/.*(?=\?)|.*/)[0]);
    }
    if (MSP.$image[0]) {
      MSP.$image.attr('src', MSP.getPreviewUrl(MSP.file.imageSrc));
    }
  },
  getImageLink: function () {
    var MSP = this;
    var attachmentType = MSP.attachmentType;
    var result;
    if (MSP.attachmentType === ATTACHMENT_TYPE.COMMON) {
      result = MSP.sourceData.thumbnailPath + MSP.sourceData.thumbnailName;
    } else if (attachmentType === ATTACHMENT_TYPE.KC) {
      result = MSP.sourceData.viewUrl;
    } else if (attachmentType === ATTACHMENT_TYPE.QINIU) {
      result = MSP.urlParams.qiniuPath;
    }
    return result;
  },
  getPreviewUrl: function (url) {
    var MSP = this;
    return `${url}|imageView2/2/w/${MSP.preview.width - 32}/h/${MSP.preview.height - 32}`;
  },
  getCommonPreviewLink: function (file) {
    var MSP = this;
    return attachmentAjax.getPreviewLink({
      fileID: file.fileID,
      ext: file.ext ? '.' + file.ext : '',
      attachmentType: MSP.sourceData.attachmentType,
    });
  },
  openMask: function () {
    var $mask = $('<div class="mobileSharemask ' + (this.isIOS ? 'ios' : 'android') + '"></div>');
    this.$container.append($mask);
    $mask.on('click', function () {
      $mask.remove();
    });
  },
  alert: function (str, time) {
    var MSP = this;
    clearTimeout(MSP.timer);
    if (MSP.$alert) {
      MSP.$alert.remove();
    }
    MSP.$alert = $('<div class="mobileAlertDialog" ><div class="alertDialog">' + str + '</div></div>');
    $('body').append(MSP.$alert);
    MSP.alertTimer = setTimeout(function () {
      MSP.$alert.remove();
    }, time || 3000);
  },
  loadWeiXinShare: function () {
    var MSP = this;
    getWeiXinConfig({
      url: encodeURI(location.href),
    }).then(function (data) {
      if (data.code === 1) {
        wx.config({
          debug: false,
          appId: 'wx26fcef87aadb6001',
          timestamp: data.data.timestamp,
          nonceStr: data.data.nonceStr,
          signature: data.data.signature,
          jsApiList: ['onMenuShareAppMessage', 'onMenuShareTimeline'],
        });
        var imgUrl =
          md.global.Config.WebUrl +
          'src/components/images/fileIcons/' +
          getClassNameByExt('.' + MSP.file.ext).slice(9) +
          '.png';
        wx.onMenuShareAppMessage({
          title: MSP.file.name,
          link: location.href,
          desc: location.href,
          imgUrl: imgUrl,
          success: function () {},
        });
        wx.onMenuShareTimeline({
          title: MSP.file.name,
          link: location.href,
          imgUrl: imgUrl,
          success: function () {},
        });
      }
    });
  },
};

md.global.Config.disableKf5 = true;

export default MobileSharePreview;
