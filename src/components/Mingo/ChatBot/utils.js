import { find, isArray } from 'lodash';
import agentApi from 'src/api/agent';
import { getMimeTypeByExt } from 'src/utils/core/file';

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

export function getContentFromMessage(message = '') {
  if (typeof message === 'string') {
    return message;
  }

  let result = '';
  message.forEach(item => {
    if (item.type === 'text') {
      // 仅有工具调用的助手消息，服务端下发的文本可能是 null，此处按空文本处理，避免渲染时抛错
      const cleanText = (item.text || '').replace(/\[[^\]]+\]\(CITE\)/g, '');
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
        size: item.fileSize || item.filesize,
        url: item.url,
        type: getMimeTypeByExt(item.fileExt),
      }));
  }

  return media
    .filter(item => !!item)
    .map(item => ({
      id: item.fileID,
      name: item.originalFilename + item.ext,
      size: item.filesize || item.fileSize,
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
