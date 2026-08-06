import localforage from 'localforage';
import { find, get, includes, isArray, isEmpty } from 'lodash';
import agentApi from 'src/api/agent';
import mingoAjax from 'src/api/mingo';
import { ALL_SYS } from 'src/pages/widgetConfig/config/widget';
import { getWidgetTypeName } from 'src/utils/app';
import { getMimeTypeByExt } from 'src/utils/common';
import { FAST_GPT_CONFIG } from 'src/utils/enum';

// 流式错误事件 → { errorMsg, sourceData }：优先取后端真实错误信息（兼容 ErrorMessage / errorMessage 大小写，
// 与新版 Agent 的归一逻辑一致），取不到再退回「模型调用失败」。
// error 为 useChat 透传的 message（旧 OpenAI 风格错误信息在 .message），eventData 为原始错误事件文本。
export function resolveStreamError(error, eventData) {
  const data = safeParse(eventData, 'object') || {};

  return {
    errorMsg: data.ErrorMessage || data.errorMessage || error || _l('模型调用失败'),
    sourceData: eventData,
  };
}

// 终止 agent 流时显式调取消接口：仅 abort 本地 SSE 不会停掉服务端 run，会继续跑、浪费信用点。
// 与新版 Agent 的 cancelAgentRun 一致，按 accountId|sessionId 取消活跃执行；无活跃 run 静默忽略。
export function cancelStream(sessionId) {
  if (!sessionId) return Promise.resolve();

  return agentApi.agentCancel({ sessionId }, { silent: true }).catch(() => {});
}

export async function insertChatHistory(chatId, title) {
  if (!chatId || !title) {
    return;
  }

  const newHistory = { chatId, title, updateTime: new Date().getTime() };
  const notLogin = !md?.global?.Account?.accountId;

  if (notLogin) {
    const histories = await localforage.getItem('mingo-chat-histories');
    const newHistories = [...(histories || []), newHistory];
    await localforage.setItem('mingo-chat-histories', newHistories);
    return newHistories;
  }

  newHistory.updateTime = new Date(newHistory.updateTime).toISOString();
  return mingoAjax.saveRecord(newHistory);
}

export async function updateChatTitle(chatId, title) {
  if (!chatId || !title) {
    return;
  }

  const notLogin = !md?.global?.Account?.accountId;

  if (notLogin) {
    const histories = await localforage.getItem('mingo-chat-histories');
    const newHistories = (histories || []).map(item => (item.chatId === chatId ? { ...item, title } : item));
    await localforage.setItem('mingo-chat-histories', newHistories);
    return newHistories;
  }

  return mingoAjax.saveRecord({
    chatId,
    title,
  });
}

export async function deleteChat(chatId) {
  if (!chatId) {
    return;
  }

  const notLogin = !md?.global?.Account?.accountId;

  if (notLogin) {
    const histories = await localforage.getItem('mingo-chat-histories');
    const newHistories = (histories || []).filter(item => item.chatId !== chatId);
    await localforage.setItem('mingo-chat-histories', newHistories);
    return newHistories;
  }

  return mingoAjax.deleteRecord({
    chatId,
  });
}

export async function updateChatHistory(chatId, { title, updateTime } = {}) {
  if (!chatId) {
    return;
  }

  const newHistory = { chatId, title, updateTime: new Date(updateTime).getTime() };
  const notLogin = !md?.global?.Account?.accountId;

  if (notLogin) {
    const histories = await localforage.getItem('mingo-chat-histories');
    const newHistories = (histories || []).map(item => (item.chatId === chatId ? newHistory : item));
    await localforage.setItem('mingo-chat-histories', newHistories);
    return newHistories;
  }

  newHistory.updateTime = new Date(newHistory.updateTime).toISOString();
  return mingoAjax.saveRecord(newHistory);
}

export async function getChatHistories() {
  const notLogin = !md?.global?.Account?.accountId;

  if (notLogin) {
    const histories = await localforage.getItem('mingo-chat-histories');
    return (histories || []).sort((a, b) => b.updateTime - a.updateTime);
  }

  return mingoAjax.getHistoryRecord({
    pageIndex: 1,
    pageSize: 500,
  });
}

export async function loadChat(chatId, { signal, offset = 0, pageSize = 30 } = {}) {
  const { apiKey, appId, baseUrl } = FAST_GPT_CONFIG;
  const res = await fetch(`${baseUrl}/core/chat/getPaginationRecords`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      appId,
      chatId,
      offset,
      pageSize,
    }),
    signal,
  });
  const result = await res.json();
  return {
    ...result,
    data: {
      ...result.data,
      list: get(result, 'data.list', []).filter(
        item =>
          !(
            item.value &&
            item.value.length === 1 &&
            item.value[0].type === 'text' &&
            item.value[0].text.content.trim() === ''
          ),
      ),
    },
  };
}

export async function getRecommendMessage(chatId) {
  const { apiKey, appId, baseUrl } = FAST_GPT_CONFIG;
  const res = await fetch(`${baseUrl}/core/ai/agent/v2/createQuestionGuide`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      appId,
      chatId,
      questionGuide: {
        open: true,
        model: 'GPT-4o-mini',
        customPrompt: `作为 AI 助手，需根据对话历史生成 3 个关于 HAP 使用的问题，引导对话延续：
要求：
1.与用户最后提问语言一致。
2.每题≤20 字。
4.为 HAP 使用相关话题的合理延伸，符合用户可能感兴趣的领域。
5.保持于现有对话的语气风格一致，选项多样。
6.若偏离主题，需引导回 HAP 使用。
7.返回的问题要自然，回答具体问题就好不用强行在问题里加入 HAP 字样。
8.返回语言使用 ${md.global.Account.lang}
`,
      },
    }),
  }).then(res => res.json());
  return res?.data;
}

export function deleteMessage(chatId, messageId) {
  const { apiKey, appId, baseUrl } = FAST_GPT_CONFIG;
  return fetch(`${baseUrl}/core/chat/item/delete?appId=${appId}&chatId=${chatId}&contentId=${messageId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
  });
}

export function deleteChatHistory(chatId) {
  const { apiKey, appId, baseUrl } = FAST_GPT_CONFIG;
  return fetch(`${baseUrl}/core/chat/delHistory?chatId=${chatId}&appId=${appId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
  });
}

export function batchDeleteMessage(chatId, messageIds = []) {
  return Promise.all(messageIds.map(messageId => deleteMessage(chatId, messageId)));
}

export function convertFastGptMessageToOpenAI(message = '') {
  if (typeof message === 'string') {
    return message;
  }

  const result = [];
  message.forEach(item => {
    if (item.type === 'text') {
      const content = get(item, 'text.content', '');
      const cleanContent = content.replace(/\[[^\]]+\]\(CITE\)/g, '');
      result.push({
        type: 'text',
        text: cleanContent,
      });
    }
  });
  return result;
}

export function getContentFromMessage(message = '') {
  if (typeof message === 'string') {
    return message;
  }

  let result = '';
  message.forEach(item => {
    if (item.type === 'text') {
      const cleanText = item.text.replace(/\[[^\]]+\]\(CITE\)/g, '');
      result += cleanText + '\n';
    } else if (item.type === 'image_url') {
      result += `![image](${item.image_url.url})\n`;
    }
  });
  return result;
}

export function mapWidgetTypeToControlType(type) {
  switch (type) {
    case 'text':
      return 'TEXT';
    case 'longText':
      return 'TEXT';
    case 'number':
      return 'NUMBER';
    case 'amount':
      return 'MONEY';
    case 'region':
      return 'AREA_PROVINCE';
    case 'location':
      return 'LOCATION';
    case 'date':
      return 'DATE';
    case 'dateTime':
      return 'DATE_TIME';
    case 'boolean':
      return 'SWITCH';
    case 'dropdown':
      return 'DROP_DOWN';
    case 'radio':
      return 'DROP_DOWN';
    case 'checkbox':
      return 'SWITCH';
    case 'autoid':
      return 'AUTO_ID';
    case 'member':
      return 'USER_PICKER';
    case 'department':
      return 'DEPARTMENT';
    case 'phone':
      return 'MOBILE_PHONE';
    case 'email':
      return 'EMAIL';
    case 'attachment':
      return 'ATTACHMENT';
    case 'formula':
      return 'FORMULA_NUMBER';
    case 'subform':
      return 'SUB_LIST';
    case 'related':
      return 'RELATE_SHEET';
    case 'multiRelated':
      return 'RELATE_SHEET';
    case 'relatedTable':
      return 'RELATE_SHEET';
    case 'section':
      return 'SPLIT_LINE';
    // case 'tab':
    //   return 'TAB';
    default:
      return;
  }
}

function formatMediaToFiles(media) {
  if (typeof media === 'string') {
    return safeParse(media, 'array')
      .filter(item => !!item)
      .map(item => ({
        id: item.fileID,
        name: item.oldOriginalFileName + item.fileExt,
        url: item.url,
        type: getMimeTypeByExt(item.fileExt),
      }));
  }

  return media
    .filter(item => !!item)
    .map(item => ({
      id: item.fileID,
      name: item.originalFilename + item.ext,
      url: item.viewUrl,
      type: getMimeTypeByExt(item.ext),
      source: item,
    }));
}

function formatImageUrlToFiles(imageUrl) {
  return imageUrl.map(item => ({
    id: item.image_url.url,
    name: 'image.jpg',
    url: item.image_url.url,
    type: 'image/png',
  }));
}

export function convertModelMessageToUIMessage(message) {
  const result = { ...message };

  if (message.media) {
    result.files = formatMediaToFiles(message.media);
  }

  if (find(message.content, item => item.type === 'image_url')) {
    result.files = [
      ...(result.files || []),
      ...formatImageUrlToFiles(message.content.filter(item => item.type === 'image_url')),
    ];
    result.content = message.content.filter(item => item.type !== 'image_url');
  }

  // 过滤掉 content 中的 file 类型（仅用于请求，不用于显示）
  if (isArray(result.content)) {
    result.content = result.content.filter(item => item.type !== 'file');
  }

  return result;
}

function filterControlsByFormFieldPermissions(controls, { from, includeUsers = false, includeFiles = false }) {
  if (!isArray(controls)) return [];
  return controls.filter(c => {
    if (includes(ALL_SYS, c.controlId)) return false;
    if (includes([21, 22, 31, 33, 25, 32, 38, 42, 43, 47, 45, 30, 51, 37, 22, 52, 53, 54, 10010], c.type)) return false;

    if (from === 'generate-record') {
      const hasFieldPermission = !c.fieldPermission || c.fieldPermission.endsWith('11');
      const hasControlPermission = !c.controlPermissions || c.controlPermissions.endsWith('1');
      return hasFieldPermission && hasControlPermission;
    }

    if (from === 'generate-example-data') {
      if (c.type === 24 && c.enumDefault === 1) return false;

      if (!includeUsers && c.type === 26) return false;

      if (!includeFiles && c.type === 14) return false;

      return true;
    }

    return true;
  });
}

function buildFormFieldControlObject(control, options = {}) {
  const type = control.type;
  const base = {
    controlId: control.controlId || '',
    name: control.controlName || '',
    type: control.type,
  };

  if (type === 26 || type === 27) {
    return { ...base, isMultiple: control.enumDefault !== 0 };
  }

  if (type === 9 || type === 10 || type === 11) {
    const option = isEmpty(control.options) ? null : control.options.filter(o => !o.isDeleted).map(o => o.value);
    return { ...base, option };
  }

  if (type === 28) {
    const max = get(control, 'advancedSetting.max');
    const range = max ? `1~${max}` : '1~5';
    return { ...base, range };
  }

  if (type === 29) {
    return {
      ...base,
      isMultiple: control.enumDefault !== 1,
      relatedWorksheetId: control.dataSource || '',
    };
  }

  if (type === 35) {
    return { ...base, relatedWorksheetId: control.dataSource || '' };
  }

  if (type === 34) {
    const subRaw = control.relationControls || [];

    if (options.from === 'generate-example-data' && subRaw.some(c => includes([29, 35], c.type))) {
      return { ...base, subformControls: [] };
    }

    const subFiltered = filterControlsByFormFieldPermissions(subRaw, options);
    return { ...base, subformControls: subFiltered.map(c => buildFormFieldControlObject(c, options)) };
  }

  const { controlType, controlTypeName } = getWidgetTypeName(type);

  base.controlType = controlType;
  base.controlTypeName = controlTypeName;
  delete base.type;

  return base;
}

/**
 * 从工作表模板控件生成供 Agent / 文案使用的表单字段描述列表。
 * 处理参数formFields
 */
export function buildFormFieldsControls(worksheetInfo, options = {}) {
  const raw = get(worksheetInfo, 'template.controls', []);
  const filtered = filterControlsByFormFieldPermissions(raw, options);
  return filtered.map(c => buildFormFieldControlObject(c, options));
}
