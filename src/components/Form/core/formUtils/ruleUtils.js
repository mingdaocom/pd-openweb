import _ from 'lodash';

export const flattenArr = (obj = {}) => {
  return Object.values(obj).reduce((total, cur = []) => {
    return total.concat(_.flatten(cur));
  }, []);
};

export const getResult = (arr, index, result, available) => {
  if (!index) {
    return result;
  } else {
    return arr[index - 1].spliceType === 1 ? available && result : available || result;
  }
};

export const replaceStr = (str, index, value) => {
  return str.substring(0, index) + value + str.substring(index + 1);
};

// 过滤不必要走（字段都删除）的业务规则
export const getAvailableFilters = (rules = [], formatData = [], recordId) => {
  // 过滤禁用规则及单个且数组中字段全部删除情况
  // 注意如果是记录id，data里不包含系统字段，所以必须recordId存在才生效
  let filterRules = [];
  rules.forEach(rule => {
    if (!rule.disabled) {
      let filterTrs = [];
      (rule.filters || []).forEach(filterGroup => {
        if (
          _.some(filterGroup.groupFilters || [], filter =>
            _.get(filter, 'dynamicSource[0].cid') === 'rowid'
              ? recordId
              : _.findIndex(formatData, data => data.controlId === filter.controlId) > -1,
          )
        ) {
          filterTrs = filterTrs.concat(filterGroup);
        }
      });
      filterTrs.length > 0 && filterRules.push({ ...rule, filters: filterTrs });
    }
  });

  return {
    defaultRules: filterRules.filter(i => i.type === 0), // 交互规则
    errorOrStyleRules: filterRules.filter(i => _.includes([1, 3], i.type)), // 验证+样式规则
    errorRules: filterRules.filter(i => i.type === 1), // 验证规则
  };
};

// 是否关联多条列表
export function isRelateMoreList(control, condition) {
  return (
    control &&
    control.type === 29 &&
    control.enumDefault === 2 &&
    control.advancedSetting &&
    control.advancedSetting.showtype === '2' &&
    _.includes([24, 25], condition.filterType || condition.type)
  );
}
