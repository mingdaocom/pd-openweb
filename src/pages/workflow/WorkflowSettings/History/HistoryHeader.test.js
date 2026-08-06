const assert = require('assert');
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
    if (stubs[request]) {
      return stubs[request];
    }

    return require(request);
  }

  new Function('module', 'exports', 'require', code)(module, module.exports, localRequire);
  return module.exports;
}

const rangePickerProps = [];
const DatePicker = {};

DatePicker.RangePicker = props => {
  rangePickerProps.push(props);
  return React.createElement('div', { className: 'rangePicker' });
};

global._l = text => text;
global.getCookie = () => 'zh-Hans';
global.window = {
  getDefaultLangKey: () => 'zh-Hans',
};

const HistoryHeader = requireEsm('./HistoryHeader.jsx', {
  antd: { DatePicker },
  'antd/es/date-picker/locale/en_US': { __esModule: true, default: { lang: { locale: 'en_US' } } },
  'antd/es/date-picker/locale/ja_JP': { __esModule: true, default: { lang: { locale: 'ja_JP' } } },
  'antd/es/date-picker/locale/zh_CN': { __esModule: true, default: { lang: { locale: 'zh_CN' } } },
  'antd/es/date-picker/locale/zh_TW': { __esModule: true, default: { lang: { locale: 'zh_TW' } } },
  'ming-ui': {
    Dropdown: () => React.createElement('div'),
    Icon: () => React.createElement('i'),
  },
  'ming-ui/antd-components': {
    Tooltip: ({ children }) => React.createElement(React.Fragment, null, children),
  },
  '../../api/instanceVersion': {
    endInstanceList: () => Promise.resolve(),
    resetInstanceList: () => Promise.resolve(),
  },
  '../../components/Search': { __esModule: true, default: () => React.createElement('div') },
  '../enum': {
    EXPIRE_LIST: [],
  },
  './components/SerialProcessDialog': { __esModule: true, default: () => React.createElement('div') },
  './config': {
    FLOW_STATUS: {
      1: { status: 'pending', text: '进行中' },
    },
  },
}).default;

ReactDOMServer.renderToStaticMarkup(
  React.createElement(HistoryHeader, {
    batchIds: [],
    archivedItem: {},
    onFilter: () => {},
    onRefresh: () => {},
  }),
);

assert.strictEqual(rangePickerProps.length, 1);
assert.strictEqual(rangePickerProps[0].showNow, undefined);
assert.ok(rangePickerProps[0].ranges, 'workflow history range picker should expose quick ranges');
assert.strictEqual(typeof rangePickerProps[0].ranges['此刻'], 'function');

const nowRange = rangePickerProps[0].ranges['此刻']();

assert.strictEqual(nowRange.length, 2);
assert.strictEqual(nowRange[0].valueOf(), nowRange[1].valueOf());
assert.ok(Math.abs(Date.now() - nowRange[0].valueOf()) < 2000);

console.log('HistoryHeader tests passed');
