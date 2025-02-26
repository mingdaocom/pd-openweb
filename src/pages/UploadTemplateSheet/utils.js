import appManagementAjax from 'src/api/appManagement';
import attachmentAjax from 'src/api/attachment';
import sheetAjax from 'src/api/worksheet';

const exportUrl = {
  Word: '/ExportWord/CreateWord',
  Xlsx: '/ExportXlsx/CreateXlsx',
};

export const createEditFileLink = async props => {
  const {
    worksheetId,
    downLoadUrl,
    fileType,
    type = 2,
    createCompleted,
    allowDownloadPermission,
    editTemplateDownloadPermission = false,
  } = props;

  const token = await appManagementAjax.getToken({
    worksheetId: worksheetId,
    tokenType: 5,
  });
  const ajaxUrl = downLoadUrl + exportUrl[fileType];

  const option = {
    token,
    worksheetId,
    accountId: _.get(md, 'global.Account.accountId'),
    type,
  };

  const res = await window.mdyAPI('', '', option, {
    ajaxOptions: {
      url: ajaxUrl,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
    customParseResponse: true,
  });

  if (res.message) {
    alert(res.message, 2);
    !!createCompleted && createCompleted();
    return null;
  }

  if (res.data) {
    !!editTemplateDownloadPermission &&
      (await sheetAjax.editTemplateDownloadPermission({
        id: res.data,
        allowDownloadPermission,
      }));

    const data = await attachmentAjax.getAttachmentEditDetail({
      fileId: res.data,
      editType: 2,
      worksheetId,
    });
    !!createCompleted && createCompleted(res.data);

    data.wpsEditUrl && window.open(data.wpsEditUrl);
  }
};
