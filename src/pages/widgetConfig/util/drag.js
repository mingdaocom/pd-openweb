import update from 'immutability-helper';
import { filter, head, isEmpty } from 'lodash';
import { DRAG_ITEMS, DRAG_MODE, WHOLE_SIZE } from '../config/Drag';
import { DEFAULT_DATA } from '../config/widget';
import { enumWidgetType, getDefaultSizeByData } from '.';
import { isFullLineControl } from './widgets';

const removeEmptyRow = widgets => {
  return filter(widgets, row => !isEmpty(row));
};

// 从原有位置删除拖拽元素
const removeSrcItem = (widgets, srcPath) => {
  const [row, col] = srcPath;
  return update(widgets, {
    [row]: {
      $apply: row => {
        row.splice(col, 1);
        return row.length === 1
          ? row.map(item => ({ ...item, size: getDefaultSizeByData(head(row)) }))
          : row.map(item => ({ ...item, size: WHOLE_SIZE / row.length }));
      },
    },
  });
};

// 添加新行
export const insertNewLine = ({ widgets, srcPath, srcItem, targetIndex }) => {
  const removedSrcItem = removeSrcItem(widgets, srcPath);
  return removeEmptyRow(
    update(removedSrcItem, {
      $splice: [[targetIndex, 0, [srcItem]]],
    }),
  );
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
      $apply: row => {
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
  if (type === DRAG_ITEMS.DISPLAY_ITEM) {
    return isFullLineControl(data);
  }
  if (type === DRAG_ITEMS.LIST_ITEM) {
    return isFullLineControl({ type: enumWidgetType[enumType] });
  }
  return false;
};
