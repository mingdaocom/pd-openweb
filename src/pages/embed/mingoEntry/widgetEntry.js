import { ensureThirdPartyIntegrationFlags } from './env';

const DEFAULT_UPLOAD_HOST = 'https://upload.qiniup.com';
const DEFAULT_LANG = 'zh-Hans';
const LANG_PATH_MAP = {
  en: 'en',
  'zh-Hans': 'zh_Hans',
  'zh-Hant': 'zh_Hant',
  ja: 'ja',
  th: 'th',
  ms: 'ms',
};
const LANG_ALIAS_MAP = {
  zh: 'zh-Hans',
  'zh-cn': 'zh-Hans',
  zh_cn: 'zh-Hans',
  'zh-sg': 'zh-Hans',
  zh_sg: 'zh-Hans',
  'zh-hans': 'zh-Hans',
  zh_hans: 'zh-Hans',
  'zh-tw': 'zh-Hant',
  zh_tw: 'zh-Hant',
  'zh-hk': 'zh-Hant',
  zh_hk: 'zh-Hant',
  'zh-mo': 'zh-Hant',
  zh_mo: 'zh-Hant',
  'zh-hant': 'zh-Hant',
  zh_hant: 'zh-Hant',
  'en-us': 'en',
  en_us: 'en',
  'en-gb': 'en',
  en_gb: 'en',
  jp: 'ja',
  'ja-jp': 'ja',
  ja_jp: 'ja',
  'th-th': 'th',
  th_th: 'th',
  'ms-my': 'ms',
  ms_my: 'ms',
};
const localePromises = {};
let previousTranslate;
let explicitAgentUrl = '';

function trimSlash(url = '') {
  return String(url || '').replace(/\/+$/, '');
}

function ensureTrailingSlash(url = '') {
  const value = String(url || '');

  return value && !value.endsWith('/') ? value + '/' : value;
}

function joinUrl(base, path) {
  const normalizedBase = trimSlash(base);
  const normalizedPath = String(path || '').replace(/^\/+/, '');

  if (!normalizedBase) return '/' + normalizedPath;
  return normalizedBase + '/' + normalizedPath;
}

function getCookieValue(name) {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]*)(;|$)`));

  try {
    return match ? decodeURIComponent(match[2]) : '';
  } catch (err) {
    console.error(err);
    return match ? match[2] : '';
  }
}

function normalizeLang(lang) {
  const value = String(lang || '').trim();
  const normalizedValue = LANG_ALIAS_MAP[value] || LANG_ALIAS_MAP[value.toLowerCase()] || value;

  return LANG_PATH_MAP[normalizedValue] ? normalizedValue : DEFAULT_LANG;
}

function getBrowserLang() {
  return normalizeLang((navigator.languages && navigator.languages[0]) || navigator.language);
}

function getEntryLang(options = {}) {
  return normalizeLang(
    options.lang ||
      options.language ||
      new URL(location.href).searchParams.get('sys_lang') ||
      getCookieValue('i18n_langtag') ||
      document.documentElement.getAttribute('lang') ||
      getBrowserLang(),
  );
}

function getLocaleScriptUrl(lang, options = {}) {
  const localePath = LANG_PATH_MAP[lang] || LANG_PATH_MAP[DEFAULT_LANG];

  if (options.localeUrl) {
    return String(options.localeUrl)
      .replace(/\{lang\}/g, localePath)
      .replace(/\{langKey\}/g, lang);
  }

  const cacheKey = Math.floor(new Date().getHours() / 6);
  const query = `${new Date().toISOString().slice(0, 10).replace(/-/g, '_')}_${cacheKey}`;

  if (/mingdao\.com|share\.mingdao\.net|theportal\.cn/.test(location.href)) {
    return `https://alifile.mingdaocloud.com/lang/HAP/${localePath}/mdTranslation.js?${query}`;
  }

  return `${joinUrl(options.webUrl || location.origin, `/staticfiles/lang/${localePath}/mdTranslation.js`)}?${query}`;
}

function installEntryTranslator() {
  if (!previousTranslate && window._l && !window._l.__mingoEntryLite) {
    previousTranslate = window._l;
  }

  const translator = function (key, ...args) {
    let content = key;
    const entryTranslations = window.__mingoEntryTranslations || {};

    if (entryTranslations[key]) {
      content = entryTranslations[key];
    } else if (previousTranslate) {
      content = previousTranslate(key, ...args);
    }

    if (args.length > 0) {
      for (let i = 0; i < args.length; i++) {
        content = String(content).replace(new RegExp(`%${i}`, 'g'), args[i]);
      }
    } else if (/.*%\d{5}/.test(content)) {
      content = String(content).replace(/%\d{5}$/, '');
    }

    return String(content).replace(/\\/g, '');
  };

  translator.__mingoEntryLite = true;
  window._l = translator;
}

function loadLocaleScript(lang, options = {}) {
  const currentLang = normalizeLang(lang);

  if (currentLang === DEFAULT_LANG) {
    window.__mingoEntryTranslations = {};
    return Promise.resolve();
  }

  if (localePromises[currentLang]) return localePromises[currentLang];

  localePromises[currentLang] = new Promise(resolve => {
    const src = getLocaleScriptUrl(currentLang, options);
    const existing = document.querySelector(`script[data-mingo-entry-locale="${currentLang}"]`);
    const hostTranslations = window.translations;

    const restoreHostTranslations = () => {
      window.__mingoEntryTranslations = window.translations || {};
      window.translations = hostTranslations;
    };

    if (existing) {
      if (existing.getAttribute('data-loaded') === 'true') {
        if (!window.__mingoEntryTranslations) window.__mingoEntryTranslations = window.translations || {};
        resolve();
        return;
      }

      existing.addEventListener(
        'load',
        () => {
          restoreHostTranslations();
          resolve();
        },
        { once: true },
      );
      existing.addEventListener(
        'error',
        () => {
          window.translations = hostTranslations;
          resolve();
        },
        { once: true },
      );
      return;
    }

    const script = document.createElement('script');

    script.src = src;
    script.async = true;
    script.dataset.mingoEntryLocale = currentLang;
    script.addEventListener(
      'load',
      () => {
        script.setAttribute('data-loaded', 'true');
        restoreHostTranslations();
        resolve();
      },
      { once: true },
    );
    script.addEventListener(
      'error',
      () => {
        console.error(`[mingo-entry] load locale failed: ${src}`);
        window.translations = hostTranslations;
        resolve();
      },
      { once: true },
    );
    document.head.appendChild(script);
  });

  return localePromises[currentLang];
}

function readJson(response) {
  return response
    .json()
    .catch(() => null)
    .then(data => ({ response, data }));
}

function stripHtml(value) {
  const div = document.createElement('div');

  div.innerHTML = String(value || '');
  return div.textContent || div.innerText || '';
}

function isNativeAlert(fn) {
  try {
    return /\[native code\]/.test(Function.prototype.toString.call(fn));
  } catch {
    return false;
  }
}

function createEntryAlert(content, type = 1) {
  const message = stripHtml(typeof content === 'object' && content ? content.msg : content);
  const toast = document.createElement('div');

  toast.className = `mingoEntryToast type-${type}`;
  toast.textContent = message;
  Object.assign(toast.style, {
    position: 'fixed',
    left: '50%',
    top: '24px',
    zIndex: 999999,
    maxWidth: 'min(420px, calc(100vw - 32px))',
    padding: '10px 16px',
    borderRadius: '8px',
    color: 'var(--color-text-inverse)',
    background: 'var(--color-background-inverse)',
    boxShadow: 'var(--shadow-lg)',
    fontSize: '14px',
    lineHeight: '20px',
    textAlign: 'center',
    transform: 'translateX(-50%)',
  });
  document.body.appendChild(toast);

  window.setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 3000);
}

function createMdyAPI(apiServer) {
  const mdyAPI = (controllerName, actionName, requestData, options = {}) => {
    const controller = options.abortController || new AbortController();
    const ajaxOptions = options.ajaxOptions || {};
    const method = (ajaxOptions.type || 'POST').toUpperCase();
    const url = ajaxOptions.url || joinUrl(apiServer, `${controllerName}/${encodeURIComponent(actionName)}`);
    const headers = {
      Authorization: '',
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
      ...(ajaxOptions.header || {}),
    };
    const fetchOptions = {
      method,
      headers,
      credentials: ajaxOptions.url ? 'same-origin' : 'include',
      signal: controller.signal,
    };

    if (method === 'GET') {
      const query = new URLSearchParams(requestData || {}).toString();
      fetchOptions.url = query ? `${url}?${query}` : url;
    } else {
      fetchOptions.body = JSON.stringify(requestData || {});
    }

    const request = fetch(fetchOptions.url || url, fetchOptions);

    if (options.isReadableStream) {
      if (options.agent) {
        return request.then(async response => {
          if (response.status === 429) {
            const limitData = await response
              .clone()
              .json()
              .catch(() => null);
            limitData && limitData.errorMessage && alert(limitData.errorMessage, 2);
          }

          return response;
        });
      }

      return request;
    }

    const promise = request.then(readJson).then(({ response, data }) => {
      if (!response.ok || (data && data.exception)) {
        if (options.agent && response.status === 429 && data && data.errorMessage) {
          alert(data.errorMessage, 2);
        }

        if (!options.silent && data && data.exception) {
          alert(data.exception, 2);
        }

        throw {
          status: response.status,
          response: { status: response.status, data },
          data,
        };
      }

      if (options.agent || options.customParseResponse) return data;
      return data && Object.prototype.hasOwnProperty.call(data, 'data') ? data.data : data;
    });

    promise.abort = () => controller.abort();
    return promise;
  };

  mdyAPI.__mingoEntryLite = true;
  return mdyAPI;
}

function getFirstProjectId() {
  const projects = window.md && window.md.global && window.md.global.Account && window.md.global.Account.projects;
  const firstProject = Array.isArray(projects) ? projects[0] : null;

  return firstProject && firstProject.projectId;
}

function getContextProjectId(args = {}) {
  return args.context && args.context.projectId;
}

function bindAgentAPIToMdyAPI() {
  const agentAPI = (args = {}, options = {}) => {
    const { url, method = 'POST', isStream, silent, header, abortController } = options;
    const agentHost = ((window.md && window.md.global && window.md.global.Config.AgentUrl) || '').replace(/\/$/, '');
    const fullUrl = window.isProduction && agentHost && url && url.startsWith('/') ? agentHost + url : url;
    let requestArgs = args;

    if (/\/agent\/execute/.test(url || '')) {
      const projectId =
        args.projectId || getContextProjectId(args) || localStorage.getItem('currentProjectId') || getFirstProjectId();

      if (projectId) {
        requestArgs = { ...args, projectId: String(projectId) };
      }
    }

    return window.mdyAPI(null, null, requestArgs, {
      agent: true,
      silent,
      abortController,
      isReadableStream: isStream,
      ajaxOptions: { url: fullUrl, type: method, header },
    });
  };

  agentAPI.__mingoEntryLite = true;
  window.agentAPI = agentAPI;
}

function getStoredCaptchaType() {
  try {
    const value = window.localStorage.getItem('captchaType');
    const type = parseInt(value, 10);

    return Number.isNaN(type) ? undefined : type;
  } catch {
    return undefined;
  }
}

function getCaptchaType() {
  const storedType = getStoredCaptchaType();

  if (storedType !== undefined) return storedType;
  if (!window.TencentCaptcha) return 1;

  const config = (window.md && window.md.global && window.md.global.Config) || {};
  const configType = parseInt(config.CaptchaType, 10);

  return Number.isNaN(configType) ? 0 : configType;
}

function getGlobalMetaPayload(data) {
  if (!data || typeof data !== 'object') return null;
  if (data['md.global'] && typeof data['md.global'] === 'object') return data['md.global'];
  if (data.Config || data.FileStoreConfig || data.SysSettings || data.Account) return data;
  return null;
}

function mergeGlobalSection(current = {}, next = {}) {
  return {
    ...(current || {}),
    ...(next || {}),
  };
}

function applyGlobalMeta(data) {
  const globalMeta = getGlobalMetaPayload(data);

  if (!globalMeta || !window.md || !window.md.global) return;

  const current = window.md.global || {};
  const getCaptchaTypeFn = current.getCaptchaType || getCaptchaType;
  const preservedAgentUrl = explicitAgentUrl || '';

  window.md.global = {
    ...current,
    ...globalMeta,
    Account: mergeGlobalSection(current.Account, globalMeta.Account),
    Config: {
      ...mergeGlobalSection(current.Config, globalMeta.Config),
      ...(preservedAgentUrl ? { AgentUrl: preservedAgentUrl } : {}),
    },
    FileStoreConfig: mergeGlobalSection(current.FileStoreConfig, globalMeta.FileStoreConfig),
    SysSettings: mergeGlobalSection(current.SysSettings, globalMeta.SysSettings),
    getCaptchaType: getCaptchaTypeFn,
  };
}

function setupRuntime(options = {}) {
  const webUrl = trimSlash(options.webUrl || window.location.origin);
  const apiServer = ensureTrailingSlash(options.apiServer || joinUrl(webUrl, '/api'));
  const agentUrl = trimSlash(options.agentUrl || webUrl);
  const lang = getEntryLang(options);

  if (options.agentUrl) explicitAgentUrl = agentUrl;
  window.__api_server__ = {
    ...(window.__api_server__ || {}),
    main: apiServer,
  };
  window.isProduction = true;
  ensureThirdPartyIntegrationFlags();
  window.subPath = window.subPath || '';
  window.shareState = window.shareState || {};
  window.platformENV = window.platformENV || { isOverseas: false, isLocal: false, isPlatform: false };
  installEntryTranslator();

  window.safeParse =
    window.safeParse ||
    function (str, type) {
      if (!str) return type === 'array' ? [] : {};
      if (typeof str === 'object') return str;
      try {
        return JSON.parse(str);
      } catch {
        return type === 'array' ? [] : {};
      }
    };

  window.safeLocalStorageSetItem =
    window.safeLocalStorageSetItem ||
    function (...args) {
      try {
        window.localStorage.setItem(...args);
      } catch (err) {
        console.error(err);
      }
    };

  window.getCookie =
    window.getCookie ||
    function (name) {
      const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]*)(;|$)`));

      return match ? decodeURIComponent(match[2]) : null;
    };

  window.setCookie =
    window.setCookie ||
    function (name, value) {
      document.cookie = `${name}=${encodeURIComponent(value)};path=/;SameSite=Lax`;
    };

  window.delCookie =
    window.delCookie ||
    function (name) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    };

  window.getCurrentLang = () => lang;
  document.body.setAttribute('id', lang);
  window.clearLocalDataTime = window.clearLocalDataTime || (() => {});
  if (!window.nativeAlert && window.alert) window.nativeAlert = window.alert;
  if (!window.alert || isNativeAlert(window.alert)) window.alert = createEntryAlert;
  window.md = window.md || { global: {} };
  window.md.global = {
    ...(window.md.global || {}),
    Account: { accountId: '', projects: [], ...((window.md.global || {}).Account || {}) },
    Config: {
      ...((window.md.global || {}).Config || {}),
      DefaultLang: lang,
      WebUrl: webUrl,
      AgentUrl: agentUrl,
      ...(options.captchaType !== undefined ? { CaptchaType: options.captchaType } : {}),
      ...(options.captchaAppId ? { CaptchaAppId: options.captchaAppId } : {}),
    },
    FileStoreConfig: {
      ...((window.md.global || {}).FileStoreConfig || {}),
      uploadHost: options.uploadHost || (window.md.global.FileStoreConfig || {}).uploadHost || DEFAULT_UPLOAD_HOST,
    },
    SysSettings: {
      ...((window.md.global || {}).SysSettings || {}),
      aiBrandName: options.aiBrandName || 'Mingo',
      aiBrandThemeColor: options.themeColor || '',
      enableVoiceToText: false,
    },
    getCaptchaType: (window.md.global || {}).getCaptchaType || getCaptchaType,
  };
  applyGlobalMeta(options.globalMeta);
  if (!window.mdyAPI || window.mdyAPI.__mingoEntryLite) {
    window.mdyAPI = createMdyAPI(apiServer);
  }

  if (!window.agentAPI || window.agentAPI.__mingoEntryLite) {
    bindAgentAPIToMdyAPI();
  }

  return { lang };
}

function loadStyles() {
  require('src/common/mdcss/themes/theme-default.less');
  require('src/common/mdcss/iconfont/mdfont.css');
  require('src/common/mdcss/mingoEntryUtilities.css');
}

function mount(container, options = {}) {
  if (!container) {
    throw new Error('MingoEntry.mount requires a container element.');
  }

  const { lang } = setupRuntime(options);
  loadStyles();
  if (typeof options.ensureGlobalMeta === 'function') {
    window.__mingoEntryEnsureGlobalMeta = () =>
      Promise.resolve(options.ensureGlobalMeta()).then(data => {
        applyGlobalMeta(data);
        return data;
      });
  }

  const React = require('react');
  const { createRoot } = require('react-dom/client');
  const root = createRoot(container);
  let destroyed = false;

  loadLocaleScript(lang, options)
    .then(() => import('./EntryWidget'))
    .then(module => {
      if (destroyed) return;

      const EntryWidget = module.default;

      root.render(
        React.createElement(EntryWidget, {
          webUrl: options.webUrl,
          transparentBody: false,
          ensureGlobalMeta: options.ensureGlobalMeta,
          applyGlobalMeta,
        }),
      );
    })
    .catch(err => {
      console.error('[mingo-entry] load widget failed', err);
    });

  return {
    unmount() {
      destroyed = true;
      root.unmount();
    },
  };
}

const api = { mount };

if (typeof window !== 'undefined') {
  window.MingoEntry = api;
}

export default api;
