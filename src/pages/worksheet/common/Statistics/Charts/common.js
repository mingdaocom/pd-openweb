
/**
 * 图表类型
 */
export const reportTypes = {
  BarChart: 1,
  LineChart: 2,
  PieChart: 3,
  NumberChart: 4,
  RadarChart: 5,
  FunnelChart: 6,
  DualAxes: 7,
  PivotTable: 8,
  CountryLayer: 9,
};

/**
 * 图表颜色集合
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
 * 获取图表颜色
 */
export const getChartColors = (style) => {
  const { colorType, colorGroupIndex, customColors } = style ? style : _.object();
  if ([0, 1].includes(colorType)) {
    const data = colorGroup[colorGroupIndex] || colorGroup[0];
    return data.value;
  } else {
    return customColors || colorGroup[0].value;
  }
}

/**
 * 获取异化的样式
 */
export const getAlienationColor = (xaxes, { name }) => {
  const item = _.find(xaxes.options, { value: name });
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
    return `${(value / 1000000000).toFixed(dot)}B`;
  } else if (value >= 100000000) {
    return `${(value / 100000000).toFixed(dot)}${_l('亿')}`;
  } else if (value >= 1000000) {
    return `${(value / 1000000).toFixed(dot)}M`;
  } else if (value >= 10000) {
    return `${(value / 10000).toFixed(dot)}${_l('万')}`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(dot)}K`;
  } else {
    return dot === '' ? value : value.toFixed(dot);
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
  value: 2,
  text: _l('千'),
  suffix: 'K',
  format: value => value / 1000
}, {
  value: 3,
  text: _l('万'),
  suffix: _l('万'),
  format: value => value / 10000
}, {
  value: 4,
  text: _l('百万'),
  suffix: 'M',
  format: value => value / 1000000
}, {
  value: 5,
  text: _l('亿'),
  suffix: _l('亿'),
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
        item.suffix = numberLevel[6].suffix;
      } else if (maxValue >= 100000000) {
        item.magnitude = 5;
        item.suffix = numberLevel[5].suffix;
      } else if (maxValue >= 1000000) {
        item.magnitude = 4;
        item.suffix = numberLevel[4].suffix;
      } else if (maxValue >= 10000) {
        item.magnitude = 3;
        item.suffix = numberLevel[3].suffix;
      } else if (maxValue >= 1000) {
        item.magnitude = 2;
        item.suffix = numberLevel[2].suffix;
      } else {
        item.magnitude = 1;
        item.suffix = numberLevel[1].suffix;
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

  const { magnitude, ydot, suffix, dot } = data;
  const { format } = _.find(numberLevel, { value: magnitude });
  if (magnitude === 0) {
    return format(value, ydot);
  } else if (magnitude === 1) {
    let newValue = null;
    if (ydot === '') {
      newValue = Number(value.toFixed(Number.isInteger(value) ? 0 : dot)).toLocaleString();
    } else {
      newValue = value.toFixed(Number.isInteger(value) ? 0 : ydot);
    }
    return `${newValue}${suffix}`;
  } else {
    const result = format(value).toFixed(ydot);
    return `${result}${suffix}`;
  }
}

/**
 * 处理图表 label value
 */
export const formatrChartValue = (value, isPerPile, yaxisList, id, isHideEmptyValue = true) => {
  if (!value && isHideEmptyValue) {
    return value;
  } else {
    if (isPerPile) {
      return `${(value * 100).toFixed(Number.isInteger(value) ? 0 : 2)}%`;
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
    return `${(value * 100).toFixed(0)}%`;
  } else {
    if (_.isEmpty(yaxisList)) {
      return value;
    }
    const { magnitude, ydot, suffix, dot } = yaxisList[0];
    const { format } = _.find(numberLevel, { value: magnitude });
    if (magnitude) {
      const result = format(value);
      return magnitude === 1 ? result : `${result}${suffix}`;
    } else {
      return format(value);
    }
  }
}

/**
 * 将 `控件名-控件id` 字符格式转成 { name, id }
 */
export const formatControlInfo = value => {
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

/**
 * 获取图表数据中的最大值
 */
export const getMaxValue = (map, contrastMap) => {
  const mapRes = map.map(item => item.value);
  const contrastMapRes = contrastMap ? contrastMap.map(item => item.value) : [0];
  const mapMaxValue = Math.max.apply(null, mapRes);
  const contrastMapMaxValue = Math.max.apply(null, contrastMapRes);
  return Math.max.apply(null, [mapMaxValue, contrastMapMaxValue]);
}

/**
 * 获取图表数据中的最小值
 */
export const getMinValue = (map, contrastMap) => {
  const mapRes = map.map(item => item.value);
  const contrastMapRes = contrastMap ? contrastMap.map(item => item.value) : [0];
  const mapMaxValue = Math.min.apply(null, mapRes);
  const contrastMapMaxValue = Math.min.apply(null, contrastMapRes);
  return Math.min.apply(null, [mapMaxValue, contrastMapMaxValue]);
}

