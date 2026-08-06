export const ITEM_TYPE = 'VIEW_CUSTOM_BTN_LAYOUT';
export const ITEM_TYPE_GROUP = 'VIEW_CUSTOM_BTN_GROUP_SEGMENT';

/** IconTabs 选图后约 200ms 才 onModify；关窗时 onChange 先到，延后读 iconDraftRef 再 commit（不改 ming-ui） */
export const GROUP_ICON_DIALOG_REF_FLUSH_MS = 250;

/** 同一时间只允许一个「更多」菜单展开，避免多个 Dropdown portal 叠在一起 */
export function getNextOpenMoreKey(prevKey, visible, moreKey) {
  if (visible) {
    return moreKey;
  }

  return prevKey === moreKey ? null : prevKey;
}
