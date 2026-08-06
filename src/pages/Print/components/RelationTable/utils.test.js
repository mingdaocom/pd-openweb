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

const { getRelationCellPrintData, getRelationTilePrintData } = requireEsm('./utils.js');

const baseDataInfo = {
  appId: 'appId',
  worksheetId: 'parentWorksheetId',
  projectId: 'projectId',
  viewIdForPermit: 'viewId',
};

assert.deepStrictEqual(
  getRelationCellPrintData({
    control: {
      type: 47,
      controlId: 'barcodeControlId',
      dataSource: 'textControlId',
    },
    dataInfo: baseDataInfo,
    tableList: {
      controlId: 'childTableControlId',
      dataSource: 'childWorksheetId',
    },
    record: {
      rowid: 'childRowId',
      barcodeControlId: 'barcodeValue',
    },
  }),
  {
    appId: 'appId',
    worksheetId: 'childWorksheetId',
    projectId: 'projectId',
    viewIdForPermit: '',
    isRelateMultipleSheet: true,
    value: 'barcodeValue',
    dataSource: 'textControlId',
    recordId: 'childRowId',
  },
);

assert.deepStrictEqual(
  getRelationCellPrintData({
    control: {
      type: 2,
      controlId: 'textControlId',
      dataSource: '',
    },
    dataInfo: baseDataInfo,
    tableList: {
      controlId: 'childTableControlId',
      dataSource: 'childWorksheetId',
    },
    record: {
      rowid: 'childRowId',
      textControlId: 'textValue',
    },
  }),
  {
    appId: 'appId',
    worksheetId: 'parentWorksheetId',
    projectId: 'projectId',
    viewIdForPermit: 'viewId',
    isRelateMultipleSheet: true,
    value: 'textValue',
    dataSource: 'childTableControlId',
  },
);

assert.deepStrictEqual(
  getRelationTilePrintData({
    control: {
      type: 47,
      controlId: 'barcodeControlId',
      dataSource: 'textControlId',
      controlName: '条码',
    },
    dataInfo: baseDataInfo,
    tableList: {
      controlId: 'childTableControlId',
      dataSource: 'childWorksheetId',
    },
    record: {
      rowid: 'childRowId',
      barcodeControlId: 'barcodeValue',
      textControlId: 'textValue',
      hiddenControlId: 'hiddenValue',
    },
    controls: [{ controlId: 'textControlId' }],
    allControls: [{ controlId: 'textControlId' }, { controlId: 'hiddenControlId' }],
    fileStyle: { file: 'thumbnail' },
    userInfo: { user: 'name' },
  }),
  {
    type: 47,
    controlId: 'barcodeControlId',
    controlName: '条码',
    appId: 'appId',
    worksheetId: 'childWorksheetId',
    projectId: 'projectId',
    viewIdForPermit: '',
    isRelateMultipleSheet: true,
    showUnit: true,
    value: 'barcodeValue',
    dataSource: 'textControlId',
    recordId: 'childRowId',
    fileStyle: { file: 'thumbnail' },
    user_info: { user: 'name' },
    controls: [{ controlId: 'textControlId', value: 'textValue' }],
    allControls: [
      { controlId: 'textControlId', value: 'textValue' },
      { controlId: 'hiddenControlId', value: 'hiddenValue' },
    ],
  },
);

console.log('Print RelationTable utils tests passed');
