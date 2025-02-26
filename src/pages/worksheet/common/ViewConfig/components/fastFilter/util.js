import _ from 'lodash';
import { FILTER_CONDITION_TYPE } from 'src/pages/worksheet/common/WorkSheetFilter/enum';
import { redefineComplexControl } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { DATE_TYPE, DATE_TYPE_ALL, DATE_TYPE_M, DATE_TYPE_Y, DATE_TYPE_D, DATE_TYPE_H, DATE_TYPE_H_M, DATE_SHOW_TYPE } from './config';
import { DATE_RANGE_TYPE } from 'src/pages/worksheet/common/WorkSheetFilter/enum.js'

// 文本筛选方式
const TEXT_TYPE = [
  { text: _l('等于'), value: FILTER_CONDITION_TYPE.EQ },
  { text: _l('包含'), value: FILTER_CONDITION_TYPE.LIKE },
  { text: _l('同时包含'), value: FILTER_CONDITION_TYPE.TEXT_ALLCONTAIN },
  { text: _l('开头是'), value: FILTER_CONDITION_TYPE.START },
  { text: _l('结尾是'), value: FILTER_CONDITION_TYPE.END },
];
// 关联筛选方式
const RELA_TYPE = [
  { text: _l('等于'), value: FILTER_CONDITION_TYPE.RCEQ },
  { text: _l('属于'), value: FILTER_CONDITION_TYPE.BETWEEN },
];
// 地区筛选方式
const GROUP_TYPE = [
  { text: _l('是'), value: FILTER_CONDITION_TYPE.EQ },
  { text: _l('属于'), value: FILTER_CONDITION_TYPE.BETWEEN },
];
// 数值筛选方式
const NUMBER_TYPE = [
  { text: _l('在范围内'), value: FILTER_CONDITION_TYPE.BETWEEN },
  { text: _l('等于'), value: FILTER_CONDITION_TYPE.EQ },
];
// 日期 日期时间筛选方式
const DATE_FILTER_TYPE_ENUM = [
  { text: _l('等于'), value: FILTER_CONDITION_TYPE.DATEENUM },
  { text: _l('早于'), value: FILTER_CONDITION_TYPE.DATE_LT },
  { text: _l('晚于'), value: FILTER_CONDITION_TYPE.DATE_GT },
  { text: _l('早于等于'), value: FILTER_CONDITION_TYPE.DATE_LTE },
  { text: _l('晚于等于'), value: FILTER_CONDITION_TYPE.DATE_GTE },
  { text: _l('在范围内'), value: FILTER_CONDITION_TYPE.DATE_BETWEEN },
];
// 多选的筛选方式
const MULTI_SELECT_TYPE = [
  { text: _l('等于'), value: FILTER_CONDITION_TYPE.ARREQ },
  { text: _l('包含其中一个'), value: FILTER_CONDITION_TYPE.EQ },
  { text: _l('同时包含'), value: FILTER_CONDITION_TYPE.ALLCONTAIN },
];
// 数量
const OPTIONS_TYPE = [
  { text: _l('单选'), value: 1 },
  { text: _l('多选'), value: 2 },
];
// 显示方式
const SHOW_TYPE = [
  { text: _l('下拉框'), value: 2 },
  { text: _l('平铺'), txt: _l('（最多显示20个）'), value: 1 },
];

// 引导文字
export const LIMIT = {
  key: 'limit',
  keys: [
    1,
    2, // 文本框
    3,
    4, // 电话号码
    5, // 邮件地址
    7, // 证件
    32, // 文本组合
    33, // 自动编号
  ],
  txt: _l('引导文字'),
};
//多选类型字段 且 允许选择数量为多选 =>支持设置筛选方式  多选 => 人员、部门、组织角色enumDefault：1; 关联字段enumDefault: 2 ;多选字段
export const MULTI_SELECT_FILTER_TYPE = {
  key: 'filterType',
  types: MULTI_SELECT_TYPE,
  default: FILTER_CONDITION_TYPE.EQ,
  keys: [
    10, // 多选
    29, // 关联表
    26, // 成员
    27, // 部门
    48, // 组织角色
  ],
  txt: _l('筛选方式'),
};
//筛选方式
export const TEXT_FILTER_TYPE = {
  //文本
  key: 'filterType',
  types: TEXT_TYPE,
  default: FILTER_CONDITION_TYPE.LIKE,
  keys: [
    1,
    2, // 文本框
    3,
    4, // 电话号码
    5, // 邮件地址
    7, // 证件
    32, // 文本组合
    33, // 自动编号
    // 31, //31数值计算
    // 38, //公式 38日期计算
  ],
  txt: _l('筛选方式'),
};
// 筛选方式
export const NUMBER_FILTER_TYPE = {
  //数值
  key: 'filterType',
  default: FILTER_CONDITION_TYPE.BETWEEN,
  types: NUMBER_TYPE,
  keys: [
    6, // 数值
    8, // 金额
    31, //31数值计算
  ],
  txt: _l('筛选方式'),
};
// 筛选方式
export const DATE_FILTER_TYPE = {
  //日期
  key: 'filterType',
  default: FILTER_CONDITION_TYPE.DATEENUM,
  types: DATE_FILTER_TYPE_ENUM,
  keys: [
    15, // 日期
    16, //日期时间
  ],
  txt: _l('筛选方式'),
};
//筛选方式
export const RELA_FILTER_TYPE = {
  key: 'filterType',
  types: RELA_TYPE,
  default: FILTER_CONDITION_TYPE.BETWEEN,
  keys: [35],
  txt: _l('筛选方式'),
};
export const GROUP_FILTER_TYPE = {
  key: 'filterType',
  types: GROUP_TYPE,
  default: FILTER_CONDITION_TYPE.BETWEEN,
  keys: [
    27, // 部门
    19, // 地区 19'省23'省-市'24'省-市-县'
    23, // 地区 19'省23'省-市'24'省-市-县'
    24, // 地区 19'省23'省-市'24'省-市-县'
  ],
  txt: _l('筛选方式'),
};
//显示方式
export const SHOW_RELATE_TYPE = {
  //选项
  key: 'direction',
  default: 2, //下拉框
  types: SHOW_TYPE.map(o => {
    if (o.value === 1) {
      return { ...o, txt: '（最多显示20个）' };
    } else {
      return o;
    }
  }),
  keys: [
    29, // 关联表
  ],
  txt: _l('显示方式'),
};

//显示项
export const NAV_SHOW_TYPE = {
  //选项
  key: 'navShow',
  // default: 2, //下拉框
  keys: [
    29, // 关联表
    11, // 选项
    10, // 多选
    9, // 单选 平铺
    26, //成员
  ],
  txt: _l('显示项'),
};

// 数值筛选方式
const DATE_GRANULARITY_TYPE_ENUM = [
  { text: _l('年'), value: DATE_RANGE_TYPE.YEAR }, //showtype 5
  // { text: _l('季'), value: DATE_RANGE_TYPE.QUARTER },//showtype 11
  { text: _l('月'), value: DATE_RANGE_TYPE.MONTH },// showtype 4
  { text: _l('日'), value: DATE_RANGE_TYPE.DAY },//showtype3
  { text: _l('时'), value: DATE_RANGE_TYPE.HOUR },//showtype 2
  { text: _l('分'), value: DATE_RANGE_TYPE.MINUTE },//showtype 1
  // { text: _l('秒'), value: DATE_RANGE_TYPE.SECOND }, //showtype 6
];
// 颗粒度
export const DATE_GRANULARITY_TYPE = {
  //日期
  key: 'dateRangeType',
  default: DATE_RANGE_TYPE.DAY,
  types: DATE_GRANULARITY_TYPE_ENUM,
  keys: [
    15, // 日期
    16, //日期时间
  ],
  txt: _l('颗粒度'),
};

//预设时间范围选项
export const DATE_RANGE = {
  key: 'daterange',
  default: DATE_TYPE_ALL, //全选
  types: DATE_TYPE,
  keys: [
    15, // 日期
    16, //日期时间
  ],
  txt: _l('预设时间范围选项'),
};
//App支持扫码查询
export const APP_ALLOWSCAN = {
  //文本
  key: 'allowscan',
  default: '',
  keys: TEXT_FILTER_TYPE.keys,
};
//允许选择数量
export const OPTIONS_ALLOWITEM = {
  //选项
  key: 'allowitem',
  default: 1,
  types: OPTIONS_TYPE,
  keys: [
    11, // 选项
    10, // 多选
    9, // 单选 平铺
    // 36, // 检查框
    29, // 关联表
    26, // 成员
    27, // 部门
    48, // 组织角色
    19, // 地区 19'省23'省-市'24'省-市-县'
    23, // 地区 19'省23'省-市'24'省-市-县'
    24, // 地区 19'省23'省-市'24'省-市-县'
    35, //级联选择
  ],
  txt: _l('允许选择数量'),
};
//显示方式
export const DIRECTION_TYPE = {
  //选项
  key: 'direction',
  default: 2, //下拉框
  types: SHOW_TYPE,
  keys: [
    11, // 选项
    10, // 多选
    9, // 单选 平铺
  ],
  txt: _l('显示方式'),
};

export const FAST_FILTERS_WHITELIST = [
  TEXT_FILTER_TYPE,
  NUMBER_FILTER_TYPE,
  DATE_FILTER_TYPE,
  DIRECTION_TYPE,
  SHOW_RELATE_TYPE,
  // DATE_RANGE,
  OPTIONS_ALLOWITEM,
  APP_ALLOWSCAN,
  RELA_FILTER_TYPE,
  GROUP_FILTER_TYPE,
  MULTI_SELECT_FILTER_TYPE,
  LIMIT,
  DATE_GRANULARITY_TYPE,
];
// 支持快速筛选的字段
export const FASTFILTER_CONDITION_TYPE = [
  1, // 文本
  2, // 文本
  3, // 电话
  4, // 电话
  5, // 邮箱
  6, // 数值
  7, // 证件
  8, // 金额
  9, // 9单选
  10, // 多选10
  11, // 11单选
  // 14, // 附件
  15, // 日期
  16, // 日期
  17, // 时间段 日期17 日期时间18
  18, // 时间段 日期17 日期时间18
  19, // 地区 19'省23'省-市'24'省-市-县'
  23, // 地区 19'省23'省-市'24'省-市-县'
  24, // 地区 19'省23'省-市'24'省-市-县'
  // 21, // 自由连接
  // 22, // 分割线
  // 25, // 大写金额
  26, // 成员
  27, // 部门
  // 28, // 等级
  29, // 关联表
  // 30, // 他表字段
  31, // 公式  31数值计算 38日期计算
  38, // 公式  31数值计算 38日期计算
  32, // 文本组合
  33, // 自动编号
  36, // 检查框
  37, // 汇总
  // 41, // _l('富文本'),
  // 42, // _l('签名'),
  // 10010, // 备注
  35, //级联选择
  // 34, //子表
  46, //时间
  48, // 组织角色
  50, // API 查询
  53, // 函数公式
];
//处理这些变更时，需要格式化处理fastFilter里的navfilters
export const ADVANCEDSETTING_KEYS = [
  'allowscan',
  'daterange',
  'allowitem',
  'direction',
  'searchtype',
  'searchcontrol',
  'clicksearch',
  'limit',
];
export const Filter_KEYS = ['filterType'];

export const getControlFormatType = (control = {}) => {
  return redefineComplexControl(control).type;
};
export const getDefaultDateRange = showtype => {
  return showtype === DATE_SHOW_TYPE.YEAR
    ? DATE_TYPE_Y
    : showtype === DATE_SHOW_TYPE.MONTH
      ? DATE_TYPE_M
      : showtype === DATE_SHOW_TYPE.DAY
        ? DATE_TYPE_D
        : showtype === DATE_SHOW_TYPE.HOUR
          ? DATE_TYPE_H
          : DATE_TYPE_ALL;
};
//默认颗粒度日 1
export const getDefaultDateRangeType = (control = {}) => {
  return !!_.get(control, 'advancedSetting.showtype') && Number(_.get(control, 'advancedSetting.showtype'))
    ? Number(_.get(control, 'advancedSetting.showtype')) > 3 && Number(_.get(control, 'advancedSetting.showtype')) < 6
      ? Number(_.get(control, 'advancedSetting.showtype'))
      : DATE_RANGE_TYPE.DAY
    : DATE_RANGE_TYPE.DAY;
};

//返回对应showtype
export const getShowtypeByDateRangeType = (dateRangeType) => {
  switch (dateRangeType) {
    case DATE_RANGE_TYPE.YEAR:
      return DATE_SHOW_TYPE.YEAR
    case DATE_RANGE_TYPE.QUARTER:
      return DATE_SHOW_TYPE.QUARTER
    case DATE_RANGE_TYPE.MONTH:
      return DATE_SHOW_TYPE.MONTH
    case DATE_RANGE_TYPE.DAY:
      return DATE_SHOW_TYPE.DAY
    case DATE_RANGE_TYPE.HOUR:
      return DATE_SHOW_TYPE.HOUR
    case DATE_RANGE_TYPE.MINUTE:
      return DATE_SHOW_TYPE.MINUTE
    case DATE_RANGE_TYPE.SECOND:
      return DATE_SHOW_TYPE.SECOND
  }
}

export const getDateRangeTypeListByShowtype = (showtype) => {
  switch (showtype) {
    case DATE_SHOW_TYPE.YEAR:
      return DATE_GRANULARITY_TYPE_ENUM.filter(o => o.value === DATE_RANGE_TYPE.YEAR)
    case DATE_SHOW_TYPE.QUARTER:
      return DATE_GRANULARITY_TYPE_ENUM.filter(o => [DATE_RANGE_TYPE.YEAR, DATE_RANGE_TYPE.QUARTER].includes(o.value))
    case DATE_SHOW_TYPE.MONTH:
      return DATE_GRANULARITY_TYPE_ENUM.filter(o => [DATE_RANGE_TYPE.YEAR, DATE_RANGE_TYPE.QUARTER, DATE_RANGE_TYPE.MONTH].includes(o.value))
    case DATE_SHOW_TYPE.DAY:
      return DATE_GRANULARITY_TYPE_ENUM.filter(o => [DATE_RANGE_TYPE.YEAR, DATE_RANGE_TYPE.QUARTER, DATE_RANGE_TYPE.MONTH, DATE_RANGE_TYPE.DAY].includes(o.value))
    case DATE_SHOW_TYPE.HOUR:
      return DATE_GRANULARITY_TYPE_ENUM.filter(o => [DATE_RANGE_TYPE.YEAR, DATE_RANGE_TYPE.QUARTER, DATE_RANGE_TYPE.MONTH, DATE_RANGE_TYPE.DAY, DATE_RANGE_TYPE.HOUR].includes(o.value))
    case DATE_SHOW_TYPE.MINUTE:
      return DATE_GRANULARITY_TYPE_ENUM.filter(o => [DATE_RANGE_TYPE.YEAR, DATE_RANGE_TYPE.QUARTER, DATE_RANGE_TYPE.MONTH, DATE_RANGE_TYPE.DAY, DATE_RANGE_TYPE.HOUR, DATE_RANGE_TYPE.MINUTE].includes(o.value))
    default:
      return DATE_GRANULARITY_TYPE_ENUM
  }
}

export const getSetDefault = (control = {}) => {
  let type = getControlFormatType(control);
  let fastFilterSet = {
    controlId: control.controlId,
    dataType: type,
  };
  FAST_FILTERS_WHITELIST.map(o => {
    let defaultValue = o.default;
    if (o.keys.includes(type)) {
      const { advancedSetting = {} } = fastFilterSet;
      if (!ADVANCEDSETTING_KEYS.includes(o.key)) {
        if (DATE_GRANULARITY_TYPE.keys.includes(type) && o.key === 'dateRangeType') {
          defaultValue = getDefaultDateRangeType(control);
        }
        fastFilterSet = {
          ...fastFilterSet,
          [o.key]: control[o.key] || defaultValue,
        };
      } else {
        if (DATE_RANGE.keys.includes(type) && o.key === 'daterange') {
          defaultValue = getDefaultDateRange(_.get(control, 'advancedSetting.showtype'));
        }

        fastFilterSet = {
          ...fastFilterSet,
          advancedSetting: {
            ...advancedSetting,
            [o.key]: JSON.stringify(control[o.key] || defaultValue),
          },
        }; //预设时间为多选
      }
    }
  });
  //设置了加密
  if (!!control.encryId) {
    fastFilterSet = { ...fastFilterSet, filterType: FILTER_CONDITION_TYPE.EQ };
  }
  if (!!_.get(control, 'advancedSetting.searchcontrol')) {
    fastFilterSet.advancedSetting.searchcontrol = _.get(control, 'advancedSetting.searchcontrol');
  }
  if (!!_.get(control, 'advancedSetting.searchtype')) {
    fastFilterSet.advancedSetting.searchtype = _.get(control, 'advancedSetting.searchtype');
  }
  return fastFilterSet;
};

//格式化接口人员等字段只提交id
export const formatFastFilterData = info => {
  return info.map(o => {
    let values = o.values;
    if ([26, 27, 48, 29, 35].includes(o.dataType)) {
      const key = [29, 35].includes(o.dataType)
        ? 'rowid'
        : o.dataType === 26
          ? 'accountId'
          : o.dataType === 27
            ? 'departmentId'
            : 'organizeId';
      values = (values || []).map(o => {
        if (o.indexOf(key) < 0 && o.indexOf('id') < 0) {
          return o;
        }
        return (safeParse(o) || {})[key] || (safeParse(o) || {}).id || o;
      });
    }
    return { ...o, values };
  });
};

export const getDaterange = advancedSetting => {
  let daterange = advancedSetting.daterange;
  try {
    daterange = JSON.parse(daterange);
  } catch (error) {
    daterange = [];
  }
  return daterange;
};
