/**
 * 为 iframe 页面提供向父页面发起异步方法调用的消息桥接器。
 */
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

  /**
   * 生成用于关联 iframe 请求与响应的唯一消息标识。
   */
  generateMessageId() {
    return `${Date.now()}-${this._messageIdCounter++}-${Math.random().toString(36).slice(2)}`;
  }

  /**
   * 向父页面发送方法调用请求，并等待对应响应或超时。
   */
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

  /**
   * 接收父页面响应，并完成对应的待处理请求。
   */
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

  /**
   * 拒绝并移除已超过等待时限的请求。
   */
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

/**
 * 为主页面注册并处理来自 iframe 的方法调用。
 */
export class MessageHandler {
  constructor({ tunnelId = 'global' } = {}) {
    this.handlers = new Map();
    // 添加请求去重和并发控制
    this.processingRequests = new Set();
    this.tunnelId = tunnelId;
    window.addEventListener('message', this.handleMessage.bind(this));
  }

  /**
   * 注册可供 iframe 调用的方法处理器。
   */
  register(methodName, handler) {
    this.handlers.set(methodName, handler);
  }

  /**
   * 执行 iframe 请求并将成功结果或错误回传给来源窗口。
   */
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
