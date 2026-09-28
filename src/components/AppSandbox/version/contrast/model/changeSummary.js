import { CHANGE_STATUS, getChangeStatusLabel } from '../constants';

// 接口按资源集合返回差异，页面按用户可识别的业务模块进行归组展示。
export const CHANGE_GROUP_CONFIG = [
  { key: 'aggregations', getLabel: () => _l('应用') },
  { key: 'worksheets', getLabel: () => _l('工作表') },
  { key: 'pages', getLabel: () => _l('自定义页面') },
  { key: 'workflows', getLabel: () => _l('工作流') },
  { key: 'roles', getLabel: () => _l('用户与角色') },
  { key: 'chatBots', getLabel: () => _l('对话机器人') },
];

/** 过滤没有差异的分组，避免渲染空的折叠面板。 */
export const getVersionChangeGroups = ({ changes = {} } = {}) =>
  CHANGE_GROUP_CONFIG.map(group => ({
    key: group.key,
    title: group.getLabel(),
    changes: changes[group.key] || [],
  })).filter(group => group.changes.length);

const RELEASE_ACTION_ORDER = [CHANGE_STATUS.ADDED, CHANGE_STATUS.UPDATED, CHANGE_STATUS.DELETED];
const MAX_RELEASE_DESCRIPTION_LENGTH = 500;

/** 使用中文引号和顿号拼接同一模块、同一动作下的资源名称。 */
const formatReleaseNames = names => names.map(name => `「${name}」`).join('、');

/**
 * 发布新版时按固定模块顺序和新增/更新/删除顺序生成可编辑说明；应用统一显示“配置信息”。
 * 最终截断到 500 字，不改变传入的差异集合。
 */
export const generateReleaseDescription = ({ changes = {} } = {}) =>
  CHANGE_GROUP_CONFIG.map(group => {
    const groupChanges = changes[group.key] || [];
    if (!groupChanges.length) return '';

    const actionLines = RELEASE_ACTION_ORDER.map(action => {
      const names = groupChanges
        .filter(item => item.action === action)
        .map(item => (group.key === 'aggregations' ? _l('配置信息') : item.name))
        .filter(Boolean);

      return names.length ? `${getChangeStatusLabel(action)}：${formatReleaseNames(names)}` : '';
    }).filter(Boolean);

    return actionLines.length ? [`【${group.getLabel()}】`, ...actionLines].join('\n') : '';
  })
    .filter(Boolean)
    .join('\n\n')
    .slice(0, MAX_RELEASE_DESCRIPTION_LENGTH);
