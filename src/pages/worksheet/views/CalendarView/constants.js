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

export const CALENDAR_VIEW_FORMATS = {
  dayGridMonth: {
    titleFormat: { year: 'numeric', month: '2-digit', day: '2-digit' },
  },
  timeGridWeek: {
    titleFormat: { year: 'numeric', month: '2-digit', day: '2-digit' },
  },
  timeGridDay: {
    titleFormat: { year: 'numeric', month: '2-digit', day: '2-digit' },
  },
  dayGridWeek: {
    titleFormat: { year: 'numeric', month: '2-digit', day: '2-digit' },
  },
  dayGridDay: {
    titleFormat: { year: 'numeric', month: '2-digit', day: '2-digit' },
  },
};

export const DEFAULT_COLOR = 'var(--color-primary-transparent)';
export const DEFAULT_BORDER_COLOR_DARK = 'rgba(255, 255, 255, 0.12)';
export const DEFAULT_BORDER_COLOR_LIGHT = 'rgba(0, 0, 0, 0.12)';
export const DEFAULT_TEXT_COLOR = 'var(--color-text-primary)';

export const EVENT_TAB_KEY_BY_INDEX = {
  0: 'eventAll', //全部
  1: 'eventScheduled', //已排期
  2: 'eventNoScheduled', //未排期
};

export const CARD_WIDTH = 300; // 卡片宽度
