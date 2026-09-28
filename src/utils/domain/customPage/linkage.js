import _ from 'lodash';
import moment from 'moment';
import { redefineComplexControl } from 'src/utils/domain/control/normalization';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/utils/domain/control/widgetTypes';
import { formatConditionForSave, getDefaultCondition } from 'src/utils/domain/worksheet/filterCondition';
import { FILTER_CONDITION_TYPE } from 'src/utils/domain/worksheet/filterConstants';

function getQuarterDateRange(year, quarter) {
  let startMonth, endMonth;

  switch (quarter) {
    case 1:
      startMonth = 1;
      endMonth = 3;
      break;
    case 2:
      startMonth = 4;
      endMonth = 6;
      break;
    case 3:
      startMonth = 7;
      endMonth = 9;
      break;
    case 4:
      startMonth = 10;
      endMonth = 12;
      break;
    default:
      throw new Error('Invalid quarter');
  }

  const startOfQuarter = moment()
    .year(year)
    .month(startMonth - 1)
    .startOf('month');
  const endOfQuarter = moment()
    .year(year)
    .month(endMonth - 1)
    .endOf('month');

  return [startOfQuarter, endOfQuarter];
}

/** 将自定义页面的图表联动条件转换为工作表查询条件。 */
export const formatLinkageFiltersGroup = ({ sheetId, reportId, objectId }, linkageFiltersGroup) => {
  const result = [];

  for (let key in linkageFiltersGroup) {
    const data = linkageFiltersGroup[key];
    const { onlyChartIds = [] } = data;

    if (
      data.sheetId === sheetId &&
      reportId !== data.reportId &&
      (onlyChartIds.length ? onlyChartIds.includes(objectId) : true)
    ) {
      result.push({
        ...data,
        filters: data.filters.map(item => {
          const { control } = item;
          const { dataType, filterType } = formatConditionForSave(getDefaultCondition(redefineComplexControl(item)));
          const data = {
            ...item,
            type: undefined,
            controlName: undefined,
            controlValue: undefined,
            control: undefined,
            spliceType: 1,
            dataType,
            filterType,
          };

          // 如果内容为空，按照为空查找
          if (_.isNull(data.values[0]) || _.isUndefined(data.values[0]) || data.values[0] === '') {
            data.filterType = FILTER_CONDITION_TYPE.ISNULL;
            data.values = [];
            return data;
          }

          // 处理维度作为数值字段查找
          if (
            item.type === WIDGETS_TO_API_TYPE_ENUM.NUMBER ||
            item.type === WIDGETS_TO_API_TYPE_ENUM.MONEY ||
            item.type === WIDGETS_TO_API_TYPE_ENUM.FORMULA_NUMBER
          ) {
            data.filterType = FILTER_CONDITION_TYPE.EQ;
            data.value = data.values[0];
            data.values = [];
            return data;
          }

          // 子表和关联表按照关联表查找
          if (item.type === WIDGETS_TO_API_TYPE_ENUM.SUB_LIST || item.type === WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET) {
            data.dataType = WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET;
            data.filterType = FILTER_CONDITION_TYPE.RCEQ;
            return data;
          }

          // 处理日期格式字段
          if (
            item.type === WIDGETS_TO_API_TYPE_ENUM.DATE ||
            (item.type === WIDGETS_TO_API_TYPE_ENUM.DATE_TIME && control)
          ) {
            const { particleSizeType = 1 } = control;
            const value = data.values[0];

            // 日、分、秒
            if ([1, 7, 13].includes(particleSizeType)) {
              data.dateRangeType = 1;
              data.filterType = FILTER_CONDITION_TYPE.DATE_EQ;
              data.value = moment(value).format('YYYY-MM-DD');
              data.values = [];
            }

            // 周
            if (particleSizeType === 2) {
              const [year, week] = value.split('W');
              const start = moment().year(year).week(week).startOf('week');
              const end = moment().year(year).week(week).endOf('week');
              data.filterType = FILTER_CONDITION_TYPE.DATE_BETWEEN;
              data.minValue = start.format('YYYY-MM-DD');
              data.maxValue = end.format('YYYY-MM-DD');
              data.values = [];
            }

            // 月
            if (particleSizeType === 3) {
              const [year, month] = value.split('/');
              const start = moment()
                .year(year)
                .month(month - 1)
                .startOf('month');
              const end = moment()
                .year(year)
                .month(month - 1)
                .endOf('month');
              data.filterType = FILTER_CONDITION_TYPE.DATE_BETWEEN;
              data.minValue = start.format('YYYY-MM-DD');
              data.maxValue = end.format('YYYY-MM-DD');
              data.values = [];
            }

            // 季度
            if (particleSizeType === 4) {
              const [year, quarter] = value.split('Q');
              const [start, end] = getQuarterDateRange(year, Number(quarter));
              data.filterType = FILTER_CONDITION_TYPE.DATE_BETWEEN;
              data.minValue = start.format('YYYY-MM-DD');
              data.maxValue = end.format('YYYY-MM-DD');
              data.values = [];
            }

            // 年
            if (particleSizeType === 5) {
              const year = value;
              const start = moment().year(year).startOf('year');
              const end = moment().year(year).endOf('year');
              data.filterType = FILTER_CONDITION_TYPE.DATE_BETWEEN;
              data.minValue = start.format('YYYY-MM-DD');
              data.maxValue = end.format('YYYY-MM-DD');
              data.values = [];
            }

            // 时
            if (particleSizeType === 6) {
              data.dateRangeType = 1;
              data.filterType = FILTER_CONDITION_TYPE.DATE_EQ;
              data.value = moment(`${value}:00`).format('YYYY-MM-DD');
              data.values = [];
            }

            return data;
          }

          // 处理时间格式字段
          if (item.type === WIDGETS_TO_API_TYPE_ENUM.TIME) {
            const value = data.values[0];
            data.filterType = FILTER_CONDITION_TYPE.DATEENUM;
            data.value = value;
            data.values = [];
          }

          // 地区改为在范围内
          if (
            item.type === WIDGETS_TO_API_TYPE_ENUM.AREA_CITY ||
            item.type === WIDGETS_TO_API_TYPE_ENUM.AREA_COUNTY ||
            item.type === WIDGETS_TO_API_TYPE_ENUM.AREA_PROVINCE
          ) {
            data.filterType = FILTER_CONDITION_TYPE.BETWEEN;
          }

          // 级联选择改为在范围内
          if (item.type === WIDGETS_TO_API_TYPE_ENUM.CASCADER) {
            data.filterType = FILTER_CONDITION_TYPE.BETWEEN;
          }

          return data;
        }),
      });
    }
  }

  const filters = _.flatten(
    result.map(item => {
      return item.filters;
    }),
  );
  const initiateChartIds = result.map(item => item.widgetId);
  return {
    linkageFiltersGroup: filters,
    initiateChartIds,
  };
};
