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
    getStore: () => store,
  };
}

function setStorage(storage) {
  Object.defineProperty(global, 'localStorage', {
    value: storage,
    configurable: true,
    writable: true,
  });
  global.safeLocalStorageSetItem = (...args) => global.localStorage.setItem(...args);
}

global.md = { global: { Account: { accountId: 'account-1', isPortal: false } } };
global.safeParse =
  global.safeParse ||
  ((value, defaultValue = {}) => {
    try {
      return JSON.parse(value);
    } catch {
      return defaultValue === 'array' ? [] : defaultValue;
    }
  });

const { moveSheetCache, saveSelectExtensionNavType } = requireEsm('./worksheet.js', {
  'src/pages/FormSet/config.js': {
    permitList: {},
  },
  'src/pages/FormSet/util.js': {
    isOpenPermit: () => true,
  },
  'src/pages/widgetConfig/config/widget': {
    WIDGETS_TO_API_TYPE_ENUM: {},
  },
  'src/pages/worksheet/common/ViewConfig/config': {
    CARD_WIDTH_SETTING: {},
  },
  'src/pages/worksheet/common/ViewConfig/utils': {
    getCoverStyle: () => ({}),
  },
});

setStorage(createStorage());

assert.doesNotThrow(() => moveSheetCache('app-1', 'group-1'));

setStorage(
  createStorage({
    'mdAppCache_account-1_app-1': JSON.stringify({
      lastWorksheetId: 'worksheet-1',
      worksheets: [
        { groupId: 'group-1', worksheetId: 'worksheet-1' },
        { groupId: 'group-2', worksheetId: 'worksheet-2' },
      ],
    }),
  }),
);

moveSheetCache('app-1', 'group-1');
assert.deepStrictEqual(JSON.parse(localStorage.getItem('mdAppCache_account-1_app-1')).worksheets, [
  { groupId: 'group-1', worksheetId: '' },
  { groupId: 'group-2', worksheetId: 'worksheet-2' },
]);

setStorage(createStorage({ sheetConfigNavInfo: '{bad json' }));
assert.doesNotThrow(() => saveSelectExtensionNavType('worksheet-1', 'type', 'value'));
assert.deepStrictEqual(JSON.parse(localStorage.getItem('sheetConfigNavInfo')), {
  'worksheet-1': {
    type: 'value',
  },
});

console.log('worksheet utils tests passed');
