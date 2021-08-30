import {
  CONTROL_FILTER_WHITELIST,
  FILTER_CONDITION_TYPE,
  API_ENUM_TO_TYPE,
} from 'src/pages/worksheet/common/WorkSheetFilter/enum.js';
import moment from 'moment';
import { getTypeKey, redefineComplexControl } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { getArrBySpliceType } from 'src/pages/FormSet/components/columnRules/config';
import { onValidator } from './DataFormat';
import { controlState } from './utils';

const dayFn = (filterData = {}, value, isGT, type) => {
  let { dateRange, dynamicSource = [] } = filterData;
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
      return moment().subtract(value, 'day').format('YYYY-MM-DD');
    // { text: _l('将来...天'), value: 11 },
    case 11:
      return moment().add(value, 'day').format('YYYY-MM-DD');
    // { text: _l('指定时间'), value: 18 },
    case 18:
      return moment(value).format('YYYY-MM-DD');
    default:
      //日期时间
      return type === 16 ? moment(value).format('YYYY-MM-DD HH:mm') : moment(value).format('YYYY-MM-DD');
  }
};

export const filterFn = (filterData, originControl, data = []) => {
  const { filterType = '', dataType = '', dynamicSource = [], dateRange } = filterData;
  const control = redefineComplexControl(originControl);
  if (!control) {
    return true;
  }
  //比较字段值
  let compareValues = filterData.values || [];
  let compareValue = filterData.value || '';
  //条件字段值
  let { value = '', advancedSetting = {} } = control || {};
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
    currentControl = _.find(data, it => it.controlId === cid) || {};
    //是(等于)、不是(不等于)、大于(等于)、小于(等于) && NUMBER
    //大于、小于 && NUMBER、DATE
    //日期是、日期不是 && DATE
    if (
      (_.includes([2, 6, 14, 16], filterType) && _.includes([2], conditionGroupType)) ||
      (_.includes([13, 15], filterType) && _.includes([2, 4], conditionGroupType)) ||
      (_.includes([17, 18], filterType) && _.includes([4], conditionGroupType))
    ) {
      compareValue = currentControl.value;
      //是(等于)、不是(不等于) && (OPTIONS && (单选) || USER)
    } else if (
      _.includes([2, 6], filterType) &&
      ((_.includes([5], conditionGroupType) && _.includes([9, 11], dataType)) || _.includes([6], conditionGroupType))
    ) {
      const val = currentControl.value ? JSON.parse(currentControl.value) : currentControl.value;
      compareValues = typeof val === 'object' ? val : [currentControl.value];
    } else {
      compareValues = [currentControl.value];
    }
  }
  switch (filterType) {
    //   LIKE: 1, // 包含
    case FILTER_CONDITION_TYPE.LIKE:
      switch (conditionGroupType) {
        case CONTROL_FILTER_WHITELIST.TEXT.value:
        case CONTROL_FILTER_WHITELIST.RELATE_RECORD.value:
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
    case FILTER_CONDITION_TYPE.EQ:
      switch (conditionGroupType) {
        case CONTROL_FILTER_WHITELIST.USERS.value: // ???
          if (!value) {
            return false;
          }
          let isEQ = false;
          _.map(compareValues, it => {
            let user = JSON.parse(value);
            _.map(user, its => {
              const id = typeof it === 'string' ? JSON.parse(it || '{}').id : it.accountId;
              if (its.accountId === id) {
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
            let { id = '0' } = JSON.parse(compareValues);
            let { code } = JSON.parse(value);
            return parseInt(id) === parseInt(code);
            // 部门
          } else if (dataType === API_ENUM_TO_TYPE.GROUP_PICKER) {
            if (!value) {
              return !!value;
            }
            let isEQ = false;
            _.map(compareValues, it => {
              let valueN = JSON.parse(value);
              _.map(valueN, item => {
                if (item.departmentId === JSON.parse(it || '{}').id) {
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
            if (dataType === API_ENUM_TO_TYPE.OPTIONS_10) {
              // 多选10
              let isEQ = false;
              JSON.parse(value || '[]').forEach(singleValue => {
                if (_.includes(compareValues, singleValue)) {
                  isEQ = true;
                }
              });
              return isEQ;
            } else {
              return compareValues.includes(JSON.parse(value || '[]')[0]);
            }
          } else {
            if (!value) {
              return !!value;
            }
            return _.includes(compareValues, value);
          }
        case CONTROL_FILTER_WHITELIST.NUMBER.value:
          return parseFloat(compareValue) === parseFloat(value);
        case CONTROL_FILTER_WHITELIST.TEXT.value:
          let isInValue = false;
          _.map(compareValues, it => {
            if (it === value) {
              isInValue = true;
            }
          });
          return isInValue;
        case CONTROL_FILTER_WHITELIST.BOOL.value:
          return value === '1';
        default:
          return true;
      }
    //   START: 3, // 开头为
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
    //   END: 4, // 结尾为
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
    //   NCONTAIN: 5, // 不包含
    case FILTER_CONDITION_TYPE.NCONTAIN:
      switch (conditionGroupType) {
        case CONTROL_FILTER_WHITELIST.TEXT.value:
        case CONTROL_FILTER_WHITELIST.RELATE_RECORD.value:
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
    case FILTER_CONDITION_TYPE.NE:
      switch (conditionGroupType) {
        case CONTROL_FILTER_WHITELIST.USERS.value: // ???
          if (!value) {
            return true;
          }
          let isInValue = true;
          _.map(compareValues, it => {
            let user = JSON.parse(value);
            _.map(user, its => {
              const id = typeof it === 'string' ? JSON.parse(it || '{}').id : it.accountId;
              if (its.accountId === id) {
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
            let { id = '0' } = JSON.parse(compareValues);
            let { code } = JSON.parse(value);
            return parseInt(id) !== parseInt(code);
            // 部门
          } else if (dataType === API_ENUM_TO_TYPE.GROUP_PICKER) {
            if (!value) {
              return !value;
            }
            let isNE = true;
            _.map(compareValues, it => {
              let valueN = JSON.parse(value);
              _.map(valueN, item => {
                if (item.departmentId === JSON.parse(it || '{}').id) {
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
            if (dataType === API_ENUM_TO_TYPE.OPTIONS_10) {
              let isEQ = true;
              JSON.parse(value || '[]').forEach(singleValue => {
                if (_.includes(compareValues, singleValue)) {
                  isEQ = false;
                }
              });
              return isEQ;
            } else {
              return !compareValues.includes(JSON.parse(value || '[]')[0]);
            }
          } else {
            if (!value) {
              return !value;
            }
            return !_.includes(compareValues, value);
          }
        case CONTROL_FILTER_WHITELIST.NUMBER.value:
          return parseFloat(compareValue) !== parseFloat(value);
        case CONTROL_FILTER_WHITELIST.TEXT.value:
          let isInValue1 = true;
          _.map(compareValues, it => {
            if (it === value) {
              isInValue1 = false;
            }
          });
          return isInValue1;
        case CONTROL_FILTER_WHITELIST.BOOL.value:
          return value !== '1';
        default:
          return true;
      }
    //   ISNULL: 7, // 为空
    case FILTER_CONDITION_TYPE.ISNULL:
      switch (conditionGroupType) {
        case CONTROL_FILTER_WHITELIST.DATE.value:
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
            return !JSON.parse(value || '{}').code;
            //等级
          } else if (dataType === API_ENUM_TO_TYPE.SCORE) {
            return !value;
          }
          return JSON.parse(value || '[]').length <= 0;
        case CONTROL_FILTER_WHITELIST.BOOL.value:
          if (!value) {
            return !value;
          }
          if (dataType === API_ENUM_TO_TYPE.ATTACHMENT) {
            let data = JSON.parse(value);
            if (_.isArray(data)) {
              return data.length <= 0;
            } else {
              return data.attachments.length <= 0 && data.knowledgeAtts.length <= 0 && data.attachmentData.length <= 0;
            }
          } else if (dataType === API_ENUM_TO_TYPE.RELATION) {
            return JSON.parse(value).length <= 0;
          }
          return !value;
        case CONTROL_FILTER_WHITELIST.USERS.value:
        case CONTROL_FILTER_WHITELIST.CASCADER.value:
          if (!value) {
            return !value;
          } else {
            return JSON.parse(value).length <= 0;
          }
        case CONTROL_FILTER_WHITELIST.RELATE_RECORD.value:
          if (showtype === '2') {
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
              return JSON.parse(value).length <= 0;
            }
          }
        case CONTROL_FILTER_WHITELIST.SUBLIST.value: //子表
          if (!value) {
            return !value;
          } else {
            if (value.rows) {
              return value.rows.length <= 0;
            } else {
              return value === '0';
            }
          }
        default:
          return true;
      }
    //   HASVALUE: 8, // 不为空
    case FILTER_CONDITION_TYPE.HASVALUE:
      switch (conditionGroupType) {
        case CONTROL_FILTER_WHITELIST.DATE.value:
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
            return JSON.parse(value || '{}').code;
            //等级
          } else if (dataType === API_ENUM_TO_TYPE.SCORE) {
            return !!value;
          }
          return JSON.parse(value || '[]').length > 0;
        case CONTROL_FILTER_WHITELIST.BOOL.value:
          if (!value) {
            return !!value;
          }
          if (dataType === API_ENUM_TO_TYPE.ATTACHMENT) {
            let data = JSON.parse(value);
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
            return JSON.parse(value).length > 0;
          }
          return !!value;
        case CONTROL_FILTER_WHITELIST.USERS.value:
        case CONTROL_FILTER_WHITELIST.CASCADER.value:
          if (!value) {
            return !!value;
          } else {
            return JSON.parse(value).length > 0;
          }
        case CONTROL_FILTER_WHITELIST.RELATE_RECORD.value:
          if (showtype === '2') {
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
              return JSON.parse(value).length > 0;
            }
          }
        case CONTROL_FILTER_WHITELIST.SUBLIST.value: //子表
          if (!value) {
            return !!value;
          } else {
            if (value.rows) {
              return value.rows.length > 0;
            } else {
              return value !== '0';
            }
          }
        default:
          return true;
      }
    //   BETWEEN: 11, // 在范围内
    case FILTER_CONDITION_TYPE.BETWEEN:
      switch (conditionGroupType) {
        case CONTROL_FILTER_WHITELIST.NUMBER.value:
          return (
            parseFloat(value) <= parseFloat(filterData.maxValue) && parseFloat(value) >= parseFloat(filterData.minValue)
          );
        case CONTROL_FILTER_WHITELIST.DATE.value:
          return moment(value).isBetween(
            moment(filterData.minValue).format('YYYY-MM-DD HH:mm'),
            moment(filterData.maxValue).format('YYYY-MM-DD HH:mm'),
            'second',
          );
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
            let { id = '0' } = JSON.parse(compareValues);
            let { code } = JSON.parse(value);
            return parseInt(id) === parseInt(code);
            // 部门
          }
        default:
          return true;
      }
    //   NBETWEEN: 12, // 不在范围内
    case FILTER_CONDITION_TYPE.NBETWEEN:
      switch (conditionGroupType) {
        case CONTROL_FILTER_WHITELIST.NUMBER.value:
          return (
            parseFloat(value) > parseFloat(filterData.maxValue) && parseFloat(value) < parseFloat(filterData.minValue)
          );
        case CONTROL_FILTER_WHITELIST.DATE.value:
          return !moment(value).isBetween(
            moment(filterData.minValue).format('YYYY-MM-DD HH:mm'),
            moment(filterData.maxValue).format('YYYY-MM-DD HH:mm'),
            'second',
          );
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
            let { id = '0' } = JSON.parse(compareValues);
            let { code } = JSON.parse(value);
            return parseInt(id) !== parseInt(code);
            // 部门
          }
        default:
          return true;
      }
    //   GT: 13, // > 晚于
    case FILTER_CONDITION_TYPE.GT:
      switch (conditionGroupType) {
        case CONTROL_FILTER_WHITELIST.NUMBER.value:
          return parseFloat(value) > parseFloat(compareValue);
        case CONTROL_FILTER_WHITELIST.DATE.value:
          let day = dayFn(filterData, compareValue, false, currentControl.type);
          return moment(value).isAfter(day, 'second');
        default:
          return true;
      }
    //   GTE: 14, // >=
    case FILTER_CONDITION_TYPE.GTE:
      switch (conditionGroupType) {
        case CONTROL_FILTER_WHITELIST.NUMBER.value:
          return parseFloat(value) >= parseFloat(compareValue);
        default:
          return true;
      }
    //   LT: 15, // < 早于
    case FILTER_CONDITION_TYPE.LT:
      switch (conditionGroupType) {
        case CONTROL_FILTER_WHITELIST.NUMBER.value:
          return parseFloat(value) < parseFloat(compareValue);
        case CONTROL_FILTER_WHITELIST.DATE.value:
          let day = dayFn(filterData, compareValue, true, currentControl.type);
          return moment(value).isBefore(day, 'second');
        default:
          return true;
      }
    //   LTE: 16, // <=
    case FILTER_CONDITION_TYPE.LTE:
      switch (conditionGroupType) {
        case CONTROL_FILTER_WHITELIST.NUMBER.value:
          return parseFloat(value) <= parseFloat(compareValue);
        default:
          return true;
      }
    //   DATEENUM: 17, // 日期是
    case FILTER_CONDITION_TYPE.DATEENUM:
      switch (conditionGroupType) {
        case CONTROL_FILTER_WHITELIST.DATE.value:
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
          }
          return moment(value).isSame(day, 'second');
        default:
          return true;
      }
    //   NDATEENUM: 18, // 日期不是
    case FILTER_CONDITION_TYPE.NDATEENUM:
      switch (conditionGroupType) {
        case CONTROL_FILTER_WHITELIST.DATE.value:
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
          }
          return !moment(value).isSame(day, 'second');
        default:
          return true;
      }
    //   SELF: 21, // 本人
    //   SELFANDSUB: 22, // 本人和下属
    //   SUB: 23, // 下属

    //   RCEQ: 24, // 关联表 (单条) 级联选择  =>是
    case FILTER_CONDITION_TYPE.RCEQ:
      switch (conditionGroupType) {
        case CONTROL_FILTER_WHITELIST.RELATE_RECORD.value:
        case CONTROL_FILTER_WHITELIST.CASCADER.value:
          let isInValue = false;
          _.map(compareValues, it => {
            let itValue = dynamicSource.length > 0 ? JSON.parse(it || '[]')[0] || {} : JSON.parse(it || '{}');
            let valueN = value ? JSON.parse(value) : '';
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
            itValue = dynamicSource.length > 0 ? JSON.parse(it || '[]')[0] : JSON.parse(it || '{}');
            let valueN = value ? JSON.parse(value) : '';
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
    default:
      return true;
  }
};

//判断业务规则配置条件是否满足
export const checkValueAvailable = (rule = {}, data = []) => {
  let isAvailable = false;
  let transFilters = getArrBySpliceType(rule.filters) || [[]]; //条件二维数组

  transFilters.forEach(arr => {
    let itemAvailable = [];

    arr.forEach(its => {
      let filterControl = data.find(a => a.controlId === its.controlId);
      if (filterControl) {
        itemAvailable.push(filterFn(its, filterControl, data));
      }
    });

    let isFound = !_.filter(itemAvailable, item => !item).length;
    isAvailable = isAvailable || isFound;
  });

  return isAvailable;
};

//判断所有业务规则是否满足条件
export const checkAllValueAvailable = (rules = [], data = [], from) => {
  let errors = [];
  const filterRules = getAvailableFilters(rules, data, from);
  if (filterRules && filterRules.length > 0) {
    filterRules.map(rule => {
      const isAvailable = checkValueAvailable(rule, data);
      if (isAvailable) {
        rule.ruleItems.map(item => {
          if (item.type === 6) {
            errors.push(item.message);
          }
        });
      }
    });
  }
  return errors;
};

const replaceStr = (str, index, value) => {
  return str.substring(0, index) + value + str.substring(index + 1);
};

const updataDataPermission = (attrs = [], it, checkRuleValidator, from, item = {}) => {
  //子表或关联记录
  const isSubList = _.includes([29, 34], item.type);
  let fieldPermission = it.fieldPermission || '111';
  let required = it.required || false;
  let disabled = it.disabled || false;

  //隐藏
  if (_.includes(attrs, 2)) {
    fieldPermission = replaceStr(fieldPermission, 0, '0');
    if (isSubList && _.includes(item.showControls || [], it.controlId)) {
      item.showControls = (item.showControls || []).filter(c => c !== it.controlId);
    }
  } else {
    //显示
    if (_.includes(attrs, 1)) {
      fieldPermission = replaceStr(fieldPermission, 0, '1');
    }
  }
  //只读
  if (_.includes(attrs, 4)) {
    fieldPermission = replaceStr(fieldPermission, 1, '0');
  } else {
    //必填
    if (_.includes(attrs, 5)) {
      required = true;
      fieldPermission = replaceStr(fieldPermission, 1, '1');
      checkRuleValidator(it.controlId, onValidator({ ...it, required, fieldPermission }, from));
    } else {
      //编辑
      if (_.includes(attrs, 3)) {
        fieldPermission = replaceStr(fieldPermission, 1, '1');
        checkRuleValidator(it.controlId, onValidator({ ...it, fieldPermission }, from));
      }
    }
  }
  //锁定
  if (_.includes(attrs, 7)) {
    disabled = true;
  }
  //解锁
  if (_.includes(attrs, 8)) {
    disabled = false;
  }
  it.fieldPermission = fieldPermission;
  it.required = required;
  it.disabled = disabled;
};

const getAvailableFilters = (rules = [], formatData = [], from) => {
  //过滤禁用规则及单个且数组中字段全部删除情况
  let filterRules = [];
  rules.map(o => {
    if (!o.disabled) {
      const transFilters = getArrBySpliceType(o.filters);

      let filterTrs = [];
      let ruleItems = o.ruleItems;
      let isAllExit = [];

      transFilters.map(tr => {
        const itExit = _.every(tr, t => {
          const data = _.find(formatData, da => da.controlId === t.controlId) || {};
          return data.controlId && controlState(data, from).visible;
        });
        isAllExit.push(itExit);

        if (_.some(tr, t => _.findIndex(formatData, da => da.controlId === t.controlId) > -1)) {
          filterTrs = filterTrs.concat(tr);
        }
      });

      //错误提示, 且条件字段不存在或隐藏，不走业务规则
      const hasErrorWarn = _.findIndex(o.ruleItems, it => it.type === 6) > -1;
      if (hasErrorWarn && !_.includes(isAllExit, true)) {
        ruleItems = ruleItems.filter(ru => ru.type !== 6);
      }
      filterTrs.length > 0 && filterRules.push({ ...o, filters: filterTrs, ruleItems });
    }
  });
  return filterRules;
};

// 字段显示规则计算
export const updateRulesData = ({ rules = [], data = [], checkRuleValidator = () => {}, from }) => {
  if (!rules.length) return data;

  let formatData = data.map(item => {
    return {
      ...item,
      ...item.defaultState,
      relationControls: (item.relationControls || []).map(re => ({ ...re, ...re.defaultState })),
    };
  });
  let relateRuleType = {
    parent: {},
    child: {},
  };

  function pushType(key, id, type) {
    relateRuleType[key][id] ? relateRuleType[key][id].push(type) : (relateRuleType[key][id] = [type]);
  }

  if (rules.length > 0) {
    const filterRules = getAvailableFilters(rules, formatData, from);

    if (filterRules && filterRules.length > 0) {
      filterRules.map(rule => {
        rule.ruleItems.map(({ type, controls = [] }) => {
          const isAvailable = checkValueAvailable(rule, formatData);
          let currentType = type;
          //显示隐藏无论满足条件与否都要操作
          if (currentType === 1) {
            currentType = isAvailable ? 1 : 2;
          } else if (currentType === 2) {
            currentType = isAvailable ? 2 : 1;
          }
          if (_.includes([3, 4, 5, 7, 8], currentType) && !isAvailable) {
            return;
          }

          if (_.includes([7, 8], currentType)) {
            formatData.map(item => {
              pushType('parent', item.controlId, currentType);
            });
          } else {
            controls.map(con => {
              const { controlId = '', childControlIds = [] } = con;
              if (!childControlIds.length) {
                pushType('parent', controlId, currentType);
              } else {
                childControlIds.map(child => pushType('child', child, currentType));
              }
            });
          }
        });
      });

      formatData.forEach(it => {
        it.relationControls.forEach(re => {
          if ((relateRuleType['child'] || {})[re.controlId]) {
            updataDataPermission(relateRuleType['child'][re.controlId], re, checkRuleValidator, from, it);
          }
        });
        if ((relateRuleType['parent'] || {})[it.controlId]) {
          updataDataPermission(relateRuleType['parent'][it.controlId], it, checkRuleValidator, from);
        }
      });
    }
  }
  return formatData;
};
