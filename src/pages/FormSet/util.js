import _ from 'lodash';
import { allSwitchKeys } from 'src/pages/FormSet/containers/FunctionalSwitch/config.js';

export const isOpenPermit = (type, list = [], viewId) => {
  if (Array.isArray(list)) {
    list = list.length > 0 ? formatSwitches(list) : list;
    let data = list.find(o => o.type === type);

    if (!data || list.length <= 0) {
      return false;
    }

    if (type < 20 || [40, 50, 51].includes(type)) {
      //无需设置权限范围的项
      return data.state;
    } else if (!viewId) {
      return !!data.state;
    }

    // data.viewIds.length <= 0 所有视图
    return !!data.state && (data.viewIds.includes(viewId) || data.viewIds.length <= 0);
  }

  return false;
};

export const refreshBtnData = (data, btns, isAdd) => {
  let btnData = data;
  if (isAdd) {
    btnData.push(btns);
    return btnData;
  }
  return data.map(o => {
    if (o.btnId === btns.btnId) {
      return btns;
    } else {
      return o;
    }
  });
};
//兼容没返回的功能开关枚举
export const formatSwitches = switches => {
  return allSwitchKeys.map(o => {
    const it = (switches || []).find(it => it.type === o);
    if (!it) {
      return { type: o, state: true, viewIds: [] };
    }
    return it;
  });
};

/**
 *
 * 使用范围
 * @param {*} item
 * @param {*} views
 * @returns
 */
export const renderViewScopeText = ({ item = {}, views = [] }) => {
  if (item.isAllView) {
    return _l('所有记录');
  }

  let listViews = safeParse(_.get(item, 'advancedSetting.listviews'), 'array');
  const canBatchViewIds = views
    .filter(o => o.viewType === 0 || (o.viewType === 2 && _.get(o, 'advancedSetting.hierarchyViewType') === '3'))
    .map(o => o.viewId);
  listViews = listViews.filter(o => canBatchViewIds.includes(o));
  const dt = safeParse(_.get(item, 'advancedSetting.detailviews'), 'array');
  const noBatch = (item.writeObject === 2 || item.writeType === 2) && item.clickType === 3; //填写且配置了关联=>不能设置成批量按钮
  const allList = !noBatch ? [...dt, ...listViews] : dt;
  const data = _.uniq(allList);
  if (data.length > 0) {
    let str = data
      .map(item => {
        let view = views.find(o => o.viewId === item) || {};
        return view.name;
      })
      .filter(l => l)
      .join(',');
    return str;
  }
  return _l('未分配视图');
};
