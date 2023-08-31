import { isEmpty, head, pick } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { WHOLE_SIZE } from './Drag';
import { NUM_5_SETTINGS } from './score';

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
  TIME: 46,
  BAR_CODE: 47,
  ORG_ROLE: 48,
  SEARCH_BTN: 49,
  SEARCH: 50,
  RELATION_SEARCH: 51,
  SECTION: 52,
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
    moreIntroLink: 'https://help.mingdao.com/sheet21',
  },
  MULTI_SELECT: {
    icon: 'multi_select',
    widgetName: _l('多选'),
    intro: _l('从预设的选项中选择一项或者多项'),
    moreIntroLink: 'https://help.mingdao.com/sheet21',
  },
  DROP_DOWN: {
    icon: 'arrow_drop_down_circle',
    widgetName: _l('单选'),
    intro: _l('从预设的下拉菜单中选择一项，可设为将选项平铺'),
    moreIntroLink: 'https://help.mingdao.com/sheet21',
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
  AREA_PROVINCE: {
    icon: 'map',
    widgetName: _l('地区'),
    intro: _l('从预设的地址中进行选择'),
    moreIntroLink: 'https://help.mingdao.com/diqu',
  },
  RELATION: {
    icon: 'device_hub',
    widgetName: _l('自由连接%04008'),
    intro: _l(
      '引用项目、任务、日程、审批单等。例：一个“产品更新”记录可以添加多个“需求”任务，由于只是引用，不会影响被引用的对象本身',
    ),
    moreIntroLink: 'https://help.mingdao.com/sheet2',
    tip: _l(
      '可添加其他项目、任务、文件、审批单等，以卡片(引用链接)形式展示出来。例：一个“产品更新”任务可添加多个“需求”任务卡片，由于只是引用，不会影响被引用的任务本身的子母任务结构',
    ),
    minSize: WHOLE_SIZE,
  },
  SPLIT_LINE: {
    icon: 'menu',
    widgetName: _l('分段%04006'),
    intro: _l('对表单进行分段'),
    minSize: WHOLE_SIZE,
  },
  AREA_CITY: {
    icon: 'map',
    widgetName: _l('地区'),
    intro: _l('从预设的地址中进行选择'),
    moreIntroLink: 'https://help.mingdao.com/diqu',
  },
  AREA_COUNTY: {
    icon: 'map',
    widgetName: _l('地区'),
    intro: _l('从预设的地址中进行选择'),
    moreIntroLink: 'https://help.mingdao.com/diqu',
  },
  MONEY_CN: {
    icon: 'amount_capital',
    widgetName: _l('大写金额%04009'),
    intro: _l('关联金额控件后可以自动将填写的金额显示成大写金额'),
    moreIntroLink: 'https://help.mingdao.com/sheet2',
  },
  USER_PICKER: {
    icon: 'account_circle',
    widgetName: _l('成员'),
    intro: _l('加入的成员将收到通知并允许查看记录。还可以通过角色来控制权限'),
    moreIntroLink: 'https://help.mingdao.com/sheet27',
  },
  DEPARTMENT: { icon: 'department', widgetName: _l('部门'), intro: _l('选择组织中的部门') },
  SCORE: { icon: 'star', widgetName: _l('等级'), intro: _l('可输入1～10的数值') },
  RELATE_SHEET: {
    icon: 'link_record',
    widgetName: _l('关联记录%04001'),
    intro: _l('关联相关工作表，可以从中引用或创建记录，如：订单关联商品'),
    moreIntroLink: 'https://help.mingdao.com/sheet11',
    tip: _l(
      '关联多个工作表，联动数据，以反映实际业务关系。例如:《订单》表中，每个订单的“客户”字段从关联的《客户》表里选择1条“客户”记录来填入。',
    ),
  },
  SHEET_FIELD: {
    icon: 'lookup',
    widgetName: _l('他表字段%04004'),
    intro: _l('从关联的记录中选择字段显示在当前表中'),
    moreIntroLink: 'https://help.mingdao.com/sheet17',
  },
  CONCATENATE: {
    icon: 'category',
    widgetName: _l('文本组合%04000'),
    intro: _l('将当前记录中的字段进行组合'),
    moreIntroLink: 'https://help.mingdao.com/sheet10',
  },
  AUTO_ID: {
    icon: 'auto_number',
    widgetName: _l('自动编号'),
    intro: _l('为每条记录生成自定义规则的编号'),
    moreIntroLink: 'https://help.mingdao.com/sheet15',
  },
  SUB_LIST: {
    icon: 'table',
    widgetName: _l('子表%04002'),
    intro: _l('支持在表单中一次填入多条信息、比如一次填写多条费用明细'),
    minSize: WHOLE_SIZE,
    moreIntroLink: 'https://help.mingdao.com/sheet22',
  },
  SWITCH: { icon: 'checkbox_01', widgetName: _l('检查项'), intro: _l('可以选中或取消选中') },
  SUBTOTAL: {
    icon: 'sigma',
    widgetName: _l('汇总%04005'),
    intro: _l('汇总关联记录或子表中的数据，如：汇总订单明细中的商品总价，最大支持汇总1000行数据。'),
    moreIntroLink: 'https://help.mingdao.com/sheet19',
  },
  FORMULA_NUMBER: {
    icon: 'formula',
    widgetName: _l('公式'),
    intro: _l('将当前记录中的字段进行数值或日期计算'),
    moreIntroLink: 'https://help.mingdao.com/sheet18',
  },
  FORMULA_DATE: {
    icon: 'formula',
    widgetName: _l('公式'),
    intro: _l('将当前记录中的字段进行数值或日期计算'),
    moreIntroLink: 'https://help.mingdao.com/sheet18',
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
    widgetName: _l('级联选择%04003'),
    intro: _l('以层级视图作为数据源来选择目标表的记录,仅支持本表关联'),
    moreIntroLink: 'https://help.mingdao.com/sheet26',
  },
  OCR: {
    icon: 'ocr',
    widgetName: _l('文本识别'),
    intro: _l('识别输入图片，将识别结果填充到对应字段。'),
    moreIntroLink: 'https://help.mingdao.com/ocr',
  },
  REMARK: {
    widgetName: _l('备注%04007'),
    icon: 'info',
    defaultHint: _l('在此添加 注意事项 或 填写要求 等，来指导使用者(或填写者)正确地操作'),
    tip: _l('把注意事项或填写要求作为“备注”加入，来指导使用者(或填写者)正确使用'),
    intro: _l('在表单中添加说明信息'),
    minSize: WHOLE_SIZE,
  },
  EMBED: {
    widgetName: _l('嵌入%04010'),
    icon: 'code',
    intro: _l('在表单中嵌入URL，支持使用其他字段值传参'),
  },
  BAR_CODE: {
    widgetName: _l('条码'),
    icon: 'a-barcode',
    intro: _l('可将关联的数据源转成条形码或二维码显示'),
  },
  TIME: {
    icon: 'access_time',
    widgetName: _l('时间'),
    intro: _l('可设为小时分钟秒'),
    moreIntroLink: 'https://help.mingdao.com/sheet2#时间',
  },
  ORG_ROLE: {
    icon: 'user',
    widgetName: _l('组织角色'),
    intro: _l('选择组织中的角色，支持配置选择的组织角色的权限。'),
    moreIntroLink: 'https://help.mingdao.com/sheet42',
  },
  SEARCH_BTN: {
    icon: 'api',
    widgetName: _l('API查询'),
    featureId: 5,
  },
  SEARCH: {
    icon: 'api',
    widgetName: _l('API查询'),
    featureId: 5,
  },
  RELATION_SEARCH: {
    icon: 'Worksheet_query',
    widgetName: _l('查询记录'),
  },
  // SECTION: {
  //   icon: 'view_agenda',
  //   widgetName: _l('分段'),
  // },
};

export const DEFAULT_DATA = {
  TEXT: {
    controlName: _l('文本'),
    size: 12,
    enumDefault: 2,
    hint: _l('请填写文本内容'),
    advancedSetting: {
      analysislink: '1',
      sorttype: 'en',
    },
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
    advancedSetting: {
      showtype: '0',
    },
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
    // unit: _l('元'),
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
    enumDefault2: 0,
  },
  MULTI_SELECT: {
    ...genDefaultOptionsAndChecked(),
    controlName: _l('多选'),
    size: 12,
    enumDefault2: 0,
    advancedSetting: {
      direction: '2',
      checktype: '0',
    },
  },
  DROP_DOWN: {
    ...genDefaultOptionsAndChecked(),
    controlName: _l('单选'),
    size: 6,
    enumDefault2: 0,
    hint: _l('请选择'),
    advancedSetting: {
      showtype: '0',
    },
  },
  ATTACHMENT: {
    controlName: _l('附件'),
    hint: _l('添加附件'),
    size: 12,
    enumDefault: 3,
    advancedSetting: {
      showtype: '1',
      covertype: '0',
      alldownload: '1',
      webcompress: '1',
    },
  },
  DATE: {
    controlName: _l('日期'),
    size: 6,
    hint: _l('请选择日期'),
    advancedSetting: {
      showtype: '3',
    },
  },
  DATE_TIME: {
    controlName: _l('日期时间'),
    size: 6,
    hint: _l('请选择日期'),
    advancedSetting: {
      showtype: '1',
    },
  },
  AREA_PROVINCE: {
    controlName: _l('地区'),
    size: 6,
  },
  RELATION: {
    controlName: _l('自由连接%04008'),
    size: 12,
    enumDefault: 0,
  },
  SPLIT_LINE: {
    controlName: _l('分段%04006'),
    size: 12,
    // enumDefault: 2, // 根据enumDefault区分新旧分割线，2：新
    advancedSetting: {
      hidetitle: '1',
    },
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
    controlName: _l('大写金额%04009'),
    size: 6,
  },
  USER_PICKER: {
    controlName: _l('成员'),
    size: 6,
    hint: _l('请选择成员'),
    enumDefault: 0,
    userPermission: 1,
    noticeItem: 0,
  },
  DEPARTMENT: {
    controlName: _l('部门'),
    size: 6,
    enumDefault: 0,
    userPermission: 1,
  },
  SCORE: {
    controlName: _l('等级'),
    size: 6,
    enumDefault: 1,
    advancedSetting: NUM_5_SETTINGS,
  },
  RELATE_SHEET: {
    controlName: _l('关联记录%04001'),
    advancedSetting: {
      allowlink: '1',
      searchrange: '1',
      scanlink: '1',
      scancontrol: '1',
    },
    size: 12,
    strDefault: '000',
    enumDefault: 1,
    enumDefault2: 0,
  },
  SHEET_FIELD: {
    controlName: _l('他表字段%04004'),
    size: 6,
    enumDefault: 1,
    strDefault: '10',
    dataSource: '',
    sourceControlId: '', // 字段id
  },
  CONCATENATE: {
    controlName: _l('文本组合%04000'),
    size: 12,
    advancedSetting: {
      analysislink: '1',
    },
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
    controlName: _l('子表%04002'),
    size: 12,
    enumDefault: 2,
    advancedSetting: {
      allowadd: '1',
      allowcancel: '1',
      allowedit: '1',
      allowsingle: '1',
      allowexport: '1',
      rowheight: '0',
    },
  },
  SWITCH: {
    controlName: _l('检查项'),
    size: 6,
    advancedSetting: {
      defsource: '[{"cid":"","rcid":"","staticValue":"0"}]',
      showtype: '0',
    },
  },
  SUBTOTAL: {
    controlName: _l('汇总%04005'),
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
    strDefault: '00',
  },
  RICH_TEXT: {
    controlName: _l('富文本'),
    size: 12,
  },
  SIGNATURE: {
    controlName: _l('签名'),
    size: 6,
    advancedSetting: {
      uselast: '1',
    },
  },
  CASCADER: {
    controlName: _l('级联选择%04003'),
    size: 6,
  },
  REMARK: {
    size: 12,
    controlName: _l('备注%04007'),
    advancedSetting: {
      hidetitle: '1',
    },
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
  BAR_CODE: {
    size: 12,
    controlName: _l('条码'),
    enumDefault: 1,
    advancedSetting: {
      width: 160,
    },
  },
  TIME: {
    size: 6,
    controlName: _l('时间'),
    unit: '1',
  },
  ORG_ROLE: {
    controlName: _l('组织角色'),
    size: 6,
    enumDefault: 0,
    userPermission: 1,
  },
  SEARCH_BTN: {
    controlName: _l('API查询'),
    size: 6,
    enumDefault: 0,
    hint: _l('查询'),
  },
  SEARCH: {
    controlName: _l('API查询'),
    size: 6,
  },
  RELATION_SEARCH: {
    controlName: _l('查询记录'),
    size: 12,
    advancedSetting: {
      allowlink: '1',
      searchrange: '1',
      showtype: '2',
      sorts: '[{"controlId":"ctime","isAsc":true}]',
    },
    strDefault: '000',
    enumDefault: 2,
    enumDefault2: 1,
  },
  // SECTION: {
  //   controlName: _l('分段'),
  //   size: 12,
  //   advancedSetting: {
  //     theme: '#2196F3',
  //     title: '#333333',
  //     titlealign: '1',
  //     background: '',
  //   },
  //   enumDefault: 1,
  //   enumDefault2: 0,
  // },
};
export const WORKFLOW_SYSTEM_CONTROL = [
  { controlId: 'wfname', controlName: _l('流程名称'), type: 2, display: true },
  { controlId: 'wfstatus', controlName: _l('状态'), type: 2, display: true },
  { controlId: 'wfcuaids', controlName: _l('节点负责人'), type: 26, display: true },
  { controlId: 'wfrtime', controlName: _l('节点开始时间'), type: 16, display: true },
  { controlId: 'wfftime', controlName: _l('剩余时间'), type: 38, display: true },
  { controlId: 'wfcaid', controlName: _l('发起人'), type: 26, display: true },
  { controlId: 'wfctime', controlName: _l('发起时间'), type: 16, display: true },
  { controlId: 'rowid', controlName: _l('记录ID'), type: 2, display: true },
];
export const SYSTEM_PERSON_CONTROL = [{ controlId: 'uaid', controlName: _l('最近修改人'), type: 26, display: true }];
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
    controlName: _l('创建人'),
    type: 26,
    display: true,
  },
  ...SYSTEM_DATE_CONTROL,
];

export const SYSTEM_CONTROL_WITH_UAID = [
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
    controlName: _l('创建人'),
    type: 26,
    display: true,
  },
  {
    controlId: 'ctime',
    controlName: _l('创建时间'),
    controlPermissions: '100',
    type: 16,
    display: true,
  },
  {
    controlId: 'uaid',
    controlName: _l('最近修改人'),
    controlPermissions: '111',
    type: 26,
    enumDefault: 0,
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

// 表单内需要排除的系统字段
export const FORM_HIDDEN_CONTROL_IDS = ['ownerid', 'caid', 'ctime', 'utime', 'daid', 'uaid'];

// 系统字段
export const SYS = SYSTEM_CONTROL.map(o => o.controlId);

// 全部系统字段
export const ALL_SYS = SYS.concat(WORKFLOW_SYSTEM_CONTROL.map(o => o.controlId)).concat('uaid');

export const COMMON_USE_WIDGETS = pick(DEFAULT_CONFIG, [
  'TEXT',
  'NUMBER',
  'MONEY',
  'EMAIL',
  'DATE',
  'TIME',
  'MOBILE_PHONE',
  'AREA_COUNTY',
  // 'DATE_TIME_RANGE',
  'DROP_DOWN',
  'MULTI_SELECT',
  'USER_PICKER',
  'DEPARTMENT',
  'ORG_ROLE',
  'ATTACHMENT',
]);

export const ADVANCE_WIDGETS = pick(DEFAULT_CONFIG, [
  'FORMULA_NUMBER',
  'SWITCH',
  'SCORE',
  'CONCATENATE',
  'AUTO_ID',
  'RICH_TEXT',
  'CRED',
  'LOCATION',
  'SIGNATURE',
  'OCR',
  'SEARCH_BTN',
  'BAR_CODE',
  'MONEY_CN',
  'EMBED',
]);

export const RELATE_WIDGETS = pick(DEFAULT_CONFIG, [
  'RELATE_SHEET',
  'RELATION_SEARCH',
  'SUB_LIST',
  'CASCADER',
  'SHEET_FIELD',
  'SUBTOTAL',
  'RELATION',
]);

export const SPECIAL_WIDGETS = pick(DEFAULT_CONFIG, ['REMARK', 'SPLIT_LINE']);

export const WIDGET_GROUP_TYPE = {
  COMMON_USE: { widgets: COMMON_USE_WIDGETS, title: _l('常用') },
  ADVANCE: { widgets: ADVANCE_WIDGETS, title: _l('高级') },
  RELATE: { widgets: RELATE_WIDGETS, title: _l('关联') },
  SPECIAL: { widgets: SPECIAL_WIDGETS, title: _l('布局字段') },
};

export const NORMAL_CONTROLS = ['uaid', 'rowid'];

export const SYS_CONTROLS = [
  ...NORMAL_CONTROLS,
  'wfname',
  'wfcuaids',
  'wfcaid',
  'wfctime',
  'wfrtime',
  'wfftime',
  'wfstatus',
];
//审批相关系统字段
export const SYS_CONTROLS_WORKFLOW = ['wfname', 'wfcuaids', 'wfcaid', 'wfctime', 'wfrtime', 'wfftime', 'wfstatus'];

// 所有控件
export const ALL_WIDGETS_TYPE = { ...COMMON_USE_WIDGETS, ...ADVANCE_WIDGETS, ...RELATE_WIDGETS, ...SPECIAL_WIDGETS };
