import {
  CONTROL_FILTER_WHITELIST,
  FILTER_CONDITION_TYPE,
  API_ENUM_TO_TYPE,
  DATE_OPTIONS,
} from 'src/pages/worksheet/common/WorkSheetFilter/enum.js';
import moment from 'moment';
import { getTypeKey, redefineComplexControl } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { isRelateMoreList } from 'src/pages/FormSet/components/columnRules/config';
import { onValidator } from './DataFormat';
import { controlState } from './utils';
import { FORM_ERROR_TYPE } from './config';
import { accDiv, accMul, dateConvertToUserZone } from 'src/util';
import { getDatePickerConfigs } from 'src/pages/widgetConfig/util/setting';
import _ from 'lodash';
import { filterEmptyChildTableRows } from 'worksheet/util';
import { toFixed } from '../../../util';

export const isEmptyValue = value => {
  return _.isUndefined(value) || _.isNull(value) || String(value).trim() === '';
};

const TIME_OPTIONS = {
  1: 'year ',
  2: 'month',
  3: 'day',
  4: 'hour',
  5: 'minute',
  6: 'second',
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

// 时间格式化数值
const formatTimeValue = (value, mode) => {
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

const dayFn = (filterData = {}, value, isGT, type) => {
  let { dateRange, dynamicSource = [], dataType } = filterData;
  if (dynamicSource.length > 0) {
    dateRange = 0;
  }
  // isGT 早与 ！isGT 晚与
  switch (dateRange) {
    // { text: _l('今天'), value: 1 },
    case 1:
      return moment().format('YYYY-MM-DD');
    // { text: _l('昨天'), value: 2 },
    case 2:
      return moment().subtract(1, 'days').format('YYYY-MM-DD');
    // { text: _l('明天'), value: 3 },
    case 3:
      return moment().add(1, 'days').format('YYYY-MM-DD');
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
            .month(moment().month() - 1)
            .startOf('month')
            .format('YYYY-MM-DD')
        : moment()
            .month(moment().month() - 1)
            .endOf('month')
            .format('YYYY-MM-DD');
    // { text: _l('下个月'), value: 9 },
    case 9:
      return isGT
        ? moment()
            .month(moment().month() + 1)
            .startOf('month')
            .format('YYYY-MM-DD')
        : moment()
            .month(moment().month() + 1)
            .endOf('month')
            .format('YYYY-MM-DD');
    // { text: _l('本季度'), value: 12 },
    case 12:
      return isGT ? moment().startOf('quarter').format('YYYY-MM-DD') : moment().endOf('quarter').format('YYYY-MM-DD');
    // { text: _l('上季度'), value: 13 },
    case 13:
      return isGT
        ? moment().startOf('quarter').subtract(3, 'month').format('YYYY-MM-DD')
        : moment().endOf('quarter').subtract(3, 'month').format('YYYY-MM-DD');
    // { text: _l('下季度'), value: 14 },
    case 14:
      return isGT
        ? moment().startOf('quarter').add(3, 'month').format('YYYY-MM-DD')
        : moment().endOf('quarter').add(3, 'month').format('YYYY-MM-DD');
    // { text: _l('今年'), value: 15 },
    case 15:
      return isGT ? moment().format('YYYY') + '-01' + '-01' : moment().endOf('year').format('YYYY-MM-DD');
    // { text: _l('去年'), value: 16 },
    case 16:
      return isGT
        ? moment().add(-1, 'year').format('YYYY') + '-01' + '-01'
        : moment().add(-1, 'year').endOf('year').format('YYYY-MM-DD');
    // { text: _l('明年'), value: 17 },
    case 17:
      return isGT
        ? moment().add(1, 'year').format('YYYY') + '-01' + '-01'
        : moment().add(1, 'year').endOf('year').format('YYYY-MM-DD');
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
      const formatMode = (
        getDatePickerConfigs({ advancedSetting: { showtype: filterData.dataShowType }, type: dataType }) || {}
      ).formatMode;
      return moment(value).format(formatMode || 'YYYY-MM-DD');
    default:
      //日期时间
      return type === 16 ? moment(value).format('YYYY-MM-DD HH:mm') : moment(value).format('YYYY-MM-DD');
  }
};

export const filterFn = (filterData, originControl, data = [], recordId) => {
  try {
    let { filterType = '', dataType = '', dynamicSource = [], dateRange } = filterData;
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
      filterData.dataShowType = advancedSetting.showtype;
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
    const conditionGroupType = conditionGroup.value;
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
      } else if (_.includes([24, 25, 26, 27, 28, 51, 52], filterType) && _.includes([29], dataType)) {
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
      // 今天、昨天、明天，对比单位天
      if (_.includes([1, 2, 3], dateRange) && !dynamicSource.length) {
        timeLevel = 'day';
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
            var isInValue = true;
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
            if (state && state.rows && !state.baseLoading) {
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
            if (state && state.rows && !state.baseLoading) {
              return filterEmptyChildTableRows(state.rows).length > 0;
            } else {
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
          default:
            return true;
        }
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
          default:
            return true;
        }
      //   GT: 13, // > 晚于
      //   DATE_GT: 33, // > 晚于
      case FILTER_CONDITION_TYPE.GT:
      case FILTER_CONDITION_TYPE.DATE_GT:
        switch (conditionGroupType) {
          case CONTROL_FILTER_WHITELIST.NUMBER.value:
            if (isEmptyValue(value) || isEmptyValue(compareValue)) return false;
            return parseFloat(value) > parseFloat(compareValue);
          case CONTROL_FILTER_WHITELIST.DATE.value:
            let day = dayFn(filterData, compareValue, false, currentControl.type);
            return !value || (!!dynamicSource.length && !compareValue) ? false : moment(value).isAfter(day, timeLevel);
          case CONTROL_FILTER_WHITELIST.TIME.value:
            return !value || (!!dynamicSource.length && !compareValue)
              ? false
              : moment(value, formatMode).isAfter(formatTimeValue(compareValue, formatMode), timeLevel);
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
            let day = dayFn(filterData, compareValue, false, currentControl.type);
            return !value || (!!dynamicSource.length && !compareValue)
              ? false
              : moment(value).isSameOrAfter(day, timeLevel);
          case CONTROL_FILTER_WHITELIST.TIME.value:
            return !value || (!!dynamicSource.length && !compareValue)
              ? false
              : moment(value, formatMode).isSameOrAfter(formatTimeValue(compareValue, formatMode), timeLevel);
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
            let day = dayFn(filterData, compareValue, true, currentControl.type);
            return !value || (!!dynamicSource.length && !compareValue) ? false : moment(value).isBefore(day, timeLevel);
          case CONTROL_FILTER_WHITELIST.TIME.value:
            return !value || (!!dynamicSource.length && !compareValue)
              ? false
              : moment(value, formatMode).isBefore(formatTimeValue(compareValue, formatMode), timeLevel);
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
            let day = dayFn(filterData, compareValue, false, currentControl.type);
            return !value || (!!dynamicSource.length && !compareValue)
              ? false
              : moment(value).isSameOrBefore(day, timeLevel);
          case CONTROL_FILTER_WHITELIST.TIME.value:
            return !value || (!!dynamicSource.length && !compareValue)
              ? false
              : moment(value, formatMode).isSameOrBefore(formatTimeValue(compareValue, formatMode), timeLevel);
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
            let day = dayFn(filterData, compareValue, true, currentControl.type);
            //过去 | 将来
            const hasToday = _.includes(filterData.values || [], 'today');
            if (dateRange === 10) {
              return (
                (hasToday ? moment(value).isSameOrBefore(moment(), 'day') : moment(value).isBefore(moment(), 'day')) &&
                moment(value).isSameOrAfter(day, 'day')
              );
            } else if (dateRange === 11) {
              return (
                (hasToday ? moment(value).isSameOrAfter(moment(), 'day') : moment(value).isAfter(moment(), 'day')) &&
                moment(value).isSameOrBefore(day, 'day')
              );
              // 本周、本月、本季度、今年等等
            } else if (_.includes([4, 5, 6, 7, 8, 9, 12, 13, 14, 15, 16, 17], dateRange) && !dynamicSource.length) {
              return dateFn(dateRange, value, true);
            }
            return moment(value).isSame(day, timeLevel);
          case CONTROL_FILTER_WHITELIST.TIME.value:
            return !value || (!!dynamicSource.length && !compareValue)
              ? false
              : moment(value, formatMode).isSame(formatTimeValue(compareValue, formatMode), timeLevel);
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
            let day = dayFn(filterData, compareValue, true, currentControl.type);
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
              : !moment(value, formatMode).isSame(formatTimeValue(compareValue, formatMode), timeLevel);
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
          _.includes(['currenttime'], id) ||
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
          isAvailable && errors.push(item.message);
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
export const updateDataPermission = ({ attrs = [], it, checkRuleValidator, item = {} }) => {
  //子表或关联记录
  const isSubList = _.includes([29, 34], item.type);
  let fieldPermission = it.fieldPermission || '111';
  let required = it.required || false;
  let disabled = it.disabled || false;
  const eventPermissions = it.eventPermissions || '';

  //隐藏
  if (_.includes(attrs, 2) || eventPermissions[0] === '0') {
    fieldPermission = replaceStr(fieldPermission, 0, '0');
    if (isSubList && _.includes(item.showControls || [], it.controlId)) {
      item.showControls = (item.showControls || []).filter(c => c !== it.controlId);
    }
  } else {
    //显示
    if (_.includes(attrs, 1) || eventPermissions[0] === '1') {
      fieldPermission = replaceStr(fieldPermission, 0, '1');
    }
  }
  //只读
  if (_.includes(attrs, 4) || eventPermissions[1] === '0') {
    fieldPermission = replaceStr(fieldPermission, 1, '0');
  } else {
    //必填
    if (_.includes(attrs, 5)) {
      required = true;
      fieldPermission = replaceStr(fieldPermission, 1, '1');
      const { errorText } = onValidator({ item: { ...it, required, fieldPermission } });
      item.type !== 34 && checkRuleValidator(it.controlId, FORM_ERROR_TYPE.RULE_REQUIRED, errorText);
    } else {
      //编辑
      if (_.includes(attrs, 3) || eventPermissions[1] === '1') {
        fieldPermission = replaceStr(fieldPermission, 1, '1');
        const { errorType, errorText } = onValidator({ item: { ...it, fieldPermission } });
        checkRuleValidator(it.controlId, errorType, errorText);
      }
    }
  }
  //解锁
  if (_.includes(attrs, 8)) {
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

  function pushType(key, id, type) {
    relateRuleType[key][id] ? relateRuleType[key][id].push(type) : (relateRuleType[key][id] = [type]);
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

        if (_.includes([7, 8], currentType)) {
          formatData.map(item => {
            pushType('parent', item.controlId, currentType);
          });
        } else if (!_.includes([6], currentType)) {
          controls.map(con => {
            const { controlId = '', childControlIds = [] } = con;
            if (!childControlIds.length) {
              pushType('parent', controlId, currentType);
            } else {
              childControlIds.map(child => pushType('child', `${controlId}-${child}`, currentType));
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
        });
      });
      updateDataPermission({
        attrs: relateRuleType['parent'][it.controlId],
        it,
        checkRuleValidator,
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
        const id = `${it.controlId}-${re.controlId}`;
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
