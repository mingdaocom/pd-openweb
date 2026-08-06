const assert = require('assert');
const path = require('path');
const { transformFileSync } = require('@babel/core');

const FILTER_CONDITION_TYPE = {
  DATEENUM: 17,
  NDATEENUM: 18,
};

const CONTROL_FILTER_WHITELIST = {
  TEXT: {
    value: 1,
  },
  NUMBER: {
    value: 2,
  },
  BOOL: {
    value: 3,
  },
  DATE: {
    value: 4,
  },
  OPTIONS: {
    value: 5,
  },
  USERS: {
    value: 6,
  },
  RELATE_RECORD: {
    value: 7,
  },
  CASCADER: {
    value: 8,
  },
  SUBLIST: {
    value: 9,
  },
  TIME: {
    value: 10,
  },
};

const API_ENUM_TO_TYPE = {
  DATE_INPUT_15: 15,
  DATE_INPUT_16: 16,
  MONEY_CN: 25,
};

function requireEsm(file, stubs = {}) {
  const module = { exports: {} };
  const { code } = transformFileSync(path.join(__dirname, file), {
    babelrc: false,
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

global._l = global._l || (text => text);
global.safeParse =
  global.safeParse ||
  ((value, defaultValue = {}) => {
    try {
      return JSON.parse(value);
    } catch {
      return defaultValue === 'array' ? [] : defaultValue;
    }
  });

const filterFn = requireEsm('./filterFn.js', {
  'src/utils/controlCommon': {
    getDatePickerConfigs: control => {
      if (!control || !control.type) {
        return {};
      }

      return {
        formatMode: control.type === API_ENUM_TO_TYPE.DATE_INPUT_16 ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD',
      };
    },
    isEmptyValue: value => value === undefined || value === null || value === '',
    toFixed: (value, dot = 0) => Number(value).toFixed(dot),
  },
  'src/pages/worksheet/common/WorkSheetFilter/enum': {
    API_ENUM_TO_TYPE,
    CONTROL_FILTER_WHITELIST,
    DATE_OPTIONS: [],
    DATE_RANGE_TYPE: {},
    FILTER_CONDITION_TYPE,
  },
  'src/pages/worksheet/common/WorkSheetFilter/util': {
    getConditionType: condition => condition.conditionGroupType,
    getTypeKey: () => 'DATE',
    redefineComplexControl: control => control,
  },
  'src/utils/common': {
    accDiv: (a, b) => a / b,
    accMul: (a, b) => a * b,
  },
  'src/utils/project': {
    dateAppZoneToServerZone: value => value,
  },
  'src/utils/record': {
    filterEmptyChildTableRows: rows => rows,
  },
}).default;

const moment = require('moment');
const previousNow = moment.now;

moment.now = () => new Date('2026-05-15T12:00:00+08:00').getTime();

try {
  assert.strictEqual(
    filterFn({
      filterData: {
        filterType: FILTER_CONDITION_TYPE.DATEENUM,
        dataType: API_ENUM_TO_TYPE.DATE_INPUT_15,
        dateRange: 14,
      },
      originControl: {
        type: API_ENUM_TO_TYPE.DATE_INPUT_15,
        value: '2026-08-01',
        advancedSetting: { showtype: '3' },
      },
    }),
    true,
    '下季度应匹配下一季度内的日期',
  );

  assert.strictEqual(
    filterFn({
      filterData: {
        filterType: FILTER_CONDITION_TYPE.DATEENUM,
        dataType: API_ENUM_TO_TYPE.DATE_INPUT_15,
        dateRange: 14,
      },
      originControl: {
        type: API_ENUM_TO_TYPE.DATE_INPUT_15,
        value: '2026-02-01',
        advancedSetting: { showtype: '3' },
      },
    }),
    false,
    '下季度不应匹配上一季度内的日期',
  );
} finally {
  moment.now = previousNow;
}

console.log('filterFn tests passed');
