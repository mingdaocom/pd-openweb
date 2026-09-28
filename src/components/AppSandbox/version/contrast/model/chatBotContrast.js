import { CHANGE_STATUS } from '../constants';
import { createChangeRow, createIconChangeContent, formatChangedValue, getContrastSides } from './changeModel';

/**
 * 对话机器人不调用下钻接口，只使用 GetPublishContrast 外层摘要中的名称、图标和说明，
 * 沙盒环境按 displayName/iconUrl → originalName/originalIconUrl 比较，正式环境交换两侧。
 * desc/originalDesc、remark/originalRemark 任一对不同时，说明标记为更新。
 */
export const getChatBotBasicInfoRows = (resource, options) => {
  if (!resource) return [];

  const { before, after } = getContrastSides(
    { name: resource.displayName, icon: resource.iconUrl },
    { name: resource.originalName, icon: resource.originalIconUrl },
    options,
  );
  const content = [];

  if (before.name !== after.name) content.push(_l('名称：%0', formatChangedValue(before.name, after.name)));
  if (before.icon !== after.icon) content.push(createIconChangeContent(before.icon, after.icon));

  const rows = content.length ? [createChangeRow({ id: 'chatbot-name-icon', name: _l('名称'), content })] : [];

  if (resource.desc !== resource.originalDesc || resource.remark !== resource.originalRemark) {
    rows.push(
      createChangeRow({
        id: 'chatbot-description',
        name: _l('说明'),
        content: [CHANGE_STATUS.UPDATED],
      }),
    );
  }

  return rows;
};
