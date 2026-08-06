import MapHandler from 'src/ming-ui/components/amap/MapHandler';
import MapLoader from 'src/ming-ui/components/amap/MapLoader';

let pendingLocationPromise = null;
let mapLoader = null;
let mapHandler = null;
let formRefCount = 0;
let lifecycleVersion = 0;

function getMapLoader() {
  if (!mapLoader) {
    mapLoader = new MapLoader();
  }

  return mapLoader;
}

function destroyMapHandler() {
  if (!mapHandler) return;

  try {
    mapHandler.destroyMap();
  } catch (err) {
    console.warn('destroy map failed:', err);
  } finally {
    mapHandler = null;
  }
}

function isCurrentLifecycle(version) {
  return version === lifecycleVersion && formRefCount > 0;
}

export function getCurrentPos() {
  // 多个附件字段快速点击时复用同一次定位请求，避免 SDK 未加载完成前重复创建地图实例。
  if (pendingLocationPromise) {
    return pendingLocationPromise;
  }

  const currentVersion = lifecycleVersion;
  const locationPromise = Promise.resolve()
    .then(() => getMapLoader().loadJs())
    .then(() => {
      if (!isCurrentLifecycle(currentVersion)) {
        throw new Error('Location lifecycle expired before map init');
      }

      // 地图实例在表单生命周期内复用，减少 WebGL context 压力。
      if (!mapHandler) {
        mapHandler = new MapHandler();
      }

      return new Promise((resolve, reject) => {
        mapHandler.getCurrentPos(
          (status, result = {}) => {
            if (!isCurrentLifecycle(currentVersion)) {
              reject(new Error('Location lifecycle expired after callback'));
              return;
            }

            if (status === 'complete' && result.formattedAddress) {
              resolve(result);
              return;
            }

            reject(new Error(`Location failed: ${status || 'unknown'}`));
          },
          false,
          {
            locationFailedCallback: err => {
              if (!isCurrentLifecycle(currentVersion)) {
                reject(new Error('Location lifecycle expired after failed callback'));
                return;
              }

              reject(err || new Error('AMap location failed'));
            },
          },
        );
      });
    });

  const pendingPromise = locationPromise.finally(() => {
    if (pendingLocationPromise === pendingPromise) {
      pendingLocationPromise = null;
    }
  });

  pendingLocationPromise = pendingPromise;

  return pendingLocationPromise;
}

export function retainMapLocation() {
  formRefCount += 1;
}

export function destroyMapLocation() {
  formRefCount = Math.max(formRefCount - 1, 0);

  if (formRefCount > 0) {
    return;
  }

  pendingLocationPromise = null;
  lifecycleVersion += 1;
  // 表单卸载时释放共享地图实例，避免跨页面常驻。
  destroyMapHandler();
  mapLoader = null;
}
