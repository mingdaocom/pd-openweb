import { FILTER_BELONGS_TYPE, FILTER_CONDITION_MULTI_TYPE, FILTER_CONDITION_TYPE, FILTER_LOGIC_TYPE } from './enum';

const getFilterType = ({ dataType, filterType }) => {
  switch (dataType) {
    case 19: // 地区
    case 23:
    case 24:
    case 9: // 单选
    case 11:
    case 10: // 多选
    case 26: // 成员
    case 27: // 部门
    case 48: // 组织角色
    case 25: // 大写金额
    case 29: // 关联记录
    case 35: // 级联选择
    case 37: // 汇总
      if ([2, 6, 24, 25, 51].includes(filterType)) return FILTER_CONDITION_MULTI_TYPE[filterType];
      else if ([11, 12].includes(filterType)) return FILTER_BELONGS_TYPE[filterType];
      return FILTER_CONDITION_TYPE[filterType];
    default:
      return FILTER_CONDITION_TYPE[filterType];
  }
};

// 判断是否要特殊处理value
const getSpecialValue = filterItem => {
  const { dataType, filterType, values = [] } = filterItem;
  let isSpecialValue = false;
  let specialValues = null;
  switch (dataType) {
    case 6: // 数字
    case 8: // 金额
    case 15: // 日期
    case 16: // 日期时间
    case 46: // 时间
    case 28: // 等级
      // 在范围内、不在范围内
      const { minValue = '', maxValue = '' } = filterItem;
      isSpecialValue = [11, 12, 31, 32].includes(filterType);
      if (isSpecialValue) specialValues = [minValue, maxValue];
      break;
    case 19: // 地区
    case 23:
    case 24:
    case 26: // 成员
    case 27: // 部门
    case 48: // 组织角色
    case 29: // 关联记录
    case 35: // 级联选择
      isSpecialValue = true;
      specialValues = values.map(item => safeParse(item).id).filter(Boolean);
      break;
  }

  return { isSpecialValue, specialValues };
};

export const formatFilters = filters => {
  if (!filters?.length) return {};

  const { spliceType } = filters[0];
  const data = {
    type: 'group',
    logic: FILTER_LOGIC_TYPE[spliceType],
    children: [],
  };

  filters.forEach(filterItem => {
    if (filterItem.isGroup) {
      if (filterItem.groupFilters?.length) {
        // 递归调用 formatFilters 本身
        const childGroup = formatFilters(filterItem.groupFilters);
        data.children.push(childGroup);
      }
      return;
    }

    const { controlId, dataType, filterType, values, value } = filterItem;
    const { isSpecialValue, specialValues } = getSpecialValue(filterItem);

    const condition = {
      type: 'condition',
      field: controlId,
      operator: getFilterType({ dataType, filterType }),
    };
    if (isSpecialValue) condition.value = specialValues;
    else if (values?.length) condition.value = values;
    else if (value) condition.value = value;
    else condition.value = [];

    data.children.push(condition);
  });

  return data;
};
