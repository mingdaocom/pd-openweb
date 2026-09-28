import { CHANGE_STATUS } from '../constants';

// 仅维护当前变更详情实际支持的对象分类；工作流使用“基础信息/节点”，不额外设置“流程”。
const getSectionLabel = key => {
  const sectionLabels = {
    basicInfo: _l('基础信息'),
    fields: _l('字段'),
    views: _l('视图'),
    advancedSettings: _l('高级设置'),
    extensions: _l('扩展功能'),
    optionSets: _l('选项集'),
    aggregationTables: _l('聚合表'),
    globalVariables: _l('全局变量'),
    language: _l('语言'),
    components: _l('组件'),
    nodes: _l('节点'),
    applicationRole: _l('角色（应用）'),
    portalRole: _l('角色（外部门户）'),
    basicConfig: _l('基础配置'),
  };

  return sectionLabels[key] || key;
};

/** 读取已由各差异模型生成的分类明细，不从资源原始字段推断新的差异。 */
const getDetailSource = change => change?.changes;

/** 将单值或缺省内容统一为列表，供变更内容逐行展示；缺省时使用已确定的动作。 */
const normalizeContent = (row, fallbackAction) => {
  const content = row.content;

  if (Array.isArray(content)) return content;
  if (content) return [content];
  return [row.action || fallbackAction || '—'];
};

/** 补齐详情表格需要的 id、名称、动作和内容，不改变模型已判定的有效动作。 */
const normalizeRow = (row, change, index) => ({
  ...row,
  id: row.id || `${change.id}-${index}`,
  name: row.itemName || row.name || change.name || '—',
  action: Object.values(CHANGE_STATUS).includes(row.action) ? row.action : change.action,
  content: normalizeContent(row, change.action),
});

/** 将对象附带的非空分类明细整理为中栏和表格数据；未配置中文标签时保留服务端/模型 key。 */
export const getChangeDetailSections = change => {
  if (!change) return [];

  const detailSource = getDetailSource(change);
  const sections =
    detailSource && !Array.isArray(detailSource)
      ? Object.entries(detailSource)
          .filter(([, rows]) => Array.isArray(rows) && rows.length)
          .map(([key, rows]) => ({
            key,
            label: getSectionLabel(key),
            rows: rows.map((row, index) => normalizeRow(row, change, index)),
          }))
      : [];

  return sections;
};
