const assert = require('assert');
const path = require('path');
const { transformFileSync } = require('@babel/core');

const WIDGETS_TO_API_TYPE_ENUM = {
  USER_PICKER: 26,
  ORG_ROLE: 48,
  DEPARTMENT: 27,
  AREA_PROVINCE: 19,
  AREA_CITY: 23,
  AREA_COUNTY: 24,
  RELATE_SHEET: 29,
  CASCADER: 35,
  TEXT: 2,
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

global.safeParse =
  global.safeParse ||
  ((value, defaultValue = {}) => {
    try {
      return JSON.parse(value);
    } catch {
      return defaultValue === 'array' ? [] : defaultValue;
    }
  });

const { formatFilterValues, formatFilterValuesToServer } = requireEsm('./utils.js', {
  'pages/widgetConfig/config/widget': {
    WIDGETS_TO_API_TYPE_ENUM,
  },
  'worksheet/common/WorkSheetFilter/enum': {
    DATE_RANGE_TYPE: {},
    FILTER_CONDITION_TYPE: {},
  },
  'src/pages/worksheet/common/WorkSheetFilter/util': {
    getType: control => control.type,
    redefineComplexControl: control => control,
    validate: () => true,
  },
  'src/utils/common': {
    getRequest: () => ({}),
  },
});

assert.deepStrictEqual(
  formatFilterValues(WIDGETS_TO_API_TYPE_ENUM.USER_PICKER, [
    '{"id":"account-1","name":"张三","avatar":"avatar.png"}',
    'account-2',
  ]),
  [
    { accountId: 'account-1', fullname: '张三', avatar: 'avatar.png' },
    { accountId: 'account-2', fullname: undefined, avatar: undefined },
  ],
);

assert.deepStrictEqual(formatFilterValues(WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET, ['{"id":"row-1","name":"记录一"}']), [
  { rowid: 'row-1', name: '记录一' },
]);

assert.deepStrictEqual(
  formatFilterValuesToServer(WIDGETS_TO_API_TYPE_ENUM.USER_PICKER, [
    { accountId: 'account-1' },
    null,
    { accountId: 'account-2' },
  ]),
  ['account-1', 'account-2'],
);

assert.deepStrictEqual(formatFilterValuesToServer(WIDGETS_TO_API_TYPE_ENUM.TEXT, ['可保留', 123, undefined, '']), [
  '可保留',
]);

console.log('QuickFilter utils tests passed');
