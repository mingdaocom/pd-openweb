const assert = require('assert');
const path = require('path');
const { transformFileSync } = require('@babel/core');

const WIDGETS_TO_API_TYPE_ENUM = {
  TEXT: 2,
  MOBILE_PHONE: 3,
  TELEPHONE: 4,
  EMAIL: 5,
  NUMBER: 6,
  CRED: 7,
  MONEY: 8,
  FLAT_MENU: 9,
  MULTI_SELECT: 10,
  DROP_DOWN: 11,
  ATTACHMENT: 14,
  DATE: 15,
  DATE_TIME: 16,
  AREA_PROVINCE: 19,
  AREA_CITY: 23,
  AREA_COUNTY: 24,
  USER_PICKER: 26,
  DEPARTMENT: 27,
  SCORE: 28,
  RELATE_SHEET: 29,
  SUB_LIST: 34,
  CASCADER: 35,
  SWITCH: 36,
  LOCATION: 40,
  RICH_TEXT: 41,
  SIGNATURE: 42,
  TIME: 46,
  ORG_ROLE: 48,
  SEARCH: 50,
};

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

global._l = global._l || (text => text);
global.window = {
  platformENV: {
    isLocal: true,
    isOverseas: false,
  },
};
global.md = {
  global: {
    FileStoreConfig: {
      documentHost: 'https://files.example.com/storage',
      pictureHost: 'https://images.example.com/storage',
    },
  },
};

global.safeParse =
  global.safeParse ||
  ((value, defaultValue = {}) => {
    try {
      return JSON.parse(value);
    } catch {
      return defaultValue === 'array' ? [] : defaultValue;
    }
  });

const { formatAttachmentValue, getControlsSorts, toFixed, updateOptionsOfControl } = requireEsm('./control.js', {
  'copy-to-clipboard': () => {},
  'worksheet/constants/enum': {
    CONTROL_EDITABLE_WHITELIST: {},
    RELATE_RECORD_SHOW_TYPE: {},
    RELATION_SEARCH_SHOW_TYPE: {},
    SYSTEM_CONTROLS: [],
  },
  'src/components/Form/core/config': {
    FROM: {},
  },
  'src/components/Form/core/enum': {
    DEFAULT_TEXT: {},
    enumWidgetType: [],
    HAVE_VALUE_STYLE_WIDGET: [],
    WIDGETS_TO_API_TYPE_ENUM,
  },
  'src/pages/widgetConfig/config': {
    OPTION_COLORS_LIST: [],
  },
  'src/pages/widgetConfig/config/setting': {
    TITLE_SIZE_OPTIONS: [],
    UNIT_TO_TEXT: {},
    UNIT_TYPE: [],
  },
  'src/pages/widgetConfig/config/widget': {
    DEFAULT_DATA: {},
    SYSTEM_CONTROL_WITH_UAID: [],
    WIDGETS_TO_API_TYPE_ENUM,
    WORKFLOW_SYSTEM_CONTROL: [],
  },
  'src/pages/widgetConfig/util': {
    enumWidgetType: [],
    isSheetDisplay: () => false,
  },
  'src/pages/widgetConfig/util/setting': {
    canSetWidgetStyle: () => false,
    getDateToEn: value => value,
    getShowFormat: () => '',
    getTitleStyle: () => ({}),
  },
  'src/utils/controlCommon': {
    canSetWidgetStyle: () => false,
    dealMaskValue: value => value,
    getAdvanceSetting: () => ({}),
    getDateToEn: value => value,
    getShowFormat: () => '',
    getTitleStyle: () => ({}),
    handleAdvancedSettingChange: data => data,
    isSheetDisplay: () => false,
  },
  'src/pages/worksheet/components/CellControls/enum': {
    RELATION_TYPE_NAME: {},
  },
  'src/utils/common': {
    accMul: (a, b) => a * b,
    browserIsMobile: () => false,
    countChar: str => String(str || '').length,
    domFilterHtmlScript: value => value,
    getTemporaryAttachmentFromUrl: value => value,
  },
  'src/utils/expression': {
    __esModule: true,
    default: {
      fileIsPicture: () => false,
    },
  },
  'src/utils/project': {
    dateConvertToUserZone: value => value,
    dateServerZoneToAppZone: value => value,
    getTimeZone: () => ({ serverZone: 480, userZone: 480 }),
  },
});

assert.deepStrictEqual(getControlsSorts([{ controlId: 'a' }, {}, { data: { controlId: 'b' } }, { data: {} }, null]), [
  'a',
  'b',
]);

assert.deepStrictEqual(getControlsSorts([{ controlId: 'a' }, {}, { data: { controlId: 'b' } }], ['b', 'missing']), [
  'b',
  'a',
]);

assert.strictEqual(toFixed(1.005, 2), '1.01');
assert.strictEqual(toFixed(-1.005, 2), '-1.01');
assert.strictEqual(toFixed(1, 2), '1.00');

assert.deepStrictEqual(JSON.parse(formatAttachmentValue('{bad json')).attachments, []);

assert.doesNotThrow(() => {
  const value = JSON.stringify([
    {
      ext: '.txt',
      fileID: 'file-1',
      fileUrl: 'https://files.example.com/storage/docs/readme.txt',
      filesize: 12,
      originalFilename: 'readme',
      previewUrl: 'https://files.example.com/storage/docs/readme.txt',
    },
  ]);
  const result = JSON.parse(formatAttachmentValue(value, true));
  assert.strictEqual(result.attachments[0].url, 'https://files.example.com/storage/docs/readme.txt');
});

assert.doesNotThrow(() => {
  const control = updateOptionsOfControl({ options: [] }, '["add_custom"]', '{bad json');
  assert.deepStrictEqual(control.options, [
    {
      index: 1,
      isDeleted: false,
      key: undefined,
      color: '#1677ff',
      value: 'custom',
    },
  ]);
});

console.log('control utils tests passed');
