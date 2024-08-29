import update from 'immutability-helper';
import { filter, head, isEmpty, includes, flatten, findIndex, isArray } from 'lodash';
import { DRAG_ITEMS, WHOLE_SIZE } from '../config/Drag';
import { enumWidgetType, getDefaultSizeByData, genWidgetRowAndCol } from '.';
import { isFullLineControl } from './widgets';

const removeEmptyRow = widgets => {
  return filter(widgets, row => !isEmpty(row));
};

// 从原有位置删除拖拽元素
const removeSrcItem = (widgets, srcPath) => {
  const [row, col] = srcPath;
  return update(widgets, {
    [row]: {
      $apply: (row = []) => {
        row.splice(col, 1);
        return row.length === 1
          ? row.map(item => ({ ...item, size: getDefaultSizeByData(head(row)) }))
          : row.map(item => ({ ...item, size: WHOLE_SIZE / row.length }));
      },
    },
  });
};

// 获取批量操作涉及的控件合集
const getDealWidgets = (widgets, data) => {
  let dealWidgets = [];
  for (var i = 0; i < widgets.length; i++) {
    const rowItem = widgets[i];
    for (var j = 0; j < rowItem.length; j++) {
      const item = widgets[i][j];
      if (item.controlId === data.controlId) {
        dealWidgets.unshift([data]);
      }
      if (item.sectionId === data.controlId) {
        dealWidgets[i] = (dealWidgets[i] || []).concat(item);
      }
    }
  }
  return dealWidgets.filter(_.identity);
};

// 从原有位置删除拖拽元素,批量操作
const removeSrcItems = (widgets, dealWidgets = []) => {
  const ids = dealWidgets.map((i = {}) => i.controlId);
  const removeItems = widgets.map(row => row.filter(i => !includes(ids, i.controlId)));
  return removeItems;
};

// 批量删除
export const batchRemoveItems = (widgets, deleteItems = []) => {
  return removeEmptyRow(removeSrcItems(widgets, deleteItems));
};

// 添加新行
export const insertNewLine = ({ widgets, srcPath, srcItem, targetIndex }) => {
  const dealWidgets = getDealWidgets(widgets, srcItem);
  const removedSrcItems = removeSrcItems(widgets, flatten(dealWidgets));

  return removeEmptyRow(
    update(removedSrcItems, {
      $splice: dealWidgets.map((item, index) => [targetIndex + index, 0, item]),
    }),
  );
};

// 列表类型切换时，重新布局
export const resetDisplay = ({ widgets, srcPath, srcItem, targetIndex }) => {
  const removedSrcItem = removeSrcItem(widgets, srcPath);
  const newWidgets = removeEmptyRow(
    update(removedSrcItem, {
      $splice: [[targetIndex, 0, [srcItem]]],
    }),
  );
  return genWidgetRowAndCol(newWidgets);
};

// 在当前行最后插入元素
export const insertToRowEnd = ({ widgets, srcPath, srcItem, targetIndex }) => {
  const removedSrcItem = removeSrcItem(widgets, srcPath);
  return removeEmptyRow(
    update(removedSrcItem, {
      [targetIndex]: {
        $apply: row => {
          return row.concat(srcItem).map(item => ({ ...item, size: WHOLE_SIZE / (row.length + 1) }));
        },
      },
    }),
  );
};

export const insertControlInSameLine = ({ widgets, srcItem, srcPath, dropPath, location }) => {
  const [rowIndex, colIndex] = dropPath;
  const [starRowIndex, startColIndex] = srcPath || [];
  return update(widgets, {
    [rowIndex]: {
      $apply: (row = []) => {
        // 如果放在第一个的左边
        if (colIndex === 0 && location === 'left') {
          return [srcItem].concat(row).map(item => ({ ...item, size: WHOLE_SIZE / (row.length + 1) }));
        }
        // 如果放在最后一个的右边
        if (colIndex === row.length && location === 'right') {
          return row.concat(srcItem).map(item => ({ ...item, size: WHOLE_SIZE / (row.length + 1) }));
        }
        let nextRow = update(row, {
          $splice: [
            [
              starRowIndex === rowIndex && startColIndex < colIndex // 同行且从左拖右
                ? location === 'left'
                  ? colIndex - 1
                  : colIndex
                : location === 'left'
                ? colIndex
                : colIndex + 1,
              0,
              srcItem,
            ],
          ],
        });
        return nextRow.map(item => ({ ...item, size: WHOLE_SIZE / nextRow.length }));
      },
    },
  });
};

export const insertToCol = ({ widgets, srcPath, ...rest }) => {
  const removedSrcItem = removeSrcItem(widgets, srcPath);
  return removeEmptyRow(insertControlInSameLine({ widgets: removedSrcItem, srcPath, ...rest }));
};

export const isFullLineDragItem = item => {
  const { type, data, enumType } = item;
  if (includes([DRAG_ITEMS.DISPLAY_ITEM, DRAG_ITEMS.DISPLAY_TAB, DRAG_ITEMS.DISPLAY_LIST_TAB], type)) {
    return isFullLineControl(data);
  }
  if (includes([DRAG_ITEMS.LIST_ITEM, DRAG_ITEMS.LIST_TAB], type)) {
    return isFullLineControl({ type: enumWidgetType[enumType] });
  }
  return false;
};
