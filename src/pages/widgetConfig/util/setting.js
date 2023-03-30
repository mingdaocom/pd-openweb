import update from 'immutability-helper';
import _, { isString, includes, get, isEmpty, isArray, head, find } from 'lodash';
import { Parser } from 'hot-formula-parser';
import { DISPLAY_TYPE, DATE_SHOW_TYPES } from '../config/setting';
import { v4 as uuidv4 } from 'uuid';
import { isFullLineControl, getRowById } from './widgets';
import { getControlByControlId } from '.';
import { NO_CONTENT_CONTROL, MAX_CONTROLS_COUNT, NOT_HAVE_WIDTH_CONFIG } from '../config';
import { SYSTEM_CONTROLS } from 'src/pages/worksheet/constants/enum';

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

export const getControlsSorts = (data, controls) => {
  const { controlssorts = '[]' } = getAdvanceSetting(data);
  const defaultSorts = controls.map(item => item.controlId);
  try {
    let parsedSorts = JSON.parse(controlssorts);
    if (_.isEmpty(parsedSorts)) return defaultSorts;
    return parsedSorts;
  } catch (error) {
    return defaultSorts;
  }
};

// 默认取标题控件 和 前三个控件
export const getDefaultShowControls = allControls => {
  if (allControls.length <= 3) return allControls.map(({ controlId }) => controlId);
  const titleControlIndex = _.findIndex(allControls, item => item.attribute === 1);
  if (titleControlIndex <= 3) return allControls.slice(0, 4).map(({ controlId }) => controlId);
  return allControls
    .slice(0, 3)
    .concat(allControls[titleControlIndex])
    .map(({ controlId }) => controlId);
};

export const parseDataSource = dataSource => {
  if (!isString(dataSource) || !dataSource) return '';
  if (includes(dataSource, '$')) return dataSource.slice(1, -1);
  return dataSource;
};

export const filterByTypeAndSheetFieldType = (controls = [], filter) => {
  return controls
    .filter(item => {
      if (item.type === 30) return filter(item.sourceControlType);
      return filter(item.type);
    })
    .map(item => ({ ...item, type: item.type === 30 ? item.sourceControlType : item.type }));
};

// 获取关联表显示方式
export const getDisplayType = ({ from, type }) => {
  if (type === 2 && from !== 'subList') {
    return [
      {
        key: 'list',
        text: _l('列表'),
        value: '2',
      },
      ...DISPLAY_TYPE,
    ];
  }
  return DISPLAY_TYPE;
};

export const updateConfig = ({ config = '', value, index } = {}) => {
  const arrConfig = config.split('');
  return update(arrConfig, { $splice: [[index, 1, value]] }).join('');
};

export const isSingleRelateSheet = data => data.type === 29 && data.enumDefault === 1;

export const adjustWidthList = (widgets, data) => {
  const { row } = getRowById(widgets, data.controlId);
  if (!row) return [];
  switch (row.length) {
    // 单行1列调整宽度
    case 1:
      return [3, 4, 6, 8, 9, 12];
    // 单行2列调整宽度
    case 2:
      return [3, 4, 6, 8, 9];
    // 单行3列调整宽度
    case 3:
      return [4, 6];
    default:
      return [];
  }
};

// 是否可以进行宽度调整
export const canAdjustWidth = (widgets, data = {}) => {
  const { type, controlId, sourceControl } = data;
  if (NOT_HAVE_WIDTH_CONFIG.includes(type)) return false;
  const { row } = getRowById(widgets, controlId);
  if (!row) return false;

  /**
   * 他表字段关联的显示字段如果是整行控件则此控件不能调整宽度
   */
  if (type === 30) return !isFullLineControl(sourceControl);

  if (isFullLineControl(data) || row.length === 4) return false;
  return true;
};

// 是否是正常配置
export const isValidConfig = data => {
  const { type, dataSource, sourceControlId } = data;
  if (type === 30) {
    return !!sourceControlId;
  }
  if (type === 31) {
    return !!dataSource;
  }
  // 文本组合、汇总
  if (includes([32, 37], type)) {
    return !!dataSource;
  }
  return true;
};

// 获取校验信息
export const getVerifyInfo = (data, { controls }) => {
  const { type, dataSource, enumDefault, sourceControlId, advancedSetting = {} } = data;
  let isValid = true;
  if (type === 30) {
    if (!sourceControlId) {
      return { text: _l('没有配置显示字段'), isValid: false };
    }
  }
  if (type === 31) {
    if (!dataSource) {
      return { text: _l('没有配置计算控件'), isValid: false };
    }
    const quoteIds = (dataSource.match(/\$(\w+)\$/g) || []).map(item => item.replace(/\$/g, ''));
    if (!isEmpty(quoteIds) && quoteIds.some(id => isEmpty(getControlByControlId(controls, id)))) {
      return { text: _l('存在已删除的字段'), isValid: false };
    }
    // 自定义计算
    if (enumDefault === 1) {
      const parser = new Parser();
      // 替换controlId及最后一个括号前的逗号
      const replaceValue = value => {
        return value.replace(/\$(.+?)\$/g, () => ` ${_.uniqueId()} `).replace(/,(?=\))/g, '');
      };
      const res = parser.parse(replaceValue(dataSource));
      if (res.error) {
        return { text: _l('自定义公式有语法错误'), isValid: false };
      }
    }
  }
  // 文本组合、汇总
  if (includes([32, 37], type)) {
    if (!dataSource) {
      return { text: _l('没有配置字段'), isValid: false };
    }
  }
  if (type === 43) {
    const ocrMap = getAdvanceSetting(data, 'ocrmap') || [];
    if (ocrMap.length < 1) {
      return { isValid: false, text: _l('没有配置映射字段') };
    }
  }
  if (type === 47) {
    const { enumDefault, enumDefault2, dataSource } = data;
    if (((enumDefault === 1 || enumDefault2 === 3) && !dataSource) || (enumDefault === 2 && enumDefault2 === 0)) {
      return { isValid: false, text: _l('没有配置数据源') };
    }
  }
  if (includes([49, 50], type)) {
    if (!dataSource) {
      return { isValid: false, text: _l('没有选择查询模版') };
    }
    if (type === 50 && (!advancedSetting.itemsource || !advancedSetting.itemtitle)) {
      return { isValid: false, text: _l('有必填项未配置') };
    }
  }
  return { isValid };
};

// 自动编号可选控件
export const isAutoNumberSelectableControl = item => {
  const types = [2, 9, 10, 11, 15, 16, 19, 23, 24, 46];
  return types.includes(item.type);
};

/**
 * 超出控件最大数量
 * 控件数量200以内
 * @param {*} controls
 */
export const isExceedMaxControlLimit = (controls = []) => {
  const existedControls = controls.filter(item => !NO_CONTENT_CONTROL.includes(item.type)) || [];
  if (existedControls.length >= MAX_CONTROLS_COUNT) {
    alert(_l('表单中添加字段数量已达上限（%0个)', MAX_CONTROLS_COUNT));
    return true;
  }
  return false;
};

// 获取可用的option
export const getOptions = data => (data.options || []).filter(item => !item.isDeleted);

export const getShowControls = (controls = [], showControls = []) => {
  // 删除掉showControls 中已经被删掉的控件
  const allControlId = controls.concat(SYSTEM_CONTROLS).map(item => item.controlId);
  return showControls
    .map(id => {
      if (!allControlId.includes(id)) return '';
      return id;
    })
    .filter(item => !isEmpty(item));
};

export const getDefaultOptions = () => {
  return [
    { key: uuidv4(), value: _l('选项1'), isDeleted: false, index: 1, checked: true, color: '#C9E6FC' },
    { key: uuidv4(), value: _l('选项2'), isDeleted: false, index: 2, checked: false, color: '#C3F2F2' },
    { key: uuidv4(), value: _l('选项3'), isDeleted: false, index: 3, checked: false, color: '#00C345' },
  ];
};

export const getDefaultCheckedOption = options => {
  if (isEmpty(options)) return '';
  return JSON.stringify([head(options).key]);
};

export const genDefaultOptionsAndChecked = () => {
  const defaultOptions = getDefaultOptions();
  return { options: defaultOptions, default: getDefaultCheckedOption(defaultOptions) };
};

export const parseOptionValue = value => {
  if (isArray(value)) return value;
  try {
    if (value && typeof value === 'string') {
      return JSON.parse(value);
    }
    return [];
  } catch (error) {
    return [];
  }
};

export const getSortControls = (data, controls) => {
  const sorts = getControlsSorts(data, controls);
  return sorts.map(id => find(controls, item => item.controlId === id));
};

export const getDatePickerConfigs = data => {
  const showType = getAdvanceSetting(data, 'showtype');

  switch (showType) {
    // 年月日时分
    case 1:
      return {
        mode: 'datetime',
        formatMode: 'YYYY-MM-DD HH:mm',
      };
    // 年月日时
    case 2:
      return {
        mode: 'datetime',
        formatMode: 'YYYY-MM-DD HH',
        showMinute: false,
      };
    // 年月日
    case 3:
      return {
        mode: 'date',
        formatMode: 'YYYY-MM-DD',
      };
    // 年月
    case 4:
      return {
        mode: 'month',
        formatMode: 'YYYY-MM',
      };
    // 年
    case 5:
      return {
        mode: 'year',
        formatMode: 'YYYY',
      };
    // 年月日时分秒
    case 6:
      return {
        mode: 'datetime',
        formatMode: 'YYYY-MM-DD HH:mm:ss',
        showSecond: true,
      };
    // 时分
    case 8:
      return {
        mode: 'time',
        formatMode: 'HH:mm',
        showSecond: true,
      };
    // 时分秒
    case 9:
      return {
        mode: 'time',
        formatMode: 'HH:mm:ss',
        showSecond: true,
      };
    default:
      return data.type === 16
        ? { mode: 'datetime', formatMode: 'YYYY-MM-DD HH:mm' }
        : { mode: 'date', formatMode: 'YYYY-MM-DD' };
  }
};

export const getShowFormat = data => {
  const { formatMode, mode } = getDatePickerConfigs(data);
  const { advancedSetting: { showformat = '0' } = {} } = data;
  const showType = _.get(
    _.find(DATE_SHOW_TYPES, i => i.value === showformat),
    'format',
  );
  if (mode === 'year') {
    return showformat === '1' ? _l('YYYY年') : formatMode;
  }
  // 年月需要特殊处理
  if (mode === 'month') {
    return showformat === '1' ? _l('YYYY年M月') : _.includes(['2', '3'], showformat) ? 'M/YYYY' : formatMode;
  }
  return formatMode.replace('YYYY-MM-DD', showType);
};
