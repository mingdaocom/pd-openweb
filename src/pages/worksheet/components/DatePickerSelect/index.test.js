const assert = require('assert');
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

global._l = global._l || (text => text);

let rangePickerProps;
const DatePicker = {
  RangePicker: props => {
    rangePickerProps = props;
    return React.createElement('div', { className: 'rangePicker' }, props.children);
  },
};

const DatePickSelect = requireEsm('./index.jsx', {
  'ming-ui': { DatePicker },
  './index.less': {},
}).default;

const selectedValue = ['2026-07-10 09:30:00', '2026-07-10 10:45:00'];
let changed;

ReactDOMServer.renderToStaticMarkup(
  React.createElement(DatePickSelect, {
    selectedValue,
    timePicker: true,
    onChange: data => {
      changed = data;
    },
  }),
);

assert.strictEqual(rangePickerProps.timePicker, true);
assert.strictEqual(rangePickerProps.timeMode, 'minute');
assert.deepStrictEqual(rangePickerProps.selectedValue, selectedValue);

rangePickerProps.onOk([moment('2026-07-10 09:30:00'), moment('2026-07-10 10:45:00')]);

assert.strictEqual(changed.label, '2026-07-10 09:30 ~ 2026-07-10 10:45');
assert.strictEqual(moment(changed.value[0]).format('YYYY-MM-DD HH:mm:ss'), '2026-07-10 09:30:00');
assert.strictEqual(moment(changed.value[1]).format('YYYY-MM-DD HH:mm:ss'), '2026-07-10 10:45:00');

let defaultChanged;
ReactDOMServer.renderToStaticMarkup(
  React.createElement(DatePickSelect, {
    onChange: data => {
      defaultChanged = data;
    },
  }),
);

assert.strictEqual(rangePickerProps.timePicker, false);
rangePickerProps.onOk([moment('2026-07-10'), moment('2026-07-11')]);
assert.strictEqual(defaultChanged.label, '自定义');

console.log('DatePickerSelect tests passed');
