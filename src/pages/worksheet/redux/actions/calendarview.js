import sheetAjax from 'src/api/worksheet';
import { getAdvanceSetting } from 'src/util';
import { setDataFormat } from 'src/pages/worksheet/views/CalendarView/util';
import { getCalendarViewType } from 'src/pages/worksheet/views/CalendarView/util';

let getRows;
export const fetch = searchArgs => {
  return (dispatch, getState) => {
    const { base, filters } = getState().sheet;
    const { worksheetId, viewId, appId } = base;
    if (getRows) {
      getRows.abort();
    }
    getRows = sheetAjax.getFilterRows({
      appId,
      viewId: viewId,
      worksheetId: worksheetId,
      status: 1,
      pageIndex: 1,
      sortControls: searchArgs.sortControls,
      pageSize: 10000000,
      ..._.pick(searchArgs, [
        'keyWords',
        'searchType',
        'filterControls',
        'isUnRead',
        'kanbanKey',
        'layer',
        'beginTime', //用于日历视图的开始时间和结束时间
        'endTime',
      ]),
    });
    getRows.then(res => {
      dispatch({ type: 'CHANGE_CALENDARLIST', data: res.data, resultCode: res.resultCode });
      dispatch(updataEditable(true));
      dispatch(updateFormatData());
    });
  };
};

export function updateFormatData() {
  return (dispatch, getState) => {
    const { views = [], base = {}, controls, calendarview = {} } = getState().sheet;
    const { viewId } = base;
    const { calendar = [], calendarData = {} } = calendarview;
    let list = calendar.map(item => {
      return setDataFormat({
        ...item,
        worksheetControls: controls,
        currentView: views.find(o => o.viewId === viewId) || {},
        calendarData,
      });
    });
    dispatch({ type: 'CHANGE_CALENDAR_FORMAT', data: list });
  };
}

export const refresh = () => {
  return (dispatch, getState) => {
    const { filters, calendarview } = getState().sheet;
    const { calendarViewStart, calendarViewEnd } = calendarview;
    dispatch(
      fetch({
        ...filters,
        beginTime: calendarViewStart,
        endTime: calendarViewEnd,
      }),
    );
    dispatch(fetchExternal());
  };
};

export const fetchExternal = () => {
  return (dispatch, getState) => {
    let show = !!window.localStorage.getItem('CalendarShowExternal');
    if (!show) {
      dispatch(getEventScheduledData('eventNoScheduled'));
    } else {
      dispatch(getEventScheduledData(dispatch(getInitType())));
    }
  };
};

export const updataEditable = data => {
  return (dispatch, getState) => {
    dispatch({ type: 'CHANGE_CALENDAR_EDITABLE', data: data });
  };
};

//格式化处理已排期数据
const formatData = arr => {
  let newArr = [];
  arr.forEach((oldData, i) => {
    let index = -1;
    let alreadyExists = newArr.some((newData, j) => {
      if (moment(oldData.start).isSame(newData.date, 'day')) {
        index = j;
        return true;
      }
    });
    if (!alreadyExists) {
      let res = [];
      res.push(oldData);
      newArr.push({
        date: oldData.start,
        res: res,
      });
    } else {
      newArr[index].res.push(oldData);
    }
  });
  return newArr;
};

// 新数据的时间和老数据的时间重合的情况下，合并该重合的时间数据，否则直接拼接数据
const getSameDay = (arrB = [], arrT = []) => {
  if (arrT.length > 0 && moment((arrB[0] || []).date).isSame((_.last(arrT) || []).date, 'day')) {
    return _.dropRight(arrT)
      .concat([
        {
          date: arrB[0].date,
          res: arrB[0].res.concat(arrT[arrT.length - 1].res),
        },
      ])
      .concat(_.drop(arrB));
  } else {
    return arrT.concat(arrB);
  }
};

const dataResort = obj => {
  let { arr = [], addData = [], isAdd = false, isUp = false, updataRowIds = [] } = obj;
  if (updataRowIds.length > 0) {
    let data = addData.filter(o => updataRowIds.includes(o.extendedProps.rowid));
    if (data.length > 0) {
      //新获取的数据中包含更新的数据,则删除老数据，重新计算
      arr = arr.map(it => {
        let a = it.res.find(d => updataRowIds.includes(d.extendedProps.rowid));
        if (!a) {
          return it;
        } else {
          return {
            ...it,
            res: it.res.filter(d => !updataRowIds.includes(d.extendedProps.rowid)),
          };
        }
      });
      arr = arr.filter(
        o =>
          o.res.length > 0 ||
          moment()
            .format('YYYY-MM-DD')
            .isSame(o.date, 'day'),
      );
    }
  }
  let newArr = [];
  if (isAdd) {
    if (addData.length <= 0) {
      newArr = arr;
    }
    if (isUp) {
      newArr = getSameDay(arr, formatData(addData));
    } else {
      newArr = getSameDay(formatData(addData), arr);
    }
  } else {
    newArr = formatData(addData);
  }
  //今天无数据的情况下，添加今天
  if (newArr.length > 0 && !newArr.find(it => moment().isSame(it.date, 'day'))) {
    let T = newArr.filter(it => moment().isAfter(it.date));
    let B = newArr.filter(it => moment().isBefore(it.date));
    T.push({
      date: moment().format('YYYY-MM-DD'),
      res: [],
    });
    newArr = T.concat(B);
  }
  return newArr;
};

export function changeCalendarTime(start, end) {
  return (dispatch, getState) => {
    dispatch({ type: 'CHANGE_CALENDAR_VIEW_START', data: start });
    dispatch({ type: 'CHANGE_CALENDAR_VIEW_END', data: end });
  };
}

export function getCalendarData() {
  return (dispatch, getState) => {
    const { controls, base, views } = getState().sheet;
    const { viewId = '' } = base;
    const currentView = views.find(o => o.viewId === viewId) || {};
    const { calendarType = '0', unweekday = '', colorid = '', begindate = '', enddate = '' } = getAdvanceSetting(
      currentView,
    );
    let colorList = colorid ? controls.find(it => it.controlId === colorid) || [] : [];
    let timeControls = controls.filter(item => item.controlId !== 'utime' && _.includes([15, 16], item.type));
    let startData = begindate ? timeControls.find(it => it.controlId === begindate) || {} : timeControls[0];
    const btnList =
      startData.type === 16
        ? 'today prev,next dayGridMonth,timeGridWeek,timeGridDay'
        : 'today prev,next dayGridMonth,dayGridWeek,dayGridDay';
    let startFormat = startData.type === 16 ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD';
    let endData = enddate ? timeControls.find(it => it.controlId === enddate) || {} : {};
    let endFormat = endData.type === 16 ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD';
    let viewType = window.localStorage.getItem('CalendarViewType');
    let typeStr = '';
    if (viewType) {
      if (['dayGridWeek', 'timeGridWeek'].includes(viewType)) {
        typeStr = startData.type === 16 ? 'timeGridWeek' : 'dayGridWeek';
      } else if (['timeGridDay', 'dayGridDay'].includes(viewType)) {
        typeStr = startData.type === 16 ? 'timeGridDay' : 'dayGridDay';
      } else {
        typeStr = viewType;
      }
    }
    dispatch({
      type: 'CHANGE_CALENDAR_DATA',
      data: {
        startFormat,
        endFormat,
        startData,
        endData,
        unweekday,
        colorOptions: colorList.options || [],
        btnList,
        initialView: typeStr ? typeStr : getCalendarViewType(calendarType, startData.type),
      },
    });
  };
}

export const getInitType = () => {
  return (dispatch, getState) => {
    let type = window.localStorage.getItem('CalendarShowExternalTypeEvent');
    if (!type) {
      window.localStorage.setItem('CalendarShowExternalTypeEvent', 'eventNoScheduled');
    }
    return type || 'eventNoScheduled';
  };
};

// 获取已排期
export const getEventScheduledData = type => {
  return (dispatch, getState) => {
    if (type === 'eventScheduled') {
      // 早于今天的第一页数据
      dispatch(
        getEventList({
          pageIndex: 1,
          typeEvent: type,
          cb: () => {
            // 晚于昨天的的第一页数据 今天。。。
            dispatch(
              getEventList({
                pageIndex: 1,
                typeEvent: type,
                keyWords: '',
                isAdd: true,
                isUp: true,
              }),
            );
          },
        }),
      );
    } else {
      dispatch(getEventList({ pageIndex: 1, typeEvent: type }));
    }
  };
};

let getFilterRows;
export function getEventList({
  pageIndex = 1,
  typeEvent = 'eventNoScheduled',
  keyWords = '',
  isAdd = false,
  isUp = false,
  cb = null,
}) {
  return (dispatch, getState) => {
    const { calendarview, controls, views, base } = getState().sheet;
    const { calendarData, calenderEventList = {} } = calendarview;
    const { appId, worksheetId, viewId } = base;
    const currentView = views.find(o => o.viewId === viewId) || {};
    const { begindate = '' } = getAdvanceSetting(currentView);
    const { startData = {} } = calendarData;
    if (isUp && [`${typeEvent}UpIndex`] === pageIndex) {
      return;
    }
    if ([`${typeEvent}Index`] === pageIndex) {
      return;
    }
    if (getFilterRows) {
      getFilterRows.abort();
    }
    dispatch({ type: 'CHANGE_CALENDAR_ISOVER', data: true });
    let prams = {
      appId,
      viewId: viewId,
      worksheetId,
      status: 1,
      pageIndex,
      pageSize: keyWords ? 10000 : 20,
      keyWords,
    };
    let obj = {
      controlId: begindate,
      datatype: startData.type,
      spliceType: 1,
      dateRangeType: 1,
      values: [],
    };
    if (typeEvent === 'eventScheduled') {
      let filterControls = [
        //开始时间不为空
        {
          ...obj,
          filterType: 8,
          dateRange: 0,
        },
      ];
      if (!keyWords) {
        if (isUp) {
          filterControls = filterControls.concat(
            //早于今天
            [
              {
                ...obj,
                filterType: 15,
                dateRange: 1,
              },
            ],
          );
        } else {
          filterControls = filterControls.concat(
            //晚于昨天
            [
              {
                ...obj,
                filterType: 13,
                dateRange: 2,
              },
            ],
          );
        }
      }
      //已排期
      prams = {
        ...prams,
        sortControls: [
          //按时间排序, isAsc: true 旧的在前
          {
            controlId: begindate,
            datatype: startData.type,
            isAsc: !isUp, //向前获取 是新的在前
          },
        ],
        filterControls,
      };
    } else if (typeEvent === 'eventNoScheduled') {
      //未排期
      prams = {
        ...prams,
        beginTime: '',
        endTime: '',
        filterControls: [
          //开始时间为空
          {
            ...obj,
            filterType: 7,
            dateRange: 0,
          },
        ],
      };
    }
    getFilterRows = sheetAjax.getFilterRows(prams);
    let l = calenderEventList[`${typeEvent}Dt`] || [];
    getFilterRows.then(rowsData => {
      let s = rowsData.data;
      if (keyWords) {
        let seachData = s.sort((a, b) => {
          return new Date(a[begindate]) - new Date(b[begindate]);
        });
        dispatch({
          type: 'CHANGE_CALENDAR_LIST',
          data: {
            ...calenderEventList,
            keyWords,
            seachData: seachData.map(it =>
              setDataFormat({ ...it, worksheetControls: controls, currentView, calendarData }),
            ),
          },
        });
        dispatch({ type: 'CHANGE_CALENDAR_LOADING', data: false });
      } else {
        s = s.sort((a, b) => {
          return new Date(a[begindate]) - new Date(b[begindate]);
        });
        if (isAdd) {
          l = isUp ? s.concat(l) : l.concat(s);
        } else {
          l = s;
        }
        let events = s.map(it => setDataFormat({ ...it, worksheetControls: controls, currentView, calendarData }));
        let dts = {
          ...calenderEventList,
          [typeEvent]: !isAdd
            ? events
            : isUp
            ? events.concat(calenderEventList[typeEvent])
            : calenderEventList[typeEvent].concat(events),
          [`${typeEvent}Dt`]: l,
          [`${typeEvent}IsAll`]: isUp ? calenderEventList[`${typeEvent}IsAll`] : s.length < 20,
          [`${typeEvent}Index`]: isUp ? calenderEventList[`${typeEvent}Index`] : pageIndex,
          [`${typeEvent}Count`]: isUp ? calenderEventList[`${typeEvent}Count`] : rowsData.count,
          typeEvent,
          keyWords,
          seachData: [],
          updataRowIds: pageIndex === 1 ? [] : calenderEventList.updataRowIds,
          eventScheduledUpIsAll: isUp ? s.length < 20 : calenderEventList.eventScheduledUpIsAll,
          eventScheduledUpIndex: isUp ? pageIndex : calenderEventList.eventScheduledUpIndex, //已排期 今天之前的 pageIndex
          eventScheduledUpCount: isUp ? rowsData.count : calenderEventList.eventScheduledUpCount, //已排期 今天之前的 Count
          eventScheduledDtResort:
            typeEvent === 'eventScheduled'
              ? dataResort({
                  arr: calenderEventList.eventScheduledDtResort || [],
                  addData: events,
                  isUp,
                  isAdd,
                  updataRowIds: calenderEventList.updataRowIds,
                })
              : calenderEventList.eventScheduledDtResort,
        };
        //重新获取已排期的数据 充值已排期今天之前的数据
        if (pageIndex === 1 && typeEvent === 'eventScheduled' && !isUp) {
          dts = {
            ...dts,
            eventScheduledUpIsAll: false,
            eventScheduledUpIndex: 0, //已排期 今天之前的 pageIndex
            eventScheduledUpCount: 0, //已排期 今天之前的 Count
          };
        }
        dispatch({
          type: 'CHANGE_CALENDAR_LIST',
          data: dts,
        });
        dispatch({ type: 'CHANGE_CALENDAR_LOADING', data: false });
      }
      dispatch({ type: 'CHANGE_CALENDAR_ISOVER', data: true });
      if (cb) {
        dispatch({ type: 'CHANGE_CALENDAR_LOADING', data: true });
        cb();
      }
    });
  };
}

export function searchKeys(keyWords) {
  return (dispatch, getState) => {
    const { calendarview } = getState().sheet;
    const { calenderEventList = {} } = calendarview;
    dispatch({
      type: 'CHANGE_CALENDAR_LIST',
      data: {
        ...calenderEventList,
        keyWords,
      },
    });
  };
}

export function searchEventArgs(keyWords, pageIndex) {
  return (dispatch, getState) => {
    const typeEvent = dispatch(getInitType());
    dispatch({ type: 'CHANGE_CALENDAR_LOADING', data: true });
    dispatch(getEventList({ pageIndex, typeEvent, keyWords }));
  };
}

export function updateEventList(pageIndex, isUp) {
  return (dispatch, getState) => {
    const { calendarview } = getState().sheet;
    const { calenderEventList = {} } = calendarview;
    const { keyWords } = calenderEventList;
    const typeEvent = dispatch(getInitType());
    dispatch(getEventList({ pageIndex, typeEvent, keyWords, isAdd: true, isUp }));
  };
}

export function deleteEventList(rowid) {
  return (dispatch, getState) => {
    const { calendarview } = getState().sheet;
    const { calenderEventList = {} } = calendarview;
    const typeEvent = dispatch(getInitType());
    let l = calenderEventList[`${typeEvent}Dt`].filter(o => o.rowid !== rowid);
    let data = calenderEventList[typeEvent].filter(o => o.extendedProps.rowid !== rowid);
    dispatch({
      type: 'CHANGE_CALENDAR_LIST',
      data: {
        ...calenderEventList,
        [typeEvent]: data,
        [`${typeEvent}Dt`]: l,
        [`${typeEvent}Count`]: calenderEventList[`${typeEvent}Count`] - 1,
        [`eventScheduledDtResort`]:
          typeEvent === 'eventScheduled' ? dataResort({ addData: data }) : calenderEventList[`eventScheduledDtResort`],
      },
    });
  };
}

export function refreshEventList() {
  return (dispatch, getState) => {
    const typeEvent = dispatch(getInitType());
    dispatch({
      type: 'CHANGE_CALENDAR_CLEAR',
      data: {
        typeEvent,
      },
    });
    dispatch({ type: 'CHANGE_CALENDAR_LOADING', data: true });
  };
}
//当前新增表单
export function updateCalendarEventIsAdd(data) {
  return (dispatch, getState) => {
    dispatch({
      type: 'CALENDAR_EVENT_IS_ADD',
      data: data,
    });
  };
}

// 更改 已获取的  排期/未排期数据
export function updateEventData(rowId, data, time) {
  return (dispatch, getState) => {
    const { calendarview, controls, base, views } = getState().sheet;
    const { calendarData, calenderEventList = {} } = calendarview;
    const currentView = views.find(o => o.viewId === base.viewId) || {};
    let { keyWords, seachData, eventScheduledDtResort = [], updataRowIds = [] } = calenderEventList;
    const typeEvent = dispatch(getInitType());
    if (keyWords) {
      // 搜索状态 直接更新卡片数据
      let da = seachData.map((it, i) => {
        if (it.extendedProps.rowid === rowId) {
          return setDataFormat({
            ..._.omit(data, ['allowedit', 'allowdelete']),
            worksheetControls: controls,
            currentView,
            calendarData,
          });
        } else {
          return it;
        }
      });
      dispatch({
        type: 'CHANGE_CALENDAR_LIST',
        data: {
          ...calenderEventList,
          seachData: da,
        },
      });
    } else {
      // 更改
      if (typeEvent === 'eventNoScheduled') {
        //未排期直接删除
        dispatch(deleteEventList(rowId));
      } else {
        let da = calenderEventList[`${typeEvent}Dt`] || [];
        let add = false;
        //已排期，判断是否已获取，已获取则更新 否则添加新时间数据
        if (typeEvent === 'eventScheduled') {
          let start = (eventScheduledDtResort[0] || {}).date;
          let end = (eventScheduledDtResort[eventScheduledDtResort.length - 1] || {}).date;
          if (
            !(
              moment(time).isBetween(start, end) ||
              moment(time).isSame(start, 'day') ||
              moment(time).isSame(end, 'day') ||
              calenderEventList[`eventScheduledUpCount`] < 20 ||
              calenderEventList[`eventScheduledCount`] < 20
            )
          ) {
            //更改到未获取的时间段否则添加新时间数据
            add = true;
          }
        }
        if (da.findIndex(it => it.rowid === rowId) < 0) {
          da = da.concat(_.omit(data, ['allowedit', 'allowdelete']));
          add = true;
        } else {
          da = da.map((it, i) => {
            if (it.rowid === rowId) {
              return _.omit(data, ['allowedit', 'allowdelete']);
            } else {
              return it;
            }
          });
        }
        let events = da.map(it => setDataFormat({ ...it, worksheetControls: controls, currentView, calendarData }));
        events =
          typeEvent === 'eventScheduled' //非排期数据不需要重新根据时间排序
            ? events.sort((a, b) => {
                return new Date(a.start) - new Date(b.start);
              })
            : events;
        updataRowIds = add
          ? updataRowIds.includes(rowId)
            ? updataRowIds
            : updataRowIds.concat([rowId])
          : updataRowIds.filter(o => o !== rowId);
        dispatch({
          type: 'CHANGE_CALENDAR_LIST',
          data: {
            ...calenderEventList,
            updataRowIds,
            [typeEvent]: events,
            [`${typeEvent}Dt`]: da,
            eventScheduledDtResort:
              typeEvent === 'eventScheduled'
                ? dataResort({ addData: events })
                : calenderEventList.eventScheduledDtResort,
          },
        });
      }
    }
  };
}