const assert = require('assert');
const path = require('path');
const { transformFileSync } = require('@babel/core');

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

const { normalizeGenerateRecordAttachments } = requireEsm('./utils.js', {
  'src/api/agent': {},
  'src/components/Mingo/ChatBot/utils': {
    buildFormFieldsControls: () => [],
  },
  'src/utils/agentSession': {
    genBotSessionId: () => 'session-id',
  },
  'src/utils/common': {
    emitter: { emit: () => {} },
  },
  'src/utils/control': {
    formatAiGenControlValue: (_control, value) => value,
  },
});

assert.deepStrictEqual(
  normalizeGenerateRecordAttachments([
    {
      fileID: 'app-image-id',
      fileExt: '.jpg',
      originalFileName: 'photo',
      fileSize: 1024,
      url: 'https://example.com/photo.jpg',
    },
    {
      id: 'h5-image-id',
      type: 'image/png',
      name: 'h5.png',
      size: 2048,
      url: 'https://example.com/h5.png',
    },
    {
      fileID: 'app-doc-id',
      fileExt: '.pdf',
      originalFileName: 'doc',
      fileSize: 4096,
      url: 'https://example.com/doc.pdf',
    },
    {
      fileID: 'no-url-id',
      fileExt: '.png',
      originalFileName: 'skip',
    },
  ]),
  [
    {
      type: 'image',
      url: 'https://example.com/photo.jpg',
      name: 'photo',
      size: 1024,
    },
    {
      type: 'image',
      url: 'https://example.com/h5.png',
      name: 'h5.png',
      size: 2048,
    },
    {
      type: 'doc',
      url: 'https://example.com/doc.pdf',
      name: 'doc',
      size: 4096,
    },
  ],
);

assert.strictEqual(
  normalizeGenerateRecordAttachments([
    { fileExt: '.heic', originalFileName: 'ios', url: 'https://example.com/ios.heic' },
  ])[0].type,
  'image',
);

console.log('MobileNewRecord core utils tests passed');
