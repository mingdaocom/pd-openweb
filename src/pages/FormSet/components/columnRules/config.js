import {
  formatOriginFilterGroupValue,
  checkConditionAvailable,
  getTypeKey,
  getFilterTypes,
} from 'src/pages/worksheet/common/WorkSheetFilter/util.js';
import {
  CONTROL_FILTER_WHITELIST,
  FILTER_CONDITION_TYPE,
  API_ENUM_TO_TYPE,
  DATE_OPTIONS,
} from 'src/pages/worksheet/common/WorkSheetFilter/enum.js';
import { getIconByType, getSwitchItemNames } from 'src/pages/widgetConfig/util';
import { WIDGETS_TO_API_TYPE_ENUM, SYS_CONTROLS } from 'pages/widgetConfig/config/widget';
import { getDatePickerConfigs } from 'src/pages/widgetConfig/util/setting';
import _ from 'lodash';
import moment from 'moment';

//初始规则数据
export const originRuleItem = {
  ruleId: '', //规则id
  name: '', //名称
  disabled: false, //规则是否停用
  filters: [], //条件列表
  ruleItems: [], //动作列表
};

//初始动作数据
export const originActionItem = {
  type: 1,
  controls: [], // {childControlIds: [],controlId: ''}
  message: '',
};

export const conditionTypeListData = [
  { value: 1, label: _l('固定值') },
  { value: 2, label: _l('动态值') },
];

export const actionsListData = [
  { value: 1, label: _l('显示') },
  { value: 2, label: _l('隐藏') },
  { value: 3, label: _l('可编辑') },
  { value: 4, label: _l('只读') },
  { value: 5, label: _l('必填') },
  { value: 6, label: _l('提示错误') },
  { value: 7, label: _l('锁定记录') },
  { value: 8, label: _l('解锁记录') },
];

//获取规则名字段长度
export const getNameWidth = name => {
  let nameNode = $('<span>' + name + '</span>').css({ display: 'none' });
  $('body').append(nameNode);
  let width = nameNode.width() + 4;
  nameNode.remove();
  return width;
};

export function getReTree(tree) {
  let reTree = {};
  tree.map(it => {
    reTree[it.controlId] = it.type === 34 && it.relationControls ? it.relationControls.map(re => re.controlId) : [];
  });
  return reTree;
}

//根据controlId找到node
function deepSearch(tree = [], controlId) {
  let isGet = false;
  let retNode = null;
  for (let i = 0; i < tree.length; i++) {
    if (controlId === tree[i].controlId || isGet) {
      isGet || (retNode = tree[i]);
      isGet = true;
      break;
    }
  }
  return retNode;
}

//备注、分段没有标题（兼容）
export function getControlSpecialName(type) {
  return type ? (type === 10010 ? _l('备注') : _l('分段')) : _l('字段已删除');
}

//根据controls获取controlName
export function getTextById(tree, controls = []) {
  let currentArr = [];
  controls.map(controlsItem => {
    const { childControlIds = [], controlId = '' } = controlsItem;
    if (controlId) {
      const parentNode = deepSearch(tree, controlId) || {};
      if (!childControlIds.length) {
        currentArr.push({
          controlId,
          name: parentNode.controlName || getControlSpecialName(parentNode.type),
          isDel: !parentNode.type,
        });
      } else {
        childControlIds.map(child => {
          const childNode = deepSearch(parentNode.relationControls, child) || {};
          const isDelete = _.includes(parentNode.showControls || [], childNode.controlId);
          currentArr.push({
            controlId,
            childControlId: child,
            isDel: !isDelete,
            name: isDelete
              ? _l('%0 / %1', parentNode.controlName, childNode.controlName || getControlSpecialName(childNode.type))
              : _l('字段已删除'),
          });
        });
      }
    }
  });
  return currentArr;
}

//过滤隐藏的子表字段
export function getNewDropDownData(dropDownData = [], actionType) {
  // 公式 汇总 文本组合 自动编号 他表字段 分段 大写金额 备注 文本识别
  let filterControls = [];
  if (_.includes([3, 4, 5], actionType)) {
    filterControls.push(31, 38, 37, 32, 33, 30, 22, 25, 45, 47, 51, 10010);
    if (actionType === 5) {
      filterControls.push(43, 49);
    }
  }

  let newDropDownData = _.cloneDeep(dropDownData);
  newDropDownData.forEach(item => {
    if (_.includes([29, 34], item.type) && item.relationControls) {
      item.relationControls = item.relationControls
        .filter(re => _.includes(item.showControls || [], re.controlId))
        .filter(re => !_.includes(SYS_CONTROLS, re.controlId))
        .filter(i => !_.includes(filterControls, i.type));
      if (!item.relationControls.length) {
        delete item.relationControls;
      }
    } else {
      delete item.relationControls;
    }
  });
  newDropDownData = newDropDownData.filter(item => !_.includes(filterControls, item.type));
  return newDropDownData;
}

// 过滤不符合条件的已选字段
export const filterUnAvailable = (controlConfig = {}, worksheetControls = [], type) => {
  const { controls = [] } = controlConfig;
  const dropDownData = getNewDropDownData(worksheetControls, controlConfig.type);
  let newControls = [];
  controls.map(item => {
    let newItem = { ...item };
    const curItem = _.find(dropDownData, da => da.controlId === item.controlId);
    if (curItem) {
      if (item.childControlIds && item.childControlIds.length > 0) {
        const { relationControls = [] } = _.find(dropDownData, i => i.controlId === item.controlId) || {};
        newItem.childControlIds = item.childControlIds.filter(i => _.find(relationControls, re => re.controlId === i));
      }
      // 已选的必填关联多条列表字段过滤
      if (
        !(
          type === 5 &&
          curItem.type === 29 &&
          _.get(curItem.advancedSetting || {}, 'showtype') === '2' &&
          !_.get(item, 'childControlIds.length')
        )
      ) {
        newControls.push(item);
      }
    }
  });
  return { ...controlConfig, controls: newControls };
};

//根据actionValue获取label
export function getActionLabelByType(type) {
  return _.get(_.find(actionsListData, item => item.value === type) || {}, 'label') || '';
}

//判断规则是否有效并能否提交
export function checkConditionCanSave(filters = [], isSingle) {
  if (_.isEmpty(filters)) return false;
  const formatFilter = formatOriginFilterGroupValue({ items: filters }) || {};
  return (formatFilter.conditionsGroups || []).every(data => {
    const tempData = isSingle ? data.conditions : data.groupFilters;
    if (_.isEmpty(tempData)) return false;
    return tempData.every(i => {
      const conditionGroupKey = getTypeKey(i.dataType);
      const conditionGroup = CONTROL_FILTER_WHITELIST[conditionGroupKey] || {};
      const conditionGroupType = conditionGroup.value;
      return checkConditionAvailable({
        ...i,
        type: i.filterType || i.type,
        isDynamicsource: i.isDynamicsource || _.get(i, 'dynamicSource.length'),
        conditionGroupType: i.conditionGroupType || conditionGroupType,
      });
    });
  });
}

//判断条件是否填写
export function checkConditionError(condition) {
  const {
    value,
    values,
    dataType,
    dynamicSource = [],
    isDynamicsource = false,
    minValue,
    maxValue,
    dateRange,
  } = condition;
  const conditionGroupType = (CONTROL_FILTER_WHITELIST[getTypeKey(dataType)] || {}).value;
  const type = condition.filterType;
  //动态参数输入框
  if (isDynamicsource) {
    if (!dynamicSource.length) {
      return 'inputTextErrorBorder';
    }
  }
  switch (conditionGroupType) {
    //文本框
    case CONTROL_FILTER_WHITELIST.TEXT.value:
      return !(values && values.length) ? 'selectizeInputErrorBorder' : '';
    case CONTROL_FILTER_WHITELIST.NUMBER.value:
      if (type === FILTER_CONDITION_TYPE.BETWEEN || type === FILTER_CONDITION_TYPE.NBETWEEN) {
        let styleNumber = [];
        if (_.isUndefined(minValue) || minValue === '') {
          styleNumber.push('numberMinErrorBorder');
        }
        if (_.isUndefined(maxValue) || maxValue === '') {
          styleNumber.push('numberMaxErrorBorder');
        }
        return styleNumber.join(' ');
      } else {
        return !value ? 'numberConditionErrorBorder' : '';
      }
    case CONTROL_FILTER_WHITELIST.DATE.value:
      if (type === FILTER_CONDITION_TYPE.DATE_BETWEEN || type === FILTER_CONDITION_TYPE.DATE_NBETWEEN || dateRange)
        return '';
      return !value ? 'dateConditionErrorBorder' : '';
    case CONTROL_FILTER_WHITELIST.TIME.value:
      if (type === FILTER_CONDITION_TYPE.DATE_BETWEEN || type === FILTER_CONDITION_TYPE.DATE_NBETWEEN) {
        if (!minValue || !maxValue) {
          return 'timeRangeConditionErrorBorder';
        }
      } else {
        return !value ? 'timeConditionErrorBorder' : '';
      }
    case CONTROL_FILTER_WHITELIST.OPTIONS.value:
    case CONTROL_FILTER_WHITELIST.USERS.value:
    case CONTROL_FILTER_WHITELIST.RELATE_RECORD.value:
    case CONTROL_FILTER_WHITELIST.CASCADER.value:
      if (values && !values.length) {
        if (_.includes([27, 19, 23, 24, 48], dataType)) {
          return 'optionConditionErrorBorder';
        } else if (_.includes([26], dataType)) {
          return 'userConditionErrorBorder';
        } else if (_.includes([29], dataType)) {
          return 'recordConditionErrorBorder';
        } else if (_.includes([35], dataType)) {
          return 'cascaderConditionErrorBorder';
        } else {
          return '';
        }
      }
  }
}

export function formatFilterValue(condition) {
  return {
    controlId: condition.controlId,
    dataType: condition.dataType,
    spliceType: condition.spliceType,
    filterType: condition.filterType,
    dateRange: condition.dateRange,
    dateRangeType: condition.dateRangeType,
    maxValue: condition.maxValue,
    minValue: condition.minValue,
    value: condition.value,
    fullValues: condition.values,
    values: condition.values,
    dynamicSource: condition.dynamicSource || [],
    isDynamicsource: condition.isDynamicsource,
  };
}

//filters保存，关联values取id
export function formatValues(items) {
  return items.map(item => {
    return {
      ...item,
      groupFilters: (item.groupFilters || []).map(i => {
        return _.includes([26, 27, 29, 19, 23, 24, 35, 48], i.dataType)
          ? { ...i, values: (i.values || []).map(val => (typeof val === 'string' ? safeParse(val).id : val)) }
          : i;
      }),
    };
  });
}

//过滤删除选项
export function filterDeleteOptions(items, controls = []) {
  return items.map(item => {
    if (_.includes([9, 10, 11], item.dataType)) {
      const options = (_.find(controls, con => con.controlId === item.controlId) || {}).options || [];
      return { ...item, values: item.values.filter(val => _.find(options, op => op.key === val && !op.isDeleted)) };
    } else {
      return item;
    }
  });
}

export const filterText = (key, filterData, control) => {
  const { filterType = '' } = filterData;
  if (filterType === FILTER_CONDITION_TYPE.ISNULL || filterType === FILTER_CONDITION_TYPE.HASVALUE) {
    return '';
  }
  switch (key) {
    case CONTROL_FILTER_WHITELIST.NUMBER.value:
      if (filterType === FILTER_CONDITION_TYPE.BETWEEN || filterType === FILTER_CONDITION_TYPE.NBETWEEN) {
        return `${filterData.minValue || ''} - ${filterData.maxValue || ''}`;
      } else {
        return filterData.value;
      }
    case CONTROL_FILTER_WHITELIST.DATE.value:
      const { dateRange, value } = filterData;
      const { formatMode } = getDatePickerConfigs(control);
      if (!!filterData.minValue && !!filterData.maxValue) {
        return `${moment(filterData.minValue).format(formatMode)} - ${moment(filterData.maxValue).format(formatMode)}`;
      } else if (dateRange === 10) {
        return _l('过去%0天', value);
      } else if (dateRange === 11) {
        return _l('将来%0天', value);
      } else if (dateRange === 18) {
        return moment(value).format(formatMode);
      } else if (!dateRange) {
        return '';
      } else {
        return _.filter(_.flatten(DATE_OPTIONS), {
          value: filterData.dateRange,
        })[0].text;
      }
    case CONTROL_FILTER_WHITELIST.TIME.value:
      const formatStr = control.unit === '1' ? 'HH:mm' : 'HH:mm:ss';
      if (!!filterData.minValue && !!filterData.maxValue) {
        return `${moment(filterData.minValue, formatStr).format(formatStr)} - ${moment(
          filterData.maxValue,
          formatStr,
        ).format(formatStr)}`;
      } else {
        return filterData.value ? moment(filterData.value, formatStr).format(formatStr) : '';
      }
    case CONTROL_FILTER_WHITELIST.BOOL.value:
      const selectKey = filterType === FILTER_CONDITION_TYPE.EQ ? '1' : '0';
      let itemnames = getSwitchItemNames(control, { isShow: true });
      return (
        _.get(
          _.find(itemnames, i => i.key === selectKey),
          'value',
        ) || ''
      );
    case CONTROL_FILTER_WHITELIST.OPTIONS.value:
      if (
        filterData.dataType === WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT ||
        filterData.dataType === WIDGETS_TO_API_TYPE_ENUM.ORG_ROLE ||
        _.includes(
          [API_ENUM_TO_TYPE.AREA_INPUT_24, API_ENUM_TO_TYPE.AREA_INPUT_19, API_ENUM_TO_TYPE.AREA_INPUT_23], //AREA_INPUT
          filterData.dataType,
        )
      ) {
        return (filterData.values || [])
          .map(item => {
            const user = safeParse(item || '{}');
            return user.name;
          })
          .join(',');
      }
      let options = [];
      let { data = [] } = control;
      if (!control.options) {
        if (!data.options) {
          options = [];
        } else {
          options = data.options;
        }
      } else {
        options = control.options;
      }
      if (_.isEmpty(options)) {
        return filterData.values ? filterData.values.join(',') : '';
      }
      if (_.isEmpty(filterData.values)) {
        return '';
      }
      return filterData.values
        .map(value => {
          let item = _.find(options, option => value === option.key && !option.isDeleted) || {};
          return _.isUndefined(item.value) ? _l('字段已删除') : item.value;
        })
        .join(',');
    case CONTROL_FILTER_WHITELIST.USERS.value:
      if (_.isEmpty(filterData.values)) {
        return '';
      }
      return filterData.values
        .map(item => {
          const user = safeParse(item || '{}');
          return user.name;
        })
        .join(',');
    case CONTROL_FILTER_WHITELIST.RELATE_RECORD.value:
    case CONTROL_FILTER_WHITELIST.CASCADER.value:
      const { values = [] } = filterData;
      return values.map(item => safeParse(item || '{}').name).join(',');
    default:
      return _.isEmpty(filterData.values) ? '' : filterData.values.join(',');
  }
};

export const filterDataRelationText = (dynamicSource = [], columns, sourceControlId = '') => {
  let data = { type: 'dynamicSource', data: [] };
  if (dynamicSource.length <= 0) {
    data = '';
  } else {
    dynamicSource.map(item => {
      let list = [];
      let type = 1;
      let id = '';
      let rName = '';
      //目前只关联当前记录
      list = columns;
      type = 1;
      id = item.cid;
      rName = '';
      let contrls = list.find(it => id === it.controlId);
      data.data.push({
        name: contrls ? contrls.controlName : '',
        id: item.cid,
        rName: item.rcid === 'parent' ? _l('主记录') : rName,
        type,
      });
    });
  }
  return data;
};

export const filterData = (columns = [], filterItem = [], isSetting, relationControls = [], sourceControlId = '') => {
  let dataList = [];
  filterItem.forEach((item, index) => {
    if (item.isGroup && item.groupFilters) {
      dataList.push({
        ...item,
        groupFilters: filterData(columns, item.groupFilters, isSetting, relationControls, sourceControlId),
      });
      return;
    }
    let controlData = [];
    if (isSetting) {
      controlData = relationControls.filter(column =>
        column.controlId ? column.controlId === item.controlId : column.data.controlId === item.controlId,
      );
    } else {
      controlData = columns.filter(column =>
        column.controlId ? column.controlId === item.controlId : column.data.controlId === item.controlId,
      );
    }
    if (controlData && controlData.length > 0) {
      const control = controlData[0] || {};
      const type = isSetting || control.type ? control.type : (control.data || {}).type;
      // type为关联他表，type取sourceControlType的值 -1//无值
      let { sourceControlType = -1, data = { sourceControlType: -1 } } = control;
      sourceControlType = isSetting || sourceControlType !== -1 ? sourceControlType : data.sourceControlType;
      const conditionGroupKey = getTypeKey(type === 30 ? sourceControlType : type);
      const conditionGroup = CONTROL_FILTER_WHITELIST[conditionGroupKey] || {};
      const conditionGroupType = conditionGroup.value;
      const value =
        isSetting && item.dynamicSource && item.dynamicSource.length > 0
          ? filterDataRelationText(item.dynamicSource, columns, sourceControlId)
          : filterText(conditionGroupType, item, control);
      dataList.push({
        id: item.controlId,
        name: isSetting || control.controlName ? control.controlName : control.data.controlName,
        type: _.find(getFilterTypes(control), { value: item.filterType }),
        spliceType: item.spliceType,
        value,
      });
    }
  });
  if (dataList.every(i => i.isGroup && _.isEmpty(i.groupFilters))) {
    return [];
  }
  return dataList;
};

const OCR_ICON_WHITELIST = {
  1: 'ocr',
  2: 'ocr_id_card',
  3: 'ocr_invoice',
};

//兼容ocr字段icon
export function getNewIconByType(control = {}) {
  const { type, enumDefault } = control;
  return type === 43 ? OCR_ICON_WHITELIST[enumDefault] : getIconByType(type);
}

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
