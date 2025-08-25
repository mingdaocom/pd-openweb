import { get, pick } from 'lodash';
import _ from 'lodash';
import codeAjax from 'src/api/code';
import { WIDGETS_TO_API_TYPE_ENUM } from '../../../config/widget';
import { Date, MultipleSelect, Number, RelateRecord, SingleSelect, Text, Time } from './examples';

export const getEnvControls = (reference, allControls) => {
  return reference
    .map(i => _.find(allControls, a => a.controlId === i.cid))
    .filter(Boolean)
    .map(c => JSON.stringify(pick(c, ['controlName', 'controlId', 'type'])))
    .join('\n');
};

function getControlTypeName(control) {
  return (
    {
      2: _l('文本框'),
      9: _l('单选'),
      10: _l('多选'),
      11: _l('多选'),
      6: _l('数值'),
      15: _l('日期'),
      16: _l('日期'),
      46: _l('时间'),
      29: _l('关联记录'),
    }[control.type] + _l('字段')
  );
}

export const generatePrompt = (systemPrompt, { envControls, isRefValue, control }) => {
  const needReplace = [
    isRefValue ? _l('引用类型') : _l('存储类型'),
    getControlTypeName(control) + ' ' + JSON.stringify(pick(control, ['controlName', 'controlId', 'type'])),
    envControls,
  ];
  return systemPrompt.replace(/\{\d\}/g, match => {
    return needReplace[match.slice(1, -1)];
  });
};

export const generateParamsForPrompt = ({ envControls, isRefValue, control } = {}) => {
  const defaultCode = getDefaultCompCode(control);
  let defaultControlDataFormat = getValueHandleDemo(control);
  const defaultExample = `<example>
  <input>实现一个选项类型字段的案例，保证正常接受数据，更新数据</input>
  <response>
  \`\`\`mdy.free_field
  ${defaultCode}
  \`\`\`
  </response>
</example>`;
  if (!get(md, 'global.Account.lang', '').toLowerCase() !== 'zh-hans') {
    defaultControlDataFormat += `
<response_lang>
# RULES
please return as language ${get(md, 'global.Account.lang')}
</response_lang>
`;
  }
  return [
    defaultExample,
    isRefValue ? _l('引用类型') : _l('存储类型'),
    getControlTypeName(control) + ' ' + JSON.stringify(pick(control, ['controlName', 'controlId', 'type'])),
    envControls,
    defaultControlDataFormat,
  ];
};

export const getFormData = (controls, record = {}) => {
  return controls.map(control => ({
    ...control,
    value: record[control.controlId],
  }));
};

export const getKeyValueFormData = formData => {
  return formData.reduce((acc, item) => {
    acc[item.controlId] = pick(item, ['controlId', 'controlName', 'value', 'options']);
    return acc;
  }, {});
};

export const getEnv = (reference, { isDisabled = false, isMobile = false } = {}) => {
  const result = {};
  reference.forEach(i => {
    if (i.name) {
      result[i.name] = i.cid;
    }
  });
  return {
    ...result,
    isDisabled,
    isMobile,
  };
};

export function getMessageList({ worksheetId, messageStoreId } = {}) {
  return codeAjax.getGenerateCodeRecord({
    isCustomField: true,
    workflowId: worksheetId,
    nodeId: messageStoreId,
  });
}

export function saveMessageList({ worksheetId, messageList, messageStoreId } = {}) {
  return codeAjax
    .saveGenerateCodeRecord({
      workflowId: worksheetId,
      nodeId: messageStoreId,
      messageList,
    })
    .catch(e => {
      console.error(e);
    });
}

export function getDefaultCompCode(control) {
  switch (control.type) {
    case WIDGETS_TO_API_TYPE_ENUM.TEXT:
      return Text;
    case WIDGETS_TO_API_TYPE_ENUM.DATE:
      return Date;
    case WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU:
      return SingleSelect;
    case WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT:
      return MultipleSelect;
    case WIDGETS_TO_API_TYPE_ENUM.NUMBER:
      return Number;
    case WIDGETS_TO_API_TYPE_ENUM.TIME:
      return Time;
    case WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET:
      return RelateRecord;
    default:
      return '';
  }
}

export function getValueHandleDemo(control) {
  switch (control.type) {
    case WIDGETS_TO_API_TYPE_ENUM.TEXT:
      return `
        文本字段：
        value: 'value to show'
        onChange: 'value to update'
      `;
    case WIDGETS_TO_API_TYPE_ENUM.DATE:
      return `
        日期字段：
        value: '2022-08-12'
        onChange: '2022-08-12'
      `;
    case WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU:
      return `
        单选字段：//！单选更新的永远是单个值或空
        value: '["6e060e21-0fa6-47f3-bfea-7e7646caa30b"]'
        onChange: '["6e060e21-0fa6-47f3-bfea-7e7646caa30b"]'
      `;
    case WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT:
      return `
        多选字段：
        value: '["6e060e21-0fa6-47f3-bfea-7e7646caa30b","6e060e21-0fa6-47f3-bfea-7e7646caa20b"]'
        onChange: '["6e060e21-0fa6-47f3-bfea-7e7646caa30b","6e060e21-0fa6-47f3-bfea-7e7646caa20b"]'
      `;
    case WIDGETS_TO_API_TYPE_ENUM.NUMBER:
      return `
        数值字段：
        value: '123'
        onChange: '123'
      `;
    case WIDGETS_TO_API_TYPE_ENUM.TIME:
      return `
        时间字段：
        value: '12:30'
        onChange: '12:30'
      `;
    case WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET:
      return `
        关联记录字段：
        value: '[{"sid":"6e060e21-0fa6-47f3-bfea-7e7646caa30b","name":"记录1"}]'
        onChange: '[{"sid":"6e060e21-0fa6-47f3-bfea-7e7646caa30b"}]'
      `;
    default:
      return '';
  }
}

export function getDefaultPrompt(control) {
  switch (control.type) {
    case WIDGETS_TO_API_TYPE_ENUM.TEXT:
      return {
        title: _l('生成一个颜色选择器'),
        content: _l(
          `生成一个 颜色选择器，用户选择颜色后将颜色以"#XXXXXX"的格式保存，加载时如果字段有值，将颜色回显到颜色选择器，当组件参数 env 中的 isDisabled 为 true 时，禁用颜色选择器。`,
        ),
      };
    case WIDGETS_TO_API_TYPE_ENUM.NUMBER:
      return {
        title: _l('生成一个随机数发生器'),
        content: _l(
          `生成一个随机数发生器，包含一个数值输入框和一个按钮，点击按钮后，数值输入框内以100ms 的速度变化显示不同的1~100内的随机数，并最终缓慢停下。数字停止变化后，将最终的数值保存。如果载入时有值，将值回显到数值输入框内。当组件参数 env 中的 isDisabled 为 true 时，禁用数值输入框，并隐藏按钮。`,
        ),
      };
    case WIDGETS_TO_API_TYPE_ENUM.DATE:
      return {
        title: _l('生成一个胶囊日期选择器'),
        content: _l(
          `生成一个从本周周一开始的7天的日期选择器，日期以胶囊的形式展示，用户选中日期后保存。如果载入时有值，则显示为值所在的那一周的7天，并默认选中值。当组件参数 env 中的 isDisabled 为 true 时，禁用日期选择器。`,
        ),
      };
    case WIDGETS_TO_API_TYPE_ENUM.TIME:
      return {
        title: _l('生成一个电子时钟'),
        content: `生成一个现代科技风格的电子时钟，展示小时和分钟，用户可以分别设置小时与分钟，修改其中任意一个时，都将时间以"00:00"的格式保存。如果载入时有值，将值回显到时钟上显示。当组件参数 env 中的 isDisabled 为 true 时，禁止设置时钟，只能展示时间。`,
      };
    case WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU:
      return {
        title: _l('生成一个仓库选择器'),
        content: _l(
          `生成一个仓库的平面示意图，在平面图上从左至右排列可以点击选择的仓库，每个仓库的左上角有一个小的出入口。仓库的数据来自本字段 options 数组下的内容，value 是名称，color 是它的颜色。用户只能点击选择一个仓库，选中后以 JSON 数组格式字符串保存选中的仓库的 key值。如果载入时有值，将值回显到仓库上显示。当组件参数 env 中的 isDisabled 为 true 时，禁止选择仓库，只能查看。`,
        ),
      };
    case WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT:
      return {
        title: _l('生成一个仓库选择器'),
        content: _l(
          `生成一个仓库的平面示意图，在平面图上从左至右排列可以点击选择的仓库，每个仓库的左上角有一个小的出入口。仓库的数据来自本字段 options 数组下的内容，value 是名称，color 是它的颜色。用户可以点击选中多个仓库，选中后以 JSON 数组格式字符串保存选中的仓库的 key值。如果载入时有值，将值回显到仓库上显示。当组件参数 env 中的 isDisabled 为 true 时，禁止选择仓库，只能查看。`,
        ),
      };
    default:
      return {
        title: _l('生成一个组件，实时显示当前时间'),
        content: _l(`生成一个组件，实时显示当前时间`),
      };
  }
}
