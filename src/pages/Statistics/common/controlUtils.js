import _ from 'lodash';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';

export const isTimeControl = (value, controls = []) => {
  const data = _.find(controls, { controlId: value });

  if (_.isEmpty(data)) {
    return (
      value === WIDGETS_TO_API_TYPE_ENUM.DATE ||
      value === WIDGETS_TO_API_TYPE_ENUM.DATE_TIME ||
      value === WIDGETS_TO_API_TYPE_ENUM.TIME
    );
  } else {
    return (
      data.type === WIDGETS_TO_API_TYPE_ENUM.DATE ||
      data.type === WIDGETS_TO_API_TYPE_ENUM.DATE_TIME ||
      data.type === WIDGETS_TO_API_TYPE_ENUM.TIME
    );
  }
};

/**
 * 是否是数值和公式控件
 */
export const isNumberControl = (type, isIncludeRecord = true) => {
  if (
    type === WIDGETS_TO_API_TYPE_ENUM.NUMBER ||
    type === WIDGETS_TO_API_TYPE_ENUM.MONEY ||
    type === WIDGETS_TO_API_TYPE_ENUM.FORMULA_NUMBER ||
    (isIncludeRecord && type === 10000000) ||
    (isIncludeRecord && type === 10000001)
  ) {
    return true;
  } else {
    return false;
  }
};

/**
 * 是否是数值&公式和检查框控件
 */
export const isFormatNumber = type => {
  return isNumberControl(type) || type === WIDGETS_TO_API_TYPE_ENUM.SWITCH || type === WIDGETS_TO_API_TYPE_ENUM.SCORE;
};

/**
 * 是否是关联记录
 */
export const isRelateSheetControl = type => {
  return type === WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET;
};

/**
 * 是否是地区控件
 */
export const isAreaControl = type => {
  return (
    type === WIDGETS_TO_API_TYPE_ENUM.AREA_PROVINCE ||
    type === WIDGETS_TO_API_TYPE_ENUM.AREA_CITY ||
    type === WIDGETS_TO_API_TYPE_ENUM.AREA_COUNTY
  );
};

/**
 * 是否是选项控件
 */
export const isOptionControl = type => {
  return (
    type === WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU ||
    type === WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT ||
    type === WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN ||
    type === WIDGETS_TO_API_TYPE_ENUM.SCORE
  );
};

/**
 * 是否支持按照字段样式显示
 */
export const isDisplayModes = type => {
  return (
    isOptionControl(type) ||
    type === WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT ||
    type === WIDGETS_TO_API_TYPE_ENUM.USER_PICKER ||
    type === WIDGETS_TO_API_TYPE_ENUM.SWITCH
  );
};

/**
 * 渲染字段样式内容
 */
export const renderFieldStyleValue = (controlType, controlValue) => {
  if (controlType === 29) {
    return _l('关联表');
  }

  if (controlType === WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT) {
    const { departmentName } = window.safeParse(controlValue);
    return departmentName || controlValue;
  }

  if (controlType === WIDGETS_TO_API_TYPE_ENUM.USER_PICKER) {
    const { fullname } = window.safeParse(controlValue);
    return fullname || controlValue;
  }

  if (isOptionControl(controlType)) {
    const { value } = window.safeParse(controlValue);
    return value || controlValue;
  }

  return controlValue;
};

/**
 * 获取图表 axis 文案
 */
