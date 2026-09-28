import update from 'immutability-helper';
import _ from 'lodash';
import { isFullLineControl } from 'src/utils/domain/control/editorLayout';
import { getAdvanceSetting } from './advancedSetting';
import { NOT_HAVE_WIDTH_CONFIG } from './config';
import { getRowById } from './layout';
import { DISPLAY_TYPE } from './setting';

// 根据row、col排序controls
/** 按字段行坐标和列坐标生成新的排序结果。 */
const sortControlsByRowAndCol = (controls = []) => {
  return [...controls].sort((a, b) => {
    if (a.row === b.row) {
      return a.col - b.col;
    }

    return a.row - b.row;
  });
};

/** 获取字段显示顺序，未配置时回退到行列顺序。 */
export const getControlsSorts = (data, controls, key = 'controlssorts') => {
  const parsedSorts = getAdvanceSetting(data, [key]) || [];
  // 显示字段没有配置，默认按原表row、col排序
  const defaultSorts = sortControlsByRowAndCol(controls).map(item => item.controlId);

  try {
    if (_.isEmpty(parsedSorts)) return defaultSorts;
    return parsedSorts;
  } catch (error) {
    console.log(error);
    return defaultSorts;
  }
};

// 默认取标题控件 和 前三个控件
/** 获取关联字段默认展示的标题及前置字段。 */
export const getDefaultShowControls = allControls => {
  if (allControls.length <= 3) return allControls.map(({ controlId }) => controlId);
  const titleControlIndex = _.findIndex(allControls, item => item.attribute === 1);
  if (titleControlIndex <= 3) return allControls.slice(0, 4).map(({ controlId }) => controlId);
  return allControls
    .slice(0, 3)
    .concat(allControls[titleControlIndex])
    .map(({ controlId }) => controlId);
};

/** 按真实字段类型筛选字段，并展开他表字段类型。 */
export const filterByTypeAndSheetFieldType = (controls = [], filter) => {
  return controls
    .filter(item => {
      if (item.type === 30) return filter(item.sourceControlType);
      return filter(item.type);
    })
    .map(item => ({ ...item, type: item.type === 30 ? item.sourceControlType : item.type }));
};

// 获取关联表显示方式
/** 获取关联字段在当前场景可选择的显示方式。 */
export const getDisplayType = ({ from, type }) => {
  if (type === 2 && from !== 'subList') {
    return [
      {
        key: 'list',
        text: _l('表格（旧）'),
        value: '2',
        disabled: true,
      },
      ...DISPLAY_TYPE,
      {
        key: 'embed_list',
        text: _l('表格'),
        value: '5',
      },
      {
        key: 'tab_list',
        text: _l('标签页表格'),
        value: '6',
      },
    ];
  }

  return DISPLAY_TYPE;
};

/** 替换字符串配置中指定位置的单个配置值。 */
export const updateConfig = ({ config = '', value, index } = {}) => {
  const arrConfig = config.split('');
  return update(arrConfig, { $splice: [[index, 1, value]] }).join('');
};

/** 判断字段是否为关联单条记录。 */
export const isSingleRelateSheet = data => data.type === 29 && data.enumDefault === 1;

/** 根据字段所在行的列数返回可选宽度列表。 */
export const adjustWidthList = (widgets, data) => {
  const { row } = getRowById(widgets, data.controlId);
  if (!row) return [];
  switch (row.length) {
    // 单行1列调整宽度
    case 1:
      return [3, 4, 6, 8, 9, 12];
    // 单行2列调整宽度
    case 2:
      return [3, 4, 6, 8, 9];
    // 单行3列调整宽度
    case 3:
      return [4, 6];
    default:
      return [];
  }
};

// 是否可以进行宽度调整
/** 判断字段在当前布局和显示形态下能否调整宽度。 */
export const canAdjustWidth = (widgets, data = {}) => {
  const { type, controlId, sourceControl, enumDefault } = data;
  if (NOT_HAVE_WIDTH_CONFIG.includes(type)) return false;
  // 嵌入视图没有宽度设置
  if (type === 45 && enumDefault === 3) return false;

  const { row } = getRowById(widgets, controlId);
  if (!row) return false;

  /**
   * 他表字段关联的显示字段如果是整行控件则此控件不能调整宽度
   */
  if (type === 30) return !isFullLineControl(sourceControl);

  if (isFullLineControl(data) || row.length === 4) return false;
  return true;
};
