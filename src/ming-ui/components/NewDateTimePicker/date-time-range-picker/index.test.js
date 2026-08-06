const assert = require('assert');
const fs = require('fs');
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
    if (stubs[request]) {
      return stubs[request];
    }

    return require(request);
  }

  new Function('module', 'exports', 'require', code)(module, module.exports, localRequire);
  return module.exports;
}

global._l = global._l || (text => text);
global.alert = () => {};

const Button = ({ children, type }) => React.createElement('button', { className: type }, children);
const Checkbox = ({ children }) => React.createElement('label', null, children);
const Dropdown = () => React.createElement('div', { className: 'Dropdown' });

const Time = ({ value }) => {
  const hour = String(value.hour).padStart(2, '0');
  const minute = String(value.minute).padStart(2, '0');

  return React.createElement('span', { className: 'mui-time' }, `${hour}:${minute}`);
};

const DatePickerBase = ({ prefix }) => React.createElement('div', { className: 'datePickerBase' }, prefix);

const DateTimeRangeDoublePicker = requireEsm('./index.jsx', {
  '../../Button': { __esModule: true, default: Button },
  '../../Checkbox': { __esModule: true, default: Checkbox },
  '../../Dropdown': { __esModule: true, default: Dropdown },
  '../../NewTimePicker/index': { __esModule: true, default: Time },
  '../date-picker-base/index': { __esModule: true, default: DatePickerBase },
  '../lib/calender': {
    __esModule: true,
    default: {
      isSameDate: () => false,
    },
  },
  './style.less': {},
}).default;

const markup = ReactDOMServer.renderToStaticMarkup(
  React.createElement(DateTimeRangeDoublePicker, {
    type: 'datetime',
    timeType: 'minute',
    value: [new Date(2026, 6, 9, 9), new Date(2026, 6, 9, 18)],
    config: {},
    halfStart: 'AM',
    halfEnd: 'PM',
    allowClear: true,
    firstDayOfWeek: 1,
    onChange: () => {},
  }),
);

assert.strictEqual((markup.match(/timePickerGroup/g) || []).length, 2);
assert(markup.includes('时间'));
assert(markup.includes('09:00'));
assert(markup.includes('18:00'));

const style = fs.readFileSync(path.join(__dirname, 'style.less'), 'utf8');

assert(style.includes('.timePickerGroup'));
assert(/align-items:\s*center/.test(style));
assert(/text-align:\s*center/.test(style));
assert(/color:\s*var\(--color-text-title\)/.test(style));
assert(/justify-content:\s*flex-start/.test(style));
assert(/justify-content:\s*space-between/.test(style));
assert(!/position:\s*absolute/.test(style));

console.log('DateTimeRangePicker tests passed');
