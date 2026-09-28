import _ from 'lodash';

/**
 * 统计指定字符或正则片段在字符串中的出现次数。
 */
export function countChar(str = '', char) {
  if (!str || !char) {
    return 0;
  }

  try {
    return str.match(new RegExp(char, 'g')).length;
  } catch (err) {
    console.log(err);
    return 0;
  }
}

/**
 * 按 ASCII 单字节、其他字符双字节的规则计算字符串长度。
 * @param {string} self - 要计算字节数的字符串
 * @returns {number} - 字符串的字节数
 */
export const getStringBytes = self => {
  let strLength = 0;

  for (let i = 0; i < self.length; i++) {
    if (self.charAt(i) > '~') strLength += 2;
    else strLength += 1;
  }

  return strLength;
};

/**
 * 按 ASCII 单字节、其他字符双字节的规则截取指定字节长度的字符串。
 */
export const getStrBytesLength = (str = '', bytesLength = 16) => {
  if (str.replace(/[^\u0020-\u007F]/g, '**').length <= bytesLength) {
    return str;
  }

  let result = '';
  let currentLength = 0;

  for (const char of str) {
    currentLength += /[\u0020-\u007F]/.test(char) ? 1 : 2;
    if (currentLength > bytesLength) break;
    result += char;
  }

  return result;
};

/**
 * 在忽略链接、图片与换行标签内容时按长度截取 HTML 文本。
 */
export const cutStringWithHtml = (self, len, rows) => {
  let str = '';
  let strLength = 0;
  let isA = false;
  let isPic = false;
  let isBr = false;
  let brCount = 0;

  for (let i = 0; i < self.length; i++) {
    let letter = self.substring(i, i + 1);
    let nextLetter = self.substring(i + 1, i + 2);
    let nextnextLetter = self.substring(i + 2, i + 3);

    if (letter == '<' && nextLetter == 'a') {
      // a标签包含
      isA = true;
    } else if (letter == '<' && nextLetter == 'b' && nextnextLetter == 'r') {
      // 换行符
      isBr = true;
      brCount++;
    } else if (letter == '<') {
      // 图片
      isPic = true;
    }

    if (brCount == Number(rows)) {
      break;
    }

    str += letter;
    if (!isA && !isPic && !isBr) {
      if (self.charAt(i) > '~') {
        strLength += 2;
      } else {
        strLength += 1;
      }
    }

    if (isPic) {
      if (letter == '>') {
        isPic = false;
      } else {
        continue;
      }
    }

    if (isA) {
      if (letter == '>' && self.substring(i - 1, i) == 'a') {
        isA = false;
      } else {
        continue;
      }
    }

    if (isBr) {
      if (letter == '>' && self.substring(i - 1, i) == 'r') {
        isBr = false;
      } else {
        continue;
      }
    }

    if (strLength >= len) {
      break;
    }
  }

  return str;
};

/**
 * 将 HTML 文本中的危险特殊字符编码为实体。
 * @param  {string} str
 * @return {string}
 */
export const htmlEncodeReg = str => {
  const encodeHTMLRules = { '&': '&#38;', '<': '&lt;', '>': '&gt;', '"': '&#34;', "'": '&#39;', '/': '&#47;' };
  const matchHTML = /&(?!#?\w+;)|<|>|"|'|\//g;
  return str
    ? str.toString().replace(matchHTML, function (m) {
        return encodeHTMLRules[m] || m;
      })
    : '';
};

/**
 * 将受支持的 HTML 实体还原为特殊字符。
 * @param  {string} str
 * @return {string}
 */
export const htmlDecodeReg = str => {
  const decodeHTMLRules = {
    '&#38;': '&',
    '&amp;': '&',
    '&#60;': '<',
    '&#62;': '>',
    '&#34;': '"',
    '&#39;': "'",
    '&#47;': '/',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
  };
  const matchHTML = /&#(38|60|62|34|39|47);|&(amp|lt|gt|quot);/g;
  return str
    ? str.toString().replace(matchHTML, function (m) {
        return decodeHTMLRules[m] || m;
      })
    : '';
};

/**
 * 名称冲突时递增末尾序号，生成集合内不重复的名称。
 * @param {Array} data - 包含名称的对象数组
 * @param {string} name - 初始名称
 * @param {string} key - 用于比较的键名，默认为 'name'
 * @returns {string} - 不重复的名称
 */
export const getUnUniqName = (data, name = '', key = 'name') => {
  const nameExists = _.some(data, [key, name]);

  if (nameExists) {
    const maxNumber = _.max(
      _.filter(data, item => _.startsWith(item[key], String(name).replace(/\d*$/, ''))).map(item =>
        parseInt(item[key].replace(/^.*?(\d+)$/, '$1')),
      ),
    );

    name = String(name).replace(/\d*$/, (maxNumber || 0) + 1);
  }

  return name;
};

/**
 * 生成包含大写字母、小写字母和数字的随机密码。
 * @param {number} length - 密码长度。
 * @returns {string} - 随机生成的密码。
 */
export const generateRandomPassword = length => {
  const chars = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    number: '0123456789',
  };

  // 至少包含一个字符
  const password = _.flatMap(Object.values(chars), group => _.sample(group)).join('');

  // 生成剩余部分，并使用 Fisher-Yates 洗牌算法随机排序
  const remainingChars = _.times(length - 3, i => _.sample(Object.values(chars)[i % 3]));
  const shuffledPassword = _.shuffle([password, ...remainingChars]).join('');

  return shuffledPassword;
};
