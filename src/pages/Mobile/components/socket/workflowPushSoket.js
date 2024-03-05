import { PUSH_TYPE } from 'src/pages/workflow/WorkflowSettings/enum';
import homeAppAjax from 'src/api/homeApp';
import modalMessage from './modalMessage';

const getAppSimpleInfo = workSheetId => {
  return homeAppAjax.getAppSimpleInfo({ workSheetId }, { silent: true });
};

export default props => {
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
        getAppSimpleInfo(worksheetId).then(({ appId }) => {
          location.href = `${window.subPath || ''}/mobile/addRecord/${appId}/${worksheetId}/${
            viewId ? viewId : (_.get(props, 'viewId') || '')
          }`;
        });
      }
      if (pushType === PUSH_TYPE.DETAIL) {
        getAppSimpleInfo(worksheetId).then(({ appId }) => {
          if (viewId) {
            location.href = `${window.subPath || ''}/mobile/record/${appId}/${worksheetId}${
              viewId ? `/${viewId}` : ''
            }/${rowId}`;
          }
        });
      }
      if (pushType === PUSH_TYPE.VIEW) {
        getAppSimpleInfo(worksheetId).then(({ appId, appSectionId }) => {
          location.href = `${window.subPath || ''}/mobile/recordList/${appId}/${appSectionId}/${worksheetId}/${viewId}`;
        });
      }
      if (pushType === PUSH_TYPE.PAGE) {
        getAppSimpleInfo(worksheetId).then(({ appId, appSectionId }) => {
          location.href = `${window.subPath || ''}/mobile/customPage/${appId}/${appSectionId}/${worksheetId}`;
        });
      }
      if (pushType === PUSH_TYPE.LINK) {
        location.href = content;
      }
    };

    if (pushUniqueId && pushUniqueId !== md.global.Config.pushUniqueId) {
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
