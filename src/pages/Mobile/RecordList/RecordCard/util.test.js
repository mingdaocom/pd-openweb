const assert = require('assert');
const path = require('path');
const { transformFileSync } = require('@babel/core');

global._l = global._l || (text => text);

function requireEsm(file, stubs = {}) {
  const module = { exports: {} };
  const { code } = transformFileSync(path.join(__dirname, file), {
    babelrc: false,
    plugins: ['@babel/plugin-transform-modules-commonjs'],
  });

  function localRequire(request) {
    if (stubs[request]) return stubs[request];
    if (request === 'lodash') return require('lodash');
    return require(request);
  }

  new Function('module', 'exports', 'require', code)(module, module.exports, localRequire);
  return module.exports;
}

const NAME_ID = '5e047c2ab2bfdd0001e9b8f9';
const OPTION_ID = '5e047c2ab2bfdd0001e9b8fa';
const controls = [
  { controlId: NAME_ID, controlName: '名称', type: 2, attribute: 1 },
  { controlId: OPTION_ID, controlName: '单选', type: 9, options: [{ key: 'option-2', value: '选项2' }] },
];
const row = { [NAME_ID]: '222', [OPTION_ID]: 'option-2' };

const { getMobileCardTitle } = requireEsm('./util.js', {
  'src/pages/worksheet/views/util.js': {
    getCardTitleFieldForView: (row, controls, view) => {
      const controlId = view.advancedSetting.viewtitle || controls.find(control => control.attribute === 1).controlId;
      const control = controls.find(control => control.controlId === controlId);
      return control ? { ...control, value: row[control.controlId] } : undefined;
    },
  },
  'src/utils/control': {
    renderText: control => {
      if ([9, 10, 11].includes(control.type)) {
        return control.options
          .filter(option => option.key === control.value)
          .map(option => option.value)
          .join(', ');
      }

      return control.value;
    },
  },
});

let title = getMobileCardTitle(row, controls, { advancedSetting: {} });
assert.strictEqual(title.titleControl.controlId, NAME_ID);
assert.strictEqual(title.titleText, '222');

title = getMobileCardTitle(row, controls, { advancedSetting: { viewtitle: OPTION_ID } });
assert.strictEqual(title.titleControl.controlId, OPTION_ID);
assert.strictEqual(title.titleText, '选项2');

title = getMobileCardTitle({ [NAME_ID]: '222', [OPTION_ID]: '' }, controls, {
  advancedSetting: { viewtitle: OPTION_ID },
});
assert.strictEqual(title.titleControl.controlId, OPTION_ID);
assert.strictEqual(title.titleText, '未命名');

title = getMobileCardTitle({ [NAME_ID]: '222', [OPTION_ID]: 'missing-option' }, controls, {
  advancedSetting: { viewtitle: OPTION_ID },
});
assert.strictEqual(title.titleControl.controlId, OPTION_ID);
assert.strictEqual(title.titleText, '未命名');

console.log('mobile RecordCard util tests passed');
