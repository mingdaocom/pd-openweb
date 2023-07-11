export const DISPLAY_TYPE = [
  {
    key: 'card',
    text: _l('卡片'),
    value: '1',
  },
  { key: 'dropdown', text: _l('下拉框'), value: '3' },
];

export const RELATE_COUNT = [
  { text: _l('单条'), value: 1 },
  { text: _l('多条'), value: 2 },
];

export const RELATE_COUNT_TEXT = {
  0: _l('子表'),
  1: _l('单条'),
  2: _l('多条'),
};

export const DISPLAY_TYPE_TEXT = {
  1: _l('卡片'),
  2: _l('列表'),
  3: _l('下拉框'),
};

export const FORMULA_DATE_DISPLAY_TYPE = [
  {
    value: '3',
    text: _l('天'),
  },
  {
    value: '4',
    text: _l('月'),
  },
  {
    value: '5',
    text: _l('年'),
  },
];

export const UNIT_TYPE = [
  { text: _l('年'), value: '5' },
  { text: _l('月'), value: '4' },
  { text: _l('天'), value: '3' },
  { text: _l('时'), value: '2' },
  { text: _l('分'), value: '1' },
  { text: _l('秒'), value: '6' },
];

export const DEFAULT_SETTING_OPTIONS = [
  { text: _l('可新增明细'), id: 'allowadd' },
  { text: _l('可编辑已有明细'), id: 'allowedit' },
  { text: _l('可删除已有明细'), id: 'allowcancel' },
];

export const RELATION_OPTIONS = [
  {
    value: 0,
    text: _l('全部'),
  },
  {
    value: 1,
    text: _l('任务'),
  },
  {
    value: 2,
    text: _l('项目'),
  },
  {
    value: 3,
    text: _l('日程'),
  },
  {
    value: 5,
    text: _l('申请单'),
  },
];

export const DEFAULT_TEXT = {
  1: [
    { key: '1', value: _l('开启') },
    { key: '0', value: _l('关闭') },
  ],
  2: [
    { key: '1', value: _l('是') },
    { key: '0', value: _l('否') },
  ],
};

export const SWITCH_TYPES = [
  {
    value: '0',
    text: _l('勾选框'),
  },
  {
    value: '1',
    text: _l('开关'),
  },
  {
    value: '2',
    text: _l('是/否'),
  },
];

export const DATE_SHOW_TYPES = [
  {
    value: '0',
    text: _l('ISO'),
    format: _l('YYYY-MM-DD'),
  },
  {
    value: '1',
    text: _l('中国'),
    format: _l('YYYY年M月D日'),
  },
  {
    value: '2',
    text: _l('US'),
    format: _l('M/D/YYYY'),
  },
  {
    value: '3',
    text: _l('EU'),
    format: _l('D/M/YYYY'),
  },
];

export const DISPLAY_MASK = [
  { text: _l('全掩盖'), value: 'all' },
  { text: _l('姓名'), subText: _l('-显示前1个字，后1个字'), value: '1' },
  { text: _l('手机号'), subText: _l('-显示前3位，后4位'), value: '2' },
  { text: _l('邮箱'), subText: _l('-显示前3位，@和之后的字'), value: '3' },
  { text: _l('金额'), subText: _l('-全掩盖，虚拟为5位'), value: '4' },
  { text: _l('身份证件'), subText: _l('-显示后4位'), value: '5' },
  { text: _l('住址'), subText: _l('-显示前4个字，后4个字'), value: '6' },
  { text: _l('IP地址'), subText: _l('-显示第1段IP'), value: '7' },
  { text: _l('车牌号'), subText: _l('-显示前1个字，后2位'), value: '8' },
];

export const CUSTOM_DISPLAY = [
  {
    text: _l('自定义规则'),
    value: 'custom',
  },
];

export const RELATION_SEARCH_DISPLAY = [
  {
    key: 'card',
    text: _l('卡片'),
    value: '1',
  },
  {
    key: 'list',
    text: _l('列表'),
    value: '2',
  },
  { key: 'text', text: _l('文本'), value: '3' },
];
