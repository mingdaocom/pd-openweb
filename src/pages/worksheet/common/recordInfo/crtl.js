import { quickSelectUser } from 'ming-ui/functions';
import worksheetAjax from 'src/api/worksheet';
import publicWorksheetApi from 'src/api/publicWorksheet';
import { getRowDetail } from 'worksheet/api';
import { getCustomWidgetUri } from 'src/pages/worksheet/constants/common';
import { formatControlToServer, getTitleTextFromControls } from 'src/components/newCustomFields/tools/utils.js';
import { openShareDialog } from 'src/pages/worksheet/components/Share';
import { getAppFeaturesPath } from 'src/util';
import { replacePorTalUrl } from 'src/pages/accountLogin/portalAccount/util';
import createTask from 'src/components/createTask/createTask';
import _ from 'lodash';
import { handleRecordError, postWithToken, replaceBtnsTranslateInfo } from 'worksheet/util';
import { getRuleErrorInfo } from 'src/components/newCustomFields/tools/filterFn';
import appManagement from 'src/api/appManagement';
import { exportSheet } from 'worksheet/components/ChildTable/redux/actions';

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
        }),
      ]);
    }
    promise
      .then(([row, rules]) => {
        if (row.resultCode === 1) {
          resolve(rules ? { ...row, rules } : row);
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
  },
  callback = () => {},
) {
  const updatedControls = data
    .filter(control => updateControlIds.indexOf(control.controlId) > -1 && control.type !== 30)
    .map(control => formatControlToServer(control, { isDraft }));
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
    callback('empty');
    return;
  }

  (isPublicForm ? publicWorksheetApi : worksheetAjax)
    .updateWorksheetRow(apiargs)
    .then(res => {
      if (res && res.data) {
        callback(null, res.data, res.requestLogId);
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
          handleRecordError(res.resultCode);
        } else if (res.resultCode === 32) {
          setRuleError(res.badData);
        } else {
          handleRecordError(res.resultCode);
        }
        callback(true);
      }
    })
    .catch(err => {
      console.error(err);
      callback(err);
      alert(_l('保存失败，请稍后重试'), 2);
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

function isOwner(ownerAccount, formdata) {
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
    filterAccountIds: [ownerAccountId],
    offset: {
      top: 16,
      left: 0,
    },
    zIndex: 10001,
    SelectUserSettings: {
      unique: true,
      projectId: projectId,
      filterAccountIds: [ownerAccountId],
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

export async function handleShare({ isCharge, appId, worksheetId, viewId, recordId, hidePublicShare }, callback) {
  try {
    const row = await getRowDetail({ appId, worksheetId, viewId, rowId: recordId });
    let recordTitle = getTitleTextFromControls(row.formData);
    let allowChange = isCharge || isOwner(row.ownerAccount, row.formData);
    let shareRange = row.shareRange;
    openShareDialog({
      from: 'recordInfo',
      title: _l('分享记录'),
      isPublic: shareRange === 2,
      isCharge: allowChange,
      hidePublicShare,
      params: {
        appId,
        worksheetId,
        viewId,
        rowId: recordId,
        title: recordTitle,
      },
      getCopyContent: (type, url) => `${url} ${row.entityName}：${recordTitle}`,
    });
  } catch (err) {
    alert(_l('分享失败'), 2);
    console.log(err);
  }
}

export async function handleCreateTask({ appId, worksheetId, viewId, recordId }) {
  try {
    const row = await getRowDetail({ appId, worksheetId, viewId, rowId: recordId });
    let recordTitle = getTitleTextFromControls(row.formData, undefined, undefined, { noMask: true });
    const source = appId + '|' + worksheetId + '|' + viewId + '|' + recordId;
    createTask({
      TaskName: recordTitle || _l('未命名'),
      MemberArray: _.isEmpty(row.ownerAccount)
        ? []
        : [row.ownerAccount].filter(item => item.accountId.indexOf('a#') === -1),
      worksheetAndRowId: source,
      isFromPost: true,
      ProjectID: row.projectId,
    });
  } catch (err) {
    alert(_l('创建任务失败'), 2);
    console.log(err);
  }
}

export async function getRecordLandUrl({ appId, worksheetId, viewId, recordId }) {
  if (md.global.Account.isPortal) {
    appId = md.global.Account.appId;
  }
  if (!appId) {
    const res = await getWorksheetInfo({ worksheetId });
    appId = res.appId;
  }
  const appFeaturesPath = getAppFeaturesPath();
  if (viewId) {
    return `${location.origin}${window.subPath || ''}/app/${appId}/${worksheetId}/${viewId}/row/${recordId}${
      appFeaturesPath ? '?' + appFeaturesPath : ''
    }`;
  } else {
    return `${location.origin}${window.subPath || ''}/app/${appId}/${worksheetId}/row/${recordId}${
      appFeaturesPath ? '?' + appFeaturesPath : ''
    }`;
  }
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
    postWithToken(`${downLoadUrl}/ExportExcel/Export`, { worksheetId, tokenType: 8 }, args);
  } else {
    exportSheet({ worksheetId, rowId, controlId, fileName, onDownload })();
  }
}
