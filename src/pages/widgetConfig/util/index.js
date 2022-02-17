import { get, keys, flatten, sortBy, omit, isEmpty, upperFirst, findIndex, isArray, isObject } from 'lodash';
import update from 'immutability-helper';
import { navigateTo } from 'src/router/navigateTo';
import { WHOLE_SIZE } from '../config/Drag';
import { NOT_AS_TITLE_CONTROL } from '../config';
import { compose } from 'redux';
import { DEFAULT_CONFIG, DEFAULT_DATA, WIDGETS_TO_API_TYPE_ENUM } from '../config/widget';
import { getCurrentRowSize } from './widgets';

const FORMULA_FN_LIST = [
  'SUM',
  'AVG',
  'MIN',
  'MAX',
  'PRODUCT',
  'COUNTA',
  'ABS',
  'INT',
  'MOD',
  'ROUND',
  'ROUNDUP',
  'ROUNDDOWN',
];

export const enumObj = obj => {
  keys(obj).forEach(key => {
    obj[obj[key]] = key;
  });
  return obj;
};

export const enumWidgetType = enumObj(WIDGETS_TO_API_TYPE_ENUM);

/**
 * 导入本目录下所有组件
 * @param {*} r
 */
export const exportAll = r => {
  const componentConfig = {};
  r.keys().forEach(item => {
    const key = item.match(/\/(\w*)\./)[1];
    const component = r(item);
    const capitalKey = upperFirst(key);
    componentConfig[capitalKey] = component.default || component[key];
  });
  return componentConfig;
};

/**
 * 导出当前文件夹与控件对应的组件
 * 命名要保证大写之后与定义的控件类型相同
 * @param {*} r
 */
export const exportRelevantComponents = r => {
  const componentConfig = {};
  r.keys().forEach(item => {
    const key = item.match(/\/(\w*)\./)[1];
    const upperKey = key.toUpperCase();
    const component = r(item);
    componentConfig[upperKey] = component.default || component[key];
  });
  return componentConfig;
};

// 获取字段编辑页url参数
export const getUrlPara = () => {
  const search = new URLSearchParams(location.search);
  const para = {};
  for (var [key, value] of search) {
    para[key] = value;
  }
  return para;
};

/**
 *
 * @param {*} param0 工作表Id
 * @param {*} isOpenNew 是否新开页打开
 */
export const toEditWidgetPage = (paras, isOpenNew = true) => {
  let url = '/worksheet/field/edit';

  const searchPara = Object.keys(paras).reduce((prev, key) => {
    return (prev += `${prev ? '&' : ''}${key}=${encodeURIComponent(paras[key])}`);
  }, '');

  url = searchPara ? `${url}?${searchPara}` : url;

  if (isOpenNew) {
    window.open(url);
  } else {
    navigateTo(url);
  }
};
export const getDefaultSizeByType = type => {
  if (typeof type === 'number') {
    type = enumWidgetType[type];
  }
  return get(DEFAULT_DATA[type], 'size');
};

export const getDefaultSizeByData = data => {
  const { type, sourceControl } = data;
  // 他表字段使用关联显示控件的size
  if (type === 30) return sourceControl ? getDefaultSizeByType(sourceControl.type) : WHOLE_SIZE / 2;
  return getDefaultSizeByType(type);
};

// 按顺序将控件摆放在二维数组中
export const putControlByOrder = controls => {
  const obj = {};
  let maxRow = 0;
  let cacheData = [];

  // 按照row排序
  controls.forEach(item => {
    if (!item.size) item = { ...item, size: getDefaultSizeByData(item) };
    const { row, col } = item;
    if (isEmpty(obj[row])) {
      obj[row] = [item];
    } else {
      // 兼容row相同控件排列问题
      if (getCurrentRowSize(obj[row]) + item.size > WHOLE_SIZE) {
        cacheData.push(item);
      } else {
        obj[row] = update(obj[row], { $splice: [[col, 0, item]] });
      }
    }

    if (row > maxRow) {
      maxRow = row;
    }
  });

  cacheData.forEach((item, i) => {
    obj[maxRow + i + 1] = [item];
  });

  return keys(obj)
    .sort((a, b) => +a - +b)
    .map(key => {
      // 每一行里按照col排序
      const row = obj[key];
      return sortBy(row, 'col');
    });
};

export const dealControlData = controls => {
  return controls.map(item => {
    const { type } = item;
    // 子表控件递归处理其中的控件
    if (type === 34) {
      return { ...item, relationControls: dealControlData(item.relationControls) };
    }
    if (type === 31) {
      const fnReg = new RegExp(`c(?=[${FORMULA_FN_LIST.join('|')}])`, 'g');
      return update(item, {
        dataSource: { $apply: dataSource => dataSource.replace(/AVG/g, 'AVERAGE').replace(fnReg, '') },
      });
    }
    return item;
  });
};

// 将旧数据中的half替换为size,且去掉half
export const replaceHalfWithSizeControls = controls =>
  controls.map(item => {
    if (typeof item.half === 'boolean') {
      const size = item.size || (item.half ? WHOLE_SIZE / 2 : WHOLE_SIZE);
      return { ...omit(item, 'half'), size };
    }
    return omit(item, 'half');
  });

export const genWidgetsByControls = (controls = []) => {
  /**
   * 依次处理数据
   */
  return compose(putControlByOrder, dealControlData, replaceHalfWithSizeControls)(controls);
};

export const resortControlByColRow = (controls = []) => {
  return _.flatten(putControlByOrder(controls));
};

// 能否作为标题控件
export const canSetAsTitle = data => {
  let { type } = data;
  if (type === 30) {
    if (data.sourceControl && data.sourceControl.type) {
      type = data.sourceControl.type;
    } else {
      return false;
    }
  }
  return !_.includes(NOT_AS_TITLE_CONTROL, type);
};

function genWidgetRowAndCol(widgets) {
  return widgets.map((rowItem, row) => rowItem.map((colItem, col) => ({ ...colItem, row, col })));
}

export const setDefaultTitle = controls => {
  if (controls.some(item => item.attribute === 1)) return controls;
  const canAsTitleIndex = findIndex(controls, item => canSetAsTitle(item));
  if (canAsTitleIndex > -1) {
    return update(controls, { [canAsTitleIndex]: { $apply: item => ({ ...item, attribute: 1 }) } });
  }
  return controls;
};

export const genControlsByWidgets = widgets => {
  return setDefaultTitle(flatten(genWidgetRowAndCol(widgets)));
};

// 将所有控件用给定数据重置
export const resetWidgets = (widgets, obj) => {
  return widgets.map(row => row.map(item => ({ ...item, ...obj })));
};

/**
 * 从当前表所有控件中获取满足规则的控件
 */
export const filterControlsFromAll = (allControls = [], filter = item => item) => {
  return allControls.filter(filter).map(({ controlId, controlName }) => ({ value: controlId, text: controlName }));
};

export const formatViewToDropdown = views => views.map(({ viewId, name }) => ({ text: name, value: viewId }));

export const formatAppsToDropdown = (apps, currentAppId) =>
  apps.map(({ appId, appName }) => ({
    text: appId === currentAppId ? `${appName}（ 本应用 ）` : `${appName}`,
    value: appId,
  }));

export const formatSheetsToDropdown = sheets =>
  sheets.map(({ worksheetId, name }) => ({ text: name, value: worksheetId }));

export const formatControlsToDropdown = controls =>
  controls.map(({ controlId, controlName }) => ({ text: controlName, value: controlId }));

export const getControlByControlId = (controls, controlId, key) => {
  const control = _.find(controls, item => item.controlId === controlId) || {};
  return key ? get(control, key) : control;
};

/**
 * 返回主页
 */
export const returnMasterPage = globalSheetInfo => {
  setTimeout(() => {
    const { fromURL } = getUrlPara();
    if (fromURL === 'newPage') {
      window.close();
      return;
    }
    if (fromURL) {
      navigateTo(decodeURIComponent(fromURL));
      return;
    }
    if (globalSheetInfo) {
      const { appId, groupId, worksheetId } = globalSheetInfo;
      if (!appId) {
        navigateTo(`/app`);
      } else {
        navigateTo(`/app/${appId}/${groupId}/${worksheetId}`);
      }
    }
  }, 300);
};

export const getWidgetInfo = type => {
  if (typeof type === 'number') {
    type = enumWidgetType[type];
  }
  return DEFAULT_CONFIG[type] || {};
};

export const getIconByType = type => {
  const { icon } = getWidgetInfo(type);
  return icon;
};

export const adjustControlSize = (row = [], data) => {
  const nextRow = row.concat(data);
  return { ...data, size: WHOLE_SIZE / nextRow.length };
};

export const getAdvanceSetting = (data, key) => {
  const setting = get(data, ['advancedSetting']) || {};
  if (!key) return setting;
  let value = get(setting, key);
  if (isArray(value) || isObject(value)) return value;
  try {
    return JSON.parse(value);
  } catch (error) {
    return '';
  }
};
