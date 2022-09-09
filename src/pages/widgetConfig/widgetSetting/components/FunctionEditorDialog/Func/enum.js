import dayjs from 'dayjs';
var isBetween = require('dayjs/plugin/isBetween');
var customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);
dayjs.extend(isBetween);
import _ from 'lodash';
import { calcDate } from 'worksheet/util-purejs';
import { WIDGETS_TO_API_TYPE_ENUM } from 'pages/widgetConfig/config/widget';

function newDate(dateStr) {
  return new Date(dayjs(dateStr).valueOf());
}

function isDateStr(str) {
  return newDate(str).toString() !== 'Invalid Date';
}
function checkIsTime(str) {
  return /^\w\w:\w\w:\w\w$/.test(str);
}

function completeTime(str) {
  return checkIsTime(str) ? dayjs(str, 'HH:mm:ss').format() : str;
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
    // TODO 处理工作日逻辑
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
    expression = expression.replace(/\+\(undefined\)/g, '');
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
    if (type === 1) {
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
        y: _l('年'),
        M: _l('月'),
        d: _l('天'),
        h: _l('小时'),
        m: _l('分钟'),
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
    return values.length;
  },
  // 条件求和
  // SUMIF: function () {
  //   // TODO 待定
  // },
  // // 条件计数
  // COUNTIF: function () {
  //   // TODO 待定
  // },
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
    return _.ceil(number, precision);
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
    return _.round(number, precision);
  },
  // 求余
  MOD: function (number, divisor) {
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
    return _.sum(args) / args.length;
  },
  // 求和
  SUM: function (...args) {
    args = args.filter(a => !_.isUndefined(a));
    if (!args.length) {
      throw new Error(_l('没有参数'));
    }
    return _.sum(args);
  },
  // 转为数值
  NUMBER: function (value) {
    return Number(value);
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
    des: _l(`<bb>NETWORKDAY(开始日期,结束日期,[节假日期1,节假日期2,...])</bb></br>
        <li>[节假日期组]：使用字段值或固定值指明哪些天是节假日；如果不指定这个参数，系统只会自动排除掉周六及周日</li>
        <b>示例：=NETWORKDAY('2021-3-8','2021-3-14',['2021-3-8']) ，结果：4天</b></br>
        计算 2021-3-8 至 2021-3-14 期间的工作日，排除三八妇女节
        `),
  },
  MINUTE: {
    name: _l('返回分钟数'),
    type: 'date',
    title: _l('返回时间中的分钟数，返回值范围在 0 - 59 之间'),
    des: _l(`<bb>MINUTE(日期时间/时间)</bb><br/>
        <b>示例：=MINUTE('2021-5-1 11:59') ，结果：59</b><br/>
        返回 2021-5-1 11:59 的分钟数
        `),
  },
  HOUR: {
    name: _l('返回小时数'),
    type: 'date',
    title: _l('返回时间中的小时数，返回值范围在 0 - 23 之间'),
    des: _l(`<bb>HOUR(日期时间/时间)</bb><br/>
        <b>示例：=HOUR('2021-5-1 11:59') ，结果：11</b><br/>
        返回 2021-5-1 11:59 的小时数`),
  },
  WEEKDAY: {
    name: _l('返回星期数'),
    type: 'date',
    title: _l('返回日期的星期数，返回值范围在 1 - 7 之间'),
    des: _l(`<bb>WEEKDAY(日期时间)</bb><br/>
        <b>示例：=WEEKDAY('2021-5-1') ，结果：6</b><br/>
        返回 2021-5-1 的星期数`),
  },
  DAY: {
    name: _l('返回天数'),
    type: 'date',
    title: _l('返回日期的天数，返回值范围在 1 - 31 之间'),
    des: _l(`<bb>DAY(日期时间)</bb><br/>
        <b>示例：=DAY('2021-5-1') ，结果：1</b><br/>
        返回 2021-5-1 的天数`),
  },
  MONTH: {
    name: _l('返回月份'),
    type: 'date',
    title: _l('返回日期的月份，返回值范围在 1 - 12 之间'),
    des: _l(`<bb>MONTH(日期时间)</bb><br/>
        <b>示例：=MONTH('2021-5-1') ，结果：5</b><br/>
        返回 2021-5-1 的月份
      `),
  },
  YEAR: {
    name: _l('返回年份'),
    type: 'date',
    title: _l('返回日期的四位年份'),
    des: _l(`<bb>YEAR(日期时间)</bb></br>
        <b>示例：=YEAR('2021-5-1') ，结果：2021</b><br/>
        返回 2021-5-1 的年份`),
  },
  DATEADD: {
    name: _l('为日期加减时间'),
    type: 'date',
    title: _l('对某个日期添加/减去一定时间段，再对计算结果设置格式，1代表日期，2代表日期时间'),
    des: _l(`<bb>DATEADD(初始日期,计算式,[输出格式])</bb></br>
        <li>计算式：'+'或'-'代表添加或减去；时间段的单位，'Y'代表年、'M'代表月、'd'代表天、'h'代表小时、'm'代表分钟；也可以添加或减去一个时间字段</li>
        <li>[输出格式]：1代表日期格式，2代表日期时间格式；如果不指定这个参数，则默认是类型1</li>
        <b>示例：=DATEADD('2008-11-11 12:23','+8h',2) ，结果：2008-11-11 20:23</b></br>
        求 2008-11-11 12:23 8小时后的时间点，结果保持日期时间格式`),
  },
  DATEIF: {
    name: _l('时长'),
    type: 'date',
    title: _l('计算两个日期/时间之间的时长，并精确到年、月、天、小时或分'),
    des: _l(`<bb>DATEIF(开始,结束,格式化方式,[输出单位])</bb></br>
        <li>格式化方式：1-开始日期00:00结束日期00:00，2-开始日期00:00结束日期24:00</li>
        <li>输出单位：'Y'-年；'M'-月；'d'-天；'h'-小时；'m'-分钟；如果不指定这个参数，则默认为'd'</li>
        <b>示例：=DATEIF('2021-3-8','2021-3-14',2,'d') ，结果：7天</b></br>
        计算 2021-3-8 至 2021-3-14 期间的时长，精确到天
        `),
  },
  DATENOW: {
    name: _l('返回当前时间'),
    type: 'date',
    title: _l('返回当前时间'),
    des: _l(`<bb>DATENOW()</bb></br>
      <b>示例：=DATENOW() ，结果：2008-11-11 12:23</b>`),
  },
  // math 数学函数
  COUNTARRAY: {
    name: _l('计对象数量'),
    type: 'math',
    title: _l('计算人员、部门、多选、子表或关联表的数量'),
    des: _l(`<bb>COUNTARRAY(数组类字段)</bb></br>
          <b>示例：=COUNTARRAY(工序) ，结果：7</b></br>
          计算名称为“工序”的子表数量（实际有7道工序）`),
  },
  RANDBETWEEN: {
    name: _l('返回随机数'),
    type: 'math',
    title: _l('随机输出指定两个数字之间的一个整数；在新建记录时生成后，值将不再改变'),
    des: _l(`<bb>RANDBETWEEN(最小值,最大值)</bb></br>
        <b>示例：=RANDBETWEEN(1,10) ，结果：7</b></br>
        随机输出1-10之间的一个数字
      `),
  },
  ROUNDDOWN: {
    name: _l('向下舍入'),
    type: 'math',
    title: _l('以绝对值减小的方向按指定位数舍入数字'),
    des: _l(`<bb>ROUNDDOWN(数值,位数)</bb></br>
      <b>示例：=ROUNDDOWN(3.14159265,4) ，结果：3.1415</b></br>
      保留 3.14159265 的四位小数`),
  },
  ROUNDUP: {
    name: _l('向上舍入'),
    type: 'math',
    title: _l('以绝对值增大的方向按指定位数舍入数字'),
    des: _l(`<bb>ROUNDUP(数值,位数)</bb></br>
        <b>示例：=ROUNDUP(3.14159265,4) ，结果：3.1416</b></br>
        保留 3.14159265 的四位小数`),
  },
  ROUND: {
    name: _l('四舍五入'),
    type: 'math',
    title: _l('按指定位数对数字进行四舍五入'),
    des: _l(`<bb>ROUND(数值,位数)</bb></br>
        <b>示例：=ROUND(3.14159265,4) ，结果：3.1416</b></br>
        保留 3.14159265 的四位小数`),
  },
  MOD: {
    name: _l('求余'),
    type: 'math',
    title: _l('返回两数相除的余数'),
    des: _l(`<bb>MOD(被除数,除数)</bb></br>
      <b>示例：=MOD(15,4) ，结果：3</b></br>
      计算 15 除以 4 的余数`),
  },
  INT: {
    name: _l('求整'),
    type: 'math',
    title: _l('返回永远小于等于原数字的最接近的整数'),
    des: _l(`<bb>INT(数值)</bb></br>
        <b>示例：=INT(-3.14159265) ，结果：-4</b></br>
        对 -3.14159265 进行求整`),
  },
  ABS: {
    name: _l('绝对值'),
    type: 'math',
    title: _l('计算数字的绝对值'),
    des: _l(`
        <bb>ABS(数值)</bb></br>
        <b>示例：=ABS(-7) ，结果：7</b></br>
        求 -7 的绝对值`),
  },
  COUNTA: {
    name: _l('计数'),
    type: 'math',
    title: _l('计算参数中包含非空值的个数'),
    des: _l(`
      <bb>COUNTA(数值1,数值2...)</bb></br>
      <b>示例：=COUNTA(1月,2月,3月) ，结果：2</b></br>
      计算第一季度指标的完成数量，该表有三个检查框对应1、2、3月指标是否完成，名称分别为1月、2月、3月，2月份未完成`),
  },
  COUNTBLANK: {
    name: _l('计空值数'),
    type: 'math',
    title: _l('计算参数中包含的空值个数'),
    des: _l(`
      <bb>COUNTBLANK(数值1,数值2...)</bb></br>
      <b>示例：=COUNTBLANK(1月,2月,3月) ，结果：1</b></br>
      计算第一季度指标的未完成数量，该表有三个检查框对应1、2、3月指标是否完成，名称分别为1月、2月、3月，2月份未完成`),
  },
  PRODUCT: {
    name: _l('乘积'),
    type: 'math',
    title: _l('返回两数相乘的积'),
    des: _l(`
      <bb>PRODUCT(数值1,数值2...)</bb></br>
      <b>示例：=PRODUCT(15,4) ，结果：60</b></br>
      计算 15 乘以 4 的积`),
  },
  MAX: {
    name: _l('最大值'),
    type: 'math',
    title: _l('返回一组数字中的最大值'),
    des: _l(`
        <bb>MAX(数值1,数值2...)</bb></br>
        <b>示例：=MAX(10,20,30) ，结果：30</b></br>
        返回10,20,30中最大的数字`),
  },
  MIN: {
    name: _l('最小值'),
    type: 'math',
    title: _l('返回一组数字中的最小值'),
    des: _l(`
      <bb>MIN(数值1,数值2...)</bb></br>
      <b>示例：=MIN(10,20,30) ，结果：10</b></br>
      返回10,20,30中最小的数字`),
  },
  AVERAGE: {
    name: _l('平均值'),
    type: 'math',
    title: _l('计算参数的平均值'),
    des: _l(`
    <bb>AVERAGE(数值1,数值2...)</bb></br>
    <b>示例：=AVERAGE(10,20,30) ，结果：20</b></br>
    计算10,20,30的平均值`),
  },
  SUM: {
    name: _l('求和'),
    type: 'math',
    title: _l('计算数字之和'),
    des: _l(`
    <bb>SUM(数值1,数值2...)</bb></br>
    <b>示例：=SUM(10,20,30) ，结果：60</b></br>
      计算10,20,30的和`),
  },
  NUMBER: {
    name: _l('强制转为数值'),
    type: 'math',
    title: _l('将文本等类型的值转为数值'),
    des: _l(`
    <bb>NUMBER(文本)</bb></br>
    <b>示例：=NUMBER(IF(TRUE(),'-1','0'))+5，结果：4</b></br>
    将 '-1' 和 5 相加（if输出的结果类型固定为文本）`),
  },
  POWER: {
    name: _l('计算数字的乘幂'),
    type: 'math',
    des: _l(`
    <bb>POWER(底数，指数)</bb></br>
    <b>示例：=POWER(2,3)，结果：8</b></br>
    计算2的3次方`),
  },
  LOG: {
    name: _l('计算以指定数字为底的对数'),
    type: 'math',
    des: _l(`
    <bb>LOG(真数,底数)</bb></br>
    <b>示例：=LOG(8,2)，结果：3</b></br>
    计算以2为底8的对数`),
  },
  // string 文本函数
  REPLACE: {
    name: _l('替换文本'),
    type: 'string',
    title: _l('使用指定字符替换指定位置上的内容'),
    des: _l(`<bb>REPLACE(原文本,开始位置,字符数,替换文本)</bb></br>
        <li>开始位置：1代表从第一个字符开始，且第一个字符也要被替换</li>
        <li>字符数：需要替换的字符数，字母、汉字、数字、空格都记为1个字符</li>
        <b>示例：=REPLACE(+8613534257715,1,3,'') ，结果：13534257715</b><br />
        将带 +86 头的手机号码缩短为纯11位的数字（即将'+86'三个字符替换为空即可）`),
  },
  REPT: {
    name: _l('生成重复字符'),
    type: 'string',
    title: _l('按照指定的次数重复显示文本'),
    des: _l(`<b>示例：=REPT('*',5) ，结果：*****</b><br />
    重复生成5个星号`),
  },
  MID: {
    name: _l('从中间提取'),
    type: 'string',
    title: _l('返回文本中从指定位置开始指定个数的字符'),
    des: _l(`
      <bb>MID(原文本,开始位置,字符数)</bb><br />
      <li>开始位置：1代表从第一个字符开始，且第一个字符也要被提取</li>
      <li>字符数：需要提取的字符数，字母、汉字、数字、空格都记为1个字符</li>
      <b>示例：=MID($编号字段$,5,4) ，结果：2021</b><br />
      从规律为aaaa2021MMDDbbbb的编号中提取出年份
      `),
  },
  RIGHT: {
    name: _l('从右提取'),
    type: 'string',
    title: _l('从文本最右侧起提取指定个数的字符'),
    des: _l(`
        <bb>RIGHT(原文本,[字符数])</bb></br>
        <li>字符数：需要提取的字符数，字母、汉字、数字、空格都记为1个字符</li>
        <b>示例：=RIGHT($编号字段$,4) ，结果：'bbbb'</b><br />
        从规律为aaaa2021MMDDbbbb的编号中提取出bbbb`),
  },
  LEFT: {
    name: _l('从左提取'),
    type: 'string',
    title: _l('从文本最左侧起提取指定个数的字符'),
    des: _l(`
        <bb>LEFT(原文本,[字符数])</bb><br />
        <li>字符数：需要提取的字符数，字母、汉字、数字、空格都记为1个字符</li>
        <b>示例：=LEFT($编号字段$,4) ，结果：'aaaa'</b><br />
        从规律为aaaa2021MMDDbbbb的编号中提取出aaaa`),
  },
  UPPER: {
    name: _l('转大写'),
    type: 'string',
    title: _l('将文本中的小写字母转换为大写字母'),
    des: _l(`
        <bb>UPPER(文本)</bb><br />
        <b>示例：=UPPER(' hello world! ') ，结果：' HELLO WORLD! '</b><br />
        将' hello world! '转换成大写
        `),
  },
  LOWER: {
    name: _l('转小写'),
    type: 'string',
    title: _l('将文本中的大写字母转换为小写字母'),
    des: _l(`
      <bb>LOWER(文本)</bb></br>
      <b>示例：=LOWER(' HELLO WORLD! ') ，结果：' hello world! '</b><br />
      将' HELLO WORLD! '转换成小写`),
  },
  CONCAT: {
    name: _l('合并文本'),
    type: 'string',
    title: _l('将两个或多个文本合并为一个整体'),
    des: _l(`
        <bb>CONCAT(文本1,文本2...)</bb><br />
        <b>示例：=CONCAT('aaaa','2021MMDD','bbbb') ，结果：aaaa2021MMDDbbbb</b><br />
        合并aaaa、2021MMDD、bbbb三段文本`),
  },
  STRING: {
    name: _l('强制转为文本'),
    type: 'string',
    title: _l('将数值等类型的值转为文本'),
    des: _l(`
        <bb>STRING(数值)</bb><br />
        <b>示例：=STRING(-1)+STRING(5)，结果：'-15'</b><br />
        将-1、5两个数值拼接在一起`),
  },
  TRIM: {
    name: _l('删除空格'),
    type: 'string',
    title: _l('删除文本首尾的空格'),
    des: _l(`
        <bb>TRIM(文本)</bb><br />
        <b>示例：=TRIM(' 南京 ')，结果：'南京'</b><br />
        删除首尾空格`),
  },
  CLEAN: {
    name: _l('删除文本中所有空格'),
    type: 'string',
    title: _l('删除文本中所有空格'),
    des: _l(`
        <bb>CLEAN(文本)</bb><br />
        <b>示例：=CLEAN('135 3425 7715')，结果："13534257715"</b><br />
        删除手机号码字段中间的空格`),
  },
  // flow 逻辑函数
  IF: {
    name: _l('条件语句'),
    type: 'flow',
    title: _l('设置判断条件，然后根据判断结果TRUE或FALSE来返回不同的文本'),
    des: _l(`
        <bb>IF(表达式,成立时输出,不成立时输出)</bb><br />
        <li>无论表达式成立或不成立时，输出结果固定为文本类型</li>
        <b>示例：=IF($分数$>=60,'及格','不及格')，结果：'及格'</b><br />
        如果分数大于等于60分，则记为及格，否则记为不及格`),
  },
  OR: {
    name: _l('求或'),
    type: 'flow',
    title: _l(
      '判断多个条件中是否有任意一个条件成立，只要有一个参数为逻辑值TRUE，OR函数就返回TRUE。如果所有参数都为逻辑值FALSE，OR函数才返回FALSE',
    ),
    des: _l(`
        <bb>OR(表达式1,表达式2,...)</bb><br />
        <b>示例：=OR($语文分数$<=60,$英语分数$<=60,$数学分数$<=60) ，结果：TRUE</b><br />
        验证语数英三门课程是否有任何一门没有及格（实际只有两门及格）`),
  },
  AND: {
    name: _l('求同'),
    type: 'flow',
    title: _l(
      '判断多个条件是否同时成立，如果所有参数都为逻辑值TRUE，AND函数将返回TRUE，只要其中一个参数为逻辑值FALSE，AND函数就返回FALSE',
    ),
    des: _l(`
        <bb>AND(表达式1,表达式2,...)</bb><br />
        <b>示例：=AND($语文分数$>=60,$英语分数$>=60,$数学分数$>=60) ，结果：FALSE</b><br />
        验证语数英三门课程是否都及格（实际只有两门及格）`),
  },
  NOT: {
    name: _l('求反'),
    type: 'flow',
    title: _l('对逻辑值求反。如果逻辑值为FALSE，NOT函数将返回TRUE；如果逻辑值为TRUE，NOT函数将返回FALSE'),
    des: _l(`
        <bb>NOT(表达式)</bb><br />
        <b>示例：=NOT($分数$==60) ，结果：TRUE</b><br />
        对成绩是否刚好等于60分求反（实则刚好60分）`),
  },
  FALSE: {
    name: _l('返回 false'),
    type: 'flow',
    title: _l('直接返回逻辑值FALSE'),
    des: _l(`<bb>FALSE()</bb></br><b>示例：=FALSE() ，结果：FALSE</b>`),
  },
  TRUE: {
    name: _l('返回true'),
    type: 'flow',
    title: _l('直接返回逻辑值TRUE'),
    des: _l(`<bb>TRUE()</bb></br><b>示例：=TRUE() ，结果：TRUE</b>`),
  },
  ISBLANK: {
    name: _l('判断为空'),
    type: 'flow',
    title: _l('判断单元格是否为空，如果为空，返回TRUE，否则返回FALSE'),
    des: _l(`
        <bb>ISBLANK(文本)</bb><br />
        <b>示例：=ISBLANK($年龄$)，结果：TRUE</b><br />
        判断年龄字段是否为空`),
  },
  // 高级函数
  ENCODEURI: {
    name: _l('URI 编码'),
    type: 'advanced',
    title: _l('将文本转换为URI编码，可以对包含中文字符的网址进行编码'),
    des: _l(`
        不转义 , / ? : @ & = + $ # <br />
        <bb>ENCODEURL(文本)</bb><br />
        <b>示例：=ENCODEURI('name=系统')，结果：'name=%E7%B3%BB%E7%BB%9F'</b><br />
        对文本“name=系统”进行编码`),
  },
  DECODEURI: {
    name: _l('URI 解码'),
    type: 'advanced',
    title: _l('将URI编码转换为文本，可以对包含中文字符的网址进行解码'),
    des: _l(`
        <bb>DECODEURI(文本)</bb><br />
        <b>示例：=DECODEURI('name=%E7%B3%BB%E7%BB%9F')，结果："name=系统"</b><br />
        对文本“name=%E7%B3%BB%E7%BB%9F”进行解码`),
  },
  ENCODEURICOMPONENT: {
    name: _l('URI 组件编码'),
    type: 'advanced',
    title: _l('将文本转换为URI编码，可以对包含中文字符的网址进行编码'),
    des: _l(`
        转义 , / ? : @ & = + $ # <br />
        <bb>ENCODEURL(文本)</bb><br />
        <b>示例：=ENCODEURI('name=系统')，结果：'name%3D%E7%B3%BB%E7%BB%9F'</b><br />
        对文本“name=系统”进行编码`),
  },
  DECODEURICOMPONENT: {
    name: _l('URI 组件解码'),
    type: 'advanced',
    title: _l('将URI编码转换为文本，可以对包含中文字符的网址进行解码'),
    des: _l(`
        <bb>DECODEURI(文本)</bb><br />
        <b>示例：=DECODEURI('name%3D%E7%B3%BB%E7%BB%9F')，结果："name=系统"</b><br />
        对文本“name%3D%E7%B3%BB%E7%BB%9F”进行解码`),
  },
  DISTANCE: {
    name: _l('计算两地间的距离'),
    type: 'advanced',
    title: _l('计算两地间的距离，结果单位为千米'),
    des: _l(`
        <bb>DISTANCE(定位字段1,定位字段2)</bb><br />
        <li>定位字段：如果需要设为静态值，格式为“经度,维度”</li>
        <b>示例：=DISTANCE("121.4224,31.1785",目的地定位)，结果：2.1358(km)</b><br />
        计算上海市第六人民医院到漕河泾智汇园的距离`),
  },
  FIND: {
    name: _l('查找单个文本'),
    type: 'string',
    title: _l('返回指定间隔符之间的文本内容（只返回从左到右查找到的第一个）'),
    des: _l(`
        <bb>FIND(原文本, 开始字符, 结束字符)</bb><br />
        <li>开始字符：如果是空，表示从第一个字符开始返回</li>
        <li>结束字符：如果是空，表示返回直至最后一个字符</li>
        <b>示例：=FIND(“1天23小时15分钟”,"","天")，结果：1</b><br />
        获取日期时间计算结果的“天”`),
  },
  FINDA: {
    name: _l('查找多个文本'),
    type: 'string',
    title: _l('返回指定间隔符之间的文本内容，从左到右查找所有内容，并将结果打包成数组返回'),
    des: _l(`
        <bb>FIND(原文本, 开始字符, 结束字符)</bb><br />
        <li>开始字符：如果是空，将无法得到结果</li>
        <li>结束字符：如果是空，将无法得到结果</li>
        <b>示例：=FINDA(“(X2022)2f8f0af(NZP001)”,"(",")")，结果：X2022,NZP001</b><br />
        获取条码中两组括号间的内容，并写入另一个文本字段中`),
  },
  SPLIT: {
    name: _l('分割文本'),
    type: 'string',
    title: _l('按照指定的间隔符分割文本，将分割结果打包成数组返回'),
    des: _l(`
        <bb>SPLIT(原文本,间隔符)</bb><br />
        <li>间隔符：如果为空，将分割每一个字符</li>
        <b>示例：=SPLIT("HX045-SZ190-NZ021-LS097","-")，结果：'HX045,SZ190,NZ021,LS097'</b><br />
        以“-”分割1组带4个物料ID的文本，并写入另一个文本字段中`),
  },
  JOIN: {
    name: _l('合并文本'),
    type: 'string',
    title: _l('按照指定的间隔符把数组元素拼接成文本'),
    des: _l(`
        <bb>JOIN(数组,间隔符)</bb><br />
        <b>示例：=JOIN(部门字段,"-")，结果："产品部-销售部-研发部"</b><br />
        把部门字段里的多个部门拼接成一个字符串整体`),
  },
  INCLUDE: {
    name: _l('是否包含'),
    type: 'flow',
    title: _l('判断一个文本中是否包含指定的字符内容'),
    des: _l(`
        <bb>INCLUDE(原文本,检索的字符)</bb><br />
        <b>示例：=INCLUDE("上海市闵行区钦州北路",'闵行')，结果：TRUE</b><br />
        判断文本里是否包含"闵行"`),
  },
  GETPOSITION: {
    name: _l('返回定位相关信息'),
    type: 'advanced',
    title: _l('从某个定位字段返回位置标题、详细地址或经纬度'),
    des: _l(`
        <bb>GETPOSITION(定位字段,需要的信息)</bb><br />
        <li>需要的信息：'title'-位置标题；'address'-详细地址；'x'-经度；'y'-纬度；'x,y'-经纬度</li>
        <b>示例：=GETPOSITION(打卡地点,'address')，结果：'上海市徐汇区漕河泾新兴技术开发区上海漕河泾开发区智汇园'</b><br />
        返回打卡地点的详细地址`),
  },
  COUNTCHAR: {
    name: _l('计字符数'),
    type: 'math',
    title: _l('计算文本字段的字符数量'),
    des: _l(`
        <bb>COUNTCHAR(文本)</bb><br />
        <b>示例：=COUNTCHAR(标题)，结果：12</b><br />
        计算标题“通过函数计算赋字段默认值”的字数`),
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
      'POWER',
      'LOG',
      'COUNTIF',
      'SUMIF',
      'COUNTBLANK',
      'COUNTARRAY',
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

// 支持参与函数计算的字段
export function checkTypeSupportForFunction(control) {
  if (
    [
      WIDGETS_TO_API_TYPE_ENUM.TEXT, // 文本 2
      WIDGETS_TO_API_TYPE_ENUM.NUMBER, // 数值 6
      WIDGETS_TO_API_TYPE_ENUM.MONEY, // 金额 8
      WIDGETS_TO_API_TYPE_ENUM.EMAIL, // 邮箱 5
      WIDGETS_TO_API_TYPE_ENUM.MOBILE_PHONE, // 手机 4
      WIDGETS_TO_API_TYPE_ENUM.DATE, // 日期 15
      WIDGETS_TO_API_TYPE_ENUM.DATE_TIME, // 日期 16
      WIDGETS_TO_API_TYPE_ENUM.TIME, // 时间 46
      WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU, // 单选 9
      WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT, // 多选 10
      WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN, // 下拉 11
      WIDGETS_TO_API_TYPE_ENUM.USER_PICKER, // 成员 26
      WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT, // 部门 27
      WIDGETS_TO_API_TYPE_ENUM.ORG_ROLE, // 组织角色 48
      WIDGETS_TO_API_TYPE_ENUM.AREA_PROVINCE, // 省 19
      WIDGETS_TO_API_TYPE_ENUM.AREA_CITY, // 省市 23
      WIDGETS_TO_API_TYPE_ENUM.AREA_COUNTY, // 24
      WIDGETS_TO_API_TYPE_ENUM.SWITCH, // 检查框 36
      WIDGETS_TO_API_TYPE_ENUM.SUB_LIST, // 子表 34
      WIDGETS_TO_API_TYPE_ENUM.LOCATION, // 定位 40
      WIDGETS_TO_API_TYPE_ENUM.CRED, // 证件 7
    ].indexOf(control.type) > -1
  ) {
    return true;
  } else if (control.type === WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET) {
    // 关联记录 29
    return String(_.get(control, 'advancedSetting.showtype')) !== '2';
  }
}
