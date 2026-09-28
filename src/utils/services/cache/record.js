import _, { get } from 'lodash';
import moment from 'moment';
import webCache from 'src/api/webCache';

/**
 * 将键值写入后端 WebCache，未指定过期时间时默认保存三天。
 */
function KVSet(key, value, { expireTime } = {}) {
  return webCache.add({
    key,
    value,
    moduleType: 2,
    expireTime: expireTime || moment(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)).format('YYYY-MM-DD HH:mm:ss'),
  });
}

/** 对后端 KV 写入提供 1 秒防抖，合并短时间内的频繁写入请求。 */
const debouncedKVSet = _.debounce(KVSet, 1000);

/**
 * 从后端 WebCache 读取指定键的数据值。
 */
export function KVGet(key) {
  return webCache.get({ key, moduleType: 2 }).then(res => get(res, 'data') || '');
}

/**
 * 从后端 WebCache 静默清除指定键的数据。
 */
function KVClear(key) {
  return webCache.clear({ key, moduleType: 2 }, { silent: true });
}

/**
 * 暂存记录值到本地或企业微信远程缓存，并淘汰超量旧记录。
 */
export function saveTempRecordValueToLocal(key, id, value, max = 5) {
  if (window.isWxWork) {
    debouncedKVSet(`${md.global.Account.accountId}${id}-${key}`, value);
    return debouncedKVSet;
  }

  let savedIds = [];

  if (localStorage.getItem(key)) {
    try {
      savedIds = safeParse(localStorage.getItem(key), 'array');
      savedIds = savedIds.filter(sid => sid !== id);
    } catch (err) {
      console.error(err);
    }
  }

  savedIds.push(id);
  if (savedIds.length > max) {
    localStorage.removeItem(`${key}_${savedIds[0]}`, value);
    savedIds = savedIds.slice(1);
  }

  try {
    safeLocalStorageSetItem(key, JSON.stringify(savedIds));
    safeLocalStorageSetItem(`${key}_${id}`, value);
  } catch (err) {
    console.error(err);
    Object.keys(localStorage)
      .filter(k => k.startsWith(key))
      .forEach(k => localStorage.removeItem(k));
    safeLocalStorageSetItem(key, JSON.stringify(savedIds));
    safeLocalStorageSetItem(`${key}_${id}`, value);
  }
}

/**
 * 从本地或企业微信远程缓存中移除指定暂存记录。
 */
export function removeTempRecordValueFromLocal(key, id) {
  if (window.isWxWork) {
    KVClear(`${md.global.Account.accountId}${id}-${key}`);
    return;
  }

  let savedIds = [];

  if (localStorage.getItem(key)) {
    try {
      savedIds = safeParse(localStorage.getItem(key), 'array');
      savedIds = savedIds.filter(sid => sid !== id);
    } catch (err) {
      console.error(err);
    }
  }

  if (savedIds && savedIds.length) {
    safeLocalStorageSetItem(key, JSON.stringify(savedIds));
  } else {
    localStorage.removeItem(key);
  }

  localStorage.removeItem(`${key}_${id}`);
}
