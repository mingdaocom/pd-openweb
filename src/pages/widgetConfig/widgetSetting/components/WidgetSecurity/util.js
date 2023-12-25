// 根据掩码配置处理数据
import { getAdvanceSetting } from 'src/pages/widgetConfig/util/setting';

// 开头
const BEGIN_ENUM = {
  NO_DISPLAY: '0', // 不显示
  APPOINT_NUM: '1', // 指定字数
  BEFORE_APPOINT_CHAR: '2', // 指定字符之前的字
  BEFORE_AND_INCLUDE_APPOINT_CHAR: '3', // 指定字符和之前的字
};

// 结尾
const END_ENUM = {
  NO_DISPLAY: '0', // 不显示
  APPOINT_NUM: '1', // 指定字数
  AFTER_APPOINT_CHAR: '2', // 指定字符之后的字
  AFTER_AND_INCLUDE_APPOINT_CHAR: '3', // 指定字符和之后的字
};

const formatPad = (masklen, value) => {
  const num = parseInt(masklen);
  return value.replace(/\*+/g, '*'.repeat(num));
};

// 中间显示 + 虚拟掩码长度(配置 ｜ 原始值 ｜ 处理值)
const getValueByMaskSetting = ({ maskmid = '', masklen = '', value = '', maskValue = '' }) => {
  const maskMidArr = maskmid
    ? maskmid
        .replace(/，/g, ',')
        .split(',')
        .filter(i => i !== '')
    : [];
  if (maskMidArr.length) {
    maskMidArr.forEach(mid => {
      let isGet = false;
      const formatMid = mid.replace(/(\(|\[|\{|\\|\^|\$|\||\)|\?|\*|\+|\.|\]|\}|\))+/, a => {
        return a ? `\\${a[0]}{${a.length}}` : '';
      });
      const reg = new RegExp(formatMid, 'g');
      value.replace(reg, (a, b) => {
        if (maskValue[b] === '*' && !isGet) {
          isGet = true;
          maskValue = maskValue.slice(0, b) + a + maskValue.slice(a.length + b);
        }
      });
    });
  }
  if (masklen && parseInt(masklen)) {
    maskValue = formatPad(masklen, maskValue);
  }
  return maskValue;
};

// 指定字数
const dealValueByCharNum = ({ charNum, value, maskValue, isBegin }) => {
  if (charNum && parseInt(charNum)) {
    if (isBegin) {
      return value.slice(0, parseInt(charNum)) + maskValue.slice(parseInt(charNum));
    } else {
      const index = `-${parseInt(charNum)}`;
      return maskValue.slice(0, parseInt(index)) + value.slice(parseInt(index));
    }
  }
  return maskValue;
};

// 检索字符串位置
const findChar = (char, value, isBegin) => {
  return isBegin ? value.indexOf(char) : value.lastIndexOf(char);
};

// 指定字符
const dealValueByChar = ({ char, value, maskValue, isBegin, isIncluded }) => {
  if (char) {
    const meIndex = findChar(char, value, isBegin);
    if (meIndex > -1) {
      const index = (isIncluded && isBegin) || (!isBegin && !isIncluded) ? meIndex + 1 : meIndex;
      // 字符前
      if (isBegin) {
        return value.slice(0, index) + maskValue.slice(index);
      } else {
        return maskValue.slice(0, index) + value.slice(index);
      }
    }
  }
  return maskValue;
};

export const dealMaskValue = (data = {}) => {
  let {
    datamask,
    masktype = '',
    maskbegin = '',
    mdchar = '',
    maskend = '',
    mechar = '',
    maskmid = '',
    masklen = '',
  } = getAdvanceSetting(data);
  const value = data.value || '';
  if (datamask !== '1') return value;
  let maskValue = '*'.repeat(value.length);
  switch (masktype) {
    case 'all':
      maskbegin = '0';
      maskend = '0';
      break;
    case '1':
      maskbegin = '1';
      mdchar = '1';
      maskend = '1';
      mechar = '1';
      break;
    case '2':
      maskbegin = '1';
      mdchar = '3';
      maskend = '1';
      mechar = '4';
      break;
    case '3':
      maskbegin = '1';
      mdchar = '3';
      maskend = '3';
      mechar = '@';
      break;
    case '4':
      maskbegin = '0';
      maskend = '0';
      masklen = '5';
      break;
    case '5':
      maskbegin = '0';
      maskend = '1';
      mechar = '4';
      break;
    case '6':
      maskbegin = '1';
      mdchar = '4';
      maskend = '1';
      mechar = '4';
      break;
    case '7':
      maskbegin = '2';
      mdchar = '.';
      maskmid = '.,.,.,';
      masklen = '3';
      break;
    case '8':
      maskbegin = '1';
      mdchar = '1';
      maskend = '1';
      mechar = '2';
      break;
  }

  maskbegin = maskbegin || '0';
  maskend = maskend || '0';

  // 开头配置
  switch (maskbegin) {
    // 开头不显示
    case BEGIN_ENUM.NO_DISPLAY:
      switch (maskend) {
        //指定字数
        case END_ENUM.APPOINT_NUM:
          maskValue = dealValueByCharNum({ charNum: mechar, value, maskValue, isBegin: false });
          break;
        // 结尾显示指定字符后
        case END_ENUM.AFTER_APPOINT_CHAR:
          maskValue = dealValueByChar({ char: mechar, value, maskValue, isBegin: false, isIncluded: false });
          break;
        // 结尾显示指定字符后和指定字符
        case END_ENUM.AFTER_AND_INCLUDE_APPOINT_CHAR:
          maskValue = dealValueByChar({ char: mechar, value, maskValue, isBegin: false, isIncluded: true });
          break;
      }
      break;

    // 开头显示指定字数
    case BEGIN_ENUM.APPOINT_NUM:
      maskValue = dealValueByCharNum({ charNum: mdchar, value, maskValue, isBegin: true });
      const mdNum = mdchar && parseInt(mdchar);

      switch (maskend) {
        //指定字数(重叠位置舍弃)
        case END_ENUM.APPOINT_NUM:
          if (mechar && mdNum + parseInt(mechar) >= value.length) break;
          maskValue = dealValueByCharNum({ charNum: mechar, value, maskValue, isBegin: false });
          break;
        // 结尾显示指定字符后
        case END_ENUM.AFTER_APPOINT_CHAR:
          if (findChar(mechar, value, false) < mdNum) break;
          maskValue = dealValueByChar({ char: mechar, value, maskValue, isBegin: false, isIncluded: false });
          break;
        // 结尾显示指定字符后和指定字符
        case END_ENUM.AFTER_AND_INCLUDE_APPOINT_CHAR:
          if (findChar(mechar, value, false) <= mdNum) break;
          maskValue = dealValueByChar({ char: mechar, value, maskValue, isBegin: false, isIncluded: true });
          break;
      }
      break;

    // 指定字符之前的字
    case BEGIN_ENUM.BEFORE_APPOINT_CHAR:
      maskValue = dealValueByChar({ char: mdchar, value, maskValue, isBegin: true });
      const mdIndex = findChar(mdchar, value, true);
      switch (maskend) {
        //指定字数
        case END_ENUM.APPOINT_NUM:
          if (mechar && parseInt(mechar) + mdIndex >= value.length) break;
          maskValue = dealValueByCharNum({ charNum: mechar, value, maskValue, isBegin: false });
          break;
        // 结尾显示指定字符后
        case END_ENUM.AFTER_APPOINT_CHAR:
          if (findChar(mechar, value, false) < mdIndex) break;
          maskValue = dealValueByChar({ char: mechar, value, maskValue, isBegin: false, isIncluded: false });
          break;
        // 结尾显示指定字符后和指定字符
        case END_ENUM.AFTER_AND_INCLUDE_APPOINT_CHAR:
          if (findChar(mechar, value, false) <= mdIndex) break;
          maskValue = dealValueByChar({ char: mechar, value, maskValue, isBegin: false, isIncluded: true });
          break;
      }
      break;

    // 指定字符和之前的字
    case BEGIN_ENUM.BEFORE_AND_INCLUDE_APPOINT_CHAR:
      maskValue = dealValueByChar({ char: mdchar, value, maskValue, isBegin: true, isIncluded: true });
      const mdIndex1 = findChar(mdchar, value, true) + 1;
      switch (maskend) {
        //指定字数
        case END_ENUM.APPOINT_NUM:
          // 不连续时执行操作
          if (mechar && mdIndex1 + parseInt(mechar) >= value.length) break;
          maskValue = dealValueByCharNum({ charNum: mechar, value, maskValue, isBegin: false });
          break;
        // 结尾显示指定字符后
        case END_ENUM.AFTER_APPOINT_CHAR:
          if (findChar(mechar, value, false) < mdIndex1) break;
          maskValue = dealValueByChar({ char: mechar, value, maskValue, isBegin: false, isIncluded: false });
          break;
        // 结尾显示指定字符后和指定字符
        case END_ENUM.AFTER_AND_INCLUDE_APPOINT_CHAR:
          if (findChar(mechar, value, false) <= mdIndex1) break;
          maskValue = dealValueByChar({ char: mechar, value, maskValue, isBegin: false, isIncluded: true });
          break;
      }
      break;
  }

  return getValueByMaskSetting({ maskmid, masklen, value, maskValue });
};
