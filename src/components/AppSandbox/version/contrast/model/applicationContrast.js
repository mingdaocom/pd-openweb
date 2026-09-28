import { isEqual } from 'lodash';
import { CHANGE_STATUS } from '../constants';
import { createChangeRow, createIconChangeContent, getContrastSides } from './changeModel';

const PC_NAV_STYLE_LABELS = {
  0: () => _l('经典'),
  1: () => _l('分组列表'),
  2: () => _l('卡片'),
  3: () => _l('树形列表'),
};

const MOBILE_NAV_STYLE_LABELS = {
  0: () => _l('列表'),
  1: () => _l('宫格'),
  2: () => _l('底部导航'),
};

// “名称与外观”只比较产品约定的四个字段，避免把其他应用配置误归入该项。
const APPEARANCE_FIELDS = [
  { key: 'apkName', getLabel: () => _l('名称') },
  { key: 'color', getLabel: () => _l('主题色') },
  { key: 'navColor', getLabel: () => _l('导航色') },
  { key: 'avatar', getLabel: () => _l('图标'), type: 'iconChange' },
];

// 导航设置固定展示四项：两端导航方式展示前后值，其余字段分别归并为“导航管理”和“分组展开方式”。
const NAVIGATION_FIELDS = [
  { key: 'pcNaviStyle', getLabel: () => _l('PC端导航方式'), labels: PC_NAV_STYLE_LABELS },
  { key: 'appNaviStyle', getLabel: () => _l('移动端导航方式'), labels: MOBILE_NAV_STYLE_LABELS },
  {
    keys: [
      'appNavItemIds',
      'selectAppItmeType',
      'displayIcon',
      'hideFirstSection',
      'viewHideNavi',
      'expandType',
      'appNaviGridDisplayMode',
    ],
    getLabel: () => _l('导航管理'),
    showUpdateOnly: true,
  },
  { key: 'appNaviDisplayType', getLabel: () => _l('分组展开方式'), showUpdateOnly: true },
];

/**
 * 应用级快照差异口径（服务端不判定差异，由前端比较）：
 * 1. appInfo：只比较 APPEARANCE_FIELDS、NAVIGATION_FIELDS 和 description；未列出的字段不参与判断。
 * 2. optionCollection：按 collectionId 配对，只比较名称和 options；新增/删除由两侧是否存在决定。
 * 3. variables：按 variableId 配对，只比较 name、controlType、value。
 * 4. appLangs：按跨环境稳定的 langCode 配对；两侧都存在时只比较 updateTime。
 * 5. aggregations 属于结构差异，动作直接使用 GetPublishContrast 返回的 upgradeType 映射结果；
 *    展示新增、更新和删除。
 * 沙盒环境按 source/mdyJson → original/currentJson 展示，正式环境由调用方交换两侧。
 */
/** 将应用配置值转换为差异文案；映射值、布尔值、空值和数组使用统一显示口径。 */
const formatValue = (value, labels) => {
  if (labels && labels[value]) return labels[value]();
  if (typeof value === 'boolean') return value ? _l('开启') : _l('关闭');
  if (value === undefined || value === null || value === '') return _l('空');
  if (Array.isArray(value)) return value.join('、') || _l('空');
  return String(value);
};

/** 按明确字段配置比较应用信息，只为真实变化的字段生成文案或图标差异对象。 */
const formatFieldChanges = (before = {}, after = {}, fields) =>
  fields
    .filter(({ key, keys }) =>
      keys
        ? keys.some(fieldKey => !isEqual(before?.[fieldKey], after?.[fieldKey]))
        : !isEqual(before?.[key], after?.[key]),
    )
    .map(({ key, getLabel, labels, showUpdateOnly, type }) => {
      const label = getLabel();

      if (type === 'iconChange') {
        return createIconChangeContent(before?.[key], after?.[key], label);
      }

      return showUpdateOnly
        ? _l('%0：更新', label)
        : _l('%0：「%1」改成「%2」', label, formatValue(before?.[key], labels), formatValue(after?.[key], labels));
    });

/** 将 appInfo 两侧快照整理为名称与外观、导航设置、应用说明三类差异行。 */
const getAppInfoRows = (appInfo, options) => {
  if (!appInfo) return [];

  const { before, after } = getContrastSides(appInfo.source || {}, appInfo.original || {}, options);
  const appearanceChanges = formatFieldChanges(before, after, APPEARANCE_FIELDS);
  const navigationChanges = formatFieldChanges(before, after, NAVIGATION_FIELDS);
  const rows = [];

  if (appearanceChanges.length) {
    rows.push(createChangeRow({ id: 'appInfo-appearance', name: _l('名称与外观'), content: appearanceChanges }));
  }

  if (navigationChanges.length) {
    rows.push(createChangeRow({ id: 'appInfo-navigation', name: _l('导航设置'), content: navigationChanges }));
  }

  if (!isEqual(before?.description, after?.description)) {
    rows.push(
      createChangeRow({
        id: 'appInfo-description',
        name: _l('应用说明'),
        content: [CHANGE_STATUS.UPDATED],
      }),
    );
  }

  return rows;
};

/** 根据展示方向转换后的两侧存在性确定动作。 */
const getSnapshotAction = ({ sourceItem, originalItem }, options) => {
  const { before, after } = getContrastSides(sourceItem, originalItem, options);
  if (before && after) return CHANGE_STATUS.UPDATED;
  return after ? CHANGE_STATUS.ADDED : CHANGE_STATUS.DELETED;
};

/**
 * 通用应用快照列表比较：按指定业务 id 配对，通过调用方提供的 isChanged 限定更新条件。
 * 两侧均存在且未变化时过滤；新增/删除方向由调用方传入的环境选项决定。
 */
const getSnapshotRows = ({ snapshot, idKey, isChanged, getName }, options) => {
  const sourceMap = new Map((snapshot?.source || []).map(item => [item[idKey], item]));
  const originalMap = new Map((snapshot?.original || []).map(item => [item[idKey], item]));

  return [...new Set([...sourceMap.keys(), ...originalMap.keys()])]
    .map(id => {
      const sourceItem = sourceMap.get(id);
      const originalItem = originalMap.get(id);

      if (sourceItem && originalItem && !isChanged(sourceItem, originalItem)) return null;

      const action = getSnapshotAction({ sourceItem, originalItem }, options);
      const { before, after } = getContrastSides(sourceItem, originalItem, options);

      return createChangeRow({
        id,
        name: getName(after, before),
        action,
        content: [action],
        source: sourceItem,
        original: originalItem,
      });
    })
    .filter(Boolean);
};

/** 只提取全局变量允许参与差异判断的 name、controlType、value。 */
const getVariableComparableValue = ({ name, controlType, value } = {}) => ({ name, controlType, value });

/** 全局变量按 variableId 配对，只比较 getVariableComparableValue 返回的三个字段。 */
const getVariableRows = (variables, options) =>
  getSnapshotRows(
    {
      snapshot: variables,
      idKey: 'variableId',
      isChanged: (source, original) =>
        !isEqual(getVariableComparableValue(source), getVariableComparableValue(original)),
      getName: (after, before) => after?.name || before?.name || _l('未命名变量'),
    },
    options,
  );

/** 语言按 langCode 配对，避免两侧语言记录 id 不同造成同一语言被误判为一删一增。 */
const getLanguageRows = (appLangs, options) =>
  getSnapshotRows(
    {
      snapshot: appLangs,
      idKey: 'langCode',
      isChanged: (source, original) => source.updateTime !== original.updateTime,
      getName: (after, before) => after?.langCode || before?.langCode || _l('未命名语言'),
    },
    options,
  );

/**
 * 选项集解析 mdyJson/currentJson 后按 collectionId 配对，只比较 name 和 options。
 * 非数组结构的字段契约不明确，不拆解未知内容；整体不同时只标记“选项集：更新”。
 */
const getOptionCollectionRows = (optionCollection, options) => {
  if (!optionCollection) return [];

  const source = safeParse(optionCollection.mdyJson);
  const original = safeParse(optionCollection.currentJson);

  // 接口未明确非数组结构的字段契约，不拆解未知结构；两侧有差异时只标记选项集已更新。
  if (!Array.isArray(source) || !Array.isArray(original)) {
    return isEqual(source, original)
      ? []
      : [createChangeRow({ id: 'optionCollection', name: _l('选项集'), content: [_l('选项集：更新')] })];
  }

  const sourceMap = new Map(source.map(item => [item.collectionId, item]));
  const originalMap = new Map(original.map(item => [item.collectionId, item]));

  // 选项集按跨环境稳定的 collectionId 配对，只比较名称和选项内容。
  return [...new Set([...sourceMap.keys(), ...originalMap.keys()])]
    .filter(Boolean)
    .map(collectionId => {
      const sourceItem = sourceMap.get(collectionId);
      const originalItem = originalMap.get(collectionId);

      if (
        sourceItem &&
        originalItem &&
        sourceItem.name === originalItem.name &&
        isEqual(sourceItem.options, originalItem.options)
      ) {
        return null;
      }

      const { before, after } = getContrastSides(sourceItem, originalItem, options);
      const action = getSnapshotAction({ sourceItem, originalItem }, options);
      const name = after?.name || before?.name || _l('未命名选项集');
      const details = [];

      if (action === CHANGE_STATUS.UPDATED && before?.name !== after?.name) {
        details.push(_l('名称：「%0」改成「%1」', formatValue(before?.name), formatValue(after?.name)));
      }

      if (action === CHANGE_STATUS.UPDATED && !isEqual(before?.options, after?.options)) {
        details.push(_l('选项：更新'));
      }

      return createChangeRow({
        id: collectionId,
        name,
        action,
        // 更新时直接展示具体明细；新增和删除没有明细，只展示动作。
        content: action === CHANGE_STATUS.UPDATED && details.length ? details : [action],
        source: sourceItem,
        original: originalItem,
      });
    })
    .filter(Boolean);
};

/** 聚合表动作沿用服务端 upgradeType 结果，展示新增、更新和删除。 */
const getAggregationRows = (aggregations, options) =>
  aggregations.map(item => {
    const { before, after } = getContrastSides({ name: item.displayName }, { name: item.originalName }, options);

    return createChangeRow({
      ...item,
      name: after.name || before.name,
      content: [item.action],
    });
  });

/** 将应用级差异合并为一个资源，由中栏按对象类型展示。 */
export const normalizeApplicationChange = (
  { appInfo, optionCollection, aggregations, variables, appLangs },
  options,
) => {
  const appInfoRows = getAppInfoRows(appInfo, options);
  const optionRows = getOptionCollectionRows(optionCollection, options);
  const aggregationRows = getAggregationRows(aggregations, options);
  const variableRows = getVariableRows(variables, options);
  const languageRows = getLanguageRows(appLangs, options);
  const sections = {
    basicInfo: appInfoRows,
    optionSets: optionRows,
    aggregationTables: aggregationRows,
    globalVariables: variableRows,
    language: languageRows,
  };

  // 当前应用模块只包含以上五类；接口未提供的向量知识库不创建空分类。
  if (!Object.values(sections).some(rows => rows.length)) return null;

  const { before, after } = getContrastSides(appInfo?.source || {}, appInfo?.original || {}, options);
  return {
    id: appInfo?.appId || 'application',
    name: after?.apkName || before?.apkName || _l('应用'),
    action: CHANGE_STATUS.UPDATED,
    changes: sections,
  };
};
