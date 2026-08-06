const assert = require('assert');
const fs = require('fs');
const path = require('path');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
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

  new Function('module', 'exports', 'require', '_l', code)(module, module.exports, localRequire, global._l);
  return module.exports;
}

global._l = text => text;

const styled = {
  div: () => 'div',
};

const passthrough = ({ children }) => React.createElement(React.Fragment, null, children);

const ArchivedList = requireEsm('./index.jsx', {
  'styled-components': { __esModule: true, default: styled },
  'rc-trigger': { __esModule: true, default: passthrough },
  'ming-ui': {
    Icon: () => React.createElement('i'),
    Menu: passthrough,
    MenuItem: passthrough,
  },
  'ming-ui/antd-components': {
    Tooltip: passthrough,
  },
  'src/api/appManagement': { __esModule: true, default: {} },
  'src/api/worksheet': { __esModule: true, default: {} },
  'src/pages/workflow/api/instance': { __esModule: true, default: {} },
}).default;

const html = ReactDOMServer.renderToStaticMarkup(
  React.createElement(ArchivedList, {
    archivedItem: {
      id: 'archive-1',
      start: '2026-01-01 00:00',
      end: '2026-02-01 00:00',
      text: '2026 年 1 月归档数据',
    },
  }),
);

assert.ok(html.includes('2026 年 1 月归档数据'));
assert.strictEqual(html.includes('2026-01-01 00:00'), false);
assert.strictEqual(html.includes('2026-02-01 00:00'), false);
assert.strictEqual(html.includes('至'), false);

const source = fs.readFileSync(path.join(__dirname, 'index.jsx'), 'utf8');

assert.strictEqual(source.includes('className="flexColumn"'), false);
assert.ok(source.includes('className="pTop8 pBottom8 Font14"'));
assert.ok(source.includes("style={{ lineHeight: 'normal', height: 36 }}"));

console.log('ArchivedList tests passed');
