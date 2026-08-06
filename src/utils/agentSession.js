// 单轮 bot 工具调用会话 id 生成：session-bot-{毫秒时间戳}-{6 位 base36 随机}，如 session-bot-1780897496019-xvpdoj。
// 用于各类一次性 AI 旧功能（Mingo 建表/填记录/示例数据/优化应用信息、工作流代码块、邮件转 MJML、
// AI 动作、chatbot 新建、知识库方案、应用/表描述生成、AI 生成字段等），给未显式传 sessionId 的
// agentExecute / agentExecuteStream 调用托底，保证后端始终拿到会话标识。
// session-bot- 前缀供历史会话列表（fetchAgentSessions）排除，与可续接的主对话（createAgentSessionId，
// session- 前缀）区分。注意：每次调用生成新值，仅作单轮兜底；需多轮续传的场景仍由调用方维护稳定 sessionId。
export function genBotSessionId() {
  return `session-bot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
