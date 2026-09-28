import { v4 as uuidv4 } from 'uuid';
import RegExpValidator from 'src/utils/domain/validation/expression';
import { getAttachmentRuntimeConfig } from 'src/utils/platform/runtime/config';

/**
 * 将附件字段值转换为上传组件使用的附件数据结构。
 */
export function formatAttachmentValue(value, isRecreate = false, isRelation = false) {
  const attachmentArr = safeParse(value || '[]', 'array');
  let attachmentValue = attachmentArr;

  if (attachmentArr.length) {
    attachmentValue = attachmentArr.filter(item => !item.refId);

    if (attachmentValue.length) {
      const { documentHost, isLocal, pictureHost } = getAttachmentRuntimeConfig();

      attachmentValue = attachmentValue.map((item, index) => {
        let fileUrl = item.fileUrl || item.fileRealPath;
        const isLinkFile = item.ext === '.url';

        if (!fileUrl && item.filepath && item.filename) {
          fileUrl = `${item.filepath}${item.filename}`;
        }

        const url = isLinkFile ? {} : new URL(fileUrl);
        const urlPathNameArr = (url.pathname || '').split('/');
        const fileName = isLinkFile ? item.filename : (urlPathNameArr[urlPathNameArr.length - 1] || '').split('.')[0];
        let filePath = isLinkFile ? fileUrl : (url.pathname || '').slice(1).replace(fileName + item.ext, '');
        const host = (RegExpValidator.fileIsPicture(item.ext) ? pictureHost : documentHost) + '/';
        let searchParams = '';
        let extAttr = {};

        if (isLocal && isRecreate && (item.viewUrl || item.previewUrl)) {
          const filelink = new URL(host);
          filePath = filePath.replace(filelink.pathname.slice(1), '');
          searchParams = ((item.viewUrl || item.previewUrl).match(/\?.*/) || [''])[0];
          isRelation && (extAttr = { ext: item.ext, previewUrl: item.previewUrl });
        }

        return {
          ...extAttr,
          fileID: item.fileId || item.fileID,
          fileSize: item.filesize,
          url: isLinkFile ? undefined : fileUrl + searchParams,
          viewUrl: isLinkFile ? undefined : fileUrl + searchParams,
          serverName: isLocal && isRecreate ? host : url.origin + '/',
          filePath,
          fileName,
          fileExt: item.ext,
          originalFileName: item.originalFilename,
          key: uuidv4(),
          oldOriginalFileName: item.originalFilename,
          index,
        };
      });
    }
  }

  return JSON.stringify({
    attachments: attachmentValue,
    knowledgeAtts: [],
    attachmentData: [],
  });
}
