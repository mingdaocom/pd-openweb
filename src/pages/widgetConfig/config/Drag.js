export const DRAG_ITEMS = {
  LIST_ITEM: 'LIST_ITEM',
  LIST_TAB: 'LIST_TAB',
  DISPLAY_ITEM: 'DISPLAY_ITEM',
  DISPLAY_TAB: 'DISPLAY_TAB',
  DISPLAY_LIST_TAB: 'DISPLAY_LIST_TAB', // 标签页表格
};

export const WHOLE_SIZE = 12;

export const TEMP_WIDGET = 'TEMP_WIDGET';

export const DRAG_MODE = {
  INSERT_NEW_LINE: 'INSERT_NEW_LINE',
  INSERT_TO_COL: 'INSERT_TO_COL',
  INSERT_TO_ROW_END: 'INSERT_TO_ROW_END',
  INSERT_ROW: 'INSERT_ROW',
};

export const DRAG_DISTANCE = {
  VERTICAL: 16,
};

// 各类型控件接收拖拽类型
export const DRAG_ACCEPT = {
  common: [DRAG_ITEMS.LIST_ITEM, DRAG_ITEMS.DISPLAY_ITEM, DRAG_ITEMS.DISPLAY_LIST_TAB], // 普通控件类型
  tab: [DRAG_ITEMS.LIST_TAB, DRAG_ITEMS.DISPLAY_TAB, DRAG_ITEMS.DISPLAY_LIST_TAB], // 标签页类型
  tabItem: [DRAG_ITEMS.LIST_ITEM, DRAG_ITEMS.DISPLAY_ITEM], // 单个标签页内支持控件类型
};
