const assert = require('assert');
const path = require('path');
const { transformFileSync } = require('@babel/core');

const ReactMock = {
  Fragment: 'Fragment',
  createElement(type, props, ...children) {
    return {
      type,
      props: { ...(props || {}), children: children.length > 1 ? children : children[0] },
      children,
    };
  },
};

const flushPromises = () => new Promise(resolve => setImmediate(resolve));

function requireCreateComponent({ checkSensitive, createCompany }) {
  const module = { exports: {} };
  const { code } = transformFileSync(path.join(__dirname, 'index.jsx'), {
    babelrc: false,
    presets: ['@babel/preset-react'],
    plugins: ['@babel/plugin-transform-modules-commonjs'],
  });

  function mockRequire(name) {
    if (name === 'react') {
      return {
        __esModule: true,
        default: ReactMock,
        useEffect: () => {},
        useRef: initialValue => ({ current: initialValue }),
      };
    }

    if (name === 'react-use') {
      return {
        useSetState: initialState => [{ ...initialState, loading: false }, patch => Object.assign(initialState, patch)],
      };
    }

    if (name === 'classnames') {
      return {
        __esModule: true,
        default: (...values) =>
          values
            .flatMap(value =>
              value && typeof value === 'object' ? Object.keys(value).filter(key => value[key]) : value || [],
            )
            .join(' '),
      };
    }

    if (name === 'xss') return { __esModule: true, default: value => value };
    if (name === 'ming-ui') return { LoadDiv: 'LoadDiv' };
    if (name === 'src/api/fixedData.js') {
      return { __esModule: true, default: { loadExtraDatas: () => Promise.resolve([]), checkSensitive } };
    }

    if (name === 'src/api/register') return { __esModule: true, default: { createCompany } };
    if (name === 'src/pages/AuthService/components/companyDrop') {
      return { __esModule: true, default: 'CompanyDrop' };
    }

    if (name === 'src/pages/AuthService/config.js') {
      return { ActionResult: { success: 1, userInfoNotFound: 5, userFromError: 14 } };
    }

    if (name === 'src/pages/AuthService/util.js') return { registerSuc: () => {} };
    if (name === 'src/utils/expression') return { __esModule: true, default: { isEmail: () => false } };
    if (name === 'src/utils/pssId') return { setPssId: () => {} };
    if (name === './SelectCountry') return { __esModule: true, default: 'SelectCountry' };
    if (name === './style') return { Wrap: 'Wrap', WrapConDp: 'WrapConDp' };
    return require(name);
  }

  new Function('module', 'exports', 'require', code)(module, module.exports, mockRequire);
  return module.exports.default;
}

global._l = value => value;
global.alert = () => {};

global.getCurrentLangCode = () => 'zh-Hans';
global.location = { href: 'https://example.com/enterpriseRegister?type=create' };
global.md = { global: { Config: { DefaultRegion: 'CN' } } };
global.window = {
  localStorage: {
    getItem: () => '',
    removeItem: () => {},
  },
};

(async () => {
  let resolveSensitiveCheck;
  let resolveCreateCompany;
  let sensitiveCheckCount = 0;
  let createCompanyCount = 0;
  const stateChanges = [];
  const sensitiveCheckPromise = new Promise(resolve => {
    resolveSensitiveCheck = resolve;
  });
  const createCompanyPromise = new Promise(resolve => {
    resolveCreateCompany = resolve;
  });
  const Create = requireCreateComponent({
    checkSensitive: () => {
      sensitiveCheckCount += 1;
      return sensitiveCheckPromise;
    },
    createCompany: () => {
      createCompanyCount += 1;
      return createCompanyPromise;
    },
  });
  const component = Create({
    company: { companyName: '测试组织' },
    lineLoading: false,
    onChange: patch => stateChanges.push(patch),
  });
  const submitButton = component.children[component.children.length - 1];

  submitButton.props.onClick();
  submitButton.props.onClick();

  assert.strictEqual(sensitiveCheckCount, 1, '校验期间连续点击只应发起一次敏感词校验');
  assert.deepStrictEqual(stateChanges, [], '敏感词校验期间不应显示创建中状态');

  resolveSensitiveCheck(false);
  await flushPromises();

  assert.strictEqual(createCompanyCount, 1, '校验通过后只应创建一次组织');
  assert.deepStrictEqual(stateChanges[0], { lineLoading: true }, '开始创建组织时应立即进入提交状态');
  submitButton.props.onClick();
  assert.strictEqual(sensitiveCheckCount, 1, '创建请求期间应继续阻止重复提交');

  resolveCreateCompany({ actionResult: 1 });
  await flushPromises();

  submitButton.props.onClick();
  assert.strictEqual(sensitiveCheckCount, 1, '创建成功后、页面跳转完成前应继续阻止重复提交');
  assert.deepStrictEqual(stateChanges, [{ lineLoading: true }], '创建成功后应保持提交状态直到页面离开');

  const loadingComponent = Create({
    company: { companyName: '测试组织' },
    lineLoading: true,
    onChange: () => {},
  });
  const disabledSubmitButton = loadingComponent.children[loadingComponent.children.length - 1];
  assert.strictEqual(disabledSubmitButton.props['aria-disabled'], true, '创建期间按钮应标记为禁用状态');
  assert.match(disabledSubmitButton.props.className, /\bdisabled\b/, '创建期间按钮应显示禁用样式');
  console.log('create organization submit tests passed');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
