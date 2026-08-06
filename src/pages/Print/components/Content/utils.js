export const getPrintOperationLogActionText = ({
  workItem = {},
  flowNode = {},
  translateInfo = {},
  operationLogActionMap = {},
  triggerActionMap = {},
  formatReturnText = name => `退回到${name}`,
  noNeedFillText = '',
}) => {
  const { workItemLog } = workItem;

  if (workItem.type === 0) {
    return triggerActionMap[Number(flowNode.triggerId)] || operationLogActionMap[0];
  }

  if (!workItemLog) {
    return '';
  }

  const { action, actionTargetName } = workItemLog;
  const btnText = translateInfo[`btnmap_${action}`] || (flowNode.btnMap && flowNode.btnMap[action]);

  if (btnText) {
    return btnText;
  }

  if (action === 5 && actionTargetName) {
    return formatReturnText(actionTargetName);
  }

  if (action === 22 && workItem.type === 3) {
    return noNeedFillText;
  }

  return operationLogActionMap[action];
};
