export const TEXT = [2];
export const FILE = [14];
export const DATE = TEXT.concat([15, 16]);
export const CRED = TEXT.concat([7]);
export const NUMBER = TEXT.concat([6]);
export const MONEY = NUMBER.concat([8]);
export const OPTION = TEXT.concat([9, 11]);

const COMMON_MAP = [
  {
    text: _l('识别原件'),
    match: FILE,
    value: 1,
  },
  {
    text: _l('识别内容'),
    match: TEXT,
    value: 2,
  },
];

// 人像面
const PERSON = [
  {
    text: _l('身份证原件'),
    match: FILE,
    value: 1001,
  },
  {
    text: _l('姓名'),
    match: TEXT,
    value: 1005,
  },
  {
    text: _l('性别'),
    match: OPTION,
    value: 1006,
  },
  {
    text: _l('民族'),
    match: OPTION,
    value: 1007,
  },
  {
    text: _l('出生日期'),
    match: DATE,
    value: 1004,
  },
  {
    text: _l('身份证住址'),
    match: TEXT,
    value: 1002,
  },
  {
    text: _l('公民身份证号码'),
    match: CRED,
    value: 1003,
  },
];

const DETAIL = [
  {
    text: _l('货物或应税劳务/服务名称'),
    match: TEXT,
    value: 2023,
  },
  {
    text: _l('规格型号'),
    match: TEXT,
    value: 2024,
  },
  {
    text: _l('数量'),
    match: NUMBER,
    value: 2025,
  },
  {
    text: _l('单位'),
    match: TEXT,
    value: 2026,
  },
  {
    text: _l('金额'),
    match: MONEY,
    value: 2028,
  },
  {
    text: _l('单价'),
    match: MONEY,
    value: 2027,
  },
  {
    text: _l('税率'),
    match: MONEY,
    value: 2029,
  },
  {
    text: _l('税额'),
    match: MONEY,
    value: 2030,
  },
];

const ORIGIN = [
  {
    text: _l('增值税发票原件'),
    match: FILE,
    value: 2001,
  },
  {
    text: _l('发票类型'),
    match: TEXT,
    value: 2002,
  },
  {
    text: _l('发票名称'),
    match: TEXT,
    value: 2003,
  },
  {
    text: _l('发票代码'),
    match: NUMBER,
    value: 2004,
  },
  {
    text: _l('发票号码'),
    match: NUMBER,
    value: 2005,
  },
  {
    text: _l('开票日期'),
    match: DATE,
    value: 2006,
  },
  {
    text: _l('密码区'),
    match: TEXT,
    value: 2007,
  },
  {
    text: _l('购买方名称'),
    match: TEXT,
    value: 2008,
  },
  {
    text: _l('购买方纳税人识别号'),
    match: TEXT,
    value: 2009,
  },
  {
    text: _l('购买方地址/电话'),
    match: TEXT,
    value: 2031,
  },
  {
    text: _l('购买方开户行及账号'),
    match: TEXT,
    value: 2032,
  },
  {
    text: _l('销售方名称'),
    match: TEXT,
    value: 2011,
  },
  {
    text: _l('销售方纳税人识别号'),
    match: TEXT,
    value: 2013,
  },
  {
    text: _l('销售方地址/电话'),
    match: TEXT,
    value: 2010,
  },
  {
    text: _l('销售方开户行及账号'),
    match: TEXT,
    value: 2012,
  },
  {
    text: _l('合计金额'),
    match: MONEY,
    value: 2014,
  },
  {
    text: _l('合计税额'),
    match: MONEY,
    value: 2015,
  },
  {
    text: _l('价税合计（大写）'),
    match: TEXT,
    value: 2016,
  },
  {
    text: _l('价税合计（小写）'),
    match: MONEY,
    value: 2017,
  },
  {
    text: _l('备注'),
    match: TEXT,
    value: 2019,
  },
  {
    text: _l('收款人'),
    match: TEXT,
    value: 2020,
  },
  {
    text: _l('复核人'),
    match: TEXT,
    value: 2021,
  },
  {
    text: _l('开票人'),
    match: TEXT,
    value: 2022,
  },
];

export const COMMON = [{ items: COMMON_MAP, title: '' }];
export const ID_CARD = [
  {
    items: PERSON,
  },
];

export const INVOICE = [
  {
    items: ORIGIN,
  },
  {
    items: DETAIL,
    title: _l('发票明细'),
    withSubList: true,
  },
];

export const TEMPLATE_TYPE = [
  { icon: 'ocr', value: 1, id: 'COMMON', displayText: _l('文字'), text: _l('通用文字'), map: COMMON },
  {
    icon: 'ocr_id_card',
    value: 2,
    id: 'ID_CARD',
    displayText: _l('身份证'),
    text: _l('身份证'),
    map: ID_CARD,
  },
  {
    icon: 'ocr_invoice',
    value: 3,
    id: 'INVOICE',
    displayText: _l('增值税发票'),
    text: _l('增值税发票'),
    map: INVOICE,
  },
];
