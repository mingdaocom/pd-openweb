import { checkOptionsRepeat, getControlByControlId } from '.';
import { Parser } from 'hot-formula-parser';
import update from 'immutability-helper';
import _, { find, get, head, includes, isArray, isEmpty, isString } from 'lodash';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { SYSTEM_CONTROLS } from 'src/pages/worksheet/constants/enum';
import { HAVE_VALUE_STYLE_WIDGET, MAX_CONTROLS_COUNT, NO_CONTENT_CONTROL, NOT_HAVE_WIDTH_CONFIG } from '../config';
import { DATE_SHOW_TYPES, DISPLAY_TYPE, TITLE_STYLE_OPTIONS } from '../config/setting';
import { getRowById, isFullLineControl } from './widgets';

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

export const getControlsSorts = (data, controls, key = 'controlssorts') => {
  const parsedSorts = getAdvanceSetting(data, [key]) || [];
  const defaultSorts = controls.map(item => item.controlId);
  try {
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
        text: _l('表格（旧）'),
        value: '2',
        disabled: true,
      },
      ...DISPLAY_TYPE,
      {
        key: 'embed_list',
        text: _l('表格'),
        value: '5',
      },
      {
        key: 'tab_list',
        text: _l('标签页表格'),
        value: '6',
      },
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
  const { type, controlId, sourceControl, enumDefault } = data;
  if (NOT_HAVE_WIDTH_CONFIG.includes(type)) return false;
  // 嵌入视图没有宽度设置
  if (type === 45 && enumDefault === 3) return false;

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
    if (ocrMap.length < 1 && advancedSetting.ocrapitype !== '1') {
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
  if (type === 6 && advancedSetting.showtype === '3' && !advancedSetting.numinterval) {
    return { isValid: false, text: _l('未配置步长') };
  }
  if (_.includes([9, 10, 11], type) && checkOptionsRepeat([data], false)) {
    return { isValid: false, text: _l('存在重复选项') };
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
export const isExceedMaxControlLimit = (controls = [], addCount = 0) => {
  const existedControls = controls.filter(item => !NO_CONTENT_CONTROL.includes(item.type)) || [];
  if (existedControls.length + addCount > MAX_CONTROLS_COUNT) {
    alert(_l('表单中添加字段数量已达上限（%0个)', MAX_CONTROLS_COUNT), 3);
    return true;
  }
  return false;
};

// 获取可用的option
export const getOptions = data => (data.options || []).filter(item => !item.isDeleted);

export const getShowControls = (controls = [], showControls = []) => {
  // 删除掉showControls 中已经被删掉的控件
  const allControlId = controls
    .filter(i => !_.includes([51], i.type))
    .concat(SYSTEM_CONTROLS)
    .map(item => item.controlId);
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

export const getDatePickerConfigs = (data = {}) => {
  let showType = getAdvanceSetting(data, 'showtype');

  if (data.originType === 38 || data.type === 38) {
    showType = data.unit;
  }

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
  const { advancedSetting: { showformat = '0' } = {}, type } = data;
  const isCustomFormat = _.isNaN(Number(showformat));
  const showType = isCustomFormat
    ? showformat.replace(/#EN#$/g, '')
    : _.get(
        _.find(DATE_SHOW_TYPES, i => i.value === showformat),
        'format',
      );
  if (mode === 'year') {
    const yearShowType = _.get(showType.match(/(\y|Y)+[年]{0,1}/), '0');
    return showformat === '1' ? _l('YYYY年') : yearShowType || formatMode;
  }
  // 年月需要特殊处理
  if (mode === 'month') {
    if (showformat === '1') return _l('YYYY年M月');
    if (_.includes(['2', '3'], showformat)) return 'M/YYYY';
    if (showformat === '4') return 'YYYY/M';
    const yearMonthShowType = _.get(showType.match(/((\y|Y|M)+(\-|年|月|年\-|月\-){0,1}(M|\y|Y)+(年|月){0,1})/), '0');
    return yearMonthShowType || formatMode;
  }
  const hasTime = /[H|h|m|s|S|Z]/.test(showType);

  return type === 16 && isCustomFormat && hasTime ? showType : formatMode.replace('YYYY-MM-DD', showType);
};

// 日期控件自定义格式语言环境处理
export const getDateToEn = (showformat = '', value, originShowFormat = '') => {
  const dealFormat = showformat.replace(/#EN#$/g, '');
  const customLang = showformat.indexOf('EN') > -1;
  const oldLocale = moment.locale();
  const isCustom = originShowFormat.indexOf('#EN#') > -1;
  if (customLang || isCustom) {
    moment.locale('en');
  }
  const result = value ? moment(value).format(dealFormat) : moment().format(dealFormat);
  moment.locale(oldLocale);
  return result;
};

// 计算矩阵选项均分多少份
export const getItemOptionWidth = (data, fromType) => {
  let itemWidth = 100;
  const options = getOptions(data);
  const displayWidth =
    fromType === 'public'
      ? (document.querySelector('.publicWorksheetForm .rowsWrap') || {}).clientWidth
      : (document.querySelector('#widgetDisplayWrap .rowsWrap') || {}).clientWidth;
  const widthSize = data.size / 12;
  const { direction = '2', width = '200' } = getAdvanceSetting(data);
  if (displayWidth && direction === '0') {
    // padding: 8
    const boxWidth = (displayWidth - 8 * 2) * widthSize;
    // padding: 12, border: 2
    const optionsWidth = boxWidth - 14 * 2;
    const num = Math.floor(optionsWidth / Number(width)) || 1;
    itemWidth = 100 / (num > options.length ? options.length : num);
  }
  return itemWidth;
};

// 标题样式
export const getTitleStyle = (titleStyle = '0000') => {
  const [isBold, isItalic, isUnderline, isLineThrough] = titleStyle.split('');
  let styleText = '';
  if (Number(isBold)) {
    styleText = styleText + 'font-weight: bold !important;';
  }
  if (Number(isItalic)) {
    styleText = styleText + 'font-style: italic;padding-right:3px;';
  }
  if (Number(isUnderline)) {
    styleText = styleText + 'text-decoration: underline;';
  }
  if (Number(isLineThrough)) {
    styleText = styleText + 'text-decoration: line-through;';
  }
  if (Number(isUnderline) && Number(isLineThrough)) {
    styleText = styleText + 'text-decoration: underline line-through;';
  }
  return styleText;
};

// 不允许重复的控件
export const canAsUniqueWidget = item => {
  return (
    _.includes([3, 4, 5, 7], item.type) ||
    (item.type === 2 && item.enumDefault !== 3) ||
    (item.type === 29 && item.enumDefault === 1) ||
    (_.includes([26, 27, 48], item.type) && item.enumDefault === 0)
  );
};

// 有字段值样式设置的控件
export const canSetWidgetStyle = (item = {}) => {
  const { type, enumDefault, showControls } = item;
  const { showtype } = getAdvanceSetting(item);
  return (
    _.includes(HAVE_VALUE_STYLE_WIDGET, type) ||
    (type === 2 && enumDefault !== 3) ||
    (type === 51 && (enumDefault === 1 ? showControls.length === 1 : showtype === '3'))
  );
};
