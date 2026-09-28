import _, { get } from 'lodash';
import { VIEW_DISPLAY_TYPE } from 'src/utils/domain/worksheet/constants';

/**
 * 从快速筛选项中提取服务端查询所需的字段。
 */
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

/**
 * 判断层级视图或甘特图是否应隐藏视图筛选器。
 */
export function needHideViewFilters(view) {
  return (
    (String(view.viewType) === VIEW_DISPLAY_TYPE.structure &&
      !_.includes([0, 1], Number(view.childType)) &&
      get(view, 'advancedSetting.hierarchyViewType') === '3') ||
    String(view.viewType) === VIEW_DISPLAY_TYPE.gunter
  );
}
