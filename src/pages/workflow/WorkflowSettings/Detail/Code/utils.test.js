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

const { getCodeForSave, shouldSyncCodeMirrorContent } = requireEsm('./utils.js');

assert.strictEqual(
  getCodeForSave({
    editorCode: 'output = { value: "latest" };',
    stateCode: 'output = { value: "stale" };',
  }),
  'output = { value: "latest" };',
);

assert.strictEqual(
  getCodeForSave({
    editorCode: undefined,
    stateCode: 'output = { value: "state" };',
  }),
  'output = { value: "state" };',
);

assert.strictEqual(
  shouldSyncCodeMirrorContent({
    codeChanged: true,
    fullCodeChanged: false,
    changedFromEditor: true,
  }),
  false,
);

assert.strictEqual(
  shouldSyncCodeMirrorContent({
    codeChanged: true,
    fullCodeChanged: false,
    changedFromEditor: false,
  }),
  true,
);

assert.strictEqual(
  shouldSyncCodeMirrorContent({
    codeChanged: false,
    fullCodeChanged: true,
    changedFromEditor: true,
  }),
  true,
);

assert.strictEqual(
  shouldSyncCodeMirrorContent({
    codeChanged: false,
    fullCodeChanged: false,
    changedFromEditor: false,
  }),
  false,
);

console.log('Code utils tests passed');
