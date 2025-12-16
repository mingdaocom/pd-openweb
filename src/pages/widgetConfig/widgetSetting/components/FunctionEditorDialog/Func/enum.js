import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isBetween from 'dayjs/plugin/isBetween';
import _ from 'lodash';
import { calcDate, countChar } from 'src/utils/function-library';

dayjs.extend(customParseFormat);
dayjs.extend(isBetween);

function newDate(dateStr) {
  return new Date(dayjs(dateStr || undefined).valueOf());
}

function isDateStr(str) {
  return newDate(str).toString() !== 'Invalid Date';
}
function checkIsTime(str) {
  return /^\w\w:\w\w(:\w\w)?$/.test(str);
}

function completeTime(str) {
  return checkIsTime(str) ? dayjs(str, countChar(str, ':') === 2 ? 'HH:mm:ss' : 'HH:mm').format() : str;
}

function endTimeIsBeforeStartTime(start, end) {
  start = dayjs(start).set('y', 2000).set('M', 1).set('D', 1);
  end = dayjs(end).set('y', 2000).set('M', 1).set('D', 1);
  return end.isBefore(start);
}

export const functions = {
  // 两个日期间的工作日
  NETWORKDAY: function (start, end, excludeDate = [], workDays = [1, 2, 3, 4, 5]) {
    excludeDate = excludeDate.filter(_.identity);
    if (!isDateStr(start)) {
      throw new Error(_l('开始日期不是日期类型'));
    }
    if (!isDateStr(end)) {
      throw new Error(_l('结束日期不是日期类型'));
    }
    const endIsBeforeStart = dayjs(end).isBefore(dayjs(start));
    if (endIsBeforeStart) {
      [start, end] = [end, start];
    }
    let result = dayjs(end).diff(dayjs(start), 'day') + 1;
    // 处理工作日逻辑
    const startWeekDay = dayjs(start).day();
    let endWeekDay = dayjs(end).day();
    if (endTimeIsBeforeStartTime(start, end)) {
      endWeekDay = dayjs(end).subtract(1, 'd').day();
    }
    if (result > 7) {
      const startWorkDayLength = [...new Array(7 - startWeekDay)]
        .map((d, i) => startWeekDay + i)
        .filter(d => _.includes(workDays, d)).length;
      const endWorkDayLength = [...new Array(endWeekDay)]
        .map((d, i) => i + 1)
        .filter(d => _.includes(workDays, d)).length;
      result =
        _.intersection(
          [1, 2, 3, 4, 5, 6, 7].map((d, i) => i),
          workDays,
        ).length *
          Math.floor((result - (7 - startWeekDay) - endWeekDay) / 7) +
        startWorkDayLength +
        endWorkDayLength;
    } else {
      const days = [...new Array(result)].map((d, i) => Number((startWeekDay + i).toString(7).slice(-1)));
      result = days.filter(d => _.includes(workDays, d)).length;
    }
    if (excludeDate.length) {
      result =
        result -
        excludeDate.filter(
          d =>
            _.includes(workDays, dayjs(d).day()) &&
            (dayjs(d).isBetween(start, end, 'day') || dayjs(d).isSame(start, 'day') || dayjs(d).isSame(end, 'day')),
        ).length;
    }
    return endIsBeforeStart ? -1 * result : result;
  },
  // 返回分钟数
  MINUTE: function (dateStr) {
    const minute = newDate(completeTime(dateStr)).getMinutes();
    return _.isNumber(minute) && !_.isNaN(minute) ? minute : undefined;
  },
  // 返回小时数
  HOUR: function (dateStr) {
    const hour = newDate(completeTime(dateStr)).getHours();
    return _.isNumber(hour) && !_.isNaN(hour) ? hour : undefined;
  },
  // 返回星期数
  WEEKDAY: function (dateStr) {
    if (_.isEmpty(dateStr)) return '';
    let weekday = newDate(dateStr).getDay();
    weekday = weekday === 0 ? 7 : weekday;
    return _.isNumber(weekday) && !_.isNaN(weekday) ? weekday : '';
  },
  // 返回天数
  DAY: function (dateStr) {
    if (_.isEmpty(dateStr)) return '';
    const date = newDate(dateStr).getDate();
    return _.isNumber(date) && !_.isNaN(date) ? date : undefined;
  },
  // 返回月份
  MONTH: function (dateStr) {
    if (_.isEmpty(dateStr)) return '';
    const month = newDate(dateStr).getMonth() + 1;
    return _.isNumber(month) && !_.isNaN(month) ? month : undefined;
  },
  // 返回年份
  YEAR: function (dateStr) {
    if (_.isEmpty(dateStr)) return '';
    const year = newDate(dateStr).getFullYear();
    return _.isNumber(year) && !_.isNaN(year) ? year : undefined;
  },
  // 为日期加减时间
  DATEADD: function (date, expression, format = 1) {
    expression = expression.replace(/\+\(undefined\)/g, '').replace(/\((\d+)\)/, ($0, $1) => $1);
    expression = expression.replace(/\w\w:\w\w:\w\w/g, timeStr => {
      const [h, m, s] = dayjs(timeStr, 'HH:mm:ss').format('HH:mm:ss').split(':').map(Number);
      return `${h}h+${m}m+${s}s`;
    });
    const isTime = checkIsTime(date);
    date = completeTime(date);
    const { result } = calcDate(date, expression);
    return result && result.format(isTime ? 'HH:mm:ss' : format === 1 ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss');
  },
  // 两个日期间的时长
  DATEIF: function (begin, end, type = 1, unit = 'd') {
    begin = completeTime(begin);
    end = completeTime(end);
    if (!isDateStr(begin)) {
      throw new Error(_l('开始日期不是日期类型'));
    }
    if (!isDateStr(end)) {
      throw new Error(_l('结束日期不是日期类型'));
    }
    if (!/^[YyMdhm]$/.test(unit)) {
      throw new Error(_l('单位不合法'));
    }
    if (unit === 'Y') {
      unit = 'y';
    }
    if (String(type) === '1') {
      if (/^\d{4}(-\d{2}){2}$/.test(begin)) {
        begin = dayjs(begin).startOf('day');
      }
      if (/^\d{4}(-\d{2}){2}$/.test(end)) {
        end = dayjs(end).startOf('day');
      }
    } else {
      if (/^\d{4}(-\d{2}){2}$/.test(begin)) {
        begin = dayjs(begin).startOf('day');
      }
      if (/^\d{4}(-\d{2}){2}$/.test(end)) {
        end = dayjs(end).add(1, 'day').startOf('day');
      }
    }
    const result = dayjs(end).diff(begin, unit);
    return (
      result +
      ({
        y: _l('年%04019'),
        M: _l('月%04020'),
        d: _l('天%04021'),
        h: _l('时%04022'),
        m: _l('分%04023'),
      }[unit] || '')
    );
  },
  DATENOW: function () {
    return dayjs().format('YYYY-MM-DD HH:mm:ss');
  },
  // 计对象数量
  COUNTARRAY: function (values) {
    if (typeof values === 'string' && _.isNumber(+values) && !_.isNaN(+values)) {
      return values;
    }
    return values ? values.length : 0;
  },
  // 计算赋分值
  // SCORE: function (values) {
  //   return _.sum(
  //     values.map(item => {
  //       let value = 0;
  //       const num = Number(item.score || 0);
  //       if (!_.isNaN(num)) {
  //         value = num;
  //       }
  //       return value;
  //     }),
  //   );
  // },
  // 条件求和
  // SUMIF: function () {},
  // // 条件计数
  // COUNTIF: function () {},
  // 返回随机数
  RANDBETWEEN: function (begin, end) {
    begin = Math.round(Number(begin));
    end = Math.round(Number(end));
    if (!_.isNumber(begin) || _.isNaN(end)) {
      throw new Error(_l('开始位置不是数字'));
    }
    if (!_.isNumber(end) || _.isNaN(end)) {
      throw new Error(_l('结束位置不是数字'));
    }
    return begin + Math.floor(Math.random() * (end - begin + 1));
  },
  // 向下舍入
  ROUNDDOWN: function (number, precision = 0) {
    number = Number(number);
    precision = Number(precision);
    if (!_.isNumber(number) || _.isNaN(number)) {
      throw new Error(_l('参数不是数字'));
    }
    if (!_.isNumber(precision) || _.isNaN(precision)) {
      throw new Error(_l('参数不是数字'));
    }
    return _.floor(number, precision);
  },
  // 向上舍入
  ROUNDUP: function (number, precision = 0) {
    number = Number(number);
    precision = Number(precision);
    if (!_.isNumber(number) || _.isNaN(number)) {
      throw new Error(_l('参数不是数字'));
    }
    if (!_.isNumber(precision) || _.isNaN(precision)) {
      throw new Error(_l('参数不是数字'));
    }
    return _.ceil(_.round(number, precision + 10), precision);
  },
  // 四舍五入
  ROUND: function (number, precision = 0) {
    number = Number(number);
    precision = Number(precision);
    if (!_.isNumber(number) || _.isNaN(number)) {
      throw new Error(_l('参数不是数字'));
    }
    if (!_.isNumber(precision) || _.isNaN(precision)) {
      throw new Error(_l('参数不是数字'));
    }
    const factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  },
  // 按指定倍数向上舍入
  CEILING: function (number, significance) {
    number = Number(number);
    significance = Number(significance);
    if (!_.isNumber(number) || _.isNaN(number)) {
      throw new Error(_l('参数不是数字'));
    }
    if (!_.isNumber(significance) || _.isNaN(significance)) {
      throw new Error(_l('参数不是数字'));
    }
    if (number > 0 && significance < 0) {
      throw new Error('#NUM!');
    }
    return Math.ceil(number / significance) * significance;
  },
  // 按指定倍数向下舍入
  FLOOR: function (number, significance) {
    number = Number(number);
    significance = Number(significance);
    if (!_.isNumber(number) || _.isNaN(number)) {
      throw new Error(_l('参数不是数字'));
    }
    if (!_.isNumber(significance) || _.isNaN(significance)) {
      throw new Error(_l('参数不是数字'));
    }
    if (number > 0 && significance < 0) {
      throw new Error('#NUM!');
    }
    return Math.floor(number / significance) * significance;
  },
  // 求余
  MOD: function (number, divisor) {
    if (typeof number === 'undefined') {
      return;
    }
    number = Number(number);
    divisor = Number(divisor);
    if (!_.isNumber(number) || _.isNaN(number)) {
      throw new Error(_l('被除数不是数字'));
    }
    if (!_.isNumber(divisor) || _.isNaN(divisor)) {
      throw new Error(_l('除数不是数字'));
    }
    if (divisor === 0) {
      throw new Error(_l('除数不能为0'));
    }
    // 处理小数情况下的精度问题
    if (Math.floor(number) !== number || Math.floor(divisor) !== divisor) {
      // 获取小数位数
      const decimalPlaces = Math.max(
        (number.toString().split('.')[1] || '').length,
        (divisor.toString().split('.')[1] || '').length,
      );

      if (decimalPlaces > 0) {
        // 将小数转换为整数进行计算，然后再转回小数
        const factor = Math.pow(10, decimalPlaces);
        const n = Math.round(number * factor);
        const d = Math.round(divisor * factor);
        return (n % d) / factor;
      }
    }
    return number % divisor;
  },
  // 求整
  INT: function (value) {
    value = Number(value);
    if (!_.isNumber(value) || _.isNaN(value)) {
      throw new Error(_l('参数不是数字'));
    }
    return Math.floor(value);
  },
  // 绝对值
  ABS: function (value) {
    value = Number(value);
    if (!_.isNumber(value) || _.isNaN(value)) {
      throw new Error(_l('参数不是数字'));
    }
    return Math.abs(value);
  },
  // 计数
  COUNTA: function (...array) {
    return array.filter(
      item =>
        typeof item !== 'undefined' && String(item).trim() !== '' && item !== null && !_.isNaN(item) && item !== false,
    ).length;
  },
  // 计空值数
  COUNTBLANK: function (...array) {
    return array.filter(
      item =>
        !(
          typeof item !== 'undefined' &&
          String(item).trim() !== '' &&
          item !== null &&
          !_.isNaN(item) &&
          item !== false
        ),
    ).length;
  },
  // 乘积
  PRODUCT: function (...args) {
    args = args.map(d => Number(d));
    if (_.some(args, d => !_.isNumber(d) || _.isNaN(d))) {
      return;
    }
    return args.reduce((a, b) => a * b);
  },
  // 最大值
  MAX: function (...args) {
    args = args.filter(a => !(_.isUndefined(a) || String(a).trim() === ''));
    if (!args.length) {
      return 0;
    }
    return Math.max(...args);
  },
  // 最小值
  MIN: function (...args) {
    args = args.filter(a => !(_.isUndefined(a) || String(a).trim() === ''));
    if (!args.length) {
      return 0;
    }
    return Math.min(...args);
  },
  // 平均值
  AVERAGE: function (...args) {
    args = args.filter(a => !(_.isUndefined(a) || String(a).trim() === ''));
    if (!args.length) {
      return 0;
    }
    return _.sum(args.map(Number)) / args.length;
  },
  // 求和
  SUM: function (...args) {
    args = args.map(item => (_.isUndefined(item) ? 0 : item));
    if (!args.length) {
      throw new Error(_l('没有参数'));
    }
    return _.sum(args.map(Number));
  },
  // 转为数值
  NUMBER: function (value) {
    return Number(Number(value).toFixed(14));
  },
  // 求幂
  POWER: function (base, exponent) {
    return Math.pow(base, exponent);
  },
  // 求对数
  LOG: function (logarithm, base) {
    return Math.log(logarithm) / Math.log(base);
  },
  // 替换文本
  REPLACE: function (text, begin = 1, length = 0, newText = '') {
    if (typeof text === 'undefined') {
      throw new Error('REPLACE: text is undefined');
    }
    begin = Number(begin);
    length = Number(length);
    return (
      text.slice(0, begin - 1 > 0 ? begin - 1 : 0) + newText + text.slice((begin - 1 > 0 ? begin - 1 : 0) + length)
    );
  },
  // 生成重复字符
  REPT: function (char = '*', length = 0) {
    if (length > 10000) {
      throw new Error(_l('长度太大'));
    }
    if (char === '') {
      throw new Error(_l('重复字符不能为空'));
    }
    let result = '';
    let count = 0;
    while (count < length) {
      result += char;
      count++;
    }
    return result;
  },
  // 从中间提取
  MID: function (text = '', begin = 1, length = 0) {
    begin = Number(begin);
    length = Number(length);
    return text.substr(begin - 1 > 0 ? begin - 1 : 0, length);
  },
  // 从右提取
  RIGHT: function (text = '', length = 1) {
    length = Number(length);
    return String(text).slice(-1 * Math.abs(length));
  },
  // 从左提取
  LEFT: function (text = '', length = 1) {
    length = Number(length);
    return String(text).slice(0, length);
  },
  // 转大写
  UPPER: function (str = '') {
    return String(str).toUpperCase();
  },
  // 转小写
  LOWER: function (str = '') {
    return String(str).toLowerCase();
  },
  // 合并文本
  CONCAT: function (...args) {
    let result = '';
    args = args.filter(a => !_.isUndefined(a) && !_.isNull(a)).map(String);
    while (args.length) {
      result += args.shift() || '';
    }
    return result;
  },
  // 强制转文本
  STRING: function (value) {
    if (_.isArray(value)) {
      return value
        .map(item => {
          let str = '';
          try {
            if (typeof item === 'string') {
              str = item;
            } else if (typeof item === 'object') {
              str = item.text || '';
            }
          } catch (err) {
            console.log(err);
          }
          return str;
        })
        .join(',');
    }
    return String(typeof value === 'undefined' ? '' : value);
  },
  // 删除空格
  TRIM: function (value) {
    return String(value || '').trim();
  },
  // 删除所有空格
  CLEAN: function (value) {
    return String(value || '').replace(/ /g, '');
  },
  // 条件语句
  IF: function (expression, trueResult, falseResult) {
    return expression ? trueResult : falseResult;
  },
  // 求或
  OR: function (...args) {
    return _.some(args.map(e => eval(e)));
  },
  // 求同
  AND: function (...args) {
    return _.every(args.map(e => eval(e)));
  },
  // 求反
  NOT: function (expression) {
    return !eval(expression);
  },
  // 返回false
  FALSE: function () {
    return false;
  },
  // 返回true
  TRUE: function () {
    return true;
  },
  // 是否为空
  ISBLANK: function (value) {
    return typeof value === 'undefined' || value === null || value === '' || value === '[]' || _.isEqual(value, []);
  },
  // 高级函数
  ENCODEURI: function (value) {
    return encodeURI(String(value || ''));
  },
  DECODEURI: function (value) {
    return decodeURI(String(value || ''));
  },
  ENCODEURICOMPONENT: function (value) {
    return encodeURIComponent(String(value || ''));
  },
  DECODEURICOMPONENT: function (value) {
    return decodeURIComponent(String(value || ''));
  },
  // 计算经纬度坐标距离
  DISTANCE: function (location1, location2) {
    let lon1, lat1, lon2, lat2;
    if (_.isObject(location1)) {
      lon1 = location1.x;
      lat1 = location1.y;
    } else if (typeof location1 === 'string' && /^\d+(\.\d+)?,\d+(\.\d+)?$/.test(location1)) {
      lon1 = parseFloat(location1.split(',')[0]);
      lat1 = parseFloat(location1.split(',')[1]);
    }
    if (_.isObject(location2)) {
      lon2 = location2.x;
      lat2 = location2.y;
    } else if (typeof location2 === 'string' && /^\d+(\.\d+)?,\d+(\.\d+)?$/.test(location2)) {
      lon2 = parseFloat(location2.split(',')[0]);
      lat2 = parseFloat(location2.split(',')[1]);
    }
    if (!(lon1 && lat1 && lon2 && lat2)) {
      return;
    }
    if (lat1 === lat2 && lon1 === lon2) {
      return 0;
    } else {
      var radlat1 = (Math.PI * lat1) / 180;
      var radlat2 = (Math.PI * lat2) / 180;
      var theta = lon1 - lon2;
      var radtheta = (Math.PI * theta) / 180;
      var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist);
      dist = (dist * 180) / Math.PI;
      dist = dist * 60 * 1.1515 * 1.609344;
      return dist;
    }
  },
  // 查找单个文本
  FIND: function (text = '', start, end) {
    if (start) {
      start = start.replace(/([(?[*)|])/g, '\\$1');
    }
    if (end) {
      end = end.replace(/([(?[*)|])/g, '\\$1');
    }
    if (!text || (!start && !end)) {
      return text;
    } else if (!start) {
      return (text.match(new RegExp(`^(.+?)${end}`)) || '')[1];
    } else if (!end) {
      return (text.match(new RegExp(`${start}(.+?)$`)) || '')[1];
    } else {
      return (text.match(new RegExp(`${start}(.+?)${end}`)) || '')[1];
    }
  },
  // 查找多个文本
  FINDA: function (text = '', start, end) {
    if (!start || !end) {
      return [];
    }
    if (start) {
      start = start.replace(/([(?[*)])/g, '\\$1');
    }
    if (end) {
      end = end.replace(/([(?[*)])/g, '\\$1');
    }
    const regexp = new RegExp(`${start}(.+?)${end}`, 'g');
    const result = [];
    var match = regexp.exec(text);
    while (match != null) {
      result.push(match[1]);
      match = regexp.exec(text);
    }
    return result;
  },
  SPLIT: function (text = '', splitter = '') {
    return text.split(splitter);
  },
  JOIN: function (list = [], splitter = '') {
    return list.join(splitter);
  },
  INCLUDE: function (value, matchStr) {
    if (!value || !matchStr) {
      return;
    }
    return String(value).indexOf(matchStr) > -1;
  },
  GETPOSITION: function (value = {}, key) {
    if (key === 'x,y') {
      return value.x && value.y ? `${value.x},${value.y}` : '';
    }
    return value[key] || '';
  },
  COUNTCHAR: function (value) {
    return value.replace(/(\r\n|\n)/g, '').length;
  },
  // 圆周率
  PI: function () {
    return Math.PI;
  },
  // 角度转弧度
  RADIANS: function (value) {
    value = Number(value);
    return (value * Math.PI) / 180;
  },
  // 弧度转角度
  DEGREES: function (value) {
    value = Number(value);
    return (value * 180) / Math.PI;
  },
  // 正弦
  SIN: function (value) {
    value = Number(value);
    return Math.sin(value);
  },
  // 余弦
  COS: function (value) {
    value = Number(value);
    return Math.cos(value);
  },
  // 正切
  TAN: function (value) {
    value = Number(value);
    return Math.tan(value);
  },
  // 反正切
  COT: function (value) {
    value = Number(value);
    return 1 / Math.tan(value);
  },
  // 反正弦
  ASIN: function (value) {
    value = Number(value);
    return Math.asin(value);
  },
  // 反余弦
  ACOS: function (value) {
    value = Number(value);
    return Math.acos(value);
  },
  // 反正切
  ATAN: function (value) {
    value = Number(value);
    return Math.atan(value);
  },
  // 反余切
  ACOT: function (value) {
    value = Number(value);
    return Math.atan(1 / value);
  },
  // 内容替换函数
  SUBSTITUTE: function (value, matchStr, replaceStr, position) {
    value = String(value);
    matchStr = String(matchStr);
    replaceStr = String(replaceStr);

    // 转义正则表达式特殊字符
    const escapeRegExp = str => {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    const escapedMatchStr = escapeRegExp(matchStr);

    // 如果未指定替换位置，则替换所有匹配项
    if (typeof position === 'undefined') {
      return value.replace(new RegExp(escapedMatchStr, 'g'), replaceStr);
    }

    position = Number(position);

    // 如果位置不是有效数字，直接返回原字符串
    if (isNaN(position) || position <= 0) {
      return value;
    }

    let occurrencesFound = 0;
    const result = value.replace(new RegExp(escapedMatchStr, 'g'), match => {
      occurrencesFound++;
      return occurrencesFound === position ? replaceStr : match;
    });

    return result;
  },
  IFS: function (...conditions) {
    for (let i = 0; i < conditions.length; i += 2) {
      const condition = conditions[i];
      const value = conditions[i + 1];
      if (condition) {
        return value;
      }
    }
    return null;
  },
  // 工作日计算函数
  WORKDAY: function (start_date, days, holidays = []) {
    if (!start_date) {
      return;
    }
    if (!isDateStr(start_date)) {
      throw new Error(_l('开始日期不是日期类型'));
    }

    days = Number(days);
    if (isNaN(days)) {
      throw new Error(_l('天数必须是数字'));
    }

    const start = dayjs(start_date);
    let result = start;
    let count = 0;
    const holidaysSet = new Set(holidays.filter(d => d).map(d => dayjs(d).format('YYYY-MM-DD')));

    while (count < Math.abs(days)) {
      result = days > 0 ? result.add(1, 'day') : result.subtract(1, 'day');
      const dayOfWeek = result.day();
      // 如果不是周末(0是周日，6是周六)且不是假期，则计数加1
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidaysSet.has(result.format('YYYY-MM-DD'))) {
        count++;
      }
    }

    return result.format('YYYY-MM-DD');
  },
  // 工作日计算函数（支持自定义周末）
  WORKDAY_INTL: function (start_date, days, weekend = 1, holidays = []) {
    if (!start_date) {
      return;
    }
    if (!isDateStr(start_date)) {
      throw new Error(_l('开始日期不是日期类型'));
    }

    days = Number(days);
    if (isNaN(days)) {
      throw new Error(_l('天数必须是数字'));
    }

    // 定义周末设置
    let weekendDays = [];
    if (weekend === 1 || weekend === undefined) {
      weekendDays = [0, 6]; // 周六、周日
    } else if (weekend === 2) {
      weekendDays = [0, 1]; // 周日、周一
    } else if (weekend === 3) {
      weekendDays = [1, 2]; // 周一、周二
    } else if (weekend === 4) {
      weekendDays = [2, 3]; // 周二、周三
    } else if (weekend === 5) {
      weekendDays = [3, 4]; // 周三、周四
    } else if (weekend === 6) {
      weekendDays = [4, 5]; // 周四、周五
    } else if (weekend === 7) {
      weekendDays = [5, 6]; // 周五、周六
    } else if (weekend === 11) {
      weekendDays = [0]; // 仅周日
    } else if (weekend === 12) {
      weekendDays = [1]; // 仅周一
    } else if (weekend === 13) {
      weekendDays = [2]; // 仅周二
    } else if (weekend === 14) {
      weekendDays = [3]; // 仅周三
    } else if (weekend === 15) {
      weekendDays = [4]; // 仅周四
    } else if (weekend === 16) {
      weekendDays = [5]; // 仅周五
    } else if (weekend === 17) {
      weekendDays = [6]; // 仅周六
    }

    const start = dayjs(start_date);
    let result = start;
    let count = 0;
    const holidaysSet = new Set(holidays.filter(d => d).map(d => dayjs(d).format('YYYY-MM-DD')));

    while (count < Math.abs(days)) {
      result = days > 0 ? result.add(1, 'day') : result.subtract(1, 'day');
      const dayOfWeek = result.day();
      // 如果不是周末且不是假期，则计数加1
      if (!weekendDays.includes(dayOfWeek) && !holidaysSet.has(result.format('YYYY-MM-DD'))) {
        count++;
      }
    }

    return result.format('YYYY-MM-DD');
  },

  // 周数计算函数
  WEEKNUM: function (date, return_type = 1) {
    if (!date) {
      return;
    }
    if (!isDateStr(date)) {
      throw new Error(_l('日期不是日期类型'));
    }

    const d = dayjs(date);
    let firstDayOfWeek = 0; // 默认周日为一周的第一天

    // 设置一周的第一天
    if (return_type === 2 || return_type === 11 || return_type === 21) {
      firstDayOfWeek = 1; // 周一为一周的第一天
    } else if (return_type === 12) {
      firstDayOfWeek = 2; // 周二为一周的第一天
    } else if (return_type === 13) {
      firstDayOfWeek = 3; // 周三为一周的第一天
    } else if (return_type === 14) {
      firstDayOfWeek = 4; // 周四为一周的第一天
    } else if (return_type === 15) {
      firstDayOfWeek = 5; // 周五为一周的第一天
    } else if (return_type === 16) {
      firstDayOfWeek = 6; // 周六为一周的第一天
    }

    // 计算年份的第一天
    const firstDayOfYear = dayjs(d.format('YYYY-01-01'));

    // 计算年份第一天是星期几
    const firstDayWeekday = firstDayOfYear.day();

    // 计算第一周的偏移量
    let offset = 0;
    if (return_type === 21) {
      // ISO 周数计算方式
      offset = firstDayWeekday > 0 && firstDayWeekday <= 4 ? 1 : 0;
    }

    // 计算从年初到当前日期的天数
    const dayOfYear = d.diff(firstDayOfYear, 'day');

    // 计算周数
    let weekNum = Math.floor((dayOfYear + ((firstDayWeekday - firstDayOfWeek + 7) % 7)) / 7) + 1 + offset;

    return weekNum;
  },

  // 字符串反转函数
  STRREVERSE: function (text) {
    if (typeof text !== 'string') {
      text = String(text || '');
    }
    return text.split('').reverse().join('');
  },

  // 标准正态分布累积函数
  NORM_S_DIST: function (z, cumulative = true) {
    z = Number(z);
    if (!_.isNumber(z) || _.isNaN(z)) {
      throw new Error(_l('参数不是数字'));
    }

    if (cumulative) {
      // 计算累积分布函数 (CDF)
      // 使用近似公式计算标准正态分布的累积概率
      const a1 = 0.254829592;
      const a2 = -0.284496736;
      const a3 = 1.421413741;
      const a4 = -1.453152027;
      const a5 = 1.061405429;
      const p = 0.3275911;

      const sign = z < 0 ? -1 : 1;
      const x = Math.abs(z) / Math.sqrt(2);
      const t = 1.0 / (1.0 + p * x);
      const erf = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

      return 0.5 * (1.0 + sign * erf);
    } else {
      // 计算概率密度函数 (PDF)
      return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z);
    }
  },

  // 排列组合函数
  PERMUT: function (number, number_chosen) {
    number = Number(number);
    number_chosen = Number(number_chosen);

    if (!_.isNumber(number) || _.isNaN(number) || number < 0 || !Number.isInteger(number)) {
      throw new Error(_l('总对象数必须是非负整数'));
    }

    if (!_.isNumber(number_chosen) || _.isNaN(number_chosen) || number_chosen < 0 || !Number.isInteger(number_chosen)) {
      throw new Error(_l('选择对象数必须是非负整数'));
    }

    if (number_chosen > number) {
      throw new Error(_l('选择对象数不能大于总对象数'));
    }

    // 计算排列数 P(n,k) = n! / (n-k)!
    let result = 1;
    for (let i = number - number_chosen + 1; i <= number; i++) {
      result *= i;
    }

    return result;
  },

  // 组合数计算函数
  COMBIN: function (number, number_chosen) {
    number = Number(number);
    number_chosen = Number(number_chosen);

    if (!_.isNumber(number) || _.isNaN(number) || number < 0 || !Number.isInteger(number)) {
      throw new Error(_l('总对象数必须是非负整数'));
    }

    if (!_.isNumber(number_chosen) || _.isNaN(number_chosen) || number_chosen < 0 || !Number.isInteger(number_chosen)) {
      throw new Error(_l('选择对象数必须是非负整数'));
    }

    if (number_chosen > number) {
      throw new Error(_l('选择对象数不能大于总对象数'));
    }

    // 优化计算组合数 C(n,k) = n! / (k! * (n-k)!)
    // 为避免大数计算溢出，使用更高效的算法
    number_chosen = Math.min(number_chosen, number - number_chosen);
    let result = 1;
    for (let i = 1; i <= number_chosen; i++) {
      result = (result * (number - (i - 1))) / i;
    }

    return Math.round(result);
  },
};

export const functionTypes = {
  math: _l('数学函数'),
  date: _l('日期函数'),
  string: _l('文本函数'),
  flow: _l('逻辑函数'),
  advanced: _l('高级函数'),
};

const functionDetailsMap = {
  // date 日期函数
  NETWORKDAY: {
    name: _l('两个日期间的工作日'),
    type: 'date',
    title: _l("计算两个日期间包含的工作日数；输出单位恒定为'天'"),
    des: `<bb>${_l(`NETWORKDAY(开始日期,结束日期,[节假日期1,节假日期2,...])`)}</bb></br>
        <li>${_l(
          `[节假日期组]：使用字段值或固定值指明哪些天是节假日；如果不指定这个参数，系统只会自动排除掉周六及周日`,
        )}</li>
        <b>${_l(`示例：=NETWORKDAY('2021-3-8','2021-3-14',['2021-3-8']) ，结果：4天`)}</b></br>
        ${_l(`计算 2021-3-8 至 2021-3-14 期间的工作日，排除三八妇女节`)}`,
  },
  MINUTE: {
    name: _l('返回分钟数'),
    type: 'date',
    title: _l('返回时间中的分钟数，返回值范围在 0 - 59 之间'),
    des: `<bb>${_l(`MINUTE(日期时间/时间)`)}</bb><br/>
        <b>${_l(`示例：=MINUTE('2021-5-1 11:59') ，结果：59`)}</b><br/>
        ${_l(`返回 2021-5-1 11:59 的分钟数`)}`,
  },
  HOUR: {
    name: _l('返回小时数'),
    type: 'date',
    title: _l('返回时间中的小时数，返回值范围在 0 - 23 之间'),
    des: `<bb>${_l(`HOUR(日期时间/时间)`)}</bb><br/>
        <b>${_l(`示例：=HOUR('2021-5-1 11:59') ，结果：11`)}</b><br/>
        ${_l(`返回 2021-5-1 11:59 的小时数`)}`,
  },
  WEEKDAY: {
    name: _l('返回星期数'),
    type: 'date',
    title: _l('返回日期的星期数，返回值范围在 1 - 7 之间'),
    des: `<bb>${_l(`WEEKDAY(日期时间)`)}</bb><br/>
        <b>${_l(`示例：=WEEKDAY('2021-5-1') ，结果：6`)}</b><br/>
        ${_l(`返回 2021-5-1 的星期数`)}`,
  },
  DAY: {
    name: _l('返回天数'),
    type: 'date',
    title: _l('返回日期的天数，返回值范围在 1 - 31 之间'),
    des: `<bb>${_l(`DAY(日期时间)`)}</bb><br/>
        <b>${_l(`示例：=DAY('2021-5-1') ，结果：1`)}</b><br/>
        ${_l(`返回 2021-5-1 的天数`)}`,
  },
  MONTH: {
    name: _l('返回月份'),
    type: 'date',
    title: _l('返回日期的月份，返回值范围在 1 - 12 之间'),
    des: `<bb>${_l(`MONTH(日期时间)`)}</bb><br/>
        <b>${_l(`示例：=MONTH('2021-5-1') ，结果：5`)}</b><br/>
        ${_l(`返回 2021-5-1 的月份`)}`,
  },
  YEAR: {
    name: _l('返回年份'),
    type: 'date',
    title: _l('返回日期的四位年份'),
    des: `<bb>${_l(`YEAR(日期时间)`)}</bb></br>
        <b>${_l(`示例：=YEAR('2021-5-1') ，结果：2021`)}</b><br/>
      ${_l(`返回 2021-5-1 的年份`)}`,
  },
  DATEADD: {
    name: _l('为日期加减时间'),
    type: 'date',
    title: _l('对某个日期添加/减去一定时间段，再对计算结果设置格式，1代表日期，2代表日期时间'),
    des: `<bb>${_l(`DATEADD(初始日期,计算式,[输出格式])`)}</bb></br>
        <li>${_l(
          `计算式：'+'或'-'代表添加或减去；时间段的单位，'Y'代表年、'M'代表月、'd'代表天、'h'代表小时、'm'代表分钟；也可以添加或减去一个时间字段`,
        )}</li>
        <li>${_l(`[输出格式]：1代表日期格式，2代表日期时间格式；如果不指定这个参数，则默认是类型1`)}</li>
        <b>${_l(`示例：=DATEADD('2008-11-11 12:23','+8h',2) ，结果：2008-11-11 20:23`)}</b></br>
        ${_l(`求 2008-11-11 12:23 8小时后的时间点，结果保持日期时间格式`)}`,
  },
  DATEIF: {
    name: _l('时长'),
    type: 'date',
    title: _l('计算两个日期/时间之间的时长，并精确到年、月、天、小时或分'),
    des: `<bb>${_l(`DATEIF(开始,结束,格式化方式,[输出单位])`)}</bb></br>
        <li>${_l(`格式化方式：1-开始日期00:00结束日期00:00，2-开始日期00:00结束日期24:00`)}</li>
        <li>${_l(`输出单位：'Y'-年；'M'-月；'d'-天；'h'-小时；'m'-分钟；如果不指定这个参数，则默认为'd'`)}</li>
        <b>${_l(`示例：=DATEIF('2021-3-8','2021-3-14',2,'d') ，结果：7天`)}</b></br>
        ${_l(`计算 2021-3-8 至 2021-3-14 期间的时长，精确到天`)}`,
  },
  DATENOW: {
    name: _l('返回当前时间'),
    type: 'date',
    title: _l('返回当前时间'),
    des: `<bb>${_l(`DATENOW()`)}</bb></br>
        <b>${_l(`示例：=DATENOW() ，结果：2008-11-11 12:23`)}</b>`,
  },
  // math 数学函数
  COUNTARRAY: {
    name: _l('计对象数量'),
    type: 'math',
    title: _l('计算人员、部门、多选、子表或关联表的数量'),
    des: `<bb>${_l(`COUNTARRAY(数组类字段)`)}</bb></br>
          <b>${_l(`示例：=COUNTARRAY(工序) ，结果：7`)}</b></br>
        ${_l(`计算名称为"工序"的子表数量（实际有7道工序）`)}`,
  },
  RANDBETWEEN: {
    name: _l('返回随机数'),
    type: 'math',
    title: _l('随机输出指定两个数字之间的一个整数；在新建记录时生成后，值将不再改变'),
    des: `<bb>${_l(`RANDBETWEEN(最小值,最大值)`)}</bb></br>
        <b>${_l(`示例：=RANDBETWEEN(1,10) ，结果：7`)}</b></br>
        ${_l(`随机输出1-10之间的一个数字`)}`,
  },
  ROUNDDOWN: {
    name: _l('向下舍入'),
    type: 'math',
    title: _l('以绝对值减小的方向按指定位数舍入数字'),
    des: `<bb>${_l(`ROUNDDOWN(数值,位数)`)}</bb></br>
      <b>${_l(`示例：=ROUNDDOWN(3.14159265,4) ，结果：3.1415`)}</b></br>
      ${_l(`保留 3.14159265 的四位小数`)}`,
  },
  CEILING: {
    name: _l('按指定倍数向上舍入'),
    type: 'math',
    title: _l('以绝对值增大的方向按指定倍数舍入数字'),
    des: `
    <bb>${_l(`CEILING(数值,基数)`)}</bb></br>
    <b>${_l(`示例：=CEILING(7,3)，结果：9`)}</b></br>
    ${_l(`取最接近7且大于7的3的倍数`)}`,
  },
  FLOOR: {
    name: _l('按指定倍数向下舍入'),
    type: 'math',
    title: _l('以绝对值减小的方向按指定倍数舍入数字'),
    des: `
    <bb>${_l(`FLOOR(数值,基数)`)}</bb></br>
    <b>${_l(`示例：=FLOOR(7,3)，结果：6`)}</b></br>
    ${_l(`取最接近7且小于7的3的倍数`)}`,
  },
  ROUNDUP: {
    name: _l('向上舍入'),
    type: 'math',
    title: _l('以绝对值增大的方向按指定位数舍入数字'),
    des: `<bb>${_l(`ROUNDUP(数值,位数)`)}</bb></br>
        <b>${_l(`示例：=ROUNDUP(3.14159265,4) ，结果：3.1416`)}</b></br>
      ${_l(`保留 3.14159265 的四位小数`)}`,
  },
  ROUND: {
    name: _l('四舍五入'),
    type: 'math',
    title: _l('按指定位数对数字进行四舍五入'),
    des: `<bb>${_l(`ROUND(数值,位数)`)}</bb></br>
        <b>${_l(`示例：=ROUND(3.14159265,4) ，结果：3.1416`)}</b></br>
      ${_l(`保留 3.14159265 的四位小数`)}`,
  },
  MOD: {
    name: _l('求余'),
    type: 'math',
    title: _l('返回两数相除的余数'),
    des: `<bb>${_l(`MOD(被除数,除数)`)}</bb></br>
      <b>${_l(`示例：=MOD(15,4) ，结果：3`)}</b></br>
      ${_l(`计算 15 除以 4 的余数`)}`,
  },
  INT: {
    name: _l('求整'),
    type: 'math',
    title: _l('返回永远小于等于原数字的最接近的整数'),
    des: `<bb>${_l(`INT(数值)`)}</bb></br>
        <b>${_l(`示例：=INT(-3.14159265) ，结果：-4`)}</b></br>
      ${_l(`对 -3.14159265 进行求整`)}`,
  },
  ABS: {
    name: _l('绝对值'),
    type: 'math',
    title: _l('计算数字的绝对值'),
    des: `
        <bb>${_l(`ABS(数值)`)}</bb></br>
        <b>${_l(`示例：=ABS(-7) ，结果：7`)}</b></br>
        ${_l(`求 -7 的绝对值`)}`,
  },
  COUNTA: {
    name: _l('计数'),
    type: 'math',
    title: _l('计算参数中包含非空值的个数'),
    des: `
      <bb>${_l(`COUNTA(数值1,数值2...)`)}</bb></br>
      <b>${_l(`示例：=COUNTA(1月,2月,3月) ，结果：2`)}</b></br>
        ${_l(
          `计算第一季度指标的完成数量，该表有三个检查框对应1、2、3月指标是否完成，名称分别为1月、2月、3月，2月份未完成`,
        )}`,
  },
  COUNTBLANK: {
    name: _l('计空值数'),
    type: 'math',
    title: _l('计算参数中包含的空值个数'),
    des: `
      <bb>${_l(`COUNTBLANK(数值1,数值2...)`)}</bb></br>
      <b>${_l(`示例：=COUNTBLANK(1月,2月,3月) ，结果：1`)}</b></br>
        ${_l(
          `计算第一季度指标的未完成数量，该表有三个检查框对应1、2、3月指标是否完成，名称分别为1月、2月、3月，2月份未完成`,
        )}`,
  },
  PRODUCT: {
    name: _l('乘积'),
    type: 'math',
    title: _l('返回两数相乘的积'),
    des: `
      <bb>${_l(`PRODUCT(数值1,数值2...)`)}</bb></br>
      <b>${_l(`示例：=PRODUCT(15,4) ，结果：60`)}</b></br>
        ${_l(`计算 15 乘以 4 的积`)}`,
  },
  MAX: {
    name: _l('最大值'),
    type: 'math',
    title: _l('返回一组数字中的最大值'),
    des: `
        <bb>${_l(`MAX(数值1,数值2...)`)}</bb></br>
        <b>${_l(`示例：=MAX(10,20,30) ，结果：30`)}</b></br>
        ${_l(`返回10,20,30中最大的数字`)}`,
  },
  MIN: {
    name: _l('最小值'),
    type: 'math',
    title: _l('返回一组数字中的最小值'),
    des: `
      <bb>${_l(`MIN(数值1,数值2...)`)}</bb></br>
      <b>${_l(`示例：=MIN(10,20,30) ，结果：10`)}</b></br>
    ${_l(`返回10,20,30中最小的数字`)}`,
  },
  AVERAGE: {
    name: _l('平均值'),
    type: 'math',
    title: _l('计算参数的平均值'),
    des: `
    <bb>${_l(`AVERAGE(数值1,数值2...)`)}</bb></br>
    <b>${_l(`示例：=AVERAGE(10,20,30) ，结果：20`)}</b></br>
    ${_l(`计算10,20,30的平均值`)}`,
  },
  SUM: {
    name: _l('求和'),
    type: 'math',
    title: _l('计算数字之和'),
    des: `
    <bb>${_l(`SUM(数值1,数值2...)`)}</bb></br>
    <b>${_l(`示例：=SUM(10,20,30) ，结果：60`)}</b></br>
    ${_l(`计算10,20,30的和`)}`,
  },
  NUMBER: {
    name: _l('强制转为数值'),
    type: 'math',
    title: _l('将文本等类型的值转为数值'),
    des: `
    <bb>${_l(`NUMBER(文本)`)}</bb></br>
    <b>${_l(`示例：=NUMBER(IF(TRUE(),'-1','0'))+5，结果：4`)}</b></br>
    ${_l(`将 '-1' 和 5 相加（if输出的结果类型固定为文本）`)}`,
  },
  POWER: {
    name: _l('计算数字的乘幂'),
    type: 'math',
    des: `
    <bb>${_l(`POWER(底数，指数)`)}</bb></br>
    <b>${_l(`示例：=POWER(2,3)，结果：8`)}</b></br>
    ${_l(`计算2的3次方`)}`,
  },
  LOG: {
    name: _l('计算以指定数字为底的对数'),
    type: 'math',
    des: `
    <bb>${_l(`LOG(真数,底数)`)}</bb></br>
    <b>${_l(`示例：=LOG(8,2)，结果：3`)}</b></br>
    ${_l(`计算以2为底8的对数`)}`,
  },
  PI: {
    name: _l('PI函数'),
    type: 'math',
    title: _l('返回 π (pi)（圆的圆周与其直径的比）的近似值'),
    des: `
    <bb>${_l(`PI( )`)}</bb></br>
    <b>${_l(`示例：=PI( ) 返回近似值 3.141592653589793。`)}</b></br>`,
  },
  RADIANS: {
    name: _l('度数转弧度函数'),
    type: 'math',
    title: _l('将角度的度数转换为弧度'),
    des: `
      <bb>${_l(`RADIANS(度)`)}</bb></br>
      <b>${_l(`示例：=RADIANS(90) 将返回 1.5707963267949（90 度约为 1.5708 弧度）。`)}</b></br>`,
  },

  DEGREES: {
    name: _l('弧度转度数函数'),
    type: 'math',
    title: _l('将角度的弧度转换为度数'),
    des: `
      <bb>${_l(`DEGREES(弧度)`)}</bb></br>
      <b>${_l(`示例：=DEGREES(PI()) 将返回 180（π 弧度 = 180 度）。`)}</b></br>`,
  },

  SIN: {
    name: _l('正弦函数'),
    type: 'math',
    title: _l('返回以弧度表示的角度的正弦值'),
    des: `
      <bb>${_l(`SIN(弧度)`)}</bb></br>
      <b>${_l(`示例：=SIN(1) 将返回 0.841470984807897，即 1 弧度（约为 57.3 度）的正弦值。`)}</b></br>`,
  },

  COS: {
    name: _l('余弦函数'),
    type: 'math',
    title: _l('返回以弧度表示的角度的余弦值'),
    des: `
      <bb>${_l(`COS(弧度)`)}</bb></br>
      <b>${_l(`示例：=COS(1) 将返回 0.54030230586814，即弧度为 1（约为 57.3 度）的余弦值。`)}</b></br>`,
  },

  TAN: {
    name: _l('正切函数'),
    type: 'math',
    title: _l('返回以弧度表示的角度的正切值'),
    des: `
      <bb>${_l(`TAN(弧度)`)}</bb></br>
      <b>${_l(`示例：=TAN(1) 将返回 1.5574077246549，即 1 弧度（约为 57.3 度）的正切值。`)}</b></br>`,
  },

  COT: {
    name: _l('余切函数'),
    type: 'math',
    title: _l('返回以弧度表示的角度的余切值'),
    des: `
      <bb>${_l(`COT(弧度)`)}</bb></br>
      <b>${_l(`示例：=COT(RADIANS(45)) 将返回 1，即 45 度角的余切值。`)}</b></br>`,
  },

  ASIN: {
    name: _l('反正弦函数'),
    type: 'math',
    title: _l('返回数值的反正弦值'),
    des: `
      <bb>${_l(`ASIN(数值)`)}</bb></br>
      <b>${_l(
        `示例：=ASIN(0.84114709848079) 返回近似值 0.999400825621613，即正弦值为 0.8411470984807897 的角度的弧度（约为 57.3 度）。`,
      )}</b></br>`,
  },

  ACOS: {
    name: _l('反余弦函数'),
    type: 'math',
    title: _l('返回数值的反余弦值'),
    des: `
      <bb>${_l(`ACOS(数值)`)}</bb></br>
      <b>${_l(`示例：=ACOS(0.54030230586814) 将返回 1。`)}</b></br>`,
  },

  ATAN: {
    name: _l('反正切函数'),
    type: 'math',
    title: _l('返回数值的反正切值'),
    des: `
      <bb>${_l(`ATAN(数值)`)}</bb></br>
      <b>${_l(`示例：=ATAN(1) 将返回弧度为 0.785398163397448 的角度（45 度），其正切值为 1。`)}</b></br>`,
  },

  ACOT: {
    name: _l('反余切函数'),
    type: 'math',
    title: _l('返回数值的反余切值'),
    des: `
      <bb>${_l(`ACOT(数值)`)}</bb></br>
      <b>${_l(`示例：=ACOT(1) 将返回弧度为 0.785398163397448 的角度（45 度），其正切值为 1。`)}</b></br>`,
  },
  // string 文本函数
  REPLACE: {
    name: _l('替换指定位置的文本'),
    type: 'string',
    title: _l('使用指定字符替换指定位置上的内容'),
    des: `<bb>${_l(`REPLACE(原文本,开始位置,字符数,替换文本)`)}</bb></br>
        <li>${_l(`开始位置：1代表从第一个字符开始，且第一个字符也要被替换`)}</li>
        <li>${_l(`字符数：需要替换的字符数，字母、汉字、数字、空格都记为1个字符`)}</li>
        <b>${_l(`示例：=REPLACE(+8613534257715,1,3,'') ，结果：13534257715`)}</b><br />
        ${_l(`将带 +86 头的手机号码缩短为纯11位的数字（即将'+86'三个字符替换为空即可）`)}`,
  },
  REPT: {
    name: _l('生成重复字符'),
    type: 'string',
    title: _l('按照指定的次数重复显示文本'),
    des: `<b>${_l(`示例：=REPT('*',5) ，结果：*****`)}</b><br />
        ${_l(`重复生成5个星号`)}`,
  },
  MID: {
    name: _l('从中间提取'),
    type: 'string',
    title: _l('返回文本中从指定位置开始指定个数的字符'),
    des: `
      <bb>${_l(`MID(原文本,开始位置,字符数)`)}</bb><br />
      <li>${_l(`开始位置：1代表从第一个字符开始，且第一个字符也要被提取`)}</li>
      <li>${_l(`字符数：需要提取的字符数，字母、汉字、数字、空格都记为1个字符`)}</li>
      <b>${_l(`示例：=MID($编号字段$,5,4) ，结果：2021`)}</b><br />
      ${_l(`从规律为aaaa2021MMDDbbbb的编号中提取出年份`)}`,
  },
  RIGHT: {
    name: _l('从右提取'),
    type: 'string',
    title: _l('从文本最右侧起提取指定个数的字符'),
    des: `
        <bb>${_l(`RIGHT(原文本,[字符数])`)}</bb></br>
        <li>${_l(`字符数：需要提取的字符数，字母、汉字、数字、空格都记为1个字符`)}</li>
        <b>${_l(`示例：=RIGHT($编号字段$,4) ，结果：'bbbb'`)}</b><br />
        ${_l(`从规律为aaaa2021MMDDbbbb的编号中提取出bbbb`)}`,
  },
  LEFT: {
    name: _l('从左提取'),
    type: 'string',
    title: _l('从文本最左侧起提取指定个数的字符'),
    des: `
        <bb>${_l(`LEFT(原文本,[字符数])`)}</bb><br />
        <li>${_l(`字符数：需要提取的字符数，字母、汉字、数字、空格都记为1个字符`)}</li>
        <b>${_l(`示例：=LEFT($编号字段$,4) ，结果：'aaaa'`)}</b><br />
        ${_l(`从规律为aaaa2021MMDDbbbb的编号中提取出aaaa`)}`,
  },
  UPPER: {
    name: _l('转大写'),
    type: 'string',
    title: _l('将文本中的小写字母转换为大写字母'),
    des: `
        <bb>${_l(`UPPER(文本)`)}</bb><br />
        <b>${_l(`示例：=UPPER(' hello world! ') ，结果：' HELLO WORLD! '`)}</b><br />
        ${_l(`将' hello world! '转换成大写`)}`,
  },
  LOWER: {
    name: _l('转小写'),
    type: 'string',
    title: _l('将文本中的大写字母转换为小写字母'),
    des: `
      <bb>${_l(`LOWER(文本)`)}</bb></br>
      <b>${_l(`示例：=LOWER(' HELLO WORLD! ') ，结果：' hello world! '`)}</b><br />
      ${_l(`将' HELLO WORLD! '转换成小写`)}`,
  },
  CONCAT: {
    name: _l('合并文本'),
    type: 'string',
    title: _l('将两个或多个文本合并为一个整体'),
    des: `
        <bb>${_l(`CONCAT(文本1,文本2...)`)}</bb><br />
        <b>${_l(`示例：=CONCAT('aaaa','2021MMDD','bbbb') ，结果：aaaa2021MMDDbbbb`)}</b><br />
        ${_l(`合并aaaa、2021MMDD、bbbb三段文本`)}`,
  },
  STRING: {
    name: _l('强制转为文本'),
    type: 'string',
    title: _l('将数值等类型的值转为文本'),
    des: `
        <bb>${_l(`STRING(数值)`)}</bb><br />
        <b>${_l(`示例：=STRING(-1)+STRING(5)，结果：'-15'`)}</b><br />
        ${_l(`将-1、5两个数值拼接在一起`)}`,
  },
  TRIM: {
    name: _l('删除空格'),
    type: 'string',
    title: _l('删除文本首尾的空格'),
    des: `
        <bb>${_l(`TRIM(文本)`)}</bb><br />
        <b>${_l(`示例：=TRIM(' 南京 ')，结果：'南京'`)}</b><br />
        ${_l(`删除首尾空格`)}`,
  },
  CLEAN: {
    name: _l('删除文本中所有空格'),
    type: 'string',
    title: _l('删除文本中所有空格'),
    des: `
        <bb>${_l(`CLEAN(文本)`)}</bb><br />
        <b>${_l(`示例：=CLEAN('135 3425 7715')，结果："13534257715"`)}</b><br />
        ${_l(`删除手机号码字段中间的空格`)}`,
  },
  SUBSTITUTE: {
    name: _l('替换文本中的字符'),
    type: 'string',
    title: _l('在文本字符串中用新字符串替换原有字符串'),
    des: `
        <bb>${_l('SUBSTITUTE(原字符串主体, 被替换字符串, 新字符串, 替换位置)')}</bb><br />
        <ul>
            <li>${_l(`被替换字符串：原字符串主体中需要被替换的字符串`)}</li>
            <li>${_l(`新字符串：用作替换的字符串`)}</li>
            <li>${_l(`替换位置：指定要将第几个旧字符串替换为新字符串`)}</li>
        </ul>
        <b>${_l(`示例：=SUBSTITUTE("a b c d e f", "b", "B") 返回"a B c d e f"`)}</b><br />
        <b>${_l(`示例：=SUBSTITUTE("a a b b b c", "a", "A", 2) 返回"a A b b b c"`)}</b><br />
        <b>${_l(`示例：=SUBSTITUTE("a a b b b c", "b", "B") 返回"a a B B B c"`)}</b><br />
        <b>${_l(`示例：=SUBSTITUTE("aaabbccc", "bc", "BC", 2) 返回"aaabbccc"`)}</b><br />
    `,
  },
  // flow 逻辑函数
  IF: {
    name: _l('条件语句'),
    type: 'flow',
    title: _l('设置判断条件，然后根据判断结果TRUE或FALSE来返回不同的文本'),
    des: `
        <bb>${_l(`IF(表达式,成立时输出,不成立时输出)`)}</bb><br />
        <li>${_l(`无论表达式成立或不成立时，输出结果固定为文本类型`)}</li>
        <b>${_l(`示例：=IF($分数$>=60,'及格','不及格')，结果：'及格'`)}</b><br />
        ${_l(`如果分数大于等于60分，则记为及格，否则记为不及格`)}`,
  },
  OR: {
    name: _l('求或'),
    type: 'flow',
    title: _l(
      '判断多个条件中是否有任意一个条件成立，只要有一个参数为逻辑值TRUE，OR函数就返回TRUE。如果所有参数都为逻辑值FALSE，OR函数才返回FALSE',
    ),
    des: `
        <bb>${_l(`OR(表达式1,表达式2,...)`)}</bb><br />
        <b>${_l(`示例：=OR($语文分数$<=60,$英语分数$<=60,$数学分数$<=60) ，结果：TRUE`)}</b><br />
        ${_l(`验证语数英三门课程是否有任何一门没有及格（实际只有两门及格）`)}`,
  },
  AND: {
    name: _l('求同'),
    type: 'flow',
    title: _l(
      '判断多个条件是否同时成立，如果所有参数都为逻辑值TRUE，AND函数将返回TRUE，只要其中一个参数为逻辑值FALSE，AND函数就返回FALSE',
    ),
    des: `
        <bb>${_l(`AND(表达式1,表达式2,...)`)}</bb><br />
        <b>${_l(`示例：=AND($语文分数$>=60,$英语分数$>=60,$数学分数$>=60) ，结果：FALSE`)}</b><br />
        ${_l(`验证语数英三门课程是否都及格（实际只有两门及格）`)}`,
  },
  NOT: {
    name: _l('求反'),
    type: 'flow',
    title: _l('对逻辑值求反。如果逻辑值为FALSE，NOT函数将返回TRUE；如果逻辑值为TRUE，NOT函数将返回FALSE'),
    des: `
        <bb>${_l(`NOT(表达式)`)}</bb><br />
        <b>${_l(`示例：=NOT($分数$==60) ，结果：TRUE`)}</b><br />
        ${_l(`对成绩是否刚好等于60分求反（实则刚好60分）`)}`,
  },
  FALSE: {
    name: _l('返回 false'),
    type: 'flow',
    title: _l('直接返回逻辑值FALSE'),
    des: `<bb>FALSE()</bb></br><b>${_l(`示例：=FALSE() ，结果：FALSE`)}</b>`,
  },
  TRUE: {
    name: _l('返回true'),
    type: 'flow',
    title: _l('直接返回逻辑值TRUE'),
    des: `<bb>TRUE()</bb></br><b>${_l(`示例：=TRUE() ，结果：TRUE`)}</b>`,
  },
  ISBLANK: {
    name: _l('判断为空'),
    type: 'flow',
    title: _l('判断单元格是否为空，如果为空，返回TRUE，否则返回FALSE'),
    des: `
        <bb>${_l(`ISBLANK(文本)`)}</bb><br />
        <b>${_l(`示例：=ISBLANK($年龄$)，结果：TRUE`)}</b><br />
        ${_l(`判断年龄字段是否为空`)}`,
  },
  IFS: {
    name: _l('条件判断函数'),
    type: 'flow',
    title: _l('根据多个条件返回相应的值'),
    des: `
        <bb>${_l('IFS(条件1, 值1, 条件2, 值2, ...)')}</bb><br />
        <ul>
            <li>${_l(`条件：一个或多个逻辑条件`)}</li>
            <li>${_l(`值：对应于每个条件的返回值`)}</li>
        </ul>
        <b>${_l(`示例：=IFS(A1 > 10, "大于10", A1 < 5, "小于5", true, "介于5和10之间")`)}</b><br />`,
  },
  // 高级函数
  ENCODEURI: {
    name: _l('URI 编码'),
    type: 'advanced',
    title: _l('将文本转换为URI编码，可以对包含中文字符的网址进行编码'),
    des: `
        ${_l('不转义')} , / ? : @ & = + $ # <br />
        <bb>${_l(`ENCODEURL(文本)`)}</bb><br />
        <b>${_l(`示例：=ENCODEURI('name=系统')，结果：'name=%E7%B3%BB%E7%BB%9F'`)}</b><br />
        ${_l(`对文本"name=系统"进行编码`)}`,
  },
  DECODEURI: {
    name: _l('URI 解码'),
    type: 'advanced',
    title: _l('将URI编码转换为文本，可以对包含中文字符的网址进行解码'),
    des: `
        <bb>${_l(`DECODEURI(文本)`)}</bb><br />
        <b>${_l(`示例：=DECODEURI('name=%E7%B3%BB%E7%BB%9F')，结果："name=系统"`)}</b><br />
        ${_l(`对文本"name=%E7%B3%BB%E7%BB%9F"进行解码`)}`,
  },
  ENCODEURICOMPONENT: {
    name: _l('URI 组件编码'),
    type: 'advanced',
    title: _l('将文本转换为URI编码，可以对包含中文字符的网址进行编码'),
    des: `
        转义 , / ? : @ & = + $ # <br />
        <bb>${_l(`ENCODEURL(文本)`)}</bb><br />
        <b>${_l(`示例：=ENCODEURI('name=系统')，结果：'name%3D%E7%B3%BB%E7%BB%9F'`)}</b><br />
        ${_l(`对文本"name=系统"进行编码`)}`,
  },
  DECODEURICOMPONENT: {
    name: _l('URI 组件解码'),
    type: 'advanced',
    title: _l('将URI编码转换为文本，可以对包含中文字符的网址进行解码'),
    des: `
        <bb>${_l(`DECODEURI(文本)`)}</bb><br />
        <b>${_l(`示例：=DECODEURI('name%3D%E7%B3%BB%E7%BB%9F')，结果："name=系统"`)}</b><br />
        ${_l(`对文本"name%3D%E7%B3%BB%E7%BB%9F"进行解码`)}`,
  },
  DISTANCE: {
    name: _l('计算两地间的距离'),
    type: 'advanced',
    title: _l('计算两地间的距离，结果单位为千米'),
    des: `
        <bb>${_l(`DISTANCE(定位字段1,定位字段2)`)}</bb><br />
        <li>${_l(`定位字段：如果需要设为静态值，格式为"经度,维度"`)}</li>
        <b>${_l(`示例：=DISTANCE("121.4224,31.1785",目的地定位)，结果：2.1358(km)`)}</b><br />
        ${_l(`计算上海市第六人民医院到漕河泾智汇园的距离`)}`,
  },
  FIND: {
    name: _l('查找单个文本'),
    type: 'string',
    title: _l('返回指定间隔符之间的文本内容（只返回从左到右查找到的第一个）'),
    des: `
        <bb>${_l(`FIND(原文本, 开始字符, 结束字符)`)}</bb><br />
        <li>${_l(`开始字符：如果是空，表示从第一个字符开始返回`)}</li>
        <li>${_l(`结束字符：如果是空，表示返回直至最后一个字符`)}</li>
        <b>${_l(`示例：=FIND("1天23小时15分钟","",天)，结果：1`)}</b><br />
        ${_l(`获取日期时间计算结果的"天"`)}`,
  },
  FINDA: {
    name: _l('查找多个文本'),
    type: 'string',
    title: _l('返回指定间隔符之间的文本内容，从左到右查找所有内容，并将结果打包成数组返回'),
    des: `
        <bb>${_l(`FIND(原文本, 开始字符, 结束字符)`)}</bb><br />
        <li>${_l(`开始字符：如果是空，将无法得到结果`)}</li>
        <li>${_l(`结束字符：如果是空，将无法得到结果`)}</li>
        <b>${_l(`示例：=FINDA("(X2022)2f8f0af(NZP001)","(",")")，结果：X2022,NZP001`)}</b><br />
        ${_l(`获取条码中两组括号间的内容，并写入另一个文本字段中`)}`,
  },
  SPLIT: {
    name: _l('分割文本'),
    type: 'string',
    title: _l('按照指定的间隔符分割文本，将分割结果打包成数组返回'),
    des: `
        <bb>${_l(`SPLIT(原文本,间隔符)`)}</bb><br />
        <li>${_l(`间隔符：如果为空，将分割每一个字符`)}</li>
        <b>${_l(`示例：=SPLIT("HX045-SZ190-NZ021-LS097","-")，结果：'HX045,SZ190,NZ021,LS097'`)}</b><br />
        ${_l(`以"-"分割1组带4个物料ID的文本，并写入另一个文本字段中`)}`,
  },
  JOIN: {
    name: _l('合并文本'),
    type: 'string',
    title: _l('按照指定的间隔符把数组元素拼接成文本'),
    des: `
        <bb>${_l(`JOIN(数组,间隔符)`)}</bb><br />
        <b>${_l(`示例：=JOIN(部门字段,"-")，结果："产品部-销售部-研发部"`)}</b><br />
        ${_l(`把部门字段里的多个部门拼接成一个字符串整体`)}`,
  },
  INCLUDE: {
    name: _l('是否包含'),
    type: 'flow',
    title: _l('判断一个文本中是否包含指定的字符内容'),
    des: `
        <bb>${_l(`INCLUDE(原文本,检索的字符)`)}</bb><br />
        <b>${_l(`示例：=INCLUDE("上海市闵行区钦州北路",'闵行')，结果：TRUE`)}</b><br />
        ${_l(`判断文本里是否包含"闵行"`)}`,
  },
  GETPOSITION: {
    name: _l('返回定位相关信息'),
    type: 'advanced',
    title: _l('从某个定位字段返回位置标题、详细地址或经纬度'),
    des: `
        <bb>${_l(`GETPOSITION(定位字段,需要的信息)`)}</bb><br />
        <li>${_l(`需要的信息：'title'-位置标题；'address'-详细地址；'x'-经度；'y'-纬度；'x,y'-经纬度`)}</li>
        <b>${_l(
          `示例：=GETPOSITION(打卡地点,'address')，结果：'上海市徐汇区漕河泾新兴技术开发区上海漕河泾开发区智汇园'`,
        )}</b><br />
        ${_l(`返回打卡地点的详细地址`)}`,
  },
  COUNTCHAR: {
    name: _l('计字符数'),
    type: 'math',
    title: _l('计算文本字段的字符数量'),
    des: `
        <bb>${_l(`COUNTCHAR(文本)`)}</bb><br />
        <b>${_l(`示例：=COUNTCHAR(标题)，结果：12`)}</b><br />
        ${_l(`计算标题"通过函数计算赋字段默认值"的字数`)}`,
  },
  WORKDAY: {
    name: _l('工作日计算函数'),
    type: 'date',
    title: _l('返回在某日期之前或之后、与该日期相隔指定工作日的某一日期的日期值'),
    des: `<bb>${_l(`WORKDAY(开始日期,天数,[假期列表])`)}</bb></br>
        <li>${_l(`开始日期：一个有效的日期格式`)}</li>
        <li>${_l(`天数：一个正数表示向后推算天数，一个负数表示向前推算天数`)}</li>
        <li>${_l(`假期列表：一个可选的日期列表，表示哪些天是假期`)}</li>
        <b>${_l(`示例：=WORKDAY('2025-02-19',10,['2025-02-23','2025-02-28'])，结果：2025-03-06`)}</b></br>
        ${_l(`计算从2025年2月19日开始，经过10个工作日后的日期，排除周末和指定的两个假期日期`)}`,
  },
  WORKDAY_INTL: {
    name: _l('自定义工作日计算'),
    type: 'date',
    title: _l('计算从某个日期开始，经过指定的工作日天数后的日期，支持自定义周末和可选的假期列表'),
    des: `<bb>${_l(`WORKDAY_INTL(开始日期,天数,[周末设置],[节假日期列表])`)}</bb></br>
        <li>${_l(`开始日期：一个有效的日期格式`)}</li>
        <li>${_l(`天数：一个正数表示向后推算天数，一个负数表示向前推算天数`)}</li>
        <li>${_l(
          `[周末设置]：指定周末的设置。可以是数字（1 到 17），表示一周中的哪些天是周末。默认值为 1，即周末为周六和周日`,
        )}</li>
        <li>${_l(`[节假日期列表]：一个包含假期日期的数组。这些日期会被排除在工作日之外`)}</li>
        <b>${_l(`示例：=WORKDAY_INTL('2025-02-19',10,1,['2025-02-23','2025-02-28']) ，结果：2025-03-06`)}</b></br>
        ${_l(`计算从2025年2月19日开始，经过10个工作日后的日期，排除周末和指定的两个假期日期`)}`,
  },

  WEEKNUM: {
    name: _l('周数计算函数'),
    type: 'date',
    title: _l('返回指定日期所在的年份中的第几周'),
    des: `<bb>${_l(`WEEKNUM(日期,[返回类型])`)}</bb></br>
        <li>${_l(`日期：日期格式的值`)}</li>
        <li>${_l(`[返回类型]：指定周数的计算方式。默认值为 1，表示一周从周日开始，周日为一周的第一天`)}</li>
        <b>${_l(`示例：=WEEKNUM('2025-02-19',2) ，结果：8`)}</b></br>
        ${_l(`返回2025年2月19日是该年的第8周（从周一计算）`)}`,
  },

  STRREVERSE: {
    name: _l('字符串反转函数'),
    type: 'string',
    title: _l('反转指定字符串的字符顺序'),
    des: `<bb>${_l(`STRREVERSE(文本)`)}</bb></br>
        <b>${_l(`示例：=STRREVERSE('Hello World') ，结果：dlroW olleH`)}</b></br>
        ${_l(`将文本"Hello World"的字符顺序反转`)}`,
  },

  NORM_S_DIST: {
    name: _l('标准正态分布累积函数'),
    type: 'math',
    title: _l('返回标准正态分布（即，其平均值为零，标准偏差为1）'),
    des: `<bb>${_l(`NORM_S_DIST(z,[累积])`)}</bb></br>
        <li>${_l(`z：表示需要计算其分布的数值`)}</li>
        <li>${_l(
          `累积：逻辑值，决定函数返回的形式。如果为true，返回累积分布函数；如果为false，返回概率密度函数。默认为true`,
        )}</li>
        <b>${_l(`示例：=NORM_S_DIST(1.96, true) ，结果：0.975`)}</b></br>
        ${_l(`计算标准正态分布中，Z值小于等于1.96的累积概率为97.5%`)}`,
  },

  PERMUT: {
    name: _l('排列组合函数'),
    type: 'math',
    title: _l('计算从一组对象中选择特定数量对象时的排列数'),
    des: `<bb>${_l(`PERMUT(总对象数,选择对象数)`)}</bb></br>
        <li>${_l(`总对象数：表示总对象数，必须是非负整数`)}</li>
        <li>${_l(`选择对象数：表示每次排列中选择的对象数，也必须是非负整数`)}</li>
        <b>${_l(`示例：=PERMUT(5,3) ，结果：60`)}</b></br>
        ${_l(`计算从5本书中选择3本进行排列时，有60种不同的排列方式`)}`,
  },

  COMBIN: {
    name: _l('组合数计算函数'),
    type: 'math',
    title: _l('计算从一组对象中选择特定数量对象时的组合数'),
    des: `<bb>${_l(`COMBIN(总对象数,选择对象数)`)}</bb></br>
        <li>${_l(`总对象数：表示总对象数，必须是非负整数`)}</li>
        <li>${_l(`选择对象数：表示每次组合中选择的对象数，也必须是非负整数`)}</li>
        <b>${_l(`示例：=COMBIN(5,3) ，结果：10`)}</b></br>
        ${_l(`计算从5本书中选择3本进行组合时，有10种不同的组合方式`)}`,
  },
};

export const functionDetails = _.pick(
  functionDetailsMap,
  _.uniqBy(
    [
      // 对方法进行排序
      /** 数学 */
      'SUM',
      'AVERAGE',
      'MIN',
      'MAX',
      'PRODUCT',
      'COUNTA',
      'ABS',
      'INT',
      'MOD',
      'ROUND',
      'ROUNDUP',
      'ROUNDDOWN',
      'CEILING',
      'FLOOR',
      'POWER',
      'LOG',
      'COUNTIF',
      'SUMIF',
      'COUNTBLANK',
      'COUNTARRAY',
      'SCORE',
      'COUNTCHAR',
      'RANDBETWEEN',
      'NUMBER',
      /** 文本 */
      'CONCAT',
      'REPLACE',
      'MID',
      'LEFT',
      'RIGHT',
      'TRIM',
      'CLEAN',
      'CLEAN',
      'REPT',
      'LOWER',
      'UPPER',
      'FIND',
      'FINDA',
      'SPLIT',
      'JOIN',
      'STRING',
      /** 逻辑 */
      'IF',
      'OR',
      'AND',
      'NOT',
      'ISBLANK',
      'INCLUDE',
      'FALSE',
      'TRUE',
      /** 高级 */
      'ENCODEURI',
      'ENCODEURICOMPONENT',
      'DECODEURI',
      'DECODEURICOMPONENT',
      'DISTANCE',
      'GETPOSITION',
    ].concat(Object.keys(functionDetailsMap)),
  ),
);
