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

const { canDirectSubmitApproveAction, getOperationLogActionText } = requireEsm('./utils.js');
const auth = { passTypeList: [101], overruleTypeList: [101] };

assert.strictEqual(canDirectSubmitApproveAction({ action: 'pass', auth }), true);
assert.strictEqual(canDirectSubmitApproveAction({ action: 'overrule', auth }), true);
assert.strictEqual(canDirectSubmitApproveAction({ action: 'return', auth }), true);

assert.strictEqual(canDirectSubmitApproveAction({ action: 'pass', auth, btnDescMap: { 4: 'pass desc' } }), false);
assert.strictEqual(canDirectSubmitApproveAction({ action: 'pass', auth, btnDescMap: { 4: '   ' } }), true);
assert.strictEqual(
  canDirectSubmitApproveAction({ action: 'overrule', auth, btnDescMap: { 5: 'overrule desc' } }),
  false,
);
assert.strictEqual(canDirectSubmitApproveAction({ action: 'return', auth, btnDescMap: { 17: 'return desc' } }), false);
assert.strictEqual(canDirectSubmitApproveAction({ action: 'pass', auth, encrypt: true }), false);
assert.strictEqual(canDirectSubmitApproveAction({ action: 'pass', auth: { passTypeList: [100] } }), false);
assert.strictEqual(canDirectSubmitApproveAction({ action: 'pass', auth: { passTypeList: [1] } }), false);
assert.strictEqual(canDirectSubmitApproveAction({ action: 'transfer', auth }), false);

assert.strictEqual(getOperationLogActionText(4, { 4: '批准' }, { 4: '同意' }), '批准');
assert.strictEqual(getOperationLogActionText(4, { 4: '同意' }, { 4: '默认同意' }, { btnmap_4: '批准' }), '批准');
assert.strictEqual(getOperationLogActionText(5, { 5: '驳回' }, { 5: '拒绝' }), '驳回');
assert.strictEqual(getOperationLogActionText(8, {}, { 8: '转审' }), '转审');
assert.strictEqual(getOperationLogActionText(99, {}, {}), '');
assert.strictEqual(getOperationLogActionText(4, null, { 4: '同意' }, null), '同意');

console.log('ExecDialog utils tests passed');
