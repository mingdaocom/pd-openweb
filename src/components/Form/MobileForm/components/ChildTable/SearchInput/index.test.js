const assert = require('assert');
const path = require('path');
const { transformFileSync } = require('@babel/core');

function requireEsm(file, stubs = {}) {
  const module = { exports: {} };
  const { code } = transformFileSync(path.join(__dirname, file), {
    babelrc: false,
    presets: ['@babel/preset-env', '@babel/preset-react'],
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

function findByType(node, type) {
  if (!node) return null;
  if (Array.isArray(node)) {
    for (const child of node) {
      const result = findByType(child, type);
      if (result) return result;
    }

    return null;
  }

  if (node.type === type) return node;

  return findByType(node.props && node.props.children, type);
}

function createSearchInput(props) {
  const SearchInput = requireEsm('./index.js', {
    './index.less': {},
  }).default;
  const component = new SearchInput({
    ...SearchInput.defaultProps,
    ...props,
  });

  component.setState = (nextState, callback) => {
    Object.assign(
      component.state,
      typeof nextState === 'function' ? nextState(component.state, component.props) : nextState,
    );
    if (callback) callback();
  };

  return component;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

global._l = global._l || (text => text);

(async function run() {
  const debouncedCalls = [];
  const debouncedInput = createSearchInput({
    debounceTime: 20,
    onOk: value => debouncedCalls.push(value),
  });
  const debouncedInputNode = findByType(debouncedInput.render(), 'input');

  debouncedInputNode.props.onChange({ target: { value: 'a' } });
  debouncedInputNode.props.onChange({ target: { value: 'ab' } });

  await sleep(10);
  assert.deepStrictEqual(debouncedCalls, [], '输入变化后不应立即搜索');

  await sleep(30);
  assert.deepStrictEqual(debouncedCalls, ['ab'], '防抖后应只搜索最后一次输入');
  debouncedInput.componentWillUnmount();

  const enterCalls = [];
  const enterInput = createSearchInput({
    debounceTime: 20,
    onOk: value => enterCalls.push(value),
  });
  const enterInputNode = findByType(enterInput.render(), 'input');

  enterInputNode.props.onChange({ target: { value: 'abc' } });
  enterInputNode.props.onKeyUp({ keyCode: 13, target: { value: 'abc' } });

  await sleep(30);
  assert.deepStrictEqual(enterCalls, ['abc'], '回车应取消待执行防抖并立即搜索一次');
  enterInput.componentWillUnmount();

  const viewChangeCalls = [];
  const viewChangeInput = createSearchInput({
    viewId: 'view-1',
    debounceTime: 20,
    onOk: value => viewChangeCalls.push(value),
  });
  const viewChangeInputNode = findByType(viewChangeInput.render(), 'input');

  viewChangeInputNode.props.onChange({ target: { value: 'old' } });
  viewChangeInput.props = {
    ...viewChangeInput.props,
    viewId: 'view-2',
  };
  viewChangeInput.componentDidUpdate({ ...viewChangeInput.props, viewId: 'view-1' });

  await sleep(30);
  assert.deepStrictEqual(viewChangeCalls, [], '视图切换清空搜索时应取消待执行防抖');
  viewChangeInput.componentWillUnmount();

  console.log('mobile SearchInput tests passed');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
