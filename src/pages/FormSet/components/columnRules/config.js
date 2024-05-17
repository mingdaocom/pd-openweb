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
  DEFAULT_COLUMNS,
  getControlSelectType,
} from 'src/pages/worksheet/common/WorkSheetFilter/enum.js';
import { getIconByType, getSwitchItemNames, isSheetDisplay } from 'src/pages/widgetConfig/util';
import { WIDGETS_TO_API_TYPE_ENUM, SYS_CONTROLS, SYS } from 'pages/widgetConfig/config/widget';
import { getDatePickerConfigs } from 'src/pages/widgetConfig/util/setting';
import _ from 'lodash';
import moment from 'moment';
import { getUnUniqName } from 'src/util';
import { v4 as uuidv4 } from 'uuid';

//初始规则数据
export const originRuleItem = {
  ruleId: uuidv4(), //规则id
  name: '', //名称
  disabled: false, //规则是否停用
  filters: [], //条件列表
  ruleItems: [], //动作列表
  type: 0, // 规则类型
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
  { value: 2, label: _l('隐藏'), warnText: _l('隐藏后不验证必填（强制校验除外）') },
  { value: 3, label: _l('可编辑') },
  { value: 4, label: _l('只读'), warnText: _l('只读后不验证必填（强制校验除外）') },
  { value: 5, label: _l('必填') },
  { value: 6, label: _l('提示错误') },
  {
    value: 7,
    label: _l('只读所有字段'),
    warnText: _l('只读所有字段在记录保存后生效，生效后不允许用户直接编辑，但可以通过自定义动作和工作流进行填写'),
  },
];

//获取规则名字段长度
export const getNameWidth = name => {
  let nameNode = $('<span>' + name + '</span>').css({ display: 'none' });
  $('body').append(nameNode);
  let width = nameNode.width() + 6;
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
  let results = null;

  function recurse(nodes) {
    nodes.forEach(node => {
      if (node.controlId === controlId) {
        results = node;
      }
      if (!_.isEmpty(node.relationControls)) {
        recurse(node.relationControls);
      }
    });
  }

  recurse(tree);
  return results;
}

//根据controls获取controlName
export function getTextById(data, controls = [], actionType) {
  const tree = getNewDropDownData(data, actionType);
  let currentArr = [];
  if (_.find(tree, i => i.sectionId)) return;

  controls.forEach(controlsItem => {
    const { childControlIds = [], controlId = '' } = controlsItem;
    const parentNode = deepSearch(tree, controlId);
    // 由于标签页内控件按普通字段存，父级名称得在查，特殊处理兼容
    const sectionNode = parentNode && parentNode.sectionId ? deepSearch(tree, parentNode.sectionId) : '';
    if (_.isEmpty(childControlIds)) {
      currentArr.push({
        parentId: '',
        controlId,
        name:
          sectionNode && parentNode
            ? _l('%0 / %1', sectionNode.controlName, parentNode.controlName)
            : _.get(parentNode, 'controlName') || _l('字段已删除'),
        isDel: !parentNode,
      });
    } else {
      childControlIds.map(child => {
        const childNode = _.find(_.get(parentNode, 'relationControls') || [], i => i.controlId === child);
        const isDelete = !parentNode || !childNode;
        currentArr.push({
          parentId: controlId,
          controlId: child,
          isDel: isDelete,
          name: isDelete ? _l('字段已删除') : _l('%0 / %1', parentNode.controlName, childNode.controlName),
        });
      });
    }
  });
  return currentArr;
}

function formatSectionData(data = []) {
  const newData = [];
  data.forEach(item => {
    if (item.type === 52) {
      item.relationControls = data.filter(i => i.sectionId === item.controlId);
    }
    if (!item.sectionId) newData.push(item);
  });
  return newData;
}

function filterDropDown(controls = [], actionType) {
  // 公式 汇总 文本组合 自动编号 他表字段 分割线 大写金额 备注 文本识别
  let filterControls = [];
  if (_.includes([3, 4, 5], actionType)) {
    filterControls.push(31, 38, 37, 32, 33, 30, 22, 25, 45, 47, 51, 10010);
    if (actionType === 5) {
      filterControls.push(43, 49);
    }
  }

  return controls
    .filter(item => !_.includes(filterControls, item.type))
    .map(item => {
      if (_.includes([29, 34], item.type)) {
        const relationControls = (item.relationControls || [])
          .filter(re => _.includes(item.showControls || [], re.controlId))
          .filter(re => !_.includes(SYS_CONTROLS, re.controlId))
          .filter(re => re.type !== 52)
          .filter(re => !_.includes(filterControls, re.type));
        // 关联卡片、下拉框在以下情况下不支持配置内部控件
        const needClear =
          item.type === 29 &&
          !_.includes(['2', '5', '6'], _.get(item, 'advancedSetting.showtype')) &&
          _.includes([3, 4, 5], actionType);
        return { ...item, relationControls: needClear ? [] : relationControls };
      } else if (item.type === 52) {
        return { ...item, relationControls: filterDropDown(item.relationControls, actionType) };
      } else {
        // 防止关联单挑等渲染出子集情况
        return { ...item, relationControls: [] };
      }
    });
}

//过滤隐藏的子表字段
export function getNewDropDownData(dropDownData = [], actionType) {
  const newData = formatSectionData(dropDownData);
  let filterData = filterDropDown(newData, actionType);
  // 必填过滤关联多条列表
  if (_.includes([5], actionType)) {
    filterData = filterData
      .filter(i => !isSheetDisplay(i))
      .map(i => {
        if (i.relationControls) {
          return { ...i, relationControls: (i.relationControls || []).filter(r => !isSheetDisplay(r)) };
        } else {
          return i;
        }
      });
  }
  // 空标签页在以下情况下过滤，
  if (_.includes([3, 4, 5], actionType)) {
    filterData = filterData.filter(i => !(i.type === 52 && _.isEmpty(i.relationControls)));
  }
  return filterData;
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
      if (!(type === 5 && isSheetDisplay(curItem) && !_.get(item, 'childControlIds.length'))) {
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
  columns = columns.concat(DEFAULT_COLUMNS);
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
        type: _.find(
          getFilterTypes({ ...control, type: control.type === 30 ? control.sourceControlType : control.type }),
          {
            value:
              getControlSelectType({ ...control, type: control.type === 30 ? control.sourceControlType : control.type })
                .isMultiple && item.filterType === FILTER_CONDITION_TYPE.EQ_FOR_SINGLE
                ? FILTER_CONDITION_TYPE.EQ
                : item.filterType,
          },
        ),
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

// 业务规则默认名称
export function getDefaultRuleName(data = [], activeTab) {
  const displayNum = data.filter(i => i.type === activeTab).length + 1;
  return getUnUniqName(data, activeTab === 0 ? _l('交互规则%0', displayNum) : _l('验证规则%0', displayNum));
}

// 校验动作错误
export function getActionError(value = {}) {
  const { controls = [], type, message } = value;
  if (_.includes([7], type)) {
    return false;
  } else if (type === 6) {
    // 错误提示，验证时错误信息
    return !message;
  } else {
    return !controls.length;
  }
}

// 对比是否有变更
export function hasRuleChanged(data = [], selectRule = {}) {
  const originData = _.find(data, i => i.ruleId === selectRule.ruleId);
  const { ruleId = '' } = selectRule;
  if (ruleId && (ruleId.indexOf('-') >= 0 || !_.isEqual(originData, selectRule))) {
    alert(_l('请先保存编辑结果'), 3);
    return true;
  }
  return false;
}

// 符合错误提示配置的指定字段
export const getErrorControls = (controls = []) => {
  const filterControl = i => {
    if (_.includes(SYS_CONTROLS.concat(SYS), i.controlId)) return false;
    if (_.includes([29, 51], i.type) && _.includes(['2', '5', '6'], _.get(i, 'advancedSetting.showtype'))) return false;
    if (_.includes([22, 43, 45, 47, 49, 10010], i.type)) return false;
    return true;
  };

  const newData = [];
  controls
    .map(i => (i.type === 52 ? i : { ...i, relationControls: [] }))
    .map(i => {
      if (i.type === 52) {
        newData.push({ ...i, relationControls: (i.relationControls || []).filter(r => filterControl(r)) });
      } else if (filterControl(i)) {
        newData.push(i);
      }
    });

  return newData.filter(i => !(i.type === 52 && _.isEmpty(i.relationControls)));
};
