import _, { get, includes, isArray, isObject, isString } from 'lodash';
import { isEmptyValue } from 'src/utils/control';
import RegExpValidator from 'src/utils/expression';
import { FROM } from '../../core/config';
import { allSwitchKeys, HAVE_VALUE_STYLE_WIDGET } from '../../core/enum';
import { controlState } from '../../core/formUtils';
import { isPublicLink } from '../../core/utils';
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
    console.log(error);
    return '';
  }
};

// 支持左右布局的控件
export const supportDisplayRow = item => {
  // 附件、单条关联记录、多条关联记录（卡片）、子表、分割线、备注、分段
  return (
    !includes([14, 29, 34, 22, 45, 51, 52], item.type) ||
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
    const parsedValue = safeParse(value) || {};
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
    console.log(err);
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
  var dLat = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
  dLat += ((20.0 * Math.sin(6.0 * lng * pi) + 20.0 * Math.sin(2.0 * lng * pi)) * 2.0) / 3.0;
  dLat += ((20.0 * Math.sin(lat * pi) + 40.0 * Math.sin((lat / 3.0) * pi)) * 2.0) / 3.0;
  dLat += ((160.0 * Math.sin((lat / 12.0) * pi) + 320 * Math.sin((lat * pi) / 30.0)) * 2.0) / 3.0;
  return dLat;
}

function transformLng(lng, lat) {
  var pi = 3.14159265358979324;
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

export const showRefreshBtn = ({ disabledFunctions = [], from, recordId, item }) => {
  return (
    !disabledFunctions.includes('controlRefresh') &&
    from !== FROM.DRAFT &&
    !isPublicLink() &&
    recordId &&
    !recordId.includes('default') &&
    !recordId.includes('temp') &&
    md.global.Account.accountId &&
    ((item.type === 30 && (item.strDefault || '').split('')[0] !== '1') || _.includes([31, 32, 37, 38, 53], item.type))
  );
};

export const getCoverUrl = (coverId, record, controls) => {
  const coverControl = _.find(controls, c => c.controlId && c.controlId === coverId);
  if (!coverControl) {
    return;
  }
  try {
    const files = safeParse(record[coverId]) || [];
    const coverFile = _.find(files, file => file && RegExpValidator.fileIsPicture(file.ext));
    const { previewUrl = '' } = coverFile;
    return previewUrl.indexOf('imageView2') > -1
      ? previewUrl.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, 'imageView2/1/w/200/h/140')
      : `${previewUrl}&imageView2/1/w/200/h/140`;
  } catch (err) {
    console.log(err);
  }
  return;
};

export const inputValueReg = (inputValue, regType) => {
  return new RegExp(inputValue.trim().replace(/([,.+?:()*[\]^$|{}\\-])/g, '\\$1'), regType || 'i');
};

export const sortPathsBySearchKeyword = (data, inputValue) => {
  let list = data.filter(item => (safeParse(item.searchPath) || []).length > 0);
  const reg = inputValueReg(inputValue, 'g');

  const formatValue = value => {
    const pathStr = value.searchPath || '[]';
    const pathArr = JSON.parse(pathStr);
    return pathArr.map(p => {
      const idx = p.search(reg);
      return idx === -1 ? 999 : idx;
    });
  };

  return list.sort((a, b) => {
    const aIndexArr = formatValue(a);
    const bIndexArr = formatValue(b);
    const maxCount = Math.max(aIndexArr.length, bIndexArr.length);

    for (let i = 0; i < maxCount; i++) {
      const aVal = aIndexArr[i];
      const bVal = bIndexArr[i];

      if (bVal === undefined || aVal < bVal) return -1;
      if (aVal === undefined || aVal > bVal) return 1;
    }

    return 0;
  });
};
