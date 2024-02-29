import axios from 'axios';
import { get } from 'lodash';
import { getPssId } from 'src/util/pssId';

function mdPost({ action, controller, data, abortController } = {}) {
  let pssId = getPssId();
  const headers = {
    authorization: pssId ? `md_pss_id ${pssId}` : '',
  };
  const clientId = window.clientId || sessionStorage.getItem('clientId');
  if (window.needSetClientId({ clientId, controllerName: controller })) {
    headers.clientId = clientId;
  }

  if (window.access_token) {
    // 工作流&统计服务
    headers.access_token = window.access_token;
    // 主站服务
    headers.Authorization = `access_token ${window.access_token}`;
  }
  return axios
    .post(`${window.__api_server__.main.replace(/\/$/, '')}/${controller}/${action}`, data, {
      headers,
      signal: abortController && abortController.signal,
    })
    .then(res => {
      if (res.data.state) {
        return res.data.data;
      } else {
        throw new Error(res.data.exception);
      }
    });
}

class RequestPool {
  queues = {};
  maxConcurrentRequests = 3;
  constructor({ abortController } = {}) {
    this.abortController = abortController;
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
