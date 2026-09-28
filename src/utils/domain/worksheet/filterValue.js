import _ from 'lodash';
import { FILTER_CONDITION_TYPE } from './filterConstants';

/** 将对象型筛选值转换为服务端使用的 id 列表。 */
export function formatValues(controlType, filterType, values = []) {
  try {
    // 为空，不为空, 常规用户, 外部门户用户
    if (
      _.includes(
        [
          FILTER_CONDITION_TYPE.ISNULL,
          FILTER_CONDITION_TYPE.HASVALUE,
          FILTER_CONDITION_TYPE.NORMALUSER,
          FILTER_CONDITION_TYPE.PORTALUSER,
        ],
        filterType,
      )
    ) {
      return values;
    }

    if (_.includes([26, 27, 19, 23, 24, 29, 35, 48], controlType)) {
      return values.map(value => safeParse(value).id).filter(_.identity);
    }
  } catch (err) {
    console.log(err);
  }

  return values;
}

/** 规范化单条或分组筛选条件的 values。 */
export function formatValuesOfCondition(condition) {
  return condition.isGroup && condition.groupFilters
    ? {
        ...condition,
        groupFilters: condition.groupFilters.map(c => ({
          ...c,
          values: formatValues(c.dataType, c.filterType, c.values),
        })),
      }
    : {
        ...condition,
        values: formatValues(condition.dataType, condition.filterType, condition.values),
      };
}

/** 批量规范化服务端筛选条件的 values。 */
export function formatValuesOfOriginConditions(conditions) {
  return conditions.map(condition =>
    condition.isGroup && condition.groupFilters
      ? {
          ...condition,
          groupFilters: condition.groupFilters.map(c => ({
            ...c,
            values: formatValues(c.dataType, c.filterType, c.values),
          })),
        }
      : {
          ...condition,
          values: formatValues(condition.dataType, condition.filterType, condition.values),
        },
  );
}
