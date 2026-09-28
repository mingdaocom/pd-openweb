import _ from 'lodash';

/** 按工作表标识在本地存储中保存字符串配置，并限制最多 30 项。 */
export function saveLRUWorksheetConfig(key, id, value) {
  if (_.isObject(value)) {
    throw new Error('只支持存储字符串');
  }

  const maxSaveNum = 30;
  let data = {};

  if (localStorage.getItem(key)) {
    try {
      data = safeParse(localStorage.getItem(key));
    } catch (err) {
      console.error(err);
    }
  }

  const newData = _.assign({}, data, { [id]: value });

  if (Object.keys(newData).length > maxSaveNum) {
    delete newData[Object.keys(newData).pop];
  }

  safeLocalStorageSetItem(key, JSON.stringify(newData));
}

/** 从本地工作表配置集合中删除指定标识的数据。 */
export function clearLRUWorksheetConfig(key, id) {
  let data = {};

  if (localStorage.getItem(key)) {
    try {
      data = safeParse(localStorage.getItem(key));
    } catch (err) {
      console.error(err);
    }
  }

  delete data[id];
  safeLocalStorageSetItem(key, JSON.stringify(data));
}

/** 从本地工作表配置集合中读取指定标识的数据。 */
export function getLRUWorksheetConfig(key, id) {
  let data = [];

  if (localStorage.getItem(key)) {
    try {
      data = safeParse(localStorage.getItem(key));
    } catch (err) {
      console.error(err);
      return;
    }
  }

  return data[id];
}

/**
 * 将附加数据编码进本地推送唯一标识，同时保留标识主体。
 */
export function appendDataToLocalPushUniqueId(data) {
  try {
    const defaultData = getDataFromLocalPushUniqueId();
    let pushUniqueId = _.get(md, 'global.Config.pushUniqueId');
    pushUniqueId = pushUniqueId.replace(/__(.+)/, '');
    if (pushUniqueId) {
      md.global.Config.pushUniqueId =
        pushUniqueId + (!data ? '' : `__${JSON.stringify(_.assign({}, defaultData, data))}`);
    }
  } catch (err) {
    console.error(err);
  }
}

/**
 * 解析本地推送唯一标识中附带的数据对象。
 */
export function getDataFromLocalPushUniqueId() {
  return safeParse(((_.get(md, 'global.Config.pushUniqueId') || '').match(/__(.+)/) || [])[1]);
}

/**
 * 忽略附加数据后比较推送标识是否与当前本地标识一致。
 */
export function equalToLocalPushUniqueId(pushUniqueId) {
  return String(pushUniqueId).replace(/__(.+)/, '') === _.get(md, 'global.Config.pushUniqueId').replace(/__(.+)/, '');
}
