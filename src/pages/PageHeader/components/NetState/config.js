export const MODULE_NUMBER_TO_TYPE = {
  10: 'app',
  20: 'worksheet',
  21: 'sheetRecord',
  22: 'sheetRecordTotal',
  40: 'project',
  80: 'ocr',
  90: 'portaluser', //超人数
  100: 'portalupgrade',
};

export const VERSION = {
  // 免费
  0: 'overdue',
  // 正式版
  1: {
    0: 'singleApp',
    1: 'team',
    2: 'company',
    3: 'topLevel',
  },
  // 试用
  2: 'experience',
};

// 个人
export const INDIVIDUAL_NET_TEXT = {
  app: {
    hint: _l('应用数量已达到最大值'),
    explain: _l('个人最多可创建3个应用，请使用标准版或更高版本以创建更多应用'),
  },
  worksheet: {
    hint: _l('应用下工作表数量已达到最大值'),
    explain: _l('个人下单个应用中最多可创建3个工作表，请使用标准版或更高版本以创建更多工作表'),
  },
  sheetRecord: {
    hint: _l('工作表行记录数量已达到最大值'),
    explain: _l('个人下单个工作表中最多可创建1000条行记录，请使用标准版或更高版本以创建更多行记录'),
  },
  project: {
    hint: _l('项目数量已达到最大值'),
    explain: _l('个人最多可创建5个项目，请使用标准版或更高版本以创建更多项目'),
  },
};

// 付费的版本
export const PAID_VERSION_TO_TEXT = {
  // 标准版
  team: {
    app: {
      hint: _l('应用数量已达到最大值'),
      explain: _l('当前版本最多可以创建5个应用，请购买应用扩展包或升级到更高版本'),
      btnText: _l('购买应用拓展包'),
      operationText: _l('升级版本'),
    },
    worksheet: {
      hint: _l('工作表数量已达到最大值'),
      explain: _l('标准版最多可创建100个工作表，请升级版本以创建更多工作表'),
      btnText: _l('立即升级'),
    },
    sheetRecord: {
      hint: _l('工作表行记录数量已达到最大值'),
      explain: _l('标准版单个工作表下最多可创建10万条行记录，请升级版本以创建更多行记录'),
      btnText: _l('立即升级'),
    },
    portaluser: {
      hint: _l('外部用户人数额度不足'),
      explain: _l('外部用户人数已达到上限，请购买外部用户扩充包'),
      btnText: _l('购买外部用户扩充包'),
    },
    portalupgrade: {
      hint: _l('账号余额不足'),
      explain: _l('当前企业账号余额不足，无法通过短信通知用户，请先充值'),
      btnText: _l('立即充值'),
    },
  },

  // 专业版
  company: {
    app: {
      hint: _l('应用数量已达到最大值'),
      explain: _l('当前版本最多可以创建10个应用，请购买应用扩展包或升级到更高版本'),
      btnText: _l('购买应用拓展包'),
      operationText: _l('升级版本'),
    },
    worksheet: {
      hint: _l('应用下工作表数量已达到最大值'),
      explain: _l('专业版单个应用下最多可创建30个工作表，请升级版本以创建更多工作表'),
      btnText: _l('立即升级'),
    },
    sheetRecord: {
      hint: _l('工作表行记录数量已达到最大值'),
      explain: _l('专业版单个工作表下最多可创建100万条行记录，请升级版本以创建更多行记录'),
      btnText: _l('立即升级'),
    },
    portaluser: {
      hint: _l('外部用户人数额度不足'),
      explain: _l('外部用户人数已达到上限，请购买外部用户扩充包'),
      btnText: _l('购买外部用户扩充包'),
    },
    portalupgrade: {
      hint: _l('账号余额不足'),
      explain: _l('当前企业账号余额不足，无法通过短信通知用户，请先充值'),
      btnText: _l('立即充值'),
    },
  },
  // 旗舰版
  topLevel: {
    app: {
      hint: _l('应用数量已达到最大值'),
      explain: _l('当前版本最多可创建30个应用，请升级版本'),
      btnText: _l('购买应用拓展包'),
    },
    worksheet: {
      hint: _l('应用下工作表数量已达到最大值'),
      explain: _l('当前版本最多可创建100个工作表，请升级版本'),
      btnText: _l('010-53103053 转 1'),
    },
    sheetRecord: {
      hint: _l('工作表行记录数量已达到最大值'),
      explain: _l('当前版本工作表下最多可创建10万条行记录，请升级版本'),
      btnText: _l('010-53103053 转 1'),
    },
    portaluser: {
      hint: _l('外部用户人数额度不足'),
      explain: _l('外部用户人数已达到上限，请购买外部用户扩充包'),
      btnText: _l('购买外部用户扩充包'),
    },
    portalupgrade: {
      hint: _l('账号余额不足'),
      explain: _l('当前企业账号余额不足，无法通过短信通知用户，请先充值'),
      btnText: _l('立即充值'),
    },
  },

  // 单应用版
  singleApp: {
    app: {
      hint: _l('当前版本的应用数已达上限'),
      explain: _l('当前版本最多只能存在1个应用，请联系顾问提供支持'),
    },
    worksheet: {
      hint: _l('工作表数量已达到最大值'),
      explain: _l('当前版本最多可创建50个工作表，请联系顾问提供支持'),
    },
    sheetRecord: {
      hint: _l('工作表行记录数量已达到最大值'),
      explain: _l('当前版本工作表下最多可创建10万条行记录，请联系顾问提供支持'),
    },
    portaluser: {
      hint: _l('外部用户人数额度不足'),
      explain: _l('外部用户人数已达到上限，请购买外部用户扩充包'),
      btnText: _l('购买外部用户扩充包'),
    },
    portalupgrade: {
      hint: _l('账号余额不足'),
      explain: _l('当前企业账号余额不足，无法通过短信通知用户，请先充值'),
      btnText: _l('立即充值'),
    },
  },
};

// 体验专业版
export const EXPERIENCE_VERSION_TO_TEXT = {
  app: {
    hint: _l('应用数量已达到最大值'),
    explain: _l('专业版 (试用) 最多可以创建10个应用，请付费升级正式版以扩展更多用量'),
    btnText: _l('立即购买'),
  },
  worksheet: {
    hint: _l('应用下工作表数量已达到最大值'),
    explain: _l('专业版 (试用) 单个应用下最多可创建30个工作表，请付费升级正式版以扩展更多用量'),
    btnText: _l('立即购买'),
  },
  sheetRecord: {
    hint: _l('工作表行记录数量已达到最大值'),
    explain: _l('专业版 (试用) 单个工作表下最多可创建100万条行记录，请付费升级正式版以扩展更多用量'),
    btnText: _l('立即购买'),
  },
  portaluser: {
    hint: _l('外部用户人数额度不足'),
    explain: _l('外部用户人数已达到上限，请购买付费版本'),
    btnText: _l('立即购买'),
  },
  portalupgrade: {
    hint: _l('账号余额不足'),
    explain: _l('当前企业账号余额不足，无法通过短信通知用户，请先充值'),
    btnText: _l('立即充值'),
  },
};

// 免费版
export const OVERDUE_NET_TEXT = {
  worksheet: {
    hint: _l('工作表数量已达到最大值'),
    explain: _l('免费版最多可创建100个工作表，请升级版本以创建更多工作表'),
    btnText: _l('立即购买'),
  },
  sheetRecordTotal: {
    hint: _l('工作表总行记录数量已达到最大值'),
    explain: _l('免费版最多可创建5万条行记录，请升级以继续'),
    btnText: _l('立即购买'),
  },
  sheetRecord: {
    hint: _l('单个工作表行记录数量已达到最大值'),
    explain: _l('免费版最多可创建1万条行记录，请升级以继续'),
    btnText: _l('立即购买'),
  },
  portaluser: {
    hint: _l('外部用户人数额度不足'),
    explain: _l('外部用户人数已达到上限，请购买付费版本'),
    btnText: _l('立即购买'),
  },
  portalupgrade: {
    hint: _l('账号余额不足'),
    explain: _l('当前企业账号余额不足，无法通过短信通知用户，请先充值'),
    btnText: _l('立即充值'),
  },
};

// 通用能力
export const COMMON = {
  ocr: {
    hint: _l('余额不足，请联系管理员充值'),
    btnText: _l('立即充值'),
  },
};
