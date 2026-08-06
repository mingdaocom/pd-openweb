const assert = require('assert');
const path = require('path');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const { transformFileSync } = require('@babel/core');

function requireHeader(stubs = {}) {
  const module = { exports: {} };
  const { code } = transformFileSync(path.join(__dirname, 'Header.jsx'), {
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
  return module.exports.default;
}

const EmptyComponent = () => React.createElement('div');
const styled = Component => () => Component;
const PublicAppLangDropdown = () => React.createElement('span', { 'data-public-lang': true });

const Header = requireHeader({
  'styled-components': styled,
  'ming-ui': {
    BgIconButton: EmptyComponent,
    Icon: EmptyComponent,
  },
  'ming-ui/antd-components': {
    Tooltip: ({ children }) => React.createElement(React.Fragment, null, children),
  },
  'src/api/discussion': {},
  'src/api/favorite.js': {},
  'src/api/worksheet': {},
  'worksheet/constants/enum': {
    RECORD_INFO_FROM: {
      DRAFT: 'draft',
      WORKFLOW: 'workflow',
    },
  },
  'src/components/CreateByMingDaoYun': {
    __esModule: true,
    default: EmptyComponent,
  },
  'src/components/PublicAppLangDropdown': {
    __esModule: true,
    default: PublicAppLangDropdown,
  },
  'src/pages/FormSet/config.js': {
    permitList: {},
  },
  'src/pages/FormSet/util.js': {
    isOpenPermit: () => false,
  },
  'src/pages/worksheet/common/recordInfo/RecordForm/PrintList': {
    __esModule: true,
    default: EmptyComponent,
  },
  'src/utils/common': {
    emitter: {
      addListener: () => {},
      removeListener: () => {},
    },
  },
  'src/utils/project': {
    getCurrentProject: () => ({}),
  },
  './IconBtn': {
    __esModule: true,
    default: EmptyComponent,
  },
  './MoreMenu': {
    __esModule: true,
    default: EmptyComponent,
  },
  './Operates': {
    __esModule: true,
    default: EmptyComponent,
  },
  './SwitchRecord': {
    __esModule: true,
    default: EmptyComponent,
  },
});

global._l = text => text;
global.md = {
  global: {
    Account: {},
    SysSettings: {},
  },
};

const defaultProps = {
  recordbase: {
    appId: 'appId',
    notDialog: true,
    recordId: 'recordId',
    worksheetId: 'worksheetId',
  },
  recordinfo: {
    formData: [],
    projectId: 'projectId',
  },
  sheetSwitchPermit: [],
  view: {},
  worksheetInfo: {},
};

function renderWithShareState(shareState) {
  global.window = {
    shareState,
  };

  return ReactDOMServer.renderToStaticMarkup(React.createElement(Header, defaultProps));
}

assert.doesNotMatch(
  renderWithShareState({ isPublicPage: true, shareId: 'pageShareId' }),
  /data-public-lang/,
  '自定义页面公开分享中的详情视图不应重复显示语言切换',
);
assert.match(
  renderWithShareState({ isPublicRecord: true, shareId: 'recordShareId' }),
  /data-public-lang/,
  '独立记录公开分享仍应显示语言切换',
);

console.log('RecordForm Header tests passed');
