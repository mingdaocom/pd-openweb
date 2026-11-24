const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const { parseSync, transformFileSync, transformFromAstSync } = require('@babel/core');

const root = path.resolve(__dirname, '../../..');

function setup({ response, status = 400, reject = false, storageError = false, init = {} } = {}) {
  const alerts = [];
  const errors = [];
  const uploaded = [];
  const removed = [];
  const storage = new Map();
  let refreshed = 0;
  class Uploader {
    constructor(settings) {
      this.settings = settings;
      this.handlers = {};
      this.files = [];
      this.state = 2;
    }
    init() {
      Object.entries(this.settings.init).forEach(([name, handler]) => this.bind(name, handler));
    }
    bind(name, handler, scope, priority = 0) {
      (this.handlers[name] ||= []).push({ handler, priority });
      this.handlers[name].sort((a, b) => b.priority - a.priority);
    }
    trigger(name, ...args) {
      for (const { handler } of this.handlers[name] || []) {
        if (handler(this, ...args) === false) break;
      }
    }
    refresh() {
      refreshed++;
    }
    removeFile(file) {
      removed.push(file);
      this.files = this.files.filter(item => item !== file);
    }
    getOption(name) {
      return this.settings[name];
    }
  }
  const plupload = {
    Uploader,
    parseSize: () => 4 * 1024 * 1024,
    HTTP_ERROR: -200,
    FILE_SIZE_ERROR: -600,
    FILE_EXTENSION_ERROR: -601,
    SECURITY_ERROR: -400,
    GENERIC_ERROR: -100,
    IO_ERROR: -300,
    INIT_ERROR: -500,
    FILE_DUPLICATE_ERROR: -602,
    FAILED: 4,
    STARTED: 2,
    STOPPED: 1,
  };
  const globals = {
    plupload,
    window: { plupload, platformENV: { isHap: true }, mOxie: { Env: {} } },
    md: { global: { FileStoreConfig: { uploadHost: '/mingdao/upload' } } },
    document: { createElement: () => ({ getElementsByTagName: () => [] }) },
    localStorage: {
      removeItem: name => {
        if (storageError) throw new Error('storage unavailable');
        storage.delete(name);
      },
    },
    safeLocalStorageSetItem: (name, value) => storage.set(name, value),
    safeParse: value => {
      if (!value) return {};
      if (typeof value === 'object') return value;
      try {
        return JSON.parse(value);
      } catch {
        return {};
      }
    },
    _l: (text, ...values) => text.replace(/%(\d+)/g, (_, index) => values[index]),
    alert: (...args) => alerts.push(args),
    $: {
      ajax: () => {
        const request = {
          done: resolve => {
            if (!reject) resolve(response);
            return request;
          },
          fail: fail => {
            if (reject) fail({ status, responseText: response });
            return request;
          },
          then: (resolve, fail) =>
            queueMicrotask(() => {
              if (reject) {
                fail?.({ status, responseText: response });
              } else {
                resolve(response);
              }
            }),
        };
        return request;
      },
    },
  };
  const cache = new Map();

  const load = file => {
    if (cache.has(file)) return cache.get(file);
    const module = { exports: {} };
    const { code } = transformFileSync(file, {
      babelrc: false,
      configFile: false,
      plugins: ['@babel/plugin-transform-modules-commonjs'],
    });

    const requireModule = name => {
      if (name === 'src/utils/services/request/authenticated') return { getToken: () => [] };
      if (name === 'src/utils/domain/validation/expression') {
        return {
          __esModule: true,
          default: {
            getExtOfFileName: name => name.split('.').pop(),
            getNameOfFileName: name => name.replace(/\.[^.]+$/, ''),
            fileIsPicture: () => false,
          },
        };
      }

      if (name.startsWith('src/')) return load(path.join(root, `${name}.js`));
      if (name.startsWith('.')) return load(path.resolve(path.dirname(file), `${name}.js`));
      return require(name);
    };

    new Function('module', 'exports', 'require', ...Object.keys(globals), code)(
      module,
      module.exports,
      requireModule,
      ...Object.values(globals),
    );
    cache.set(file, module.exports);
    return module.exports;
  };

  const createUploader = load(process.env.UPLOADER_SOURCE || path.join(__dirname, 'createUploader.js')).default;
  const uploader = createUploader({
    init: {
      Error: (...args) => errors.push(args),
      FileUploaded: (...args) => uploaded.push(args),
      ...init,
    },
  });
  const file = {
    id: 'file-1',
    name: '客户数据.xlsx',
    size: 8 * 1024 * 1024,
    token: 'invalid-test-token',
    key: 'test/file.xlsx',
    fileName: 'file.xlsx',
    ctx: 'test-context',
  };
  uploader.files.push(file);
  return {
    uploader,
    file,
    errors,
    uploaded,
    alerts,
    removed,
    storage,
    load,
    get refreshed() {
      return refreshed;
    },
  };
}

test('HTTP 401 的安全错误按业务码提示，保留原始错误及逐文件失败回调', () => {
  const { uploader, file, errors, alerts } = setup();
  const response = JSON.stringify({ code: 40006, message: 'upload security check failed' });
  const error = { code: -200, status: 401, file, response };
  uploader.trigger('Error', error);
  uploader.trigger('UploadComplete', [file]);
  assert.equal(errors.length, 1);
  assert.equal(errors[0][1], error);
  assert.equal(error.code, -200);
  assert.equal(errors[0][2], '「客户数据.xlsx」检测到安全风险：发现病毒或恶意内容');
  assert.equal(error.uploadErrorHandled, true);
  assert.equal(error.response, response);
  assert.deepEqual(alerts, [['「客户数据.xlsx」检测到安全风险：发现病毒或恶意内容', 2]]);
});

test('分片合并 HTTP 400 失败触发 Error、清理失败文件，不进入成功回调', () => {
  const ctx = setup({ reject: true, response: JSON.stringify({ code: 40007, message: '压缩文件无法扫描' }) });
  ctx.uploader.trigger('FileUploaded', ctx.file, { response: '{"ctx":"test-context"}' });
  // 与 jQuery 3 的异步 then 区分，合并失败必须在批次完成前通知业务层。
  assert.equal(ctx.errors.length, 1);
  ctx.uploader.trigger('UploadComplete', []);
  assert.equal(ctx.errors[0][1].status, 400);
  assert.equal(ctx.file.status, 4);
  assert.ok(ctx.removed.includes(ctx.file));
  assert.equal(ctx.uploaded.length, 0);
  assert.deepEqual(ctx.alerts, [['「客户数据.xlsx」检测到安全风险：文件不符合安全扫描策略', 2]]);
});

test('分片合并 CORS 或网络失败没有响应体时，仍提示失败并清理队列', () => {
  for (const response of [undefined, '', null, 'null', '<html>Bad Gateway</html>']) {
    const messages = [];
    const ctx = setup({
      reject: true,
      status: 0,
      response,
      init: {
        Error: (up, error, errTip) => {
          if (!error.uploadErrorHandled) messages.push(errTip);
        },
      },
    });
    // 与真实 ZIP 保持一致，避免被历史文件夹判断分支识别为文件夹。
    ctx.file.type = 'application/zip';
    ctx.storage.set(ctx.file.name, 'cached-chunks');
    assert.doesNotThrow(() => {
      ctx.uploader.trigger('FileUploaded', ctx.file, { response: '{"ctx":"test-context"}' });
    });
    ctx.uploader.trigger('UploadComplete', []);
    assert.deepEqual(messages, ['上传失败，请检查网络或稍后再试。']);
    assert.equal(ctx.file.status, 4);
    assert.ok(ctx.removed.includes(ctx.file));
    assert.equal(ctx.storage.has(ctx.file.name), false);
    assert.equal(ctx.uploaded.length, 0);
    assert.equal(ctx.alerts.length, 0);
  }
});

test('历史 HTTP 错误兼容字符串、对象和异常响应，不把非文本错误当作提示', () => {
  for (const response of [
    undefined,
    null,
    '',
    'null',
    '[]',
    '<html>Bad Gateway</html>',
    { error: null },
    { error: {} },
  ]) {
    const ctx = setup();
    ctx.uploader.trigger('Error', { file: ctx.file, code: -200, status: 400, response });
    assert.equal(ctx.errors[0][2], '上传文件发生错误，请稍后再试。(400)');
  }

  for (const response of ['{"error":"limited mimeType"}', { error: 'limited mimeType' }]) {
    const ctx = setup();
    ctx.uploader.trigger('Error', { file: ctx.file, code: -200, status: 401, response });
    assert.equal(ctx.errors[0][2], '不支持此文件格式，请转换后重试。(401)');
  }

  for (const response of [{ error: 'duplicate' }, { error: '{"error":"duplicate"}' }]) {
    const ctx = setup();
    ctx.uploader.trigger('Error', { file: ctx.file, code: -200, status: 614, response });
    assert.equal(ctx.errors[0][2], '文件服务器已存在同名文件，请重新上传。(614：duplicate)');
  }
});

test('浏览器禁止本地存储时仍能结束失败上传', () => {
  const ctx = setup({ storageError: true, reject: true, response: '{"code":40006}' });
  ctx.uploader.trigger('FileUploaded', ctx.file, { response: '{"ctx":"test-context"}' });
  assert.equal(ctx.errors.length, 1);
  assert.ok(ctx.removed.includes(ctx.file));
});

test('一批文件只汇总实际安全失败数，重复事件去重，下一批重新计数', () => {
  const { uploader, file, errors, alerts } = setup();
  const fail = (item, code = 40006) =>
    uploader.trigger('Error', { file: item, code: -200, status: 401, response: { code, message: '风险原因' } });
  fail(file);
  fail(file);
  fail({ ...file, id: 'file-2' }, 40007);
  uploader.trigger('FileUploaded', { ...file, id: 'safe' }, { response: '{"key":"safe.xlsx"}' });
  assert.equal(alerts.length, 0);
  uploader.trigger('UploadComplete', []);
  uploader.trigger('UploadComplete', []);
  assert.deepEqual(alerts, [['2 个文件检测到安全风险，无法上传', 2]]);
  assert.equal(errors.length, 3);
  fail({ ...file, id: 'next-batch' });
  uploader.trigger('UploadComplete', []);
  assert.equal(alerts[1][0], '「客户数据.xlsx」检测到安全风险：发现病毒或恶意内容');
});

test('停止或销毁上传器也展示风险，完成后不会重复展示', () => {
  for (const event of ['StateChanged', 'Destroy']) {
    const { uploader, file, alerts } = setup();
    uploader.trigger('Error', { file, code: -200, status: 401, response: '{"code":40006}' });
    uploader.state = 1;
    uploader.trigger(event);
    uploader.trigger('UploadComplete', []);
    assert.deepEqual(alerts, [['「客户数据.xlsx」检测到安全风险：发现病毒或恶意内容', 2]]);
  }
});

test('业务错误码完整覆盖，扫描不可用和超时不会误报为文件有病毒', () => {
  const { load } = setup();
  const { getUploadError } = load(path.join(root, 'src/utils/services/file/uploadError.js'));

  for (const code of [40001, 40002, 40003, 40004, 40006, 40007, 50001, 50002, 50003, 50004, 50005, 50006]) {
    const result = getUploadError({ code, message: null }, 'file.xlsx');
    assert.equal(result.code, code);
    assert.ok(result.message);
    assert.equal(result.isSecurityError, code === 40006 || code === 40007);
  }

  for (const response of [
    null,
    undefined,
    '',
    '<html>bad gateway</html>',
    'null',
    '[]',
    {},
    { code: '40006' },
    { code: null },
    { code: NaN },
    { code: Infinity },
    { key: 'test/file.xlsx' },
    { ctx: 'test-context' },
    { message: '发现病毒' },
  ]) {
    assert.equal(getUploadError(response), null);
  }

  assert.equal(getUploadError({ code: 40006, message: ' ' }).message, '检测到安全风险：发现病毒或恶意内容');
  assert.equal(
    getUploadError({ code: 50005, message: 'scanner unavailable' }).message,
    '安全扫描服务暂不可用，请稍后重试',
  );
});

test('已知业务码统一使用本地化提示，接口 message 不覆盖文案且原始响应保持不变', () => {
  const { load } = setup();
  const { getUploadError } = load(path.join(root, 'src/utils/services/file/uploadError.js'));
  const reasons = {
    40001: '上传凭证无效或已过期，请重新上传',
    40002: '不支持此文件格式，请转换后重试。',
    40003: '上传文件数据无效，请重新上传',
    40004: '文件大小错误，请检查后重新上传',
    40006: '发现病毒或恶意内容',
    40007: '文件不符合安全扫描策略',
    50001: '文件处理或存储失败，请稍后重试',
    50002: '文件元数据处理失败，请稍后重试',
    50003: '文件哈希初始化失败，请稍后重试',
    50004: '上传选项处理失败，请稍后重试',
    50005: '安全扫描服务暂不可用，请稍后重试',
    50006: '安全扫描繁忙或超时，请稍后重试',
  };

  for (const [code, reason] of Object.entries(reasons)) {
    const isSecurityError = [40006, 40007].includes(Number(code));

    for (const message of ['upload security check failed', '后端排查详情', undefined, null, '', ' ', 123, {}]) {
      const response = Object.freeze({ code: Number(code), message });

      for (const input of [response, JSON.stringify(response)]) {
        const result = getUploadError(input, 'file.txt');
        assert.deepEqual(result, {
          code: Number(code),
          message: isSecurityError ? `「file.txt」检测到安全风险：${reason}` : reason,
          isSecurityError,
        });
        assert.equal(getUploadError(input).message, isSecurityError ? `检测到安全风险：${reason}` : reason);
      }

      assert.equal(response.message, message);
    }
  }
});

test('非安全业务错误立即提示并仍调用业务错误回调和刷新', () => {
  const ctx = setup();
  ctx.uploader.trigger('Error', {
    file: ctx.file,
    code: -200,
    status: 401,
    response: '{"code":50006,"message":"security scan timeout"}',
  });
  assert.deepEqual(ctx.alerts, [['安全扫描繁忙或超时，请稍后重试', 2]]);
  assert.equal(ctx.errors.length, 1);
  assert.equal(ctx.refreshed, 1);
});

test('未知数字业务码使用接口 message，空消息或非字符串消息使用通用失败提示', () => {
  const { load } = setup();
  const { getUploadError } = load(path.join(root, 'src/utils/services/file/uploadError.js'));

  for (const code of [40008, 50007, 60001, 401]) {
    for (const message of ['backend upload error', '自定义错误说明', undefined, null, '', ' \n ', 0, {}]) {
      const response = Object.freeze({ code, message });
      const expected = typeof message === 'string' && message.trim() ? message : '上传失败，请稍后再试。';

      for (const input of [response, JSON.stringify(response)]) {
        assert.deepEqual(getUploadError(input, 'file.txt'), { code, message: expected, isSecurityError: false });
      }

      assert.equal(response.message, message);
    }
  }
});

test('普通上传和分片合并的未知业务码仍执行失败回调并仅提示一次', () => {
  for (const message of ['backend upload error', '']) {
    const response = JSON.stringify({ code: 40008, message });
    const expected = message || '上传失败，请稍后再试。';

    for (const mode of ['direct', 'merge', 'merge-http-error']) {
      const ctx = setup({ response, reject: mode === 'merge-http-error' });

      if (mode === 'direct') {
        ctx.uploader.trigger('Error', { file: ctx.file, code: -200, status: 401, response });
      } else {
        ctx.uploader.trigger('FileUploaded', ctx.file, { response: '{"ctx":"test-context"}' });
        assert.ok(ctx.removed.includes(ctx.file));
      }

      ctx.uploader.trigger('UploadComplete', []);
      assert.equal(ctx.uploaded.length, 0);
      assert.equal(ctx.errors.length, 1);
      assert.equal(ctx.errors[0][1].uploadErrorHandled, true);
      assert.equal(ctx.errors[0][2], expected);
      assert.deepEqual(ctx.alerts, [[expected, 2]]);
    }
  }
});

test('成功状态返回错误体、无效分片响应也通过失败回调收尾', () => {
  for (const event of ['ChunkUploaded', 'FileUploaded']) {
    const ctx = setup();
    ctx.uploader.trigger(event, ctx.file, { response: '{"code":40006,"message":"风险"}', status: 200 });
    ctx.uploader.trigger('UploadComplete', []);
    assert.equal(ctx.uploaded.length, 0);
    assert.equal(ctx.errors.length, 1);
    assert.equal(ctx.file.status, 4);
    assert.ok(ctx.removed.includes(ctx.file));
    assert.equal(ctx.alerts[0][0], '「客户数据.xlsx」检测到安全风险：发现病毒或恶意内容');
  }
});

test('上传和分片返回 null 或空响应时，通过失败回调清理文件', () => {
  for (const event of ['ChunkUploaded', 'FileUploaded']) {
    for (const response of ['null', '', undefined, '{}']) {
      const ctx = setup();
      ctx.file.type = 'application/zip';
      ctx.uploader.trigger(event, ctx.file, { response, status: 200 });
      assert.equal(ctx.uploaded.length, 0);
      assert.equal(ctx.errors.length, 1);
      assert.equal(ctx.file.status, 4);
      assert.ok(ctx.removed.includes(ctx.file));
    }
  }
});

test('富文本上传保留正常 URL，安全错误和空响应均进入失败回调', async () => {
  const { load } = setup();
  const { getUploadError } = load(path.join(root, 'src/utils/services/file/uploadError.js'));
  const source = fs.readFileSync(path.join(root, 'src/ming-ui/components/RichText.jsx'), 'utf8');
  const ast = parseSync(source, { babelrc: false, configFile: false, parserOpts: { plugins: ['jsx'] } });
  ast.program.body = ast.program.body.filter(
    node => node.type === 'ClassDeclaration' && node.id.name === 'MyUploadAdapter',
  );
  assert.equal(ast.program.body.length, 1);
  const { code } = transformFromAstSync(ast, source, { babelrc: false, configFile: false });
  const token = {
    uptoken: 'invalid-test-token',
    key: 'test/image.png',
    fileName: 'image.png',
    url: 'https://example.invalid/image.png',
  };
  const globals = {
    _l: text => text,
    safeParse: value => {
      try {
        return JSON.parse(value);
      } catch {
        return {};
      }
    },
    md: { global: { FileStoreConfig: { uploadHost: '/mingdao/upload' } } },
    FormData: class {
      append() {}
    },
    XMLHttpRequest: class {
      constructor() {
        this.events = {};
      }
      open() {}
      send() {}
      addEventListener(event, callback) {
        this.events[event] = callback;
      }
    },
    RegExpValidator: { getExtOfFileName: () => 'png', fileIsPicture: () => true },
    getToken: async () => [token],
    get: require('lodash/get'),
    getUploadError,
  };
  const Adapter = new Function(...Object.keys(globals), `${code}; return MyUploadAdapter;`)(...Object.values(globals));

  for (const responseText of [
    '{"key":"test/image.png"}',
    '{"code":40006,"message":"upload security check failed"}',
    '{"code":40008,"message":"backend upload error"}',
    '{"code":40008,"message":" "}',
    'null',
    '',
  ]) {
    const adapter = new Adapter({ file: Promise.resolve({ name: 'image.png' }) }, {});
    let success, error;
    adapter._initRequest();
    adapter._sendRequest(
      value => {
        success = value;
      },
      value => {
        error = value;
      },
    );
    await new Promise(resolve => setImmediate(resolve));
    adapter.xhr.status = 200;
    adapter.xhr.responseText = responseText;
    assert.doesNotThrow(() => adapter.xhr.events.load());
    if (responseText.includes('"key"')) {
      assert.equal(success.default, token.url);
      assert.equal(error, undefined);
    } else {
      assert.equal(success, undefined);
      assert.ok(error);
      if (responseText.includes('40006')) {
        assert.equal(error, '「image.png」检测到安全风险：发现病毒或恶意内容');
      } else if (responseText.includes('40008')) {
        assert.equal(
          error,
          responseText.includes('backend upload error') ? 'backend upload error' : '上传失败，请稍后再试。',
        );
      }
    }
  }
});

test('分片合并成功、失败响应体和空响应均正确收尾', () => {
  for (const response of [null, {}, { code: 40006, message: '风险' }, { key: 'test/merged.xlsx' }]) {
    const ctx = setup({ response });
    ctx.uploader.trigger('FileUploaded', ctx.file, { response: '{"ctx":"test-context"}' });
    if (response?.key) {
      assert.equal(ctx.errors.length, 0);
      assert.equal(ctx.uploaded.length, 1);
      assert.equal(ctx.uploaded[0][2].response.key, response.key);
    } else {
      assert.equal(ctx.errors.length, 1);
      assert.equal(ctx.uploaded.length, 0);
    }
  }
});

test('旧 HTTP 错误、大小校验、本地失败和正常上传保持原回调契约', () => {
  const { uploader, file, errors, uploaded, alerts } = setup();
  uploader.trigger('Error', { file, code: -200, status: 401, response: '{"error":"legacy auth error"}' });
  assert.equal(errors[0][2], '客户端认证授权失败。请重试或提交反馈。(401：legacy auth error)');
  uploader.trigger('Error', { file, code: -600 });
  assert.equal(errors[1][2], '单个文件大小超过2G，无法支持上传');
  uploader.trigger('Error', { file, message: '上传前检查失败' });
  assert.equal(errors[2][2], '上传前检查失败');
  uploader.trigger('FileUploaded', file, { response: '{"key":"test/file.xlsx"}' });
  assert.equal(uploaded.length, 1);
  assert.equal(uploaded[0][2].response.key, 'test/file.xlsx');
  assert.equal(alerts.length, 0);
});
