import CustomChart from './images/customChart.png';
import CustomTheme from './images/customTheme.png';

export const SYS_COLOR = [
  { color: '#A00416' },
  { color: '#D81029' },
  { color: '#F21B65' },
  { color: '#FC532E' },
  { color: '#8E481B' },
  { color: '#D98936' },
  { color: '#FD982E' },
  { color: '#3A16AF' },
  { color: '#9D26B0' },
  { color: '#732ED1' },
  { color: '#4051B6' },
  { color: '#3054EB' },
  { color: '#2296F3' },
  { color: '#1FBCD5' },
  { color: '#21710F' },
  { color: '#4CAF50' },
  { color: '#7DB421' },
  { color: '#455A65' },
];

export const SYS_CHART_COLORS = [
  {
    name: _l('经典'),
    colors: ['#1AA0E7', '#1FC39A', '#FAA328', '#FD7043', '#8D63D6', '#BB702F', '#78909C', '#FED631'],
    themeColors: ['#2296F3'],
    id: '0',
  },
  {
    name: _l('色盲安全'),
    colors: ['#074650', '#159292', '#FD6DB6', '#FEB5DA', '#481191', '#B66DFC', '#B6DAFD', '#6DB6FC'],
    themeColors: ['#21710F'],
    id: '1',
  },
  {
    name: _l('文艺'),
    colors: ['#8250C4', '#5ECBC8', '#438FFB', '#FD977E', '#EB5757', '#5B2071', '#EC5A96', '#A43B76'],
    themeColors: ['#3A16AF', '#732ED1', '#9D26B0'],
    id: '2',
  },
  {
    name: _l('高对比度'),
    colors: ['#107C11', '#022050', '#A8050E', '#5C2D91', '#064B50', '#1378D7', '#D83B18', '#B4169E'],
    themeColors: ['#4CAF50', '#7DB421'],
    id: '3',
  },
  {
    name: _l('商务'),
    colors: ['#1478ED', '#30D1FF', '#A3A9F5', '#B7D2F8', '#787CA9', '#F25929', '#0B31A5', '#16215B'],
    themeColors: ['#3054EB'],
    id: '4',
  },
  {
    name: _l('创新'),
    colors: ['#e13118', '#C4B07B', '#AF916D', '#118372', '#1BB194', '#2878BD', '#FCB72B', '#70B0E0'],
    themeColors: ['#A00416', '#D81029', '#F21B65'],
    id: '5',
  },
  {
    name: _l('日出'),
    colors: ['#FDAC2A', '#E8721F', '#E13118', '#D30D4C', '#EF168C', '#9B0C65', '#7D0533', '#5C0104'],
    themeColors: ['#FC532E', '#FD982E'],
    id: '6',
  },
  {
    name: _l('自然'),
    colors: ['#1DB8AA', '#374649', '#FC625E', '#F2C82D', '#5F6B6D', '#8AD4EB', '#FD9666', '#A66999'],
    themeColors: ['#1FBCD5'],
    id: '7',
  },
  {
    name: _l('潮汐'),
    colors: ['#094782', '#1272D7', '#178BF5', '#54B5FB', '#71C0A7', '#57B956', '#478F48', '#326633'],
    themeColors: ['#455A65', '#4051B6'],
    id: '8',
  },
  {
    name: _l('黄昏'),
    colors: ['#F17925', '#064753', '#CCAA25', '#4B4C4E', '#D82C20', '#A3D0D4', '#536F18', '#46ABB0'],
    themeColors: ['#D98936', '#8E481B'],
    id: '9',
  },
];

export const CUSTOM_ILLUSTRATION = {
  chart: {
    title: _l('自定义图表配色'),
    desc: _l('主题和图表配色联动，实现风格的一致性'),
    image: CustomChart,
  },
  theme: {
    title: _l('自定义主题颜色'),
    desc: _l('方便快速选择应用的主题颜色，满足个性化需求'),
    image: CustomTheme,
  },
};
