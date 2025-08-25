import kcService from '../../../api/service';
import attachmentAjax from 'src/api/attachment';
import chatController from 'src/api/chat';
import kcAjax from 'src/api/kc';

const rejectErr = function (ajaxPromise) {
  return new Promise((resolve, reject) => {
    ajaxPromise
      .then(resp => {
        if (!resp) {
          resp = {
            error: 'no response',
          };
        }
        if (resp.error) {
          reject(resp.error);
        } else {
          resolve(resp);
        }
      })
      .catch(() => {
        reject();
      });
  });
};

export function getKcNodeDetail(nodeId, worksheetId) {
  return kcAjax.getNodeDetail({ id: nodeId, actionType: 14, worksheetId });
}

export function getPreviewLink(attachment) {
  return attachmentAjax.getPreviewLink({
    fileID: attachment.fileID,
    ext: attachment.ext,
    attachmentType: attachment.attachmentType,
  });
}

export function getChatPreviewLink(attachment) {
  return chatController.getPreviewLink(attachment);
}

export function fetchViewUrl(attachment) {
  const param = {
    path: attachment.sourceNode.path,
    id: attachment.sourceNode.fileid || Math.random().toString(16),
    ext: attachment.ext,
  };

  return new Promise((resolve, reject) => {
    getChatPreviewLink(param)
      .then(resp => {
        if (!resp) {
          resp = {
            error: true,
          };
        }
        if (resp.error) {
          reject('获取预览链接失败');
        } else {
          if (resp.viewUrl) {
            attachment.viewUrl = resp.viewUrl;
            attachment.previewType = resp.viewType;
          } else {
            reject('获取预览链接失败');
          }
          resolve(attachment);
        }
      })
      .catch(() => {
        reject('获取预览链接失败');
      });
  });
}

export function renameFile(docVersionID, fileID, newName, ext, sourceID) {
  return rejectErr(
    attachmentAjax.update({
      fileName: newName,
      docVersionID,
      fileID,
      ext,
      sourceID,
    }),
  );
}

export function renameKcFile(id, name, ext) {
  return rejectErr(
    kcService.updateNode({
      name: name + (ext ? '.' + ext : ''),
      id,
    }),
  );
}

export function saveToKnowledge(fileId, toId, toRootId) {
  return rejectErr(
    attachmentAjax.saveToKnowledge({
      fileID: fileId,
      parentID: toId,
      rootID: toRootId,
    }),
  );
}

export function kcCopyNode(ids, toId, toType, copySource) {
  return kcService.copyNode(ids, toId, toType, copySource);
}

export function kcAddFile(options) {
  return kcService.addFile(options);
}

export function deleteAttachment(docVersionID, fileID, sourceID, commentID, fromType, removeFromKC, visibleFileName) {
  return rejectErr(
    attachmentAjax.deleteAttachment({
      docVersionID,
      fileID,
      sourceID,
      commentID,
      fromType,
      removeFromKC,
      visibleFileName,
    }),
  );
}

export function updateAllowDownload(docVersionID, allowDownload) {
  return rejectErr(
    attachmentAjax.update({
      docVersionID,
      allowDownload,
    }),
  );
}
