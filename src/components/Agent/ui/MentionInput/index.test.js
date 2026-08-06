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

  new Function('module', 'exports', 'require', 'window', '_l', 'md', code)(
    module,
    module.exports,
    localRequire,
    global.window,
    global._l,
    global.md,
  );
  return module.exports;
}

global._l = text => text;
global.md = { global: { Account: { projects: [] } } };
global.window = { getSelection: () => null };

const styled = {
  div: () => 'div',
};

const { applySelectionRange } = requireEsm('./index.jsx', {
  'styled-components': { __esModule: true, default: styled },
  'src/utils/common': { browserIsMobile: () => false },
  '../../appSource': {
    fetchDefaultApps: () => [],
    readAppCache: () => null,
    searchApps: () => [],
    writeAppCache: () => null,
  },
  './AppMentionPopup': { __esModule: true, default: () => null },
});

const range = { range: true };

assert.doesNotThrow(() => {
  window.getSelection = () => null;
  applySelectionRange(range);
});

const calls = [];
window.getSelection = () => ({
  removeAllRanges: () => calls.push('removeAllRanges'),
  addRange: currentRange => calls.push(['addRange', currentRange]),
});

applySelectionRange(range);

assert.deepStrictEqual(calls, ['removeAllRanges', ['addRange', range]]);

console.log('MentionInput tests passed');
