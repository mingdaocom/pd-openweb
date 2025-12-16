import _ from 'lodash';
import qs from 'query-string';
import attachmentAjax from 'src/api/attachment';
import kcAjax from 'src/api/kc';
import worksheetAjax from 'src/api/worksheet';
import { RELATE_RECORD_SHOW_TYPE } from 'worksheet/constants/enum';
import { formatControlToServer } from 'src/components/Form/core/utils';
import { FORM_HIDDEN_CONTROL_IDS } from 'src/pages/widgetConfig/config/widget';
import { emitter } from 'src/utils/common';
import { checkCellIsEmpty, updateOptionsOfControls } from 'src/utils/control';
import { handleRecordError } from 'src/utils/record';
import { updateRecord } from '../common/recordInfo/crtl';

export async function downloadAttachmentById({
  fileId,
  refId,
  worksheetId = undefined,
  rowId,
  controlId,
  parentWorksheetId,
  parentRowId,
  sourceControlId,
}) {
  try {
    if (!fileId && !refId) {
      throw new Error();
    }
    let data;
    if (refId) {
      data = await kcAjax.getNodeDetail({
        actionType: 14,
        id: refId,
        worksheetId,
      });
    } else {
      data = await attachmentAjax.getAttachmentDetail({
        fileId,
        worksheetId,
        rowId,
        controlId,
      });
    }
    const logExtend = qs.stringify({
      controlId: sourceControlId || controlId,
      rowId,
      parentWorksheetId,
      parentRowId,
    });
    window.open(`${data.downloadUrl}&${logExtend}`);
  } catch (err) {
    console.error(err);
    alert(_l('下载附件失败'), 3);
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
              control.sourceControlId === defaultRelatedSheet.relateSheetControlId &&
              control.dataSource === defaultRelatedSheet.worksheetId
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
              } catch (err) {
                console.log(err);
              }
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
                } catch (err) {
                  console.log(err);
                }
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
          worksheetAjax
            .getRowDetail({
              worksheetId: control.dataSource,
              rowId: value[0].sid,
            })
            .then(res => {
              value[0].sourcevalue = res.rowData;
              defaultFormData[control.controlId] = JSON.stringify(value);
              handle();
            })
            .catch(() => {
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
    rowStatus,
    setSubListUniqueError,
    setRuleError,
    setServiceError,
    alertLockError,
  } = props;
  const receiveControls = formdata
    .filter(item => item.type !== 30 && item.type !== 31 && item.type !== 32 && item.type !== 51)
    .map(c => formatControlToServer(c, { isNewRecord: true }))
    .filter(item => !checkCellIsEmpty(item.value));
  const args = {
    silent: true,
    receiveControls,
    appId,
    projectId,
    viewId,
    worksheetId,
    masterRecord,
    pushUniqueId: md.global.Config.pushUniqueId,
    rowStatus: rowStatus ? rowStatus : 1,
    ...customBtn,
  };
  if (args.masterRecord && !args.masterRecord.rowId) {
    delete args.masterRecord;
  }
  worksheetAjax
    .addWorksheetRow(args)
    .then(res => {
      if (rowStatus === 21) {
        if (res.resultCode === 20) {
          //达到上限
          onSubmitEnd();
          setRequesting(false);
          onSubmitSuccess({ isOverLimit: true, rowData: [] });
          return;
        } else if (res.data) {
          alert(_l('保存草稿成功'));
          onSubmitSuccess({ rowData: [] });
          onSubmitEnd();
          setRequesting(false);
        } else {
          alert(_l('保存草稿失败'), 2);
        }
        return;
      }
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
      } else if (res.resultCode === 22) {
        setSubListUniqueError(res.badData);
      } else if (res.resultCode === 31) {
        setServiceError(res.badData);
      } else if (res.resultCode === 32) {
        setRuleError(res.badData);
      } else if (res.resultCode === 72) {
        alertLockError();
      } else {
        handleRecordError(res.resultCode, undefined, true);
      }
      onSubmitEnd();
      setRequesting(false);
    })
    .catch(err => {
      console.error(err);
      onSubmitEnd();
    });
}

export function copyRow({ worksheetId, viewId, rowIds, relateRecordControlId }, done = () => {}) {
  worksheetAjax
    .copyRow({
      worksheetId,
      viewId,
      rowIds,
      copyRelationControlId: relateRecordControlId,
    })
    .then(res => {
      if (res && res.resultCode === 1 && res.data.length) {
        if (res.data.length < rowIds.length) {
          alert(_l('%0条复制失败（可能有必填项为空，设置不允许重复或数据超量）', rowIds.length - res.data.length), 3);
        } else {
          alert(_l('复制成功'));
        }
        done(res.data);
        emitter.emit('ROWS_UPDATE');
      } else if (res && res.resultCode === 7) {
        alert(_l('复制失败，权限不足！'), 3);
      } else if (res && res.resultCode === 9) {
        alert(_l('复制失败，超过最大数量！'), 3);
      } else if (res && res.resultCode === 11) {
        alert(_l('复制失败，当前表存在唯一字段'), 3);
      } else {
        alert(
          res && res.resultCode === 1 ? _l('复制失败（可能有必填项为空，设置不允许重复或数据超量）') : _l('复制失败！'),
          2,
        );
      }
    })
    .catch(err => {
      console.log(err);
      alert(_l('复制失败！'), 3);
    });
}

export async function openControlAttachmentInNewTab({
  appId,
  controlId,
  fileId,
  recordId,
  viewId,
  worksheetId,
  getType,
  openAsPopup,
  instanceId,
  workId,
}) {
  if (!controlId || !fileId || !recordId || !worksheetId) {
    console.error('参数不全');
    return;
  }
  const shareId = await worksheetAjax.getAttachmentShareId({
    appId,
    controlId,
    fileId,
    rowId: recordId,
    viewId,
    worksheetId,
    getType,
    instanceId,
    workId,
  });
  if (shareId) {
    const url = `${window.subPath ? window.subPath : ''}/rowfile/${shareId}/${getType || ''}`;
    if (!openAsPopup) {
      window.open(url);
    } else {
      const screenWidth = window.screen.width;
      const screenHeight = window.screen.height;
      const screenLeft = window.screen.availLeft;
      let popupWidth = 1280;
      let popupHeight = 800;
      if (popupHeight > screenHeight) {
        popupHeight = screenHeight;
      }
      if (popupWidth > screenWidth * 0.8) {
        popupWidth = screenWidth * 0.8;
      }
      const windowFeatures = `left=${screenLeft + screenWidth - 1280},top=0,width=${popupWidth},height=${popupHeight}`;
      window.open(url, '', windowFeatures);
    }
  }
}

export function updateRelateRecordSorts({ appId, viewId, worksheetId, recordId, changes = [] }) {
  updateRecord(
    {
      appId,
      viewId,
      worksheetId,
      recordId,
      updateControlIds: changes.map(c => c.controlId),
      data: changes,
    },
    (err, data) => {
      console.log(err, data);
    },
  );
}
