const APPROVE_ACTION_BUTTON_DESC_KEYS = {
  pass: 4,
  overrule: 5,
  return: 17,
};

export function getApproveActionTypeList(action, auth = {}) {
  return action === 'pass' ? auth.passTypeList || [] : auth.overruleTypeList || [];
}

export function hasApproveActionButtonDesc(action, btnDescMap = {}) {
  const descKey = APPROVE_ACTION_BUTTON_DESC_KEYS[action];

  return !!String(btnDescMap[descKey] || '').trim();
}

export function canDirectSubmitApproveAction({ action, auth = {}, encrypt = false, btnDescMap = {} } = {}) {
  if (!APPROVE_ACTION_BUTTON_DESC_KEYS[action] || encrypt || hasApproveActionButtonDesc(action, btnDescMap)) {
    return false;
  }

  const typeList = getApproveActionTypeList(action, auth);

  return typeList.length === 1 && typeList[0] === 101;
}

export function getOperationLogActionText(action, btnMap, operationLogAction, translateInfo) {
  btnMap = btnMap || {};
  operationLogAction = operationLogAction || {};
  translateInfo = translateInfo || {};

  return translateInfo[`btnmap_${action}`] || btnMap[action] || operationLogAction[action] || '';
}
