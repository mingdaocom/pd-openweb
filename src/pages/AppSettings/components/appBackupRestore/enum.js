import _ from 'lodash';

export const RegularBackupTabs = [
  { text: _l('每天'), value: 1 },
  { text: _l('每周'), value: 2 },
  { text: _l('每月'), value: 3 },
];

export const WeekData = [
  { text: _l('周一'), value: 1 },
  { text: _l('周二'), value: 2 },
  { text: _l('周三'), value: 3 },
  { text: _l('周四'), value: 4 },
  { text: _l('周五'), value: 5 },
  { text: _l('周六'), value: 6 },
  { text: _l('周日'), value: 0 },
];

export const Days = [
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
  '21',
  '22',
  '23',
  '24',
  '25',
  '26',
  '27',
  '28',
  '29',
  '30',
  '31',
];

// 文本拼接不加翻译
export const cycleWeekText = {
  1: _l('每周一'),
  2: _l('每周二'),
  3: _l('每周三'),
  4: _l('每周四'),
  5: _l('每周五'),
  6: _l('每周六'),
  0: _l('每周日'),
};
