import { compose } from 'redux';
import update from 'immutability-helper';
import _, { flatten, get, isEmpty, keys, omit, sortBy } from 'lodash';
import { FULL_LINE_CONTROL } from './config';
import { getCurrentRowSize, WHOLE_SIZE } from './layout';
import { controlState } from './state';
import { isSheetDisplay } from './style';
import { DEFAULT_DATA } from './widget';
import { enumWidgetType } from './widgetTypes';

const FORMULA_FN_LIST = [
  'SUM',
  'AVG',
  'MIN',
  'MAX',
  'PRODUCT',
  'COUNTA',
  'ABS',
  'INT',
  'MOD',
  'ROUND',
  'ROUNDUP',
  'ROUNDDOWN',
];

/** 获取指定字段类型的默认布局宽度。 */
export const getDefaultSizeByType = type => {
  if (typeof type === 'number') {
    type = enumWidgetType[type];
  }

  return get(DEFAULT_DATA[type], 'size');
};

/** 根据字段及其源字段类型获取默认布局宽度。 */
export const getDefaultSizeByData = data => {
  const { type, sourceControl } = data;
  // 他表字段使用关联显示控件的size
  if (type === 30) return sourceControl ? getDefaultSizeByType(sourceControl.type) : WHOLE_SIZE / 2;
  return getDefaultSizeByType(type);
};

// 根据标签页归类
const putControlBySection = controls => {
  let result = [];

  controls.forEach(item => {
    if (item.type === 52) {
      item.relationControls = controls.filter(i => i.sectionId === item.controlId);
    }

    // 有sectionId,但是标签页被删除，按普通字段呈现
    if (!item.sectionId || (item.sectionId && !_.find(controls, c => c.controlId === item.sectionId))) {
      result.push({ ...item, sectionId: '' });
    }
  });
  return result;
};

// 判断是否是需要独占一行的控件
/** 判断字段是否必须独占一行。 */
export const isFullLineControl = data => {
  if (!data) return false;
  const { type, sourceControl } = data;

  if (FULL_LINE_CONTROL.includes(type)) return true;
  // 成员、部门多选 为整行控件
  // if ([26, 27].includes(type) && enumDefault === 1) return true;

  // 嵌入视图
  if (type === 45 && data.enumDefault === 3) return true;

  // 关联多条 列表和卡片形式为整行
  if (isSheetDisplay(data)) return true;
  // 他表字段使用关联控件
  if (type === 30) return isFullLineControl(sourceControl);

  return false;
};

// 按顺序将控件摆放在二维数组中
/** 按行列顺序和字段宽度将字段排成二维布局。 */
export const putControlByOrder = controls => {
  const obj = {};

  // 按照row排序
  controls.forEach((item, originIndex) => {
    if (!item.size) item = { ...item, size: getDefaultSizeByData(item) };
    const { row } = item;
    const currentItem = { item, originIndex };

    if (isEmpty(obj[row])) {
      obj[row] = [currentItem];
    } else {
      obj[row].push(currentItem);
    }
  });

  return keys(obj)
    .sort((a, b) => +a - +b)
    .reduce((result, key) => {
      // 每一行里按照col排序
      const row = sortBy(obj[key], [({ item }) => item.col, 'originIndex']).map(({ item }) => item);
      const rows = [];

      row.forEach(item => {
        const currentRow = rows[rows.length - 1];
        const isFullLine = isFullLineControl(item);

        if (isFullLine) {
          rows.push([item]);
          return;
        }

        // 兼容row、col相同或历史脏数据导致单行宽度溢出的情况，顺延到下一行呈现
        if (
          currentRow &&
          currentRow.length < 4 &&
          !currentRow.some(isFullLineControl) &&
          getCurrentRowSize(currentRow) + item.size <= WHOLE_SIZE
        ) {
          currentRow.push(item);
        } else {
          rows.push([item]);
        }
      });

      result.push(...rows);
      return result;
    }, []);
};

/** 递归规范化子表和历史公式字段数据。 */
export const dealControlData = (controls = []) => {
  return controls.map(item => {
    const { type } = item;

    // 子表控件递归处理其中的控件
    if (type === 34) {
      return { ...item, relationControls: dealControlData(item.relationControls) };
    }

    if (type === 31) {
      const fnReg = new RegExp(`c(?=[${FORMULA_FN_LIST.join('|')}])`, 'g');
      return update(item, {
        dataSource: { $apply: dataSource => dataSource.replace(/AVG/g, 'AVERAGE').replace(fnReg, '') },
      });
    }

    return item;
  });
};

// 将旧数据中的half替换为size,且去掉half
/** 将历史 half 布局属性转换为 size 并移除旧属性。 */
export const replaceHalfWithSizeControls = controls =>
  controls.map(item => {
    if (typeof item.half === 'boolean') {
      const size = item.size || (item.half ? WHOLE_SIZE / 2 : WHOLE_SIZE);
      return { ...omit(item, 'half'), size };
    }

    return omit(item, 'half');
  });

// 矫正数据row、col与呈现不一致的情况，有些表老数据有问题
const replaceRowWithControls = widgets => {
  const { commonWidgets = [], tabWidgets = [] } = getSectionWidgets(widgets);
  const flattenTabs = [];
  tabWidgets.forEach(item => {
    flattenTabs.push([item]);
    const childWidgets = _.get(item, 'type') === 52 ? putControlByOrder(item.relationControls || []) : [];

    if (childWidgets.length > 0) {
      flattenTabs.push(...childWidgets);
    }
  });
  const newWidgets = commonWidgets.concat(flattenTabs.filter(_.identity));
  return genWidgetRowAndCol(newWidgets);
};

/** 将一维字段列表规范化为字段编辑器二维布局。 */
export const genWidgetsByControls = (controls = []) => {
  /**
   * 依次处理数据
   */
  const newControls = compose(putControlByOrder, dealControlData, replaceHalfWithSizeControls)(controls);
  return replaceRowWithControls(newControls);
};

/** 按字段行列和宽度重新排序为一维字段列表。 */
export const resortControlByColRow = (controls = []) => {
  return _.flatten(putControlByOrder(controls));
};

// 能否作为标题控件

/** 为二维字段布局重新生成连续行列坐标。 */
export function genWidgetRowAndCol(widgets) {
  return widgets.map((rowItem, row) => rowItem.map((colItem, col) => ({ ...colItem, row, col })));
}

/** 将二维字段布局展平并补齐行列坐标。 */
export const genControlsByWidgets = widgets => {
  return flatten(genWidgetRowAndCol(widgets));
};

// 将所有控件用给定数据重置
/** 批量合并二维布局中每个字段的指定属性。 */
export const resetWidgets = (widgets, obj) => {
  return widgets.map(row => row.map(item => ({ ...item, ...obj })));
};

/** 将新增字段与同行字段按数量计算等分宽度。 */
export const adjustControlSize = (row = [], data) => {
  const nextRow = row.concat(data);
  return { ...data, size: WHOLE_SIZE / nextRow.length };
};

/** 判断字段是否需要固定在普通字段区域底部。 */
export const fixedBottomWidgets = data => {
  return data.type === 52 || (_.includes([29, 51], data.type) && get(data, 'advancedSetting.showtype') === '6');
};

/** 获取分段字段展开后、下一个同层可见分段字段之前的字段 ID。 */
export const getExpandWidgetIds = (controls = [], data = {}, from) => {
  const { controlId, sectionId } = data;
  const expandWidgetIds = [];
  const widgets = [...controls].sort((a, b) => {
    if (a.row === b.row) return a.col - b.col;
    return a.row - b.row;
  });
  let searchStatus = false;

  for (const item of widgets) {
    if (searchStatus) {
      if (
        fixedBottomWidgets(item) ||
        (_.get(item, 'type') === 22 &&
          (from ? controlState(item, from).visible && !item.hidden : true) &&
          sectionId === (item.sectionId || ''))
      ) {
        searchStatus = false;
      } else {
        expandWidgetIds.push(item.controlId);
      }
    }

    if (item.controlId === controlId) searchStatus = true;
  }

  return expandWidgetIds;
};

/** 按分段字段 ID 生成其展开字段 ID 列表。 */
export const getExpandWidgetIdsMap = (controls = [], from) => {
  const expandWidgetIdsMap = {};
  const activeSections = [];
  const widgets = [].concat(controls || []).sort((a, b) => {
    if (a.row === b.row) return a.col - b.col;
    return a.row - b.row;
  });

  for (const item of widgets) {
    for (let i = activeSections.length - 1; i >= 0; i--) {
      const section = activeSections[i];

      if (
        fixedBottomWidgets(item) ||
        (_.get(item, 'type') === 22 &&
          (from ? controlState(item, from).visible && !item.hidden : true) &&
          section.sectionId === (item.sectionId || ''))
      ) {
        activeSections.splice(i, 1);
      } else {
        section.expandWidgetIds.push(item.controlId);
      }
    }

    if (_.get(item, 'type') === 22) {
      const sectionInfo = { sectionId: item.sectionId, expandWidgetIds: [] };
      expandWidgetIdsMap[item.controlId] = sectionInfo.expandWidgetIds;
      activeSections.push(sectionInfo);
    }
  }

  return expandWidgetIdsMap;
};

/** 判断关联或查询字段是否使用标签页表格。 */
export const isTabSheetList = data => {
  return _.includes([29, 51], data.type) && get(data, 'advancedSetting.showtype') === '6';
};

/** 判断关联或查询字段是否使用旧表格形态。 */
export const isOldSheetList = data => {
  return _.includes([29, 51], data.type) && get(data, 'advancedSetting.showtype') === '2';
};

// 获取标签页等控件与普通控件的分界位置
/** 获取普通字段与底部标签页字段的分界行。 */
export const getBoundRowByTab = widgets => {
  for (var i = 0; i < widgets.length; i++) {
    const row = widgets[i];

    for (var j = 0; j < row.length; j++) {
      const item = widgets[i][j];
      if (fixedBottomWidgets(item)) return i;
    }
  }

  return -1;
};

//将widgets分成普通和标签页，分别单独渲染
/** 将二维字段布局拆分为普通字段和底部标签页字段。 */
export const getSectionWidgets = widgets => {
  // 新建的没有row、col,重设一遍，防止重排出错
  const dealRowAndCol = genWidgetRowAndCol(widgets);
  const flattenWidgets = putControlBySection(flatten(dealRowAndCol));
  let commonWidgets = [];
  let tabWidgets = [];

  flattenWidgets.forEach(i => {
    if (fixedBottomWidgets(i)) {
      tabWidgets.push(i);
    } else {
      commonWidgets.push(i);
    }
  });

  tabWidgets = tabWidgets.sort((a, b) => {
    return a.row - b.row;
  });
  return { commonWidgets: putControlByOrder(commonWidgets), tabWidgets };
};

// 搜索忽略大小写
