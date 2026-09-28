const MB = 1024 ** 2;
const GB = 1024 ** 3;

const round = (value, accuracy) => Number(value.toFixed(accuracy));

const formatFileSize = value => {
  const size = Number(value) || 0;

  if (size < GB) return `${round(size / MB, 3)} MB`;
  return `${round(size / GB, 3)} GB`;
};

const formatWorkflowCount = value => {
  const count = Number(value) || 0;

  if (count >= 100000000) return _l('%0 亿+次', round(count / 100000000, 4));
  if (count >= 10000) return _l('%0 万次', round(count / 10000, 4));
  return _l('%0 次', count);
};

const formatChunkCount = value => {
  const count = Number(value) || 0;

  if (count >= 100000000) return _l('%0 亿+块', round(count / 100000000, 4));
  if (count >= 10000) return _l('%0 万块', round(count / 10000, 4));
  return _l('%0 块', count);
};

const getPercent = (used, limit) => {
  if (!used || !limit) return 0;

  const percent = (used / limit) * 100;
  return percent > 0 && percent < 0.01 ? 0.01 : round(percent, 2);
};

export const getSandboxQuotas = data => {
  const quotaData = data || {};
  const attachmentUsed = Number(quotaData.effectiveApkStorageCount) || 0;
  const attachmentLimit = Number(quotaData.limitApkStorageCount) || 0;
  const workflowUsed = Number(quotaData.useExecCount) || 0;
  const workflowLimit = Number(quotaData.limitExecCount) || 0;
  const chunkUsed = Number(quotaData.effectiveVectorKnowledgeChunkCount) || 0;
  const chunkLimit = Number(quotaData.limitVectorKnowledgeChunkCount) || 0;

  return [
    {
      key: 'attachment',
      name: _l('附件上传流量（今年）'),
      usedText: _l('已用：%0', formatFileSize(attachmentUsed)),
      limitText: attachmentLimit ? `${attachmentLimit}GB` : '-',
      percent: getPercent(attachmentUsed, attachmentLimit * GB),
    },
    {
      key: 'workflow',
      name: _l('工作流执行数'),
      usedText: _l('已用：%0', formatWorkflowCount(workflowUsed)),
      limitText: workflowLimit ? formatWorkflowCount(workflowLimit) : '-',
      percent: getPercent(workflowUsed, workflowLimit),
    },
    {
      key: 'vectorKnowledgeChunk',
      name: _l('向量知识库分块数'),
      usedText: _l('已用：%0', formatChunkCount(chunkUsed)),
      limitText: chunkLimit ? formatChunkCount(chunkLimit) : '-',
      percent: getPercent(chunkUsed, chunkLimit),
    },
  ];
};
