import _, { get } from 'lodash';
import RegExpValidator from 'src/utils/domain/validation/expression';

/**
 * 生成上传组件使用的临时文件 ID。
 */
function generateFileOId() {
  const prefix = 'o_';

  // 使用当前时间戳作为基础（更具唯一性）
  const timestamp = Date.now().toString(36); // 转成36进制，包含数字+字母

  // 随机部分，用于增加复杂度和避免冲突
  const randomPart = Array.from({ length: 20 }, () => Math.random().toString(36)[2]).join('');

  return prefix + timestamp + randomPart;
}

/**
 * 将远程文件地址转换为上传组件可识别的临时附件对象。
 */
export function getTemporaryAttachmentFromUrl({ fileUrl, fileName = '', fileSize, fileExt } = {}) {
  const urlObj = new URL(fileUrl);
  const name = fileName.replace(/\.[^.]+$/, '');
  const ext = fileExt || get(fileName.match(/\.[^.]+$/), '0');
  const fileNameOfUrl = get(urlObj.pathname.match(/\/([^/]*$)/, ''), '1').replace(/\.[^.]+$/, '');
  return {
    fileID: generateFileOId(),
    fileSize: fileSize || 0,
    serverName: urlObj.origin + '/',
    filePath: urlObj.pathname.replace(/\/([^/]*$)/, '').replace(/^\//, '') + '/',
    fileName: fileNameOfUrl,
    fileExt: ext,
    originalFileName: name,
    key: urlObj.pathname.replace(/^\//, ''),
    oldOriginalFileName: name,
    url: fileUrl,
  };
}

/**
 * 将历史临时附件数据转换为上传组件的统一附件结构。
 */
export const formatTemporaryData = attachments =>
  attachments.map(item => {
    if (item.accountId) {
      return {
        fileExt: item.ext,
        filePath: item.filepath,
        fileName: item.filename,
        fileID: item.fileID,
        fileSize: item.filesize,
        originalFileName: item.originalFilename,
        oldOriginalFileName: item.originalFilename,
        commentID: item.commentID,
        sourceID: item.sourceID,
        twice: item,
      };
    }

    if (!item.key) item.key = `${item.filePath}${item.fileName}${item.fileExt}`;
    if (!item.fileID) item.fileID = Date.now();
    return item;
  });

/**
 * 将知识中心附件转换为上传组件可展示和提交的附件结构。
 */
export const formatKcAttachmentData = attachments =>
  attachments.map(item => {
    if (item.isUpload || item.twice) return item;

    return {
      refId: item.refId || item.id,
      fileExt: item.ext && item.ext.includes('.') ? item.ext : `.${item.ext}`,
      filePath: item.filepath,
      fileName: item.filename,
      fileID: item.fileID || item.id,
      fileSize: item.filesize || item.size,
      originalFileName: item.originalFilename || item.name,
      commentID: item.commentID,
      sourceID: item.sourceID,
      allowDown: item.isDownloadable,
      viewUrl: RegExpValidator.fileIsPicture(`.${item.ext}`) ? item.viewUrl : null,
      type: item.type,
      twice: item,
    };
  });

/**
 * 将文件上传接口响应与本地文件信息合并为标准附件对象。
 */
export const formatResponseData = (file, response) => {
  const data = _.isString(response) ? JSON.parse(response) : response;
  const item = {
    fileID: file.id,
    fileSize: file.size || 0,
    serverName: data.serverName,
    filePath: data.filePath,
    fileName: data.fileName,
    fileExt: data.fileExt,
    originalFileName: data.originalFileName,
    key: data.key,
    url: file.url,
    oldOriginalFileName: data.originalFileName,
  };

  if (!RegExpValidator.fileIsPicture(item.fileExt)) {
    item.allowDown = true;
    item.docVersionID = '';
  }

  return item;
};
