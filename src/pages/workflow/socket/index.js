import CryptoJS from 'crypto-js';
import _ from 'lodash';
import { mdNotification } from 'ming-ui/functions';
import homeAppAjax from 'src/api/homeApp';
import sheetAjax from 'src/api/worksheet';
import { openGlobalAddRecord } from 'worksheet/common/newRecord/addRecord';
import { openGlobalRecordInfo } from 'worksheet/common/recordInfo';
import { emitter } from 'src/utils/platform/browser/dom';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import { equalToLocalPushUniqueId } from 'src/utils/platform/storage/local';
import { PUSH_TYPE } from '../WorkflowSettings/enum';
import { playPromptSound } from './promptSound';

export const getCenteredPopupOptions = (windowSize = {}, targetWindow = window) => {
  const popupWidth = Number(windowSize.width) || 800;
  const popupHeight = Number(windowSize.height) || 600;
  const screenX = Number.isFinite(targetWindow.screenX) ? targetWindow.screenX : targetWindow.screenLeft || 0;
  const screenY = Number.isFinite(targetWindow.screenY) ? targetWindow.screenY : targetWindow.screenTop || 0;
  const currentScreen = targetWindow.screen || {};
  const hasScreenBounds = [
    currentScreen.availLeft,
    currentScreen.availTop,
    currentScreen.availWidth,
    currentScreen.availHeight,
  ].every(Number.isFinite);
  const containerLeft = hasScreenBounds ? currentScreen.availLeft : screenX;
  const containerTop = hasScreenBounds ? currentScreen.availTop : screenY;
  const containerWidth = hasScreenBounds
    ? currentScreen.availWidth
    : targetWindow.outerWidth || targetWindow.innerWidth || popupWidth;
  const containerHeight = hasScreenBounds
    ? currentScreen.availHeight
    : targetWindow.outerHeight || targetWindow.innerHeight || popupHeight;
  const left = Math.round(containerLeft + (containerWidth - popupWidth) / 2);
  const top = Math.round(containerTop + (containerHeight - popupHeight) / 2);

  return `width=${popupWidth},height=${popupHeight},toolbar=no,menubar=no,location=no,status=no,top=${top},left=${left}`;
};

const getWorksheetInfo = worksheetId => {
  return new Promise(resolve => {
    sheetAjax.getWorksheetInfo({ worksheetId }).then(result => {
      if (result.resultCode === 1) {
        resolve(result);
      } else {
        resolve('');
      }
    });
  });
};

const getAppSimpleInfo = workSheetId => {
  return new Promise(resolve => {
    homeAppAjax.getAppSimpleInfo({ workSheetId }, { silent: true }).then(result => {
      resolve(result);
    });
  });
};

const playAudio = audioSrc => {
  // 创建音频对象，如果尚未创建
  if (!window.workflowAudioPlayer) {
    const audio = document.createElement('audio');
    window.workflowAudioPlayer = audio;

    // 监听音频播放结束事件
    window.workflowAudioPlayer.addEventListener('ended', () => {
      // 播放下一个音频
      if (window.audioQueue?.length > 0) {
        const nextAudio = window.audioQueue.shift();

        window.workflowAudioPlayer.src = nextAudio;
        window.workflowAudioPlayer.play();
      }
    });
  }

  // 如果没有正在播放，就直接播放
  if (!window.workflowAudioPlayer.src || window.workflowAudioPlayer.paused) {
    window.workflowAudioPlayer.src = audioSrc;
    window.workflowAudioPlayer.play();
  } else {
    // 正在播放，则将新的音频源添加到队列
    if (!window.audioQueue) {
      window.audioQueue = []; // 初始化队列
    }

    window.audioQueue.push(audioSrc); // 将新音频加入队列
  }
};

export default () => {
  if (!window.IM) return;

  md.global.Config.pushUniqueId = (+new Date()).toString();

  IM.socket.on('workflow_push', result => {
    const pushType = parseInt(Object.keys(result)[0]);
    const {
      pushUniqueId,
      content,
      promptType,
      duration,
      title,
      buttons = [],
      promptSound,
      accountId,
    } = result[pushType];

    const actionFun = (data, pushType) => {
      const { appId: worksheetId, content, rowId, viewId, openMode, code } = data;

      if (pushType === PUSH_TYPE.ALERT) {
        alert({
          msg: content,
          type: promptType,
          duration: duration * 1000,
        });
      }

      if (pushType === PUSH_TYPE.CREATE) {
        if (code === 20037) {
          alert(_l('草稿数量已经达到10条'), 2);
          return;
        }

        if (rowId) {
          getWorksheetInfo(worksheetId).then(data => {
            openGlobalRecordInfo({
              worksheetId: worksheetId,
              recordId: rowId,
              from: 21,
              worksheetInfo: data,
              allowAdd: data.allowAdd,
              // 草稿点击“提交”转为正式记录后，将记录加为当前表的最新记录
              addNewRecord: record => {
                emitter.emit('ADD_RECORD_TO_SHEETVIEW', { worksheetId, record });
              },
            });
          });
        } else {
          openGlobalAddRecord({
            worksheetId: worksheetId,
            onAdd: data => {
              alert(data ? _l('添加成功') : _l('添加失败'));
              if (data) {
                emitter.emit('ADD_RECORD_TO_SHEETVIEW', { worksheetId, record: data });
              }
            },
          });
        }
      }

      if (pushType === PUSH_TYPE.DETAIL) {
        getWorksheetInfo(worksheetId).then(({ appId }) => {
          if (appId) {
            if (openMode === 2) {
              window.open(pathCompletion(`/app/${appId}/${worksheetId}/${viewId || 'undefined'}/row/${rowId}`));
            } else {
              // 已经打开记录的直接刷新
              if ($(`.recordInfoCon[data-record-id="${rowId}"][data-view-id="${viewId}"]`).length) {
                emitter.emit('RELOAD_RECORD_INFO', {
                  worksheetId,
                  recordId: rowId,
                  closeWhenNotViewData: true,
                });
              } else {
                openGlobalRecordInfo({
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
            const url = pathCompletion(`/app/${appId}/${appSectionId}/${worksheetId}/${viewId}`);

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
          window.open(content, '_blank', getCenteredPopupOptions(data.windowSize));
        }
      }

      if (pushType === PUSH_TYPE.AUDIO) {
        playPromptSound(promptSound, playAudio);
      }
    };

    if (
      !equalToLocalPushUniqueId(pushUniqueId) &&
      !(window.isNewTab() && (pushType === PUSH_TYPE.AUDIO || accountId))
    ) {
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
  IM.socket.on('workflow_chatbot', result => {
    const { chatbotId, conversationId, title } = result;
    emitter.emit('CHATBOT_SOCKET_UPDATE_CONVERSATION', { chatbotId, conversationId, title });
  });
};
