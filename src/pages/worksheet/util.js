import EventEmitter from 'events';
import moment from 'moment';
import filterXss from 'xss';
import copy from 'copy-to-clipboard';
import axios from 'axios';
import { getRequest, isLightColor, toFixed, browserIsMobile } from 'src/util';
import { generate } from '@ant-design/colors';
import { UNIT_TYPE } from '../widgetConfig/config/setting';
import { TinyColor } from '@ctrl/tinycolor';
import appManagementAjax from 'src/api/appManagement';
import webCache from 'src/api/webCache';
import { FROM } from 'src/components/newCustomFields/tools/config';
import DataFormat from 'src/components/newCustomFields/tools/DataFormat';
import { FORM_ERROR_TYPE_TEXT, FORM_ERROR_TYPE } from 'src/components/newCustomFields/tools/config';
import {
  checkValueByFilterRegex,
  controlState,
  getTitleTextFromRelateControl,
  getValueStyle,
} from 'src/components/newCustomFields/tools/utils';
import { checkRuleLocked, updateRulesData } from 'src/components/newCustomFields/tools/filterFn';
import { RELATE_RECORD_SHOW_TYPE, RELATION_SEARCH_SHOW_TYPE, VIEW_DISPLAY_TYPE } from 'worksheet/constants/enum';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import renderCellText from 'worksheet/components/CellControls/renderText';
import { getTranslateInfo } from 'src/util';
import {
  SYSTEM_CONTROLS,
  RECORD_INFO_FROM,
  RECORD_COLOR_SHOW_TYPE,
  VIEW_CONFIG_RECORD_CLICK_ACTION,
} from 'worksheet/constants/enum';
import _, { get, head } from 'lodash';
import { HAVE_VALUE_STYLE_WIDGET } from '../widgetConfig/config';
import { findLastIndex } from 'lodash';
import { getSheetViewRows } from './common/TreeTableHelper';

export { calcDate, formatControlValue, getSelectedOptions } from './util-purejs';

export const emitter = new EventEmitter();

window.onresize = () => emitter.emit('WINDOW_RESIZE');

export function getWorkSheetData(data) {
  return data.map(record => {
    const result = {};
    record.forEach(item => {
      result[item.controlId] = item.value;
    });
    return result;
  });
}

export const SUMMARY_TYPE = {
  HIDDEN: 0,
  COMPLETED: 1,
  INCOMPLETE: 2,
  SUM: 3,
  AVERAGE: 4,
  MAXIMUM: 5,
  MINIMUM: 6,
};

export const SUMMARY_LIST = [
  { type: 'COMMON', value: SUMMARY_TYPE.HIDDEN, label: _l('不显示') },
  { type: 'COMMON', value: SUMMARY_TYPE.COMPLETED, label: _l('已填写') },
  { type: 'COMMON', value: SUMMARY_TYPE.INCOMPLETE, label: _l('未填写') },
  { type: 'NUMBER', value: SUMMARY_TYPE.SUM, label: _l('求和') },
  { type: 'NUMBER', value: SUMMARY_TYPE.AVERAGE, label: _l('平均值') },
  { type: 'NUMBER', value: SUMMARY_TYPE.MAXIMUM, label: _l('最大值') },
  { type: 'NUMBER', value: SUMMARY_TYPE.MINIMUM, label: _l('最小值') },
];
/**
 * 获取统计方式名称
 */
export function getSummaryNameByType(type) {
  const summary = SUMMARY_LIST.filter(item => item.value === type)[0];
  return summary ? summary.label : '';
}

/**
 * 获取统计默认统计类型
 */
export function getSummaryInfo(type, control) {
  if (type === 37 || type === 53) {
    type = control.enumDefault2;
  }
  if (type === 6 || type === 8 || type === 31 || type === 28 || (type === 38 && control && control.enumDefault === 1)) {
    return {
      list: SUMMARY_LIST.filter(item => item.type === 'COMMON')
        .concat(undefined)
        .concat(SUMMARY_LIST.filter(item => item.type === 'NUMBER')),
      default: 3,
    };
  } else {
    return {
      list: SUMMARY_LIST.filter(item => item.type === 'COMMON'),
      default: 1,
    };
  }
}

export function getSheetViewReportTypes(viewId, controls) {
  let result = [];
  let savedData = {};
  try {
    savedData = JSON.parse(getLRUWorksheetConfig('WORKSHEET_VIEW_SUMMARY_TYPES', viewId));
  } catch (err) {}
  controls.forEach(control => {
    const type = control.type === 30 ? control.sourceControlType : control.type;
    result.push({
      controlId: control.controlId,
      rptType: parseInt(savedData[control.controlId] || _.includes([6, 8, 31], type) ? 3 : 2, 10),
    });
  });
  return result;
}

/**
 * 根据 pojiectId 将工作表分类
 */
export function groupSheetList(list) {
  const projectIds = _.uniqBy(list.map(item => item.projectId));
  const projects = md.global.Account.projects.filter(project => projectIds.indexOf(project.projectId) > -1);
  return [
    {
      companyName: _l('个人'),
      projectId: '',
    },
  ]
    .concat(projects)
    .map(project => ({
      project,
      list: list.filter(item => item.projectId === project.projectId),
    }))
    .filter(project => project.list.length);
}

/**
 * 对比字段类型值与字段常量
 */
export function compareType(type, cellControl) {
  if (!cellControl.typeArr) {
    return cellControl.data && type === cellControl.data.type;
  } else {
    return cellControl.typeArr.map(t => t.type).indexOf(type) > -1;
  }
}

/**
 * 字段是否支持排序
 */
export function fieldCanSort(type, control = {}) {
  const canSortTypes = [
    2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 15, 16, 26, 27, 28, 29, 30, 31, 32, 33, 34, 36, 37, 38, 42, 46, 48, 50, 53,
  ];
  if (control.type === 30 && control.strDefault === '10') {
    return false;
  }
  return _.includes(canSortTypes, type);
}

/**
 * 获取字段排序数据
 */
export function getSortData(type, control = {}) {
  const descendingValue = 1; // 降序
  const ascendingValue = 2; // 升序

  if (type === 6 || type === 8 || type === 33 || type === 34 || (type === 29 && control.enumDefault === 2)) {
    return [
      {
        text: '1 → 9',
        value: ascendingValue,
      },
      {
        text: '9 → 1',
        value: descendingValue,
      },
    ];
  } else if (type === 2 || type === 29 || type === 32) {
    return [
      {
        text: 'A → Z',
        value: ascendingValue,
      },
      {
        text: 'Z → A',
        value: descendingValue,
      },
    ];
  } else if (type === 15 || type === 16 || type === 17 || type === 18) {
    return [
      {
        text: _l('最新的在前%05029'),
        value: descendingValue,
      },
      {
        text: _l('最旧的在前%05030'),
        value: ascendingValue,
      },
    ];
  } else if (type === 36) {
    let defaultText = [_l('未选中 → 选中'), _l('选中 → 未选中')];
    if (control.advancedSetting) {
      if (control.advancedSetting.showtype === '1') {
        defaultText = [_l('关闭 → 开启'), _l('开启 → 关闭')];
      }
      if (control.advancedSetting.showtype === '2') {
        defaultText = [_l('否 → 是'), _l('是 → 否')];
      }
    }
    return [
      {
        text: defaultText[0],
        value: ascendingValue,
      },
      {
        text: defaultText[1],
        value: descendingValue,
      },
    ];
  } else {
    return [
      {
        text: _l('升序%05031'),
        value: ascendingValue,
      },
      {
        text: _l('降序%05032'),
        value: descendingValue,
      },
    ];
  }
}

export function filterRelatesheetMutipleControls(controls) {
  if (!controls.length) {
    return [];
  }
  const sourceSheetControls = controls.filter(control => control.type === 29 && control.enumDefault === 2);
  const sourceSheetColumnControls = controls.filter(control => control.type === 30);
  const showRelatedSheetTable = !_.isEmpty(sourceSheetControls);
  let filteredControlData = controls.slice(0);
  if (showRelatedSheetTable) {
    const sourceSheetControlIds = sourceSheetControls.map(c => c.controlId);
    const needFilterControls = sourceSheetColumnControls.filter(c =>
      _.find(sourceSheetControlIds, id => c.dataSource.slice(1, -1) === id),
    );
    filteredControlData = filteredControlData.filter(
      control => !_.find(needFilterControls, c => c.controlId === control.controlId),
    );
  }
  return filteredControlData;
}

/**
 * 格式化日期公式控件
 */
export function formatFormulaDate({ value, unit = '6', hideUnitStr, dot = 0 }) {
  const isNegative = value < 0; // 处理负数
  value = toFixed(Math.floor(value * Math.pow(10, dot)) / Math.pow(10, dot), dot);
  if (isNegative) {
    value = -1 * value;
  }
  const unitType = _.find(UNIT_TYPE, type => type.value === unit);
  if (!unitType) {
    return value;
  }
  const unitStr = unitType.text;
  const unitTimes = {
    6: 1, // 秒
    5: 365 * 24 * 60 * 60, // 年
    4: 30 * 24 * 60 * 60, // 月
    3: 24 * 60 * 60, // 天
    2: 60 * 60, // 时
    1: 60, // 分
  };
  let allSeconds = Number(value) * unitTimes[unit];
  const years = Math.floor(allSeconds / unitTimes[5]);
  allSeconds -= years * unitTimes[5];
  const months = Math.floor(allSeconds / unitTimes[4]);
  allSeconds -= months * unitTimes[4];
  const days = Math.floor(allSeconds / unitTimes[3]);
  allSeconds -= days * unitTimes[3];
  const hours = Math.floor(allSeconds / unitTimes[2]);
  allSeconds -= hours * unitTimes[2];
  const minutes = Math.floor(allSeconds / unitTimes[1]);
  allSeconds -= minutes * unitTimes[1];
  let result = [
    { value: years, unit: _l('年') },
    { value: months, unit: _l('月') },
    { value: days, unit: _l('天') },
    { value: hours, unit: _l('时') },
    { value: minutes, unit: _l('分') },
    { value: allSeconds, unit: _l('秒') },
  ]
    .slice(0, 6 - Number(unit) || 6)
    .filter(item => item.value !== 0 || item.unit === unitStr)
    .map(item => item.value + item.unit)
    .join('');
  if (hideUnitStr) {
    result = result.slice(0, -1);
  }
  return result && (isNegative ? '-' : '') + result;
}

/**
 * regexFilter 正则方式过滤 html标签
 * 优点：快
 * 缺点：转义后的字符没有处理 (可以用 https://github.com/mathiasbynens/he 处理)
 */
export function regexFilterHtmlScript(str) {
  return filterXss(str).replace(/(<([^>]+)>)/gi, '');
}

/**
 * regexFilter dom 转换方式过滤 html标签
 * 缺点：慢
 */
export function domFilterHtmlScript(html) {
  try {
    let doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  } catch (err) {
    return html;
  }
}

/**
 * 排除隐藏字段
 */

export function filterHidedControls(controls, hidedControlIds = [], forceShowSys = true) {
  return controls.filter(
    c =>
      !_.find(
        hidedControlIds,
        hcid =>
          c.controlId === hcid &&
          !(forceShowSys && _.find(['ownerid', 'caid', 'ctime', 'utime'], syscid => syscid === hcid)),
      ),
  );
}

/**
 * 获取表单指定字段的值
 * @param  {} cid
 * @param  {} rcid
 * @param  {} data
 */
export function getFormData({ cid, data }) {
  return (_.find(data, control => control.controlId === cid) || {}).value;
}

const stringCellList = [2, 3, 4, 25, 7, 19, 23, 24, 10010, 32, 33, 41, 15, 16, 5, 17, 18];
const stringUnitCellList = [8, 6, 31, 38, 53];

/** 是否是文本了控件 */
export function checkIsTextControl(type) {
  const STRING = stringCellList.concat(stringUnitCellList);
  return _.includes(STRING, type);
}

/** 是否是文本了控件 */
export function checkControlCanSetStyle(type) {
  const STRING = stringCellList.concat(stringUnitCellList).concat([46]);
  return _.includes(STRING, type);
}

/** 判断是否带单位 */
export function isUnitControl(type) {
  return _.includes(stringUnitCellList, type);
}

/** LRU 存储 */
export function saveLRUWorksheetConfig(key, id, value) {
  if (_.isObject(value)) {
    throw new Error('只支持存储字符串');
  }
  const maxSaveNum = 30;
  let data = {};
  if (localStorage.getItem(key)) {
    try {
      data = JSON.parse(localStorage.getItem(key));
    } catch (err) {}
  }
  const newData = _.assign({}, data, { [id]: value });
  if (Object.keys(newData).length > maxSaveNum) {
    delete newData[Object.keys(newData).pop];
  }
  safeLocalStorageSetItem(key, JSON.stringify(newData));
}

/** LRU 存储 */
export function clearLRUWorksheetConfig(key, id) {
  let data = {};
  if (localStorage.getItem(key)) {
    try {
      data = JSON.parse(localStorage.getItem(key));
    } catch (err) {}
  }
  delete data[id];
  safeLocalStorageSetItem(key, JSON.stringify(data));
}
/** LRU 读取 */
export function getLRUWorksheetConfig(key, id) {
  let data = [];
  if (localStorage.getItem(key)) {
    try {
      data = JSON.parse(localStorage.getItem(key));
    } catch (err) {
      return;
    }
  }
  return data[id];
}

/** 根据 id 对控件排序 */
export function sortControlByIds(controls = [], sortedIds = []) {
  if (!sortedIds.length) {
    return controls;
  }
  sortedIds = sortedIds.filter(_.identity);
  const leftControls = controls.filter(c => !_.find(sortedIds, id => (c.controlId || c.data.controlId) === id));
  return sortedIds
    .map(id => _.find(controls, c => (c.controlId || c.data.controlId) === id))
    .filter(_.identity)
    .concat(leftControls);
}

/** 获取控件默认排序 */
export function getControlsSorts(controls = [], sortedIds = []) {
  if (!sortedIds.length) {
    return controls.map(c => c.controlId || c.data.controlId).filter(id => _.identity);
  }
  sortedIds = sortedIds
    .filter(id => _.find(controls, control => (control.controlId || control.data.controlId) === id))
    .filter(_.identity);
  const leftControlIds = controls
    .filter(c => !_.find(sortedIds, id => (c.controlId || c.data.controlId) === id))
    .map(c => c.controlId || c.data.controlId)
    .filter(id => _.identity);
  return sortedIds.concat(leftControlIds);
}

/**
 * 验证字段值是否为空
 * @param value
 */
export function checkCellIsEmpty(value) {
  return typeof value === 'undefined' || value === '' || value === '[]' || value === '["",""]' || value === null;
}

/** 获取日期公式单位 */
export function getUnitOfDateFormula(unit) {
  unit = unit + '';
  const matched = _.find(
    [
      { text: _l('年'), value: '5' },
      { text: _l('月'), value: '4' },
      { text: _l('天'), value: '3' },
      { text: _l('小时'), value: '2' },
      { text: _l('分钟'), value: '1' },
    ],
    item => item.value === unit,
  );
  return matched ? matched.text : '';
}

/**
 * 获取控件值的数据类型
 * @param  {} control
 */
export function getControlValueSortType(control) {
  const controlType = control.sourceControlType || control.type;
  if (controlType === 6 || controlType === 8 || controlType === 31 || controlType === 36) {
    return 'NUMBER';
  } else {
    return 'STRING';
  }
}

/**
 * 记录数据格式化为 关联表控件数据格式
 * @param  {} controls
 * @param  {} records
 */

export function formatRecordToRelateRecord(
  controls,
  records = [],
  { addedIds = [], deletedIds = [], count = 0, isFromDefault } = {},
) {
  if (!_.isArray(records)) {
    records = [];
  }
  const titleControl = _.find(controls, control => control.attribute === 1);
  const value = records.map((record = {}) => {
    let name = titleControl ? record[titleControl.controlId] : '';
    if (titleControl && titleControl.type === 29 && name) {
      /**
       * 关联[使用他表字段作为标题的表]多层嵌套后，无法获得 souceControl 原始数据，这里异化为当关联表用他表字段作为标题时
       * 他表字段数据里的 name 不再返回字段原始数据，而是返回格式化后的文本
       */
      try {
        const cellData = JSON.parse(record[titleControl.controlId]);
        name = cellData[0].name;
      } catch (err) {
        name = '';
      }
    }
    return {
      name,
      sid: record.rowid,
      type: 8,
      sourcevalue: JSON.stringify(record),
      row: record,
      isNew: _.includes(addedIds, record.rowid) || isFromDefault,
      isFromDefault,
      deletedIds,
      count,
    };
  });
  return value;
}

function getControlCompareValue(c, value) {
  if (c.type === 26) {
    return safeParse(value, 'array')
      .map(u => u.accountId)
      .sort()
      .join('');
  } else if (c.type === 29) {
    return safeParse(value, 'array')
      .map(u => u.sid)
      .sort()
      .join('');
  } else if (c.type === 27) {
    return safeParse(value, 'array')
      .map(u => u.departmentId)
      .sort()
      .join('');
  } else if (c.type === 48) {
    return safeParse(value, 'array')
      .map(u => u.organizeId)
      .sort()
      .join('');
  } else {
    return value;
  }
}

/**
 * 记录数据格式化为 关联表控件数据格式
 * @param  {} controls
 * @param  {} data
 */

export function getSubListError({ rows, rules }, controls = [], showControls = [], from = 3) {
  const result = {};
  try {
    filterEmptyChildTableRows(rows).forEach(async row => {
      const rulesResult = checkRulesErrorOfRow({
        from,
        rules,
        controls: controls.filter(
          c =>
            _.find(showControls, id => id === c.controlId) ||
            _.find(rules, rule => JSON.stringify(rule.filters).indexOf(c.controlId) > -1),
        ),
        row,
      });
      const rulesErrors = rulesResult.errors;
      const controldata = rulesResult.formData.filter(
        c => _.find(showControls, id => id === c.controlId) && controlState(c).visible && controlState(c).editable,
      );
      const isLock = checkRuleLocked(
        rules,
        rulesResult.formData.filter(c => _.find(showControls, id => id === c.controlId) && controlState(c).visible),
        row.rowid,
      );
      if (isLock) {
        return;
      }
      const formdata = new DataFormat({
        data: controldata.map(c => ({ ...c, isSubList: true })),
        from: FROM.NEWRECORD,
      });
      let errorItems = formdata.getErrorControls();
      rulesErrors.forEach(errorItem => {
        if (_.includes(showControls, errorItem.controlId)) {
          result[row.rowid + '-' + errorItem.controlId] = errorItem.errorMessage;
        }
      });
      errorItems.forEach(errorItem => {
        const errorControl = _.find(controldata, c => c.controlId === errorItem.controlId);
        result[row.rowid + '-' + errorItem.controlId] =
          errorItem.errorType === FORM_ERROR_TYPE.CUSTOM
            ? checkValueByFilterRegex(errorControl, _.get(errorControl, 'value'), controldata)
            : typeof FORM_ERROR_TYPE_TEXT[errorItem.errorType] === 'string'
            ? FORM_ERROR_TYPE_TEXT[errorItem.errorType]
            : FORM_ERROR_TYPE_TEXT[errorItem.errorType](errorControl);
      });
    });
    const uniqueControls = controls.filter(
      c => _.find(showControls, id => id === c.controlId) && (c.unique || c.uniqueInRecord),
    );
    uniqueControls.forEach(c => {
      const hadValueRows = rows.filter(
        row =>
          typeof row[c.controlId] !== 'undefined' &&
          !row[c.controlId].startsWith('deleteRowIds') &&
          !checkCellIsEmpty(row[c.controlId]),
      );
      const uniqueValueRows = _.uniqBy(hadValueRows, row => getControlCompareValue(c, row[c.controlId]));
      if (hadValueRows.length !== uniqueValueRows.length) {
        const duplicateValueRows = hadValueRows.filter(vr => !_.find(uniqueValueRows, r => r.rowid === vr.rowid));
        duplicateValueRows.forEach(row => {
          const sameValueRows = hadValueRows.filter(
            r => getControlCompareValue(c, r[c.controlId]) === getControlCompareValue(c, row[c.controlId]),
          );
          if (sameValueRows.length > 1) {
            sameValueRows.forEach(r => {
              result[r.rowid + '-' + c.controlId] = FORM_ERROR_TYPE_TEXT.UNIQUE(c, true);
            });
          }
        });
      }
    });
    return result;
  } catch (err) {
    alert(_l('失败'), 3);
    console.log(err);
    throw err;
  }
}

export const filterHidedSubList = (data = [], from) => {
  return data.filter(item => item.type === 34 && controlState(item, from).visible && controlState(item, from).editable);
};

export function controlIsNumber({ type, sourceControlType, enumDefault, enumDefault2 }) {
  return (
    type === 6 ||
    type === 8 ||
    type === 31 ||
    ((type === 37 || type === 53) && controlIsNumber({ type: enumDefault2 })) ||
    (type === 30 && controlIsNumber({ type: sourceControlType, enumDefault })) ||
    (type === 38 && (enumDefault === 1 || enumDefault === 3))
  );
}

/**
 * 是否是按关联表格呈现的控件
 */
export function isRelateRecordTableControl(
  { type, enumDefault, advancedSetting = {} },
  { ignoreInFormTable = false } = {},
) {
  return (
    (type === 29 &&
      enumDefault === 2 &&
      _.includes(
        ignoreInFormTable
          ? [String(RELATE_RECORD_SHOW_TYPE.LIST), String(RELATE_RECORD_SHOW_TYPE.TAB_TABLE)]
          : [
              String(RELATE_RECORD_SHOW_TYPE.LIST),
              String(RELATE_RECORD_SHOW_TYPE.TABLE),
              String(RELATE_RECORD_SHOW_TYPE.TAB_TABLE),
            ],
        advancedSetting.showtype,
      )) ||
    (type === 51 && advancedSetting.showtype === String(RELATION_SEARCH_SHOW_TYPE.LIST))
  );
}

export function replaceByIndex(str = '111', index = 0, replacestr = '') {
  return str.substring(0, index) + replacestr + str.substring(index + 1);
}

export function getBoardItemKey(data) {
  try {
    const parseData = JSON.parse(data);
    if (Array.isArray(parseData)) {
      const firstItem = head(parseData);
      if (typeof firstItem === 'object') {
        return firstItem.sid;
      }
      return firstItem;
    }
    return parseData || '-1';
  } catch (error) {
    return '-1';
  }
}

export function updateOptionsOfControl(control, value, realValue) {
  let parsedValue = safeParse(value);
  let newOption;
  if (parsedValue.length > 1) {
    const parsedRealValue = safeParse(realValue);
    newOption = parsedValue
      .map((v, i) => ({
        index: control.options.length + i + 1,
        isDeleted: false,
        key: parsedRealValue[i],
        color: '#2196f3',
        value: v && (v.match(/add_(.*)/) || '')[1],
      }))
      .filter(v => v.value);
  } else {
    newOption = {
      index: control.options.length + 1,
      isDeleted: false,
      key: _.last(JSON.parse(realValue)),
      color: '#2196f3',
      value: value && (value.match(/"add_(.*)"]/) || '')[1],
    };
  }
  return {
    ...control,
    options: control.options.concat(newOption),
  };
}

// 处理选项自定义选项
export function updateOptionsOfControls(controls, data) {
  let newOptionControls = [];
  try {
    newOptionControls = _.filter(controls, item => _.includes([10, 11], item.type) && /"add_/.test(item.value)).map(c =>
      updateOptionsOfControl(c, c.value, data[c.controlId]),
    );
  } catch (err) {}
  return newOptionControls;
}

export function copySublistControlValue(control, value) {
  if (checkCellIsEmpty(value)) {
    return value;
  }
  switch (control.type) {
    case WIDGETS_TO_API_TYPE_ENUM.TEXT: // 文本
    case WIDGETS_TO_API_TYPE_ENUM.MOBILE_PHONE: // 手机号码
    case WIDGETS_TO_API_TYPE_ENUM.TELEPHONE: // 座机号码
    case WIDGETS_TO_API_TYPE_ENUM.EMAIL: // 邮箱
    case WIDGETS_TO_API_TYPE_ENUM.NUMBER: // 数值
    case WIDGETS_TO_API_TYPE_ENUM.CRED: // 证件
    case WIDGETS_TO_API_TYPE_ENUM.MONEY: // 金额
    case WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU: // 单选
    case WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT: // 多选
    case WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN: // 单选
    case WIDGETS_TO_API_TYPE_ENUM.DATE: // 日期
    case WIDGETS_TO_API_TYPE_ENUM.DATE_TIME: // 日期
    case WIDGETS_TO_API_TYPE_ENUM.RELATION: // 自由连接
    case WIDGETS_TO_API_TYPE_ENUM.MONEY_CN: // 大写金额
    case WIDGETS_TO_API_TYPE_ENUM.USER_PICKER: // 成员
    case WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT: // 部门
    case WIDGETS_TO_API_TYPE_ENUM.SCORE: // 等级
    case WIDGETS_TO_API_TYPE_ENUM.FORMULA_NUMBER: // 公式
    case WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET: // 关联记录
    case WIDGETS_TO_API_TYPE_ENUM.SWITCH: // 检查框
    case WIDGETS_TO_API_TYPE_ENUM.RICH_TEXT: // 富文本
    case WIDGETS_TO_API_TYPE_ENUM.CASCADER: // 级联选择
    case WIDGETS_TO_API_TYPE_ENUM.LOCATION: // 定位
    case WIDGETS_TO_API_TYPE_ENUM.ATTACHMENT: // 附件
    case WIDGETS_TO_API_TYPE_ENUM.AREA_PROVINCE: // 地区
    case WIDGETS_TO_API_TYPE_ENUM.AREA_CITY: // 地区
    case WIDGETS_TO_API_TYPE_ENUM.AREA_COUNTY: // 地区
    case WIDGETS_TO_API_TYPE_ENUM.SHEET_FIELD: // 他表字段
    case WIDGETS_TO_API_TYPE_ENUM.ORG_ROLE: // 组织角色
    case WIDGETS_TO_API_TYPE_ENUM.TIME: // 时间
    case WIDGETS_TO_API_TYPE_ENUM.CONCATENATE: // 时间
    case WIDGETS_TO_API_TYPE_ENUM.SIGNATURE: // 签名
      return value;
    default:
      return;
  }
}

export function copySublistRow(controls, row) {
  const newRow = {};
  controls.forEach(control => {
    newRow[control.controlId] = copySublistControlValue(control, row[control.controlId]);
  });
  return newRow;
}

export function getRecordTempValue(data = [], relateRecordMultipleData = {}, { updateControlIds } = {}) {
  const results = {};
  data
    .filter(
      c =>
        (updateControlIds ? _.includes(updateControlIds, c.controlId) : !checkCellIsEmpty(c.value)) &&
        c.controlId.length === 24,
    )
    .forEach(control => {
      if (control.type === WIDGETS_TO_API_TYPE_ENUM.SUB_LIST) {
        if (control.value && control.value.rows && filterEmptyChildTableRows(control.value.rows).length) {
          results[control.controlId] = filterEmptyChildTableRows(control.value.rows).map(r => {
            const newRow = _.pickBy(r, v => !checkCellIsEmpty(v));
            const relateRecordKeys = _.keys(_.pickBy(r, v => typeof v === 'string' && v.indexOf('sourcevalue') > -1));
            relateRecordKeys.forEach(key => {
              try {
                const parsed = JSON.parse([newRow[key]]);
                newRow[key] = JSON.stringify(
                  parsed.map(relateRecord => ({
                    ...relateRecord,
                    sourcevalue: JSON.stringify(
                      _.pickBy(
                        JSON.parse(relateRecord.sourcevalue),
                        v => !checkCellIsEmpty(v) && (typeof v !== 'string' || v.indexOf('sourcevalue') < 0),
                      ),
                    ),
                  })),
                );
              } catch (err) {
                delete newRow[key];
              }
            });
            return newRow;
          });
        }
      } else if (control.type === WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET) {
        try {
          results[control.controlId] = JSON.stringify(
            JSON.parse(control.value).map(r => ({
              type: r.type,
              sid: r.sid,
              name: getTitleTextFromRelateControl(control, r.name ? r : r.row || safeParse(r.sourcevalue)),
            })),
          );
        } catch (err) {}
      } else if (
        control.type !== WIDGETS_TO_API_TYPE_ENUM.SUB_LIST &&
        _.includes(['string', 'number'], typeof control.value)
      ) {
        results[control.controlId] = control.value;
      }
    });
  Object.keys(relateRecordMultipleData).forEach(controlId => {
    const control = relateRecordMultipleData[controlId];
    if (control) {
      results[control.controlId] = control.value;
    }
  });
  return results;
}

export function parseRecordTempValue(data = {}, originFormData, defaultRelatedSheet = {}) {
  let formdata = [];
  let relateRecordData = {};
  try {
    formdata = originFormData.map(c => {
      if (c.type === WIDGETS_TO_API_TYPE_ENUM.SUB_LIST && data[c.controlId]) {
        return {
          ...c,
          value: {
            isAdd: true,
            rows: data[c.controlId],
            action: 'clearAndSet',
          },
        };
      } else if (c.sourceControlId === defaultRelatedSheet.relateSheetControlId) {
        try {
          return {
            ...c,
            value: JSON.stringify([defaultRelatedSheet.value]),
          };
        } catch (err) {
          return { ...c, value: data[c.controlId] };
        }
      } else {
        return { ...c, value: data[c.controlId] };
      }
    });
    originFormData.forEach(c => {
      if (c.type === WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET && c.enumDefault === 2 && data[c.controlId]) {
        relateRecordData[c.controlId] = {
          ...c,
          value: data[c.controlId],
        };
      }
    });
  } catch (err) {}
  return { formdata, relateRecordData };
}

const debouncedKVSet = _.debounce(KVSet, 1000);

export function saveTempRecordValueToLocal(key, id, value, max = 5) {
  if (window.isWxWork) {
    debouncedKVSet(`${md.global.Account.accountId}${id}-${key}`, value);
    return debouncedKVSet;
  }
  let savedIds = [];
  if (localStorage.getItem(key)) {
    try {
      savedIds = JSON.parse(localStorage.getItem(key)) || [];
      savedIds = savedIds.filter(sid => sid !== id);
    } catch (err) {}
  }
  savedIds.push(id);
  if (savedIds.length > max) {
    localStorage.removeItem(`${key}_${savedIds[0]}`, value);
    savedIds = savedIds.slice(1);
  }
  try {
    safeLocalStorageSetItem(key, JSON.stringify(savedIds));
    safeLocalStorageSetItem(`${key}_${id}`, value);
  } catch (err) {
    Object.keys(localStorage)
      .filter(k => k.startsWith(key))
      .forEach(k => localStorage.removeItem(k));
    safeLocalStorageSetItem(key, JSON.stringify(savedIds));
    safeLocalStorageSetItem(`${key}_${id}`, value);
  }
}

export function removeTempRecordValueFromLocal(key, id) {
  if (window.isWxWork) {
    KVClear(`${md.global.Account.accountId}${id}-${key}`);
    return;
  }
  let savedIds = [];
  if (localStorage.getItem(key)) {
    try {
      savedIds = JSON.parse(localStorage.getItem(key)) || [];
      savedIds = savedIds.filter(sid => sid !== id);
    } catch (err) {}
  }
  if (savedIds && savedIds.length) {
    safeLocalStorageSetItem(key, JSON.stringify(savedIds));
  } else {
    localStorage.removeItem(key);
  }
  localStorage.removeItem(`${key}_${id}`);
}
/**
 * 校验字段id是否合法
 * @param {*} id
 * @returns Bool
 */
export function isValidControlId(id) {
  return /^\w{24}$/.test(id);
}

/**
 * 获取记录字段规则错误
 */
export function checkRulesErrorOfRow({ from, rules, controls, control, row }) {
  let errors = [];
  const formData = updateRulesData({
    from,
    rules,
    recordId: row.rowid,
    data: controls.map(c => ({ ...c, value: row[c.controlId] })),
    updateControlIds: control ? [control.controlId] : [],
    checkAllUpdate: !control,
    checkRuleValidator: (controlId, errorType, errorMessage) => {
      if (errorMessage) {
        errors.push({ controlId, errorType, errorMessage });
      }
    },
  });
  return { formData, errors };
}

/**
 * 获取字段字段规则错误
 */
export function checkRulesErrorOfRowControl({ from, rules, controls, control, row }) {
  const errors = checkRulesErrorOfRow({ from, rules, controls, control, row }).errors;
  return _.find(errors, e => e.controlId === control.controlId);
}

/**
 * 获取字段数据类型
 * return [string, array, number, object]
 */
export function getValueTypeOfControl(control) {
  control = typeof control === 'number' ? { typeof: control } : control;
  const { type } = control;
  if (
    type === WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET ||
    type === WIDGETS_TO_API_TYPE_ENUM.USER_PICKER ||
    type === WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT
  ) {
    return 'array';
  }
  if (type === WIDGETS_TO_API_TYPE_ENUM.NUMBER) {
    return 'number';
  }
  return 'string';
}

/**
 * 给控件赋值用来验证函数表达式
 */
export function getDefaultValueOfControl(control) {
  switch (control.sourceControlType || control.type) {
    case WIDGETS_TO_API_TYPE_ENUM.TEXT: // 文本 2
      return '1';
    case WIDGETS_TO_API_TYPE_ENUM.NUMBER: // 数值 6
    case WIDGETS_TO_API_TYPE_ENUM.MONEY: // 金额 8
      return 1;
    case WIDGETS_TO_API_TYPE_ENUM.EMAIL: // 邮箱 5
      return 'a#b.com'.replace('#', '@');
    case WIDGETS_TO_API_TYPE_ENUM.MOBILE_PHONE: // 手机 4
      return '+8618799999999';
    case WIDGETS_TO_API_TYPE_ENUM.DATE: // 日期 15
      return moment().format('YYYY-MM-DD');
    case WIDGETS_TO_API_TYPE_ENUM.DATE_TIME: // 日期 16
      return moment().format('YYYY-MM-DD HH:mm');
    case WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU: // 单选 9
    case WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT: // 多选 10
    case WIDGETS_TO_API_TYPE_ENUM.USER_PICKER: // 成员 26
    case WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT: // 部门 27
    case WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET: // 关联记录 29
      return '[]';
    case WIDGETS_TO_API_TYPE_ENUM.AREA_PROVINCE: // 省 19
    case WIDGETS_TO_API_TYPE_ENUM.AREA_CITY: // 省市 23
      return '{name: "china"}';
    case WIDGETS_TO_API_TYPE_ENUM.SUB_LIST: // 子表 34
    case WIDGETS_TO_API_TYPE_ENUM.SWITCH: // 检查框 36
      return 1;
    default:
      return '1';
  }
}

const execWorkerCode = `onmessage = function (e) {
  try {
  const result = new Function(e.data)();
  if (typeof result === 'object' && typeof result.then === 'function') {
      postMessage('promise begin');
      Promise.all([result]).then(function ([value]) {
        postMessage('promise value ' + value);
        postMessage({
          type: 'over',
          value,
        });
      });
    } else {
      postMessage({
        type: 'over',
        value: new Function(e.data)(),
      });
    }
  } catch (err) {
    postMessage({
      type: 'error',
      err,
    });
  }
};
`;

function genFunctionWorker() {
  return new Worker('data:application/javascript,' + encodeURIComponent(execWorkerCode));
}

class Runner {
  constructor({ max = 10 } = {}) {
    this.max = max;
    this.runningCount = 0;
    this.queue = [];
    this.workers = [];
    this.list = [];
    this.isRunning = false;
  }
  getWorker() {
    const idleWorker = this.workers.filter(w => w.idle)[0];
    if (idleWorker) {
      return idleWorker;
    } else if (this.workers.length < this.max) {
      const newWorker = {
        worker: genFunctionWorker(),
        idle: false,
        id: Math.random(),
      };
      this.workers.push(newWorker);
      return newWorker;
    }
  }
  run() {
    const workerObj = this.getWorker();
    if (!workerObj) {
      return;
    }
    const item = this.list.shift();
    if (!item) {
      this.isRunning = false;
      return;
    }
    const { code, cb, timeout } = item;
    workerObj.idle = false;
    this.isRunning = true;
    this.runningCount++;
    const afterRun = () => {
      workerObj.idle = true;
      this.runningCount--;
      this.run();
    };
    let timer;
    workerObj.worker.onmessage = msg => {
      if (msg.data.type === 'begin') {
        timer = setTimeout(() => {
          workerObj.worker.terminate();
          this.workers = this.workers.filter(w => w.id !== workerObj.id);
          afterRun();
          cb(timeout + 'ms time out');
        }, timeout);
      }
      if (msg.data.type === 'over') {
        afterRun();

        cb(null, msg.data.value);
        clearTimeout(timer);
      }
      if (msg.data.type === 'error') {
        console.error(msg.err || get(msg, 'data.err'));
        afterRun();
        cb(msg.err || get(msg, 'data.err'));
        clearTimeout(timer);
      }
    };
    workerObj.worker.postMessage(code);
  }
  push({ code, cb, timeout }) {
    this.list.push({ code, cb, timeout });
    if (this.runningCount < this.max) {
      this.run();
    }
  }
}

const runner = new Runner();

/**
 * 2023 9 25
 * 函数运行方式改为走队列，最多只创建 10 个worker，解决了子表多记录时运行几百个函数导致的卡顿和超时问题。
 * 问题：
 * 现在瓶颈在表格更新端，函数运行挺快的但更新到表格时还是挨个单元格更新。
 */

export function asyncRun(code, cb, { timeout = 1000 } = {}) {
  runner.push({ code, cb, timeout });
  // 测试使用，下面的写法是同步运行函数。
  // const result = eval('function run() { ' + code + ' } run()');
  // cb(null, result);
}

/**
 * 验证函数表达式基础语法
 */
export function validateFnExpression(expression, type = 'mdfunction') {
  try {
    expression = expression.replace(/\$(.+?)\$/g, '"1"');
    if (type === 'mdfunction') {
      expression = expression.replace(/[\r\r\n ]/g, '');
      expression = expression.replace(/([A-Z]+)(?=\()/g, 'test');
      eval(`function test() {return '-';}${expression}`);
    } else if (type === 'javascript') {
      eval(`function test() {${expression} }`);
    }
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * 对字段的 advancedSettings 进行解析处理
 */
export function parseAdvancedSetting(setting = {}) {
  const {
    allowlink = '1',
    allowimport = '1',
    allowcopy = '1',
    allowexport = '1',
    allowbatch = '1',
    showcount,
    titlewrap,
    freezeids,
    layercontrolid,
    searchrange,
  } = setting;
  return {
    allowadd: setting.allowadd === '1', // 子表允许新增
    allowcancel: setting.allowcancel === '1', // 子表允许删除
    allowedit: setting.allowedit === '1', // 子表允许编辑
    allowsingle: setting.allowsingle === '1', // 子表允许单条添加
    batchcids: safeParse(setting.batchcids, 'array'), // 子表从指定字段添加记录
    hidenumber: setting.hidenumber === '1', // 隐藏序号
    rowheight: Number(setting.rowheight || 0), // 行高
    blankrow: Number(setting.blankrow || 1),
    enablelimit: setting.enablelimit === '1', // 隐藏序号
    min: setting.enablelimit === '1' ? Number(setting.min || 0) : undefined, // 最小行数
    max: setting.enablelimit === '1' ? Number(setting.max || 1000) : undefined, // 最大行数
    rownum: Number(setting.rownum || 15), // 最大高度行数/每页行数
    showtype: setting.showtype || '1', // 显示方式 1滚动 2翻页
    uniqueControlIds: safeParse(setting.uniquecontrols, 'arrray'), // 显示方式 1滚动 2翻页
    h5showtype: setting.h5showtype || '1', // 子表移动端web显示样式 1列表 2平铺
    h5abstractids: safeParse(setting.h5abstractids, 'arrray'), // 子表移动端web摘要字段
    allowOpenRecord: allowlink === '1', // 允许打开子记录 默认勾选
    allowImport: allowimport === '1', // 允许导入（控制导入新增入口）
    allowCopy: allowcopy === '1', //允许复制 默认勾选
    allowBatch: allowbatch === '1', //允许批量操作
    frozenIndex: Number(safeParse(freezeids, 'array')[0] || '0'), //冻结列["1","2","3"]
    titleWrap: titlewrap === '1', // 标题行文字换行
    showCount: showcount !== '1', // 显示计数 默认勾选
    treeLayerControlId: layercontrolid, // 子表树形对应控件id
  };
}

/**
 * 对 controls 缺失做补齐
 */

export function completeControls(controls) {
  // 不存在系统字段的话 补充系统字段
  const sysIds = SYSTEM_CONTROLS.map(c => c.controlId);
  if (!_.some(controls.map(c => _.includes(sysIds, c.controlId)))) {
    controls = controls.concat(SYSTEM_CONTROLS);
  }
  return controls;
}

export function getNewRecordPageUrl({ appId, worksheetId, viewId }) {
  return `${md.global.Config.WebUrl}app/${appId}/newrecord/${worksheetId}/${viewId}/`;
}

export function handleSortRows(rows, control, isAsc) {
  const controlValueType = getControlValueSortType(control);
  if (_.isUndefined(isAsc)) {
    return _.sortBy(rows, 'addTime');
  }
  let newRows = _.sortBy(rows, row =>
    controlValueType === 'NUMBER'
      ? parseFloat(row[control.controlId])
      : renderCellText({ ...control, value: row[control.controlId] }),
  );
  if (!isAsc) {
    newRows = newRows.reverse();
  }
  return newRows;
}

export function isKeyBoardInputChar(value) {
  return (
    `1234567890-=!@#$%^&*()_+[];',./{}|:"<>?ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`.indexOf(value) > -1
  );
}

export function getCopyControlText(control) {
  let content;
  try {
    if (_.includes([WIDGETS_TO_API_TYPE_ENUM.SIGNATURE, WIDGETS_TO_API_TYPE_ENUM.SUB_LIST], control.type)) {
      content = control.value;
    } else if (control.type === WIDGETS_TO_API_TYPE_ENUM.ATTACHMENT) {
      content = safeParse(control.value)
        .map(c => `${c.originalFilename}${c.ext}(${c.previewUrl})`)
        .join(',');
    } else if (control.type === WIDGETS_TO_API_TYPE_ENUM.RELATION) {
      content = safeParse(control.value)
        .map(
          c =>
            `[${
              {
                1: _l('任务'),
                2: _l('项目'),
                3: _l('日程'),
                4: _l('文件'),
                5: _l('申请单'),
                6: '',
                7: _l('日程'),
              }[c.type]
            }]${c.name}(${c.link})`,
        )
        .join(',');
    } else if (_.includes([WIDGETS_TO_API_TYPE_ENUM.SCORE], control.type)) {
      content = control.value;
    } else {
      content = renderCellText(control);
    }
  } catch (err) {}
  return content;
}

export function handleCopyControlText(control, tableId) {
  const content = getCopyControlText(control);
  window.tempCopyForSheetView = JSON.stringify({ type: 'text', value: content, controlType: control.type, tableId });
  copy(content);
}

export function isSameTypeForPaste(type1, type2) {
  if (_.includes([15, 16], type1) && _.includes([15, 16], type2)) {
    return true;
  } else {
    return type1 === type2;
  }
}

export function handlePasteUpdateCell(cell, pasteData, update = () => {}) {
  // WIDGETS_TO_API_TYPE_ENUM
  if (
    _.includes(
      [
        WIDGETS_TO_API_TYPE_ENUM.MOBILE_PHONE,
        WIDGETS_TO_API_TYPE_ENUM.NUMBER,
        WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU,
        WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT,
        WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN,
        WIDGETS_TO_API_TYPE_ENUM.DATE,
        WIDGETS_TO_API_TYPE_ENUM.DATE_TIME,
        WIDGETS_TO_API_TYPE_ENUM.USER_PICKER,
        WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT,
        WIDGETS_TO_API_TYPE_ENUM.SCORE,
        WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET,
        WIDGETS_TO_API_TYPE_ENUM.CASCADER,
        WIDGETS_TO_API_TYPE_ENUM.SWITCH,
        WIDGETS_TO_API_TYPE_ENUM.RICH_TEXT,
        WIDGETS_TO_API_TYPE_ENUM.TIME,
        WIDGETS_TO_API_TYPE_ENUM.ORG_ROLE,
        WIDGETS_TO_API_TYPE_ENUM.LOCATION,
      ],
      cell.type,
    )
  ) {
    update(pasteData.value);
  } else if (
    _.includes(
      [
        WIDGETS_TO_API_TYPE_ENUM.AREA_PROVINCE,
        WIDGETS_TO_API_TYPE_ENUM.AREA_CITY,
        WIDGETS_TO_API_TYPE_ENUM.AREA_COUNTY,
      ],
      cell.type,
    )
  ) {
    update(safeParse(pasteData.value).code);
  }
  // ATTACHMENT: 14,
  // SIGNATURE
}

export function getScrollBarWidth() {
  let width;
  var scroll = document.createElement('div');
  scroll.style = 'position: absolute; left: -10000px; top: -10000px; width: 100px; height: 100px; overflow: scroll;';
  scroll.innerHTML = '<div style="width: 100px;height:200px"></div>';
  document.body.appendChild(scroll);
  width = scroll.offsetWidth - scroll.clientWidth;
  document.body.removeChild(scroll);
  return width || 10;
}

export function getRowGetType(from) {
  if (from == 21) {
    return 21;
  } else if (
    (from === RECORD_INFO_FROM.WORKSHEET_ROW_LAND && location.search && location.search.indexOf('share') > -1) ||
    _.get(window, 'shareState.isPublicView') ||
    _.get(window, 'shareState.isPublicPage') ||
    _.get(window, 'shareState.isPublicWorkflowRecord') ||
    _.get(window, 'shareState.isPublicRecord') ||
    _.get(window, 'shareState.isPublicPrint')
  ) {
    return 3;
  } else {
    return 1;
  }
}

export function findSheet(id, sheetList = []) {
  let result = null;
  for (let i = 0; i < sheetList.length; i++) {
    const current = sheetList[i];
    if (current.workSheetId == id) {
      result = current;
      break;
    }
    if (current.type === 2) {
      result = findSheet(id, current.items);
      if (result) {
        break;
      }
    }
  }
  return result;
}

export function getSheetListFirstId(sheetList = [], isCharge = true) {
  let result = null;
  for (let i = 0; i < sheetList.length; i++) {
    const current = sheetList[i];
    if (current.type === 2) {
      result = getSheetListFirstId(current.items, isCharge);
      if (result) {
        break;
      }
    } else if (isCharge ? true : [1, 4].includes(current.status) && !current.navigateHide) {
      result = current.workSheetId;
      break;
    }
  }
  return result;
}

export function formatQuickFilter(items = []) {
  return items.map(item =>
    _.pick(item, [
      'controlId',
      'dataType',
      'spliceType',
      'filterType',
      'dateRange',
      'dateRangeType',
      'value',
      'values',
      'minValue',
      'maxValue',
    ]),
  );
}

export function getRelateRecordCountFromValue(value, propsCount) {
  let count = 0;
  try {
    let savedCount;
    const parsedData = safeParse(value, 'array');
    if (!_.isUndefined(_.get(parsedData, '0.count'))) {
      savedCount = parsedData[0].count;
    } else if (value === '') {
      savedCount = 0;
    } else if (!_.isUndefined(propsCount)) {
      savedCount = propsCount;
    } else {
      savedCount = parsedData[0].count || parsedData.length;
    }
    if (!_.isUndefined(savedCount) && !_.isNaN(Number(savedCount))) {
      count = Number(savedCount);
    }
  } catch (err) {
    // console.log(err);
  }
  if (String(value).startsWith('deleteRowIds')) {
    return 0;
  }
  return count;
}

export async function postWithToken(url, tokenArgs = {}, body = {}, axiosConfig = {}) {
  let token;

  if (!_.get(window, 'shareState.shareId')) {
    token = await appManagementAjax.getToken(tokenArgs);

    if (!token) {
      return Promise.reject('获取token失败');
    }
  }
  return window.mdyAPI(
    '',
    '',
    Object.assign({}, body, {
      token,
      accountId: md.global.Account.accountId,
      clientId: window.clientId || sessionStorage.getItem('clientId'),
    }),
    {
      customParseResponse: axiosConfig.responseType === 'blob',
      ajaxOptions: {
        url,
        responseType: axiosConfig.responseType,
      },
    },
  );
}

export async function getWithToken(url, tokenArgs = {}, body = {}) {
  let token;

  if (!_.get(window, 'shareState.shareId')) {
    token = await appManagementAjax.getToken(tokenArgs);

    if (!token) {
      return Promise.reject('获取token失败');
    }
  }

  return window.mdyAPI(
    '',
    '',
    {
      ...body,
      token,
      accountId: md.global.Account.accountId,
      clientId: window.clientId || sessionStorage.getItem('clientId'),
    },
    {
      ajaxOptions: {
        type: 'GET',
        url,
      },
    },
  );
}

export function download(blob = '', name) {
  name = name || blob.name || 'file';
  function down(href) {
    const downButton = document.createElement('a');
    downButton.href = href;
    downButton.download = name;
    downButton.click();
  }
  if (typeof blob === 'string') {
    down(blob);
  } else {
    down(URL.createObjectURL(blob));
  }
}

export const moveSheetCache = (appId, groupId) => {
  const storage = JSON.parse(localStorage.getItem(`mdAppCache_${md.global.Account.accountId}_${appId}`)) || {};
  const worksheets = storage.worksheets.map(data => {
    if (data.groupId === groupId) {
      data.worksheetId = '';
    }
    return data;
  });
  storage.worksheets = worksheets;
  storage.lastWorksheetId = '';
  safeLocalStorageSetItem(`mdAppCache_${md.global.Account.accountId}_${appId}`, JSON.stringify(storage));
};

export function getRecordColor({ controlId, controls, colorItems, row }) {
  const colorControl = _.find(controls, { controlId });
  if (!colorControl || colorControl.enumDefault2 !== 1) {
    return;
  }
  if (!row[colorControl.controlId]) {
    return;
  }
  let activeKey = safeParse(row[colorControl.controlId])[0];
  if (activeKey && typeof activeKey === 'string' && activeKey.startsWith('other')) {
    activeKey = 'other';
  }
  const activeOption = colorControl.options.find(
    c => c.key === activeKey && (colorItems === '' || _.includes(colorItems, c.key)),
  );
  const lightColor = activeOption && activeOption.color && generate(activeOption.color)[0];
  return (
    activeOption &&
    activeOption.color && {
      color: activeOption.color,
      lightColor: isLightColor(activeOption.color) ? lightColor : new TinyColor(lightColor).setAlpha(0.8).toRgbString(),
    }
  );
}

export function getRecordColorConfig(view = {}) {
  const controlId = _.get(view, 'advancedSetting.colorid');
  const colorItems = _.get(view, 'advancedSetting.coloritems')
    ? safeParse(_.get(view, 'advancedSetting.coloritems'), 'array')
    : '';
  const colorType = _.get(view, 'advancedSetting.colortype');
  return (
    controlId && {
      controlId,
      colorItems,
      showLine: _.includes([RECORD_COLOR_SHOW_TYPE.LINE, RECORD_COLOR_SHOW_TYPE.LINE_BG], colorType),
      showBg: _.includes([RECORD_COLOR_SHOW_TYPE.BG, RECORD_COLOR_SHOW_TYPE.LINE_BG], colorType),
    }
  );
}

export function filterRowsByKeywords({ rows, keywords = '', controls }) {
  if (!keywords) {
    return rows;
  }
  return rows.filter(
    row =>
      controls
        .filter(c => c.controlId.length === 24)
        .map(c => renderCellText({ ...c, value: row[c.controlId] || '' }))
        .join('')
        .toLocaleLowerCase()
        .indexOf(keywords.toLocaleLowerCase()) > -1,
  );
}

/**
 * 后端 key value 存储服务
 * 存
 */
export function KVSet(key, value, { needEncode = true, expireTime } = {}) {
  let newKey = key;
  let newValue = value;
  if (needEncode) {
    newKey = btoa(key);
    newValue = btoa(unescape(encodeURIComponent(value)));
  }
  return webCache.add({
    key: newKey,
    value: newValue,
    expireTime: expireTime || moment(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)).format('YYYY-MM-DD HH:mm:ss'),
  });
}

/**
 * 后端 key value 存储服务
 * 取
 */

export function KVGet(key, { needEncode = true } = {}) {
  let newKey = key;
  if (needEncode) {
    newKey = btoa(key);
  }
  return webCache.get({ key: newKey }).then(res => (get(res, 'data') ? atob(get(res, 'data')) : ''));
}

/**
 * 后端 key value 存储服务
 * 清空
 */

export function KVClear(key, { needEncode = true } = {}) {
  let newKey = key;
  if (needEncode) {
    newKey = btoa(key);
  }
  return webCache.clear({ key: newKey }, { silent: true });
}

export const getFilledRequestParams = params => {
  const request = getRequest();
  const requestParams = _.isObject(params.requestParams) ? { ...params.requestParams } : {};

  if (_.isEmpty(request)) {
    return params;
  }

  Object.keys(request).forEach(key => {
    if (_.isArray(request[key])) {
      requestParams[key.trim()] = request[key][request[key].length - 1];
    } else if (request[key] !== null) {
      requestParams[key.trim()] = request[key];
    }
  });

  return { ...params, requestParams };
};

function hexWithAlphaMixWhiteToHex(hex) {
  try {
    let [r, g, b, a] = hex
      .replace('#', '')
      .match(/../g)
      .map(a => parseInt(a, 16));
    a = a / 255;
    const finalR = Math.round(r * a + 255 * (1 - a));
    const finalG = Math.round(g * a + 255 * (1 - a));
    const finalB = Math.round(b * a + 255 * (1 - a));
    return `#${((1 << 24) + (finalR << 16) + (finalG << 8) + finalB).toString(16).slice(1).toUpperCase()}`;
  } catch (err) {
    return hex;
  }
}

export const getButtonColor = mainColor => {
  if (mainColor !== 'transparent' && mainColor.length === 9 && mainColor.slice(-2) !== 'ff') {
    mainColor = hexWithAlphaMixWhiteToHex(mainColor);
  }
  let borderColor = mainColor;
  let fontColor =
    !isLightColor(mainColor) ||
    _.includes(
      [
        'transparent',
        '#60292A',
        '#60292AFF',
        '#2196F3',
        '#2196F3FF',
        '#00BCD4',
        '#00BCD4FF',
        '#4CAF50',
        '#4CAF50FF',
        '#F7D100',
        '#F7D100FF',
        '#FAD714',
        '#FAD714FF',
        '#FF9800',
        '#FF9800FF',
        '#F52222',
        '#F52222FF',
        '#EB2F96',
        '#EB2F96FF',
        '#7500EA',
        '#7500EAFF',
        '#3F51B5',
        '#3F51B5FF',
      ].map(_.toLower),
      _.toLower(mainColor),
    )
      ? '#fff'
      : '#151515';
  if (mainColor === 'transparent') {
    fontColor = '#151515';
    borderColor = browserIsMobile() ? '#eee' : '#ccc';
  }
  return {
    backgroundColor: mainColor || '#2196f3',
    border: `1px solid ${borderColor}`,
    color: fontColor,
  };
};

export const openLinkFromRecord = (linkControlId, record = {}) => {
  if (linkControlId) {
    const link = record[linkControlId];
    if (link && /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(link.replace(/\? /, ''))) {
      window.open(link);
    }
  }
};

export const handleRecordClick = (view, row, openRecord = () => {}) => {
  const clickType = _.get(view, 'advancedSetting.clicktype') || VIEW_CONFIG_RECORD_CLICK_ACTION.OPEN_RECORD;
  if (clickType === VIEW_CONFIG_RECORD_CLICK_ACTION.OPEN_RECORD) {
    openRecord();
  } else if (clickType === VIEW_CONFIG_RECORD_CLICK_ACTION.OPEN_LINK) {
    const linkControlId = _.get(view, 'advancedSetting.clickcid');
    openLinkFromRecord(linkControlId, row);
  }
};

export function filterEmptyChildTableRows(rows = []) {
  try {
    return rows.filter(row => !(row.rowid || '').startsWith('empty'));
  } catch (err) {
    console.error(err);
    return [];
  }
}

export function handleRecordError(resultCode, control) {
  if (resultCode === 11) {
    alert(_l('编辑失败，%0不允许重复', control ? control.controlName : ''), 2);
  } else if (resultCode === 31) {
    alert(_l('记录提交失败：有必填字段未填写'), 2);
  } else if (resultCode === 22) {
    alert(_l('记录提交失败：子表字段存在重复数据'), 2);
  } else {
    alert(_l('编辑失败！'), 2);
  }
}

export function getSubListUniqueError({ store, control, badData = [] } = {}) {
  if (badData[0]) {
    const [childTableControlId, controlId, value] = badData[0].split(':');
    const state = store.getState();
    let rows = state.rows;
    if (get(state, 'base.isTreeTableView')) {
      rows = getSheetViewRows(
        { rows: _.filter(rows, r => !/^empty-/.test(r.rowid)) },
        { treeMap: get(state, 'treeTableViewData.treeMap', {}) },
      );
    }
    const badRowIds = filterEmptyChildTableRows(rows)
      .filter(r =>
        value.indexOf('-') > -1 ? (r[controlId] || '').indexOf(value) > -1 : (r[controlId] || '') === value,
      )
      .map(r => r.rowid);
    const lastRowBaIndex = findLastIndex(filterEmptyChildTableRows(rows), r =>
      value.indexOf('-') > -1 ? (r[controlId] || '').indexOf(value) > -1 : (r[controlId] || '') === value,
    );
    if (!badRowIds.length) return {};
    const controlName = _.find(control.relationControls, c => c.controlId === controlId).controlName;
    alert(
      _l('记录提交失败：%0中第%1行记录的%2与已有记录重复', control.controlName, lastRowBaIndex + 1, controlName),
      2,
    );
    return {
      controlId: childTableControlId,
      error: badRowIds
        .map(rowId => ({
          [`${rowId}-${controlId}`]: FORM_ERROR_TYPE_TEXT.UNIQUE(),
        }))
        .reduce((a, b) => ({ ...a, ...b })),
    };
  }
}

export const replaceControlsTranslateInfo = (appId, worksheetId, controls = []) => {
  if (!window[`langData-${appId}`]) return controls;
  return controls.map(c => {
    const translateInfo = getTranslateInfo(appId, worksheetId, c.controlId);
    const { advancedSetting = {} } = c;
    const data = {
      ...c,
      controlName: translateInfo.name || c.controlName,
      hint: translateInfo.hintText || c.hint,
    };
    // 选项
    if ([9, 10, 11].includes(c.type)) {
      const optionTranslateInfo = c.dataSource ? getTranslateInfo(appId, null, c.dataSource) : translateInfo;
      data.options = data.options.map(item => {
        return {
          ...item,
          value: optionTranslateInfo[item.key] || item.value,
        };
      });
      data.advancedSetting.otherhint = translateInfo.otherhint || advancedSetting.otherhint;
    }
    // 检查项
    if (c.type === 36 && advancedSetting.itemnames) {
      const itemnames = JSON.parse(advancedSetting.itemnames);
      const newItemnames = itemnames.map(item => {
        return {
          ...item,
          value: translateInfo[item.key] || item.value,
        };
      });
      data.advancedSetting.itemnames = JSON.stringify(newItemnames);
    }
    // 数值
    if ([6, 8, 31].includes(c.type) && (advancedSetting.suffix || advancedSetting.prefix)) {
      if (advancedSetting.suffix) {
        data.advancedSetting.suffix = translateInfo.suffix || advancedSetting.suffix;
      }
      if (advancedSetting.prefix) {
        data.advancedSetting.prefix = translateInfo.suffix || advancedSetting.prefix;
      }
    }
    // 子表 || 关联表
    if (c.type === 34 || c.type === 29) {
      if (data.sourceBtnName) {
        const translateInfo = getTranslateInfo(appId, null, data.dataSource);
        data.sourceBtnName = translateInfo.createBtnName || data.sourceBtnName;
      }
      data.relationControls = replaceControlsTranslateInfo(appId, data.dataSource, data.relationControls);
    }
    // 填充备注字段内容
    if (c.type === 10010) {
      data.dataSource = translateInfo.remark || c.dataSource;
    } else {
      data.desc = translateInfo.description || c.desc;
    }
    return data;
  });
};

export const replaceAdvancedSettingTranslateInfo = (appId, worksheetId, advancedSetting) => {
  const translateInfo = getTranslateInfo(appId, null, worksheetId);
  const data = {
    ...advancedSetting,
    title: translateInfo.formTitle || advancedSetting.title,
    sub: translateInfo.formSub || advancedSetting.sub,
    continue: translateInfo.formContinue || advancedSetting.continue,
    deftabname: translateInfo.defaultTabName || advancedSetting.deftabname,
    btnname: translateInfo.createBtnName || advancedSetting.btnname,
  };
  if (data.doubleconfirm) {
    const doubleconfirm = JSON.parse(data.doubleconfirm);
    data.doubleconfirm = JSON.stringify({
      confirmMsg: translateInfo.confirmMsg || doubleconfirm.confirmMsg,
      confirmContent: translateInfo.confirmContent || doubleconfirm.confirmContent,
      sureName: translateInfo.sureName || doubleconfirm.sureName,
      cancelName: translateInfo.cancelName || doubleconfirm.cancelName,
    });
  }
  return data;
};

export const replaceRulesTranslateInfo = (appId, worksheetId, rules) => {
  return rules.map(rule => {
    const translateInfo = getTranslateInfo(appId, worksheetId, rule.ruleId);
    if (rule.type === 1) {
      rule.ruleItems[0].message = translateInfo.message || rule.ruleItems[0].message;
    }
    return rule;
  });
};

export const replaceBtnsTranslateInfo = (appId, btns = []) => {
  if (!window[`langData-${appId}`]) return btns;
  return btns.map(btn => {
    const translateInfo = getTranslateInfo(appId, null, btn.btnId);
    return {
      ...btn,
      name: translateInfo.name || btn.name,
      desc: translateInfo.description || btn.desc,
    };
  });
};

/**
 * 取消选择页面中选中的文字
 */
export function clearSelection() {
  if (window.getSelection) {
    if (window.getSelection().empty) {
      // Chrome
      window.getSelection().empty();
    } else if (window.getSelection().removeAllRanges) {
      // Firefox
      window.getSelection().removeAllRanges();
    }
  } else if (document.selection) {
    // IE
    document.selection.empty();
  }
}

export function getControlStyles(controls) {
  return controls
    .filter(c => _.includes(HAVE_VALUE_STYLE_WIDGET, c.type === 30 ? c.sourceControlType : c.type))
    .map(c => ({ controlId: c.controlId, valueStyle: getValueStyle({ ...c, value: '_' }).valueStyle }))
    .filter(c => c.valueStyle)
    .map(
      item => `
    .control-val-${item.controlId} {
      > span:not(.editIcon), > a, .worksheetCellPureString, .titleText, &.titleText {
        ${item.valueStyle}
      }
    }
  `,
    );
}

export function needHideViewFilters(view) {
  return (
    (String(view.viewType) === VIEW_DISPLAY_TYPE.structure &&
      !_.includes([0, 1], Number(view.childType)) &&
      get(view, 'advancedSetting.hierarchyViewType') === '3') ||
    String(view.viewType) === VIEW_DISPLAY_TYPE.gunter
  );
}

export function addPrefixForRowIdOfRows(rows = [], prefix = '') {
  const rowIds = rows.map(row => row.rowid);
  return rows.map(row => {
    const newRow = { ...row };
    rowIds.forEach(rowId => {
      Object.keys(newRow).forEach(key => {
        if (_.includes(newRow[key], rowId)) {
          newRow[key] = newRow[key].replace(rowId, prefix + rowId);
        }
      });
    });
    return newRow;
  });
}

export function appendDataToLocalPushUniqueId(data) {
  try {
    const defaultData = getDataFromLocalPushUniqueId();
    let pushUniqueId = _.get(md, 'global.Config.pushUniqueId');
    pushUniqueId = pushUniqueId.replace(/__(.+)/, '');
    if (pushUniqueId) {
      md.global.Config.pushUniqueId =
        pushUniqueId + (!data ? '' : `__${JSON.stringify(_.assign({}, defaultData, data))}`);
    }
  } catch (err) {
    console.error(err);
  }
}

export function resetLocalPushUniqueId() {
  appendDataToLocalPushUniqueId();
}

export function getDataFromLocalPushUniqueId() {
  return safeParse(((_.get(md, 'global.Config.pushUniqueId') || '').match(/__(.+)/) || [])[1]);
}

export function equalToLocalPushUniqueId(pushUniqueId) {
  return String(pushUniqueId).replace(/__(.+)/, '') === _.get(md, 'global.Config.pushUniqueId').replace(/__(.+)/, '');
}

export function getRelateRecordCountOfControlFromRow(control, row = {}) {
  try {
    const isTable = isRelateRecordTableControl(control);
    if (isTable) {
      return row['rq' + control.controlId] || row[control.controlId];
    } else {
      const records = safeParse(row[control.controlId], 'array');
      return records.length || 0;
    }
  } catch (err) {
    console.error(err);
    return 0;
  }
}

function parseCardStyle(control, value, type) {
  try {
    const parsedValue = safeParse(value);
    return {
      ...getValueStyle({
        ...control,
        type: 2,
        value: '_',
        advancedSetting: {
          ...control.advancedSetting,
          valuecolor: parsedValue.color || 'none',
          valuesize: parsedValue.size || (type === 'recordTitle' ? 1 : undefined),
          valuestyle: parsedValue.style,
        },
      }),
      direction: parsedValue.direction,
    };
  } catch (err) {
    return {};
  }
}

export function getRecordCardStyle(control) {
  const {
    cardtitlestyle, // 字段标题 direction: 1 水平 2 垂直
    cardvaluestyle, // 字段值
    rowtitlestyle, // 记录标题
    cardstyle,
  } = control.advancedSetting;
  const cardStyle = safeParse(cardstyle);
  return {
    controlTitleStyle: parseCardStyle(control, cardtitlestyle),
    controlValueStyle: parseCardStyle(control, cardvaluestyle),
    recordTitleStyle: parseCardStyle(control, rowtitlestyle, 'recordTitle'),
    cardStyle: {
      backgroundColor: cardStyle.background,
      borderColor: cardStyle.bordercolor,
    },
  };
}

// 本地存储当前选中菜单
export const saveSelectExtensionNavType = (worksheetId, navType, navValue) => {
  const sheetConfigNavInfo = localStorage.getItem('sheetConfigNavInfo')
    ? JSON.parse(localStorage.getItem('sheetConfigNavInfo'))
    : {};
  if (!sheetConfigNavInfo[worksheetId]) {
    sheetConfigNavInfo[worksheetId] = {};
  }
  sheetConfigNavInfo[worksheetId][navType] = navValue;
  const sheetIds = Object.keys(sheetConfigNavInfo);
  if (sheetIds.length > 10) {
    delete sheetConfigNavInfo[sheetIds[0]];
  }
  localStorage.setItem('sheetConfigNavInfo', JSON.stringify(sheetConfigNavInfo));
};
