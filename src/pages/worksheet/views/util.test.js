const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { transformFileSync } = require('@babel/core');

global._l = global._l || ((text, value) => (value === undefined ? text : text.replace('%0', value)));

const EXTENSIONS = ['', '.js', '.jsx'];

// webpack 风格的 extensionless 解析（./util.js 加载时按 src 别名递归解析本地依赖）
function resolveLocal(base) {
  for (const ext of EXTENSIONS) {
    if (fs.existsSync(base + ext)) return base + ext;
  }
  return null;
}

// 将 ESM 源码 babel 转 CJS 后在 node 里执行；src/ 下未 stub 的本地模块递归加载真实实现，
// 其余按 stub 注入，避免拉起 moment / immutability-helper 等重依赖。
function loadEsm(absoluteFile, stubs) {
  const module = { exports: {} };
  const { code } = transformFileSync(absoluteFile, {
    babelrc: false,
    plugins: ['@babel/plugin-transform-modules-commonjs'],
  });
  const dir = path.dirname(absoluteFile);
  const externalStubs = {
    'immutability-helper': { default: () => null },
    moment: () => ({ format: () => '' }),
    ...stubs,
  };
  function localRequire(request) {
    if (externalStubs[request]) return externalStubs[request];
    if (request === 'lodash') return require('lodash');
    let target = null;
    if (request.startsWith('src/')) target = resolveLocal(path.join(process.cwd(), request));
    else if (request.startsWith('.')) target = resolveLocal(path.join(dir, request));
    if (target) return loadEsm(target, stubs);
    return require(request);
  }
  new Function('module', 'exports', 'require', code)(module, module.exports, localRequire);
  return module.exports;
}

function requireEsm(file, stubs = {}) {
  return loadEsm(path.join(__dirname, file), stubs);
}

const { getCardTitleFieldForView, getWrappedViewTitleControlId } = requireEsm('./util.js', {
  'src/pages/FormSet/config': {
    permitList: {},
  },
  'src/pages/FormSet/util': {
    isOpenPermit: () => false,
  },
  'src/utils/control': {
    getAdvanceSetting: view => view.advancedSetting || {},
    isTimeStyle: () => false,
    renderText: cell => cell.value || '',
  },
  // 注意：src/utils/controlCommon 不再 stub，递归加载真实的 FIELD_REG_EXP。
  'src/utils/expression': function RegExpValidator() {},
  'src/utils/project': {
    dateConvertToServerZone: value => value,
  },
});

// 真实控件 controlId 为 24 位 hex，这里用同一形状的 fixture 保证与生产一致。
const NAME_ID = '5e047c2ab2bfdd0001e9b8f9';
const STATUS_ID = '5e047c2ab2bfdd0001e9b8fa';
const controls = [
  { controlId: NAME_ID, controlName: '名称', type: 2, attribute: 1 },
  { controlId: STATUS_ID, controlName: '状态', type: 2 },
];
const row = { [NAME_ID]: '客户A', [STATUS_ID]: '进行中' };

// getWrappedViewTitleControlId：仅 $单个字段ID$ 归一，其余原样返回
assert.strictEqual(getWrappedViewTitleControlId(undefined), undefined);
assert.strictEqual(getWrappedViewTitleControlId(STATUS_ID), STATUS_ID);
assert.strictEqual(getWrappedViewTitleControlId(`$${STATUS_ID}$`), STATUS_ID);
assert.strictEqual(getWrappedViewTitleControlId(`$${NAME_ID}$-$${STATUS_ID}$`), `$${NAME_ID}$-$${STATUS_ID}$`);

// 空 viewtitle：回退到 attribute===1
let titleField = getCardTitleFieldForView(row, controls, { advancedSetting: {} });
assert.strictEqual(titleField.controlId, NAME_ID);
assert.strictEqual(titleField.value, '客户A');
assert.strictEqual(titleField.isWrappedViewTitle, false);

// 普通 viewtitle：原值命中
titleField = getCardTitleFieldForView(row, controls, { advancedSetting: { viewtitle: STATUS_ID } });
assert.strictEqual(titleField.controlId, STATUS_ID);
assert.strictEqual(titleField.value, '进行中');
assert.strictEqual(titleField.isWrappedViewTitle, false);

// 单个 $字段ID$：归一为真实字段 ID，标记 isWrappedViewTitle
titleField = getCardTitleFieldForView(row, controls, { advancedSetting: { viewtitle: `$${STATUS_ID}$` } });
assert.strictEqual(titleField.controlId, STATUS_ID);
assert.strictEqual(titleField.value, '进行中');
assert.strictEqual(titleField.type, 2);
assert.strictEqual(titleField.isWrappedViewTitle, true);

// 组合 $a$-$b$：不归一，viewtitle 为真值时 getTitleControlForCard 找不到控件，返回 undefined
titleField = getCardTitleFieldForView(row, controls, { advancedSetting: { viewtitle: `$${NAME_ID}$-$${STATUS_ID}$` } });
assert.strictEqual(titleField, undefined);

console.log('Worksheet view util tests passed');
