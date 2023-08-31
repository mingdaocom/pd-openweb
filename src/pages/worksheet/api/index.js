import worksheetAjax from 'src/api/worksheet';
import publicWorksheetApi from 'src/api/publicWorksheet';
import { SYSTEM_CONTROL } from 'src/pages/widgetConfig/config/widget';
import { FORM_HIDDEN_CONTROL_IDS } from 'src/pages/widgetConfig/config/widget';
import _ from 'lodash';

export function getRowDetail(params, controls, options = {}) {
  return new Promise((resolve, reject) => {
    if (!controls) {
      params.getTemplate = true;
    }
    const isPublicForm = _.get(window, 'shareState.isPublicForm') && window.shareState.shareId;

    (isPublicForm
      ? publicWorksheetApi.getRowDetail({
          rowId: params.rowId,
          worksheetId: params.worksheetId,
          getType: 1,
          checkView: true,
          getTemplate: true,
        })
      : worksheetAjax.getRowDetail(params, options)
    )
      .then(data => {
        const rowData = safeParse(data.rowData);
        let controlPermissions = safeParse(rowData.controlpermissions);
        data.formData = (controls || (data.templateControls || []).concat(SYSTEM_CONTROL) || []).map(c => ({
          ...c,
          controlPermissions: controlPermissions[c.controlId] || c.controlPermissions,
          dataSource: c.dataSource || '',
          value: rowData[c.controlId],
          hidden: _.includes(FORM_HIDDEN_CONTROL_IDS, c.controlId),
          count: rowData['rq' + c.controlId],
          advancedSetting:
            isPublicForm && c.type === 29 && c.advancedSetting
              ? c.advancedSetting.showtype === '2'
                ? { ...c.advancedSetting, showtype: '1', originShowType: '2', allowlink: false }
                : { ...c.advancedSetting, allowlink: false }
              : c.advancedSetting || {},
        }));
        resolve(data);
      })
      .fail(reject);
  });
}

export function deleteAttachmentOfControl(
  { appId, viewId, worksheetId, recordId, controlId, attachment },
  cb = () => {},
) {
  const deleteObj = [
    {
      fileId: attachment.fileId || attachment.fileID,
      originalFilename: attachment.originalFilename,
    },
  ];

  worksheetAjax
    .updateWorksheetRow({
      appId,
      viewId,
      worksheetId,
      rowId: recordId,
      newOldControl: [
        {
          controlId,
          editType: 2,
          value: JSON.stringify(
            attachment.refId
              ? {
                  knowledgeAtts: deleteObj,
                }
              : {
                  attachments: deleteObj,
                },
          ),
        },
      ],
    })
    .then(data => (data.resultCode === 1 ? cb(null, data.data) : cb(data.resultCode)))
    .fail(cb);
}
