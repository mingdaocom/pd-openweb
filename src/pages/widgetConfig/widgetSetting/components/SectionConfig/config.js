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
  '#2196F3',
  '#00BCD4',
  '#217107',
  '#4CAF50',
  '#7CB402',
  '#455964',
];

export const TEXT_COLOR_OPTIONS = [...THEME_COLOR_OPTIONS, '#333333', '#757575'];

export const getOptionsByEnumDefault = value => {
  if (value === 6) {
    return {
      theme: '#2196F3',
      title: '#fff',
      titlealign: '1',
      background: '',
      icon: '',
    };
  } else if (value === 2) {
    return {
      theme: '#2196F3',
      title: '#fff',
      titlealign: '1',
      background: '#EBF7FF',
      icon: '',
    };
  } else {
    return {
      theme: '#2196F3',
      title: '#333333',
      titlealign: '1',
      background: _.includes([5], value) ? '#EBF7FF' : '',
      icon: '',
    };
  }
};

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
