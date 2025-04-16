import _, { get, includes, isArray, isObject, isString } from 'lodash';
import { isEmptyValue } from 'src/util';
import { allSwitchKeys, DEFAULT_TEXT, HAVE_VALUE_STYLE_WIDGET } from '../../core/enum';
import { controlState } from '../../core/formUtils';
import { FIELD_SIZE_OPTIONS, TITLE_SIZE_OPTIONS } from './config';

export const getTabTypeBySelectUser = (control = {}) => {
  const { advancedSetting = {}, sourceControl = {}, controlId } = control;
  return _.includes(['caid', 'ownerid', 'daid'], controlId)
    ? 3
    : (advancedSetting.usertype || _.get(sourceControl.advancedSetting || {}, 'usertype')) === '2'
      ? 2
      : 1;
};

// 获取人员字段值
export const getUserValue = value => {
  if (!value) return [];
  if (_.isArray(value)) return value;
  if (value && typeof value === 'string') {
    const dealValue = JSON.parse(value);
    return _.isArray(dealValue) ? dealValue : [dealValue];
  } else {
    return [];
  }
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

// Mobile 下组件样式（不需要高度，动态设置size options）
export const getValueStyle = (data, isField = true) => {
  const item = Object.assign({}, data);
  let type = item.type;
  let { valuecolor, valuesize = '0', valuestyle = '0000' } = item.advancedSetting || {};
  let SIZE_OPTIONS = isField ? FIELD_SIZE_OPTIONS : TITLE_SIZE_OPTIONS;
  if (item.type === 30) {
    valuecolor = _.get(item, 'sourceControl.advancedSetting.valuecolor') || 'var(--color-secondary)';
    valuesize = _.get(item, 'sourceControl.advancedSetting.valuesize') || '0';
    valuestyle = _.get(item, 'sourceControl.advancedSetting.valuestyle') || '0000';
    type = _.get(item, 'sourceControl.type');
  }
  return _.includes(HAVE_VALUE_STYLE_WIDGET, type)
    ? {
        type,
        size: SIZE_OPTIONS[valuesize],
        valueStyle: isEmptyValue(item.value)
          ? ''
          : `color: ${valuecolor || 'var(--color-secondary)'};${getTitleStyle(valuestyle)}`,
      }
    : { type };
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

// 支持左右布局的控件
export const supportDisplayRow = item => {
  // 附件、单条关联记录、多条关联记录（卡片）、子表、分割线、备注、分段
  return (
    !includes([14, 29, 34, 22, 51, 52], item.type) ||
    ((item.type === 29 || item.type === 51) && _.get(item, 'advancedSetting.showtype') === '3')
  );
};

export const parseDataSource = dataSource => {
  if (!isString(dataSource) || !dataSource) return '';
  if (includes(dataSource, '$')) return dataSource.slice(1, -1);
  return dataSource;
};

// 需要固定在底部的控件
export const fixedBottomWidgets = data => {
  return data.type === 52 || (_.includes([29, 51], data.type) && get(data, 'advancedSetting.showtype') === '6');
};

export const getExpandWidgetIds = (controls = [], data = {}, from) => {
  const { controlId, sectionId } = data;
  const expandWidgetIds = [];
  const widgets = controls.sort((a, b) => {
    if (a.row === b.row) {
      return a.col - b.col;
    }
    return a.row - b.row;
  });

  let searchStatus = false;
  for (let item of widgets) {
    if (searchStatus) {
      if (
        fixedBottomWidgets(item) ||
        (_.get(item, 'type') === 22 &&
          (from ? controlState(item, from).visible && !item.hidden : true) &&
          sectionId === (item.sectionId || ''))
      ) {
        searchStatus = false;
      } else {
        expandWidgetIds.push(item.controlId);
      }
    }
    if (item.controlId === controlId) searchStatus = true;
  }
  return expandWidgetIds;
};

// 关联多条列表显示的控件
export const isSheetDisplay = (data = {}) => {
  return includes([29, 51], data.type) && _.includes(['2', '5', '6'], get(data, 'advancedSetting.showtype'));
};

/**
 * 验证字段值是否为空
 * @param value
 */
export const checkCellIsEmpty = value => {
  return typeof value === 'undefined' || value === '' || value === '[]' || value === '["",""]' || value === null;
};

function parseCardStyle(control, value, type) {
  try {
    const parsedValue = safeParse(value);
    return {
      ...getValueStyle(
        {
          ...control,
          type: 3,
          value: '_',
          advancedSetting: {
            ...control.advancedSetting,
            valuecolor: parsedValue.color || 'none',
            valuesize: parsedValue.size || (type === 'recordTitle' ? 1 : undefined),
            valuestyle: parsedValue.style,
          },
        },
        false,
      ),
      direction: parsedValue.direction,
    };
  } catch (err) {
    return {};
  }
}

export const getRecordCardStyle = control => {
  const {
    cardtitlestyle, // 字段标题 direction: 1 水平 2 垂直
    cardvaluestyle, // 字段值
    rowtitlestyle, // 记录标题
    cardstyle,
  } = control.advancedSetting;
  const cardStyle = safeParse(cardstyle);

  return {
    controlTitleStyle: parseCardStyle(control, cardtitlestyle, ''),
    controlValueStyle: parseCardStyle(control, cardvaluestyle, ''),
    recordTitleStyle: parseCardStyle(control, rowtitlestyle, 'recordTitle'),
    cardStyle: {
      backgroundColor: cardStyle.background,
      borderColor: cardStyle.bordercolor,
    },
  };
};

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

// 获取地图配置
export const getMapConfig = () => {
  return md.global.Account.accountId ? md.global.Account.map : md.global.Config.DefaultMap;
};

//兼容没返回的功能开关枚举
export const formatSwitches = switches => {
  return allSwitchKeys.map(o => {
    const it = (switches || []).find(it => it.type === o);
    if (!it) {
      return { type: o, state: true, viewIds: [] };
    }
    return it;
  });
};

export const isOpenPermit = (type, list = [], viewId) => {
  if (Array.isArray(list)) {
    list = list.length > 0 ? formatSwitches(list) : list;
    let data = list.find(o => o.type === type);

    if (!data || list.length <= 0) {
      return false;
    }

    if (type < 20 || [40, 50, 51].includes(type)) {
      //无需设置权限范围的项
      return data.state;
    } else if (!viewId) {
      return !!data.state;
    }

    // data.viewIds.length <= 0 所有视图
    return !!data.state && (data.viewIds.includes(viewId) || data.viewIds.length <= 0);
  }

  return false;
};
