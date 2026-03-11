import _ from 'lodash';
import moment from 'moment';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { OPTION_COLORS_LIST, OPTION_COLORS_LIST_HOVER } from 'src/pages/widgetConfig/config';
import { SYS_CONTROLS_WORKFLOW } from 'src/pages/widgetConfig/config/widget.js';
import { renderTitleByViewtitle } from 'src/pages/worksheet/views/util.js';
import { controlState } from 'src/utils/control';
import { getAdvanceSetting } from 'src/utils/control';
import { renderText as renderCellText } from 'src/utils/control';
import { isLightColor, isTimeStyle } from 'src/utils/control';
import { dateAppZoneToServerZone, dateConvertToServerZone } from 'src/utils/project';
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
  for (let i = 0; i < substring.length; i++) {
    const hs = substring.charCodeAt(i);
    if (0xd800 <= hs && hs <= 0xdbff) {
      if (substring.length > 1) {
        const ls = substring.charCodeAt(i + 1);
        const uc = (hs - 0xd800) * 0x400 + (ls - 0xdc00) + 0x10000;
        if (0x1d000 <= uc && uc <= 0x1f77f) {
          return true;
        }
      }
    } else if (substring.length > 1) {
      const ls = substring.charCodeAt(i + 1);
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

  return false;
};

// 提取公共的 renderCellText 调用逻辑
const renderTimeValue = (controlData, value, currentView) => {
  if (!value) return '';
  return renderCellText(
    {
      ...controlData,
      value,
      advancedSetting: { ...controlData.advancedSetting, showtimezone: '0' },
    },
    { appId: currentView.appId },
  );
};

const getAllDay = (data, o, currentView = {}) => {
  if (!data[o.begin] || !data[o.end]) {
    return false;
  }
  const beginValue = renderTimeValue(o.startData, data[o.begin], currentView);
  const endValue = renderTimeValue(o.endData, data[o.end], currentView);
  return beginValue && endValue && getIsOverOneDay(beginValue, endValue) && moment(beginValue).isBefore(endValue);
};

const getStart = (data, o, currentView = {}) => {
  const startData = { ...o.startData, advancedSetting: { ...o.startData.advancedSetting, showformat: '0' } };
  return renderTimeValue(startData, data[o.begin], currentView);
};

const getEnd = (data, o, currentView = {}) => {
  if (!data[o.end] || moment(data[o.begin]).isAfter(data[o.end])) {
    return '';
  }
  const endData = { ...o.endData, advancedSetting: { ...o.endData.advancedSetting, showformat: '0' } };
  const endValue = renderTimeValue(endData, data[o.end], currentView);
  return moment(!getAllDay(data, o, currentView) ? endValue : moment(endValue).add(1, 'day')).format(o.endFormat);
};

const getIsOverOneDay = (beginValue, endValue) => {
  const beginDate = moment(beginValue).format('YYYYMMDD');
  const endDate = moment(endValue).format('YYYYMMDD');
  return endDate - beginDate >= 1 || moment(endValue).diff(moment(beginValue), 'minutes') >= 1439;
};

const getTitleControls = worksheetControls => {
  return worksheetControls.find(item => item.attribute === 1);
};

const getStringColor = (calendarData, data, currentView) => {
  const { colorOptions = [] } = calendarData;
  const { colorid = '' } = getAdvanceSetting(currentView);
  const coloridData = data[colorid] ? JSON.parse(data[colorid])[0] : '';
  if (!coloridData) return defaultColor;

  const key = coloridData.startsWith('other') ? 'other' : coloridData;
  const option = colorOptions.find(it => it.key === key);
  return option?.color || defaultColor;
};

// 提取获取颜色的公共逻辑
const getColorData = (calendarData, data, currentView, worksheetControls) => {
  const stringColor = getStringColor(calendarData, data, currentView);
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
    recordColor = { ...recordColorConfig, ...recordColor };
  }
  return { stringColor, recordColor };
};

// 提取创建事件样式的公共逻辑
const getEventStyle = stringColor => ({
  backgroundColor: stringColor,
  borderColor: stringColor,
  textColor: stringColor && isLightColor(stringColor) ? '#151515' : '#fff',
});

// type === 16 ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD';
//格式events数据//根据多组时间拆分出多条数据
export const setDataFormat = pram => {
  const { worksheetControls = [], currentView = {}, calendarData = {}, byRowId, ...data } = pram;
  if (byRowId) {
    return setDataFormatByRowId(pram);
  }
  const { calendarInfo = [] } = calendarData;
  const { stringColor, recordColor } = getColorData(calendarData, data, currentView, worksheetControls);

  return calendarInfo
    .filter(o => data[o.begin])
    .map(o => {
      const editable = controlState(o.startData).editable;
      const start = getStart(data, o, currentView);
      const end = getEnd(data, o, currentView);
      const allDay = getAllDay(data, o, currentView);
      const timeItem = { info: o, start, end, editable, allDay: !!allDay, row: data };
      return {
        ...o,
        info: o,
        keyIds: `${data.rowid}-${o.begin}`,
        extendedProps: { ...data, editable, recordColor, stringColor },
        title: renderTitleTxt(worksheetControls, currentView, data),
        start,
        end,
        allDay: !!allDay,
        editable,
        timeList: [timeItem],
        ...getEventStyle(stringColor),
        row: data,
      };
    });
};

const renderTitleTxt = (worksheetControls, currentView, dataInfo) => {
  const titleControls = getTitleControls(worksheetControls);
  return (
    (_.get(currentView, 'advancedSetting.viewtitle')
      ? renderTitleByViewtitle(dataInfo, worksheetControls, currentView, true)
      : renderCellText(
          {
            ...titleControls,
            value: dataInfo[titleControls.controlId],
          },
          { appId: currentView.appId },
        )) || _l('未命名')
  );
};

//格式events数据//未排期 以及全部 一条数据卡片显示多个时间信息
export const setDataFormatByRowId = pram => {
  const { worksheetControls = [], currentView = {}, calendarData = {}, ...data } = pram;
  const { calendarInfo = [] } = calendarData;
  const { stringColor, recordColor } = getColorData(calendarData, data, currentView, worksheetControls);

  const timeList = calendarInfo.map(o => ({
    info: o,
    start: getStart(data, o, currentView),
    end: getEnd(data, o, currentView),
    allDay: !!getAllDay(data, o, currentView),
    editable: controlState(o.startData).editable,
    row: data,
  }));

  return [
    {
      extendedProps: { ...data, stringColor, recordColor },
      title: renderTitleTxt(worksheetControls, currentView, data),
      timeList,
      ...getEventStyle(stringColor),
    },
  ];
};

export const getCalendarViewType = (strType, data) => {
  if (!['1', '2'].includes(strType)) return 'dayGridMonth';
  const isTime = isTimeStyle(data);
  return strType === '1' ? (isTime ? 'timeGridWeek' : 'dayGridWeek') : isTime ? 'timeGridDay' : 'dayGridDay';
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
  const showExternalData = safeParse(window.localStorage.getItem('CalendarShowExternal'), 'array');
  return _.isArray(showExternalData) ? showExternalData : [];
};

export const getCalendartypeData = () => {
  const viewType = window.localStorage.getItem('CalendarViewType');
  //老数据兼容
  if (['timeGridWeek', 'timeGridDay', 'dayGridMonth', 'dayGridWeek', 'dayGridDay'].includes(viewType)) {
    return {};
  }
  return safeParse(viewType) || {};
};

export const isIllegal = item => {
  return ['5', '4'].includes(_.get(item, ['advancedSetting', 'showtype']));
};

export const isIllegalFormat = (calendarInfo = []) => {
  return calendarInfo.some(o => [o.endData, o.startData].some(item => isIllegal(item)));
};

export const setSysWorkflowTimeControlFormat = (controls = [], sheetSwitchPermit = [], key = 'controlId') => {
  const isPermitted = isOpenPermit(permitList.sysControlSwitch, sheetSwitchPermit);
  return controls.filter(o => isPermitted || !SYS_CONTROLS_WORKFLOW.includes(o[key]));
};

export const getCurrentView = props => {
  const { views = [], base = {} } = props;
  const { viewId } = base;
  const currentView = views.find(o => o.viewId === viewId) || {};
  return { ...currentView, appId: base.appId };
};

export const renderLine = (random, view) => {
  $(`.boxCalendar_${random} .fc-timegrid-body .linBox`).remove();
  if (!$('.fc-day-today').length) return;

  const [start, end] = (_.get(view, 'advancedSetting.showtime') || '00:00-23:59').split('-');
  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  const startMins = startH * 60 + startM;
  const endMins = endH * 60 + endM;

  if (currentMins < startMins || currentMins > endMins) return;

  const hourHeight = 36;
  const totalMins = endMins - startMins;
  const hours = endH - startH + (endM - startM) / 60;
  const top = ((currentMins - startMins) / totalMins) * hourHeight * hours;

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

//格式化时间用于保存
export const formatTimeForSave = (value, data = {}, appId) => {
  if (data.type === 16) {
    return data?.advancedSetting?.timezonetype === '1'
      ? dateAppZoneToServerZone(value, window[`timeZone_${appId}`])
      : dateConvertToServerZone(value);
  }
  return value;
};

export const changeEndStr = (end, allDay, calendarview) => {
  const { endFormat } = calendarview.calendarData || {};
  return allDay ? `${moment(end).subtract(1, 'day').format('YYYY-MM-DD')} 23:59:59` : moment(end).format(endFormat);
};

export const getRows = (start, end, calendarview) => {
  const { calendarFormatData = [] } = calendarview;
  return calendarFormatData
    .filter(o => o.start)
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .filter(
      o =>
        (moment(o.start).isSameOrBefore(start, 'day') && moment(o.end).isSameOrAfter(end, 'day')) ||
        moment(o.start).isSame(start, 'day'),
    )
    .map(o => o.extendedProps);
};

//兼容自定义页面拖动事件定位问题
export const resetFcEventDraggingPoint = () => {
  if (document.querySelector('.CustomPageContentWrap')) {
    setTimeout(() => {
      const draggingElement = document.querySelector('.fc-event-dragging');
      if (draggingElement) {
        const worksheetBox = draggingElement.closest('#worksheetRightContentBox');
        if (worksheetBox) {
          const rect = worksheetBox.getBoundingClientRect();
          const customPageHeader = document.querySelector('.customPageHeader');
          const headerHeight = customPageHeader ? customPageHeader.offsetHeight : 0;
          draggingElement.style.transform = `translate(${-rect.left}px, ${-rect.top + headerHeight}px)`;
        }
      }
    }, 0);
  }
};

export const setShowTip = (event, flag, canNew) => {
  const myTips = document.getElementById('mytips');
  if (!myTips || document.querySelector('.customPageContent')) return;
  if (!flag || !canNew) {
    myTips.style.opacity = 0;
    return;
  }

  const calendarBox = event.target.closest('.boxCalendar');
  if (!calendarBox) return;

  const { left: minLeft, right: maxRight, top: minTop, bottom: maxBottom } = calendarBox.getBoundingClientRect();
  const { clientX, clientY } = event;
  const { offsetWidth: tipWidth, offsetHeight: tipHeight } = myTips;

  let left = Math.min(clientX + 10, maxRight - tipWidth);
  let top = Math.min(clientY + 10, maxBottom - tipHeight);
  if (left < minLeft) left = clientX - tipWidth - 10;
  if (top < minTop) top = clientY - tipHeight - 10;
  left = Math.max(minLeft, left);
  top = Math.max(minTop, top);

  const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollY = window.pageYOffset || document.documentElement.scrollTop;

  Object.assign(myTips.style, {
    left: `${left - scrollX}px`,
    top: `${top - scrollY}px`,
    opacity: 1,
  });
};
