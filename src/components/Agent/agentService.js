import agentAjax from 'src/api/agent';
import { withCaptcha as withAnonymousCaptcha } from './anonymous';
import { extractEmbedSegments, isSilentEmbedSegment } from './ui/embed/protocol';
import { splitWorkPartsFromText } from './workParts';

// Agent 对话附件允许的文件类型：ChatPanel 输入框与 MingoWelcome 首页共用同一份，避免两处各维护导致不同步
export const AGENT_ATTACHMENT_MIME_TYPES = [
  { title: 'image', extensions: 'jpg,jpeg,png,webp,gif' },
  {
    title: 'doc',
    extensions: 'docx,doc,wps,xlsx,pptx,ppt,pdf,xls,md,markdown,txt,csv,json,jsonl,xml,htm,html,yaml,yml,log,toml,ini',
  },
];

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

// 大小写不敏感的字段读取：后端 Pascal / camel 混用，统一兜底
export function readField(source, key) {
  if (!isRecord(source)) return undefined;
  if (key in source) return source[key];
  const target = key.toLowerCase();

  for (const [k, v] of Object.entries(source)) {
    if (k.toLowerCase() === target) return v;
  }

  return undefined;
}

export function stringValue(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

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

// 拉取当前用户的会话列表（历史会话），按最近活跃时间倒序；传 keyword 时由后端按标题检索
export async function fetchAgentSessions({ page = 1, size = 50, keyword = '' } = {}) {
  const args = { page, size };
  if (keyword) args.keyword = keyword;
  const res = await agentAjax.getAgentSessions(args, { silent: true });
  const body = res && res.data !== undefined ? res.data : res;

  return (
    pickList(body, ['items', 'sessions', 'list', 'data'])
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
      .sort((a, b) => toTimestamp(b.updateTime) - toTimestamp(a.updateTime))
  );
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

// 从消息/用量对象里取本轮消耗的信用点：四位小数 number，0 合法（命中缓存的零成本轮）；
// 无 usage / 非数值（未结算、user 消息、计费未开启的老会话）返回 null，渲染层据此不显示信用点行。
function readCredits(usage) {
  if (!isRecord(usage)) return null;
  const credits = Number(readField(usage, 'credits'));

  return Number.isFinite(credits) ? credits : null;
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
      role,
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

// 按 traceId 查本轮用量汇总（接口 3 usage/{traceId}）：新消息 stream 收尾后轮询用它拿「这一轮花了多少信用点」。
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

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'gif'];

function toAttachmentType(file) {
  const mime = (file && file.type) || '';

  if (typeof mime === 'string' && mime.startsWith('image/')) return 'image';
  const ext = ((file && file.name) || '').split('.').pop().toLowerCase();

  return IMAGE_EXTENSIONS.includes(ext) ? 'image' : 'doc';
}

export function mapAttachmentForRequest(item) {
  return { type: toAttachmentType(item), url: item.url, name: item.name, size: item.size };
}
