// 函数库直接依赖此模块，请勿引入 Moment 或与函数运行时无关的依赖和逻辑。
import dayjs from 'dayjs';

const padDatePart = value => String(value).padStart(2, '0');

/** 将日期格式化为适合文件名后缀的 yyMMddHHmmss。 */
export function formatFileTimestamp(date = new Date()) {
  return `${padDatePart(date.getFullYear() % 100)}${padDatePart(date.getMonth() + 1)}${padDatePart(date.getDate())}${padDatePart(date.getHours())}${padDatePart(date.getMinutes())}${padDatePart(date.getSeconds())}`;
}

/**
 * 按日期运算表达式依次增减指定时间单位，并返回计算结果或错误。
 */
export function calcDate(date, expression) {
  if (!date) {
    return { error: true };
  }

  if (!/^[+-]/.test(expression)) {
    expression = '+' + expression;
  }

  try {
    let result = dayjs(date);
    const regexp = /([/+/-]){1}(\d+(\.\d+)?)+([YQMwdhms]){1}/g;
    let match = regexp.exec(expression);

    while (match) {
      const operator = match[1];
      const number = Number(match[2]);
      const unit = match[4];

      if (/^[+-]$/.test(operator) && number && typeof number === 'number' && /^[YQMwdhms]$/.test(unit)) {
        result = result[operator === '+' ? 'add' : 'subtract'](Math.round(number), unit.replace(/Y/, 'y'));
      }

      match = regexp.exec(expression);
    }

    return { result };
  } catch (err) {
    return { error: err };
  }
}
