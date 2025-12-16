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

export const convertControl = type => {
  switch (type) {
    case 2:
      return 'Text'; // 多行文本框

    case 3:
      return 'PhoneNumber'; // 手机

    case 4:
      return 'LandlinePhone'; // 座机

    case 5:
      return 'Email'; // 邮箱

    case 6:
      return 'Number'; // 数值

    case 7:
      return 'Certificate'; // 证件

    case 8:
      return 'Currency'; // 金额

    case 9:
      return 'SingleSelect'; // 单选

    case 10:
      return 'MultipleSelect'; // 多选

    case 11:
      return 'Dropdown'; // 下拉框

    case 14:
      return 'Attachment'; // 附件

    case 15:
      return 'Date'; // 日期

    case 16:
      return 'DateTime'; // 日期时间

    case 17:
    case 18:
      return 'DateRange'; // 日期段、日期时间段

    case 19:
    case 23:
    case 24:
      return 'Region'; // 地区

    case 21:
      return 'DynamicLink'; // 自由链接

    case 22:
      return 'Divider'; // 分段

    case 25:
      return 'AmountInWords'; // 大写金额

    case 26:
      return 'Collaborator'; // 成员

    case 27:
      return 'Department'; // 部门

    case 28:
      return 'Rating'; // 等级

    case 29:
      return 'Relation'; // 关联记录

    case 30:
      return 'Lookup'; // 他表字段

    case 31:
      return 'Formula'; // 公式

    case 32:
      return 'Concatenate'; // 文本拼接

    case 33:
      return 'AutoNumber'; // 自动编号

    case 34:
      return 'SubTable'; // 子表

    case 35:
      return 'CascadingSelect'; // 级联选择

    case 36:
      return 'Checkbox'; // 检查框

    case 37:
      return 'Rollup'; // 汇总

    case 38:
      return 'DateFormula'; // 公式(日期)

    case 39:
      return 'CodeScan'; // 扫码

    case 40:
      return 'Location'; // 定位

    case 41:
    case 10010:
      return 'RichText'; // 富文本

    case 42:
      return 'Signature'; // 签名

    case 43:
      return 'OCR'; // 文字识别

    case 44:
      return 'Role'; // 角色

    case 45:
      return 'Embed'; // 嵌入

    case 46:
      return 'Time'; // 时间

    case 47:
      return 'Barcode'; // 条码

    case 48:
      return 'OrgRole'; // 组织角色

    case 49:
      return 'Button'; // 查询按钮

    case 50:
      return 'APIQuery'; // API查询

    case 51:
      return 'QueryRecord'; // 查询记录

    case 52:
      return 'Section'; // 标签页

    case 53:
      return 'FunctionFormula'; // 函数公式

    default:
      return 'CustomField'; // 自定义字段
  }
};
