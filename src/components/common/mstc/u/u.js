import _ from 'lodash';
import KcController from 'src/api/kc';
let canUpload = undefined;
let timer = null;

export default function (callback) {
  if (!window.uploadAssistantWindow || window.uploadAssistantWindow.closed) {
    var url = '/apps/kcupload';
    var name = 'uploadAssistant';
    var iTop = (window.screen.availHeight - 660) / 2; // 获得窗口的垂直位置;
    var iLeft = (window.screen.availWidth - 930) / 2; // 获得窗口的水平位置;
    var options = 'width=930,height=598,toolbar=no,menubar=no,location=no,status=no,top=' + iTop + ',left=' + iLeft;
    window.uploadAssistantWindow = window.open(url, name, options);
    timer = setInterval(function () {
      if (!window.uploadAssistantWindow || window.uploadAssistantWindow.closed) {
        clearInterval(timer);
        if (_.isFunction(callback)) {
          callback();
        }
      }
    }, 1000);
  } else {
    window.uploadAssistantWindow.focus();
  }
  if (!canUpload) {
    KcController.getUsage({}).then(function (data) {
      canUpload = data.used < data.total;
      if (!canUpload && window.uploadAssistantWindow) {
        window.uploadAssistantWindow.close();
        delete window.uploadAssistantWindow;
        alert(_l('已达到本月上传流量上限', 3));
      }
    });
  }
};
