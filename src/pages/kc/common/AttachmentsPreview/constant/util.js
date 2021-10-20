import qs from 'querystring';
import { NODE_VIEW_TYPE } from '../../../constant/enum';
import { isOffice } from '../../../utils';
import { PREVIEW_TYPE } from './enum';
import { addToken } from 'src/util';

function canEditFileName(attachment, options) {
  const { hideFunctions } = options;
  return (
    attachment.previewAttachmentType === 'KC' &&
    attachment.sourceNode.canEdit &&
    (!hideFunctions || hideFunctions.indexOf('editFileName') < 0)
  );
}

function showSaveToKnowlege(attachment, options) {
  const { hideFunctions } = options;
  if (hideFunctions && hideFunctions.indexOf('saveToKnowlege') > -1) {
    return false;
  }
  if (attachment.previewAttachmentType === 'KC' && !attachment.sourceNode.isNew) {
    return false;
  }
  return true;
}

function canSaveToKnowlege(attachment) {
  return canDownload(attachment);
}

function canDownload(attachment) {
  let result;
  if (attachment.previewAttachmentType === 'KC') {
    result = attachment.sourceNode.canDownload;
  } else if (attachment.previewAttachmentType === 'QINIU') {
    result = true;
  } else if (attachment.previewAttachmentType === 'COMMON') {
    const { sourceNode, previewType } = attachment;
    result =
      !!sourceNode.allowDown ||
      previewType === PREVIEW_TYPE.PICTURE ||
      sourceNode.accountId === md.global.Account.accountId;
  }
  return result;
}

function showKcVersionPanel(attachment, options) {
  const { hideFunctions, fromType } = options;
  if (hideFunctions && hideFunctions.indexOf('showKcVersionPanel') > -1) {
    return false;
  }
  if (!md.global.Account || !md.global.Account.accountId) {
    return false;
  }
  if (attachment.previewAttachmentType === 'KC' && attachment.sourceNode.viewType !== NODE_VIEW_TYPE.LINK) {
    return true;
  }
  return false;
}

function showDownload(attachment, options) {
  const { hideFunctions, fromType } = options;
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
  if (attachment.previewAttachmentType === 'KC') {
    return attachment.sourceNode.canEdit;
  } else if (attachment.previewAttachmentType === 'COMMON') {
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
  if (attachment.previewAttachmentType === 'COMMON' && attachment.sourceNode.viewType === 5) {
    return false;
  }
  return true;
}

// TODO chat下的显示权限
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

export function getDownloadUrl(attachment, extra) {
  let result;
  if (attachment.previewAttachmentType === 'KC') {
    if (extra && extra.shareFolderId) {
      result = attachment.sourceNode.downloadUrl + '&shareFolderId=' + extra.shareFolderId;
    } else {
      result = attachment.sourceNode.downloadUrl;
    }
  } else if (attachment.previewAttachmentType === 'QINIU') {
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
  } else if (attachment.previewAttachmentType === 'COMMON') {
    const downloadParams = extra ? extra.downloadParams : undefined;
    if (attachment.previewAttachmentType === PREVIEW_TYPE.PICTURE) {
      const { viewUrl, sourceNode } = attachment;
      const fileName = File.isPicture(sourceNode.originalFilename)
        ? sourceNode.originalFilename
        : sourceNode.originalFilename + sourceNode.ext;
      const url = urlAddParams(viewUrl, { attname: encodeURIComponent(fileName) });
      return viewUrl ? addToken(url, !window.isDingTalk) : url;
    } else if (canDownload(attachment)) {
      return addToken(attachment.sourceNode.downloadUrl, !window.isDingTalk);
    }
  }
  return addToken(result, !window.isDingTalk);
}

/**
 * 拆分文件名
 * @param  {} fullname
 * @return {
 *   name: 'name',
 *   ext: 'ext',
 * }
 */
export function splitFileName(fullname) {
  let name;
  if (fullname[0] === '.') {
    name = '.' + fullname.slice(1).match(/.*(?=\.)|.*/)[0];
  } else {
    name = fullname.match(/.*(?=\.)|.*/)[0];
  }
  const ext = fullname.replace(name, '').slice(1);
  return {
    name,
    ext,
  };
}
/**
 * 去掉url search和hash参数
 * @param  string url
 * @retun  steing  url
 */
export function getUrlNoSearch(url) {
  if (url.indexOf('?') > -1) {
    url = url.slice(0, url.indexOf('?'));
  }
  if (url.indexOf('#') > -1) {
    url = url.slice(0, url.indexOf('#'));
  }
  return url;
}

export function urlAddParams(originurl, value) {
  if (!originurl) return '';
  // 如果是带 token 的链接，换参数会导致 token 失效。所以直接返回
  if (originurl.indexOf('token=') > -1) return originurl;
  const origin = originurl.split('?')[0];
  const query = qs.parse(originurl.replace(origin, '').slice(1));
  return value
    ? origin + '?' + qs.stringify(Object.assign(query, value)).replace(/=&/g, '&').replace(/=$/g, '')
    : origin;
}
