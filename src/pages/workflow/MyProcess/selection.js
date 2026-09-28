export const getValidApproveCards = (approveCards = [], list = []) => {
  const listWorkIds = new Set(list.map(item => item.workId));
  const selectedWorkIds = new Set();

  return approveCards.filter(item => {
    if (!item.flowNode?.batchApprove || !listWorkIds.has(item.workId) || selectedWorkIds.has(item.workId)) {
      return false;
    }

    selectedWorkIds.add(item.workId);
    return true;
  });
};
