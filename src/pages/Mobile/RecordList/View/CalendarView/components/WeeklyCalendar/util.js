import moment from 'moment';
import { WEEKS } from '../../util';

export const FORMAT = 'YYYY-MM-DD';

export const getCurrentWeekDates = (date, weekBegin = 1) => {
  const day = date.day();
  // 计算本周第一天与传入日期差几天
  let diff = day - weekBegin;
  if (diff < 0) diff += 7;
  const startOfWeek = date.clone().subtract(diff, 'days').startOf('day');
  const dates = [];
  for (let i = 0; i < 7; i++) {
    dates.push(startOfWeek.clone().add(i, 'days'));
  }
  return dates;
};

export const formatDateWithWeekday = dateStr => {
  const date = moment(dateStr);
  if (!date.isValid()) return '';
  return `${date.year()}/${date.month() + 1}/${date.date()}  ${WEEKS[date.day()]}`;
};

export const getWeekTitle = dates => {
  if (!dates.length) return;
  // 周的第一天
  const start = dates[0];
  // 周的最后一天
  const end = dates[dates.length - 1];
  const sameYear = start.year() === end.year();
  const title = sameYear
    ? `${start.year()}/${start.format('MM/DD')} - ${end.format('MM/DD')}`
    : `${start.format('YYYY/MM/DD')} - ${end.format('YYYY/MM/DD')}`;

  return title;
};

// 计算给定日期是所在周第几天（基于weekBegin起算）
export const calcDayIndex = (date, weekBegin) => {
  const day = moment(date).day(); // 0-6，0周日
  // 计算基于weekBegin调整后的索引，保证0~6循环
  return (day - weekBegin + 7) % 7;
};

// 根据周起始日期和dayIndex计算具体日期字符串
export const calcDateByWeekAndIndex = (weekStartDate, dayIndex) => {
  return moment(weekStartDate).add(dayIndex, 'days').format(FORMAT);
};
