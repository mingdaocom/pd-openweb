// 支持分组筛选的字段
export const GROUPFILTER_CONDITION_TYPE = [
  // 1, // 文本
  // 2, // 文本
  // 3, // 电话
  // 4, // 电话
  // 5, // 邮箱
  // 6, // 数值
  // 7, // 证件
  // 8, // 金额
  9, // 9单选
  10, // 多选10
  11, // 11单选
  // 14, // 附件
  // 15, // 日期
  // 16, // 日期
  // 17, // 时间段 日期17 日期时间18
  // 18, // 时间段 日期17 日期时间18
  19, // 地区 19'省23'省-市'24'省-市-县'
  23, // 地区 19'省23'省-市'24'省-市-县'
  24, // 地区 19'省23'省-市'24'省-市-县'
  // 21, // 自由连接
  // 22, // 分割线
  // 25, // 大写金额
  26, // 成员
  27, // 部门
  28, // 等级
  29, // 关联表
  // 30, // 他表字段
  // 31, // 公式  31数值计算 38日期计算
  // 38, // 公式  31数值计算 38日期计算
  // 32, // 文本组合
  // 33, // 自动编号
  // 36, // 检查框
  // 37, // 汇总
  // 41, // _l('富文本'),
  // 42, // _l('签名'),
  // 10010, // 备注
  35, //级联选择
  // 34, //子表
  48, //组织角色
];

export const canNavGroup = (control, worksheetId) => {
  if (
    GROUPFILTER_CONDITION_TYPE.includes(control.type) ||
    (control.type === 30 && //支持他表字段 仅存储(9,10,11)
      GROUPFILTER_CONDITION_TYPE.includes(control.sourceControlType) &&
      (control.strDefault || '').split('')[0] !== '1')
  ) {
    if (control.type === 29) {
      //关联他表 且 单条/多条
      // if (control.enumDefault === 1 && worksheetId !== control.dataSource) {
      if (worksheetId !== control.dataSource) {
        return true;
      }
    } else {
      return true;
    }
  }
};

const OPTIONS_TYPE = [
  { text: _l('升序'), value: true },
  { text: _l('降序'), value: false },
];
export const NAVSHOW_TYPE = [
  //空或者0：全部 1：有数据的项 2：指定项 3：满足条件的项
  { text: _l('全部'), value: '0' },
  { text: _l('显示有数据的项'), value: '1' },
  { text: _l('显示指定项'), value: '2' },
  { text: _l('显示满足筛选条件的项'), value: '3' },
  //   全部
  // 显示有数据的项
  // 显示指定项（包含未指定/为空发分组）
  // 显示满足筛选条件的项（仅关联记录作为分组时）
];
export const OPTIONS = {
  //选项
  data: [
    { key: 'navshow', types: NAVSHOW_TYPE.filter(o => o.value !== '3'), txt: _l('显示项'), default: '0' },
    { key: 'isAsc', types: OPTIONS_TYPE, txt: _l('排序方式'), default: true },
  ],
  keys: [
    11, // 选项
    10, // 多选
    9, // 单选 平铺
    28,
  ],
};
export const OPTIONSOTHER = {
  //成员 部门 组织角色
  data: [
    { key: 'navshow', types: NAVSHOW_TYPE.filter(o => ['1', '2'].includes(o.value)), txt: _l('显示项'), default: '1' },
    { key: 'isAsc', types: OPTIONS_TYPE, txt: _l('排序方式'), default: true },
  ],
  keys: [26, 27, 48],
};
const RELATE_TYPE = [
  { text: _l('是'), value: 24 },
  { text: _l('属于'), value: 11 },
];

export const AREA = {
  //地区
  keys: [19, 23, 24],
  data: [{ key: 'filterType', types: RELATE_TYPE, txt: _l('筛选方式'), default: 11 }],
};

export const RELATES = {
  //选项
  keys: [29],
  data: [
    {
      key: 'viewId',
      txt: _l('层级视图'),
      des: _l('当前选择为关联记录字段，可以继续选择关联表中的层级视图生成树状导航'),
    },
    { key: 'filterType', types: RELATE_TYPE, txt: _l('筛选方式'), default: 11 },
    { key: 'navshow', types: NAVSHOW_TYPE, txt: _l('显示项'), default: '0' },
  ],
};
export const CASCADER = {
  //选项
  keys: [35],
  data: [{ key: 'filterType', types: RELATE_TYPE, txt: _l('筛选方式'), default: 11 }],
};
export const getSetDefault = control => {
  let { controlId = '', type, sourceControlType } = control;
  let set = {
    controlId,
    dataType: type,
  };
  let data = {};
  [OPTIONS, OPTIONSOTHER, RELATES, CASCADER, AREA].forEach(o => {
    if (o.keys.includes(type) || o.keys.includes(sourceControlType)) {
      o.data.map(it => {
        data = {
          ...data,
          [it.key]: it.default,
        };
      });
    }
  });
  return {
    ...set,
    ...data,
  };
};

export const getSetHtmlData = type => {
  let data = [];
  type &&
    [OPTIONS, OPTIONSOTHER, RELATES, CASCADER, AREA].forEach(it => {
      if (it.keys.includes(type)) {
        it.data.map(o => {
          data.push({
            txt: o.txt,
            des: o.des,
            types: o.types,
            key: o.key,
          });
        });
      }
    });
  return data;
};

export const HIERARCHY_VIEW_TYPE = [
  {
    text: _l('横向显示'),
    value: '0',
    key: 'horizontal',
  },
  {
    text: _l('竖向显示'),
    value: '1',
    key: 'vertically',
  },
  {
    text: _l('混合显示'),
    value: '2',
    key: 'mix',
  },
  {
    text: _l('树形表格'),
    value: '3',
    key: 'tree',
  },
];

export const CONNECT_LINE_TYPE = [
  {
    text: _l('曲线'),
    value: '0',
  },
  {
    text: _l('直线'),
    value: '1',
  },
];

export const TREE_LINE_TYPE = [
  {
    text: _l('箭头'),
    value: '1',
  },
  {
    text: _l('加号'),
    value: '2',
  },
];

export const HIERARCHY_MIX_LEVEL = [
  {
    text: _l('2级'),
    value: '2',
  },
  {
    text: _l('3级'),
    value: '3',
  },
  {
    text: _l('4级'),
    value: '4',
  },
  {
    text: _l('5级'),
    value: '5',
  },
  {
    text: _l('6级'),
    value: '6',
  },
  {
    text: _l('7级'),
    value: '7',
  },
  {
    text: _l('8级'),
    value: '8',
  },
  {
    text: _l('9级'),
    value: '9',
  },
  {
    text: _l('10级'),
    value: '10',
  },
];
