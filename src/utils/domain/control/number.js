import _ from 'lodash';
import nzh from 'nzh';
import { ToWords } from 'to-words';
import { getAdvanceSetting } from './advancedSetting';

/**
 * 判断值是否为未定义、null 或去除空白后的空字符串。
 */
export const isEmptyValue = value => {
  return _.isUndefined(value) || _.isNull(value) || String(value).trim() === '';
};

/**
 * 按金额字段币种与目标控件配置，将数值转换为中文、繁体或英文大写金额。
 */
export const formatNumberToWords = (control = {}, relateControl = {}) => {
  const value = relateControl.value || '';
  if (!value.toString()) return '';
  const { currency, currencynames } = relateControl.advancedSetting || {};
  // 转换最多两位小数，先四舍五入在转
  const dot = relateControl.dot > 2 ? 2 : relateControl.dot;
  const { currencycode, symbol } = safeParse(currency || '{}');
  const currencytype = getAdvanceSetting(control, 'currencytype');
  // 繁体前缀，主单位单复数、辅助单位单复数
  const { 0: zhTw, 1: pluralCode, 2: code, 3: subPluralCode, 4: subCode } = safeParse(currencynames || '{}') || {};
  const isSpecialArea = _.includes(['CNY', 'HKD', 'TWD', 'MOP'], currencycode);

  if (currencytype === 3) {
    const tempValue = nzh.hk.toMoney(parseFloat(toFixed(value, dot)), { outSymbol: false });
    return (isSpecialArea ? zhTw || '' : '') + tempValue;
  } else if (currencytype === 1) {
    const toWords = new ToWords({
      localeCode: 'en-US',
      converterOptions: {
        currency: true,
        ignoreDecimal: false,
        ignoreZeroCurrency: false,
        doNotAddOnly: false,
        ...(currency
          ? {
              currencyOptions: {
                singular: code, // // 主货币（单数形式）
                plural: pluralCode, // 主货币（复数形式）
                symbol: symbol,
                fractionalUnit: {
                  singular: subCode, // 辅助货币（单数形式）
                  plural: subPluralCode, // 辅助货币（复数形式）
                  symbol: '',
                },
              },
            }
          : {}),
      },
    });
    const tempValue = toWords.convert(parseFloat(value));
    return tempValue ? 'SAY ' + tempValue.toLocaleUpperCase() : '';
  } else {
    return nzh.cn.toMoney(parseFloat(toFixed(value, dot)), { outSymbol: false });
  }
};

/**
 * 清理输入内容并保留一个合法的负号与小数点。
 */
export const formatNumberFromInput = (value, pointReturnEmpty = true) => {
  value = (value || '')
    .replace('。', '.')
    .replace(/[^-\d.]/g, '')
    .replace(/^\./g, '')
    .replace(/^-/, '$#$')
    .replace(/-/g, '')
    .replace('$#$', '-')
    .replace(/^-\./, '-')
    .replace('.', '$#$')
    .replace(/\./g, '')
    .replace('$#$', '.');

  if (pointReturnEmpty && value === '.') {
    value = '';
  }

  return value;
};

/**
 * 为数值字符串的整数部分添加千分位分隔符。
 */
export const formatNumberThousand = value => {
  const content = (value || _.isNumber(value) ? value : '').toString();
  const reg = content.indexOf('.') > -1 ? /(\d{1,3})(?=(?:\d{3})+\.)/g : /(\d{1,3})(?=(?:\d{3})+$)/g;
  return content.replace(reg, '$1,');
};

/**
 * 将工作表数值按指定小数位四舍五入为定长字符串，并兼容科学计数法。
 */
export function toFixed(num, dot = 0) {
  if (_.isObject(num) || _.isNaN(Number(num))) {
    console.error(num, '不是数字');
    return '';
  }

  if (dot === 0) {
    return String(Math.round(num));
  }

  if (dot < 0 || dot > 20) {
    return String(num);
  }

  const strOfNum = String(num);

  // 科学计数法（如浮点求和残差 -3.637978807091713e-12）没法走下面的字符串移位：
  // 拼出的 `-3.637978807091713e-12e2` 会被 Number 解析成 NaN，最终输出 -N.aN。这类数量级交给原生 toFixed。
  if (/e/i.test(strOfNum)) {
    return Number(num).toFixed(dot);
  }

  if (!/\./.test(strOfNum)) {
    return strOfNum + '.' + _.padEnd('', dot, '0');
  }

  const decimal = ((strOfNum.match(/\.(\d+)/) || '')[1] || '').length;

  if (decimal === dot) {
    return strOfNum;
  } else if (decimal < dot) {
    return strOfNum + _.padEnd('', dot - decimal, '0');
  } else {
    const isNegative = Number(num) < 0;

    if (isNegative) {
      num = Math.abs(num);
    }

    let data = String(Math.round(Number(`${num}e${dot}`)));
    data = _.padStart(data, dot + 1, '0');
    return (isNegative ? '-' : '') + (data.slice(0, -dot) || '0') + '.' + data.slice(-1 * dot);
  }
}

/** 按字段的小数位和取整方式格式化数值。 */
export function handleDotAndRound(currentItem, value, ignoreAddZero = true) {
  const isNegative = value < 0;
  value = Math.abs(value);
  const roundType = currentItem.advancedSetting.roundtype || (_.includes([6, 8, 31, 37], currentItem.type) ? '2' : '0');
  let dot = Number(currentItem.dot);

  if (!dot || _.isNaN(dot)) dot = 0;

  if (roundType === '2') {
    value = String((Math.round(value * Math.pow(10, dot)) / Math.pow(10, dot)) * (isNegative ? -1 : 1));
  } else if (roundType === '1') {
    value = String((Math.ceil(value * Math.pow(10, dot)) / Math.pow(10, dot)) * (isNegative ? -1 : 1));
  } else {
    value = String(toFixed(Math.floor(value * Math.pow(10, dot)) / Math.pow(10, dot), dot) * (isNegative ? -1 : 1));
  }

  const ignoreZero = currentItem.advancedSetting.dotformat === '1';

  if (!ignoreZero && dot !== 0 && ignoreAddZero) {
    value = (value + (value.indexOf('.') > -1 ? '' : '.') + '0000000000000').replace(
      new RegExp(`(\\d+\\.\\d{${dot}})(0+)$`),
      '$1',
    );
  }

  return value;
}

/**
 * 格式化数字字符串，去除无效的零，保留有效数字。
 * @param {string} str - 要格式化的字符串。
 * @returns {string} - 格式化后的字符串。
 */
export function formatStrZero(str = '') {
  const numStr = String(str).match(/[,.\d]+/) || [''];
  const num = numStr[0].replace(/(?:\.0*|(\.\d+?)0+)$/, '$1');

  return String(str).replace(numStr[0], num);
}
