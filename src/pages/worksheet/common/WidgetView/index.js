import loadScript from 'load-script';
import { omitBy } from 'lodash';

window.onload = () => {
  window.addEventListener('message', e => {
    const { from, action, key, value } = e.data || {};
    if (from !== 'widget-container') return;
    if (action === 'set-window') {
      window[key] = value;
    } else if (action === 'load-widget') {
      loadScript(value, err => {
        if (err) {
          window.parent.postMessage(
            {
              from: 'customwidget',
              action: 'load-url-error',
            },
            '*',
          );
        }
      });
    } else if (action === 'reload') {
      location.reload();
    }
  });
  window.parent.postMessage(
    {
      from: 'customwidget',
      action: 'begin-load-widget',
    },
    '*',
  );
  window.addEventListener('click', () => {
    window.parent.postMessage({
      from: 'customwidget',
      action: 'document-click-event',
    });
  });
};

window.callMd = (action, functionName, args) => {
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();
    channel.port2.onmessage = ({ data }) => {
      channel.port1.close();
      if (data.error) {
        reject(data.error);
      } else {
        resolve(data.result);
      }
    };
    window.parent.postMessage({ from: 'customwidget', action, functionName, args }, '*', [channel.port1]);
  });
};

window.callMdApi = (...args) => window.callMd('call-md-api', ...args);
window.callMdUtil = (...args) => window.callMd('call-md-util', ...args);

window.api = {};
window.utils = {};

[
  'getFilterRowsTotalNum',
  'getFilterRows',
  'getRowRelationRows',
  'getRowDetail',
  'addWorksheetRow',
  'deleteWorksheetRow',
  'updateWorksheetRow',
  'getWorksheetInfo',
].forEach(functionName => {
  window.api[functionName] = args => window.callMdApi(functionName, args);
});

window.api.call = (controller, action, data) => {
  return window.callMd('call-main-web', [controller, action].join('/'), { controller, action, data });
};

[
  'selectUsers',
  'openNewRecord',
  'selectRecord',
  'openRecordInfo',
  'selectDepartments',
  'selectOrgRole',
  'selectLocation',
  'renderText',
].forEach(functionName => {
  window.utils[functionName] = args =>
    window.callMdUtil(
      functionName,
      omitBy(args, (value, key) => typeof value === 'function'),
    );
});
