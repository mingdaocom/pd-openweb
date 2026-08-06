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
    if (stubs[request]) return stubs[request];
    return require(request);
  }

  new Function('module', 'exports', 'require', code)(module, module.exports, localRequire);
  return module.exports;
}

global._l = text => text;

const { handleCopyOptionClick } = requireEsm('./MoreOption.jsx', {
  react: {
    Component: class {},
    Fragment: 'Fragment',
    createElement: () => null,
  },
  'ming-ui': {
    Dialog: { confirm: () => null },
    Icon: () => null,
  },
  'ming-ui/components/ClickAway': {
    wrap: Component => Component,
  },
});

const calls = [];
handleCopyOptionClick({
  event: { stopPropagation: () => calls.push('stop') },
  setFn: value => calls.push(['setFn', value]),
  onCopy: () => calls.push('copy'),
});

assert.deepStrictEqual(calls, ['stop', ['setFn', { showMoreOption: false }], 'copy']);

console.log('MoreOption tests passed');
