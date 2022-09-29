import {
  updateWorksheetRow,
  deleteWorksheetRows,
  getWorksheetBtns,
  updateRowRelationRows,
  getWorksheetInfo as getWorksheetInfoApi,
} from 'src/api/worksheet';
import { getControlRules } from 'src/api/worksheet';
import { getRowDetail } from 'worksheet/api';
import { getCustomWidgetUri } from 'src/pages/worksheet/constants/common';
import { formatControlToServer, getTitleTextFromControls } from 'src/components/newCustomFields/tools/utils.js';
import { openShareDialog } from 'src/pages/worksheet/components/Share';
import { getAppFeaturesPath } from 'src/util';
import { replacePorTalUrl } from 'src/pages/PortalAccount/util'
export function getWorksheetInfo(...args) {
  return getWorksheetInfoApi(...args);
}

export function loadRecord({
  appId,
  viewId,
  worksheetId,
  recordId,
  getType = 1,
  instanceId,
  workId,
  getRules,
  controls,
}) {
  return new Promise((resolve, reject) => {
    const apiargs = {
      worksheetId,
      rowId: recordId,
      getType,
      appId,
      viewId,
      checkView: true,
    };
    if (instanceId && workId) {
      apiargs.getType = 9;
      apiargs.instanceId = instanceId;
      apiargs.workId = workId;
    }
    let promise;
    if (!getRules) {
      promise = Promise.all([(promise = getRowDetail(apiargs, controls, { fireImmediately: true }))]);
    } else {
      promise = Promise.all([
        getRowDetail(apiargs, controls),
        getControlRules({
          worksheetId,
          type: 1, // 1字段显隐
        }),
      ]);
    }
    promise
      .then(([row, rules]) => {
        if (row.resultCode === 1) {
          if (instanceId && workId && !viewId) {
            // 工作流调用
            row.formData = row.formData.map(c => Object.assign({}, c, { fieldPermission: '111' }));
          }
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
    triggerUniqueError,
    updateSuccess,
  },
  callback = () => { },
) {
  const updatedControls = data
    .filter(control => updateControlIds.indexOf(control.controlId) > -1 && control.type !== 30)
    .map(formatControlToServer);
  const apiargs = {
    appId,
    viewId,
    getType,
    worksheetId,
    rowId: recordId,
    newOldControl: updatedControls,
    projectID: projectId,
  };
  if (instanceId && workId) {
    apiargs.getType = 9;
    apiargs.instanceId = instanceId;
    apiargs.workId = workId;
  }
  updateWorksheetRow(apiargs)
    .then(res => {
      if (res && res.data) {
        callback(null, res.data);
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
        } else {
          alert(_l('保存失败，请稍后重试'), 2);
        }
      }
    })
    .fail(err => {
      callback(err);
      alert(_l('保存失败，请稍后重试'), 2);
    });
}

export function updateRecordControl({ appId, viewId, worksheetId, recordId, cell, cells = [] }) {
  return new Promise((resolve, reject) => {
    if (_.isEmpty(cells) && cell) {
      cells = [cell];
    }
    updateWorksheetRow({
      appId,
      viewId,
      worksheetId: worksheetId,
      rowId: recordId,
      newOldControl: cells,
    }).then(data => {
      if (!data.data) {
        if (data.resultCode === 11) {
          alert(_l('编辑失败，%0不允许重复', cell.controlName || ''), 3);
        } else {
          alert(_l('编辑失败'), 3);
        }
        reject();
      } else {
        resolve(data.data);
      }
    });
  });
}

export function deleteRecord({ worksheetId, recordId, viewId, appId }) {
  return new Promise((resolve, reject) => {
    deleteWorksheetRows({
      worksheetId,
      rowIds: [recordId],
      viewId,
      appId,
    })
      .then(data => {
        if (data.isSuccess) {
          resolve();
        } else {
          reject();
        }
      })
      .fail(reject);
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
      getWorksheetBtns(_.assign({}, this.baseArgs, options))
        .then(data => {
          resolve(data);
        })
        .fail(err => {
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
    };
    if (instanceId && workId) {
      args.instanceId = instanceId;
      args.workId = workId;
    }
    updateRowRelationRows(args)
      .then(data => {
        if (data.isSuccess) {
          resolve();
        } else {
          reject();
        }
      })
      .fail(reject);
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
  } catch (err) { }
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
    updateWorksheetRow({
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
      .fail(reject);
  });
}

export function handleChangeOwner({ recordId, ownerAccountId, appId, projectId, target, changeOwner }) {
  $(target).quickSelectUser({
    sourceId: recordId,
    projectId: projectId,
    showQuickInvite: false,
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

export async function handleShare({ isCharge, appId, worksheetId, viewId, recordId }, callback) {
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
    alert(_l('分享失败'));
    console.log(err);
  }
}

export async function handleCreateTask({ appId, worksheetId, viewId, recordId }) {
  try {
    const row = await getRowDetail({ appId, worksheetId, viewId, rowId: recordId });
    let recordTitle = getTitleTextFromControls(row.formData);
    const source = appId + '|' + worksheetId + '|' + viewId + '|' + recordId;
    require(['createTask'], createTask => {
      createTask.index({
        TaskName: recordTitle || _l('未命名'),
        MemberArray: _.isEmpty(row.ownerAccount)
          ? []
          : [row.ownerAccount].filter(item => item.accountId.indexOf('a#') === -1),
        worksheetAndRowId: source,
        isFromPost: true,
        ProjectID: row.projectId,
      });
    });
  } catch (err) {
    alert(_l('创建任务失败'));
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
    return `${location.origin}${window.subPath || ''}/app/${appId}/${worksheetId}/${viewId}/row/${recordId}${appFeaturesPath ? '?' + appFeaturesPath : ''
      }`;
  } else {
    return `${location.origin}${window.subPath || ''}/app/${appId}/${worksheetId}/row/${recordId}${appFeaturesPath ? '?' + appFeaturesPath : ''
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
