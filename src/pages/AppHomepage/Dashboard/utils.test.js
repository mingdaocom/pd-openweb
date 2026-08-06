const assert = require('assert');
const path = require('path');
const { transformFileSync } = require('@babel/core');

global._l = value => value;

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

const { getImageBase64UploadData, getUrlWithRandomQuery } = requireEsm('./utils.js', {
  'src/utils/controlCommon': {
    getRgbaByColor: () => '',
  },
});

assert.strictEqual(getImageBase64UploadData('data:image/jpeg;base64,jpg-content', 'jpg'), 'jpg-content');
assert.strictEqual(getImageBase64UploadData('data:image/gif;base64,gif-content', 'gif'), 'gif-content');
assert.strictEqual(
  getUrlWithRandomQuery('https://fp1.mingdaoyun.cn/dashboard/assets/leap/banner.gif', '123'),
  'https://fp1.mingdaoyun.cn/dashboard/assets/leap/banner.gif?123',
);
assert.strictEqual(
  getUrlWithRandomQuery('https://fp1.mingdaoyun.cn/dashboard/assets/leap/banner.gif?imageView2/2/h/400', '123'),
  'https://fp1.mingdaoyun.cn/dashboard/assets/leap/banner.gif?imageView2/2/h/400?123',
);

console.log('Dashboard utils tests passed');
