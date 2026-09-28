import { setLocalStorageItemSafely } from 'src/utils/platform/storage/safe';
import { EMOTION_GROUP_IDS, getEmotionAliases } from './data';

const getAttribute = (html, name) => {
  const match = String(html || '').match(new RegExp(`(?:^|\\s)${name}=(['"])(.*?)\\1`, 'i'));
  return match ? match[2] : '';
};

const findItem = (groups, groupId, itemId) => {
  const group = groups.find(item => item.id === groupId);
  return group?.content.find(item => item.id === itemId);
};

const resolveLegacyItem = (groups, html) => {
  const code = getAttribute(html, 'code');
  const className = getAttribute(html, 'class');
  const src = getAttribute(html, 'src') || String(html || '').match(/<img[^>]+src=(['"])(.*?)\1/i)?.[2] || '';
  const fileName = src.split('/').pop();
  let groupIds;

  if (className.split(/\s+/).includes('emoji')) {
    groupIds = [EMOTION_GROUP_IDS.PEOPLE, EMOTION_GROUP_IDS.NATURE, EMOTION_GROUP_IDS.FOOD, EMOTION_GROUP_IDS.OBJECTS];
  } else if (src.includes('/bear/')) {
    groupIds = [EMOTION_GROUP_IDS.BEAR];
  } else if (src.includes('/aru/')) {
    groupIds = [EMOTION_GROUP_IDS.ARU];
  } else {
    groupIds = [EMOTION_GROUP_IDS.CLASSIC];
  }

  for (const groupId of groupIds) {
    const group = groups.find(item => item.id === groupId);
    const matchedItem = group?.content.find(
      item =>
        item.code === code ||
        getEmotionAliases(item).includes(code) ||
        (fileName && item.img && [item.img, item.img.replace(/\.png$/i, '.gif')].includes(fileName)),
    );

    if (matchedItem) return matchedItem;
  }
};

export const getEmotionHistoryKey = () => `${md.global.Account.accountId || ''}_emotions_v2`;
export const getLegacyEmotionHistoryKey = () => `${md.global.Account.accountId || ''}_emotions`;

export function parseEmotionHistory(rawValue, groups) {
  const storedItems = safeParse(rawValue, 'array');

  if (!Array.isArray(storedItems)) return [];

  return storedItems
    .slice(0, 100)
    .map(item => {
      if (item && typeof item === 'object') {
        return findItem(groups, item.groupId, item.itemId);
      }

      return typeof item === 'string' ? resolveLegacyItem(groups, item) : undefined;
    })
    .filter(Boolean)
    .filter((item, index, items) => items.findIndex(current => current.id === item.id) === index);
}

export function readEmotionHistory(groups, historyKey = getEmotionHistoryKey(), { migrateLegacy = true } = {}) {
  try {
    const storedValue = window.localStorage?.getItem(historyKey);

    if (storedValue !== null && storedValue !== undefined) {
      return parseEmotionHistory(storedValue, groups);
    }

    const legacyItems = parseEmotionHistory(window.localStorage?.getItem(getLegacyEmotionHistoryKey()), groups);

    if (legacyItems.length && migrateLegacy) {
      saveEmotionHistory(legacyItems, historyKey);
    }

    return legacyItems;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export function saveEmotionHistory(items, historyKey = getEmotionHistoryKey()) {
  return setLocalStorageItemSafely(
    historyKey,
    JSON.stringify(items.map(item => ({ groupId: item.groupId, itemId: item.id }))),
  );
}

export function addEmotionHistory(history, item, historySize) {
  return [item, ...history.filter(current => current.id !== item.id)].slice(0, historySize);
}
