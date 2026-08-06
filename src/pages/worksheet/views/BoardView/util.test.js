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

global._l = global._l || ((text, value) => (value === undefined ? text : text.replace('%0', value)));
global.safeParse =
  global.safeParse ||
  ((value, defaultValue = {}) => {
    try {
      return JSON.parse(value);
    } catch {
      return defaultValue === 'array' ? [] : defaultValue;
    }
  });

const { getTargetName } = requireEsm('./util.js', {
  'worksheet/common/ViewConfig/components/GroupSet/util': {
    canSetGroup: () => false,
  },
  'src/pages/widgetConfig/util': {
    getIconByType: () => '',
  },
  'src/pages/worksheet/views/util.js': {
    getTitleControlForCard: () => null,
  },
  'src/utils/record': {
    getRecordColorConfig: () => ({}),
  },
  '../util': {
    filterAndFormatterControls: () => [],
    getRecordAttachments: () => ({}),
    isDisabledCreate: () => false,
    RENDER_RECORD_NECESSARY_ATTR: [],
  },
  './config': {
    CAN_AS_BOARD_OPTION: [],
  },
});

assert.doesNotThrow(() => {
  assert.strictEqual(getTargetName('', { options: [] }, { type: 9 }), undefined);
  assert.strictEqual(getTargetName('{bad json', { options: [] }, { type: 29 }), undefined);
});

assert.strictEqual(
  getTargetName('["option-1"]', { options: [{ key: 'option-1', value: '选项一' }] }, { type: 9 }),
  '选项一',
);
assert.strictEqual(getTargetName('{"name":"记录一"}', {}, { type: 29 }), '记录一');

console.log('BoardView utils tests passed');
