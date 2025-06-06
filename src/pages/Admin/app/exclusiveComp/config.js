export const TYPE_LIST = [
  { label: _l('全部类型'), value: '' },
  { label: _l('工作表事件'), value: 1 },
  { label: _l('时间'), value: 2 },
  { label: _l('人员事件'), value: 9 },
  { label: _l('Webhook'), value: 6 },
  { label: _l('子流程'), value: 8 },
  { label: _l('自定义动作'), value: 7 },
  { label: _l('审批流程'), value: 11 },
  { label: _l('封装业务流程'), value: 10 },
];

export const COMPUTING_INSTANCE_STATUS = {
  Creating: 0,
  CreationFailed: 1,
  Running: 2,
  Starting: 3,
  Stopping: 4,
  Stopped: 5,
  Restarting: 6,
  Destroying: 7,
  Destroyed: 8,
  DestroyFailed: 9,
};

export const MIGRATE_CODE = {
  0: _l('迁移失败'),
  1: _l('开始迁移'),
  2: _l('应用状态错误（迁移中/维护中/升级中）'),
  3: _l('操作限制（1天一次）'),
  4: _l('应用不存在'),
  5: _l('专属数据库不存在'),
  6: _l('应用不属于专属数据库，不需要迁出'),
};
