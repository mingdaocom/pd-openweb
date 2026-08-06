const assert = require('assert');
const path = require('path');
const { transformFileSync } = require('@babel/core');

function createHookRenderer(initialComponent, initialProps) {
  let Component = initialComponent;
  const hookState = [];
  const hookDeps = [];
  const pendingEffects = [];
  let hookIndex = 0;
  let props = initialProps;
  let tree;

  function runRender() {
    hookIndex = 0;
    pendingEffects.length = 0;
    tree = Component(props);
    assignRefs(tree);
    pendingEffects.forEach(effect => effect());
    return tree;
  }

  function assignRefs(node) {
    if (!node || typeof node !== 'object') return;

    if (node.props && node.props.ref && typeof node.props.ref === 'object') {
      node.props.ref.current = node.props.ref.current || {
        value: node.props.defaultValue || '',
        focus: () => null,
        blur: () => null,
      };
    }

    (node.children || []).forEach(assignRefs);
  }

  function useState(initialValue) {
    const currentIndex = hookIndex;
    hookState[currentIndex] = hookState[currentIndex] === undefined ? initialValue : hookState[currentIndex];
    hookIndex += 1;

    return [
      hookState[currentIndex],
      nextValue => {
        hookState[currentIndex] = typeof nextValue === 'function' ? nextValue(hookState[currentIndex]) : nextValue;
      },
    ];
  }

  function useRef(initialValue) {
    const currentIndex = hookIndex;
    hookState[currentIndex] = hookState[currentIndex] || { current: initialValue };
    hookIndex += 1;
    return hookState[currentIndex];
  }

  function useEffect(effect, deps) {
    const currentIndex = hookIndex;
    const prevDeps = hookDeps[currentIndex];
    const changed = !prevDeps || deps.some((dep, index) => dep !== prevDeps[index]);
    hookDeps[currentIndex] = deps;
    hookIndex += 1;

    if (changed) {
      pendingEffects.push(effect);
    }
  }

  return {
    render: runRender,
    setComponent: nextComponent => {
      Component = nextComponent;
    },
    setProps: nextProps => {
      props = nextProps;
      return runRender();
    },
    hooks: { useState, useRef, useEffect },
    getTree: () => tree,
  };
}

function createElement(type, props, ...children) {
  return { type, props: props || {}, children: children.flat() };
}

function findByType(node, type) {
  if (!node || typeof node !== 'object') return null;
  if (node.type === type) return node;

  for (const child of node.children || []) {
    const result = findByType(child, type);
    if (result) return result;
  }

  return null;
}

function requireNumeric(renderer) {
  const moduleLike = { exports: {} };
  const { code } = transformFileSync(path.join(__dirname, 'Numeric.jsx'), {
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
        useCallback: callback => callback,
        useEffect: renderer.hooks.useEffect,
        useRef: renderer.hooks.useRef,
        useState: renderer.hooks.useState,
      };
    }

    if (importPath === 'classnames') {
      return (...args) => args.filter(Boolean).join(' ');
    }

    if (importPath === 'lodash') {
      return require('lodash');
    }

    if (importPath === 'prop-types') {
      return new Proxy({}, { get: () => () => null });
    }

    if (importPath === 'styled-components') {
      const styled = new Proxy(
        {},
        {
          get: (_, tag) => () => tag,
        },
      );
      return { __esModule: true, default: styled };
    }

    if (importPath === 'src/pages/widgetConfig/widgetSetting/components/WidgetSecurity/util') {
      return { dealMaskValue: ({ value }) => value };
    }

    if (importPath === 'src/utils/common') {
      return {
        accAdd: (a, b) => a + b,
        accDiv: (a, b) => a / b,
        accMul: (a, b) => a * b,
        accSub: (a, b) => a - b,
      };
    }

    if (importPath === 'src/utils/control') {
      return {
        formatNumberThousand: value => value,
        formatStrZero: str => String(str).replace(/(?:\.0*|(\.\d+?)0+)$/, '$1'),
        toFixed: (value, dot) => Number(value).toFixed(dot),
      };
    }

    if (importPath === '../../../core/enum') {
      return { ADD_EVENT_ENUM: { FOCUS: 'focus' } };
    }

    if (importPath === '../../components/ClearValueIcon') {
      const ClearValueIcon = () => null;
      return { __esModule: true, default: ClearValueIcon, CLEAR_ICON_SAFE_CLASS: 'clearIconSafe' };
    }

    if (importPath === '../../tools/config') {
      return { FIELD_SIZE_OPTIONS: {} };
    }

    if (importPath === '../../tools/utils') {
      return { fixWeixinInputBlurScroll: () => null };
    }

    return require(importPath);
  }

  new Function('module', 'exports', 'require', code)(moduleLike, moduleLike.exports, localRequire);
  return moduleLike.exports.default;
}

const baseProps = {
  type: 6,
  hint: '',
  disabled: false,
  formDisabled: false,
  value: '',
  dot: 2,
  enumDefault: 0,
  unit: '',
  advancedSetting: {
    dotformat: '1',
    showtype: '0',
    showformat: '0',
    numinterval: '',
    numshow: '0',
    thousandth: '1',
  },
  onChange: () => null,
  onBlur: () => null,
};

const renderer = createHookRenderer(() => null, baseProps);
const Numeric = requireNumeric(renderer);
renderer.setComponent(Numeric);

renderer.render();
renderer.setProps({ ...baseProps, value: '1' });

let input = findByType(renderer.getTree(), 'input');
input.props.onFocus({ target: { value: '1', trim: () => '1' } });
renderer.render();

input = findByType(renderer.getTree(), 'input');
input.props.onChange({ target: { value: '1.' } });
assert.strictEqual(input.props.ref.current.value, '1.');

renderer.setProps({ ...baseProps, value: '1' });
input = findByType(renderer.getTree(), 'input');
assert.strictEqual(input.props.ref.current.value, '1.', '编辑中父级格式化回写不应清除小数点');

const emptyRenderer = createHookRenderer(() => null, {
  ...baseProps,
  value: undefined,
  advancedSetting: {
    ...baseProps.advancedSetting,
    dotformat: '0',
  },
});
const EmptyNumeric = requireNumeric(emptyRenderer);
emptyRenderer.setComponent(EmptyNumeric);
emptyRenderer.render();

input = findByType(emptyRenderer.getTree(), 'input');
input.props.onFocus({ target: { value: '', trim: () => '' } });
emptyRenderer.render();

input = findByType(emptyRenderer.getTree(), 'input');
assert.strictEqual(input.props.ref.current.value, '', '空数值字段聚焦时不应显示 undefined');

console.log('mobile Numeric tests passed');
