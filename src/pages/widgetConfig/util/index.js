import _, {
  get,
  keys,
  flatten,
  sortBy,
  omit,
  isEmpty,
  upperFirst,
  findIndex,
  isArray,
  isObject,
  includes,
} from 'lodash';
import update from 'immutability-helper';
import { navigateTo } from 'src/router/navigateTo';
import { WHOLE_SIZE } from '../config/Drag';
import { NOT_AS_TITLE_CONTROL } from '../config';
import { RELATION_OPTIONS, DEFAULT_TEXT } from '../config/setting';
import { compose } from 'redux';
import { DEFAULT_CONFIG, DEFAULT_DATA, WIDGETS_TO_API_TYPE_ENUM, SYS_CONTROLS } from '../config/widget';
import { getCurrentRowSize } from './widgets';
import { browserIsMobile } from 'src/util';
import { parseDataSource } from './setting';

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

export const enumWidgetType = enumObj({ ...WIDGETS_TO_API_TYPE_ENUM });

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

// 根据标签页归类
export const putControlBySection = controls => {
  let result = [];

  controls.forEach(item => {
    if (item.type === 52) {
      item.relationControls = controls.filter(i => i.sectionId === item.controlId);
    }

    // 有sectionId,但是标签页被删除，按普通字段呈现
    if (!item.sectionId || (item.sectionId && !_.find(controls, c => c.controlId === item.sectionId))) {
      result.push({ ...item, sectionId: '' });
    }
  });
  return result;
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

export const dealControlData = (controls = []) => {
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

// 矫正数据row、col与呈现不一致的情况，有些表老数据有问题
const replaceRowWithControls = widgets => {
  const { commonWidgets = [], tabWidgets = [] } = getSectionWidgets(widgets);
  const flattenTabs = [];
  tabWidgets.map(item => {
    flattenTabs.push([item]);
    const childWidgets = putControlByOrder(item.relationControls || []);
    if (childWidgets.length > 0) {
      flattenTabs.push(...childWidgets);
    }
  });
  const newWidgets = commonWidgets.concat(flattenTabs.filter(_.identity));
  return genWidgetRowAndCol(newWidgets);
};

export const genWidgetsByControls = (controls = []) => {
  /**
   * 依次处理数据
   */
  const newControls = compose(putControlByOrder, dealControlData, replaceHalfWithSizeControls)(controls);
  return replaceRowWithControls(newControls);
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
  return !includes(NOT_AS_TITLE_CONTROL, type);
};

export function genWidgetRowAndCol(widgets) {
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

export const getRelationText = enumDefault => {
  return (
    _.get(
      _.find(RELATION_OPTIONS, i => i.value === enumDefault && enumDefault),
      'text',
    ) || _l('自由连接')
  );
};

export const filterOnlyShowField = (controls = []) => {
  return controls.filter(i => !((i.type === 30 || i.originType === 30) && (i.strDefault || '')[0] === '1'));
};

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

export const levelSafeParse = value => {
  let levelValue = parseFloat(value, 10);
  if (!_.isNumber(levelValue) || _.isNaN(levelValue)) {
    levelValue = undefined;
  }
  return levelValue;
};

export const isOtherShowFeild = (control = {}) => {
  return (control.type === 30 || control.originType === 30) && (control.strDefault || '')[0] === '1';
};

export const formatSearchConfigs = res => {
  if (!(res.queries || []).length) return [];
  return res.queries.map(item => {
    return { ...item, templates: [{ controls: (res.templates || {})[item.sourceId] || [] }] };
  });
};

export const getRgbaByColor = (color, alpha) => {
  let sColorChange = [];
  for (let i = 1; i < 7; i += 2) {
    sColorChange.push(parseInt(`0x${color.slice(i, i + 2)}`));
  }
  return `rgba(${sColorChange.join(',')},${alpha})`;
};

// 支持左右布局的控件
export const supportDisplayRow = item => {
  // 附件、单条关联记录、多条关联记录（列表、卡片）、子表、分割线、备注、分段
  if (browserIsMobile()) {
    return (
      !includes([14, 29, 34, 22, 51, 52], item.type) ||
      ((item.type === 29 || item.type === 51) && _.get(item, 'advancedSetting.showtype') === '3')
    );
  }
  // 多条关联记录（列表）、查询记录列表、子表、分割线、备注
  return (
    ((item.type === 29 || item.type === 51) && _.get(item, 'advancedSetting.showtype') !== '2') ||
    !includes([29, 34, 22, 51, 52], item.type)
  );
};

// 关联记录、关联查询须过滤的字段
export const getFilterRelateControls = (controls = [], showControls = []) => {
  const filterIds = [22, 43, 45, 47, 49, 51, 52, ...SYS_CONTROLS];
  return _.filter(controls, item => !_.includes(filterIds, item.type) || _.includes(showControls, item.controlId));
};

// 按标签页显示的控件
export const relateOrSectionTab = (data = {}) => {
  return (includes([29, 51], data.type) && get(data, 'advancedSetting.showtype') === '2') || data.type === 52;
};

// 需要固定在底部的控件
export const fixedBottomWidgets = data => {
  return data.type === 52;
};

// 获取标签页等控件与普通控件的分界位置
export const getBoundRowByTab = widgets => {
  for (var i = 0; i < widgets.length; i++) {
    const row = widgets[i];
    for (var j = 0; j < row.length; j++) {
      const item = widgets[i][j];
      if (fixedBottomWidgets(item)) return i;
    }
  }
  return -1;
};

//将widgets分成普通和标签页，分别单独渲染
export const getSectionWidgets = widgets => {
  // 新建的没有row、col,重设一遍，防止重排出错
  const dealRowAndCol = genWidgetRowAndCol(widgets);
  const flattenWidgets = putControlBySection(flatten(dealRowAndCol));
  let commonWidgets = [];
  let tabWidgets = [];

  flattenWidgets.map(i => {
    if (_.get(i, 'type') === 52) {
      tabWidgets.push(i);
    } else {
      commonWidgets.push(i);
    }
  });

  tabWidgets = tabWidgets.sort((a, b) => {
    return a.row - b.row;
  });
  return { commonWidgets: putControlByOrder(commonWidgets), tabWidgets };
};

// 搜索忽略大小写
export function SearchFn(keywords = '', value = '') {
  return value.search(new RegExp(keywords.trim().replace(/([,.+?:()*\[\]^$|{}\\-])/g, '\\$1'), 'i')) !== -1;
}

// 汇总是否显示单位及小数点配置
export const isShowUnitConfig = (data = {}, selectedControl = {}) => {
  const { enumDefault, enumDefault2 } = data;
  // 如果是日期格式汇总 不显示
  if ([2, 3].includes(enumDefault) && [15, 16, 46].includes(enumDefault2)) return false;
  // 选择日期汇总字段
  if (selectedControl.type === 37) {
    if ([2, 3].includes(enumDefault) && [15, 16, 46].includes(selectedControl.enumDefault2)) return false;
  }
  return true;
};

export const supportSettingCollapse = props => {
  const { data = {}, allControls = [] } = props;
  const { dataSource, sourceControlId, type, advancedSetting = {} } = data;

  switch (type) {
    case 10:
      return !(dataSource && advancedSetting.checktype === '0');
    case 9:
    case 11:
      return !(dataSource && _.includes(['1', '2'], advancedSetting.showtype));
    case 37:
      const parsedDataSource = parseDataSource(dataSource);
      const { relationControls = [] } = getControlByControlId(allControls, parsedDataSource);
      const selectedControl = getControlByControlId(relationControls, sourceControlId);
      return isShowUnitConfig(data, selectedControl);
  }
};
