import _ from 'lodash';
import moment from 'moment';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { OPTION_COLORS_LIST, OPTION_COLORS_LIST_HOVER } from 'src/pages/widgetConfig/config';
import { SYS_CONTROLS_WORKFLOW } from 'src/pages/widgetConfig/config/widget.js';
import { renderTitleByViewtitle } from 'src/pages/worksheet/views/util.js';
import { getAdvanceSetting } from 'src/utils/control';
import { renderText as renderCellText } from 'src/utils/control';
import { isLightColor } from 'src/utils/control';
import { dateConvertToUserZone } from 'src/utils/project';
import { getRecordColor, getRecordColorConfig } from 'src/utils/record';

const defaultColor = '#C9E6FC';
export const eventStr = {
  0: 'eventAll', //全部
  1: 'eventScheduled', //已排期
  2: 'eventNoScheduled', //未排期
};
export const getHoverColor = color => {
  return OPTION_COLORS_LIST_HOVER[OPTION_COLORS_LIST.indexOf(color.toUpperCase())];
};
export const isEmojiCharacter = substring => {
  for (var i = 0; i < substring.length; i++) {
    var hs = substring.charCodeAt(i);
    if (0xd800 <= hs && hs <= 0xdbff) {
      if (substring.length > 1) {
        var ls = substring.charCodeAt(i + 1);
        var uc = (hs - 0xd800) * 0x400 + (ls - 0xdc00) + 0x10000;
        if (0x1d000 <= uc && uc <= 0x1f77f) {
          return true;
        }
      }
    } else if (substring.length > 1) {
      var ls = substring.charCodeAt(i + 1);
      if (ls == 0x20e3) {
        return true;
      }
    } else {
      if (0x2100 <= hs && hs <= 0x27ff) {
        return true;
      } else if (0x2b05 <= hs && hs <= 0x2b07) {
        return true;
      } else if (0x2934 <= hs && hs <= 0x2935) {
        return true;
      } else if (0x3297 <= hs && hs <= 0x3299) {
        return true;
      } else if (
        hs == 0xa9 ||
        hs == 0xae ||
        hs == 0x303d ||
        hs == 0x3030 ||
        hs == 0x2b55 ||
        hs == 0x2b1c ||
        hs == 0x2b1b ||
        hs == 0x2b50
      ) {
        return true;
      }
    }
  }
};
const getAllDay = (data, o) => {
  return data[o.begin] && data[o.end] && getIsOverOneDay(data, o) && moment(data[o.begin]).isBefore(data[o.end]);
};
const getStart = (data, o) => {
  return !data[o.begin] ? '' : moment(data[o.begin]).format(o.startFormat);
};
const getEnd = (data, o) => {
  return !data[o.end] || moment(data[o.begin]).isAfter(data[o.end])
    ? ''
    : moment(!getAllDay(data, o) ? moment(data[o.end]) : moment(data[o.end]).add(1, 'day')).format(o.endFormat);
};
const getIsOverOneDay = (data, o) => {
  return (
    moment(data[o.end]).format('YYYYMMDD') - moment(data[o.begin]).format('YYYYMMDD') >= 1 ||
    moment(data[o.end]).diff(moment(data[o.begin]), 'minutes') >= 1439
  );
};
const getTitleControls = worksheetControls => {
  return worksheetControls.find(item => item.attribute === 1) || [];
};
const getStringColor = (calendarData, data, currentView) => {
  const { colorOptions = [] } = calendarData;
  const { colorid = '' } = getAdvanceSetting(currentView);
  let coloridData = data[colorid] ? JSON.parse(data[colorid])[0] : '';
  //未设置颜色时，背景色的默认颜色为：蓝色浅色，黑色文字
  return coloridData
    ? (
        colorOptions.find(it => (coloridData && coloridData.startsWith('other') ? 'other' : coloridData) === it.key) ||
        []
      ).color || defaultColor
    : defaultColor;
};

// type === 16 ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD';
//格式events数据//根据多组时间拆分出多条数据
export const setDataFormat = pram => {
  const { worksheetControls = [], currentView = {}, calendarData = {}, byRowId, ...data } = pram;
  if (byRowId) {
    return setDataFormatByRowId(pram);
  }
  const { hiddenDays = [], colorOptions = [], btnList, initialView, calendarInfo = [] } = calendarData;
  //无选项且无默认值，才用默认颜色
  let stringColor = getStringColor(calendarData, data, currentView);
  const recordColorConfig = getRecordColorConfig(currentView);
  let recordColor =
    recordColorConfig &&
    getRecordColor({
      controlId: recordColorConfig.controlId,
      colorItems: recordColorConfig.colorItems,
      controls: worksheetControls,
      row: data,
    });
  if (recordColor) {
    recordColor = {
      ...recordColorConfig,
      ...recordColor,
    };
  }
  let list = [];
  calendarInfo.map(o => {
    const dataInfo = {
      ...data,
      [o.begin]: data[o.begin] ? dateConvertToUserZone(moment(data[o.begin])) : data[o.begin],
      [o.end]: data[o.end] ? dateConvertToUserZone(moment(data[o.end])) : data[o.end],
    };
    let editable = controlState(o.startData).editable;
    if (!!dataInfo[o.begin]) {
      let start = getStart(dataInfo, o);
      let allDay = getAllDay(dataInfo, o);
      // allDay = allDay || o.startData.type === 15; //开始时间为日期字段，均处理成全天事件
      let end = getEnd(dataInfo, o);
      list.push({
        ...o,
        info: o,
        keyIds: `${dataInfo.rowid}-${o.begin}`,
        extendedProps: {
          ...dataInfo,
          editable,
          recordColor,
          stringColor,
        },
        title: renderTitleTxt(worksheetControls, currentView, dataInfo),
        start,
        end,
        allDay: !!allDay,
        editable,
        timeList: [
          {
            info: o,
            start,
            end,
            editable,
            allDay: !!allDay,
          },
        ],
        backgroundColor: stringColor,
        borderColor: stringColor,
        textColor: stringColor && isLightColor(stringColor) ? '#151515' : '#fff',
      });
    }
  });
  return list;
};

const renderTitleTxt = (worksheetControls, currentView, dataInfo) => {
  const titleControls = getTitleControls(worksheetControls);
  return (
    (_.get(currentView, 'advancedSetting.viewtitle')
      ? renderTitleByViewtitle(dataInfo, worksheetControls, currentView)
      : renderCellText({
          ...titleControls,
          value: dataInfo[titleControls.controlId],
        })) || _l('未命名')
  );
};

//格式events数据//未排期 以及全部 一条数据卡片显示多个时间信息
export const setDataFormatByRowId = pram => {
  const { worksheetControls = [], currentView = {}, calendarData = {}, ...data } = pram;
  const { colorOptions = [], calendarInfo = [] } = calendarData;
  //无选项且无默认值，才用默认颜色
  let stringColor = getStringColor(calendarData, data, currentView);
  const recordColorConfig = getRecordColorConfig(currentView);
  let recordColor =
    recordColorConfig &&
    getRecordColor({
      controlId: recordColorConfig.controlId,
      colorItems: recordColorConfig.colorItems,
      controls: worksheetControls,
      row: data,
    });
  if (recordColor) {
    recordColor = {
      ...recordColorConfig,
      ...recordColor,
    };
  }
  let timeList = [];
  let dataInfo = {
    ...data,
    [calendarInfo.begin]: data[calendarInfo.begin]
      ? dateConvertToUserZone(moment(data[calendarInfo.begin]))
      : data[calendarInfo.begin],
    [calendarInfo.end]: data[calendarInfo.end]
      ? dateConvertToUserZone(moment(data[calendarInfo.end]))
      : data[calendarInfo.end],
  };
  calendarInfo.map(o => {
    let start = getStart(dataInfo, o);
    let allDay = getAllDay(dataInfo, o);
    // allDay = allDay || o.startData.type === 15; //开始时间为日期字段，均处理成全天事件 //开始日期不包含时间  仅跨天日程需要包含背景色
    let end = getEnd(dataInfo, o);
    timeList.push({
      info: o,
      start,
      end,
      allDay: !!allDay,
      editable: controlState(o.startData).editable,
    });
  });
  return [
    {
      extendedProps: {
        ...dataInfo,
        stringColor,
        recordColor,
      },
      title: renderTitleTxt(worksheetControls, currentView, dataInfo),
      timeList,
      backgroundColor: stringColor,
      borderColor: stringColor,
      textColor: stringColor && isLightColor(stringColor) ? '#151515' : '#fff',
    },
  ];
};
export const getCalendarViewType = (strType, data) => {
  const str = !['1', '2'].includes(strType)
    ? 'dayGridMonth'
    : strType === '1'
      ? isTimeStyle(data)
        ? 'timeGridWeek'
        : 'dayGridWeek'
      : isTimeStyle(data)
        ? 'timeGridDay'
        : 'dayGridDay';
  return str;
};

export const isTimeStyle = (data = {}) => {
  let type = data.type;
  if (type === 30) {
    type = data.sourceControlType;
  }
  return type === 16 || (type === 38 && data.enumDefault === 2 && data.unit !== '3');
};

export const getTimeControls = controls => {
  return controls.filter(
    item =>
      item.controlId !== 'utime' &&
      (_.includes([15, 16], item.type) ||
        (item.type === 30 && //支持他表字段 仅存储(9,10,11)
          [15, 16].includes(item.sourceControlType) &&
          (item.strDefault || '').split('')[0] !== '1') ||
        (item.type === 38 && item.enumDefault === 2)),
  );
};

export const getShowExternalData = () => {
  let showExternalData = [];
  try {
    showExternalData = JSON.parse(window.localStorage.getItem('CalendarShowExternal')) || [];
  } catch (error) {
    showExternalData = [];
  }
  //老数据兼容
  if (!_.isArray(showExternalData)) {
    showExternalData = [];
  }
  return showExternalData;
};

export const getCalendartypeData = () => {
  //老数据兼容
  if (
    ['timeGridWeek', 'timeGridDay', 'dayGridMonth', 'dayGridWeek', 'dayGridDay'].includes(
      window.localStorage.getItem('CalendarViewType'),
    )
  ) {
    return {};
  }
  let CalendartypeData = {};
  try {
    CalendartypeData = JSON.parse(window.localStorage.getItem('CalendarViewType')) || {};
  } catch (error) {
    CalendartypeData = {};
  }
  return CalendartypeData;
};

export const isIllegal = item => {
  return ['5', '4'].includes(_.get(item, ['advancedSetting', 'showtype']));
};

export const isIllegalFormat = (calendarInfo = []) => {
  let isErr = false;
  calendarInfo.map(o => {
    [o.endData, o.startData].map(item => {
      if (isIllegal(item)) {
        isErr = true;
      }
    });
  });
  return isErr;
};

export const setSysWorkflowTimeControlFormat = (controls = [], sheetSwitchPermit = [], key = 'controlId') => {
  return controls.filter(o => {
    if (!isOpenPermit(permitList.sysControlSwitch, sheetSwitchPermit)) {
      return !SYS_CONTROLS_WORKFLOW.includes(o[key]);
    } else {
      return true;
    }
  });
};

export const formatEventTime = (time, hour24) => {
  if (hour24 === '0') {
    //12小时
    let hour = new Date(time.replace(/\-/g, '/')).getHours();
    let mm = new Date(time.replace(/\-/g, '/')).getMinutes();
    let h = hour % 12 <= 0 ? 12 : hour % 12;
    return `${h}:${mm < 10 ? '0' + mm : mm}${hour >= 12 ? 'p' : 'a'}`;
  }
  //24小时
  return moment(time).format('HH:mm');
};

export const getCurrentView = props => {
  const { views = [], base = {} } = props;
  const { viewId } = base;
  return views.find(o => o.viewId === viewId) || {};
};

export const renderLine = (random, view) => {
  $(`.boxCalendar_${random} .fc-timegrid-body .linBox`).remove();
  if (!$('.fc-day-today').length) return;
  const [start, end] = (_.get(view, 'advancedSetting.showtime') || '00:00-23:59').split('-');
  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  if (currentMins < startH * 60 + startM || currentMins > endH * 60 + endM) return;
  const hourHeight = 36;
  const top =
    ((currentMins - startH * 60 - startM) / (endH * 60 + endM - startH * 60 - startM)) *
    hourHeight *
    (endH - startH + (endM - startM) / 60);

  $(`.boxCalendar_${random} .fc-timegrid-body`).append(`
    <div class="linBox" style="
      top: ${top}px;
      left: 43px;
      width: 100%;
      position: absolute;
      z-index: 100000;
      text-align: right;
    ">
      <div class="rect"></div><div class="rectLine"></div>
    </div>
  `);
};

export const changeEndStr = (end, allDay, calendarview) => {
  const { calendarData = {} } = calendarview;
  const { endFormat } = calendarData;

  // 日期字段，结束时间按前一天的23:59:59处理（即减去一天）
  // return moment(endData.type === 16 ? end : moment(end).subtract(1, 'day')).format(endFormat);
  if (!allDay) {
    return moment(end).format(endFormat);
  } else {
    return `${moment(end).subtract(1, 'day').format('YYYY-MM-DD')} 23:59:59`;
  }
};

export const getRows = (start, end, calendarview) => {
  const { calendarFormatData = [] } = calendarview;
  let list = calendarFormatData;
  let rows = [];
  list = list
    .filter(o => !!o.start)
    .sort((a, b) => {
      return new Date(a.start) - new Date(b.start);
    });
  list.map(o => {
    if (
      (moment(o.start).isSameOrBefore(start, 'day') && moment(o.end).isSameOrAfter(end, 'day')) ||
      moment(o.start).isSame(start, 'day')
    ) {
      rows.push(o.extendedProps);
    }
  });
  return rows;
};
