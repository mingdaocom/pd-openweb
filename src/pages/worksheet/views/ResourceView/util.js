import dayjs from 'dayjs';
import _ from 'lodash';
import moment from 'moment';
import { renderTitleByViewtitle } from 'src/pages/worksheet/views/util.js';
import { renderText as renderCellText } from 'src/utils/control';
import { dateConvertToUserZone } from 'src/utils/project';
import { lineBottomHeight, lineHeight, minHeightObj, timeWidth, timeWidthHalf, types } from './config';

//获取年的时间数组
export const getTimesByYear = dateData => {
  const month = [];
  for (let i = 0; i < 12; i++) {
    month.push({
      time: i + 1,
      timeStr: i + 1,
      date: `${moment(dateData).format('YYYY')}/${i + 1}/01 00:00`,
    });
  }
  return month;
};
//获取某年的日历数组
export const getViewTimesByYear = (view, date = moment()) => {
  return {
    list: [
      {
        date: !date ? moment() : moment(date),
        times: getTimesByYear(!date ? moment() : moment(date)),
      },
    ],
    title: `${moment(!date ? moment() : moment(date)).format('YYYY')}`,
  };
};
//获取某个月的日历数组
export const getViewTimesByMonth = (view, time) => {
  const month = time ? moment(time).month() + 1 : moment().month() + 1;
  const year = time ? moment(time).year() : moment().year();
  const getAllDaysInMonth = (month, year) =>
    Array.from({ length: new Date(year, month, 0).getDate() }, (_, i) => ({
      date: new Date(year, month - 1, i + 1),
      dateStr: new Date(year, month - 1, i + 1).getDate(),
      dayOfWeek: new Date(year, month - 1, i + 1).getDay() === 0 ? 7 : new Date(year, month - 1, i + 1).getDay(),
    }));
  const list = getAllDaysInMonth(month, year).filter(
    o => (_.get(view, 'advancedSetting.unweekday') || '').indexOf(o.dayOfWeek + '') < 0,
  );
  return {
    list,
    title: `${moment((list[0] || {}).date).format('YYYY/MM/D')} - ${moment((list[list.length - 1] || {}).date).format(
      'D',
    )}`,
  };
};

//获取某个周时间数组
export const getViewTimesByWeek = (view, date = moment()) => {
  function getWeekDates(date, firstDayOfWeek) {
    // 设置周几为一周的第一天
    let startOfWeek = moment(date).weekday(firstDayOfWeek - 1); // weekday() 方法返回的周几是从0开始的，所以需要减1
    if (startOfWeek.isAfter(moment(date))) {
      startOfWeek = startOfWeek.subtract(7, 'days');
    }
    // 获取一周的所有日期
    let dates = [];
    for (let i = 0; i < 7; i++) {
      let dateT = moment(startOfWeek).add(i, 'days');
      dates.push({
        date: dateT,
        dateStr: moment(dateT).format('D'),
        dayOfWeek: moment(dateT).day() === 0 ? 7 : moment(dateT).day(),
        times: [
          {
            time: 0,
            amOrPm: 'am',
            // timeStr: hN,
            date: moment(moment(moment(dateT).format('YYYY/MM/D 00:00:00'))).format('YYYY/MM/D HH:mm'),
          },
          {
            time: 12,
            amOrPm: 'pm',
            // timeStr: hN,
            date: moment(moment(moment(dateT).format('YYYY/MM/D 12:00:00'))).format('YYYY/MM/D HH:mm'),
          },
        ],
      });
    }
    return dates;
  }
  const firstDayOfWeek = Number(_.get(view, 'advancedSetting.weekbegin') || '1'); // 周日是7
  const list = getWeekDates(!date ? moment() : moment(date), firstDayOfWeek).filter(
    o => (_.get(view, 'advancedSetting.unweekday') || '').indexOf(o.dayOfWeek + '') < 0,
  );
  return {
    list,
    title: `${moment((list[0] || {}).date).format('YYYY/MM/D')} - ${moment((list[list.length - 1] || {}).date).format(
      'D',
    )}`,
  };
};

function isTimeInRange(timeToCheck, timeRangesStr) {
  if (!timeRangesStr) {
    return true;
  }
  // 解析时间段字符串为时间段对象数组
  const ranges = timeRangesStr.split('|').map(rangeStr => {
    const [start, end] = rangeStr.split('-').map(time => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes; // 转换为分钟以便比较
    });
    return { start, end };
  });
  // 将时间字符串转换为分钟
  const [hours, minutes] = timeToCheck.split(':').map(Number);
  const timeToCheckInMinutes = hours * 60 + minutes;
  // 检查时间是否在任何一个时间段内
  for (let range of ranges) {
    if (timeToCheckInMinutes >= range.start && timeToCheckInMinutes < range.end) {
      return true; // 时间在范围内
    }
  }
  return false; // 时间不在任何范围内
}

//获取天的时间数组
export const getViewTimes = (view, dateData) => {
  const showtime = _.get(view, 'advancedSetting.showtime') ? getRuleTimes(view) : '';
  const isHour24 = _.get(view, 'advancedSetting.hour24') === '1';
  const hours = [];
  for (let i = 0; i < 24; i++) {
    let data = dayjs().set('hour', i).set('minute', 0);
    if (!showtime || isTimeInRange(dayjs(data, 'HH:mm').format('HH:mm'), showtime)) {
      const hN = dayjs(data).format('H');
      hours.push({
        time: dayjs(data).format(isHour24 ? 'H' : 'h'),
        amOrPm: i < 12 ? 'am' : 'pm',
        timeStr: hN,
        date: moment(moment(moment(dateData).format('YYYY/MM/D 00:00:00')).add(hN, 'h')).format('YYYY/MM/D HH:mm'),
      });
    }
  }
  return hours;
};

//获取天的时间数组
export const getViewTimesByDay = (view, date = moment()) => {
  return {
    list: [
      {
        date: !date ? moment() : moment(date),
        times: getViewTimes(view, !date ? moment() : moment(date)),
      },
    ],
    title: (!date ? moment() : moment(date)).format('YYYY/M/D'),
  };
};

export const getViewTimesList = (view = {}, time) => {
  const type =
    localStorage.getItem(`${view.viewId}_resource_type`) || types[_.get(view, 'advancedSetting.calendarType') || 0];
  switch (type) {
    case 'Year':
      return getViewTimesByYear(view, time);
    case 'Month':
      return getViewTimesByMonth(view, time);
    case 'Week':
      return getViewTimesByWeek(view, time);
    case 'Day':
      return getViewTimesByDay(view, time);
    default:
      return getViewTimesByMonth(view, time);
  }
};
/**
 * 处理记录时间
 */
export const formatRecordTime = (row, view) => {
  const { advancedSetting } = view;
  const { begindate, enddate } = advancedSetting;
  let startTime = dateConvertToUserZone(moment(row[begindate]));
  let endTime = dateConvertToUserZone(moment(row[enddate]));
  return {
    ...row,
    startTime,
    endTime,
    diff: endTime && startTime ? moment(endTime).diff(moment(startTime)) : 0,
  };
};

/**
 * 处理记录位置
 */
export const formatRecordPoint = (row, view, list = [], controls, currentTime) => {
  let { startTime, endTime } = row;
  const type =
    localStorage.getItem(`${view.viewId}_resource_type`) || types[_.get(view, 'advancedSetting.calendarType') || 0];
  const getTimeConfig = (time, isEnd) => {
    let n = -1;
    list.map((o, i) => {
      const key = type === 'Week' ? 'h' : type === 'Month' ? 'd' : 'm';
      // 和当前时间相等
      if (moment(time).isSame(moment(list[i].date))) {
        n = isEnd ? i + 1 : i;
      } else {
        if (i < list.length - 1) {
          if (
            //在当前和下个格子之间
            moment(time).isBetween(moment(list[i].date), moment(list[i + 1].date))
          ) {
            const time1 = moment(list[i].date);
            const time2 = moment(list[i + 1].date);
            // 计算时间差（分钟）//只有日视图支持设置工作时间
            const diffInMinutes = time2.diff(time1, 'minutes');
            //开始时间在两个时间格子之间，且被隐藏，则从下个格子开始
            const isNextStart = !isEnd && type === 'Day' && diffInMinutes > 30;
            n = isEnd || isNextStart ? i + 1 : i;
          }
        } else {
          if (
            moment(time).isBetween(
              moment(list[i].date),
              type === 'Year'
                ? moment(list[i].date).endOf('month')
                : moment(list[i].date).add(type === 'Day' ? 30 : type === 'Week' ? 12 : 1, key),
            )
            //在当前和下个开始时间之间
          ) {
            n = isEnd ? i + 1 : i;
          }
        }
      }
    });
    return n;
  };
  let left = 0;
  let width = 0;

  const isDateStart = (controls.find(o => o.controlId === _.get(view, 'advancedSetting.begindate')) || {}).type === 15;
  const isDateEnd = (controls.find(o => o.controlId === _.get(view, 'advancedSetting.enddate')) || {}).type === 15;
  // 日期字段 格式化开始时间为 00:00:00
  if (isDateStart || ['Month', 'Year'].includes(type)) {
    startTime = moment(startTime).format('YYYY-MM-DD 00:00:00');
  } else {
    if (['Month', 'Year'].includes(type)) {
      startTime = moment(startTime).format('YYYY-MM-DD 00:00:00');
    }
  }
  if (isDateEnd || ['Month', 'Year'].includes(type)) {
    endTime = moment(moment(endTime).format('YYYY-MM-DD 23:59'));
  }
  const endDate = (_.last(list) || {}).date;
  const timeEnd =
    type === 'Month'
      ? moment(endDate).add(1, 'd').subtract(1, 'seconds')
      : type === 'Week'
        ? moment(endDate).add(12, 'h').subtract(1, 'seconds')
        : type === 'Year'
          ? moment(endDate).endOf('month')
          : moment(endDate).add(30, 'minutes').subtract(1, 'seconds');
  let start;
  let end;
  //结束时间早于画布开始时间 或 开始时间晚于画布结束时间
  if (moment((list[0] || {}).date).isAfter(moment(endTime)) || moment(timeEnd).isBefore(moment(startTime))) {
    start = 0;
    end = 0;
  } else {
    //开始时间 是否早于画布开始时间
    const before = moment((list[0] || {}).date).isAfter(moment(startTime));
    //结束时间 是否晚于画布结束时间
    const after = moment(timeEnd).isBefore(moment(endTime), type !== 'Day' ? 'day' : 'second');
    start = !before ? getTimeConfig(startTime) : 0;
    end = !after ? getTimeConfig(endTime, true) : list.length;
  }
  const W = type === 'Day' ? timeWidthHalf : type === 'Week' ? 2 * timeWidth : timeWidth;
  left = Math.floor((start > 0 ? start : 0) * W);
  const right = Math.floor((end > 0 ? end : 0) * W);
  width = right - left;
  let text = _.get(view, 'advancedSetting.viewtitle')
    ? renderTitleByViewtitle(row, controls, view)
    : renderTitle(row, controls);
  if (!isDateStart && ['Year', 'Month'].includes(type)) {
    const isHour24 = _.get(view, 'advancedSetting.hour24') === '1';
    let startT = moment(row.startTime).format(isHour24 ? 'H:mm' : 'h:mm');
    if (type === 'Year') {
      startT = moment(row.startTime).format(isHour24 ? 'MM-DD H:mm' : 'MM-DD h:mm');
    }
    const h = moment(row.startTime).format('H');
    //日期时间，呈现开始时间
    text = `${startT}${isHour24 ? '' : h >= 12 ? 'p' : 'a'} ${text}`;
  }
  function getTextWidthUsingDom(text, font) {
    const span = document.createElement('span');
    span.style.visibility = 'hidden';
    span.style.position = 'absolute';
    span.style.font = font;
    span.textContent = text;
    document.body.appendChild(span);
    const width = span.offsetWidth;
    document.body.removeChild(span);
    return width;
  }
  const r = Math.ceil(getTextWidthUsingDom(text, 13) / width);
  const height = Math.floor(r * lineHeight + (8 + 2));
  const maxHeight = lineHeight * 5 + 8;
  const minHeight = minHeightObj[Number(_.get(view, 'rowHeight') || '0')];
  let timeData = [];
  if (type === 'Month') {
    timeData = [
      (currentTime ? moment(currentTime) : moment()).startOf('month'),
      (currentTime ? moment(currentTime) : moment()).endOf('month'),
    ];
  } else if (type === 'Year') {
    timeData = [
      (currentTime ? moment(currentTime) : moment()).startOf('year'),
      (currentTime ? moment(currentTime) : moment()).endOf('year'),
    ];
  } else if (type === 'Week') {
    function getWeekDates(date, firstDayOfWeek) {
      // 设置周几为一周的第一天
      let startOfWeek = moment(date).weekday(firstDayOfWeek - 1); // weekday() 方法返回的周几是从0开始的，所以需要减1
      if (startOfWeek.isAfter(moment(date))) {
        startOfWeek = startOfWeek.subtract(7, 'days');
      }
      // 获取一周的所有日期
      let dates = [];
      for (let i = 0; i < 7; i++) {
        dates.push(moment(startOfWeek).add(i, 'days'));
      }
      return dates;
    }
    const firstDayOfWeek = Number(_.get(view, 'advancedSetting.weekbegin') || '1'); // 周日是7
    timeData = getWeekDates(!currentTime ? moment() : moment(currentTime), firstDayOfWeek);
  } else {
    timeData = [!currentTime ? moment() : moment(currentTime)];
  }
  const bT = moment(timeData[0]).format('YYYY-MM-DD 00:00:00');
  const eT = moment(timeData[timeData.length - 1]).format('YYYY-MM-DD 23:59:59');
  return {
    left,
    width,
    height: height > maxHeight ? maxHeight : height < minHeight ? minHeight : height,
    text,
    after: moment(eT).isBefore(moment(row.endTime)),
    before: moment(bT).isAfter(moment(row.startTime)),
  };
};

export const calculateTop = (res, view) => {
  const minHeight = minHeightObj[Number(_.get(view, 'rowHeight') || '0')];
  //去除无效数据
  const dataList = res.filter(o => !!o.startTime && !!o.endTime && o.width > 0);
  if (dataList.length <= 0) {
    return {
      data: dataList,
      totalHeight: minHeight,
    };
  }
  // 对数据列表进行排序，按照开始坐标从小到大排序
  dataList.sort((a, b) => a.left - b.left);
  // 存储已分配的 Y 轴位置
  const allocatedYPositions = [];
  // 遍历每个数据项，为其分配 Y 轴位置
  for (let i = 0; i < dataList.length; i++) {
    const currentItem = dataList[i];
    let newYPosition = 0;

    // 尝试找到一个不重叠的 Y 轴位置
    while (true) {
      let isOverlapping = false;

      // 检查当前数据项与已分配的所有 Y 轴位置是否重叠
      for (const allocated of allocatedYPositions) {
        if (
          currentItem.left < allocated.left + allocated.width &&
          currentItem.left + currentItem.width > allocated.left &&
          newYPosition < allocated.top + allocated.height &&
          newYPosition + currentItem.height > allocated.top
        ) {
          isOverlapping = true;
          break;
        }
      }

      // 如果找到了不重叠的 Y 轴位置，跳出循环
      if (!isOverlapping) {
        break;
      }

      // 如果重叠，尝试下一个 Y 轴位置
      newYPosition += 1; // 你可以根据需要调整这个步长
    }

    // 为当前数据项分配 Y 轴位置并将其添加到已分配列表中
    currentItem.top = newYPosition;
    allocatedYPositions.push({
      ...currentItem,
      top: newYPosition,
    });
  }
  // 找到所有元素中最大的top值，并计算出画布的总高度
  function calculateCanvasHeight(elements = []) {
    let maxHeight = 0;
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].top + elements[i].height > maxHeight) {
        maxHeight = elements[i].top + elements[i].height;
      }
    }
    return maxHeight;
  }
  const totalHeight = calculateCanvasHeight(dataList);

  return {
    data: dataList,
    totalHeight: totalHeight > minHeight ? totalHeight : minHeight,
  };
};

export const groupNonOverlappingDates = dateRanges => {
  // 对日期范围数组进行排序，按照开始日期从早到晚的顺序
  const sortedRanges = dateRanges.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  // 创建一个空数组来存储分组后的结果
  const groups = [];

  // 遍历排序后的日期范围数组，将每个日期范围分配到合适的组中
  sortedRanges.forEach(range => {
    // 检查当前日期范围是否与已有的组中的日期范围重叠
    const overlappingGroup = groups.find(
      group =>
        !group.some(item => {
          const startInRange = new Date(item.startTime) <= new Date(range.endTime);
          const endInRange = new Date(item.endTime) >= new Date(range.startTime);
          return startInRange && endInRange;
        }),
    );

    // 如果没有重叠的组，则创建新的组
    if (!overlappingGroup) {
      groups.push([range]);
    } else {
      // 如果有重叠的组，则将当前日期范围添加到重叠的组中
      overlappingGroup.push(range);
    }
  });

  return groups;
};

export const renderTitle = (row, controls) => {
  const titleControl = _.find(controls, { attribute: 1 });
  const value = row[titleControl.controlId];
  const emptyValue = _l('未命名');
  const title = titleControl ? renderCellText({ ...titleControl, value }) : emptyValue;
  return title || emptyValue;
};

export const calculateTimePercentage = (startTimeStr, endTimeStr, type) => {
  // 使用moment将时间字符串转换为moment对象
  const startTime = moment(startTimeStr);
  const endTime = moment(endTimeStr);
  const now = moment();
  // 检查当前时间是否在时间段内
  if (!now.isBetween(startTime, endTime, null, '[]')) {
    return -1; // 当前时间不在指定的时间段内
  }
  // 计算时间段的总毫秒数和当前时间距离开始时间的毫秒数
  const totalMilliseconds = endTime.diff(startTime);
  const currentMilliseconds = now.diff(startTime);
  if (
    (type === 'Day' && currentMilliseconds > moment(startTime).add(0.5, 'h').diff(startTime)) ||
    (type === 'Week' && currentMilliseconds > moment(startTime).add(1, 'h').diff(startTime)) ||
    (type === 'Month' && currentMilliseconds > moment(startTime).add(1, 'd').diff(startTime))
  ) {
    return 100;
  }
  // 计算百分比
  const percentage = (currentMilliseconds / totalMilliseconds) * 100;
  return percentage.toFixed(2); // 返回两位小数的百分比字符串
};
export const getTops = list => {
  return list.map((o, i) => {
    let top = 0;
    if (i > 0) {
      let listN = list.slice(0, i);
      top = _.sum(listN.map(it => it.height + lineBottomHeight + 1));
    }
    return { key: o.key, top, bottom: top + o.height + lineBottomHeight + 1, name: o.name };
  });
};

export const getRuleTimes = view => {
  function parseTimeRanges(str) {
    // 解析字符串为时间段（分钟表示）数组
    return str.split('|').map(range => {
      const [start, end] = range
        .split('-')
        .map(time => parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1]));
      return { start, end };
    });
  }
  function mergeTimeRanges(ranges) {
    ranges.sort((a, b) => a.start - b.start);
    let merged = [];
    let current = null;
    for (let range of ranges) {
      if (!current || range.start <= current.end) {
        // 如果当前没有时间段或新时间段与当前时间段重叠，更新当前时间段
        if (!current) current = { ...range };
        current.end = Math.max(current.end, range.end);
      } else {
        // 如果不重叠，添加当前时间段到结果中，并开始新时间段
        merged.push({ ...current });
        current = { ...range };
      }
    }
    // 添加最后一个时间段（如果存在）
    if (current) merged.push({ ...current });
    return merged;
  }
  function formatMergedRanges(merged) {
    // 格式化合并后的时间段数组为字符串
    return merged
      .map(range => {
        const start = `${Math.floor(range.start / 60)
          .toString()
          .padStart(2, '0')}:${(range.start % 60).toString().padStart(2, '0')}`;
        const end = `${Math.floor(range.end / 60)
          .toString()
          .padStart(2, '0')}:${(range.end % 60).toString().padStart(2, '0')}`;
        return `${start}-${end}`;
      })
      .join('|');
  }
  const timeRangesStr = _.get(view, 'advancedSetting.showtime');
  const ranges = parseTimeRanges(timeRangesStr);
  const merged = mergeTimeRanges(ranges);
  const resultStr = formatMergedRanges(merged);
  return resultStr;
};
