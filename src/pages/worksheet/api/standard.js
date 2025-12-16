function mdPost({ action, controller, data, abortController } = {}) {
  return window.mdyAPI(controller, action, data, { abortController });
}

export class RequestPool {
  queues = {};
  constructor({ abortController, maxConcurrentRequests = 3 } = {}) {
    this.abortController = abortController;
    this.maxConcurrentRequests = maxConcurrentRequests;
    this.init();
  }
  init() {
    const { abortController } = this;
    if (abortController) {
      abortController.signal.addEventListener('abort', () => {
        // destroy
      });
    }
  }
  enqueue(key, request) {
    if (!this.queues[key]) {
      this.queues[key] = {
        queue: [],
        concurrentRequests: 0,
      };
    }

    const queue = this.queues[key];
    queue.queue.push(request);
    this.processQueue(key);
  }

  dequeue(key) {
    const queue = this.queues[key];
    return queue.queue.shift();
  }

  processQueue(key) {
    const queue = this.queues[key];
    if (queue.concurrentRequests === 0) {
      queue.cache = undefined;
    }
    if (queue.concurrentRequests >= this.maxConcurrentRequests || queue.queue.length === 0) {
      return;
    }

    const request = this.dequeue(key);
    this.sendRequest(key, request);
  }

  sendRequest(key, request) {
    const queue = this.queues[key];
    queue.concurrentRequests++;
    const requestKey = JSON.stringify(request.options);
    if (queue && queue.cache && queue.cache[requestKey]) {
      request.resolve(queue.cache[requestKey]);
      queue.concurrentRequests--;
      this.processQueue(key);
      return;
    }
    mdPost(request.options)
      .then(data => {
        if (!queue.cache) {
          queue.cache = {};
        }
        queue.cache[requestKey] = data;
        request.resolve(data);
      })
      .catch(error => {
        request.reject(error);
      })
      .finally(() => {
        queue.concurrentRequests--;
        this.processQueue(key);
      });
  }
  fetch({ action, controller, data, abortController } = {}) {
    return new Promise((resolve, reject) => {
      this.enqueue(controller + action, {
        resolve,
        reject,
        options: {
          action,
          controller,
          data,
          abortController,
        },
      });
    });
  }
}

export function createRequestPool({ abortController } = {}) {
  const requestPool = new RequestPool({ abortController });
  return {
    getRowDetail(data) {
      const controller = 'Worksheet';
      const action = 'GetRowDetail';
      return requestPool.fetch({
        action,
        controller,
        data,
        abortController,
      });
    },
    getFilterRowsByQueryDefault(data) {
      const controller = 'Worksheet';
      const action = 'GetFilterRowsByQueryDefault';
      return requestPool.fetch({
        action,
        controller,
        data,
        abortController,
      });
    },
  };
}
