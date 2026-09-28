// 工具栏「筛选」选中的已保存筛选器 id 持久化到 url 的参数名
const SHEET_FILTER_URL_KEY = 'sf';

/** 把选中的已保存筛选器 id 写入 url，刷新后可还原选中；不传 filterId 时仅清除该参数。 */
export function saveSheetFilterIdToUrl(filterId) {
  if (typeof window === 'undefined' || !window.history) return;
  try {
    const search = new URLSearchParams(window.location.search);

    if (!filterId) {
      search.delete(SHEET_FILTER_URL_KEY);
    } else {
      search.set(SHEET_FILTER_URL_KEY, filterId);
    }

    const newSearch = search.toString();
    const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash;
    window.history.replaceState(window.history.state, '', newUrl);
  } catch (err) {
    console.error('saveSheetFilterIdToUrl error', err);
  }
}

/** 仅清除 url 上选中的筛选器参数。 */
export function clearSheetFilterIdUrl() {
  saveSheetFilterIdToUrl();
}

/** 从 url 读取选中的筛选器 id。 */
export function getSheetFilterIdFromUrl() {
  try {
    return new URLSearchParams(window.location.search).get(SHEET_FILTER_URL_KEY) || null;
  } catch (err) {
    console.error('getSheetFilterIdFromUrl error', err);
    return null;
  }
}
