import _ from 'lodash';

/**
 * 按视图自定义项顺序重排分组数据，并重新生成连续 sort 值。
 */
export function sortDataByCustomItems(data, view = {}, controls = [], firstNotSpecified = true) {
  let customItems = safeParse(_.get(view, 'advancedSetting.customitems'), 'array');

  if (_.get(view, 'advancedSetting.navshow') === '2') {
    customItems = safeParse(_.get(view, 'advancedSetting.navfilters'), 'array');
  }

  const viewControls = _.find(controls, control => control.controlId === view.viewControl);

  if (!_.isEmpty(customItems) && viewControls) {
    const sortIds = customItems.map(item => {
      const type = viewControls.type === 30 ? viewControls.sourceControlType : viewControls.type;

      if (_.includes([9, 10, 11, 28], type)) {
        return item;
      } else {
        const itemValue = safeParse(item);
        return itemValue.id || itemValue.accountId;
      }
    });
    const keyByOrder = new Map(sortIds.map((item, index) => [item, index]));
    const sortOriginData = _.sortBy(data, 'sort');
    let sortData = _.sortBy(sortOriginData, item => (item.key === '-1' ? -999 : keyByOrder.get(item.key)));

    if (!firstNotSpecified) {
      const [specialItems, regularItems] = _.partition(sortData, item => item.key === '-1');

      if (specialItems.length > 0) {
        sortData = [...regularItems, ...specialItems];
      }
    }

    return sortData.map((item, index) => ({ ...item, sort: index + 1 }));
  }

  return data;
}

/**
 * 按视图分组配置排序数据，并根据配置决定是否保留未分组项。
 */
export function sortDataByGroupItems(list = [], currentView = {}, controls = []) {
  const parsedGroupSettings = safeParse(_.get(currentView, 'advancedSetting.groupsetting'), 'array');
  const [groupSetting = {}] = Array.isArray(parsedGroupSettings) ? parsedGroupSettings : [];
  const sortedData = sortDataByCustomItems(
    [...list].sort((a, b) => {
      if (a.sort === -1) return 1;
      if (b.sort === -1) return -1;
      return a.sort - b.sort;
    }),
    {
      ...currentView,
      advancedSetting: {
        ...currentView.advancedSetting,
        customitems: _.get(currentView, 'advancedSetting.groupcustom'),
        navfilters: _.get(currentView, 'advancedSetting.groupfilters'),
        navshow: _.get(currentView, 'advancedSetting.groupshow'),
      },
      viewControl: groupSetting.controlId,
    },
    controls,
    false,
  );
  const nonNegativeOneItems = sortedData.filter(item => item.key !== '-1');

  if (_.get(currentView, 'advancedSetting.groupempty') !== '1') {
    return nonNegativeOneItems;
  }

  const negativeOneItems = sortedData.filter(item => item.key == '-1');
  return [...nonNegativeOneItems, ...negativeOneItems];
}
