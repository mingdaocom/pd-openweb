import _ from 'lodash';
import moment from 'moment';
import { getAppTimeZone } from 'src/utils/platform/runtime/config';
import { getTimeZone } from 'src/utils/platform/runtime/timeZone';
import { getAdvanceSetting } from './advancedSetting';
import { toFixed } from './number';
import { DATE_SHOW_TYPES, UNIT_TYPE } from './setting';

/**
 * 按分钟比较两个 HH:mm 时间值。
 */
export const compareWithTime = (start, end, type) => {
  if (!start || !end) return false;
  const startTime = parseInt(start.split(':')[0]) * 60 + parseInt(start.split(':')[1]);
  const endTime = parseInt(end.split(':')[0]) * 60 + parseInt(end.split(':')[1]);

  switch (type) {
    case 'isBefore':
      return startTime < endTime;
    case 'isSameAndBefore':
      return startTime <= endTime;
    case 'isAfter':
      return startTime > endTime;
    case 'isSameAndAfter':
      return startTime >= endTime;
  }
};

/**
 * 根据日期控件配置生成选择器模式、格式及时间粒度选项。
 */
export const getDatePickerConfigs = (data = {}) => {
  let showType = getAdvanceSetting(data, 'showtype');

  if (data.originType === 38 || data.type === 38) {
    showType = data.unit ? parseFloat(data.unit) : '';
  }

  switch (showType) {
    // 年月日时分
    case 1:
      return {
        mode: 'datetime',
        formatMode: 'YYYY-MM-DD HH:mm',
      };
    // 年月日时
    case 2:
      return {
        mode: 'datetime',
        formatMode: 'YYYY-MM-DD HH',
        showMinute: false,
      };
    // 年月日
    case 3:
      return {
        mode: 'date',
        formatMode: 'YYYY-MM-DD',
      };
    // 年月
    case 4:
      return {
        mode: 'month',
        formatMode: 'YYYY-MM',
      };
    // 年
    case 5:
      return {
        mode: 'year',
        formatMode: 'YYYY',
      };
    // 年月日时分秒
    case 6:
      return {
        mode: 'datetime',
        formatMode: 'YYYY-MM-DD HH:mm:ss',
        showSecond: true,
      };
    // 时分
    case 8:
      return {
        mode: 'time',
        formatMode: 'HH:mm',
        showSecond: true,
      };
    // 时分秒
    case 9:
      return {
        mode: 'time',
        formatMode: 'HH:mm:ss',
        showSecond: true,
      };
    default:
      return data.type === 16
        ? { mode: 'datetime', formatMode: 'YYYY-MM-DD HH:mm' }
        : { mode: 'date', formatMode: 'YYYY-MM-DD' };
  }
};

/**
 * 计算日期控件最终用于展示的 moment 格式字符串。
 */
export const getShowFormat = data => {
  const { formatMode, mode } = getDatePickerConfigs(data);
  const { advancedSetting: { showformat = '0', hour12 } = {} } = data;
  let type = data.type;
  const isCustomFormat = _.isNaN(Number(showformat));
  const showType = isCustomFormat
    ? showformat.replace(/#EN#$/g, '')
    : _.get(
        _.find(DATE_SHOW_TYPES, i => i.value === showformat),
        'format',
      );

  if (data.type === 53) {
    type = data.enumDefault2;
  }

  if (mode === 'year') {
    const yearShowType = _.get(showType.match(/(y|Y)+[年]{0,1}/), '0');
    return showformat === '1' ? 'YYYY年' : yearShowType || formatMode;
  }

  // 年月需要特殊处理
  if (mode === 'month') {
    if (showformat === '1') return 'YYYY年M月';
    if (_.includes(['2', '3'], showformat)) return 'M/YYYY';
    if (showformat === '4') return 'YYYY/M';
    const yearMonthShowType = _.get(
      showType.match(/((y|Y|M)+(-|\.|\s+|年|月|年-|月-){0,1}(M|y|Y)+(年|月份|月){0,1})/),
      '0',
    );
    return yearMonthShowType || formatMode;
  }

  if (type === 16) {
    const hasTime = /[H|h|m|s|S|Z]/.test(showType);
    const newShowType = isCustomFormat && hasTime ? showType : formatMode.replace('YYYY-MM-DD', showType);
    return hour12 === '1' ? `${newShowType.replace(/H/g, 'h')} A` : newShowType;
  }

  return formatMode.replace('YYYY-MM-DD', showType);
};

/**
 * 在保留全局 locale 的前提下按自定义格式输出英文日期文本。
 */
export const getDateToEn = (showformat = '', value, originShowFormat = '') => {
  const dealFormat = showformat.replace(/#EN#$/g, '');
  const customLang = showformat.indexOf('EN') > -1;
  const oldLocale = moment.locale();
  const isCustom = originShowFormat.indexOf('#EN#') > -1;

  if (customLang || isCustom) {
    moment.locale('en');
  }

  const result = value ? moment(value).format(dealFormat) : moment().format(dealFormat);
  moment.locale(oldLocale);
  return result;
};

/**
 * 将日期公式的时长结果按配置单位拆分为年月日时分秒组合文本。
 */
export function formatFormulaDate({ value, unit = '6', hideUnitStr, dot = 0 }) {
  const isNegative = value < 0; // 处理负数
  value = toFixed(Math.floor(value * Math.pow(10, dot)) / Math.pow(10, dot), dot);
  if (isNegative) {
    value = -1 * value;
  }

  const unitType = _.find(UNIT_TYPE, type => type.value === unit);

  if (!unitType) {
    return value;
  }

  const unitStr = unitType.text;
  // 逐级进位规则：12 月 = 1 年、30 天 = 1 月、24 时 = 1 天、60 分 = 1 时、60 秒 = 1 分
  // 年必须按 12 个月折算，否则与月的进位基数不自洽（如 120 月会算成 9 年 10 月）
  const unitTimes = {
    6: 1, // 秒
    5: 12 * 30 * 24 * 60 * 60, // 年
    4: 30 * 24 * 60 * 60, // 月
    3: 24 * 60 * 60, // 天
    2: 60 * 60, // 时
    1: 60, // 分
  };
  let allSeconds = Number(value) * unitTimes[unit];
  const years = Math.floor(allSeconds / unitTimes[5]);
  allSeconds -= years * unitTimes[5];
  const months = Math.floor(allSeconds / unitTimes[4]);
  allSeconds -= months * unitTimes[4];
  const days = Math.floor(allSeconds / unitTimes[3]);
  allSeconds -= days * unitTimes[3];
  const hours = Math.floor(allSeconds / unitTimes[2]);
  allSeconds -= hours * unitTimes[2];
  const minutes = Math.floor(allSeconds / unitTimes[1]);
  allSeconds -= minutes * unitTimes[1];
  let result = [
    { value: years, unit: _l('年') },
    { value: months, unit: _l('月') },
    { value: days, unit: _l('天') },
    { value: hours, unit: _l('时') },
    { value: minutes, unit: _l('分') },
    { value: allSeconds, unit: _l('秒') },
  ]
    .slice(0, 6 - Number(unit) || 6)
    .filter(item => item.value !== 0)
    .map(item => item.value + item.unit)
    .join('');

  // 各级都为 0 时（如 0 月）兜底展示本单位
  if (!result) {
    result = 0 + unitStr;
  }

  if (hideUnitStr) {
    result = result.slice(0, -1);
  }

  return result && (isNegative ? '-' : '') + result;
}

/**
 * 根据控件的时区来源配置输出应用或用户时区的 UTC 偏移文本。
 */
export const getTimeZoneText = (data, appId) => {
  const { advancedSetting = {} } = data;
  const appTimeZone = getAppTimeZone(appId);
  const { userZone } = getTimeZone();
  const timeZone = advancedSetting.timezonetype === '1' ? appTimeZone : userZone;
  if (_.isUndefined(timeZone)) return '';
  return `UTC${timeZone > 0 ? '+' : ''}${timeZone / 60}`;
};
