import moment from 'moment';
import { getWeekNumber } from 'src/utils/core/date';
import { WEEKS } from '../../util';

export const FORMAT = 'YYYY-MM-DD';

// start/end 已由共享日历格式化逻辑转换为字段的展示时区，结束时间不包含在区间内。
export const getEventsForDate = (events, date) => {
  if (!date) return [];
  const dayStart = moment(date).startOf('day');
  if (!dayStart.isValid()) return [];
  const dayEnd = dayStart.clone().add(1, 'day');

  return events.filter(event => {
    if (!event.start) return false;
    const start = moment(event.start);
    const end = event.end ? moment(event.end) : null;

    // FullCalendar 的全天事件忽略时分秒，结束日期为不包含的边界。
    if (event.allDay) {
      start.startOf('day');
      if (end) end.startOf('day');
    }

    if (!start.isValid() || !start.isBefore(dayEnd)) return false;

    if (end && end.isValid() && end.isAfter(start)) {
      return end.isAfter(dayStart);
    }

    // 未设置有效结束时间的事件只属于开始当天。
    return !start.isBefore(dayStart);
  });
};

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
  const sameMonth = start.isSame(end, 'month');
  const endFormat = sameMonth ? 'DD' : sameYear ? 'MM/DD' : 'YYYY/MM/DD';
  const title = `${start.format('YYYY/MM/DD')} - ${end.format(endFormat)}`;

  // dates 由 getCurrentWeekDates 按视图的 weekBegin 配置生成。
  return `${title} ${_l('第%0周', getWeekNumber(start.format(FORMAT), start.day()))}`;
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
