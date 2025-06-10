import _, { get } from 'lodash';
import { VIEW_DISPLAY_TYPE } from 'worksheet/constants/enum';

export function formatQuickFilter(items = []) {
  return items.map(item =>
    _.pick(item, [
      'advancedSetting',
      'controlId',
      'dataType',
      'spliceType',
      'filterType',
      'dateRange',
      'dateRangeType',
      'value',
      'values',
      'minValue',
      'maxValue',
    ]),
  );
}

export function needHideViewFilters(view) {
  return (
    (String(view.viewType) === VIEW_DISPLAY_TYPE.structure &&
      !_.includes([0, 1], Number(view.childType)) &&
      get(view, 'advancedSetting.hierarchyViewType') === '3') ||
    String(view.viewType) === VIEW_DISPLAY_TYPE.gunter
  );
}
