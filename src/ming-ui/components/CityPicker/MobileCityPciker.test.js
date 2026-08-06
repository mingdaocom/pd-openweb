const assert = require('assert');
const path = require('path');
const { transformFileSync } = require('@babel/core');

function requireMobileCityPicker() {
  const moduleLike = { exports: {} };
  const { code } = transformFileSync(path.join(__dirname, 'MobileCityPciker.jsx'), {
    babelrc: false,
    presets: ['@babel/preset-env', '@babel/preset-react'],
    plugins: ['@babel/plugin-transform-modules-commonjs'],
  });

  function localRequire(importPath) {
    if (importPath === 'react') {
      class Component {
        constructor(props) {
          this.props = props;
          this.state = {};
        }

        setState(nextState) {
          this.state = { ...this.state, ...(typeof nextState === 'function' ? nextState(this.state) : nextState) };
        }
      }

      return {
        __esModule: true,
        default: { Component, Fragment: 'Fragment', createElement: () => null },
        Component,
        Fragment: 'Fragment',
        createElement: () => null,
      };
    }

    if (importPath === 'lodash') {
      return require('lodash');
    }

    if (importPath === 'prop-types') {
      return new Proxy({}, { get: () => () => null });
    }

    if (importPath === 'ming-ui') {
      return {
        Icon: 'Icon',
        LoadDiv: 'LoadDiv',
        MobileSearch: 'MobileSearch',
        PopupWrapper: 'PopupWrapper',
        Radio: 'Radio',
      };
    }

    if (importPath.endsWith('.less')) {
      return {};
    }

    return require(importPath);
  }

  new Function('module', 'exports', 'require', code)(moduleLike, moduleLike.exports, localRequire);
  return moduleLike.exports;
}

global._l = global._l || (text => text);

const { getConfirmDisable } = requireMobileCityPicker();

assert.strictEqual(
  getConfirmDisable({
    select: [{ id: '110100', path: '北京市/北京市', last: false }],
    mustLast: true,
    level: 3,
    indexLevel: 2,
  }),
  true,
  '必须选择最后一级时，未选到配置层级前应禁用确定按钮',
);

assert.strictEqual(
  getConfirmDisable({
    select: [{ id: '110101', path: '北京市/北京市/东城区', last: false }],
    mustLast: true,
    level: 3,
    indexLevel: 3,
  }),
  false,
  '必须选择最后一级时，达到配置层级应允许点击确定按钮',
);

assert.strictEqual(
  getConfirmDisable({
    select: [{ id: '110100', path: '北京市/北京市', last: false }],
    mustLast: true,
    level: 2,
    indexLevel: 2,
  }),
  false,
  '配置为省市时，选中城市节点应允许点击确定按钮',
);

assert.strictEqual(
  getConfirmDisable({
    select: [{ id: '110101', path: '北京市/北京市/东城区', last: true }],
    mustLast: true,
    level: 3,
    indexLevel: 3,
  }),
  false,
  '选择最后一级时应允许点击确定按钮',
);

assert.strictEqual(
  getConfirmDisable({
    select: [{ id: '110100', path: '北京市/北京市', last: false }],
    mustLast: false,
    level: 3,
    indexLevel: 2,
  }),
  false,
  '未开启必须选择最后一级时，选择任意层级后应允许确定',
);

console.log('Mobile city picker tests passed');
