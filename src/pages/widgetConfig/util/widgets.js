import { isEmpty, last, filter, includes } from 'lodash';
import update from 'immutability-helper';
import { WHOLE_SIZE } from '../config/Drag';
import { FULL_LINE_CONTROL } from '../config';
import { getAdvanceSetting } from './index';

export const getCurrentRowSize = row => {
  return row.reduce((p, c) => p + c.size, 0);
};

// 判断当前行是否有空间可以放置新控件
export const isHaveGap = (row, widget) => {
  if (!row && isEmpty(row)) return true;
  const rowSize = getCurrentRowSize(row);
  if (rowSize + widget.size <= WHOLE_SIZE) return true;
  return false;
};

// 更新二维数组中的控件
export const updateWidgets = (widgets, controlId, obj) => {
  return widgets.map(row => row.map(item => (item.controlId === controlId ? { ...item, ...obj } : item)));
};

export const getPathById = (widgets, id) => {
  for (var i = 0; i < widgets.length; i++) {
    const row = widgets[i];
    for (var j = 0; j < row.length; j++) {
      const item = widgets[i][j];
      if (item.controlId === id) return [i, j];
    }
  }
  return [];
};

// 判断是否是需要独占一行的控件
export const isFullLineControl = data => {
  if (!data) return false;
  const { type, enumDefault, sourceControl } = data;
  const { showtype } = getAdvanceSetting(data);
  if (FULL_LINE_CONTROL.includes(type)) return true;
  // 成员、部门多选 为整行控件
  // if ([26, 27].includes(type) && enumDefault === 1) return true;

  // 关联多条 列表和卡片形式为整行
  if (type === 29 && enumDefault === 2 && showtype !== '3') return true;
  // 他表字段使用关联控件
  if (type === 30) {
    return isFullLineControl(sourceControl);
  }
  return false;
};

export const getRowById = (widgets, controlId) => {
  const [rowIndex] = getPathById(widgets, controlId);
  return { row: widgets[rowIndex], rowIndex };
};

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
              // 改变当前控件宽度，其余控件平分剩下宽度
              if (item.controlId === controlId) return { ...item, size };
              return { ...item, size: (WHOLE_SIZE - size) / (row.length - 1) };
            }),
        },
      });
    default:
      return widgets;
  }
};
