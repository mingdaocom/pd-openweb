/** 通过全局安全入口写入 localStorage，并把存储异常转换为失败状态。 */
export const setLocalStorageItemSafely = (key, value) => {
  try {
    safeLocalStorageSetItem(key, value);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

/** 安全写入 sessionStorage；该平台封装是 utils 内唯一的原生 sessionStorage.setItem 实现。 */
export const setSessionStorageItemSafely = (key, value) => {
  try {
    sessionStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
