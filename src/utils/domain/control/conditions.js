import { isEmpty } from 'lodash';
import _ from 'lodash';
import { getAdvanceSetting, handleAdvancedSettingChange } from './advancedSetting';

/** 按字段类型规范化筛选条件值，并处理关联字段动态来源。 */
export function handleCondition(condition, isRelate) {
  // 关联记录(动态值只能选择当前记录字段)特殊处理 rcid置空
  if (_.isBoolean(isRelate) && isRelate && !isEmpty(condition.dynamicSource)) {
    condition.dynamicSource.forEach(item => (item.rcid = ''));
  }

  if (_.includes([19, 23, 24, 26, 27, 29, 35, 48], condition.dataType) && condition.values) {
    return {
      ...condition,
      values: condition.values.map(value => {
        try {
          const da = JSON.parse(value);

          if (typeof da === 'object') {
            return da.id;
          } else {
            return value;
          }
        } catch (e) {
          console.log(e);
          return value;
        }
      }),
    };
  } else {
    return condition;
  }
}

/**
 * 处理关联表叠加筛选条件里的 成员 部门 地区 他表字段 级联 这几个类型的字段 values 处理成 [id, id]
 */
export function handleFilters(data, isRelate = false, filterKey) {
  const keyName = filterKey ? filterKey : 'filters';
  const filters = getAdvanceSetting(data, [keyName]);

  try {
    let filtersValue = [];

    if (filters.some(item => item.groupFilters)) {
      filtersValue = filters.map(f => {
        return {
          ...f,
          groupFilters: (f.groupFilters || []).map(i => handleCondition(i, isRelate)),
        };
      });
    } else {
      filtersValue = filters.map(i => handleCondition(i, isRelate));
    }

    return handleAdvancedSettingChange(data, { [keyName]: JSON.stringify(filtersValue) });
  } catch (err) {
    console.log(err);
    return data;
  }
}
