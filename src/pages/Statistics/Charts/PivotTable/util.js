import { formatrChartValue } from '../common';
import { timeParticleSizeDropdownData, areaParticleSizeDropdownData, isTimeControl, isAreaControl } from 'statistics/common';
import { dealMaskValue } from 'src/pages/widgetConfig/widgetSetting/components/WidgetSecurity/util';

/**
 * 将连续的单元格合并
 */
export const uniqMerge = (data, config) => {
  const { pageSize, defaultEmpty } = config;
  data = data.map((item, index) => item || defaultEmpty);
  for(let i = data.length - 1; i >= 0; i--) {
    let current = data[i];
    let last = data[i - 1];
    if (current == last && (pageSize ? i % pageSize : true)) {
      data[i] = null;
      data[i - 1] = {
        value: last,
        length: 2,
      }
    }
    if (_.isObject(current) && current.value === last && (pageSize ? i % pageSize : true)) {
      data[i - 1] = {
        value: last,
        length: current.length + 1,
      }
      data[i] = null;
    }
  }
  return data;
}

/**
 * 多维度单元格合并
 */
export const mergeTableCell = (list, pageSize) => {
  list.map((item, index) => {
    const last = list[index - 1];
    const defaultEmpty = item.xaxisEmptyType ? '--' : ' ';
    if (last) {
      let data = last.data.map((n, i) => {
        if (_.isObject(n)) {
          if (n.sum) {
            return item.data[i];
          }
          let end = i + n.length;
          return uniqMerge(item.data.slice(i, end), { pageSize, defaultEmpty });
        } else if (_.isString(n)) {
          return item.data[i] || defaultEmpty;
        } else {
          return false;
        }
      });
      item.data = _.flatten(data.filter(item => item));
    } else {
      item.data = uniqMerge(item.data, { pageSize, defaultEmpty });
    }
    return item;
  });
  return list;
}

/**
 * 合并列
 */
export const mergeColumnsCell = (data, columns, yaxisList) => {
  data = _.cloneDeep(data);
  const length = _.get(_.find(data, { summary_col: false }), ['y', 'length']) || 0;
  const result = [];

  for(let i = 0; i < length; i++) {
    result.push({
      index: i,
      xaxisEmptyType: columns[i].xaxisEmptyType,
      data: [],
    });
    data.filter(item => !item.summary_col).forEach(item => {
      if (item.y && item.y.length) {
        result[i].data.push(item.y[i]);
      }
    });
  }

  mergeTableCell(result).forEach((item, index) => {
    item.data.forEach((n, i) => {
      data.filter(item => !item.summary_col)[i].y[index] = n;
    });
  });

  return data;
}

export const renderValue = (value, advancedSetting) => dealMaskValue({ value, advancedSetting });

const getTotalCount = (data, index) => {
  return data.map((item) => {
    const key = Object.keys(item)[0];
    const res = item[key];
    const value = res[index];
    return value.includes('subTotal') ? value : null;
  }).filter(_ => _);
}

/**
 * 合并行
 */
export const mergeLinesCell = (data, lines, valueMap, config) => {
  const { pageSize, freeze, freezeIndex } = config;
  const fIndex = freezeIndex + 1;
  const isFreeze = freeze && _.isNumber(freezeIndex);
  const result = mergeTableCell(data.map((item, index) => {
    const key = Object.keys(item)[0];
    const res = item[key].map((value, valueIndex) => {
      if (value.includes('subTotal')) {
        const freezeData = isFreeze && freezeIndex ? data.slice(0, index <= freezeIndex ? fIndex : index) : data;
        const rightLength = getTotalCount(freezeData.slice(index + 1, freezeData.length), valueIndex).length + 1;
        const leftLength = getTotalCount(freezeData.slice(0, index), valueIndex).length;
        if (!leftLength && rightLength) {
          const showLine = data[data.length - rightLength];
          const showId = Object.keys(showLine)[0];
          return {
            value,
            length: rightLength,
            sum: true,
            subTotalName: _.get(_.find(lines, { cid: showId }), 'subTotalName') || _l('总计')
          };
        } else {
          if (isFreeze && freezeIndex) {
            return index <= freezeIndex ? `subTotalEmpty-${valueIndex}` : `subTotalFreezeEmpty-${valueIndex}`;
          }
          return `subTotalEmpty-${valueIndex}`;
        }
      }
      return value;
    });
    const target = _.find(lines, { cid: key }) || {};
    const isTime = isTimeControl(target.controlType);
    const isArea = isAreaControl(target.controlType);
    const name = target.rename || target.controlName;
    const { xaxisEmptyType } = target;
    if (isTime) {
      return {
        key,
        xaxisEmptyType,
        name: target.particleSizeType ? `${name}(${ _.find(timeParticleSizeDropdownData, { value: target.particleSizeType }).text })` : name,
        data: res,
      }
    }
    if (isArea) {
      return {
        key,
        xaxisEmptyType,
        name: target.particleSizeType ? `${name}(${ _.find(areaParticleSizeDropdownData, { value: target.particleSizeType }).text })` : name,
        data: res,
      }
    }
    return {
      key,
      xaxisEmptyType,
      name,
      data: res,
    }
  }), pageSize);

  const parse = (value) => {
    let result = value;
    try {
      let res = JSON.parse(value);
      if (_.isArray(res)) {
        res = res.map(item => {
          return parse(item);
        });
      }
      result = res;
    } catch (err) {}
    return result;
  }

  result.forEach((item) => {
    const control = _.find(lines, { cid: item.key }) || {};
    const advancedSetting = control.advancedSetting || {};
    const defaultEmpty = item.xaxisEmptyType ? '--' : ' ';
    item.data = item.data.map(n => {
      if (_.isNull(n)) return n;
      const valueKey = valueMap[item.key];
      if (_.isObject(n)) {
        const defaultValue = n.value.includes('subTotal') ? n.value : defaultEmpty;
        return {
          ...n,
          value: valueKey ? (valueKey[n.value] ? renderValue(valueKey[n.value], advancedSetting) : defaultValue) : renderValue(n.value, advancedSetting)
        }
      } else {
        const defaultValue = n.includes('subTotal') ? n : defaultEmpty;
        return valueKey ? (valueKey[n] ? renderValue(valueKey[n], advancedSetting) : defaultValue) : renderValue(n, advancedSetting);
      }
    });
    if (control.controlType === 29) {
      item.data = item.data.map(item => {
        if (_.isObject(item)) {
          return {
            ...item,
            value: parse(item.value)
          }
        } else {
          return parse(item);
        }
      });
    }
  });

  return result;
}

export const getColumnName = (column) => {
  const { rename, controlName, controlType, particleSizeType } = column;
  const name = rename || controlName;
  const isTime = isTimeControl(controlType);
  const isArea = isAreaControl(controlType);
  if (isTime) {
    return particleSizeType ? `${name}(${ _.find(timeParticleSizeDropdownData, { value: particleSizeType }).text })` : name;
  }
  if (isArea) {
    return particleSizeType ? `${name}(${ _.find(areaParticleSizeDropdownData, { value: particleSizeType }).text })` : name;
  }
  return name;
}

export const getControlMinAndMax = (yaxisList, data) => {
  const result = {};

  const get = (id) => {
    let values = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i].t_id === id && !data[i].summary_col) {
        values.push(data[i].data);
      }
    }
    values = _.flatten(values);
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

export const getBarStyleColor = ({ value, controlMinAndMax = {}, rule }) => {
  const { min = 0, max, direction, negativeNumberColor, positiveNumberColor } = rule;
  const barStyle = {};
  const minValue = _.isNumber(min) ? min : controlMinAndMax.min || 0;
  const maxValue = _.isNumber(max) ? max : controlMinAndMax.max || 0;
  if (direction === 1) {
    barStyle.left = 0;
  }
  if (direction === 2) {
    barStyle.right = 0;
  }
  let percent = parseInt((value - minValue) / (maxValue - minValue) * 100);
  if (percent >= 100) {
    percent = 100;
  }
  if (percent <= 0) {
    percent = 0;
  }
  if (value < minValue) {
    percent = 0;
  }
  barStyle.width = `${percent}%`;
  barStyle.backgroundColor = value >= 0 ? positiveNumberColor : negativeNumberColor;
  return barStyle;
}

export const getLineSubTotal = (data, index) => {
  let count = '';
  for(let i = index; i < data.length; i++) {
    if (data[i] && _.isString(data[i]) && data[i].includes('subTotal')) {
      count = data[i];
      break;
    }
  }
  return count;
}