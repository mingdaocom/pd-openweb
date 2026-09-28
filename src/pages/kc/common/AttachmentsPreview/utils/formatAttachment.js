import { EXT_TYPE_DIC, PREVIEW_ATTACHMENT_TYPE, PREVIEW_TYPE } from '../constant/enum';
import { splitFileName } from '../constant/util';
import { canPreviewHtml, getHtmlPreviewUrl, isHtmlPreviewExt } from './previewAttachmentHelper';

function getExtType(ext) {
  return EXT_TYPE_DIC[ext.toLowerCase()];
}

export function formatAttachment(attachments, callfrom) {
  return attachments.map(attachment => {
    let previewAttachmentType, previewType, name, ext, size, viewUrl, msg;
    attachment.ext = attachment.ext || '';
    if (attachment.previewAttachmentType) {
      previewAttachmentType = attachment.previewAttachmentType;
    } else if (callfrom) {
      if (callfrom === 'kc') {
        previewAttachmentType = PREVIEW_ATTACHMENT_TYPE.KC;
      } else if (callfrom === 'player') {
        previewAttachmentType = PREVIEW_ATTACHMENT_TYPE.COMMON;
      } else if (callfrom === 'chat') {
        previewAttachmentType = PREVIEW_ATTACHMENT_TYPE.QINIU;
      } else {
        console.error('不合法的callfrom');
      }
    } else {
      console.log('attachmentType.....');
    }

    if (
      previewAttachmentType === PREVIEW_ATTACHMENT_TYPE.COMMON ||
      previewAttachmentType === PREVIEW_ATTACHMENT_TYPE.COMMON_ID
    ) {
      ext = attachment.ext[0] === '.' ? attachment.ext.slice(1) : attachment.ext;
      previewType = attachment.viewType || getExtType(ext) || PREVIEW_TYPE.OTHER;
      name = attachment.originalFilename || attachment.name;
      size = attachment.filesize || attachment.size;
    } else if (
      previewAttachmentType === PREVIEW_ATTACHMENT_TYPE.KC ||
      previewAttachmentType === PREVIEW_ATTACHMENT_TYPE.KC_ID
    ) {
      name = attachment.originalFilename || attachment.name;
      ext = attachment.ext.replace(/^\./, '');
      previewType = attachment.viewType || getExtType(ext) || PREVIEW_TYPE.OTHER;
      size = attachment.filesize || attachment.size;
    } else if (previewAttachmentType === PREVIEW_ATTACHMENT_TYPE.QINIU) {
      const splited = splitFileName(attachment.name);
      ext = attachment.ext || splited.ext;
      previewType = getExtType(ext) || PREVIEW_TYPE.OTHER;
      if (previewType === PREVIEW_TYPE.LINK) {
        const url = attachment.linkUrl.match(/http(|s):\/\/.*/) ? attachment.linkUrl : 'http://' + attachment.linkUrl;
        attachment.shortLinkUrl = url;
        attachment.originLinkUrl = url;
      }

      name = splited.name;
      size = attachment.size;
    }

    const htmlPreviewUrl =
      canPreviewHtml() && isHtmlPreviewExt(ext)
        ? getHtmlPreviewUrl({ previewAttachmentType, viewUrl: attachment.viewUrl, sourceNode: attachment })
        : '';

    if (previewType === PREVIEW_TYPE.PICTURE) {
      viewUrl =
        previewAttachmentType === PREVIEW_ATTACHMENT_TYPE.COMMON
          ? attachment.viewUrl || attachment.filepath + attachment.filename
          : previewAttachmentType === PREVIEW_ATTACHMENT_TYPE.KC
            ? attachment.viewUrl
            : attachment.viewUrl || attachment.path;
    } else if (htmlPreviewUrl) {
      previewType = PREVIEW_TYPE.IFRAME;
      viewUrl = htmlPreviewUrl;
    } else if (previewType === PREVIEW_TYPE.CODE || previewType === PREVIEW_TYPE.MARKDOWN) {
      if (size >= 5 * 1024 * 1024) {
        // 大于 5M 的文件不预览
        previewType = PREVIEW_TYPE.OTHER;
      } else {
        if (previewAttachmentType === PREVIEW_ATTACHMENT_TYPE.KC) {
          viewUrl = attachment.viewUrl;
        } else if (previewAttachmentType === PREVIEW_ATTACHMENT_TYPE.QINIU) {
          // viewUrl = attachment.path;
          previewType = PREVIEW_TYPE.OTHER; // path 暂时没有 token，无法预览
        } else {
          viewUrl = attachment.downloadUrl;
        }
      }
    }

    if (previewType === PREVIEW_TYPE.VIDEO && (attachment.filesize || attachment.size) > 1024 * 1024 * 1024) {
      msg = _l('文件过大，不支持在线预览，请您下载后查看');
      previewType = PREVIEW_TYPE.OTHER;
    }

    if (ext === 'xd') {
      previewType = PREVIEW_TYPE.OTHER;
    }

    return {
      previewAttachmentType,
      previewType,
      name: name || '',
      ext: ext || '',
      size,
      viewUrl,
      msg,
      sourceNode: attachment,
    };
  });
}
