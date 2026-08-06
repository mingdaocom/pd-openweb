const assert = require('assert');
const path = require('path');
const { transformFileSync } = require('@babel/core');

function requireEsm(file, stubs = {}) {
  const module = { exports: {} };
  const { code } = transformFileSync(path.join(__dirname, file), {
    babelrc: false,
    plugins: ['@babel/plugin-transform-modules-commonjs'],
  });

  function localRequire(request) {
    if (stubs[request]) {
      return stubs[request];
    }

    return require(request);
  }

  new Function('module', 'exports', 'require', code)(module, module.exports, localRequire);
  return module.exports;
}

function createStorage(initialData = {}) {
  const store = { ...initialData };

  return {
    getItem: key => (Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null),
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: key => {
      delete store[key];
    },
  };
}

Object.defineProperty(global, 'sessionStorage', {
  value: createStorage({ addBehaviorLogInfo: '{bad json' }),
  configurable: true,
  writable: true,
});

global.md = {
  global: {
    Account: {
      accountId: 'account-1',
    },
  },
};
global.window = global.window || {};
global.safeParse =
  global.safeParse ||
  ((value, defaultValue = {}) => {
    try {
      return JSON.parse(value);
    } catch {
      return defaultValue === 'array' ? [] : defaultValue;
    }
  });

const logCalls = [];
const { addBehaviorLog } = requireEsm('./project.js', {
  'src/api/account': {},
  'src/api/actionLog': {
    addLog: data => {
      logCalls.push(data);
      return Promise.resolve(true);
    },
  },
  'src/api/project': {},
  'src/pages/Admin/settings/config': {
    SYS_CHART_COLORS: [],
    SYS_COLOR: {},
  },
});

assert.doesNotThrow(() => addBehaviorLog('worksheet', 'worksheet-1', {}, true));
assert.deepStrictEqual(logCalls, [{ type: 2, entityId: 'worksheet-1', params: {} }]);

console.log('project utils tests passed');
