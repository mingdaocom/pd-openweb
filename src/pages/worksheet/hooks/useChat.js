import { useEffect, useRef, useState } from 'react';
import { createParser } from 'eventsource-parser';
import { find, findIndex, findLast, get, includes, isArray, isEmpty, last } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

function useChat({
  sendImageUrlsWithImage = false,
  messageProps = {},
  defaultMessages = [],
  aiCompletionApi = () => {},
  onMessagePipe = () => {},
  onMessageDone = () => {},
  onFirstMessageJSONDone = () => {},
  batchDeleteMessage = () => {},
  onError = () => {},
  onEvent = () => {},
}) {
  const cache = useRef({});
  const [firstInputMessage, setFirstInputMessage] = useState();
  const [messages, setMessages] = useState(defaultMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);
  // 使用 ref 存储当前的 AbortController
  const abortControllerRef = useRef(null);
  const streamReaderRef = useRef(null);
  const parserRef = useRef(null);

  useEffect(() => {
    // 组件卸载时中止所有请求
    return () => {
      abortRequest();
    };
  }, []);

  const abortRequest = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (parserRef.current) {
      parserRef.current.reset();
      parserRef.current = null;
    }

    // 关闭流读取器
    if (streamReaderRef.current) {
      try {
        await streamReaderRef.current.cancel();
        streamReaderRef.current = null;
      } catch (error) {
        console.error('Error canceling stream:', error);
      }
    }
    if (isRequesting || loading) {
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (!lastMessage) return prev;
        if (lastMessage.role === 'user') {
          return [...prev.slice(0, -1), { ...lastMessage, disabled: true }];
        }
        if (lastMessage.role === 'assistant') {
          return [...prev.slice(0, -2), ...prev.slice(-2).map(item => ({ ...item, disabled: true }))];
        }
        return prev;
      });
    }
    setLoading(false);
    setIsRequesting(false);
  };

  const handleFetch = async function (
    messagesForFetch,
    { noUpdateMessages = false, targetMessageId = undefined, prevUserMessageId, toolMessageId } = {},
  ) {
    try {
      if (!abortControllerRef.current) {
        abortControllerRef.current = new AbortController();
      }

      const response = await aiCompletionApi(
        messagesForFetch.filter(item => !item.deactivated && includes(['user', 'assistant'], item.role)),
        {
          abortController: abortControllerRef.current,
          prevUserMessageId,
          toolMessageId,
        },
      );
      setIsRequesting(false);
      const newMessageId = targetMessageId || uuidv4();
      if (!noUpdateMessages && !toolMessageId) {
        setMessages(prev => [...prev, { role: 'assistant', content: '', id: newMessageId, ...messageProps }]);
      }
      setActiveMessageId(newMessageId);

      parserRef.current = createParser(event => {
        onEvent(event);
        if (event.type === 'event') {
          if (event.data === '[DONE]') {
            return;
          }

          if (event.event === 'error') {
            onError(safeParse(event.data).message, event.data);
          }

          try {
            // const data = JSON.parse(event.data);
            let data;
            if (/\n/.test(event.data)) {
              data = safeParse(event.data.split('\n')[1] || '{}');
              console.error('exist \\n in event.data');
              console.error(event.data, data);
            } else {
              data = safeParse(event.data);
            }
            const messageContent = get(data, 'choices.0.delta.content') || '';
            if (!cache.current.isFirstMessageJSONDone) {
              cache.current.isFirstMessageJSONDone = true;
              onFirstMessageJSONDone(data);
            }
            const toolMap = get(data, 'choices.0.delta.tool_map');
            let toolCalls = get(data, 'choices.0.delta.tool_calls');
            if (isArray(toolCalls)) {
              toolCalls = toolCalls.map(toolCall => ({
                ...toolCall,
                toolName: toolMap && toolMap[toolCall.id],
              }));
            }
            const usage = get(data, 'usage', {});
            onMessagePipe(messageContent, data, newMessageId);
            if (!noUpdateMessages) {
              setMessages(prev => {
                let lastMessage = prev[prev.length - 1];
                lastMessage.usage = usage;
                lastMessage.instanceId = data.instanceId;
                lastMessage.workId = data.workId;
                if (data.id) {
                  lastMessage.modelMessageId = data.id;
                }
                if (toolCalls && toolCalls.length) {
                  if (typeof lastMessage.content === 'string') {
                    lastMessage.content = [
                      {
                        type: 'text',
                        text: lastMessage.content,
                      },
                    ];
                  }
                  lastMessage.content = [
                    ...lastMessage.content,
                    {
                      type: 'tool_calls',
                      eventType: event.event,
                      toolCalls,
                    },
                  ];
                  lastMessage.hasSubmit = data.hasSubmit;
                  lastMessage.codeIsClosed = true;
                  const newMessages = [...prev.slice(0, -1), lastMessage];
                  cache.current.messages = newMessages;
                  return newMessages;
                }
                // const lastTextContent =
                //   typeof lastMessage.content === 'string'
                //     ? lastMessage.content
                //     : findLast(lastMessage.content, m => m.type === 'text')?.text;
                // const newMessage = {
                //   ...lastMessage,
                //   codeIsClosed: ((lastTextContent + messageContent).match(/```/g) || []).length % 2 === 0,
                // };
                if (typeof lastMessage.content === 'string') {
                  lastMessage.content = lastMessage.content + messageContent;
                } else if (isArray(lastMessage.content)) {
                  if (lastMessage.content.slice(-1)[0]?.type !== 'text') {
                    lastMessage.content = [
                      ...lastMessage.content,
                      {
                        type: 'text',
                        text: messageContent,
                      },
                    ];
                  } else {
                    lastMessage.content = [
                      ...lastMessage.content.slice(0, -1),
                      {
                        type: 'text',
                        text: (lastMessage.content.slice(-1)[0]?.text || '') + messageContent,
                      },
                    ];
                  }
                }
                const lastTextContent =
                  typeof lastMessage.content === 'string'
                    ? lastMessage.content
                    : findLast(lastMessage.content, m => m.type === 'text')?.text;
                lastMessage.codeIsClosed = (lastTextContent.match(/```/g) || []).length % 2 === 0;
                const newMessages = [
                  ...prev.slice(0, -1),
                  {
                    ...lastMessage,
                    content: lastMessage.content,
                  },
                ];
                cache.current.messages = newMessages;
                return newMessages;
              });
            }
          } catch (error) {
            console.error('Error parsing SSE message:', error);
          }
        }
      });

      const reader = response.body.getReader();
      streamReaderRef.current = reader;
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        parserRef.current.feed(text);
        if (text.startsWith('{"code":1004')) {
          alert(safeParse(text).message, 2);
          onError(safeParse(text).message);
          return;
        } else if (text.startsWith('{"state":0')) {
          onError(safeParse(text).exception);
          return;
        }
      }
      if (!noUpdateMessages) {
        setMessages(prev => {
          const finalMessages = [...prev];
          onMessageDone(finalMessages);
          return finalMessages;
        });
      } else {
        onMessageDone();
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request aborted:', error.message);
      } else {
        console.error('Error fetching response from OpenAI:', error);
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: _l('请求失败，请稍后重试'),
          },
        ]);
        setIsRequesting(false);
      }
    } finally {
      setLoading(false);
      setActiveMessageId(null);
      abortControllerRef.current = null;
      streamReaderRef.current = null;
    }
  };

  const sendMessage = async (
    content,
    { images, media, fileIds, fromMessageId, messageOptions = {}, allowEmpty = false, originMessageForRegenerate } = {},
  ) => {
    if (!content.trim() && !isEmpty(images) && !allowEmpty && !isEmpty(fileIds)) return;
    if (images) {
      content = [
        {
          type: 'text',
          text: content,
        },
        ...images.map(image => ({ type: 'image_url', image_url: { url: image } })),
      ].filter(item => !(item.type === 'text' && !item.text?.trim()));
      if (sendImageUrlsWithImage && !isEmpty(images)) {
        content.push({ type: 'text', text: `[用户上传的图片链接] ${images.join('、')}`, hidden: true });
      }
    }
    await abortRequest();
    abortControllerRef.current = new AbortController();

    if (messages.length === 1) {
      setFirstInputMessage(content);
    }

    const userMessage = { role: 'user', id: uuidv4(), content, ...messageProps, ...messageOptions };
    if (originMessageForRegenerate) {
      userMessage.media = originMessageForRegenerate.media;
      userMessage.fileIds = originMessageForRegenerate.fileIds;
    } else {
      if (isArray(media) && !isEmpty(media)) {
        userMessage.media = JSON.stringify(media);
      }
      if (isArray(fileIds) && !isEmpty(fileIds)) {
        userMessage.fileIds = JSON.stringify(fileIds);
      }
    }
    setMessages(prev => {
      let oldMessages = [...prev];
      if (fromMessageId) {
        const fromMessageIndex = oldMessages.findIndex(item => item.id === fromMessageId);
        if (fromMessageIndex !== -1) {
          oldMessages = oldMessages.slice(0, fromMessageIndex);
          const needDeleteMessageIds = prev.filter(item => !find(oldMessages, { id: item.id })).map(item => item.id);
          batchDeleteMessage(needDeleteMessageIds);
        }
      }
      return [...oldMessages, userMessage];
    });
    setInput('');
    setLoading(true);
    setIsRequesting(true);
    handleFetch([...messages.filter(item => !item.disabled), userMessage]);
  };

  const reGenerateMessageAndNoUpdateMessages = function (messageId, content) {
    const indexOfMessageId = findIndex(messages, { id: messageId });
    if (indexOfMessageId !== -1) {
      handleFetch(
        [
          ...messages.slice(0, indexOfMessageId).filter(item => !item.disabled),
          ...(content ? [{ role: 'user', content }] : []),
        ],
        {
          noUpdateMessages: true,
          targetMessageId: messageId,
        },
      );
    }
  };

  const confirmToolCalls = function ({ toolMessageId } = {}) {
    handleFetch([{ role: 'user', content: '' }], {
      toolMessageId,
    });
  };

  // 添加清除对话方法
  const clearMessages = () => {
    setMessages(defaultMessages);
    setFirstInputMessage('');
    setInput('');
    setActiveMessageId(null);
    setLoading(false);
    setIsRequesting(false);
    abortRequest();
  };

  const cleanMessages = () => {
    if (isEmpty(messages) || last(messages)?.role === 'cleared') return;
    setMessages(prev => {
      const newMessages = [...prev.map(item => ({ ...item, deactivated: true })), { role: 'cleared', content: '' }];
      onMessageDone(newMessages);
      return newMessages;
    });
  };

  const reGenerate = function () {
    setInput('');
    setLoading(true);
    setIsRequesting(true);
    handleFetch([...messages.filter(item => !item.disabled)]);
  };

  return {
    messages,
    input,
    setInput,
    firstInputMessage,
    setFirstInputMessage,
    setIsRequesting,
    setLoading,
    setMessages,
    sendMessage,
    reGenerate,
    handleFetch,
    reGenerateMessageAndNoUpdateMessages,
    confirmToolCalls,
    activeMessageId,
    loading,
    isRequesting,
    abortRequest,
    clearMessages,
    cleanMessages,
  };
}

export default useChat;
