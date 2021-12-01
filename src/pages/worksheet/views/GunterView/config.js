

export const viewConfig = {
  // 天的宽度
  minDayWidth: null,
  // 呈现维度的数量
  periodCount: null,
  // 是否只显示工作日
  onlyWorkDay: true,
  // 休息日
  dayOff: []
}

export const PERIOD_TYPE = {
  day: 0,
  week: 1,
  month: 2,
  quarter: 3,
  year: 4
}

export const PERIODS = [
  {
    name: _l('日'),
    value: PERIOD_TYPE.day,
    periodCount: 50,
    minDayWidth: 30,
    defaultMinDayWidth: 30,
  },
  {
    name: _l('周'),
    value: PERIOD_TYPE.week,
    periodCount: 20,
    minDayWidth: 22,
    defaultMinDayWidth: 22,
  },
  {
    name: _l('月'),
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
  }
];


