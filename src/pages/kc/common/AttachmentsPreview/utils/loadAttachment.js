import _, { isEmpty } from 'lodash';
import kcService from '../../../api/service';
import attachmentAjax from 'src/api/attachment';
import fileAjax from 'src/api/file';
import kcAjax from 'src/api/kc';
import { getToken } from 'src/utils/services/request/authenticated';
import { NODE_VISIBLE_TYPE } from '../../../constant/enum';
import * as ajax from '../ajax';
import { LOADED_STATUS, PREVIEW_ATTACHMENT_TYPE, PREVIEW_TYPE } from '../constant/enum';
import { canPreviewHtml, getHtmlPreviewUrl, isHtmlPreviewExt } from './previewAttachmentHelper';

function addViewCount(attachment) {
  if (
    !attachment ||
    !md.global.Account ||
    !md.global.Account.accountId ||
    !_.get(attachment, 'sourceNode.fileID') ||
    _.get(window, 'shareState.shareId') ||
    location.href.indexOf('printForm') > -1
  ) {
    return;
  }

  if (attachment.previewAttachmentType === PREVIEW_ATTACHMENT_TYPE.COMMON) {
    attachmentAjax.addAttachmentClick({
      fileId: attachment.sourceNode.fileID,
      fromType: attachment.sourceNode.fromType,
    });
  } else if (attachment.previewAttachmentType === PREVIEW_ATTACHMENT_TYPE.KC) {
    kcService.addNodeViewCount(attachment.sourceNode.refId || attachment.sourceNode.id);
  }
}

class AttachmentError {
  constructor({ text, status } = {}) {
    this.text = text;
    this.status = status;
  }
}

export function loadAttachment(attachment, options = {}) {
  return new Promise(resolve => {
    if (!attachment) attachment = {};
    let { previewAttachmentType, previewType } = attachment;
    const { refId } = attachment.sourceNode || {};
    addViewCount(attachment);
    let attachmentPromise = Object.assign({}, attachment);

    if ((attachment.ext || '').toLocaleLowerCase() === 'pdf' && attachment.sourceNode.path) {
      // 判断文件中是否有Token
      const { path } = attachment.sourceNode;

      if ((path || '').indexOf('token=') >= 0) {
        // 直接返回文件url
        attachment.sourceNode.privateDownloadUrl = attachment.sourceNode.path;
        attachmentPromise = Object.assign({}, attachment, {});
      } else {
        getToken([{ bucket: 3, ext: '.pdf' }]).then(res => {
          const [{ serverName }] = res;
          const key = (path || '').split(serverName)[1];

          // 通过特定API获取下载链接
          fileAjax.getChatFileUrl({ serverName, key }).then(data => {
            // 在聊天中访问PDF
            attachment.sourceNode.privateDownloadUrl = data;
            attachmentPromise = Object.assign({}, attachment, {});
          });
        });
      }
    } else if (
      (attachment.ext || '').toLocaleLowerCase() === 'pdf' &&
      (previewAttachmentType === PREVIEW_ATTACHMENT_TYPE.KC || previewAttachmentType === PREVIEW_ATTACHMENT_TYPE.KC_ID)
    ) {
      // 在知识库中访问PDF
      attachmentPromise = kcAjax
        .getDetailUrl({
          id: attachment.sourceNode.refId || attachment.sourceNode.id,
        })
        .then(data => {
          // 获取文件的浏览链接
          attachment.sourceNode.privateDownloadUrl = data;
          return Object.assign({}, attachment, {});
        });
    } else if (
      (attachment.ext || '').toLocaleLowerCase() !== 'pdf' &&
      ((previewAttachmentType === PREVIEW_ATTACHMENT_TYPE.COMMON &&
        !!refId &&
        isEmpty((attachment || {}).sourceNode) &&
        md.global.Account.accountId) ||
        previewAttachmentType === PREVIEW_ATTACHMENT_TYPE.KC_ID)
    ) {
      attachmentPromise = ajax.getKcNodeDetail(refId, options.worksheetId).then(data => {
        if (!data || data.visibleType === NODE_VISIBLE_TYPE.CLOSE) {
          throw new AttachmentError({
            text: _l('文件已删除或您没有权限查看此文件'),
            status: LOADED_STATUS.DELETED,
          });
        }

        return Object.assign({}, attachment, {
          previewType: data.viewType,
          viewUrl: data.viewUrl,
          previewAttachmentType: PREVIEW_ATTACHMENT_TYPE.KC,
          sourceNode: data,
          originNode: attachment.sourceNode,
        });
      });
    } else if (
      previewAttachmentType === PREVIEW_ATTACHMENT_TYPE.COMMON_ID ||
      (attachment.ext || '').toLocaleLowerCase() === 'pdf'
    ) {
      // 在其他场景中访问PDF
      const { fileId, fileID } = attachment.sourceNode;
      const args = {
        fileId: fileId || fileID,
        rowId: options.recordId,
        controlId: options.controlId,
      };

      if (window.shareState && window.shareState.shareId) {
        args.type =
          _.get(window, 'shareState.isPublicRecord') ||
          _.get(window, 'shareState.isPublicView') ||
          _.get(window, 'shareState.isPublicPage')
            ? 3
            : _.get(window, 'shareState.isPublicQuery') || _.get(window, 'shareState.isPublicForm')
              ? 11
              : 14;
      }

      if (options.from === 21) {
        args.type = 21;
      }

      args.worksheetId = options.worksheetId;
      attachmentPromise = attachmentAjax.getAttachmentDetail(args).then(data => {
        if (!data) {
          throw new AttachmentError({
            text: _l('文件不存在'),
            status: LOADED_STATUS.DELETED,
          });
        }

        if (options.disableNoPeimission && data.refId && !data.privateDownloadUrl) {
          throw new AttachmentError({
            text: _l('您权限不足，无法分享，请联系管理员或文件上传者'),
            status: LOADED_STATUS.DELETED,
          });
        }

        return Object.assign({}, attachment, {
          previewType: data.viewType,
          viewUrl: data.viewUrl,
          previewAttachmentType: PREVIEW_ATTACHMENT_TYPE.COMMON,
          sourceNode: data,
          originNode: attachment.sourceNode,
        });
      });
    }

    Promise.all([attachmentPromise])
      .then(([newAttachment]) => {
        const htmlPreviewUrl =
          canPreviewHtml() && isHtmlPreviewExt(newAttachment.ext) ? getHtmlPreviewUrl(newAttachment) : '';

        if (htmlPreviewUrl) {
          newAttachment.previewType = PREVIEW_TYPE.IFRAME;
          newAttachment.viewUrl = htmlPreviewUrl;
        }

        previewType = newAttachment.previewType;
        if (previewAttachmentType === PREVIEW_ATTACHMENT_TYPE.COMMON) {
          if (attachment.sourceNode.viewUrl) {
            newAttachment.viewUrl = attachment.sourceNode.viewUrl;
            resolve(newAttachment);
          } else {
            resolve(newAttachment);
          }
        } else if (previewAttachmentType === PREVIEW_ATTACHMENT_TYPE.QINIU) {
          if (htmlPreviewUrl) {
            resolve(newAttachment);
          } else if (previewType === PREVIEW_TYPE.IFRAME) {
            ajax
              .fetchViewUrl(attachment)
              .then(fetchedAttachment => {
                resolve(fetchedAttachment);
              })
              .catch(err => {
                throw new AttachmentError({
                  text: err,
                });
              });
          } else if (previewType === PREVIEW_TYPE.VIDEO) {
            newAttachment.viewUrl = attachment.sourceNode.path;
            resolve(newAttachment);
          } else {
            resolve(newAttachment);
          }
        } else if (previewAttachmentType === PREVIEW_ATTACHMENT_TYPE.KC) {
          newAttachment.viewUrl =
            previewType === PREVIEW_TYPE.PICTURE ? newAttachment.sourceNode.viewUrl : newAttachment.sourceNode.viewUrl;
          resolve(newAttachment);
        } else {
          resolve(newAttachment);
        }
      })
      .catch(err => {
        throw new AttachmentError({
          text: err,
        });
      });
  });
}
