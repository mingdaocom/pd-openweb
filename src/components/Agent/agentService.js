import agentAjax from 'src/api/agent';
import { withCaptcha as withAnonymousCaptcha } from './anonymous';
import { extractEmbedSegments, isSilentEmbedSegment } from './ui/embed/protocol';
import { isRecord, readField, stringValue } from './valueUtils';
import { splitWorkPartsFromText } from './workParts';

// Agent 对话附件允许的文件类型：ChatPanel 输入框与 MingoWelcome 首页共用同一份，避免两处各维护导致不同步
export const AGENT_ATTACHMENT_MIME_TYPES = [
  { title: 'image', extensions: 'jpg,jpeg,png,webp,gif' },
  {
    title: 'doc',
    extensions: 'docx,doc,wps,xlsx,pptx,ppt,pdf,xls,md,markdown,txt,csv,json,jsonl,xml,htm,html,yaml,yml,log,toml,ini',
  },
];

export function summarizeUnknown(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.length > 600 ? `${value.slice(0, 597)}...` : value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function getCompletedText(data) {
  return (
    stringValue(readField(data, 'message')) ||
    stringValue(readField(readField(data, 'response'), 'text')) ||
    stringValue(readField(data, 'NeedDetailMessage')) ||
    stringValue(readField(data, 'needDetailMessage')) ||
    stringValue(readField(readField(data, 'payload'), 'message')) ||
    stringValue(readField(readField(data, 'payload'), 'text')) ||
    stringValue(readField(readField(data, 'debug'), 'rawResponseText')) ||
    stringValue(readField(readField(data, 'debug'), 'extractedContentText')) ||
    stringValue(readField(readField(data, 'debug'), 'structuredContentText')) ||
    ''
  );
}

export function createAgentSessionId() {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// 帮助中心（智能客服）固定应答 agent：帮助面板钉住它对话（关自动路由），该 agent 不计费
export const HELP_AGENT_NAME = 'help-agent';

// 帮助会话单会话模型：会话 id 动态生成（同通用会话），按人记录在本地。
// 进帮助面板时有记录直接进对话详情恢复该会话；无记录（或记录的会话已被删除）先落帮助首页。
// 会话有消息时回写当前 id（ChatPanel），删除帮助会话 / 恢复发现会话已不存在时清除。
function getHelpAgentSessionKey() {
  const accountId =
    (window.md && window.md.global && window.md.global.Account && window.md.global.Account.accountId) || '';

  return accountId ? `md_help_agent_session_${accountId}` : '';
}

export function getSavedHelpAgentSessionId() {
  const key = getHelpAgentSessionKey();

  return key ? (window.localStorage.getItem(key) || '').trim() : '';
}

export function saveHelpAgentSessionId(sessionId) {
  const key = getHelpAgentSessionKey();

  if (!key) return;
  if (sessionId) {
    safeLocalStorageSetItem(key, sessionId);
  } else {
    window.localStorage.removeItem(key);
  }
}

// Agent 头部图标（在 Mingo 头部、AgentBus 作用域之外）与 ChatPanel 之间用全局 emitter 通信
export const AGENT_HEADER_EVENT = {
  NEW_CONVERSATION: 'AGENT_NEW_CONVERSATION',
  OPEN_HISTORY: 'AGENT_OPEN_HISTORY',
  // ChatPanel 广播「当前会话已激活」（发起首条消息 / 一轮结束）：
  // /agent 落地页据此把新会话 id 回写 URL、刷新左侧历史；in-app 抽屉据此记录 sessionId 供「新窗口打开」续接。
  SESSION_ACTIVE: 'AGENT_SESSION_ACTIVE',
  // ChatPanel 请求抽屉回到 MingoWelcome 首页（如删除了当前正在查看的会话）。
  BACK_TO_WELCOME: 'AGENT_BACK_TO_WELCOME',
  // 抽屉关闭 / 切走（X、popstate）：ChatPanel 据此中断在途流并调取消接口终止服务端 run。
  // 比依赖组件 unmount 更可靠：关闭动作里同步广播，监听器在面板卸载前就跑完。
  SESSION_CLOSE: 'AGENT_SESSION_CLOSE',
  // ChatPanel 广播 AppBuilder（搭建/预览）显隐：落地页据此切换三栏布局并默认收起会话列表。
  BUILDER_VISIBLE: 'AGENT_BUILDER_VISIBLE',
  // 落地页广播会话列表显隐：AppBuilder 据此决定是否在中栏左上角显示「展开会话列表」icon。
  SIDEBAR_STATE: 'AGENT_SIDEBAR_STATE',
  // AppBuilder 中栏「展开会话列表」icon 点击：落地页据此展开左侧会话列表。
  EXPAND_SIDEBAR: 'AGENT_EXPAND_SIDEBAR',
};

// 后端返回列表的字段名 Pascal / camel 混用，且外层可能套 data / messages / items：统一兜底取数组
function pickList(body, keys) {
  if (Array.isArray(body)) return body;
  if (!isRecord(body)) return [];
  for (const key of keys) {
    const value = readField(body, key);

    if (Array.isArray(value)) return value;
  }

  return [];
}

function readFirstField(source, keys) {
  for (const key of keys) {
    const value = stringValue(readField(source, key));

    if (value) return value;
  }

  return undefined;
}

function parseRecord(value) {
  if (isRecord(value)) return value;
  if (typeof value !== 'string' || !/^\s*[{[]/.test(value)) return null;
  const parsed = safeParse(value, 'object');

  return isRecord(parsed) ? parsed : null;
}

function pickArtifactReferenceFrom(source, { allowId = false, fallback = {} } = {}) {
  if (Array.isArray(source)) {
    for (let i = source.length - 1; i >= 0; i -= 1) {
      const artifact = pickArtifactReferenceFrom(source[i], { allowId, fallback });

      if (artifact) return artifact;
    }
  }

  const record = parseRecord(source);

  if (!record) return null;

  const artifactId =
    readFirstField(record, ['artifactId', 'ArtifactId']) || (allowId ? readFirstField(record, ['id', 'Id']) : '');
  const versionId = readFirstField(record, ['versionId', 'artifactVersionId', 'draftVersionId']);

  if (!artifactId || !versionId) return null;

  return {
    artifactId,
    versionId,
    name: readFirstField(record, ['name', 'appName']) || fallback.name || '',
    versionLabel: readFirstField(record, ['versionLabel']) || fallback.versionLabel || '',
  };
}

function pickArtifactReferenceFromText(text, fallback = {}) {
  if (!text) return null;
  const artifactId = text.match(/art-[a-z0-9-]+/i)?.[0];
  const versionId = text.match(/ver-[a-z0-9-]+/i)?.[0];

  if (!artifactId || !versionId) return null;

  return {
    artifactId,
    versionId,
    name: fallback.name || '',
    versionLabel: fallback.versionLabel || '',
  };
}

function isPlanBuilderMessage(message) {
  const agentName = stringValue(readField(message, 'agentName')) || '';

  return agentName === 'app-plan-builder-public' || agentName === 'app-plan-builder';
}

function pickLegacyArtifactReference(message) {
  const artifact = readField(message, 'artifact');
  const artifactId = stringValue(readField(artifact, 'id'));
  const versionId = stringValue(readField(artifact, 'versionId'));

  if (!artifactId || !versionId) return null;

  return {
    artifactId,
    versionId,
    name: stringValue(readField(artifact, 'name')) || '',
    versionLabel: stringValue(readField(artifact, 'versionLabel')) || '',
  };
}

function pickHistoryArtifactReference(message, text) {
  const data = parseRecord(readField(message, 'data'));
  const payload = parseRecord(readField(message, 'payload'));
  const metadata = parseRecord(readField(message, 'metadata'));
  const extra = parseRecord(readField(message, 'extra'));
  const content = parseRecord(text);
  const fallback = {
    name: readFirstField(message, ['name', 'appName']),
    versionLabel: readFirstField(message, ['versionLabel']),
  };
  const candidates = [
    { source: readField(message, 'artifact'), allowId: true },
    { source: readField(message, 'artifacts'), allowId: true },
    { source: readField(data, 'artifact'), allowId: true },
    { source: readField(data, 'artifacts'), allowId: true },
    { source: readField(payload, 'artifact'), allowId: true },
    { source: readField(payload, 'artifacts'), allowId: true },
    { source: readField(metadata, 'artifact'), allowId: true },
    { source: readField(metadata, 'artifacts'), allowId: true },
    { source: readField(extra, 'artifact'), allowId: true },
    { source: readField(extra, 'artifacts'), allowId: true },
    { source: readField(content, 'artifact'), allowId: true },
    { source: readField(content, 'artifacts'), allowId: true },
    { source: readField(readField(content, 'data'), 'artifact'), allowId: true },
    { source: readField(readField(content, 'data'), 'artifacts'), allowId: true },
    { source: readField(readField(content, 'payload'), 'artifact'), allowId: true },
    { source: readField(readField(content, 'payload'), 'artifacts'), allowId: true },
    { source: data },
    { source: payload },
    { source: metadata },
    { source: extra },
    { source: readField(content, 'data') },
    { source: readField(content, 'payload') },
    { source: content },
    { source: message },
  ];

  for (const candidate of candidates) {
    const artifact = pickArtifactReferenceFrom(candidate.source, {
      allowId: candidate.allowId,
      fallback,
    });

    if (artifact) return artifact;
  }

  return isPlanBuilderMessage(message) ? pickArtifactReferenceFromText(summarizeUnknown(message), fallback) : null;
}

export function pickAgentMessageArtifact(message, { anonymousPlan = false } = {}) {
  if (!anonymousPlan) return pickLegacyArtifactReference(message);

  return pickHistoryArtifactReference(
    message,
    stringValue(readField(message, 'content')) || stringValue(readField(message, 'text')) || '',
  );
}

// 搭建应用的 agent：历史里 plan-card 消息的紧邻下一条 assistant 消息若是它，说明该 plan 版本已用于搭建。
const BUILD_AGENT_NAME = 'build-app-agent';

// appId 为 8-4-4-4-12 的 GUID。用于从「搭建完成消息」里取出 build 出来的 appId，还原历史完成态的「打开应用」。
const APP_ID_REGEX = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

// /app/:appId 链接里的 appId 最可靠：完成文案里常先出现 worksheetId/viewId 等其它 GUID，
// 裸 GUID 取首个会抠错，优先从 /app/<GUID> 链接里取，取不到再退化到首个裸 GUID。
const APP_LINK_REGEX = /\/app\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;

function firstAppId(...values) {
  for (const value of values) {
    // stringValue 对空 / 非字符串返回 undefined，先兜底成空串再 match
    const matched = (stringValue(value) || '').match(APP_ID_REGEX);

    if (matched) return matched[0];
  }

  return '';
}

// 从搭建完成消息里解析 build 出来的 appId：先扫常见结构化字段（含嵌套 data/payload/metadata/extra/content），
// 取不到再兜底从消息原文里正则抠 GUID（完成文案 / create_app 结果 / /app/:appId 链接）。
function pickBuiltAppId(message) {
  if (!isRecord(message)) return '';
  const data = parseRecord(readField(message, 'data'));
  const payload = parseRecord(readField(message, 'payload'));
  const metadata = parseRecord(readField(message, 'metadata'));
  const extra = parseRecord(readField(message, 'extra'));
  const app = readField(message, 'app');
  const text = stringValue(readField(message, 'content')) || stringValue(readField(message, 'text')) || '';
  const content = parseRecord(text);
  const contentData = readField(content, 'data');

  const fromFields = firstAppId(
    readField(message, 'appId'),
    readField(data, 'appId'),
    readField(payload, 'appId'),
    readField(metadata, 'appId'),
    readField(extra, 'appId'),
    readField(app, 'appId'),
    readField(app, 'id'),
    readField(content, 'appId'),
    readField(contentData, 'appId'),
  );

  if (fromFields) return fromFields;

  // 结构化字段取不到再从原文兜底：先认 /app/<GUID> 链接，最后才退化到首个裸 GUID
  const linked = text.match(APP_LINK_REGEX);

  return (linked && linked[1]) || firstAppId(text);
}

// 「已搭建」标记：plan-card 消息的紧邻下一条 assistant 消息若是 build-app-agent，则该 plan 版本已用于搭建。
// 给 plan-card part 打 built 标记 + 带上 build 出来的 appId（解析自该搭建完成消息），供卡片显示「已搭建」、
// AppBuilder 还原完成态（Sidebar「打开应用」/ Header「已使用 v* 搭建」）。messages 与 rawOrdered 按下标一一对齐。
function markBuiltPlanCards(messages, rawOrdered) {
  for (let i = 0; i < messages.length; i += 1) {
    const planPart = (messages[i].parts || []).find(p => p.kind === 'plan-card');

    if (!planPart) continue;

    for (let j = i + 1; j < messages.length; j += 1) {
      // 跳过中间的用户触发消息 / 空消息（末尾会被 filter 掉、用户也看不到），只认紧邻的下一条 assistant 消息
      if (!messages[j].parts.length || messages[j].role !== 'assistant') continue;
      if (messages[j].agentName === BUILD_AGENT_NAME) {
        planPart.built = true;
        planPart.builtAppId = pickBuiltAppId(rawOrdered[j]);
      }

      break;
    }
  }
}

// 会话时间字段是 "2026-05-27 14:16:32" 这类字符串：转时间戳用于排序（替换 - 为 / 兼容 Safari）
function toTimestamp(value) {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  const time = new Date(String(value).replace(/-/g, '/')).getTime();

  return Number.isNaN(time) ? 0 : time;
}

// 拉取当前用户的会话分页。hasMore 基于过滤前的接口结果计算，避免 session-bot 会话被过滤后误判为末页。
export async function fetchAgentSessionPage({ page = 1, size = 50, keyword = '', agentName = '' } = {}) {
  const args = { page, size };
  if (keyword) args.keyword = keyword;
  // 帮助中心等钉住 agent 的场景：按 agentName 精确过滤，只取该 agent 名下会话
  if (agentName) args.agentName = agentName;
  const res = await agentAjax.getAgentSessions(args, { silent: true });
  const body = res && res.data !== undefined ? res.data : res;
  const rawItems = pickList(body, ['items', 'sessions', 'list', 'data']);

  return {
    items: rawItems
      .map(item => ({
        sessionId: stringValue(readField(item, 'sessionId')) || stringValue(readField(item, 'id')) || '',
        title:
          stringValue(readField(item, 'firstMessage')) ||
          stringValue(readField(item, 'title')) ||
          stringValue(readField(item, 'summary')) ||
          _l('未命名会话'),
        updateTime:
          readField(item, 'lastActiveTime') ||
          readField(item, 'updateTime') ||
          readField(item, 'lastMessageTime') ||
          readField(item, 'createTime') ||
          null,
      }))
      // session-bot- 前缀为单轮 bot 工具调用（建表 / 填记录 / 生成示例数据 / 优化应用信息等旧功能）的会话，
      // 不属于可续接的主对话，历史会话列表里排除（见 genBotSessionId）。
      .filter(item => item.sessionId && !item.sessionId.startsWith('session-bot-'))
      .sort((a, b) => toTimestamp(b.updateTime) - toTimestamp(a.updateTime)),
    hasMore: rawItems.length >= size,
  };
}

// 拉取当前用户的会话列表（历史会话），按最近活跃时间倒序；传 keyword 时由后端按标题检索
export async function fetchAgentSessions(args) {
  const { items } = await fetchAgentSessionPage(args);

  return items;
}

// 取单个会话的后端标题（firstMessage，含重命名）。无「单会话信息」接口，从会话列表首页按 sessionId 查找；
// 找不到（新会话尚未入列表 / 超出首页）返回 ''，由调用方回退到本地首条用户消息。
export async function fetchAgentSessionTitle(sessionId) {
  if (!sessionId) return '';

  try {
    const list = await fetchAgentSessions({ size: 50 });

    return (list.find(item => item.sessionId === sessionId) || {}).title || '';
  } catch (err) {
    console.error('[agent] fetch session title failed', err);
    return '';
  }
}

// 会话重命名：改的就是列表展示标题（后端 firstMessage 字段）。title 需 trim 非空、≤100 字。
// 成功返回后端回显的 trim 后标题，失败抛错由调用方提示。
export async function renameAgentSession(sessionId, title) {
  const res = await agentAjax.agentSessionsRename({ sessionId, title }, { silent: true });

  if (!res || res.success === false) {
    throw new Error((res && res.errorMessage) || 'rename failed');
  }

  const data = res.data || {};
  return stringValue(readField(data, 'title')) || title;
}

// 会话软删除：仅在元数据打删除标记、不删消息正文，幂等。成功后调用方从列表移除该项即可。
export async function deleteAgentSession(sessionId) {
  const res = await agentAjax.deleteAgentSessions({ sessionId }, { silent: true });

  if (!res || res.success === false) {
    throw new Error((res && res.errorMessage) || 'delete failed');
  }

  return true;
}

// —— V6.0 会话分享 / V6.1 继续对话 ——
// 可见范围三态（后端 SessionShareScopes）：public 任何人 / login 任何登录用户 / org 仅目标组织成员。
// 主站 EditEntityShareStatus 侧用数字 scope 表达同一语义（0 = 全部，1 = 本网络），映射见 ui/ShareDialog。
export const SESSION_SHARE_SCOPE = {
  PUBLIC: 'public',
  LOGIN: 'login',
  ORG: 'org',
};

// 创建分享实体，返回 shareId —— 即随后登记进 MDAPI 的 appentityshare.SourceId。两步流程的第一步，顺序不能反。
// 双锚点：整会话分享（不传 messageIds）的 shareId 恒等于 sessionId，故前端仅凭 sessionId 就能反查「这个会话分享过没」；
// 选择性分享（传 messageIds，≤100）每次都是新的随机串，不参与反查。
export async function createSessionShare({ sessionId, scope, projectId, messageIds } = {}) {
  const args = { sessionId };

  if (scope) args.scope = scope;
  // projectId 仅 org 允许携带且必填，其余 scope 带了后端直接 400
  if (scope === SESSION_SHARE_SCOPE.ORG && projectId) args.projectId = projectId;
  if (Array.isArray(messageIds) && messageIds.length) args.messageIds = messageIds;

  const res = await agentAjax.agentSessionsShares(args, { silent: true });

  if (!res || res.success === false) {
    throw new Error((res && res.errorMessage) || 'create share failed');
  }

  const shareId = stringValue(readField(res.data || res, 'shareId'));

  if (!shareId) throw new Error('create share failed');

  return shareId;
}

// 分享相关接口的错误码（后端统一信封 { success:false, errorCode, errorMessage }）
export const SHARE_ERROR = {
  ACCESS_DENIED: 'share_access_denied', // 403：clientId 失效 / 分享已关 / 组织内分享非成员，刻意不区分原因
  SESSION_NOT_FOUND: 'session_not_found', // 404：来源会话已被删除或没有可读消息
  RATE_LIMIT: 'rate_limit_exceeded', // 429：clientId 维度限流
};

// agent 服务非 2xx 时 reject 的是 axios response（见 window.agentAPI），2xx 也可能带 success:false。
// 统一归一化成带 errorCode / status 的 Error，交给分享页按状态分流（403 → 无权限终态、429 → 稍后重试…）。
function buildShareError(source) {
  const body = (isRecord(source) && readField(source, 'data')) || source || {};
  const error = new Error(stringValue(readField(body, 'errorMessage')) || 'share request failed');

  error.errorCode = stringValue(readField(body, 'errorCode'));
  error.status = readField(source, 'status');

  return error;
}

// 读取分享内容：shareId 锚点的独立端点（不复用 {sessionId}/messages）。
// clientId 是唯一授权载体，只在这里作为独立 Header 携带——严禁塞进全局拦截器，登录态浏览自己会话绝不能带。
// 后端已脱敏：accountId / sessionId / traceId 恒空串、usage 恒 null，附件 url 为 1 小时签名，不要持久化。
export async function fetchSharedSessionMessages({ shareId, clientId, page = 1, size = 100 } = {}) {
  let res;

  try {
    res = await agentAjax.getAgentSessionsSharesMessages(
      { shareId, page, size },
      { header: clientId ? { clientId } : undefined, silent: true },
    );
  } catch (err) {
    throw buildShareError(err);
  }

  if (res && res.success === false) {
    throw buildShareError({ data: res });
  }

  const body = res && res.data !== undefined ? res.data : res;
  const rawItems = pickList(body, ['items', 'messages', 'list', 'data']);

  // 交给同一套归一化，拿到与登录态渲染层完全一致的 message/parts 结构（传 rawItems 不再发请求）
  return fetchAgentSessionMessages(shareId, { rawItems, includeUsage: false });
}

// 分享页「继续对话」：登录态 + clientId 双要素（clientId 证明确实合法过闸看到过内容）。
// 分享人本人 → 返回原会话（forked=false）；其他访客 → fork 出归属自己的新会话（forked=true）。
// 前端无差别处理：拿 sessionId 跳正常对话页即可。
export async function continueSharedSession({ shareId, clientId } = {}) {
  let res;

  try {
    res = await agentAjax.agentSessionsSharesContinue(
      { shareId },
      { header: clientId ? { clientId } : undefined, silent: true },
    );
  } catch (err) {
    throw buildShareError(err);
  }

  if (!res || res.success === false) {
    throw buildShareError({ data: res || {} });
  }

  const data = res.data || res;
  const sessionId = stringValue(readField(data, 'sessionId'));

  if (!sessionId) throw new Error('continue share failed');

  return { sessionId, forked: !!readField(data, 'forked') };
}

// 从消息/用量对象里取本轮消耗的信用点：四位小数 number。
// 无 usage / 非数值（未结算、user 消息、计费未开启的老会话）返回 null；
// 0（及负值）同样返回 null——历史里未产生扣费的轮次不展示「0 信用点」，渲染层据此隐藏信用点行。
function readCredits(usage) {
  if (!isRecord(usage)) return null;
  const credits = Number(readField(usage, 'credits'));

  return Number.isFinite(credits) && credits > 0 ? credits : null;
}

// 拉取指定会话的原始消息分页。官网免登录 plan 页用它先做“是否有历史”的门控，
// 其他登录态历史仍走 fetchAgentSessionMessages，并默认带 includeUsage=true 展示信用点。
export async function fetchAgentSessionMessagePage(sessionId, { page = 1, size = 50, includeUsage = false } = {}) {
  const params = { sessionId, page, size };

  if (includeUsage === true) params.includeUsage = true;

  const res = await agentAjax.getAgentSessionsMessages(params, { silent: true });
  const body = res && res.data !== undefined ? res.data : res;
  const items = pickList(body, ['messages', 'items', 'list', 'data']);
  const totalCount = Number(readField(body, 'totalCount'));

  return {
    page: Number(readField(body, 'page')) || page,
    size: Number(readField(body, 'size')) || size,
    totalCount: Number.isFinite(totalCount) ? totalCount : items.length,
    items,
  };
}

// 拉取指定会话的全部消息，返回与渲染层一致的 message/parts 结构（接口按时间倒序，反转为正序）。
// includeUsage=true：已结算轮的 assistant 消息附带 usage.credits，历史里直接展示本轮消耗的信用点。
// includeAnonymousPlanArtifact=true：仅官网免登录 plan 历史使用，兼容匿名接口的 artifactId/artifactVersionId。
export async function fetchAgentSessionMessages(
  sessionId,
  { page = 1, size = 50, includeUsage = true, includeAnonymousPlanArtifact = false, rawItems } = {},
) {
  const rawList = Array.isArray(rawItems)
    ? rawItems
    : (await fetchAgentSessionMessagePage(sessionId, { page, size, includeUsage })).items;

  const rawOrdered = rawList.slice().reverse();
  const messages = rawOrdered.map((m, index) => {
    const role = (readField(m, 'role') || '').toLowerCase() === 'user' ? 'user' : 'assistant';
    const text = stringValue(readField(m, 'content')) || stringValue(readField(m, 'text')) || '';
    const rawAttachments = readField(m, 'attachments');
    const attachments = Array.isArray(rawAttachments)
      ? rawAttachments
          .map(a => ({
            type: stringValue(readField(a, 'type')) || 'doc',
            url: stringValue(readField(a, 'url')) || '',
            name: stringValue(readField(a, 'name')) || '',
            size: readField(a, 'size') || 0,
          }))
          .filter(a => a.url)
      : [];
    const parts = [];

    if (attachments.length) parts.push({ kind: 'attachment', items: attachments, ts: index });
    // 用户消息不走 markdown：把 ```mingo_embed_data_*``` 还原为独立 embed part；assistant 仍保留整段交给 markdown
    if (text && role === 'user') {
      extractEmbedSegments(text).forEach(seg => {
        if (seg.type === 'embed') {
          // 静默 embed（系统触发语 trigger_build_summary，或全部跳过的 ask_reply）：整段跳过——
          // 消息 parts 为空时末尾 filter 会把整条消息从列表里去掉。
          if (isSilentEmbedSegment(seg.suffix, seg.data)) return;
          parts.push({ kind: 'embed', suffix: seg.suffix, data: seg.data, ts: index });
        } else if (seg.text.trim()) {
          parts.push({ kind: 'text', text: seg.text, ts: index });
        }
      });
    } else if (text) {
      // assistant 历史文本里可能含 <workEnd />：切出折叠的工作阶段 part（无时间戳，不显示时长）
      splitWorkPartsFromText(text, index).forEach(part => parts.push(part));
    }

    // 历史里若本轮 assistant 提交过 artifact（plan 产出），还原一张 plan-card，
    // 点击可重新打开 AppBuilder 并加载该已提交版本的文件。
    const artifact =
      role === 'assistant' ? pickAgentMessageArtifact(m, { anonymousPlan: includeAnonymousPlanArtifact }) : null;

    if (role === 'assistant' && artifact) {
      parts.push({
        kind: 'plan-card',
        status: 'committed',
        name: artifact.name,
        versionLabel: artifact.versionLabel,
        artifactId: artifact.artifactId,
        versionId: artifact.versionId,
        ts: index,
      });
    }

    return {
      id: `history-${index}`,
      // 后端消息 id：选择性分享（messageIds）与消息去重的唯一依据。实时流出的消息没有，故不可参与勾选
      messageId: stringValue(readField(m, 'messageId')),
      // 历史消息若带 traceId，反馈时优先使用；匿名分享接口会按后端契约返回空值。
      traceId: stringValue(readField(m, 'traceId')) || '',
      role,
      // 用户消息保留原始文本（含 embed 段原文）：恢复历史后意图弹层选"都不是"(none_of_these)时，
      // 须把用户最后一条原始 message 原样回传后端供重路由；从 parts 反拼会丢 embed 原文。
      rawText: role === 'user' ? text || '' : undefined,
      name: role === 'user' ? _l('你') : 'Mingo',
      // 本轮解析到的 agent；用于历史加载时判断"是否搭建过 / 最后一条是否搭建"（build-app-agent）
      agentName: stringValue(readField(m, 'agentName')),
      // 本轮消耗的信用点（仅 assistant、已结算轮有）；历史直接取接口里的 usage.credits，不再轮询
      credits: role === 'assistant' ? readCredits(readField(m, 'usage')) : null,
      // 本轮消息生成时间，与信用点同一行展示
      time: readField(m, 'createTime') || readField(m, 'time') || null,
      parts,
    };
  });

  // 在 filter 前按完整顺序检测「已搭建」（messages 与 rawOrdered 下标对齐，便于从原始消息解析 appId）
  markBuiltPlanCards(messages, rawOrdered);

  return messages.filter(m => m.parts.length);
}

// 拉取 artifact 单文件元信息：返回 { success, path, url, mimeType, size, contentHash, expiresAt }
export function fetchArtifactFile({ artifactId, versionId, path }) {
  return agentAjax.getArtifactsVersionsFilesByPath({ artifactId, versionId, path }, { silent: true });
}

function readArtifactFilesFromResponse(res) {
  const body = readField(res, 'data') || res;
  const candidates = [body, readField(body, 'data')].filter(Boolean);

  for (const candidate of candidates) {
    const files = pickList(candidate, ['files', 'items', 'list', 'data']);

    if (files.length) return files;
  }

  return [];
}

// 列出某 artifact 版本实际存在的「文件」→ 签名 url 映射（Map<path, url>，过滤掉 directory）。
// 列表接口已直接返回每个文件的签名 url，故历史还原时可据此「实际存在 ∩ 前端登记表」筛选，并直接拉内容，
// 省掉逐文件的 getArtifactsVersionsFilesByPath 取 url。接口异常 / 结构不符返回 null，调用方回退到逐文件拉取，不漏文件。
export async function fetchArtifactFileList({ artifactId, versionId } = {}) {
  if (!artifactId || !versionId) return null;

  const res = await agentAjax.getArtifactsVersionsFiles({ artifactId, versionId }, { silent: true });
  const files = readArtifactFilesFromResponse(res);

  if (!files.length) return null;

  const urlByPath = new Map();

  files.forEach(f => {
    const type = stringValue(readField(f, 'type'));
    const path = stringValue(readField(f, 'path'));
    const url = stringValue(readField(f, 'url')) || '';

    if ((!type || type.toLowerCase() === 'file') && path) urlByPath.set(path, url);
  });

  return urlByPath;
}

export async function fetchArtifactFileContent({ artifactId, versionId, path, urlByPath } = {}) {
  if (!artifactId || !versionId || !path) return '';

  const hasListedPath = urlByPath instanceof Map && urlByPath.has(path);
  let url = hasListedPath ? urlByPath.get(path) : '';

  if (!url) {
    const meta = await fetchArtifactFile({ artifactId, versionId, path });

    url = meta && meta.url;
  }

  if (!url) return '';

  const res = await fetch(url);

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  return res.text();
}

// 拉取某已提交版本的 /jsons/app.json 并解析出应用图标/主色/名称。
// 历史会话还原、修改已有应用场景下，plan 卡片需要真实的 appIcon/appColor（与 AppBuilder 读的同一份）。
export async function fetchArtifactAppMeta({ artifactId, versionId } = {}) {
  if (!artifactId || !versionId) return null;

  const content = await fetchArtifactFileContent({ artifactId, versionId, path: '/jsons/app.json' });

  if (!content) return null;

  const json = safeParse(content, 'object');

  if (!json || typeof json !== 'object') return null;

  return {
    appIcon: stringValue(json.appIcon) || '',
    appColor: stringValue(json.appColor) || '',
    appName: stringValue(json.appName) || '',
  };
}

// 显式终止服务端正在执行的 run：仅 abort 本地 SSE 不会停掉服务端，需调取消接口。
// agentCancel 按 accountId|sessionId 物理隔离取消活跃执行；无活跃 run 返回 not_in_flight，静默忽略。
export function cancelAgentRun(sessionId) {
  if (!sessionId) return Promise.resolve();
  return agentAjax.agentCancel({ sessionId }, { silent: true }).catch(() => {});
}

// 从服务端取会话的 build 快照（SSE 断连/页面刷新后的兜底通道），返回 { resumable, pendingConfirmation, appId }：
//  - resumable：是否还有未完成的搭建。该标记只靠内存 ref 记不住——刷新或重进会话后组件重挂、退回 false，
//    下一条「继续」会重传整份 plan context，与首建 hash 对不上 → 误弹「搭建方案有变化」。
//  - pendingConfirmation：挂起中的意图弹层快照 { stepId, options }。弹层原本只是一次性 SSE 事件，刷新即丢，
//    而其中的 none_of_these（「我想做点别的」）是用户从一次误路由里脱身的唯一出口，丢了会话就卡在搭建语境里。
//    后端字段刻意与 SSE completed 事件 payload 同名同义，可直接喂给 upsertRebuildConfirm，无需另写还原分支。
//  - appId：本次搭建已建出的应用（detail.steps 里 step-create-app 的 outputs）。续建轮 checkpoint 续跑不会重放
//    create_app / step-create-app 事件，extractAppCreatedIds 取不到 appId，而 AppBuilder 的 iframe 预览必须有
//    appId 才打得开（见 app:meta 的 `if (appId) setOverlayOpen(true)`）；搭建尚未完成时也没有完成消息可供
//    pickBuiltAppId 挖取，checkpoint 是这个窗口里唯一还留着 appId 的地方。
// 后端按 accountId|sessionId 物理隔离，跨账号查不到记录（返回空进度 + resumable=false）。
// 任何异常一律当作「无未完成搭建、无挂起弹层、无应用」，宁可少还原也不要因为兜底通道失败而阻断会话加载。
export async function fetchSessionBuildSnapshot(sessionId) {
  const empty = { resumable: false, pendingConfirmation: null, appId: '' };

  if (!sessionId) return empty;

  try {
    const res = await agentAjax.getAgentProgress({ sessionId, detail: true }, { silent: true });
    const body = readField(res, 'data') || res;
    const pending = readField(body, 'pendingConfirmation');
    const steps = readField(readField(body, 'detail'), 'steps');
    const created = (Array.isArray(steps) ? steps : []).find(
      step => stringValue(readField(step, 'stepId')) === 'step-create-app',
    );

    return {
      // resumable 即「有真实进度且未成功收尾」，已覆盖 in_progress / 挂起等确认等各态（success 时后端强制 false），
      // 不必再叠 status 判断
      resumable: readField(body, 'resumable') === true,
      // options 为空的弹层还原出来也点不动（后端 options 为空时本就不回吐），按无挂起处理
      pendingConfirmation: isRecord(pending) && (readField(pending, 'options') || []).length ? pending : null,
      appId: stringValue(readField(readField(created, 'outputs'), 'appId')) || '',
    };
  } catch {
    return empty;
  }
}

// 取某 plan(artifactId + versionId) 的 build 费用预估。后端响应：{ data: { status, credits: { estimated, max } } }；
// status==='ready' 才有有效 credits.estimated（信用点，可为小数）；其余状态视作仍在计算（pending）。
// 返回 { status, credits }：status 为 'ready' | 'pending' | 'error'；credits 为预估信用点数或 null（含 0 合法值）。
// 兜底兼容是否已剥外层 data 包裹；网络/异常吞掉返回 error，调用方据此渲染「计算中…」或停止轮询。
export async function fetchBuildEstimate(artifactId, versionId) {
  if (!artifactId) return { status: 'error', credits: null };

  try {
    const res = await agentAjax.getAgentBuildEstimate({ artifactId, versionId }, { silent: true });
    const body = readField(res, 'data') || res;
    const status = stringValue(readField(body, 'status')) || '';
    const estimated = Number(readField(readField(body, 'credits'), 'estimated'));
    const ready = status === 'ready';

    return {
      status: ready ? 'ready' : status || 'pending',
      credits: ready && Number.isFinite(estimated) ? estimated : null,
    };
  } catch {
    return { status: 'error', credits: null };
  }
}

// 按 traceId 查本轮用量汇总（接口 3 usage/{traceId}）：新消息 stream 收尾后轮询本轮用量。
// 返回 { settled, credits }：settled 为 accountStatus==='settled'（已扣完、credits 为终值，含 0 合法值）；
// pending_aggregate / traceId 未落库（接口返 credits=0+pending）/ 异常都视作未结算（settled:false），由调用方继续轮询。
// 调用方只在 settled 时写入 credits，避免把阶段值 / 未命中的 0 误显示。
export async function fetchTraceUsage(traceId, projectId) {
  if (!traceId || !projectId) return { settled: false, credits: null };

  try {
    const res = await agentAjax.getAgentBillingUsage({ traceId, projectId }, { silent: true });
    const body = readField(res, 'data') || res;
    const settled = (stringValue(readField(body, 'accountStatus')) || '').toLowerCase() === 'settled';
    const credits = Number(readField(body, 'credits'));

    return { settled, credits: Number.isFinite(credits) ? credits : null };
  } catch {
    return { settled: false, credits: null };
  }
}

function normalizeStreamEvent(payload) {
  return {
    eventType: stringValue(payload.eventType) || stringValue(payload.EventType) || '',
    traceId: stringValue(payload.traceId) || stringValue(payload.TraceId) || '',
    agentName: stringValue(payload.agentName) || stringValue(payload.AgentName) || null,
    // delta 是流式增量内容，空白/换行有意义，绝不能 trim：
    // 否则块间 \n\n 被砍、纯 "\n\n" chunk 整段丢弃，导致 markdown 块粘连（--- 与 ## 粘连、表格行挤在一起）。
    delta: typeof payload.delta === 'string' ? payload.delta : typeof payload.Delta === 'string' ? payload.Delta : null,
    data: payload.data !== undefined ? payload.data : payload.Data,
    // 本轮 assistant 消息的后端 id：completed 事件顶层回传（V6.4），供分享 / 重新生成直接作锚点，
    // 免去每轮再整拉一次消息列表。仅 completed 带，其余事件为空
    messageId: stringValue(payload.messageId) || stringValue(payload.MessageId) || '',
    debug: payload.debug !== undefined ? payload.debug : payload.Debug,
    errorCode: stringValue(payload.errorCode) || stringValue(payload.ErrorCode) || null,
    errorMessage: stringValue(payload.errorMessage) || stringValue(payload.ErrorMessage) || null,
  };
}

function parseSseBlock(block) {
  const lines = block
    .split(/\r?\n/)
    .map(l => l.trimEnd())
    .filter(Boolean);
  let eventName = 'message';
  const dataLines = [];

  for (const line of lines) {
    if (line.startsWith('event:')) eventName = line.slice('event:'.length).trim();
    else if (line.startsWith('data:')) dataLines.push(line.slice('data:'.length).trim());
  }

  if (!dataLines.length) return null;
  try {
    const payload = normalizeStreamEvent(JSON.parse(dataLines.join('\n')));

    return { eventName: eventName || payload.eventType || 'message', payload, receivedAt: Date.now() };
  } catch {
    return null;
  }
}

export async function requestAgentStream(
  {
    sessionId,
    message,
    agentName,
    projectId,
    forceReroute,
    forceRefresh,
    attachments,
    context,
    artifactId,
    basedOnVersionId,
    confirmation,
    captchaTicket,
    captchaRandstr,
    regenerateFromMessageId,
  },
  { onEvent, enableCaptcha = false } = {},
  externalSignal,
) {
  const abortController = new AbortController();

  if (externalSignal) {
    if (externalSignal.aborted) abortController.abort();
    else externalSignal.addEventListener('abort', () => abortController.abort(), { once: true });
  }

  const createStreamRequestError = async response => {
    const errorText = response ? await response.text().catch(() => '') : '';
    const error = new Error(errorText || `Stream request failed: ${response ? response.status : 'no response'}`);

    error.status = response && response.status;
    error.data = safeParse(errorText, 'object');
    return error;
  };

  const createStreamEventError = event => {
    const payload = (event && event.payload) || {};
    const errorCode = stringValue(readField(payload, 'errorCode'));
    const errorMessage = stringValue(readField(payload, 'errorMessage')) || _l('Agent 执行失败');
    const error = new Error(JSON.stringify({ errorCode, errorMessage }));

    error.status = errorCode === 'captcha_required' || errorCode === 'captcha_failed' ? 403 : undefined;
    error.data = { errorCode, errorMessage };
    return error;
  };

  const requestStream = async extra => {
    const response = await agentAjax.agentExecuteStream(
      {
        sessionId,
        message,
        agentName: agentName || undefined,
        projectId: projectId || undefined,
        forceReroute,
        forceRefresh,
        attachments: attachments && attachments.length ? attachments : undefined,
        context: context && Object.keys(context).length ? context : undefined,
        // 指定基线版本时进入后端 LOCKED 分支：基于该版本 fork（点回旧版本继续调整）；两者必须同时传
        artifactId: artifactId || undefined,
        basedOnVersionId: basedOnVersionId || undefined,
        // plan 漂移 / confirmation 节点续传：结构化决策字段，后端按 confirmation.stepId 路由
        confirmation: confirmation || undefined,
        captchaTicket: (extra && extra.captchaTicket) || captchaTicket || undefined,
        captchaRandstr: (extra && extra.captchaRandstr) || captchaRandstr || undefined,
        // V6.3 重新生成：传被点那条 assistant 回复的后端 messageId，提问原文与附件由服务端从库里取。
        // 与 message / attachments / checkpointId 互斥（同传后端 400），调用方走该分支时不传 message。
        regenerateFromMessageId: regenerateFromMessageId || undefined,
      },
      { abortController, silent: true },
    );

    if (!response || !response.ok) throw await createStreamRequestError(response);
    if (!response.body) throw new Error('Streaming response body is empty.');

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const blocks = buffer.split('\n\n');

      buffer = blocks.pop() || '';
      for (const block of blocks) {
        const parsed = parseSseBlock(block);

        if (parsed && enableCaptcha && parsed.eventName === 'error') throw createStreamEventError(parsed);
        if (parsed && onEvent) onEvent(parsed);
      }
    }
  };

  await (enableCaptcha ? withAnonymousCaptcha(requestStream) : requestStream());
}

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'heic', 'heif'];

function toAttachmentType(file) {
  const type = String((file && file.type) || '').toLowerCase();

  if (type === 'image' || type.startsWith('image/')) return 'image';
  const name = (file && file.name) || '';
  const fileExtension = file && (file.fileExt || (file.file && file.file.fileExt));
  const ext = String(fileExtension || name.split('.').pop() || '')
    .replace(/^\./, '')
    .toLowerCase();

  return IMAGE_EXTENSIONS.includes(ext) ? 'image' : 'doc';
}

export function mapAttachmentForRequest(item) {
  return { type: toAttachmentType(item), url: item.url, name: item.name, size: item.size };
}
