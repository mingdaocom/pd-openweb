import _, { get } from 'lodash';
import { isSheetDisplay } from './style';
import { ALL_SYS, SYS_CONTROLS } from './widget';
import { WIDGETS_TO_API_TYPE_ENUM } from './widgetTypes';

/** 筛选字段并转换为通用下拉选项结构。 */
export const filterControlsFromAll = (allControls = [], filter = item => item) => {
  return allControls.filter(filter).map(({ controlId, controlName }) => ({ value: controlId, text: controlName }));
};

/** 将有效视图转换为下拉选项结构。 */
export const formatViewToDropdown = views =>
  views.filter(l => l.viewId !== l.worksheetId).map(({ viewId, name }) => ({ text: name, value: viewId }));

/** 将应用列表转换为下拉选项并标记当前应用。 */
export const formatAppsToDropdown = (apps, currentAppId) =>
  apps.map(({ appId, appName }) => ({
    text: appId === currentAppId ? `${appName}（ ${_l('本应用')} ）` : `${appName}`,
    value: appId,
  }));

/** 将字段列表转换为下拉选项结构。 */
export const formatControlsToDropdown = controls =>
  controls.map(({ controlId, controlName }) => ({ text: controlName, value: controlId }));

/** 按字段标识查找字段，并可读取指定属性。 */
export const getControlByControlId = (controls, controlId, key) => {
  const control = _.find(controls, item => item.controlId === controlId) || {};
  return key ? get(control, key) : control;
};

/** 过滤仅用于展示且不可直接选择的他表字段。 */
export const filterOnlyShowField = (controls = []) => {
  return controls.filter(i => !((i.type === 30 || i.originType === 30) && (i.strDefault || '')[0] === '1'));
};

/** 判断字段是否为仅展示的他表字段。 */
export const isOtherShowFeild = (control = {}) => {
  return (control.type === 30 || control.originType === 30) && (control.strDefault || '')[0] === '1';
};

/** 将查询模板数据合并到每条查询配置。 */
export const formatSearchConfigs = (res = {}) => {
  if (!(res.queries || []).length) return [];
  return res.queries.map(item => {
    return { ...item, templates: [{ controls: (res.templates || {})[item.sourceId] || [] }] };
  });
};

// 支持左右布局的控件

/** 过滤关联和查询字段不可展示的系统或布局字段。 */
export const getFilterRelateControls = ({ controls = [], showControls = [], data = {} }) => {
  const filterIds = [
    WIDGETS_TO_API_TYPE_ENUM.SPLIT_LINE,
    WIDGETS_TO_API_TYPE_ENUM.OCR,
    WIDGETS_TO_API_TYPE_ENUM.EMBED,
    WIDGETS_TO_API_TYPE_ENUM.SEARCH_BTN,
    WIDGETS_TO_API_TYPE_ENUM.RELATION_SEARCH,
    WIDGETS_TO_API_TYPE_ENUM.SECTION,
    WIDGETS_TO_API_TYPE_ENUM.REMARK,
    ...SYS_CONTROLS,
  ];

  // 列表形态支持条码
  if (!isSheetDisplay(data)) {
    filterIds.push(WIDGETS_TO_API_TYPE_ENUM.BAR_CODE);
  }

  return _.filter(controls, item => !_.includes(filterIds, item.type) || _.includes(showControls, item.controlId));
};

// 标签页内不支持的控件

/** 过滤字段列表中的系统字段。 */
export const filterSysControls = (controls = []) => {
  return controls.filter(c => !_.includes(ALL_SYS, c.controlId));
};

// 拖拽补key,完成去key
/** 为拖拽排序项添加临时键或移除临时键。 */
export const getSortItems = (items = [], addKey, controlId = '') => {
  return items.map((i, index) => {
    return addKey ? { ...i, key: `${controlId}item_${index}` } : { ..._.omit(i, ['key']) };
  });
};

// 自定义控件
