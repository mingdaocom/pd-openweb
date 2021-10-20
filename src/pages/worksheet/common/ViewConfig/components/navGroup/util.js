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
  // 19, // 地区 19'省23'省-市'24'省-市-县'
  // 23, // 地区 19'省23'省-市'24'省-市-县'
  // 24, // 地区 19'省23'省-市'24'省-市-县'
  // 21, // 自由连接
  // 22, // 分段
  // 25, // 大写金额
  // 26, // 成员
  // 27, // 部门
  // 28, // 等级
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
];

export const canNavGroup = (control, worksheetId) => {
  if (GROUPFILTER_CONDITION_TYPE.includes(control.type)) {
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
export const OPTIONS = {
  //选项
  key: 'isAsc',
  default: true,
  types: OPTIONS_TYPE,
  keys: [
    11, // 选项
    10, // 多选
    9, // 单选 平铺
  ],
  txt: '排序方式',
};

export const RELATES = {
  //选项
  key: 'viewId',
  keys: [29],
  // types: RELATE_TYPE,
  des: '当前选择为关联记录字段，可以继续选择关联表中的层级视图生成树状导航',
  txt: '层级视图',
};
export const getSetDefault = control => {
  let { controlId = '', type } = control;
  let set = {
    controlId,
    dataType: type,
  };
  let data = {};
  [OPTIONS, RELATES].map(o => {
    if (o.keys.includes(type)) {
      data = {
        [o.key]: o.default,
      };
    }
  });
  return {
    ...set,
    ...data,
  };
};

export const getSetHtmlData = type => {
  let data = {};
  type &&
    [OPTIONS, RELATES].map(o => {
      if (o.keys.includes(type)) {
        data = {
          txt: o.txt,
          des: o.des,
          types: o.types,
          key: o.key,
        };
      }
    });
  return data;
};
