import _ from 'lodash';
import { quickSelectUser } from 'ming-ui/functions';
import appManagement from 'src/api/appManagement';
import publicWorksheetApi from 'src/api/publicWorksheet';
import worksheetAjax from 'src/api/worksheet';
import { getRowDetail } from 'worksheet/api';
import { exportSheet } from 'worksheet/components/ChildTable/redux/actions';
import { getRuleErrorInfo } from 'src/components/newCustomFields/tools/formUtils';
import { formatControlToServer } from 'src/components/newCustomFields/tools/utils.js';
import { replacePorTalUrl } from 'src/pages/AuthService/portalAccount/util';
import { getCustomWidgetUri } from 'src/pages/worksheet/constants/common';
import { getAppFeaturesPath } from 'src/utils/app';
import { postWithToken } from 'src/utils/common';
import { getRecordLandUrl, handleRecordError } from 'src/utils/record';
import { replaceBtnsTranslateInfo, replaceRulesTranslateInfo } from 'src/utils/translate';

export function getWorksheetInfo(...args) {
  return worksheetAjax.getWorksheetInfo(...args);
}

export function loadRecord({
  appId,
  viewId,
  worksheetId,
  relationWorksheetId,
  recordId,
  getType = 1,
  instanceId,
  workId,
  getRules,
  controls,
}) {
  return new Promise((resolve, reject) => {
    let apiargs = {
      worksheetId,
      rowId: recordId,
      getType,
      appId,
      viewId,
      relationWorksheetId,
      checkView: !!viewId,
    };
    if (instanceId && workId) {
      apiargs.getType = 9;
      apiargs.instanceId = instanceId;
      apiargs.workId = workId;
    }

    if (_.get(window, 'shareState.isPublicWorkflowRecord') && _.get(window, 'shareState.shareId')) {
      apiargs.shareId = _.get(window, 'shareState.shareId');
    }

    let promise;
    if (!getRules) {
      promise = Promise.all([(promise = getRowDetail(apiargs, controls))]);
    } else {
      promise = Promise.all([
        getRowDetail(apiargs, controls),
        worksheetAjax.getControlRules({
          worksheetId,
          type: 1, // 1字段显隐
          instanceId,
          workId,
        }),
      ]);
    }
    promise
      .then(([row, rules]) => {
        if (row.resultCode === 1 || row.resultCode === 71) {
          if (row.roleType !== 0) {
            row.resultCode = 1;
          }
          resolve(rules ? { ...row, rules: replaceRulesTranslateInfo(appId, worksheetId, rules) } : row);
        } else {
          reject(row);
        }
      })
      .catch(reject);
  });
}

export function updateRecord(
  {
    appId,
    viewId,
    getType,
    worksheetId,
    recordId,
    projectId,
    instanceId,
    workId,
    data,
    updateControlIds,
    isDraft,
    triggerUniqueError,
    updateSuccess,
    allowEmptySubmit,
    setSubListUniqueError = () => {},
    setRuleError = () => {},
    setServiceError = () => {},
  },
  callback = () => {},
) {
  const handleCallback = (...args) => {
    try {
      callback(...args);
    } catch (err) {
      console.error(err);
    }
  };
  const updatedControls = data
    .filter(control => updateControlIds.indexOf(control.controlId) > -1 && control.type !== 30)
    .map(control => formatControlToServer(control));
  let apiargs = {
    appId,
    viewId,
    getType,
    worksheetId,
    rowId: recordId,
    newOldControl: updatedControls,
    projectID: projectId,
    pushUniqueId: md.global.Config.pushUniqueId,
  };
  if (instanceId && workId) {
    apiargs.getType = 9;
    apiargs.instanceId = instanceId;
    apiargs.workId = workId;
  }

  if (isDraft) {
    apiargs.rowStatus = 21;
  }

  const isPublicForm = _.get(window, 'shareState.isPublicForm') && window.shareState.shareId;

  if (isPublicForm) {
    apiargs = {
      rowId: recordId,
      newOldControl: updatedControls,
    };
  }

  // 处理工作流的暂存直接点击的情况
  if (!updatedControls.length && !allowEmptySubmit) {
    if (!(instanceId && workId)) {
      alert(_l('没有需要保存的字段'), 2);
    }
    handleCallback('empty');
    return;
  }

  (isPublicForm ? publicWorksheetApi : worksheetAjax)
    .updateWorksheetRow(apiargs)
    .then(res => {
      if (res && res.data) {
        handleCallback(null, res.data, res.requestLogId);
        if (typeof updateSuccess === 'function') {
          updateSuccess(
            [recordId],
            _.assign({}, ...updatedControls.map(control => ({ [control.controlId]: res.data[control.controlId] }))),
            res.data,
          );
        }
      } else {
        if (res.resultCode === 11) {
          triggerUniqueError(res.badData);
        } else if (res.resultCode === 22) {
          setSubListUniqueError(res.badData);
        } else if (res.resultCode === 31) {
          setServiceError(res.badData);
        } else if (res.resultCode === 32) {
          setRuleError(res.badData);
        } else {
          handleRecordError(res.resultCode);
        }
        handleCallback(true);
      }
    })
    .catch(err => {
      console.error(err);
      handleCallback(err);
      alert(_l('保存失败，请稍后重试'), 2);
    });
}

export function handleSubmitDraft(
  {
    worksheetId,
    viewId,
    appId,
    recordId,
    formData = [],
    rules = [],
    triggerUniqueError = () => {},
    setSubListUniqueError = () => {},
    handleRecordError = () => {},
    setRuleError = () => {},
    onSubmitEnd = () => {},
    onSubmitSuccess = () => {},
  },
  callback = () => {},
) {
  const handleCallback = (...args) => {
    try {
      callback(...args);
    } catch (err) {
      console.error(err);
    }
  };

  // 草稿提交仅传业务规则相关字段
  const receiveControlsIds = rules.reduce((controlIds, item) => {
    const { filters = [], ruleItems = [] } = item;
    let ids = [];
    if (!_.isEmpty(filters)) {
      filters.forEach(it => {
        controlIds = controlIds.concat((it.groupFilters || []).map(v => v.controlId)).concat(it.controlId);
        if (it.groupFilters && it.groupFilters.length > 0) {
          it.groupFilters.forEach(v => {
            controlIds = controlIds.concat(v.controlId);
            if (v.dynamicSource && v.dynamicSource.length > 0) {
              const cids = v.dynamicSource.reduce((ids, s) => ids.concat(s.cid), []);
              controlIds = controlIds.concat(cids);
            }
          });
        }
      });
    }
    if (!_.isEmpty(ruleItems)) {
      ruleItems.forEach(it => {
        controlIds = controlIds.concat(it.controls.map(it => it.controlId));
      });
    }

    return controlIds.concat(ids);
  }, []);

  const receiveControls = formData
    .filter(item => !_.includes([30, 31, 32, 51], item.type) && _.includes(receiveControlsIds, item.controlId))
    .map(c => formatControlToServer(c, { isNewRecord: true, isDraft: true }));

  const args = {
    worksheetId,
    receiveControls,
    viewId,
    appId,
    pushUniqueId: md.global.Config.pushUniqueId,
    rowStatus: 22,
    draftRowId: recordId,
  };
  worksheetAjax
    .saveDraftRow(args)
    .then(res => {
      if (res.resultCode === 1) {
        if (!res.data) {
          alert(_l('记录添加成功'));
          onSubmitEnd();
          return;
        }
        onSubmitSuccess(res.data);
        onSubmitEnd();
      } else {
        if (res.resultCode === 11) {
          triggerUniqueError(res.badData);
        } else if (res.resultCode === 22) {
          setSubListUniqueError(res.badData);
        } else if (res.resultCode === 31) {
          setServiceError(res.badData);
        } else if (res.resultCode === 32) {
          setRuleError(res.badData);
        } else {
          handleRecordError(res.resultCode);
        }
        handleCallback(true);
      }
    })
    .catch(err => {
      console.error(err);
      handleCallback(err);
      alert(_l('提交失败，请稍后重试'), 2);
    });
}

export function updateRecordControl({ appId, viewId, worksheetId, recordId, cell, rules, cells = [] }) {
  return new Promise((resolve, reject) => {
    if (_.isEmpty(cells) && cell) {
      cells = [cell];
    }
    worksheetAjax
      .updateWorksheetRow({
        appId,
        viewId,
        worksheetId: worksheetId,
        rowId: recordId,
        newOldControl: cells,
      })
      .then(data => {
        if (!data.data) {
          if (data.resultCode === 32) {
            const errorResult = getRuleErrorInfo(rules, data.badData);
            if (_.get(errorResult, '0.errorInfo.0')) {
              alert('编辑失败，' + _.get(errorResult, '0.errorInfo.0.errorMessage'), 2);
            }
            reject();
            return;
          }
          handleRecordError(data.resultCode, cell);
          reject();
        } else {
          resolve(data.data);
        }
      });
  });
}

export function deleteRecord({ worksheetId, recordIds, recordId, viewId, appId, deleteType }) {
  return new Promise((resolve, reject) => {
    worksheetAjax
      .deleteWorksheetRows({
        worksheetId,
        rowIds: recordIds || [recordId],
        viewId,
        appId,
        deleteType: deleteType === 21 ? deleteType : undefined,
      })
      .then(data => {
        if (data.isSuccess) {
          resolve();
        } else {
          reject();
        }
      })
      .catch(reject);
  });
}

export class RecordApi {
  constructor({ appId, worksheetId, viewId, recordId }) {
    this.baseArgs = {
      appId,
      worksheetId,
      viewId,
      rowId: recordId,
    };
  }

  getWorksheetBtns(options) {
    return new Promise((resolve, reject) => {
      worksheetAjax
        .getWorksheetBtns(_.assign({}, this.baseArgs, options))
        .then(data => {
          resolve(replaceBtnsTranslateInfo(this.baseArgs.appId, data));
        })
        .catch(err => {
          reject(err);
        });
    });
  }
}

export function updateRelateRecords({
  appId,
  viewId,
  recordId,
  worksheetId,
  instanceId,
  workId,
  controlId,
  isAdd,
  recordIds,
  updateType,
}) {
  return new Promise((resolve, reject) => {
    const args = {
      worksheetId,
      appId,
      viewId,
      rowId: recordId,
      controlId,
      isAdd,
      rowIds: recordIds,
      updateType: updateType === 21 ? updateType : undefined,
    };
    if (instanceId && workId) {
      args.instanceId = instanceId;
      args.workId = workId;
    }
    worksheetAjax
      .updateRowRelationRows(args)
      .then(data => {
        if (data.isSuccess) {
          resolve();
        } else {
          reject();
        }
      })
      .catch(reject);
  });
}

export function isOwner(ownerAccount, formdata) {
  let accountsOfOwner = [];
  let isSettingOwner = false;
  if (ownerAccount && ownerAccount.accountId === md.global.Account.accountId) {
    return true;
  }
  try {
    accountsOfOwner = formdata
      .filter(c => c.type === 26 && c.userPermission === 2)
      .map(u => JSON.parse(u.value))
      .filter(c => c && c.length);
  } catch (err) {}
  accountsOfOwner.forEach(accounts => {
    accounts.forEach(account => {
      if (account.accountId === md.global.Account.accountId) {
        isSettingOwner = true;
      }
    });
  });
  return isSettingOwner;
}

export function updateRecordOwner({ worksheetId, recordId, accountId }) {
  return new Promise((resolve, reject) => {
    worksheetAjax
      .updateWorksheetRow({
        worksheetId,
        rowId: recordId,
        getType: 3,
        newOldControl: [{ controlId: 'ownerid', type: 26, value: accountId }],
      })
      .then(res => {
        if (res && res.data) {
          const account = JSON.parse(res.data.ownerid)[0];
          resolve({
            account,
            record: res.data,
          });
        } else {
          reject();
        }
      })
      .catch(reject);
  });
}

export function handleChangeOwner({ recordId, ownerAccountId, appId, projectId, target, changeOwner }) {
  quickSelectUser(target, {
    sourceId: recordId,
    projectId: projectId,

    showMoreInvite: false,
    isTask: false,
    tabType: 3,
    appId,
    includeUndefinedAndMySelf: true,
    selectedAccountIds: [ownerAccountId],
    offset: {
      top: 16,
      left: 0,
    },
    zIndex: 10001,
    SelectUserSettings: {
      unique: true,
      projectId: projectId,
      selectedAccountIds: [ownerAccountId],
      callback(users) {
        if (users[0].accountId === md.global.Account.accountId) {
          users[0].fullname = md.global.Account.fullname;
        }
        changeOwner(users, users[0].accountId);
      },
    },
    selectCb(users) {
      if (users[0].accountId === md.global.Account.accountId) {
        users[0].fullname = md.global.Account.fullname;
      }
      changeOwner(users, users[0].accountId);
    },
  });
}

export async function handleOpenInNew({ appId, worksheetId, viewId, recordId }) {
  const url = await getRecordLandUrl({ appId, worksheetId, viewId, recordId });
  window.open(replacePorTalUrl(url));
}

export function handleCustomWidget(worksheetId) {
  getWorksheetInfo({ worksheetId }).then(({ name, templateId, projectId, appId, groupId }) => {
    getCustomWidgetUri({
      sourceName: name,
      templateId,
      sourceId: worksheetId,
      projectId,
      appconfig: {
        appId,
        appSectionId: groupId,
      },
    });
  });
}

export async function exportRelateRecordRecords({
  appId,
  worksheetId,
  viewId,
  projectId,
  exportControlsId,
  downLoadUrl,
  rowIds,
  rowId,
  controlId,
  fileName,
  filterControls,
  onDownload,
} = {}) {
  const token = await appManagement.getToken({ worksheetId, viewId, tokenType: 8 });
  const args = {
    token,
    accountId: md.global.Account.accountId,
    worksheetId,
    appId,
    viewId,
    projectId,
    exportControlsId,
    rowIds,
  };
  if (typeof rowIds !== 'undefined') {
    postWithToken(`${downLoadUrl}/ExportExcel/Export`, { worksheetId, tokenType: 8 }, args, {
      responseType: 'blob',
    });
  } else {
    exportSheet({ worksheetId, rowId, controlId, fileName, filterControls, onDownload })();
  }
}
