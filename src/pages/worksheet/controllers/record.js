import {
  getRowDetail,
  addWorksheetRow as addWorksheetRowApi,
  copyRow as copyRowApi,
  getAttachmentShareId,
} from 'src/api/worksheet';
import { getNodeDetail } from 'src/api/kc';
import { getAttachmentDetail } from 'src/api/attachment';
import { formatControlToServer } from 'src/components/newCustomFields/tools/utils.js';
import { RELATE_RECORD_SHOW_TYPE } from 'worksheet/constants/enum';
import { FORM_HIDDEN_CONTROL_IDS } from 'src/pages/widgetConfig/config/widget';
import { updateOptionsOfControls, checkCellIsEmpty } from 'worksheet/util';

export async function downloadAttachmentById({ fileId, refId }) {
  try {
    if (!fileId && !refId) {
      throw new Error();
    }
    let data;
    if (refId) {
      data = await getNodeDetail({
        actionType: 14,
        id: refId,
      });
    } else {
      data = await getAttachmentDetail({
        fileId,
      });
    }
    window.open(data.downloadUrl);
  } catch (err) {
    console.error(err);
    alert(_l('下载附件失败', 3));
  }
}

export function getFormDataForNewRecord({
  worksheetInfo,
  defaultRelatedSheet = {},
  defaultFormData = {},
  defaultFormDataEditable,
  writeControls = [],
}) {
  return new Promise((resolve, reject) => {
    let controls = _.cloneDeep(worksheetInfo.template.controls);
    function handle() {
      try {
        controls = controls
          .filter(c => !_.includes(FORM_HIDDEN_CONTROL_IDS, c.controlId))
          .map(control => {
            if (
              control.type === 29 &&
              Number(control.advancedSetting.showtype) !== RELATE_RECORD_SHOW_TYPE.LIST &&
              control.sourceControlId === defaultRelatedSheet.relateSheetControlId
            ) {
              try {
                control.advancedSetting = _.assign({}, control.advancedSetting, {
                  defsource: JSON.stringify([
                    {
                      staticValue: JSON.stringify([
                        JSON.stringify({
                          ...JSON.parse(defaultRelatedSheet.value.sourcevalue),
                          name: defaultRelatedSheet.value.name,
                        }),
                      ]),
                    },
                  ]),
                });
                if (control.fieldPermission) {
                  control.fieldPermission = control.fieldPermission.replace(/(\w)(\w)(\w)/g, '$10$3');
                } else {
                  control.fieldPermission = '101';
                }
              } catch (err) {}
            }
            if (defaultFormData[control.controlId]) {
              control.value = defaultFormData[control.controlId];
              if (!defaultFormDataEditable) {
                if (control.fieldPermission) {
                  control.fieldPermission = control.fieldPermission.replace(/(\w)(\w)(\w)/g, '$10$3');
                } else {
                  control.fieldPermission = '101';
                }
              }
            }
            return { ...control };
          });
        controls = controls.map(control => {
          const writeControl = _.find(writeControls, wc => control.controlId === wc.controlId) || {};
          if (writeControl.defsource) {
            control.value = '';
            if (_.includes([9, 10, 11], control.type)) {
              control.value = control.default = safeParse(writeControl.defsource)[0].staticValue;
            } else {
              control.advancedSetting = { ...(control.advancedSetting || {}), defsource: writeControl.defsource };
            }
          }
          if (control.type === 30 && !control.value) {
            const parentControl = _.find(
              worksheetInfo.template.controls,
              c => c.controlId === control.dataSource.slice(1, -1),
            );
            const sourceControl =
              parentControl && _.find(parentControl.relationControls, c => c.controlId === control.sourceControlId);
            if (!parentControl) {
              return control;
            }
            if (parentControl.value) {
              const parentSheetRelateRecord = JSON.parse(parentControl.value)[0];
              if (!parentSheetRelateRecord.sourcevalue) {
                return { ...control };
              }
              if (sourceControl && sourceControl.type === 29) {
                try {
                  const sourceControlValue = JSON.parse(parentSheetRelateRecord.sourcevalue)[control.sourceControlId];
                  const sourceControlValueRecord = JSON.parse(sourceControlValue)[0];
                  if (sourceControlValueRecord) {
                    control.value = sourceControlValueRecord.name;
                  }
                } catch (err) {}
              } else {
                control.value = JSON.parse(parentSheetRelateRecord.sourcevalue)[control.sourceControlId];
              }
            }
          }
          return { ...control };
        });
      } catch (err) {
        reject(err);
      }
      resolve(controls);
    }
    // 兼容 看板 甘特图视图新建记录时关联记录默认值数据不完整问题
    const defaultFormDataControlIds = Object.keys(defaultFormData);
    if (defaultFormDataControlIds.length === 1) {
      const control = _.find(controls, c => c.controlId === defaultFormDataControlIds[0]);
      if (control && control.type === 29 && _.find(controls, c => c.dataSource === `$${control.controlId}$`)) {
        const value = safeParse(defaultFormData[control.controlId]);
        if (value.length && value[0].sid && !value[0].sourcevalue) {
          getRowDetail({
            worksheetId: control.dataSource,
            rowId: value[0].sid,
          })
            .then(res => {
              value[0].sourcevalue = res.rowData;
              defaultFormData[control.controlId] = JSON.stringify(value);
              handle();
            })
            .fail(err => {
              handle();
            });
          return;
        }
      }
    }
    handle();
  });
}

export function submitNewRecord(props) {
  const {
    appId,
    projectId,
    addType,
    viewId,
    worksheetId,
    masterRecord,
    formdata,
    customBtn,
    updateWorksheetControls,
    onSubmitEnd = () => {},
    onSubmitSuccess = () => {},
    customwidget,
    setRequesting,
  } = props;
  const receiveControls = formdata
    .filter(item => item.type !== 30 && item.type !== 31 && item.type !== 32)
    .map(formatControlToServer)
    .filter(item => !checkCellIsEmpty(item.value));
  const args = {
    silent: true,
    receiveControls,
    appId,
    projectId,
    addType,
    viewId,
    worksheetId,
    masterRecord,
    pushUniqueId: md.global.Config.pushUniqueId,
    ...customBtn,
  };
  if (args.masterRecord && !args.masterRecord.rowId) {
    delete args.masterRecord;
  }
  addWorksheetRowApi(args)
    .then(res => {
      if (res.resultCode === 1 && !res.data) {
        alert(_l('记录添加成功'));
        onSubmitEnd();
        setRequesting(false);
        return;
      }
      if (res.resultCode === 1) {
        let newControls;
        let newOptionControls = updateOptionsOfControls(formdata, res.data);
        if (newOptionControls.length && _.isFunction(updateWorksheetControls)) {
          updateWorksheetControls(newOptionControls);
          newControls = newOptionControls.map(c => ({ ...c, value: res.data[c.controlId] }));
        }
        onSubmitSuccess({ rowData: res.data, newControls });
      } else if (res.resultCode === 11) {
        if (customwidget.current && _.isFunction(customwidget.current.uniqueErrorUpdate)) {
          customwidget.current.uniqueErrorUpdate(res.badData);
        }
      } else {
        alert(_l('记录添加失败'), 3);
      }
      onSubmitEnd();
      setRequesting(false);
    })
    .fail(err => {
      onSubmitEnd();
      if (_.isObject(err)) {
        alert(err.errorMessage || _l('记录添加失败'), 3);
      } else {
        alert(err || _l('记录添加失败'), 3);
      }
    });
}

export function copyRow({ worksheetId, viewId, rowIds }, done = () => {}) {
  copyRowApi({
    worksheetId,
    viewId,
    rowIds,
  })
    .then(res => {
      if (res && res.resultCode === 1) {
        alert(_l('复制成功'));
        done(res.data);
      } else if (res && res.resultCode === 7) {
        alert(_l('复制失败，权限不足！'), 3);
      } else if (res && res.resultCode === 9) {
        alert(_l('复制失败，超过最大数量！'), 3);
      } else if (res && res.resultCode === 11) {
        alert(_l('复制失败，当前表存在唯一字段'), 3);
      } else {
        alert(_l('复制失败！'), 3);
      }
    })
    .fail(err => {
      console.log(err);
      alert(_l('复制失败！'), 3);
    });
}

export async function openControlAttachmentInNewTab({ appId, controlId, fileId, recordId, viewId, worksheetId }) {
  if (!controlId || !fileId || !recordId || !worksheetId) {
    console.error('参数不全');
    return;
  }
  const shareId = await getAttachmentShareId({
    appId,
    controlId,
    fileId,
    rowId: recordId,
    viewId,
    worksheetId,
  });
  if (shareId) {
    window.open(`${window.subPath ? window.subPath : ''}/recordfile/${shareId}`);
  }
}
