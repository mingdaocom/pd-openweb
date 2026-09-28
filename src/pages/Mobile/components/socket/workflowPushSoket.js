import _ from 'lodash';
import homeAppAjax from 'src/api/homeApp';
import { playPromptSound } from 'src/pages/workflow/socket/promptSound';
import { PUSH_TYPE } from 'src/pages/workflow/WorkflowSettings/enum';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import { equalToLocalPushUniqueId } from 'src/utils/platform/storage/local';
import { compatibleMDJS } from 'src/utils/services/project';
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
    compatibleMDJS('workflowPushMessage', { message: result }, () => {
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
        const { appId: worksheetId, content, rowId, viewId, code } = data;

        if (pushType === PUSH_TYPE.ALERT) {
          alert({
            msg: content,
            type: promptType,
            duration: duration * 1000,
            isPcAlert: true,
          });
        }

        if (_.includes([PUSH_TYPE.CREATE, PUSH_TYPE.DETAIL, PUSH_TYPE.VIEW, PUSH_TYPE.PAGE], pushType)) {
          getAppSimpleInfo(worksheetId).then(({ appId, appSectionId }) => {
            if (!(pushType === PUSH_TYPE.CREATE && code === 20037)) {
              const currentUrl = location.origin + location.pathname;
              history.replaceState({}, '', currentUrl);
            }

            if (pushType === PUSH_TYPE.CREATE) {
              if (code === 20037) {
                alert(_l('草稿数量已经达到10条'), 2);
                return;
              }

              location.href = pathCompletion(
                rowId
                  ? `/mobile/record/${appId}/${worksheetId}${viewId ? `/${viewId}` : ''}/${rowId}/21`
                  : `/mobile/addRecord/${appId}/${worksheetId}/${viewId ? viewId : ''}`,
              );
            } else if (pushType === PUSH_TYPE.DETAIL) {
              location.href = pathCompletion(
                `/mobile/record/${appId}/${worksheetId}${viewId ? `/${viewId}` : ''}/${rowId}`,
              );
            } else if (pushType === PUSH_TYPE.VIEW) {
              location.href = pathCompletion(`/mobile/recordList/${appId}/${appSectionId}/${worksheetId}/${viewId}`);
            } else if (pushType === PUSH_TYPE.PAGE) {
              location.href = pathCompletion(`/mobile/customPage/${appId}/${appSectionId}/${worksheetId}`);
            }
          });
        }

        if (pushType === PUSH_TYPE.LINK) {
          location.href = content;
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
  });
};
