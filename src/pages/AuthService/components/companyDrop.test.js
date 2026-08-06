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

function createStyledComponent(tag) {
  return () => {
    const Component = ({ children, ...props }) => React.createElement(tag, props, children);
    Component.displayName = `Styled${tag}`;
    return Component;
  };
}

function renderDrop({ isMobile, multiple }) {
  let dropdownProps;
  const Drop = requireEsm('companyDrop.jsx', {
    'src/utils/common': {
      browserIsMobile: () => isMobile,
    },
    'ming-ui': {
      Dropdown: props => {
        dropdownProps = props;
        return React.createElement('div', { className: 'dropdown' });
      },
      Icon: () => React.createElement('i'),
    },
    'styled-components': {
      __esModule: true,
      default: {
        div: createStyledComponent('div'),
      },
    },
  }).default;

  ReactDOMServer.renderToStaticMarkup(
    React.createElement(Drop, {
      extraDatas: {},
      warnList: [],
      updateCompany: () => {},
      updateState: () => {},
      info: {
        id: 'jobLevel',
        multiple,
        options: [
          { id: 'ceo', name: '总裁/总经理/CEO' },
          { id: 'staff', name: '员工/专员/执行' },
        ],
      },
    }),
  );

  return dropdownProps;
}

global._l = global._l || (text => text);

assert.strictEqual(renderDrop({ isMobile: true, multiple: 0 }).openSearch, false, '移动端单选不应展示搜索输入');
assert.strictEqual(renderDrop({ isMobile: true, multiple: 1 }).openSearch, false, '移动端多选不应展示搜索输入');

console.log('AuthService companyDrop tests passed');
