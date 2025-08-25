import { useEffect, useRef, useState } from 'react';
import { createParser } from 'eventsource-parser';
import { find, get } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

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

function useChat({
  defaultMessages = [],
  aiCompletionApi = () => {},
  onMessagePipe = () => {},
  onMessageDone = () => {},
  batchDeleteMessage = () => {},
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

  const sendMessage = async (content, { imageUrl, fromMessageId } = {}) => {
    if (!content.trim()) return;
    if (imageUrl) {
      content = [
        {
          type: 'text',
          text: content,
        },
        {
          type: 'image_url',
          image_url: {
            url: imageUrl,
          },
        },
      ];
    }
    await abortRequest();
    abortControllerRef.current = new AbortController();

    if (messages.length === 1) {
      setFirstInputMessage(content);
    }

    const userMessage = { role: 'user', id: uuidv4(), content };
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

    try {
      const response = await aiCompletionApi([...messages.filter(item => !item.disabled), userMessage], {
        abortController: abortControllerRef.current,
      });

      setIsRequesting(false);

      const newMessageId = uuidv4();
      setMessages(prev => [...prev, { role: 'assistant', content: '', id: newMessageId }]);
      setActiveMessageId(newMessageId);

      parserRef.current = createParser(event => {
        if (event.type === 'event') {
          if (event.data === '[DONE]') {
            onMessageDone(cache.current.messages);
            return;
          }

          try {
            const data = JSON.parse(event.data);
            const messageContent = get(data, 'choices.0.delta.content') || '';

            onMessagePipe(messageContent);

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
          if (parserRef.current) {
            parserRef.current.feed(chunk);
          }
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

  return {
    messages,
    input,
    setInput,
    firstInputMessage,
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

export default useChat;
