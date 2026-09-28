import _ from 'lodash';
import { formatFileSize } from 'src/utils/core/file';

const subTypeNames = {
  1: _l('成员'),
  2: _l('外部门户用户'),
  3: _l('工作流'),
  4: _l('API'),
  5: _l('公开表单'),
  6: _l('其他'),
};

const DATE_VALUE_TO_DAY_RANGE = { 1: 5, 6: 0, 7: 1, 9: 2, 8: 3, 10: 4 };

export const USE_ANALYTICS_HIDDEN_DATE_VALUES = [0, 2, 3, 4, 5];

export const getDayRangeByDateValue = value => DATE_VALUE_TO_DAY_RANGE[value];

export const formatter = v => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const units = ['B', 'KB', 'MB', 'GB', 'TB'];

export const formatChartData = (type, initData = [], isFilterByDepartment) => {
  let data = [];

  switch (type) {
    case 'attachment':
      if (_.isEmpty(initData)) {
        initData = [{ value: 0, subType: 1 }];
      }

      _.forEach(initData, item => {
        const temp = [];
        _.forEach(isFilterByDepartment ? [1] : [1, 2, 3, 4, 5, 6], v => {
          const currentTypeValue = _.find(item.value || [], s => s.subType === v);

          if (!currentTypeValue) {
            temp.push({ value: 0, subType: v, date: item.date, category: subTypeNames[v] });
          } else {
            temp.push({
              value: currentTypeValue.size,
              subType: v,
              date: item.date,
              category: subTypeNames[v],
            });
          }
        });
        data = data.concat(temp);
      });

      let maxSize = Math.max(...data.map(item => item.value));
      const maxValue = formatFileSize(maxSize, 2);
      const unit = maxValue.slice(maxValue.length - 2);
      const index = _.findIndex(units, v => v === unit);
      data = data.map(v => ({
        ...v,
        value: (v.value / Math.pow(1024, index)).toFixed(2) * 1,
        unit,
      }));

      break;
    default:
  }

  return data;
};
