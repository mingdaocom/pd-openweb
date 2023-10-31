import _ from 'lodash';
import { getProjectColor, toFixed } from 'src/util';

/**
 * 图表类型
 */
export const reportTypes = {
  BarChart: 1,
  LineChart: 2,
  PieChart: 3,
  NumberChart: 10,
  RadarChart: 5,
  FunnelChart: 6,
  DualAxes: 7,
  PivotTable: 8,
  CountryLayer: 9,
  BidirectionalBarChart: 11,
  ScatterChart: 12,
  WordCloudChart: 13,
  GaugeChart: 14,
  ProgressChart: 15,
  TopChart: 16
};

/**
 * 图表颜色集合 (旧的颜色配置)
 */
export const colorGroup = {
  0: {
    name: _l('经典'),
    value: ['#64B5F6', '#4DB6AC', '#FFB74D', '#E57373', '#9575CD', '#A1887F', '#90A4AE', '#4DD0E1', '#81C784', '#FF8A65']
  },
  1: {
    name: _l('科技'),
    value: ['#3A5B84', '#4D6E98', '#7594B9', '#BFD7F2', '#18619F', '#408ACA', '#5EA8E9', '#81C3FC', '#71A5CB', '#A1CAE4']
  },
  2: {
    name: _l('商务'),
    value: ['#CCEDF7', '#B9DCF0', '#12A0E7', '#0663A4', '#458890', '#97D9CD', '#4BB8BF', '#20899C', '#00272E', '#A2C7D9']
  },
  3: {
    name: _l('植物'),
    value: ['#34B392', '#4AC2A6', '#8ED1C0', '#CCDEC6', '#61BDB5', '#7993A1', '#93A889', '#5E8D83', '#115040', '#BCC5B4']
  },
  4: {
    name: _l('自然'),
    value: ['#85CACD', '#A7D676', '#FEE159', '#FBC78E', '#EF918B', '#A9B5FF', '#E7DACA', '#FC803A', '#FEA1AC', '#C2A3CD']
  },
  5: {
    name: _l('彩色'),
    value: ['#FDDB9C', '#F9AE91', '#F59193', '#D47F97', '#BD86A6', '#877FA8', '#F595A1', '#624772', '#FE7156', '#FFBDA3']
  },
  6: {
    name: _l('棕色'),
    value: ['#996430', '#BA8249', '#BA6A49', '#D09075', '#CDA786', '#E8CEB6', '#BA702F', '#CA774B', '#DDAC74', '#CEA77E']
  },
  7: {
    name: _l('红色'),
    value: ['#DF5447', '#E8352E', '#E15652', '#E4ACA4', '#DA5546', '#C4514B', '#F58C8A', '#BC2A28', '#F4633A', '#E15652']
  },
  8: {
    name: _l('紫色'),
    value: ['#5F3990', '#62446E', '#62446E', '#62446E', '#62446E', '#B160E1', '#B694CE', '#854BA6', '#854BA6', '#915FAF']
  },
  9: {
    name: _l('绿色'),
    value: ['#228569', '#01AC84', '#59B489', '#96D2B7', '#A3E1C1', '#4CAF93', '#2A9762', '#326B4F', '#59B489', '#9CD4C4']
  },
  10: {
    name: _l('橙色'),
    value: ['#9CD4C4', '#ED9C34', '#EFB661', '#EF9702', '#FFAD02', '#FFB774', '#FF7500', '#D76B00', '#FF8A3D', '#FBAA8D']
  },
  11: {
    name: _l('灰色'),
    value: ['#626970', '#83898E', '#A6AAAD', '#C3C6C6', '#B4B5B1', '#A2A3A1', '#8D8F8E', '#6C6F6F', '#8B8C8D', '#ACADAD']
  }
}

/**
 * 获取组织管理主题色
 */
export const getPorjectChartColors = projectId => {
  const { chartColor } = getProjectColor(projectId);
  const systemColorList = (chartColor.system || []).filter(item => item.enable !== false && !_.isEmpty(item.colors));
  const customColorList = (chartColor.custom || []).filter(item => item.enable !== false && !_.isEmpty(item.colors));
  return systemColorList.concat(customColorList);
}

/**
 * 获取图表颜色
 */
export const getChartColors = (style, themeColor, projectId) => {
  const chartColors = getPorjectChartColors(projectId);
  const { colorType, colorGroupIndex, colorGroupId, customColors } = style ? style : {};
  if ([0, 1].includes(colorType)) {
    // 新颜色配置
    if (colorGroupId === 'adaptThemeColor' && themeColor) {
      const adaptThemeColors = chartColors.filter(item => (item.themeColors || []).includes(themeColor.toLocaleUpperCase()));
      return (adaptThemeColors[0] || chartColors[0]).colors;
    } else if (colorGroupId) {
      return (_.find(chartColors, { id: colorGroupId }) || chartColors[0]).colors;
    } else if (colorGroup[colorGroupIndex]) {
      return colorGroup[colorGroupIndex].value;
    } else {
      return chartColors[0].colors;
    }
  } else {
    return customColors || chartColors[0].colors;
  }
}

/**
 * 获取辅助线样式
 */
const getLineStyle = (value) => {
  if (value === 1) {
    return { lineDash: [0, 0] }
  }
  if (value === 2) {
    return { lineDash: [2, 2] }
  }
  if (value === 3) {
    return { lineWidth: 3, lineDash: [3, 3] }
  }
}

/**
 * 获取辅助线配置
 */
export const getAuxiliaryLineConfig = (auxiliaryLines = [], data, { yaxisList, colors }) => {
  return auxiliaryLines.map(item => {
    const controlId = _.find(yaxisList, { controlId: item.controlId }) ? item.controlId : null;
    const getValue = () => {
      if (item.type === 'constantLine') {
        return item.value;
      }
      if (item.type === 'minLine' && controlId) {
        return Number(toFixed(getControlMinValue(data, controlId), 2));
      }
      if (item.type === 'maxLine' && controlId) {
        return Number(toFixed(getControlMaxValue(data, controlId), 2));
      }
      if (item.type === 'averageLine' && controlId) {
        return Number(toFixed(getControlAvgValue(data, controlId), 2));
      }
      if (item.type === 'medianLine' && controlId) {
        return Number(toFixed(getControlMedianValue(data, controlId), 2));
      }
      if (item.type === 'percentLine' && controlId) {
        return getControlPercentValue(data, controlId, item.percent);
      }
      return undefined;
    }
    const value = getValue();
    const showText = item.showName || item.showValue;
    const textConfig = {
      content: `${item.showName ? (item.name || '') : ''} ${item.showValue && _.isNumber(value) ? formatrChartValue(value, false, yaxisList, item.controlId) : ''}`,
      offsetY: -5,
      style: {
        fill: item.color
      },
      maxLength: 200,
      autoEllipsis: true,
    }
    const getPosition = () => {
      if (item.type === 'tendencyLine' && controlId) {
        const min = getControlMinValue(data, controlId);
        const max = getControlMaxValue(data, controlId);
        const minKeys = data.filter(n => n.value === min);
        const maxKeys = data.filter(n => n.value === max);
        const minKey = minKeys[0] || {};
        const maxKey = maxKeys[maxKeys.length - 1] || {};
        const minIndex = _.findIndex(data, { name: minKey.name });
        const maxIndex = _.findIndex(data, { name: maxKey.name });
        return {
          start: ['start', minIndex < maxIndex ? min : max],
          end: ['end', minIndex < maxIndex ? max : min],
        }
      }
      return {
        start: ['start', value],
        end: ['end', value],
      }
    }
    const getStyle = () => {
      if (item.type === 'tendencyLine' && controlId) {
        const index = _.findIndex(yaxisList, { controlId: item.controlId });
        const color = colors[index] || '#2196F3';
        return {
          stroke: color,
          ...getLineStyle(item.style)
        }
      } else {
        return {
          stroke: item.color,
          ...getLineStyle(item.style)
        }
      }
    }
    return {
      type: 'line',
      ...getPosition(),
      style: getStyle(),
      text: showText ? textConfig : null
    }
  });
}

/**
 * 获取异化的样式
 */
export const getAlienationColor = (xaxes, { originalId }) => {
  const item = _.find(xaxes.options, { key: originalId });
  return item ? item.color : '#E0E0E0';
}

/**
 * 获取图例信息
 */
export const getLegendType = value => {
  const data = _.find(LegendTypeData, { value });
  return _.isEmpty(data) ? LegendTypeData[0] : data;
}

/**
 * 图例位置
 */
export const LegendTypeData = [
  {
    value: 1,
    position: 'top-left',
    text: _l('上方'),
  },
  {
    value: 2,
    position: 'left',
    text: _l('左侧'),
  },
  {
    value: 3,
    position: 'bottom',
    text: _l('下方'),
  },
  {
    value: 4,
    position: 'right',
    text: _l('右侧'),
  },
];

/**
 * 自动添加数量级
 */
export const abbreviateNumber = (value, dot) => {
  if (value >= 1000000000) {
    return `${toFixed(value / 1000000000, dot)}B`;
  } else if (value >= 100000000) {
    return `${toFixed(value / 100000000, dot)}${_l('亿')}`;
  } else if (value >= 1000000) {
    return `${toFixed(value / 1000000, dot)}M`;
  } else if (value >= 10000) {
    return `${toFixed(value / 10000, dot)}${_l('万')}`;
  } else if (value >= 1000) {
    return `${toFixed(value / 1000, dot)}K`;
  } else {
    return dot === '' ? value : toFixed(value, dot);
  }
}


/**
 * 数值数量级
 */
export const numberLevel = [{
  value: 0,
  text: _l('自动'),
  suffix: '',
  format: abbreviateNumber
}, {
  value: 1,
  text: _l('无'),
  suffix: '',
  format: value => value
}, {
  value: 7,
  text: _l('百分比'),
  suffix: '%',
  format: value => value * 100
}, {
  value: 8,
  text: _l('千分比'),
  suffix: '‰',
  format: value => value * 1000
}, {
  value: 2,
  text: _l('千'),
  suffix: 'K',
  format: value => value / 1000
}, {
  value: 3,
  text: _l('万%06003'),
  suffix: _l('万%06003'),
  format: value => value / 10000
}, {
  value: 4,
  text: _l('百万'),
  suffix: 'M',
  format: value => value / 1000000
}, {
  value: 5,
  text: _l('亿%06004'),
  suffix: _l('亿%06004'),
  format: value => value / 100000000
}, {
  value: 6,
  text: _l('十亿'),
  suffix: 'B',
  format: value => value / 1000000000
}];

/**
 * 为 yaxisList 添加自动数量级单位
 */
export const formatYaxisList = (map, yaxisList, id) => {
  const maxValue = getMaxValue(map, []);
  const newYaxisList = _.cloneDeep(yaxisList);

  newYaxisList.forEach((item, index) => {
    if ((id ? item.controlId == id : index === 0) && item.magnitude === 0) {
      if (maxValue >= 1000000000) {
        item.magnitude = 6;
        item.suffix = _.find(numberLevel, { value: 6 }).suffix
      } else if (maxValue >= 100000000) {
        item.magnitude = 5;
        item.suffix = _.find(numberLevel, { value: 5 }).suffix
      } else if (maxValue >= 1000000) {
        item.magnitude = 4;
        item.suffix = _.find(numberLevel, { value: 4 }).suffix
      } else if (maxValue >= 10000) {
        item.magnitude = 3;
        item.suffix = _.find(numberLevel, { value: 3 }).suffix
      } else if (maxValue >= 1000) {
        item.magnitude = 2;
        item.suffix = _.find(numberLevel, { value: 2 }).suffix
      } else {
        item.magnitude = 1;
        item.suffix = _.find(numberLevel, { value: 1 }).suffix;
      }
    }
  });

  return newYaxisList;
}

/**
 * 为字段值添加数量级单位
 */
export const formatControlValueDot = (value, data) => {
  if (_.isEmpty(data)) {
    return value;
  }

  const { magnitude, suffix, dot, controlId, fixType, advancedSetting } = data;
  const dotformat = _.get(advancedSetting, 'dotformat') || '0';
  const isRecordCount = controlId === 'record_count';
  const ydot = Number(data.ydot);

  const { format } = _.find(numberLevel, { value: magnitude || 0 });
  if (magnitude === 0) {
    return format(value, ydot);
  } else if (magnitude === 1) {
    let newValue = 0;
    if (data.ydot === '') {
      if (dotformat === '0') {
        newValue = Number(toFixed(value, dot)).toLocaleString('zh', { minimumFractionDigits: dot });
      } else {
        newValue = Number(toFixed(value, dot));
      }
    } else {
      const dot = isRecordCount ? 0 : ydot;
      newValue = Number(toFixed(value, dot)).toLocaleString('zh', { minimumFractionDigits: dot });
    }
    return fixType ? `${suffix}${newValue}` : `${newValue}${suffix}`;
  } else {
    const newValue = toFixed(format(value), ydot);
    const result = Number(newValue).toLocaleString('zh', { minimumFractionDigits: ydot });
    return fixType ? `${suffix}${result}` : `${result}${suffix}`;
  }
}

/**
 * 处理图表 label value
 */
export const formatrChartValue = (value, isPerPile, yaxisList, id, isHideEmptyValue = true) => {
  if (!value && isHideEmptyValue) {
    const { emptyShowType } = _.find(yaxisList, { controlId: id }) || yaxisList[0] || {};
    if (emptyShowType === 0) {
      return '';
    } else if (emptyShowType === 1) {
      return formatControlValueDot(0, id ? _.find(yaxisList, { controlId: id }) : yaxisList[0]);
    } else if (emptyShowType === 2) {
      return '--';
    } else {
      return value;
    }
  } else {
    if (isPerPile) {
      const { ydot = 2 } = yaxisList[0] || {};
      return `${toFixed(value * 100, Number.isInteger(value) ? 0 : Number(ydot))}%`;
    } else {
      return formatControlValueDot(value, id ? _.find(yaxisList, { controlId: id }) : yaxisList[0]);
    }
  }
}

/**
 * 处理图表 axis value
 */
export const formatrChartAxisValue = (value, isPerPile, yaxisList) => {
  if (isPerPile) {
    return `${toFixed(value * 100, 0)}%`;
  } else {
    if (_.isEmpty(yaxisList)) {
      return value;
    }
    const { magnitude, ydot, suffix, dot, fixType } = yaxisList[0];
    const { format } = _.find(numberLevel, { value: magnitude });
    if ([7, 8].includes(magnitude)) {
      const result = toFixed(format(value), 0);
      return fixType ? `${suffix}${result}` : `${result}${suffix}`;
    } else if (magnitude) {
      const result = Number(toFixed(format(value), Number(ydot)));
      return magnitude === 1 ? result : fixType ? `${suffix}${result}` : `${result}${suffix}`;
    } else {
      return format(value);
    }
  }
}

/**
 * 将 `控件名-控件id` 字符格式转成 { name, id }
 */
export const formatControlInfo = value => {
  if (_.isNumber(value)) return value;
  let result = value.split(/-md-\w+-chart-/g);
  let name = null;
  let id = null;
  if (result.length === 2) {
    name = result[0];
    id = result[1];
  } else {
    name = result[0];
    id = null;
  }
  return { name, id };
}

const isApplyStyle = (applyValue, recordKey) => {
  if (applyValue === 1) {
    return recordKey !== 'sum';
  }
  if (applyValue === 2) {
    return true;
  }
  if (applyValue === 3) {
    return recordKey === 'sum';
  }
}

export const getScopeRuleColor = (value, controlMinAndMax = {}, scopeRules, emptyShowType) => {
  let result = null;

  scopeRules.forEach(rule => {
    const { type, and, min, max, color } = rule;
    const minValue = _.isNumber(min) ? min : controlMinAndMax.min || 0;
    const maxValue = _.isNumber(max) ? max : controlMinAndMax.max || 0;
    if (type === 1 && value > minValue) {
      if (and === 5 && value < maxValue) {
        result = color;
      }
      if (and === 6 && value <= maxValue) {
        result = color;
      }
    }
    if (type === 2 && value >= minValue) {
      if (and === 5 && value < maxValue) {
        result = color;
      }
      if (and === 6 && value <= maxValue) {
        result = color;
      }
    }
    if (type === 3 && value === rule.value) {
      result = color;
    }
    if (type === 4 && emptyShowType === 1 ? _.isNull(value) : !value) {
      result = color;
    }
  });

  return result;
}

export const getStyleColor = ({ value = 0, controlMinAndMax, rule, controlId, record = {}, emptyShowType }) => {
  const { model, applyValue } = rule;
  if (model === 1 && isApplyStyle(applyValue, record.key)) {
    const { min, max, center, centerVisible, colors, controlId: applyControlId } = rule;
    const applyControl = controlMinAndMax[applyControlId];
    const minValue = _.isNumber(min.value) ? min.value : (applyControl ? applyControl.min : 0);
    const maxValue = _.isNumber(max.value) ? max.value : (applyControl ? applyControl.max : 0);
    const centerValue = _.isNumber(center.value) ? center.value : (applyControl ? applyControl.center : 0);
    let percent = 0;
    if (centerVisible) {
      //（（当前值 - 中间值）/（最大值 - 中间值）* 50% ）+ 50%
      percent = ((value - centerValue) / (maxValue - centerValue) * 50) + 50;
    } else {
      // （当前值 - 最小值）/（最大值 - 最小值）* 100%
      percent = (value - minValue) / (maxValue - minValue) * 100;
    }
    /*
    if (value >= 0) {
      if (centerVisible) {
        if (value <= centerValue) {
          percent = value / centerValue * 50;
        } else {
          percent = (value - centerValue) / (maxValue - centerValue) * 50 + 50;
        }
      } else {
        percent = value / (maxValue - minValue) * 100;
      }
    } else {
      // 有中间值
      if (centerVisible) {
        // 当前值小于等于中间值
        if (value <= centerValue) {
          //（1-最小值+当前值）/（1-最小值+中间值）* 50
          percent = (1 - minValue + value) / (1 - minValue + centerValue) * 50;
        } else {
          if (maxValue) {
            // 最大值(正数)
            // [（1-最小值+当前值）-（1-最小值+中间值）] / [（1-最小值+最大值）-（1-最小值+中间值）] * 50 + 50
            percent = ((1 - minValue + value) - (1 - minValue + centerValue)) / ((1 - minValue + maxValue) - (1 - minValue + centerValue)) * 50 + 50;
          } else {
            // 最大值(负数)
            //  [（1-最小值+当前值）-（1-最小值+中间值）] / [（1-最小值-最大值）-（1-最小值+中间值）] * 50 + 50
            percent = ((1 - minValue + value) - (1 - minValue + centerValue)) / ((1 - minValue - maxValue) - (1 - minValue + centerValue)) * 50 + 50;
          }
        }
      } else {
        // 没有中间值
        //（1-最小值+当前值）/（1-最小值+最大值）
        percent = (1 - minValue + value) / (1 - minValue + maxValue);
      }
    }
    */
    percent = parseInt(percent);
    if (value <= minValue) {
      percent = 0;
    }
    if (value === centerValue) {
      percent = 50;
    }
    if (value >= maxValue) {
      percent = 100;
    }
    if (percent >= 100) {
      percent = 99;
    }
    if (percent <= 0) {
      percent = 0;
    }
    return colors[percent];
  }
  if (model === 2) {
    const { scopeRules } = rule;
    return getScopeRuleColor(value, controlMinAndMax[controlId], scopeRules, emptyShowType);
  }
}

export const getControlMinAndMax = (yaxisList, data) => {
  const result = {};

  const get = (id) => {
    let values = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i].controlId === id) {
        values.push(data[i].value);
      }
    }
    const min = _.min(values) || 0;
    const max = _.max(values);
    const center = (max + min) / 2;
    return {
      min,
      max,
      center
    }
  }

  yaxisList.forEach(item => {
    result[item.controlId] = get(item.controlId);
  });

  return result;
}

/**
 * 获取图表所有数据中的最大值
 */
export const getMaxValue = (map, contrastMap) => {
  const mapRes = map.map(item => item.value);
  const contrastMapRes = contrastMap ? contrastMap.map(item => item.value) : [0];
  const mapMaxValue = _.max(mapRes);
  const contrastMapMaxValue = _.max(contrastMapRes);
  return _.max([mapMaxValue, contrastMapMaxValue]);
}

/**
 * 获取图表所有数据中的最小值
 */
export const getMinValue = (map, contrastMap) => {
  const mapRes = map.map(item => item.value);
  const contrastMapRes = contrastMap ? contrastMap.map(item => item.value) : [0];
  const mapMinValue = _.min(mapRes) || 0;
  const contrastMapMinValue = _.min(contrastMapRes) || 0;
  return _.min([mapMinValue, contrastMapMinValue]);
}

/**
 * 获取图表某个数值维度中数据的最大值
 */
export const getControlMaxValue = (map, id) => {
  const mapRes = map.filter(m => m.controlId === id);
  const valueRes = (mapRes.length ? mapRes : map).map(m => m.value);
  const mapMaxValue = _.max(valueRes);
  return mapMaxValue;
}

/**
 * 获取图表某个数值维度中数据的最小值
 */
export const getControlMinValue = (map, id) => {
  const mapRes = map.filter(m => m.controlId === id);
  const valueRes = (mapRes.length ? mapRes : map).map(m => m.value);
  const mapMinValue = _.min(valueRes) || 0;
  return mapMinValue;
}

/**
 * 获取图表某个数值维度中数据的平均值
 */
export const getControlAvgValue = (map, id) => {
  const mapRes = map.filter(m => m.controlId === id);
  const valueRes = (mapRes.length ? mapRes : map).map(m => m.value);
  const sum = valueRes.reduce((previous, current) => current += previous);
  return sum / valueRes.length;
}

/**
 * 获取图表某个数值维度中数据的中位值
 */
export const getControlMedianValue = (map, id) => {
  const mapRes = map.filter(m => m.controlId === id);
  const valueRes = (mapRes.length ? mapRes : map).map(m => m.value).sort((a, b) => a - b);
  const lowMiddle = Math.floor((valueRes.length - 1) / 2);
  const highMiddle = Math.ceil((valueRes.length - 1) / 2);
  return (valueRes[lowMiddle] + valueRes[highMiddle]) / 2;
}

/**
 * 获取图表某个数值维度中数据的百分位数
 */
export const getControlPercentValue = (map, id, value) => {
  const mapRes = map.filter(m => m.controlId === id);
  const valueRes = (mapRes.length ? mapRes : map).map(m => m.value).sort((a, b) => a - b);
  const index = Math.floor((value / 100) * valueRes.length);
  return valueRes[index >= valueRes.length ? (valueRes.length - 1) : index];
}

const getPercentValue = (arr, value) => {
  const index = Math.floor((value / 100) * arr.length);
  return arr[index >= arr.length ? (arr.length - 1) : index];
}

