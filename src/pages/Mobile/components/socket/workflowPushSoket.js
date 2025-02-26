import { PUSH_TYPE } from 'src/pages/workflow/WorkflowSettings/enum';
import homeAppAjax from 'src/api/homeApp';
import { equalToLocalPushUniqueId } from 'worksheet/util';
import modalMessage from './modalMessage';

const getAppSimpleInfo = workSheetId => {
  return homeAppAjax.getAppSimpleInfo({ workSheetId }, { silent: true });
};

const playAudio = audioSrc => {
  if (!window.workflowAudioPlayer) {
    const audio = document.createElement('audio');
    window.workflowAudioPlayer = audio;
  }
  window.workflowAudioPlayer.src = audioSrc;
  window.workflowAudioPlayer.play();
};

export default () => {
  if (!window.IM) return;

  md.global.Config.pushUniqueId = (+new Date()).toString();

  IM.socket.on('workflow_push', result => {
    if (window.isMingDaoApp && window.MDJS && window.MDJS.workflowPushMessage) {
      window.MDJS.workflowPushMessage({
        message: result,
      });
      return;
    }
    const pushType = parseInt(Object.keys(result)[0]);
    const { pushUniqueId, content, promptType, duration, title, buttons = [], promptSound } = result[pushType];
    const actionFun = (data, pushType) => {
      const { appId: worksheetId, content, rowId, viewId, code } = data;

      if (pushType === PUSH_TYPE.ALERT) {
        alert({
          msg: content,
          type: promptType,
          timeout: duration * 1000,
        });
      }

      if (_.includes([PUSH_TYPE.CREATE, PUSH_TYPE.DETAIL, PUSH_TYPE.VIEW, PUSH_TYPE.PAGE], pushType)) {
        getAppSimpleInfo(worksheetId).then(({ appId, appSectionId }) => {
          const subPath = window.subPath || '';

          if (pushType === PUSH_TYPE.CREATE) {
            if (code === 20037) {
              alert(_l('草稿数量已经达到10条'), 2);
              return;
            }

            location.href = rowId
              ? `${subPath}/mobile/record/${appId}/${worksheetId}${viewId ? `/${viewId}` : ''}/${rowId}/21`
              : `${subPath}/mobile/addRecord/${appId}/${worksheetId}/${viewId ? viewId : ''}`;
          } else if (pushType === PUSH_TYPE.DETAIL) {
            location.href = `${subPath}/mobile/record/${appId}/${worksheetId}${viewId ? `/${viewId}` : ''}/${rowId}`;
          } else if (pushType === PUSH_TYPE.VIEW) {
            location.href = `${subPath}/mobile/recordList/${appId}/${appSectionId}/${worksheetId}/${viewId}`;
          } else if (pushType === PUSH_TYPE.PAGE) {
            location.href = `${subPath}/mobile/customPage/${appId}/${appSectionId}/${worksheetId}`;
          }
        });
      }

      if (pushType === PUSH_TYPE.LINK) {
        location.href = content;
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

    if (!equalToLocalPushUniqueId(pushUniqueId) && !(window.isNewTab() && pushType === PUSH_TYPE.AUDIO)) {
      return;
    }

    if (pushType === PUSH_TYPE.NOTIFICATION) {
      const functionName = { 1: 'success', 2: 'error', 3: 'warning', 4: 'info' };
      modalMessage({
        title,
        type: functionName[promptType],
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
