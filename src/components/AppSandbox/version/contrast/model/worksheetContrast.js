import { isEqual } from 'lodash';
import { CHANGE_STATUS } from '../constants';
import { createChangeRow, createIconChangeContent, formatChangedValue, getContrastSides } from './changeModel';

const CONTROL_SETTING_FIELDS = [
  'type',
  'attribute',
  'row',
  'col',
  'default',
  'dot',
  'unit',
  'defaultMen',
  'dataSource',
  'sourceControlId',
  'showControls',
  'options',
  'required',
  'enumDefault',
  'noticeItem',
  'userPermission',
  'enumDefault2',
  'display',
  'half',
  'viewId',
  'unique',
  'coverCid',
  'strDefault',
  'fieldPermission',
  'size',
  'sectionId',
  'sourceControlType',
  'relationControl',
  'relationControls',
];

// “样式”页签直接维护的高级设置。这里按页签的实际写入字段形成快照，
// 避免样式变化同时被归入“设置”。
const CONTROL_STYLE_SETTING_KEYS = [
  'titlestyle',
  'titlecolor',
  'titlesize',
  'valuestyle',
  'valuecolor',
  'valuesize',
  'minheight',
  'maxheight',
  'cardstyle',
  'cardtitlestyle',
  'rowtitlestyle',
  'cardvaluestyle',
  'direction',
  'sheettype',
  'rowheight',
  'freezeids',
  'layercontrolid',
  'showcount',
  'defaultlayer',
  'openstatistics',
  'hidenumber',
  'allowedit',
  'alternatecolor',
  'titlewrap',
  'rctitlestyle',
  'usecolumnstyle',
  'showtype',
  'blankrow',
  'rownum',
  'rcsorttype',
  'h5showtype',
  'h5abstractids',
  'h5height',
  'columnnum',
  'showtitleid',
];
const CONTROL_EVENT_SETTING_KEYS = ['custom_event'];
const CONTROL_DESCRIPTION_FIELDS = ['hint', 'desc', 'alias', 'remark'];
const CONTROL_DESCRIPTION_SETTING_KEYS = ['hinttype'];
const SPECIAL_CONTROL_SETTING_KEYS = new Set([
  ...CONTROL_STYLE_SETTING_KEYS,
  ...CONTROL_EVENT_SETTING_KEYS,
  ...CONTROL_DESCRIPTION_SETTING_KEYS,
]);
const CONTROL_CHANGE_CATEGORY_CONFIGS = [
  {
    getLabel: () => _l('设置：更新'),
    fields: ['controlName', ...CONTROL_SETTING_FIELDS],
    includeGeneralAdvancedSettings: true,
  },
  { getLabel: () => _l('样式：更新'), advancedSettingKeys: CONTROL_STYLE_SETTING_KEYS },
  { getLabel: () => _l('事件：更新'), advancedSettingKeys: CONTROL_EVENT_SETTING_KEYS },
  {
    getLabel: () => _l('说明：更新'),
    fields: CONTROL_DESCRIPTION_FIELDS,
    advancedSettingKeys: CONTROL_DESCRIPTION_SETTING_KEYS,
  },
];
const VIEW_RESOURCE_CONFIG = {
  sourceKey: 'views',
  idKey: 'viewId',
  idPrefix: 'view',
  showNameChange: false,
};
const INDEX_RESOURCE_CONFIG = {
  sourceKey: 'worksheetRowIndexs',
  idKey: 'indexConfigId',
  idPrefix: 'index',
  nameKey: 'customeIndexName',
  showNameChange: false,
};
const ADVANCED_RESOURCE_CONFIGS = [
  {
    sourceKey: 'rules',
    idKey: 'ruleId',
    idPrefix: 'rule',
    showNameChange: false,
  },
  {
    sourceKey: 'btns',
    idKey: 'btnId',
    idPrefix: 'button',
    showNameChange: false,
  },
  {
    sourceKey: 'prints',
    idKey: 'id',
    idPrefix: 'print',
  },
];
const BASIC_INFO_SINGLETON_RESOURCE_CONFIGS = [
  { sourceKey: 'switch', id: 'worksheet-switch', getName: () => _l('功能开关') },
];
const EXTENSION_RESOURCE_CONFIGS = [
  { sourceKey: 'publicForm', id: 'extension-public-form', getName: () => _l('公开表单') },
  { sourceKey: 'publicQuery', id: 'extension-public-query', getName: () => _l('公开查询') },
  { sourceKey: 'payment', id: 'extension-payment', getName: () => _l('支付') },
  { sourceKey: 'invoice', id: 'extension-invoice', getName: () => _l('开票') },
];

/**
 * 工作表明细差异口径（GetWorksheetContrastDetail）：
 * 1. 沙盒环境中 mdyJson 是对比基线、currentJson 是当前侧；正式环境中接口字段含义相反，
 *    调用方交换两侧后再生成差异。
 * 2. 字段只读取顶层 controls，按 controlId 和同一 controlId 的出现次序逐项配对，不扫描 groupFilters，
 *    也不去重。接口若返回重复 controlId，会按原始数据暴露多余的新增/删除，便于发现快照问题。
 * 3. 仅一侧存在判定为新增/删除；两侧都存在时，仅当“设置、样式、事件、说明”任一明确字段变化才判定更新。
 * 4. 高级设置先按 key 规范化为 Map 后比较，因此数组顺序变化不算差异；任一真实 key/value 变化即可结束判断。
 * 5. 视图、索引、业务规则、动作、打印模板按各自业务 id 配对。btns 中 btnType=0 为自定义动作、
 *    btnType=1 为 AI 动作，两类都按 btnId 处理；索引读取 worksheetRowIndexs，按 indexConfigId 处理。
 *    两侧都存在时仅比较 updateTime；
 *    任一侧没有 updateTime 都不回退比较其他字段，因而不判定更新；新增/删除仍按是否存在判断。
 * 6. 功能开关 switch、公开表单 publicForm、公开查询 publicQuery、支付 payment 和开票 invoice
 *    是单例配置：单侧存在判定新增/删除，两侧都存在时比较 updateTime。
 */
const getSides = (detail, options) => {
  const mdy = safeParse(detail?.mdyJson);
  const current = safeParse(detail?.currentJson);

  return getContrastSides(mdy, current, options);
};

/** 从 GetPublishContrast 的工作表摘要中提取名称和图标，明细接口不负责这两项差异。 */
const getWorksheetSummarySides = (resource, options) => {
  const mdy = { name: resource?.displayName, icon: resource?.iconUrl };
  const current = { name: resource?.originalName, icon: resource?.originalIconUrl };

  return getContrastSides(mdy, current, options);
};

/**
 * 按分类配置筛选 advancedSetting，并转换为 key-value Map。
 * “设置”分类接收未被样式、事件、说明占用的 key；其他分类只接收各自白名单中的 key。
 */
const getAdvancedSettingMap = (control, config) => {
  const acceptedKeys = new Set(config.advancedSettingKeys || []);
  const acceptsKey = config.includeGeneralAdvancedSettings
    ? key => !SPECIAL_CONTROL_SETTING_KEYS.has(key)
    : key => acceptedKeys.has(key);

  return new Map(
    (control?.advancedSetting || []).filter(item => acceptsKey(item.key)).map(item => [item.key, item.value]),
  );
};

/** 比较指定分类的高级设置；忽略数组顺序，任一 key 缺失或 value 变化即返回 true。 */
const hasAdvancedSettingChanged = (before, after, config) => {
  const beforeSettings = getAdvancedSettingMap(before, config);
  const afterSettings = getAdvancedSettingMap(after, config);
  const settingKeys = new Set([...beforeSettings.keys(), ...afterSettings.keys()]);

  return [...settingKeys].some(
    key =>
      !beforeSettings.has(key) || !afterSettings.has(key) || !isEqual(beforeSettings.get(key), afterSettings.get(key)),
  );
};

/**
 * 判断字段的某个大类是否更新：先比较该分类的普通字段，再比较该分类的 advancedSetting。
 * 使用 some 短路，发现任一真实差异后立即结束。
 */
const hasControlCategoryChanged = (before, after, config) =>
  (config.fields || []).some(field => !isEqual(before?.[field], after?.[field])) ||
  hasAdvancedSettingChanged(before, after, config);

/**
 * 按业务 id 和该 id 在数组中的出现次数配对两侧资源，并保持 before 顺序。
 * 不去重：同一 id 重复出现时按第 1 次对第 1 次、第 2 次对第 2 次，未配对项保留为新增/删除。
 */
const createPairsByOccurrence = (beforeItems = [], afterItems = [], idKey) => {
  const beforeIndexes = new Map();
  const afterIndexes = new Map();
  const pairMap = new Map();
  const pairs = [];

  beforeItems.forEach((item, index) => {
    const id = item?.[idKey];
    if (!id) return;
    const occurrence = beforeIndexes.get(id) || 0;
    beforeIndexes.set(id, occurrence + 1);
    const pair = { id, occurrence, before: item, order: index };

    pairMap.set(`${id}:${occurrence}`, pair);
    pairs.push(pair);
  });

  afterItems.forEach((item, index) => {
    const id = item?.[idKey];
    if (!id) return;
    const occurrence = afterIndexes.get(id) || 0;
    afterIndexes.set(id, occurrence + 1);
    const pair = pairMap.get(`${id}:${occurrence}`);

    if (pair) {
      pair.after = item;
    } else {
      pairs.push({ id, occurrence, after: item, order: beforeItems.length + index });
    }
  });

  return pairs.sort((left, right) => left.order - right.order);
};

/** 根据配对结果的存在性确定动作；两侧均存在只表示候选更新，是否真实变化由调用方继续判断。 */
const getPairAction = ({ before, after }) => {
  if (!before) return CHANGE_STATUS.ADDED;
  if (!after) return CHANGE_STATUS.DELETED;
  return CHANGE_STATUS.UPDATED;
};

/**
 * 使用 GetPublishContrast 摘要比较工作表名称和图标。
 * 只在名称或图标真实变化时生成“名称与图标”行，不读取工作表明细快照中的其他字段。
 */
export const getWorksheetBasicInfoRows = (resource, options) => {
  if (!resource) return [];

  const { before, after } = getWorksheetSummarySides(resource, options);
  const content = [];

  if (before.name !== after.name) {
    content.push(_l('名称：%0', formatChangedValue(before.name, after.name)));
  }

  if (before.icon !== after.icon) {
    content.push(createIconChangeContent(before.icon, after.icon));
  }

  return content.length ? [createChangeRow({ id: 'worksheet-basic-info', name: _l('名称与图标'), content })] : [];
};

/** 返回字段实际发生变化的四大分类标签；未变化的分类不展示。 */
const getControlUpdateCategories = (before, after) =>
  CONTROL_CHANGE_CATEGORY_CONFIGS.filter(config => hasControlCategoryChanged(before, after, config)).map(config =>
    config.getLabel(),
  );

/**
 * 将两侧顶层 controls 转换为字段差异行。
 * 新增/删除直接展示动作；两侧均存在但四大分类均无变化时过滤，不产生“更新”行。
 */
const getControlRows = (before = {}, after = {}) =>
  createPairsByOccurrence(before.controls, after.controls, 'controlId')
    .map(pair => {
      const action = getPairAction(pair);
      const updateCategories =
        action === CHANGE_STATUS.UPDATED ? getControlUpdateCategories(pair.before, pair.after) : [];

      if (action === CHANGE_STATUS.UPDATED && !updateCategories.length) return null;

      return {
        id: `control-${pair.id}-${pair.occurrence}`,
        itemName: pair.after?.controlName || pair.before?.controlName || '',
        action,
        content: action === CHANGE_STATUS.UPDATED ? updateCategories : [action],
      };
    })
    .filter(Boolean);

/** 判断资源是否明确返回 updateTime 字段；空值也视为“字段存在”。 */
const hasUpdateTime = resource => Object.prototype.hasOwnProperty.call(resource || {}, 'updateTime');

/** 两侧至少一侧返回 updateTime 且值不相同时，才认定已有资源发生更新。 */
const isNamedResourceChanged = (before, after) =>
  (hasUpdateTime(before) || hasUpdateTime(after)) && before?.updateTime !== after?.updateTime;

/**
 * 生成视图、索引、业务规则、自定义动作或打印模板的差异行。
 * 资源按配置指定的 id 配对；已有资源只按 updateTime 判断更新，不回退比较名称或完整对象。
 */
const getTimestampResourceRows = (before = {}, after = {}, config) => {
  const { sourceKey, idKey, idPrefix, nameKey = 'name', showNameChange = true } = config;

  return createPairsByOccurrence(before[sourceKey], after[sourceKey], idKey)
    .map(pair => {
      const action = getPairAction(pair);

      if (action === CHANGE_STATUS.UPDATED && !isNamedResourceChanged(pair.before, pair.after)) {
        return null;
      }

      const beforeName = pair.before?.[nameKey];
      const afterName = pair.after?.[nameKey];
      const content =
        showNameChange && action === CHANGE_STATUS.UPDATED && beforeName !== afterName
          ? [_l('名称：%0', formatChangedValue(beforeName, afterName))]
          : [action];

      return {
        id: `${idPrefix}-${pair.id}-${pair.occurrence}`,
        itemName: afterName || beforeName || '',
        action,
        content,
      };
    })
    .filter(Boolean);
};

/** 将顶层单例配置转换为差异行。 */
const getSingletonResourceRows = (before = {}, after = {}, config) => {
  const beforeResource = before[config.sourceKey];
  const afterResource = after[config.sourceKey];
  const action = getPairAction({ before: beforeResource, after: afterResource });

  if (!beforeResource && !afterResource) return [];
  if (action === CHANGE_STATUS.UPDATED && !isNamedResourceChanged(beforeResource, afterResource)) return [];

  return [
    {
      id: config.id,
      itemName: config.getName(),
      action,
      content: [action],
    },
  ];
};

/**
 * 工作表明细统一入口：只读取快照顶层 controls、views、worksheetRowIndexs、rules、btns、prints、
 * switch、publicForm、publicQuery、payment 和 invoice，不递归扫描规则中的 groupFilters，
 * 也不在此处处理名称和图标摘要。
 */
export const normalizeWorksheetContrastDetail = (detail, options) => {
  if (!detail) return {};

  const { before, after } = getSides(detail, options);

  return {
    basicInfo: BASIC_INFO_SINGLETON_RESOURCE_CONFIGS.flatMap(config => getSingletonResourceRows(before, after, config)),
    fields: getControlRows(before, after),
    views: getTimestampResourceRows(before, after, VIEW_RESOURCE_CONFIG),
    advancedSettings: [
      ...getTimestampResourceRows(before, after, INDEX_RESOURCE_CONFIG),
      ...ADVANCED_RESOURCE_CONFIGS.flatMap(config => getTimestampResourceRows(before, after, config)),
    ],
    extensions: EXTENSION_RESOURCE_CONFIGS.flatMap(config => getSingletonResourceRows(before, after, config)),
  };
};
