// 官网免登录漏斗（详见《官网免登录生成应用-前端对接完整文档》§1-§8）：
// 匿名版 agent 只能由前端显式点名直达，登录后续建换产品版。
export const ANON_AGENT = 'app-plan-builder-public'; // §1 匿名版：官网免登录生成 plan
export const PROD_AGENT = 'app-plan-builder'; // §1 产品版：登录后在已有 plan 上续聊/续建

// 匿名会话 id：整段（bootstrap → 生成 → 认领 → 续建）复用同一个，绝不接受外部传入（防 session fixation）。
const ANON_SESSION_KEY = 'anonSessionId';
// 会话创建时间戳，用于本地 TTL 检查（服务端 10min 滑动，本地保守取 9min）
const ANON_SESSION_TS_KEY = 'anonSessionCreatedAt';
const ANON_SESSION_TTL_MS = 9 * 60 * 1000;
const ANON_UPLOAD_SIZE_LIMIT_FALLBACK_MB = '5';
// 官网免登录交接数据走 webCache 的 Mingo 模块类型
const WEB_CACHE_MODULE_TYPE = 3;

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'heic', 'heif'];
const UPLOAD_TOKEN_VALIDATION_CODES = ['type_not_supported', 'media_type_not_supported', 'size_out_of_range'];

let captchaLoaderPromise;

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readField(source, key) {
  if (!isRecord(source)) return undefined;
  if (key in source) return source[key];
  const target = key.toLowerCase();

  for (const [k, v] of Object.entries(source)) {
    if (k.toLowerCase() === target) return v;
  }

  return undefined;
}

function stringValue(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function agentRequest(args, options) {
  return window.agentAPI(args, {
    ...options,
    method: 'POST',
  });
}

function webCacheRequest(actionName, args, options) {
  return window.mdyAPI('WebCache', actionName, { ...args, moduleType: WEB_CACHE_MODULE_TYPE }, options);
}

function loadCaptcha() {
  if (!captchaLoaderPromise) {
    captchaLoaderPromise = Promise.all([import('src/library/jquery/global'), import('ming-ui/functions/captcha')]).then(
      ([, module]) => module.default || module,
    );
  }

  return captchaLoaderPromise;
}

async function ensureMingoEntryGlobalMeta() {
  if (!window.__mingoEntryEnsureGlobalMeta) return;
  const config = (window.md && window.md.global && window.md.global.Config) || {};
  if (config.CaptchaAppId && window.TencentCaptcha) return;

  await window.__mingoEntryEnsureGlobalMeta().catch(() => null);
}

function extOf(name) {
  return ((name || '').split('.').pop() || '').toLowerCase();
}

export function anonAttachmentType(file) {
  const mime = (file && file.type) || '';

  if (typeof mime === 'string' && mime.startsWith('image/')) return 'image';
  return IMAGE_EXTENSIONS.includes(extOf(file && file.name)) ? 'image' : 'doc';
}

// §5 验证码（被动式）：先不带票发，命中 403 captcha_required/captcha_failed 时弹腾讯云验证码、带票重发一次。
// doRequest 接收 captcha 参数对象（{ captchaTicket, captchaRandstr }）拼进请求体。
export async function withCaptcha(doRequest) {
  try {
    return await doRequest();
  } catch (err) {
    const status = err && (err.status || (err.response && err.response.status));
    const body = (err && (err.data || (err.response && err.response.data))) || {};
    const code = stringValue(readField(body, 'errorCode'));

    if (status === 403 && (code === 'captcha_required' || code === 'captcha_failed')) {
      // 嵌入 iframe 时通知父页临时全屏，让验证码弹层有足够空间展示
      const inIframe = window.parent !== window;
      if (inIframe) window.parent.postMessage({ type: 'MINGO_CAPTCHA_OPEN' }, '*');

      let ticket;

      try {
        await ensureMingoEntryGlobalMeta();
        const captcha = await loadCaptcha();

        ticket = await new Promise((resolve, reject) => {
          captcha(
            res => (res && res.ret === 0 ? resolve(res) : reject(new Error('captcha_cancelled'))),
            () => reject(new Error('captcha_cancelled')),
          );
        });
      } finally {
        if (inIframe) window.parent.postMessage({ type: 'MINGO_CAPTCHA_CLOSE' }, '*');
      }

      return doRequest({ captchaTicket: ticket.ticket, captchaRandstr: ticket.randstr });
    }

    throw err;
  }
}

export function isCaptchaCancelled(err) {
  return err && err.message === 'captcha_cancelled';
}

function getErrorInfo(err) {
  const status = err && (err.status || (err.response && err.response.status));
  const body = (err && (err.data || (err.response && err.response.data))) || {};

  return {
    status,
    code: stringValue(readField(body, 'errorCode')),
    message: stringValue(readField(body, 'errorMessage')),
  };
}

function parseFileIndexes(message) {
  const indexes = [];

  String(message || '').replace(/files\[(\d+)\]/g, (_match, index) => {
    indexes.push(Number(index));
    return _match;
  });

  return Array.from(new Set(indexes)).filter(index => Number.isInteger(index) && index >= 0);
}

function formatSizeLimitMB(size) {
  const bytes = Number(size);

  if (!Number.isFinite(bytes) || bytes <= 0) return undefined;
  const mb = bytes / 1024 / 1024;

  return Number.isInteger(mb) ? String(mb) : String(parseFloat(mb.toFixed(2)));
}

function parseSizeLimitMB(message) {
  const match = String(message || '').match(/\(\s*0\s*,\s*(\d+(?:\.\d+)?)\s*\]/);

  return match ? formatSizeLimitMB(match[1]) : undefined;
}

function createUploadTokenError(res) {
  const message = stringValue(readField(res, 'errorMessage')) || _l('上传失败');
  const code = stringValue(readField(res, 'errorCode'));
  const error = new Error(message);

  error.code = code;
  error.data = res;
  error.uploadTokenValidation = UPLOAD_TOKEN_VALIDATION_CODES.includes(code);
  error.fileIndexes = parseFileIndexes(message);
  error.sizeLimitMB = parseSizeLimitMB(message);

  throw error;
}

function getUploadTokenErrorResponse(err) {
  const data = (err && (err.data || (err.response && err.response.data))) || err;
  const code = stringValue(readField(data, 'errorCode'));

  return code ? data : null;
}

function normalizeUploadTokenError(err) {
  const data = getUploadTokenErrorResponse(err);

  if (data) createUploadTokenError(data);
  throw err;
}

export function isAnonymousUploadTokenValidationError(err) {
  return Boolean(err && err.uploadTokenValidation);
}

export function isAnonymousUploadSizeOutOfRangeError(err) {
  return err && err.code === 'size_out_of_range';
}

export function getAnonymousUploadFailedIndexes(err) {
  return Array.isArray(err && err.fileIndexes) ? err.fileIndexes : [];
}

export function getAnonymousUploadSizeLimitMB(err) {
  return (err && err.sizeLimitMB) || ANON_UPLOAD_SIZE_LIMIT_FALLBACK_MB;
}

function normalizeVoiceTokenResponse(res) {
  const data = readField(res, 'data');

  if (readField(res, 'state') !== 1 || !isRecord(data) || readField(data, 'code') !== 0 || !readField(data, 'token')) {
    throw new Error(_l('发生错误，请稍后重试'));
  }

  return {
    secretId: readField(data, 'tmpSecretId'),
    secretKey: readField(data, 'tmpSecretKey'),
    token: readField(data, 'token'),
    appId: readField(data, 'appId'),
    expiredTime: readField(data, 'expiredTime') * 1000,
  };
}

function createVoiceError(err) {
  if (isCaptchaCancelled(err)) return err;
  const { status, code, message } = getErrorInfo(err);
  const error = new Error(message || _l('发生错误，请稍后重试'));

  error.code = code;
  error.status = status;

  if (status === 429 || code === 'rate_limit_exceeded') {
    error.message = message || _l('请求过于频繁，请稍后再试');
    error.disableVoice = true;
  }

  if (
    status === 503 ||
    code === 'voice_unconfigured' ||
    code === 'voice_token_failed' ||
    code === 'rate_limit_exceeded'
  ) {
    error.disableVoice = true;
  }

  if (status === 503 || code === 'voice_unconfigured' || code === 'voice_token_failed') {
    error.silentVoice = true;
  }

  return error;
}

// §2 申请匿名会话：后端签发高熵 sessionId（Redis 登记、绑定 agentName、TTL 10min 滑动），存 localStorage 整段复用。
export async function bootstrapAnonymousSession() {
  const res = await withCaptcha(extra =>
    agentRequest({ agentName: ANON_AGENT, ...(extra || {}) }, { url: '/api/agent/session-token', silent: true }),
  );
  const sessionId = stringValue(readField(res, 'sessionId'));

  if (sessionId) {
    safeLocalStorageSetItem(ANON_SESSION_KEY, sessionId);
    safeLocalStorageSetItem(ANON_SESSION_TS_KEY, String(Date.now()));
  }

  return sessionId;
}

export function getAnonSessionId() {
  const id = localStorage.getItem(ANON_SESSION_KEY);
  if (!id) return '';
  const ts = parseInt(localStorage.getItem(ANON_SESSION_TS_KEY) || '0', 10);

  if (Date.now() - ts > ANON_SESSION_TTL_MS) {
    localStorage.removeItem(ANON_SESSION_KEY);
    localStorage.removeItem(ANON_SESSION_TS_KEY);
    return '';
  }

  return id;
}

// 确保有匿名会话：已有直接复用，没有才 bootstrap。
export async function ensureAnonymousSession() {
  return getAnonSessionId() || (await bootstrapAnonymousSession());
}

// 匿名漏斗语音凭证：复用同一个匿名 sessionId，凭证不长期缓存；登录态录音仍走 Recorder 默认 Mingo/GetFederationToken。
export async function requestAnonymousVoiceToken(sessionId, { onSessionRefresh } = {}) {
  async function request(sid) {
    const res = await withCaptcha(extra =>
      agentRequest(
        { agentName: ANON_AGENT, sessionId: sid, ...(extra || {}) },
        { url: '/api/agent/voice-token', silent: true },
      ),
    );

    return normalizeVoiceTokenResponse(res);
  }

  const sid = sessionId || (await ensureAnonymousSession());

  try {
    return await request(sid);
  } catch (err) {
    const { status, code } = getErrorInfo(err);

    if (status === 403 && code === 'anon_session_invalid') {
      const nextSessionId = await bootstrapAnonymousSession();

      if (nextSessionId && onSessionRefresh) onSessionRefresh(nextSessionId);
      if (nextSessionId) return request(nextSessionId);
    }

    throw createVoiceError(err);
  }
}

// §3-1 申请批量上传 token（按 sessionId 限流）。files: [{ type, ext, size, fileName }]
async function requestUploadToken(files, sessionId) {
  let res;

  try {
    res = await withCaptcha(extra =>
      agentRequest(
        { agentName: ANON_AGENT, sessionId, files, ...(extra || {}) },
        { url: '/api/agent/upload-token', silent: true },
      ),
    );
  } catch (err) {
    normalizeUploadTokenError(err);
  }

  if (readField(res, 'state') !== 1) {
    createUploadTokenError(res);
  }

  const list = readField(res, 'data');

  return Array.isArray(list) ? list : [];
}

// §3-2 直传七牛（逐文件）：FormData POST 到上传 host，不经 agent-service 中转。
async function uploadToQiniu(item, file) {
  const form = new FormData();

  form.append('token', item.uptoken);
  form.append('key', item.key);
  form.append('file', file, item.fileName || file.name);
  const res = await fetch(md.global.FileStoreConfig.uploadHost, { method: 'POST', body: form });

  if (!res.ok) throw new Error(`qiniu upload failed: ${res.status}`);
  return res.json();
}

// §3 完整匿名上传：upload-token → 直传七牛 → 回读 url 组装成 execute 的 attachments[]。
// 返回值与输入文件按下标对齐；失败项为 null，成功项与登录态 mapAttachmentForRequest 输出同形。
export async function uploadAnonymousFiles(fileList, sessionId) {
  const files = Array.from(fileList || []);

  if (!files.length) return [];
  const tokenFiles = files.map(f => ({
    type: anonAttachmentType(f),
    ext: extOf(f.name),
    size: f.size,
    fileName: f.name,
  }));
  const tokens = await requestUploadToken(tokenFiles, sessionId);

  const uploaded = await Promise.all(
    files.map(async (file, i) => {
      const item = tokens[i];

      if (!item || !item.uptoken) return null;
      await uploadToQiniu(item, file);
      return {
        type: tokenFiles[i].type,
        url: stringValue(readField(item, 'url')),
        name: file.name,
        size: readField(item, 'size') || file.size,
      };
    }),
  );

  return uploaded;
}

// §7 登录后「转正」认领：把匿名会话 + 产物改派到登录账号。返回 { success, artifactId, versionId, sessionId }。
// 404 session_claim_empty（过期/已认领）由调用方按全新建兜底。
export function claimAnonymousSession({ sessionId, projectId }) {
  return agentRequest({ sessionId, projectId }, { url: '/api/agent/session-claim', silent: true });
}

function decodeHtmlEntities(str) {
  if (typeof str !== 'string') return str;
  const txt = document.createElement('textarea');

  txt.innerHTML = str;
  return txt.value;
}

// —— 官网输入框 → HAP 页面 交接（一次性 handoff）——
// 默认以 sessionId_<随机串> 为 key 存入 webCache；已登录直进 /mingo/chat 时可指定 key=sessionId。
export async function setAnonHandoff(data, options = {}) {
  const key = options.key || (data.sessionId || '') + '_' + Math.random().toString(36).substring(2);

  await webCacheRequest('Add', { key, value: JSON.stringify(data) });
  return key;
}

// 用 key 从 webCache 读取：返回 { prompt, attachments, sessionId } 或 null。
export async function peekAnonHandoff(key) {
  if (!key) return null;
  try {
    const res = await webCacheRequest('Get', { key });
    const value = res && typeof res === 'object' && Object.prototype.hasOwnProperty.call(res, 'data') ? res.data : res;

    if (!value) return null;
    const data = safeParse(decodeHtmlEntities(value), 'object');

    return data && typeof data === 'object' && Object.keys(data).length ? data : null;
  } catch {
    return null;
  }
}

export function clearAnonHandoff(key) {
  if (!key) return Promise.resolve(false);
  return webCacheRequest('Clear', { key }, { silent: true }).catch(() => false);
}

// 兼容旧调用名：读取但不立即清除，调用方需在确认首发/承接成功后 clearAnonHandoff。
export const takeAnonHandoff = peekAnonHandoff;
