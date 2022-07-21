import {
  CONTROL_TYPE,
  DATE_TYPES,
  TIME_TYPES,
  CAN_SHOW_CLEAR_FIELD,
  CAN_AS_TEXT_DYNAMIC_FIELD,
  CAN_AS_EMAIL_DYNAMIC_FIELD,
  CAN_AS_TIME_DYNAMIC_FIELD,
  CAN_AS_AREA_DYNAMIC_FIELD,
  CAN_AS_USER_DYNAMIC_FIELD,
  CAN_AS_DEPARTMENT_DYNAMIC_FIELD,
  CAN_AS_SCORE_DYNAMIC_FIELD,
  CAN_AS_SWITCH_DYNAMIC_FIELD,
  CAN_AS_NUMBER_DYNAMIC_FIELD,
  CAN_AS_EMBED_DYNAMIC_FIELD,
  FIELD_REG_EXP,
  CHECKBOX_TYPES,
  EMEBD_FIELDS,
} from './config';

export const getControlType = data => {
  return CONTROL_TYPE[data.type];
};

export const getDateType = data => {
  return data.type === 16 ? TIME_TYPES : DATE_TYPES;
};

export const showClear = (data = {}, dynamicValue) => {
  const { staticValue } = dynamicValue[0] || {};
  if (_.includes(CAN_SHOW_CLEAR_FIELD, data.type) && staticValue) return true;
  if (data.type === 26) {
    const transferValue = typeof staticValue === 'string' ? JSON.parse(staticValue || '{}') : staticValue;
    return (transferValue || {}).accountId === 'user-self';
  }
  return false;
};

const isSingleRelate = control => control.type === 29 && control.enumDefault === 1;

const isRelateMore = control => control.type === 29 && control.enumDefault === 2;

//关联多条卡片、下拉框
const isResultAsRelateMore = control => control.type === 29 && _.get(control.advancedSetting || {}, 'showtype') !== '2';

// 汇总计算为数值的
const isFormulaResultAsSubtotal = item => {
  return item.type === 37 && _.includes([0, 6, 8], item.enumDefault2);
};

// 公式控件计算为数值的
const isFormulaResultAsNumber = item => {
  return item.type === 31 || (item.type === 38 && item.enumDefault === 1);
};
// 他表字段值为数值的
const relateSheetFiledIsNumber = item => {
  return item.type === 30 && _.includes(CAN_AS_NUMBER_DYNAMIC_FIELD, _.get(item, ['sourceControl', 'type']));
};
// 公式控件计算为日期的
const isFormulaResultAsDate = item => {
  return item.type === 38 && item.enumDefault !== 1;
};

// 赋分值的选项
export const isEnableScoreOption = item => {
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
  2: item =>
    (_.includes(CAN_AS_TEXT_DYNAMIC_FIELD, item.type) && !_.includes(['caid', 'ownerid'], item.controlId)) ||
    isSingleRelate(item),
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
  // 日期
  15: item => _.includes(CAN_AS_TIME_DYNAMIC_FIELD, item.type) || isFormulaResultAsDate(item),
  16: item => _.includes(CAN_AS_TIME_DYNAMIC_FIELD, item.type) || isFormulaResultAsDate(item),
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
  // 嵌入
  45: item =>
    (_.includes(CAN_AS_EMBED_DYNAMIC_FIELD, item.type) && !_.includes(['caid', 'ownerid'], item.controlId)) ||
    isSingleRelate(item),
};

// 关联多条----关联单条、多条（列表除外）
export const filterControls = (data = {}, controls = []) => {
  return controls.filter(item =>
    isRelateMore(data) ? isResultAsRelateMore(item) : isSingleRelate(item) || item.type === 35,
  );
};

export const getControls = ({ data = {}, controls, isCurrent, fromSearch = false }) => {
  const { type, enumDefault, dataSource, advancedSetting: { usertype } = {} } = data;
  const filterFn = FILTER[type];
  //文本字段值可选 关联记录自动编号，不能是当前表单
  if (_.includes([2], type) && isCurrent) {
    controls = controls.filter(con => con.type !== 33);
  }
  if (_.includes([2, 3, 4, 5, 6, 8, 19, 23, 24, 28, 36, 45], type)) return _.filter(controls, filterFn);
  // 单选选项集
  if (_.includes([9, 11], type)) {
    return _.filter(
      controls,
      item => item.dataSource && item.dataSource === dataSource && _.includes([9, 11], item.type),
    );
  }
  // 多选选项集
  if (_.includes([10], type)) return _.filter(controls, item => item.dataSource && item.dataSource === dataSource);

  if (_.includes([15, 16], type)) {
    return _.filter(controls, filterFn);
  }
  if (_.includes([26], type)) {
    return _.filter(controls, item => filterFn(item, enumDefault) && isSameUser(item, usertype));
  }
  // 默认值部门可选成员字段、查询配置中不可选成员字段
  if (_.includes([27], type)) {
    return fromSearch ? _.filter(controls, item => _.includes([27], item.type)) : _.filter(controls, filterFn);
  }
  if (_.includes([29], type)) {
    const newControls = filterControls(data, controls);
    return _.filter(newControls, item => item.dataSource === dataSource);
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
      { id: '1', text: _l('是') },
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
