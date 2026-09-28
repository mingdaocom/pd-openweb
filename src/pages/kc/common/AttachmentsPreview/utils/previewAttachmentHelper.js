import _ from 'lodash';
import qs from 'query-string';
import { downloadFile } from 'src/utils/platform/browser/download';
import { NODE_VIEW_TYPE } from '../../../constant/enum';
import { isOffice } from '../../../utils';
import { HTML_PREVIEW_EXTENSIONS, PREVIEW_ATTACHMENT_TYPE, PREVIEW_TYPE } from '../constant/enum';

/**
 * 预览层统一消费的附件对象结构。
 *
 * @typedef {Object} PreviewAttachment
 * @property {string} previewAttachmentType - 附件来源类型，取值来自 PREVIEW_ATTACHMENT_TYPE。
 * @property {number} previewType - 预览类型，取值来自 PREVIEW_TYPE。
 * @property {string} name - 不包含扩展名的文件名。
 * @property {string} ext - 不带点号的文件扩展名。
 * @property {number|undefined} size - 文件大小，单位为字节；没有来源数据时为空。
 * @property {string} viewUrl - 预览渲染使用的地址。
 * @property {string|undefined} msg - 无法预览时展示给用户的提示文案。
 * @property {Object} sourceNode - 原始附件数据，供操作、权限和下载逻辑使用。
 * @property {Object|undefined} originNode - 补全详情前的轻量原始数据。
 */

function canEditFileName(attachment, options) {
  const { hideFunctions } = options;
  return (
    attachment.previewAttachmentType === PREVIEW_ATTACHMENT_TYPE.KC &&
    attachment.sourceNode.canEdit &&
    (!hideFunctions || hideFunctions.indexOf('editFileName') < 0)
  );
}

function showSaveToKnowlege(attachment, options) {
  const { hideFunctions } = options;

  if (hideFunctions && hideFunctions.indexOf('saveToKnowlege') > -1) {
    return false;
  }

  if (attachment.previewAttachmentType === PREVIEW_ATTACHMENT_TYPE.KC && !attachment.sourceNode.isNew) {
    return false;
  }

  return true;
}

function canSaveToKnowlege(attachment) {
  return canDownload(attachment);
}

function canDownload(attachment) {
  let result;

  if (attachment.previewAttachmentType === PREVIEW_ATTACHMENT_TYPE.KC) {
    result = attachment.sourceNode.canDownload;
  } else if (attachment.previewAttachmentType === PREVIEW_ATTACHMENT_TYPE.QINIU) {
    result = true;
  } else if (attachment.previewAttachmentType === PREVIEW_ATTACHMENT_TYPE.COMMON) {
    const { sourceNode, previewType } = attachment;
    result =
      !!sourceNode.allowDown ||
      previewType === PREVIEW_TYPE.PICTURE ||
      sourceNode.accountId === md.global.Account.accountId;
  }

  return result;
}

function showKcVersionPanel(attachment, options) {
  const { hideFunctions } = options;

  if (_.get(window, 'shareState.shareId')) {
    return false;
  }

  if (hideFunctions && hideFunctions.indexOf('showKcVersionPanel') > -1) {
    return false;
  }

  if (!md.global.Account || !md.global.Account.accountId) {
    return false;
  }

  if (
    attachment.previewAttachmentType === PREVIEW_ATTACHMENT_TYPE.KC &&
    attachment.sourceNode.viewType !== NODE_VIEW_TYPE.LINK
  ) {
    return true;
  }

  return false;
}

function showDownload(attachment, options) {
  const { hideFunctions } = options;

  if (hideFunctions && hideFunctions.indexOf('download') > -1) {
    return false;
  }

  return true;
}

function canOfficeEdit(attachment, options) {
  const { hideFunctions } = options;

  if (!isOffice(`.${attachment.ext}`)) {
    return;
  }

  if (hideFunctions && hideFunctions.indexOf('officeEdit') > -1) {
    return false;
  }

  if (attachment.previewAttachmentType === PREVIEW_ATTACHMENT_TYPE.KC) {
    return attachment.sourceNode.canEdit;
  } else if (attachment.previewAttachmentType === PREVIEW_ATTACHMENT_TYPE.COMMON) {
    return attachment.sourceNode.accountId === md.global.Account.accountId;
  }

  return false;
}

function showShare(attachment, options) {
  const { hideFunctions } = options;

  if (hideFunctions && hideFunctions.indexOf('share') > -1) {
    return false;
  }

  if (!md.global.Account || !md.global.Account.accountId) {
    return false;
  }

  // 本地附件链接文件
  if (attachment.previewAttachmentType === PREVIEW_ATTACHMENT_TYPE.COMMON && attachment.sourceNode.viewType === 5) {
    return false;
  }

  return true;
}

// chat下的显示权限
export function getPermission(...args) {
  return {
    showSaveToKnowlege: showSaveToKnowlege(...args),
    canSaveToKnowlege: canSaveToKnowlege(...args),
    canDownload: canDownload(...args),
    showKcVersionPanel: showKcVersionPanel(...args),
    showDownload: showDownload(...args),
    canOfficeEdit: canOfficeEdit(...args),
    showShare: showShare(...args),
    canEditFileName: canEditFileName(...args),
  };
}

export function isHtmlPreviewExt(ext = '') {
  return HTML_PREVIEW_EXTENSIONS.includes(ext.replace(/^\./, '').toLowerCase());
}

export function canPreviewHtml() {
  return _.get(window, 'md.global.SysSettings.enableCodeAttachmentPreview') === true;
}

export function getHtmlPreviewUrl(attachment = {}) {
  const sourceNode = attachment.sourceNode || {};
  const urlFromFilePath = sourceNode.filepath && sourceNode.filename ? sourceNode.filepath + sourceNode.filename : '';

  if (attachment.viewUrl) {
    return attachment.viewUrl;
  }

  if (attachment.previewAttachmentType === PREVIEW_ATTACHMENT_TYPE.KC) {
    return sourceNode.viewUrl || sourceNode.downloadUrl || '';
  }

  if (attachment.previewAttachmentType === PREVIEW_ATTACHMENT_TYPE.QINIU) {
    return sourceNode.path || sourceNode.viewUrl || sourceNode.downloadUrl || '';
  }

  if (attachment.previewAttachmentType === PREVIEW_ATTACHMENT_TYPE.COMMON) {
    return (
      sourceNode.viewUrl ||
      sourceNode.previewUrl ||
      sourceNode.downloadUrl ||
      sourceNode.privateDownloadUrl ||
      urlFromFilePath
    );
  }

  return (
    sourceNode.viewUrl ||
    sourceNode.previewUrl ||
    sourceNode.path ||
    sourceNode.downloadUrl ||
    sourceNode.privateDownloadUrl ||
    ''
  );
}

export function getDownloadUrl(attachment, extra) {
  let result;
  const logExtend = extra && extra.logExtend ? '&' + qs.stringify(extra.logExtend) : '';

  if (attachment.previewAttachmentType === PREVIEW_ATTACHMENT_TYPE.KC) {
    if (extra && extra.shareFolderId) {
      result = attachment.sourceNode.downloadUrl + '&shareFolderId=' + extra.shareFolderId;
    } else {
      result = attachment.sourceNode.downloadUrl;
    }
  } else if (attachment.previewAttachmentType === PREVIEW_ATTACHMENT_TYPE.QINIU) {
    const link = document.createElement('a');
    link.href = attachment.sourceNode.path;
    let attachmentsName = attachment.name + (attachment.ext ? '.' + attachment.ext : '');

    if (navigator.appName === 'Microsoft Internet Explorer') {
      attachmentsName = escape(attachmentsName);
    }

    result =
      md.global.Config.AjaxApiUrl +
      'file/downChatFile?domain=' +
      link.origin +
      '&key=' +
      (link.pathname + link.search) +
      '&attname=' +
      encodeURIComponent(attachmentsName);
  } else if (attachment.previewAttachmentType === PREVIEW_ATTACHMENT_TYPE.COMMON && canDownload(attachment)) {
    return attachment.sourceNode.downloadUrl ? downloadFile(attachment.sourceNode.downloadUrl + logExtend) : '';
  }

  return result ? downloadFile(result + logExtend) : '';
}
