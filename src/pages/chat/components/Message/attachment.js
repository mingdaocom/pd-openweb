// 历史消息和知识中心加载占位可能只有展示字段，不要求 aid、id 或 URL。
export const hasAttachmentData = files =>
  !!files && typeof files === 'object' && !Array.isArray(files) && Object.keys(files).length > 0;
