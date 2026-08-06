const assert = require('assert');
const path = require('path');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const { transformFileSync } = require('@babel/core');
const { ServerStyleSheet } = require('styled-components');

function requireEsm(file, stubs = {}) {
  const moduleLike = { exports: {} };
  const { code } = transformFileSync(path.join(__dirname, file), {
    babelrc: false,
    presets: ['@babel/preset-react'],
    plugins: ['@babel/plugin-transform-modules-commonjs'],
  });

  function localRequire(request) {
    return stubs[request] || require(request);
  }

  new Function('module', 'exports', 'require', code)(moduleLike, moduleLike.exports, localRequire);
  return moduleLike.exports;
}

const { WrapCom } = requireEsm('style.jsx', {
  'src/utils/common': { browserIsMobile: () => false },
});
const sheet = new ServerStyleSheet();

const markup = ReactDOMServer.renderToStaticMarkup(
  sheet.collectStyles(React.createElement(WrapCom, null, React.createElement('div', { className: 'loginBox' }))),
);

const css = sheet.getStyleTags();
const componentClass = markup
  .match(/class="([^"]+)"/)[1]
  .split(' ')
  .pop();
const baseLoginBoxRule = css.match(new RegExp(`\\.${componentClass} \\.loginBox\\{([^}]*)\\}`));

assert.ok(baseLoginBoxRule, '应生成认证页公共 loginBox 样式');
assert.ok(baseLoginBoxRule[1].includes('flex:1 0 auto'), '桌面端 loginBox 应占用 Footer 外的剩余高度');
assert.ok(baseLoginBoxRule[1].includes('min-height:auto'), '桌面端 loginBox 不应额外撑满整个页面');

const mobileMediaIndex = css.search(/@media[^{]*max-width:\s*600px/);
const mobileCss = css.slice(mobileMediaIndex);
const mobileLoginBoxRule = mobileCss.match(new RegExp(`\\.${componentClass} \\.loginBox\\{([^}]*)\\}`));

assert.ok(mobileMediaIndex >= 0, '应生成认证页移动端媒体查询');
assert.ok(mobileLoginBoxRule, '应生成认证页移动端 loginBox 样式');
assert.ok(mobileLoginBoxRule[1].includes('flex:1 0 auto'), '移动端 loginBox 应将 Footer 保持在页面底部');

console.log('AuthService style tests passed');
