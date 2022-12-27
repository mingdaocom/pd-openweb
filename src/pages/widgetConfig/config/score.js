import _ from 'lodash';
const NUM_5 = 5;
const COLOR_FED156 = '#FED156';
const COLOR_FF9300 = '#FF9300';
const COLOR_F52222 = '#F52222';
const COLOR_EB2F96 = '#EB2F96';
const COLOR_2196F3 = '#2196F3';
const COLOR_00C345 = '#00C345';

export const SCORE_COLORS_LIST = [
  '#2196F3',
  '#08C9C9',
  '#00C345',
  '#FAD714',
  '#FF9300',
  '#F52222',
  '#EB2F96',
  '#7500EA',
  '#2D46C4',
  '#484848',
];

// 五星配置
export const NUM_5_SETTINGS = {
  max: 5,
  itemicon: 'star',
  itemcolor: JSON.stringify({
    type: 1,
    color: '#FED156',
    colors: [],
  }),
};

// 十星配置
const NUM_10_SETTINGS = {
  max: 10,
  itemicon: 'rectangle',
  itemcolor: JSON.stringify({
    type: 2,
    color: '',
    colors: [
      { key: '1', value: COLOR_F52222 },
      { key: '2', value: COLOR_F52222 },
      { key: '3', value: COLOR_F52222 },
      { key: '4', value: COLOR_F52222 },
      { key: '5', value: COLOR_FED156 },
      { key: '6', value: COLOR_FED156 },
      { key: '7', value: COLOR_FED156 },
      { key: '8', value: COLOR_00C345 },
      { key: '9', value: COLOR_00C345 },
      { key: '10', value: COLOR_00C345 },
    ],
  }),
};

// 获取动态默认颜色组
export const getDynamicColors = (colors, max) => {
  if (colors && colors.length === max && colors.length > 0) {
    return colors;
  } else {
    return Array.from({ length: max }).map((item, index) => ({ key: `${index + 1}`, value: COLOR_FED156 }));
  }
};

// 获取展示颜色
export const getColor = (data = {}) => {
  const { itemicon, itemcolor } = data.advancedSetting || {};
  const selectColor = JSON.parse(itemcolor || '{}');
  return selectColor.type === 1
    ? selectColor.color
    : _.get(
        _.find(DISPLAY_ICON, i => i.name === itemicon),
        'defaultColor',
      );
};

// 根据enumDefault将老配置替换成新的
export const getDefaultData = data => {
  return data.enumDefault === 2 ? NUM_10_SETTINGS : NUM_5_SETTINGS;
};

export const DISPLAY_ICON = [
  {
    name: 'star',
    defaultColor: COLOR_FED156,
    defaultNum: NUM_5,
  },
  {
    name: 'sentiment_very_satisfied',
    defaultColor: COLOR_FED156,
    defaultNum: NUM_5,
  },
  {
    name: 'lightbulb1',
    defaultColor: COLOR_FED156,
    defaultNum: NUM_5,
  },
  {
    name: 'wb_sunny',
    defaultColor: COLOR_FED156,
    defaultNum: NUM_5,
  },
  {
    name: 'thumb_up_14',
    defaultColor: COLOR_FF9300,
    defaultNum: NUM_5,
  },
  {
    name: 'rocket_launch',
    defaultColor: COLOR_FF9300,
    defaultNum: NUM_5,
  },
  {
    name: 'fire',
    defaultColor: COLOR_F52222,
    defaultNum: NUM_5,
  },
  {
    name: 'favorite',
    defaultColor: COLOR_F52222,
    defaultNum: NUM_5,
  },
  {
    name: 'bug',
    defaultColor: COLOR_F52222,
    defaultNum: NUM_5,
  },
  {
    name: 'warning',
    defaultColor: COLOR_F52222,
    defaultNum: NUM_5,
  },
  {
    name: 'emergency',
    defaultColor: COLOR_F52222,
    defaultNum: NUM_5,
  },
  {
    name: 'folder-top',
    defaultColor: COLOR_F52222,
    defaultNum: NUM_5,
  },
  {
    name: 'flag',
    defaultColor: COLOR_F52222,
    defaultNum: NUM_5,
  },
  {
    name: 'bookmark',
    defaultColor: COLOR_F52222,
    defaultNum: NUM_5,
  },
  {
    name: 'clear_bold',
    defaultColor: COLOR_F52222,
    defaultNum: NUM_5,
  },
  {
    name: 'flower',
    defaultColor: COLOR_EB2F96,
    defaultNum: NUM_5,
  },
  {
    name: 'inbox',
    defaultColor: COLOR_2196F3,
    defaultNum: NUM_5,
  },
  {
    name: 'snow',
    defaultColor: COLOR_2196F3,
    defaultNum: NUM_5,
  },
  {
    name: 'shield',
    defaultColor: COLOR_2196F3,
    defaultNum: NUM_5,
  },
  {
    name: 'rectangle',
    defaultColor: COLOR_2196F3,
    defaultNum: NUM_5,
  },
  {
    name: 'rounded_square',
    defaultColor: COLOR_00C345,
    defaultNum: NUM_5,
  },
];
