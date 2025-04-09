/**
 * 数值控件的计算类型
 */
export const normTypes = [
  {
    text: _l('总计'),
    alias: _l('求和'),
    value: 1,
  },
  {
    text: _l('最大值'),
    value: 2,
  },
  {
    text: _l('最小值'),
    value: 3,
  },
  {
    text: _l('平均值'),
    value: 4,
  },
  {
    text: _l('计数'),
    value: 5,
  },
  {
    text: _l('去重计数'),
    value: 6,
  },
];

export const defaultNumberChartStyle = {
  textAlign: 'center',
  columnCount: 4,
  fontSize: 28,
  fontColor: '#151515',
  contrastColor: 0,
  contrastValueDot: 2,
  lastContrastText: _l('环比'),
  contrastText: _l('同比'),
  shape: 'square',
  iconVisible: false,
  iconColor: '#2196F3',
  icon: '3_1_coins',
};

export const sizeTypes = [
  {
    name: _l('小'),
    value: 20,
    titleValue: 15,
  },
  {
    name: _l('默认'),
    value: 28,
    titleValue: 15,
  },
  {
    name: _l('中'),
    value: 42,
    titleValue: 18,
  },
  {
    name: _l('大'),
    value: 80,
    titleValue: 24,
  },
  {
    name: _l('超大'),
    value: 120,
    titleValue: 32,
  },
];

export const defaultPivotTableStyle = {
  cellTextAlign: 'right',
  columnTextAlign: 'left',
  lineTextAlign: 'left',
  columnTextColor: '#757575',
  columnBgColor: '#fafafa',
  lineTextColor: '#151515',
  lineBgColor: '#fff',
  evenBgColor: '#fafcfd',
  oddBgColor: '#ffffff',
  textColor: '#000000d9',
};
