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

const { parseStreamingJsonlData } = requireEsm('./sse.js');

assert.deepStrictEqual(parseStreamingJsonlData('{"id":"001","value":1}\n', false), [{ id: '001', value: 1 }]);

console.log('sse utils tests passed');
