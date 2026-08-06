const assert = require('assert');
const path = require('path');
const { transformFileSync } = require('@babel/core');

function requireEsm(file, stubs = {}) {
  const module = { exports: {} };
  const { code } = transformFileSync(path.join(__dirname, file), {
    babelrc: false,
    presets: ['@babel/preset-react'],
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
const alertMessages = [];
global.alert = (message, type) => alertMessages.push({ message, type });
global.safeParse =
  global.safeParse ||
  ((value, defaultValue = {}) => {
    try {
      return JSON.parse(value);
    } catch {
      return defaultValue === 'array' ? [] : defaultValue;
    }
  });

const { errorMessage, returnCustonValue } = requireEsm('./utils.js', {
  react: {},
  'ming-ui/components/Dialog': {},
  '../config/config': {},
});

assert.doesNotThrow(() => errorMessage(null));
assert.deepStrictEqual(alertMessages.pop(), { message: '操作失败，请稍后重试', type: 2 });

assert.strictEqual(returnCustonValue({ type: 9, value: 'missing', options: [] }), '');
assert.strictEqual(returnCustonValue({ type: 11, value: 'missing', options: [] }), '');
assert.strictEqual(returnCustonValue({ type: 14, value: '{bad json' }), '');
assert.strictEqual(
  returnCustonValue({
    type: 14,
    value: JSON.stringify([{ originalFilename: '附件一' }, { originalFilename: '附件二' }]),
  }),
  '附件一, 附件二',
);

console.log('task utils tests passed');
