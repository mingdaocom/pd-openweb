import moment from 'moment';

/** 将当前时刻按应用的 UTC 偏移格式化，仅供打印内容使用。 */
export const dateConvertToAppZone = (date, appTimeZone) => {
  if (!date) return '';
  if (appTimeZone === undefined || appTimeZone === null || appTimeZone === '') return '';

  const normalizedTimeZone = Number(appTimeZone);
  if (!Number.isFinite(normalizedTimeZone)) return '';

  const timeZone = normalizedTimeZone === 1 ? moment(date).utcOffset() : normalizedTimeZone;

  return moment(date).utcOffset(timeZone).format('YYYY-MM-DD HH:mm:ss');
};

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
