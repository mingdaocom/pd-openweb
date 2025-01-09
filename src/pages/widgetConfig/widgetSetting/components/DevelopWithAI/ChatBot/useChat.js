import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import codeAjax from 'src/api/code';
import { getPssId } from 'src/util/pssId';
import { MESSAGE_TYPE } from './enum';
import { findLast, get, omit } from 'lodash';
import { createParser } from 'eventsource-parser';

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

function useChatBot({ params = [], defaultMessages = [], currentCode, onMessageDone = () => {} }) {
  const cache = useRef({});
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

  const sendMessage = async (content, { noCode = false } = {}) => {
    if (!content.trim()) return;

    await abortRequest();
    abortControllerRef.current = new AbortController();

    if (messages.length === 1) {
      setFirstInputMessage(content);
    }

    const userMessage = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setIsRequesting(true);

    try {
      // const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer sk-npryhcefscyskmwsuqejaefqujbpwctivwyeoqfdanqhapct`,
      //     Accept: 'text/event-stream',
      //   },
      //   body: JSON.stringify({
      //     model: 'deepseek-ai/DeepSeek-V2.5',
      //     messages: [...messages, userMessage]
      //       .filter(message => message.type !== MESSAGE_TYPE.SHOW_NOT_SEND)
      //       .map(message => omit(message, ['id', 'type'])),
      //     stream: true,
      //   }),
      //   signal: abortControllerRef.current.signal,
      // });

      let isContinuous = messages.length > 2;

      function getMessageList() {
        let result = [...messages, userMessage];
        const lastMessageWithCode = findLast(
          messages,
          message => message.role === 'assistant' && message.content.includes('```mdy.free_field'),
        );
        if (code && isContinuous && lastMessageWithCode) {
          const codeContent = lastMessageWithCode.content.split('```mdy.free_field')[0];
          lastMessageWithCode.content = `${codeContent}\`\`\`mdy.free_field\n${code}\`\`\``;
          result = [{ role: 'user', content: firstInputMessage }, lastMessageWithCode, userMessage];
        } else if (code && !noCode) {
          result = [
            lastMessageWithCode || { role: 'assistant', content: `\`\`\`mdy.free_field\n${code}\`\`\`` },
            userMessage,
          ];
        }
        return result;
      }

      const response = await codeAjax.generateCodeBlock(
        {
          codeType: 3,
          params,
          messageList: getMessageList()
            .filter(message => message.type !== MESSAGE_TYPE.SHOW_NOT_SEND)
            .map(message => omit(message, ['id', 'type'])),
        },
        {
          abortController: abortControllerRef.current,
          isReadableStream: true,
        },
      );

      setIsRequesting(false);

      const newMessageId = uuidv4();
      setMessages(prev => [...prev, { role: 'assistant', content: '', id: newMessageId }]);
      setActiveMessageId(newMessageId);

      const parser = createParser(event => {
        if (event.type === 'event') {
          if (event.data === '[DONE]') {
            onMessageDone(cache.current.messages);
            return;
          }

          try {
            const data = JSON.parse(event.data);
            const messageContent = get(data, 'choices.0.delta.content') || '';

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
              cache.current.messages = newMessages;
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
