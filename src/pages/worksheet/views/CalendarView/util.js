import { renderCellText } from 'worksheet/components/CellControls';
import { getAdvanceSetting } from 'src/util';
import moment from 'moment';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import { isLightColor } from 'src/util';
import { OPTION_COLORS_LIST, OPTION_COLORS_LIST_HOVER } from 'src/pages/widgetConfig/config';
export const eventStr = {
  0: 'eventAll', //全部
  1: 'eventScheduled', //已排期
  2: 'eventNoScheduled', //未排期
};
export const getHoverColor = color => {
  return OPTION_COLORS_LIST_HOVER[OPTION_COLORS_LIST.indexOf(color.toUpperCase())];
};
// type === 16 ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD';
//格式events数据
export const setDataFormat = props => {
  const { worksheetControls = [], currentView = {}, calendarData = {}, ...data } = props;
  const {
    startFormat = '',
    endFormat = '',
    startData = [],
    endData = [],
    hiddenDays = [],
    colorOptions = [],
    btnList,
    initialView,
  } = calendarData;
  const { colorid = '', begindate = '', enddate = '' } = getAdvanceSetting(currentView);
  let titleControls = worksheetControls.find(item => item.attribute === 1) || [];
  let coloridData = data[colorid] ? JSON.parse(data[colorid])[0] : '';
  if (!coloridData && colorid) {
    let colorControls = worksheetControls.find(item => item.controlId === colorid) || {};
    let defaultS = colorControls.default || '[]';
    //无选项，取默认值
    coloridData = JSON.parse(defaultS)[0];
  }
  //无选项且无默认值，才用默认颜色
  let stringColor = (colorOptions.find(it => coloridData === it.key) || []).color || '#2196f3';
  let start = !data[begindate] ? '' : moment(data[begindate]).format(startFormat);

  let isOverOneDay =
    moment(data[enddate]).format('YYYYMMDD') - moment(data[begindate]).format('YYYYMMDD') >= 1 ||
    moment(data[enddate]).diff(moment(data[begindate]), 'minutes') >= 1439;

  let allDay = data[begindate] && data[enddate] && isOverOneDay && moment(data[begindate]).isBefore(data[enddate]);
  allDay = allDay || startData.type === 15; //开始时间为日期字段，均处理成全天事件
  // let endend = '';
  //开始时间为日期时间，结束时间为时间字段
  // if (startData.type === 16 && endData.type === 15) {
  //   //日历视图显示时间刻度 日程视为全天日程
  //   if (['timeGridWeek', 'timeGridDay'].includes(initialView)) {
  //     allDay = true;
  //   } else {
  //     endend = moment(data[begindate]).add(3, 'hours');
  //   }
  // }

  let end =
    !data[enddate] || moment(data[begindate]).isAfter(data[enddate])
      ? ''
      : moment(
          //全天事件 都要加一天
          !allDay ? moment(data[enddate]) : moment(data[enddate]).add(1, 'day'),
        ).format(endFormat);
  return {
    extendedProps: {
      ...data,
      editable: controlState(worksheetControls.find(item => item.controlId === begindate) || []).editable,
      stringColor,
    },
    title:
      renderCellText({
        ...titleControls,
        value: data[titleControls.controlId],
      }) || _l('未命名'),
    start,
    end,
    backgroundColor: stringColor,
    borderColor: stringColor,
    textColor: stringColor && isLightColor(stringColor) ? '#333' : '#fff',
    allDay: !!allDay,
  };
};

export const getCalendarViewType = (strType, viewType) => {
  const str = !['1', '2'].includes(strType)
    ? 'dayGridMonth'
    : strType === '1'
    ? viewType === 16
      ? 'timeGridWeek'
      : 'dayGridWeek'
    : viewType === 16
    ? 'timeGridDay'
    : 'dayGridDay';
  return str;
};
