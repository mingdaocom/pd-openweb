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

function component(tag) {
  return ({ children, ...props }) => React.createElement(tag, props, children);
}

function createStyledComponent(tag) {
  return () => component(tag);
}

global._l = text => text;
global.md = {
  global: {
    FileStoreConfig: {
      pictureHost: 'https://picture.example.com',
    },
    SysSettings: {
      brandLogoHeight: 40,
      brandLogoRedirectUrl: '',
      brandLogoUrl: 'https://example.com/ProjectLogo/custom-logo.png',
      enableFooterInfo: false,
      hideBrandLogo: false,
      passwordRegex: '',
      passwordRegexTip: '',
    },
  },
};
global.window = {
  history: {
    back: () => {},
  },
  isMingDaoApp: false,
  md: global.md,
  platformENV: {
    isLocal: true,
    isOverseas: false,
  },
};

let headerRenderCount = 0;
const SharedHeader = requireEsm('../components/Header.jsx', {
  'src/utils/common': {
    pathCompletion: url => url,
  },
}).default;

const Header = props => {
  headerRenderCount += 1;
  return React.createElement(SharedHeader, props);
};

const ResetPassword = requireEsm('index.jsx', {
  'react-document-title': {
    __esModule: true,
    default: component('div'),
  },
  'styled-components': {
    __esModule: true,
    default: {
      div: createStyledComponent('div'),
    },
  },
  'src/api/register': {
    __esModule: true,
    default: {},
  },
  'src/components/ChangeLang': {
    __esModule: true,
    default: component('div'),
  },
  'src/pages/AuthService/components/Footer.jsx': {
    __esModule: true,
    default: component('footer'),
  },
  'src/pages/AuthService/components/Header.jsx': {
    __esModule: true,
    default: Header,
  },
  'src/pages/AuthService/components/form.less': {},
  'src/router/navigateTo': {
    navigateTo: () => {},
  },
  'src/utils/common': {
    encrypt: value => value,
    getRequest: () => ({ state: 'reset-state', type: 1 }),
  },
  'src/utils/expression': {
    __esModule: true,
    default: {
      isPasswordValid: () => true,
    },
  },
  '../style': {
    WrapCom: component('main'),
  },
}).default;

const markup = ReactDOMServer.renderToStaticMarkup(React.createElement(ResetPassword));

assert.strictEqual(headerRenderCount, 1, '重置密码页应复用认证 Header');
// resetPassword 与 findPassword 一致，使用 <Header /> 不传 logo，由 Header 内部读取 SysSettings.brandLogoUrl
assert.ok(markup.includes('custom-logo.png'), '重置密码页应保留已配置的自定义 Logo');

global.md.global.SysSettings.brandLogoUrl = 'https://example.com/ProjectLogo/emptylogo.png';
const emptyLogoMarkup = ReactDOMServer.renderToStaticMarkup(React.createElement(ResetPassword));

assert.ok(!emptyLogoMarkup.includes('<img'), '重置密码页不应渲染默认 empty Logo');

console.log('AuthService resetPassword tests passed');
