const assert = require('assert');
const path = require('path');
const { transformFileSync } = require('@babel/core');

function requireStaticMapUtils() {
  const moduleLike = { exports: {} };
  const { code } = transformFileSync(path.join(__dirname, 'staticMapUtils.js'), {
    babelrc: false,
    presets: ['@babel/preset-env'],
    plugins: ['@babel/plugin-transform-modules-commonjs'],
  });

  new Function('module', 'exports', 'require', code)(moduleLike, moduleLike.exports, require);
  return moduleLike.exports;
}

const { getStaticMapUrl } = requireStaticMapUtils();

assert.strictEqual(
  getStaticMapUrl({ x: 116.397, y: 39.908, width: 375.4, height: 110.6 }),
  '/_AMapService/v3/staticmap?location=116.397,39.908&zoom=17&size=375*111&scale=2&markers=mid,,A:116.397,39.908',
  '静态图应使用代理地址、逻辑像素尺寸和高德 markers 大头针',
);

const oversizedUrl = getStaticMapUrl({ x: 116.397, y: 39.908, width: 2048, height: 2048 });
assert.ok(oversizedUrl.includes('size=1024*1024'), '静态图宽高不得超过 1024');
assert.ok(!/[?&]key=/.test(oversizedUrl), '静态图 URL 不得包含 key');
assert.strictEqual(getStaticMapUrl({ x: 116.397, y: 39.908, width: 0, height: 110 }), '', '无效尺寸不应请求静态图');

console.log('Mobile location static map utils tests passed');
