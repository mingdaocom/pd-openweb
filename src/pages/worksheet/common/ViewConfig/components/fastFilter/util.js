import _ from 'lodash';
import { FILTER_CONDITION_TYPE } from 'src/pages/worksheet/common/WorkSheetFilter/enum';
import { redefineComplexControl } from 'src/pages/worksheet/common/WorkSheetFilter/util';
// 文本筛选方式
const TEXT_TYPE = [
  { text: _l('精准搜索'), value: FILTER_CONDITION_TYPE.EQ },
  { text: _l('模糊搜索'), value: FILTER_CONDITION_TYPE.LIKE },
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
  { text: _l('平铺'), value: 1 },
];

export const DATE_TYPE_M = [7, 8, 9, 12, 13, 14, 15, 16, 17];
export const DATE_TYPE_Y = [15, 16, 17];
//时间
export const DATE_TYPE = [
  [{ text: _l('全选'), value: 'all' }],
  [
    { text: _l('今天'), value: 1 },
    { text: _l('昨天'), value: 2 },
    { text: _l('明天'), value: 3 },
  ],
  [
    { text: _l('本周'), value: 4 },
    { text: _l('上周'), value: 5 },
    { text: _l('下周'), value: 6 },
  ],
  [
    { text: _l('本月'), value: 7 },
    { text: _l('上个月'), value: 8 },
    { text: _l('下个月'), value: 9 },
  ],
  [
    { text: _l('本季度'), value: 12 },
    { text: _l('上季度'), value: 13 },
    { text: _l('下季度'), value: 14 },
  ],
  [
    { text: _l('今年'), value: 15 },
    { text: _l('去年'), value: 16 },
    { text: _l('明年'), value: 17 },
  ],
  [
    { text: _l('过去7天'), value: 21 },
    { text: _l('过去14天'), value: 22 },
    { text: _l('过去30天'), value: 23 },
  ],
  [
    { text: _l('将来7天'), value: 31 },
    { text: _l('将来14天'), value: 32 },
    { text: _l('将来30天'), value: 33 },
  ],
];
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
  txt: '筛选方式',
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
  txt: '筛选方式',
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
  txt: '筛选方式',
};
//筛选方式
export const RELA_FILTER_TYPE = {
  key: 'filterType',
  types: RELA_TYPE,
  default: FILTER_CONDITION_TYPE.BETWEEN,
  keys: [35],
  txt: '筛选方式',
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
  txt: '筛选方式',
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
  txt: '显示方式',
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
  txt: '显示项',
};
// //显示项 为空设置
// export const NAVSHOW_NULL_TYPE = {
//   key: 'shownullitem',
//   default: 1, //显示
//   keys: [
//     29, // 关联表
//     11, // 选项
//     10, // 多选
//     9, // 单选 平铺
//     26 //成员
//   ],
// };
const list = _.flattenDeep(DATE_TYPE)
  .map(o => o.value)
  .filter(o => o !== 'all');

//预设时间
export const DATE_RANGE = {
  key: 'daterange',
  default: list, //全选
  types: DATE_TYPE,
  keys: [
    15, // 日期
    16, //日期时间
  ],
  txt: '预设时间',
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
  txt: '允许选择数量',
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
  txt: '显示方式',
};

export const FAST_FILTERS_WHITELIST = [
  TEXT_FILTER_TYPE,
  NUMBER_FILTER_TYPE,
  DIRECTION_TYPE,
  SHOW_RELATE_TYPE,
  DATE_RANGE,
  OPTIONS_ALLOWITEM,
  APP_ALLOWSCAN,
  RELA_FILTER_TYPE,
  GROUP_FILTER_TYPE,
  MULTI_SELECT_FILTER_TYPE,
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
];

export const getControlFormatType = (control = {}) => {
  return redefineComplexControl(control).type;
};
export const getSetDefault = (control = {}) => {
  let type = getControlFormatType(control);
  let fastFilterSet = {
    controlId: control.controlId,
    dataType: type,
  };
  FAST_FILTERS_WHITELIST.map(o => {
    if (o.keys.includes(type)) {
      const { advancedSetting = {} } = fastFilterSet;
      if (!ADVANCEDSETTING_KEYS.includes(o.key)) {
        fastFilterSet = {
          ...fastFilterSet,
          [o.key]: control[o.key] || o.default,
        };
      } else {
        let defaultValue = o.default;
        if (DATE_RANGE.keys.includes(control.type)) {
          defaultValue =
            _.get(control, 'advancedSetting.showtype') === '5'
              ? DATE_TYPE_Y
              : _.get(control, 'advancedSetting.showtype') === '4'
                ? DATE_TYPE_M
                : defaultValue;
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
  return fastFilterSet;
};
