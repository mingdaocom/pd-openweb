import JSEncrypt from 'jsencrypt';
import _ from 'lodash';
import base, { controllerName } from '../../api/base';
import { isUnauthorizedError } from 'src/utils/services/request/error';

const keyCache = new Map();
const SSL_PASSWORD_FIELDS = ['trustStorePwd', 'keyStorePwd', 'keyPrivatePwd'];
const RETRY_STATES = [90001, 90003];
const PASSWORD_PLACEHOLDER = '************';

function requestError(response, fallback) {
  const messages = response?.data?.errorMsgList;
  const errorMsgList = Array.isArray(messages) ? messages.filter(message => typeof message === 'string') : [];
  const message = (typeof response?.msg === 'string' && response.msg) || errorMsgList[0] || fallback;
  return Object.assign(new Error(message), { errorCode: response?.state, errorMessage: message, errorMsgList });
}

export function getSensitiveRequestErrorMessages(error, fallback) {
  if (error?.name === 'AbortError' || isUnauthorizedError(error)) return [];
  const messages = error?.errorMsgList;
  if (Array.isArray(messages) && messages.length) return messages;
  return [error?.errorMessage || fallback];
}

function checkAborted(signal) {
  if (signal.aborted) throw new DOMException('Request aborted', 'AbortError');
}

async function request(server, path, args, options = {}) {
  try {
    return await mdyAPI(controllerName, path.replace('/', ''), args, {
      ...options,
      customParseResponse: true,
      silent: true,
      ajaxOptions: {
        ...options.ajaxOptions,
        url: server + path,
        type: path === 'crypto/publicKey' ? 'GET' : 'POST',
        contentType: 'application/json',
      },
    });
  } catch (error) {
    if (options.abortController) checkAborted(options.abortController.signal);
    // customParseResponse bypasses mdyAPI's default login redirect and error normalization.
    if (isUnauthorizedError(error) && !/^localhost:/.test(location.host) && !window.isPublicApp) {
      const { navigateToLogin } = await import('src/router/navigation/navigateTo');
      navigateToLogin({ needSecondCheck: true });
    }

    throw Object.assign(new Error(_l('请求失败，请稍后重试')), {
      errorCode: error?.status,
      errorMessage: _l('请求失败，请稍后重试'),
    });
  }
}

function validateKey(key) {
  if (key?.enabled === false) return key;
  if (
    key?.enabled !== true ||
    key.algorithm !== 'RSA' ||
    key.transformation !== 'RSA/ECB/PKCS1Padding' ||
    key.keySize !== 2048 ||
    key.cipherPrefix !== 'ENC:1:' ||
    !/^[a-f0-9]{32}$/.test(key.keyId) ||
    typeof key.publicKey !== 'string' ||
    !key.publicKey ||
    !Number.isFinite(key.expireSeconds) ||
    key.expireSeconds <= 0
  ) {
    throw requestError(null, _l('加密公钥或加密协议无效，请稍后重试'));
  }

  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(key.publicKey);
  if (encryptor.getKey().n?.bitLength() !== 2048) {
    throw requestError(null, _l('加密公钥无效，请稍后重试'));
  }

  return { ...key, encryptor };
}

function getPublicKey(server, invalidKeyId) {
  let entry = keyCache.get(server);

  if (!entry) {
    entry = {};
    keyCache.set(server, entry);
  }

  if (invalidKeyId && entry.key?.keyId === invalidKeyId) entry.key = null;
  if (entry.key && Date.now() < entry.expiresAt) return Promise.resolve(entry.key);
  if (entry.pending) return entry.pending;

  const startedAt = Date.now();
  entry.pending = request(server, 'crypto/publicKey', {})
    .then(response => {
      if (response?.state !== 1) throw requestError(response, _l('获取加密公钥失败，请稍后重试'));
      const key = validateKey(response.data);

      // Do not retain a disabled response: encryption may be enabled before the next submission.
      if (key.enabled) {
        entry.key = key;
        entry.expiresAt = startedAt + Math.max(0, key.expireSeconds - 5) * 1000;
      }

      return key;
    })
    .finally(() => {
      entry.pending = null;
    });
  return entry.pending;
}

function encryptPayload(payload, key, passwordField) {
  const result = _.cloneDeep(payload);
  if (!key.enabled) return result;

  const encryptField = value => {
    if (value === undefined || value === null || value === '' || value === PASSWORD_PLACEHOLDER) return value;
    if (typeof value !== 'string') throw requestError(null, _l('密码格式不正确'));
    // JSEncrypt 3.2.1 encodes UTF-16 surrogates incorrectly; do not silently change a password.
    if (/[\uD800-\uDFFF]/.test(value)) {
      throw requestError(null, _l('密码包含当前加密方式不支持的字符'));
    }

    if (new TextEncoder().encode(value).length > 245) {
      throw requestError(null, _l('密码超过加密长度限制（245字节）'));
    }

    const cipher = key.encryptor.encrypt(value);
    if (!cipher) throw requestError(null, _l('敏感信息加密失败，请稍后重试'));
    return `${key.cipherPrefix}${key.keyId}:${cipher}`;
  };

  if (Object.prototype.hasOwnProperty.call(result, passwordField)) {
    result[passwordField] = encryptField(result[passwordField]);
  }

  if (passwordField === 'password' && result.extraParams && typeof result.extraParams === 'object') {
    SSL_PASSWORD_FIELDS.forEach(field => {
      if (Object.prototype.hasOwnProperty.call(result.extraParams, field)) {
        result.extraParams[field] = encryptField(result.extraParams[field]);
      }
    });
  }

  return result;
}

export function sensitiveRequest(path, args, options = {}, passwordField = 'password') {
  const controller = options.abortController || new AbortController();
  const server = base.server(options).replace(/\/+$/, '') + '/';
  const payload = _.cloneDeep(args);

  const submit = async () => {
    checkAborted(controller.signal);
    let key = await getPublicKey(server);

    for (let attempt = 0; attempt < 2; attempt++) {
      checkAborted(controller.signal);
      const encrypted = encryptPayload(payload, key, passwordField);
      const response = await request(server, path, encrypted, { ...options, abortController: controller });
      checkAborted(controller.signal);
      if (response?.state === 1) return response.data;
      if (attempt === 0 && key.enabled && RETRY_STATES.includes(response?.state)) {
        key = await getPublicKey(server, key.keyId);
      } else {
        throw requestError(response, _l('请求失败，请稍后重试'));
      }
    }
  };

  const promise = submit();
  promise.abort = () => controller.abort();
  return promise;
}
