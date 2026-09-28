import { get } from 'lodash';

export const TOOL_CALL_CARD_TYPES = {
  UPDATE_RECORD: 'update_record',
  CREATE_RECORD: 'create_record',
  API: 'wf_api_',
  PBP: 'wf_pbp_',
  SEND: 'wf_send_',
  EMAIL: 'wf_email_',
};

export const TOOL_CALL_CARD_CONFIG = {
  [TOOL_CALL_CARD_TYPES.UPDATE_RECORD]: {
    type: TOOL_CALL_CARD_TYPES.UPDATE_RECORD,
    name: _l('更新记录'),
    icon: 'icon-workflow_update',
  },
  [TOOL_CALL_CARD_TYPES.CREATE_RECORD]: {
    type: TOOL_CALL_CARD_TYPES.CREATE_RECORD,
    name: _l('新增记录'),
    icon: 'icon-playlist_add',
  },
  [TOOL_CALL_CARD_TYPES.API]: {
    type: TOOL_CALL_CARD_TYPES.API,
    name: _l('集成 API'),
    icon: 'icon-api',
  },
  [TOOL_CALL_CARD_TYPES.PBP]: {
    type: TOOL_CALL_CARD_TYPES.PBP,
    name: _l('封装业务流程'),
    icon: 'icon-pbc',
  },
  [TOOL_CALL_CARD_TYPES.SEND]: {
    type: TOOL_CALL_CARD_TYPES.SEND,
    name: _l('发送站内通知'),
    icon: 'icon-notifications',
  },
  [TOOL_CALL_CARD_TYPES.EMAIL]: {
    type: TOOL_CALL_CARD_TYPES.EMAIL,
    name: _l('发送邮件'),
    icon: 'icon-workflow_email',
  },
};

/** 根据工具函数名返回对应的卡片展示配置。 */
export function getToolCallCardConfig(functionName) {
  for (const key in TOOL_CALL_CARD_CONFIG) {
    if (functionName?.includes(key)) return TOOL_CALL_CARD_CONFIG[key];
  }

  return null;
}

/** 仅保留支持卡片展示的工具调用。 */
export function filterToolCalls(toolCalls = []) {
  return toolCalls.filter(item => getToolCallCardConfig(get(item, 'name') || get(item, 'function.name')));
}
