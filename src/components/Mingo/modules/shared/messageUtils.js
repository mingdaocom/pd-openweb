import { chain, flatten, get, isArray, isEmpty, isNil } from 'lodash';
import { filterToolCalls } from './toolCallUtils';

/** 判断消息内容是否没有可展示的文本或工具调用。 */
export function contentIsEmpty(content) {
  if (content === '') return true;
  if (isArray(content)) {
    return (
      content.filter(item => {
        if (item.type === 'text' && !item.text) return;
        if (item.type === 'tool_calls' && filterToolCalls(item.toolCalls).length === 0) return;
        return true;
      }).length === 0
    );
  }

  return false;
}

/** 取历史消息里的推理过程（思维链）文本：后端在消息上以 reasoning_content 落库。 */
function getReasoningText(message) {
  const reasoningContent = message.reasoning_content;

  if (typeof reasoningContent !== 'string' || !reasoningContent.trim()) return '';

  return reasoningContent;
}

/** 将模型消息内容转换为 Mingo 消息列表支持的内容分段。 */
export function getContentOfMessage(message) {
  // 仅有工具调用的助手消息 content 为 null，不能包装成 { type: 'text', text: null }，
  // 否则这个空文本分段既不会被判空过滤，又会在取文本内容时抛错
  let content = isArray(message.content)
    ? message.content
    : isNil(message.content) || message.content === ''
      ? []
      : [
          {
            type: 'text',
            text: message.content,
          },
        ];
  const toolMap = message.tool_map || {};
  const filteredToolCalls = filterToolCalls(message.tool_calls || []);

  if (!isEmpty(filteredToolCalls)) {
    content = [
      ...content,
      {
        type: 'tool_calls',
        toolCalls: filteredToolCalls.map(toolCall => ({ function: toolCall, toolName: toolMap[toolCall.id] })),
      },
    ];
  }

  // 流式阶段推理过程由 event:reasoning 增量拼成 { type: 'reasoning' } 分段（见 useChat），刷新后
  // 只能从落库的 reasoning_content 还原。推理先于本条消息的正文 / 工具调用发生，放在分段头部；
  // 一组消息按 workId 合并时各条消息分别取自己的推理，多轮「推理→回答→工具」的顺序仍然对得上。
  const reasoningText = getReasoningText(message);

  if (reasoningText) {
    content = [{ type: 'reasoning', text: reasoningText }, ...content];
  }

  // 该条模型消息生成失败时标记它产出的分段：一轮回答按 workId 合并成一条消息展示，
  // 失败的只是其中某条模型消息，展示层据此只给对应分段加错误样式
  if (isMessageFailed(message)) {
    content = content.map(part => ({ ...part, failed: true }));
  }

  return content;
}

/**
 * 取模型消息的展示分段，并标注每段来自哪条模型消息。
 *
 * 一轮回答会落成多条模型消息（每轮 LLM 调用一条），合并展示时展示层要按「最后一条模型消息」把之前的
 * 过程折叠进「已工作」。工具调用只有命中卡片白名单才会成段（见 filterToolCalls），查询类工具全被过滤，
 * 光看分段类型认不出消息边界，所以在这里把归属带出去。
 */
function getOwnedContentOfMessage(message) {
  return getContentOfMessage(message).map(part => ({ ...part, ownerMessageId: message.id }));
}

/** 判断消息是否生成失败：兼容 failed 落在消息顶层与 metadata 两种形态。 */
function isMessageFailed(message) {
  return !!(message.failed ?? get(message, 'metadata.failed'));
}

/**
 * 取系统错误消息的提示文案。
 *
 * 一轮回答被中断时（如上下文超限、服务异常），后端不是把错误写进助手消息，而是单独落一条
 * role=system 的消息，文案在 content 上、metadata 里另带 errorMessage。
 */
function getErrorText(message) {
  const content = typeof message.content === 'string' ? message.content.trim() : '';

  return content || get(message, 'metadata.errorMessage') || '';
}

/** 取一组消息里的系统错误，转成标记失败的文本分段，接在这轮回答的末尾展示。 */
function getErrorParts(groupMessages) {
  return groupMessages
    .filter(message => message.role === 'system' && isMessageFailed(message))
    .map(getErrorText)
    .filter(Boolean)
    .map(text => ({ type: 'text', text, failed: true }));
}

/**
 * 一轮回答只剩系统错误可展示时的兜底基底。
 *
 * 失败发生在助手消息产出任何可展示内容之前时（只有一次工具调用、且工具不在卡片白名单里），
 * formatMessage 会判空返回 undefined，整组连同错误一起被丢弃。这里借用组内消息的 id 与时间，
 * 构造一条空的助手消息来承载错误分段。
 */
function buildErrorBaseMessage(groupMessages) {
  const source = groupMessages.find(message => message.role === 'assistant') || groupMessages[0];

  return {
    id: get(source, 'metadata.id'),
    instanceId: source.instanceId,
    workId: source.workId,
    role: 'assistant',
    modelMessageId: get(source, 'metadata.id'),
    time: source.ctime,
    content: [],
  };
}

/** 取模型消息消耗的信用点：历史消息落库在 metadata.price 上。 */
function getMessagePrice(message) {
  const price = get(message, 'metadata.price');

  return typeof price === 'number' ? price : 0;
}

/** 信用点求和，并消除浮点累加尾差（如 0.0187 + 0.0093）。 */
export function sumPrice(prices = []) {
  return Math.round(prices.reduce((sum, price) => sum + (Number(price) || 0), 0) * 1e6) / 1e6;
}

/** 将单条模型消息转换为 Mingo UI 消息。 */
export function formatMessage(message) {
  if (!['user', 'assistant'].includes(message.role)) return;

  const result = {};
  result.id = get(message, 'metadata.id');
  result.instanceId = message.instanceId;
  result.workId = message.workId;
  result.role = message.role === 'user' ? 'user' : 'assistant';
  result.content = message.role === 'user' ? message.content : getOwnedContentOfMessage(message);
  result.media = message.media;
  result.hasSubmit = message.hasSubmit;
  result.modelMessageId = get(message, 'metadata.id');
  // 消息时间：后端逐条落库 ctime。一轮回答按 workId 合并成一条展示时，取基底（首条）消息的时间，
  // 与这一组内容开始生成的时刻对应
  result.time = message.ctime;

  const price = getMessagePrice(message);

  if (price) result.price = price;
  if (isEmpty(result.content) && isEmpty(result.media)) return;

  return result;
}

/** 按工作消息分组并转换模型消息列表。 */
export function formatMessages(messages) {
  const result = [];
  let latestMessageId;

  messages.forEach(message => {
    if (message.role === 'user') {
      message.workId = message.id;
      latestMessageId = undefined;
    } else if (!latestMessageId) {
      latestMessageId = message.id;
      if (message.workId === null) message.workId = latestMessageId;
    } else if (message.workId === null) {
      message.workId = latestMessageId;
    }
  });

  chain(messages.map(message => ({ ...message, workId: message.workId || message.id })))
    .groupBy('workId')
    .map(items => items)
    .value()
    .forEach(groupMessages => {
      const errorParts = getErrorParts(groupMessages);

      if (groupMessages.length === 1 && !errorParts.length) {
        result.push(formatMessage(groupMessages[0]));
        return;
      }

      const content = [];
      const assistantMessages = groupMessages.filter(message => message.role === 'assistant');

      assistantMessages.forEach(message => {
        content.push(getOwnedContentOfMessage(message));
      });

      // 首条 assistant 可能既无正文、工具调用又全被卡片白名单过滤（如 wf_image_description），
      // formatMessage 会判空返回 undefined，直接展开会让整组消息丢失 role/id 而被列表按角色过滤掉；
      // 取首个能格式化出结果的 assistant 作基底，全组都无可展示内容时才整组丢弃。
      // 这轮带系统错误时不能就此丢弃，否则错误提示会跟着整组一起消失，改用兜底基底承载
      const baseMessage =
        assistantMessages.map(formatMessage).find(Boolean) ||
        (errorParts.length ? buildErrorBaseMessage(groupMessages) : undefined);

      if (!baseMessage) return;

      // 一轮回答含工具调用时会落成多条 assistant 消息，各自计费，合并展示时信用点需要累加
      const price = sumPrice(assistantMessages.map(getMessagePrice));

      result.push({
        ...baseMessage,
        // 错误放在最末：它标志这轮到此为止，展示层据此判定「以失败收尾」并渲染错误样式
        content: [...flatten(content), ...errorParts],
        ...(price ? { price } : {}),
      });
    });

  return result;
}

/** 取消息时间戳，无效 / 缺失时返回 NaN。 */
function getMessageTime(message) {
  return new Date((message || {}).ctime).getTime();
}

/**
 * 会话消息按时间升序排列。
 *
 * getMessageList 按时间倒序分页返回（新→旧），而 ctime 只精确到秒：同一轮的提问与紧接着的
 * 回复常常落在同一秒，只按 ctime 比较时比较器返回 0，稳定排序会原样保留后端的倒序，回复就排到
 * 了提问前面（formatMessages 再按 workId 分组时，整组 assistant 会被顶到用户消息之上，
 * 表现为「回复在前、提问在后」）。
 *
 * 因此先探测整体方向：倒序则整体反转成升序作为基准顺序，再按 ctime 稳定排序，同秒（含 ctime
 * 缺失导致比较结果为 NaN）时保持基准顺序，也就是真实先后。入参本就是升序时不做反转。
 */
export function sortMessagesByCtimeAsc(messages = []) {
  const isDescending = (() => {
    for (let i = 1; i < messages.length; i++) {
      const prevTime = getMessageTime(messages[i - 1]);
      const currentTime = getMessageTime(messages[i]);

      if (!isNaN(prevTime) && !isNaN(currentTime) && prevTime !== currentTime) return prevTime > currentTime;
    }

    return false;
  })();
  const list = isDescending ? messages.slice().reverse() : messages.slice();

  return list.sort((a, b) => getMessageTime(a) - getMessageTime(b) || 0);
}
