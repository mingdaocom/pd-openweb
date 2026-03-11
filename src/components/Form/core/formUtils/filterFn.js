import _ from 'lodash';
import moment from 'moment';
import { getDatePickerConfigs } from 'src/pages/widgetConfig/util/setting';
import {
  API_ENUM_TO_TYPE,
  CONTROL_FILTER_WHITELIST,
  DATE_OPTIONS,
  DATE_RANGE_TYPE,
  FILTER_CONDITION_TYPE,
} from 'src/pages/worksheet/common/WorkSheetFilter/enum';
import { getConditionType, getTypeKey, redefineComplexControl } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { accDiv, accMul } from 'src/utils/common';
import { isEmptyValue, toFixed } from 'src/utils/control';
import { dateAppZoneToServerZone } from 'src/utils/project';
import { filterEmptyChildTableRows } from 'src/utils/record';

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

const getValueByDateRange = dateRange => {
  let value;
  _.flattenDeep(DATE_OPTIONS).map(o => {
    if (o.value === dateRange) {
      value = parseInt(o.text.replace(/\D/g, '')) || 0;
    }
  });
  return value;
};

const dateFn = (filterData, value, isEQ, appTimeZone) => {
  const { dateRange, dataType } = filterData;
  let result = true;
  let date = '';
  switch (dateRange) {
    // { text: _l('本周'), value: 4 },
    case 4:
      date = moment().startOf('week').format('YYYY-MM-DD');
      date = dataType === 16 ? dateAppZoneToServerZone(date, appTimeZone) : date;
      result = moment(value).isSame(date, 'week');
      break;
    // { text: _l('上周'), value: 5 },
    case 5:
      date = moment().startOf('week').add(-1, 'week').format('YYYY-MM-DD');
      date = dataType === 16 ? dateAppZoneToServerZone(date, appTimeZone) : date;
      result = moment(value).isSame(date, 'week');
      break;
    // { text: _l('下周'), value: 6 },
    case 6:
      date = moment().startOf('week').add(1, 'week').format('YYYY-MM-DD');
      date = dataType === 16 ? dateAppZoneToServerZone(date, appTimeZone) : date;
      result = moment(value).isSame(date, 'week');
      break;
    // { text: _l('本月'), value: 7 },
    case 7:
      date = moment().startOf('month').format('YYYY-MM-DD');
      date = dataType === 16 ? dateAppZoneToServerZone(date, appTimeZone) : date;
      result = moment(value).isSame(date, 'month');
      break;
    // { text: _l('上个月'), value: 8 },
    case 8:
      date = moment().startOf('month').add(-1, 'month').format('YYYY-MM-DD');
      date = dataType === 16 ? dateAppZoneToServerZone(date, appTimeZone) : date;
      result = moment(value).isSame(date, 'month');
      break;
    // { text: _l('下个月'), value: 9 },
    case 9:
      date = moment().startOf('month').add(1, 'month').format('YYYY-MM-DD');
      date = dataType === 16 ? dateAppZoneToServerZone(date, appTimeZone) : date;
      result = moment(value).isSame(date, 'month');
      break;
    // { text: _l('本季度'), value: 12 },
    case 12:
      date = moment().startOf('quarter').format('YYYY-MM-DD');
      date = dataType === 16 ? dateAppZoneToServerZone(date, appTimeZone) : date;
      result = moment(value).isSame(date, 'quarter');
      break;
    // { text: _l('上季度'), value: 13 },
    case 13:
      date = moment().startOf('quarter').add(-1, 'quarter').format('YYYY-MM-DD');
      date = dataType === 16 ? dateAppZoneToServerZone(date, appTimeZone) : date;
      result = moment(value).isSame(date, 'quarter');
      break;
    // { text: _l('下季度'), value: 14 },
    case 14:
      date = moment().startOf('quarter').add(-1, 'quarter').format('YYYY-MM-DD');
      date = dataType === 16 ? dateAppZoneToServerZone(date, appTimeZone) : date;
      result = moment(value).isSame(date, 'quarter');
      break;
    // { text: _l('今年'), value: 15 },
    case 15:
      date = moment().startOf('year').format('YYYY-MM-DD');
      date = dataType === 16 ? dateAppZoneToServerZone(date, appTimeZone) : date;
      result = moment(value).isSame(date, 'year');
      break;
    // { text: _l('去年'), value: 16 },
    case 16:
      date = moment().startOf('year').add(-1, 'year').format('YYYY-MM-DD');
      date = dataType === 16 ? dateAppZoneToServerZone(date, appTimeZone) : date;
      result = moment(value).isSame(date, 'year');
      break;
    // { text: _l('明年'), value: 17 },
    case 17:
      date = moment().startOf('year').add(1, 'year').format('YYYY-MM-DD');
      date = dataType === 16 ? dateAppZoneToServerZone(date, appTimeZone) : date;
      result = moment(value).isSame(date, 'year');
      break;
  }
  return isEQ ? result : !result;
};

const dayFn = (filterData = {}, value, isGT, currentControl = {}, appTimeZone) => {
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
      let date = moment().format('YYYY-MM-DD');
      return dataType === 16 ? dateAppZoneToServerZone(date, appTimeZone) : date;
    // { text: _l('昨天'), value: 2 },
    case 2:
      date = moment()
        .subtract(dateRangeTypeNum || 1, 'days')
        .format('YYYY-MM-DD');
      return dataType === 16 ? dateAppZoneToServerZone(date, appTimeZone) : date;
    // { text: _l('明天'), value: 3 },
    case 3:
      date = moment()
        .add(dateRangeTypeNum || 1, 'days')
        .format('YYYY-MM-DD');
      return dataType === 16 ? dateAppZoneToServerZone(date, appTimeZone) : date;
    // { text: _l('本周'), value: 4 },
    case 4:
      date = isGT ? moment().weekday(0).format('YYYY-MM-DD') : moment().endOf('isoWeek').format('YYYY-MM-DD');
      return dataType === 16 ? dateAppZoneToServerZone(date, appTimeZone) : date;
    // { text: _l('上周'), value: 5 },
    case 5:
      date = isGT
        ? moment().weekday(-7).format('YYYY-MM-DD')
        : moment().weekday(0).subtract(1, 'days').format('YYYY-MM-DD');
      return dataType === 16 ? dateAppZoneToServerZone(date, appTimeZone) : date;
    // { text: _l('下周'), value: 6 },
    case 6:
      date = isGT ? moment().weekday(7).format('YYYY-MM-DD') : moment().weekday(7).add(6, 'days').format('YYYY-MM-DD');
      return dataType === 16 ? dateAppZoneToServerZone(date, appTimeZone) : date;
    // { text: _l('本月'), value: 7 },
    case 7:
      date = isGT ? moment().add('month', 0).format('YYYY-MM') + '-01' : moment().endOf('month').format('YYYY-MM-DD');
      return dataType === 16 ? dateAppZoneToServerZone(date, appTimeZone) : date;
    // { text: _l('上个月'), value: 8 },
    case 8:
      date = isGT
        ? moment()
            .month(moment().month() - (dateRangeTypeNum || 1))
            .startOf('month')
            .format('YYYY-MM-DD')
        : moment()
            .month(moment().month() - (dateRangeTypeNum || 1))
            .endOf('month')
            .format('YYYY-MM-DD');
      return dataType === 16 ? dateAppZoneToServerZone(date, appTimeZone) : date;
    // { text: _l('下个月'), value: 9 },
    case 9:
      date = isGT
        ? moment()
            .month(moment().month() + (dateRangeTypeNum || 1))
            .startOf('month')
            .format('YYYY-MM-DD')
        : moment()
            .month(moment().month() + (dateRangeTypeNum || 1))
            .endOf('month')
            .format('YYYY-MM-DD');
      return dataType === 16 ? dateAppZoneToServerZone(date, appTimeZone) : date;
    // { text: _l('本季度'), value: 12 },
    case 12:
      date = isGT ? moment().startOf('quarter').format('YYYY-MM-DD') : moment().endOf('quarter').format('YYYY-MM-DD');
      return dataType === 16 ? dateAppZoneToServerZone(date, appTimeZone) : date;
    // { text: _l('上季度'), value: 13 },
    case 13:
      date = isGT
        ? moment()
            .startOf('quarter')
            .subtract(dateRangeTypeNum || 3, 'month')
            .format('YYYY-MM-DD')
        : moment()
            .endOf('quarter')
            .subtract(dateRangeTypeNum || 3, 'month')
            .format('YYYY-MM-DD');
      return dataType === 16 ? dateAppZoneToServerZone(date, appTimeZone) : date;
    // { text: _l('下季度'), value: 14 },
    case 14:
      date = isGT
        ? moment()
            .startOf('quarter')
            .add(dateRangeTypeNum || 3, 'month')
            .format('YYYY-MM-DD')
        : moment()
            .endOf('quarter')
            .add(dateRangeTypeNum || 3, 'month')
            .format('YYYY-MM-DD');
      return dataType === 16 ? dateAppZoneToServerZone(date, appTimeZone) : date;
    // { text: _l('今年'), value: 15 },
    case 15:
      date = isGT ? moment().format('YYYY') + '-01' + '-01' : moment().endOf('year').format('YYYY-MM-DD');
      return dataType === 16 ? dateAppZoneToServerZone(date, appTimeZone) : date;
    // { text: _l('去年'), value: 16 },
    case 16:
      date = isGT
        ? moment()
            .add(dateRangeTypeNum || -1, 'year')
            .format('YYYY') +
          '-01' +
          '-01'
        : moment()
            .add(dateRangeTypeNum || -1, 'year')
            .endOf('year')
            .format('YYYY-MM-DD');
      return dataType === 16 ? dateAppZoneToServerZone(date, appTimeZone) : date;
    // { text: _l('明年'), value: 17 },
    case 17:
      date = isGT
        ? moment()
            .add(dateRangeTypeNum || 1, 'year')
            .format('YYYY') +
          '-01' +
          '-01'
        : moment()
            .add(dateRangeTypeNum || 1, 'year')
            .endOf('year')
            .format('YYYY-MM-DD');
      return dataType === 16 ? dateAppZoneToServerZone(date, appTimeZone) : date;
    // { text: _l('过去...天'), value: 10 },
    case 10:
    case 21:
    case 22:
    case 23:
      date = moment()
        .subtract(getValueByDateRange(dateRange) || value, 'day')
        .format('YYYY-MM-DD');
      return dataType === 16 ? dateAppZoneToServerZone(date, appTimeZone) : date;
    // { text: _l('将来...天'), value: 11 },
    case 11:
    case 31:
    case 32:
    case 33:
      date = moment()
        .add(getValueByDateRange(dateRange) || value, 'day')
        .format('YYYY-MM-DD');
      return dataType === 16 ? dateAppZoneToServerZone(date, appTimeZone) : date;
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
      tempTime = tempTime.format(formatMode || 'YYYY-MM-DD');
      return dataType === 16 ? dateAppZoneToServerZone(tempTime, appTimeZone) : tempTime;
    default:
      //日期时间
      const formatText = (getDatePickerConfigs(currentControl) || {}).formatMode;
      return type === 16 ? moment(value).format(formatText) : moment(value).format(formatText);
  }
};

export default function filterFn({ filterData, originControl, data = [], recordId, appTimeZone }) {
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
      }
    }

    if (_.isArray(compareValues)) {
      compareValues = compareValues.filter(i => !isEmptyValue(i));
      if (control.type === 5) {
        compareValues = compareValues.map(i => i.toLowerCase());
      }
    }

    // 时间类显示类型
    if (_.includes([15, 16, 46], control.type)) {
      formatMode = getFormatMode(control, currentControl, conditionGroupType);
      timeLevel = TIME_OPTIONS[TIME_MODE_OPTIONS[formatMode]];

      if (!dynamicSource.length && control.type !== 46) {
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
    // 邮箱value忽略大小写
    function formatControlValue(v, con = {}) {
      if (
        (con.originType === 37 || con.type === 31 || (con.originType === 30 && con.sourceControltype === 37)) &&
        v &&
        /^\d+\.\d+$/.test(`${v}`)
      ) {
        const isNumShow = (con.advancedSetting || {}).numshow === '1';
        return accDiv(parseFloat(toFixed(accMul(parseFloat(v), 100), isNumShow ? con.dot + 2 : con.dot)), 100);
      }
      if (con.type === 5 && v) {
        return v.toLowerCase();
      }
      return v;
    }
    value = formatControlValue(value, control);
    compareValue = formatControlValue(compareValue, currentControl);

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
              const areaValues = compareValues.map(it => safeParse(it, '{}').id || safeParse(it, '{}').code);
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
              const areaValues = compareValues.map(it => safeParse(it, '{}').id || safeParse(it, '{}').code);
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
                _.map(compareValues, (it = {}) => {
                  let valueN = safeParse(value || '[]');
                  _.map(valueN, item => {
                    if (it === item) {
                      isEQ = false;
                    }
                  });
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
                  moment(
                    control.type === 16
                      ? dateAppZoneToServerZone(filterData.minValue, appTimeZone)
                      : filterData.minValue,
                  ).format(formatMode),
                  moment(
                    control.type === 16
                      ? dateAppZoneToServerZone(filterData.maxValue, appTimeZone)
                      : filterData.maxValue,
                  ).format(formatMode),
                  timeLevel,
                  '[]',
                )
              : false;
          case CONTROL_FILTER_WHITELIST.TIME.value:
            return value
              ? moment(value, formatMode).isBetween(
                  moment(filterData.minValue, formatMode).format(`YYYY-MM-DD ${formatMode}`),
                  moment(filterData.maxValue, formatMode).format(`YYYY-MM-DD ${formatMode}`),
                  timeLevel,
                  '[]',
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
                  moment(
                    control.type === 16
                      ? dateAppZoneToServerZone(filterData.minValue, appTimeZone)
                      : filterData.minValue,
                  ).format(formatMode),
                  moment(
                    control.type === 16
                      ? dateAppZoneToServerZone(filterData.maxValue, appTimeZone)
                      : filterData.maxValue,
                  ).format(formatMode),
                  timeLevel,
                  '[]',
                )
              : false;
          case CONTROL_FILTER_WHITELIST.TIME.value:
            return value
              ? !moment(value, formatMode).isBetween(
                  moment(filterData.minValue, formatMode).format(`YYYY-MM-DD ${formatMode}`),
                  moment(filterData.maxValue, formatMode).format(`YYYY-MM-DD ${formatMode}`),
                  timeLevel,
                  '[]',
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
            let day = dayFn(filterData, compareValue, false, currentControl, appTimeZone);
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
            let day = dayFn(filterData, compareValue, false, currentControl, appTimeZone);
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
            let day = dayFn(filterData, compareValue, true, currentControl, appTimeZone);
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
            let day = dayFn(filterData, compareValue, false, currentControl, appTimeZone);
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
            let day = dayFn(filterData, compareValue, true, currentControl, appTimeZone);
            //过去 | 将来
            const hasToday = _.includes(filterData.values || [], 'today');
            const todayDate =
              dataType === 16
                ? dateAppZoneToServerZone(moment().format('YYYY-MM-DD'), appTimeZone)
                : moment().format('YYYY-MM-DD');
            if (_.includes([10, 101], dateRange)) {
              return hasToday
                ? moment(value).isSameOrBefore(todayDate, timeLevel) && moment(value).isSameOrAfter(day, timeLevel)
                : moment(value).isBefore(todayDate, timeLevel) && moment(value).isSameOrAfter(day, timeLevel);
            } else if (_.includes([11, 102], dateRange)) {
              return hasToday
                ? moment(value).isSameOrAfter(todayDate, timeLevel) && moment(value).isSameOrBefore(day, timeLevel)
                : moment(value).isAfter(todayDate, timeLevel) && moment(value).isSameOrBefore(day, timeLevel);
              // 本周、本月、本季度、今年等等
            } else if (_.includes([4, 5, 6, 7, 8, 9, 12, 13, 14, 15, 16, 17], dateRange) && !dynamicSource.length) {
              return dateFn(filterData, value, true, appTimeZone);
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
            let day = dayFn(filterData, compareValue, true, currentControl, appTimeZone);
            //过去 | 将来
            const hasToday = _.includes(filterData.values || [], 'today');
            const todayDate =
              dataType === 16
                ? dateAppZoneToServerZone(moment().format('YYYY-MM-DD'), appTimeZone)
                : moment().format('YYYY-MM-DD');
            if (dateRange === 10) {
              return (
                (hasToday ? moment(value).isAfter(todayDate, 'day') : moment(value).isSameOrAfter(todayDate, 'day')) ||
                moment(value).isBefore(day, 'day')
              );
            } else if (dateRange === 11) {
              return (
                (hasToday
                  ? moment(value).isBefore(todayDate, 'day')
                  : moment(value).isSameOrBefore(todayDate, 'day')) || moment(value).isAfter(day, 'day')
              );
              // 本周、本月、本季度、今年等等
            } else if (_.includes([4, 5, 6, 7, 8, 9, 12, 13, 14, 15, 16, 17], dateRange) && !dynamicSource.length) {
              return dateFn(filterData, value, false, appTimeZone);
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
}
