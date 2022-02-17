import { isEmpty, head, pick } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { WHOLE_SIZE } from './Drag';

const getDefaultOptions = () => {
  return [
    { key: uuidv4(), value: _l('选项1'), isDeleted: false, index: 1, checked: true, color: '#2196F3' },
    { key: uuidv4(), value: _l('选项2'), isDeleted: false, index: 2, checked: false, color: '#08C9C9' },
    { key: uuidv4(), value: _l('选项3'), isDeleted: false, index: 3, checked: false, color: '#00C345' },
  ];
};

const getDefaultCheckedOption = options => {
  if (isEmpty(options)) return '';
  return JSON.stringify([head(options).key]);
};

const genDefaultOptionsAndChecked = () => {
  const defaultOptions = getDefaultOptions();
  return { options: defaultOptions, default: getDefaultCheckedOption(defaultOptions) };
};

// 控件和后端类型的对应关系
export const WIDGETS_TO_API_TYPE_ENUM = {
  TEXT: 2,
  MOBILE_PHONE: 3,
  TELEPHONE: 4,
  EMAIL: 5,
  NUMBER: 6,
  CRED: 7,
  MONEY: 8,
  FLAT_MENU: 9,
  MULTI_SELECT: 10,
  DROP_DOWN: 11,
  ATTACHMENT: 14,
  DATE: 15,
  DATE_TIME: 16,
  AREA_PROVINCE: 19,
  RELATION: 21,
  SPLIT_LINE: 22,
  AREA_CITY: 23,
  AREA_COUNTY: 24,
  MONEY_CN: 25,
  USER_PICKER: 26,
  DEPARTMENT: 27,
  SCORE: 28,
  RELATE_SHEET: 29,
  SHEET_FIELD: 30,
  FORMULA_NUMBER: 31,
  CONCATENATE: 32,
  AUTO_ID: 33,
  SUB_LIST: 34,
  CASCADER: 35,
  SWITCH: 36,
  SUBTOTAL: 37,
  FORMULA_DATE: 38,
  LOCATION: 40,
  RICH_TEXT: 41,
  SIGNATURE: 42,
  OCR: 43,
  EMBED: 45,
  REMARK: 10010,
};

export const DEFAULT_CONFIG = {
  TEXT: {
    widgetName: _l('文本'),
    icon: 'letter_a',
    defaultHint: _l('填写文本内容'),
    intro: _l('可设为单行或多行，可输入http链接'),
  },
  MOBILE_PHONE: {
    icon: 'call',
    widgetName: _l('电话'),
    intro: _l('可设为手机 或 座机，并验证格式'),
    defaultHint: _l('填写手机号码'),
  },
  TELEPHONE: {
    icon: 'call',
    widgetName: _l('电话'),
    intro: _l('可设为手机 或 座机，并验证格式'),
    defaultHint: _l('填写座机号码'),
  },
  EMAIL: {
    icon: 'email',
    widgetName: _l('邮箱'),
    defaultHint: _l('填写邮箱'),
    intro: _l('输入邮箱，并验证格式'),
  },
  NUMBER: {
    icon: 'number_6',
    widgetName: _l('数值'),
    defaultHint: _l('填写数值'),
    intro: _l('最大支持输入16位数字'),
  },
  CRED: {
    icon: 'id_number',
    widgetName: _l('证件'),
    intro: _l('可以验证身份证、护照、港澳台通行证'),
  },
  MONEY: {
    icon: 'amount_rmb',
    widgetName: _l('金额'),
    defaultHint: _l('填写金额'),
    intro: _l('输入货币金额，可设置货币格式'),
  },
  FLAT_MENU: {
    icon: 'arrow_drop_down_circle',
    widgetName: _l('单选'),
    intro: _l('从预设的下拉菜单中选择一项，可设为将选项平铺'),
  },
  MULTI_SELECT: {
    icon: 'multi_select',
    widgetName: _l('多选'),
    intro: _l('从预设的选项中选择一项或者多项'),
  },
  DROP_DOWN: {
    icon: 'arrow_drop_down_circle',
    widgetName: _l('单选'),
    intro: _l('从预设的下拉菜单中选择一项，可设为将选项平铺'),
  },
  ATTACHMENT: {
    icon: 'attachment',
    widgetName: _l('附件'),
    intro: _l('可以添加图片、文档'),
    minSize: WHOLE_SIZE,
  },
  DATE: {
    icon: 'event',
    widgetName: _l('日期'),
    intro: _l('可设为日期 或 日期+时间'),
  },
  DATE_TIME: {
    icon: 'event',
    widgetName: _l('日期'),
    intro: _l('可设为日期 或 日期+时间'),
  },
  AREA_PROVINCE: { icon: 'map', widgetName: _l('地区'), intro: _l('从预设的地址中进行选择') },
  RELATION: {
    icon: 'device_hub',
    widgetName: _l('自由连接'),
    intro: _l(
      '引用项目、任务、日程、审批单等。例：一个“产品更新”记录可以添加多个“需求”任务，由于只是引用，不会影响被引用的对象本身',
    ),
    moreIntroLink: 'https://help.mingdao.com/sheet2.html',
    tip: _l(
      '可添加其他项目、任务、文件、审批单等，以卡片(引用链接)形式展示出来。例：一个“产品更新”任务可添加多个“需求”任务卡片，由于只是引用，不会影响被引用的任务本身的子母任务结构',
    ),
    minSize: WHOLE_SIZE,
  },
  SPLIT_LINE: {
    icon: 'menu',
    widgetName: _l('分段'),
    intro: _l('对表单进行分段'),
    minSize: WHOLE_SIZE,
  },
  AREA_CITY: { icon: 'map', widgetName: _l('地区'), intro: _l('从预设的地址中进行选择') },
  AREA_COUNTY: { icon: 'map', widgetName: _l('地区'), intro: _l('从预设的地址中进行选择') },
  MONEY_CN: {
    icon: 'amount_capital',
    widgetName: _l('大写金额'),
    intro: _l('关联金额控件后可以自动将填写的金额显示成大写金额'),
    moreIntroLink: 'https://help.mingdao.com/sheet2.html',
  },
  USER_PICKER: {
    icon: 'account_circle',
    widgetName: _l('成员'),
    intro: _l('加入的成员将收到通知并允许查看记录。还可以通过角色来控制权限'),
    moreIntroLink: 'https://help.mingdao.com/sheet2.html',
  },
  DEPARTMENT: { icon: 'department', widgetName: _l('部门'), intro: _l('选择组织中的部门') },
  SCORE: { icon: 'star', widgetName: _l('等级'), intro: _l('标记为5星或10级') },
  RELATE_SHEET: {
    icon: 'link_record',
    widgetName: _l('关联记录'),
    intro: _l('关联相关工作表，可以从中引用或创建记录，如：订单关联商品'),
    moreIntroLink: 'https://help.mingdao.com/sheet2.html',
    tip: _l(
      '关联多个工作表，联动数据，以反映实际业务关系。例如:《订单》表中，每个订单的“客户”字段从关联的《客户》表里选择1条“客户”记录来填入。',
    ),
  },
  SHEET_FIELD: { icon: 'lookup', widgetName: _l('他表字段'), intro: _l('从关联的记录中选择字段显示在当前表中') },
  CONCATENATE: {
    icon: 'category',
    widgetName: _l('文本组合'),
    intro: _l('将当前记录中的字段进行组合'),
  },
  AUTO_ID: {
    icon: 'auto_number',
    widgetName: _l('自动编号'),
    intro: _l('为每条记录生成自定义规则的编号'),
  },
  SUB_LIST: {
    icon: 'table',
    widgetName: _l('子表'),
    intro: _l('支持在表单中一次填入多条信息、比如一次填写多条费用明细'),
    minSize: WHOLE_SIZE,
  },
  SWITCH: { icon: 'checkbox_01', widgetName: _l('检查框'), intro: _l('可以选中或取消选中') },
  SUBTOTAL: {
    icon: 'sigma',
    widgetName: _l('汇总'),
    intro: _l('汇总关联记录或子表中的数据，如：汇总订单明细中的商品总价，最大支持汇总1000行数据。'),
    moreIntroLink: 'https://help.mingdao.com/sheet2.html',
  },
  FORMULA_NUMBER: {
    icon: 'formula',
    widgetName: _l('公式'),
    intro: _l('将当前记录中的字段进行数值或日期计算'),
  },
  FORMULA_DATE: {
    icon: 'formula',
    widgetName: _l('公式'),
    intro: _l('将当前记录中的字段进行数值或日期计算'),
  },
  LOCATION: {
    icon: 'location_on',
    widgetName: _l('定位'),
    defaultHint: _l('在此添加 注意事项 或 填写要求 等，来指导使用者(或填写者)正确地操作'),
    tip: _l('把注意事项或填写要求作为“备注”加入，来指导使用者(或填写者)正确使用'),
    intro: _l('可通过定位输入地理位置'),
  },
  RICH_TEXT: {
    icon: 'rich_text',
    widgetName: _l('富文本'),
    defaultHint: _l('在此添加 注意事项 或 填写要求 等，来指导使用者(或填写者)正确地操作'),
    tip: _l('把注意事项或填写要求作为“备注”加入，来指导使用者(或填写者)正确使用'),
    intro: _l('可控制文本样式，添加图片'),
    minSize: WHOLE_SIZE,
  },
  SIGNATURE: {
    icon: 'gesture',
    widgetName: _l('签名'),
    defaultHint: _l('在此添加 注意事项 或 填写要求 等，来指导使用者(或填写者)正确地操作'),
    tip: _l('把注意事项或填写要求作为“备注”加入，来指导使用者(或填写者)正确使用'),
    intro: _l('通过签名确定签名人身份'),
  },
  CASCADER: {
    icon: 'cascade_selection',
    widgetName: _l('级联选择'),
    intro: _l('以层级视图作为数据源来选择目标表的记录,仅支持本表关联'),
    moreIntroLink: 'https://help.mingdao.com/sheet2.html',
  },
  OCR: {
    icon: 'ocr',
    widgetName: _l('文本识别'),
    intro: _l('识别输入图片，将识别结果填充到对应字段。'),
    moreIntroLink: 'https://help.mingdao.com/sheet2.html',
  },
  REMARK: {
    widgetName: _l('备注'),
    icon: 'info',
    defaultHint: _l('在此添加 注意事项 或 填写要求 等，来指导使用者(或填写者)正确地操作'),
    tip: _l('把注意事项或填写要求作为“备注”加入，来指导使用者(或填写者)正确使用'),
    intro: _l('在表单中添加说明信息'),
    minSize: WHOLE_SIZE,
  },
  EMBED: {
    widgetName: _l('嵌入'),
    icon: 'code',
    intro: _l('在表单中嵌入URL，支持使用其他字段值传参'),
  },
};

export const DEFAULT_DATA = {
  TEXT: {
    controlName: _l('文本'),
    size: 12,
    enumDefault: 2,
    hint: _l('请填写文本内容'),
  },
  MOBILE_PHONE: {
    controlName: _l('手机'),
    size: 6,
    enumDefault: 1,
    hint: _l('请填写手机号码'),
    advancedSetting: {
      defaultarea: '{"name":"China (中国)","iso2":"cn","dialCode":"86"}',
      commcountries:
        '[{"name":"China (中国)","iso2":"cn","dialCode":"86"},{"name":"Hong Kong (香港)","iso2":"hk","dialCode":"852"},{"name":"Taiwan (台灣)","iso2":"tw","dialCode":"886"},{"name":"Macau (澳門)","iso2":"mo","dialCode":"853"},{"name":"Singapore","iso2":"sg","dialCode":"65"},{"name":"Malaysia","iso2":"my","dialCode":"60"},{"name":"Japan (日本)","iso2":"jp","dialCode":"81"},{"name":"South Korea (대한민국)","iso2":"kr","dialCode":"82"},{"name":"United States","iso2":"us","dialCode":"1"},{"name":"United Kingdom","iso2":"gb","dialCode":"44"},{"name":"France","iso2":"fr","dialCode":"33"},{"name":"Germany (Deutschland)","iso2":"de","dialCode":"49"},{"name":"Russia (Россия)","iso2":"ru","dialCode":"7"}]',
    },
  },
  TELEPHONE: {
    controlName: _l('座机'),
    size: 6,
    hint: _l('请填写座机号码'),
  },
  EMAIL: {
    controlName: _l('邮箱'),
    size: 6,
    hint: _l('请填写邮箱地址'),
  },
  NUMBER: {
    controlName: _l('数值'),
    size: 6,
    dot: 0,
    hint: _l('请填写数值'),
  },
  CRED: {
    controlName: _l('证件'),
    size: 6,
    enumDefault: 1,
    hint: _l('请填写身份证'),
  },
  MONEY: {
    controlName: _l('金额'),
    size: 6,
    enumDefault: 0,
    enumDefault2: 2,
    unit: _l('元'),
    dot: 2,
    hint: _l('请填写金额'),
    advancedSetting: {
      suffix: _l('元'),
    },
  },
  FLAT_MENU: {
    ...genDefaultOptionsAndChecked(),
    controlName: _l('单选'),
    size: 12,
    enumDefault2: 1,
  },
  MULTI_SELECT: {
    ...genDefaultOptionsAndChecked(),
    controlName: _l('多选'),
    size: 12,
    enumDefault2: 1,
    advancedSetting: {
      direction: '0',
    },
  },
  DROP_DOWN: {
    ...genDefaultOptionsAndChecked(),
    controlName: _l('单选'),
    size: 6,
    enumDefault2: 1,
  },
  ATTACHMENT: {
    controlName: _l('附件'),
    size: 12,
  },
  DATE: {
    controlName: _l('日期'),
    size: 6,
    hint: _l('请选择日期'),
  },
  DATE_TIME: {
    controlName: _l('日期'),
    size: 6,
    hint: _l('请选择日期'),
  },
  AREA_PROVINCE: {
    controlName: _l('地区'),
    size: 6,
  },
  RELATION: {
    controlName: _l('自由连接'),
    size: 12,
    enumDefault: 0,
  },
  SPLIT_LINE: {
    controlName: _l(''),
    size: 12,
  },
  AREA_CITY: {
    controlName: _l('地区'),
    size: 6,
  },
  AREA_COUNTY: {
    controlName: _l('地区'),
    size: 6,
  },
  MONEY_CN: {
    controlName: _l('大写金额'),
    size: 6,
  },
  USER_PICKER: {
    controlName: _l('成员'),
    size: 6,
    hint: _l('请选择成员'),
    enumDefault: 0,
    userPermission: 1,
    noticeItem: 1,
  },
  DEPARTMENT: {
    controlName: _l('部门'),
    size: 6,
    enumDefault: 0,
  },
  SCORE: {
    controlName: _l('等级'),
    size: 6,
    enumDefault: 1,
  },
  RELATE_SHEET: {
    controlName: _l('关联记录'),
    size: 12,
    strDefault: '000',
    enumDefault: 1,
    enumDefault2: 0,
  },
  SHEET_FIELD: {
    controlName: _l('他表字段'),
    size: 6,
    enumDefault: 1,
    dataSource: '',
    sourceControlId: '', // 字段id
  },
  CONCATENATE: {
    controlName: _l('文本组合'),
    size: 12,
  },
  AUTO_ID: {
    advancedSetting: {
      increase: '[{"type":1,"repeatType":0,"start":null,"length":0,"format":""}]',
    },
    controlName: _l('自动编号'),
    size: 6,
    enumDefault: 0,
  },
  SUB_LIST: {
    controlName: _l('子表'),
    size: 12,
    enumDefault: 2,
    advancedSetting: {
      allowadd: '1',
      allowcancel: '1',
      allowedit: '1',
      allowsingle: '1',
    },
  },
  SWITCH: {
    controlName: _l('检查框'),
    size: 6,
    advancedSetting: {
      defsource: '[{"cid":"","rcid":"","staticValue":"0"}]',
    },
  },
  SUBTOTAL: {
    controlName: _l('汇总'),
    size: 6,
    enumDefault: 6,
    enumDefault2: 6,
  },
  FORMULA_NUMBER: {
    controlName: _l('公式'),
    size: 6,
    dot: 2,
  },
  FORMULA_DATE: {
    controlName: _l('日期公式'),
    size: 6,
    advancedSetting: {
      dateformulatype: '1',
    },
  },
  LOCATION: {
    controlName: _l('定位'),
    size: 6,
    enumDefault2: 0,
  },
  RICH_TEXT: {
    controlName: _l('富文本'),
    size: 12,
  },
  SIGNATURE: {
    controlName: _l('签名'),
    size: 6,
  },
  CASCADER: {
    controlName: _l('级联选择'),
    size: 6,
  },
  REMARK: {
    size: 12,
    controlName: _l(''),
  },
  OCR: {
    size: 6,
    controlName: _l('文本识别'),
  },
  EMBED: {
    size: 12,
    controlName: _l('嵌入'),
    hint: _l('编辑状态下不支持查看'),
    enumDefault: 1,
    advancedSetting: {
      height: 400,
    },
  },
};

export const SYSTEM_DATE_CONTROL = [
  {
    controlId: 'ctime',
    controlName: _l('创建时间'),
    controlPermissions: '100',
    type: 16,
    display: true,
  },
  {
    controlId: 'utime',
    controlName: _l('最近修改时间'),
    controlPermissions: '100',
    type: 16,
    display: true,
  },
];
export const SYSTEM_CONTROL = [
  {
    controlId: 'ownerid',
    controlName: _l('拥有者'),
    controlPermissions: '111',
    type: 26,
    enumDefault: 0,
    display: true,
  },
  {
    controlId: 'caid',
    controlName: _l('创建者'),
    controlPermissions: '100',
    type: 26,
    display: true,
  },
  ...SYSTEM_DATE_CONTROL,
];

// 表单内需要排除的系统字段
export const FORM_HIDDEN_CONTROL_IDS = ['ownerid', 'caid', 'ctime', 'utime', 'daid', 'uaid'];

// 系统字段
export const SYS = SYSTEM_CONTROL.map(o => o.controlId);

export const COMMON_USE_WIDGETS = pick(DEFAULT_CONFIG, [
  'TEXT',
  'NUMBER',
  'MONEY',
  'EMAIL',
  'DATE',
  // 'DATE_TIME_RANGE',
  'MOBILE_PHONE',
  'DROP_DOWN',
  'MULTI_SELECT',
  'USER_PICKER',
  'ATTACHMENT',
  'AREA_COUNTY',
  'LOCATION',
]);

export const ADVANCE_WIDGETS = pick(DEFAULT_CONFIG, [
  'FORMULA_NUMBER',
  'SWITCH',
  'SCORE',
  'CONCATENATE',
  'AUTO_ID',
  'RICH_TEXT',
  'CRED',
  'DEPARTMENT',
  'SIGNATURE',
  'OCR',
]);

export const RELATE_WIDGETS = pick(DEFAULT_CONFIG, ['RELATE_SHEET', 'SUB_LIST', 'CASCADER', 'SHEET_FIELD', 'SUBTOTAL']);

export const SPECIAL_WIDGETS = pick(DEFAULT_CONFIG, ['SPLIT_LINE', 'REMARK', 'RELATION', 'MONEY_CN', 'EMBED']);

export const WIDGET_GROUP_TYPE = {
  COMMON_USE: { widgets: COMMON_USE_WIDGETS, title: _l('常用控件') },
  ADVANCE: { widgets: ADVANCE_WIDGETS, title: _l('高级控件') },
  RELATE: { widgets: RELATE_WIDGETS, title: _l('关联') },
  SPECIAL: { widgets: SPECIAL_WIDGETS, title: _l('特殊控件') },
};
