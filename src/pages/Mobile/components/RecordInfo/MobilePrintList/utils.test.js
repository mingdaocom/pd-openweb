const assert = require('assert');
const path = require('path');
const { transformFileSync } = require('@babel/core');

function requireEsm(file) {
  const module = { exports: {} };
  const { code } = transformFileSync(path.join(__dirname, file), {
    babelrc: false,
    plugins: ['@babel/plugin-transform-modules-commonjs'],
  });

  new Function('module', 'exports', 'require', code)(module, module.exports, require);
  return module.exports;
}

const { buildAppPrintParams } = requireEsm('./utils.js');

const baseParams = {
  instanceId: '',
  workId: '',
  projectId: 'project-1',
  appId: 'app-1',
  worksheetId: 'worksheet-1',
  viewId: 'view-1',
  rowId: 'row-1',
  currentRowIds: ['row-1'],
  isBatchOperate: false,
  template: {
    id: 'template-1',
    type: 2,
  },
};

const singleWordParams = buildAppPrintParams(baseParams);
assert.strictEqual(Object.prototype.hasOwnProperty.call(singleWordParams, 'rowIds'), false);
assert.strictEqual(singleWordParams.rowId, 'row-1');

const singleExcelParams = buildAppPrintParams({
  ...baseParams,
  template: {
    id: 'template-2',
    type: 5,
  },
});
assert.strictEqual(Object.prototype.hasOwnProperty.call(singleExcelParams, 'rowIds'), false);

const batchWordParams = buildAppPrintParams({
  ...baseParams,
  isBatchOperate: true,
  currentRowIds: ['row-1', 'row-2'],
});
assert.deepStrictEqual(batchWordParams.rowIds, ['row-1', 'row-2']);
assert.strictEqual(batchWordParams.rowId, 'row-1,row-2');

const singleQrCodeParams = buildAppPrintParams({
  ...baseParams,
  template: {
    id: 'template-3',
    type: 3,
  },
});
assert.deepStrictEqual(singleQrCodeParams.rowIds, ['row-1']);

console.log('mobile print list utils tests passed');
