import localforage from 'localforage';
import { find, get } from 'lodash';
import mingoAjax from 'src/api/mingo';
import { getMimeTypeByExt } from 'src/utils/common';
import { FAST_GPT_CONFIG } from 'src/utils/enum';

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
    return safeParse(media, 'array').map(item => ({
      id: item.fileID,
      name: item.oldOriginalFileName + item.fileExt,
      url: item.url,
      type: getMimeTypeByExt(item.fileExt),
    }));
  }
  return media.map(item => ({
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
    result.files = formatImageUrlToFiles(message.content.filter(item => item.type === 'image_url'));
    result.content = message.content.filter(item => item.type !== 'image_url');
  }
  return result;
}
