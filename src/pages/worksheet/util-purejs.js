import dayjs from 'dayjs';

/**
 *  日期公式计算
 * */

export function calcDate(date, expression) {
  if (!date) {
    return { error: true };
  }
  if (!/^[+-]/.test(expression)) {
    expression = '+' + expression;
  }
  try {
    let result = dayjs(date);
    const regexp = /([/+/-]){1}(\d+(\.\d+)?)+([YQMwdhms]){1}/g;
    let match = regexp.exec(expression);
    while (match) {
      const operator = match[1];
      const number = Number(match[2]);
      const unit = match[4];
      if (/^[+-]$/.test(operator) && number && typeof number === 'number' && /^[YQMwdhms]$/.test(unit)) {
        result = result[operator === '+' ? 'add' : 'subtract'](Math.round(number), unit.replace(/Y/, 'y'));
      }
      match = regexp.exec(expression);
    }
    return { result };
  } catch (err) {
    return { error: err };
  }
}

/**
 * 对将复杂字段数据处理成简单数据 用来呈现或参与计算
 * return undefined string number bool [string] [number]
 */
export function formatControlValue(cell) {
  try {
    if (!cell) {
      return;
    }
    let { type, value } = cell;
    let parsedData, selectedOptions;
    if (type === 37) {
      if (cell.advancedSetting && cell.advancedSetting.summaryresult === '1') {
        type = 2;
        value = Math.round(parseFloat(cell.value) * 100) + '%';
      } else {
        type = cell.enumDefault2 || 6;
      }
    }
    switch (type) {
      case 6: // NUMBER 数值
      case 8: // MONEY 金额
        return String(value).trim() !== '' && _.isNumber(Number(value)) && !_.isNaN(Number(value))
          ? Number(value)
          : undefined;
      case 19: // AREA_INPUT 地区
      case 23: // AREA_INPUT 地区
      case 24: // AREA_INPUT 地区
        return JSON.parse(value).name;
      case 17: // DATE_TIME_RANGE 时间段
      case 18: // DATE_TIME_RANGE 时间段
        if (value === '' || value === '["",""]') {
          return;
        }
        return JSON.parse(value);
      case 40: // LOCATION 定位
        parsedData = JSON.parse(value) || {};
        return _.isObject(parsedData) ? parsedData : undefined;
      // 组件
      case 9: // OPTIONS 单选 平铺
      case 10: // MULTI_SELECT 多选
      case 11: // OPTIONS 单选 下拉
        selectedOptions = getSelectedOptions(cell.options, cell.value);
        return selectedOptions.map((option, index) => option.value);
      case 26: // USER_PICKER 成员
        parsedData = JSON.parse(value);
        if (!_.isArray(parsedData)) {
          parsedData = [parsedData];
        }
        return parsedData.filter(user => !!user).map(user => (typeof user === 'string' ? user : user.fullname));
      case 27: // GROUP_PICKER 部门
        return JSON.parse(cell.value).map((department, index) => {
          if (typeof department === 'string') {
            return department;
          }
          return department.departmentName ? department.departmentName : _l('该部门已删除');
        });
      case 48: // ORG_ROLE 组织角色
        return JSON.parse(cell.value).map((organization, index) => {
          if (typeof organization === 'string') {
            return organization;
          }
          return organization.organizeName ? organization.organizeName : _l('该组织已删除');
        });
      case 36: // SWITCH 检查框
        return value === '1' || value === 1;
      case 14: // ATTACHMENT 附件
        return JSON.parse(value).map(attachment => `${attachment.originalFilename + attachment.ext}`);
      case 35: // CASCADER 级联
        parsedData = JSON.parse(value);
        return _.isArray(parsedData) && parsedData.length ? parsedData[0].name : undefined;
      case 29: // RELATESHEET 关联表
        if (_.isNumber(+value) && !_.isNaN(+value)) {
          parsedData = new Array(+value).fill();
        } else {
          parsedData = JSON.parse(value);
          parsedData =
            _.isArray(parsedData) &&
            parsedData
              .map(record =>
                formatControlValue(_.assign({}, cell, { type: cell.sourceControlType || 2, value: record.name })),
              )
              .filter(_.identity);
        }
        return cell.enumDefault === 1 ? parsedData.slice(0, 1) : parsedData;
      case 34: // SUBLIST 子表
        return _.isObject(value) ? _.get(value, 'rows') : [...new Array(value++)];
      case 30: // SHEETFIELD 他表字段
        return formatControlValue(
          _.assign({}, cell, {
            type: cell.sourceControlType || 2,
            advancedSetting: _.get(cell, 'sourceControl.advancedSetting') || {},
          }),
        );
      default:
        return value;
    }
  } catch (err) {
    if (typeof console !== 'undefined') {
      console.log(err);
    }
    return;
  }
}

/** 获取选项 */
export function getSelectedOptions(options, value) {
  if (!value || value === '[]') {
    return [];
  }
  let selectedKeys = [];
  try {
    selectedKeys = JSON.parse(value);
  } catch (err) {}
  return options.filter(option => selectedKeys.indexOf(option.key) > -1);
}
