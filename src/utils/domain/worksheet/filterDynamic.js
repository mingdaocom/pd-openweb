import _, { get } from 'lodash';
import moment from 'moment';
import { getDatePickerConfigs } from 'src/utils/domain/control/date';
import { renderText as renderCellText } from 'src/utils/domain/control/display';
import { redefineComplexControl } from 'src/utils/domain/control/normalization';
import { getSelectedOptions } from 'src/utils/domain/control/optionSelection';
import { isRelateRecordTableControl } from 'src/utils/domain/control/type';
import { checkCellIsEmpty } from 'src/utils/domain/control/value';
import { ROW_ID_CONTROL, SYSTEM_DATE_CONTROL } from 'src/utils/domain/control/widget';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/utils/domain/control/widgetTypes';
import { browserIsMobile } from 'src/utils/platform/browser/device';
import { getAppTimeZone } from 'src/utils/platform/runtime/config';
import { dateServerZoneToAppZone } from 'src/utils/platform/runtime/timeZone';
import { API_ENUM_TO_TYPE, FILTER_CONDITION_TYPE } from './filterConstants';
import { validate } from './filterQuick';
import { formatValues } from './filterValue';

/** 筛选可作为动态筛选值来源的控件。 */
export function relateDy(conditionType, controls, control, defaultValue, from) {
  if (
    defaultValue === FILTER_CONDITION_TYPE.ISNULL || // 为空
    defaultValue === FILTER_CONDITION_TYPE.HASVALUE || // 不为空
    // 在范围内 不在范围内(部门、地区支持属于不属于)
    ((defaultValue === FILTER_CONDITION_TYPE.BETWEEN || defaultValue === FILTER_CONDITION_TYPE.NBETWEEN) &&
      !_.includes(
        [
          API_ENUM_TO_TYPE.GROUP_PICKER,
          API_ENUM_TO_TYPE.AREA_INPUT_19,
          API_ENUM_TO_TYPE.AREA_INPUT_23,
          API_ENUM_TO_TYPE.AREA_INPUT_24,
        ],
        conditionType,
      ))
  ) {
    return [];
  }

  let typeList = [];

  switch (conditionType) {
    // 文本框、文本组合、自动编号
    case API_ENUM_TO_TYPE.TEXTAREA_INPUT_1:
    case API_ENUM_TO_TYPE.TEXTAREA_INPUT_2:
    case API_ENUM_TO_TYPE.CONCATENATE:
    case API_ENUM_TO_TYPE.AUTOID:
      // 除了检查框、自由连接、等级、他表字段以外所有能取到文本值的字段类型
      // 除分割线、备注、富文本、单选项、多选项、地区、人员、部门、检查框、附件、自由连接、签名、表关联、他表字段、汇总、子表、标签页外
      typeList = [
        API_ENUM_TO_TYPE.SWITCH,
        API_ENUM_TO_TYPE.RELATION,
        API_ENUM_TO_TYPE.SCORE,
        API_ENUM_TO_TYPE.SHEETFIELD,
        API_ENUM_TO_TYPE.SPLIT_LINE,
        API_ENUM_TO_TYPE.REMARK,
        API_ENUM_TO_TYPE.RICH_TEXT,
        API_ENUM_TO_TYPE.OPTIONS_9,
        API_ENUM_TO_TYPE.OPTIONS_10,
        API_ENUM_TO_TYPE.OPTIONS_11,
        API_ENUM_TO_TYPE.AREA_INPUT_24,
        API_ENUM_TO_TYPE.AREA_INPUT_19,
        API_ENUM_TO_TYPE.AREA_INPUT_23,
        API_ENUM_TO_TYPE.USER_PICKER,
        API_ENUM_TO_TYPE.GROUP_PICKER,
        API_ENUM_TO_TYPE.ATTACHMENT,
        API_ENUM_TO_TYPE.SIGNATURE,
        API_ENUM_TO_TYPE.RELATESHEET,
        API_ENUM_TO_TYPE.SUBTOTAL,
        API_ENUM_TO_TYPE.SUBLIST,
        API_ENUM_TO_TYPE.EMBED,
        API_ENUM_TO_TYPE.BARCODE,
        API_ENUM_TO_TYPE.CASCADER,
        API_ENUM_TO_TYPE.RELATESEARCH,
        API_ENUM_TO_TYPE.SECTION,
      ];
      return _.filter(controls, items => !_.includes(typeList, items.type));
    // 电话、证件、邮件
    case API_ENUM_TO_TYPE.PHONE_NUMBER_3:
    case API_ENUM_TO_TYPE.PHONE_NUMBER_4:
      typeList = [
        API_ENUM_TO_TYPE.PHONE_NUMBER_3,
        API_ENUM_TO_TYPE.PHONE_NUMBER_4,
        API_ENUM_TO_TYPE.TEXTAREA_INPUT_1,
        API_ENUM_TO_TYPE.TEXTAREA_INPUT_2,
      ];
      return _.filter(controls, items => _.includes(typeList, items.type));
    case API_ENUM_TO_TYPE.CRED_INPUT:
      typeList = [API_ENUM_TO_TYPE.CRED_INPUT, API_ENUM_TO_TYPE.TEXTAREA_INPUT_1, API_ENUM_TO_TYPE.TEXTAREA_INPUT_2];
      return _.filter(controls, items => _.includes(typeList, items.type));
    case API_ENUM_TO_TYPE.EMAIL_INPUT:
      typeList = [API_ENUM_TO_TYPE.TEXTAREA_INPUT_1, API_ENUM_TO_TYPE.TEXTAREA_INPUT_2, API_ENUM_TO_TYPE.EMAIL_INPUT];
      return _.filter(controls, items => _.includes(typeList, items.type));
    // 数值、金额、公式
    case API_ENUM_TO_TYPE.NUMBER_INPUT:
    case API_ENUM_TO_TYPE.MONEY_AMOUNT_8:
    case API_ENUM_TO_TYPE.MONEY_CN:
    case API_ENUM_TO_TYPE.NEW_FORMULA_31:
      // 数值、金额、公式和汇总（数值类型）、自动编号
      typeList = [
        API_ENUM_TO_TYPE.MONEY_AMOUNT_8,
        API_ENUM_TO_TYPE.MONEY_CN,
        API_ENUM_TO_TYPE.NEW_FORMULA_31,
        API_ENUM_TO_TYPE.SUBTOTAL,
        API_ENUM_TO_TYPE.AUTOID,
        API_ENUM_TO_TYPE.NUMBER_INPUT,
        API_ENUM_TO_TYPE.SCORE,
      ];
      return _.filter(
        _.filter(controls, items => _.includes(typeList, items.type)),
        it =>
          !_.includes([API_ENUM_TO_TYPE.SUBTOTAL], it.type) ||
          (it.type === API_ENUM_TO_TYPE.SUBTOTAL && 6 === it.enumDefault2), //汇总（数值类型
      );
    // 汇总
    case API_ENUM_TO_TYPE.SUBTOTAL:
      // 数值型
      if (control.enumDefault2 === 6) {
        typeList = [
          API_ENUM_TO_TYPE.MONEY_AMOUNT_8,
          API_ENUM_TO_TYPE.MONEY_CN,
          API_ENUM_TO_TYPE.NEW_FORMULA_31,
          API_ENUM_TO_TYPE.SUBTOTAL,
          API_ENUM_TO_TYPE.AUTOID,
        ];
        return _.filter(
          _.filter(controls, items => _.includes(typeList, items.type)),
          it =>
            !_.includes([API_ENUM_TO_TYPE.SUBTOTAL], it.type) ||
            (it.type === API_ENUM_TO_TYPE.SUBTOTAL && control.enumDefault2 === it.enumDefault2),
        );
      } else {
        // 时间类型
        typeList = [
          API_ENUM_TO_TYPE.DATE_INPUT_15,
          API_ENUM_TO_TYPE.DATE_INPUT_16,
          API_ENUM_TO_TYPE.NEW_FORMULA_38,
          API_ENUM_TO_TYPE.SUBTOTAL,
        ];
        return _.filter(
          _.filter(controls, items => _.includes(typeList, items.type)),
          it =>
            !_.includes([API_ENUM_TO_TYPE.SUBTOTAL], it.type) ||
            (it.type === API_ENUM_TO_TYPE.SUBTOTAL && control.enumDefault2 === it.enumDefault2),
        );
      }

    // 日期、公式
    case API_ENUM_TO_TYPE.DATE_INPUT_15:
    case API_ENUM_TO_TYPE.DATE_INPUT_16:
    case API_ENUM_TO_TYPE.NEW_FORMULA_38:
      // 日期、系统日期、公式和汇总（日期类型）
      typeList = [
        API_ENUM_TO_TYPE.DATE_INPUT_15,
        API_ENUM_TO_TYPE.DATE_INPUT_16,
        API_ENUM_TO_TYPE.NEW_FORMULA_38,
        API_ENUM_TO_TYPE.SUBTOTAL,
      ];
      return _.filter(
        _.filter(controls, items => _.includes(typeList, items.type)),
        it =>
          !_.includes([API_ENUM_TO_TYPE.SUBTOTAL], it.type) ||
          (it.type === API_ENUM_TO_TYPE.SUBTOTAL && 6 !== it.enumDefault2), //汇总（日期类型）
      );
    // 单选项(选项集)
    // 多选项(选项集)
    case API_ENUM_TO_TYPE.OPTIONS_9:
    case API_ENUM_TO_TYPE.OPTIONS_10:
    case API_ENUM_TO_TYPE.OPTIONS_11:
      // 单选项、多选项(相同选项集的其他字段)
      typeList = [API_ENUM_TO_TYPE.OPTIONS_9, API_ENUM_TO_TYPE.OPTIONS_10, API_ENUM_TO_TYPE.OPTIONS_11];
      return _.filter(controls, items => {
        const currentItems = redefineComplexControl(items);

        const getDataSource = i => {
          return i.originType === 30 ? _.get(i, 'sourceControl.dataSource') : i.dataSource;
        };

        return _.includes(typeList, currentItems.type) && getDataSource(currentItems) === getDataSource(control);
      });
    // 关联单条、级联选择
    case API_ENUM_TO_TYPE.RELATESHEET:
    case API_ENUM_TO_TYPE.CASCADER:
      typeList = [API_ENUM_TO_TYPE.RELATESHEET, API_ENUM_TO_TYPE.CASCADER];
      return _.filter(
        controls,
        items =>
          _.includes(typeList, items.type) &&
          items.dataSource === control.dataSource &&
          !(
            items.type === 29 &&
            _.includes(_.includes(['rule'], from) ? ['2', '5', '6'] : ['6'], _.get(items, 'advancedSetting.showtype'))
          ),
      );
    // 人员单选 人员多选
    case API_ENUM_TO_TYPE.USER_PICKER:
      // 人员单选、人员多选
      return _.filter(controls, items => items.type === API_ENUM_TO_TYPE.USER_PICKER);
    // 部门单选
    case API_ENUM_TO_TYPE.GROUP_PICKER:
      // 部门
      return _.filter(controls, items => items.type === API_ENUM_TO_TYPE.GROUP_PICKER);
    // 组织角色
    case API_ENUM_TO_TYPE.ORG_ROLE:
      return _.filter(controls, items => items.type === API_ENUM_TO_TYPE.ORG_ROLE);
    // 地区，检查框，附件
    case API_ENUM_TO_TYPE.AREA_INPUT_24:
    case API_ENUM_TO_TYPE.AREA_INPUT_19:
    case API_ENUM_TO_TYPE.AREA_INPUT_23:
      return _.filter(controls, items =>
        _.includes(
          [API_ENUM_TO_TYPE.AREA_INPUT_19, API_ENUM_TO_TYPE.AREA_INPUT_23, API_ENUM_TO_TYPE.AREA_INPUT_24],
          items.type,
        ),
      );
    case API_ENUM_TO_TYPE.SWITCH:
    case API_ENUM_TO_TYPE.ATTACHMENT:
      return [];

    // 等级
    case API_ENUM_TO_TYPE.SCORE:
      typeList = [
        API_ENUM_TO_TYPE.SCORE,
        API_ENUM_TO_TYPE.NUMBER_INPUT,
        API_ENUM_TO_TYPE.MONEY_AMOUNT_8,
        API_ENUM_TO_TYPE.NEW_FORMULA_31,
      ];
      return _.filter(controls, items => _.includes(typeList, items.type));
    // 时间
    case API_ENUM_TO_TYPE.TIME:
      return _.filter(controls, items =>
        _.includes([API_ENUM_TO_TYPE.TIME, API_ENUM_TO_TYPE.DATE_INPUT_16], items.type),
      );
    default:
      return controls;
  }
}

/** 解析控件筛选配置并填充动态值。 */
export function getFilter({
  control,
  formData = [],
  filterKey = 'filters',
  ignoreEmptyRule = false,
  appId,
  currentTimeForSecond,
}) {
  if (
    !control ||
    _.isEmpty(control.advancedSetting) ||
    _.isEmpty(control.advancedSetting[filterKey]) ||
    control.advancedSetting[filterKey] === '[]'
  ) {
    return [];
  }

  let conditions;

  try {
    conditions = safeParse(control.advancedSetting[filterKey], 'array');
  } catch (err) {
    console.log(err);
    return [];
  }

  const abortFilterWhenEmpty =
    (get(conditions, '0.emptyRule') === 3 || get(conditions, '0.groupFilters.0.emptyRule') === 3) && !ignoreEmptyRule;

  function handleFormatCondition(condition) {
    if (_.isEmpty(condition.dynamicSource)) {
      return Object.assign({}, condition, {
        values: formatValues(condition.dataType, condition.filterType, condition.values),
      });
    } else {
      if (
        _.includes(
          [WIDGETS_TO_API_TYPE_ENUM.DATE, WIDGETS_TO_API_TYPE_ENUM.DATE_TIME, WIDGETS_TO_API_TYPE_ENUM.TIME],
          condition.dataType,
        )
      ) {
        condition.dateRange = 18;
      } else {
        condition.dateRange = 0;
      }

      return fillConditionValue({
        condition,
        formData,
        relateControl: control,
        appId,
        currentTimeForSecond,
        ignoreFilterControl: control.ignoreFilterControl,
        abortFilterWhenEmpty,
      });
    }
  }

  conditions = conditions.map(condition => {
    if (!(condition.isGroup && condition.groupFilters)) {
      return handleFormatCondition(condition);
    } else {
      const formattedGroupFilters = condition.groupFilters.map(handleFormatCondition);

      if (_.get(condition, 'groupFilters.0.spliceType') === 1 && abortFilterWhenEmpty) {
        // 且 条件
        return !formattedGroupFilters.filter(f => !f).length
          ? {
              ...condition,
              groupFilters: formattedGroupFilters,
            }
          : false;
      } else {
        // 或 条件
        return {
          ...condition,
          groupFilters: formattedGroupFilters.filter(_.identity),
        };
      }
    }
  });
  const filteredConditions = conditions.filter(_.identity);
  if (!abortFilterWhenEmpty) return filteredConditions;
  if (filteredConditions.length) {
    if (filteredConditions[0].spliceType === 1) {
      // 且 条件
      return filteredConditions.length === conditions.length ? filteredConditions : false;
    } else {
      // 或 条件
      return filteredConditions;
    }
  } else {
    return false;
  }
}

/** 根据表单数据填充动态筛选条件。 */
function fillConditionValue({
  condition,
  formData,
  relateControl,
  appId,
  currentTimeForSecond,
  ignoreFilterControl = false,
  abortFilterWhenEmpty = false,
}) {
  const { dataType, controlId } = condition;
  const dynamicSource = condition.dynamicSource[0];
  const filterControl = _.find(
    (relateControl.relationControls || []).concat([...SYSTEM_DATE_CONTROL, ...ROW_ID_CONTROL]),
    item => item.controlId === controlId,
  );

  if (!dynamicSource || (!filterControl && !ignoreFilterControl)) {
    return;
  }

  const { rcid, cid } = dynamicSource;

  if (!cid) {
    return;
  }

  if ((cid === 'current-rowid' || cid === 'rowid') && !_.includes(['fastFilter', 'navGroup'], rcid)) {
    if (!relateControl.recordId) {
      return;
    }

    condition.values = [relateControl.recordId];
    return condition;
  }

  if (cid === 'currenttime') {
    let formatFilterControl = { ...filterControl };

    if (!filterControl && ignoreFilterControl) {
      if (dataType === 46) {
        formatFilterControl = { unit: '9', type: dataType };
      } else {
        formatFilterControl = { type: dataType, advancedSetting: { showtype: dataType === 15 ? '6' : '3' } };
      }
    }

    if (formatFilterControl.type === 46) {
      const formatMode = formatFilterControl.unit === '6' || formatFilterControl.unit === '9' ? 'HH:mm:ss' : 'HH:mm';
      const now = currentTimeForSecond && _.includes(formatMode, 'ss') ? currentTimeForSecond : new Date();

      condition.value = moment(now).format(formatMode);
    } else {
      const formatMode = getDatePickerConfigs(formatFilterControl).formatMode;
      const now = currentTimeForSecond && _.includes(formatMode, 'ss') ? currentTimeForSecond : new Date();

      condition.value = moment(now).format(formatMode);
    }

    return condition;
  }

  let dynamicControl;
  dynamicControl = _.find(
    formData,
    c => c && c.controlId === (_.includes(['fastFilter', 'navGroup'], rcid) ? rcid + '_' : '') + cid,
  );
  if (!dynamicControl) {
    return;
  }

  dynamicControl = redefineComplexControl(dynamicControl);

  // 快速筛选配置的其他字段的值
  if (dynamicControl.filterValue) {
    const newCondition = {
      ...condition,
      ...(dynamicControl.filterValue || {}),
    };
    return validate(newCondition) || newCondition.filterType === 7 ? newCondition : false;
  }

  const { type } = dynamicControl;
  const value = (
    _.find(
      formData,
      control => control.controlId === (_.includes(['fastFilter', 'navGroup'], rcid) ? rcid + '_' : '') + cid,
    ) || {}
  ).value;

  if (checkCellIsEmpty(value)) {
    return abortFilterWhenEmpty ? undefined : condition;
  }

  // // 强制异化，rowid取关联记录的值
  if (controlId === 'rowid' && dynamicControl.type === 29) {
    try {
      if (isRelateRecordTableControl(dynamicControl) && !browserIsMobile()) {
        condition.values = relateControl.recordId
          ? [`cid|${dynamicControl.controlId}`].concat(
              get(dynamicControl.store && dynamicControl.store.getState(), 'changes.addedRecordIds'),
              [],
            )
          : dynamicControl.store
              .getState()
              .records.map(r => r.rowid)
              .filter(_.identity);
      } else {
        if (isRelateRecordTableControl(dynamicControl) && browserIsMobile() && relateControl.recordId) {
          condition.values = [`cid|${dynamicControl.controlId}`];
        } else {
          condition.values = (_.isObject(value) ? value.records : safeParse(value, 'array'))
            .map(r => r.sid || r.rowid)
            .filter(_.identity);
        }
      }
    } catch (err) {
      console.log(err);
      condition.values = [];
    }

    if (_.isEmpty(condition.values)) {
      return;
    }

    return condition;
  }

  if (dataType === 2 || dataType === 32 || dataType === 3 || dataType === 7 || dataType === 5) {
    condition.values = [
      renderCellText(
        {
          ...dynamicControl,
          value,
        },
        { noMask: true },
      ),
    ];
  } else if (dataType === 6 || dataType === 8 || dataType === 31 || dataType === 46) {
    condition.value = value;
  } else if (dataType === 15 || dataType === 16) {
    try {
      let tempValue = value;

      if (dataType === 16 && tempValue) {
        const appTimeZone = getAppTimeZone(appId);

        if (!_.isUndefined(appTimeZone)) {
          tempValue = dateServerZoneToAppZone(tempValue, appTimeZone);
        }
      }

      condition.value = moment(tempValue).format(
        getDatePickerConfigs({
          ...dynamicControl,
          value: tempValue,
        }).formatMode,
      );
    } catch (err) {
      condition.value = value;
      console.error(err);
    }
  } else if (dataType === 9 || dataType === 11 || dataType === 10) {
    if (type === 9 || type === 11) {
      // 单选
      const selectedOption = getSelectedOptions(dynamicControl.options, value, dynamicControl)[0];

      if (!selectedOption) {
        condition.values = [];
      } else {
        const matchedOptions = (_.get(filterControl, 'options') || []).filter(
          option => option.key === selectedOption.key,
        );

        if (matchedOptions.length) {
          condition.values = matchedOptions.map(option => option.key);
        } else {
          condition.values = ignoreFilterControl ? [selectedOption.key] : ['999999']; // 瞎传的值 保证筛选不出结果
        }
      }
    } else if (type === 10) {
      // 多选
      const selectedOptions = getSelectedOptions(dynamicControl.options, value, dynamicControl);

      if (!selectedOptions.length) {
        condition.values = [];
      } else {
        const matchedOptions = (_.get(filterControl, 'options') || []).filter(option =>
          _.find(
            selectedOptions.map(o => o.value),
            ov => ov === option.value,
          ),
        );

        if (matchedOptions.length) {
          condition.values = matchedOptions.map(option => option.key);
        } else {
          condition.values = ignoreFilterControl ? selectedOptions.map(i => i.key) : ['999999']; // 瞎传的值 保证筛选不出结果
        }
      }
    } else {
      // 文字
      condition.values = (_.get(filterControl, 'options') || [])
        .filter(option => option.value.indexOf(value) > -1)
        .map(option => option.key);
    }
  } else if (dataType === 29 || dataType === 35) {
    try {
      const store = dynamicControl.store;
      const state = store && store.getState();

      if (isRelateRecordTableControl(dynamicControl) && dynamicControl.rcValue) {
        let rcValues = safeParse(dynamicControl.rcValue, 'array') || [];
        const { addedRecordIds = [], deletedRecordIds = [] } = state?.changes || {};
        rcValues = rcValues.concat(addedRecordIds).filter(r => !_.includes(deletedRecordIds, r));
        condition.values = _.uniq(rcValues);
      } else {
        let relateValues = state ? state.records : _.isObject(value) ? value.records : safeParse(value, 'array');

        if (!_.isArray(relateValues)) {
          relateValues = [];
        }

        condition.values = relateValues.map(r => r.sid || r.rowid).filter(_.identity);
      }
    } catch (err) {
      console.log(err);
      condition.values = [];
    }

    if (_.isEmpty(condition.values)) {
      return;
    }
  } else if (dataType === 26) {
    try {
      const users = safeParse(value, 'array');
      condition.values = users.map(user => user.accountId).filter(_.identity);
    } catch (err) {
      console.log(err);
      condition.values = [];
    }

    if (_.isEmpty(condition.values)) {
      return;
    }
  } else if (dataType === 27) {
    try {
      const groups = safeParse(value, 'array');
      condition.values = groups.map(group => group.departmentId);
    } catch (err) {
      console.log(err);
      condition.values = [];
    }
  } else if (dataType === 48) {
    try {
      const groups = safeParse(value, 'array');
      condition.values = groups.map(group => group.organizeId);
    } catch (err) {
      console.log(err);
      condition.values = [];
    }
  } else if (
    _.includes(
      [API_ENUM_TO_TYPE.AREA_INPUT_24, API_ENUM_TO_TYPE.AREA_INPUT_19, API_ENUM_TO_TYPE.AREA_INPUT_23],
      dataType,
    )
  ) {
    condition.values = [safeParse(value, '{}').code];
  } else if (dataType === 28 || dataType === 33) {
    if (_.includes([FILTER_CONDITION_TYPE.EQ, FILTER_CONDITION_TYPE.NE], condition.filterType)) {
      condition.values = [value];
    } else {
      condition.value = value;
    }
  }

  return condition;
}
