export function calendarLoading(state = false, action) {
  const { type } = action;
  switch (type) {
    case 'CHANGE_CALENDAR_LOADING':
      return action.data;
    default:
      return state;
  }
}

export function calendarIsOver(state = false, action) {
  const { type } = action;
  switch (type) {
    case 'CHANGE_CALENDAR_IS_OVER':
      return action.data;
    default:
      return state;
  }
}
export function calendarViewStart(state = '', action) {
  const { type } = action;
  switch (type) {
    case 'CHANGE_CALENDAR_VIEW_START':
      return action.data;
    default:
      return state;
  }
}

export function calendarViewEnd(state = '', action) {
  const { type } = action;
  switch (type) {
    case 'CHANGE_CALENDAR_VIEW_END':
      return action.data;
    default:
      return state;
  }
}
const stateInit = {
  eventAll: [], //全部
  eventScheduled: [], //已排期
  eventNoScheduled: [], //未排期
  typeEvent: 'eventNoScheduled', //默认显示未排期
  keyWords: '',
  updataRowIds: [],
};

export function calenderEventList(state = stateInit, action) {
  const { type, data } = action;
  switch (type) {
    case 'CHANGE_CALENDAR_LIST':
      return data;
    case 'CHANGE_CALENDAR_CLEAR':
      return {
        ...stateInit,
        typeEvent: !window.localStorage.getItem('CalendarShowExternalTypeEvent')
          ? data.typeEvent
          : window.localStorage.getItem('CalendarShowExternalTypeEvent'),
      };
    default:
      return state;
  }
}

export function editable(state = true, action) {
  const { type, data } = action;
  switch (type) {
    case 'CHANGE_CALENDAR_EDITABLE':
      return data;
    default:
      return state;
  }
}

export function calendarData(state = {}, action) {
  const { type, data } = action;
  switch (type) {
    case 'CHANGE_CALENDAR_DATA':
      return data;
    default:
      return state;
  }
}

export function calendarEventIsAdd(state = false, action) {
  const { type, data } = action;
  switch (type) {
    case 'CALENDAR_EVENT_IS_ADD':
      return data;
    default:
      return state;
  }
}

//日历视图数据
export function calendar(state = [], action) {
  const { type } = action;
  switch (type) {
    case 'CHANGE_CALENDARLIST':
      return action.data;
    default:
      return state;
  }
}

//格式化后日历视图数据
export function calendarFormatData(state = [], action) {
  const { type } = action;
  switch (type) {
    case 'CHANGE_CALENDAR_FORMAT':
      return action.data;
    default:
      return state;
  }
}
// 点击日期更多数据h5显示弹层
export const mobileMoreClickVisible = (state = false, action) => {
  switch (action.type) {
    case 'SHOW_MOBILE_MORE_CLICK':
      return action.flag;
    default:
      return state;
  }
};

// 点击日期当天的数据
export const mobileCurrentCalendatData = (state = [], action) => {
  switch (action.type) {
    case 'CHANGE_MOBILE_CURRENTDATA':
      return action.data;
    default:
      return state;
  }
};

// //点击日期
export const mobileCurrentDate = (state = '', action) => {
  switch (action.type) {
    case 'CHANGE_MOBILE_CURRENTDATE':
      return action.date;
    default:
      return state;
  }
};
