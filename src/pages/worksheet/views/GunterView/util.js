
import { PERIODS, PERIOD_TYPE } from './config';
import { browserIsMobile } from 'src/util';
import _ from 'lodash';
import moment from 'moment';

/**
 * 修改当前视图配置
 */
export const changeViewConfig = (value = PERIOD_TYPE.day, viewConfig) => {
  const { minDayWidth, defaultMinDayWidth } = _.find(PERIODS, { value });
  const count = getPeriodCount(value, minDayWidth, viewConfig);
  return Object.assign(viewConfig, {
    periodCount: count,
    minDayWidth,
    periodType: value
  });
}

/**
 * 根据用户屏幕获取 periodCount
 */
export const getPeriodCount = (type, minDayWidth, viewConfig) => {
  const { onlyWorkDay, dayOff = [] } = viewConfig;
  const monthDay = 30;
  const monthWorkDay = monthDay - (dayOff.length * 4);
  const screenWidth = browserIsMobile() ? screen.width * 2 : screen.width;
  let periodWidth = 0;

  if (type === PERIOD_TYPE.day) {
    periodWidth = 30;
  }
  if (type === PERIOD_TYPE.week) {
    const weekCount = 7;
    const value = onlyWorkDay ? weekCount - dayOff.length : weekCount;
    periodWidth = value * minDayWidth;
  }
  if (type === PERIOD_TYPE.month) {
    periodWidth = onlyWorkDay ? (monthWorkDay * minDayWidth) : (monthDay * minDayWidth);
  }
  if (type === PERIOD_TYPE.quarter) {
    periodWidth = onlyWorkDay ? ((monthWorkDay * 3) * minDayWidth) : ((monthDay * 3) * minDayWidth);
  }
  if (type === PERIOD_TYPE.year) {
    periodWidth = onlyWorkDay ? ((monthWorkDay * 6) * minDayWidth) : ((monthDay * 6) * minDayWidth);
    const screenPeriodCount = parseInt(screenWidth / periodWidth);
    const value = screenPeriodCount % 4;
    return (value === 0) ? screenPeriodCount : screenPeriodCount + (4 - value);
  }

  const screenPeriodCount = parseInt(screenWidth / periodWidth);
  return (screenPeriodCount % 2 === 0) ? screenPeriodCount : screenPeriodCount + 1;
}


/**
 * 获取一个时间点(time)到指定数量(value, 正数向前，负数向后)的工作日
 */
export const getAssignWorkDays = (value, time, dayOff) => {
  const result = [];
  const target = Math.abs(value);
  let count = value >= 0 ? 0 : -1;
  while (result.length !== target) {
    const date = moment(time).add(count, 'd');
    const day = date.day();
    if (value >= 0) {
      count = count + 1;
    } else {
      count = count - 1;
    }
    if (!dayOff.includes(day)) {
      result.push(date.format('YYYY-MM-DD'));
    }
  }
  return result;
}

/**
 * 获取日视图数据(仅工作日)
 */
export const getWorkDays = (start, end, center, viewConfig) => {
  const { minDayWidth, periodCount, dayOff } = viewConfig;
  const movePeriodCount = periodCount / 2;
  const days = [];

  if (start && _.isNull(end)) {
    const res = getAssignWorkDays(-movePeriodCount, start, dayOff);
    const leftStart = res[res.length - 1];
    days.push(...getAssignWorkDays(periodCount + periodCount, leftStart, dayOff));
  } else if (end && _.isNull(start)) {
    const res = getAssignWorkDays(movePeriodCount + 2, end, dayOff);
    const rightEnd = res[res.length - 1];
    days.push(...getAssignWorkDays(-(periodCount + periodCount), rightEnd, dayOff).reverse());
  } else if (start && end) {
    const count = getWeekDayCount(start, end, dayOff);
    const res = getAssignWorkDays(count, start, dayOff);
    days.push(...res);
  } else {
    const startTime = getAssignWorkDays(-periodCount, center, dayOff).reverse();
    const endTime = getAssignWorkDays(periodCount, center, dayOff);
    days.push(...startTime.concat(endTime));
  }

  const parent = {};
  const result = [];

  for (let i = 0; i < days.length; i++) {
    const momentObj = moment(days[i]);
    const d = momentObj.format('YYYY-MM-DD');
    const m = momentObj.format('YYYY-MM');
    const isToday = d === moment().format('YYYY-MM-DD');
    const base = { time: d, width: minDayWidth };

    if (isToday) {
      base.isToday = isToday;
      base.left = minDayWidth / 2;
      result.push(base);
    } else {
      result.push(base);
    }

    if (parent[m]) {
      const { width } = parent[m];
      parent[m].width = width + minDayWidth;
    } else {
      parent[m] = { width: minDayWidth, time: m };
    }
  }

  return { result, parent: _.toArray(parent) };
}

/**
 * 获取日视图数据
 */
export const getDays = (start, end, center, viewConfig) => {
  const { minDayWidth, periodCount } = viewConfig;
  const startTime = start ? start : moment(center).add(-periodCount, 'd');
  const endTime = end ? end : moment(center).add(periodCount, 'd');
  const diff = Math.abs(startTime.diff(endTime, 'd')) + 1;
  const parent = {};
  const result = [];

  for (let i = 0; i < diff; i++) {
    const momentObj = moment(startTime).add(i, 'd');
    const day = momentObj.day();
    const d = momentObj.format('YYYY-MM-DD');
    const m = momentObj.format('YYYY-MM');
    const isToday = d === moment().format('YYYY-MM-DD');
    const base = { time: d, width: minDayWidth };

    if (isToday) {
      base.isToday = isToday;
      base.left = minDayWidth / 2;
      result.push(base);
    } else {
      result.push(base);
    }

    if (parent[m]) {
      const { width } = parent[m];
      parent[m].width = width + minDayWidth;
    } else {
      parent[m] = { width: minDayWidth, time: m };
    }
  }

  return { result, parent: _.toArray(parent) };
}

/**
 * 获取今天的位置
 */
const getTodayLeftValue = (start, end, dayOff) => {
  const diff = Math.abs(start.diff(end, 'd'));
  let value = 0;
  for (let i = 0; i <= diff; i++) {
    const momentObj = moment(start).add(i, 'd');
    const d = momentObj.days();
    if (!dayOff.includes(d)) {
      value = value + 1;
    }
    if (momentObj.format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')) {
      break;
    }
  }
  return value;
}

/**
 * 获取周视图数据
 */
export const getWeeks = (start, end, center, viewConfig) => {
  const { minDayWidth, periodCount, onlyWorkDay, dayOff } = viewConfig;
  const weeksDay = onlyWorkDay ? (7 - dayOff.length) : 7;
  const startTime = start ? start : moment(center).startOf('w').add(-periodCount, 'w');
  const endTime = end ? end : moment(center).endOf('w').add(periodCount, 'w');
  const diff = Math.abs(startTime.diff(endTime, 'w')) + 1;
  const parent = {};
  const result = [];

  for (let i = 0; i < diff; i++) {
    const momentObj = moment(startTime).add(i * 7, 'd');
    const d = momentObj.format('YYYY-MM-DD');
    const m = momentObj.format('YYYY-MM');
    const periodWidth = weeksDay * minDayWidth;
    const isCurrent = momentObj.format('YYYY-WW') === moment().format('YYYY-WW');
    const base = { time: d, width: periodWidth };

    if (isCurrent) {
      base.isToday = onlyWorkDay ? !dayOff.includes(moment().days()) : true;
      base.left = (onlyWorkDay ? getTodayLeftValue(moment().startOf('w'), moment().endOf('w'), dayOff) : moment().days() || 7) * minDayWidth;
      base.left = base.left - (minDayWidth / 2);
      result.push(base);
    } else {
      result.push(base);
    }

    if (parent[m]) {
      const { width } = parent[m];
      parent[m].width = width + periodWidth;
    } else {
      parent[m] = { width: periodWidth, time: m };
    }
  }

  return { result, parent: _.toArray(parent) };
}

/**
 * 获取月视图数据
 */
export const getMonths = (start, end, center, viewConfig) => {
  const { minDayWidth, periodCount, onlyWorkDay, dayOff } = viewConfig;
  const startTime = start ? start : moment(center).add(-periodCount, 'M');
  const endTime = end ? end : moment(center).add(periodCount, 'M');
  const diff = Math.abs(startTime.diff(endTime, 'M')) + 1;
  const parent = {};
  const result = [];

  for (let i = 0; i < diff; i++) {
    const momentObj = moment(startTime).add(i, 'M');
    const m = momentObj.format('YYYY-MM');
    const y = momentObj.format('YYYY');
    const value = (onlyWorkDay ? getWeekDayCount(momentObj.startOf('month').format('YYYY-MM-DD'), momentObj.endOf('month').format('YYYY-MM-DD'), dayOff) : momentObj.daysInMonth());
    const periodWidth = value * minDayWidth;
    const isCurrent = m === moment().format('YYYY-MM');
    const base = { time: m, width: periodWidth };

    if (isCurrent) {
      base.isToday = onlyWorkDay ? !dayOff.includes(moment().days()) : true;
      base.left = (onlyWorkDay ? getTodayLeftValue(moment().startOf('M'), moment().endOf('M'), dayOff) : Number(moment().format('DD'))) * minDayWidth;
      base.left = base.left - (minDayWidth / 2);
      result.push(base);
    } else {
      result.push(base);
    }

    if (parent[y]) {
      const { width } = parent[y];
      parent[y].width = width + periodWidth;
    } else {
      parent[y] = { width: periodWidth, time: y };
    }
  }

  return { result, parent: _.toArray(parent) };
}

/**
 * 获取季度视图数据
 */
export const getQuarters = (start, end, center, viewConfig) => {
  const { minDayWidth, periodCount, onlyWorkDay, dayOff } = viewConfig;
  const startTime = start ? start : moment(center).startOf('Q').add(-periodCount, 'Q');
  const endTime = end ? end : moment(center).endOf('Q').add(periodCount, 'Q');
  const diff = Math.abs(startTime.diff(endTime, 'Q')) + 1;
  const parent = {};
  const result = [];

  for (let i = 0; i < diff; i++) {
    const momentObj = moment(startTime).add(i, 'Q');
    const m = momentObj.format('YYYY-MM');
    const y = momentObj.format('YYYY');
    const startDay = momentObj.startOf('Q').format('YYYY-MM-DD');
    const endDay = momentObj.endOf('Q').format('YYYY-MM-DD');
    const value = onlyWorkDay ? getWeekDayCount(startDay, endDay, dayOff) : (Math.abs(moment(startDay).diff(moment(endDay), 'd')) + 1);
    const periodWidth = value * minDayWidth;
    const isCurrent = momentObj.format('YYYY-Q') === moment().format('YYYY-Q');
    const base = { time: m, width: periodWidth };

    if (isCurrent) {
      base.isToday = onlyWorkDay ? !dayOff.includes(moment().days()) : true;
      base.left = (onlyWorkDay ? getTodayLeftValue(moment().startOf('Q'), moment().endOf('Q'), dayOff) : Math.abs(moment(startDay).diff(moment(), 'd'))) * minDayWidth;
      base.left = base.left - (minDayWidth / 2);
      result.push(base);
    } else {
      result.push(base);
    }

    if (parent[y]) {
      const { width } = parent[y];
      parent[y].width = width + periodWidth;
    } else {
      parent[y] = { width: periodWidth, time: y };
    }
  }

  return { result, parent: _.toArray(parent) };
}


/**
 * 获取年视图数据
 */
export const getYears = (start, end, center, viewConfig) => {
  const { minDayWidth, periodCount, onlyWorkDay, dayOff } = viewConfig;
  const yearPeriodCount = periodCount / 2;
  const startTime = start ? start : moment(center).startOf('Y').add(-yearPeriodCount, 'Y');
  const endTime = end ? end : moment(center).endOf('Y').add(yearPeriodCount, 'Y');
  const diff = Math.abs(startTime.diff(endTime, 'Y')) + 1;
  const parent = {};
  const result = [];

  for (let i = 0; i < diff; i++) {
    const momentObj = moment(startTime).add(i, 'Y');
    const y = momentObj.format('YYYY');
    // 上半年
    const firstStart = momentObj.format('YYYY-MM-DD');
    const firstEnd = moment(`${y}-06`).endOf('M').format('YYYY-MM-DD');
    const firstValue = onlyWorkDay ? getWeekDayCount(firstStart, firstEnd, dayOff) : Math.abs(moment(firstStart).diff(moment(firstEnd), 'd')) + 1;
    const firstPeriodWidth = firstValue * minDayWidth;
    const first = { time: `${y}-01-01`, width: firstPeriodWidth };
    // 下半年
    const lastStart = `${y}-07-01`;
    const lastEnd = moment(`${y}-12`).endOf('M').format('YYYY-MM-DD');
    const lastValue = onlyWorkDay ? getWeekDayCount(lastStart, lastEnd, dayOff) : Math.abs(moment(lastStart).diff(moment(lastEnd), 'd')) + 1;
    const lastPeriodWidth = lastValue * minDayWidth;
    const last = { time: `${y}-07-01`, width: lastPeriodWidth };

    const periodWidth = firstPeriodWidth + lastPeriodWidth;
    const isCurrent = momentObj.year() === moment().year();

    if (isCurrent) {
      const m = Number(moment().format('MM'));
      const isToday = onlyWorkDay ? !dayOff.includes(moment().days()) : true;
      if (m <= 6) {
        first.isToday = isToday;
        first.left = (onlyWorkDay ? getTodayLeftValue(moment(firstStart), moment(firstEnd), dayOff) : Math.abs(moment(firstStart).diff(moment(), 'd'))) * minDayWidth;
        first.left = first.left - (minDayWidth / 2);
      } else {
        last.isToday = isToday;
        last.left = (onlyWorkDay ? getTodayLeftValue(moment(lastStart), moment(lastEnd), dayOff) : Math.abs(moment(lastStart).diff(moment(), 'd'))) * minDayWidth;
        last.left = last.left - (minDayWidth / 2);
      }
      result.push(first, last);
    } else {
      result.push(first, last);
    }

    if (parent[y]) {
      const { width } = parent[y];
      parent[y].width = width + periodWidth;
    } else {
      parent[y] = { width: periodWidth, time: y };
    }
  }

  return { result, parent: _.toArray(parent) };
}

/**
 * 一段时间内包含多少个工作日
 */

const getWeekDayCount = (start, end, dayOff) => {
  const weekStart = moment(start).endOf('w').format('YYYY-MM-DD');
  const weekEnd = moment(end).startOf('w').add(-1, 'd').format('YYYY-MM-DD');
  const diff = moment(weekEnd).diff(moment(weekStart), 'd');
  const count = (diff / 7) * (7 - dayOff.length);
  if (count > 0) {
    const s = getWeekDayCount2(start, weekStart, dayOff);
    const e = getWeekDayCount2(moment(weekEnd).add(1, 'd').format('YYYY-MM-DD'), end, dayOff);
    return s + count + e;
  } else {
    return getWeekDayCount2(start, end, dayOff);
  }
}

const getWeekDayCount2 = (start, end, dayOff) => {
  const diff = moment(end).diff(moment(start), 'd');
  let count = 0;
  for(let i = 0; i <= diff; i++) {
    const day = moment(start).add(i, 'd');
    const days = day.days();
    if (!dayOff.includes(days)) {
      count = count + 1;
    }
  }
  return count;
}

/**
 * 判断指定天是否是一周的最后一天
 */
export const isWeekEndDay = (date, type, viewConfig) => {
  const { onlyWorkDay, dayOff } = viewConfig;
  if (type !== PERIOD_TYPE.day) {
    return false;
  }
  const day = moment(date).days();
  if (onlyWorkDay) {
    const weekWorkDays = [1, 2, 3, 4, 5, 6, 0].filter(item => !dayOff.includes(item));
    const max = weekWorkDays.filter(item => item === 0).length ? 0 : Math.max.apply(null, weekWorkDays);
    return day === max;
  } else {
    return day === 0;
  }
}


/**
 * 获取一组记录里最早和最晚的时间
 */
export const getRowsTime = (rows) => {
  const f = t => t ? moment(t).valueOf() : 0;
  const d = t => moment(t).format('YYYY-MM-DD');
  const data = rows.filter(item => (item.dragBeforeStartTime || item.startTime) && (item.dragBeforeEndTime || item.endTime));
  const startTimes = data.map(item => f(item.dragBeforeStartTime || item.startTime)).filter(item => item);
  const endTimes = data.map(item => f(item.dragBeforeEndTime || item.endTime)).filter(item => item);
  const startTime = startTimes.length ? d(Math.min.apply(null, startTimes)) : undefined;
  const endTime = endTimes.length ? d(Math.max.apply(null, endTimes)) : undefined;
  return {
    startTime,
    endTime
  }
}

/**
 * 绘制时间块
 */
const calculateTimeBlock = (item, periodList, viewConfig) => {
  const { minDayWidth, onlyWorkDay, periodType, dayOff, milepost } = viewConfig;
  // const startTime = item.groupId ? (item.dragStartTime || item.startTime) : item.startTime;
  // const endTime = item.groupId ? (item.dragEndTime || item.endTime) : item.endTime;
  const startTime = item.dragStartTime || item.startTime;
  const endTime = item.dragEndTime || item.endTime;
  const minStartTime = periodList[0].time;
  const maxEndTime = periodList[periodList.length - 1].time;
  const isMilepost = item[milepost] === '1';

  if (_.isEmpty(startTime) || _.isEmpty(endTime) || moment(startTime).isAfter(endTime)) {
    return {
      left: 0,
      width: 0
    }
  }
  if (moment(startTime).isSameOrAfter(maxEndTime)) {
    return {
      right: 0,
      width: 0
    }
  }
  if (moment(minStartTime).isSameOrAfter(endTime)) {
    return {
      left: 0,
      width: 0
    }
  }

  let startLeft = 0;
  let endLeft = 0;

  if (moment(startTime).isSameOrAfter(minStartTime)) {
    const dayCount = onlyWorkDay ? getWeekDayCount(minStartTime, moment(startTime).add(-1, 'd').format('YYYY-MM-DD'), dayOff) : moment(startTime).diff(moment(minStartTime), 'd');
    startLeft = dayCount * minDayWidth;
    if (periodType === PERIOD_TYPE.day && (onlyWorkDay ? !dayOff.includes(moment(startTime).days()) : true) && !isMilepost) {
      startLeft = startLeft + timeToPercentage(startTime, minDayWidth);
    }
  }
  if (moment(endTime).isSameOrAfter(minStartTime)) {
    const dayCount = onlyWorkDay ? getWeekDayCount(minStartTime, endTime, dayOff) : moment(endTime).diff(moment(minStartTime), 'd') + 1;
    endLeft = dayCount * minDayWidth;
    if (periodType === PERIOD_TYPE.day && (onlyWorkDay ? !dayOff.includes(moment(endTime).days()) : true) && !isMilepost) {
      const endHoursWidth = timeToPercentage(endTime, minDayWidth);
      if (endHoursWidth) {
        endLeft = endLeft + endHoursWidth - minDayWidth;
      }
    }
  }

  return {
    left: startLeft,
    width: endLeft - startLeft,
  }
}


/**
 * 计算分组时间块的位置和宽度
 */
export const groupingTimeBlock = (grouping, periodList, viewConfig) => {
  if (_.isEmpty(periodList)) return grouping;
  grouping.forEach(item => {
    const data = calculateTimeBlock(item, periodList, viewConfig);
    item.rows.forEach(row => {
      delete row.left;
      delete row.right;
      const data = calculateTimeBlock(row, periodList, viewConfig);
      Object.assign(row, data);
    });
    Object.assign(item, data);
  });
}

/**
 * 为时间块添加颜色
 */
export const fillRecordsTimeBlockColor = (grouping, colorControl) => {
  grouping.forEach(item => {
    item.rows.forEach(row => {
      fillRecordTimeBlockColor(row, colorControl);
    });
  });
  return grouping;
}

export const fillRecordTimeBlockColor = (record, colorControl = {}) => {
  const { controlId, options } = colorControl;
  const defaultColor = '#2196F3';
  if (record[controlId]) {
    const value = JSON.parse(record[controlId]);
    const colorId = _.isArray(value) ? value[0] : null;
    const { color } = _.find(options, { key: colorId }) || {};
    record.color = color || defaultColor;
  } else {
    record.color = defaultColor;
  }
  return record;
}

/**
 * 处理记录时间
 */
export const formatRecordTime = (row, { startId, endId, milepost }) => {
  let startTime = row[startId];
  let endTime = row[endId];
  if (row[milepost] == '1') {
    if (startTime) {
      endTime = startTime;
    } else if (endTime) {
      startTime = endTime;
    }
  }
  return {
    ...row,
    startTime,
    endTime,
    diff: endTime && startTime ? moment(endTime).diff(moment(startTime), 'd') + 1 : 0
  }
}

/**
 * 把 allowweek 和 unweekday 转成适用 moment 的 days()
 */
export const formatWeekDay = (allowweek) => {
  return allowweek ? allowweek.replace('7', '0').split('').map(item => Number(item)) : [];
}

/**
 * 找到记录的 index
 */
export const getRecordIndex = (id, grouping, withoutArrangementVisible) => {
  let index = null;
  for(let i = 0; i < grouping.length; i++) {
    let { groupingIndex } = grouping[i];
    let rows = grouping[i].rows.filter(item => withoutArrangementVisible ? true : item.diff > 0);
    for(let j = 0; j < rows.length; j++) {
      if (id === rows[j].rowid) {
        index = groupingIndex + j + 1;
        break;
      }
    }
    if (_.isNumber(index)) {
      break;
    }
  }
  return index;
}

/**
 * 排序分组
 */
export const sortGrouping = (grouping) => {
  const empty = grouping.filter(item => item.key == '-1');
  const sortGrouping = grouping.filter(item => item.key !== '-1').sort((a, b) => a.sort - b.sort);
  return sortGrouping.concat(empty);
}

/**
 * 把一个日期时间的小时转成一个宽度占比
 */
export const timeToPercentage = (time, width) => {
  const [ date, hours ] = time.split(' ');
  if (hours) {
    const maxTime = 2359;
    const value = Number(hours.slice(0, 5).replace(/:/, ''));
    const percentage = ((maxTime - value) / maxTime) * 100;
    return ((100 - percentage) / 100) * width;
  } else {
    return 0;
  }
}

/**
 * 把一个百分比转成小时时间
 */
export const percentageToTime = (percentage) => {
  return (23.99 * 60 / 100 * percentage) / 60;
}


