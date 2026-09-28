import _ from 'lodash';
import moment from 'moment';
import { getAdvanceSetting } from 'src/utils/domain/control/advancedSetting';
import { renderText as renderCellText } from 'src/utils/domain/control/display';
import { permitList } from 'src/utils/domain/control/formEnum';
import { controlState } from 'src/utils/domain/control/state';
import { isTimeStyle } from 'src/utils/domain/control/type';
import { SYS_CONTROLS_WORKFLOW } from 'src/utils/domain/control/widget';
import { isOpenPermit } from 'src/utils/domain/permission/worksheet';
import { RECORD_COLOR_SHOW_TYPE } from 'src/utils/domain/worksheet/constants';
import { getRecordColor, getRecordColorConfig } from 'src/utils/domain/worksheet/record';
import { renderTitleByViewtitle } from 'src/utils/services/worksheet/view';

const DEFAULT_COLOR = 'var(--color-primary-transparent)';
const DEFAULT_BORDER_COLOR_DARK = 'rgba(255, 255, 255, 0.12)';
const DEFAULT_BORDER_COLOR_LIGHT = 'rgba(0, 0, 0, 0.12)';
const DEFAULT_TEXT_COLOR = 'var(--color-text-primary)';

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

const getCalendarTimeAdvancedSetting = controlData => {
  const advancedSetting = { ...controlData.advancedSetting, showformat: '0' };

  if (!isTimeStyle(controlData)) {
    return advancedSetting;
  }

  return {
    ...advancedSetting,
    hour12: '0',
    ...(String(advancedSetting.showtype) === '2' ? { showtype: '1' } : {}),
  };
};

const getAllDay = (data, o, currentView = {}) => {
  if (!data[o.begin]) {
    return false;
  }

  // 日期类型（非日期时间）统一按全天事件处理
  if (!isTimeStyle(o.startData)) {
    return true;
  }

  if (!data[o.end]) {
    return false;
  }

  const beginValue = renderTimeValue(o.startData, data[o.begin], currentView);
  const endValue = renderTimeValue(o.endData, data[o.end], currentView);
  return beginValue && endValue && getIsOverOneDay(beginValue, endValue) && moment(beginValue).isBefore(endValue);
};

const getStart = (data, o, currentView = {}) => {
  const startData = {
    ...o.startData,
    advancedSetting: getCalendarTimeAdvancedSetting(o.startData),
  };
  return renderTimeValue(startData, data[o.begin], currentView);
};

const getEnd = (data, o, currentView = {}) => {
  if (!data[o.end] || moment(data[o.begin]).isAfter(data[o.end])) {
    return '';
  }

  const endData = {
    ...o.endData,
    advancedSetting: getCalendarTimeAdvancedSetting(o.endData),
  };
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
  if (!colorid) return DEFAULT_COLOR;
  const coloridData = data[colorid] ? JSON.parse(data[colorid])[0] : '';
  if (!coloridData) return DEFAULT_COLOR;

  const key = coloridData.startsWith('other') ? 'other' : coloridData;
  const option = colorOptions.find(it => it.key === key);
  return option?.color || DEFAULT_COLOR;
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

const splitCalendarEventColors = recordColor => {
  return {
    backgroundColor: recordColor?.lightColor || DEFAULT_COLOR,
    borderColor: window.themeMode === 'dark' ? DEFAULT_BORDER_COLOR_DARK : DEFAULT_BORDER_COLOR_LIGHT,
    textColor: DEFAULT_TEXT_COLOR,
  };
};

// type === 16 ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD';
//格式events数据//根据多组时间拆分出多条数据
/** 将工作表记录转换为日历事件列表。 */
export const setDataFormat = pram => {
  const { worksheetControls = [], currentView = {}, calendarData = {}, byRowId, ...data } = pram;

  if (byRowId) {
    return setDataFormatByRowId(pram);
  }

  const { calendarInfo = [] } = calendarData;
  const { stringColor, recordColor } = getColorData(calendarData, data, currentView, worksheetControls);
  const palette = splitCalendarEventColors(recordColor);
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
        extendedProps: {
          ...data,
          editable,
          recordColor,
          stringColor,
          ...palette,
        },
        title: renderTitleTxt(worksheetControls, currentView, data),
        start,
        end,
        allDay: !!allDay,
        editable,
        timeList: [timeItem],
        row: data,
      };
    });
};

const renderTitleTxt = (worksheetControls, currentView, dataInfo) => {
  const titleControls = getTitleControls(worksheetControls);
  const viewtitle = _.get(currentView, 'advancedSetting.viewtitle');

  if (!viewtitle && !titleControls) {
    return _l('未命名');
  }

  return (
    (viewtitle
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
/** 将同一记录的多组时间合并为日历事件。 */
const setDataFormatByRowId = pram => {
  const { worksheetControls = [], currentView = {}, calendarData = {}, ...data } = pram;
  const { calendarInfo = [] } = calendarData;
  const { stringColor, recordColor } = getColorData(calendarData, data, currentView, worksheetControls);
  const colortype = getAdvanceSetting(currentView).colortype || RECORD_COLOR_SHOW_TYPE.BG;
  const palette = splitCalendarEventColors(stringColor, colortype, recordColor);

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
      extendedProps: {
        ...data,
        stringColor,
        recordColor,
        ...palette,
      },
      title: renderTitleTxt(worksheetControls, currentView, data),
      timeList,
    },
  ];
};

/** 根据配置和时间控件选择日历视图类型。 */
export const getCalendarViewType = (strType, data) => {
  if (!['1', '2'].includes(strType)) return 'dayGridMonth';
  const isTime = isTimeStyle(data);
  return strType === '1' ? (isTime ? 'timeGridWeek' : 'dayGridWeek') : isTime ? 'timeGridDay' : 'dayGridDay';
};

/** 筛选可用于日历起止时间的控件。 */
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

/** 读取并兼容本地保存的日历视图类型配置。 */
export const getCalendartypeData = () => {
  const viewType = window.localStorage.getItem('CalendarViewType');

  //老数据兼容
  if (['timeGridWeek', 'timeGridDay', 'dayGridMonth', 'dayGridWeek', 'dayGridDay'].includes(viewType)) {
    return {};
  }

  return safeParse(viewType) || {};
};

/** 判断时间控件是否使用日历不支持的显示格式。 */
export const isIllegal = item => {
  return ['5', '4'].includes(_.get(item, ['advancedSetting', 'showtype']));
};

/** 判断日历时间配置是否包含不支持的格式。 */
export const isIllegalFormat = (calendarInfo = []) => {
  return calendarInfo.some(o => [o.endData, o.startData].some(item => isIllegal(item)));
};

/** 按工作表权限过滤系统工作流时间控件。 */
export const setSysWorkflowTimeControlFormat = (controls = [], sheetSwitchPermit = [], key = 'controlId') => {
  const isPermitted = isOpenPermit(permitList.sysControlSwitch, sheetSwitchPermit);
  return controls.filter(o => isPermitted || !SYS_CONTROLS_WORKFLOW.includes(o[key]));
};
