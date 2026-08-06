const assert = require('assert');
const path = require('path');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const { transformFileSync } = require('@babel/core');

function requireEsm(file, stubs = {}) {
  const moduleLike = { exports: {} };
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

  new Function('module', 'exports', 'require', code)(moduleLike, moduleLike.exports, localRequire);
  return moduleLike.exports;
}

function renderHeader(props = {}) {
  const Header = requireEsm('Header.jsx', {
    'src/utils/common': {
      pathCompletion: url => url,
    },
  }).default;

  return ReactDOMServer.renderToStaticMarkup(React.createElement(Header, props));
}

global.window = {
  isMingDaoApp: false,
  platformENV: {
    isLocal: true,
    isOverseas: false,
  },
};
global.md = {
  global: {
    FileStoreConfig: {
      pictureHost: 'https://example.com',
    },
    SysSettings: {
      brandLogoHeight: 40,
      brandLogoRedirectUrl: '',
      brandLogoUrl: 'https://example.com/ProjectLogo/emptylogo.png?imageView2/2/h/200/q/90',
      hideBrandLogo: false,
    },
  },
};

const emptyLogoMarkup = renderHeader({ lineLoading: true });

assert.ok(!emptyLogoMarkup.includes('<img'), '私有部署默认 empty Logo 不应渲染');
assert.ok(emptyLogoMarkup.includes('loadingLine'), '隐藏默认 Logo 不应影响加载条');

global.md.global.SysSettings.brandLogoUrl = 1;
assert.doesNotThrow(() => renderHeader(), '系统品牌 Logo 不是字符串时不应导致 Header 渲染异常');
global.md.global.SysSettings.brandLogoUrl = 'https://example.com/ProjectLogo/emptylogo.png?imageView2/2/h/200/q/90';

// isDefaultLogo 仅在非海外/本地部署分支生效（接口标记为默认 Logo 时不渲染）
global.window.platformENV.isLocal = false;
const defaultLogoMarkup = renderHeader({
  logo: 'https://example.com/ProjectLogo/default-project.png',
  hasGetLogo: true,
  isDefaultLogo: true,
});

assert.ok(!defaultLogoMarkup.includes('<img'), '接口标记为默认 Logo 时不应渲染');
global.window.platformENV.isLocal = true;

const customLogoMarkup = renderHeader({
  logo: 'https://example.com/ProjectLogo/custom-logo.png',
  hasGetLogo: true,
  isDefaultLogo: false,
});

assert.ok(customLogoMarkup.includes('<img'), '自定义 Logo 应正常渲染');
assert.ok(customLogoMarkup.includes('custom-logo.png'), '应使用已配置的自定义 Logo');

console.log('AuthService Header tests passed');
