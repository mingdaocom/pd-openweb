const DefaultValueOptions = {
  NONE: 1, // 不设置
  TODAY: 6, // 当日
  THIS_WEEK: 2, // 本周
  LAST_SEVEN_DAYS: 3, // 过去七天
  THIS_MONTH: 4, // 本月
  PICK: 5, // 指定日期（自定义）
};

const InputType = {
  DATE: 17, // 日期
  DATE_TIME: 18, // 日期时间
};

const RangeLengthType = {
  show: 1, // 显示
  hide: 0, // 隐藏
};

const SignType = {
  DATETIMERANGE: '0', // 日期时间段
  LEAVE: '1', // 请假
  OVERTIME: '4', // 加班
  FIELDWORK: '5', // 出差
};

let getRange = type => {
  type = parseInt(type, 10);

  let range = {
    start: null,
    end: null,
  };

  let now = new Date();

  let today = new Date(now);
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  today.setMilliseconds(0);

  if (type === DefaultValueOptions.TODAY) {
    let tomorrow = new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000);

    range = {
      start: today,
      end: new Date(tomorrow.getTime() - 1),
    };
  } else if (type === DefaultValueOptions.THIS_WEEK) {
    let dayOfWeek = today.getDay();
    let weekStart = null;
    let weekEnd = null;
    // 周日
    if (dayOfWeek === 0) {
      weekStart = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
      weekEnd = new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000 - 1);
    } else {
      weekStart = new Date(today.getTime() - (dayOfWeek - 1) * 24 * 60 * 60 * 1000);
      weekEnd = new Date(today.getTime() + (7 - dayOfWeek + 1) * 24 * 60 * 60 * 1000 - 1);
    }

    range = {
      start: weekStart,
      end: weekEnd,
    };
  } else if (type === DefaultValueOptions.LAST_SEVEN_DAYS) {
    range = {
      start: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000),
      end: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000 - 1),
    };
  } else if (type === DefaultValueOptions.THIS_MONTH) {
    let month = today.getMonth();
    let monthStart = new Date(today);
    monthStart.setDate(1);
    let monthEnd = new Date(monthStart);
    // 12 月
    if (month === 11) {
      let year = today.getFullYear();
      monthEnd.setFullYear(year + 1);
      monthEnd.setMonth(0);
    } else {
      monthEnd.setMonth(month + 1);
    }
    monthEnd = new Date(monthEnd.getTime() - 1);

    range = {
      start: monthStart,
      end: monthEnd,
    };
  }

  return range;
};

export { DefaultValueOptions, InputType, RangeLengthType, SignType, getRange };
