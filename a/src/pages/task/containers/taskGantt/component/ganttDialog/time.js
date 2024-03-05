import moment from 'moment';
/**
 * 格式化数据
 * @param {*} data
 */
const formatData = data => Object.keys(data).map(v => ({ pub: v, sub: data[v] }));

/**
 * 按天解析数据
 * @param {*} beginTime
 * @param {*} endTime
 */
export const byDay = (beginTime, endTime) => {
  beginTime = beginTime.clone();
  endTime = endTime.clone();
  const durDays = moment.duration(endTime.diff(beginTime)).asDays();
  const res = {};
  for (let i = 0; i < durDays; i++) {
    const key = beginTime.format('YYYY.MM');
    const val = `${beginTime.date()}`;
    res[key] ? res[key].push(val) : (res[key] = [val]);
    beginTime.add(1, 'day');
  }
  return formatData(res);
};

/**
 * 按周解析数据
 * @param {*} beginTime
 * @param {*} endTime
 */
export const byWeek = (beginTime, endTime) => {
  beginTime = beginTime.clone();
  endTime = endTime.clone();
  const durWeeks = Math.round(moment.duration(endTime.diff(beginTime)).asDays() / 7);
  const res = {};
  for (let i = 0; i < durWeeks; i++) {
    const key = beginTime.format('YYYY.MM');
    const val = `${beginTime.date()}-${beginTime.add(6, 'day').date()}日 ${beginTime.week()}周`;
    res[key] ? res[key].push(val) : (res[key] = [val]);
    beginTime.add(1, 'day');
  }
  return formatData(res);
};

/**
 * 按月解析数据
 * @param {*} beginTime
 * @param {*} endTime
 */
export const byMonth = (beginTime, endTime) => {
  beginTime = beginTime.clone();
  endTime = endTime.clone();
  const durMonths = Math.round(moment.duration(endTime.diff(beginTime)).asMonths());
  const res = {};
  for (let i = 0; i < durMonths; i++) {
    const key = `${beginTime.year()}`;
    const val = `${beginTime.month() + 1}月`;
    res[key] ? res[key].push(val) : (res[key] = [val]);
    beginTime.add(1, 'month');
  }
  return formatData(res);
};

/**
 * 计算一段时间中所隔的天数
 */
export const durDays = (beginTime, endTime) => moment.duration(endTime.diff(beginTime)).asDays();

// 将YYYY-MM-DD HH-MM-SS格式时间解析为YYYY-MM-DD格式
export const parseTime = time => time && time.split(' ')[0];

// 将字符串时间转化为moment时间
export const momentTime = time => moment(parseTime(time));
