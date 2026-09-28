import { TinyColor } from '@ctrl/tinycolor';
import _, { get, includes } from 'lodash';
import { browserIsMobile } from 'src/utils/platform/browser/device';
import { getColorValue } from 'src/utils/platform/theme/color';
import { getAdvanceSetting } from './advancedSetting';
import { HAVE_VALUE_STYLE_WIDGET } from './formEnum';
import { isEmptyValue } from './number';
import { TITLE_SIZE_OPTIONS } from './setting';

/**
 * 将标题样式位串转换为对应的 CSS 声明文本。
 */
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

/**
 * 判断控件类型及配置是否支持字段值样式。
 */
export const canSetWidgetStyle = (item = {}) => {
  const { type, enumDefault, showControls = [] } = item;
  const { showtype } = getAdvanceSetting(item);
  return (
    _.includes(HAVE_VALUE_STYLE_WIDGET, type) ||
    (type === 2 && enumDefault !== 3) ||
    (type === 51 && (enumDefault === 1 ? showControls.length === 1 : showtype === '3'))
  );
};

/**
 * 判断控件是否可启用字段值不允许重复的约束。
 */
export const canAsUniqueWidget = item => {
  return (
    _.includes([3, 4, 5, 7, 9, 11], item.type) ||
    (item.type === 2 && item.enumDefault !== 3) ||
    (item.type === 29 && item.enumDefault === 1) ||
    (_.includes([26, 27, 48], item.type) && item.enumDefault === 0)
  );
};

/**
 * 判断关联类控件是否使用列表形态展示多条记录。
 */
export const isSheetDisplay = (data = {}) => {
  return includes([29, 51], data.type) && _.includes(['2', '5', '6'], get(data, 'advancedSetting.showtype'));
};

/**
 * 根据地区选择范围与层级配置生成选择提示文案。
 */
export const getAreaHintText = data => {
  const { enumDefault, enumDefault2, advancedSetting = {} } = data;
  const chooserange = advancedSetting.chooserange || 'CN';
  const areaDisplayOption = [
    { value: 1, text: _l('省') },
    { value: 2, text: _l('省-市') },
    { value: 3, text: _l('省-市-县') },
  ];
  const areaSpecialDisplayOption = [
    { value: 1, text: _l('省/州') },
    { value: 2, text: _l('市/郡') },
  ];
  const areaInternationDisplayOption = [
    { value: 4, text: _l('所有层级') },
    { value: 1, text: _l('国家') },
    { value: 2, text: _l('省/州') },
    { value: 3, text: _l('市/郡') },
  ];

  if (enumDefault === 1) {
    return _.get(_.find(areaInternationDisplayOption, { value: enumDefault2 }), 'text') || _l('请选择');
  } else {
    if (chooserange === 'CN') {
      return _.get(_.find(areaDisplayOption, { value: enumDefault2 }), 'text') || _l('请选择');
    } else {
      return _.get(_.find(areaSpecialDisplayOption, { value: enumDefault2 }), 'text') || _l('请选择');
    }
  }
};

/**
 * 根据控件值样式设置生成字号、高度及 CSS 样式信息。
 */
export const getValueStyle = data => {
  const item = Object.assign({}, data);
  let type = item.type;
  let { valuecolor = 'var(--color-text-primary)', valuesize = '0', valuestyle = '0000' } = item.advancedSetting || {};

  if (item.type === 30) {
    valuecolor = _.get(item, 'sourceControl.advancedSetting.valuecolor') || 'var(--color-text-primary)';
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

/**
 * 将控件标题和值样式汇总为可按控件定位的 CSS 片段。
 */
export function getControlStyles(controls) {
  return controls
    .map(c => ({
      controlId: c.controlId,
      valueStyle: getValueStyle({ ...c, value: '_' }).valueStyle,
      titleStyle: getValueStyle({
        ...c,
        type: 2,
        enumDefault: 1,
        advancedSetting: {
          ...(c.advancedSetting || {}),
          valuecolor: get(c, 'advancedSetting.titlecolor'),
          valuesize: get(c, 'advancedSetting.titlesize'),
          valuestyle: get(c, 'advancedSetting.titlestyle'),
        },
        value: '_',
      }).valueStyle,
    }))
    .filter(c => c.valueStyle || c.titleStyle)
    .map(
      item => `
    .control-head-${item.controlId} .controlName .text {
      ${item.titleStyle}
    }
    .control-val-${item.controlId} {
      > span:not(.editIcon), > a, .worksheetCellPureString, .titleText, &.titleText {
        ${item.valueStyle}
      }
    }
     .control-head-${item.controlId} .controlName {
      ${item.titleStyle}
    }
      .control-val-${item.controlId}.mobileTableItem  .editableCellCon {
        span, a, .worksheetCellPureString, .titleText, &.titleText {
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
    console.log(err);
    return {};
  }
}

/**
 * 解析记录卡片的字段标题、字段值、记录标题及卡片配色样式。
 */
export function getRecordCardStyle(control) {
  if (!control) {
    return {};
  }

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
 * 判断颜色在当前配色规则下是否属于浅色系。
 */
export const isLightColor = (color = '') => {
  color = getColorValue(color);
  const SPECIAL_DARK_COLORS = ['ff9300', 'fa8c16', '808080', '4caf50', 'fa8c16', '08c9c9', 'fad714', 'faad14'];

  return SPECIAL_DARK_COLORS.find(l => l === new TinyColor(color).toHex()) ? false : new TinyColor(color).isLight();
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
    console.log(err);
    return hex;
  }
}

/**
 * 根据主色与按钮层级生成背景、边框及文字颜色。
 */
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
        '#1677ff',
        '#1677ffFF',
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
      : 'var(--color-text-primary)';

  if (mainColor === 'transparent') {
    fontColor = 'var(--color-text-primary)';
    borderColor = browserIsMobile() ? 'var(--color-border-secondary)' : 'var(--color-border-primary)';
  }

  return showAsPrimary
    ? {
        backgroundColor: mainColor || '#1677ff',
        border: `1px solid ${borderColor}`,
        color: fontColor,
      }
    : {
        backgroundColor: 'var(--color-background-primary)',
        border: '1px solid var(--color-border-primary)',
        color: 'var(--color-text-primary)',
      };
};
