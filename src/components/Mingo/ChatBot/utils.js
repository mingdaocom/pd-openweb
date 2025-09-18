import localforage from 'localforage';
import { get } from 'lodash';
import mingoAjax from 'src/api/mingo';
import { FAST_GPT_CONFIG } from 'src/utils/enum';

export async function insertChatHistory(chatId, title) {
  if (!chatId || !title) {
    return;
  }
  const newHistory = { chatId, title, updateTime: new Date().toISOString() };
  const notLogin = !md?.global?.Account?.accountId;
  if (notLogin) {
    const histories = await localforage.getItem('mingo-chat-histories');
    const newHistories = [...(histories || []), newHistory];
    await localforage.setItem('mingo-chat-histories', newHistories);
    return newHistories;
  }
  return mingoAjax.saveRecord(newHistory);
}

export async function updateChatTitle(chatId, title) {
  if (!chatId || !title) {
    return;
  }
  const notLogin = !md?.global?.Account?.accountId;
  if (notLogin) {
    const histories = await localforage.getItem('mingo-chat-histories');
    const newHistories = histories.map(item => (item.chatId === chatId ? { ...item, title } : item));
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
    const newHistories = histories.filter(item => item.chatId !== chatId);
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
  const newHistory = { chatId, title, updateTime: new Date(updateTime).toISOString() };
  const notLogin = !md?.global?.Account?.accountId;
  if (notLogin) {
    const histories = await localforage.getItem('mingo-chat-histories');
    const newHistories = histories.map(item => (item.chatId === chatId ? newHistory : item));
    await localforage.setItem('mingo-chat-histories', newHistories);
    return newHistories;
  }
  return mingoAjax.saveRecord(newHistory);
}

export async function getChatHistories() {
  const notLogin = !md?.global?.Account?.accountId;
  if (notLogin) {
    const histories = await localforage.getItem('mingo-chat-histories');
    return histories || [];
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
7.返回语言使用 ${md.global.Account.lang}
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
