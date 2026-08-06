import update from 'immutability-helper';
import _, { get, includes } from 'lodash';
import moment from 'moment';
import { HAVE_VALUE_STYLE_WIDGET } from 'src/components/Form/core/enum';

const NEW_RECORD_FROM = [2, 4, 5, 21];

// 获取advancedSetting属性转化为对象
export const getAdvanceSetting = (data, key) => {
  const setting = get(data, ['advancedSetting']) || {};

  if (!key) return setting;

  let value = get(setting, key);

  if (!value) return '';

  try {
    return JSON.parse(value);
  } catch (error) {
    console.log(error);
    return '';
  }
};

// 更新advancedSetting数据
export const handleAdvancedSettingChange = (data, obj) => {
  return {
    ...data,
    advancedSetting: update(data.advancedSetting || {}, { $apply: item => ({ ...item, ...obj }) }),
  };
};

const DATE_SHOW_TYPES = [
  { value: '0', format: 'YYYY-MM-DD' },
  { value: '4', format: 'YYYY/MM/DD' },
  { value: '1', text: _l('中国'), format: 'YYYY年M月D日' },
  { value: '2', text: 'US', format: 'M/D/YYYY' },
  { value: '3', text: 'EU', format: 'D/M/YYYY' },
];

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

// 控件状态
export const controlState = (data, from) => {
  if (!data) {
    return {};
  }

  const controlPermissions = data.controlPermissions || '111';
  const fieldPermission = data.fieldPermission || '111';
  let state = {
    visible: true,
    editable: true,
  };

  if (_.includes(NEW_RECORD_FROM, from)) {
    state.visible = fieldPermission[0] === '1' && fieldPermission[2] === '1' && controlPermissions[2] === '1';
    state.editable = fieldPermission[1] === '1';
  } else {
    state.visible = fieldPermission[0] === '1' && controlPermissions[0] === '1';
    state.editable = fieldPermission[1] === '1' && controlPermissions[1] === '1';
  }

  return state;
};

export const getControlStateAndCheckSectionControl = (data, from, formData) => {
  const sectionControl = data.sectionId && _.find(formData, c => c.controlId === data.sectionId);

  if (!sectionControl) {
    return controlState(data, from);
  }

  const stateOfControl = controlState(data, from);
  const stateOfSectionControl = controlState({ ...sectionControl, controlPermissions: '111' }, from);
  return {
    ...stateOfControl,
    editable: stateOfControl.editable && stateOfSectionControl.editable,
  };
};

/**
 * 是否是空值
 */
export const isEmptyValue = value => {
  return _.isUndefined(value) || _.isNull(value) || String(value).trim() === '';
};

/**
 * 解决 JavaScript 原生 toFixed 方法精度问题
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

// 日期控件自定义格式语言环境处理
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

// 标题样式
export const getTitleStyle = (titleStyle = '0000') => {
  const [isBold, isItalic, isUnderline, isLineThrough] = titleStyle.split('');
  let styleText = '';

  if (Number(isBold)) {
    styleText = styleText + 'font-weight: bold !important;';
  }

  if (Number(isItalic)) {
    styleText = styleText + 'font-style: italic;padding-right:3px;';
  }

  if (Number(isUnderline)) {
    styleText = styleText + 'text-decoration: underline;';
  }

  if (Number(isLineThrough)) {
    styleText = styleText + 'text-decoration: line-through;';
  }

  if (Number(isUnderline) && Number(isLineThrough)) {
    styleText = styleText + 'text-decoration: underline line-through;';
  }

  return styleText;
};

// 有字段值样式设置的控件
export const canSetWidgetStyle = (item = {}) => {
  const { type, enumDefault, showControls = [] } = item;
  const { showtype } = getAdvanceSetting(item);
  return (
    _.includes(HAVE_VALUE_STYLE_WIDGET, type) ||
    (type === 2 && enumDefault !== 3) ||
    (type === 51 && (enumDefault === 1 ? showControls.length === 1 : showtype === '3'))
  );
};

// 不允许重复的控件
export const canAsUniqueWidget = item => {
  return (
    _.includes([3, 4, 5, 7, 9, 11], item.type) ||
    (item.type === 2 && item.enumDefault !== 3) ||
    (item.type === 29 && item.enumDefault === 1) ||
    (_.includes([26, 27, 48], item.type) && item.enumDefault === 0)
  );
};

// 关联多条列表显示的控件
export const isSheetDisplay = (data = {}) => {
  return includes([29, 51], data.type) && _.includes(['2', '5', '6'], get(data, 'advancedSetting.showtype'));
};

// 根据配置获取地区提示文案
export const getAreaHintText = data => {
  const { enumDefault, enumDefault2, advancedSetting = {} } = data;
  const chooserange = advancedSetting.chooserange || 'CN';
  const areaDisplayOption = [
    { value: 1, text: _l('省') },
    { value: 2, text: _l('省-市') },
    { value: 3, text: _l('省-市-县') },
  ];
  const areaSpecialDisplayOption = [
    { value: 1, text: _l('省/州') },
    { value: 2, text: _l('市/郡') },
  ];
  const areaInternationDisplayOption = [
    { value: 4, text: _l('所有层级') },
    { value: 1, text: _l('国家') },
    { value: 2, text: _l('省/州') },
    { value: 3, text: _l('市/郡') },
  ];

  if (enumDefault === 1) {
    return _.get(_.find(areaInternationDisplayOption, { value: enumDefault2 }), 'text') || _l('请选择');
  } else {
    if (chooserange === 'CN') {
      return _.get(_.find(areaDisplayOption, { value: enumDefault2 }), 'text') || _l('请选择');
    } else {
      return _.get(_.find(areaSpecialDisplayOption, { value: enumDefault2 }), 'text') || _l('请选择');
    }
  }
};

// 根据掩码配置处理数据
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

// 格式化虚拟掩码长度
const formatPad = (masklen, value) => {
  const num = parseInt(masklen);
  return value.replace(/\*+/g, '*'.repeat(num));
};

// 自定义字符转正则
const formatReg = str => {
  const formatWord = str.replace(/(\(|\[|\{|\\|\^|\$|\||\)|\?|\*|\+|\.|\]|\}|\))+/, a => {
    return a ? `\\${a[0]}{${a.length}}` : '';
  });
  return new RegExp(formatWord, 'g');
};

// 格式化自定义处理字符
const formatWords = words => {
  return words
    ? words
        .replace(/，/g, ',')
        .split(',')
        .filter(i => i !== '')
    : [];
};

// 中间显示 + 始终掩码 + 虚拟掩码长度(配置 ｜ 原始值 ｜ 处理值)
const getValueByMaskSetting = ({ maskmid = '', maskwords = '', masklen = '', value = '', maskValue = '' }) => {
  // 中间显示
  const maskMidArr = formatWords(maskmid);

  if (maskMidArr.length) {
    maskMidArr.forEach(mid => {
      let isGet = false;
      const reg = formatReg(mid);
      value.replace(reg, (a, b) => {
        if (maskValue[b] === '*' && !isGet) {
          isGet = true;
          maskValue = maskValue.slice(0, b) + a + maskValue.slice(a.length + b);
        }
      });
    });
  }

  // 始终掩码
  const maskWordsArr = formatWords(maskwords);

  if (maskWordsArr.length) {
    maskWordsArr.forEach(word => {
      const reg = formatReg(word);
      maskmid = maskmid.replace(reg, '');
      value.replace(reg, (a, b) => {
        if (b > -1) {
          maskValue = maskValue.slice(0, b) + '*'.repeat(a.length) + maskValue.slice(a.length + b);
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
    maskwords = '',
    defaultmask = '1',
  } = getAdvanceSetting(data);
  const { type, showMaskValue } = data;
  const value = data.value || '';

  //手机号字段解码时显示全值
  if (type == 3 && !_.isUndefined(showMaskValue) && !showMaskValue) return value;

  if (datamask !== '1') return value;

  if (defaultmask === '2') {
    const maskWordsArr = formatWords(maskwords);

    if (maskWordsArr.length) {
      let maskValue = value;
      maskWordsArr.forEach(word => {
        const reg = formatReg(word);
        value.replace(reg, (a, b) => {
          if (b > -1) {
            maskValue = maskValue.slice(0, b) + '*'.repeat(a.length) + maskValue.slice(a.length + b);
          }
        });
      });
      if (masklen) {
        maskValue = formatPad(masklen, maskValue);
      }

      return maskValue;
    }

    return data.value || '';
  }

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

  return getValueByMaskSetting({ maskmid, masklen, value, maskValue, maskwords });
};

// 将颜色变量转换为颜色值
export const getColorValue = (color = '') => {
  if (_.isString(color) && color.includes('var(')) {
    const match = color.match(/var\((--[^)]+)\)/);

    if (match) {
      return getComputedStyle(document.body).getPropertyValue(match[1]);
    }
  }

  return color;
};

export const getRgbaByColor = (color, alpha) => {
  color = getColorValue(color);
  const sColorChange = [];

  for (let i = 1; i < 7; i += 2) {
    sColorChange.push(parseInt(`0x${color.slice(i, i + 2)}`));
  }

  return `rgba(${sColorChange.join(',')},${alpha})`;
};

// 控件规则匹配：未保存控件匹配 uuid，已保存控件形如 $5e047c2ab2bfdd0001e9b8f9$
export const FIELD_REG_EXP =
  /\$((\w{8}(-\w{4}){3}-\w{12})|(\w{24}|caid|ownerid|utime|ctime|userId|phone|email|language|projectId|appId|groupId|worksheetId|viewId|recordId|ua|timestamp|search-keyword|ocr-file|ocr-file-url|current-location|empty|user-self|current-time|wfname|wfcuaids|wfcaid|wfctime|wfrtime|wfftime|wfstatus|rowid|uaid|codeResult|triggerTime|triggerUser|triggerDepartment|triggerOrg|user|time|address|xy|temp-name|print-time)?)(~((\w{8}(-\w{4}){3}-\w{12})|(\w{24}|caid|ownerid|utime|ctime|userId|phone|email|language|projectId|appId|groupId|worksheetId|viewId|recordId|ua|timestamp|search-keyword|ocr-file|ocr-file-url|current-location|empty|user-self|current-time|wfname|wfcuaids|wfcaid|wfctime|wfrtime|wfftime|wfstatus|rowid|uaid|codeResult|triggerTime|triggerUser|triggerDepartment|triggerOrg|user|time|address|xy|temp-name|print-time)?))?\$/g;

export const transferValue = (value = '') => {
  const controlFields = value.match(FIELD_REG_EXP) || [];
  const defaultValue = _.filter(value.split('$'), v => !_.isEmpty(v));
  const defsource = defaultValue.map(item => {
    const defaultData = { cid: '', rcid: '', staticValue: '' };

    if (_.includes(controlFields, `$${item}$`)) {
      const [cid = '', rcid = ''] = item.split('~');
      return { ...defaultData, cid, rcid };
    }

    return { ...defaultData, staticValue: item };
  });

  return defsource;
};
