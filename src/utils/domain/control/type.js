import _ from 'lodash';
import { RELATE_RECORD_SHOW_TYPE, RELATION_SEARCH_SHOW_TYPE } from 'src/utils/domain/worksheet/constants';
import { isSheetDisplay } from './style';
import { WIDGETS_TO_API_TYPE_ENUM } from './widgetTypes';

export const REQUIRED_SUPPORTED_WIDGET_TYPES = [
  WIDGETS_TO_API_TYPE_ENUM.TEXT, // 2 - 文本
  WIDGETS_TO_API_TYPE_ENUM.MOBILE_PHONE, // 3 - 手机
  WIDGETS_TO_API_TYPE_ENUM.TELEPHONE, // 4 - 座机
  WIDGETS_TO_API_TYPE_ENUM.EMAIL, // 5 - 邮箱
  WIDGETS_TO_API_TYPE_ENUM.NUMBER, // 6 - 数值
  WIDGETS_TO_API_TYPE_ENUM.CRED, // 7 - 证件
  WIDGETS_TO_API_TYPE_ENUM.MONEY, // 8 - 金额
  WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU, // 9 - 单选（平铺）
  WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT, // 10 - 多选
  WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN, // 11 - 单选（下拉）
  WIDGETS_TO_API_TYPE_ENUM.ATTACHMENT, // 14 - 附件
  WIDGETS_TO_API_TYPE_ENUM.DATE, // 15 - 日期
  WIDGETS_TO_API_TYPE_ENUM.DATE_TIME, // 16 - 日期时间
  WIDGETS_TO_API_TYPE_ENUM.AREA_PROVINCE, // 19 - 地区（省）
  WIDGETS_TO_API_TYPE_ENUM.AREA_CITY, // 23 - 地区（省市）
  WIDGETS_TO_API_TYPE_ENUM.AREA_COUNTY, // 24 - 地区（省市区）
  WIDGETS_TO_API_TYPE_ENUM.USER_PICKER, // 26 - 成员
  WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT, // 27 - 部门
  WIDGETS_TO_API_TYPE_ENUM.SCORE, // 28 - 等级
  WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET, // 29 - 关联记录
  WIDGETS_TO_API_TYPE_ENUM.SUB_LIST, // 34 - 子表
  WIDGETS_TO_API_TYPE_ENUM.CASCADER, // 35 - 级联
  WIDGETS_TO_API_TYPE_ENUM.SWITCH, // 36 - 检查框
  WIDGETS_TO_API_TYPE_ENUM.LOCATION, // 40 - 定位
  WIDGETS_TO_API_TYPE_ENUM.RICH_TEXT, // 41 - 富文本
  WIDGETS_TO_API_TYPE_ENUM.SIGNATURE, // 42 - 签名
  WIDGETS_TO_API_TYPE_ENUM.TIME, // 46 - 时间
  WIDGETS_TO_API_TYPE_ENUM.ORG_ROLE, // 48 - 组织角色
  WIDGETS_TO_API_TYPE_ENUM.SEARCH, // 50 - API查询
];

const stringCellList = [2, 3, 4, 25, 7, 19, 23, 24, 10010, 32, 33, 41, 15, 16, 5, 17, 18];

const stringUnitCellList = [8, 6, 31, 38, 53];

/** 判断控件值是否属于按字符串处理的文本类类型。 */
export function checkIsTextControl(type) {
  const STRING = stringCellList.concat(stringUnitCellList);
  return _.includes(STRING, type);
}

/** 判断关联记录卡片中的控件值是否可使用文本样式渲染，包含时间控件。 */
export function checkControlCanSetStyle(type) {
  const STRING = stringCellList.concat(stringUnitCellList).concat([46]);
  return _.includes(STRING, type);
}

/**
 * 判断控件及其来源控件是否按数值类型处理。
 */
export function controlIsNumber({ type, sourceControlType, enumDefault, enumDefault2 }) {
  return (
    type === 6 ||
    type === 8 ||
    type === 31 ||
    ((type === 37 || type === 53) && controlIsNumber({ type: enumDefault2 })) ||
    (type === 30 && controlIsNumber({ type: sourceControlType, enumDefault })) ||
    (type === 38 && (enumDefault === 1 || enumDefault === 3))
  );
}

/**
 * 判断关联记录或查询记录控件是否采用表格型展示方式。
 */
export function isRelateRecordTableControl(
  { type, enumDefault, advancedSetting = {} },
  { ignoreInFormTable = false } = {},
) {
  return (
    (type === 29 &&
      enumDefault === 2 &&
      _.includes(
        ignoreInFormTable
          ? [String(RELATE_RECORD_SHOW_TYPE.LIST), String(RELATE_RECORD_SHOW_TYPE.TAB_TABLE)]
          : [
              String(RELATE_RECORD_SHOW_TYPE.LIST),
              String(RELATE_RECORD_SHOW_TYPE.TABLE),
              String(RELATE_RECORD_SHOW_TYPE.TAB_TABLE),
            ],
        advancedSetting.showtype,
      )) ||
    (type === 51 && advancedSetting.showtype === String(RELATION_SEARCH_SHOW_TYPE.LIST))
  );
}

/**
 * 判断控件类型是否可参与函数计算。
 */
export function checkTypeSupportForFunction(control) {
  if (
    [
      1,
      WIDGETS_TO_API_TYPE_ENUM.TEXT, // 文本 2
      WIDGETS_TO_API_TYPE_ENUM.NUMBER, // 数值 6
      WIDGETS_TO_API_TYPE_ENUM.MONEY, // 金额 8
      WIDGETS_TO_API_TYPE_ENUM.EMAIL, // 邮箱 5
      WIDGETS_TO_API_TYPE_ENUM.TELEPHONE, // 座机 4
      WIDGETS_TO_API_TYPE_ENUM.MOBILE_PHONE, // 手机 3
      WIDGETS_TO_API_TYPE_ENUM.DATE, // 日期 15
      WIDGETS_TO_API_TYPE_ENUM.DATE_TIME, // 日期 16
      WIDGETS_TO_API_TYPE_ENUM.TIME, // 时间 46
      WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU, // 单选 9
      WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT, // 多选 10
      WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN, // 下拉 11
      WIDGETS_TO_API_TYPE_ENUM.USER_PICKER, // 成员 26
      WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT, // 部门 27
      WIDGETS_TO_API_TYPE_ENUM.ORG_ROLE, // 组织角色 48
      WIDGETS_TO_API_TYPE_ENUM.AREA_PROVINCE, // 省 19
      WIDGETS_TO_API_TYPE_ENUM.AREA_CITY, // 省市 23
      WIDGETS_TO_API_TYPE_ENUM.AREA_COUNTY, // 24
      WIDGETS_TO_API_TYPE_ENUM.SWITCH, // 检查框 36
      WIDGETS_TO_API_TYPE_ENUM.FORMULA_NUMBER, // 31 公式数值
      WIDGETS_TO_API_TYPE_ENUM.CONCATENATE, // 文本组合 32
      WIDGETS_TO_API_TYPE_ENUM.FORMULA_DATE, // 38 公式日期
      WIDGETS_TO_API_TYPE_ENUM.SUB_LIST, // 子表 34
      WIDGETS_TO_API_TYPE_ENUM.LOCATION, // 定位 40
      WIDGETS_TO_API_TYPE_ENUM.CRED, // 证件 7
      WIDGETS_TO_API_TYPE_ENUM.FORMULA_FUNC, // 公式函数 53
      WIDGETS_TO_API_TYPE_ENUM.SUBTOTAL, // 汇总 37
      WIDGETS_TO_API_TYPE_ENUM.SCORE, // 等级 28
    ].indexOf(control.type) > -1
  ) {
    return true;
  } else if (control.type === WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET) {
    // 关联记录 29
    return !isSheetDisplay(control);
  } else if (control.type === WIDGETS_TO_API_TYPE_ENUM.SHEET_FIELD) {
    // 他表存储 30
    return checkTypeSupportForFunction({ ...control, type: control.sourceControlType });
  }
}

/**
 * 按关联记录展示方式限制或补全默认加载数量。
 */
export const getDefaultCount = (data = {}, value = 0) => {
  value = parseInt(value);
  if (value) {
    // 下拉框50，卡片200，列表500
    if (data.type === 29 && _.get(data, 'advancedSetting.showtype') === '3') {
      value = value > 50 ? 50 : value;
    } else if (data.type === 29 && _.get(data, 'advancedSetting.showtype') === '1') {
      value = value > 200 ? 200 : value;
    } else if (value > 500) {
      value = 500;
    }
  } else {
    if (data.type === 29 && _.get(data, 'advancedSetting.showtype') === '3') {
      value = 50;
    } else if (data.type === 29 && _.get(data, 'advancedSetting.showtype') === '1') {
      value = 200;
    } else {
      value = 500;
    }
  }

  return value;
};

/**
 * 判断控件是否应按包含时间的日期样式展示。
 */
export const isTimeStyle = (data = {}) => {
  let type = data.type;

  if (type === 30) {
    type = data.sourceControlType;
  }

  return type === 16 || (type === 38 && data.enumDefault === 2 && data.unit !== '3');
};
