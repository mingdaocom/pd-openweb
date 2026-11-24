import moment from 'moment';

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
