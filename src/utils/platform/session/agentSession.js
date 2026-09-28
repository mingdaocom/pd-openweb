/**
 * 为未显式传入 sessionId 的单轮 AI 调用生成可识别的临时会话标识。
 * `session-bot-` 前缀用于和可续接的主对话区分；多轮场景仍应由调用方维护稳定标识。
 */
export function genBotSessionId() {
  return `session-bot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
