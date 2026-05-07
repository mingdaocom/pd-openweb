import { KNOWLEDGE_STATUS, KNOWLEDGE_STATUS_CHUNKING, KNOWLEDGE_STATUS_INITIALIZING } from '../../../../core/config';

export const getBannerConfig = ({
  knowledgeDetail,
  remainingCount,
  hasAvailableCollection,
  canStartVectorize,
  startVectorizeLoading,
  cancelVectorizeLoading,
  onStart,
  onCancel,
}) => {
  if (!hasAvailableCollection) return null;

  const { taskStatus, totalChunks } = knowledgeDetail;

  // 分块中
  if (KNOWLEDGE_STATUS_CHUNKING.includes(taskStatus)) {
    return {
      icon: 'agent_loading',
      text: _l('分块计算中...'),
    };
  }

  // 分块成功
  if (taskStatus === KNOWLEDGE_STATUS.CHUNK_SUCCESS) {
    const lackCount = remainingCount - totalChunks;

    // 剩余额度不足
    if (lackCount < 0) {
      return {
        type: 'warning',
        icon: 'info1',
        text: _l(
          '分块计算成功，共 %0 个。当前组织剩余额度不足，尚缺 %1 分块，无法完成向量化入库。请联系管理员增购额度。',
          totalChunks.toLocaleString(),
          Math.abs(lackCount).toLocaleString(),
        ),
      };
    }

    return {
      type: 'primary',
      text: _l('分块计算成功，共 %0 个分块', totalChunks.toLocaleString()),
      action: {
        text: _l('开始向量化入库'),
        disabled: !canStartVectorize || startVectorizeLoading,
        onClick: onStart,
      },
    };
  }

  // 向量化中
  if (KNOWLEDGE_STATUS_INITIALIZING.includes(taskStatus)) {
    return {
      type: 'primary',
      icon: 'agent_loading',
      text: _l('向量化入库中...'),
      action: {
        text: _l('取消'),
        disabled: cancelVectorizeLoading,
        onClick: onCancel,
      },
    };
  }

  return null;
};
