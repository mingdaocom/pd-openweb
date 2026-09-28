import _ from 'lodash';
import moment from 'moment';
import { permitList } from 'src/utils/domain/control/formEnum';
import { isOpenPermit } from 'src/utils/domain/permission/worksheet';
import { dateAppZoneToServerZone, dateConvertToServerZone } from 'src/utils/platform/runtime/timeZone';

/** 检测字符串中是否包含 Emoji 字符。 */
export const isEmojiCharacter = substring => {
  for (let i = 0; i < substring.length; i++) {
    const hs = substring.charCodeAt(i);

    if (0xd800 <= hs && hs <= 0xdbff) {
      if (substring.length > 1) {
        const ls = substring.charCodeAt(i + 1);
        const uc = (hs - 0xd800) * 0x400 + (ls - 0xdc00) + 0x10000;

        if (0x1d000 <= uc && uc <= 0x1f77f) return true;
      }
    } else if (substring.length > 1) {
      if (substring.charCodeAt(i + 1) === 0x20e3) return true;
    } else if (
      (0x2100 <= hs && hs <= 0x27ff) ||
      (0x2b05 <= hs && hs <= 0x2b07) ||
      (0x2934 <= hs && hs <= 0x2935) ||
      (0x3297 <= hs && hs <= 0x3299) ||
      [0xa9, 0xae, 0x303d, 0x3030, 0x2b55, 0x2b1c, 0x2b1b, 0x2b50].includes(hs)
    ) {
      return true;
    }
  }

  return false;
};

/** 读取日历需要展示的外部数据记录。 */
export const getShowExternalData = () => {
  const showExternalData = safeParse(window.localStorage.getItem('CalendarShowExternal'), 'array');
  return _.isArray(showExternalData) ? showExternalData : [];
};

/** 从工作表状态中获取当前视图并补充应用标识。 */
export const getCurrentView = props => {
  const { views = [], base = {} } = props;
  const currentView = views.find(o => o.viewId === base.viewId) || {};
  return { ...currentView, appId: base.appId };
};

/** 在周或日时间网格中绘制当前时间线。 */
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

/** 按控件时区设置转换待保存的时间值。 */
export const formatTimeForSave = (value, data = {}, appId) => {
  if (data.type === 16) {
    return data?.advancedSetting?.timezonetype === '1'
      ? dateAppZoneToServerZone(value, window[`timeZone_${appId}`])
      : dateConvertToServerZone(value);
  }

  return value;
};

/** 将日历事件结束时间转换为记录保存值。 */
export const changeEndStr = (end, allDay, calendarview) => {
  const { endFormat } = calendarview.calendarData || {};
  return allDay ? `${moment(end).subtract(1, 'day').format('YYYY-MM-DD')} 23:59:59` : moment(end).format(endFormat);
};

/** 获取指定日期范围内的日历记录。 */
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

/** 修正自定义页面中日历拖拽元素的定位。 */
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

/** 根据鼠标位置显示或隐藏日历新建提示。 */
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

/** 判断当前视图是否允许新建记录。 */
export const getCanCreateRecord = props => {
  const { worksheetInfo = {}, allowAddNewRecord = true, sheetSwitchPermit } = props;
  return isOpenPermit(permitList.createButtonSwitch, sheetSwitchPermit) && worksheetInfo.allowAdd && allowAddNewRecord;
};
