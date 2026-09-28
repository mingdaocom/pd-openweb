import update from 'immutability-helper';
import { isEmpty } from 'lodash';

export const WHOLE_SIZE = 12;

/** 判断当前布局行是否还能容纳指定控件。 */
export const isHaveGap = (row, widget) => {
  if (!row && isEmpty(row)) return true;
  const rowSize = getCurrentRowSize(row);
  if (rowSize + widget.size <= WHOLE_SIZE) return true;
  return false;
};

/** 合计一行控件所占的布局宽度。 */
export const getCurrentRowSize = row => row.reduce((total, control) => total + control.size, 0);

/** 查找控件在二维布局中的行列坐标。 */
export const getPathById = (widgets, id) => {
  for (let rowIndex = 0; rowIndex < widgets.length; rowIndex++) {
    for (let columnIndex = 0; columnIndex < widgets[rowIndex].length; columnIndex++) {
      if (widgets[rowIndex][columnIndex].controlId === id) return [rowIndex, columnIndex];
    }
  }

  return [];
};

/** 获取指定控件所在的布局行及行下标。 */
export const getRowById = (widgets, controlId) => {
  const [rowIndex] = getPathById(widgets, controlId);
  return { row: widgets[rowIndex], rowIndex };
};

/** 调整控件宽度，并按原规则平分同一行其余控件宽度。 */
export const changeWidgetSize = (widgets, { controlId, size }) => {
  const { rowIndex, row } = getRowById(widgets, controlId);

  switch (row.length) {
    case 1:
      return update(widgets, { [rowIndex]: { $apply: row => row.map(item => ({ ...item, size })) } });
    case 2:
    case 3:
      return update(widgets, {
        [rowIndex]: {
          $apply: row =>
            row.map(item => {
              if (item.controlId === controlId) return { ...item, size };
              return { ...item, size: (WHOLE_SIZE - size) / (row.length - 1) };
            }),
        },
      });
    default:
      return widgets;
  }
};
