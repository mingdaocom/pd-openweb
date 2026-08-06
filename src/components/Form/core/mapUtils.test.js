const assert = require('assert');
const path = require('path');
const { transformFileSync } = require('@babel/core');

function requireMapUtils({ deferLoad = false } = {}) {
  const module = { exports: {} };
  const { code } = transformFileSync(path.join(__dirname, 'mapUtils.js'), {
    babelrc: false,
    presets: ['@babel/preset-env'],
    plugins: ['@babel/plugin-transform-modules-commonjs'],
  });

  let loadCount = 0;
  let loaderCount = 0;
  let handlerCount = 0;
  let destroyCount = 0;
  let getCurrentPosCallback;
  let resolveLoad;
  const locationResult = {
    formattedAddress: '上海市',
    position: { lng: 121.5, lat: 31.2 },
  };

  class MockMapHandler {
    constructor() {
      handlerCount += 1;
    }

    getCurrentPos(callback) {
      getCurrentPosCallback = callback;
    }

    destroyMap() {
      destroyCount += 1;
    }
  }

  class MockMapLoader {
    constructor() {
      loaderCount += 1;
    }

    loadJs() {
      loadCount += 1;
      if (deferLoad) {
        return new Promise(resolve => {
          resolveLoad = resolve;
        });
      }

      return Promise.resolve();
    }
  }

  function localRequire(request) {
    if (request === 'src/ming-ui/components/amap/MapHandler') {
      return { __esModule: true, default: MockMapHandler };
    }

    if (request === 'src/ming-ui/components/amap/MapLoader') {
      return { __esModule: true, default: MockMapLoader };
    }

    return require(request);
  }

  new Function('module', 'exports', 'require', code)(module, module.exports, localRequire);

  return {
    mapUtils: module.exports,
    counters: {
      get loadCount() {
        return loadCount;
      },
      get loaderCount() {
        return loaderCount;
      },
      get handlerCount() {
        return handlerCount;
      },
      get destroyCount() {
        return destroyCount;
      },
      resolveLocation() {
        getCurrentPosCallback('complete', locationResult);
      },
      resolveLoad() {
        resolveLoad();
      },
      locationResult,
    },
  };
}

async function flushLocationChain() {
  for (let i = 0; i < 5; i++) {
    await Promise.resolve();
  }
}

(async () => {
  const { mapUtils, counters } = requireMapUtils();

  mapUtils.retainMapLocation();
  mapUtils.retainMapLocation();

  const first = mapUtils.getCurrentPos();
  const second = mapUtils.getCurrentPos();

  await flushLocationChain();

  assert.strictEqual(counters.loadCount, 1, '并发定位应复用同一次地图加载');
  assert.strictEqual(counters.loaderCount, 1, '并发定位应只创建一个地图加载器');
  assert.strictEqual(counters.handlerCount, 1, '并发定位应只创建一个地图实例');

  counters.resolveLocation();

  const [firstLocation, secondLocation] = await Promise.all([first, second]);

  assert.strictEqual(firstLocation, counters.locationResult, '定位结果应直接返回底层 result');
  assert.strictEqual(secondLocation, counters.locationResult, '并发定位调用应获得同一个定位 result');
  assert.strictEqual(counters.destroyCount, 0, '定位结束后应保留地图实例供下一次复用');

  const third = mapUtils.getCurrentPos();
  await flushLocationChain();

  assert.strictEqual(counters.handlerCount, 1, '上一轮结束后再次定位应复用同一个地图实例');
  assert.strictEqual(counters.loaderCount, 1, '上一轮结束后再次定位应复用同一个地图加载器');

  counters.resolveLocation();
  await third;

  mapUtils.destroyMapLocation();

  assert.strictEqual(counters.destroyCount, 0, '仍有表单实例存在时不应销毁共享地图实例');

  mapUtils.destroyMapLocation();

  assert.strictEqual(counters.destroyCount, 1, '最后一个表单卸载时应统一销毁共享地图实例');
  mapUtils.retainMapLocation();
  const nextFormLocation = mapUtils.getCurrentPos();

  await flushLocationChain();

  assert.strictEqual(counters.loaderCount, 2, '最后一个表单卸载后应释放地图加载器引用');

  counters.resolveLocation();
  await nextFormLocation;
  mapUtils.destroyMapLocation();

  const deferred = requireMapUtils({ deferLoad: true });
  deferred.mapUtils.retainMapLocation();
  const expiredLocation = deferred.mapUtils.getCurrentPos();

  await flushLocationChain();

  deferred.mapUtils.destroyMapLocation();
  deferred.counters.resolveLoad();

  await assert.rejects(expiredLocation, /Location lifecycle expired before map init/);
  assert.strictEqual(deferred.counters.handlerCount, 0, '生命周期失效后不应再创建地图实例');

  console.log('Form map utils tests passed');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
