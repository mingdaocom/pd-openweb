import { useEffect, useRef, useState } from 'react';
import { createParser } from 'eventsource-parser';
import { find, findLast, get, omit } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import agentApi from 'src/api/agent';
import sseAjax from 'src/api/sse';
import { MESSAGE_TYPE } from './enum';

// 在文件顶部添加 ChunkLoader 类
class ChunkLoader {
  constructor(feedFn, chunkSize = 4, interval = 30) {
    this.feedFn = feedFn;
    this.chunkSize = chunkSize;
    this.interval = interval;
    this.buffer = '';
    this.isProcessing = false;
    this.decoder = new TextDecoder();
  }

  async feed(data) {
    const text = typeof data === 'string' ? data : this.decoder.decode(data, { stream: true });
    this.buffer += text;
    if (!this.isProcessing) {
      this.isProcessing = true;
      await this.process();
    }
  }

  async process() {
    while (this.buffer.length > 0) {
      const chunk = this.buffer.slice(0, this.chunkSize);
      this.buffer = this.buffer.slice(this.chunkSize);
      this.feedFn(chunk);
      await new Promise(resolve => setTimeout(resolve, this.interval));
    }

    this.isProcessing = false;
  }
}

function useChatBot({ sessionId, params = [], defaultMessages = [], currentCode, onError = () => {} }) {
  const [firstInputMessage, setFirstInputMessage] = useState();
  const [messages, setMessages] = useState(defaultMessages);
  const [code, setCode] = useState(currentCode);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);
  // 使用 ref 存储当前的 AbortController
  const abortControllerRef = useRef(null);
  const streamReaderRef = useRef(null);

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

    // 关闭流读取器
    if (streamReaderRef.current) {
      try {
        await streamReaderRef.current.cancel();
        streamReaderRef.current = null;
      } catch (error) {
        console.error('Error canceling stream:', error);
      }
    }

    setLoading(false);
  };

  const sendMessage = async (content, { noCode = false, attachment } = {}) => {
    const text = (content || '').trim();
    if (!text && !attachment) return;

    // 展示用 content：有附件时用 OpenAI 风格数组，便于 Markdown 预览图片
    const displayContent = attachment
      ? [
          { type: 'text', text: content },
          { type: 'image_url', image_url: { url: attachment.url } },
        ]
      : content;

    await abortRequest();
    abortControllerRef.current = new AbortController();

    if (messages.length === 1) {
      setFirstInputMessage(displayContent);
    }

    const userMessage = { role: 'user', content: displayContent };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setIsRequesting(true);

    try {
      // 附件入参遵循 agent 服务 AgentAttachment 契约：type / url（无 token）/ name / size
      const attachments = attachment
        ? [
            {
              type: 'image',
              url: (attachment.url || '').replace(/\?.*/, ''),
              name: attachment.name,
              size: attachment.size,
            },
          ]
        : undefined;

      const response = await agentApi.agentExecuteStream(
        {
          message: content,
          attachments,
          sessionId,
          agentName: 'custom-field-agent',
          context: { params, code },
        },
        { abortController: abortControllerRef.current },
      );
      // {
      //   codeType: 3,
      //   params,
      //   messageList: getMessageList()
      //     .filter(message => message.type !== MESSAGE_TYPE.SHOW_NOT_SEND)
      //     .map(message => omit(message, ['id', 'type']))
      //     .map(message => {
      //       if (find(message.content, { type: 'image_url' })) {
      //         const content = message.content.map(item => {
      //           if (item.type === 'image_url') {
      //             item = {
      //               type: 'image_url',
      //               image_url: {
      //                 url: item.image_url.url.replace(/\?.*/, ''),
      //               },
      //             };
      //           }

      //           return item;
      //         });
      //         return { ...message, content };
      //       } else {
      //         return message;
      //       }
      //     }),
      // },

      setIsRequesting(false);

      const newMessageId = uuidv4();
      setMessages(prev => [...prev, { role: 'assistant', content: '', id: newMessageId }]);
      setActiveMessageId(newMessageId);

      const parser = createParser(event => {
        if (event.type === 'event') {
          if (event.data === '[DONE]') {
            return;
          }

          if (event.event === 'error') {
            onError(safeParse(event.data).message, event.data);
          }

          try {
            const data = JSON.parse(event.data);

            if (data.EventType !== 'text-delta') {
              return;
            }

            const messageContent = data.Delta || '';

            setMessages(prev => {
              const lastMessage = prev[prev.length - 1];
              const newMessages = [
                ...prev.slice(0, -1),
                {
                  ...lastMessage,
                  content: lastMessage.content + messageContent,
                  codeIsClosed: ((lastMessage.content + messageContent).match(/```/g) || []).length % 2 === 0,
                },
              ];
              return newMessages;
            });
          } catch (error) {
            console.error('Error parsing SSE message:', error);
          }
        }
      });

      const reader = response.body.getReader();
      streamReaderRef.current = reader;

      // 创建加载器实例
      const loader = new ChunkLoader(
        chunk => {
          parser.feed(chunk);
        },
        100,
        1,
      );

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        await loader.feed(value);
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
            content: 'Sorry, something went wrong.',
          },
        ]);
      }
    } finally {
      setLoading(false);
      setActiveMessageId(null);
      abortControllerRef.current = null;
      streamReaderRef.current = null;
    }
  };

  // 添加清除对话方法
  const clearMessages = () => {
    setMessages(defaultMessages);
    setCode('');
    setFirstInputMessage('');
    setInput('');
    setActiveMessageId(null);
    setLoading(false);
    setIsRequesting(false);
    abortRequest();
  };

  return {
    messages,
    input,
    setInput,
    setCurrentCode: setCode,
    setFirstInputMessage,
    setMessages,
    sendMessage,
    activeMessageId,
    loading,
    isRequesting,
    abortRequest,
    clearMessages,
  };
}

export default useChatBot;
