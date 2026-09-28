export const THEME_COLOR_OPTIONS = [
  '#9A060C',
  '#CF1521',
  '#E91F63',
  '#F9551C',
  '#D48724',
  '#874812',
  '#FF9800',
  '#3A13AF',
  '#9D27B0',
  '#732ED1',
  '#4051B5',
  '#3054EB',
  '#1677ff',
  '#00BCD4',
  '#217107',
  '#4CAF50',
  '#7CB402',
  '#455964',
];

export const TEXT_COLOR_OPTIONS = [...THEME_COLOR_OPTIONS, '#151515', '#757575'];

export const getBgData = theme => {
  const rgbArr = [0.24, 0.16, 0.08].map(item => {
    return (
      'rgb(' +
      parseInt('0x' + theme.slice(1, 3)) +
      ',' +
      parseInt('0x' + theme.slice(3, 5)) +
      ',' +
      parseInt('0x' + theme.slice(5, 7)) +
      ',' +
      item +
      ')'
    );
  });

  return [...rgbArr, '#fff'];
};
