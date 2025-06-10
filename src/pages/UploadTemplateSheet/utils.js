import appManagementAjax from 'src/api/appManagement';
import attachmentAjax from 'src/api/attachment';

const DEFAULT = {
  doc: undefined,
  fileName: undefined,
  allowDownloadPermission: 0,
  allowEditAfterPrint: false,
  advanceSettings: [],
};

export const createEditFileLink = async props => {
  const { worksheetId, downLoadUrl, type = 2, createType, createCompleted, name, params } = props;

  const token = await appManagementAjax.getToken({
    worksheetId: worksheetId,
    tokenType: 5,
  });
  const ajaxUrl = downLoadUrl + '/PrintTemplate/EditPrint';

  const option = {
    token,
    worksheetId,
    accountId: _.get(md, 'global.Account.accountId'),
    type,
    createType,
    name,
    ...(params || DEFAULT),
  };

  const res = await window.mdyAPI('', '', option, {
    ajaxOptions: {
      url: ajaxUrl,
    },
  });

  if (!res) {
    alert(res.message, 2);
    !!createCompleted && createCompleted();
  } else {
    const data = await attachmentAjax.getAttachmentEditDetail({
      fileId: res,
      editType: 2,
      worksheetId,
    });
    !!createCompleted && createCompleted(res);

    data.wpsEditUrl && window.open(data.wpsEditUrl);
  }
};
