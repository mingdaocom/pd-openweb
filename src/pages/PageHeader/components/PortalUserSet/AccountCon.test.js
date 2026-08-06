const assert = require('assert');
const path = require('path');
const { transformFileSync } = require('@babel/core');

let createIntlTelInputOptions;
let createIntlTelInputCount = 0;

function createElement(type, props, ...children) {
  return { type, props: props || {}, children };
}

function hasClassName(tree, targetClassName) {
  if (!tree || typeof tree !== 'object') return false;
  const classNames = String(tree.props?.className || '').split(/\s+/);

  if (classNames.includes(targetClassName)) return true;

  return (tree.children || []).some(child => hasClassName(child, targetClassName));
}

function loadModule() {
  const moduleLike = { exports: {} };
  const { code } = transformFileSync(path.join(__dirname, 'AccountCon.jsx'), {
    babelrc: false,
    presets: ['@babel/preset-react'],
    plugins: ['@babel/plugin-transform-modules-commonjs'],
  });

  class Component {
    constructor(props) {
      this.props = props;
      this.state = {};
    }

    setState(nextState) {
      this.state = {
        ...this.state,
        ...nextState,
      };
    }
  }

  function localRequire(importPath) {
    if (importPath === 'react') {
      return { Component, createElement };
    }

    if (importPath === 'classnames') {
      return (...args) =>
        args
          .flatMap(arg => {
            if (!arg) return [];
            if (typeof arg === 'string') return [arg];
            return Object.keys(arg).filter(key => arg[key]);
          })
          .join(' ');
    }

    if (importPath === 'styled-components') {
      return {
        __esModule: true,
        default: {
          div: () => 'div',
        },
      };
    }

    if (importPath === 'ming-ui/components/PhoneNumberInput/util') {
      return {
        createIntlTelInput: (element, options) => {
          createIntlTelInputCount += 1;
          createIntlTelInputOptions = options;
          return { destroy: () => null };
        },
      };
    }

    if (importPath === 'ming-ui/functions') {
      return { captcha: function captcha() {} };
    }

    if (importPath === 'src/api/externalPortal') {
      return {};
    }

    if (importPath === 'src/pages/AuthService/config') {
      return {
        ActionResult: {},
        CodeTypeEnum: {},
      };
    }

    if (importPath === 'src/utils/common') {
      return {
        browserIsMobile: () => false,
        encrypt: value => value,
      };
    }

    return require(importPath);
  }

  new Function('module', 'exports', 'require', code)(moduleLike, moduleLike.exports, localRequire);

  return moduleLike.exports.default || moduleLike.exports;
}

const AccountCon = loadModule();
const accountCon = new AccountCon({ inputType: 'phone' });
accountCon.mobile = { tagName: 'INPUT' };
global.$ = () => ({ on: () => null });
global._l = text => text;

accountCon.itiFn();

assert.strictEqual(createIntlTelInputOptions.showDialCodeInput, true);
assert.strictEqual(hasClassName(accountCon.render(), 'telInputWrap'), true);

const hiddenAccountCon = new AccountCon({ inputType: 'phone', account: '+8613539937039', type: 2 });
hiddenAccountCon.mobile = { tagName: 'INPUT', focus: () => null };
createIntlTelInputCount = 0;

hiddenAccountCon.componentDidMount();
assert.strictEqual(createIntlTelInputCount, 0);

hiddenAccountCon.props = { inputType: 'phone', account: '', type: 3 };
hiddenAccountCon.componentDidUpdate({ inputType: 'phone', account: '+8613539937039', type: 2 });
assert.strictEqual(createIntlTelInputCount, 1);

console.log('PortalUserSet AccountCon tests passed');
