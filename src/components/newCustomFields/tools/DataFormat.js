import { formatColumnToText } from 'src/pages/widgetConfig/util/data.js';
import { calcDate, filterEmptyChildTableRows } from 'src/pages/worksheet/util';
import { Parser } from 'hot-formula-parser';
import nzh from 'nzh';
import { v4 as uuidv4 } from 'uuid';
import { FORM_ERROR_TYPE, FROM, TIME_UNIT, FORM_ERROR_TYPE_TEXT, SYSTEM_ENUM } from './config';
import { isRelateRecordTableControl, checkCellIsEmpty } from 'worksheet/util';
import execValueFunction from 'src/pages/widgetConfig/widgetSetting/components/FunctionEditorDialog/Func/exec';
import { transferValue } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/util';
import { getDefaultCount } from 'src/pages/widgetConfig/widgetSetting/components/SearchWorksheet/SearchWorksheetDialog.jsx';
import { getDatePickerConfigs, getShowFormat } from 'src/pages/widgetConfig/util/setting.js';
import { RELATE_RECORD_SHOW_TYPE, SYSTEM_CONTROLS } from 'worksheet/constants/enum';
import {
  Validator,
  getRangeErrorType,
  getCurrentValue,
  specialTelVerify,
  compareWithTime,
  getEmbedValue,
  isUnTextWidget,
  controlState,
  getArrBySpliceType,
  checkValueByFilterRegex,
  halfSwitchSize,
} from './utils';
import intlTelInput from '@mdfe/intl-tel-input';
import utils from '@mdfe/intl-tel-input/build/js/utils';
import moment from 'moment';
import MapLoader from 'ming-ui/components/amap/MapLoader';
import MapHandler from 'ming-ui/components/amap/MapHandler';
import departmentAjax from 'src/api/department';
import organizeAjax from 'src/api/organize';
import { browserIsMobile, getCurrentProject, toFixed, dateConvertToServerZone, getContactInfo } from 'src/util';
import { checkRuleLocked, isEmptyValue } from './filterFn';
import _, { find, get, includes } from 'lodash';
import { createRequestPool } from 'worksheet/api/standard';
import renderCellText from 'src/pages/worksheet/components/CellControls/renderText';
import generateSubListStore from 'worksheet/components/ChildTable/redux/store';
import generateRelateRecordTableStore from 'worksheet/components/RelateRecordTable/redux/store.js';
import { setRowsFromStaticRows } from 'worksheet/components/ChildTable/redux/actions';
import { getFilter } from 'worksheet/common/WorkSheetFilter/util';

export const initIntlTelInput = () => {
  if (window.initIntlTelInput) {
    return window.initIntlTelInput;
  }

  const $con = document.createElement('div');
  const $input = document.createElement('input');

  $con.style.display = 'none';
  $con.appendChild($input);
  document.body.appendChild($con);

  window.initIntlTelInput = intlTelInput($input, {
    initialCountry: _.get(md, 'global.Config.DefaultConfig.initialCountry') || 'cn',
    utilsScript: utils,
  });

  return window.initIntlTelInput;
};

// 合并筛选filter
const getItemFilters = (items = []) => {
  return items.reduce((total, cur) => {
    return total.concat(cur.isGroup ? cur.groupFilters : [cur]);
  }, []);
};

// 时间字段处理
const formatTimeValue = (control = {}, isCurrent = false, value) => {
  // 汇总输出格式unit为9
  const mode = control.unit === '6' || control.unit === '9' ? 'HH:mm:ss' : 'HH:mm';
  if (isCurrent) return moment(moment().format(mode), mode).format('HH:mm:ss');
  if (!value) return '';
  return moment(value).year()
    ? moment(moment(value).format(mode), mode).format('HH:mm:ss')
    : moment(value, mode).format('HH:mm:ss');
};

/**
 *
 * 查询出来的值映射前需要异化处理格式
 */
export const formatSearchResultValue = ({
  targetControl = {},
  currentControl = {},
  controls = [],
  searchResult = '',
}) => {
  if (_.includes([9, 10, 11], currentControl.type)) {
    return getControlValue(controls, currentControl, targetControl.controlId, searchResult);
  } else if (currentControl.type === 2) {
    return getCurrentValue(
      _.find(controls, s => s.controlId === targetControl.controlId),
      searchResult,
      currentControl,
    );
  } else {
    return searchResult;
  }
};

// 处理静态默认值
const parseStaticValue = (item, staticValue) => {
  // 手机 当前用户
  if (item.type === 3 && _.get(safeParse(staticValue), 'accountId') === 'user-self') {
    return getContactInfo('mobilePhone');
  }
  // 邮箱 当前用户
  if (item.type === 5 && _.get(safeParse(staticValue), 'accountId') === 'user-self') {
    return getContactInfo('email');
  }

  // 日期 || 日期时间
  if (item.type === 15 || item.type === 16) {
    const unit = TIME_UNIT[item.unit] || 'd';
    if (staticValue === '2') {
      return item.type === 15
        ? moment().format('YYYY-MM-DD')
        : dateConvertToServerZone(moment().format('YYYY-MM-DD HH:mm:ss'));
    } else if (staticValue === '3') {
      return moment()
        .add(1, unit)
        .format(item.type === 15 ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss');
    }
  }

  // 时间(此刻)
  if (item.type === 46 && staticValue === '2') {
    return formatTimeValue(item, true);
  }

  // 人员 || 部门
  if (_.includes([26, 27, 48], item.type)) {
    const value = safeParse(staticValue);

    if (value.accountId === 'user-self') {
      if (window.isPublicWorksheet) return '';
      if ((item.advancedSetting || {}).usertype === '2' && !md.global.Account.isPortal) return '';
      const obj = _.pick(_.get(md, ['global', 'Account']), ['accountId', 'fullname', 'avatarMiddle']);
      if (_.isEmpty(obj)) return '';
      return { ...obj, avatar: obj.avatarMiddle, name: obj.fullname };
    }
    return _.isEmpty(value) ? '' : value;
  }

  // 关联表、级联
  if (_.includes([29, 35], item.type)) {
    const titleControl = _.find(_.get(item, 'relationControls'), i => i.attribute === 1);
    const isCascaderAllPath = item.type === 35 && _.get(item, 'advancedSetting.allpath') === '1';
    staticValue = safeParse(staticValue)[0];
    const name =
      safeParse(staticValue).name ||
      (isCascaderAllPath
        ? safeParse(_.get(safeParse(staticValue), 'path') || '[]').join(' / ')
        : titleControl
        ? renderCellText({ ...titleControl, value: safeParse(staticValue)[titleControl.controlId] }) || _l('未命名')
        : undefined);
    return JSON.stringify([
      {
        sourcevalue: staticValue,
        type: 8,
        sid: safeParse(staticValue).rowid,
        name: name,
      },
    ]);
  }
  // 子表
  if (item.type === 34) {
    let parsedValue;
    try {
      parsedValue = safeParse(staticValue);
      return JSON.stringify(parsedValue.map(r => ({ ...r, initRowIsCreate: false })));
    } catch (err) {}
  }

  return staticValue;
};

// 获取动态默认值
export const getDynamicValue = (data, currentItem, masterData, embedData) => {
  if (currentItem.isQueryWorksheetFill && !checkCellIsEmpty(currentItem.value)) {
    return currentItem.value;
  }
  let value = safeParse(currentItem.advancedSetting.defsource).map(item => {
    if (item.isAsync) return '';

    // 关联他表字段
    if (item.rcid) {
      try {
        if (masterData && item.rcid === masterData.worksheetId) {
          const targetControl = _.find(masterData.formData, c => c.controlId === item.cid);

          if (_.includes([15, 16], currentItem.type)) {
            return targetControl.value
              ? moment(targetControl.value).format(item.type === 15 ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss')
              : '';
          }

          if (currentItem.type === 46) {
            return formatTimeValue(currentItem, false, targetControl.value);
          }

          //文本类控件(默认值为选项、成员、部门等异化)
          if (_.includes([2], currentItem.type)) {
            return getCurrentValue(targetControl, targetControl.value, currentItem);
          }

          return getControlValue(masterData.formData, currentItem, item.cid);
        }
        const parentControl = _.find(data, c => c.controlId === item.rcid);
        const control = safeParse(parentControl.value || '[]')[0];
        const sourcevalue = control && safeParse(control.sourcevalue)[item.cid];

        if (_.includes([15, 16], currentItem.type) && _.includes(['ctime', 'utime'], item.cid)) {
          return (sourcevalue ? moment(sourcevalue) : moment()).format(
            item.type === 15 ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss',
          );
        }

        if (currentItem.type === 46) {
          return formatTimeValue(currentItem, _.includes(['ctime', 'utime'], item.cid), sourcevalue);
        }

        // 关联表
        if (_.includes([29, 35], currentItem.type)) {
          try {
            return JSON.stringify(safeParse(sourcevalue).filter(r => r.sid));
          } catch (err) {
            return '';
          }
        }

        // 数值类控件
        if (
          _.includes([6, 8, 28, 31], currentItem.type) ||
          (currentItem.type === 38 && currentItem.enumDefault === 2)
        ) {
          try {
            let cValue = 0;
            const { options, enumDefault } = _.find(parentControl.relationControls, o => o.controlId === item.cid);

            safeParse(sourcevalue).forEach(key => {
              cValue += !!enumDefault ? options.find(o => o.key === key).score : 0;
            });

            return cValue;
          } catch (err) {
            return sourcevalue;
          }
        }

        //文本类控件(默认值为选项、成员、部门等异化)
        if (_.includes([2, 41], currentItem.type)) {
          let currentControl = _.find(parentControl.relationControls || [], re => re.controlId === item.cid);
          if (!currentControl) {
            if (_.includes(['ownerid', 'caid', 'uaid', 'wfcuaids', 'wfcaid'], item.cid)) {
              currentControl = { type: 26 };
            } else if (_.includes(['wfstatus'], item.cid)) {
              currentControl = { type: 11, controlId: 'wfstatus' };
            }
          }
          return getCurrentValue(currentControl, sourcevalue, currentItem);
        }

        // 选项处理
        if (_.includes([9, 10, 11], currentItem.type)) {
          return getControlValue(parentControl.relationControls || [], currentItem, item.cid, sourcevalue);
        }

        return sourcevalue;
      } catch (err) {
        return '';
      }
    }

    // 当前行记录字段
    if (item.cid) {
      if (
        _.includes(
          [
            'userId',
            'phone',
            'email',
            'language',
            'projectId',
            'appId',
            'groupId',
            'worksheetId',
            'viewId',
            'recordId',
            'ua',
            'timestamp',
          ],
          item.cid,
        )
      ) {
        return getEmbedValue(embedData, item.cid);
      }

      const currentTargetControl = _.find(data, i => i.controlId === item.cid);

      if (
        currentItem.type === 26 &&
        _.includes(['caid', 'user-self'], item.cid) &&
        !(window.isPublicWorksheet && window.publicWorksheetShareId)
      ) {
        if (item.cid === 'caid' && (embedData || {}).recordId) {
          const userValue = _.get(currentTargetControl, 'value');
          return safeParse(userValue || '[]')[0] || '';
        }
        const obj = _.pick(_.get(md, ['global', 'Account']), ['accountId', 'fullname', 'avatarMiddle']);
        if (_.isEmpty(obj)) return '';
        return { ...obj, avatar: obj.avatarMiddle, name: obj.fullname };
      }
      if (_.includes([15, 16], currentItem.type) && item.cid === 'ctime') {
        return moment().format(item.type === 15 ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss');
      }

      if (currentItem.type === 46) {
        return formatTimeValue(currentItem, item.cid === 'ctime', _.get(currentTargetControl, 'value'));
      }

      //文本类控件、嵌入控件(默认值为选项、成员、部门等多异化)
      if (_.includes([2, 41], currentItem.type) || (currentItem.type === 45 && currentItem.enumDefault === 1)) {
        return getCurrentValue(currentTargetControl, (currentTargetControl || {}).value, currentItem);
      }

      return getControlValue(data, currentItem, item.cid);
    }

    if (item.staticValue) {
      return parseStaticValue(currentItem, item.staticValue);
    }

    return '';
  });

  if (_.includes([9, 10, 11, 26, 27, 29, 48], currentItem.type)) {
    let source = [];

    _.remove(value, o => !o);

    // 合并成新的一维数组
    value.forEach(obj => {
      if (typeof obj === 'string' && /[\{|\[]/.test(obj)) {
        if (_.isArray(safeParse(obj))) {
          source = source.concat(safeParse(obj));
        } else {
          source.push(safeParse(obj));
        }
      } else {
        source.push(obj);
      }
    });

    // 筛选出不重复的用户
    if (currentItem.type === 26) {
      source = _.uniqBy(source, user => user.accountId);
    } else if (
      currentItem.type === 29 &&
      currentItem.enumDefault === 2 &&
      _.get(currentItem, 'advancedSetting.showtype') === String(RELATE_RECORD_SHOW_TYPE.CARD)
    ) {
      source = source.filter(r => _.isObject(r)).map(r => ({ ...r, isNew: true, isFromDefault: true }));
    } else {
      source = _.uniqBy(source);
    }

    // 选项已删除的校验
    if (_.includes([9, 10, 11], currentItem.type)) {
      source = source.filter(s => _.find(currentItem.options, c => s.includes(c.key) && !c.isDeleted));
    }

    value = JSON.stringify(source);
  } else {
    value = value.join('');
  }

  return value;
};

// 获取他表字段的值
const getOtherWorksheetFieldValue = ({ data, dataSource, sourceControlId }) => {
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
    return '';
  }
};

// 处理公式
const parseNewFormula = (data, currentItem = {}) => {
  const { dot = 2 } = currentItem;
  const nullzero = _.includes([2, 3, 6], currentItem.enumDefault)
    ? '1'
    : _.get(currentItem, 'advancedSetting.nullzero') || '0';
  const isPercent = _.get(currentItem, 'advancedSetting.numshow') === '1';
  let columnIsUndefined;

  const formulaStr = currentItem.dataSource
    .replace(/cSUM/gi, 'SUM')
    .replace(/cAVG/gi, 'AVERAGE')
    .replace(/cMIN/gi, 'MIN')
    .replace(/cMAX/gi, 'MAX')
    .replace(/cPRODUCT/gi, 'PRODUCT')
    .replace(/cCOUNTA/gi, 'COUNTA')
    .replace(/cABS/gi, 'ABS')
    .replace(/cINT/gi, 'INT')
    .replace(/cMOD/gi, 'MOD')
    .replace(/cROUND/gi, 'ROUND')
    .replace(/cROUNDUP/gi, 'ROUNDUP')
    .replace(/cROUNDDOWN/gi, 'ROUNDDOWN');

  const expression = formulaStr.replace(/\$.+?\$/g, matched => {
    const controlId = matched.match(/\$(.+?)\$/)[1];
    let column = Object.assign(
      {},
      _.find(data, obj => obj.controlId === controlId),
    );

    if (!column) {
      columnIsUndefined = true;
      return undefined;
    }

    if (_.includes([9, 10, 11], column.type)) {
      const optionValue = getControlValue(data, { type: 31 }, controlId);
      return nullzero === '1' && optionValue === '' ? 0 : optionValue;
    }

    // 汇总字段默认按 0 处理
    if (_.isUndefined(column.value) && column.type === 37 && column.enumDefault2 === 6) {
      column.value = 0;
    }

    if ((_.isUndefined(column.value) || column.value === '') && nullzero !== '1') {
      columnIsUndefined = true;
    }

    // 不存在按0处理
    if (nullzero === '1' && !column.value) {
      column.value = '0';
    }

    return _.find([6, 8, 28, 31, 37], c => c === column.type || c === column.sourceControlType)
      ? column.value
      : formatColumnToText(column, true, true);
  });
  const parser = new Parser();
  parser.setFunction('MOD', function (params) {
    return params[0] % params[1];
  });
  const result = parser.parse(expression);
  return columnIsUndefined
    ? { columnIsUndefined }
    : {
        result:
          typeof result.result === 'number'
            ? parseFloat(
                handleDotAndRound(
                  {
                    ...currentItem,
                    dot: isPercent ? dot + 2 : dot,
                  },
                  toFixed(result.result, dot + 4),
                  false,
                ),
              )
            : null,
      };
};

// 函数处理
export function calcDefaultValueFunction({ formData, fnControl, forceSyncRun }) {
  let expression = _.get(safeParse(fnControl.advancedSetting.defaultfunc), 'expression');
  if (!expression) {
    return '';
  }
  const result = execValueFunction(fnControl, formData, { forceSyncRun });
  if (result.error) {
    console.log(result);
  } else {
    return String(_.isUndefined(result.value) ? '' : result.value);
  }
}

function asyncUpdateMdFunction({ formData, fnControl, update }) {
  try {
    execValueFunction(fnControl, formData, { update });
  } catch (err) {}
}

// 嵌入字段处理
const parseValueIframe = (data, currentItem, masterData, embedData) => {
  return getDynamicValue(
    data,
    {
      ...currentItem,
      advancedSetting: {
        ...currentItem.advancedSetting,
        defsource: JSON.stringify(transferValue(currentItem.dataSource)),
      },
    },
    masterData,
    embedData,
  );
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

// 处理日期公式
const parseDateFormula = (data, currentItem, recordCreateTime) => {
  const roundType = currentItem.advancedSetting.roundtype || '0';
  const getTime = (str, pos) => {
    if (str === '$ctime$') {
      return recordCreateTime || new Date();
    } else if (str === '$utime$') {
      return new Date();
    } else if (/^\$[a-z0-9]{24}\$$/.test(str)) {
      const column = _.find(data, item => item.controlId === str.slice(1, -1));
      if (!column) {
        return;
      } else {
        let timestr;
        if (_.includes([15, 16, 46, 30], column.type)) {
          timestr = column.value;
        }
        if (column.type === 29) {
          timestr = _.get(safeParse(column.value), '0.name');
        }
        if (!timestr) {
          return;
        }
        if (column.type === 15 || (column.type === 30 && column.sourceControlType === 15)) {
          if (pos === 'start') {
            timestr = moment(timestr).set({
              hour: 0,
              minute: 0,
              second: 0,
              millisecond: 0,
            });
          } else {
            timestr = moment(timestr).set({
              hour: currentItem.strDefault === '1' ? 24 : 0,
              minute: 0,
              second: 0,
              millisecond: 0,
            });
          }
        } else if (column.type === 46) {
          timestr = moment('2000/1/1 ' + timestr);
        }
        return timestr;
      }
    } else if (moment.isDate(new Date(str))) {
      return str;
    } else {
      return;
    }
  };
  let value = '';

  if (currentItem.enumDefault === 1) {
    let startTime = getTime(currentItem.sourceControlId, 'start');
    let endTime = getTime(currentItem.dataSource, 'end');
    const startControl = _.find(data, item => item.controlId === currentItem.sourceControlId.slice(1, -1)) || {};
    const endControl = _.find(data, item => item.controlId === currentItem.dataSource.slice(1, -1)) || {};
    if (startControl.type === 46 && endControl.type !== 46) {
      startTime = moment(endTime).format('YYYY-MM-DD') + moment(startTime).format(' HH:mm:ss');
    } else if (endControl.type === 46 && startControl.type !== 46) {
      endTime = moment(startTime).format('YYYY-MM-DD') + moment(endTime).format(' HH:mm:ss');
    }
    const weekday = currentItem.advancedSetting.weekday || '1234567';
    const unit = parseInt(currentItem.unit);

    if (!startTime || !endTime) {
      return;
    }

    // 天、时、分 工作日的逻辑
    if (unit < 4 && weekday.length < 7) {
      // 是否负数
      const isNegative = moment(endTime) < moment(startTime) ? -1 : 1;

      if (isNegative < 0) {
        [endTime, startTime] = [startTime, endTime];
      }

      // 相差天数
      let timeDiff = moment(moment(endTime).format('YYYY-MM-DD')).diff(moment(startTime).format('YYYY-MM-DD'), 'd');

      // 计算出整数周
      const weekendCount = Math.floor(timeDiff / 7);

      if (weekendCount) {
        switch (unit) {
          case 1:
            value = weekendCount * weekday.length * 24 * 60;
            break;
          case 2:
            value = weekendCount * weekday.length * 24;
            break;
          case 3:
            value = weekendCount * weekday.length;
            break;
        }
      }

      let weekDayHour = 0;
      for (let i = 0; i <= timeDiff % 7; i++) {
        const newStart = moment(startTime).add(i, 'd');
        const day = newStart.day();

        if (_.includes(weekday.split(''), (day === 0 ? 7 : day).toString())) {
          // 是同一天
          if (moment(startTime).isSame(endTime, 'd')) {
            value = moment(endTime).diff(startTime, TIME_UNIT[currentItem.unit] || 'm', true);
          } else {
            if (i !== timeDiff % 7) {
              weekDayHour += moment(moment(newStart).add(1, 'd').format('YYYY-MM-DD')).diff(
                i === 0 ? newStart : newStart.format('YYYY-MM-DD'),
                TIME_UNIT[currentItem.unit] || 'm',
                true,
              );
            } else {
              weekDayHour += moment(newStart.format('YYYY-MM-DD') + moment(endTime).format(' HH:mm')).diff(
                moment(newStart).format('YYYY-MM-DD'),
                TIME_UNIT[currentItem.unit] || 'm',
                true,
              );
            }
          }
        }
      }

      value = (value + weekDayHour) * isNegative;
    } else {
      value = moment(endTime).diff(startTime, TIME_UNIT[currentItem.unit] || 'm', true);
    }
    value = handleDotAndRound(currentItem, value);
  } else if (currentItem.enumDefault === 2) {
    let dateColumnType = 0;
    let formatMode = 'YYYY-MM-DD HH:mm:ss';
    let formulaResult;
    let date;
    let hasUndefinedColumn;
    if (!currentItem.sourceControlId) {
      return;
    } else if (/^\$[a-z0-9]{24}\$$/.test(currentItem.sourceControlId)) {
      const column = _.find(data, item => item.controlId === currentItem.sourceControlId.slice(1, -1));
      if (!column) {
        return;
      } else {
        dateColumnType = column.type;
        try {
          formatMode = getShowFormat(column);
        } catch (err) {}
        date = formatColumnToText(column, true, true, { doNotHandleTimeZone: true });
      }
    } else if (currentItem.sourceControlId === '$ctime$') {
      date = recordCreateTime || new Date();
    } else if (currentItem.sourceControlId === '$utime$') {
      date = new Date();
    } else if (moment.isDate(new Date(currentItem.sourceControlId))) {
      date = currentItem.sourceControlId;
    } else {
      return;
    }
    const expression = currentItem.dataSource.replace(/\$.+?\$/g, matched => {
      const matchedControlId = matched.match(/\$(.+?)\$/)[1];
      const matchedColumn = _.find(data, item => item.controlId === matchedControlId);

      if (!matchedColumn) {
        hasUndefinedColumn = true;
        return undefined;
      }

      if (_.includes([9, 10, 11], matchedColumn.type)) {
        return getControlValue(data, currentItem, matchedControlId);
      }

      if (matchedColumn.type === 46) {
        const [h, m, s] = moment(matchedColumn.value, 'HH:mm:ss').format('HH:mm:ss').split(':').map(Number);
        return `${h}h+${m}m+${s}s`;
      }

      if (_.isUndefined(matchedColumn.value) || matchedColumn.value === '') {
        hasUndefinedColumn = true;
      }

      return parseFloat(formatColumnToText(matchedColumn, true, true), 10);
    });
    formulaResult = hasUndefinedColumn ? {} : calcDate(date ? moment(date, formatMode) : '', expression);
    value = formulaResult.error || hasUndefinedColumn ? '' : formulaResult.result.format('YYYY-MM-DD HH:mm:ss');
  } else if (currentItem.enumDefault === 3) {
    const unit = TIME_UNIT[currentItem.unit] || 'd';
    let today = moment();
    let time = moment(getTime(currentItem.sourceControlId, 'start'));
    if (!today || !time) {
      return;
    }
    if (
      currentItem.advancedSetting.dateformulatype === '1' ||
      _.isUndefined(currentItem.advancedSetting.dateformulatype)
    ) {
      value = String(moment(time).diff(today, unit, true));
    } else {
      value = String(moment(today).diff(time, unit, true));
    }
    value = handleDotAndRound(currentItem, value);
  }

  return value;
};

// 获取控件的值（处理特殊选项控件）
// objValue是外层新值，覆盖obj.value
const getControlValue = (data, currentItem, controlId, objValue) => {
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
      cValue += key.indexOf('add_') > -1 || !obj.enumDefault ? 0 : obj.options.find(o => o.key === key).score;
    });

    return cValue;
  }

  return _.isUndefined(value) ? '' : value;
};

// 检测必填
export const checkRequired = item => {
  let errorType = '';

  if (
    item.required &&
    ((!_.includes([6, 8], item.type) ? !item.value : isNaN(parseFloat(item.value))) ||
      (_.isString(item.value) && !item.value.trim()) ||
      (_.includes([9, 10, 11], item.type) && !safeParse(item.value).length) ||
      (item.type === 14 &&
        ((_.isArray(safeParse(item.value)) && !safeParse(item.value).length) ||
          (!_.isArray(safeParse(item.value)) &&
            !safeParse(item.value).attachments.length &&
            !safeParse(item.value).knowledgeAtts.length &&
            !safeParse(item.value).attachmentData.length))) ||
      (_.includes([21, 26, 27, 29, 35, 48], item.type) &&
        _.isArray(safeParse(item.value)) &&
        !safeParse(item.value).length) ||
      (item.type === 29 &&
        typeof item.value === 'string' &&
        (item.value.startsWith('deleteRowIds') || item.value === '0')) ||
      (item.type === 34 &&
        ((item.value.rows && !filterEmptyChildTableRows(item.value.rows).length) || item.value === '0')) ||
      (item.type === 36 && item.value === '0') ||
      (item.type === 28 && parseFloat(item.value) === 0))
  ) {
    errorType = FORM_ERROR_TYPE.REQUIRED;
  }

  return errorType;
};

// 验证必填及格式
export const onValidator = ({ item, data, masterData, ignoreRequired, verifyAllControls }) => {
  let errorType = '';
  let errorText = '';

  if (!item.hidden && (!item.disabled || verifyAllControls)) {
    errorType = checkRequired(item);

    if (!errorType) {
      const value = (item.value || '').toString().trim();

      // 手机
      if (item.type === 3) {
        const iti = initIntlTelInput();
        iti.setNumber(value);
        // 香港6262开头不识别特殊处理
        // 中国电话特殊处理
        errorType =
          !value ||
          (iti.isValidNumber() && _.get(iti.getSelectedCountryData(), 'dialCode') === '86'
            ? specialTelVerify(_.startsWith(value, '+86') ? value : '+86' + value)
            : iti.isValidNumber() || specialTelVerify(value))
            ? ''
            : FORM_ERROR_TYPE.MOBILE_PHONE;
      }

      // 座机
      if (item.type === 4) {
        errorType = !value || Validator.isTelPhoneNumber(value) ? '' : FORM_ERROR_TYPE.TEL_PHONE;
      }

      // 邮箱
      if (item.type === 5) {
        errorType = !value || Validator.isEmailAddress(value) ? '' : FORM_ERROR_TYPE.EMAIL;
      }

      // 证件
      if (item.type === 7) {
        if (!value) {
          errorType = '';
        } else if (item.enumDefault === 1 && !Validator.isIdCardNumber(value)) {
          errorType = FORM_ERROR_TYPE.ID_CARD;
        } else if (item.enumDefault === 2 && !Validator.isPassportNumber(value)) {
          errorType = FORM_ERROR_TYPE.PASSPORT;
        } else if (item.enumDefault === 3 && !Validator.isHkPassportNumber(value)) {
          errorType = FORM_ERROR_TYPE.HK_PASSPORT;
        } else if (item.enumDefault === 4 && !Validator.isTwPassportNumber(value)) {
          errorType = FORM_ERROR_TYPE.TW_PASSPORT;
        }
      }

      // 文本
      if (item.type === 2) {
        if (item.advancedSetting && item.advancedSetting.filterregex) {
          const error = checkValueByFilterRegex(item, value, data);
          if (error) {
            errorType = FORM_ERROR_TYPE.CUSTOM;
            errorText = error;
          }
        }
        if (!errorType) {
          errorType = getRangeErrorType(item);
        }
      }

      if (_.includes([6, 8, 10], item.type)) {
        errorType = getRangeErrorType(item);
      }

      // 日期 || 日期时间
      if (_.includes([15, 16], item.type)) {
        const allowweek = item.advancedSetting.allowweek || '1234567';
        const allowtime = item.advancedSetting.allowtime || '00:00-24:00';
        const min = item.advancedSetting.min;
        const max = item.advancedSetting.max;
        const [start, end] = allowtime.split('-');

        if (!value) {
          errorType = '';
        } else {
          if (min || max) {
            const minDate = min
              ? getDynamicValue(data, Object.assign({}, item, { advancedSetting: { defsource: min } }), masterData)
              : '';
            const maxDate = max
              ? getDynamicValue(data, Object.assign({}, item, { advancedSetting: { defsource: max } }), masterData)
              : '';

            if ((minDate && moment(value) < moment(minDate)) || (maxDate && moment(value) > moment(maxDate))) {
              errorType = FORM_ERROR_TYPE.DATE_TIME_RANGE;
              errorText = FORM_ERROR_TYPE_TEXT.DATE_TIME_RANGE(value, minDate, maxDate);
            }
          }
          if (allowweek.indexOf(moment(value).day() === 0 ? '7' : moment(value).day()) === -1 && !errorType) {
            errorType = FORM_ERROR_TYPE.DATE;
          }
          if (
            !errorType &&
            (compareWithTime(start, `${moment(value).hour()}:${moment(value).minute()}`, 'isAfter') ||
              compareWithTime(end, `${moment(value).hour()}:${moment(value).minute()}`, 'isBefore'))
          ) {
            errorType = FORM_ERROR_TYPE.DATE_TIME;
          }
        }
      }

      // 时间
      if (item.type === 46) {
        const min = item.advancedSetting.min;
        const max = item.advancedSetting.max;

        if (!value) {
          errorType = '';
        } else if (min || max) {
          const minDate = min
            ? getDynamicValue(data, Object.assign({}, item, { advancedSetting: { defsource: min } }), masterData)
            : '';
          const maxDate = max
            ? getDynamicValue(data, Object.assign({}, item, { advancedSetting: { defsource: max } }), masterData)
            : '';

          if (
            (minDate && compareWithTime(value, minDate, 'isBefore')) ||
            (maxDate && compareWithTime(value, maxDate, 'isAfter'))
          ) {
            errorType = FORM_ERROR_TYPE.DATE_TIME_RANGE;
            errorText = FORM_ERROR_TYPE_TEXT.DATE_TIME_RANGE(value, minDate, maxDate, true);
          }
        }
      }

      // 其他选项必填
      if (_.includes([9, 10, 11], item.type) && !ignoreRequired) {
        const hasOtherOption = _.find(item.options, i => i.key === 'other' && !i.isDeleted);
        const selectOther = /^\[.*\]$/.test(item.value)
          ? _.find(safeParse(item.value || '[]'), i => (i || '').includes('other'))
          : false;
        if (
          hasOtherOption &&
          _.get(item.advancedSetting, 'otherrequired') === '1' &&
          selectOther &&
          !(item.isSubList && item.type === 10)
        ) {
          if (selectOther === 'other' || !_.replace(selectOther, 'other:', '')) {
            errorType = FORM_ERROR_TYPE.OTHER_REQUIRED;
            errorText = FORM_ERROR_TYPE_TEXT.OTHER_REQUIRED(item);
          }
        }
      }
    }

    if (isRelateRecordTableControl(item, { ignoreInFormTable: true })) {
      errorType = '';
    }

    if (item.type === 51) {
      errorType = '';
    }

    if (item.type === 34) {
      const { min, max, enablelimit } = item.advancedSetting;
      if (String(enablelimit) === '1') {
        const rowsLength = Number(
          (_.get(item, 'value.rows') && filterEmptyChildTableRows(item.value.rows).length) ||
            (!_.isObject(item.value) ? item.value : 0) ||
            0,
        );
        if (_.isNumber(rowsLength) && !_.isNaN(rowsLength)) {
          if (_.isNumber(Number(min)) && !_.isNaN(Number(min)) && rowsLength < Number(min)) {
            errorType = FORM_ERROR_TYPE.CHILD_TABLE_ROWS_LIMIT;
          } else if (_.isNumber(Number(max)) && !_.isNaN(Number(max)) && rowsLength > Number(max)) {
            errorType = FORM_ERROR_TYPE.CHILD_TABLE_ROWS_LIMIT;
          }
        }
      }
    }
  }

  if (errorType && !errorText) {
    errorText =
      typeof FORM_ERROR_TYPE_TEXT[errorType] !== 'string'
        ? FORM_ERROR_TYPE_TEXT[errorType](item)
        : FORM_ERROR_TYPE_TEXT[errorType];
  }

  return { errorType, errorText };
};

/**
 * 自定义字段数据格式化
 * @param {string} projectId 网络id
 * @param {[]} data 数据源
 * @param {[]} rules 业务规则
 * @param {boolean} isCreate 是否创建
 * @param {boolean} disabled 是否全部禁用
 * @param {boolean} ignoreLock 去除锁定
 * @param {boolean} ignoreRequired 去除其他选项的必填
 * @param {boolean} verifyAllControls 验证所有可见控件
 * @param {string} recordCreateTime 记录创建时间，编辑的时候会用到
 * @param {string} masterRecordRowId 主记录的id 编辑时用的
 * @param {[]} masterData 主记录的数据源
 * @param {number} from 来源参考config.js中的FROM
 * @param {[]} searchConfig 查询的配置
 * @param {object} embedData 嵌入参数
 * @param {function} onAsyncChange 异步更新
 * @param {function} updateLoadingItems 异步更新的控件更新父级 子表用
 * @param {function} activeTrigger 主动触发保存 汇总字段这类引起的
 */
export default class DataFormat {
  constructor({
    projectId = '',
    isCharge,
    appId,
    worksheetId,
    recordId,
    instanceId,
    workId,
    setSubListStore,
    requestPool,
    abortController,
    data = [],
    rules = [],
    forceSync = false,
    isCreate = false,
    disabled = false,
    ignoreLock = false,
    ignoreRequired = false,
    verifyAllControls = false,
    recordCreateTime = '',
    masterRecordRowId = '',
    masterData,
    from = FROM.DEFAULT,
    storeCenter,
    loadRowsWhenChildTableStoreCreated = false,
    searchConfig = [],
    embedData = {},
    onAsyncChange = () => {},
    updateLoadingItems = () => {},
    activeTrigger = () => {},
  }) {
    this.abortController = abortController;
    this.disabled = disabled;
    this.isCharge = isCharge;
    this.appId = appId;
    this.projectId = projectId;
    this.worksheetId = worksheetId;
    this.recordId = recordId;
    this.instanceId = instanceId;
    this.workId = workId;
    this.masterRecordRowId = masterRecordRowId;
    this.data = _.cloneDeep(data).map(c => ({ ...c, store: undefined }));
    this.masterData = masterData;
    this.embedData = embedData;
    this.loadingInfo = {};
    this.controlIds = [];
    this.ruleControlIds = [];
    this.errorItems = [];
    this.recordCreateTime = recordCreateTime;
    this.from = from;
    this.searchConfig = searchConfig;
    this.onAsyncChange = onAsyncChange;
    this.updateLoadingItems = updateLoadingItems;
    this.activeTrigger = activeTrigger;
    this.loopList = [];
    this.isMobile = browserIsMobile();
    this.loadRowsWhenChildTableStoreCreated = loadRowsWhenChildTableStoreCreated;

    this.requestPool = requestPool || createRequestPool({ abortController });
    this.debounceMap = new Map();
    this.debounceByKey = (fn, wait) => {
      const { debounceMap } = this;
      return function (key, ...args) {
        if (!debounceMap.has(key)) {
          debounceMap.set(
            key,
            _.debounce((resolve, ...args) => resolve(fn(...args)), wait),
          );
        }
        const debouncedFn = debounceMap.get(key);

        return new Promise(resolve => {
          debouncedFn(resolve, ...args);
        });
      };
    };
    this.debounceGetFilterRowsData = this.debounceByKey(this.getFilterRowsData, 100);
    const departmentIds = [];
    const locationIds = [];
    const organizeIds = [];
    const isInit = true;
    this.storeCenter = storeCenter || {};

    const initStore = () => {
      this.data.forEach(item => {
        if (item.hidden) return;

        if (item.type === 53 && item.dataSource) {
          item.advancedSetting = { ...item.advancedSetting, defaultfunc: item.dataSource, defaulttype: '1' };
        }

        if (item.storeFromDefault) {
          item.store = item.storeFromDefault;
          delete item.storeFromDefault;
        } else if (item.type === 34 && setSubListStore && !item.store) {
          item.store = this.getControlStore(item);
        } else if (
          !this.isMobile &&
          item.type === 29 &&
          includes(['2', '5', '6'], get(item, 'advancedSetting.showtype')) &&
          !item.store
        ) {
          item.store = this.getControlStore(item);
        }
      });
    };

    if (forceSync) {
      initStore();
    }

    // 新建初始化
    if (isCreate) {
      function isRelateRecordWithStaticValue(control) {
        return (
          control.type === 29 && (_.get(control, 'advancedSetting.defsource') || '').startsWith('[{"staticValue":')
        );
      }
      const dataForInit = this.data
        .filter(isRelateRecordWithStaticValue)
        .concat(this.data.filter(c => !isRelateRecordWithStaticValue(c)));
      dataForInit.forEach(item => {
        if (item.type === 53 && item.dataSource) {
          item.advancedSetting = { ...item.advancedSetting, defaultfunc: item.dataSource, defaulttype: '1' };
        }
        if (item.value) {
          this.updateDataSource({ controlId: item.controlId, value: item.value, notInsertControlIds: true, isInit });
        } else if (item.advancedSetting && item.advancedSetting.defaultfunc && item.type !== 30) {
          if (_.get(safeParse(item.advancedSetting.defaultfunc), 'type') === 'javascript') {
            asyncUpdateMdFunction({
              formData: this.data,
              fnControl: item,
              update: v => {
                this.updateDataSource({
                  controlId: item.controlId,
                  value: v,
                  isInit,
                });
                this.onAsyncChange({
                  controlId: item.controlId,
                  value: v,
                });
              },
            });
          } else {
            const value = calcDefaultValueFunction({
              formData: this.data,
              fnControl: item,
            });
            if (value) {
              this.updateDataSource({ controlId: item.controlId, value, isInit });
            }
          }
        } else if (item.advancedSetting && item.advancedSetting.defsource && item.type !== 30) {
          const value = getDynamicValue(this.data, item, this.masterData);
          if (this.isMobile && item.type === 29 && _.isString(value) && _.isEmpty(JSON.parse(value))) {
            this.updateDataSource({ controlId: item.controlId, value: null, isInit });
          } else if (value) {
            if (item.type === 29 && isRelateRecordTableControl(item) && !forceSync) {
              setTimeout(() => {
                this.updateDataSource({ controlId: item.controlId, value, isInit });
              }, 0);
            } else {
              this.updateDataSource({ controlId: item.controlId, value, isInit });
            }
          }
        } else if (
          item.type === 38 &&
          item.enumDefault === 3 &&
          item.sourceControlId &&
          item.sourceControlId[0] !== '$'
        ) {
          const unit = TIME_UNIT[item.unit] || 'd';
          const today = moment().startOf(unit);
          const time = moment(item.sourceControlId);
          if (item.advancedSetting.dateformulatype === '1' || _.isUndefined(item.advancedSetting.dateformulatype)) {
            item.value = String(Math.floor(moment(time).diff(today, unit)));
          } else {
            item.value = String(Math.floor(moment(today).diff(time, unit)));
          }
        }

        // 部门控件默认值当前用户
        if (item.type === 27 && item.advancedSetting.defsource) {
          safeParse(item.advancedSetting.defsource)
            .filter(obj => obj.isAsync && obj.staticValue)
            .forEach(obj => {
              // 当前用户所在的部门
              if (_.includes(['current', 'user-departments'], safeParse(obj.staticValue).departmentId)) {
                departmentIds.push(item.controlId);
              }
            });
        }

        // 组织角色控件默认值当前用户所在组织角色
        if (item.type === 48 && item.advancedSetting.defsource) {
          safeParse(item.advancedSetting.defsource)
            .filter(obj => obj.isAsync && obj.staticValue)
            .forEach(obj => {
              // 当前用户所在的部门
              if (_.includes(['current', 'user-role'], safeParse(obj.staticValue).organizeId)) {
                organizeIds.push(item.controlId);
              }
            });
        }

        // 定位控件默认选中当前位置
        if (item.type === 40 && item.advancedSetting.defsource) {
          if (_.get(safeParse(item.advancedSetting.defsource), '0.cid') === 'current-location') {
            locationIds.push(item.controlId);
          }
        }

        // 公式设置视为0配置
        if (item.type === 31 && item.advancedSetting && item.advancedSetting.nullzero === '1') {
          this.updateDataSource({ controlId: item.controlId, value: item.value, isInit });
        }
      });
    }

    // store 挂载
    if (!forceSync) {
      initStore();
    }

    if (!(isCreate || ignoreLock) && checkRuleLocked(rules, this.data, _.get(this.embedData, 'recordId'))) {
      disabled = true;
    }

    this.data.forEach(item => {
      item.advancedSetting = item.advancedSetting || {};
      item.dataSource = item.dataSource || '';
      item.disabled = (item.ignoreDisabled ? false : !!disabled) || item.disabled;
      item.fieldPermission = _.includes(SYSTEM_ENUM, item.controlId)
        ? '0' + (item.fieldPermission || '111').slice(-2)
        : item.fieldPermission;
      item.defaultState = {
        required: item.required,
        controlPermissions: item.controlPermissions,
        fieldPermission: item.fieldPermission,
        showControls: item.showControls,
      };
      (item.relationControls || []).forEach(c => {
        c.defaultState = {
          required: c.required,
          controlPermissions: c.controlPermissions,
          fieldPermission: c.fieldPermission,
        };
      });

      // 处理老数据关联列表去除必填
      if (item.type === 29 && item.advancedSetting.showtype === '2') {
        item.required = false;
      }

      // 备注控件处理数据
      if (item.type === 10010) {
        item.disabled = true;
        item.value = item.dataSource;
      }

      // 嵌入iframe
      if (item.type === 45) {
        if (item.enumDefault === 1 && item.dataSource) {
          item.value = parseValueIframe(this.data, item, this.masterData, this.embedData);
        }
      }

      // h5禁用自由链接
      if (item.type === 21 && this.isMobile) {
        item.disabled = true;
      }

      // 兼容老数据没有size的情况
      if (!item.size) {
        item.size = halfSwitchSize(item, from);
      }

      const { errorType, errorText } = onValidator({ item, data, masterData, ignoreRequired, verifyAllControls });

      if (errorType) {
        _.remove(this.errorItems, obj => obj.controlId === item.controlId);
        this.errorItems.push({
          controlId: item.controlId,
          errorType,
          errorText,
          showError: false,
        });
      }
    });

    // 获取当前用户所在的部门
    this.getCurrentDepartment(departmentIds);
    // 获取当前位置
    this.getCurrentLocation(locationIds);
    // 获取当前用户所在组织角色
    this.getCurrentOrgRole(organizeIds);

    //新建记录初始时,固定值全走
    if (this.searchConfig.length > 0 && isCreate) {
      this.updateDataBySearchConfigs({ searchType: 'init' });
    }
  }

  getControlStore(control) {
    const { appId, recordId, instanceId, workId, worksheetId, from, loadRowsWhenChildTableStoreCreated } = this;
    let store = this.storeCenter[control.controlId];
    if (store) {
      return store;
    }
    if (control.type === 34) {
      store = generateSubListStore(control, {
        from,
        isCharge: this.isCharge,
        appId,
        relationWorksheetId: worksheetId,
        recordId,
        instanceId,
        workId,
        masterData: {
          worksheetId,
          recordId,
          formData: this.data
            .map(c => _.pick(c, ['controlId', 'type', 'value', 'options', 'attribute', 'enumDefault']))
            .filter(c => !!c.value),
        },
      });
      if (loadRowsWhenChildTableStoreCreated) {
        store.initAndLoadRows({
          worksheetId: this.worksheetId,
          recordId,
          controlId: control.controlId,
        });
      }
    } else if (control.type === 29) {
      store = generateRelateRecordTableStore(control, {
        appId,
        from,
        isCharge: this.isCharge,
        recordId,
        allowEdit: !this.disabled,
        worksheetId,
        formData: this.data,
        instanceId,
        workId,
      });
    }
    // generateRelateRecordTableStore
    if (!store) {
      console.error('create store fail!');
      return;
    }
    this.storeCenter[control.controlId] = store;
    return store;
  }

  /**
   * 直接更新字段值，不触发任何其他逻辑
   */
  setControlItemValue(controlId, value) {
    const targetControl = find(this.data, { controlId });
    if (targetControl) {
      targetControl.value = value;
    }
  }

  /**
   * 更新数据
   */
  updateDataSource({
    controlId,
    value,
    notInsertControlIds = false,
    removeUniqueItem = () => {},
    data,
    isInit = false,
    searchByChange = false,
    ignoreSearch = false, // 禁止触发查询工作表
  }) {
    this.asyncControls = {};

    try {
      const updateSource = (controlId, value, currentSearchByChange, currentIgnoreSearch) => {
        this.data.forEach(item => {
          if (item.controlId === controlId) {
            // 子表被动赋值
            if (item.type === 34 && !item.isSubList && item.store) {
              let loading = true;
              try {
                loading = item.store.getState().baseLoading;
              } catch (err) {}
              const params = {
                recordId: this.recordId,
                masterData: {
                  worksheetId: this.worksheetId,
                  formData: this.data,
                },
                abortController: this.abortController,
              };
              if (_.get(value, 'action') === 'append') {
                params.staticRows = value.rows.filter(i => !i.rowid);
                params.type = 'append';
              } else if (_.get(value, 'action') === 'clearAndSet') {
                params.staticRows = value.rows;
                if (_.isEmpty(value.rows)) {
                  item.store.dispatch({
                    type: 'DELETE_ALL',
                  });
                }
                item.value = '';
              } else if (typeof value === 'string' && !_.isEmpty(safeParse(value))) {
                const parsedRows = safeParse(value);
                params.staticRows = parsedRows;
              }
              if (params.staticRows) {
                if (loading) {
                  item.store.waitList.push(() => {
                    setRowsFromStaticRows({
                      ...params,
                      triggerSubListControlValueChange: controlValue => {
                        this.updateDataSource({
                          controlId: item.controlId,
                          value: controlValue,
                        });
                        this.onAsyncChange({
                          controlId: item.controlId,
                          value: controlValue,
                        });
                      },
                    })(item.store.getState, item.store.dispatch);
                  });
                  if (!item.store.initialized) {
                    item.store.init();
                  }
                } else {
                  setRowsFromStaticRows(params)(item.store.getState, item.store.dispatch);
                }
                this.controlIds.push(controlId);
                return;
              }
            }
            // 表单内关联表格组件被动赋值
            if (
              !this.isMobile &&
              (!this.recordId || String(RELATE_RECORD_SHOW_TYPE.TABLE) === item.advancedSetting.showtype) &&
              item.type === 29 &&
              !item.isSubList &&
              includes(
                [
                  String(RELATE_RECORD_SHOW_TYPE.TABLE),
                  String(RELATE_RECORD_SHOW_TYPE.TAB_TABLE),
                  String(RELATE_RECORD_SHOW_TYPE.LIST),
                ],
                item.advancedSetting.showtype,
              )
            ) {
              if (String(value || '').startsWith('[')) {
                try {
                  const records = safeParse(value, 'array').filter(r => r.sid || r.sourcevalue);
                  item.store.dispatch({
                    type: 'DELETE_ALL',
                  });
                  item.store.dispatch({
                    type: 'APPEND_RECORDS',
                    recordId: this.recordId,
                    records: records.map(r => r.row || safeParse(r.sourcevalue)),
                  });
                  value = records.length || '';
                  item.store.dispatch({
                    type: 'UPDATE_TABLE_STATE',
                    value: { count: records.length },
                  });
                } catch (err) {
                  value = '';
                }
              } else if (value === 'deleteRowIds: all') {
                item.store.dispatch({
                  type: 'DELETE_ALL',
                });
                item.store.dispatch({
                  type: 'UPDATE_RECORDS',
                  records: [],
                });
                value = '';
              }
            }

            item.value = value;

            // 数值进度区间控制
            if (item.type === 6 && _.get(item, 'advancedSetting.showtype') === '2' && !isEmptyValue(value)) {
              const maxCount = parseFloat(_.get(item, 'advancedSetting.max') || 100);
              const minCount = parseFloat(_.get(item, 'advancedSetting.min') || 0);
              if (parseFloat(value || 0) < minCount) item.value = minCount;
              if (parseFloat(value || 0) > maxCount) item.value = maxCount;
            }

            // 成员控件
            if (item.type === 26 && value && item.advancedSetting.checkusertype === '1') {
              const filterValues = safeParse(value || '[]').filter((v = {}) => {
                const result = (v.accountId || '').startsWith('a#');
                return item.advancedSetting.usertype === '2' ? result : !result;
              });
              item.value = _.isEmpty(filterValues) ? '' : JSON.stringify(filterValues);
            }

            // 等级控件
            if (item.type === 28) {
              const maxCount = (item.advancedSetting || {}).max || (item.enumDefault === 1 ? 5 : 10);
              item.value = Math.min(parseInt(Number(value || 0)), maxCount);
            }

            // 定位各端统一保留6位小数
            if (item.type === 40 && value) {
              const locationValue = safeParse(value);
              item.value = JSON.stringify({
                ...locationValue,
                x: parseFloat(toFixed(locationValue.x, 6)),
                y: parseFloat(toFixed(locationValue.y, 6)),
              });
            }

            // 关联记录
            if (item.type === 29) {
              this.getCurrentRelateData(item);
            }

            // 日期
            if (_.includes([15, 16], item.type) && value) {
              const { formatMode } = getDatePickerConfigs(item);
              item.value = moment(value, formatMode).format(item.type === 15 ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss');
            }

            // 工作表查询
            const needSearch = this.getFilterConfigs(item, 'onBlur');
            if (!currentIgnoreSearch && (currentSearchByChange ? isUnTextWidget(item) : needSearch.length > 0)) {
              this.updateDataBySearchConfigs({ control: item, searchType: 'onBlur' });
            }

            // 字段被引用，限制输入格式重新校验
            this.checkFilterRegex(item);

            removeUniqueItem(controlId);
            _.remove(this.errorItems, obj => obj.controlId === item.controlId && !obj.errorMessage);

            const { errorType, errorText } = onValidator({
              item,
              data: this.data,
              masterData: this.masterData,
              verifyAllControls: this.from === 21 && !this.isMobile ? true : undefined,
            });

            if (errorType) {
              this.errorItems.push({
                controlId: item.controlId,
                errorType,
                errorText,
                showError: true,
              });
            }

            //规则变更id集合
            if (!_.includes(this.ruleControlIds, controlId) && !isInit) {
              this.ruleControlIds.push(controlId);
            }

            // 变更控件的id集合
            if (
              !_.includes([25, 30, 31, 32, 33], item.type) &&
              !_.includes(this.controlIds, controlId) &&
              !notInsertControlIds
            ) {
              this.controlIds.push(controlId);
              this.activeTrigger();
            }
          }
        });
      };
      const updateControlData = (controlId, data) => {
        this.data.forEach(item => {
          if (controlId === item.controlId) {
            item.data = data;
          }
        });
      };
      const depthUpdateData = (controlId, depth, value) => {
        const currentItem = _.find(this.data, item => item.controlId === controlId);
        let currentSearchByChange = depth === 0 ? searchByChange : false;
        let currentIgnoreSearch = depth === 0 ? ignoreSearch : false;
        // onChange主动更新，清空循环列表
        if (currentSearchByChange) {
          this.loopList = [];
        }

        // 最多递归5层
        if (depth > 5) {
          updateSource(controlId, '');
          return;
        }

        // 更新当前的控件值
        if (value === undefined) {
          //由默认值等引起的更新
          currentSearchByChange = false;
          currentIgnoreSearch = false;
          // 大写金额控件
          if (currentItem.type === 25) {
            value = nzh.cn
              .toMoney(_.find(this.data, item => item.controlId === currentItem.dataSource.slice(1, -1)).value || '')
              .substring(3);
          }

          // 他表字段
          if (currentItem.type === 30) {
            value = getOtherWorksheetFieldValue({
              data: this.data,
              dataSource: currentItem.dataSource,
              sourceControlId: currentItem.sourceControlId,
            });
          }

          // 公式控件
          if (currentItem.type === 31) {
            const formulaResult = parseNewFormula(this.data, currentItem);
            value = formulaResult.error || formulaResult.columnIsUndefined ? '' : formulaResult.result;
          }

          // 文本组合处理
          if (currentItem.type === 32) {
            value = currentItem.dataSource.replace(/\$.+?\$/g, matched => {
              const controlId = matched.match(/\$(.+?)\$/)[1];
              let singleControl = _.find(this.data, item => item.controlId === controlId);
              if (!singleControl && controlId === 'rowid') return this.recordId || '';

              if (!singleControl) {
                return '';
              }

              // 公式
              if (singleControl.type === 31) {
                let formulaResult = parseNewFormula(this.data, singleControl);
                if (formulaResult.columnIsUndefined) {
                  return '';
                }
                // 文本组合涉及百分比公式，特殊处理
                if (
                  singleControl.advancedSetting &&
                  singleControl.advancedSetting.numshow === '1' &&
                  formulaResult.result
                ) {
                  formulaResult.result = parseFloat(formulaResult.result) * 100;
                }
                return formulaResult.error || _.isNull(formulaResult.result)
                  ? ''
                  : `${formulaResult.result.toFixed(singleControl.dot)}${singleControl.unit}`;
              }

              return formatColumnToText(singleControl, true, true, { doNotHandleTimeZone: true });
            });
          }

          // 日期公式控件
          if (currentItem.type === 38) {
            value = parseDateFormula(this.data, currentItem, this.recordCreateTime);
          }

          // 动态默认值 函数
          if (currentItem.advancedSetting && currentItem.advancedSetting.defaultfunc && currentItem.type !== 30) {
            delete currentItem.advancedSetting.defsource;
            if (_.get(safeParse(currentItem.advancedSetting.defaultfunc), 'type') === 'javascript') {
              asyncUpdateMdFunction({
                formData: this.data,
                fnControl: currentItem,
                update: v => {
                  this.updateDataSource({
                    controlId: currentItem.controlId,
                    value: v,
                  });
                  this.onAsyncChange({
                    controlId: currentItem.controlId,
                    value: v,
                  });
                },
              });
              return;
            } else {
              value = calcDefaultValueFunction({
                formData: this.data,
                fnControl: currentItem,
              });
            }
          }

          // 动态默认值
          if (currentItem.advancedSetting && currentItem.advancedSetting.defsource && currentItem.type !== 30) {
            value = getDynamicValue(this.data, currentItem, this.masterData);
          }

          // 嵌入控件
          if (currentItem.type === 45) {
            if (currentItem.enumDefault === 1 && currentItem.dataSource) {
              value = parseValueIframe(this.data, currentItem, this.masterData, this.embedData);
            }
          }

          // 触发子表条码更新
          if (currentItem.type === 47 && currentItem.isSubList) {
            value = Math.random();
          }

          // 汇总
          if (currentItem.type === 37) {
            if (
              currentItem.advancedSetting &&
              currentItem.advancedSetting.filters &&
              currentItem.advancedSetting.filters !== '[]'
            ) {
              return;
            }
            const sourceSheetControl = _.find(
              this.data,
              item => item.controlId === currentItem.dataSource.slice(1, -1),
            );
            if (!sourceSheetControl) {
              return;
            }
            let records = [];
            try {
              if (sourceSheetControl.type === 29) {
                try {
                  if (sourceSheetControl.store) {
                    const state = sourceSheetControl.store.getState();
                    records = this.recordId
                      ? state.records.concat(get(state, 'changes.addedRecords') || [])
                      : state.records;
                  } else if (_.isArray(sourceSheetControl.value)) {
                    records = sourceSheetControl.value;
                  } else if (sourceSheetControl.data) {
                    records = sourceSheetControl.data;
                  } else {
                    let parsedValue = safeParse(sourceSheetControl.value);
                    if (_.isArray(parsedValue)) {
                      records = parsedValue;
                    }
                  }
                } catch (err) {}
              } else if (sourceSheetControl.type === 34) {
                if (sourceSheetControl.store) {
                  records = sourceSheetControl.store.getState().rows || [];
                } else {
                  records = sourceSheetControl.value.rows || [];
                }
                records = filterEmptyChildTableRows(records);
              }
            } catch (err) {
              console.error(err);
            }
            if (!currentItem.sourceControlId) {
              // 记录数量
              value = records.length;
            } else {
              const sourceControl = _.find(
                sourceSheetControl.relationControls,
                c => c.controlId === currentItem.sourceControlId,
              );
              if (sourceControl) {
                const valuesOfRecords = records.map(record => (record.row || record)[sourceControl.controlId]);
                const noUndefinedValues = valuesOfRecords.filter(value => !_.isUndefined(value));
                if (valuesOfRecords.length) {
                  const isDate =
                    _.includes([15, 16, 46], currentItem.type) ||
                    (currentItem.type === 37 && _.includes([15, 16, 46], currentItem.enumDefault2));
                  switch (currentItem.enumDefault) {
                    case 13: // 已填
                      value = valuesOfRecords.filter(c =>
                        sourceControl.type === 36 ? c === '1' : !checkCellIsEmpty(c),
                      ).length;
                      break;
                    case 14: // 未填
                      value = valuesOfRecords.filter(c =>
                        sourceControl.type === 36 ? c !== '1' : checkCellIsEmpty(c),
                      ).length;
                      break;
                    case 5: // 求和
                      value = _.sum(
                        valuesOfRecords
                          .map(v => v || 0)
                          .map(v =>
                            _.isNumber(parseFloat(v, 10)) && !_.isNaN(parseFloat(v, 10)) ? parseFloat(v, 10) : 0,
                          ),
                      );
                      value = handleDotAndRound(currentItem, value, false);
                      break;
                    case 1: // 平均
                      value =
                        _.sum(
                          noUndefinedValues.map(c =>
                            _.isNumber(parseFloat(c, 10)) && !_.isNaN(parseFloat(c, 10)) ? parseFloat(c, 10) : 0,
                          ),
                        ) / noUndefinedValues.length;
                      break;
                    case 2: // 最大 最晚
                      if (isDate) {
                        if (currentItem.enumDefault2 === 46) {
                          const maxDate = moment.max(
                            noUndefinedValues.filter(_.identity).map(c => moment(c, 'HH:mm:ss')),
                          );
                          value = formatTimeValue(currentItem, false, maxDate);
                        } else {
                          const maxDate = _.max(
                            noUndefinedValues.filter(_.identity).map(c => new Date(c || 0).getTime()),
                          );
                          const { formatMode, mode } = getDatePickerConfigs({
                            type: currentItem.enumDefault2,
                            advancedSetting: { showtype: currentItem.unit },
                          });
                          value = moment(maxDate).format(formatMode);
                        }
                      } else {
                        value = _.max(
                          noUndefinedValues.map(c =>
                            _.isNumber(parseFloat(c, 10)) && !_.isNaN(parseFloat(c, 10)) ? parseFloat(c, 10) : 0,
                          ),
                        );
                      }
                      break;
                    case 3: // 最小 最早
                      if (isDate) {
                        if (currentItem.enumDefault2 === 46) {
                          const minDate = moment.min(
                            noUndefinedValues.filter(_.identity).map(c => moment(c, 'HH:mm:ss')),
                          );
                          value = formatTimeValue(currentItem, false, minDate);
                        } else {
                          const minDate = _.min(
                            noUndefinedValues.filter(_.identity).map(c => new Date(c || 0).getTime()),
                          );
                          const { formatMode } = getDatePickerConfigs({
                            type: currentItem.enumDefault2,
                            advancedSetting: { showtype: currentItem.unit },
                          });
                          value = moment(minDate).format(formatMode);
                        }
                      } else {
                        value = _.min(
                          noUndefinedValues.map(c =>
                            _.isNumber(parseFloat(c, 10)) && !_.isNaN(parseFloat(c, 10)) ? parseFloat(c, 10) : 0,
                          ),
                        );
                      }
                      break;
                  }
                }
              }
            }
          }
        }

        updateSource(controlId, value, currentSearchByChange, currentIgnoreSearch);

        // 受影响的控件集合
        const effectControls = _.filter(
          this.data,
          item =>
            (item.dataSource || '').indexOf(controlId) > -1 ||
            (item.type === 38 && (item.sourceControlId || '').indexOf(controlId) > -1) ||
            (item.advancedSetting &&
              item.advancedSetting.defsource &&
              safeParse(item.advancedSetting.defsource).filter(
                obj => ((!obj.rcid && obj.cid === controlId) || (obj.rcid === controlId && obj.cid)) && !obj.isAsync,
              ).length) ||
            ((item.advancedSetting && _.get(safeParse(item.advancedSetting.defaultfunc), 'expression')) || '').indexOf(
              controlId,
            ) > -1 ||
            (item.type === 37 && controlId === (item.dataSource || '').slice(1, -1)),
        );

        // 受影响的异步更新控件集合
        if (!this.asyncControls[controlId]) {
          const ids = _.filter(
            this.data,
            item =>
              item.advancedSetting &&
              item.advancedSetting.defsource &&
              safeParse(item.advancedSetting.defsource).filter(
                obj => ((!obj.rcid && obj.cid === controlId) || (obj.rcid === controlId && obj.cid)) && obj.isAsync,
              ).length,
          );

          if (ids.length) {
            this.asyncControls[controlId] = ids;
          }
        }

        // 递归更新受影响的控件
        effectControls.forEach(({ controlId }) => {
          depthUpdateData(controlId, depth + 1);
        });
      };

      if (data) {
        updateControlData(controlId, data);
      }
      depthUpdateData(controlId, 0, value);
    } catch (err) {
      console.error('UpdateSource Error:', err);
      console.log('Error Control data:', controlId, value);
    }

    this.getAsyncData(isInit);
  }

  /**
   * 获取数据
   */
  getDataSource() {
    return this.data;
  }

  /**
   * 获取变更的控件的id集合
   */
  getUpdateControlIds() {
    return this.controlIds;
  }

  /**
   * 获取业务规则变更的控件的id集合
   */
  getUpdateRuleControlIds() {
    return this.ruleControlIds;
  }

  /**
   * 更新字段是否被文本输入格式筛选引用
   */
  checkFilterRegex(item) {
    this.data.forEach(i => {
      if (((i.type === 2 && i.advancedSetting && i.advancedSetting.filterregex) || '').indexOf(item.controlId) > -1) {
        const error = checkValueByFilterRegex(i, i.value, this.data);
        if (error) {
          _.remove(this.errorItems, e => e.controlId === i.controlId && e.errorType === FORM_ERROR_TYPE.CUSTOM);
          this.errorItems.push({
            controlId: i.controlId,
            errorType: FORM_ERROR_TYPE.CUSTOM,
            errorText: error,
            showError: true,
          });
        } else {
          this.errorItems = this.errorItems.filter(
            e => !(e.controlId === i.controlId && e.errorType === FORM_ERROR_TYPE.CUSTOM),
          );
        }
      }
    });
  }

  /**
   * 初始化查询接口引起业务规则错误
   */
  isInitSearch(controlId, isInit) {
    const effectBySearch = this.getFilterConfigs({}, 'init');
    return isInit
      ? !!_.find(effectBySearch, ef => ef.controlId === controlId) && !this.loadingInfo[controlId]
      : !isInit;
  }

  /**
   * 设置异常控件
   */
  setErrorControl(controlId, errorType, errorMessage, ruleItem = {}, isInit) {
    const saveIndex = _.findIndex(
      this.errorItems,
      e =>
        e.controlId === controlId &&
        e.errorType === errorType &&
        (ruleItem.ruleId ? e.ruleId === ruleItem.ruleId : true),
    );

    if (saveIndex > -1) {
      // 移除业务规则错误提示|必填错误
      if (!errorMessage) {
        this.errorItems.splice(saveIndex, 1);
      }
    } else {
      if (errorMessage && _.includes([FORM_ERROR_TYPE.RULE_REQUIRED, FORM_ERROR_TYPE.REQUIRED], errorType)) {
        this.errorItems.push({
          controlId,
          errorType,
          errorText: errorMessage,
          showError: false,
        });
      }

      if (this.isInitSearch(controlId, isInit) && errorMessage && errorType === FORM_ERROR_TYPE.RULE_ERROR) {
        this.errorItems.push({
          controlId,
          errorType,
          showError: ruleItem.hintType !== 1,
          errorMessage,
          ruleId: ruleItem.ruleId,
        });
      }
    }
  }

  /**
   * 获取异常控件
   */
  getErrorControls() {
    return this.errorItems;
  }

  /**
   * 设置控件loading状态
   */
  setLoadingInfo(controlIds, status) {
    (_.isArray(controlIds) ? controlIds : [controlIds]).map(controlId => {
      if (_.find(this.data, item => item.controlId === controlId)) {
        this.loadingInfo[controlId] = status;
      } else {
        // 子表内控件更新时，loading状态挂到父级
        const parentControl = _.find(this.data, item =>
          _.find(item.relationControls || [], i => i.controlId === controlId),
        );
        if (parentControl) {
          this.loadingInfo[parentControl.controlId] = status;
        }
      }
    });
    this.updateLoadingItems(this.loadingInfo);
  }

  /**
   * 获取当前用户所在的部门
   */
  getCurrentDepartment(ids) {
    if (
      !ids.length ||
      !md.global.Account.accountId ||
      window.isPublicWorksheet ||
      _.isEmpty(getCurrentProject(this.projectId))
    )
      return;

    this.setLoadingInfo(ids, true);

    departmentAjax
      .getDepartmentsByAccountId({
        projectId: this.projectId,
        accountIds: [md.global.Account.accountId],
        includePath: true,
      })
      .then(result => {
        this.setLoadingInfo(ids, false);

        const getDepartments = controlId => {
          const { enumDefault, advancedSetting: { allpath } = {} } =
            this.data.find(item => item.controlId === controlId) || {};
          let departments = [];
          result.maps.forEach(item => {
            item.departments.forEach(obj => {
              departments.push({
                departmentId: obj.id,
                departmentName: allpath === '1' ? obj.departmentPath : obj.name,
              });
            });
          });
          departments = _.uniqBy(departments, 'departmentId');
          return enumDefault === 0 ? JSON.stringify(departments.slice(0, 1)) : JSON.stringify(departments);
        };

        ids.forEach(controlId => {
          const value = getDepartments(controlId);

          this.updateDataSource({
            controlId,
            value,
            isInit: true,
          });

          this.onAsyncChange({
            controlId,
            value,
          });
        });
      })
      .finally(() => {
        this.setLoadingInfo(ids, false);
      });
  }

  /**
   * 获取当前用户所在的组织角色
   */
  getCurrentOrgRole(ids) {
    if (
      !ids.length ||
      !md.global.Account.accountId ||
      window.isPublicWorksheet ||
      _.isEmpty(getCurrentProject(this.projectId))
    )
      return;

    this.setLoadingInfo(ids, true);

    organizeAjax
      .getOrganizesByAccountId({ projectId: this.projectId, accountIds: [md.global.Account.accountId] })
      .then(result => {
        let organizes = [];
        this.setLoadingInfo(ids, false);

        result.maps.forEach(item => {
          item.organizes.forEach(obj => {
            organizes.push({
              organizeId: obj.id,
              organizeName: obj.name,
            });
          });
        });

        organizes = _.uniqBy(organizes, 'organizeId');

        ids.forEach(controlId => {
          const { enumDefault } = this.data.find(item => item.controlId === controlId) || {};
          const value = enumDefault === 0 ? JSON.stringify(organizes.slice(0, 1)) : JSON.stringify(organizes);

          this.updateDataSource({
            controlId,
            value,
            isInit: true,
          });

          this.onAsyncChange({
            controlId,
            value,
          });
        });
      })
      .finally(() => {
        this.setLoadingInfo(ids, false);
      });
  }

  /**
   * 获取当前位置
   */
  getCurrentLocation(ids) {
    // 处理定位回来慢但是用户已经选择了位置
    ids = ids.filter(controlId => !this.data.find(o => o.controlId === controlId).value);

    if (!ids.length) return;

    if (window.isMingDaoApp && window.MDJS && window.MDJS.getLocation) {
      window.MDJS.getLocation({
        success: res => {
          const { cLongitude, cLatitude, longitude, latitude, address, title } = res;
          ids.forEach(controlId => {
            let value = null;
            const control = _.find(this.data, { controlId });
            if ((typeof control.strDefault === 'string' ? control.strDefault : '00')[0] === '1') {
              value = JSON.stringify({
                x: longitude,
                y: latitude,
                coordinate: 'wgs84',
                address,
                title,
              });
            } else {
              value = JSON.stringify({
                x: cLongitude,
                y: cLatitude,
                coordinate: 'gcj02',
                address,
                title,
              });
            }
            this.updateDataSource({
              controlId,
              value,
              isInit: true,
            });
          });
          this.onAsyncChange({
            controlIds: ids,
            value: JSON.stringify({
              x: longitude,
              y: latitude,
              coordinate: 'wgs84',
              address,
              title,
            }),
          });
        },
        cancel: res => {
          const { errMsg } = res;
          if (!(errMsg.includes('cancel') || errMsg.includes('canceled'))) {
            window.nativeAlert(JSON.stringify(res));
          }
        },
      });
      return;
    }

    new MapLoader().loadJs().then(() => {
      new MapHandler().getCurrentPos((status, res) => {
        if (status === 'complete') {
          ids.forEach(controlId => {
            this.updateDataSource({
              controlId,
              value: JSON.stringify({
                x: res.position.lng,
                y: res.position.lat,
                address: res.formattedAddress || '',
                title: (res.addressComponent || {}).building || '',
              }),
              isInit: true,
            });
          });
          this.onAsyncChange({
            controlIds: ids,
            value: JSON.stringify({
              x: res.position.lng,
              y: res.position.lat,
              address: res.formattedAddress || '',
              title: (res.addressComponent || {}).building || '',
            }),
          });
        }
      });
    });
  }

  /**
   * 获取当前关联记录数据
   */
  getCurrentRelateData({ controlId, dataSource: worksheetId, value }) {
    const control = _.isArray(value) ? value[0] : safeParse(value || '[]')[0];
    const { isGet, sid, sourcevalue } = control || {};
    const relateValue = safeParse(sourcevalue || '{}');
    const hasRelate = _.find(this.data, ({ advancedSetting: { defsource } = {}, dataSource, type }) => {
      return (
        // 关联记录被设为默认值的字段没找到值才拉取数据
        (safeParse(defsource || '[]').some(i => controlId === i.rcid && i.cid && _.isUndefined(relateValue[i.cid])) ||
          (type === 30 && dataSource.slice(1, -1) === controlId)) &&
        sid !== this.masterRecordRowId
      );
    });

    if (hasRelate && !isGet && sid && !sid.includes('temp')) {
      this.setLoadingInfo(controlId, true);

      let params = {
        getType: 1,
        worksheetId,
        rowId: sid,
      };
      // 公开表单
      if (window.isPublicWorksheet && window.publicWorksheetShareId) {
        params.shareId = window.publicWorksheetShareId;
        params.getType = 3;
      }
      // 填写链接
      if (_.get(window, 'shareState.isPublicWorkflowRecord') && _.get(window, 'shareState.shareId')) {
        params.shareId = _.get(window, 'shareState.shareId');
        params.getType = 13;
      }

      this.requestPool
        .getRowDetail(params, this.abortController)
        .then(result => {
          this.setLoadingInfo(controlId, false);

          if (result.resultCode === 7) return;

          const formatValue = JSON.stringify(
            safeParse(value || '[]').map((i, index) =>
              index === 0 ? Object.assign(i, { sourcevalue: result.rowData, isGet: true }) : i,
            ),
          );

          this.updateDataSource({
            controlId,
            value: formatValue,
            ignoreSearch: true,
          });

          this.onAsyncChange({
            controlId,
            value: formatValue,
          });
        })
        .finally(() => {
          this.setLoadingInfo(controlId, false);
        });
    }
  }

  /**
   * 获取异步数据
   */
  getAsyncData(isInit) {
    if (_.isEmpty(this.asyncControls)) return;

    Object.keys(this.asyncControls).forEach(id => {
      (this.asyncControls[id] || []).forEach(item => {
        if (item.isImportFromExcel && !checkCellIsEmpty(item.value)) {
          return;
        }
        // 部门 | 组织角色
        if (item.type === 27 || item.type === 48) {
          const accounts = safeParse(
            getDynamicValue(
              this.data,
              Object.assign({}, item, {
                advancedSetting: { defsource: item.advancedSetting.defsource.replace(/isAsync/gi, 'async') },
              }),
              this.masterData,
            ),
          );

          if (!accounts.length) {
            this.updateDataSource({ controlId: item.controlId, value: '[]', isInit });
          } else {
            if (
              !md.global.Account.accountId ||
              window.isPublicWorksheet ||
              _.isEmpty(getCurrentProject(this.projectId))
            )
              return;

            this.setLoadingInfo(item.controlId, true);

            const INFO_OPTIONS = {
              27: {
                id: 'departmentId',
                name: 'departmentName',
                ids: 'departments',
                api: departmentAjax.getDepartmentsByAccountId,
              },
              48: {
                id: 'organizeId',
                name: 'organizeName',
                ids: 'organizes',
                api: organizeAjax.getOrganizesByAccountId,
              },
            };

            const infoObj = INFO_OPTIONS[item.type];

            infoObj
              .api({ projectId: this.projectId, accountIds: accounts.map(o => o.accountId) })
              .then(result => {
                let departments = [];
                this.setLoadingInfo(item.controlId, false);

                result.maps.forEach(item => {
                  item[infoObj.ids].forEach(obj => {
                    departments.push({
                      [infoObj.id]: obj.id,
                      [infoObj.name]: obj.name,
                    });
                  });
                });

                departments = JSON.stringify(
                  item.enumDefault === 0
                    ? _.uniqBy(departments, infoObj.id).slice(0, 1)
                    : _.uniqBy(departments, infoObj.id),
                );

                // 多部门只获取第一个
                this.updateDataSource({
                  controlId: item.controlId,
                  value: departments,
                  isInit,
                });

                this.onAsyncChange({
                  controlId: item.controlId,
                  value: departments,
                });
              })
              .finally(() => {
                this.setLoadingInfo(item.controlId, false);
              });
          }
        }
      });
    });
  }

  /**
   * 能否执行查询（条件字段、字段值存在&&当前变更字段有值）
   * 查询条件支持且或，分组判断
   */
  getSearchStatus = (filters = [], controls = []) => {
    const splitFilters = getArrBySpliceType(filters);
    return _.some(splitFilters, (items = []) => {
      return _.every(getItemFilters(items), item => {
        // 固定值|字段值
        const isDynamicValue = item.dynamicSource && item.dynamicSource.length > 0;
        //筛选值字段
        const fieldResult =
          _.includes(['rowid', 'currenttime'], _.get(item.dynamicSource[0] || {}, 'cid')) ||
          _.find(this.data, da => da.controlId === _.get(item.dynamicSource[0] || {}, 'cid'));
        //条件字段
        const conditionExit = _.find(controls.concat(SYSTEM_CONTROLS), con => con.controlId === item.controlId);
        return isDynamicValue ? fieldResult : conditionExit;
      });
    });
  };

  /**
   * 查询记录
   */
  getFilterRowsData = (searchControl, para, controlId, effectControlId) => {
    const formatFilters = getFilter({ control: searchControl, formData: this.data });
    // 增加查询条件对比，由于一些异步更新，未完成时已被记录id,导致更新完被循环拦截(纯id拦截不准确)
    const tempFilterValue = getItemFilters(formatFilters).map(i =>
      _.pick(i, ['controlId', 'value', 'values', 'maxValue', 'minValue']),
    );
    const existFilters = this.loopList.filter(i => i.loopId === `${effectControlId}-${controlId}`);
    if (_.some(existFilters, e => _.isEqual(tempFilterValue, e.loopFilter))) {
      return Promise.reject();
    }
    this.setLoadingInfo(controlId, true);
    this.loopList.push({ loopId: `${effectControlId}-${controlId}`, loopFilter: tempFilterValue });

    let params = {
      filterControls: formatFilters,
      pageIndex: 1,
      searchType: 1,
      status: 1,
      getType: 7,
      ...para,
    };
    if (window.isPublicWorksheet) {
      params.formId = window.publicWorksheetShareId;
    }
    return this.requestPool.getFilterRowsByQueryDefault(params, this.abortController);
  };

  /**
   * 根据查询配置更新数据
   */
  getFilterConfigs = (control = {}, searchType) => {
    switch (searchType) {
      case 'init':
        return this.searchConfig.filter(({ items, controlId }) => {
          const curValue = _.get(
            _.find(this.data, d => d.controlId === controlId),
            'value',
          );
          const isNull = checkCellIsEmpty(curValue);

          return (
            _.every(
              getItemFilters(items),
              item =>
                _.includes(['rowid', 'currenttime'], _.get(item.dynamicSource[0] || {}, 'cid')) ||
                (item.dynamicSource || []).length === 0,
            ) && isNull
          );
        });
      case 'onBlur':
        return this.searchConfig
          .filter(({ controlId }) => controlId !== control.controlId)
          .filter(({ controlId, items }) => {
            const curValue = _.get(
              _.find(this.data, d => d.controlId === controlId),
              'value',
            );
            if (control.isImportFromExcel && curValue) {
              return;
            }
            return _.some(
              getItemFilters(items),
              item => _.get(item.dynamicSource[0] || {}, 'cid') === control.controlId,
            );
          });
      default:
        return [];
    }
  };

  /**
   * 根据查询配置更新数据
   */
  updateDataBySearchConfigs = ({ control = {}, searchType }) => {
    const filterSearchConfig = this.getFilterConfigs(control, searchType);
    filterSearchConfig.forEach(currentConfig => {
      const updateData = value => {
        this.updateDataSource({
          controlId: currentConfig.controlId,
          value,
        });
        this.onAsyncChange({
          controlId: currentConfig.controlId,
          value,
        });
        // 初始时由工作表查询引起的变更遗漏
        if (!_.includes(this.ruleControlIds, currentConfig.controlId) && searchType === 'init') {
          this.ruleControlIds.push(currentConfig.controlId);
        }
      };
      if (currentConfig) {
        const {
          items = [],
          configs = [],
          templates = [],
          moreType,
          moreSort,
          sourceId,
          controlType,
          controlId,
          id,
        } = currentConfig;
        const controls = _.get(templates[0] || {}, 'controls') || [];
        //当前配置查询的控件
        const currentControl = _.find(this.data, da => da.controlId === controlId);
        if (!currentControl) {
          return;
        }
        // 表单类型转换，矫正数量配置
        let queryCount = getDefaultCount(currentControl, currentConfig.queryCount);
        // 满足查询时机
        const canSearch = this.getSearchStatus(items, controls);
        // 能配查询多条的是否赋值的控件
        const canSearchMore =
          !_.includes([29, 34], currentControl.type) ||
          (currentControl.type === 29 && currentControl.enumDefault === 1);
        const searchControl = {
          ...currentControl,
          advancedSetting: { filters: JSON.stringify(items) },
          recordId: this.recordId,
          relationControls: controls,
        };
        //表删除、没有控件、不符合查询时机、当前配置控件已删除等不执行
        if (
          templates.length > 0 &&
          controls.length > 0 &&
          canSearch &&
          currentControl &&
          !_.includes(this.loopList, `${control.controlId}-${controlId}`)
        ) {
          //关联记录、或同源级联直接查询赋值
          if (_.includes([29], controlType) || (controlType === 35 && currentControl.dataSource === sourceId)) {
            this.debounceGetFilterRowsData(
              id,
              searchControl,
              {
                worksheetId: sourceId,
                pageSize: currentControl.enumDefault === 1 ? 1 : queryCount,
                id,
                getAllControls: true,
                sortControls: moreSort,
                ...(get(window, 'shareState.shareId') ? { relationWorksheetId: currentConfig.worksheetId } : {}),
              },
              controlId,
              control.controlId,
            ).then(res => {
              this.setLoadingInfo(controlId, false);
              if (res.resultCode === 1) {
                // 查询多条不赋值
                if (canSearchMore && res.count > 1 && moreType === 1) return;
                const titleControl = _.find(_.get(currentControl, 'relationControls'), i => i.attribute === 1);
                const newValue = (res.data || []).map(item => {
                  const nameValue = titleControl ? item[titleControl.controlId] : undefined;
                  return {
                    isNew: true,
                    isWorksheetQueryFill: _.get(currentControl.advancedSetting || {}, 'showtype') === '1',
                    sourcevalue: JSON.stringify(item),
                    row: item,
                    type: 8,
                    sid: item.rowid,
                    name: getCurrentValue(titleControl, nameValue, { type: 2 }),
                  };
                });
                // 关联记录空值不赋值，防止死循环
                if (_.isEmpty(newValue) && (currentControl.value || '').startsWith('deleteRowIds')) return;
                if (_.isEmpty(newValue) && _.includes([29], controlType) && this.isMobile) {
                  updateData(JSON.stringify(newValue));
                  return;
                }
                if (_.isEmpty(newValue) && _.includes([29], controlType)) {
                  updateData('deleteRowIds: all');
                } else {
                  updateData(JSON.stringify(newValue));
                }
              }
            });
          } else {
            //子表和普通字段需判断映射字段存在与否
            const canMapConfigs = configs.filter(({ cid, subCid }) => {
              return (_.find(controls, c => c.controlId === subCid) || subCid === 'rowid') && currentControl.type === 34
                ? _.find(currentControl.relationControls || [], re => re.controlId === cid)
                : currentControl.controlId === cid;
            });
            if (canMapConfigs.length > 0) {
              this.debounceGetFilterRowsData(
                id,
                searchControl,
                {
                  worksheetId: sourceId,
                  pageSize: controlType === 34 ? queryCount : 1,
                  id,
                  getAllControls: controlType === 34,
                  sortControls: moreSort,
                },
                controlId,
                control.controlId,
              ).then(res => {
                this.setLoadingInfo(controlId, false);
                if (res.resultCode === 1) {
                  const filterData = res.data || [];
                  // 查询多条不赋值
                  if (canSearchMore && res.count > 1 && moreType === 1) return;
                  //子表
                  if (controlType === 34) {
                    const newValue = [];
                    if (filterData.length) {
                      filterData.forEach(item => {
                        let row = {};
                        canMapConfigs.map(({ cid = '', subCid = '' }) => {
                          const controlVal = _.find(currentControl.relationControls || [], re => re.controlId === cid);
                          if (controlVal) {
                            if (subCid === 'rowid') {
                              row[cid] =
                                controlVal.type === 29
                                  ? JSON.stringify([
                                      {
                                        sourcevalue: JSON.stringify(item),
                                        row: item,
                                        type: 8,
                                        sid: item.rowid,
                                      },
                                    ])
                                  : item.rowid;
                              return;
                            }
                            row[cid] = formatSearchResultValue({
                              targetControl: _.find(controls, s => s.controlId === subCid),
                              currentControl: controlVal,
                              controls,
                              searchResult: item[subCid] || '',
                            });
                          }
                        });
                        //映射明细所有字段值不为空
                        if (_.some(Object.values(row), i => !_.isUndefined(i))) {
                          newValue.push({
                            ...row,
                            rowid: `temprowid-${uuidv4()}`,
                            allowedit: true,
                            addTime: new Date().getTime(),
                          });
                        }
                      });
                    }
                    updateData({
                      action: 'clearAndSet',
                      isDefault: true,
                      rows: newValue,
                    });
                  } else {
                    //普通字段取第一条
                    const currentId = _.get(canMapConfigs[0] || {}, 'subCid');
                    //取该控件值去填充
                    const item = _.find(controls, c => c.controlId === currentId);
                    const value = formatSearchResultValue({
                      targetControl: item,
                      currentControl,
                      controls,
                      searchResult: (filterData[0] || {})[currentId],
                    });
                    // 防止新建的时候无效变更引起的报错提示
                    if (searchType === 'init' && _.isEqual(value, currentControl.value)) return;
                    updateData(value);
                  }
                }
              });
            }
          }
        }
      }
    });
  };

  /**
   * 操作字段的 store
   */
  callStore(fn, ...args) {
    let fnName = _.isObject(fn) ? fn.fnName : fn;
    Object.keys(this.storeCenter).forEach(key => {
      const store = this.storeCenter[key];
      if (_.isObject(fn) && fn.controlId && fn.controlId !== get(store.getState(), 'base.control.controlId')) return;
      if (store && _.isFunction(store[fnName])) {
        store[fnName](...args);
      }
    });
  }
}
