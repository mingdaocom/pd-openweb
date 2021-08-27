import EventEmitter from 'events';
import moment from 'moment';
import { navigateTo } from 'src/router/navigateTo';
import { FROM } from 'src/components/newCustomFields/tools/config';
import DataFormat from 'src/components/newCustomFields/tools/DataFormat';
import { FORM_ERROR_TYPE_TEXT } from 'src/components/newCustomFields/tools/config';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import { RELATE_RECORD_SHOW_TYPE } from 'worksheet/constants/enum';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { getWorksheetInfo } from 'src/api/worksheet';
import { head } from 'lodash';

export const emitter = new EventEmitter();

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
  const projectIds = _.uniq(list.map(item => item.projectId));
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
export function fieldCanSort(type) {
  const canSortTypes = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 15, 16, 26, 27, 28, 29, 30, 31, 32, 33, 34, 36, 37, 38, 42];
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
        text: _l('最新的在前'),
        value: descendingValue,
      },
      {
        text: _l('最旧的在前'),
        value: ascendingValue,
      },
    ];
  } else if (type === 36) {
    return [
      {
        text: _l('未选中 → 选中'),
        value: ascendingValue,
      },
      {
        text: _l('选中 → 未选中'),
        value: descendingValue,
      },
    ];
  } else {
    return [
      {
        text: _l('升序'),
        value: ascendingValue,
      },
      {
        text: _l('降序'),
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
export function formatFormulaDate(value, unit, hideUnitStr) {
  let content = '';
  const isNegative = value < 0; // 处理负数
  value = Math.round(parseFloat(value));
  if (isNegative) {
    value = -1 * value;
  }
  const units = [_l('分钟'), _l('小时'), _l('天'), _l('月'), _l('年')];
  let unitStr = units[parseInt(unit, 10) - 1] || '';
  if (unitStr) {
    unitStr = ' ' + unitStr;
  }
  if (hideUnitStr) {
    unitStr = '';
  }
  const hourMinute = 60;
  const dayMinute = 60 * 24;
  const dayHour = 24;
  switch (unit) {
    case '1':
      if (value < hourMinute) {
        content = value + unitStr;
      } else if (value < dayMinute) {
        content =
          Math.floor(value / hourMinute) +
          ' ' +
          units[1] +
          ' ' +
          (value % hourMinute > 0 ? (value % hourMinute) + unitStr : '');
      } else {
        content =
          Math.floor(value / dayMinute) +
          ' ' +
          units[2] +
          ' ' +
          (Math.floor((value % dayMinute) / hourMinute) > 0
            ? Math.floor((value % dayMinute) / hourMinute) + ' ' + units[1] + ' '
            : '') +
          (value % hourMinute ? (value % hourMinute) + unitStr : '');
      }
      break;
    case '2':
      if (value < dayHour) {
        content = value + unitStr;
      } else {
        content =
          Math.floor(value / dayHour) + ' ' + units[2] + ' ' + (value % dayHour > 0 ? (value % dayHour) + unitStr : '');
      }
      break;
    default:
      content = _.isNumber(value) ? value + unitStr : '';
  }
  return content && (isNegative ? '-' : '') + content;
}

/**
 *  日期公式计算
 * */

export function calcDate(date, expression) {
  if (!date) {
    return { error: true };
  }
  date = moment(date);
  let cals;
  try {
    cals = expression.match(/([+-]([0-9]+(.[0-9]{1,3})?)[YMdhm])/g);
  } catch (err) {
    return { error: true };
  }
  (cals || []).forEach(cal => {
    if (!cal.match(/^([+-])([0-9]+(.[0-9]{1,3})?)[YMdhm]$/)) {
      return;
    }
    const [full, operator, numStr, no, unit] = cal.match(/^([+-])([0-9]+(.[0-9]{1,3})?)([YMdhm])$/);
    const num = parseFloat(numStr, 10);
    if (!_.isNumber(num)) {
      return;
    }
    date = date[operator === '+' ? 'add' : 'subtract'](Math.round(num), unit);
  });
  return { result: date };
}

/**
 * regexFilter 正则方式过滤 html标签
 * 优点：快
 * 缺点：转义后的字符没有处理 (可以用 https://github.com/mathiasbynens/he 处理)
 */
export function regexFilterHtmlScript(str) {
  return str.replace(/(<([^>]+)>)/gi, '');
}

/**
 * regexFilter dom 转换方式过滤 html标签
 * 缺点：慢
 */
export function domFilterHtmlScript(str) {
  var div = document.createElement('div');
  div.innerHTML = str;
  return div.innerText;
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

/** 获取选项 */
export function getSelectedOptions(options, value) {
  if (!value || value === '[]') {
    return [];
  }
  let selectedKeys = [];
  try {
    selectedKeys = JSON.parse(value);
  } catch (err) {}
  return options.filter(option => selectedKeys.indexOf(option.key) > -1);
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
  localStorage.setItem(key, JSON.stringify(newData));
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
  localStorage.setItem(key, JSON.stringify(data));
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

export function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch (err) {
    return undefined;
  }
}
/**
 * 获取控件值的数据类型
 * @param  {} control
 */
export function getControlValueSortType(control) {
  const controlType = control.sourceControlType || control.type;
  if (controlType === 6 || controlType === 8 || controlType === 31) {
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

export function formatRecordToRelateRecord(controls, records) {
  const titleControl = _.find(controls, control => control.attribute === 1);
  const value = records.map(record => {
    let name = titleControl ? record[titleControl.controlId] : '';
    if (titleControl.type === 29 && name) {
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
    };
  });
  return value;
}

/**
 * 记录数据格式化为 关联表控件数据格式
 * @param  {} controls
 * @param  {} data
 */

export function getSubListError({ rows }, controls = [], showControls = []) {
  const result = {};
  try {
    rows.forEach(row => {
      const controldata = controls
        .filter(c => _.find(showControls, id => id === c.controlId) && controlState(c).editable)
        .map(c => ({ ...c, value: row[c.controlId] || '' }));
      const formdata = new DataFormat({
        data: controldata,
        from: FROM.NEWRECORD,
      });
      const errorItems = formdata.getErrorControls();
      errorItems.forEach(errorItem => {
        result[row.rowid + '-' + errorItem.controlId] =
          typeof FORM_ERROR_TYPE_TEXT[errorItem.errorType] === 'string'
            ? FORM_ERROR_TYPE_TEXT[errorItem.errorType]
            : FORM_ERROR_TYPE_TEXT[errorItem.errorType](_.find(controldata, c => c.controlId === errorItem.controlId));
      });
    });
    const uniqueControls = controls.filter(c => _.find(showControls, id => id === c.controlId) && c.unique);
    uniqueControls.forEach(c => {
      if (!controlState(c).editable) {
        return;
      }
      const hadValueRows = rows.filter(row => typeof row[c.controlId] !== 'undefined' && row[c.controlId] !== '');
      const uniqueValueRows = _.uniq(hadValueRows, c.controlId);
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
  return type === 29 && enumDefault === 2 && parseInt(advancedSetting.showtype, 10) === RELATE_RECORD_SHOW_TYPE.LIST;
}

export function replaceByIndex(str = '', index = 0, replacestr = '') {
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
  const newOption = {
    index: control.options.length + 1,
    isDeleted: false,
    key: _.last(JSON.parse(realValue)),
    color: '#2196f3',
    value: value && (value.match(/"add_(.*)"]/) || '')[1],
  };
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
    case WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET: // 关联记录
    case WIDGETS_TO_API_TYPE_ENUM.SWITCH: // 检查框
    case WIDGETS_TO_API_TYPE_ENUM.RICH_TEXT: // 富文本
    case WIDGETS_TO_API_TYPE_ENUM.SIGNATURE: // 签名
    case WIDGETS_TO_API_TYPE_ENUM.CASCADER: // 级联选择
    case WIDGETS_TO_API_TYPE_ENUM.LOCATION: // 定位
    case WIDGETS_TO_API_TYPE_ENUM.ATTACHMENT: // 附件
    case WIDGETS_TO_API_TYPE_ENUM.AREA_PROVINCE: // 地区
    case WIDGETS_TO_API_TYPE_ENUM.AREA_CITY: // 地区
    case WIDGETS_TO_API_TYPE_ENUM.AREA_COUNTY: // 地区
    case WIDGETS_TO_API_TYPE_ENUM.SHEET_FIELD: // 他表字段
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

export function getRecordTempValue(data = [], relateRecordMultipleData = {}) {
  const results = {};
  data
    .filter(c => !checkCellIsEmpty(c.value))
    .forEach(control => {
      if (control.type === WIDGETS_TO_API_TYPE_ENUM.SUB_LIST) {
        if (control.value && control.value.rows && control.value.rows.length) {
          results[control.controlId] = control.value.rows.map(r => {
            const newRow = _.pick(r, v => !checkCellIsEmpty(v));
            const relateRecordKeys = _.keys(_.pick(r, v => typeof v === 'string' && v.indexOf('sourcevalue') > -1));
            relateRecordKeys.forEach(key => {
              try {
                const parsed = JSON.parse([newRow[key]]);
                newRow[key] = JSON.stringify(
                  parsed.map(relateRecord => ({
                    ...relateRecord,
                    sourcevalue: JSON.stringify(
                      _.pick(
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
      } else if (control.type !== WIDGETS_TO_API_TYPE_ENUM.SUB_LIST && typeof control.value === 'string') {
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
              action: 'clearAndset',
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
  localStorage.setItem(key, JSON.stringify(savedIds));
  localStorage.setItem(`${key}_${id}`, value);
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
    localStorage.setItem(key, JSON.stringify(savedIds));
  } else {
    localStorage.removeItem(key);
  }
  localStorage.removeItem(`${key}_${id}`);
}
