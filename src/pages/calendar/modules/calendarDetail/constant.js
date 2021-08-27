import 'modernizr';

export const WEEKDAYS = _.map(new Array(7), (value, index) => {
  return moment()
    .day(index)
    .format('dd');
});

export const RECURLAYERS = [_l('天'), _l('周'), _l('月'), _l('年')];

// 日程重复类型
export const FREQUENCY = {
  NONE: 0,
  DAY: 1,
  WEEK: 2,
  MONTH: 3,
  YEAR: 4,
};

// 日程结束类型
export const RECURTYPE = {
  NONE: '0',
  COUNT: '1',
  DATE: '2',
};

// 日程结束类型
export const REMINDTYPE = {
  NONE: 0,
  MINUTE: 1,
  HOUR: 2,
  DAY: 3,
};

// 日程成员 状态
export const MEMBER_STATUS = {
  UNCONFIRMED: 0,
  CONFIRMED: 1,
  REFUSED: 2,
};

const transEndEventNames = {
  WebkitTransition: 'webkitTransitionEnd',
  MozTransition: 'transitionend',
  OTransition: 'oTransitionEnd',
  transition: 'transitionend',
};

export const transEndEventName = transEndEventNames[Modernizr.prefixed('transition')];
