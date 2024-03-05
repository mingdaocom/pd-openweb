import { Set } from 'immutable';

export function selectAllItems(forceSelectAll, cb) {
  return (dispatch, getState) => {
    const kcState = getState().kc;
    let { selectAll } = kcState;
    const { list, selectedItems } = kcState;
    selectAll = forceSelectAll || !(selectAll && list.size === selectedItems.size);
    const newSelectedItems = selectAll
      ? Set(list.filter(i => i)) // 全选
      : Set(); // 全部取消
    dispatch({
      type: 'KC_SELECT_ALL_ITEMS',
      value: selectAll,
      selectedItems: newSelectedItems,
    });
    if (typeof cb === 'function') {
      cb();
    }
  };
}

export function clearSelect() {
  return (dispatch) => {
    dispatch({
      type: 'KC_SELECT_ALL_ITEMS',
      value: false,
      selectedItems: Set(),
    });
  };
}

export function selectItem(item) {
  return (dispatch, getState) => {
    const kcState = getState().kc;
    const { selectedItems } = kcState;
    dispatch({
      type: 'KC_UPDATE_SELECTED_ITEMS',
      value: selectedItems.contains(item)
        ? selectedItems.remove(item) // 已选中，为取消选择操作
        : selectedItems.add(item), // 未选中，为选择操作
    });
  };
}

export function selectItems(items) {
  return (dispatch, getState) => {
    const kcState = getState().kc;
    const { list } = kcState;
    items = Set(items);
    dispatch({
      type: 'KC_UPDATE_SELECTED_ITEMS',
      value: items,
    });
    dispatch({
      type: 'KC_CHANGE_SELECT_ALL',
      value: items.equals(Set(list.filter(i => i))),
    });
  };
}

export function selectSingleItem(item, extraState) {
  return (dispatch, getState) => {
    const kcState = getState().kc;
    const { list } = kcState;
    const newSelectedItems = Set(item ? [item] : []);
    dispatch({
      type: 'KC_UPDATE_SELECTED_ITEMS',
      value: newSelectedItems,
    });
    dispatch({
      type: 'KC_CHANGE_SELECT_ALL',
      value: newSelectedItems.equals(Set(list.filter(i => i))),
    });
  };
}
