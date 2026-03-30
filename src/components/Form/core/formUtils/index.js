import { Parser } from 'hot-formula-parser';
import _ from 'lodash';
import moment from 'moment';
import { telIsValidNumber } from 'ming-ui/components/intlTelInput';
import { RELATE_RECORD_SHOW_TYPE } from 'worksheet/constants/enum';
import { isSheetDisplay } from 'src/pages/widgetConfig/util';
import { formatColumnToText } from 'src/pages/widgetConfig/util/data.js';
import { getShowFormat } from 'src/pages/widgetConfig/util/setting';
import { transferValue } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/util';
import { isEnableScoreOption } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/util';
import execValueFunction from 'src/pages/widgetConfig/widgetSetting/components/FunctionEditorDialog/Func/exec';
import { WFSTATUS_OPTIONS } from 'src/pages/worksheet/components/WorksheetRecordLog/enum.js';
import { accMul, calcDate } from 'src/utils/common';
import {
  controlState,
  formatStrZero,
  getSwitchItemNames,
  isRelateRecordTableControl,
  renderText as renderCellText,
  toFixed,
} from 'src/utils/control';
import { checkCellIsEmpty } from 'src/utils/control';
import { dateConvertToServerZone, dateServerZoneToAppZone, getContactInfo } from 'src/utils/project';
import { filterEmptyChildTableRows } from 'src/utils/record';
import { FORM_ERROR_TYPE, FORM_ERROR_TYPE_TEXT, TIME_UNIT } from '../config';
import filterFn from './filterFn';
import {
  checkChildTableIsEmpty,
  compareWithTime,
  flattenArr,
  formatTimeValue,
  getAttachmentData,
  getAvailableFilters,
  getControlValue,
  getEmbedValue,
  getRangeErrorType,
  getResult,
  isRelateMoreList,
  replaceStr,
  validateIdCardBirthDate,
  validateIdCardCheckCode,
} from './helper';

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

/**
 * 严格验证大陆身份证号码
 * 包含地址码、出生日期、顺序码和校验码的完整验证
 */
const validateMainlandIdCard = idCard => {
  const result = Reg.idCardNumber.test(idCard);

  if (!result) {
    return false;
  }

  // 验证出生日期
  if (!validateIdCardBirthDate(idCard)) {
    return false;
  }

  // 验证校验码（第18位）
  if (!validateIdCardCheckCode(idCard)) {
    return false;
  }

  return true;
};

const Reg = {
  // 座机号码
  telPhoneNumber: /^[+]?([\d\s()-]+)$/,
  // 邮箱地址
  emailAddress: /^[\w-+&]+(\.[\w-+&]+)*@[\w-+]+(\.[\w-+]+)*\.[\w-+]+$/i,
  // 身份证号码
  idCardNumber:
    /^(?!\d{14}0000$)(?:11|12|13|14|15|21|22|23|31|32|33|34|35|36|37|41|42|43|44|45|46|50|51|52|53|54|61|62|63|64|65|71|81|82|91)\d{4}(?:19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[0-9Xx]$/,
  hkCardNumber: /^[A-Z]{1}(\d{6})(\(\d\)|\d)?$/,
  moCardNumber: /^[A-Z]{1}\d{6}([A-Z]|\d)?$/,
  twCardNumber: /^[A-Z][1-2]\d{8}$/,
  // 护照
  passportNumber: /^[A-Z0-9a-z<>\s\-/]{4,20}$/,
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
    // 身份证严格校验
    if (validateMainlandIdCard(str)) {
      return true;
    }
    return Reg.hkCardNumber.test(str) || Reg.moCardNumber.test(str) || Reg.twCardNumber.test(str);
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
        const parentControl = _.find(data, c => c.controlId === item.rcid) || {};
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
            return JSON.stringify(safeParse(sourcevalue, 'array').filter(r => r.sid));
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

  if (_.includes([9, 10, 11, 26, 27, 29, 35, 48], currentItem.type)) {
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
        let columnType = column.type;
        if (column.type === 37) {
          columnType = column.enumDefault2;
        }
        if (_.includes([15, 16, 46, 30], columnType)) {
          timestr = column.value;
        }
        if (columnType === 29) {
          timestr = _.get(safeParse(column.value), '0.name');
        }
        if (!timestr) {
          return;
        }
        if (columnType === 15 || (columnType === 30 && column.sourceControlType === 15)) {
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
        } else if (columnType === 46) {
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
            !safeParse(item.value)?.attachments?.length &&
            !safeParse(item.value)?.knowledgeAtts?.length &&
            !safeParse(item.value)?.attachmentData?.length))) ||
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
export const onValidator = ({ item, data, masterData, ignoreRequired, verifyAllControls, appId }) => {
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
        const appTimeZoneValue = item.type === 16 ? dateServerZoneToAppZone(value, window[`timeZone_${appId}`]) : value;

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

            if (
              (minDate && moment(appTimeZoneValue) < moment(minDate)) ||
              (maxDate && moment(appTimeZoneValue) > moment(maxDate))
            ) {
              errorType = FORM_ERROR_TYPE.DATE_TIME_RANGE;
              errorText = FORM_ERROR_TYPE_TEXT.DATE_TIME_RANGE(appTimeZoneValue, minDate, maxDate);
            }
          }
          if (
            allowweek.indexOf(moment(appTimeZoneValue).day() === 0 ? '7' : moment(appTimeZoneValue).day()) === -1 &&
            !errorType
          ) {
            errorType = FORM_ERROR_TYPE.DATE;
          }
          if (
            !errorType &&
            (compareWithTime(
              start,
              `${moment(appTimeZoneValue).hour()}:${moment(appTimeZoneValue).minute()}`,
              'isAfter',
            ) ||
              compareWithTime(
                end,
                `${moment(appTimeZoneValue).hour()}:${moment(appTimeZoneValue).minute()}`,
                'isBefore',
              ))
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

/*********************************************************************************
 * 以下是业务规则相关
 *********************************************************************************
 */

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

// 提示错误：单个条件组字段、条件值隐藏过滤(补充条件为或的情况)
const getItemGroupFilters = (arrItem = {}, data = [], recordId, from) => {
  const isOrCondition = (arrItem.groupFilters || []).findIndex(its => its.spliceType === 2) > -1;
  let newArr = [arrItem.groupFilters || []];

  if (isOrCondition) {
    newArr = (arrItem.groupFilters || []).map(i => [i]);
  }

  newArr = newArr.filter(its => {
    const ids = getIds({ groupFilters: its });
    return _.some(ids, id => {
      const da = _.find(data, d => d.controlId === id);
      return (
        (recordId && id === 'rowid') ||
        _.includes(['currenttime', 'user-self'], id) ||
        (da && controlState(da, from).visible & !da.hidden)
      );
    });
  });
  return { ...arrItem, groupFilters: _.flatten(newArr) };
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
    transFilters = transFilters
      .map(arrItem => {
        return getItemGroupFilters(arrItem, data, recordId, from);
      })
      .filter(i => !_.isEmpty(i.groupFilters));
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
          const result = filterFn({
            filterData: its,
            originControl: filterControl,
            data,
            recordId,
            appTimeZone: rule.appTimeZone,
          });
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
  const { errorRules = [] } = getAvailableFilters(rules, data, recordId);
  if (errorRules.length > 0) {
    errorRules.forEach(rule => {
      rule.ruleItems.forEach(item => {
        if (rule.checkType !== 2) {
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

      rules.forEach(rule => {
        if (rule.ruleId === ruleId && _.find(_.get(rule, 'ruleItems') || [], r => r.type === 6)) {
          _.get(rule, 'ruleItems').forEach(item => {
            const errorIds = (_.get(item, 'controls') || []).map(c => c.controlId);
            const curErrorIds = errorIds.length > 0 ? errorIds : _.flatten((rule.filters || []).map(i => getIds(i)));
            curErrorIds.forEach(c => {
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
  const { defaultRules = [] } = getAvailableFilters(rules, data, recordId);
  if (defaultRules.length > 0) {
    defaultRules.forEach(rule => {
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
