import _ from 'lodash';
import moment from 'moment';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { isTimeControl } from './controlUtils';

export const defaultDropdownScopeData = 18;

/**
 * 处理数值图数据对比的周期文案
 */
export const formatContrastTypes = ({ rangeType, today }) => {
  let base = [];

  switch (rangeType) {
    case 1:
    case 2:
    case 3:
      base = [
        { text: _l('上周同期'), value: 3 },
        { text: _l('上月同期'), value: 4 },
        { text: _l('去年同期'), value: 2 },
      ];
      break;
    // 本周
    case 4:
      if (today) {
        base.push({ text: _l('上周'), value: 3, ignoreToday: true });
        base.push({ text: _l('上周同期'), value: 3 });
        base.push({ text: _l('去年'), value: 2, ignoreToday: true });
        base.push({ text: _l('去年同期'), value: 2 });
      }

      break;
    case 5:
    case 6:
      base.push({ text: _l('去年同期'), value: 2 });
      break;
    // 本月
    case 8:
      if (today) {
        base.push({ text: _l('上月'), value: 4, ignoreToday: true });
        base.push({ text: _l('上月同期'), value: 4 });
        base.push({ text: _l('去年'), value: 2, ignoreToday: true });
        base.push({ text: _l('去年同期'), value: 2 });
      }

      break;
    case 9:
    case 10:
      base.push({ text: _l('去年同期'), value: 2 });
      break;
    // 本季度
    case 11:
      if (today) {
        base.push({ text: _l('上一季度'), value: 6, ignoreToday: true });
        base.push({ text: _l('与上一季度同期'), value: 6 });
        base.push({ text: _l('去年'), value: 2, ignoreToday: true });
        base.push({ text: _l('去年同期'), value: 2 });
      }

      break;
    case 12:
    case 13:
      base.push({ text: _l('去年同期'), value: 2 });
      break;
    // 本年
    case 15:
      if (today) {
        base.push({ text: _l('去年'), value: 2, ignoreToday: true });
        base.push({ text: _l('去年同期'), value: 2 });
      }

      break;
    case 16:
    case 17:
      base.push({ text: _l('去年同期'), value: 2 });
      break;
    case 20:
      base.push({ text: _l('去年同期'), value: 2 });
      base.push({ text: _l('固定'), value: 5 });
      break;
    default:
      break;
  }

  return base;
};

/**
 * 处理折线图数据对比的周期文案
 */
export const formatLineChartContrastTypes = ({ rangeType, rangeValue, today }) => {
  const base = [{ text: _l('无'), value: 0 }];
  const last = { text: _l('与上一年相比'), value: 2 };

  switch (rangeType) {
    case 0:
      // 全部
      base.push(Object.assign(last, { disabled: true }));
      break;
    case 1:
      // 今天
      base.push({ text: _l('与昨天相比'), value: 1 }, last);
      break;
    case 2:
      // 昨天
      base.push({ text: _l('与前一天相比'), value: 1 }, last);
      break;
    case 3:
      // 明天
      base.push({ text: _l('与今天相比'), value: 1 }, last);
      break;
    case 4:
    case 5:
    case 6:
      // 周
      base.push({ text: _l('与上周相比'), value: 1 }, last);
      break;
    case 8:
    case 9:
    case 10:
      // 月
      base.push({ text: _l('与上个月相比'), value: today ? 4 : 1 }, last);
      break;
    case 11:
    case 12:
    case 13:
      // 季度
      base.push({ text: _l('与上个季度相比'), value: 6 }, last);
      break;
    case 15:
    case 16:
    case 17:
      // 年
      base.push(last);
      break;
    case 18:
    case 19:
      base.push({ text: _l('与之前的%0天相比', rangeValue), value: 1 }, last);
      break;
    case 20:
      const [start, end] = rangeValue.split('-');
      const startDate = moment(start.replace(/\//gi, '-'));
      const endDate = moment(end.replace(/\//gi, '-'));
      const diff = endDate.diff(startDate, 'days');
      base.push({ text: _l('与之前的%0天相比', diff), value: 1 }, last);
      break;
    case 21:
      base.push({ text: _l('与上一期相比'), value: 1 }, last);
      break;
    default:
      break;
  }

  return base;
};

/**
 * 获取至今天计算方式的文案
 */
export const getTodayTooltip = ({ rangeType, rangeValue }) => {
  if (rangeType === 4) {
    return _l('未勾选时, 表示统计从本周星期一开始到星期日的数据, 勾选时, 表示统计从本周星期一开始到今天的数据。');
  }

  if (rangeType === 8) {
    return _l('未勾选时, 表示统计从本月1日开始到31日的数据, 勾选时, 表示统计从本月1日开始到今天的数据。');
  }

  if (rangeType === 11) {
    return _l('未勾选时, 表示统计从本季度1月1日开始到3月31日的数据, 勾选时, 表示统计从本季度1月1日开始到今天的数据。');
  }

  if (rangeType === 15) {
    return _l('未勾选时, 表示统计从本年1月1日开始到12月31日的数据, 勾选时,表示统计从本年1月1日开始到今天的数据。');
  }

  if (rangeType === 18) {
    return _l('未勾选时, 表示统计从过去%0天开始到昨天数据, 勾选时, 表示统计从过去%0天开始到今天的数据。', rangeValue);
  }

  if (rangeType === 19) {
    return _l('未勾选时, 表示统计从明天开始到将来%0天数据, 勾选时, 表示统计从今天开始到将来%0天的数据。', rangeValue);
  }
};

/**
 * 统计范围
 */
export const dropdownScopeData = [
  {
    text: _l('全部'),
    value: 0,
  },
  {
    text: _l('今天'),
    value: 1,
  },
  {
    text: _l('昨天'),
    value: 2,
  },
  {
    text: _l('明天'),
    value: 3,
  },
  {
    text: _l('本周'),
    value: 4,
  },
  {
    text: _l('上周'),
    value: 5,
  },
  {
    text: _l('下周'),
    value: 6,
  },
  {
    text: _l('本月'),
    value: 8,
  },
  {
    text: _l('上月'),
    value: 9,
  },
  {
    text: _l('下月'),
    value: 10,
  },
  {
    text: _l('本季度'),
    value: 11,
  },
  {
    text: _l('上季度'),
    value: 12,
  },
  {
    text: _l('下季度'),
    value: 13,
  },
  {
    text: _l('本年'),
    value: 15,
  },
  {
    text: _l('上一年'),
    value: 16,
  },
  {
    text: _l('下一年'),
    value: 17,
  },
  {
    text: _l('上半年'),
    value: 22,
  },
  {
    text: _l('下半年'),
    value: 23,
  },
  {
    text: _l('财政年度'),
    value: 24,
  },
  {
    text: _l('过去...天'),
    value: 18,
  },
  {
    text: _l('将来...天'),
    value: 19,
  },
  {
    text: _l('自定义动态时间范围'),
    value: 21,
  },
  {
    text: _l('指定时间范围'),
    value: 20,
    type: 'hr',
  },
];

export const fiscalYearData = [
  {
    text: _l('上一财政年度'),
    value: -1,
  },
  {
    text: _l('本财政年度'),
    value: 0,
  },
  {
    text: _l('下一财政年度'),
    value: -2,
  },
];

export const pastAndFutureData = [
  {
    text: _l('过去7天'),
    value: '18-7',
  },
  {
    text: _l('过去30天'),
    value: '18-30',
  },
  {
    text: _l('过去365天'),
    value: '18-365',
  },
  {
    text: _l('将来7天'),
    value: '19-7',
  },
  {
    text: _l('将来30天'),
    value: '19-30',
  },
  {
    text: _l('将来365天'),
    value: '19-365',
  },
];

export const timeTypes = [
  {
    name: _l('今天'),
    value: 1,
  },
  {
    name: _l('本月'),
    value: 3,
  },
  {
    name: _l('本年'),
    value: 4,
  },
  {
    name: _l('过去'),
    value: 5,
  },
  {
    name: _l('将来'),
    value: 6,
  },
];

export const unitTypes = [
  {
    name: _l('天'),
    value: 1,
  },
  {
    name: _l('月'),
    value: 3,
  },
  {
    name: _l('年'),
    value: 4,
  },
];

// export const getDynamicFilterScope = (dynamicFilter) => {
//   const { endType, endCount, endUnit } = dynamicFilter;
//   const unitTypes = {
//     1: 'd',
//     2: 'M',
//     3: 'y'
//   }
//   const getStartTime = () => {
//     const { startType, startCount, startUnit } = dynamicFilter;
//     if (startType === 1) {
//       return moment().format('YYYY/MM/DD');
//     }
//     if (startType === 2) {
//       return moment().startOf('M').format('YYYY/MM/DD');
//     }
//     if (startType === 3) {
//       return moment().startOf('Y').format('YYYY/MM/DD');
//     }
//     if (startType === 4) {
//       // return moment().add(-startCount, unitTypes[startUnit]).format('YYYY/MM/DD');
//     }
//   }

//   const startTime = getStartTime();
// }

/**
 * 是否是 过去...天 & 未来...天
 */
export const isPastAndFuture = value => {
  return [18, 19].includes(value);
};

/**
 * 是否是时间控件
 */

export const dropdownDayData = [
  {
    text: _l('7天'),
    value: 7,
  },
  {
    text: _l('14天'),
    value: 14,
  },
  {
    text: _l('30天'),
    value: 30,
  },
  {
    text: _l('90天'),
    value: 90,
  },
  {
    text: _l('180天'),
    value: 180,
  },
  {
    text: _l('365天'),
    value: 365,
  },
];

/**
 * 时间的数据格式
 */
export const timeFormats = [
  { value: '0', getTime: () => moment().format('YYYY-MM-DD') },
  { value: '4', getTime: () => moment().format('YYYY/MM/DD') },
  { value: '1', getTime: () => `${moment().format('YYYY年M月D日')} (${_l('中国')})` },
  { value: '2', getTime: () => `${moment().format('M/D/YYYY')} (US)` },
  { value: '3', getTime: () => `${moment().format('D/M/YYYY')} (EU)` },
];

export const formatTimeFormats = particleSizeType => {
  // 年
  if (particleSizeType === 5) {
    return [{ value: '0', getTime: () => moment().format('YYYY') }];
  }

  // 季
  if (particleSizeType === 4) {
    return [{ value: '0', getTime: () => moment().format('YYYY[Q]Q') }];
  }

  // 月
  if (particleSizeType === 3) {
    return [
      { value: '0', getTime: () => moment().format('YYYY-MM') },
      { value: '4', getTime: () => moment().format('YYYY/MM') },
      { value: '1', getTime: () => `${moment().format('YYYY年M月')} (${_l('中国')})` },
      { value: '2', getTime: () => `${moment().format('M/YYYY')} (US)` },
      { value: '3', getTime: () => `${moment().format('M/YYYY')} (EU)` },
    ];
  }

  // 周
  if (particleSizeType === 2) {
    return [{ value: '0', getTime: () => moment().format('YYYY[W]WW') }];
  }

  // 时
  if (particleSizeType === 6) {
    return [
      { value: '0', getTime: () => moment().format('HH') + _l('时') },
      { value: '1', getTime: () => moment().format('HH') },
    ];
  }

  // 分
  if (particleSizeType === 7) {
    return [{ value: '0', getTime: () => moment().format('HH:mm') }];
  }

  // 秒
  if (particleSizeType === 13) {
    return [{ value: '0', getTime: () => moment().format('HH:mm:ss') }];
  }

  return timeFormats;
};

/**
 * 时间粒度
 */
export const timeDataParticle = [
  { text: _l('年'), value: 5, getTime: () => moment().year() },
  { text: _l('季'), value: 4, getTime: () => moment().format('YYYY[Q]Q') },
  {
    text: _l('月'),
    value: 3,
    getTime: showFormat => {
      if (showFormat === '0') {
        return moment().format('YYYY-MM');
      }

      if (showFormat === '1') {
        return moment().format(_l('YYYY年MM'));
      }

      return moment().format('YYYY/MM');
    },
  },
  { text: _l('周'), value: 2, getTime: () => moment().format('YYYY[W]WW') },
  {
    text: _l('日'),
    value: 1,
    getTime: showFormat => {
      if (showFormat === '0') {
        return moment().format('YYYY-MM-DD');
      }

      if (showFormat === '1') {
        return moment().format(_l('YYYY年MM月DD日'));
      }

      return moment().format('YYYY/MM/DD');
    },
  },
  {
    text: _l('时'),
    value: 6,
    getTime: showFormat => {
      if (showFormat === '0') {
        return moment().format('YYYY-MM-DD HH') + _l('时');
      }

      if (showFormat === '1') {
        return moment().format(_l('YYYY年MM月DD日 HH')) + _l('时');
      }

      return moment().format('YYYY/MM/DD HH') + _l('时');
    },
  },
  {
    text: _l('分'),
    value: 7,
    getTime: showFormat => {
      if (showFormat === '0') {
        return moment().format('YYYY-MM-DD HH:mm');
      }

      if (showFormat === '1') {
        return moment().format(_l('YYYY年MM月DD日 HH:mm'));
      }

      return moment().format('YYYY/MM/DD HH:mm');
    },
  },
  {
    text: _l('秒'),
    value: 13,
    getTime: showFormat => {
      if (showFormat === '0') {
        return moment().format('YYYY-MM-DD HH:mm:ss');
      }

      if (showFormat === '1') {
        return moment().format(_l('YYYY年MM月DD日 HH:mm:ss'));
      }

      return moment().format('YYYY/MM/DD HH:mm:ss');
    },
  },
];

/**
 * 过滤时间粒度
 */
export const filterTimeData = (data, { showtype, controlType }) => {
  let timeDataParticle = [];

  if (controlType === WIDGETS_TO_API_TYPE_ENUM.DATE_TIME) {
    timeDataParticle = data.filter(item => ![13].includes(item.value));
  } else if (controlType === WIDGETS_TO_API_TYPE_ENUM.TIME) {
    timeDataParticle = data.filter(item => [6, 7, 13].includes(item.value));
  } else {
    timeDataParticle = data.filter(item => ![6, 7, 13].includes(item.value));
  }

  // 年
  if (showtype === '5') {
    return timeDataParticle.filter(item => [5].includes(item.value));
  }

  // 年-月
  if (showtype === '4') {
    return timeDataParticle.filter(item => [3, 4, 5].includes(item.value));
  }

  return timeDataParticle;
};

/**
 * 集合粒度
 */
export const timeGatherParticle = [
  { text: _l('季'), value: 8, getTime: () => moment().format('[Q]Q') },
  { text: _l('月'), value: 9, getTime: () => moment().format('MM') },
  { text: _l('日'), value: 10, getTime: () => moment().format('DD') },
  { text: _l('时'), value: 11, getTime: () => moment().format('HH') },
  { text: _l('分'), value: 12, getTime: () => moment().format('mm') },
  { text: _l('秒'), value: 14, getTime: () => moment().format('ss') },
];

/**
 * 过滤集合粒度
 */
export const filterTimeGatherParticle = (data, { showtype, controlType }) => {
  let timeGatherParticle = [];

  if (controlType === WIDGETS_TO_API_TYPE_ENUM.TIME) {
    timeGatherParticle = data.filter(item => [11, 12, 14].includes(item.value));
  } else {
    timeGatherParticle = data.filter(item => ![12, 14].includes(item.value));
  }

  // 年
  if (showtype === '5') {
    return [];
  }

  // 年-月
  if (showtype === '4') {
    return timeGatherParticle.filter(item => ![10, 11].includes(item.value));
  }

  return timeGatherParticle;
};

/**
 * 时间控件的粒度
 */
export const timeParticleSizeDropdownData = [...timeDataParticle, ...timeGatherParticle];

export const filterTimeParticleSizeDropdownData = (showtype, controlType) => {
  return filterTimeData(timeDataParticle, { showtype, controlType }).concat(
    filterTimeGatherParticle(timeGatherParticle, { showtype, controlType }),
  );
};

/**
 * 地区控件的粒度
 */

export const formatrChartTimeText = ({ rangeType, rangeValue, dynamicFilter, today }) => {
  const typeName = _.find(dropdownScopeData, { value: rangeType }) || {};
  const text = isPastAndFuture(rangeType) ? typeName.text.replace(/(\...)/i, rangeValue) : typeName.text;

  if (rangeType === 20) {
    return rangeValue;
  } else if (rangeType === 21) {
    const { startType, startCount, startUnit } = dynamicFilter;
    const { endType, endCount, endUnit } = dynamicFilter;
    const start = _.find(timeTypes, { value: startType }).name;
    const end = _.find(timeTypes, { value: endType }).name;
    const startUnitText = [5, 6].includes(startType)
      ? `${startCount}${_.find(unitTypes, { value: startUnit }).name}`
      : '';
    const endUnitText = [5, 6].includes(endType) ? `${endCount}${_.find(unitTypes, { value: endUnit }).name}` : '';
    return _l('%0至%1', start + startUnitText, end + endUnitText);
  } else if (rangeType === 24) {
    const [year] = rangeValue.split(':');
    return _.find(fiscalYearData, { value: Number(year) }).text;
  } else {
    return [4, 8, 11, 15, 18, 19].includes(rangeType) && today ? `${text}${_l('至今天')}` : text;
  }
};

/**
 * 根据文字内容获取尺寸
 */

export const formatterTooltipTitle = (xaxes, key) => {
  if (isTimeControl(xaxes.controlType) && xaxes.particleSizeType === 2) {
    return (title, data) => {
      const value = key ? data[key] : title;
      const start = moment(value, 'GGGG[W]WW').startOf('isoWeek').format('YYYY-MM-DD');
      const end = moment(value, 'GGGG[W]WW').endOf('isoWeek').format('YYYY-MM-DD');
      return `${start} - ${end}`;
    };
  }

  return undefined;
};
