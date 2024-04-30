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
  5: _l('表格'),
  6: _l('标签页表格'),
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
  { text: _l('年%04019'), value: '5' },
  { text: _l('月%04020'), value: '4' },
  { text: _l('天%04021'), value: '3' },
  { text: _l('时%04022'), value: '2' },
  { text: _l('分%04023'), value: '1' },
  { text: _l('秒%04024'), value: '6' },
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
    { key: '1', value: _l('是%04015') },
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
    text: _l('开关%02066'),
  },
  {
    value: '2',
    text: _l('是/否%02067'),
  },
];

export const DATE_SHOW_TYPES = [
  {
    value: '0',
    format: _l('YYYY-MM-DD'),
  },
  {
    value: '4',
    format: _l('YYYY/MM/DD'),
  },
  {
    value: '1',
    text: _l('中国'),
    format: _l('YYYY年M月D日'),
  },
  {
    value: '2',
    text: 'US',
    format: _l('M/D/YYYY'),
  },
  {
    value: '3',
    text: 'EU',
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
    text: _l('表格（旧）'),
    value: '2',
    disabled: true,
  },
  { key: 'text', text: _l('文本'), value: '3' },
  {
    key: 'embed_list',
    text: _l('表格'),
    value: '5',
  },
  {
    key: 'tab_list',
    text: _l('标签页表格'),
    value: '6',
  },
];

// 标题字号映射关系
export const TITLE_SIZE_OPTIONS = {
  0: '13px',
  1: '16px',
  2: '18px',
  3: '20px',
  4: '24px',
};
