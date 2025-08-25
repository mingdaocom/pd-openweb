export const TITLE_ENUM = {
  1: _l('从其他视图复制'),
  2: _l('将配置应用到其他视图'),
};

export const VIEW_TYPE_OPTIONS = [
  {
    text: _l('全部'),
    value: 0,
  },
  {
    text: _l('指定视图'),
    value: 1,
  },
];

export const DEFAULT_KEYS = ['FastFilter', 'Show', 'CardSet', 'ColStyle'];

export const COPY_CONFIGS_BY_GROUP = [
  { types: ['Show', 'ColStyle', 'CardSet'], title: _l('显示设置') },
  { types: ['Filter', 'Sort', 'RecordColor', 'Controls'], title: _l('记录设置') },
  { types: ['FastFilter', 'NavGroup', 'ActionSet', 'ActionSet', 'Print'], title: _l('用户操作') },
  { types: ['MobileSet', 'urlParams'], title: _l('其他') },
];

export const COPY_CONFIGS = [
  {
    icon: 'tune_new',
    key: 'Show',
    label: _l('显示列'),
    datakey: 1,
  },
  {
    icon: 'format_paint',
    key: 'ColStyle',
    label: _l('列样式'),
    datakey: 2,
  },
  {
    icon: 'card',
    key: 'CardSet',
    label: _l('卡片设置'),
    datakey: 13,
  },
  {
    icon: 'worksheet_filter',
    key: 'Filter',
    label: _l('过滤'),
    datakey: 3,
  },
  {
    icon: 'folder-sort',
    key: 'Sort',
    label: _l('排序'),
    datakey: 4,
  },
  {
    icon: 'background_color',
    key: 'RecordColor',
    label: _l('颜色'),
    datakey: 5,
  },
  {
    icon: 'visibility',
    key: 'Controls',
    label: _l('字段'),
    datakey: 6,
  },
  {
    icon: 'smart_button_black_24dp',
    key: 'FastFilter',
    label: _l('快速筛选'),
    datakey: 7,
  },
  {
    icon: 'list',
    key: 'NavGroup',
    label: _l('筛选列表'),
    datakey: 8,
  },
  {
    icon: 'custom_actions',
    key: 'ActionSet',
    label: _l('记录操作'),
    datakey: 9,
  },
  {
    icon: 'print',
    key: 'Print',
    label: _l('打印模版'),
    datakey: 10,
  },
  {
    icon: 'phone',
    key: 'MobileSet',
    label: _l('移动端显示'),
    datakey: 11,
  },
  {
    icon: 'global_variable',
    key: 'urlParams',
    label: _l('链接参数'),
    datakey: 12,
  },
];

export const VIEW_TYPE_FILTER_CONFIG = {
  sheet: ['CardSet'],
  board: ['ColStyle', 'NavGroup', 'MobileSet', 'Show'],
  calendar: ['ColStyle', 'NavGroup', 'MobileSet', 'Show'],
  gallery: ['ColStyle', 'Show'],
  detail: ['ColStyle', 'NavGroup', 'MobileSet', 'Show'],
  structure: ['ColStyle', 'MobileSet', 'Show'],
  map: ['ColStyle', 'MobileSet', 'Show'],
  gunter: ['ColStyle', 'NavGroup', 'MobileSet', 'Show'],
  resource: ['ColStyle', 'NavGroup', 'MobileSet', 'Show', 'CardSet'],
  customize: ['ColStyle', 'MobileSet', 'Show', 'CardSet'],
};
