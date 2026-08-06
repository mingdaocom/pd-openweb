import homeAppAjax from 'src/api/homeApp';

// Agent 应用候选数据源（@应用浮层 与 对话 context 的 commonApps 共用一套）：
// 统一走 HomeApp/SearchMyApps（后端做最近访问优先 + 命中优先 + 简拼/拼音，只返回首页必要字段），
// 无关键字的默认列表把收藏应用（getMyApp.markedApps）置顶。归一化为 { id, name, iconUrl, iconColor }，
// 模块级 5 分钟缓存（key = `${projectId}::${keywords}`），避免反复打开浮层 / 每条消息都重复拉取。

// 把不同接口返回的应用对象统一成数组（字段未必规整）
function pickList(res) {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.apps)) return res.apps;
  if (res && Array.isArray(res.list)) return res.list;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

// 归一化应用对象为 { id, name, iconUrl, iconColor }
export function normalizeApps(res) {
  return pickList(res)
    .map(a => ({
      id: a.id || a.appId,
      name: a.name || a.appName,
      iconUrl: a.iconUrl || a.appIconUrl || a.icon,
      iconColor: a.iconColor || a.appIconColor || a.themeColor || a.navColor,
    }))
    .filter(a => a.id && a.name);
}

// 应用列表缓存：模块级，key = `${projectId}::${query}`，5 分钟 TTL，容量上限防泄漏。
const APP_CACHE_TTL = 5 * 60 * 1000;
const APP_CACHE_MAX = 100;
const appListCache = new Map();

export function readAppCache(key) {
  const hit = appListCache.get(key);

  if (!hit) return null;

  if (Date.now() - hit.ts > APP_CACHE_TTL) {
    appListCache.delete(key);
    return null;
  }

  return hit.apps;
}

export function writeAppCache(key, apps) {
  // 超出容量上限时淘汰最早写入的一条（Map 保持插入顺序）
  if (appListCache.size >= APP_CACHE_MAX) {
    appListCache.delete(appListCache.keys().next().value);
  }

  appListCache.set(key, { ts: Date.now(), apps });
}

// 收藏应用（markedApps），归一化后用于默认列表置顶。
// abortController：透传给 mdyAPI，调用方切换关键字 / 关闭浮层时可中断已发出的请求。
export async function fetchFavoriteApps(projectId, { abortController } = {}) {
  const data = await homeAppAjax
    .getMyApp({ projectId, containsLinks: true }, { silent: true, abortController })
    .catch(() => null);
  const favorites = (data && (data.markedApps || data.markedAppItems)) || [];

  return normalizeApps(favorites.filter(a => a && (a.id || a.appId)));
}

// 按关键字搜索应用（SearchMyApps，后端排序）。
export async function searchApps(projectId, keywords, { abortController } = {}) {
  const res = await homeAppAjax.searchMyApps({ projectId, keywords }, { silent: true, abortController });

  return normalizeApps(res);
}

// 无关键字默认列表：收藏置顶 + SearchMyApps 常用应用（按 id 去重，收藏在前）。
export async function fetchDefaultApps(projectId, { abortController } = {}) {
  const [favorites, recents] = await Promise.all([
    fetchFavoriteApps(projectId, { abortController }),
    searchApps(projectId, '', { abortController }),
  ]);
  const favIds = new Set(favorites.map(a => a.id));

  return [...favorites, ...recents.filter(a => !favIds.has(a.id))];
}

// 统一入口：有关键字走搜索，无关键字走收藏置顶默认列表；命中缓存直接返回，失败返回 []。
export async function fetchAppCandidates(projectId, keywords = '') {
  if (!projectId) return [];
  const key = `${projectId}::${keywords || ''}`;
  const cached = readAppCache(key);

  if (cached) return cached;

  try {
    const list = keywords ? await searchApps(projectId, keywords) : await fetchDefaultApps(projectId);

    writeAppCache(key, list);
    return list;
  } catch {
    return [];
  }
}
