// for iframe 页面
export class ParentBridge {
  constructor({ tunnelId = 'global' } = {}) {
    // 使用 Symbol 作为 key 来确保唯一性
    this._messageIdCounter = 0;
    this.pendingPromises = new Map();

    // 添加请求超时机制
    this.timeout = 30000; // 30秒超时
    this.tunnelId = tunnelId;
    window.addEventListener('message', this.handleResponse.bind(this));
  }

  // 生成唯一的 messageId
  generateMessageId() {
    return `${Date.now()}-${this._messageIdCounter++}-${Math.random().toString(36).slice(2)}`;
  }

  async call(methodName, params) {
    const messageId = this.generateMessageId();

    return new Promise((resolve, reject) => {
      // 设置超时处理
      const timeoutId = setTimeout(() => {
        if (this.pendingPromises.has(messageId)) {
          this.pendingPromises.delete(messageId);
          reject(new Error(`Call to ${methodName} timed out after ${this.timeout}ms`));
        }
      }, this.timeout);

      // 存储 promise 的控制器和清理函数
      this.pendingPromises.set(messageId, {
        resolve: value => {
          clearTimeout(timeoutId);
          resolve(value);
        },
        reject: error => {
          clearTimeout(timeoutId);
          reject(error);
        },
        timestamp: Date.now(),
      });

      // 发送消息给父页面
      window.parent.postMessage(
        {
          type: 'IFRAME_REQUEST',
          tunnelId: this.tunnelId,
          methodName,
          params,
          messageId,
        },
        '*',
      );
    });
  }

  handleResponse(event) {
    const { type, messageId, success, data, error } = event.data;

    if (type !== 'IFRAME_RESPONSE') return;

    const promise = this.pendingPromises.get(messageId);
    if (!promise) return;

    this.pendingPromises.delete(messageId);

    if (success) {
      promise.resolve(data);
    } else {
      promise.reject(new Error(error));
    }
  }

  // 清理过期的请求
  cleanup() {
    const now = Date.now();
    for (const [messageId, promise] of this.pendingPromises.entries()) {
      if (now - promise.timestamp > this.timeout) {
        promise.reject(new Error('Request timeout'));
        this.pendingPromises.delete(messageId);
      }
    }
  }
}

// for 主页面
export class MessageHandler {
  constructor({ tunnelId = 'global' } = {}) {
    this.handlers = new Map();
    // 添加请求去重和并发控制
    this.processingRequests = new Set();
    this.tunnelId = tunnelId;
    window.addEventListener('message', this.handleMessage.bind(this));
  }

  register(methodName, handler) {
    this.handlers.set(methodName, handler);
  }

  async handleMessage(event) {
    const { type, methodName, params, messageId, tunnelId } = event.data;

    if (type !== 'IFRAME_REQUEST' || tunnelId !== this.tunnelId) return;

    // 检查是否已经在处理相同的请求
    const requestKey = `${messageId}`;
    if (this.processingRequests.has(requestKey)) {
      return;
    }

    this.processingRequests.add(requestKey);

    try {
      const handler = this.handlers.get(methodName);
      if (!handler) {
        throw new Error(`Method ${methodName} not found`);
      }

      const result = await handler(params);

      event.source.postMessage(
        {
          type: 'IFRAME_RESPONSE',
          messageId,
          success: true,
          data: result,
        },
        '*',
      );
    } catch (error) {
      event.source.postMessage(
        {
          type: 'IFRAME_RESPONSE',
          messageId,
          success: false,
          error: error.message,
        },
        '*',
      );
    } finally {
      this.processingRequests.delete(requestKey);
    }
  }
}
