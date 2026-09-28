import _ from 'lodash';
import { filterHidedControls } from 'src/utils/domain/control/sort';
import { ALL_SYS } from 'src/utils/domain/control/widget';
import { VIEW_DISPLAY_TYPE } from 'src/utils/domain/worksheet/constants';
import { baseSetList, VIEW_CONFIG_EXCLUDED_CONTROL_TYPES } from './config';
import { sortControls } from './util';

// 插件自定义视图 source=0 表示开发态，只有开发态才展示插件设置、调试等开发入口。
export const isDevCustomView = view => (_.get(view, 'pluginInfo') || {}).source === 0;

// 首次打开视图配置时，根据视图类型取左侧菜单的默认选中项。
export const getDefaultViewSetting = view => {
  return baseSetList[VIEW_DISPLAY_TYPE[_.get(view, 'viewType') || 0]][0];
};

// 切换视图时优先使用外部指定 tab；否则开发态插件视图默认进插件设置，普通视图进基础设置。
export const getViewSettingOnViewChange = (view, viewConfigTab) => {
  if (viewConfigTab) {
    return viewConfigTab;
  }

  return VIEW_DISPLAY_TYPE[view.viewType] === 'customize' && isDevCustomView(view) ? 'PluginSettings' : 'Setting';
};

// 字段配置需要保留拥有者字段，其它系统字段不进入可配置列表。
export const formatColumnsListForControlsWithoutHide = (columns = []) => {
  const data = columns.filter(column => !ALL_SYS.includes(column.controlId));
  return columns.filter(o => o.controlId === 'ownerid').concat(data.filter(o => o.controlId !== 'ownerid'));
};

// 卡片外观、看板外观、地图等配置复用的字段列表：过滤隐藏字段和不适合做展示字段的控件。
export const getCardSettingColumns = (columns = [], hiddenControlIds = []) => {
  return sortControls(
    filterHidedControls(columns, hiddenControlIds, false).filter(
      c => !!c.controlName && !_.includes(VIEW_CONFIG_EXCLUDED_CONTROL_TYPES, c.type),
    ),
  );
};

// 封面字段允许嵌入等更多控件类型，只排除隐藏字段和无名称字段。
export const getCoverColumns = (columns = [], hiddenControlIds = []) => {
  return filterHidedControls(columns, hiddenControlIds, false).filter(c => !!c.controlName);
};
