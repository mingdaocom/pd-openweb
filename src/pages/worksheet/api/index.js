import worksheetAjax from 'src/api/worksheet';
import publicWorksheetApi from 'src/api/publicWorksheet';
import { SYSTEM_CONTROL } from 'src/pages/widgetConfig/config/widget';
import { FORM_HIDDEN_CONTROL_IDS } from 'src/pages/widgetConfig/config/widget';
import { replaceControlsTranslateInfo } from 'worksheet/util';
import _ from 'lodash';
import { isSheetDisplay } from 'src/pages/widgetConfig/util';
import { browserIsMobile } from 'src/util';

function getTableAdvancedSettingOfControl(control) {
  let { advancedSetting = {} } = control;
  const isPublicForm = _.get(window, 'shareState.isPublicForm') && window.shareState.shareId;
  if (isPublicForm && control.type === 29) {
    advancedSetting.allowlink = '0';
    advancedSetting.allowedit = '0';
    if (_.includes(['2', '5', '6'], control.advancedSetting.showtype) && browserIsMobile()) {
      advancedSetting = {
        ...advancedSetting,
        showtype: '1',
        originShowType: control.advancedSetting.showtype,
      };
    } else if (_.includes(['2', '6'], _.get(control, 'advancedSetting.showtype'))) {
      advancedSetting = {
        ...advancedSetting,
        showtype: '5',
      };
    }
  }
  return advancedSetting;
}

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
        data.formData = (
          controls ||
          replaceControlsTranslateInfo(data.appId, data.templateControls || []).concat(SYSTEM_CONTROL) ||
          []
        ).map(c => ({
          ...c,
          controlPermissions: controlPermissions[c.controlId] || c.controlPermissions,
          dataSource: c.dataSource || '',
          value: rowData[c.controlId],
          hidden: _.includes(FORM_HIDDEN_CONTROL_IDS, c.controlId),
          count: rowData['rq' + c.controlId],
          required: isSheetDisplay(c) ? false : c.required,
          advancedSetting: getTableAdvancedSettingOfControl(c),
        }));
        resolve(data);
      })
      .catch(reject);
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
    .catch(cb);
}
