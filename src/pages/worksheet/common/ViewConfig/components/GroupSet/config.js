export const GROUP_OPEN_OPTIONS = [
  {
    value: '1',
    text: _l('展开第一个'),
  },
  {
    value: '2',
    text: _l('展开全部'),
  },
  {
    value: '3',
    text: _l('收起全部'),
  },
];

// 支持分组筛选的字段
export const VIEWCONTROL_CONDITION_TYPE = [
  9, // 9单选
  10, // 多选10
  11, // 11单选
  28, // 等级
  26, // 成员
  27, // 部门
  48, //组织角色
  29, // 关联表
];

//可能存在多选情况的字段类型
export const VIEWCONTROL_CONDITION_MULTI_TYPE = [
  10, // 多选
  29, // 关联表
  26, // 成员
  27, // 部门
  48, // 组织角色
];
