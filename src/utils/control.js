import { TinyColor } from '@ctrl/tinycolor';
import copy from 'copy-to-clipboard';
import dayjs from 'dayjs';
import update from 'immutability-helper';
import _, { filter, find, get, includes, isEmpty } from 'lodash';
import moment from 'moment';
import nzh from 'nzh';
import { func } from 'prop-types';
import { ToWords } from 'to-words';
import { v4 as uuidv4 } from 'uuid';
import { RELATE_RECORD_SHOW_TYPE, RELATION_SEARCH_SHOW_TYPE, SYSTEM_CONTROLS } from 'worksheet/constants/enum';
import { CONTROL_EDITABLE_WHITELIST } from 'worksheet/constants/enum';
import { DEFAULT_TEXT } from 'src/components/Form/core/enum';
import { FROM } from 'src/components/newCustomFields/tools/config';
import { TITLE_SIZE_OPTIONS, UNIT_TO_TEXT, UNIT_TYPE } from 'src/pages/widgetConfig/config/setting';
import { SYSTEM_CONTROL_WITH_UAID, WORKFLOW_SYSTEM_CONTROL } from 'src/pages/widgetConfig/config/widget';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { canSetWidgetStyle, getDateToEn, getShowFormat, getTitleStyle } from 'src/pages/widgetConfig/util/setting';
import { dealMaskValue } from 'src/pages/widgetConfig/widgetSetting/components/WidgetSecurity/util';
import { RELATION_TYPE_NAME } from 'src/pages/worksheet/components/CellControls/enum';
import { accMul, browserIsMobile, countChar, domFilterHtmlScript } from 'src/utils/common';
import RegExpValidator from 'src/utils/expression';
import { dateConvertToUserZone } from 'src/utils/project';

// 控件状态
export const controlState = (data, from) => {
  if (!data) {
    return {};
  }
  const controlPermissions = data.controlPermissions || '111';
  const fieldPermission = data.fieldPermission || '111';
  let state = {
    visible: true,
    editable: true,
  };

  if (_.includes([FROM.NEWRECORD, FROM.PUBLIC_ADD, FROM.H5_ADD, FROM.DRAFT], from)) {
    state.visible = fieldPermission[0] === '1' && fieldPermission[2] === '1' && controlPermissions[2] === '1';
    state.editable = fieldPermission[1] === '1';
  } else {
    state.visible = fieldPermission[0] === '1' && controlPermissions[0] === '1';
    state.editable = fieldPermission[1] === '1' && controlPermissions[1] === '1';
  }

  return state;
};

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

/** 获取选项 */
export function getSelectedOptions(options, value, control) {
  if (!value || value === '[]') {
    return [];
  }
  let selectedKeys = [];
  try {
    selectedKeys = JSON.parse(value);
    return (
      get(control, 'advancedSetting.checktype') === '0'
        ? filter(
            options,
            option =>
              find(selectedKeys, selectedKey => {
                if (selectedKey.indexOf('other') > -1 || selectedKey.indexOf('add_') > -1) {
                  return selectedKey.indexOf(option.key) > -1;
                }
                return selectedKey === option.key;
              }) && !option.isDeleted,
          ).map(option => option.key)
        : selectedKeys
    )
      .map(key =>
        _.find(options, option => {
          if (key.indexOf('other') > -1 || key.indexOf('add_') > -1) {
            return key.indexOf(option.key) > -1;
          }
          return key === option.key;
        }),
      )
      .filter(_.identity);
  } catch (err) {
    console.log(err);
    return [];
  }
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
 * 验证字段值是否为空
 * @param value
 */
export function checkCellIsEmpty(value) {
  return typeof value === 'undefined' || value === '' || value === '[]' || value === '["",""]' || value === null;
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

/**
 * 对字段的 advancedSettings 进行解析处理
 */
export function parseAdvancedSetting(setting = {}) {
  const {
    allowlink = '1',
    allowimport = '1',
    allowcopy = '1',
    allowbatch = '1',
    showcount,
    titlewrap,
    rctitlestyle,
    freezeids,
    layercontrolid,
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
    uniqueControlIds: safeParse(setting.uniquecontrols, 'array'), // 显示方式 1滚动 2翻页
    h5showtype: setting.h5showtype || '1', // 子表移动端web显示样式 1列表 2平铺
    h5abstractids: safeParse(setting.h5abstractids, 'array'), // 子表移动端web摘要字段
    allowOpenRecord: allowlink === '1', // 允许打开子记录 默认勾选
    allowImport: allowimport === '1', // 允许导入（控制导入新增入口）
    allowCopy: allowcopy === '1', //允许复制 默认勾选
    allowBatch: allowbatch === '1', //允许批量操作
    frozenIndex: Number(safeParse(freezeids, 'array')[0] || '0'), //冻结列["1","2","3"]
    titleWrap: titlewrap === '1', //
    titleCenter: rctitlestyle === '1', // 垂直居中
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

export const getHighAuthControls = controls => {
  return controls.map(l => ({
    ...l,
    disabled: false,
    fieldPermission: '111',
    controlPermissions: '111',
    advancedSetting: _.assign({}, l.advancedSetting, { custom_event: '' }),
  }));
};

export function controlBatchCanEdit(control, view = { controls: [] }) {
  return (
    ((control.type < 10000 &&
      includes(CONTROL_EDITABLE_WHITELIST, control.type) &&
      !(control.type === 29 && includes(['2', '5', '6'], get(control, 'advancedSetting.showtype'))) &&
      !(control.type === 14 && includes(['0'], get(control, 'advancedSetting.allowdelete') || '1')) &&
      !find(SYSTEM_CONTROL_WITH_UAID.concat(WORKFLOW_SYSTEM_CONTROL), { controlId: control.controlId }) &&
      !find(view.controls, id => control.controlId === id)) ||
      control.controlId === 'ownerid') &&
    ((controlState(control).visible && controlState(control).editable) ||
      (view.viewId && view.viewId === view.worksheetId))
  );
}

/**
 * 对将复杂字段数据处理成简单数据 用来呈现或参与计算
 * return undefined string number bool [string] [number]
 */
export function formatControlValue(cell) {
  try {
    if (!cell) {
      return;
    }
    let newPos = [];
    let { type, value } = cell;
    let parsedData, selectedOptions;
    if (type === 37) {
      if (cell.advancedSetting && cell.advancedSetting.summaryresult === '1') {
        type = 2;
        value = Math.round(parseFloat(cell.value) * 100) + '%';
      } else {
        type = cell.enumDefault2 || 6;
      }
    }
    switch (type) {
      case 6: // NUMBER 数值
      case 8: // MONEY 金额
        return String(value).trim() !== '' && _.isNumber(Number(value)) && !_.isNaN(Number(value))
          ? Number(value)
          : undefined;
      case 19: // AREA_INPUT 地区
      case 23: // AREA_INPUT 地区
      case 24: // AREA_INPUT 地区
        return JSON.parse(value).name;
      case 17: // DATE_TIME_RANGE 时间段
      case 18: // DATE_TIME_RANGE 时间段
        if (value === '' || value === '["",""]') {
          return;
        }
        return JSON.parse(value);
      case 40: // LOCATION 定位
        parsedData = JSON.parse(value) || {};
        if (!_.isObject(parsedData)) {
          return undefined;
        }
        if ((parsedData.coordinate || '').toLowerCase() === 'wgs84') {
          newPos = wgs84togcj02(parsedData.x, parsedData.y);
          return {
            ...parsedData,
            x: newPos[0],
            y: newPos[1],
          };
        }
        return parsedData;
      // 组件
      case 9: // OPTIONS 单选 平铺
      case 10: // MULTI_SELECT 多选
      case 11: // OPTIONS 单选 下拉
        selectedOptions = getSelectedOptions(cell.options, cell.value, cell);
        return selectedOptions.map((option, index) => option.value);
      case 26: // USER_PICKER 成员
        parsedData = JSON.parse(value);
        if (!_.isArray(parsedData)) {
          parsedData = [parsedData];
        }
        return parsedData.filter(user => !!user).map(user => (typeof user === 'string' ? user : user.fullname));
      case 27: // GROUP_PICKER 部门
        return JSON.parse(cell.value).map((department, index) => {
          if (typeof department === 'string') {
            return department;
          }
          return department.departmentName ? department.departmentName : _l('该部门已删除');
        });
      case 48: // ORG_ROLE 组织角色
        return JSON.parse(cell.value).map((organization, index) => {
          if (typeof organization === 'string') {
            return organization;
          }
          return organization.organizeName ? organization.organizeName : _l('该组织已删除');
        });
      case 36: // SWITCH 检查框
        return value === '1' || value === 1;
      case 14: // ATTACHMENT 附件
        return JSON.parse(value).map(attachment => `${attachment.originalFilename + attachment.ext}`);
      case 35: // CASCADER 级联
        parsedData = JSON.parse(value);
        return _.isArray(parsedData) && parsedData.length ? parsedData[0].name : undefined;
      case 29: // RELATESHEET 关联表
        if (_.isNumber(+value) && !_.isNaN(+value)) {
          parsedData = new Array(+value).fill();
        } else {
          parsedData = JSON.parse(value);
          parsedData =
            _.isArray(parsedData) &&
            parsedData
              .map(record =>
                formatControlValue(_.assign({}, cell, { type: cell.sourceControlType || 2, value: record.name })),
              )
              .filter(_.identity);
        }
        return cell.enumDefault === 1 ? parsedData.slice(0, 1) : parsedData;
      case 34: // SUBLIST 子表
        return _.isObject(value) ? _.get(value, 'rows') : [...new Array(value ? Number(value) : 0)];
      case 30: // SHEETFIELD 他表字段
        return formatControlValue(
          _.assign({}, cell, {
            type: cell.sourceControlType || 2,
            advancedSetting: _.get(cell, 'sourceControl.advancedSetting') || {},
          }),
        );
      case 46: // TIME 时间
        if (_.isEmpty(value)) {
          return '';
        }
        return dayjs(value, countChar(value, ':') === 2 ? 'HH:mm:ss' : 'HH:mm').format(
          cell.unit === '6' || cell.unit === '9' ? 'HH:mm:ss' : 'HH:mm',
        );
      default:
        return value;
    }
  } catch (err) {
    if (typeof console !== 'undefined') {
      console.log(err);
    }
    return;
  }
}

function transformLat(lng, lat) {
  var pi = 3.14159265358979324;
  var a = 6378245.0;
  var ee = 0.00669342162296594323;
  var dLat = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
  dLat += ((20.0 * Math.sin(6.0 * lng * pi) + 20.0 * Math.sin(2.0 * lng * pi)) * 2.0) / 3.0;
  dLat += ((20.0 * Math.sin(lat * pi) + 40.0 * Math.sin((lat / 3.0) * pi)) * 2.0) / 3.0;
  dLat += ((160.0 * Math.sin((lat / 12.0) * pi) + 320 * Math.sin((lat * pi) / 30.0)) * 2.0) / 3.0;
  return dLat;
}

function transformLng(lng, lat) {
  var pi = 3.14159265358979324;
  var a = 6378245.0;
  var ee = 0.00669342162296594323;
  var dLng = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
  dLng += ((20.0 * Math.sin(6.0 * lng * pi) + 20.0 * Math.sin(2.0 * lng * pi)) * 2.0) / 3.0;
  dLng += ((20.0 * Math.sin(lng * pi) + 40.0 * Math.sin((lng / 3.0) * pi)) * 2.0) / 3.0;
  dLng += ((150.0 * Math.sin((lng / 12.0) * pi) + 300.0 * Math.sin((lng / 30.0) * pi)) * 2.0) / 3.0;
  return dLng;
}

export function wgs84togcj02(longitude, latitude) {
  var lng = parseFloat(longitude);
  var lat = parseFloat(latitude);
  var a = 6378245.0;
  var ee = 0.00669342162296594323;
  var pi = 3.14159265358979324;
  var dLat = transformLat(lng - 105.0, lat - 35.0);
  var dLng = transformLng(lng - 105.0, lat - 35.0);
  var radLat = (lat / 180.0) * pi;
  var magic = Math.sin(radLat);
  magic = 1 - ee * magic * magic;
  var sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180.0) / (((a * (1 - ee)) / (magic * sqrtMagic)) * pi);
  dLng = (dLng * 180.0) / ((a / sqrtMagic) * Math.cos(radLat) * pi);
  var mgLat = lat + dLat;
  var mgLng = lng + dLng;
  return [mgLng, mgLat];
}

export const getValueStyle = data => {
  const item = Object.assign({}, data);
  let type = item.type;
  let { valuecolor = '#151515', valuesize = '0', valuestyle = '0000' } = item.advancedSetting || {};
  if (item.type === 30) {
    valuecolor = _.get(item, 'sourceControl.advancedSetting.valuecolor') || '#151515';
    valuesize = _.get(item, 'sourceControl.advancedSetting.valuesize') || '0';
    valuestyle = _.get(item, 'sourceControl.advancedSetting.valuestyle') || '0000';
    type = _.get(item, 'sourceControl.type');
  }
  return canSetWidgetStyle({ ...data, type })
    ? {
        type,
        isTextArea: item.type === 2 && item.enumDefault !== 2, // 多行、加单行line-height: 1.5,单行计算
        height: valuesize !== '0' ? (parseInt(valuesize) - 1) * 2 + 40 : 36,
        size: TITLE_SIZE_OPTIONS[valuesize],
        valueStyle: isEmptyValue(item.value) ? '' : `color: ${valuecolor} !important;${getTitleStyle(valuestyle)}`,
      }
    : { type };
};

export function getControlStyles(controls) {
  return controls
    .filter(c => canSetWidgetStyle({ ...c, type: c.type === 30 ? c.sourceControlType : c.type }))
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

function parseCardStyle(control, value, type) {
  try {
    const parsedValue = safeParse(value);
    return {
      ...getValueStyle({
        ...control,
        type: 3,
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

/**
 * 获取标题字段文本
 * @param  {} controls 所有控件
 * @param  {} data 控件所在记录数据[可选]
 */
export function getTitleTextFromControls(controls, data, titleSourceControlType, options = {}) {
  let titleControl = _.find(controls, control => control.attribute === 1) || {};
  if (titleSourceControlType) {
    titleControl.sourceControlType = titleSourceControlType;
  }
  if (titleControl && data) {
    titleControl = Object.assign({}, titleControl, { value: data[titleControl.controlId] || data.titleValue });
  }
  return titleControl ? renderText(titleControl, options) || _l('未命名') : _l('未命名');
}

/**
 * 从关联记录字段获取标题字段文本
 * @param  {} controls 所有控件
 * @param  {} data 控件所在记录数据[可选]
 */
export function getTitleTextFromRelateControl(control = {}, data, options = {}) {
  let newTitleControlId = control.advancedSetting.showtitleid;
  if (control.type === 51 && control.enumDefault === 1 && control.showControls[0]) {
    newTitleControlId = control.showControls[0];
  }
  const matchedTitleControl = find(control.relationControls, { controlId: newTitleControlId });
  if (newTitleControlId && matchedTitleControl) {
    control = {
      ...control,
      ...(newTitleControlId
        ? {
            relationControls: control.relationControls.map(c => ({
              ...c,
              attribute: newTitleControlId === c.controlId ? 1 : 0,
            })),
          }
        : {}),
    };
  }

  if (data && data.name) {
    return data.name;
  }
  // relationControls返回的选项没有options，在这里赋进去
  if (_.includes([9, 10, 11], control.sourceControlType)) {
    if (!_.isEmpty(control.options)) {
      control.relationControls.forEach(c => {
        if (c.attribute === 1 && isEmpty(c.options)) {
          c.options = control.options;
        }
      });
    }
  }
  return getTitleTextFromControls(control.relationControls, data, control.sourceControlType, options);
}

export function renderText(cell, options = {}) {
  try {
    if (!cell) {
      return '';
    }
    if (cell.controlId === 'rowid' && !/^\w{8}(-\w{4}){3}-\w{12}$/.test(cell.value)) {
      return '';
    }
    let { type, value = '', unit, advancedSetting = {} } = cell;
    let { suffix = '', prefix = '', thousandth } = advancedSetting;
    let selectedOptions = [];
    let parsedData;

    // 公式函数
    if (type === 53) {
      type = cell.enumDefault2;
    }

    if (type === 8 && _.includes(['1', '2'], advancedSetting.showformat)) {
      const { currencycode, symbol } = safeParse(advancedSetting.currency || '{}');
      suffix = '';
      prefix = advancedSetting.showformat === '1' ? symbol : currencycode;
    }
    if (options.noUnit) {
      unit = '';
      suffix = '';
      prefix = '';
    }
    if (value === '' || value === null) {
      return '';
    }
    if (!checkIsTextControl(cell) && cell.value === '已删除') {
      // 处理关联已删除，非文本作为标题时卡片标题显示异常问题
      return _l('已删除');
    }
    if (type === 37) {
      if (cell.advancedSetting && cell.advancedSetting.summaryresult === '1') {
        type = 2;
        value = Math.round(parseFloat(cell.value) * 100) + '%';
      } else {
        if (_.includes([15, 16], cell.enumDefault2) && _.includes([2, 3], cell.enumDefault)) {
          cell.advancedSetting = { ...advancedSetting, showtype: cell.unit };
        }
        type = cell.enumDefault2 || 6;
      }
    }
    if (_.includes([6, 31, 37], type) && cell.advancedSetting && cell.advancedSetting.numshow === '1' && value) {
      value = accMul(value, 100);
    }
    if (cell.controlId === 'wfftime') {
      return formatFormulaDate({ value: cell.value, unit: '1' }).replace(/^-/, _l('已超时'));
    }

    switch (type) {
      // 纯文本
      case 2: // TEXTAREA_INPUT 文本
      case 4: // 座机
      case 5: // EMAIL_INPUT 邮件地址
      case 7: // CRED_INPUT 身份证
      case 25: // MONEY_CN 大写金额
      case 33: // AUTOID 自动编号
      case 37: // SUBTOTAL 汇总 TODO
      case 49: // API 查询
      case 50: // API 查询
        value = cell.enumDefault === 0 || cell.enumDefault === 2 ? (value || '').replace(/\r\n|\n/g, ' ') : value;
        break;
      case 3: // PHONE_NUMBER 手机号码
        value = cell.enumDefault === 1 ? value.replace(/\+86/, '') : value;
        break;
      case 19: // AREA_INPUT 地区
      case 23: // AREA_INPUT 地区
      case 24: // AREA_INPUT 地区
        try {
          parsedData = JSON.parse(value);
        } catch (err) {
          value = '';
        }
        value = parsedData.name;
        break;
      /**
       * 文本 + 单位
       * */
      case 6: // NUMBER_INPUT 数值
      case 8: // MONEY_AMOUNT 金额
      case 31: // NEW_FORMULA 公式
        value = _.isUndefined(cell.dot) ? value : toFixed(value, cell.dot);
        if (!options.noSplit) {
          if (
            cell.type !== 6
              ? thousandth !== '1'
              : _.isUndefined(thousandth)
                ? cell.enumDefault !== 1
                : thousandth !== '1'
          ) {
            value = formatNumberThousand(value);
          }
        }
        // 兼容百分比进度没有百分比符号
        if ((cell.advancedSetting || {}).numshow === '1') {
          suffix = '%';
        }
        if (!options.noMask && _.includes([6, 8], type) && _.get(cell, 'advancedSetting.datamask') === '1') {
          value = dealMaskValue({ ...cell, value }) || value;
        }
        value = (prefix ? `${prefix} ` : '') + value + (unit ? ` ${unit}` : suffix ? ` ${suffix}` : '');
        break;
      case 15: // DATE_INPUT 日期
      case 16: // DATE_INPUT 日期时间
        if (_.isEmpty(value)) {
          value = '';
        }
        const showFormat = _.includes(['ctime', 'utime', 'dtime'], cell.controlId)
          ? 'YYYY-MM-DD HH:mm:ss'
          : getShowFormat(cell);
        const dateTime = type === 16 && !options.doNotHandleTimeZone ? dateConvertToUserZone(cell.value) : cell.value;
        value = ['partal_regtime', 'dtime'].includes(cell.controlId)
          ? createTimeSpan(dateTime)
          : getDateToEn(showFormat, dateTime, advancedSetting.showformat);
        break;
      case 46: // TIME 时间
        if (_.isEmpty(value)) {
          value = '';
        }
        const mode = cell.unit === '6' || cell.unit === '9' ? 'HH:mm:ss' : 'HH:mm';
        const tempValue = moment(value).year() ? moment(value).format(mode) : cell.value;
        value = moment(tempValue, 'HH:mm:ss').format(mode);
        break;
      case 38: // 日期公式
        if (_.isEmpty(value)) {
          value = '';
        }
        if (cell.enumDefault === 2) {
          const showFormat = getShowFormat({ advancedSetting: { ...advancedSetting, showtype: cell.unit || '1' } });
          const convertedTime = includes(showFormat, ':')
            ? dateConvertToUserZone(moment(cell.value, value.indexOf('-') > -1 ? undefined : showFormat))
            : moment(cell.value, value.indexOf('-') > -1 ? undefined : showFormat);
          value = moment(convertedTime).format(showFormat);
        } else {
          if (cell.advancedSetting.autocarry === '1') {
            value = (prefix ? `${prefix} ` : '') + formatFormulaDate({ value: cell.value, unit, dot: cell.dot });
          } else {
            const suffixValue = suffix || UNIT_TO_TEXT[unit] || '';
            value =
              (prefix ? `${prefix} ` : '') +
              toFixed(value, cell.dot) +
              (prefix ? '' : suffixValue ? ` ${suffixValue}` : '');
          }
        }
        break;
      case 17: // DATE_TIME_RANGE 时间段
      case 18: // DATE_TIME_RANGE 时间段
        if (value === '' || value === '["",""]') {
          value = '';
        }
        try {
          parsedData = JSON.parse(value);
        } catch (err) {
          value = '';
        }
        value = parsedData
          .map(time => (time ? moment(time).format(cell.type === 17 ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm') : ''))
          .join(' - ');
        break;
      case 10010: // REMARK 备注
      case 41: // RICH_TEXT 富文本
        value = domFilterHtmlScript(cell.value);
        break;
      case 40: // LOCATION 定位
        try {
          parsedData = JSON.parse(value) || {};
        } catch (err) {
          value = '';
        }
        value =
          _.isObject(parsedData) && (parsedData.title || parsedData.address)
            ? `${parsedData.title || ''} ${parsedData.address || ''}`
            : '';
        break;
      // 组件
      case 9: // OPTIONS 单选 平铺
      case 10: // MULTI_SELECT 多选
      case 11: // OPTIONS 单选 下拉
        selectedOptions = getSelectedOptions(cell.options, cell.value, cell);
        value = selectedOptions
          .map((option, index) => {
            if (option.key === 'other') {
              const otherValue = _.find(JSON.parse(cell.value || '[]'), i => i.includes(option.key));
              return otherValue === 'other' ? option.value : _.replace(otherValue, 'other:', '') || option.value;
            }
            return option.value;
          })
          .join(', ');
        break;
      case 26: // USER_PICKER 成员
        try {
          parsedData = JSON.parse(value);
        } catch (err) {
          value = '';
        }
        if (!_.isArray(parsedData)) {
          parsedData = [parsedData];
        }
        value = parsedData
          .filter(user => !!user)
          .map(user => user.fullname)
          .join('、');
        break;
      case 27: // GROUP_PICKER 部门
        try {
          parsedData = JSON.parse(cell.value);
        } catch (err) {
          value = '';
        }
        value = parsedData
          .map((department, index) => (department.departmentName ? department.departmentName : _l('该部门已删除')))
          .join('、');
        break;
      case 36: // SWITCH 检查框
        const itemnames = getSwitchItemNames(cell, { needDefault: true });
        const text = _.get(
          _.find(itemnames, i => i.key === value || parseFloat(i.key) === value),
          'value',
        );
        value = value === '1' || value === 1 ? text || _l('已选中') : '';
        break;
      case 14: // ATTACHMENT 附件
        try {
          parsedData = JSON.parse(value);
        } catch (err) {
          value = '';
        }
        value = parsedData.map(attachment => `${attachment.originalFilename + attachment.ext}`).join('、');
        break;
      case 35: // CASCADER 级联
        try {
          parsedData = JSON.parse(value);
        } catch (err) {
          parsedData = [];
        }
        if (!_.isArray(parsedData)) {
          parsedData = [];
        }
        value = parsedData.length ? parsedData[0].name : '';
        break;
      case 29: // RELATESHEET 关联表
        try {
          parsedData = JSON.parse(value);
        } catch (err) {
          parsedData = [];
        }
        if (!_.isArray(parsedData)) {
          parsedData = [];
        }
        if (cell.enumDefault === 1 || _.get(cell, 'sourceControl.controlId')) {
          value = parsedData
            .map(
              record =>
                renderText(_.assign({}, cell, { type: cell.sourceControlType || 2, value: record.name }), options) ||
                _l('未命名'),
            )
            .join('、');
        } else if (_.get(cell, 'advancedSetting.showtype') === '2') {
          value = cell.value;
        } else if (cell.enumDefault === 2 && cell.relationControls.length) {
          const titleControl = _.find(cell.relationControls, { controlId: cell.sourceControlId });
          if (titleControl) {
            value = parsedData
              .map(
                record =>
                  renderText(
                    _.assign({}, cell, { type: titleControl.sourceControlType || 2, value: record.name }),
                    options,
                  ) || _l('未命名'),
              )
              .join('、');
          }
        }
        break;
      case 30: // SHEETFIELD 他表字段
        value = renderText(
          _.assign({}, cell, {
            type: cell.sourceControlType || 2,
            advancedSetting: _.get(cell, 'sourceControl.advancedSetting') || {},
          }),
          options,
        );
        break;
      case 21: // RELATION 自由连接
        try {
          parsedData = JSON.parse(value);
        } catch (err) {
          value = '';
        }
        value = parsedData.map(relation => `[${RELATION_TYPE_NAME[relation.type]}]${relation.name}`).join('、');
        break;
      case 28: // SCORE 等级
        if (!cell.value) {
          value = '';
        }
        const itemNames = JSON.parse((cell.advancedSetting || {}).itemnames || '[]');
        value =
          _.get(
            _.find(itemNames, i => i.key === cell.value),
            'value',
          ) || _l('%0 级', parseInt(cell.value, 10));
        break;
      // case 42: // SIGNATURE 签名
      // case 43: // CASCADER 多级下拉
      case 32: // CONCATENATE 文本组合
        value = cell.value;
        break;
      case 48: // ORGROLE_PICKER 组织角色
        try {
          parsedData = JSON.parse(cell.value);
        } catch (err) {
          value = '';
        }
        value = parsedData
          .map((organize, index) => (organize.organizeName ? organize.organizeName : _l('该组织角色已删除')))
          .join('、');
        break;
      default:
        value = '';
    }
    // 小数点不补零
    if (_.get(cell, 'advancedSetting.dotformat') === '1') {
      value = formatStrZero(value);
    }
    // 走掩码 单行文本、数值、金额、手机、邮箱、证件
    if (
      !options.noMask &&
      ((type === 2 && cell.enumDefault === 2) || _.includes([3, 4, 5, 7], type)) &&
      _.get(cell, 'advancedSetting.datamask') === '1'
    ) {
      return dealMaskValue({ ...cell, value }) || value;
    }
    return value;
  } catch (err) {
    console.log(err);
    return '';
  }
}

// 判断选项颜色是否为浅色系
export const isLightColor = (color = '') => {
  const SPECIAL_DARK_COLORS = ['ff9300', 'fa8c16', '808080', '4caf50', 'fa8c16', '08c9c9', 'fad714', 'faad14'];

  return SPECIAL_DARK_COLORS.find(l => l === new TinyColor(color).toHex()) ? false : new TinyColor(color).isLight();
};

/**
 * control 当前字段
 * relateControl 被引用的金额字段
 * 金额转中文大写、繁体大写、英文大写
 */
export const formatNumberToWords = (control = {}, relateControl = {}) => {
  const value = relateControl.value || '';
  if (!value.toString()) return '';
  const { currency, currencynames } = relateControl.advancedSetting || {};
  const { currencycode, symbol } = safeParse(currency || '{}');
  const currencytype = getAdvanceSetting(control, 'currencytype');
  // 繁体前缀，主单位单复数、辅助单位单复数
  const { 0: zhTw, 1: pluralCode, 2: code, 3: subPluralCode, 4: subCode } = safeParse(currencynames || '{}') || {};
  const isSpecialArea = _.includes(['CNY', 'HKD', 'TWD', 'MOP'], currencycode);
  if (currencytype === 3) {
    const tempValue = nzh.hk.toMoney(parseFloat(value), { outSymbol: false });
    return (isSpecialArea ? zhTw || '' : '') + tempValue;
  } else if (currencytype === 1) {
    const toWords = new ToWords({
      localeCode: 'en-US',
      converterOptions: {
        currency: true,
        ignoreDecimal: false,
        ignoreZeroCurrency: false,
        doNotAddOnly: false,
        ...(currency
          ? {
              currencyOptions: {
                singular: code, // // 主货币（单数形式）
                plural: pluralCode, // 主货币（复数形式）
                symbol: symbol,
                fractionalUnit: {
                  singular: subCode, // 辅助货币（单数形式）
                  plural: subPluralCode, // 辅助货币（复数形式）
                  symbol: '',
                },
              },
            }
          : {}),
      },
    });
    const tempValue = toWords.convert(parseFloat(value));
    return tempValue ? 'SAY ' + tempValue.toLocaleUpperCase() : '';
  } else {
    return nzh.cn.toMoney(parseFloat(value), { outSymbol: false });
  }
};

// 获取地图配置
export const getMapConfig = () => {
  return md.global.Account.accountId ? md.global.Account.map : md.global.Config.DefaultMap;
};

// 数值转换
export const formatNumberFromInput = (value, pointReturnEmpty = true) => {
  value = (value || '')
    .replace('。', '.')
    .replace(/[^-\d.]/g, '')
    .replace(/^\./g, '')
    .replace(/^-/, '$#$')
    .replace(/-/g, '')
    .replace('$#$', '-')
    .replace(/^-\./, '-')
    .replace('.', '$#$')
    .replace(/\./g, '')
    .replace('$#$', '.');

  if (pointReturnEmpty && value === '.') {
    value = '';
  }
  return value;
};

/**
 * 是否是空值
 */
export const isEmptyValue = value => {
  return _.isUndefined(value) || _.isNull(value) || String(value).trim() === '';
};

/**
 * 数值千分位显示
 */
export const formatNumberThousand = value => {
  const content = (value || _.isNumber(value) ? value : '').toString();
  const reg = content.indexOf('.') > -1 ? /(\d{1,3})(?=(?:\d{3})+\.)/g : /(\d{1,3})(?=(?:\d{3})+$)/g;
  return content.replace(reg, '$1,');
};

/**
 * 解决 JavaScript 原生 toFixed 方法精度问题
 */
export function toFixed(num, dot = 0) {
  if (_.isObject(num) || _.isNaN(Number(num))) {
    console.error(num, '不是数字');
    return '';
  }
  if (dot === 0) {
    return String(Math.round(num));
  }
  if (dot < 0 || dot > 20) {
    return String(num);
  }
  const strOfNum = String(num);
  if (!/\./.test(strOfNum)) {
    return strOfNum + '.' + _.padEnd('', dot, '0');
  }
  const decimal = ((strOfNum.match(/\.(\d+)/) || '')[1] || '').length;
  if (decimal === dot) {
    return strOfNum;
  } else if (decimal < dot) {
    return strOfNum + _.padEnd('', dot - decimal, '0');
  } else {
    const isNegative = num < 0;
    if (isNegative) {
      num = Math.abs(num);
    }
    let data = String(Math.round(num * Math.pow(10, dot)));
    data = _.padStart(data, dot, '0');
    return (isNegative ? '-' : '') + Math.floor(data / Math.pow(10, dot)) + '.' + data.slice(-1 * dot);
  }
}

/**
 * 格式化数字字符串，去除无效的零，保留有效数字。
 * @param {string} str - 要格式化的字符串。
 * @returns {string} - 格式化后的字符串。
 */
export function formatStrZero(str = '') {
  const numStr = String(str).match(/[,\.\d]+/) || [''];
  const num = numStr[0].replace(/(?:\.0*|(\.\d+?)0+)$/, '$1');

  return String(str).replace(numStr[0], num);
}

// 获取advancedSetting属性转化为对象
export const getAdvanceSetting = (data, key) => {
  const setting = get(data, ['advancedSetting']) || {};
  if (!key) return setting;
  let value = get(setting, key);
  try {
    return JSON.parse(value);
  } catch (error) {
    return '';
  }
};

// 更新advancedSetting数据
export const handleAdvancedSettingChange = (data, obj) => {
  return {
    ...data,
    advancedSetting: update(data.advancedSetting || {}, { $apply: item => ({ ...item, ...obj }) }),
  };
};

export function formatAttachmentValue(value, isRecreate = false, isRelation = false) {
  const attachmentArr = JSON.parse(value || '[]');
  let attachmentValue = attachmentArr;

  if (attachmentArr.length) {
    attachmentValue = attachmentArr
      .filter(item => !item.refId)
      .map((item, index) => {
        let fileUrl = item.fileUrl || item.fileRealPath;
        const isLinkFile = item.ext === '.url';
        if (!fileUrl && item.filepath && item.filename) {
          fileUrl = `${item.filepath}${item.filename}`;
        }

        const url = isLinkFile ? {} : new URL(fileUrl);
        const urlPathNameArr = (url.pathname || '').split('/');
        const fileName = isLinkFile ? item.filename : (urlPathNameArr[urlPathNameArr.length - 1] || '').split('.')[0];
        let filePath = isLinkFile ? fileUrl : (url.pathname || '').slice(1).replace(fileName + item.ext, '');
        const IsLocal = md.global.Config.IsLocal;
        const host = RegExpValidator.fileIsPicture(item.ext)
          ? md.global.FileStoreConfig.pictureHost
          : md.global.FileStoreConfig.documentHost;
        let searchParams = '';
        let extAttr = {};

        if (IsLocal && isRecreate && (item.viewUrl || item.previewUrl)) {
          const filelink = new URL(host);
          filePath = filePath.replace(filelink.pathname.slice(1), '');
          searchParams = (item.viewUrl || item.previewUrl).match(/\?.*/)[0];
          isRelation && (extAttr = { ext: item.ext, previewUrl: item.previewUrl });
        }

        return {
          ...extAttr,
          fileID: item.fileId || item.fileID,
          fileSize: item.filesize,
          url: isLinkFile ? undefined : fileUrl + searchParams,
          viewUrl: isLinkFile ? undefined : fileUrl + searchParams,
          serverName: IsLocal && isRecreate ? host : url.origin + '/',
          filePath,
          fileName,
          fileExt: item.ext,
          originalFileName: item.originalFilename,
          key: uuidv4(),
          oldOriginalFileName: item.originalFilename,
          index,
        };
      });
  }

  return JSON.stringify({
    attachments: attachmentValue,
    knowledgeAtts: [],
    attachmentData: [],
  });
}

export const getSwitchItemNames = (data, { needDefault, isShow } = {}) => {
  const itemnames = getAdvanceSetting(data, 'itemnames') || [];
  const showtype = getAdvanceSetting(data, 'showtype');
  const defaultData = DEFAULT_TEXT[showtype];
  // 筛选按默认来
  if (isShow) {
    return (
      DEFAULT_TEXT[showtype] || [
        { key: '1', value: _l('选中') },
        { key: '0', value: _l('未选中') },
      ]
    );
  }

  // 需要兜底显示
  if (needDefault) {
    return defaultData.map(i => {
      const cur = _.find(itemnames, it => it.key === i.key);
      return _.get(cur, 'value') ? cur : i;
    });
  }

  // radio框必须要文案
  if (showtype === 2) {
    return itemnames.every(i => !!i.value) ? itemnames : defaultData;
  }

  return itemnames;
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

export const getButtonColor = (mainColor, showAsPrimary = true) => {
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
    borderColor = browserIsMobile() ? '#eee' : '#ddd';
  }
  return showAsPrimary
    ? {
        backgroundColor: mainColor || '#2196f3',
        border: `1px solid ${borderColor}`,
        color: fontColor,
      }
    : {
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        color: '#333',
      };
};

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
      content = renderText(control);
    }
  } catch (err) {}
  return content;
}

export function handleCopyControlText(control, tableId) {
  const content = getCopyControlText(control);
  window.tempCopyForSheetView = JSON.stringify({ type: 'text', value: content, controlType: control.type, tableId });
  copy(content);
}
