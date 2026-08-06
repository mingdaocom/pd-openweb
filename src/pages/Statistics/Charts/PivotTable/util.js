import _ from 'lodash';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { dealMaskValue } from 'src/pages/widgetConfig/widgetSetting/components/WidgetSecurity/util';

/**
 * 将连续的单元格合并
 */
export const uniqMerge = (data, config) => {
  const { pageSize, defaultEmpty, mergeCell = true } = config;
  data = data.map(item => item || defaultEmpty);
  for (let i = data.length - 1; i >= 0; i--) {
    let current = data[i];
    let last = data[i - 1];

    if (mergeCell && current == last && (pageSize ? i % pageSize : true)) {
      data[i] = null;
      data[i - 1] = {
        value: last,
        length: 2,
      };
    }

    if (_.isObject(current) && mergeCell && current.value === last && (pageSize ? i % pageSize : true)) {
      data[i - 1] = {
        value: last,
        length: current.length + 1,
      };
      data[i] = null;
    }
  }

  return data;
};

/**
 * 多维度单元格合并
 */
export const mergeTableCell = (list, pageSize, mergeCell) => {
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
          return uniqMerge(item.data.slice(i, end), { pageSize, defaultEmpty, mergeCell });
        } else if (_.isString(n)) {
          return item.data[i] || defaultEmpty;
        } else {
          return false;
        }
      });
      item.data = _.flatten(data.filter(item => item));
    } else {
      item.data = uniqMerge(item.data, { pageSize, defaultEmpty, mergeCell });
    }

    return item;
  });
  return list;
};

/**
 * 合并列
 */
export const mergeColumnsCell = (data, columns, yaxisList) => {
  data = _.cloneDeep(data).filter(item => {
    const yaxis = _.find(yaxisList, { controlId: item.t_id });
    return yaxis ? !yaxis.hide : true;
  });
  const length = _.get(_.find(data, { summary_col: false }), ['y', 'length']) || 0;
  const result = [];

  for (let i = 0; i < length; i++) {
    result.push({
      index: i,
      xaxisEmptyType: columns[i].xaxisEmptyType,
      data: [],
    });
    data
      .filter(item => !item.summary_col)
      .forEach(item => {
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
};

export const renderValue = (value, advancedSetting) => dealMaskValue({ value, advancedSetting });

const getTotalCount = (data, index) => {
  return data
    .map(item => {
      const key = Object.keys(item)[0];
      const res = item[key];
      const value = res[index];
      return value.includes('subTotal') ? value : null;
    })
    .filter(_ => _);
};

/**
 * 合并行
 */
export const mergeLinesCell = (data, lines, valueMap, config) => {
  const { pageSize, freeze, freezeIndex, mergeCell = true } = config;
  const fIndex = freezeIndex + 1;
  const isFreeze = freeze && _.isNumber(freezeIndex);

  const result = mergeTableCell(
    data.map((item, index) => {
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
              subTotalName: _.get(_.find(lines, { cid: showId }), 'subTotalName') || _l('总计'),
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
      const name = target.rename || target.controlName;
      const { xaxisEmptyType } = target;
      /*
      if (isTime) {
        return {
          key,
          xaxisEmptyType,
          name: target.particleSizeType
            ? `${name}(${_.find(timeParticleSizeDropdownData, { value: target.particleSizeType }).text})`
            : name,
          data: res,
        };
      }
      if (isArea) {
        return {
          key,
          xaxisEmptyType,
          name: target.particleSizeType
            ? `${name}(${_.find(areaParticleSizeDropdownData, { value: target.particleSizeType }).text})`
            : name,
          data: res,
        };
      }
      */
      return {
        key,
        xaxisEmptyType,
        name,
        data: res,
      };
    }),
    pageSize,
    mergeCell,
  );

  const parse = value => {
    let result = value;

    try {
      let res = JSON.parse(value);

      if (_.isArray(res)) {
        res = res.map(item => {
          return parse(item);
        });
      }

      result = res;
    } catch (err) {
      console.log(err);
    }

    return result;
  };

  result.forEach(item => {
    const control = _.find(lines, { cid: item.key }) || {};
    const advancedSetting = control.advancedSetting || {};
    const defaultEmpty = item.xaxisEmptyType ? '--' : ' ';
    item.data = item.data.map(n => {
      if (_.isNull(n)) return n;
      // 异化下，检查项不匹配 valueMap
      const valueKey =
        control.displayMode === 'fieldStyle' &&
        control.controlType === WIDGETS_TO_API_TYPE_ENUM.SWITCH &&
        advancedSetting.showtype === '0'
          ? {}
          : valueMap[item.key];

      if (_.isObject(n)) {
        const defaultValue = n.value.includes('subTotal') ? n.value : defaultEmpty;
        return {
          ...n,
          value: valueKey
            ? valueKey[n.value]
              ? renderValue(valueKey[n.value], advancedSetting)
              : n.value || defaultValue
            : renderValue(n.value, advancedSetting),
        };
      } else {
        const defaultValue = n.includes('subTotal') ? n : defaultEmpty;
        return valueKey
          ? valueKey[n]
            ? renderValue(valueKey[n], advancedSetting)
            : n || defaultValue
          : renderValue(n, advancedSetting);
      }
    });
    if (control.controlType === 29) {
      item.data = item.data.map(item => {
        if (_.isObject(item)) {
          return {
            ...item,
            value: parse(item.value),
          };
        } else {
          return parse(item);
        }
      });
    }
  });

  return result;
};

export const getColumnName = column => {
  const { rename, controlName } = column;
  const name = rename || controlName;
  /*
  const isTime = isTimeControl(controlType);
  const isArea = isAreaControl(controlType);
  if (isTime) {
    return particleSizeType
      ? `${name}(${_.find(timeParticleSizeDropdownData, { value: particleSizeType }).text})`
      : name;
  }
  if (isArea) {
    return particleSizeType
      ? `${name}(${_.find(areaParticleSizeDropdownData, { value: particleSizeType }).text})`
      : name;
  }
  */
  return name;
};

export const getControlMinAndMax = (yaxisList, data) => {
  const result = {};
  const valuesMap = {};

  yaxisList.forEach(item => {
    valuesMap[item.controlId] = [];
  });

  data.forEach(item => {
    if (!item.summary_col && Object.prototype.hasOwnProperty.call(valuesMap, item.t_id)) {
      valuesMap[item.t_id].push(item.data);
    }
  });

  yaxisList.forEach(item => {
    const values = _.flatten(valuesMap[item.controlId]);
    const min = _.min(values) || 0;
    const max = _.max(values);
    const center = (max + min) / 2;

    result[item.controlId] = {
      min,
      max,
      center,
    };
  });

  return result;
};

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
};

const getCompiledScopeRuleColor = (value, controlMinAndMax = {}, scopeRules = [], emptyShowType) => {
  let result = null;

  scopeRules.forEach(rule => {
    const { type, and, color } = rule;
    const minValue = rule.dynamicMin ? controlMinAndMax.min || 0 : rule.min;
    const maxValue = rule.dynamicMax ? controlMinAndMax.max || 0 : rule.max;

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

    if (type === 4 && (emptyShowType === 1 ? _.isNull(value) : !value)) {
      result = color;
    }
  });

  return result;
};

export const getCompiledStyleColor = ({
  value = 0,
  controlMinAndMax = {},
  rule,
  controlId,
  record = {},
  emptyShowType,
}) => {
  const { model, applyValue } = rule;

  if (model === 1 && isApplyStyle(applyValue, record.key)) {
    const applyControl = controlMinAndMax[rule.rangeControlId];
    const minValue = _.isNumber(rule.minValue) ? rule.minValue : applyControl ? applyControl.min : 0;
    const maxValue = _.isNumber(rule.maxValue) ? rule.maxValue : applyControl ? applyControl.max : 0;
    const centerValue = _.isNumber(rule.centerValue) ? rule.centerValue : applyControl ? applyControl.center : 0;
    let percent = 0;

    if (rule.centerVisible) {
      percent = ((value - centerValue) / (maxValue - centerValue)) * 50 + 50;
    } else {
      percent = ((value - minValue) / (maxValue - minValue)) * 100;
    }

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

    return rule.colors[percent];
  }

  if (model === 2) {
    return getCompiledScopeRuleColor(
      value,
      controlMinAndMax[rule.rangeControlId || controlId],
      rule.scopeRules,
      emptyShowType,
    );
  }
};

export const getCompiledBarStyleColor = ({ value, controlMinAndMax = {}, rule }) => {
  const minValue = _.isNumber(rule.minValue) ? rule.minValue : rule.useDefaultMin ? 0 : controlMinAndMax.min || 0;
  const maxValue = _.isNumber(rule.maxValue) ? rule.maxValue : controlMinAndMax.max || 0;
  const barStyle = {};

  if (rule.direction === 1) {
    barStyle.left = 0;
  }

  if (rule.direction === 2) {
    barStyle.right = 0;
  }

  let percent = parseInt(((value - minValue) / (maxValue - minValue)) * 100);

  if (percent >= 100) {
    percent = 100;
  }

  if (percent <= 0) {
    percent = 0;
  }

  if (value < minValue) {
    percent = 0;
  }

  if (rule.axisColor) {
    barStyle[rule.direction === 1 ? 'borderLeft' : 'borderRight'] = `1px dashed ${rule.axisColor}`;
  }

  barStyle.width = `${percent}%`;
  barStyle.backgroundColor = value >= 0 ? rule.positiveNumberColor : rule.negativeNumberColor;
  return barStyle;
};

export const getStyleRuleValue = ({ rule, value, controlId, columnIndex, record, recordIndex, result }) => {
  if (controlId === rule.sourceControlId) {
    return value;
  }

  if (record.type === 'line') {
    const colorRuleData = result[columnIndex + rule.sourceIndex] || {};
    return colorRuleData.sum;
  } else {
    const colorRuleData = _.get(result[columnIndex + rule.sourceIndex], 'data') || [];
    return colorRuleData[recordIndex];
  }
};

export const compileColorRuleConfig = (yaxisList, colorRules = []) => {
  const yaxisMap = {};
  const yaxisIndexMap = {};
  const colorRuleMap = {};
  const rangeControlIdMap = {};

  const addRangeControlId = id => {
    if (id) {
      rangeControlIdMap[id] = true;
    }
  };

  yaxisList.forEach((item, index) => {
    yaxisMap[item.controlId] = item;
    yaxisIndexMap[item.controlId] = index;
  });

  const compileStyleRule = (rule, defaultControlId) => {
    if (!rule || !rule.model) {
      return {};
    }

    const sourceControlId = rule.controlId;
    const sourceIndex = _.isNumber(yaxisIndexMap[sourceControlId]) ? yaxisIndexMap[sourceControlId] : -1;
    const data = {
      ...rule,
      sourceControlId,
      sourceIndex,
    };

    if (rule.model === 1) {
      const { min = {}, max = {}, center = {}, centerVisible, controlId } = rule;
      const needMinMax = !_.isNumber(min.value) || !_.isNumber(max.value);
      const needCenter = centerVisible && !_.isNumber(center.value);

      if (needMinMax || needCenter) {
        addRangeControlId(controlId);
      }

      return {
        ...data,
        rangeControlId: controlId,
        minValue: _.isNumber(min.value) ? min.value : undefined,
        maxValue: _.isNumber(max.value) ? max.value : undefined,
        centerValue: _.isNumber(center.value) ? center.value : undefined,
      };
    }

    if (rule.model === 2) {
      const rangeControlId = rule.controlId || defaultControlId;
      const scopeRules = (rule.scopeRules || []).map(item => {
        return {
          ...item,
          dynamicMin: [1, 2].includes(item.type) && !_.isNumber(item.min),
          dynamicMax: [1, 2].includes(item.type) && !_.isNumber(item.max),
        };
      });
      const needRange = scopeRules.some(item => item.dynamicMin || item.dynamicMax);

      if (needRange) {
        addRangeControlId(rangeControlId);
      }

      return {
        ...data,
        rangeControlId,
        scopeRules,
      };
    }

    return data;
  };

  const compileDataBarRule = (rule, controlId) => {
    if (!rule) {
      return undefined;
    }

    const useDefaultMin = _.isUndefined(rule.min);
    const dynamicMin = !useDefaultMin && !_.isNumber(rule.min);
    const dynamicMax = !_.isNumber(rule.max);

    if (dynamicMin || dynamicMax) {
      addRangeControlId(controlId);
    }

    return {
      ...rule,
      rangeControlId: controlId,
      useDefaultMin,
      dynamicMin,
      dynamicMax,
      minValue: _.isNumber(rule.min) ? rule.min : undefined,
      maxValue: _.isNumber(rule.max) ? rule.max : undefined,
    };
  };

  colorRules.forEach(item => {
    if (item && item.controlId) {
      colorRuleMap[item.controlId] = {
        ...item,
        textColorRule: compileStyleRule(item.textColorRule, item.controlId),
        bgColorRule: compileStyleRule(item.bgColorRule, item.controlId),
        dataBarRule: compileDataBarRule(item.dataBarRule, item.controlId),
      };
    }
  });

  return {
    yaxisMap,
    yaxisIndexMap,
    colorRuleMap,
    rangeControlIds: yaxisList.map(item => item.controlId).filter(id => rangeControlIdMap[id]),
  };
};

export const getLineSubTotal = (data = [], index) => {
  let count = '';

  for (let i = index; i < data.length; i++) {
    if (data[i] && _.isString(data[i]) && data[i].includes('subTotal')) {
      count = data[i];
      break;
    }
  }

  return count;
};
