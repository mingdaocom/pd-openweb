const assert = require('assert');
const path = require('path');
const { transformFileSync } = require('@babel/core');

function createElement(type, props, ...children) {
  return { type, props: props || {}, children: children.flat() };
}

function requireArea() {
  const moduleLike = { exports: {} };
  const { code } = transformFileSync(path.join(__dirname, 'index.jsx'), {
    babelrc: false,
    presets: ['@babel/preset-env', '@babel/preset-react'],
    plugins: ['@babel/plugin-transform-modules-commonjs'],
  });

  function localRequire(importPath) {
    if (importPath === 'react') {
      return {
        __esModule: true,
        default: { createElement, memo: component => component },
        createElement,
        memo: component => component,
      };
    }

    if (importPath === 'classnames') {
      return (...args) => args.filter(Boolean).join(' ');
    }

    if (importPath === 'lodash') {
      return require('lodash');
    }

    if (importPath === 'ming-ui') {
      return {
        CityPicker: 'CityPicker',
        Icon: 'Icon',
      };
    }

    if (importPath === 'src/utils/controlCommon') {
      return { getAreaHintText: () => '请选择' };
    }

    return require(importPath);
  }

  new Function('module', 'exports', 'require', code)(moduleLike, moduleLike.exports, localRequire);
  return moduleLike.exports.default;
}

const Area = requireArea();

let nextValue;
const tree = Area({
  advancedSetting: { anylevel: '1' },
  enumDefault2: 3,
  onChange: value => {
    nextValue = value;
  },
});

tree.props.callback([{ id: '110100', path: '北京市/北京市', last: false }]);

assert.strictEqual(nextValue, undefined, '必须选择最后一级时，H5 地区字段不应写入非最后一级地区');

const provinceCityTree = Area({
  advancedSetting: { anylevel: '1' },
  enumDefault2: 2,
  onChange: value => {
    nextValue = value;
  },
});

nextValue = undefined;
provinceCityTree.props.callback([{ id: '110100', path: '北京市/北京市', last: false }]);

assert.strictEqual(
  nextValue,
  JSON.stringify({ code: '110100', name: '北京市/北京市' }),
  '配置为省市时，H5 地区字段应允许选中城市节点',
);

nextValue = undefined;
tree.props.callback([{ id: '110101', path: '北京市/北京市/东城区', last: false }]);

assert.strictEqual(
  nextValue,
  JSON.stringify({ code: '110101', name: '北京市/北京市/东城区' }),
  '达到配置层级时，H5 地区字段应允许写入当前层级地区',
);

tree.props.callback([{ id: '110101', path: '北京市/北京市/东城区', last: true }]);

assert.strictEqual(
  nextValue,
  JSON.stringify({ code: '110101', name: '北京市/北京市/东城区' }),
  '选择最后一级地区时应写入字段值',
);

console.log('Mobile area tests passed');
