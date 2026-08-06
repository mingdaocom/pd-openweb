const assert = require('assert');
const path = require('path');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const { transformFileSync } = require('@babel/core');

function requireWorksheetRecordLog(stubs = {}) {
  const module = { exports: {} };
  const { code } = transformFileSync(path.join(__dirname, 'WorksheetRocordLog.jsx'), {
    babelrc: false,
    presets: ['@babel/preset-react'],
    plugins: ['@babel/plugin-transform-modules-commonjs'],
  });

  function localRequire(request) {
    if (stubs[request]) {
      return stubs[request];
    }

    return require(request);
  }

  new Function('module', 'exports', 'require', code)(module, module.exports, localRequire);
  return module.exports.default;
}

const EmptyComponent = () => React.createElement('span');
const ChildrenComponent = ({ children }) => React.createElement(React.Fragment, null, children);

function useSetState(initialState) {
  const stateWithOldLogEntry = initialState.sign
    ? {
        ...initialState,
        sign: {
          ...initialState.sign,
          showLodOldButton: true,
        },
      }
    : initialState;
  const [state, setState] = React.useState(stateWithOldLogEntry);

  return [state, patch => setState(current => ({ ...current, ...patch }))];
}

const WorksheetRecordLog = requireWorksheetRecordLog({
  'react-use': { useSetState },
  antd: { Divider: ChildrenComponent },
  classnames: () => '',
  'copy-to-clipboard': () => {},
  'rc-trigger': ChildrenComponent,
  xss: value => value,
  'ming-ui': {
    Icon: EmptyComponent,
    LoadDiv: EmptyComponent,
    PreferenceTime: EmptyComponent,
    PullToRefreshWrapper: ChildrenComponent,
    ScrollView: ChildrenComponent,
    UserHead: EmptyComponent,
  },
  'ming-ui/antd-components': { Tooltip: ChildrenComponent },
  'src/api/worksheet': {},
  'src/components/ArchivedList': EmptyComponent,
  'src/pages/widgetConfig/util': { filterOnlyShowField: value => value },
  'src/utils/common': { browserIsMobile: () => false },
  'src/utils/createLinksForMessage': value => value,
  'src/utils/enum': { VersionProductType: { batchDownloadFiles: 1 } },
  'src/utils/project': { getFeatureStatus: () => false },
  '../../common/WorkSheetFilter/components/AddCondition': EmptyComponent,
  '../DatePickerSelect': EmptyComponent,
  './component/ExportTrigger': EmptyComponent,
  './component/OperatePicker': EmptyComponent,
  './component/TriggerSelect': ChildrenComponent,
  './component/UserPicker': EmptyComponent,
  './component/WorksheetRecordLogItem': EmptyComponent,
  './enum.js': {
    EDIT_TYPE_TEXT: {},
    GET_SYSTEM_USER: () => ({}),
    SUBLIST_FILE_EDIT_TYPE: [],
  },
  './util': {
    assembleListData: value => value,
    assembleNewLogListData: value => value,
    getExtendParams: () => undefined,
    hasHiddenControl: () => false,
    isPublicFileDownload: () => false,
    isUser: () => false,
    renderTitleAvatar: () => null,
    renderTitleName: () => null,
    renderTitleText: () => null,
  },
  './WorksheetRocordLog.less': {},
});

global._l = text => text;

const defaultProps = {
  allowExport: false,
  appId: 'appId',
  controls: [],
  formdata: [],
  projectId: 'projectId',
  rowId: 'rowId',
  showFilter: false,
  showOperatorFilter: false,
  showRequestTypeFilter: false,
  worksheetId: 'worksheetId',
};

function renderWithPlatformENV(platformENV) {
  global.window = { platformENV };
  return ReactDOMServer.renderToStaticMarkup(React.createElement(WorksheetRecordLog, defaultProps));
}

assert.doesNotMatch(
  renderWithPlatformENV({ isLocal: false, isOverseas: false }),
  /继续查看旧版日志/,
  '国内公有云不应显示旧版日志入口',
);
assert.match(
  renderWithPlatformENV({ isLocal: true, isOverseas: false }),
  /继续查看旧版日志/,
  '私有部署应保留旧版日志入口',
);
assert.match(
  renderWithPlatformENV({ isLocal: false, isOverseas: true }),
  /继续查看旧版日志/,
  '海外环境应保持旧版日志入口',
);

console.log('WorksheetRecordLog environment tests passed');
