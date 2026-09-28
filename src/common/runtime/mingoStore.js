import EventEmitter from 'events';

const globalStoreForMingo = {
  emitter: new EventEmitter(),
  activeModule: 'worksheet', // ["worksheet", "worksheetControlsEdit"]
};

window.globalStoreForMingo = globalStoreForMingo;

/**
 * 更新或清空 Mingo 跨模块共享状态。
 */
export const updateGlobalStoreForMingo = (key, value) => {
  if (typeof key === 'string') {
    globalStoreForMingo[key] = value;
  } else {
    if (value === 'clear') {
      Object.keys(globalStoreForMingo).forEach(k => {
        delete globalStoreForMingo[k];
      });
    }

    Object.keys(key).forEach(k => {
      globalStoreForMingo[k] = key[k];
    });
  }
};
