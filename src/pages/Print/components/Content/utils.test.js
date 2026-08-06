const assert = require('assert');
const path = require('path');
const { transformFileSync } = require('@babel/core');

function requireEsm(file) {
  const module = { exports: {} };
  const { code } = transformFileSync(path.join(__dirname, file), {
    babelrc: false,
    plugins: ['@babel/plugin-transform-modules-commonjs'],
  });

  new Function('module', 'exports', code)(module, module.exports);
  return module.exports;
}

const { getPrintOperationLogActionText } = requireEsm('./utils.js');

const operationLogActionMap = {
  0: '发起',
  4: '通过申请',
  5: '否决申请',
  22: '无需审批',
};
const triggerActionMap = {
  1: '新增',
  2: '修改',
};

assert.strictEqual(
  getPrintOperationLogActionText({
    workItem: { workItemLog: { action: 4 } },
    flowNode: { btnMap: { 4: '同意' } },
    translateInfo: { btnmap_4: '批准' },
    operationLogActionMap,
    triggerActionMap,
  }),
  '批准',
);

assert.strictEqual(
  getPrintOperationLogActionText({
    workItem: { workItemLog: { action: 4 } },
    flowNode: { btnMap: { 4: '同意' } },
    translateInfo: {},
    operationLogActionMap,
    triggerActionMap,
  }),
  '同意',
);

assert.strictEqual(
  getPrintOperationLogActionText({
    workItem: { workItemLog: { action: 4 } },
    flowNode: { btnMap: {} },
    operationLogActionMap,
    triggerActionMap,
  }),
  '通过申请',
);

assert.strictEqual(
  getPrintOperationLogActionText({
    workItem: { workItemLog: { action: 5, actionTargetName: '主管审批' } },
    flowNode: { btnMap: {} },
    operationLogActionMap,
    triggerActionMap,
    formatReturnText: name => `退回到${name}`,
  }),
  '退回到主管审批',
);

assert.strictEqual(
  getPrintOperationLogActionText({
    workItem: { type: 0 },
    flowNode: { triggerId: 2 },
    operationLogActionMap,
    triggerActionMap,
  }),
  '修改',
);

console.log('Print Content utils tests passed');
