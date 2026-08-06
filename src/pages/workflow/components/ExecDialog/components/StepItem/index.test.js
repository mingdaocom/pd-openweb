const assert = require('assert');
const path = require('path');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const { transformFileSync } = require('@babel/core');

function requireEsm(file, stubs = {}) {
  const module = { exports: {} };
  const { code } = transformFileSync(path.join(__dirname, file), {
    babelrc: false,
    presets: ['@babel/preset-react'],
    plugins: ['@babel/plugin-transform-modules-commonjs'],
  });

  function localRequire(request) {
    return Object.prototype.hasOwnProperty.call(stubs, request) ? stubs[request] : require(request);
  }

  new Function('module', 'exports', 'require', code)(module, module.exports, localRequire);
  return module.exports;
}

global._l = (text, ...args) => text.replace(/%(\d+)/g, (_, index) => args[index]);
global.md = { global: { Account: { accountId: 'current-user' } } };

const EmptyComponent = props => React.createElement('span', null, props.children);
const StepItem = requireEsm('./index.jsx', {
  'ming-ui': {
    Icon: EmptyComponent,
    Linkify: EmptyComponent,
    UserHead: EmptyComponent,
  },
  'ming-ui/antd-components': {
    Tooltip: EmptyComponent,
  },
  'src/components/previewAttachments/previewAttachments': () => {},
  'src/pages/worksheet/components/WorksheetRecordLog/WorksheetRecordLogDialog': EmptyComponent,
  'src/utils/app': {
    getTranslateInfo: () => ({}),
  },
  'src/utils/common': {
    browserIsMobile: () => false,
    getIconNameByExt: value => value,
  },
  'src/utils/expression': {
    fileIsPicture: () => false,
  },
  'src/utils/project': {
    dateConvertToUserZone: value => value,
  },
  './index.less': {},
}).default;

const createStepItem = btnMap =>
  new StepItem({
    appId: 'app-1',
    currentWork: {},
    status: 1,
    data: {
      workId: 'work-1',
      parentId: 'parent-1',
      flowNode: {
        id: 'node-1',
        type: 4,
        btnMap,
      },
    },
  });

const createWorkItem = action => ({
  type: 4,
  workItemAccount: {
    accountId: 'approver-1',
    fullName: '审批人',
  },
  operationTime: '2026-07-30 12:00:00',
  workItemLog: {
    action,
    actionTargetName: '加签人',
  },
});

const addApproveMarkup = ReactDOMServer.renderToStaticMarkup(
  createStepItem({ 17: '退回' }).renderDetail(createWorkItem(17)),
);

assert.match(addApproveMarkup, />同意并加签加签人</);
assert.doesNotMatch(addApproveMarkup, />退回加签人</);

const approveMarkup = ReactDOMServer.renderToStaticMarkup(
  createStepItem({ 4: '批准' }).renderDetail(createWorkItem(4)),
);

assert.match(approveMarkup, />批准</);

console.log('ExecDialog StepItem operation log action tests passed');
