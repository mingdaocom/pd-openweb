import _ from 'lodash';
import qs from 'query-string';
import { getFileExtends } from 'src/components/UploadFiles/utils';
import { downloadFile } from 'src/utils/common';
import RegExpValidator from 'src/utils/expression';

export const handleShare = (data, isDownload) => {
  if (!md.global.Account.accountId) {
    window.open(`${md.global.Config.WebUrl}login?ReturnUrl=${location.href}`);
    return;
  }

  if (!isDownload) {
    alert(_l('您权限不足，无法分享，请联系管理员或文件上传者'), 3);
    return;
  }

  let attachment = {};
  let attachmentType = 1;

  if (data.refId) {
    // 知识文件
    attachmentType = 2;
    attachment = {
      id: data.refId,
      name: data.originalFilename,
      ext: getFileExtends(data.ext),
      size: data.filesize,
      path: `${data.filepath}${data.filename}`,
      previewUrl: data.previewUrl,
      viewUrl: data.viewUrl,
    };
  } else {
    attachment = {
      id: data.fileID,
      name: data.originalFilename || RegExpValidator.getNameOfFileName(data.filename),
      ext: getFileExtends(data.ext),
      size: data.filesize,
      path: `${data.filepath}${data.filename}`,
      previewUrl: data.previewUrl,
      viewUrl: data.viewUrl,
    };
  }

  import('src/components/shareAttachment/shareAttachment').then(share => {
    const params = {
      attachmentType,
    };
    const isPicture = RegExpValidator.fileIsPicture('.' + attachment.ext.slice(attachment.ext.indexOf('.') + 1));
    params.id = attachment.id;
    params.name = attachment.name;
    params.ext = `.${attachment.ext}`;
    params.size = attachment.size || 0; // 临时
    params.imgSrc = isPicture
      ? `${attachment.previewUrl.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, 'imageView2/2/w/490')}`
      : undefined;
    params.qiniuPath = attachment.path;
    params.isKcFolder = data.attachmentType === 5;
    share.default(params, {
      performUpdateItem: () => {},
    });
  });
};

export const handleSaveKcCloud = (data, isDownload) => {
  if (!md.global.Account.accountId) {
    window.open(`${md.global.Config.WebUrl}login?ReturnUrl=${location.href}`);
    return;
  }

  if (!isDownload) {
    alert(_l('您权限不足，无法保存，请联系管理员或文件上传者'), 3);
    return;
  }

  let nodeType = 0;
  let sourceData = {};
  if (data.refId) {
    nodeType = 2;
    sourceData.nodeId = data.refId;
    sourceData.isShareFolder = data.attachmentType === 5;
  } else {
    nodeType = 1;
    sourceData.fileID = data.fileID;
  }

  import('src/components/kc/folderSelectDialog/folderSelectDialog').then(folderDg => {
    folderDg
      .default({
        dialogTitle: _l('选择路径'),
        isFolderNode: 1,
        selectedItems: null,
        zIndex: 9999,
      })
      .then(result => {
        import('src/components/kc/saveToKnowledge/saveToKnowledge').then(saveToKnowledge => {
          saveToKnowledge
            .default(nodeType, sourceData)
            .save(result)
            .then(function () {
              alert(_l('保存成功'));
            })
            .catch(function () {
              alert(_l('保存失败'), 2);
            });
        });
      });
  });
};

export const handleDownload = (data, isDownload, logData) => {
  const logExtend = logData
    ? '&' + qs.stringify(_.pick(logData, ['controlId', 'rowId', 'parentWorksheetId', 'parentRowId']))
    : '';
  const url = data.downloadUrl
    ? data.downloadUrl
    : data.attachmentType == 5
      ? `${data.downloadUrl}&shareFolderId=${data.refId}`
      : `${md.global.Config.AjaxApiUrl}file/downDocument?fileID=${data.fileID}`;
  if (isDownload) {
    window.open(downloadFile(url + logExtend));
  } else {
    alert(_l('您权限不足，无法下载，请联系管理员或文件上传者'), 3);
  }
};

export const loadImage = url => {
  return new Promise((reslove, reject) => {
    const image = new Image();
    image.onload = () => {
      reslove(image);
    };
    image.onerror = error => {
      reject(error);
    };
    image.src = url;
  });
};
