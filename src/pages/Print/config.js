export const fromType = {
  PRINT: 'print', // 打印
  FORMSET: 'formSet', // 设置
};

export const printType = {
  WORKFLOW: 'workflow', // 工作流
  WORKSHEET: 'worksheet', //
};

export const typeForCon = {
  PREVIEW: 'preview',
  NEW: 'new', //新建||系统打印
  EDIT: 'edit',
};

export const TYPE_ACTION = {
  0: _l('发起人'),
  3: _l('填写人'),
  4: _l('审批人'),
  5: _l('通知人'),
};

export const TRIGGER_ACTION = {
  1: _l('新增'),
  2: _l('修改'),
};

export const OPERATION_LOG_ACTION = {
  0: _l('发起'),
  1: _l('提交'),
  2: _l('转交'),
  3: _l('查看'),
  4: _l('通过申请'),
  5: _l('否决申请'),
  8: _l('转审'),
  16: _l('审批前加签'),
  17: _l('通过申请并加签'),
  18: _l('修改申请内容'),
  22: _l('无需审批'),
};

export const DEFAULT_FONT_SIZE = 12;
export const MIDDLE_FONT_SIZE = 16;
export const MAX_FONT_SIZE = 18;

export const PRINT_TYPE = {
  SYS_PRINT: 0, // 系统打印
  WORD_PRINT: 2, // word模版打印
};

export const SYSTOPRINT = {
  ownerid: 'ownerAccountChecked',
  caid: 'createAccountChecked',
  ctime: 'createTimeChecked',
  utime: 'updateTimeChecked',
};

export const SYSTOPRINTTXT = {
  ownerAccount: _l('拥有者：'),
  createAccount: _l('创建者：'),
  createTime: _l('创建时间：'),
  updateTime: _l('最近修改时间：'),
};

export const UNPRINTCONTROL = [43]; //不支持打印的type 文本识别 43
