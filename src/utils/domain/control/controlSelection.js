import { get, includes } from 'lodash';
import { CAN_NOT_AS_TEXT_GROUP } from './config';
import { filterOnlyShowField } from './filters';

const canSelectedControls = (controls, data) => {
  return controls.filter(item => item.controlId !== data.controlId && !includes(CAN_NOT_AS_TEXT_GROUP, item.type));
};

const isSingleRelateSheet = data => data.type === 29 && data.enumDefault === 1;

/** 获取成员字段选择器应展示的账户类型 tab。 */
export const getTabTypeBySelectUser = (control = {}) => {
  const { advancedSetting = {}, sourceControl = {}, controlId } = control;
  return includes(['caid', 'ownerid', 'daid', 'uaid'], controlId)
    ? 3
    : (advancedSetting.usertype || get(sourceControl.advancedSetting || {}, 'usertype')) === '2'
      ? 2
      : 1;
};

// 获取文本组合可选取的控件
/** 筛选可作为文本组合数据源的字段。 */
export const getConcatenateControls = (controls, data) => {
  controls = canSelectedControls(controls, data);
  return controls.filter(item => {
    if (isSingleRelateSheet(item)) return true;
    let type = item.type;
    // 日期公式且配置为距离今天的天数不可选
    if (type === 38 && [3].includes(item.enumDefault)) return false;
    if (type === 30 || isSingleRelateSheet(item)) {
      const sourceControlType = get(item, ['sourceControl', 'type']);
      if (sourceControlType) type = sourceControlType;
    }

    // 关联记录和他表字段的sourceControl仍然是关联记录和他表字段的不能选
    return !includes([29, 30].concat(CAN_NOT_AS_TEXT_GROUP), type);
  });
};

// 获取数值公式可用控件
/** 筛选可用于数值或日期公式计算的字段。 */
export const getFormulaControls = (controls, data) => {
  controls = canSelectedControls(controls, data);
  return controls.filter(item => {
    let type = item.type;
    let enumDefault2 = item.enumDefault2;
    let enumDefault = item.enumDefault;

    if (type === 30 || isSingleRelateSheet(item)) {
      const sourceControl = get(item, 'sourceControl') || {};

      if (includes([9, 10, 11], sourceControl.type)) return false;

      if (sourceControl.type) {
        type = sourceControl.type;
        enumDefault = sourceControl.enumDefault;
        enumDefault2 = sourceControl.enumDefault2;
      }
    }

    return (
      includes([6, 8, 28, 31, 46], type) ||
      // 赋分值选项
      (includes([9, 10, 11], type) && enumDefault === 1) ||
      (type === 38 && includes([1], enumDefault)) ||
      // 非日期汇总
      (type === 37 && !includes([15, 16], enumDefault2)) ||
      // 公式函数-数值
      (type === 53 && enumDefault2 === 6)
    );
  });
};

// 获取大写金额可用控件
/** 筛选可用于大写金额转换的数据源字段。 */
export const getMoneyCnControls = (controls, data) => {
  controls = canSelectedControls(filterOnlyShowField(controls), data);
  return controls.filter(item => {
    let type = item.type;
    let enumDefault2 = item.enumDefault2;

    if (type === 30 || isSingleRelateSheet(item)) {
      const sourceControl = get(item, 'sourceControl') || {};

      if (sourceControl.type) {
        type = sourceControl.type;
        enumDefault2 = sourceControl.enumDefault2;
      }
    }

    return (
      includes([8, 31], type) ||
      // 非日期汇总
      (type === 37 && !includes([15, 16], enumDefault2))
    );
  });
};
