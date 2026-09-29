import { CHANGE_STATUS } from '../constants';

const getRoleSectionConfig = () => [
  { key: 'applicationRole', title: _l('角色（应用）') },
  { key: 'portalRole', title: _l('角色（外部门户）') },
];

/** roleCategory=10 是外部门户角色，其余分类均属于应用角色。 */
const getRoleSectionKey = change => (Number(change.roleCategory) === 10 ? 'portalRole' : 'applicationRole');

/**
 * 用户与角色只使用 GetPublishContrast 外层对比项，并根据必返的 roleCategory 分组；不额外请求角色详情。
 * 其他资源不增加中间层。
 */
export const getChangeNavigationSections = group => {
  if (group.key !== 'roles') return [{ key: group.key, changes: group.changes }];

  return getRoleSectionConfig()
    .map(section => ({
      key: section.key,
      title: section.title,
      changes: group.changes.filter(change => getRoleSectionKey(change) === section.key),
    }))
    .filter(section => section.changes.length);
};

/**
 * 角色分类自身作为左侧可选项，具体角色作为右侧表格行；其他资源仍逐项作为左侧可选项。
 */
export const getChangeNavigationResources = group => {
  if (group.key !== 'roles') return group.changes;

  return getChangeNavigationSections(group).map(section => ({
    id: section.key,
    name: section.title || _l('角色'),
    action: CHANGE_STATUS.UPDATED,
    changes: { [section.key]: section.changes },
    navigationCategory: true,
  }));
};
