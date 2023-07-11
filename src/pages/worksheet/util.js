import EventEmitter from 'events';
import moment from 'moment';
import filterXss from 'xss';
import copy from 'copy-to-clipboard';
import axios from 'axios';
import { toFixed } from 'src/util';
import appManagementAjax from 'src/api/appManagement';
import { FROM } from 'src/components/newCustomFields/tools/config';
import DataFormat from 'src/components/newCustomFields/tools/DataFormat';
import { FORM_ERROR_TYPE_TEXT } from 'src/components/newCustomFields/tools/config';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import { updateRulesData } from 'src/components/newCustomFields/tools/filterFn';
import { RELATE_RECORD_SHOW_TYPE, RELATION_SEARCH_SHOW_TYPE } from 'worksheet/constants/enum';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import renderCellText from 'worksheet/components/CellControls/renderText';
import { SYSTEM_CONTROLS, RECORD_INFO_FROM } from 'worksheet/constants/enum';
import _, { head } from 'lodash';

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

const SUMMARY_LIST = [
  { type: 'COMMON', value: 0, label: _l('不显示') },
  { type: 'COMMON', value: 1, label: _l('已填写') },
  { type: 'COMMON', value: 2, label: _l('未填写') },
  { type: 'NUMBER', value: 3, label: _l('求和') },
  { type: 'NUMBER', value: 4, label: _l('平均值') },
  { type: 'NUMBER', value: 5, label: _l('最大值') },
  { type: 'NUMBER', value: 6, label: _l('最小值') },
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
  if (type === 37) {
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
    2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 15, 16, 26, 27, 28, 29, 30, 31, 32, 33, 34, 36, 37, 38, 42, 46, 48, 50,
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
export function formatFormulaDate({ value, unit, hideUnitStr, dot = 0 }) {
  let content = '';
  const isNegative = value < 0; // 处理负数
  value = toFixed(Math.floor(value * Math.pow(10, dot)) / Math.pow(10, dot), dot);
  if (isNegative) {
    value = -1 * value;
  }
  const units = [_l('分钟'), _l('小时'), _l('天'), _l('月'), _l('年'), _l('秒')];
  let unitStr = units[parseInt(unit, 10) - 1] || '';
  if (hideUnitStr) {
    unitStr = '';
  }
  const hourMinute = 60;
  const dayMinute = 60 * 24;
  const dayHour = 24;
  switch (unit) {
    case '1':
      if (+value < hourMinute) {
        content = value + unitStr;
      } else if (+value < dayMinute) {
        content =
          Math.floor(value / hourMinute) +
          units[1] +
          (value % hourMinute >= 0 ? toFixed(value % hourMinute, dot) + unitStr : '');
      } else {
        content =
          Math.floor(value / dayMinute) +
          units[2] +
          (Math.floor((value % dayMinute) / hourMinute) >= 0
            ? Math.floor((value % dayMinute) / hourMinute) + units[1]
            : '') +
          (value % hourMinute >= 0 ? toFixed(value % hourMinute, dot) + unitStr : '');
      }
      break;
    case '2':
      if (+value < dayHour) {
        content = value + unitStr;
      } else {
        content =
          Math.floor(value / dayHour) +
          units[2] +
          (value % dayHour >= 0 ? toFixed(value % dayHour, dot) + unitStr : '');
      }
      break;
    case '4':
      if (+value < 12) {
        content = value + unitStr;
      } else {
        content = Math.floor(value / 12) + units[4] + (value % 12 >= 0 ? toFixed(value % 12, dot) + unitStr : '');
      }
      break;
    default:
      content = _.isNumber(parseFloat(value)) && !_.isNaN(parseFloat(value)) ? value + unitStr : '';
  }
  return content && (isNegative ? '-' : '') + content;
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
const stringUnitCellList = [8, 6, 31, 38];

/** 是否是文本了控件 */
export function checkIsTextControl(type) {
  const STRING = stringCellList.concat(stringUnitCellList);
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

export function formatRecordToRelateRecord(controls, records = [], { addedIds = [], deletedIds = [], count = 0 } = {}) {
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
      isNew: _.includes(addedIds, record.rowid),
      deletedIds,
      count,
    };
  });
  return value;
}

/**
 * 记录数据格式化为 关联表控件数据格式
 * @param  {} controls
 * @param  {} data
 */

export function getSubListError({ rows, rules }, controls = [], showControls = [], from = 3) {
  const result = {};
  try {
    rows.forEach(async row => {
      const rulesResult = checkRulesErrorOfRow({
        from,
        rules,
        controls: controls.filter(c => _.find(showControls, id => id === c.controlId)),
        row,
      });
      const rulesErrors = rulesResult.errors;
      const controldata = rulesResult.formData.filter(
        c => _.find(showControls, id => id === c.controlId) && controlState(c).visible && controlState(c).editable,
      );
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
        result[row.rowid + '-' + errorItem.controlId] =
          typeof FORM_ERROR_TYPE_TEXT[errorItem.errorType] === 'string'
            ? FORM_ERROR_TYPE_TEXT[errorItem.errorType]
            : FORM_ERROR_TYPE_TEXT[errorItem.errorType](_.find(controldata, c => c.controlId === errorItem.controlId));
      });
    });
    const uniqueControls = controls.filter(c => _.find(showControls, id => id === c.controlId) && c.unique);
    uniqueControls.forEach(c => {
      const hadValueRows = rows.filter(row => typeof row[c.controlId] !== 'undefined' && row[c.controlId] !== '');
      const uniqueValueRows = _.uniqBy(hadValueRows, c.controlId);
      if (hadValueRows.length !== uniqueValueRows.length) {
        const duplicateValueRows = hadValueRows.filter(vr => !_.find(uniqueValueRows, r => r.rowid === vr.rowid));
        duplicateValueRows.forEach(row => {
          const sameValueRows = hadValueRows.filter(r => r[c.controlId] === row[c.controlId]);
          if (sameValueRows.length > 1) {
            sameValueRows.forEach(r => {
              result[r.rowid + '-' + c.controlId] = FORM_ERROR_TYPE_TEXT.UNIQUE(c);
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
    (type === 37 && controlIsNumber({ type: enumDefault2 })) ||
    (type === 30 && controlIsNumber({ type: sourceControlType, enumDefault })) ||
    (type === 38 && (enumDefault === 1 || enumDefault === 3))
  );
}

/**
 * 是否是按关联表格呈现的控件
 */
export function isRelateRecordTableControl({ type, enumDefault, advancedSetting = {} }) {
  return (
    (type === 29 && enumDefault === 2 && parseInt(advancedSetting.showtype, 10) === RELATE_RECORD_SHOW_TYPE.LIST) ||
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
      return value;
    case WIDGETS_TO_API_TYPE_ENUM.SIGNATURE: // 签名
      try {
        return value.startsWith('http') ? JSON.stringify({ bucket: 4, key: new URL(value).pathname.slice(1) }) : value;
      } catch (err) {
        return;
      }
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

export function getRecordTempValue(data = [], relateRecordMultipleData = {}) {
  const results = {};
  data
    .filter(c => !checkCellIsEmpty(c.value))
    .forEach(control => {
      if (control.type === WIDGETS_TO_API_TYPE_ENUM.SUB_LIST) {
        if (control.value && control.value.rows && control.value.rows.length) {
          results[control.controlId] = control.value.rows.map(r => {
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
            JSON.parse(control.value).map(r => _.pick(r, ['name', 'type', 'sid'])),
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

export function parseRecordTempValue(value, originFormData) {
  let formdata = [];
  let relateRecordData = {};
  try {
    const data = JSON.parse(value);
    formdata = originFormData.map(c =>
      c.type === WIDGETS_TO_API_TYPE_ENUM.SUB_LIST && data[c.controlId]
        ? {
            ...c,
            value: {
              isAdd: true,
              controls: c.relationControls,
              rows: data[c.controlId],
              action: 'clearAndSet',
            },
          }
        : { ...c, value: data[c.controlId] },
    );
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

export function saveToLocal(key, id, value, max = 5) {
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

export function removeFromLocal(key, id) {
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

export function runCode(code) {
  return new vm.Script(code).runInNewContext();
}

const execWorkerCode = `onmessage = function (e) {
  const result = new Function(e.data)();
  try {
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

export function asyncRun(code, cb, { timeout = 3000 } = {}) {
  const functionWorker = genFunctionWorker();
  const timer = setTimeout(() => {
    functionWorker.terminate();
    cb(timeout + 'ms time out');
  }, timeout);
  functionWorker.onmessage = msg => {
    if (msg.data.type === 'over') {
      cb(null, msg.data.value);
      clearTimeout(timer);
      functionWorker.terminate();
    }
    if (msg.data.type === 'error') {
      console.error(msg.err);
      cb(msg.err);
      clearTimeout(timer);
      functionWorker.terminate();
    } else {
      // console.log(msg.data);
    }
  };
  functionWorker.postMessage(code);
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
      runCode(`function test() {return '-';}${expression}`);
    } else if (type === 'javascript') {
      runCode(`function test() {${expression} }`);
    }
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * 对字段的 advancedSettings 进行解析处理
 */
export function parseAdvancedSetting(setting) {
  return {
    allowadd: setting.allowadd === '1', // 子表允许新增
    allowcancel: setting.allowcancel === '1', // 子表允许删除
    allowedit: setting.allowedit === '1', // 子表允许编辑
    allowsingle: setting.allowsingle === '1', // 子表允许单条添加
    batchcids: safeParseArray(setting.batchcids), // 子表从指定字段添加记录
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

export function handleCopyControlText(control) {
  const content = getCopyControlText(control);
  window.tempCopyForSheetView = JSON.stringify({ type: 'text', value: content, controlType: control.type });
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
    from === RECORD_INFO_FROM.CHAT ||
    (from === RECORD_INFO_FROM.WORKSHEET_ROW_LAND && location.search && location.search.indexOf('share') > -1) ||
    _.get(window, 'shareState.isPublicView') ||
    _.get(window, 'shareState.isPublicRecord')
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
    } else if (isCharge ? true : current.status === 1 && !current.navigateHide) {
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
      'value',
      'values',
      'minValue',
      'maxValue',
    ]),
  );
}

export function getRelateRecordCountFromValue(value) {
  let count;
  try {
    const savedCount = safeParse(value, 'array')[0].count;
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
  const token = await appManagementAjax.getToken(tokenArgs);
  if (!token) {
    return Promise.reject('获取token失败');
  }
  return axios.post(
    url,
    Object.assign({}, body, {
      token,
      accountId: md.global.Account.accountId,
    }),
    axiosConfig,
  );
}

export async function getWithToken(url, tokenArgs = {}, body = {}, axiosConfig = {}) {
  const token = await appManagementAjax.getToken(tokenArgs);
  if (!token) {
    return Promise.reject('获取token失败');
  }
  return axios.get(url, {
    ...axiosConfig,
    params: {
      ...body,
      token,
      accountId: md.global.Account.accountId,
    },
  });
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
