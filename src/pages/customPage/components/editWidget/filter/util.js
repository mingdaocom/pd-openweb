import _ from 'lodash';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';

export const formatFiltersGroup = (id, filtersGroup) => {
  const targets = _.flatten(Object.keys(filtersGroup).map(item => filtersGroup[item])).filter(c => _.find(c.objectControls, { objectId: id }));
  const filters = targets.map(f => {
    const { controlId } = _.find(f.objectControls, { objectId: id });
    const data = _.pick(f, [
      'dataType',
      'filterType',
      'dateRange',
      'value',
      'values',
      'minValue',
      'maxValue',
    ]);
    if (controlId === 'rowid') {
      data.filterType = 1;
    }
    return {
      ...data,
      spliceType: 1,
      controlId
    };
  }).filter(c => c.controlId);
  return filters;
}


const getShowType = control => _.get(control, 'advancedSetting.showtype');

const getControl = data => {
  const { dataType, objectControls = [] } = data || {};
  // 时间类型控件，找到刻度最小的控件显示
  if ([WIDGETS_TO_API_TYPE_ENUM.DATE].includes(dataType)) {
    const type = {
      '5': 3,
      '4': 2,
      '3': 1,
    };
    const res = objectControls.sort((a, b) => type[getShowType(a.control)] - type[getShowType(b.control)]);
    return res[0];
  }
  if ([WIDGETS_TO_API_TYPE_ENUM.DATE_TIME].includes(dataType)) {
    const type = {
      '2': 3,
      '1': 2,
      '6': 1,
    };
    const res = objectControls.sort((a, b) => type[getShowType(a.control)] - type[getShowType(b.control)]);
    return res[0];
  }
  return objectControls[0] || {};
}

export const formatFilters = filters => {
  return filters.map(data => {
    const defaultType = 26;
    const firstObjectControl = getControl(data) || {};
    const controlData = data.control ? data.control : firstObjectControl.control;
    const isDisable = (!firstObjectControl.controlId || !controlData);
    const control = {
      ...controlData,
      controlId: firstObjectControl.controlId || data.filterId,
      controlName: data.name,
      type: controlData ? controlData.type : defaultType
    };
    const { advancedSetting } = data;

    return {
      control,
      controlId: data.filterId,
      dataType: data.dataType,
      fid: data.filterId,
      type: data.dataType,
      advancedSetting: {
        ...advancedSetting,
        navfilters: advancedSetting.showNavfilters ? advancedSetting.showNavfilters : advancedSetting.navfilters,
      },
      className: isDisable ? 'disable' : '',
      objectControls: data.objectControls,
      ..._.pick(data, ['value', 'minValue', 'maxValue', 'dateRange', 'filterType', 'dateRangeType']),
      values: isDisable ? [] : data.values
    }
  });
}