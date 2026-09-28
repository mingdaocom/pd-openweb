import { find, get } from 'lodash';
import { getCurrentAppId } from 'src/components/Agent/buildContext';
import store from 'src/redux/configureStore';
import { FEATURE_PERMISSION } from 'src/utils/services/security/permission';

// 组织级 MingoAI 功能开关（随 md.global.Account.projects 下发，按组织独立配置）：
// - allowMingoAppBuild：用 Mingo 搭建应用
// - allowMingoDataQueryAndAnalysis：数据查询与分析（提问 / @应用提问）
// - allowMingoAppOthers：应用内其它 Mingo 辅助（AI 建表 / 建字段 / 填数据 / 填写记录 / 应用信息优化等）
export const MINGO_FEATURE = {
  BUILD_APP: FEATURE_PERMISSION.MINGO_BUILD_APP,
  DATA_QUERY: FEATURE_PERMISSION.MINGO_DATA_QUERY,
  OTHERS: FEATURE_PERMISSION.MINGO_OTHER_ASSISTANT,
};

const MINGO_FEATURES = [MINGO_FEATURE.BUILD_APP, MINGO_FEATURE.DATA_QUERY, MINGO_FEATURE.OTHERS];

// 组织禁用 MingoAI 时的统一提示（组织切换下拉里置灰项的 tooltip）
export const getMingoDisabledTip = () => _l('当前组织已禁止使用MingoAI功能');

const getProjects = () => get(md, 'global.Account.projects') || [];

// 部署级开关：AI 服务未配置时整站不出现 Mingo，优先级高于组织开关
const isAIBasicFunHidden = () => !!get(md, 'global.SysSettings.hideAIBasicFun');

// 老版本 global 未下发这三个字段时按「允许」处理，避免升级过程中 Mingo 入口全量消失
const readFeature = (project, feature) => (get(project, feature) === undefined ? true : !!get(project, feature));

// 外部协作组织不在 projects 里，但同样可能下发开关；未下发时由 readFeature 兜底为允许，避免误伤外部协作
const getProjectById = projectId =>
  projectId
    ? find(getProjects(), { projectId }) || find(get(md, 'global.Account.externalProjects') || [], { projectId })
    : undefined;

// 当前选中组织：首页切换网络时写入的 currentProjectId，缺省回退第一个组织
function getSelectedProjectId() {
  const projects = getProjects();

  if (!projects.length) return '';

  const cached = localStorage.getItem('currentProjectId');

  return cached && find(projects, { projectId: cached }) ? cached : get(projects, '[0].projectId', '');
}

/**
 * 当前上下文组织：在具体应用下取应用所属组织（应用属于哪个组织就按哪个组织的开关），
 * 不在应用下（首页 / 工作流 / 统计等）取当前选中组织。
 */
export function getMingoContextProjectId() {
  if (getCurrentAppId()) {
    const appProjectId = get(store.getState(), 'appPkg.projectId');

    if (appProjectId) return appProjectId;
  }

  return getSelectedProjectId();
}

/**
 * 组织是否开放某项 Mingo 能力。projectId 缺省时按当前上下文组织判断。
 */
export function isMingoFeatureAllowed(feature, projectId) {
  if (isAIBasicFunHidden()) return false;

  const project = getProjectById(projectId || getMingoContextProjectId());

  // 组织不在当前账号的 projects 里（如外部协作组织）时不放开 Mingo
  return project ? readFeature(project, feature) : false;
}

export const canBuildAppWithMingo = projectId => isMingoFeatureAllowed(MINGO_FEATURE.BUILD_APP, projectId);

export const canQueryDataWithMingo = projectId => isMingoFeatureAllowed(MINGO_FEATURE.DATA_QUERY, projectId);

export const canUseMingoOtherAssistant = projectId => isMingoFeatureAllowed(MINGO_FEATURE.OTHERS, projectId);

/**
 * 组织是否还剩任一 Mingo 能力（三个开关全 false 即整体禁用）。
 */
export function isProjectMingoEnabled(projectId) {
  if (isAIBasicFunHidden()) return false;

  const project = getProjectById(projectId);

  return project ? MINGO_FEATURES.some(feature => readFeature(project, feature)) : false;
}

/**
 * 账号下所有还能用 Mingo 的组织。
 */
export function getMingoEnabledProjects() {
  if (isAIBasicFunHidden()) return [];

  return getProjects().filter(project => MINGO_FEATURES.some(feature => readFeature(project, feature)));
}

/**
 * 默认选中的组织：优先保持传入组织（应用所属 / 上次选中），该组织不可用时落到第一个可用组织，
 * 一个可用组织都没有时仍返回原值，交由外层判断是否展示入口。
 */
export function getDefaultMingoProjectId(preferProjectId) {
  if (preferProjectId && isProjectMingoEnabled(preferProjectId)) return preferProjectId;

  const enabledProjects = getMingoEnabledProjects();

  return get(enabledProjects, '[0].projectId') || preferProjectId || '';
}

/**
 * 右下角 Mingo 入口是否展示：
 * - 在具体应用下：按该应用所属组织判断，三个开关全 false 即隐藏；
 * - 不在应用下（首页等可切换组织的场景）：只要还有一个组织可用就展示，进入后由组织下拉切换。
 */
export function canShowMingoEntry() {
  if (isAIBasicFunHidden()) return false;

  return getCurrentAppId() ? isProjectMingoEnabled(getMingoContextProjectId()) : !!getMingoEnabledProjects().length;
}
