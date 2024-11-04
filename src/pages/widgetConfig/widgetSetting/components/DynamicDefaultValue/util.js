import {
  CONTROL_TYPE,
  DATE_TYPES,
  TIME_TYPES,
  CAN_SHOW_CLEAR_FIELD,
  CAN_AS_TEXT_DYNAMIC_FIELD,
  CAN_AS_EMAIL_DYNAMIC_FIELD,
  CAN_AS_TIME_DYNAMIC_FIELD,
  CAN_AS_DATE_TIME_DYNAMIC_FIELD,
  CAN_AS_AREA_DYNAMIC_FIELD,
  CAN_AS_USER_DYNAMIC_FIELD,
  CAN_AS_DEPARTMENT_DYNAMIC_FIELD,
  CAN_AS_SCORE_DYNAMIC_FIELD,
  CAN_AS_SWITCH_DYNAMIC_FIELD,
  CAN_AS_NUMBER_DYNAMIC_FIELD,
  CAN_AS_EMBED_DYNAMIC_FIELD,
  CAN_AS_ORG_ROLE_DYNAMIC_FIELD,
  CAN_AS_ARRAY_DYNAMIC_FIELD,
  CAN_AS_ARRAY_OBJECT_DYNAMIC_FIELD,
  CAN_AS_RICH_TEXT_DYNAMIC_FIELD,
  CAN_AS_LOCATION_DYNAMIC_FIELD,
  FIELD_REG_EXP,
  CHECKBOX_TYPES,
  EMEBD_FIELDS,
  CUR_TIME_TYPES,
  CURRENT_TYPES,
} from './config';
import { SYS } from 'src/pages/widgetConfig/config/widget';
import _ from 'lodash';
import { isSheetDisplay } from 'src/pages/widgetConfig/util';
import { DYNAMIC_FROM_MODE } from './config';

// 新建子表并配置成员、部门等默认值，后端relationControls不处理，没有补全配置返回
export const dealIds = (type, dynamicValue) => {
  if (_.isEmpty(dynamicValue)) return dynamicValue;
  return (dynamicValue || []).map(item => {
    if (
      _.includes([26, 27, 48], type) &&
      _.includes(['user-self', 'user-departments', 'user-role'], item.staticValue)
    ) {
      const name = _.get(
        _.find(CURRENT_TYPES, i => i.id === item.staticValue),
        'text',
      );
      const id =
        item.staticValue === 'user-self'
          ? 'accountId'
          : item.staticValue === 'user-departments'
          ? 'departmentId'
          : 'organizeId';
      return { ...item, staticValue: JSON.stringify({ [id]: item.staticValue, name }) };
    } else {
      return item;
    }
  });
};

const filterSys = (list = []) => {
  return list.filter(item => !_.includes(SYS, item.controlId));
};

export const getControlType = data => {
  return CONTROL_TYPE[data.type];
};

export const getDateType = data => {
  if (data.type === 46) return CUR_TIME_TYPES;
  return data.type === 16 ? TIME_TYPES : DATE_TYPES;
};

export const showClear = (data = {}, dynamicValue) => {
  const { staticValue } = dynamicValue[0] || {};
  if (_.includes(CAN_SHOW_CLEAR_FIELD, data.type) && staticValue) return true;
  if (_.includes([3, 4, 5], data.type)) {
    const transferValue = typeof staticValue === 'string' ? safeParse(staticValue || '{}') : staticValue;
    return _.includes(['user-self'], (transferValue || {}).accountId);
  }
  return false;
};

const isSingleRelate = control => control.type === 29 && control.enumDefault === 1;

const isRelateMore = control => control.type === 29 && control.enumDefault === 2;

//关联多条卡片、下拉框
const isResultAsRelateMore = control => control.type === 29 && !isSheetDisplay(control);

// 汇总计算为数值的
export const isFormulaResultAsSubtotal = (item = {}) => {
  return item.type === 37 && _.includes([0, 6, 8], item.enumDefault2);
};

// 汇总计算为日期时间的
export const isFormulaResultAsSubtotalDateTime = (item = {}) => {
  return item.type === 37 && _.includes([15, 16], item.enumDefault2);
};

// 汇总计算为时间的
export const isFormulaResultAsSubtotalTime = (item = {}) => {
  return item.type === 37 && _.includes([46], item.enumDefault2);
};

// 公式控件计算为文本的
export const isFormulaResultAsText = (item = {}) => {
  return item.type === 53 && item.enumDefault2 === 2;
};

// 公式控件计算为数值的
export const isFormulaResultAsNumber = (item = {}) => {
  return (
    item.type === 31 || (item.type === 38 && item.enumDefault === 1) || (item.type === 53 && item.enumDefault2 === 6)
  );
};
// 他表字段值为数值的
const relateSheetFiledIsNumber = (item = {}) => {
  return item.type === 30 && _.includes(CAN_AS_NUMBER_DYNAMIC_FIELD, _.get(item, ['sourceControl', 'type']));
};
// 公式控件计算为日期时间的
export const isFormulaResultAsDateTime = (item = {}) => {
  return (
    (item.type === 38 && item.enumDefault === 2 && item.unit === '1') || (item.type === 53 && item.enumDefault2 === 16)
  );
};

// 公式控件计算为日期的
export const isFormulaResultAsDate = (item = {}) => {
  return (
    (item.type === 38 && item.enumDefault === 2 && item.unit === '3') || (item.type === 53 && item.enumDefault2 === 15)
  );
};

// 公式控件计算为时间的
export const isFormulaResultAsTime = (item = {}) => {
  return (
    (item.type === 38 && item.enumDefault === 2 && _.includes(['8', '9'], item.unit)) ||
    (item.type === 53 && item.enumDefault2 === 46)
  );
};

// 赋分值的选项
export const isEnableScoreOption = (item = {}) => {
  return _.includes([9, 10, 11], item.type) && item.enumDefault === 1;
};

//自定义选项
export const isCustomOptions = (item = {}) => {
  return _.includes([9, 10, 11], item.type) && !item.dataSource;
};

// 同类型成员
const isSameUser = (item = {}, usertype) => {
  return usertype === '2'
    ? (item.advancedSetting || {}).usertype === '2'
    : (item.advancedSetting || {}).usertype !== '2';
};

// 根据类型筛选 可用的动态默认值类型
export const FILTER = {
  // 文本
  2: item => _.includes(CAN_AS_TEXT_DYNAMIC_FIELD, item.type) || isSingleRelate(item) || isFormulaResultAsText(item),
  3: item => _.includes([3], item.type),
  4: item => _.includes([4], item.type),
  5: item => _.includes(CAN_AS_EMAIL_DYNAMIC_FIELD, item.type),
  // 数值
  6: item =>
    _.includes(CAN_AS_NUMBER_DYNAMIC_FIELD, item.type) ||
    isEnableScoreOption(item) ||
    isFormulaResultAsNumber(item) ||
    relateSheetFiledIsNumber(item) ||
    isFormulaResultAsSubtotal(item),
  // 金额
  8: item =>
    _.includes(CAN_AS_NUMBER_DYNAMIC_FIELD, item.type) ||
    isEnableScoreOption(item) ||
    isFormulaResultAsNumber(item) ||
    relateSheetFiledIsNumber(item) ||
    isFormulaResultAsSubtotal(item),
  // 附件
  14: item => _.includes([14], item.type),
  // 日期
  15: item => _.includes(CAN_AS_DATE_TIME_DYNAMIC_FIELD, item.type) || isFormulaResultAsDate(item),
  16: item => _.includes(CAN_AS_DATE_TIME_DYNAMIC_FIELD, item.type) || isFormulaResultAsDateTime(item),
  // 地区
  19: item => _.includes(CAN_AS_AREA_DYNAMIC_FIELD, item.type),
  23: item => _.includes(CAN_AS_AREA_DYNAMIC_FIELD, item.type),
  24: item => _.includes(CAN_AS_AREA_DYNAMIC_FIELD, item.type),

  // 多选可以选择单选字段 单选不能选多选字段
  // 必须是同类型用户
  // 用户
  26: (item, enumDefault) =>
    enumDefault === 0
      ? _.includes(CAN_AS_USER_DYNAMIC_FIELD, item.type) && item.enumDefault === enumDefault
      : _.includes(CAN_AS_USER_DYNAMIC_FIELD, item.type),
  27: item => _.includes(CAN_AS_DEPARTMENT_DYNAMIC_FIELD, item.type),
  // 等级
  28: item =>
    _.includes(CAN_AS_SCORE_DYNAMIC_FIELD, item.type) || isEnableScoreOption(item) || isFormulaResultAsSubtotal(item),
  // 检查框
  36: item => _.includes(CAN_AS_SWITCH_DYNAMIC_FIELD, item.type),
  // 定位
  40: item => _.includes(CAN_AS_LOCATION_DYNAMIC_FIELD, item.type),
  // 富文本
  41: item => _.includes(CAN_AS_RICH_TEXT_DYNAMIC_FIELD, item.type) || isSingleRelate(item),
  // 嵌入
  45: item => _.includes(CAN_AS_EMBED_DYNAMIC_FIELD, item.type) || isSingleRelate(item),
  // 时间
  46: item => _.includes(CAN_AS_TIME_DYNAMIC_FIELD, item.type) || isFormulaResultAsTime(item),
  // 组织角色
  48: item => _.includes(CAN_AS_ORG_ROLE_DYNAMIC_FIELD, item.type),
  // 普通数组
  10000007: item => _.includes(CAN_AS_ARRAY_DYNAMIC_FIELD, item.type) || isResultAsRelateMore(item),
  // 对象数组
  10000008: item => _.includes(CAN_AS_ARRAY_OBJECT_DYNAMIC_FIELD, item.type),
};

// 关联多条----关联单条、多条（列表除外）
export const filterControls = (data = {}, controls = []) => {
  return controls.filter(item =>
    isRelateMore(data) ? isResultAsRelateMore(item) : isSingleRelate(item) || item.type === 35,
  );
};

export const getControls = ({ data = {}, controls, isCurrent, from }) => {
  const { type, enumDefault, dataSource, advancedSetting: { usertype } = {} } = data;
  const filterFn = FILTER[type];
  //文本字段值可选 关联记录自动编号，不能是当前表单,查询工作表都可
  if (_.includes([2], type) && isCurrent && !_.includes([DYNAMIC_FROM_MODE.SEARCH_WORKSHEET], from)) {
    controls = controls.filter(con => con.type !== 33);
  }
  // 富文本不支持当前记录的自动编号、文本组合、条码
  if (type === 41 && isCurrent && !_.includes([DYNAMIC_FROM_MODE.SEARCH_WORKSHEET], from)) {
    controls = controls.filter(con => !_.includes([32, 33, 47], con.type));
  }

  if (_.includes([2, 3, 4, 5, 6, 8, 14, 15, 16, 19, 23, 24, 28, 36, 40, 41, 45, 46, 10000007, 10000008], type))
    return _.filter(controls, filterFn);

  if (_.includes([7], type)) {
    return _.filter(controls, item => item.enumDefault === enumDefault && item.type === 7);
  }

  if (_.includes([9, 10, 11], type)) {
    const filterControls = _.filter(controls, item => _.includes([9, 10, 11], item.type));
    // isEqualSource同源异化显示
    return filterControls.map(i => (dataSource && i.dataSource === dataSource ? { ...i, isEqualSource: true } : i));
  }

  if (_.includes([26], type)) {
    // 默认值不支持部门、组织角色，人员选择范围动态值支持
    controls = _.includes([DYNAMIC_FROM_MODE.USER_CONFIG], from)
      ? controls
      : _.filter(controls, item => !_.includes([27, 48], item.type));
    return _.filter(controls, item => filterFn(item, enumDefault) && isSameUser(item, usertype));
  }
  // 默认值部门可选成员字段、查询配置中不可选成员字段
  if (_.includes([27], type)) {
    return _.includes([DYNAMIC_FROM_MODE.CUSTOM_EVENT, DYNAMIC_FROM_MODE.SEARCH_WORKSHEET], from)
      ? _.filter(controls, item => _.includes([27], item.type))
      : _.filter(controls, filterFn);
  }
  // 默认值支持成员，选择范围不支持成员
  if (_.includes([48], type)) {
    return _.includes(
      [DYNAMIC_FROM_MODE.ORG_CONFIG, DYNAMIC_FROM_MODE.CUSTOM_EVENT, DYNAMIC_FROM_MODE.SEARCH_WORKSHEET],
      from,
    )
      ? _.filter(controls, item => _.includes([48], item.type))
      : _.filter(controls, filterFn);
  }
  if (_.includes([29], type)) {
    const newControls = filterControls(data, controls);
    return _.filter(newControls, item => item.dataSource === dataSource);
  }
  if (_.includes([35], type)) {
    return _.filter(controls, item => item.dataSource === dataSource && item.type === 35);
  }
  return controls;
};

export const transferValue = (value = '') => {
  const controlFields = value.match(FIELD_REG_EXP) || [];
  const defaultValue = _.filter(value.split('$'), v => !_.isEmpty(v));
  const defsource = defaultValue.map(item => {
    const defaultData = { cid: '', rcid: '', staticValue: '' };
    if (_.includes(controlFields, `$${item}$`)) {
      const [cid = '', rcid = ''] = item.split('~');
      return { ...defaultData, cid, rcid };
    } else {
      return { ...defaultData, staticValue: item };
    }
  });
  return defsource;
};

export const isIframeControl = item => {
  return item && item.type === 45 && item.enumDefault === 1;
};

export const getTypeList = (data = {}) => {
  const { advancedSetting: { showtype } = {} } = data;
  if (showtype === '1') {
    return [
      { id: '1', text: _l('开启') },
      { id: '0', text: _l('关闭') },
    ];
  } else if (showtype === '2') {
    return [
      { id: '1', text: _l('是%04015') },
      { id: '0', text: _l('否') },
    ];
  } else {
    return CHECKBOX_TYPES;
  }
};

export const getOtherSelectField = (control, value) => {
  let data = [];
  if (control.type === 45 && control.enumDefault === 1) {
    data = EMEBD_FIELDS;
  }
  return value
    ? data.map(item => {
        return { ...item, list: (item.list || []).filter(i => _.includes(i.text, value)) };
      })
    : data;
};

const MAP_FILTER = {
  // 文本
  2: item => _.includes([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 15, 16, 28, 36, 46], item.type),
  // 数值
  6: item => _.includes([6, 8, 9, 10, 11, 28, 36], item.type) || relateSheetFiledIsNumber(item),
  // 日期
  16: item => _.includes(CAN_AS_DATE_TIME_DYNAMIC_FIELD, item.type) || isFormulaResultAsDateTime(item),
  // 人员
  26: item => _.includes([26], item.type),
  // 部门
  27: item => _.includes([27], item.type),
  // 普通数组
  10000007: item => _.includes(CAN_AS_ARRAY_DYNAMIC_FIELD, item.type) || isResultAsRelateMore(item),
  // 对象数组
  10000008: item => _.includes([34], item.type),
};

export const getMapControls = (item, controls = []) => {
  if (item.type === 10000007) {
    const subControl = controls
      .filter(i => i.type === 34)
      .reduce((total, cur) => {
        const formatRelations = filterSys(cur.relationControls).map(item => {
          return { ...item, parentId: cur.controlId, parentName: cur.controlName };
        });
        return total.concat(formatRelations);
      }, []);
    const totalControls = controls.concat(subControl);
    return _.filter(totalControls, MAP_FILTER[item.originType]);
  }
  const filterFn = MAP_FILTER[item.type];
  return _.filter(controls, filterFn);
};
