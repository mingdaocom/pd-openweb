import { isEqual } from 'lodash';
import { CHANGE_STATUS } from '../constants';
import { createChangeRow, createIconChangeContent, formatChangedValue, getContrastSides } from './changeModel';

/**
 * GetPageCompare 的 data/originalData 是完整页面导出快照，页面本身位于 pages[0]。
 * 顶层还包含 componentLayouts、reports 等与页面组件关联的数据。
 */
const parsePageSnapshot = value => {
  const snapshot = safeParse(value);

  return {
    root: snapshot || {},
    page: snapshot?.pages?.[0] || {},
  };
};

/**
 * 自定义页面名称与图标由 GetPublishContrast 摘要提供。
 * 沙盒环境按 displayName/iconUrl → originalName/originalIconUrl 展示，正式环境交换两侧。
 */
export const getPageBasicInfoRows = (resource, options) => {
  if (!resource) return [];

  const { before, after } = getContrastSides(
    { name: resource.displayName, icon: resource.iconUrl },
    { name: resource.originalName, icon: resource.originalIconUrl },
    options,
  );
  const content = [];

  if (before.name !== after.name) {
    content.push(_l('名称：%0', formatChangedValue(before.name, after.name)));
  }

  if (before.icon !== after.icon) {
    content.push(createIconChangeContent(before.icon, after.icon));
  }

  return content.length ? [createChangeRow({ id: 'page-name-icon', name: _l('图标与名称'), content })] : [];
};

/**
 * 页面说明只比较 desc；页面配置比较配置面板实际维护的 config、adjustScreen 和 urlParams。
 * version、创建/修改时间等页面元数据不属于页面配置，不参与判断。
 */
const getPageInfoRows = (before, after) => {
  const rows = [];

  if (!isEqual(before.desc, after.desc)) {
    rows.push(createChangeRow({ id: 'page-description', name: _l('说明'), content: [CHANGE_STATUS.UPDATED] }));
  }

  const beforeConfig = {
    config: before.config,
    adjustScreen: before.adjustScreen,
    urlParams: before.urlParams,
  };
  const afterConfig = {
    config: after.config,
    adjustScreen: after.adjustScreen,
    urlParams: after.urlParams,
  };

  if (!isEqual(beforeConfig, afterConfig)) {
    rows.push(createChangeRow({ id: 'page-config', name: _l('页面配置'), content: [CHANGE_STATUS.UPDATED] }));
  }

  return rows;
};

const getComponentTypeName = type => {
  switch (type) {
    case 1:
      return _l('统计图');
    case 2:
      return _l('文本');
    case 3:
      return _l('嵌入url');
    case 4:
      return _l('按钮');
    case 5:
      return _l('视图');
    case 6:
      return _l('筛选器');
    case 7:
      return _l('轮播图');
    case 8:
      return _l('AI');
    case 9:
      return _l('标签页');
    case 10:
      return _l('卡片');
    case 11:
      return _l('图片');
    case 12:
      return _l('分段');
    default:
      return _l('组件');
  }
};

/** 自定义页面组件以接口返回的 id 作为跨快照身份。 */
const getComponentId = component => component?.id;

/**
 * 组件名称优先使用组件配置或 componentLayouts 中已配置的标题；
 * 未配置标题或组件不支持标题时，使用组件 type 对应的固定类型名称。
 */
const getComponentName = (component, snapshot) => {
  if (!component) return '';

  const valueTitle = safeParse(component.value)?.title;
  const layoutTitle = (snapshot?.root?.componentLayouts || []).find(
    layout => layout?.componentId === component.id,
  )?.title;

  return valueTitle || layoutTitle || component.title || getComponentTypeName(component.type);
};

/**
 * componentLayouts 通过明确的 componentId 归属于组件。
 * id 是快照内的布局记录标识，pageId 是快照页面标识，两者在不同快照中会自然变化，
 * 不属于组件布局配置，对比时只保留实际生效的显示与布局字段。
 */
const getComponentLayouts = (root, componentId) =>
  (root.componentLayouts || [])
    .filter(layout => layout?.componentId === componentId)
    .map(({ titleVisible, title, visible, layoutType, layout }) => ({
      titleVisible,
      title,
      visible,
      layoutType,
      layout,
    }));

const getComponentSnapshot = (snapshot, component) => ({
  component,
  layouts: getComponentLayouts(snapshot.root, getComponentId(component)),
});

/**
 * 组件按 id 配对：单侧存在为新增或删除；组件本身或通过明确 componentId 关联的布局不同时为更新。
 * reports 的归属关系未在接口文档和当前返回中给出，不在这里推测关联。
 * 沙盒环境中 data 是基线侧、originalData 是当前侧；正式环境由调用方交换两侧。
 */
const getComponentRows = (before, after) => {
  const beforeMap = new Map((before.page.components || []).map(component => [getComponentId(component), component]));
  const afterMap = new Map((after.page.components || []).map(component => [getComponentId(component), component]));

  return [...new Set([...beforeMap.keys(), ...afterMap.keys()])]
    .filter(Boolean)
    .map(id => {
      const beforeComponent = beforeMap.get(id);
      const afterComponent = afterMap.get(id);

      if (
        beforeComponent &&
        afterComponent &&
        isEqual(getComponentSnapshot(before, beforeComponent), getComponentSnapshot(after, afterComponent))
      ) {
        return null;
      }

      const action = !beforeComponent
        ? CHANGE_STATUS.ADDED
        : !afterComponent
          ? CHANGE_STATUS.DELETED
          : CHANGE_STATUS.UPDATED;

      return createChangeRow({
        id: `page-component-${id}`,
        name: afterComponent ? getComponentName(afterComponent, after) : getComponentName(beforeComponent, before),
        action,
        content: [action],
      });
    })
    .filter(Boolean);
};

/** 将 GetPageCompare 的两侧页面快照整理为基础信息和组件明细。 */
export const normalizePageContrastDetail = (detail, options) => {
  if (!detail) return {};

  const { before, after } = getContrastSides(
    parsePageSnapshot(detail.data),
    parsePageSnapshot(detail.originalData),
    options,
  );

  return {
    basicInfo: getPageInfoRows(before.page, after.page),
    components: getComponentRows(before, after),
  };
};
