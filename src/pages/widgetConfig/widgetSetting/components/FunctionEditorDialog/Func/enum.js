import moment from 'moment';
import { calcDate } from 'worksheet/util';
import { WIDGETS_TO_API_TYPE_ENUM } from 'pages/widgetConfig/config/widget';

function newDate(dateStr) {
  return new Date(moment(dateStr).valueOf());
}

function isDateStr(str) {
  return newDate(str).toString() !== 'Invalid Date';
}

export const functions = {
  // 两个日期间的工作日
  NETWORKDAY: function (start, end, excludeDate = [], workDays = [1, 2, 3, 4, 5]) {
    if (!isDateStr(start)) {
      throw new Error(_l('开始日期不是日期类型'));
    }
    if (!isDateStr(end)) {
      throw new Error(_l('结束日期不是日期类型'));
    }
    const endIsBeforeStart = moment(end).isBefore(moment(start));
    if (endIsBeforeStart) {
      [start, end] = [end, start];
    }
    let result = moment(end).diff(moment(start), 'day');
    if (excludeDate.length) {
      result =
        result -
        excludeDate.filter(
          d => moment(d).isBetween(start, end, 'day') || moment(d).isSame(start, 'day') || moment(d).isSame(end, 'day'),
        ).length;
    }
    // TODO 处理工作日逻辑
    const startWeekDay = moment(start).day();
    const endWeekDay = moment(end).day();
    if (result > 7) {
      const startWorkDayLength = [...new Array(7 - startWeekDay)]
        .map((d, i) => startWeekDay + i)
        .filter(d => _.includes(workDays, d)).length;
      const endWorkDayLength = [...new Array(endWeekDay)].map((d, i) => i).filter(d => _.includes(workDays, d)).length;
      result =
        _.intersection(
          [0, 1, 2, 3, 4, 5, 6].map((d, i) => i),
          workDays,
        ).length *
          Math.floor((result - (7 - startWeekDay) - endWeekDay) / 7) +
        startWorkDayLength +
        endWorkDayLength;
    } else {
      const days = [...new Array(result)].map((d, i) => Number((startWeekDay + i).toString(7).slice(-1)));
      result = days.filter(d => _.includes(workDays, d)).length;
    }
    return endIsBeforeStart ? -1 * result : result;
  },
  // 返回分钟数
  MINUTE: function (dateStr) {
    const minute = newDate(dateStr).getMinutes();
    return _.isNumber(minute) && !_.isNaN(minute) ? minute : undefined;
  },
  // 返回小时数
  HOUR: function (dateStr) {
    const hour = newDate(dateStr).getHours();
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
    const { result } = calcDate(date, expression);
    return result.format(format === 1 ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss');
  },
  // 两个日期间的时长
  DATEIF: function (begin, end, type = 1, unit = 'd') {
    if (!isDateStr(begin)) {
      throw new Error(_l('开始日期不是日期类型'));
    }
    if (!isDateStr(end)) {
      throw new Error(_l('结束日期不是日期类型'));
    }
    if (!/^[YMdhm]$/.test(unit)) {
      throw new Error(_l('单位不合法'));
    }
    if (type === 1) {
      if (/^\d{4}(-\d{2}){2}$/.test(begin)) {
        begin = moment(begin).startOf('day');
      }
      if (/^\d{4}(-\d{2}){2}$/.test(end)) {
        end = moment(end).startOf('day');
      }
    } else {
      if (/^\d{4}(-\d{2}){2}$/.test(begin)) {
        begin = moment(begin).startOf('day');
      }
      if (/^\d{4}(-\d{2}){2}$/.test(end)) {
        end = moment(end).add(1, 'day').startOf('day');
      }
    }
    const result = moment(end).diff(begin, unit);
    return (
      result +
      ({
        Y: _l('年'),
        M: _l('月'),
        d: _l('天'),
        h: _l('小时'),
        m: _l('分钟'),
      }[unit] || '')
    );
  },
  DATENOW: function () {
    return moment().format('YYYY-MM-DD HH:mm:ss');
  },
  // 计对象数量
  COUNTARRAY: function (values) {
    if (typeof values === 'string' && _.isNumber(+values) && !_.isNaN(+values)) {
      return values;
    }
    return values.length;
  },
  // 条件求和
  SUMIF: function () {
    // TODO 待定
  },
  // 条件计数
  COUNTIF: function () {
    // TODO 待定
  },
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
  // 乘积
  PRODUCT: function (...args) {
    return args
      .map(d => Number(d))
      .filter(d => _.isNumber(d) && !_.isNaN(d))
      .reduce((a, b) => a * b);
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
    while (args.length) {
      result += args.shift() || '';
    }
    return result;
  },
  // 强制转文本
  STRING: function (value) {
    return String(value || '');
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
};

export const functionTypes = {
  math: _l('数学函数'),
  date: _l('日期函数'),
  string: _l('文本函数'),
  flow: _l('逻辑函数'),
};

export const functionDetails = {
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
    des: _l(`<bb>MINUTE(日期时间)</bb><br/>
        <b>示例：=MINUTE('2021-5-1 11:59') ，结果：59</b><br/>
        返回 2021-5-1 11:59 的分钟数
        `),
  },
  HOUR: {
    name: _l('返回小时数'),
    type: 'date',
    title: _l('返回时间中的小时数，返回值范围在 0 - 23 之间'),
    des: _l(`<bb>HOUR(日期时间)</bb><br/>
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
    title: _l('对某个日期（时间）添加/减去一定时间段，再对计算结果设置格式，1代表日期，2代表日期时间'),
    des: _l(`<bb>DATEADD(初始日期,计算式,[输出格式])</bb></br>
        <li>计算式：'+'或'-'代表添加或减去；时间段的单位，'Y'代表年、'M'代表月、'd'代表天、'h'代表小时、'm'代表分钟</li>
        <li>[输出格式]：1代表日期格式，2代表日期时间格式；如果不指定这个参数，则默认是类型1</li>
        <b>示例：=DATEADD('2008-11-11 12:23','+8h',2) ，结果：2008-11-11 20:23</b></br>
        求 2008-11-11 12:23 8小时后的时间点，结果保持日期时间格式`),
  },
  DATEIF: {
    name: _l('两个日期间的时长'),
    type: 'date',
    title: _l('计算两个日期间的时长，并精确到年、月、天、小时或分'),
    des: _l(`<bb>DATEIF(开始日期,结束日期,格式化方式,[输出单位])</bb></br>
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
  // SUMIF: {
  //   name: _l('条件求和'),
  //   type: 'math',
  //   title: _l('待定'),
  //   des: _l(''),
  //   fn: () => {},
  // },
  // COUNTIF: { name: _l('条件计数'), type: 'math', title: _l('待定'), des: _l(''), fn: () => {} },
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
    fn: _.floor,
  },
  ROUNDUP: {
    name: _l('向上舍入'),
    type: 'math',
    title: _l('以绝对值增大的方向按指定位数舍入数字'),
    des: _l(`<bb>ROUNDUP(数值,位数)</bb></br>
        <b>示例：=ROUNDUP(3.14159265,4) ，结果：3.1416</b></br>
        保留 3.14159265 的四位小数`),
    fn: _.ceil,
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
    fn: _.round,
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
  PRODUCT: {
    name: _l('乘积'),
    type: 'math',
    title: _l('返回两数相乘的积'),
    des: _l(`
      <bb>PRODUCT(数值1,数值2...)</bb></br>
      <b>示例：=PRODUCT(15,4) ，结果：60</b></br>
      计算 15 乘以 4 的积`),
    fn: (...args) => {
      return args.reduce((a, b) => Number(a) * Number(b));
    },
  },
  MAX: {
    name: _l('最大值'),
    type: 'math',
    title: _l('返回一组数字中的最大值'),
    des: _l(`
        <bb>MAX(数值1,数值2...)</bb></br>
        <b>示例：=MAX(10,20,30) ，结果：30</b></br>
        返回10,20,30中最大的数字`),
    fn: (...args) => _.max(args),
  },
  MIN: {
    name: _l('最小值'),
    type: 'math',
    title: _l('返回一组数字中的最小值'),
    des: _l(`
      <bb>MIN(数值1,数值2...)</bb></br>
      <b>示例：=MIN(10,20,30) ，结果：10</b></br>
      返回10,20,30中最小的数字`),
    fn: (...args) => _.min(args),
  },
  AVERAGE: {
    name: _l('平均值'),
    type: 'math',
    title: _l('计算参数的平均值'),
    des: _l(`
    <bb>AVERAGE(数值1,数值2...)</bb></br>
    <b>示例：=AVERAGE(10,20,30) ，结果：20</b></br>
    计算10,20,30的平均值`),
    fn: (...args) => {
      return _.sum(args) / args.length;
    },
  },
  SUM: {
    name: _l('求和'),
    type: 'math',
    title: _l('计算数字之和'),
    des: _l(`
    <bb>SUM(数值1,数值2...)</bb></br>
    <b>示例：=SUM(10,20,30) ，结果：60</b></br>
      计算10,20,30的和`),
    fn: (...args) => _.sum(args),
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
    name: _l('返回false'),
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
};

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
      WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU, // 单选 9
      WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT, // 多选 10
      WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN, // 下拉 11
      WIDGETS_TO_API_TYPE_ENUM.USER_PICKER, // 成员 26
      WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT, // 部门 27
      WIDGETS_TO_API_TYPE_ENUM.AREA_PROVINCE, // 省 19
      WIDGETS_TO_API_TYPE_ENUM.AREA_CITY, // 省市 23
      WIDGETS_TO_API_TYPE_ENUM.AREA_COUNTY, // 24
      WIDGETS_TO_API_TYPE_ENUM.SWITCH, // 检查框 36
      WIDGETS_TO_API_TYPE_ENUM.SUB_LIST, // 子表 34
      WIDGETS_TO_API_TYPE_ENUM.CRED, // 证件 7
    ].indexOf(control.type) > -1
  ) {
    return true;
  } else if (control.type === WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET) {
    // 关联记录 29
    return String(control.advancedSetting.showtype) !== '2';
  }
}
