import _ from 'lodash';
import moment from 'moment';
import { toFixed } from 'src/utils/control';
import { getContactInfo } from 'src/utils/project';
import { filterEmptyChildTableRows } from 'src/utils/record';
import { FORM_ERROR_TYPE } from '../config';

export const getEmbedValue = (embedData = {}, id) => {
  switch (id) {
    case 'userId':
      return md.global.Account.accountId;
    case 'phone':
      return getContactInfo('mobilePhone');
    case 'email':
      return getContactInfo('email');
    case 'language':
      return window.getCurrentLang();
    case 'ua':
      return window.navigator.userAgent;
    case 'timestamp':
      return new Date().getTime();
    default:
      return embedData[id] || '';
  }
};

export const compareWithTime = (start, end, type) => {
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

export const getRangeErrorType = ({ type, value, advancedSetting = {} }) => {
  const formatValue = value => parseFloat(value.replace(/,/g, ''));
  const { min, max, checkrange } = advancedSetting;

  if (!value || checkrange !== '1') return '';

  if (type === 2) {
    const stringSize = (value || '').length;
    if ((min && stringSize < +min) || (max && stringSize > +max)) return FORM_ERROR_TYPE.TEXT_RANGE;
  }

  if (
    !isNaN(value) &&
    _.includes([6, 8], type) &&
    ((min && +value < formatValue(min)) || (max && +value > formatValue(max)))
  )
    return FORM_ERROR_TYPE.NUMBER_RANGE;

  if (type === 10) {
    const selectedItemsCount = JSON.parse(value || '[]').length;
    if ((min && selectedItemsCount < +min) || (max && selectedItemsCount > +max))
      return FORM_ERROR_TYPE.MULTI_SELECT_RANGE;
  }

  return '';
};

/**
 * 验证身份证校验码
 */
export const validateIdCardCheckCode = idCard => {
  const first17 = idCard.substring(0, 17);
  // 校验码（第18位）
  const checkCode = idCard.substring(17, 18).toUpperCase();

  // 权重数组
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  // 校验码对应表
  const checkCodeMap = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];

  // 计算加权和
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += parseInt(first17[i], 10) * weights[i];
  }

  // 计算余数
  const remainder = sum % 11;
  // 获取正确的校验码
  const correctCheckCode = checkCodeMap[remainder];

  return checkCode === correctCheckCode;
};

/**
 * 验证身份证出生日期是否有效
 */
export const validateIdCardBirthDate = idCard => {
  const year = parseInt(idCard.substring(6, 10), 10);
  const month = parseInt(idCard.substring(10, 12), 10);
  const day = parseInt(idCard.substring(12, 14), 10);

  // 验证年份范围（1900-当前年份）
  const currentYear = new Date().getFullYear();
  if (year < 1900 || year > currentYear) {
    return false;
  }

  // 验证月份
  if (month < 1 || month > 12) {
    return false;
  }

  // 验证日期
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  // 判断是否为闰年
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  if (isLeapYear) {
    daysInMonth[1] = 29; // 闰年2月有29天
  }

  if (day < 1 || day > daysInMonth[month - 1]) {
    return false;
  }

  return true;
};

// 合并筛选filter
export const getItemFilters = items => {
  return (items || []).reduce((total, cur) => {
    return total.concat(cur.isGroup ? cur.groupFilters : [cur]);
  }, []);
};

// 时间字段处理
export const formatTimeValue = (control = {}, isCurrent = false, value) => {
  // 汇总输出格式unit为9
  const mode = control.unit === '6' || control.unit === '9' ? 'HH:mm:ss' : 'HH:mm';
  if (isCurrent) return moment(moment().format(mode), mode).format('HH:mm:ss');
  if (!value) return '';
  return moment(value).year()
    ? moment(moment(value).format(mode), mode).format('HH:mm:ss')
    : moment(value, mode).format('HH:mm:ss');
};

// 获取他表字段的值
export const getOtherWorksheetFieldValue = ({ data, dataSource, sourceControlId }) => {
  try {
    const parentControl = _.find(data, c => c.controlId === dataSource.slice(1, -1));
    const record = safeParse(parentControl.value)[0];
    const sourceControl = parentControl && _.find(parentControl.relationControls, c => c.controlId === sourceControlId);
    if (sourceControl && _.includes([29, 35], sourceControl.type)) {
      const sourceControlValue = safeParse(record.sourcevalue)[sourceControlId];
      const sourceControlValueRecord = safeParse(sourceControlValue)[0];
      if (sourceControlValueRecord) {
        return sourceControlValueRecord.name;
      }
    } else {
      return safeParse(record.sourcevalue)[sourceControlId];
    }
  } catch (err) {
    console.log(err);
    return '';
  }
};

/**
 * ignoreAddZero 不走补零逻辑
 */
export function handleDotAndRound(currentItem, value, ignoreAddZero = true) {
  const isNegative = value < 0;
  value = Math.abs(value);
  const roundType = currentItem.advancedSetting.roundtype || (_.includes([6, 8, 31, 37], currentItem.type) ? '2' : '0');
  // 取整方式 空或者0 向下取整 1 向上取整 2 代表四舍五入
  let dot = Number(currentItem.dot);
  if (!dot || _.isNaN(dot)) {
    dot = 0;
  }
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

// 获取控件的值（处理特殊选项控件）
// objValue是外层新值，覆盖obj.value
export const getControlValue = (data, currentItem, controlId, objValue) => {
  const obj = _.find(data, o => o.controlId === controlId) || {};
  const value = objValue || obj.value;

  // 非同选项集选项默认值文本匹配
  if (
    _.includes([9, 10, 11], obj.type) &&
    _.includes([9, 10, 11], currentItem.type) &&
    !(obj.dataSource && obj.dataSource === currentItem.dataSource) &&
    value
  ) {
    const tempValue = safeParse(value || '[]')
      .map(item => {
        const isOther = (item || '').includes('other') && _.find(currentItem.options || [], c => c.key === 'other');
        const itemText = _.get(
          _.find(obj.options || [], i => i.key === item),
          'value',
        );

        const matchOptionKeys = (currentItem.options || []).filter(i => i.value === itemText && !i.isDeleted);
        return isOther ? item : _.get(_.head(matchOptionKeys), 'key') || '';
      })
      .filter(_.identity);
    return _.isEmpty(tempValue) ? '' : JSON.stringify(tempValue);
  }

  if (
    _.includes([9, 10, 11], obj.type) &&
    (_.includes([6, 8, 28, 31], currentItem.type) || (currentItem.type === 38 && currentItem.enumDefault === 2))
  ) {
    // 选项控件的分值可以被数值类控件引用
    if (!safeParse(value || '[]').length) return '';

    let cValue = 0;
    safeParse(value || '[]').forEach(key => {
      // 新增的项默认0
      cValue += key.indexOf('add_') > -1 || !obj.enumDefault ? 0 : obj.options.find(o => o.key === key)?.score;
    });

    return cValue;
  }

  return _.isUndefined(value) ? '' : value;
};

export const checkChildTableIsEmpty = (control = {}) => {
  const store = control.store;
  const state = store && store.getState();
  if (state && state.rows && !state.baseLoading) {
    return filterEmptyChildTableRows(state.rows).length <= 0;
  } else {
    return control.value === '0' || !control.value;
  }
};

/*********************************************************************************
 * 以下是业务规则相关
 *********************************************************************************
 */

export const flattenArr = (obj = {}) => {
  return Object.values(obj).reduce((total, cur = []) => {
    return total.concat(_.flatten(cur));
  }, []);
};

export const getResult = (arr, index, result, ava) => {
  if (!index) {
    return result;
  } else {
    return arr[index - 1].spliceType === 1 ? ava && result : ava || result;
  }
};

export const replaceStr = (str, index, value) => {
  return str.substring(0, index) + value + str.substring(index + 1);
};

// 过滤不必要走（字段都删除）的业务规则
export const getAvailableFilters = (rules = [], formatData = [], recordId) => {
  //过滤禁用规则及单个且数组中字段全部删除情况
  // 注意如果是记录id，data里不包含系统字段，所以必须recordId存在才生效
  let filterRules = [];
  rules.forEach(o => {
    if (!o.disabled) {
      let filterTrs = [];
      (o.filters || []).map(tr => {
        if (
          _.some(tr.groupFilters || [], t =>
            _.get(t, 'dynamicSource[0].cid') === 'rowid'
              ? recordId
              : _.findIndex(formatData, da => da.controlId === t.controlId) > -1,
          )
        ) {
          filterTrs = filterTrs.concat(tr);
        }
      });
      filterTrs.length > 0 && filterRules.push({ ...o, filters: filterTrs });
    }
  });

  return { defaultRules: filterRules.filter(i => i.type === 0), errorRules: filterRules.filter(i => i.type === 1) };
};

export const getAttachmentData = (control = {}) => {
  let fileData;
  if (control.value && _.isArray(JSON.parse(control.value))) {
    fileData = JSON.parse(control.value);
  } else {
    const data = JSON.parse(control.value || '{}');
    const { attachments = [], attachmentData = [], knowledgeAtts = [] } = data;
    fileData = [...attachmentData, ...attachments, ...knowledgeAtts];
  }
  return fileData;
};

//是否关联多条列表
export function isRelateMoreList(control, condition) {
  return (
    control &&
    control.type === 29 &&
    control.enumDefault === 2 &&
    control.advancedSetting &&
    control.advancedSetting.showtype === '2' &&
    _.includes([24, 25], condition.filterType || condition.type)
  );
}

export const mergeFormDataWidthSystem = (data = [], systemControlData = []) => {
  const mergedData = [...data];
  (systemControlData || []).forEach(systemItem => {
    const existingIndex = mergedData.findIndex(d => d.controlId === systemItem.controlId);
    if (existingIndex !== -1) {
      mergedData[existingIndex] = { ...mergedData[existingIndex], ...systemItem };
    } else {
      mergedData.push(systemItem);
    }
  });
  return mergedData;
};
