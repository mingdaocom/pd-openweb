import React from 'react';
import ReactDOM from 'react-dom';
import CustomWidget from './containers/customWidget';
import config from './config';
// 取得id和version
window.location.search
  .slice(1)
  .split('&')
  .forEach(item => {
    config.global[item.split('=')[0]] = item.split('=')[1];
  });
if (!config.global.sourceName || !config.global.sourceType) {
  alert(_l('信息数据有误'), 2);
  setTimeout(() => {
    window.location.href = '/apps/task/center';
  }, 3000);
}
config.global.sourceName = decodeURIComponent(config.global.sourceName);
if (config.global.projectId) {
  config.uniqueParam.companyId = config.global.projectId;
}
if (config.global.update) {
  config.uniqueParam.update = config.global.update === 'true';
}

let title;

// 文案
if (config.global.sourceType === config.ENVIRONMENT.TASK) {
  config.isTask = true;
  config.txt = {
    txt_1: _l('项目'),
    txt_2: _l('任务预览'),
  };
  title = _l('自定义任务内容') + ' - ' + config.global.sourceName;
} else if (config.global.sourceType === config.ENVIRONMENT.OA) {
  config.isOA = true;
  config.txt = {
    txt_1: _l('审批单'),
    txt_2: _l('表单编辑区'),
  };
  title = _l('表单编辑') + ' - ' + config.global.sourceName;
} else if (config.global.sourceType === config.ENVIRONMENT.WORKSHEET) {
  config.isWorkSheet = true;
  config.txt = {
    txt_1: _l('工作表'),
    txt_2: _l('字段配置'),
  };
  title = _l('编辑表单') + ' - ' + config.global.sourceName;
}

ReactDOM.render(<CustomWidget />, document.getElementById('app'), () => {
  setTimeout(() => {
    document.title = title;
  }, 1000);
});

/**
 *                 - settingsBox - settingsModels
 *                |- editBox - editItem
 * customWidget --|
 *                |- widgetBox - widgetList - widgetListItem
 *                 - filterSettings
 * 操作提示信息，delete提示在widgetCustom，修改提示在settingsBox
 */
