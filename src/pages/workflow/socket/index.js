import CryptoJS from 'crypto-js';
import _ from 'lodash';
import { mdNotification } from 'ming-ui/functions';
import homeAppAjax from 'src/api/homeApp';
import sheetAjax from 'src/api/worksheet';
import addRecord from 'worksheet/common/newRecord/addRecord';
import { openRecordInfo } from 'worksheet/common/recordInfo';
import { VOICE_FILE_LIST } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config';
import { emitter } from 'src/utils/common';
import { equalToLocalPushUniqueId } from 'src/utils/common';
import { PUSH_TYPE } from '../WorkflowSettings/enum';

const getWorksheetInfo = worksheetId => {
  return new Promise((resolve, reject) => {
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
  return new Promise((resolve, reject) => {
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
      if (window.audioQueue.length > 0) {
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
          timeout: duration * 1000,
        });
      }

      if (pushType === PUSH_TYPE.CREATE) {
        if (code === 20037) {
          alert(_l('草稿数量已经达到10条'), 2);
          return;
        }

        if (rowId) {
          getWorksheetInfo(worksheetId).then(data => {
            openRecordInfo({
              worksheetId: worksheetId,
              recordId: rowId,
              from: 21,
              worksheetInfo: data,
              allowAdd: data.allowAdd,
            });
          });
        } else {
          addRecord({
            worksheetId: worksheetId,
            onAdd: data => {
              alert(data ? _l('添加成功') : _l('添加失败'));
            },
          });
        }
      }

      if (pushType === PUSH_TYPE.DETAIL) {
        getWorksheetInfo(worksheetId).then(({ appId }) => {
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

      if (pushType === PUSH_TYPE.AUDIO) {
        const { content, file, language, pitch, preset, speed, type } = promptSound;

        if (type === 1) {
          if (file) {
            playAudio(_.get(safeParse(file), '[0].viewUrl'));
          } else {
            const filePath = [{ fileKey: '', filePath: require('/staticfiles/images/session_new_message.mp3') }]
              .concat(VOICE_FILE_LIST)
              .find(o => o.fileKey === preset).filePath;

            playAudio(filePath);
          }
        } else {
          const utterance = new SpeechSynthesisUtterance(content);

          utterance.lang = language; // 设置为中文
          utterance.pitch = parseInt(pitch); // 音调
          utterance.rate = parseInt(speed); // 语速
          utterance.volume = 1; // 音量

          // 播放语音
          window.speechSynthesis.speak(utterance);
        }
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
};
