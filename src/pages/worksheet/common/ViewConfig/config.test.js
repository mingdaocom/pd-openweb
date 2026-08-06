const assert = require('assert');
const path = require('path');
const { transformFileSync } = require('@babel/core');

global._l = text => `translated:${text}`;

function requireEsm(file) {
  const moduleLike = { exports: {} };
  const { code } = transformFileSync(path.join(__dirname, file), {
    babelrc: false,
    plugins: ['@babel/plugin-transform-modules-commonjs'],
  });

  new Function('module', 'exports', 'require', code)(moduleLike, moduleLike.exports, require);
  return moduleLike.exports;
}

const { REFRESH_TIME_OPTIONS, REFRESH_TIME_VALUES } = requireEsm('./config.js');
const expectedValues = ['0', '10', '20', '30', '60', '120', '180', '240', '300'];

assert.deepStrictEqual(
  REFRESH_TIME_OPTIONS.map(item => item.value),
  expectedValues,
);

assert.deepStrictEqual(
  REFRESH_TIME_OPTIONS.map(item => item.text),
  [
    'translated:关闭',
    'translated:10秒',
    'translated:20秒',
    'translated:30秒',
    'translated:1分钟',
    'translated:2分钟',
    'translated:3分钟',
    'translated:4分钟',
    'translated:5分钟',
  ],
);

assert.deepStrictEqual(
  REFRESH_TIME_VALUES,
  REFRESH_TIME_OPTIONS.map(item => item.value).filter(value => value !== '0'),
);

console.log('Worksheet view config tests passed');
