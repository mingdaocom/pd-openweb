import dayjs from 'dayjs';
import moment from 'moment';

const padDatePart = value => String(value).padStart(2, '0');

/** 按指定周起始日（0 为周日）计算年周数，沿用日程的语言首周规则。 */
export function getWeekNumber(date, weekBegin = 1) {
  const current = moment(date);
  const firstWeekDate = 7 + weekBegin - current.localeData().firstDayOfYear();

  const getFirstWeekStart = year => {
    const anchor = current
      .clone()
      .year(year)
      .startOf('year')
      .add(firstWeekDate - 1, 'days');

    return anchor.subtract((anchor.day() - weekBegin + 7) % 7, 'days');
  };

  const year = current.year();
  let firstWeekStart = getFirstWeekStart(year);

  if (current.isBefore(firstWeekStart)) {
    firstWeekStart = getFirstWeekStart(year - 1);
  } else if (!current.isBefore(getFirstWeekStart(year + 1))) {
    firstWeekStart = getFirstWeekStart(year + 1);
  }

  return current.diff(firstWeekStart, 'week') + 1;
}

/** 将日期格式化为适合文件名后缀的 yyMMddHHmmss。 */
export function formatFileTimestamp(date = new Date()) {
  return `${padDatePart(date.getFullYear() % 100)}${padDatePart(date.getMonth() + 1)}${padDatePart(date.getDate())}${padDatePart(date.getHours())}${padDatePart(date.getMinutes())}${padDatePart(date.getSeconds())}`;
}

/**
 * 按日期运算表达式依次增减指定时间单位，并返回计算结果或错误。
 */
export function calcDate(date, expression) {
  if (!date) {
    return { error: true };
  }

  if (!/^[+-]/.test(expression)) {
    expression = '+' + expression;
  }

  try {
    let result = dayjs(date);
    const regexp = /([/+/-]){1}(\d+(\.\d+)?)+([YQMwdhms]){1}/g;
    let match = regexp.exec(expression);

    while (match) {
      const operator = match[1];
      const number = Number(match[2]);
      const unit = match[4];

      if (/^[+-]$/.test(operator) && number && typeof number === 'number' && /^[YQMwdhms]$/.test(unit)) {
        result = result[operator === '+' ? 'add' : 'subtract'](Math.round(number), unit.replace(/Y/, 'y'));
      }

      match = regexp.exec(expression);
    }

    return { result };
  } catch (err) {
    return { error: err };
  }
}
