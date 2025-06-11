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
