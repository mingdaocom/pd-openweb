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
  { text: _l('小时'), value: '2' },
  { text: _l('分钟'), value: '1' },
];

export const DEFAULT_SETTING_OPTIONS = [
  { text: _l('可新增明细'), id: 'allowadd' },
  { text: _l('可编辑已有明细'), id: 'allowedit' },
  { text: _l('可删除已有明细'), id: 'allowcancel' },
];
