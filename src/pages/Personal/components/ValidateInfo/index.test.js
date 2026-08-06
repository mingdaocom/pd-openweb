const assert = require('assert');
const path = require('path');
const { transformFileSync } = require('@babel/core');

let createIntlTelInputOptions;

function loadModule() {
  const moduleLike = { exports: {} };
  const { code } = transformFileSync(path.join(__dirname, 'index.js'), {
    babelrc: false,
    presets: ['@babel/preset-react'],
    plugins: ['@babel/plugin-transform-modules-commonjs'],
  });

  class Component {
    constructor(props) {
      this.props = props;
      this.state = {};
    }

    setState(nextState, callback) {
      this.state = {
        ...this.state,
        ...nextState,
      };
      callback && callback();
    }
  }

  function localRequire(importPath) {
    if (importPath === 'react') {
      return { Component, Fragment: 'fragment', createElement: () => null };
    }

    if (importPath === 'styled-components') {
      return {
        __esModule: true,
        default: {
          div: () => 'div',
          input: () => 'input',
        },
      };
    }

    if (importPath === 'ming-ui') {
      return {
        Button: () => null,
        Dialog: () => null,
        VerifyPasswordInput: () => null,
      };
    }

    if (importPath === 'ming-ui/components/PhoneNumberInput/util') {
      return {
        createIntlTelInput: (element, options) => {
          createIntlTelInputOptions = options;
          return { destroy: () => null };
        },
      };
    }

    if (importPath === 'ming-ui/components/FunctionWrap') {
      return component => component;
    }

    if (importPath === 'ming-ui/functions') {
      return { captcha: function captcha() {} };
    }

    if (importPath === 'src/api/account') {
      return {};
    }

    if (importPath === 'src/components/verifyPassword') {
      return () => null;
    }

    if (importPath === 'src/utils/expression') {
      return {
        isEmail: () => true,
        isPasswordValid: () => true,
      };
    }

    return require(importPath);
  }

  new Function('module', 'exports', 'require', code)(moduleLike, moduleLike.exports, localRequire);

  return moduleLike.exports.default || moduleLike.exports;
}

const ValidateInfoCon = loadModule();
global._l = text => text;
const validateInfoCon = new ValidateInfoCon({ type: 'mobilePhone' });
validateInfoCon.mobile = { tagName: 'INPUT' };

validateInfoCon.initTel();

assert.strictEqual(createIntlTelInputOptions.showDialCodeInput, true);
console.log('Personal ValidateInfo tests passed');
