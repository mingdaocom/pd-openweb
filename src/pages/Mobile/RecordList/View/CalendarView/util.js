import moment from 'moment';

export const WEEK_DAYS = [_l('日%25011'), _l('一'), _l('二'), _l('三'), _l('四'), _l('五'), _l('六')];
export const WEEKS = [_l('星期日'), _l('星期一'), _l('星期二'), _l('星期三'), _l('星期四'), _l('星期五'), _l('星期六')];

// 根据原始日期时间，格式化显示
export const dateFormat = ({ startData = {}, endData = {}, extendedProps = {} }) => {
  const start = extendedProps[startData.controlId];
  const end = extendedProps[endData.controlId];

  if (!start && !end) return;
  // 没有结束时间
  if (!end) {
    if (moment().isSame(moment(start), 'year')) {
      return moment(start).format('MM月DD日 HH:mm');
    } else {
      return moment(start).format('YYYY年MM月DD日 HH:mm');
    }
  }
  // stat/end同一天
  if (moment(start).isSame(moment(end), 'day') && moment().isSame(moment(start), 'day')) {
    return moment(start).format('[今天] HH:mm') + '~' + moment(end).format('HH:mm');
  } else if (moment(start).isSame(moment(end), 'day') && moment(start).isSame(moment().subtract(1, 'days'), 'day')) {
    return moment(start).format('[昨天] HH:mm') + '~' + moment(end).format('HH:mm');
  } else if (moment(start).isSame(moment(end), 'day') && moment(start).isSame(moment().add(1, 'days'), 'day')) {
    return moment(start).format('[明天] HH:mm') + '~' + moment(end).format('HH:mm');
  }
  // start/end同年
  if (moment(start).isSame(moment(end), 'year')) {
    return moment(start).format('YYYY年MM月DD日 HH:mm') + '~' + moment(end).format('MM月DD日 HH:mm');
  }
  return moment(start).format('YYYY年MM月DD日 HH:mm') + '~' + moment(end).format('YYYY年MM月DD日 HH:mm');
};

// 过滤指定日期的日程数据
// 因为 FullCalendar 对全天事件的结束时间通常是 结束当天的“后半夜”，即不包含结束当天的整天，所以需要根据原始的日期筛选，而不是格式化后的日期
export const filterDailyScheduleData = (calendarFormatData, date) => {
  const targetStart = moment(date).startOf('day');
  const targetEnd = moment(targetStart).endOf('day');

  return calendarFormatData.filter(({ startData, endData, extendedProps }) => {
    const start = extendedProps[startData.controlId];
    const end = extendedProps[endData.controlId];
    const startMoment = moment(start);
    const endMoment = end ? moment(end) : startMoment;

    return (
      startMoment.isBetween(targetStart, targetEnd, null, '[]') || // 开始时间在当天
      endMoment.isBetween(targetStart, targetEnd, null, '[]') || // 结束时间在当天
      (startMoment.isBefore(targetStart) && endMoment.isAfter(targetEnd)) // 跨天包含当天
    );
  });
};

export const getFormateView = (view, formatDataItem) => {
  const { displayControls } = view;
  const { startData, endData } = formatDataItem;
  const controls = [startData.controlId, endData.controlId, ...displayControls].filter(Boolean);
  return {
    ...view,
    displayControls: [...new Set(controls)],
  };
};

// from pc calendar
export const isTimeStyle = (data = {}) => {
  let type = data.type;
  if (type === 30) {
    type = data.sourceControlType;
  }
  return type === 16 || (type === 38 && data.enumDefault === 2 && data.unit !== '3');
};
