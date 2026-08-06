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

function createStyledComponent(tag) {
  return () => {
    const Component = React.forwardRef((props, ref) => {
      const { children, ...rest } = props;

      delete rest.fullShow;
      delete rest.maxWidth;
      delete rest.isLastLine;

      return React.createElement(tag, { ...rest, ref }, children);
    });

    Component.displayName = `Styled${tag}`;
    return Component;
  };
}

const styled = {
  div: createStyledComponent('div'),
  input: createStyledComponent('input'),
};

const DatePicker = () => React.createElement('div', { className: 'datePicker' });
DatePicker.RangePicker = () => React.createElement('div', { className: 'rangePicker' });

const Select = ({ children }) => React.createElement('select', null, children);
Select.Option = ({ children }) => React.createElement('option', null, children);

global._l = global._l || (text => text);
global.getCurrentLangCode = () => 1;

const SearchWrap = requireEsm('./index.js', {
  antd: {
    DatePicker,
    Select,
  },
  'antd/es/date-picker/locale/en_US': { __esModule: true, default: { locale: 'en_US' } },
  'antd/es/date-picker/locale/ja_JP': { __esModule: true, default: { locale: 'ja_JP' } },
  'antd/es/date-picker/locale/zh_CN': { __esModule: true, default: { locale: 'zh_CN' } },
  'antd/es/date-picker/locale/zh_TW': { __esModule: true, default: { locale: 'zh_TW' } },
  '../CustomSelectDate': { __esModule: true, default: () => React.createElement('div') },
  '../SelectUser': { __esModule: true, default: () => React.createElement('div') },
  'react-motion': {
    Motion: ({ children }) => children({ rotate: 0 }),
    spring: value => value,
  },
  'react-use': {
    useSetState: initialState => {
      const [state, setState] = React.useState(initialState);
      return [state, patch => setState({ ...state, ...patch })];
    },
  },
  'styled-components': { __esModule: true, default: styled },
}).default;

assert.doesNotThrow(() => {
  ReactDOMServer.renderToStaticMarkup(
    React.createElement(SearchWrap, {
      searchList: [{ key: 'date', type: 'antdDatePicker', label: '日期' }],
      searchValues: {},
      onChange: () => {},
    }),
  );
});

console.log('SearchWrap tests passed');
