export const PERIOD_TYPE = {
  day: 0,
  week: 1,
  month: 2,
  quarter: 3,
  year: 4,
};

export const PERIODS = [
  {
    name: _l('日'),
    value: PERIOD_TYPE.day,
    periodCount: 50,
    minDayWidth: 30,
    defaultMinDayWidth: 30,
  },
  {
    name: _l('周%05034'),
    value: PERIOD_TYPE.week,
    periodCount: 20,
    minDayWidth: 22,
    defaultMinDayWidth: 22,
  },
  {
    name: _l('月%05035'),
    value: PERIOD_TYPE.month,
    periodCount: 20,
    minDayWidth: 8,
    defaultMinDayWidth: 8,
  },
  {
    name: _l('季度'),
    value: PERIOD_TYPE.quarter,
    periodCount: 20,
    minDayWidth: 2.4,
    defaultMinDayWidth: 2.4,
  },
  {
    name: _l('年'),
    value: PERIOD_TYPE.year,
    periodCount: 20,
    minDayWidth: 0.9,
    defaultMinDayWidth: 0.9,
  },
];
