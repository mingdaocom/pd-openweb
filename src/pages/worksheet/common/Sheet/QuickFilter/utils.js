import _ from 'lodash';
import { FILTER_CONDITION_TYPE } from 'worksheet/common/WorkSheetFilter/enum';
import { WIDGETS_TO_API_TYPE_ENUM } from 'pages/widgetConfig/config/widget';

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
    _.includes(
      [
        WIDGETS_TO_API_TYPE_ENUM.TEXT, // 文本
        WIDGETS_TO_API_TYPE_ENUM.RICH_TEXT, // 富文本
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
    _.includes(
      [
        WIDGETS_TO_API_TYPE_ENUM.NUMBER, // 数值
        WIDGETS_TO_API_TYPE_ENUM.MONEY, // 金额
        WIDGETS_TO_API_TYPE_ENUM.FORMULA_NUMBER, // 公式
      ],
      dataType,
    )
  ) {
    const isNumberStr = value => {
      return value !== '' && typeof +value === 'number' && !isNaN(+value);
    };
    return condition.filterType === FILTER_CONDITION_TYPE.BETWEEN
      ? isNumberStr(condition.minValue) || isNumberStr(condition.maxValue)
      : isNumberStr(condition.value);
  }
  if (
    _.includes(
      [
        WIDGETS_TO_API_TYPE_ENUM.SWITCH, // 检查框
      ],
      dataType,
    )
  ) {
    return _.includes([FILTER_CONDITION_TYPE.NE, FILTER_CONDITION_TYPE.EQ], condition.filterType);
  }
  if (
    _.includes(
      [
        WIDGETS_TO_API_TYPE_ENUM.DATE, // 日期
        WIDGETS_TO_API_TYPE_ENUM.DATE_TIME, // 日期时间
        WIDGETS_TO_API_TYPE_ENUM.TIME, // 时间
      ],
      dataType,
    )
  ) {
    if (condition.dateRange === 18 && condition.filterType === FILTER_CONDITION_TYPE.DATE_BETWEEN) {
      return !_.isUndefined(condition.minValue) && !_.isUndefined(condition.maxValue);
    } else if (condition.dateRange === 18) {
      return !_.isUndefined(condition.value);
    } else {
      return !!condition.dateRange;
    }
  }
  return false;
}

export function formatFilterValues(controlType, values = []) {
  switch (controlType) {
    case WIDGETS_TO_API_TYPE_ENUM.USER_PICKER: // 人员
      return values.map(value => safeParse(value)).map(c => ({ accountId: c.id, fullname: c.name, avatar: c.avatar }));
    case WIDGETS_TO_API_TYPE_ENUM.ORG_ROLE: // 角色
      return values.map(value => safeParse(value)).map(c => ({ organizeId: c.id, organizeName: c.name }));
    case WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT: // 部门
      return values.map(value => safeParse(value)).map(c => ({ departmentId: c.id, departmentName: c.name }));
    case WIDGETS_TO_API_TYPE_ENUM.AREA_PROVINCE: // 地区
    case WIDGETS_TO_API_TYPE_ENUM.AREA_CITY: // 地区
    case WIDGETS_TO_API_TYPE_ENUM.AREA_COUNTY: // 地区
      return values.map(value => safeParse(value)).map(c => ({ id: c.id, name: c.name }));
    case WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET: // 关联
    case WIDGETS_TO_API_TYPE_ENUM.CASCADER: // 级联
      return values.map(value => safeParse(value)).map(c => ({ rowid: c.id, name: c.name }));
    default:
      return values;
  }
}

export function formatFilterValuesToServer(controlType, values = []) {
  values = values.filter(_.identity);
  switch (controlType) {
    case WIDGETS_TO_API_TYPE_ENUM.USER_PICKER: // 人员
      return values.map(v => v.accountId);
    case WIDGETS_TO_API_TYPE_ENUM.ORG_ROLE: // 角色
      return values.map(v => v.organizeId);
    case WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT: // 部门
      return values.map(v => v.departmentId);
    case WIDGETS_TO_API_TYPE_ENUM.AREA_PROVINCE: // 地区
    case WIDGETS_TO_API_TYPE_ENUM.AREA_CITY: // 地区
    case WIDGETS_TO_API_TYPE_ENUM.AREA_COUNTY: // 地区
      return values.map(v => v.id);
    case WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET: // 关联
    case WIDGETS_TO_API_TYPE_ENUM.CASCADER: // 级联
      return values.map(v => v.rowid);
    default:
      return values.filter(_.isString);
  }
}
