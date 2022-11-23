import sheetAjax from 'src/api/worksheet';
import { getAdvanceSetting, browserIsMobile } from 'src/util';
import { setDataFormat, getShowExternalData } from 'src/pages/worksheet/views/CalendarView/util';
import { getCalendarViewType } from 'src/pages/worksheet/views/CalendarView/util';
import { isTimeStyle, getTimeControls, getCalendartypeData } from 'src/pages/worksheet/views/CalendarView/util';
let getRows;
let getRowsIds = [];
export const fetch = searchArgs => {
  return (dispatch, getState) => {
    const { base, filters } = getState().sheet;
    const { worksheetId, viewId, appId, chartId } = base;
    if (getRows && getRowsIds.includes(viewId)) {
      getRows.abort();
    }
    getRowsIds.push(viewId);
    getRows = sheetAjax.getFilterRows({
      appId,
      viewId: viewId,
      worksheetId: worksheetId,
      status: 1,
      pageIndex: 1,
      sortControls: searchArgs.sortControls,
      reportId: chartId || undefined,
      pageSize: 10000000,
      ..._.pick(searchArgs, [
        'keyWords',
        'searchType',
        'filterControls',
        'filtersGroup',
        'isUnRead',
        'kanbanKey',
        'layer',
        'beginTime', //用于日历视图的开始时间和结束时间
        'endTime',
      ]),
    });
    getRows.then(res => {
      getRowsIds = getFilterRowsIds.filter(o => o !== viewId);
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
    let list = [];
    calendar.map(item => {
      let data = setDataFormat({
        ...item,
        // allowNoBegin: true, //允许开始时间为空的数据
        worksheetControls: controls,
        currentView: views.find(o => o.viewId === viewId) || {},
        calendarData,
      });
      list.push(...data);
    });
    dispatch({ type: 'CHANGE_CALENDAR_FORMAT', data: list });
    dispatch({ type: 'CHANGE_MOBILE_CURRENTDATA', data: list });
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
    const { base = {} } = getState().sheet;
    const { worksheetId, viewId } = base;
    let isMobile = browserIsMobile();
    const initType = dispatch(getInitType());
    if (
      !(getShowExternalData() || []).includes(`${worksheetId}-${viewId}`) &&
      !isMobile &&
      'eventNoScheduled' !== initType
    ) {
      dispatch(getEventScheduledData('eventNoScheduled'));
    }
    dispatch(getEventScheduledData(initType));
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
        date: moment(oldData.start).format('YYYY-MM-DD'),
        res: res,
      });
    } else {
      newArr[index].res.push(oldData);
    }
  });
  return newArr;
};

//整合两组已排期的数据
const getCardByDays = (arrB = [], arrT = []) => {
  let newList = arrT.concat(arrB);
  let newListKeys = _.uniq(newList.map(o => o.date));
  let list = [];
  newListKeys.map(o => {
    list.push({
      date: o,
      res: _.flatMap(newList.filter(item => item.date === o).map(o => o.res)),
    });
  });
  return list;
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
      arr = arr.filter(o => o.res.length > 0 || moment().format('YYYY-MM-DD').isSame(o.date, 'day'));
    }
  }
  let newArr = [];
  if (isAdd) {
    if (addData.length <= 0) {
      newArr = arr;
    }
    if (isUp) {
      newArr = getCardByDays(arr, formatData(addData));
    } else {
      newArr = getCardByDays(formatData(addData), arr);
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
  newArr = newArr.sort((a, b) => {
    return Date.parse(a.date) - Date.parse(b.date);
  });
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
    const { viewId = '', worksheetId } = base;
    const currentView = views.find(o => o.viewId === viewId) || {};
    let {
      calendarType = '0',
      unweekday = '',
      colorid = '',
      begindate = '',
      enddate = '',
      calendarcids = '[]',
    } = getAdvanceSetting(currentView);
    try {
      calendarcids = JSON.parse(calendarcids);
    } catch (error) {
      calendarcids = [];
    }
    let colorList = colorid ? controls.find(it => it.controlId === colorid) || [] : [];
    let timeControls = getTimeControls(controls);
    if (calendarcids.length <= 0) {
      calendarcids = [{ begin: begindate ? begindate : (timeControls[0] || {}).controlId, end: enddate }]; //兼容老数据
    }
    let calendarInfo = calendarcids.map(o => {
      const startData = o.begin ? timeControls.find(it => it.controlId === o.begin) || {} : {};
      const endData = o.end ? timeControls.find(it => it.controlId === o.end) || {} : {};
      return {
        ...o,
        startData,
        startFormat: isTimeStyle(startData) ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD',
        endData,
        endFormat: isTimeStyle(endData) ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD',
      };
    });
    const btnList = isTimeStyle(calendarInfo[0].startData)
      ? 'today prev,next dayGridMonth,timeGridWeek,timeGridDay'
      : 'today prev,next dayGridMonth,dayGridWeek,dayGridDay';
    let viewType = getCalendartypeData()[`${worksheetId}-${viewId}`];
    let typeStr = '';
    if (viewType) {
      if (['dayGridWeek', 'timeGridWeek'].includes(viewType)) {
        typeStr = isTimeStyle(calendarInfo[0].startData) ? 'timeGridWeek' : 'dayGridWeek';
      } else if (['timeGridDay', 'dayGridDay'].includes(viewType)) {
        typeStr = isTimeStyle(calendarInfo[0].startData) ? 'timeGridDay' : 'dayGridDay';
      } else {
        typeStr = viewType;
      }
    }
    dispatch({
      type: 'CHANGE_CALENDAR_DATA',
      data: {
        calendarInfo,
        unweekday,
        colorOptions: colorList.options || [],
        btnList,
        initialView: typeStr ? typeStr : getCalendarViewType(calendarType, calendarInfo[0].startData),
      },
    });
  };
}

export const getInitType = () => {
  return (dispatch, getState) => {
    let type = window.localStorage.getItem('CalendarShowExternalTypeEvent');
    if (!type) {
      safeLocalStorageSetItem('CalendarShowExternalTypeEvent', 'eventNoScheduled');
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
let getFilterRowsIds = [];
export function getEventList({
  pageIndex = 1,
  typeEvent = 'eventNoScheduled',
  keyWords = '',
  isAdd = false,
  isUp = false,
  cb = null,
}) {
  return (dispatch, getState) => {
    const { calendarview, controls, views, base, filters } = getState().sheet;
    const { calendarData, calenderEventList = {} } = calendarview;
    const { appId, worksheetId, viewId } = base;
    const currentView = views.find(o => o.viewId === viewId) || {};
    const { calendarInfo = [] } = calendarData;
    if (isUp && [`${typeEvent}UpIndex`] === pageIndex) {
      return;
    }
    if ([`${typeEvent}Index`] === pageIndex) {
      return;
    }
    if (getFilterRows && getFilterRowsIds.includes(viewId)) {
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
      filtersGroup: filters.filtersGroup,
    };
    getFilterRowsIds.push(viewId);
    let list = [];
    calendarInfo.map(o => {
      list.push({
        controlId: o.begin,
        datatype: o.startData.type,
        spliceType: 2, //或
        dateRangeType: 1,
        values: [],
      });
    });
    if (typeEvent === 'eventScheduled') {
      let filterControls = [];
      if (!keyWords) {
        if (isUp) {
          //早于今天
          list.map(o => {
            filterControls.push({
              ...o,
              filterType: 15,
              dateRange: 1,
            });
          });
        } else {
          //晚于昨天
          list.map(o => {
            filterControls.push({
              ...o,
              filterType: 13,
              dateRange: 2,
            });
          });
        }
      } else {
        list.map(o => {
          filterControls.push({
            ...o,
            spliceType: 2, //或
            filterType: 8,
            dateRange: 0,
          });
        });
      }
      //已排期
      prams = {
        ...prams,
        sortControls:
          calendarInfo.map(o => {
            //按时间排序, isAsc: true 旧的在前
            return {
              controlId: o.begin,
              datatype: o.startData.type,
              isAsc: !isUp, //向前获取 是新的在前
            };
          }) || [],
        filterControls,
      };
    } else if (typeEvent === 'eventNoScheduled') {
      let filterControls = [];
      //开始时间为空
      list.map(o => {
        filterControls.push({
          ...o,
          spliceType: 1, //且
          filterType: 7,
          dateRange: 0,
        });
      });
      //未排期
      prams = {
        ...prams,
        beginTime: '',
        endTime: '',
        filterControls,
      };
    }
    getFilterRows = sheetAjax.getFilterRows({
      ...prams,
      filterControls: [...(filters.filterControls || []), ...(prams.filterControls || [])],
    });
    let l = calenderEventList[`${typeEvent}Dt`] || [];
    getFilterRows.then(rowsData => {
      getFilterRowsIds = getFilterRowsIds.filter(o => o !== viewId);
      let s = rowsData.data;
      if (keyWords) {
        let seachDataList = [];
        s.map(it => {
          seachDataList.push(
            ...setDataFormat({
              ...it,
              worksheetControls: controls,
              currentView,
              calendarData,
              byRowId: true, //根据rowId返回一条
            }),
          );
        });
        dispatch({
          type: 'CHANGE_CALENDAR_LIST',
          data: {
            ...calenderEventList,
            keyWords,
            seachData: seachDataList,
          },
        });
        dispatch({ type: 'CHANGE_CALENDAR_LOADING', data: false });
      } else {
        if (isAdd) {
          l = isUp ? s.concat(l) : l.concat(s);
        } else {
          l = s;
        }
        let events = [];
        s.map(it => {
          events.push(
            ...setDataFormat({
              ...it,
              worksheetControls: controls,
              byRowId: typeEvent !== 'eventScheduled', //根据rowId
              currentView,
              calendarData,
            }),
          );
        });
        //已排期需要排序
        if (typeEvent === 'eventScheduled') {
          events = events.sort((a, b) => {
            return Date.parse(a.start) - Date.parse(b.start);
          });
        }
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
      let da = [];
      seachData.map((it, i) => {
        if (it.extendedProps.rowid === rowId) {
          da.push(
            ...setDataFormat({
              ..._.omit(data, ['allowedit', 'allowdelete']),
              worksheetControls: controls,
              currentView,
              calendarData,
              byRowId: true, //根据rowId
            }),
          );
        } else {
          da.push(it);
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
        let events = [];
        da.map(it => {
          events.push(
            ...setDataFormat({
              ...it,
              worksheetControls: controls,
              byRowId: typeEvent !== 'eventScheduled', //根据rowId
              currentView,
              calendarData,
            }),
          );
        });
        events =
          typeEvent === 'eventScheduled' //非排期数据不需要重新根据时间排序
            ? events.sort((a, b) => {
                return Date.parse(a.start) - Date.parse(b.start);
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

export const mobileIsShowMoreClick = flag => (dispatch, getState) => {
  dispatch({
    type: 'SHOW_MOBILE_MORE_CLICK',
    flag,
  });
};

export const changeMobileCurrentData = data => (dispatch, getState) => {
  dispatch({
    type: 'CHANGE_MOBILE_CURRENTDATA',
    data,
  });
};

export const changeMobileCurrentDate = date => (dispatch, getState) => {
  dispatch({
    type: 'CHANGE_MOBILE_CURRENTDATE',
    date,
  });
};
