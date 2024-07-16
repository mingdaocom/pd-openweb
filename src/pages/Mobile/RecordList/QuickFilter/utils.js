import { includes, isUndefined } from 'lodash';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { FILTER_CONDITION_TYPE } from 'worksheet/common/WorkSheetFilter/enum';
import { formatFilterValuesToServer } from 'worksheet/common/Sheet/QuickFilter';

export const formatQuickFilter = filter => {
  return filter.map(c => {
    return {
      ...c,
      values: formatFilterValuesToServer(c.dataType, c.values),
    };
  });
};

export function conditionAdapter(condition) {
  delete condition.control;
  if (condition.dataType === 29 && condition.filterType === 2) {
    condition.filterType = 24;
  }
  return condition;
}

export function turnControl(control) {
  if (control.type === WIDGETS_TO_API_TYPE_ENUM.SHEET_FIELD) {
    control.type = control.sourceControlType;
  }
  if (control.type === WIDGETS_TO_API_TYPE_ENUM.SUBTOTAL && control) {
    control.type = control.enumDefault2 || 6;
  }
  if (control.type === WIDGETS_TO_API_TYPE_ENUM.FORMULA_DATE) {
    control.type = control.enumDefault === 2 ? 15 : 6;
  }
  return control;
}

export function getType(control) {
  let { type } = control;
  if (type === WIDGETS_TO_API_TYPE_ENUM.SHEET_FIELD && control) {
    type = control.sourceControlType || -10000;
  }
  if (type === WIDGETS_TO_API_TYPE_ENUM.SUBTOTAL && control) {
    type = control.enumDefault2 || 6;
  }
  if (type === WIDGETS_TO_API_TYPE_ENUM.SEARCH) {
    type = WIDGETS_TO_API_TYPE_ENUM.TEXT;
  }
  return type;
}

export function validate(condition) {
  let dataType = getType({ type: condition.dataType });
  if (
    includes(
      [
        WIDGETS_TO_API_TYPE_ENUM.TEXT, // 文本
        WIDGETS_TO_API_TYPE_ENUM.TELEPHONE, // 电话号码
        WIDGETS_TO_API_TYPE_ENUM.MOBILE_PHONE, // 手机号码
        WIDGETS_TO_API_TYPE_ENUM.EMAIL, // 邮件地址
        WIDGETS_TO_API_TYPE_ENUM.CRED, // 证件
        WIDGETS_TO_API_TYPE_ENUM.CONCATENATE, // 文本组合
        WIDGETS_TO_API_TYPE_ENUM.AUTO_ID, // 自动编号
        WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET, // 关联
        WIDGETS_TO_API_TYPE_ENUM.CASCADER, // 级联
        WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU, // 单选
        WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT, // 多选
        WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN, // 下拉
        WIDGETS_TO_API_TYPE_ENUM.USER_PICKER, // 成员
        WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT, // 成员
        WIDGETS_TO_API_TYPE_ENUM.ORG_ROLE, // 组织角色
        WIDGETS_TO_API_TYPE_ENUM.AREA_PROVINCE, // 地区 省
        WIDGETS_TO_API_TYPE_ENUM.AREA_CITY, // 地区 省-市
        WIDGETS_TO_API_TYPE_ENUM.AREA_COUNTY, // 地区 省-市-县
      ],
      dataType,
    )
  ) {
    return condition.values && condition.values.filter(_.identity).length;
  }
  if (
    includes(
      [
        WIDGETS_TO_API_TYPE_ENUM.NUMBER, // 数值
        WIDGETS_TO_API_TYPE_ENUM.MONEY, // 金额
      ],
      dataType,
    )
  ) {
    return condition.filterType === FILTER_CONDITION_TYPE.BETWEEN
      ? !isUndefined(condition.minValue) &&
          !isUndefined(condition.maxValue) &&
          parseFloat(condition.maxValue) > parseFloat(condition.minValue)
      : !isUndefined(condition.value);
  }
  if (
    includes(
      [
        WIDGETS_TO_API_TYPE_ENUM.SWITCH, // 检查框
      ],
      dataType,
    )
  ) {
    return includes([FILTER_CONDITION_TYPE.NE, FILTER_CONDITION_TYPE.EQ], condition.filterType);
  }
  if (
    includes(
      [
        WIDGETS_TO_API_TYPE_ENUM.DATE, // 日期
        WIDGETS_TO_API_TYPE_ENUM.DATE_TIME, // 日期时间
        WIDGETS_TO_API_TYPE_ENUM.TIME, // 时间
      ],
      dataType,
    )
  ) {
    if (condition.dateRange === 18 && condition.filterType === FILTER_CONDITION_TYPE.DATE_BETWEEN) {
      return !isUndefined(condition.minValue) && !isUndefined(condition.maxValue);
    } else if (condition.dateRange === 18) {
      return !isUndefined(condition.value);
    } else {
      return !!condition.dateRange;
    }
  }
  return false;
}
