import { EMOTION_GROUP_IDS, getEmotionImageSrc } from './data';

export function getVisibleEmotionGroups(
  groups,
  historyItems,
  { hideClassic = false, history = true, showAru = false, showBear = false } = {},
) {
  const selectableGroups = groups
    .filter(group => group.id !== EMOTION_GROUP_IDS.HISTORY)
    .filter(group => group.id !== EMOTION_GROUP_IDS.CLASSIC || !hideClassic)
    .filter(group => group.id !== EMOTION_GROUP_IDS.BEAR || showBear)
    .filter(group => group.id !== EMOTION_GROUP_IDS.ARU || showAru);
  const selectableGroupIds = new Set(selectableGroups.map(group => group.id));
  const visibleHistoryItems = historyItems.filter(item => selectableGroupIds.has(item.groupId));
  const visibleGroups = history && visibleHistoryItems.length ? [groups[0], ...selectableGroups] : selectableGroups;

  return { visibleGroups, visibleHistoryItems };
}

export const createEmotionSelection = (group, item) => ({
  code: item.code,
  groupId: group.id,
  id: item.id,
  src: group.type === 'emoji' ? '' : getEmotionImageSrc(group, item, { animated: true }),
  text: group.type === 'emoji' ? item.code : group.type === 'classic' ? `[${item.code}]` : '',
  type: group.type,
});
