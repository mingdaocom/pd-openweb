const assert = require('assert');
const path = require('path');
const { transformFileSync } = require('@babel/core');

function createElement(type, props, ...children) {
  return { type, props: props || {}, children };
}

function findNodeByType(tree, targetType) {
  if (!tree || typeof tree !== 'object') return null;
  if (tree.type === targetType) return tree;

  return (tree.children || []).reduce((result, child) => result || findNodeByType(child, targetType), null);
}

async function run() {
  let resolveApply;
  const applyPromise = new Promise(resolve => {
    resolveApply = resolve;
  });
  const applyLicenseCodeCalls = [];

  const Button = function Button() {};

  const moduleLike = { exports: {} };
  const { code } = transformFileSync(path.join(__dirname, 'ApplyPrivateKey.js'), {
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
      return { Component, Fragment: 'fragment', createElement };
    }

    if (importPath === 'ming-ui') {
      return {
        Button,
        Dropdown: function Dropdown() {},
        Icon: function Icon() {},
        Input: function Input() {},
        RadioGroup: function RadioGroup() {},
      };
    }

    if (importPath === 'src/api/privateGuide') {
      return {
        applyLicenseCode: (...args) => {
          applyLicenseCodeCalls.push(args);
          return applyPromise;
        },
      };
    }

    if (importPath === 'src/utils/common') {
      return {
        getRequest: () => ({
          serverId: 'server-001',
          product: 'hap',
          v: '5.3',
        }),
      };
    }

    return require(importPath);
  }

  global._l = text => text;
  global.alert = () => null;

  new Function('module', 'exports', 'require', code)(moduleLike, moduleLike.exports, localRequire);
  const ApplyPrivateKey = moduleLike.exports.default || moduleLike.exports;
  let closeCount = 0;
  const applyPrivateKey = new ApplyPrivateKey({
    product: 'hap',
    onClose: () => {
      closeCount += 1;
    },
  });

  applyPrivateKey.setState({
    projectName: 'Mingdao',
    job: 'Engineer',
  });

  applyPrivateKey.handleGenerateKey({ type: 'click' });
  applyPrivateKey.handleGenerateKey({ type: 'click' });

  assert.strictEqual(applyLicenseCodeCalls.length, 1);
  assert.strictEqual(findNodeByType(applyPrivateKey.render(), Button).props.disabled, true);

  resolveApply('license-code');
  await applyPromise;
  await Promise.resolve();

  assert.strictEqual(closeCount, 1);
}

run()
  .then(() => {
    console.log('ApplyPrivateKey tests passed');
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
