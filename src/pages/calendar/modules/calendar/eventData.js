import moment from 'moment';

const EVENT_CATEGORY_COLOR_CLASSES = {
  '#EF9A9A': 'reactCalendarEventColorRed',
  '#F44336': 'reactCalendarEventColorRed',
  '#CE93D8': 'reactCalendarEventColorViolet',
  '#9C27B0': 'reactCalendarEventColorViolet',
  '#BCAAA4': 'reactCalendarEventColorBrown',
  '#795548': 'reactCalendarEventColorBrown',
  '#FFCC80': 'reactCalendarEventColorOrange',
  '#FF9800': 'reactCalendarEventColorOrange',
  '#90CAF9': 'reactCalendarEventColorBlue',
  '#2196F3': 'reactCalendarEventColorBlue',
  '#1677FF': 'reactCalendarEventColorBlue',
  '#A5D6A7': 'reactCalendarEventColorGreen',
  '#4CAF50': 'reactCalendarEventColorGreen',
  '#FFF59D': 'reactCalendarEventColorYellow',
  '#FFD800': 'reactCalendarEventColorYellow',
  '#E6E6E6': 'reactCalendarEventColorGrey',
  '#9E9E9E': 'reactCalendarEventColorGrey',
};

const WORK_CALENDAR_COLORS = { backgroundColor: '#90CAF9', borderColor: '#2196F3' };
const OTHER_CALENDAR_COLORS = new Set(['#E6E6E6', '#9E9E9E']);

export const getCalendarEventId = event => String(event.eventID || event.id || '');

export const getCalendarEventIds = events => new Set((events || []).map(getCalendarEventId).filter(Boolean));

const getCalendarEventKey = event =>
  [
    getCalendarEventId(event),
    event.recurTime || '',
    event.start || event.startTime || '',
    event.end || event.endTime || '',
  ].join('|');

export const mergeCalendarEvents = (...eventGroups) => {
  const eventKeys = new Set();

  return eventGroups
    .flatMap(events => events || [])
    .filter(event => {
      const eventKey = getCalendarEventKey(event);

      if (eventKeys.has(eventKey)) return false;

      eventKeys.add(eventKey);
      return true;
    });
};

export const isWorkCalendarEvent = (event, nonWorkCalendarEventIds) =>
  Boolean(nonWorkCalendarEventIds && !event.isTask && !nonWorkCalendarEventIds.has(getCalendarEventId(event)));

export const isOtherCalendarEvent = event =>
  [event.borderColor, event.backgroundColor].some(color => OTHER_CALENDAR_COLORS.has(color?.toUpperCase()));

export const normalizeEventCategoryColor = (event, isWorkCalendar, preserveOtherCalendarColor = false) =>
  isWorkCalendar && !event.isTask && !(preserveOtherCalendarColor && isOtherCalendarEvent(event))
    ? { ...event, ...WORK_CALENDAR_COLORS }
    : event;

export const getCategoryIds = categoryIds => {
  if (categoryIds === null) return 'All';
  return categoryIds.length ? categoryIds.join(',') : '';
};

export const getEventCategoryColorClass = event => {
  const colors = [event.borderColor, event.backgroundColor];

  for (const color of colors) {
    const colorClassName = EVENT_CATEGORY_COLOR_CLASSES[color?.toUpperCase()];
    if (colorClassName) return colorClassName;
  }

  return 'reactCalendarEventColorBlue';
};

export const normalizeCalendarEvent = (calendar, isWorkCalendar, preserveOtherCalendarColor = false) => {
  const calendarWithCategoryColor = normalizeEventCategoryColor(calendar, isWorkCalendar, preserveOtherCalendarColor);
  const startValue = calendarWithCategoryColor.start || calendarWithCategoryColor.startTime;
  const endValue = calendarWithCategoryColor.end || calendarWithCategoryColor.endTime;
  const start = moment(startValue);
  const end = moment(endValue);
  let allDay = !!calendarWithCategoryColor.allDay;
  const editable = !calendarWithCategoryColor.isTask && Boolean(calendarWithCategoryColor.editable);

  if (!allDay && start.isValid() && end.isValid() && !start.isSame(end, 'day')) {
    allDay = true;
  } else if (allDay && calendarWithCategoryColor.isAllDay === false && start.isSame(end, 'day')) {
    allDay = false;
  }

  const normalizedStart = allDay ? moment.parseZone(startValue).startOf('day') : start;
  let normalizedEnd = end.isValid() ? (allDay ? moment.parseZone(endValue) : end.clone()) : normalizedStart.clone();

  if (allDay) {
    // 接口沿用旧 FullCalendar 的约定：全天日程的结束日期为排他边界，时分秒不参与跨度计算。
    normalizedEnd = normalizedEnd.startOf('day');
    if (!normalizedEnd.isAfter(normalizedStart, 'day')) {
      normalizedEnd.add(1, 'day');
    }
  }

  return {
    ...calendarWithCategoryColor,
    id: calendarWithCategoryColor.id || calendarWithCategoryColor.eventID,
    start: start.isValid()
      ? allDay
        ? normalizedStart.format('YYYY-MM-DD')
        : normalizedStart.toISOString()
      : calendarWithCategoryColor.start,
    end: normalizedEnd.isValid()
      ? allDay
        ? normalizedEnd.format('YYYY-MM-DD')
        : normalizedEnd.toISOString()
      : calendarWithCategoryColor.end,
    allDay,
    canEdit: editable,
    editable,
    durationEditable: editable,
    startEditable: editable,
  };
};

export const getEventTimeDelta = (info, isResize) => {
  if (!isResize) return info.delta || {};

  const { startDelta = {}, endDelta = {} } = info;

  return {
    days: (endDelta.days || 0) - (startDelta.days || 0),
    milliseconds: (endDelta.milliseconds || 0) - (startDelta.milliseconds || 0),
  };
};
