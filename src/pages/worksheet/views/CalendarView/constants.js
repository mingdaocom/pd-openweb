import moment from 'moment';
import { getWeekNumber } from 'src/utils/core/date';

const formatWeekTitle = ({ start, end }, weekBegin) => {
  const firstDay = moment([start.year, start.month, start.day]);
  const lastDay = end ? moment([end.year, end.month, end.day]) : firstDay;
  const sameYear = firstDay.isSame(lastDay, 'year');
  const sameMonth = firstDay.isSame(lastDay, 'month');
  const endFormat = sameMonth ? 'DD' : sameYear ? 'MM/DD' : 'YYYY/MM/DD';

  return `${firstDay.format('YYYY/MM/DD')} - ${lastDay.format(endFormat)} ${_l('第%0周', getWeekNumber(firstDay.format('YYYY-MM-DD'), weekBegin))}`;
};

export const TAB_LIST = [
  { key: 'eventAll', txt: _l('全部') },
  { key: 'eventScheduled', txt: _l('已排期') },
  { key: 'eventNoScheduled', txt: _l('未排期') },
];

export const CALENDAR_BUTTON_TEXT = {
  today: _l('今天'),
  month: _l('月%06010'),
  week: _l('周%05034'),
  day: _l('天'),
};

const CALENDAR_VIEW_FORMATS = {
  dayGridMonth: {
    titleFormat: { year: 'numeric', month: '2-digit', day: '2-digit' },
  },
  timeGridDay: {
    titleFormat: { year: 'numeric', month: '2-digit', day: '2-digit' },
  },
  dayGridDay: {
    titleFormat: { year: 'numeric', month: '2-digit', day: '2-digit' },
  },
};

const calendarViewFormatsByWeekBegin = Array.from({ length: 7 }, (_, weekBegin) => {
  const titleFormat = dateInfo => formatWeekTitle(dateInfo, weekBegin);
  return {
    ...CALENDAR_VIEW_FORMATS,
    timeGridWeek: { titleFormat },
    dayGridWeek: { titleFormat },
  };
});

export const getCalendarViewFormats = (weekBegin = 1) => calendarViewFormatsByWeekBegin[weekBegin];

export const EVENT_TAB_KEY_BY_INDEX = {
  0: 'eventAll', //全部
  1: 'eventScheduled', //已排期
  2: 'eventNoScheduled', //未排期
};

export const CARD_WIDTH = 300; // 卡片宽度
