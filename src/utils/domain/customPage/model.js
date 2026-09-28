import { generate } from '@ant-design/colors';
import { TinyColor } from '@ctrl/tinycolor';
import _, { get, maxBy } from 'lodash';

const enumObj = obj => {
  Object.keys(obj).forEach(key => {
    obj[obj[key]] = key;
  });
  return obj;
};

export const enumWidgetType = enumObj({
  analysis: 1,
  richText: 2,
  embedUrl: 3,
  button: 4,
  view: 5,
  filter: 6,
  carousel: 7,
  ai: 8,
  tabs: 9,
  card: 10,
  image: 11,
  subsection: 12,
});

/** 将自定义页面组件的数值类型转换为类型名称。 */
export const getEnumType = type => (typeof type === 'number' ? enumWidgetType[type] : type);

/** 根据组件类型和终端生成默认网格布局。 */
export const getDefaultLayout = ({
  components = [],
  index = components.length,
  layoutType = 'web',
  titleVisible,
  type,
}) => {
  if (layoutType === 'web') {
    if (['view', 'tabs'].includes(type)) {
      return { x: (components.length * 24) % 48, y: Infinity, w: 48, h: 10, minW: 2, minH: 6 };
    }

    if (type === 'filter') {
      return { x: (components.length * 24) % 48, y: Infinity, w: 48, h: 4, minW: 2, minH: 3 };
    }

    if (type === 'image') {
      return { x: (components.length * 24) % 48, y: Infinity, w: 48, h: 10, minW: 2, minH: 4 };
    }

    if (type === 'subsection') {
      return { x: (components.length * 24) % 48, y: Infinity, w: 48, h: 3, minW: 48, minH: 2 };
    }

    return { x: (components.length * 24) % 48, y: Infinity, w: 24, h: 12, minW: 2, minH: 4 };
  }

  if (layoutType === 'mobile') {
    const componentType = _.get(components[index], 'type');
    const { y = 0, h = 6 } = maxBy(components, item => get(item, ['mobile', 'layout', 'y'])) || {};
    const enumType = getEnumType(componentType);
    const minW = enumType === 'button' ? 2 : 1;

    if (['view', 'tabs'].includes(enumType)) {
      return { x: 0, y: y + h, w: 4, h: titleVisible ? 9 : 8, minW, minH: 4 };
    }

    if (enumType === 'filter') return { x: 0, y: y + h, w: 4, h: 2, minW, minH: 1 };
    if (enumType === 'image') {
      return { x: 0, y: y + h, w: 4, h: titleVisible ? 9 : 8, minW, minH: 2 };
    }

    if (enumType === 'subsection') return { x: 0, y: y + h, w: 4, h: 1, minW: 4, minH: 1 };
    return { x: 0, y: y + h, w: 4, h: titleVisible ? 7 : 6, minW, minH: 2 };
  }
};

/** 按 Web 布局位置生成移动端组件排列顺序。 */
export const reorderComponents = components => {
  if (_.every(components, item => _.get(item, ['mobile', 'layout']))) return false;
  const groups = _.groupBy(components, item => _.get(item, ['web', 'layout', 'y']));
  return _.flattenDeep(
    _.sortBy(_.keys(groups), item => +item).map(key =>
      _.sortBy(groups[key], item => _.get(item, ['web', 'layout', 'x'])),
    ),
  );
};

/** 补齐指定终端下各组件的可渲染布局。 */
export const getLayout = (components, layoutType) =>
  components.map((item = {}, index) => {
    const { id } = item;
    const { layout, titleVisible } = item[layoutType] || {};
    return layout
      ? { ...layout, i: `${id || index}` }
      : { ...getDefaultLayout({ components, index, layoutType, titleVisible }), i: `${id || index}` };
  });

/** 获取有效布局占用的最大行数，忽略缺失或非法布局。 */
export const getMaxLayoutHeight = (components = [], layoutType = 'web') =>
  _.max(
    components
      .map(item => _.get(item, [layoutType, 'layout']))
      .filter(layout => layout && Number.isFinite(layout.h) && Number.isFinite(layout.y))
      .map(layout => layout.h + layout.y),
  );

/** 根据主题色替换自定义页面的派生配色。 */
export const replaceColor = (config, iconColor) => {
  const iconColors = iconColor ? generate(iconColor) : [];
  const lightColor = iconColors[0];
  const data = { ...config };

  if (config.pageStyleType === 'dark') {
    data.widgetBgColor =
      data.pageBgColor === 'iconColor10' || data.pageBgColor === 'iconColor' ? iconColors[8] : '#2A2D2F';
  } else {
    data.widgetBgColor = '#fff';
  }

  if (data.pageBgColor === 'iconColor10') data.pageBgColor = iconColors[9];
  if (data.widgetBgColor === data.pageBgColor) {
    data.widgetBgColor = iconColors[7];
    data.pageBgColor = iconColors[8];
  }

  if (data.pageBgColor === 'iconColor') {
    data.pageBgColor = iconColor;
    data.darkenPageBgColor = new TinyColor(iconColor).darken(6).toRgbString();
  }

  if (data.pageBgColor === 'lightColor') data.pageBgColor = lightColor;
  if (data.pivoTableColor === 'iconColor') data.pivoTableColor = iconColor;
  if (data.pivoTableColor === 'lightColor') data.pivoTableColor = lightColor;
  if (data.numberChartColor === 'iconColor') data.numberChartColor = iconColor;
  if (data.numberChartColor === 'lightColor') data.numberChartColor = lightColor;
  return data;
};
