export const fromType = {
  PRINT: 'print', // 打印
  FORM_SET: 'formSet', // 设置
};

export const printType = {
  WORKFLOW: 'flow', // 工作流
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
  9: _l('添加审批人'),
  10: _l('被移除'),
  13: _l('撤回后重新发起'),
  16: _l('审批前加签'),
  17: _l('通过申请并加签'),
  18: _l('修改申请内容'),
  19: _l('撤回后重新发起'),
  22: _l('无需审批'),
};

export const DEFAULT_FONT_SIZE = 12;
export const MIDDLE_FONT_SIZE = 16;
export const MAX_FONT_SIZE = 18;

export const PRINT_TYPE = {
  SYS_PRINT: 0, // 系统打印
  WORD_PRINT: 2, // word模版打印
  EXCEL_PRINT: 5, // excel打印
  QR_CODE_PRINT: 3, // 二维码打印
  BAR_CODE_PRINT: 4, // 条码打印
};

export const PRINT_TEMP = {
  SYS_PRINT: 0,
  WORD_PRINT: 0,
  EXCEL_PRINT: 0,
  QR_CODE_PRINT: 1,
  BAR_CODE_PRINT: 2,
};

export const SYST_PRINT = {
  ownerid: 'ownerAccountChecked',
  caid: 'createAccountChecked',
  ctime: 'createTimeChecked',
  utime: 'updateTimeChecked',
  uaid: 'updateAccountChecked',
};

export const SYST_PRINT_TXT = {
  ownerAccount: _l('拥有者：'),
  createAccount: _l('创建人：'),
  createTime: _l('创建时间：'),
  updateTime: _l('最近修改时间：'),
  updateAccount: _l('最近修改人：'),
};

export const UN_PRINT_CONTROL = [43]; //不支持打印的type 文本识别 43

//打印不支持的系统字段
export const FILTER_SYS = [
  'rowid',
  // 'ownerid',
  // 'caid',
  // 'ctime',
  // 'utime',
  'uaid',
  'wfname',
  'wfcuaids',
  'wfcaid',
  'wfctime',
  'wfrtime',
  'wfftime',
  'wfstatus',
];

export const APPROVAL_SYS = [
  {
    name: _l('节点名称'),
    key: 'nodeName',
  },
  {
    name: _l('负责人'),
    key: 'operationUser',
  },
  {
    name: _l('操作'),
    key: 'operation',
  },
  {
    name: _l('操作时间'),
    key: 'operationTime',
  },
  {
    name: _l('审批意见'),
    key: 'opinion',
  },
  {
    name: _l('签名'),
    key: 'signature',
  },
];

export const PRINT_TYPE_STYLE = {
  [PRINT_TYPE.WORD_PRINT]: {
    icon: 'new_word',
    background: '#2196f3 0% 0% no-repeat padding-box',
    text: _l('Word 模板'),
    fileIcon: 'fileIcon-word',
  }, // word模版打印
  [PRINT_TYPE.EXCEL_PRINT]: {
    icon: 'new_excel',
    background: '#4CAF50',
    text: _l('Excel 模板'),
    fileIcon: 'fileIcon-excel',
  }, // excel打印
};

export const APPROVAL_POSITION_OPTION = [
  {
    value: 0,
    text: _l('在明细内显示'),
  },
  {
    value: 1,
    text: _l('在明细表下方显示'),
  },
];

export const DefaultNameWidth = 80;

export const TitleFont = {
  small: 15,
  middle: 18,
  big: 21,
};

export const RecordTitleFont = {
  small: 18,
  middle: 24,
  big: 30,
};

export const FONT_STYLE = {
  12: 'small',
  16: 'middle',
  18: 'big',
};

export const FONT_OPTION = [
  {
    label: _l('标准'),
    fontSize: DEFAULT_FONT_SIZE,
  },
  {
    label: _l('中'),
    fontSize: MIDDLE_FONT_SIZE,
  },
  {
    label: _l('大'),
    fontSize: MAX_FONT_SIZE,
  },
];

export const POSITION_OPTION = [
  {
    label: _l('左'),
    value: '1',
  },
  {
    label: _l('中'),
    value: '0',
  },
];

export const PRINT_FILE_OPTIONS = [
  {
    text: _l('缩略图'),
    value: '0',
    tips: _l('仅图片类型支持按缩略图打印，非图片类型会在最后以文件名显示'),
  },
  {
    text: _l('名称'),
    value: '1',
  },
];

export const USER_CONTROLS = [
  {
    controlId: 'jobNumber',
    controlName: _l('工号'),
  },
  {
    controlId: 'email',
    controlName: _l('邮箱'),
  },
  {
    controlId: 'mobilePhone',
    controlName: _l('手机号'),
  },
];

export const TIME_FORMAT = {
  utime: 'updateTime',
  ctime: 'createTime',
};
