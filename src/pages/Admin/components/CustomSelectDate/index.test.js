const assert = require('assert');
const fs = require('fs');
const path = require('path');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const moment = require('moment');
const { transformFileSync } = require('@babel/core');

function requireEsm(file, stubs = {}) {
  const module = { exports: {} };
  const { code } = transformFileSync(path.join(__dirname, file), {
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
  return module.exports;
}

let rangePickerProps;

const Select = props => React.createElement('div', null, props.dropdownRender ? props.dropdownRender() : null);
const Icon = () => React.createElement('i');

const RangePicker = props => {
  rangePickerProps = props;

  return React.createElement('div', { className: 'rangePicker' }, props.children);
};

global._l = global._l || (text => text);
global.alert = () => {};

global.window = {
  platformENV: {
    isOverseas: false,
    isLocal: false,
  },
};

const CustomSelectDate = requireEsm('./index.js', {
  antd: { Select },
  'ming-ui': {
    DatePicker: {
      RangePicker,
    },
    Icon,
  },
  '../../logs/enum': {
    searchDateList: [{ label: '自定义日期', value: 11 }],
  },
  './index.less': {},
}).default;

const changeCalls = [];

ReactDOMServer.renderToStaticMarkup(
  React.createElement(CustomSelectDate, {
    className: 'dateSelect',
    dateFormat: 'YYYY-MM-DD HH:mm:ss',
    dateInfo: {},
    timePicker: true,
    timeMode: 'minute',
    changeDate: data => changeCalls.push(data),
  }),
);

assert.strictEqual(rangePickerProps.timePicker, true);
assert.strictEqual(rangePickerProps.timeMode, 'minute');

rangePickerProps.onOk([moment('2026-07-01 08:30:00'), moment('2026-07-02 18:45:00')]);

assert.deepStrictEqual(changeCalls[0], {
  startDate: '2026-07-01 08:30:00',
  endDate: '2026-07-02 18:45:00',
  searchDateStr: '2026-07-01 08:30:00~2026-07-02 18:45:00 ',
});

const futureEnd = moment().add(1, 'day').hour(18).minute(45).second(0).millisecond(0);

rangePickerProps.onOk([moment('2026-07-01 08:30:00'), futureEnd]);

assert.deepStrictEqual(changeCalls[1], {
  startDate: '2026-07-01 08:30:00',
  endDate: futureEnd.format('YYYY-MM-DD HH:mm:ss'),
  searchDateStr: `2026-07-01 08:30:00~${futureEnd.format('YYYY-MM-DD HH:mm:ss')} `,
});

const today = moment();
const dateOnlyCalls = [];

ReactDOMServer.renderToStaticMarkup(
  React.createElement(CustomSelectDate, {
    className: 'dateSelect',
    dateFormat: 'YYYY-MM-DD HH:mm:ss',
    dateInfo: {},
    changeDate: data => dateOnlyCalls.push(data),
  }),
);

rangePickerProps.onOk([moment(today).subtract(1, 'day'), moment(today)]);

assert.deepStrictEqual(dateOnlyCalls[0], {
  startDate: moment(today).subtract(1, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
  endDate: moment(today).endOf('day').format('YYYY-MM-DD HH:mm:ss'),
  searchDateStr: `${moment(today).subtract(1, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss')}~${moment(today)
    .endOf('day')
    .format('YYYY-MM-DD HH:mm:ss')} `,
});

const style = fs.readFileSync(path.join(__dirname, 'index.less'), 'utf8');

assert(style.includes('.mui-datetimerangepicker'));
assert(/color:\s*var\(--color-text-title\)/.test(style));

console.log('CustomSelectDate tests passed');
