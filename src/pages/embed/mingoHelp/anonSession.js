// help-agent 免登录（匿名）会话：契约见《help-agent 免登录(匿名)前端对接文档》§02 / §06。
//
// 刻意不复用 src/components/Agent/anonymous.js：那是官网「免登录生成应用」漏斗专属模块，
// 与本链路的 agent、会话 TTL、验证码策略、会话 key 全不相同（plan：双 agent + 10min + 被动式验证码；
// help：单 agent + 15min 滑动 + 无验证码）。共用只会把两条产品线焊死，且共享 localStorage key
// 会让访客在 plan 页与帮助页之间互相顶掉会话（跨 agent 复用 sessionId 后端判 403）。
import { HELP_AGENT_NAME } from 'src/components/Agent/agentService';

const SESSION_KEY = 'anonHelpSessionId';
const SESSION_TS_KEY = 'anonHelpSessionCreatedAt';
// 「本会话已提过问」标记：仅凭 sessionId 无法区分「签发了但没问过」（进来就关）与「问过、刷新回来」，
// 前者直进对话会显示空对话而非帮助首页。与会话同生命周期，清会话时一并清。
const CHATTED_KEY = 'anonHelpSessionChatted';
// 服务端 15min 滑动过期；本地保守取 13min，过期即重新签发。
// 真实失效以服务端 403 anon_session_invalid 为准（§06），本地 TTL 只用于减少必然失败的请求。
const TTL_MS = 13 * 60 * 1000;

// 后端字段大小写不完全统一（agent 服务直返 body，不走 {state,data} 契约），按名取值时忽略大小写
function readField(source, key) {
  if (!source || typeof source !== 'object') return undefined;
  if (key in source) return source[key];
  const target = key.toLowerCase();
  const hit = Object.keys(source).find(k => k.toLowerCase() === target);

  return hit ? source[hit] : undefined;
}

function readSessionId() {
  const id = localStorage.getItem(SESSION_KEY);

  if (!id) return '';
  const ts = parseInt(localStorage.getItem(SESSION_TS_KEY) || '0', 10);

  if (Date.now() - ts > TTL_MS) {
    clearHelpSession();
    return '';
  }

  return id;
}

export function clearHelpSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_TS_KEY);
  localStorage.removeItem(CHATTED_KEY);
}

export function isHelpSessionChatted() {
  return !!readSessionId() && localStorage.getItem(CHATTED_KEY) === '1';
}

export function setHelpSessionChatted() {
  safeLocalStorageSetItem(CHATTED_KEY, '1');
}

// §02 申请匿名会话：agentName 固定 help-agent，sessionId 必须由服务端下发（前端自造一律 403）。
// 建会话按出口 IP 限频（8/分·40/时），拿到后整段会话复用并缓存，不要每次提问都重新申请。
export async function bootstrapHelpSession() {
  const res = await window.agentAPI(
    { agentName: HELP_AGENT_NAME },
    { url: '/api/agent/session-token', method: 'POST', silent: true },
  );
  const raw = readField(res, 'sessionId');
  const sessionId = typeof raw === 'string' ? raw.trim() : '';

  if (!sessionId) throw new Error(_l('会话创建失败，请稍后重试'));
  safeLocalStorageSetItem(SESSION_KEY, sessionId);
  safeLocalStorageSetItem(SESSION_TS_KEY, String(Date.now()));

  return sessionId;
}

// 已有未过期会话直接复用，否则重新签发。
export async function ensureHelpSession() {
  return readSessionId() || (await bootstrapHelpSession());
}

// 403 anon_session_invalid 后重新签发（§06：清本地 → 重新 bootstrap，重试上限 1 次）。
export async function renewHelpSession() {
  clearHelpSession();
  return bootstrapHelpSession();
}
