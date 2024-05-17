import { PUSH_TYPE } from '../WorkflowSettings/enum';
import sheetAjax from 'src/api/worksheet';
import homeAppAjax from 'src/api/homeApp';
import addRecord from 'worksheet/common/newRecord/addRecord';
import { openRecordInfo } from 'worksheet/common/recordInfo';
import _ from 'lodash';
import { mdNotification } from 'ming-ui/functions';
import { emitter } from 'worksheet/util';
import CryptoJS from 'crypto-js';

const getWorksheetInfo = worksheetId => {
  return new Promise((resolve, reject) => {
    sheetAjax.getWorksheetInfo({ worksheetId }).then(result => {
      if (result.resultCode === 1) {
        resolve(result.appId);
      } else {
        resolve('');
      }
    });
  });
};

const getAppSimpleInfo = workSheetId => {
  return new Promise((resolve, reject) => {
    homeAppAjax.getAppSimpleInfo({ workSheetId }, { silent: true }).then(result => {
      resolve(result);
    });
  });
};

export default () => {
  if (!window.IM) return;

  md.global.Config.pushUniqueId = (+new Date()).toString();

  IM.socket.on('workflow_push', result => {
    const pushType = parseInt(Object.keys(result)[0]);
    const { pushUniqueId, content, promptType, duration, title, buttons = [] } = result[pushType];
    const actionFun = (data, pushType) => {
      const { appId: worksheetId, content, rowId, viewId, openMode } = data;

      if (pushType === PUSH_TYPE.ALERT) {
        alert({
          msg: content,
          type: promptType,
          timeout: duration * 1000,
        });
      }

      if (pushType === PUSH_TYPE.CREATE) {
        addRecord({
          worksheetId: worksheetId,
          onAdd: data => {
            alert(data ? _l('添加成功') : _l('添加失败'));
          },
        });
      }

      if (pushType === PUSH_TYPE.DETAIL) {
        getWorksheetInfo(worksheetId).then(appId => {
          if (appId) {
            if (openMode === 2) {
              window.open(`${window.subPath || ''}/app/${appId}/${worksheetId}/${viewId || 'undefined'}/row/${rowId}`);
            } else {
              // 已经打开记录的直接刷新
              if ($(`.recordInfoCon[data-record-id="${rowId}"][data-view-id="${viewId}"]`).length) {
                emitter.emit('RELOAD_RECORD_INFO', {
                  worksheetId,
                  recordId: rowId,
                  closeWhenNotViewData: true,
                });
              } else {
                openRecordInfo({
                  appId: appId,
                  worksheetId: worksheetId,
                  recordId: rowId,
                  viewId,
                });
              }
            }
          }
        });
      }

      if (_.includes([PUSH_TYPE.VIEW, PUSH_TYPE.PAGE], pushType)) {
        getAppSimpleInfo(worksheetId).then(({ appId, appSectionId }) => {
          if (appId && appSectionId) {
            const url = `${window.subPath || ''}/app/${appId}/${appSectionId}/${worksheetId}/${viewId}`;

            if (openMode === 1) {
              location.href = url;
            } else {
              window.open(url);
            }
          }
        });
      }

      if (pushType === PUSH_TYPE.LINK) {
        if (openMode === 1) {
          location.href = content;
        } else if (openMode === 2) {
          window.open(content);
        } else {
          const iTop = (window.screen.availHeight - 660) / 2; // 获得窗口的垂直位置;
          const iLeft = (window.screen.availWidth - 800) / 2; // 获得窗口的水平位置;
          const options =
            'width=800,height=600,toolbar=no,menubar=no,location=no,status=no,top=' + iTop + ',left=' + iLeft;

          window.open(content, '_blank', options);
        }
      }
    };

    if (pushUniqueId && pushUniqueId !== md.global.Config.pushUniqueId) {
      return;
    }

    if (pushType === PUSH_TYPE.NOTIFICATION) {
      const functionName = { 1: 'success', 2: 'error', 3: 'warning', 4: 'info' };

      mdNotification[functionName[promptType]]({
        key: CryptoJS.SHA1(JSON.stringify(result[pushType])).toString(),
        title,
        description: content,
        duration: duration || null,
        btnList: buttons.map(item => {
          return {
            text: item.name,
            onClick: () => {
              actionFun(item, item.pushType);
            },
          };
        }),
      });
    } else {
      actionFun(result[pushType], pushType);
    }
  });
};
