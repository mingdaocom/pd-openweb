import { formatrChartValue } from '../common';
import { timeParticleSizeDropdownData, areaParticleSizeDropdownData, isTimeControl, isAreaControl } from 'statistics/common';
import { dealMaskValue } from 'src/pages/widgetConfig/widgetSetting/components/ControlMask/util';

/**
 * 将连续的单元格合并
 */
export const uniqMerge = data => {
  data = data.map((item, index) => item || _l('空'));
  for(let i = data.length - 1; i >= 0; i--) {
    let current = data[i];
    let last = data[i - 1];
    if (current == last) {
      data[i] = null;
      data[i - 1] = {
        value: last,
        length: 2,
      }
    }
    if (_.isObject(current) && current.value === last) {
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
export const mergeTableCell = list => {
  list.map((item, index) => {
    const last = list[index - 1];
    if (last) {
      let data = last.data.map((n, i) => {
        if (_.isObject(n)) {
          let end = i + n.length;
          return uniqMerge(item.data.slice(i, end));
        } else if (_.isString(n)) {
          return item.data[i] || _l('空');
        } else {
          return false;
        }
      });
      item.data = _.flatten(data.filter(item => item));
    } else {
      item.data = uniqMerge(item.data);
    }
    return item;
  });
  return list;
}

/**
 * 合并列
 */
export const mergeColumnsCell = (data, yaxisList) => {
  data = _.cloneDeep(data);
  const length = _.get(_.find(data, { summary_col: false }), ['y', 'length']) || 0;
  const result = [];

  for(let i = 0; i < length; i++) {
    result.push({
      index: i,
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

  data.forEach(item => {
    const { t_id, data } = item;
    item.data = data.map(n => {
      if (_.isArray(n) || _.isString(n)) {
        return n;
      }
      return formatrChartValue(n, false, yaxisList, t_id);
      /*
      if (_.isNumber(n)) {
        const current = _.find(yaxisList, { controlId: t_id });
        return formatrChartValue(n, false, yaxisList, t_id);
      } else {
        return n;
      }
      */
    });
  });

  return data;
}

export const renderValue = (value, advancedSetting) => dealMaskValue({ value, advancedSetting });

/**
 * 合并行
 */
export const mergeLinesCell = (data, lines, valueMap) => {
  const result = mergeTableCell(data.map(item => {
    const key = Object.keys(item)[0];
    const res = item[key];
    const target = _.find(lines, { cid: key }) || {};
    const isTime = isTimeControl(target.controlType);
    const isArea = isAreaControl(target.controlType);
    const name = target.rename || target.controlName;
    if (isTime) {
      return {
        key,
        name: target.particleSizeType ? `${name}(${ _.find(timeParticleSizeDropdownData, { value: target.particleSizeType }).text })` : name,
        data: res,
      }
    }
    if (isArea) {
      return {
        key,
        name: target.particleSizeType ? `${name}(${ _.find(areaParticleSizeDropdownData, { value: target.particleSizeType }).text })` : name,
        data: res,
      }
    }
    return {
      key,
      name,
      data: res,
    }
  }));

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
    item.data = item.data.map(n => {
      if (_.isNull(n)) return n;
      const valueKey = valueMap[item.key];
      if (_.isObject(n)) {
        return {
          ...n,
          value: valueKey ? (valueKey[n.value] ? renderValue(valueKey[n.value], advancedSetting) : _l('空')) : renderValue(n.value, advancedSetting)
        }
      } else {
        return valueKey ? (valueKey[n] ? renderValue(valueKey[n], advancedSetting) : _l('空')) : renderValue(n, advancedSetting);
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
