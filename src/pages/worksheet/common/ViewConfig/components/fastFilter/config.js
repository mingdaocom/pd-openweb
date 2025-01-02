//时间
export const DATE_TYPE = [
  [
    { text: _l('今天'), value: 1 },
    { text: _l('昨天'), value: 2 },
    { text: _l('明天'), value: 3 },
    { text: _l('本周'), value: 4 },
    { text: _l('上周'), value: 5 },
    { text: _l('下周'), value: 6 },
    { text: _l('本月'), value: 7 },
    { text: _l('上个月'), value: 8 },
    { text: _l('下个月'), value: 9 },
  ],
  //
  [
    { text: _l('本季度'), value: 12 },
    { text: _l('上季度'), value: 13 },
    { text: _l('下季度'), value: 14 },
    { text: _l('今年'), value: 15 },
    { text: _l('去年'), value: 16 },
    { text: _l('明年'), value: 17 },
  ],
  //
  [
    { text: _l('过去3天'), value: 52 },
    { text: _l('过去7天'), value: 21 },
    { text: _l('过去14天'), value: 22 },
    { text: _l('过去30天'), value: 23 },
    { text: _l('将来3天'), value: 51 },
    { text: _l('将来7天'), value: 31 },
    { text: _l('将来14天'), value: 32 },
    { text: _l('将来30天'), value: 33 },
  ],
  //
  [
    { text: _l('过去1小时'), value: 53 },
    { text: _l('过去3小时'), value: 54 },
    { text: _l('过去6小时'), value: 55 },
    { text: _l('过去12小时'), value: 56 },
    { text: _l('过去24小时'), value: 57 },
    { text: _l('过去5分钟'), value: 63 },
    { text: _l('过去15分钟'), value: 64 },
    { text: _l('过去30分钟'), value: 65 },
  ],
  //
  [
    { text: _l('将来5分钟'), value: 66 },
    { text: _l('将来15分钟'), value: 67 },
    { text: _l('将来30分钟'), value: 68 },
    { text: _l('将来1小时'), value: 58 },
    { text: _l('将来3小时'), value: 59 },
    { text: _l('将来6小时'), value: 60 },
    { text: _l('将来12小时'), value: 61 },
    { text: _l('将来24小时'), value: 62 },
  ],
];

export const DATE_TYPE_PASS = [52, 21, 22, 23, 53, 54, 55, 56, 57, 63, 64, 65];
export const DATE_TYPE_FUTURE = [51, 31, 32, 33, 66, 67, 68, 58, 59, 60, 61, 62];

export const DATE_TYPE_M = [7, 8, 9, 12, 13, 14, 15, 16, 17];
export const DATE_TYPE_Y = [15, 16, 17];
export const DATE_TYPE_D = [1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 13, 14, 15, 16, 17, 52, 21, 22, 23, 51, 31, 32, 33];
export const DATE_TYPE_H = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 13, 14, 15, 16, 17, 52, 21, 22, 23, 51, 31, 32, 33, 53, 54, 55, 56, 57, 58, 59, 60, 61,
  62,
];
export const DATE_TYPE_H_M = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 13, 14, 15, 16, 17, 52, 21, 22, 23, 51, 31, 32, 33, 53, 54, 55, 56, 57, 58, 59, 60, 61,
  62,
];
export const DATE_TYPE_ALL = _.flattenDeep(DATE_TYPE)
  .map(o => o.value)
  .filter(o => o !== 'all');

//日期时间字段showtype
export const DATE_SHOW_TYPE = {
  MINUTE: '1',
  HOUR: '2',
  DAY: '3',
  MONTH: '4',
  YEAR: '5',
  SECOND: '6',
  QUARTER: '11',
};

export const DATE_FORMAT_BY_DATERANGETYPE = {
  5: 'YYYY',
  4: 'YYYY-MM',
  3: 'YYYY-MM-DD',
  2: 'YYYY-MM-DD HH',
  1: 'YYYY-MM-DD HH:mm',
}
