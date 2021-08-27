import { formatColumnToText } from 'src/pages/widgetConfig/util/data.js';
import { calcDate } from 'src/pages/worksheet/util';
import { Parser } from 'hot-formula-parser';
import nzh from 'nzh';
import { FORM_ERROR_TYPE, FROM } from './config';
import { isRelateRecordTableControl } from 'worksheet/util';
import { controlState, Validator, getRangeErrorType } from './utils';
import intlTelInput from '@mdfe/intl-tel-input';
import utils from '@mdfe/intl-tel-input/build/js/utils';

const timeUint = {
  1: 'm',
  2: 'h',
  3: 'd',
  4: 'M',
  5: 'y',
};

const initIntlTelInput = () => {
  if (window.initIntlTelInput) {
    return window.initIntlTelInput;
  }

  const $con = document.createElement('div');
  const $input = document.createElement('input');

  $con.style.display = 'none';
  $con.appendChild($input);
  document.body.appendChild($con);

  window.initIntlTelInput = intlTelInput($input, {
    initialCountry: 'cn',
    utilsScript: utils,
  });

  return window.initIntlTelInput;
};

// 处理静态默认值
const parseStaticValue = (item, staticValue) => {
  // 日期 || 日期时间
  if (item.type === 15 || item.type === 16) {
    const unit = timeUint[item.unit] || 'd';
    if (staticValue === '2') {
      return moment().format(item.type === 15 ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm');
    } else if (staticValue === '3') {
      return moment()
        .add(1, unit)
        .format(item.type === 15 ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm');
    }
  }

  // 人员
  if (item.type === 26) {
    return JSON.parse(staticValue);
  }

  // 关联表
  if (item.type === 29) {
    staticValue = JSON.parse(staticValue)[0];
    return JSON.stringify([
      {
        sourcevalue: staticValue,
        type: 8,
        sid: JSON.parse(staticValue).rowid,
        name: JSON.parse(staticValue).name,
      },
    ]);
  }

  return staticValue;
};

// 获取动态默认值
const getDynamicValue = (data, currentItem, masterData) => {
  let value = JSON.parse(currentItem.advancedSetting.defsource).map(item => {
    // 关联他表字段
    if (item.rcid) {
      try {
        if (currentItem.type === 26 && item.cid === 'caid') {
          const obj = _.pick(_.get(md, ['global', 'Account']), ['accountId', 'fullname', 'avatarMiddle']);
          return { ...obj, avatar: obj.avatarMiddle, name: obj.fullname };
        }
        if (_.includes([15, 16], currentItem.type) && item.cid === 'ctime') {
          return moment().format(item.type === 15 ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm');
        }
        if (masterData && item.rcid === masterData.worksheetId) {
          const targetControl = _.find(masterData.formData, c => c.controlId === item.cid);
          return targetControl.value;
        }
        const parentControl = _.find(data, c => c.controlId === item.rcid);
        const control = JSON.parse(parentControl.value)[0];
        const sourcevalue = JSON.parse(control.sourcevalue)[item.cid];

        // 关联表
        if (_.includes([29, 35], currentItem.type)) {
          try {
            return JSON.stringify(JSON.parse(sourcevalue).filter(r => r.sid));
          } catch (err) {
            return '';
          }
        }

        // 数值类控件
        if (_.includes([6, 8, 31], currentItem.type) || (currentItem.type === 38 && currentItem.enumDefault === 2)) {
          try {
            let cValue = 0;
            const { options } = _.find(parentControl.relationControls, o => o.controlId === item.cid);

            JSON.parse(sourcevalue).forEach(key => {
              cValue += options.find(o => o.key === key).score;
            });

            return cValue;
          } catch (err) {
            return sourcevalue;
          }
        }

        return sourcevalue;
      } catch (err) {
        return '';
      }
    }

    // 当前行记录字段
    if (item.cid) {
      if (currentItem.type === 26 && item.cid === 'caid') {
        const obj = _.pick(_.get(md, ['global', 'Account']), ['accountId', 'fullname', 'avatarMiddle']);
        return { ...obj, avatar: obj.avatarMiddle, name: obj.fullname };
      }
      if (_.includes([15, 16], currentItem.type) && item.cid === 'ctime') {
        return moment().format(item.type === 15 ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm');
      }

      return getControlValue(data, currentItem, item.cid);
    }

    if (item.staticValue) {
      return parseStaticValue(currentItem, item.staticValue);
    }

    return '';
  });

  if (_.includes([9, 10, 11, 26], currentItem.type)) {
    let source = [];

    _.remove(value, o => !o);

    // 合并成新的一维数组
    value.forEach(obj => {
      if (typeof obj === 'string' && /[\{|\[]/.test(obj)) {
        if (_.isArray(JSON.parse(obj))) {
          source = source.concat(JSON.parse(obj));
        } else {
          source.push(JSON.parse(obj));
        }
      } else {
        source.push(obj);
      }
    });

    // 筛选出不重复的用户
    if (currentItem.type === 26) {
      source = _.uniq(source, user => user.accountId);
    } else {
      source = _.uniq(source);
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
    const record = JSON.parse(parentControl.value)[0];
    const sourceControl = parentControl && _.find(parentControl.relationControls, c => c.controlId === sourceControlId);
    if (sourceControl && _.includes([29, 35], sourceControl.type)) {
      const sourceControlValue = JSON.parse(record.sourcevalue)[sourceControlId];
      const sourceControlValueRecord = JSON.parse(sourceControlValue)[0];
      if (sourceControlValueRecord) {
        return sourceControlValueRecord.name;
      }
    } else {
      return JSON.parse(record.sourcevalue)[sourceControlId];
    }
  } catch (err) {
    return '';
  }
};

// 处理公式
const parseNewFormula = (data, formulaStr, dot = 2) => {
  let columnIsUndefined;

  formulaStr = formulaStr
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
    const column = _.find(data, obj => obj.controlId === controlId);
    if (!column) {
      columnIsUndefined = true;
      return undefined;
    }

    if (_.includes([9, 10, 11], column.type)) {
      return getControlValue(data, { type: 31 }, controlId);
    }

    if (_.isUndefined(column.value) || column.value === '') {
      columnIsUndefined = true;
    }
    return parseFloat(
      _.find([6, 8, 28, 31, 37], c => c === column.type || c === column.sourceControlType)
        ? column.value
        : formatColumnToText(column, true),
      10,
    );
  });
  const parser = new Parser();
  const result = parser.parse(expression);
  return columnIsUndefined
    ? { columnIsUndefined }
    : { result: typeof result.result === 'number' ? parseFloat(result.result.toFixed(dot)) : null };
};

// 处理日期公式
const parseDateFormula = (data, currentItem, recordCreateTime) => {
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
        let timestr = formatColumnToText(column, true);
        if (!timestr) {
          return;
        }
        if (column.type === 15) {
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
    const startTime = getTime(currentItem.sourceControlId, 'start');
    const endTime = getTime(currentItem.dataSource, 'end');

    if (!startTime || !endTime) {
      return;
    }

    value = String(Math.round(moment(endTime).diff(startTime, timeUint[currentItem.unit] || 'm', true)));
  } else if (currentItem.enumDefault === 2) {
    let dateColumnType = 0;
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
        date = formatColumnToText(column, true);
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

      if (_.isUndefined(matchedColumn.value) || matchedColumn.value === '') {
        hasUndefinedColumn = true;
      }

      return parseFloat(formatColumnToText(matchedColumn, true), 10);
    });

    formulaResult = hasUndefinedColumn ? {} : calcDate(date, expression);
    value =
      formulaResult.error || hasUndefinedColumn
        ? ''
        : formulaResult.result.format(dateColumnType === 15 ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm');
  } else if (currentItem.enumDefault === 3) {
    const unit = timeUint[currentItem.unit] || 'd';
    const today = moment().startOf(unit);
    const time = moment(getTime(currentItem.sourceControlId, 'start')).startOf(unit);

    if (!today || !time) {
      return;
    }
    if (
      currentItem.advancedSetting.dateformulatype === '1' ||
      _.isUndefined(currentItem.advancedSetting.dateformulatype)
    ) {
      value = String(Math.floor(moment(time).diff(today, unit, true)));
    } else {
      value = String(Math.floor(moment(today).diff(time, unit, true)));
    }
  }

  return value;
};

// 获取控件的值（处理特殊选项控件）
const getControlValue = (data, currentItem, controlId) => {
  const obj = _.find(data, o => o.controlId === controlId) || {};

  // 选项控件的分值可以被数值类控件引用
  if (
    _.includes([9, 10, 11], obj.type) &&
    (_.includes([6, 8, 31], currentItem.type) || (currentItem.type === 38 && currentItem.enumDefault === 2))
  ) {
    let cValue = 0;

    JSON.parse(obj.value || '[]').forEach(key => {
      // 新增的项默认0
      cValue += key.indexOf('add_') > -1 ? 0 : obj.options.find(o => o.key === key).score;
    });

    return cValue;
  }

  return obj.value || '';
};

// 检测必填
export const checkRequired = item => {
  let errorType = '';

  if (
    item.required &&
    (!item.value ||
      (_.isString(item.value) && !item.value.trim()) ||
      (_.includes([9, 10, 11], item.type) && !JSON.parse(item.value).length) ||
      (item.type === 14 &&
        ((_.isArray(JSON.parse(item.value)) && !JSON.parse(item.value).length) ||
          (!_.isArray(JSON.parse(item.value)) &&
            !JSON.parse(item.value).attachments.length &&
            !JSON.parse(item.value).knowledgeAtts.length &&
            !JSON.parse(item.value).attachmentData.length))) ||
      (_.includes([21, 26, 27, 29, 35], item.type) &&
        _.isArray(safeParse(item.value)) &&
        !JSON.parse(item.value).length) ||
      (item.type === 34 && ((item.value.rows && !item.value.rows.length) || item.value === '0')) ||
      (item.type === 36 && item.value === '0'))
  ) {
    errorType = FORM_ERROR_TYPE.REQUIRED;
  }

  return errorType;
};

// 验证必填及格式
export const onValidator = (item, from) => {
  let errorType = '';

  if (!item.disabled && controlState(item, from).editable) {
    errorType = checkRequired(item);

    if (!errorType) {
      const value = (item.value || '').toString().trim();

      // 手机
      if (item.type === 3) {
        const iti = initIntlTelInput();
        iti.setNumber(value);
        // 香港6262开头不识别特殊处理
        errorType =
          !value || iti.isValidNumber() || /\+8526262\d{4}$|\+86148\d{8}$/.test(value)
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
        if (item.advancedSetting.regex) {
          errorType =
            !value || new RegExp(JSON.parse(item.advancedSetting.regex).regex).test(value)
              ? ''
              : FORM_ERROR_TYPE.CUSTOM;
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
        const start = parseInt(allowtime.split('-')[0]);
        const end = parseInt(allowtime.split('-')[1]);

        if (!value) {
          errorType = '';
        } else if (allowweek.indexOf(moment(value).day() === 0 ? '7' : moment(value).day()) === -1) {
          errorType = FORM_ERROR_TYPE.DATE;
        } else if (moment(value).hour() < start || moment(value).hour() >= end) {
          errorType = FORM_ERROR_TYPE.DATE_TIME;
        }
      }
    }

    if (isRelateRecordTableControl(item)) {
      errorType = '';
    }
  }

  return errorType;
};

/**
 * 自定义字段数据格式化
 * @param {[]} data 数据源
 * @param {boolean} isCreate 是否创建
 * @param {boolean} disabled 是否全部禁用
 * @param {string} recordCreateTime 记录创建时间，编辑的时候会用到
 * @param {string} from 来源参考config.js中的FROM
 */
export default class DataFormat {
  constructor({
    data = [],
    isCreate = false,
    disabled = false,
    recordCreateTime = '',
    masterData,
    from = FROM.DEFAULT,
  }) {
    this.data = _.cloneDeep(data);
    this.masterData = masterData;
    this.controlIds = [];
    this.errorItems = [];
    this.recordCreateTime = recordCreateTime;
    this.from = from;

    // 新建初始化
    if (isCreate) {
      this.data.forEach(item => {
        if (item.value) {
          this.updateDataSource({ controlId: item.controlId, value: item.value, notInsertControlIds: true });
        } else if (item.advancedSetting && item.advancedSetting.defsource) {
          const value = getDynamicValue(this.data, item, this.masterData);

          if (value) {
            this.updateDataSource({ controlId: item.controlId, value });
          }
        } else if (
          item.type === 38 &&
          item.enumDefault === 3 &&
          item.sourceControlId &&
          item.sourceControlId[0] !== '$'
        ) {
          const unit = timeUint[item.unit] || 'd';
          const today = moment().startOf(unit);
          const time = moment(item.sourceControlId).startOf(unit);
          if (item.advancedSetting.dateformulatype === '1' || _.isUndefined(item.advancedSetting.dateformulatype)) {
            item.value = String(Math.floor(moment(time).diff(today, unit, true)));
          } else {
            item.value = String(Math.floor(moment(today).diff(time, unit, true)));
          }
        }
      });
    }

    this.data.forEach(item => {
      item.advancedSetting = item.advancedSetting || {};
      item.dataSource = item.dataSource || '';
      item.disabled = !!disabled || item.disabled;
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

      const errorType = onValidator(item, from);

      if (errorType) {
        _.remove(this.errorItems, obj => obj.controlId === item.controlId);
        this.errorItems.push({
          controlId: item.controlId,
          errorType,
          showError: false,
        });
      }
    });
  }

  /**
   * 更新数据
   */
  updateDataSource({ controlId, value, notInsertControlIds = false, removeUniqueItem = () => {}, data }) {
    try {
      const updateSource = (controlId, value) => {
        this.data.forEach(item => {
          if (item.controlId === controlId) {
            item.value = value;

            removeUniqueItem(controlId);
            _.remove(this.errorItems, obj => obj.controlId === item.controlId);

            const errorType = onValidator(item, this.from);
            if (errorType) {
              this.errorItems.push({
                controlId: item.controlId,
                errorType,
                showError: true,
              });
            }

            // 变更控件的id集合
            if (
              !_.includes([25, 30, 31, 32, 33, 37], item.type) &&
              !_.includes(this.controlIds, controlId) &&
              !notInsertControlIds
            ) {
              this.controlIds.push(controlId);
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

        // 最多递归5层
        if (depth > 5) {
          updateSource(controlId, '');
          return;
        }

        // 更新当前的控件值
        if (value === undefined) {
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
            const formulaResult = parseNewFormula(this.data, currentItem.dataSource, currentItem.dot);
            value = formulaResult.error || formulaResult.columnIsUndefined ? '' : formulaResult.result;
          }

          // 文本组合处理
          if (currentItem.type === 32) {
            value = currentItem.dataSource.replace(/\$.+?\$/g, matched => {
              const controlId = matched.match(/\$(.+?)\$/)[1];
              let singleControl = _.find(this.data, item => item.controlId === controlId);

              if (!singleControl) {
                return '';
              }

              // 公式
              if (singleControl.type === 31) {
                const formulaResult = parseNewFormula(this.data, singleControl.dataSource, singleControl.dot);
                if (formulaResult.columnIsUndefined) {
                  return '';
                }
                return formulaResult.error
                  ? ''
                  : `${formulaResult.result.toFixed(singleControl.dot)}${singleControl.unit}`;
              }

              return formatColumnToText(singleControl);
            });
          }

          // 日期公式控件
          if (currentItem.type === 38) {
            value = parseDateFormula(this.data, currentItem, this.recordCreateTime);
          }

          // 动态默认值
          if (currentItem.advancedSetting && currentItem.advancedSetting.defsource) {
            value = getDynamicValue(this.data, currentItem, this.masterData);
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
                if (_.isArray(sourceSheetControl.value)) {
                  records = sourceSheetControl.value;
                } else if (sourceSheetControl.data) {
                  records = sourceSheetControl.data;
                } else {
                  try {
                    let parsedValue = JSON.parse(sourceSheetControl.value);
                    if (_.isArray(parsedValue)) {
                      records = parsedValue;
                    }
                  } catch (err) {}
                }
              } else if (sourceSheetControl.type === 34) {
                records = sourceSheetControl.value.rows || [];
              }
            } catch (err) {}
            if (!currentItem.sourceControlId) {
              // 记录数量
              value = records.length;
            } else {
              const sourceControl = _.find(
                sourceSheetControl.relationControls,
                c => c.controlId === currentItem.sourceControlId,
              );
              if (sourceControl) {
                const controls = records
                  .map(record => (record.row || record)[sourceControl.controlId])
                  .filter(_.identity);
                if (controls.length) {
                  const isDate =
                    currentItem.type === 15 ||
                    currentItem.type === 16 ||
                    (currentItem.type === 37 && (currentItem.enumDefault2 === 15 || currentItem.enumDefault2 === 16));
                  switch (currentItem.enumDefault) {
                    case 13: // 已填
                      value = controls.filter(c => (sourceControl.type === 36 ? c === '1' : !!c)).length;
                      break;
                    case 14: // 未填
                      value = controls.filter(c => (sourceControl.type === 36 ? c !== '1' : !c)).length;
                      break;
                    case 5: // 求和
                      value = _.sum(
                        controls.map(c =>
                          _.isNumber(parseFloat(c, 10)) && !_.isNaN(parseFloat(c, 10)) ? parseFloat(c, 10) : 0,
                        ),
                      );
                      break;
                    case 1: // 平均
                      value =
                        _.sum(
                          controls.map(c =>
                            _.isNumber(parseFloat(c, 10)) && !_.isNaN(parseFloat(c, 10)) ? parseFloat(c, 10) : 0,
                          ),
                        ) / controls.length;
                      break;
                    case 2: // 最大 最晚
                      if (isDate) {
                        const maxDate = _.max(controls.filter(_.identity).map(c => new Date(c || 0).getTime()));
                        value =
                          currentItem.enumDefault2 === 15
                            ? moment(maxDate).format('YYYY-MM-DD')
                            : moment(maxDate).format('YYYY-MM-DD HH:mm');
                      } else {
                        value = _.max(
                          controls.map(c =>
                            _.isNumber(parseFloat(c, 10)) && !_.isNaN(parseFloat(c, 10)) ? parseFloat(c, 10) : 0,
                          ),
                        );
                      }
                      break;
                    case 3: // 最小 最早
                      if (isDate) {
                        const minDate = _.min(controls.filter(_.identity).map(c => new Date(c || 0).getTime()));
                        value =
                          currentItem.enumDefault2 === 15
                            ? moment(minDate).format('YYYY-MM-DD')
                            : moment(minDate).format('YYYY-MM-DD HH:mm');
                      } else {
                        value = _.min(
                          controls.map(c =>
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

        updateSource(controlId, value);

        // 受影响的控件集合
        const effectControls = _.filter(
          this.data,
          item =>
            (item.dataSource || '').indexOf(controlId) > -1 ||
            (item.type === 38 && item.sourceControlId.indexOf(controlId) > -1) ||
            (item.advancedSetting &&
              item.advancedSetting.defsource &&
              JSON.parse(item.advancedSetting.defsource).filter(
                obj => (!obj.rcid && obj.cid === controlId) || (obj.rcid === controlId && obj.cid),
              ).length) ||
            (item.type === 37 && controlId === (item.dataSource || '').slice(1, -1)),
        );

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
   * 设置异常控件
   */
  setErrorControl(controlId, errorType) {
    _.remove(this.errorItems, obj => obj.controlId === controlId);

    if (errorType) {
      this.errorItems.push({
        controlId,
        errorType,
        showError: false,
      });
    }
  }

  /**
   * 获取异常控件
   */
  getErrorControls() {
    return this.errorItems;
  }
}
