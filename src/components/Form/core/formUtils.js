import { Parser } from 'hot-formula-parser';
import _ from 'lodash';
import moment from 'moment';
import { telIsValidNumber } from 'ming-ui/components/intlTelInput';
import { RELATE_RECORD_SHOW_TYPE } from 'worksheet/constants/enum';
import { isSheetDisplay } from 'src/pages/widgetConfig/util';
import { formatColumnToText } from 'src/pages/widgetConfig/util/data.js';
import { getShowFormat } from 'src/pages/widgetConfig/util/setting';
import { getDatePickerConfigs } from 'src/pages/widgetConfig/util/setting';
import { transferValue } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/util';
import { isEnableScoreOption } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/util';
import execValueFunction from 'src/pages/widgetConfig/widgetSetting/components/FunctionEditorDialog/Func/exec';
import {
  API_ENUM_TO_TYPE,
  CONTROL_FILTER_WHITELIST,
  DATE_OPTIONS,
  DATE_RANGE_TYPE,
  FILTER_CONDITION_TYPE,
} from 'src/pages/worksheet/common/WorkSheetFilter/enum.js';
import { getConditionType, getTypeKey, redefineComplexControl } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { WFSTATUS_OPTIONS } from 'src/pages/worksheet/components/WorksheetRecordLog/enum.js';
import { accDiv, accMul, calcDate } from 'src/utils/common';
import {
  formatStrZero,
  getSwitchItemNames,
  isRelateRecordTableControl,
  renderText as renderCellText,
  toFixed,
} from 'src/utils/control';
import { checkCellIsEmpty, isEmptyValue } from 'src/utils/control';
import { dateConvertToServerZone, dateConvertToUserZone, getContactInfo } from 'src/utils/project';
import { filterEmptyChildTableRows } from 'src/utils/record';
import { FORM_ERROR_TYPE, FORM_ERROR_TYPE_TEXT, FROM, TIME_UNIT } from './config';

export const checkValueByFilterRegex = (data = {}, name, formData, recordId) => {
  const filterRegex = safeParse(_.get(data, 'advancedSetting.filterregex') || '[]');
  if (filterRegex.length) {
    for (const f of filterRegex) {
      const { filters = [], value, err } = f;
      let reg;
      try {
        reg = new RegExp(value, 'gm');
      } catch (error) {
        console.log(error);
      }

      const newFormatData = (formData || []).map(i => (i.controlId === data.controlId ? { ...i, value: name } : i));

      if (
        _.isEmpty(filters) ||
        _.get(checkValueAvailable({ filters: filters }, newFormatData, recordId), 'isAvailable')
      ) {
        return !name || !reg || reg.test(name) ? '' : err || _l('请输入有效文本');
      }
    }
  }
};

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

// 工作表查询部门、地区、用户赋值特殊处理
export const getCurrentValue = (item, data, control) => {
  if (!item || !control) return data;
  switch (control.type) {
    //当前控件文本
    case 2:
    case 41:
      if (_.includes([6, 31, 37], item.type) && item.advancedSetting && item.advancedSetting.numshow === '1' && data) {
        data = accMul(parseFloat(data), 100);
      }
      switch (item.type) {
        //用户
        case 26:
          return JSON.parse(data || '[]')
            .map(item =>
              item.accountId === md.global.Account.accountId ? md.global.Account.fullname : item.name || item.fullname,
            )
            .join('、');
        //部门
        case 27:
          return JSON.parse(data || '[]')
            .map(item => item.departmentName)
            .join('、');
        //组织角色
        case 48:
          return JSON.parse(data || '[]')
            .map(item => item.organizeName)
            .join('、');
        //地区
        case 19:
        case 23:
        case 24:
          return JSON.parse(data || '{}').name;
        // 单选、多选
        case 9:
        case 10:
        case 11:
          const ids = JSON.parse(data || '[]');
          return ids
            .map(i => {
              let d = '';

              try {
                const da = JSON.parse(i);
                if (typeof da === 'object') {
                  return da.value;
                } else {
                  d = i;
                }
              } catch (e) {
                console.log(e);
                d = i;
              }
              if (d.toString().indexOf('add_') > -1) {
                return d.split('add_')[1];
              }

              if (item.controlId === 'wfstatus') {
                return (
                  _.get(
                    _.find(WFSTATUS_OPTIONS, t => t.key === d && !t.isDeleted),
                    'value',
                  ) || ''
                );
              }

              const curValue =
                _.get(
                  _.find(item.options || [], t => t.key === d && !t.isDeleted),
                  'value',
                ) || '';
              if (d.toString().indexOf('other:') > -1) {
                return _.replace(d, 'other:', '') || curValue;
              }
              return curValue;
            })
            .join(', ');
        case 14:
          const fileData = getAttachmentData({ value: data });
          return fileData.map(f => f.originalFileName || f.originalFilename).join('、');
        case 15:
        case 16:
          const showFormat = getShowFormat(item);
          return data ? moment(data).format(showFormat) : '';
        //关联记录单条
        case 29:
          const formatData = safeParse(data || '[]', 'array')[0] || {};
          let titleControl;
          if (_.get(item, 'relationControls.length')) {
            titleControl = _.find(item.relationControls, r => r.attribute === 1) || {};
          } else if (_.get(window, 'worksheetControlsCache.' + item.dataSource)) {
            titleControl =
              _.find(_.get(window, 'worksheetControlsCache.' + item.dataSource) || [], r => r.attribute === 1) || {};
          }
          return titleControl ? renderCellText({ ...titleControl, value: formatData.name }) : formatData.name;
        //公式
        case 31:
          const dot = item.dot || 0;
          const val = Number(data || 0).toFixed(dot);
          return _.get(item, 'advancedSetting.dotformat') === '1' ? formatStrZero(val) : val;
        // 级联
        case 35:
          return safeParse(data || '[]', 'array')
            .map(item => item.name)
            .join();
        // 检查框
        case 36:
          if (_.includes(['1', '2'], item.advancedSetting.showtype)) {
            const itemnames = getSwitchItemNames(item, { needDefault: true });
            return (
              _.get(
                _.find(itemnames, i => i.key === data),
                'value',
              ) || ''
            );
          }
          return data === '1' ? 'true' : 'false';
        // 定位
        case 40:
          const locationData = safeParse(data || '{}');
          return _.isEmpty(locationData)
            ? ''
            : locationData.title || locationData.address
              ? [locationData.title, locationData.address].filter(o => o).join(' ')
              : `${_l('经度：%0', locationData.x)} ${_l('纬度：%0', locationData.y)}`;
        case 46:
          return data ? moment(data, 'HH:mm:ss').format(item.unit === '6' ? 'HH:mm:ss' : 'HH:mm') : '';
        default:
          return data;
      }
    //控件为数值、金额、等级
    case 6:
    case 8:
    case 28:
      //选项赋分值
      if (isEnableScoreOption(item)) {
        const selectOptions = (item.options || []).filter(item => _.includes(JSON.parse(data || '[]'), item.key));
        if (!selectOptions.length) return '';
        return selectOptions.reduce((total, cur) => {
          return total + Number(cur.score || 0);
        }, 0);
      } else {
        return data;
      }
    default:
      return data;
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

const Reg = {
  // 座机号码
  telPhoneNumber: /^[+]?([\d\s()-]+)$/,
  // 邮箱地址
  emailAddress: /^[\w-+]+(\.[\w-+]+)*@[\w-+]+(\.[\w-+]+)*\.[\w-+]+$/i,
  // 身份证号码
  idCardNumber:
    /(^\d{8}(0\d|10|11|12)([0-2]\d|30|31)\d{3}$)|(^\d{6}(18|19|20)\d{2}(0\d|10|11|12)([0-2]\d|30|31)\d{3}(\d|X|x)$)/,
  hkCardNumber: /^[A-Z]{1}(\d{6})(\(\d\)|\d)?$/,
  moCardNumber: /^[A-Z]{1}\d{6}([A-Z]|\d)?$/,
  twCardNumber: /^[A-Z][1-2]\d{8}$/,
  // 护照
  passportNumber: /^[a-zA-Z0-9]{5,17}$/,
  // 香港通行证
  hkPassportNumber: /.*/,
  // 台湾通行证
  twPassportNumber: /.*/,
};

export const Validator = {
  isTelPhoneNumber: str => {
    return Reg.telPhoneNumber.test(str);
  },
  isEmailAddress: str => {
    return Reg.emailAddress.test(str);
  },
  isIdCardNumber: str => {
    return (
      Reg.idCardNumber.test(str) ||
      Reg.hkCardNumber.test(str) ||
      Reg.moCardNumber.test(str) ||
      Reg.twCardNumber.test(str)
    );
  },
  isPassportNumber: str => {
    return Reg.passportNumber.test(str);
  },
  isHkPassportNumber: str => {
    return Reg.hkPassportNumber.test(str);
  },
  isTwPassportNumber: str => {
    return Reg.twPassportNumber.test(str);
  },
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
    } catch (err) {
      console.log(err);
    }
  }

  return staticValue;
};

// 获取动态默认值
export const getDynamicValue = (data, currentItem, masterData, embedData) => {
  if (currentItem.isQueryWorksheetFill && !checkCellIsEmpty(currentItem.value)) {
    return currentItem.value;
  }
  let value = safeParse(currentItem.advancedSetting.defsource || '[]').map(item => {
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
            console.log(err);
            return '';
          }
        }

        // 数值类控件
        if (
          _.includes([6, 8, 28, 31], currentItem.type) ||
          (currentItem.type === 38 && currentItem.enumDefault === 2)
        ) {
          try {
            if (!sourcevalue) return '';
            let cValue = 0;
            const { options, enumDefault } = _.find(parentControl.relationControls, o => o.controlId === item.cid);

            safeParse(sourcevalue, 'array').forEach(key => {
              cValue += enumDefault ? options.find(o => o.key === key).score : 0;
            });

            return cValue;
          } catch (err) {
            console.log(err);
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
        console.log(err);
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
      if (typeof obj === 'string' && /[{|[]/.test(obj)) {
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

// 处理公式
export const parseNewFormula = (data, currentItem = {}) => {
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

export function asyncUpdateMdFunction({ formData, fnControl, update }) {
  try {
    execValueFunction(fnControl, formData, { update });
  } catch (err) {
    console.log(err);
  }
}

// 嵌入字段处理
export const parseValueIframe = (data, currentItem, masterData, embedData) => {
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
export const parseDateFormula = (data, currentItem, recordCreateTime) => {
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
        try {
          formatMode = getShowFormat(column);
        } catch (err) {
          console.log(err);
        }
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

function checkChildTableIsEmpty(control = {}) {
  const store = control.store;
  const state = store && store.getState();
  if (state && state.rows && !state.baseLoading) {
    return filterEmptyChildTableRows(state.rows).length <= 0;
  } else {
    return control.value === '0' || !control.value;
  }
}

// 检测必填
export const checkRequired = item => {
  let errorType = '';

  if (
    item.required &&
    ((item.type !== 34 && (!_.includes([6, 8], item.type) ? !item.value : isNaN(parseFloat(item.value)))) ||
      (item.type !== 34 && _.isString(item.value) && !item.value.trim()) ||
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
      (item.type === 34 && checkChildTableIsEmpty(item)) ||
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
        // 香港6262开头不识别特殊处理
        // 中国电话特殊处理
        errorType = !value || telIsValidNumber(value) ? '' : FORM_ERROR_TYPE.MOBILE_PHONE;
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

  if (_.includes([FROM.NEWRECORD, FROM.PUBLIC_ADD, FROM.H5_ADD, FROM.DRAFT], from)) {
    state.visible = fieldPermission[0] === '1' && fieldPermission[2] === '1' && controlPermissions[2] === '1';
    state.editable = fieldPermission[1] === '1';
  } else {
    state.visible = fieldPermission[0] === '1' && controlPermissions[0] === '1';
    state.editable = fieldPermission[1] === '1' && controlPermissions[1] === '1';
  }

  return state;
};

/*********************************************************************************
 * 以下是业务规则相关
 *********************************************************************************
 */
const TIME_OPTIONS = {
  1: 'year ',
  2: 'month',
  3: 'day',
  4: 'hour',
  5: 'minute',
  6: 'second',
  11: 'quarter',
};

const TIME_MODE_OPTIONS = {
  YYYY: 1,
  'YYYY-MM': 2,
  'YYYY-MM-DD': 3,
  'YYYY-MM-DD HH': 4,
  'YYYY-MM-DD HH:mm': 5,
  'YYYY-MM-DD HH:mm:ss': 6,
  'HH:mm': 5,
  'HH:mm:ss': 6,
};

const timeModeByDateRangeType = dateRangeType => {
  let rangeTypes = {};
  _.keys(DATE_RANGE_TYPE).forEach(key => {
    rangeTypes[DATE_RANGE_TYPE[key]] = key.toLowerCase();
  });
  return rangeTypes[dateRangeType];
};

// 时间格式化数值
const formatFnTimeValue = (value, mode) => {
  return moment(value).year()
    ? moment(moment(value).format(mode), mode).format(`YYYY-MM-DD ${mode}`)
    : moment(value, mode).format(`YYYY-MM-DD ${mode}`);
};

const getValueByDateRange = dateRange => {
  let value;
  _.flattenDeep(DATE_OPTIONS).map(o => {
    if (o.value === dateRange) {
      value = parseInt(o.text.replace(/\D/g, '')) || 0;
    }
  });
  return value;
};

// 时间字段根据显示格式处理数据
const getFormatMode = (control = {}, currentControl, type) => {
  let mode = '';
  let curMode = '';
  if (type === 10) {
    if (currentControl) {
      curMode = _.includes([15, 16], currentControl.type)
        ? (getDatePickerConfigs(currentControl) || {}).formatMode
        : control.unit === '1'
          ? 'HH:mm'
          : 'HH:mm:ss';
    }
    mode = control.unit === '1' ? 'HH:mm' : 'HH:mm:ss';
  } else {
    mode = (getDatePickerConfigs(control) || {}).formatMode;
    curMode = (getDatePickerConfigs(currentControl) || {}).formatMode;
  }
  if (_.isEmpty(currentControl) && curMode) return mode;
  return TIME_MODE_OPTIONS[mode] <= TIME_MODE_OPTIONS[curMode] ? mode : curMode;
};

const dateFn = (dateRange, value, isEQ) => {
  let result = true;
  switch (dateRange) {
    // { text: _l('本周'), value: 4 },
    case 4:
      result = moment(value).isSame(moment().startOf('week').format('YYYY-MM-DD'), 'week');
      break;
    // { text: _l('上周'), value: 5 },
    case 5:
      result = moment(value).isSame(moment().startOf('week').add(-1, 'week').format('YYYY-MM-DD'), 'week');
      break;
    // { text: _l('下周'), value: 6 },
    case 6:
      result = moment(value).isSame(moment().startOf('week').add(1, 'week').format('YYYY-MM-DD'), 'week');
      break;
    // { text: _l('本月'), value: 7 },
    case 7:
      result = moment(value).isSame(moment().startOf('month').format('YYYY-MM-DD'), 'month');
      break;
    // { text: _l('上个月'), value: 8 },
    case 8:
      result = moment(value).isSame(moment().startOf('month').add(-1, 'month').format('YYYY-MM-DD'), 'month');
      break;
    // { text: _l('下个月'), value: 9 },
    case 9:
      result = moment(value).isSame(moment().startOf('month').add(1, 'month').format('YYYY-MM-DD'), 'month');
      break;
    // { text: _l('本季度'), value: 12 },
    case 12:
      result = moment(value).isSame(moment().startOf('quarter').format('YYYY-MM-DD'), 'quarter');
      break;
    // { text: _l('上季度'), value: 13 },
    case 13:
      result = moment(value).isSame(moment().startOf('quarter').add(-1, 'quarter').format('YYYY-MM-DD'), 'quarter');
      break;
    // { text: _l('下季度'), value: 14 },
    case 14:
      result = moment(value).isSame(moment().startOf('quarter').add(-1, 'quarter').format('YYYY-MM-DD'), 'quarter');
      break;
    // { text: _l('今年'), value: 15 },
    case 15:
      result = moment(value).isSame(moment().startOf('year').format('YYYY-MM-DD'), 'year');
      break;
    // { text: _l('去年'), value: 16 },
    case 16:
      result = moment(value).isSame(moment().startOf('year').add(-1, 'year').format('YYYY-MM-DD'), 'year');
      break;
    // { text: _l('明年'), value: 17 },
    case 17:
      result = moment(value).isSame(moment().startOf('year').add(1, 'year').format('YYYY-MM-DD'), 'year');
      break;
  }
  return isEQ ? result : !result;
};

const dayFn = (filterData = {}, value, isGT, currentControl = {}) => {
  let { dateRange, dynamicSource = [], dataType, dateRangeType, value: editValue } = filterData;
  const { type } = currentControl;
  if (dynamicSource.length > 0) {
    dateRange = 0;
  }

  let dateRangeTypeNum;

  if (_.includes([101, 102], dateRange)) {
    const isFeature = dateRange === 102;
    // 过去....|将来...
    switch (dateRangeType) {
      case DATE_RANGE_TYPE.YEAR:
        dateRange = isFeature ? 17 : 16;
        dateRangeTypeNum = Number(`${isFeature ? '' : '-'}${editValue || 1}`);
        break;
      case DATE_RANGE_TYPE.QUARTER:
        dateRange = isFeature ? 14 : 13;
        dateRangeTypeNum = (editValue || 1) * 3;
        break;
      case DATE_RANGE_TYPE.MONTH:
        dateRange = isFeature ? 9 : 8;
        dateRangeTypeNum = editValue || 1;
        break;
      case DATE_RANGE_TYPE.DAY:
        dateRange = isFeature ? 3 : 2;
        dateRangeTypeNum = editValue || 1;
        break;
      case DATE_RANGE_TYPE.MINUTE:
        dateRangeTypeNum = value || 1;
        break;
    }
  }

  // isGT 早与 ！isGT 晚与
  switch (dateRange) {
    // { text: _l('今天'), value: 1 },
    case 1:
      return moment().format('YYYY-MM-DD');
    // { text: _l('昨天'), value: 2 },
    case 2:
      return moment()
        .subtract(dateRangeTypeNum || 1, 'days')
        .format('YYYY-MM-DD');
    // { text: _l('明天'), value: 3 },
    case 3:
      return moment()
        .add(dateRangeTypeNum || 1, 'days')
        .format('YYYY-MM-DD');
    // { text: _l('本周'), value: 4 },
    case 4:
      return isGT ? moment().weekday(0).format('YYYY-MM-DD') : moment().endOf('isoWeek').format('YYYY-MM-DD');
    // { text: _l('上周'), value: 5 },
    case 5:
      return isGT
        ? moment().weekday(-7).format('YYYY-MM-DD')
        : moment().weekday(0).subtract(1, 'days').format('YYYY-MM-DD');
    // { text: _l('下周'), value: 6 },
    case 6:
      return isGT ? moment().weekday(7).format('YYYY-MM-DD') : moment().weekday(7).add(6, 'days').format('YYYY-MM-DD');
    // { text: _l('本月'), value: 7 },
    case 7:
      return isGT ? moment().add('month', 0).format('YYYY-MM') + '-01' : moment().endOf('month').format('YYYY-MM-DD');
    // { text: _l('上个月'), value: 8 },
    case 8:
      return isGT
        ? moment()
            .month(moment().month() - (dateRangeTypeNum || 1))
            .startOf('month')
            .format('YYYY-MM-DD')
        : moment()
            .month(moment().month() - (dateRangeTypeNum || 1))
            .endOf('month')
            .format('YYYY-MM-DD');
    // { text: _l('下个月'), value: 9 },
    case 9:
      return isGT
        ? moment()
            .month(moment().month() + (dateRangeTypeNum || 1))
            .startOf('month')
            .format('YYYY-MM-DD')
        : moment()
            .month(moment().month() + (dateRangeTypeNum || 1))
            .endOf('month')
            .format('YYYY-MM-DD');
    // { text: _l('本季度'), value: 12 },
    case 12:
      return isGT ? moment().startOf('quarter').format('YYYY-MM-DD') : moment().endOf('quarter').format('YYYY-MM-DD');
    // { text: _l('上季度'), value: 13 },
    case 13:
      return isGT
        ? moment()
            .startOf('quarter')
            .subtract(dateRangeTypeNum || 3, 'month')
            .format('YYYY-MM-DD')
        : moment()
            .endOf('quarter')
            .subtract(dateRangeTypeNum || 3, 'month')
            .format('YYYY-MM-DD');
    // { text: _l('下季度'), value: 14 },
    case 14:
      return isGT
        ? moment()
            .startOf('quarter')
            .add(dateRangeTypeNum || 3, 'month')
            .format('YYYY-MM-DD')
        : moment()
            .endOf('quarter')
            .add(dateRangeTypeNum || 3, 'month')
            .format('YYYY-MM-DD');
    // { text: _l('今年'), value: 15 },
    case 15:
      return isGT ? moment().format('YYYY') + '-01' + '-01' : moment().endOf('year').format('YYYY-MM-DD');
    // { text: _l('去年'), value: 16 },
    case 16:
      return isGT
        ? moment()
            .add(dateRangeTypeNum || -1, 'year')
            .format('YYYY') +
            '-01' +
            '-01'
        : moment()
            .add(dateRangeTypeNum || -1, 'year')
            .endOf('year')
            .format('YYYY-MM-DD');
    // { text: _l('明年'), value: 17 },
    case 17:
      return isGT
        ? moment()
            .add(dateRangeTypeNum || 1, 'year')
            .format('YYYY') +
            '-01' +
            '-01'
        : moment()
            .add(dateRangeTypeNum || 1, 'year')
            .endOf('year')
            .format('YYYY-MM-DD');
    // { text: _l('过去...天'), value: 10 },
    case 10:
    case 21:
    case 22:
    case 23:
      return moment()
        .subtract(getValueByDateRange(dateRange) || value, 'day')
        .format('YYYY-MM-DD');
    // { text: _l('将来...天'), value: 11 },
    case 11:
    case 31:
    case 32:
    case 33:
      return moment()
        .add(getValueByDateRange(dateRange) || value, 'day')
        .format('YYYY-MM-DD');
    // { text: _l('指定时间'), value: 18 },
    case 18:
    case 101:
    case 102:
      const formatMode = (
        getDatePickerConfigs({ advancedSetting: { showtype: filterData.dataShowType }, type: dataType }) || {}
      ).formatMode;
      let tempTime = moment(value);
      if (dateRange === 101) {
        tempTime = moment().subtract(dateRangeTypeNum || 1, timeModeByDateRangeType(dateRangeType));
      } else if (dateRange === 102) {
        tempTime = moment().add(dateRangeTypeNum || 1, timeModeByDateRangeType(dateRangeType));
      }
      return tempTime.format(formatMode || 'YYYY-MM-DD');
    default:
      //日期时间
      const formatText = (getDatePickerConfigs(currentControl) || {}).formatMode;
      return type === 16 ? moment(value).format(formatText) : moment(value).format(formatText);
  }
};

export const filterFn = (filterData, originControl, data = [], recordId) => {
  try {
    let { filterType = '', dataType = '', dynamicSource = [], dateRange, dateRangeType } = filterData;
    const control = redefineComplexControl(originControl);
    if (!control) {
      return true;
    }
    //比较字段值
    let compareValues = filterData.values || [];
    let compareValue = filterData.value || '';
    // 时间比较精度
    let formatMode = '';
    let timeLevel = '';
    //条件字段值
    let { value = '', advancedSetting = {} } = control;
    // 指定时间添加显示格式配置
    if (filterData.dateRange === 18) {
      filterData.dataShowType = dateRangeType === 3 ? advancedSetting.showtype : dateRangeType;
    }
    //手机号去除区号
    if (control.type === 3) {
      value = (value || '').replace('+86', '');
    }
    if (_.includes([9, 10, 11], control.type) && value && value.indexOf('other')) {
      const optionsFormatVal = safeParse(value, 'array').map(i => (i.startsWith('other:') ? 'other' : i));
      value = JSON.stringify(optionsFormatVal);
    }

    value = value === null ? '' : value;
    if (control.type === API_ENUM_TO_TYPE.MONEY_CN) {
      let controlId = control.dataSource.replace(/\$/g, '');
      const itemData = data.find(it => it.controlId === controlId) || {};
      value = itemData.value;
    }
    const conditionGroupKey = getTypeKey(control.type);
    const conditionGroup = CONTROL_FILTER_WHITELIST[conditionGroupKey] || {};
    const conditionGroupType = getConditionType({
      ...filterData,
      controlType: dataType,
      conditionGroupType: conditionGroup.value,
      type: filterType,
    });
    const { showtype } = advancedSetting; // 1 卡片 2 列表 3 下拉
    let currentControl = {};
    //是否多选
    if (dynamicSource.length > 0) {
      const { cid = '' } = dynamicSource[0];
      if (cid === 'rowid') {
        currentControl = { type: 2, value: recordId };
      } else if (cid === 'currenttime') {
        currentControl = {
          type: 16,
          advancedSetting: { showtype: '6' },
          value: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        };
      } else if (cid === 'user-self') {
        currentControl = {
          type: 26,
          value: JSON.stringify([{ accountId: md.global.Account.accountId, name: _l('当前用户') }]),
        };
      } else {
        currentControl = _.cloneDeep(_.find(data, it => it.controlId === cid)) || {};
      }
      // 他表字段取原字段类型，不然日期值截取有问题，比较出错
      if (currentControl.type === 30) {
        currentControl.type = currentControl.sourceControlType;
      }
      if (currentControl.type === 3) {
        currentControl.value = (currentControl.value || '').replace('+86', '');
      }
      //是(等于)、不是(不等于)、大于(等于)、小于(等于) && NUMBER
      //大于、小于 && NUMBER、DATE
      //日期是、日期不是 && DATE
      if (
        (_.includes([2, 6, 14, 16], filterType) && _.includes([2], conditionGroupType)) ||
        (_.includes([13, 15], filterType) && _.includes([2], conditionGroupType))
      ) {
        compareValue = currentControl.value;
        // 日期或时间字段根据显示格式处理数据
      } else if (_.includes([17, 18, 33, 34, 35, 36, 37, 38], filterType) && _.includes([4, 10], conditionGroupType)) {
        compareValue = currentControl.value;
        //是(等于)、不是(不等于) && (OPTIONS && (单选) || USER)
      } else if (
        _.includes([2, 6, 26, 27, 51, 52], filterType) &&
        ((_.includes([5], conditionGroupType) && _.includes([9, 10, 11, 27, 48], dataType)) ||
          _.includes([6], conditionGroupType))
      ) {
        const val = currentControl.value ? safeParse(currentControl.value) : currentControl.value;
        compareValues = typeof val === 'object' ? val : [currentControl.value];
      } else if (_.includes([24, 25, 26, 27, 28, 51, 52], filterType) && _.includes([29, 35], dataType)) {
        const val = currentControl.value ? safeParse(currentControl.value) : currentControl.value;
        compareValues = typeof val === 'object' ? val : [currentControl.value];
      } else {
        compareValues = [currentControl.value];
      }
    } else {
      // options类型
      if (_.includes([26, 27, 48], control.type)) {
        compareValues = compareValues.map(item => {
          let curI = item ? JSON.parse(item) : item;
          if ((_.get(curI, 'accountId') || _.get(curI, 'id')) === 'user-self') {
            curI.accountId = md.global.Account.accountId;
            delete curI.id;
          }
          return curI;
        });
      } else if (control.type === 16 && value) {
        value = dateConvertToUserZone(value);
      }
    }

    if (_.isArray(compareValues)) {
      compareValues = compareValues.filter(i => !isEmptyValue(i));
    }

    // 时间类显示类型
    if (_.includes([15, 16, 46], control.type)) {
      formatMode = getFormatMode(control, currentControl, conditionGroupType);
      timeLevel = TIME_OPTIONS[TIME_MODE_OPTIONS[formatMode]];

      if (!dynamicSource.length) {
        // 今天、昨天、明天，对比单位天
        if (_.includes([1, 2, 3, 10, 11], dateRange)) {
          timeLevel = 'day';
        } else if (_.includes([4, 5, 6], dateRange)) {
          timeLevel = 'week';
        } else if (_.includes([7, 8, 9], dateRange)) {
          timeLevel = 'month';
        } else if (_.includes([12, 13, 14], dateRange)) {
          timeLevel = 'quarter';
        } else if (_.includes([15, 16, 17], dateRange)) {
          timeLevel = 'year';
        } else if (dateRange === 18) {
          timeLevel = dateRangeType === '3' ? timeLevel : timeModeByDateRangeType(dateRangeType);
        }
      }
    }

    // value精度处理(公式、汇总计算)
    function formatValueByUnit(v, con = {}) {
      const isNumShow = (con.advancedSetting || {}).numshow === '1';
      return (con.originType === 37 || con.type === 31 || (con.originType === 30 && con.sourceControltype === 37)) &&
        v &&
        /^\d+\.\d+$/.test(`${v}`)
        ? accDiv(parseFloat(toFixed(accMul(parseFloat(v), 100), isNumShow ? con.dot + 2 : con.dot)), 100)
        : v;
    }
    value = formatValueByUnit(value, control);
    compareValue = formatValueByUnit(compareValue, currentControl);

    let store, state;

    switch (filterType) {
      //   LIKE: 1, // 包含
      case FILTER_CONDITION_TYPE.LIKE:
        switch (conditionGroupType) {
          case CONTROL_FILTER_WHITELIST.TEXT.value:
            let isInValue = false;
            _.map(compareValues, it => {
              if (value.indexOf(it) >= 0) {
                isInValue = true;
              }
            });
            return isInValue;
          default:
            return true;
        }
      // EQ: 2, // 是（等于）
      // EQ_FOR_SINGLE: 51 是
      case FILTER_CONDITION_TYPE.EQ:
      case FILTER_CONDITION_TYPE.EQ_FOR_SINGLE:
        switch (conditionGroupType) {
          case CONTROL_FILTER_WHITELIST.USERS.value: // ???
            if (_.isEmpty(value) && _.isEmpty(compareValues)) return true;

            let isEQ = false;
            _.map(compareValues, (it = {}) => {
              let user = safeParse(value || '[]');
              _.map(user, its => {
                if (its.accountId === (it.id || it.accountId)) {
                  isEQ = true;
                }
              });
            });
            return isEQ;
          case CONTROL_FILTER_WHITELIST.OPTIONS.value:
            // 地区
            if (
              (dataType === API_ENUM_TO_TYPE.AREA_INPUT_19 ||
                dataType === API_ENUM_TO_TYPE.AREA_INPUT_23 ||
                dataType === API_ENUM_TO_TYPE.AREA_INPUT_24) &&
              !!compareValues
            ) {
              if (!value) {
                return !!value;
              }

              const { code } = safeParse(value || '{}');
              const areaValues = compareValues.map(it => safeParse(it, '{}').id);
              return _.includes(areaValues, code);
              // 部门
            } else if (dataType === API_ENUM_TO_TYPE.GROUP_PICKER) {
              if (_.isEmpty(value) && _.isEmpty(compareValues)) return true;

              let isEQ = false;
              _.map(compareValues, (it = {}) => {
                let valueN = safeParse(value || '[]');
                _.map(valueN, item => {
                  if ((it.departmentId || it.id) === item.departmentId) {
                    isEQ = true;
                  }
                });
              });
              return isEQ;
              // 组织角色
            } else if (dataType === API_ENUM_TO_TYPE.ORG_ROLE) {
              if (_.isEmpty(value) && _.isEmpty(compareValues)) return true;

              let isEQ = false;
              _.map(compareValues, (it = {}) => {
                let valueN = safeParse(value || '[]');
                _.map(valueN, item => {
                  if ((it.organizeId || it.id) === item.organizeId) {
                    isEQ = true;
                  }
                });
              });
              return isEQ;
              // 等级
            } else if (dataType === API_ENUM_TO_TYPE.SCORE) {
              return _.includes(compareValues, value.toString());
            } else if (
              [API_ENUM_TO_TYPE.OPTIONS_10, API_ENUM_TO_TYPE.OPTIONS_11, API_ENUM_TO_TYPE.OPTIONS_9].includes(dataType)
            ) {
              if (_.isEmpty(value) && _.isEmpty(compareValues)) return true;

              if (dataType === API_ENUM_TO_TYPE.OPTIONS_10) {
                // 多选10
                let isEQ = false;
                safeParse(value || '[]').forEach(singleValue => {
                  if (_.includes(compareValues, singleValue)) {
                    isEQ = true;
                  }
                });
                return isEQ;
              } else {
                return compareValues.includes(safeParse(value || '[]')[0]);
              }
            } else {
              if (!value) {
                return !!value;
              }
              return _.includes(compareValues, value);
            }
          case CONTROL_FILTER_WHITELIST.NUMBER.value:
            if (isEmptyValue(value) && isEmptyValue(compareValue)) return true;
            return parseFloat(compareValue) === parseFloat(value);
          case CONTROL_FILTER_WHITELIST.TEXT.value:
            if (isEmptyValue(value) && _.isEmpty(compareValues)) return true;
            let isInValue = false;
            _.map(compareValues, it => {
              if (it === value) {
                isInValue = true;
              }
            });
            return isInValue;
          case CONTROL_FILTER_WHITELIST.BOOL.value:
            return value === '1';
          // 给EQ_FOR_SINGLE专用
          case CONTROL_FILTER_WHITELIST.RELATE_RECORD.value:
          case CONTROL_FILTER_WHITELIST.CASCADER.value:
            let isInVal = false;
            _.map(compareValues, it => {
              let itValue = dynamicSource.length > 0 ? it || {} : safeParse(it || '{}');
              let valueN = _.isArray(value) ? value : safeParse(value || '[]', 'array');
              _.map(valueN, item => {
                let curId = dynamicSource.length > 0 ? itValue.sid : itValue.id;
                if (curId === item.sid) {
                  isInVal = true;
                }
              });
            });
            return isInVal;
          default:
            return true;
        }
      //   START: 3, // 开头是
      case FILTER_CONDITION_TYPE.START:
        switch (conditionGroupType) {
          case CONTROL_FILTER_WHITELIST.TEXT.value:
            let isInValue = false;
            _.map(compareValues, it => {
              if (value.startsWith(it)) {
                isInValue = true;
              }
            });
            return isInValue;
          default:
            return true;
        }
      //   N_START: 9, // 开头不是
      case FILTER_CONDITION_TYPE.N_START:
        switch (conditionGroupType) {
          case CONTROL_FILTER_WHITELIST.TEXT.value:
            let isInValue = true;
            _.map(compareValues, it => {
              if (value.startsWith(it)) {
                isInValue = false;
              }
            });
            return isInValue;
          default:
            return true;
        }
      //   END: 4, // 结尾是
      case FILTER_CONDITION_TYPE.END:
        switch (conditionGroupType) {
          case CONTROL_FILTER_WHITELIST.TEXT.value:
            var isInValue = false;
            _.map(compareValues, function (it) {
              if (value.endsWith(it)) {
                isInValue = true;
              }
            });
            return isInValue;
          default:
            return true;
        }
      //   N_END: 10, // 结尾不是
      case FILTER_CONDITION_TYPE.N_END:
        switch (conditionGroupType) {
          case CONTROL_FILTER_WHITELIST.TEXT.value:
            let isInValue = true;
            _.map(compareValues, function (it) {
              if (value.endsWith(it)) {
                isInValue = false;
              }
            });
            return isInValue;
          default:
            return true;
        }
      //   NCONTAIN: 5, // 不包含
      case FILTER_CONDITION_TYPE.NCONTAIN:
        switch (conditionGroupType) {
          case CONTROL_FILTER_WHITELIST.TEXT.value:
            let isInValue = true;
            _.map(compareValues, it => {
              if (value.indexOf(it) >= 0) {
                isInValue = false;
              }
            });
            return isInValue;
          default:
            return true;
        }
      //   NE: 6, // 不是（不等于）
      //   NE_FOR_SINGLE: 52 不是
      case FILTER_CONDITION_TYPE.NE:
      case FILTER_CONDITION_TYPE.NE_FOR_SINGLE:
        switch (conditionGroupType) {
          case CONTROL_FILTER_WHITELIST.USERS.value: // ???
            if (_.isEmpty(value) && _.isEmpty(compareValues)) return false;

            let isInValue = true;
            _.map(compareValues, (it = {}) => {
              let user = safeParse(value || '[]');
              _.map(user, its => {
                if (its.accountId === (it.id || it.accountId)) {
                  isInValue = false;
                }
              });
            });
            return isInValue;
          case CONTROL_FILTER_WHITELIST.OPTIONS.value:
            // 地区
            if (
              (dataType === API_ENUM_TO_TYPE.AREA_INPUT_19 ||
                dataType === API_ENUM_TO_TYPE.AREA_INPUT_23 ||
                dataType === API_ENUM_TO_TYPE.AREA_INPUT_24) &&
              !!compareValues
            ) {
              if (!value) {
                return !!value;
              }
              const { code } = safeParse(value || '{}');
              const areaValues = compareValues.map(it => safeParse(it, '{}').id);
              return !_.includes(areaValues, code);
              // 部门
            } else if (dataType === API_ENUM_TO_TYPE.GROUP_PICKER) {
              if (_.isEmpty(value) && _.isEmpty(compareValues)) return false;

              let isNE = true;
              _.map(compareValues, (it = {}) => {
                let valueN = safeParse(value || '[]');
                _.map(valueN, item => {
                  if ((it.departmentId || it.id) === item.departmentId) {
                    isNE = false;
                  }
                });
              });
              return isNE;
              // 等级
            } else if (dataType === API_ENUM_TO_TYPE.ORG_ROLE) {
              if (_.isEmpty(value) && _.isEmpty(compareValues)) return false;

              let isNE = true;
              _.map(compareValues, (it = {}) => {
                let valueN = safeParse(value || '[]');
                _.map(valueN, item => {
                  if ((it.organizeId || it.id) === item.organizeId) {
                    isNE = false;
                  }
                });
              });
              return isNE;
              // 等级
            } else if (dataType === API_ENUM_TO_TYPE.SCORE) {
              return !_.includes(compareValues, value.toString());
            } else if (
              [API_ENUM_TO_TYPE.OPTIONS_10, API_ENUM_TO_TYPE.OPTIONS_11, API_ENUM_TO_TYPE.OPTIONS_9].includes(dataType)
            ) {
              if (_.isEmpty(value) && _.isEmpty(compareValues)) return false;

              if (dataType === API_ENUM_TO_TYPE.OPTIONS_10) {
                let isEQ = true;
                safeParse(value || '[]').forEach(singleValue => {
                  if (_.includes(compareValues, singleValue)) {
                    isEQ = false;
                  }
                });
                return isEQ;
              } else {
                return !compareValues.includes(safeParse(value || '[]')[0]);
              }
            } else {
              if (!value) {
                return !value;
              }
              return !_.includes(compareValues, value);
            }
          case CONTROL_FILTER_WHITELIST.NUMBER.value:
            if (isEmptyValue(value) && isEmptyValue(compareValue)) return false;
            return parseFloat(compareValue || 0) !== parseFloat(value || 0);
          case CONTROL_FILTER_WHITELIST.TEXT.value:
            if (isEmptyValue(value) && _.isEmpty(compareValues)) return false;
            let isInValue1 = true;
            _.map(compareValues, it => {
              if (it === value) {
                isInValue1 = false;
              }
            });
            return isInValue1;
          case CONTROL_FILTER_WHITELIST.BOOL.value:
            return value !== '1';
          // 给NE_FOR_SINGLE专用
          case CONTROL_FILTER_WHITELIST.RELATE_RECORD.value:
          case CONTROL_FILTER_WHITELIST.CASCADER.value:
            let isInV = true;
            _.map(compareValues, it => {
              let itValue = {};
              itValue = dynamicSource.length > 0 ? it || {} : safeParse(it || '{}');
              let valueN = _.isArray(value) ? value : safeParse(value || '[]', 'array');
              _.map(valueN, item => {
                let curId = dynamicSource.length > 0 ? itValue.sid : itValue.id;
                if (curId === item.sid) {
                  isInV = false;
                }
              });
            });
            return isInV;
          default:
            return true;
        }
      //   ISNULL: 7, // 为空
      case FILTER_CONDITION_TYPE.ISNULL:
        switch (conditionGroupType) {
          case CONTROL_FILTER_WHITELIST.DATE.value:
          case CONTROL_FILTER_WHITELIST.TIME.value:
          case CONTROL_FILTER_WHITELIST.TEXT.value:
          case CONTROL_FILTER_WHITELIST.NUMBER.value:
            return !value;
          case CONTROL_FILTER_WHITELIST.OPTIONS.value:
            //地区
            if (
              (dataType === API_ENUM_TO_TYPE.AREA_INPUT_19 ||
                dataType === API_ENUM_TO_TYPE.AREA_INPUT_23 ||
                dataType === API_ENUM_TO_TYPE.AREA_INPUT_24) &&
              !!compareValues
            ) {
              return !safeParse(value || '{}').code;
              //等级
            } else if (dataType === API_ENUM_TO_TYPE.SCORE) {
              return !value;
            }
            return safeParse(value || '[]').length <= 0;
          case CONTROL_FILTER_WHITELIST.BOOL.value:
            if (!value) {
              return !value;
            }
            if (dataType === API_ENUM_TO_TYPE.ATTACHMENT) {
              let data = safeParse(value);
              if (_.isArray(data)) {
                return data.length <= 0;
              } else {
                return (
                  data.attachments.length <= 0 && data.knowledgeAtts.length <= 0 && data.attachmentData.length <= 0
                );
              }
            } else if (dataType === API_ENUM_TO_TYPE.RELATION) {
              return safeParse(value).length <= 0;
            }
            return !value;
          case CONTROL_FILTER_WHITELIST.USERS.value:
          case CONTROL_FILTER_WHITELIST.CASCADER.value:
            if (!value) {
              return !value;
            } else {
              return safeParse(value).length <= 0;
            }
          case CONTROL_FILTER_WHITELIST.RELATE_RECORD.value:
            if (_.includes(['2', '5', '6'], showtype)) {
              //关联表 列表
              if (_.isArray(value)) {
                return value.length === 0;
              }
              if (!value) {
                return !value;
              } else {
                return value === '0';
              }
            } else {
              if (!value) {
                return !value;
              } else {
                return (
                  safeParse(value).length <= 0 ||
                  (typeof value === 'string' && value.startsWith('deleteRowIds')) ||
                  value === '0'
                );
              }
            }
          case CONTROL_FILTER_WHITELIST.SUBLIST.value: // 子表
            store = control.store;
            state = store && store.getState();
            if (state && state.rows && !state.baseLoading && !state.dataLoading) {
              return filterEmptyChildTableRows(state.rows).length <= 0;
            } else {
              return value === '0' || !value;
            }
          default:
            return true;
        }
      //   HASVALUE: 8, // 不为空
      case FILTER_CONDITION_TYPE.HASVALUE:
        switch (conditionGroupType) {
          case CONTROL_FILTER_WHITELIST.DATE.value:
          case CONTROL_FILTER_WHITELIST.TIME.value:
          case CONTROL_FILTER_WHITELIST.TEXT.value:
          case CONTROL_FILTER_WHITELIST.NUMBER.value:
            return !!value;
          case CONTROL_FILTER_WHITELIST.OPTIONS.value:
            //地区
            if (
              (dataType === API_ENUM_TO_TYPE.AREA_INPUT_19 ||
                dataType === API_ENUM_TO_TYPE.AREA_INPUT_23 ||
                dataType === API_ENUM_TO_TYPE.AREA_INPUT_24) &&
              !!compareValues
            ) {
              return safeParse(value || '{}').code;
              //等级
            } else if (dataType === API_ENUM_TO_TYPE.SCORE) {
              return !!value;
            }
            return safeParse(value || '[]').length > 0;
          case CONTROL_FILTER_WHITELIST.BOOL.value:
            if (!value) {
              return !!value;
            }
            if (dataType === API_ENUM_TO_TYPE.ATTACHMENT) {
              let data = safeParse(value);
              if (_.isArray(data)) {
                return data.length > 0;
              } else {
                return !(
                  data.attachments.length <= 0 &&
                  data.knowledgeAtts.length <= 0 &&
                  data.attachmentData.length <= 0
                );
              }
            } else if (dataType === API_ENUM_TO_TYPE.RELATION) {
              return safeParse(value).length > 0;
            }
            return !!value;
          case CONTROL_FILTER_WHITELIST.USERS.value:
          case CONTROL_FILTER_WHITELIST.CASCADER.value:
            if (!value) {
              return !!value;
            } else {
              return safeParse(value).length > 0;
            }
          case CONTROL_FILTER_WHITELIST.RELATE_RECORD.value:
            if (_.includes(['2', '5', '6'], showtype)) {
              //关联表 列表
              if (_.isArray(value)) {
                return value.length !== 0;
              }
              if (!value) {
                return !!value;
              } else {
                return value !== '0';
              }
            } else {
              if (!value) {
                return !!value;
              } else {
                return safeParse(value).length > 0;
              }
            }
          case CONTROL_FILTER_WHITELIST.SUBLIST.value: // 子表
            store = control.store;
            state = store && store.getState();
            if (state && state.rows && !state.baseLoading && !state.dataLoading) {
              return filterEmptyChildTableRows(state.rows).length > 0;
            } else {
              if (_.isObject(value)) {
                return filterEmptyChildTableRows(value.rows).length > 0;
              }
              return Number(value) > 0;
            }
          default:
            return true;
        }
      //   BETWEEN: 11, // 在范围内
      // DATE_BETWEEN: 31, // 在范围内
      case FILTER_CONDITION_TYPE.BETWEEN:
      case FILTER_CONDITION_TYPE.DATE_BETWEEN:
        switch (conditionGroupType) {
          case CONTROL_FILTER_WHITELIST.NUMBER.value:
            if (isEmptyValue(value)) return false;
            return (
              parseFloat(value) <= parseFloat(filterData.maxValue || 0) &&
              parseFloat(value) >= parseFloat(filterData.minValue || 0)
            );
          case CONTROL_FILTER_WHITELIST.DATE.value:
            return value
              ? moment(value).isBetween(
                  moment(filterData.minValue).format(formatMode),
                  moment(filterData.maxValue).format(formatMode),
                  timeLevel,
                )
              : false;
          case CONTROL_FILTER_WHITELIST.TIME.value:
            return value
              ? moment(value, formatMode).isBetween(
                  moment(filterData.minValue, formatMode).format(`YYYY-MM-DD ${formatMode}`),
                  moment(filterData.maxValue, formatMode).format(`YYYY-MM-DD ${formatMode}`),
                  timeLevel,
                )
              : false;
          case CONTROL_FILTER_WHITELIST.OPTIONS.value:
            if (
              (dataType === API_ENUM_TO_TYPE.AREA_INPUT_19 ||
                dataType === API_ENUM_TO_TYPE.AREA_INPUT_23 ||
                dataType === API_ENUM_TO_TYPE.AREA_INPUT_24) &&
              !!compareValues
            ) {
              if (!value) {
                return !!value;
              }
              const { code } = safeParse(value || '{}');
              const areaValues = compareValues.map(it => safeParse(it, '{}').id);
              return _.includes(areaValues, code);
              // 部门
            }
            break;
          default:
            return true;
        }
        break;
      //   NBETWEEN: 12, // 不在范围内
      //   DATE_NBETWEEN 32 //不在范围内
      case FILTER_CONDITION_TYPE.NBETWEEN:
      case FILTER_CONDITION_TYPE.DATE_NBETWEEN:
        switch (conditionGroupType) {
          case CONTROL_FILTER_WHITELIST.NUMBER.value:
            if (isEmptyValue(value)) return true;
            return (
              parseFloat(value) > parseFloat(filterData.maxValue || 0) ||
              parseFloat(value) < parseFloat(filterData.minValue || 0)
            );
          case CONTROL_FILTER_WHITELIST.DATE.value:
            return value
              ? !moment(value).isBetween(
                  moment(filterData.minValue).format(formatMode),
                  moment(filterData.maxValue).format(formatMode),
                  timeLevel,
                )
              : false;
          case CONTROL_FILTER_WHITELIST.TIME.value:
            return value
              ? !moment(value, formatMode).isBetween(
                  moment(filterData.minValue, formatMode).format(`YYYY-MM-DD ${formatMode}`),
                  moment(filterData.maxValue, formatMode).format(`YYYY-MM-DD ${formatMode}`),
                  timeLevel,
                )
              : false;
          case CONTROL_FILTER_WHITELIST.OPTIONS.value:
            if (
              (dataType === API_ENUM_TO_TYPE.AREA_INPUT_19 ||
                dataType === API_ENUM_TO_TYPE.AREA_INPUT_23 ||
                dataType === API_ENUM_TO_TYPE.AREA_INPUT_24) &&
              !!compareValues
            ) {
              if (!value) {
                return !!value;
              }
              const { code } = safeParse(value || '{}');
              const areaValues = compareValues.map(it => safeParse(it, '{}').id);
              return !_.includes(areaValues, code);
              // 部门
            }
            break;
          default:
            return true;
        }
        break;
      //   GT: 13, // > 晚于
      //   DATE_GT: 33, // > 晚于
      case FILTER_CONDITION_TYPE.GT:
      case FILTER_CONDITION_TYPE.DATE_GT:
        switch (conditionGroupType) {
          case CONTROL_FILTER_WHITELIST.NUMBER.value:
            if (isEmptyValue(value) || isEmptyValue(compareValue)) return false;
            return parseFloat(value) > parseFloat(compareValue);
          case CONTROL_FILTER_WHITELIST.DATE.value:
            let day = dayFn(filterData, compareValue, false, currentControl);
            return !value || (!!dynamicSource.length && !compareValue) ? false : moment(value).isAfter(day, timeLevel);
          case CONTROL_FILTER_WHITELIST.TIME.value:
            return !value || (!!dynamicSource.length && !compareValue)
              ? false
              : moment(value, formatMode).isAfter(formatFnTimeValue(compareValue, formatMode), timeLevel);
          default:
            return true;
        }
      //   GTE: 14, // >=
      //   DATE_GTE: 34, // >= 晚于等于
      case FILTER_CONDITION_TYPE.GTE:
      case FILTER_CONDITION_TYPE.DATE_GTE:
        switch (conditionGroupType) {
          case CONTROL_FILTER_WHITELIST.NUMBER.value:
            if (isEmptyValue(value) || isEmptyValue(compareValue)) return false;
            return parseFloat(value) >= parseFloat(compareValue);
          case CONTROL_FILTER_WHITELIST.DATE.value:
            let day = dayFn(filterData, compareValue, false, currentControl);
            return !value || (!!dynamicSource.length && !compareValue)
              ? false
              : moment(value).isSameOrAfter(day, timeLevel);
          case CONTROL_FILTER_WHITELIST.TIME.value:
            return !value || (!!dynamicSource.length && !compareValue)
              ? false
              : moment(value, formatMode).isSameOrAfter(formatFnTimeValue(compareValue, formatMode), timeLevel);
          default:
            return true;
        }
      //   LT: 15, // < 早于
      //   DATE_LT: 35, // < 早于
      case FILTER_CONDITION_TYPE.LT:
      case FILTER_CONDITION_TYPE.DATE_LT:
        switch (conditionGroupType) {
          case CONTROL_FILTER_WHITELIST.NUMBER.value:
            if (isEmptyValue(value) || isEmptyValue(compareValue)) return false;
            return parseFloat(value) < parseFloat(compareValue);
          case CONTROL_FILTER_WHITELIST.DATE.value:
            let day = dayFn(filterData, compareValue, true, currentControl);
            return !value || (!!dynamicSource.length && !compareValue) ? false : moment(value).isBefore(day, timeLevel);
          case CONTROL_FILTER_WHITELIST.TIME.value:
            return !value || (!!dynamicSource.length && !compareValue)
              ? false
              : moment(value, formatMode).isBefore(formatFnTimeValue(compareValue, formatMode), timeLevel);
          default:
            return true;
        }
      //   LTE: 16, // <=
      //   DATE_LTE: 36, // <= 早于等于
      case FILTER_CONDITION_TYPE.LTE:
      case FILTER_CONDITION_TYPE.DATE_LTE:
        switch (conditionGroupType) {
          case CONTROL_FILTER_WHITELIST.NUMBER.value:
            if (isEmptyValue(value) || isEmptyValue(compareValue)) return false;
            return parseFloat(value) <= parseFloat(compareValue);
          case CONTROL_FILTER_WHITELIST.DATE.value:
            let day = dayFn(filterData, compareValue, false, currentControl);
            return !value || (!!dynamicSource.length && !compareValue)
              ? false
              : moment(value).isSameOrBefore(day, timeLevel);
          case CONTROL_FILTER_WHITELIST.TIME.value:
            return !value || (!!dynamicSource.length && !compareValue)
              ? false
              : moment(value, formatMode).isSameOrBefore(formatFnTimeValue(compareValue, formatMode), timeLevel);
          default:
            return true;
        }
      //   DATEENUM: 17, // 日期是
      //   DATE_EQ: 37, // 日期是
      case FILTER_CONDITION_TYPE.DATEENUM:
      case FILTER_CONDITION_TYPE.DATE_EQ:
        switch (conditionGroupType) {
          case CONTROL_FILTER_WHITELIST.DATE.value:
            if (!value || (!!dynamicSource.length && !compareValue)) return false;
            let day = dayFn(filterData, compareValue, true, currentControl);
            //过去 | 将来
            const hasToday = _.includes(filterData.values || [], 'today');
            if (_.includes([10, 101], dateRange)) {
              return hasToday
                ? moment(value).isSameOrBefore(moment(), timeLevel) && moment(value).isSameOrAfter(day, timeLevel)
                : moment(value).isBefore(moment(), timeLevel) && moment(value).isSameOrAfter(day, timeLevel);
            } else if (_.includes([11, 102], dateRange)) {
              return hasToday
                ? moment(value).isSameOrAfter(moment(), timeLevel) && moment(value).isSameOrBefore(day, timeLevel)
                : moment(value).isAfter(moment(), timeLevel) && moment(value).isSameOrBefore(day, timeLevel);
              // 本周、本月、本季度、今年等等
            } else if (_.includes([4, 5, 6, 7, 8, 9, 12, 13, 14, 15, 16, 17], dateRange) && !dynamicSource.length) {
              return dateFn(dateRange, value, true);
            }
            return moment(value).isSame(day, timeLevel);
          case CONTROL_FILTER_WHITELIST.TIME.value:
            return !value || (!!dynamicSource.length && !compareValue)
              ? false
              : moment(value, formatMode).isSame(formatFnTimeValue(compareValue, formatMode), timeLevel);
          default:
            return true;
        }
      //   NDATEENUM: 18, // 日期不是
      //   DATE_NE: 38,  // 日期不是
      case FILTER_CONDITION_TYPE.NDATEENUM:
      case FILTER_CONDITION_TYPE.DATE_NE:
        switch (conditionGroupType) {
          case CONTROL_FILTER_WHITELIST.DATE.value:
            if (!value || (!!dynamicSource.length && !compareValue)) return false;
            let day = dayFn(filterData, compareValue, true, currentControl);
            //过去 | 将来
            const hasToday = _.includes(filterData.values || [], 'today');
            if (dateRange === 10) {
              return (
                (hasToday ? moment(value).isAfter(moment(), 'day') : moment(value).isSameOrAfter(moment(), 'day')) ||
                moment(value).isBefore(day, 'day')
              );
            } else if (dateRange === 11) {
              return (
                (hasToday ? moment(value).isBefore(moment(), 'day') : moment(value).isSameOrBefore(moment(), 'day')) ||
                moment(value).isAfter(day, 'day')
              );
              // 本周、本月、本季度、今年等等
            } else if (_.includes([4, 5, 6, 7, 8, 9, 12, 13, 14, 15, 16, 17], dateRange) && !dynamicSource.length) {
              return dateFn(dateRange, value, false);
            }
            return !moment(value).isSame(day, timeLevel);
          case CONTROL_FILTER_WHITELIST.TIME.value:
            return !value || (!!dynamicSource.length && !compareValue)
              ? false
              : !moment(value, formatMode).isSame(formatFnTimeValue(compareValue, formatMode), timeLevel);
          default:
            return true;
        }
      //   RCEQ: 24, // 关联表 (单条) 级联选择  =>是
      case FILTER_CONDITION_TYPE.RCEQ:
        switch (conditionGroupType) {
          case CONTROL_FILTER_WHITELIST.RELATE_RECORD.value:
          case CONTROL_FILTER_WHITELIST.CASCADER.value:
            let isInValue = false;
            _.map(compareValues, it => {
              let itValue = dynamicSource.length > 0 ? it || {} : safeParse(it || '{}');
              let valueN = _.isArray(value) ? value : safeParse(value || '[]', 'array');
              _.map(valueN, item => {
                let curId = dynamicSource.length > 0 ? itValue.sid : itValue.id;
                if (curId === item.sid) {
                  isInValue = true;
                }
              });
            });
            return isInValue;
          default:
            return true;
        }
      //   RCNE: 25, // 关联表(单条) 级联选择 =>不是
      case FILTER_CONDITION_TYPE.RCNE:
        switch (conditionGroupType) {
          case CONTROL_FILTER_WHITELIST.RELATE_RECORD.value:
          case CONTROL_FILTER_WHITELIST.CASCADER.value:
            let isInValue = true;
            _.map(compareValues, it => {
              let itValue = {};
              itValue = dynamicSource.length > 0 ? it || {} : safeParse(it || '{}');
              let valueN = _.isArray(value) ? value : safeParse(value || '[]', 'array');
              _.map(valueN, item => {
                let curId = dynamicSource.length > 0 ? itValue.sid : itValue.id;
                if (curId === item.sid) {
                  isInValue = false;
                }
              });
            });
            return isInValue;
          default:
            return true;
        }
      // ARREQ：26, // 数组等于
      case FILTER_CONDITION_TYPE.ARREQ:
        switch (conditionGroupType) {
          case CONTROL_FILTER_WHITELIST.USERS.value: // ???
            if (_.isEmpty(value) && _.isEmpty(compareValues)) return true;

            return _.isEqual(
              compareValues.map((it = {}) => it.id || it.accountId).sort(),
              safeParse(value || '[]')
                .map(its => its.accountId)
                .sort(),
            );
          case CONTROL_FILTER_WHITELIST.OPTIONS.value:
            // 部门
            if (dataType === API_ENUM_TO_TYPE.GROUP_PICKER) {
              if (_.isEmpty(value) && _.isEmpty(compareValues)) return true;

              return _.isEqual(
                compareValues.map((it = {}) => it.id || it.departmentId).sort(),
                safeParse(value || '[]')
                  .map(its => its.departmentId)
                  .sort(),
              );
              // 组织角色
            } else if (dataType === API_ENUM_TO_TYPE.ORG_ROLE) {
              if (_.isEmpty(value) && _.isEmpty(compareValues)) return true;

              return _.isEqual(
                compareValues.map((it = {}) => it.id || it.organizeId).sort(),
                safeParse(value || '[]')
                  .map(its => its.organizeId)
                  .sort(),
              );
              // 选项
            } else if (
              [API_ENUM_TO_TYPE.OPTIONS_10, API_ENUM_TO_TYPE.OPTIONS_11, API_ENUM_TO_TYPE.OPTIONS_9].includes(dataType)
            ) {
              if (_.isEmpty(value) && _.isEmpty(compareValues)) return true;

              return _.isEqual(safeParse(value || '[]').sort(), compareValues.sort());
            }
            break;
          // 关联记录
          case CONTROL_FILTER_WHITELIST.RELATE_RECORD.value:
            if (_.isEmpty(value) && _.isEmpty(compareValues)) return true;

            return _.isEqual(
              compareValues
                .map(it => (dynamicSource.length > 0 ? _.get(it, 'sid') : _.get(safeParse(it || '{}'), 'id')))
                .sort(),
              safeParse(value || '[]', 'array')
                .map(item => item.sid)
                .sort(),
            );
          default:
            return true;
        }
        break;
      // ARRNE：27, // 数组不等于
      case FILTER_CONDITION_TYPE.ARRNE:
        switch (conditionGroupType) {
          case CONTROL_FILTER_WHITELIST.USERS.value: // ???
            if (_.isEmpty(value) && _.isEmpty(compareValues)) return false;

            return !_.isEqual(
              compareValues.map((it = {}) => it.id || it.accountId).sort(),
              safeParse(value || '[]', 'array')
                .map(its => its.accountId)
                .sort(),
            );
          case CONTROL_FILTER_WHITELIST.OPTIONS.value:
            // 部门
            if (dataType === API_ENUM_TO_TYPE.GROUP_PICKER) {
              if (_.isEmpty(value) && _.isEmpty(compareValues)) return false;

              return !_.isEqual(
                compareValues.map((it = {}) => it.id || it.departmentId).sort(),
                safeParse(value || '[]', 'array')
                  .map(its => its.departmentId)
                  .sort(),
              );
              // 组织角色
            } else if (dataType === API_ENUM_TO_TYPE.ORG_ROLE) {
              if (_.isEmpty(value) && _.isEmpty(compareValues)) return false;

              return !_.isEqual(
                compareValues.map((it = {}) => it.id || it.organizeId).sort(),
                safeParse(value || '[]', 'array')
                  .map(its => its.organizeId)
                  .sort(),
              );
              // 选项
            } else if (
              [API_ENUM_TO_TYPE.OPTIONS_10, API_ENUM_TO_TYPE.OPTIONS_11, API_ENUM_TO_TYPE.OPTIONS_9].includes(dataType)
            ) {
              if (_.isEmpty(value) && _.isEmpty(compareValues)) return false;

              return !_.isEqual(safeParse(value || '[]', 'array').sort(), compareValues.sort());
            }
            break;
          // 关联记录
          case CONTROL_FILTER_WHITELIST.RELATE_RECORD.value:
            if (_.isEmpty(value) && _.isEmpty(compareValues)) return false;

            return !_.isEqual(
              compareValues
                .map(it => (dynamicSource.length > 0 ? _.get(it, 'sid') : _.get(safeParse(it || '{}'), 'id')))
                .sort(),
              safeParse(value || '[]', 'array')
                .map(item => item.sid)
                .sort(),
            );
          default:
            return true;
        }
        break;
      // ALLCONTAIN：28, // 数组同时包含
      case FILTER_CONDITION_TYPE.ALLCONTAIN:
        switch (conditionGroupType) {
          case CONTROL_FILTER_WHITELIST.USERS.value: // ???
            if (_.isEmpty(value) && _.isEmpty(compareValues)) return false;

            const userCompareArr = compareValues.map((it = {}) => it.id || it.accountId);
            const userArr = safeParse(value || '[]', 'array').map(it => it.accountId);
            return _.every(userCompareArr, its => _.includes(userArr, its));
          case CONTROL_FILTER_WHITELIST.OPTIONS.value:
            // 部门
            if (dataType === API_ENUM_TO_TYPE.GROUP_PICKER) {
              if (_.isEmpty(value) && _.isEmpty(compareValues)) return false;

              const deptCompareArr = compareValues.map((it = {}) => it.id || it.departmentId);
              const deptArr = safeParse(value || '[]', 'array').map(it => it.departmentId);
              return _.every(deptCompareArr, its => _.includes(deptArr, its));
              // 组织角色
            } else if (dataType === API_ENUM_TO_TYPE.ORG_ROLE) {
              if (_.isEmpty(value) && _.isEmpty(compareValues)) return false;

              const orgCompareArr = compareValues.map((it = {}) => it.id || it.organizeId);
              const orgArr = safeParse(value || '[]', 'array').map(it => it.organizeId);
              return _.every(orgCompareArr, its => _.includes(orgArr, its));
              // 选项
            } else if (dataType === API_ENUM_TO_TYPE.OPTIONS_10) {
              if (_.isEmpty(value) && _.isEmpty(compareValues)) return false;

              return _.every(compareValues, its => _.includes(safeParse(value || '[]', 'array'), its));
            }
            break;
          // 关联记录
          case CONTROL_FILTER_WHITELIST.RELATE_RECORD.value:
            if (_.isEmpty(value) && _.isEmpty(compareValues)) return false;
            if (_.isEmpty(value) || _.isEmpty(compareValues)) return false;

            const reCompareArr = compareValues.map(it =>
              dynamicSource.length > 0 ? _.get(it, 'sid') : _.get(safeParse(it || '{}'), 'id'),
            );
            const reArr = safeParse(value || '[]', 'array').map(it => it.sid);
            return _.every(reCompareArr, its => _.includes(reArr, its));
          default:
            return true;
        }
        break;
      // 文本同时包含
      case FILTER_CONDITION_TYPE.TEXT_ALLCONTAIN:
        return compareValues.every(i => value.includes(i));
      default:
        return true;
    }
  } catch (err) {
    console.log(err);
  }
};

//获取字段值
const getFieldIds = (its = {}) => {
  const isDynamic = its.dynamicSource && its.dynamicSource.length > 0;
  return isDynamic ? [its.controlId, ...(its.dynamicSource || []).map(dy => dy.cid)] : [its.controlId];
};

const getIds = (arr = {}) => {
  return (arr.groupFilters || []).reduce((total, its) => {
    return total.concat(getFieldIds(its));
  }, []);
};

const flattenArr = (obj = {}) => {
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

//判断业务规则配置条件是否满足
export const checkValueAvailable = (rule = {}, data = [], recordId, from) => {
  let isAvailable = false;
  //不满足条件的id,过滤错误
  let filterControlIds = {};
  //满足条件的错误id合集
  let availableControlIds = {};
  let transFilters = rule.filters || [[]]; //条件二维数组

  //条件字段或字段值都隐藏
  // 记录id存在才参与业务规则
  if (from) {
    transFilters = transFilters.filter(arr => {
      const ids = getIds(arr);
      return _.some(ids, id => {
        const da = _.find(data, d => d.controlId === id);
        return (
          (recordId && id === 'rowid') ||
          _.includes(['currenttime', 'user-self'], id) ||
          (da && controlState(da, from).visible & !da.hidden)
        );
      });
    });
  }

  transFilters.forEach((arr, pIdx) => {
    if (!filterControlIds[pIdx]) {
      filterControlIds[pIdx] = [];
    }
    if (!availableControlIds[pIdx]) {
      availableControlIds[pIdx] = [];
    }

    if (arr.groupFilters && arr.groupFilters.length) {
      let childItemAvailable = true;
      arr.groupFilters.forEach((its, index) => {
        let filterControl = data.find(a => a.controlId === its.controlId);
        if (filterControl && !isRelateMoreList(filterControl, its)) {
          const result = filterFn(its, filterControl, data, recordId);
          childItemAvailable = getResult(arr.groupFilters, index, result, childItemAvailable);

          const ids = getFieldIds(its);
          if (!result) {
            filterControlIds[pIdx][index] = ids;
            availableControlIds[pIdx][index] = [];
          } else {
            filterControlIds[pIdx][index] = [];
            availableControlIds[pIdx][index] = ids;
          }
        }
      });
      isAvailable = getResult(transFilters, pIdx, childItemAvailable, isAvailable);
    }
  });

  const ids = transFilters.map(i => getIds(i));
  if (isAvailable) {
    availableControlIds = ids;
    filterControlIds = [];
  } else {
    availableControlIds = [];
    filterControlIds = ids;
  }

  return {
    isAvailable,
    filterControlIds: flattenArr(filterControlIds),
    availableControlIds: flattenArr(availableControlIds),
  };
};

//判断所有业务规则是否满足条件
export const checkAllValueAvailable = (rules = [], data = [], recordId, from) => {
  let errors = [];
  const filterRules = getAvailableFilters(rules, data, recordId);
  if (filterRules && filterRules.length > 0) {
    filterRules.map(rule => {
      rule.ruleItems.map(item => {
        if (item.type === 6 && rule.checkType !== 2) {
          const { isAvailable } = checkValueAvailable(rule, data, recordId, from);
          isAvailable && errors.push({ errorMessage: item.message, ignoreErrorMessage: rule.checkType === 3 });
        }
      });
    });
  }
  return errors;
};

// 业务规则后端校验
export const getRuleErrorInfo = (rules = [], badData = []) => {
  return badData
    .map(itemBadData => {
      const errorInfo = [];
      const [rowId, ruleId, controlId] = (itemBadData || '').split(':').reverse();

      rules.map(rule => {
        if (rule.ruleId === ruleId && _.find(_.get(rule, 'ruleItems') || [], r => r.type === 6)) {
          _.get(rule, 'ruleItems').map(item => {
            const errorIds = (_.get(item, 'controls') || []).map(c => c.controlId);
            const curErrorIds = errorIds.length > 0 ? errorIds : _.flatten((rule.filters || []).map(i => getIds(i)));
            curErrorIds.map(c => {
              errorInfo.push({
                controlId: c,
                errorMessage: item.message,
                ruleId,
                errorType: FORM_ERROR_TYPE.RULE_ERROR,
                showError: true,
                ignoreErrorMessage: rule.checkType === 3,
              });
            });
          });
        }
      });

      return { rowId, controlId, errorInfo };
    })
    .filter(i => !_.isEmpty(i.errorInfo));
};

//判断所有业务规则是否有锁定状态
export const checkRuleLocked = (rules = [], data = [], recordId) => {
  let isLocked = false;
  const filterRules = getAvailableFilters(rules, data, recordId);
  if (filterRules && filterRules.length > 0) {
    filterRules.forEach(rule => {
      if (isLocked) return;
      rule.ruleItems.map(item => {
        if (item.type === 7) {
          const { isAvailable } = checkValueAvailable(rule, data, recordId);
          isAvailable && (isLocked = true);
        }
      });
    });
  }
  return isLocked;
};

export const replaceStr = (str, index, value) => {
  return str.substring(0, index) + value + str.substring(index + 1);
};

// 更新业务规则权限属性
export const updateDataPermission = ({ attrs = [], it, checkRuleValidator, item = {}, verifyAllControls = false }) => {
  //子表或关联记录
  const isSubList = _.includes([29, 34], item.type);
  let fieldPermission = it.fieldPermission || '111';
  let required = it.required || false;
  let disabled = it.disabled || false;
  const eventPermissions = it.eventPermissions || '';
  const types = attrs.map(i => i.type);

  //隐藏
  if (_.includes(types, 2) || eventPermissions[0] === '0') {
    fieldPermission = replaceStr(fieldPermission, 0, '0');
    if (isSubList && _.includes(item.showControls || [], it.controlId)) {
      item.showControls = (item.showControls || []).filter(c => c !== it.controlId);
    }
  } else {
    //显示
    if (_.includes(types, 1) || eventPermissions[0] === '1') {
      fieldPermission = replaceStr(fieldPermission, 0, '1');
    }
  }
  //只读
  if (_.includes(types, 4) || eventPermissions[1] === '0') {
    fieldPermission = replaceStr(fieldPermission, 1, '0');
  } else {
    // 必填、可编辑，子表、关联记录给编辑细分权限
    const permission = _.last(attrs.map(i => i.permission).filter(_.identity));
    if (!_.isUndefined(permission)) {
      if (it.type === 34) {
        it.advancedSetting = {
          ...it.advancedSetting,
          allowcancel: _.includes(permission, 'delete') ? '1' : '0',
          allowedit: _.includes(permission, 'edit') ? '1' : '0',
          ...(_.includes(permission, 'add')
            ? _.get(item, 'advancedSetting.allowadd') !== '1'
              ? { allowadd: '1', allowsingle: '1' }
              : {}
            : { allowadd: '0', allowsingle: '0', batchcids: JSON.stringify([]), allowimport: '0', allowcopy: '0' }),
        };
      } else if (isSheetDisplay(it)) {
        if (_.includes(permission, 'add')) {
          if (!_.includes([0, 1], it.enumDefault2)) {
            it.enumDefault2 = it.enumDefault2 === 10 ? 0 : 1;
            it.advancedSetting = {
              ...it.advancedSetting,
              searchrange: '1',
            };
          }
        } else {
          it.enumDefault2 = it.enumDefault2 === 0 ? 10 : 11;
          it.advancedSetting = {
            ...it.advancedSetting,
            searchrange: '',
          };
        }
        it.advancedSetting = {
          ...it.advancedSetting,
          allowcancel: _.includes(permission, 'delete') ? '1' : '0',
          ...(_.get(it, 'advancedSetting.allowbatch') === '1'
            ? { batchcancel: _.includes(permission, 'delete') ? '1' : '0' }
            : {}),
        };
      }
    }
    //必填
    if (_.includes(types, 5)) {
      required = true;
      fieldPermission = replaceStr(fieldPermission, 1, '1');
      const { errorText } = onValidator({ item: { ...it, required, fieldPermission }, verifyAllControls });
      item.type !== 34 && checkRuleValidator(it.controlId, FORM_ERROR_TYPE.RULE_REQUIRED, errorText);
    } else {
      //编辑
      if (_.includes(types, 3) || eventPermissions[1] === '1') {
        fieldPermission = replaceStr(fieldPermission, 1, '1');
        const { errorType, errorText } = onValidator({ item: { ...it, fieldPermission }, verifyAllControls });
        checkRuleValidator(it.controlId, errorType, errorText);
      }
    }
  }
  //解锁
  if (_.includes(types, 8)) {
    disabled = false;
  }
  it.fieldPermission = fieldPermission;
  it.required = required;
  it.disabled = disabled;
};

// 过滤不必要走（字段都删除）的业务规则
const getAvailableFilters = (rules = [], formatData = [], recordId) => {
  //过滤禁用规则及单个且数组中字段全部删除情况
  // 注意如果是记录id，data里不包含系统字段，所以必须recordId存在才生效
  let filterRules = [];
  rules.map(o => {
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
  return filterRules;
};

// 移除必填错误
const removeRequireError = (controls = [], checkRuleValidator = () => {}) => {
  controls.map(con => {
    const { controlId = '', childControlIds = [] } = con;
    if (!childControlIds.length) {
      checkRuleValidator(controlId, FORM_ERROR_TYPE.RULE_REQUIRED, '');
    } else {
      childControlIds.map(child => checkRuleValidator(child, FORM_ERROR_TYPE.RULE_REQUIRED, ''));
    }
  });
};

// 字段显示规则计算
export const updateRulesData = ({
  rules = [],
  data = [],
  recordId,
  checkRuleValidator = () => {},
  from,
  checkAllUpdate = false,
  updateControlIds = [],
  ignoreHideControl = false,
  verifyAllControls = false,
}) => {
  let formatData = data.map(item => {
    return {
      ...item,
      ...item.defaultState,
      relationControls: (item.relationControls || []).map(re => ({ ...re, ...re.defaultState })),
    };
  });

  //字段过滤
  if (ignoreHideControl) {
    formatData = formatData.filter(da => controlState(da, from).visible);
  }

  let relateRuleType = {
    parent: {},
    child: {},
    errorMsg: {},
  };

  function pushType(key, id, obj) {
    relateRuleType[key][id] ? relateRuleType[key][id].push(obj) : (relateRuleType[key][id] = [obj]);
  }

  const filterRules = getAvailableFilters(rules, formatData, recordId);

  if (filterRules && filterRules.length > 0) {
    filterRules.map(rule => {
      rule.ruleItems.map(({ type, controls = [] }) => {
        let { isAvailable } = checkValueAvailable(rule, formatData, recordId);
        let currentType = type;
        //显示隐藏无论满足条件与否都要操作
        if (currentType === 1) {
          currentType = isAvailable ? 1 : 2;
        } else if (currentType === 2) {
          currentType = isAvailable ? 2 : 1;
        }

        // 条件变更需要移除必填错误
        if (currentType === 5 && !isAvailable) {
          removeRequireError(controls, checkRuleValidator);
        }

        if (!_.includes([1, 2], currentType) && !isAvailable) {
          return;
        }

        const attrObj = { type: currentType };

        if (_.includes([7, 8], currentType)) {
          formatData.map(item => {
            pushType('parent', item.controlId, attrObj);
          });
        } else if (!_.includes([6], currentType)) {
          controls.map(con => {
            const { controlId = '', childControlIds = [], permission, isCustom } = con;
            if (!childControlIds.length) {
              pushType('parent', controlId, { ...attrObj, ...(isCustom ? { permission } : {}) });
            } else {
              childControlIds.map(child => pushType('child', `${controlId}-${child}`, attrObj));
            }
          });
        }
      });
    });

    formatData.forEach(it => {
      it.relationControls.forEach(re => {
        // 子表会出现控件id重复的情况
        const id = `${it.controlId}-${re.controlId}`;
        updateDataPermission({
          attrs: relateRuleType['child'][id],
          it: re,
          checkRuleValidator,
          item: it,
          verifyAllControls,
        });
      });
      updateDataPermission({
        attrs: relateRuleType['parent'][it.controlId],
        it,
        checkRuleValidator,
        verifyAllControls,
      });
    });

    //走错误提示
    filterRules.map(rule => {
      // 前端校验才走
      if (rule.checkType !== 2) {
        rule.ruleItems.map(({ type, message, controls = [] }) => {
          const {
            filterControlIds = [],
            availableControlIds = [],
            isAvailable,
          } = checkValueAvailable(rule, formatData, recordId, from);
          if (_.includes([6], type)) {
            const errorIds = controls.map(i => i.controlId);
            const curErrorIds = rule.type === 1 && errorIds.length > 0 ? errorIds : filterControlIds;
            //过滤已经塞进去的错误
            (rule.type === 1 ? curErrorIds : filterControlIds).map(id =>
              checkRuleValidator(id, FORM_ERROR_TYPE.RULE_ERROR, '', rule),
            );
            if (isAvailable) {
              availableControlIds.map(controlId => {
                if (!relateRuleType['errorMsg'][controlId]) {
                  //错误提示(checkAllUpdate为true全操作，
                  // 有变更时，ruleType === 1 指定字段直接塞错误
                  //否则操作变更的字段updateControlIds

                  const pushError = (id, msg) => {
                    pushType('errorMsg', id, msg);
                    if (_.find(formatData, fo => fo.controlId === id)) {
                      const errorMsg = relateRuleType['errorMsg'][id] || [];
                      checkRuleValidator(id, FORM_ERROR_TYPE.RULE_ERROR, errorMsg[0], rule);
                    }
                  };

                  if (
                    checkAllUpdate ||
                    (updateControlIds.length > 0 && (rule.type === 1 || _.includes(updateControlIds, controlId)))
                  ) {
                    if (rule.type === 1 && errorIds.length > 0) {
                      errorIds.map(e => pushError(e, message));
                    } else {
                      pushError(controlId, message);
                    }
                  }
                }
              });
            }
          }
        });
      }
    });
  } else {
    //没有业务规则，还是要合并自定义事件
    formatData.forEach(it => {
      it.relationControls.forEach(re => {
        // 子表会出现控件id重复的情况
        updateDataPermission({
          attrs: [],
          it: re,
          checkRuleValidator,
          item: it,
        });
      });
      updateDataPermission({
        attrs: [],
        it,
        checkRuleValidator,
      });
    });
  }
  return formatData;
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
