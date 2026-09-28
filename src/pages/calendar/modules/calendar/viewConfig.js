import moment from 'moment';

export const VIEW_TYPES = {
  agendaDay: 'timeGridDay',
  agendaWeek: 'timeGridWeek',
  month: 'dayGridMonth',
};

export const LEGACY_VIEW_TYPES = {
  timeGridDay: 'agendaDay',
  timeGridWeek: 'agendaWeek',
  dayGridMonth: 'month',
};

export const getViewItems = () => [
  { label: _l('日'), key: 'agendaDay' },
  { label: _l('周'), key: 'agendaWeek' },
  { label: _l('月'), key: 'month' },
  { label: _l('列表'), key: 'list' },
];

export const getCalendarLocale = () => ({
  code: window.getCurrentLang() || 'zh-cn',
  week: { dow: 0, doy: 4 },
  allDayText: _l('全天'),
  moreLinkText: count => _l('另外 %0 个', count),
  noEventsText: _l('暂无日程'),
});

const DATE_TOKEN_UNITS = { Y: 'year', M: 'month', D: 'day' };

const formatWeekRange = (start, end) => {
  // 按日期 token 合并共同前后缀，兼容不同语言的年月日顺序，避免按字符截断日期。
  const parts = _l('YYYY 年 MMMD日').match(/\[[^\]]*\]|Y+|M+|Do|D+|./g);

  const isSamePart = part => {
    const unit = DATE_TOKEN_UNITS[part[0]];
    return !unit || start.isSame(end, unit);
  };

  const formatParts = (date, from, to) =>
    parts
      .slice(from, to)
      .map(part => date.format(part))
      .join('');
  let left = 0;
  let right = parts.length;

  while (left < right && isSamePart(parts[left])) left += 1;
  while (right > left && isSamePart(parts[right - 1])) right -= 1;

  const range = left < right ? `${formatParts(start, left, right)} - ${formatParts(end, left, right)}` : '';
  return `${formatParts(start, 0, left)}${range}${formatParts(start, right, parts.length)}`;
};

const getWeekStart = (date, firstDay) =>
  date
    .clone()
    .subtract((date.day() - firstDay + 7) % 7, 'days')
    .startOf('day');

const getCalendarWeekNumber = (date, firstDay) => {
  // 保留当前语言的首周规则，按用户设置重新计算周边界。
  const firstWeekDate = 7 + firstDay - date.localeData().firstDayOfYear();
  const firstWeekStart = year => getWeekStart(moment([year, 0, 1]).add(firstWeekDate - 1, 'days'), firstDay);
  const year = date.year();
  let start = firstWeekStart(year);

  if (date.isBefore(start)) start = firstWeekStart(year - 1);
  else if (!date.isBefore(firstWeekStart(year + 1))) start = firstWeekStart(year + 1);

  return date.diff(start, 'weeks') + 1;
};

export const getCalendarTitle = (viewType, start, end, weekStart = 0) => {
  if (viewType === 'timeGridDay') return moment(start).format(_l('YYYY 年 MMMD日 dddd'));
  if (viewType === 'timeGridWeek') {
    const firstDay = getWeekStart(moment(start), weekStart);
    const lastDay = end === undefined ? firstDay.clone().add(6, 'days') : moment(end).subtract(1, 'day');
    return `${formatWeekRange(firstDay, lastDay)} ${_l('第%0周', getCalendarWeekNumber(firstDay, weekStart))}`;
  }

  if (viewType === 'dayGridMonth') return moment(start).format(_l('YYYY 年 MMM'));
  return moment().format(_l('YYYY 年 MMMD日 dddd'));
};
