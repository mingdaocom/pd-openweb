const assert = require('assert');
const path = require('path');
const { transformFileSync } = require('@babel/core');

function createElement(type, props, ...children) {
  return { type, props: props || {}, children: children.flat() };
}

function findElement(tree, type) {
  if (!tree) return undefined;
  if (tree.type === type || tree.type?.name === type) return tree;

  return (tree.children || []).map(child => findElement(child, type)).find(Boolean);
}

let staticMapUrlArguments;
let staticMapUrl = 'https://amap.mingdao.com/static-map-image';
let stateIndex = 0;
const moduleLike = { exports: {} };
const { code } = transformFileSync(path.join(__dirname, 'StaticMap.jsx'), {
  babelrc: false,
  presets: ['@babel/preset-env', '@babel/preset-react'],
  plugins: ['@babel/plugin-transform-modules-commonjs'],
});

function localRequire(importPath) {
  if (importPath === 'react') {
    return {
      __esModule: true,
      default: { createElement },
      useCallback: callback => callback,
      useEffect: effect => effect(),
      useRef: initialValue => ({ current: initialValue }),
      useState: initialValue => {
        const value = stateIndex === 0 ? { width: 375, height: 110 } : initialValue;
        stateIndex += 1;
        return [value, () => {}];
      },
    };
  }

  if (importPath === './staticMapUtils') {
    return {
      getStaticMapUrl: options => {
        staticMapUrlArguments = options;
        return staticMapUrl;
      },
    };
  }

  if (/MapLoader|MapHandler|GoogleMap|\/Amap$/.test(importPath)) {
    throw new Error(`StaticMap 不应加载 JS 地图依赖: ${importPath}`);
  }

  return require(importPath);
}

new Function('module', 'exports', 'require', code)(moduleLike, moduleLike.exports, localRequire);
const StaticMap = moduleLike.exports.default;

let imageErrorCount = 0;

const onError = () => {
  imageErrorCount += 1;
};

const tree = StaticMap({
  location: { x: 116.397, y: 39.908, coordinate: 'wgs84' },
  mapStyle: { minHeight: 110, minWidth: 'auto' },
  onError,
});
const image = findElement(tree, 'img');

assert.ok(image, 'H5 定位预览应渲染静态图片');
assert.strictEqual(image.props.src, 'https://amap.mingdao.com/static-map-image');
image.props.onError();
image.props.onError();
assert.strictEqual(imageErrorCount, 1, '同一张静态图重复加载失败时只应通知一次');
assert.deepStrictEqual(
  staticMapUrlArguments,
  { x: 116.397, y: 39.908, width: 375, height: 110 },
  '静态图片应直接使用定位控件传入的已处理坐标，避免重复转换',
);

staticMapUrl = '';
stateIndex = 0;
let fallbackCount = 0;

StaticMap({
  location: { x: 116.397, y: 39.908 },
  mapStyle: { minHeight: 110, minWidth: 'auto' },
  onError: () => {
    fallbackCount += 1;
  },
});

assert.strictEqual(fallbackCount, 1, '尺寸已就绪但无法生成静态图 URL 时应回退旧地图');

console.log('Mobile location StaticMap tests passed');
