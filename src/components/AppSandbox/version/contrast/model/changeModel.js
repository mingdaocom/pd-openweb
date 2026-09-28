import { CHANGE_STATUS } from '../constants';

/**
 * 统一差异语义：默认展示 current 相对 target 的变化；正式环境中 original/current 相关字段含义相反，
 * 调用方通过 reverse 显式交换前后侧。
 */
export const getContrastSides = (target, current, { reverse = false } = {}) =>
  reverse ? { before: current, after: target } : { before: target, after: current };

/** 生成统一的前后值变化文案，空值显示为“空”。 */
export const formatChangedValue = (before, after) => _l('「%0」改成「%1」', before || _l('空'), after || _l('空'));

/** 生成可由 ChangeContentList 渲染为真实图标预览的结构化差异内容。 */
export const createIconChangeContent = (before, after, label = _l('图标')) => ({
  text: _l('%0：', label),
  type: 'iconChange',
  before,
  after,
});

/** 创建统一的差异表格行；未提供具体内容时以动作作为默认内容。 */
export const createChangeRow = ({ id, name, action = CHANGE_STATUS.UPDATED, content, ...rest }) => ({
  id,
  itemName: name,
  action,
  content: content?.length ? content : [action],
  ...rest,
});
