import { CHANGE_STATUS } from './constants';
import { normalizeApplicationChange } from './model/applicationContrast';
import { getContrastSides } from './model/changeModel';
import { CHANGE_GROUP_CONFIG, generateReleaseDescription } from './model/changeSummary';

const UPGRADE_TYPE_ACTION = {
  2: CHANGE_STATUS.UPDATED,
  3: CHANGE_STATUS.ADDED,
  4: CHANGE_STATUS.DELETED,
};

/**
 * 版本差异对比总览
 *
 * 外层摘要与下钻方向契约：
 * - 沙盒环境按 source/displayName/mdyJson/data → original/originalName/currentJson/originalData 展示；
 *   正式环境统一交换两侧后再生成差异。
 * - 当前侧独有判定新增，基线侧独有判定删除；两侧都有时从基线值展示到当前值。
 * - 六个结构列表的新增、更新、删除直接使用服务端 upgradeType，不根据两侧字段存在性重新推断或换向。
 * - isRelease 只用于发布页生成发布说明；下钻方向只按运行环境判断。
 *
 * 一、应用
 * - 已对比：
 *   - 名称与外观：名称、主题色、导航色、图标。
 *   - 导航设置：PC 端导航方式、移动端导航方式、导航管理、分组展开方式。
 *   - 应用说明。
 *   - 选项集：解析两侧 JSON，按 collectionId 配对；比较名称和 options。
 *   - 聚合表：整体动作读取 upgradeType；展示新增、更新和删除。
 *   - 全局变量：按 variableId 配对；比较 name、controlType、value。
 *   - 语言：按 langCode 配对；已有项比较 updateTime，langId 不参与跨环境身份判断。
 * - 对比方式：appInfo、optionCollection、variables、appLangs 使用 GetPublishContrast 下发的两侧快照；
 *   aggregations 使用服务端判定的 upgradeType。
 * - 待对比：无。
 *
 * 二、工作表
 * - 已对比：
 *   - 工作表整体动作：读取 GetPublishContrast 的 upgradeType。
 *   - 名称与图标：比较 GetPublishContrast 工作表摘要中的两侧名称和图标。
 *   - 字段 controls：按 controlId 及同 id 出现次序配对，不去重、不读取 groupFilters；
 *     单侧存在判定新增/删除，双侧存在时按明确字段归为设置、样式、事件、说明四类更新。
 *   - 视图 views：按 viewId 配对；新增/删除看存在性，已有项比较 updateTime。
 *   - 索引 worksheetRowIndexs：按 indexConfigId 配对；展示索引名称及新增、更新、删除状态。
 *   - 业务规则 rules：按 ruleId 配对；新增/删除看存在性，已有项比较 updateTime。
 *   - 自定义动作 btns（btnType=0）：按 btnId 配对；新增/删除看存在性，已有项比较 updateTime。
 *   - AI 动作 btns（btnType=1）：与自定义动作使用同一数组和对比规则。
 *   - 打印模板 prints：按 id 配对；新增/删除看存在性，已有项比较 updateTime。
 *   - 功能开关 switch：单例配置新增/删除看存在性，两侧都存在时比较 updateTime。
 *   - 公开表单 publicForm：单例配置新增/删除看存在性，两侧都存在时比较 updateTime。
 *   - 公开查询 publicQuery：单例配置新增/删除看存在性，两侧都存在时比较 updateTime。
 *   - 支付 payment：单例配置新增/删除看存在性，两侧都存在时比较 updateTime。
 *   - 开票 invoice：单例配置新增/删除看存在性，两侧都存在时比较 updateTime。
 * - 对比方式：整体动作由服务端判定；点击工作表后调用 GetWorksheetContrastDetail，解析两侧完整快照。
 *   具体字段白名单与快照规则统一维护在 worksheetContrast.js。
 *
 * 三、自定义页面
 * - 对比已完成，无待对比项。
 * - 已对比：
 *   - 页面整体动作：读取 GetPublishContrast 的 upgradeType。
 *   - 图标与名称：比较 GetPublishContrast 页面摘要中的两侧名称和图标。
 *   - 说明：解析完整快照后比较 pages[0].desc，变化时标记更新。
 *   - 页面配置：比较 pages[0] 中配置面板实际维护的 config、adjustScreen、urlParams，变化时标记更新。
 *   - 组件：按 pages[0].components 的 id 配对；新增/删除看存在性；组件本身或通过 componentId 明确关联的
 *     componentLayouts 变化时标记更新。
 * - 对比方式：整体动作由服务端判定；点击自定义页面后调用 GetPageCompare，以 data 为基线、
 *   originalData 解析同结构页面 JSON，并按运行环境确定展示方向。
 * - reports 不单独生成对比项；接口未提供其与组件的明确归属字段，不推测关联规则。
 *
 * 四、工作流
 * - 已对比：工作流整体动作读取 GetPublishContrast 的 upgradeType。
 * - 点击更新项后，以工作流项 id 作为 processId 调用 GetProcessCompare；正式环境交换 data/originalData 后比较。
 * - 基础信息比较名称、说明、人工节点、流程设置、平台 API 能力和流程参数名称；节点按 _id 配对并比较节点自身配置。
 *   版本、时间、队列 key 等运行元数据不参与判断；节点连线指针不重复归为相邻节点配置更新。
 *
 * 五、用户与角色
 * - 用户与角色均无专用明细接口，只使用 GetPublishContrast 外层结构项，不做明细下钻。
 * - 角色整体动作读取 upgradeType；roleCategory=10 归为外部门户角色，其余归为应用角色。
 * - 无待对比项。
 *
 * 六、对话机器人
 * - 已对比：机器人整体动作读取 GetPublishContrast 的 upgradeType；名称、图标和说明读取外层摘要比较。
 * - 说明在 desc/originalDesc 或 remark/originalRemark 任一对变化时标记更新。
 *
 * upgradeType：2=更新、3=新增、4=删除；未定义的值不推测、不展示。
 *
 * 维护原则：服务端已给 upgradeType 的结构资源直接采用服务端动作；服务端仅给快照的模块
 * 才由前端按已确认字段比较。未确认的 key、label、id 或兜底字段一律不推测。
 */
const normalizeResourceChanges = (items = [], options) =>
  (items || [])
    .map(item => {
      const { before, after } = getContrastSides({ name: item.displayName }, { name: item.originalName }, options);

      return {
        ...item,
        id: item.id || item.sourceId,
        name: after.name || before.name || '',
        action: UPGRADE_TYPE_ACTION[item.upgradeType],
      };
    })
    .filter(item => item.id && item.name && item.action);

/** GetPublishContrast 只有 code=0 且返回 data 时视为成功。 */
export const isPublishContrastSuccess = result => result?.code === 0 && Boolean(result.data);

/** 优先显示接口错误文案，接口未返回时使用统一失败提示。 */
export const getPublishContrastErrorMessage = result => result?.message || _l('获取应用变更失败，请稍后重试');

/**
 * 将 GetPublishContrast 结果整理为版本详情数据：结构列表读取 upgradeType，
 * 应用信息/选项集/全局变量/语言交给应用快照模型比较；发布场景同时生成发布说明。
 */
export const normalizePublishContrast = (result = {}, { isRelease = false, reverse = false } = {}) => {
  const data = result.data || {};
  const { appInfo, variables, appLangs, optionCollection } = data;
  const contrastOptions = { reverse };
  const { before: sourceApp, after: currentApp } = getContrastSides(
    appInfo?.source || {},
    appInfo?.original || {},
    contrastOptions,
  );
  const app = {
    appId: appInfo?.appId || '',
    appName: currentApp.apkName || sourceApp.apkName || '',
    iconUrl: currentApp.avatar || sourceApp.avatar || '',
    iconColor: currentApp.color || sourceApp.color || '',
  };
  const changes = Object.fromEntries(
    CHANGE_GROUP_CONFIG.map(({ key }) => [key, normalizeResourceChanges(data[key], contrastOptions)]),
  );
  const applicationChange = normalizeApplicationChange(
    {
      appInfo,
      optionCollection,
      aggregations: changes.aggregations,
      variables,
      appLangs,
    },
    contrastOptions,
  );
  changes.aggregations = applicationChange ? [applicationChange] : [];

  return {
    contrastId: data.id || '',
    ...(app.appName ? { app } : {}),
    changes,
    ...(isRelease ? { description: generateReleaseDescription({ changes }) } : {}),
  };
};
