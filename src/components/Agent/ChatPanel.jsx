import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import copy from 'copy-to-clipboard';
import styled from 'styled-components';
import { BgIconButton } from 'ming-ui';
import { Button, Checkbox, Modal } from 'ming-ui/antd-components';
import projectAjax from 'src/api/project';
import SharePopup from 'mobile/components/SharePopup';
import AddedFiles from 'src/components/Mingo/ChatBot/components/AddedFiles';
import MingoAttachmentUploader from 'src/components/Mingo/ChatBot/components/AttachmentUploader';
import PlayAnimation from 'src/components/Mingo/ChatBot/components/sound_animation.svg';
import { getDefaultMingoProjectId } from 'src/components/Mingo/permission';
import { upgradeVersionDialog } from 'src/components/upgradeVersion';
import Share from 'src/pages/worksheet/components/Share';
import { SpeechSynthesizer } from 'src/utils/platform/browser/audio';
import { browserIsMobile } from 'src/utils/platform/browser/device';
import { emitter } from 'src/utils/platform/browser/dom';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import { FEATURE_PERMISSION, hasFeaturePermission } from 'src/utils/services/security/permission';
import { useAgentBus, useAgentEvent } from './agentBus';
import {
  AGENT_ATTACHMENT_MIME_TYPES,
  AGENT_HEADER_EVENT,
  cancelAgentRun,
  createAgentSessionId,
  fetchAgentSessionMessages,
  fetchAgentSessionTitle,
  fetchArtifactAppMeta,
  fetchArtifactFile,
  fetchArtifactFileContent,
  fetchArtifactFileList,
  fetchSessionBuildSnapshot,
  fetchTraceUsage,
  getCompletedText,
  mapAttachmentForRequest,
  requestAgentStream,
  saveHelpAgentSessionId,
} from './agentService';
import { clearAnonHandoff, isCaptchaCancelled, PROD_AGENT, requestAnonymousVoiceToken } from './anonymous';
import AppBuilder from './AppBuilder';
import { FILE_ENTRIES } from './AppBuilder/fileRegistry';
import { fetchAppCandidates } from './appSource';
import {
  composeAppContext,
  getCurrentAppId,
  getCurrentProjectId,
  hasMeaningfulContext,
  isAppListPage,
} from './buildContext';
import { formatPartTs, IS_DEBUG, logSseEvent } from './debug';
import { buildSessionShareProps } from './sessionShare';
import {
  appendEventToParts,
  applyCompletedAppName,
  ensureCompletedText,
  extractAppCreatedIds,
  forwardFileEvent,
  markBuildProgressAborted,
  markBuildProgressFinished,
  removeExtractParts,
  resolvePlanDrift,
  resolveRebuildConfirm,
  restorePendingConfirmation,
  upsertExtractPart,
  upsertRebuildConfirm,
} from './streamEvents';
import {
  AnonAttachmentSlot,
  AttachmentTooltip,
  BuildProgress,
  Conversation,
  ConversationContent,
  ConversationSkeleton,
  ExtractStatus,
  LoadingDots,
  Message,
  MessageActionsBar,
  MessageContent,
  MessageFooter,
  MessageMeta,
  MessageResponse,
  PlanCard,
  PlanDriftCard,
  PromptInput,
  Reasoning,
  RebuildConfirmCard,
  ResponseError,
  SessionHistory,
  ThinkingSummary,
  ToolCall,
  useAgentFeedback,
  WorkPhase,
} from './ui';
import {
  ASK_REPLY_SUFFIX,
  AskSkeleton,
  buildEmbedFence,
  extractAsk,
  extractEmbedSegments,
  getEmbedComponent,
  isSilentEmbedSegment,
  MODIFY_PLAN_SUFFIX,
  TRIGGER_BUILD_SUMMARY_SUFFIX,
} from './ui/embed';
import AskEmbed from './ui/embed/Ask';
import { ChartSaveProvider } from './ui/embed/chartSaveContext';
import ModifyPlanComposer from './ui/ModifyPlanComposer';
import {
  fetchHelpSessionShareUrl,
  HelpComposerBar,
  openCustomerService,
  TransferHumanDialog,
} from './ui/TransferHuman';
import { readField, stringValue } from './valueUtils';

const ASSISTANT_NAME = 'Mingo';
// 不展示信用点用量的 agent：help-agent（帮助/答疑）不计费，气泡上不显示费用、也不轮询用量。
const HIDDEN_USAGE_AGENTS = ['help-agent'];

// 计费展示统一门控：非平台版（platformENV.isPlatform 为 false，如普通私有部署）无信用点计费体系，
// 计费相关交互整体隐藏——气泡下不显示费用（含历史消息自带的 usage.credits）、也不轮询用量。
function shouldHideUsage(agentName) {
  return !window.platformENV.isPlatform || HIDDEN_USAGE_AGENTS.includes(agentName);
}

const PROMPT_INPUT_ID = 'agent-prompt-input';
const ATTACHMENT_TOKEN_TYPE = 71;
const MAX_ATTACHMENTS = 5;
// 选择性分享单次最多勾选的消息数（后端 messageIds 硬上限）
const MAX_SHARE_MESSAGES = 100;

// 把会话消息列表（时间正序）的后端 messageId 对齐回填到本地消息：从尾部按角色逐条比对，
// 遇角色不齐即停，避免隐藏 / 汇总消息错位导致错配；已被占用的 id 不复用。
// 返回补齐后的新数组；无任何补齐则返回 null。
function alignMessageIds(list, history) {
  const usedIds = new Set(list.map(m => m.messageId).filter(Boolean));
  const next = [...list];
  let i = next.length - 1;
  let j = history.length - 1;
  let patched = false;

  while (i >= 0 && j >= 0) {
    if (next[i].role !== history[j].role) break;
    const historyId = history[j].messageId;

    if (!next[i].messageId && historyId && !usedIds.has(historyId)) {
      next[i] = { ...next[i], messageId: historyId };
      usedIds.add(historyId);
      patched = true;
    }

    i--;
    j--;
  }

  return patched ? next : null;
}

const Wrap = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  overflow: hidden;
  background: var(--color-background-primary);

  /* 落地页三栏：搭建/预览可见时对话收成右栏（420px），AppBuilder 占中栏；否则铺满 */
  ${p =>
    p.$dock
      ? `flex: 0 0 420px; width: 420px; min-width: 0; order: 2; border-left: 1px solid var(--color-border-secondary);`
      : `flex: 1; min-width: 0;`}
`;

const ConversationArea = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;

// 会话详情区限制最大宽并居中：宽屏（/agent 落地页）下不至于铺满整行；窄容器（应用内抽屉）不受影响。
// 消息内容用 760，输入区 792（= 760 + 左右各 16 padding），两者居中后左右内容边缘对齐。
const CenteredMessages = styled(ConversationContent)`
  max-width: 760px;
  margin: 0 auto;
  /* 落地页（无全局 header）消息区顶部留白：40px 标题栏高度 + 16px 间距，避免首条消息贴着标题栏 */
  ${p => p.$topInset && 'padding-top: 56px;'}
`;

const ComposerArea = styled.div`
  width: 100%;
  max-width: 792px;
  margin: 0 auto;
  padding: 8px 16px 16px;
`;

// 可勾选的消息行：默认不给 checkbox 预留槽位；仅在点击某条回复的「分享」进入多选态后，
// 左侧才渲染 checkbox 槽位并占位（槽位只在多选态存在，见下方按 selecting 条件渲染）。
const SelectableRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;

  .selectSlot {
    flex: 0 0 16px;
    height: 16px;
    margin-top: 10px;
  }

  .messageBody {
    flex: 1;
    min-width: 0;
  }
`;

// 多选态底部操作条：占据输入区的位置（多选时不发消息），与设计稿一致
const SelectionBar = styled.div`
  width: 100%;
  max-width: 792px;
  margin: 0 auto;
  padding: 12px 16px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-top: 1px solid var(--color-border-secondary);

  .selectedCount {
    color: var(--color-text-tertiary);
    font-size: 13px;
  }

  /* 分享是本条的主操作，跟 mingo 品牌色走（与发送按钮、分享页「继续对话」一致） */
  .shareBtn {
    background-color: var(--color-mingo);
    border-color: var(--color-mingo);

    &:hover {
      background-color: var(--color-mingo-light) !important;
      border-color: var(--color-mingo-light) !important;
    }
  }
`;

// 待答提问卡：绝对贴底悬浮（相对 Wrap），不占文档流、不挤压对话区；
// 超过面板高度时卡片内部滚动，正常题量不出现滚动条。层透传指针、卡片本身可点。
const DockedAskLayer = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  width: 100%;
  max-width: 792px;
  max-height: calc(100% - 12px);
  margin: 0 auto;
  padding: 8px 16px 16px;
  pointer-events: none;
  > * {
    pointer-events: auto;
  }
`;

const DebugLine = styled.div`
  margin: 2px 0 8px;
  font-family: 'SFMono-Regular', 'SF Mono', Menlo, Consolas, monospace;
  font-size: 11px;
  color: var(--color-text-tertiary);
`;

// 消息级 loading 三点（附件解析等有独立状态行的阶段不重复出三点，见 extractInProgress）
const LoadingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: var(--color-text-secondary);
  text-align: center;
  gap: 6px;
  .title {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-primary);
  }
`;

const uid = prefix => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

// 被「停止」掉的提问卡：ask 围栏留在历史消息正文里，只靠内存态收卡的话，刷新 / 重进会话又会把卡弹回来
// （用户反馈「刷新也是停在这里必须下一步」）。按会话记下那条 assistant 的 messageId，加载后据此不再展示。
const STOPPED_ASK_KEY_PREFIX = 'md_agent_stopped_ask_';

function readStoppedAsk(sessionId) {
  if (!sessionId) return '';
  try {
    return localStorage.getItem(`${STOPPED_ASK_KEY_PREFIX}${sessionId}`) || '';
  } catch {
    return '';
  }
}

function saveStoppedAsk(sessionId, messageId) {
  if (!sessionId || !messageId) return;
  safeLocalStorageSetItem(`${STOPPED_ASK_KEY_PREFIX}${sessionId}`, messageId);
}

// 附件解析事件 → 状态行归属（doc / image 各一行，见 ExtractStatus）
const EXTRACT_EVENT_TARGET = {
  'doc-extract-start': 'doc',
  'doc-extract-completed': 'doc',
  'image-extract-start': 'image',
  'image-extract-completed': 'image',
};

// 解析事件里的文件名：Data.files[].name（doc 的 start / completed 都带，image 仅 start 带）
function readExtractNames(data) {
  const files = readField(data, 'files');

  if (!Array.isArray(files)) return [];
  return files.map(file => stringValue(readField(file, 'name'))).filter(Boolean);
}

// *-extract-completed 的 files[].status：成功值按白名单认（后端只见过 success），
// 未知取值一律不判失败，避免把正常结果误报成「解析失败」。
const EXTRACT_OK_STATUS = ['success', 'succeed', 'succeeded', 'ok', 'completed'];

function readExtractFailedCount(data) {
  const files = readField(data, 'files');

  if (!Array.isArray(files)) return 0;
  return files.filter(file => {
    const status = stringValue(readField(file, 'status')).toLowerCase();

    return !!status && !EXTRACT_OK_STATUS.includes(status);
  }).length;
}

function userMessageFrom(text, attachments) {
  const parts = [];

  if (attachments.length) parts.push({ kind: 'attachment', items: attachments, ts: Date.now() });
  // 用户消息不走 markdown：把 ```mingo_embed_data_*``` 抽成独立 embed part，其余按纯文本渲染
  if (text) {
    extractEmbedSegments(text).forEach(seg => {
      if (seg.type === 'embed') {
        // 静默段（系统触发语 / 全部跳过的 ask_reply）不进 parts：parts 为空时整条消息不渲染（见 submitPrompt）
        if (isSilentEmbedSegment(seg.suffix, seg.data)) return;
        parts.push({ kind: 'embed', suffix: seg.suffix, data: seg.data, ts: Date.now() });
      } else if (seg.text.trim()) {
        parts.push({ kind: 'text', text: seg.text, ts: Date.now() });
      }
    });
  }

  // time：用户消息发送时间，与助手消息一致地在 meta 行展示
  return { id: uid('user'), role: 'user', name: _l('你'), parts, time: Date.now() };
}

function assistantMessage() {
  // time：本轮助手消息生成时间，与信用点同一行展示（见 MessageMeta）
  return { id: uid('assistant'), role: 'assistant', name: ASSISTANT_NAME, parts: [], time: Date.now() };
}

// 流式中，artifact-file-written 回写时拉取签名 URL 并 fetch 内容，覆盖 file 状态
function fetchAndWriteArtifact(bus, data) {
  const artifactId = data.artifactId || data.ArtifactId;
  const versionId = data.versionId || data.VersionId || data.draftVersionId || data.DraftVersionId;

  if (!artifactId || !versionId || !data.path) return Promise.resolve();
  return fetchArtifactFile({ artifactId, versionId, path: data.path })
    .then(meta => {
      if (!meta || !meta.url) throw new Error('missing url');
      return fetch(meta.url).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      });
    })
    .then(content => bus.emit('file:write', { path: data.path, content }))
    .catch(err => console.error('[agent] fetch artifact failed', data.path, err));
}

// 历史：并行拉取已提交版本的文件，但严格按 FILE_ENTRIES 顺序回写 file:write。
// useFileStore 的侧栏/面板按文件「首次出现」排序（pathOrder），若按并行完成顺序回写会打乱次序，
// 与实时 fence 顺序（plan → roles → worksheets → custom-pages → custom-actions → workflows）对不上。
//
// 先列出该版本「实际存在」的文件（含签名 url），与前端登记表 FILE_ENTRIES 取交集后再拉——避免对不存在的
// 已登记文件（如本应用没有 AI 助手时的 ai-assistants.json）硬拉、并误生成空 tab；列表已带 url，直接拉内容。
// 列举接口异常时回退到逐文件按 path 取 url 再拉的全量模式，不漏文件。
async function loadCommittedArtifactFiles(bus, artifactId, versionId) {
  let urlByPath = null;

  try {
    const map = await fetchArtifactFileList({ artifactId, versionId });

    if (map instanceof Map) urlByPath = map;
  } catch (err) {
    console.error('[agent] list artifact files failed', err);
  }

  const entries = urlByPath ? FILE_ENTRIES.filter(entry => urlByPath.has(entry.file)) : FILE_ENTRIES;

  const loaded = await Promise.all(
    entries.map(async entry => {
      try {
        const content = await fetchArtifactFileContent({
          artifactId,
          versionId,
          path: entry.file,
          urlByPath,
        });

        return content ? { path: entry.file, content } : null;
      } catch (err) {
        console.error('[agent] fetch artifact failed', entry.file, err);
        return null;
      }
    }),
  );

  // Promise.all 结果与入参同序，按此顺序回写即与实时一致
  loaded.forEach(item => item && bus.emit('file:write', { path: item.path, content: item.content }));
}

function getArtifactVersionKey(artifactId, versionId) {
  return artifactId && versionId ? `${artifactId}:${versionId}` : '';
}

function normalizeArtifactRef(artifact) {
  if (!artifact) return null;
  const artifactId = stringValue(readField(artifact, 'artifactId')) || stringValue(readField(artifact, 'id'));
  const versionId =
    stringValue(readField(artifact, 'versionId')) ||
    stringValue(readField(artifact, 'artifactVersionId')) ||
    stringValue(readField(artifact, 'draftVersionId'));

  if (!artifactId || !versionId) return null;

  return {
    artifactId,
    versionId,
    name: stringValue(readField(artifact, 'name')) || stringValue(readField(artifact, 'appName')) || '',
    versionLabel: stringValue(readField(artifact, 'versionLabel')) || '',
    planMarkdown: typeof readField(artifact, 'planMarkdown') === 'string' ? readField(artifact, 'planMarkdown') : '',
  };
}

// 匿名链路的后端错误体是 JSON 字符串（{ errorCode, errorMessage }）：直接展示 error.message
// 会把整坨 JSON 甩给用户，这里解析成后端给的可读文案（anon_session_invalid / rate_limit_exceeded 等同样适用）。
function getAnonStreamError(error) {
  const body = safeParse((error && error.message) || '', 'object');
  const errorCode = stringValue(readField(body, 'errorCode')) || '';
  const message = stringValue(readField(body, 'errorMessage'));

  if (!message) return null;

  return { errorCode, message };
}

function getStreamFailureError(error, anonymous) {
  if (anonymous) {
    const anonError = getAnonStreamError(error);

    if (anonError) return anonError;
  }

  return { errorCode: '', message: (error && error.message) || _l('Agent 请求失败') };
}

export default function ChatPanel({ runtime = {}, isSingleMingoPlan = false }) {
  // runtime（匿名/续建模式）：
  //  - anonymous：跳过登录态 context/上传/历史，附件走匿名 upload-token（官网免登录漏斗）
  //  - agentName：钉住目标 agent（匿名版 app-plan-builder-public）并关掉自动路由
  //  - initialSessionId：用后端签发的匿名 sessionId 作会话 id（不自生成）
  //  - onRequestBuild：匿名态点「生成应用」时改触发登录跳转，而非直接搭建
  //  - enableMention：创建应用等纯搭建场景可关闭 @ 应用入口与手输 @ 浮层
  //  - autoOpenInitialOverview：移动端 create-app 路由带会话进入时，只自动打开一次总览
  //  - autoOpenInitialBuilder：官网 PC 承接页初始即展示三栏；恢复会话 / 首轮产出 plan 后自动打开 plan
  //  - projectId：外部承接页已明确选择组织时，后续搭建请求固定使用该组织
  //  - requireMobileOverviewBuildConfirm：H5 官网承接页恢复 plan 后，必须由移动端总览弹层再次点击确认才真正搭建
  //  - disableAppBuilder / disableArtifact*：移动端官网匿名页不挂 AppBuilder，不触发登录态预览/应用信息接口
  //  - autoLoadInitialSession：是否在 mount 后按 initialSessionId 自动恢复历史；匿名 plan 空会话只保留 sessionId
  //  - initialPlanArtifact：官网 plan 页在历史门控时从 /messages 直接取得的 artifact，作为历史无 plan-card 时的恢复兜底
  //  - loadCommittedArtifactFiles：覆盖历史产物文件加载逻辑；仅特殊 runtime 使用，默认不影响登录态
  //  - deferCommittedAppMetaUntilFilesLoaded：特殊承接页需要先按 artifact 文件更新 plan，再触发 app:meta/build-estimate
  //  - initialHistoryMessages：官网 plan 页历史门控已拉过的原始消息，恢复时复用，避免刷新重复请求 /messages
  //  - onRetryIntercept：官网未登录 plan 入口失败时，重试按钮交给入口页跳回官网首页
  //  - onSessionActive：会话已有消息并成为当前有效会话时通知外层，同步当前 sessionId
  const {
    anonymous = false,
    agentName: pinnedAgent,
    initialSessionId,
    onRequestBuild,
    onRetryIntercept,
    enableMention = true,
    projectId: runtimeProjectId,
    requireMobileOverviewBuildConfirm = false,
    autoFocus = false,
    forceEnableVoice = false,
    autoOpenInitialOverview = false,
    autoOpenInitialBuilder = false,
    disableAppBuilder = false,
    disableArtifactFileFetch = false,
    disableArtifactMetaFetch = false,
    disableCommittedFileLoad = false,
    autoLoadInitialSession = true,
    initialPlanArtifact,
    loadCommittedArtifactFiles: customLoadCommittedArtifactFiles,
    deferCommittedAppMetaUntilFilesLoaded = false,
    initialHistoryMessages,
    contentTopInset = false,
    disableSessionRestore = false,
    // 帮助中心（智能客服）：输入框上方显示「帮助文档 + 转人工客服」栏，历史弹窗只看钉住 agent 的会话
    helpMode = false,
    // 帮助态是否提供「帮助文档 + 转人工客服」：站内抽屉需要；对外嵌入的匿名帮助页不提供
    enableHumanSupport = true,
    // 是否提供附件入口（输入框内的上传按钮）：嵌入页等场景可整体关掉
    enableAttachment = true,
    // 是否提供选择性分享（消息勾选 → 分享条 → 分享弹层）：嵌入页等场景可整体关掉
    enableShare = true,
    // 帮助态是否记住会话：站内抽屉是单会话模型，按人记录会话 id 决定下次直进对话详情；
    // 每次进入都要新对话的场景（嵌入页）传 false，既不读也不写该记录，避免污染站内抽屉的分流
    rememberHelpSession = true,
    // 匿名会话失效（403 anon_session_invalid）时由入口页重新签发：返回新 sessionId 后本轮拦截卡「重试」即用新会话重发
    onAnonSessionInvalid,
    // 落地页：搭建/预览可见时与对话并排成三栏（AppBuilder 中栏 + 对话右栏）
    landingLayout = false,
    promptInputClassName,
    promptAttachmentButtonClassName,
    promptAttachmentButtonIcon,
    promptMentionButtonIcon,
    promptMentionButtonText,
    promptPlaceholder,
    promptInputComponent: PromptInputComponent = PromptInput,
    enableAttachmentAppPicker = false,
    onSessionActive,
  } = runtime || {};
  const mentionEnabled = enableMention && !anonymous;
  // 智能客服（helpMode）不支持会话分享：消息上的分享按钮、多选分享条一并关掉；
  // 「转人工」取会话链接给人工客服是另一条链路（fetchHelpSessionShareUrl），不受影响
  const shareEnabled = enableShare && !helpMode;
  const isMobile = browserIsMobile();
  const bus = useAgentBus();
  const { open: openAgentFeedback, holder: agentFeedbackHolder } = useAgentFeedback();
  const showAgentFeedback = !!window.platformENV?.isPlatform;
  const initialAppBuilderVisible = landingLayout && autoOpenInitialBuilder && !disableAppBuilder && !isMobile;
  const [sessionId, setSessionId] = useState(() => initialSessionId || createAgentSessionId());
  const [messages, setMessages] = useState([]);
  const hasMessages = messages.length > 0;
  // 会话后端标题（agent/sessions 的 firstMessage，含重命名）：分享弹窗标题优先用它，取不到再回退首条用户消息
  const [backendSessionTitle, setBackendSessionTitle] = useState('');
  const [draft, setDraft] = useState('');
  const [draftAttachments, setDraftAttachments] = useState([]);
  // 卡片「修改」聚合的待提交修改：1 条→填入输入框纯文本；≥2 条→输入框上方聚合成「修改搭建计划」chip
  const [pendingEdits, setPendingEdits] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [appBuilderVisible, setAppBuilderVisible] = useState(initialAppBuilderVisible);
  // 落地页左侧会话列表是否收起（由 AgentLand 广播）：决定中栏 AppBuilder 左上角是否显示「展开会话列表」icon
  const [sidebarCollapsed, setSidebarCollapsed] = useState(initialAppBuilderVisible);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  // 会话已删除终态：目标会话已不存在（如在其它端被删，404）时对话区显示「会话已删除」空态，而非仅 alert
  const [sessionDeleted, setSessionDeleted] = useState(false);
  // 帮助模式「转人工」分享弹层：非空 = 已取到会话分享链接并展示弹层（对齐老帮助中心：取到链接才开层）
  const [transferUrl, setTransferUrl] = useState('');
  // 打开历史会话后一次性贴底信号：历史非流式（autoScroll=submitting=false），需主动滚到最新一条
  const [historyScrollSignal, setHistoryScrollSignal] = useState(0);
  // appName 同时进 state 与 ref：ref 给 composeAppContext 同步取值，state 让 BuildProgress 渲染时拿到当前值
  const [currentAppName, setCurrentAppName] = useState('');
  // 当前在 AppBuilder 中激活/展示的版本（versionLabel）：用于让对应 plan-card 高亮为选中态，其余仅 committed 不高亮
  const [activeVersionLabel, setActiveVersionLabel] = useState('');
  // 执行中断 / 拦截提示：贴在输入框上方的浮动卡（信用点不足、服务异常等）。{ errorCode, message }，null 时不展示。
  const [interceptError, setInterceptError] = useState(null);
  // 被「停止」收掉的提问卡标识：messageId 优先（可跨刷新），实时流出还没回填 messageId 时退回本地消息 id
  const [stoppedAskKey, setStoppedAskKey] = useState('');
  // 选择性分享：勾选的后端 messageId 列表。非空即进入多选态（输入区换成底部操作条）。
  // 只有历史加载来的消息带 messageId，实时流出的那几条要等重进会话后才可勾选。
  const [selectedMessageIds, setSelectedMessageIds] = useState([]);
  const [shareSelectionVisible, setShareSelectionVisible] = useState(false);

  // 进入生成态：一并退出消息多选（分享）态——新一轮回复会不断插入消息，
  // 且底部要让位给输入区/停止生成，此时保留勾选与分享操作条已无意义
  const enterSubmitting = () => {
    setSubmitting(true);
    setSelectedMessageIds([]);
  };

  const filesRef = useRef({});
  // 「生成应用」发起中闸：预检为异步（await 工作表上限接口），在这段窗口内 submitting 尚未置位、
  // 按钮也还没变「已搭建」，靠它挡住重复点击，避免并发预检 / 发起两次搭建。发起完成（提交或被拒）即放开。
  const buildKickoffRef = useRef(false);
  const messagesRef = useRef([]);
  // 镜像后端标题，供异步回调 / SESSION_ACTIVE 广播闭包里同步读取最新值
  const backendSessionTitleRef = useRef('');
  const appBuilderVisibleRef = useRef(initialAppBuilderVisible);
  // 已拉取过 app.json 的版本（artifactId:versionId），避免历史 plan 卡片补图标时重复请求
  const planMetaFetchedRef = useRef(new Set());
  // 已把 committed artifact 文件灌回过当前 AgentBus 的版本，避免历史恢复和自动打开 builder 重复拉取。
  const committedFilesFetchedRef = useRef(new Set());
  const committedFilesLoadingRef = useRef(new Map());
  const appMetaRef = useRef({ name: '', appId: '', sectionIdByName: {} });
  const abortRef = useRef(null);
  const autoOpenInitialOverviewRef = useRef(autoOpenInitialOverview);
  const autoOpenInitialBuilderRef = useRef(autoOpenInitialBuilder);
  const initialOverviewOpenedRef = useRef(false);
  const latestRuntimeRef = useRef({});
  // 镜像最新 sessionId：卸载清理在闭包里拿不到最新 state，用 ref 取当前会话调取消接口
  const sessionIdRef = useRef('');
  const promptInputRef = useRef(null);
  // 从首页分组内「AI 创建应用」交接来的分组 id：拼进 stream context.groupId，让新建应用归入该分组
  const groupIdRef = useRef('');
  // 已开过流的 path 集合：用于决定首次 delta 时是否触发 file:begin + file:focus
  const startedPathsRef = useRef(new Set());
  // 当前查看/选中的版本 + 已知最新版本 label：继续对话时若查看的不是最新版本，
  // 就带 artifactId + basedOnVersionId 让后端基于该旧版本 fork（LOCKED）；在最新版本上则走 AUTO。
  const selectedVerRef = useRef(null); // { artifactId, versionId, versionLabel }
  const latestVerLabelRef = useRef('');
  // build 成功收尾标记：completed 事件（带 worksheetContext 的 build 轮）置 true，
  // 由发起方在本轮 stream await 结束后消费——追加调用 app-build-summary 流式生成搭建总结。
  // 不在事件回调里直接发起：避免与外层 finally 的 submitting/abortRef 复位竞态。
  const pendingBuildSummaryRef = useRef(false);
  // 本会话有未完成（中断/暂停）的搭建：为 true 时下一条消息不重传 plan context，
  // 让后端按 __original_inputs__ 续建（路径 B 静默续 / 模糊表达走路径 E 意图弹层），避免误判 plan 漂移（图2）。
  const buildResumableRef = useRef(false);
  // 最近一条用户原始 message：路径 E 回写 none_of_these 时须原样带上供后端重路由。
  const lastUserMessageRef = useRef('');
  // 本轮（一次 stream）的 traceId：流式事件里第一次出现即记下，stream 收尾后据此轮询本轮用量（信用点）。
  // 单值即可（同一时刻只有一条在途流）；每轮 streamAgentResponse 开始时清空，避免沿用上一轮。
  const roundTraceIdRef = useRef('');
  // 本轮应答 agent：用于收尾时判断是否需要查用量（help-agent 不计费，跳过轮询与展示）
  const roundAgentRef = useRef('');
  // 本轮 assistant 消息的后端 messageId：V6.4 起 completed 事件顶层直接回传（SSE 帧 PascalCase：MessageId），
  // 收尾时据此判断是否还需要补捞消息列表兜底。每轮流开始时清空，避免沿用上一轮。
  const roundMessageIdRef = useRef('');
  // 当前助手消息上是否还挂着解析行：给高频 delta 事件做守卫，
  // 没有解析行时不做无谓的消息重建（text-delta 每帧都来）
  const extractShownRef = useRef(false);
  // 本轮 build 开场是否已处理（显面板 + 置 building + 补 appId）：路由信息每条事件都带，
  // 靠它保证一轮只做一次；每轮 stream 开始时复位。
  const buildRoundOpenedRef = useRef(false);
  // 在途的用量轮询定时器集合：切会话 / 新建会话 / 卸载时统一清掉，避免轮询写进已不存在的消息。
  const usagePollTimersRef = useRef(new Set());

  // 当前选中组织：落地页空态可切换（仅影响新会话）；优先级 runtime 固定值 > 用户所选 > 全局默认。
  // 全局默认组织若已禁用 MingoAI，则落到一个仍可用的组织，与 Mingo 首页选中的组织保持一致
  const [selectedProjectId, setSelectedProjectId] = useState(() => getDefaultMingoProjectId(getCurrentProjectId()));

  function loadCommittedArtifactFilesOnce({ artifactId, versionId, loading = false, force = false } = {}) {
    const key = getArtifactVersionKey(artifactId, versionId);

    if (!key || disableCommittedFileLoad) return Promise.resolve(false);
    if (!force && committedFilesFetchedRef.current.has(key)) {
      return committedFilesLoadingRef.current.get(key) || Promise.resolve(false);
    }

    committedFilesFetchedRef.current.add(key);
    if (loading) bus.emit('builder:loading', true);

    const promise = (
      customLoadCommittedArtifactFiles
        ? customLoadCommittedArtifactFiles({ artifactId, versionId, bus, force })
        : loadCommittedArtifactFiles(bus, artifactId, versionId)
    )
      .then(() => true)
      .finally(() => {
        if (loading) bus.emit('builder:loading', false);
      });

    committedFilesLoadingRef.current.set(key, promise);

    return promise;
  }

  function getContextProjectId() {
    return runtimeProjectId || selectedProjectId || getCurrentProjectId();
  }

  // 本方案计划搭建的工作表数量：worksheets.json 流式产物，按 type=worksheet 统计（与 composeAppContext 同源）。
  function getPlannedWorksheetCount() {
    const file = filesRef.current && filesRef.current['/jsons/worksheets.json'];
    const parsed = file && file.parsed;

    return Array.isArray(parsed) ? parsed.filter(i => i && i.type === 'worksheet').length : 0;
  }

  // 点「生成应用」前的预检：组织无创建应用权限、或「已用 + 本次计划」工作表数会超组织上限时拦截，
  // 不发起搭建，避免跑到一半被后端 UsageOverflow 拦下浪费信用点。两道检查均通过才返回 true。
  async function runBuildPrecheck() {
    const projectId = getContextProjectId();

    // 预检①：组织创建应用权限。global 已下发当前账号的最终功能权限。
    if (!hasFeaturePermission(projectId, FEATURE_PERMISSION.CREATE_APP)) {
      alert(_l('您当前所在的组织没有创建应用的权限，请联系组织管理员。'), 3);
      return false;
    }

    // 预检②：组织工作表总数上限。limitWorksheetCount 为 int.MaxValue(2147483647) 视为不限制；
    // 否则按「当前已用 + 本次方案计划新建数 > 上限」判定会超限——这样「现在没满但建完会超」也能提前拦住。
    try {
      const info = await projectAjax.getProjectLimitationInfo({ projectId }, { silent: true });
      const UNLIMITED = 2147483647;
      const isUnlimited = !info || info.limitWorksheetCount >= UNLIMITED;
      const willOverflow =
        !isUnlimited && (info.effectiveWorksheetCount || 0) + getPlannedWorksheetCount() > info.limitWorksheetCount;

      if (willOverflow) {
        alert(_l('工作表数量已达到最大值'), 3);
        return false;
      }
    } catch {
      // 预检接口异常不阻塞搭建：交给后端实际创建时兜底拦截，避免误伤正常搭建
    }

    return true;
  }

  function autoOpenInitialBuilderIfNeeded({ artifactId, versionId, versionLabel, name } = {}) {
    if (!disableAppBuilder && !isMobile && autoOpenInitialBuilderRef.current && artifactId && versionId) {
      autoOpenInitialBuilderRef.current = false;
      bus.emit('builder:open', {
        artifactId,
        versionId,
        versionLabel,
        name,
      });
    }
  }

  function revealAppBuilder() {
    if (!appBuilderVisibleRef.current && landingLayout) setHistoryScrollSignal(s => s + 1);
    appBuilderVisibleRef.current = true;
    setAppBuilderVisible(true);
  }

  function hideAppBuilder() {
    appBuilderVisibleRef.current = false;
    setAppBuilderVisible(false);
  }

  // 跟随外部组织切换（首页 SwitchProject / SideNav 等同样 emit CHANGE_CURRENT_PROJECT），
  // 保证首页与右侧 Mingo 两边选中组织同步。runtime 固定组织（承接页）时不跟随。
  useEffect(() => {
    if (runtimeProjectId) return undefined;
    const onChangeProject = project => {
      const pid = project && project.projectId;
      // 外部切到已禁用 MingoAI 的组织时不跟随，仍停留在可用组织上
      if (pid) setSelectedProjectId(getDefaultMingoProjectId(pid));
    };

    emitter.addListener('CHANGE_CURRENT_PROJECT', onChangeProject);
    return () => emitter.removeListener('CHANGE_CURRENT_PROJECT', onChangeProject);
  }, [runtimeProjectId]);

  useAgentEvent('builder:close', hideAppBuilder);
  // 点对话里的方案便签（SchemePill）重看搭建预览：此前面板可能被整个关掉（appBuilderVisible=false，
  // AppBuilder 渲染 null），仅靠 AppBuilder 内部开浮层看不到。这里先把面板显出来，再由 AppBuilder
  // 自身的 builder:open-preview 监听打开预览浮层（两个监听挂同一事件，互不影响）。
  useAgentEvent('builder:open-preview', () => {
    if (!disableAppBuilder) revealAppBuilder();
  });
  useAgentEvent('builder:open', (payload = {}) => {
    const { artifactId, versionId, name, versionLabel, source, appId, built } = payload || {};
    let loadFilesPromise = Promise.resolve();
    // 历史已搭建版本：透传 appId + built，让 AppBuilder 还原完成态（Sidebar「打开应用」/ Header「已使用 v* 搭建」）；
    // built 为显式布尔，切回未搭建版本时（built=false）由 AppBuilder 清掉残留的 appId / 完成态
    const appMetaPayload = { name, versionLabel, artifactId, versionId, appId, built };
    const shouldDeferAppMeta =
      deferCommittedAppMetaUntilFilesLoaded && artifactId && versionId && !!customLoadCommittedArtifactFiles;

    // 历史卡片点击：带 artifact 引用时，把已提交版本的 5 个文件灌进 AppBuilder 再打开；
    // 实时流式没有引用（文件已在 store 里），直接打开即可。
    if (artifactId && versionId) {
      // 记下当前查看的版本，作为下一轮"继续对话"的基线（点回旧版本即基于旧版本调整）
      selectedVerRef.current = { artifactId, versionId, versionLabel: versionLabel || '' };
      if (!shouldDeferAppMeta) bus.emit('app:meta', appMetaPayload);
      loadFilesPromise = loadCommittedArtifactFilesOnce({
        artifactId,
        versionId,
        loading: true,
        force: !!customLoadCommittedArtifactFiles && source === 'plan-card',
      });
      if (shouldDeferAppMeta) loadFilesPromise.finally(() => bus.emit('app:meta', appMetaPayload));
    }

    if (isMobile) {
      loadFilesPromise.finally(() => bus.emit('mobile:open-overview', payload));
      return;
    }

    if (!disableAppBuilder) revealAppBuilder();
  });
  useAgentEvent('builder:request-prompt', ({ text } = {}) => text && setDraft(text));
  useAgentEvent('builder:submit-prompt', ({ text } = {}) => {
    if (text) submitPrompt(text);
  });
  // mingo_ask 提问卡作答提交：打包成 ask_reply embed 作为一条用户消息发回。
  // 续上「提问的那个 agent」（最后一条 assistant 消息的 agentName）、不重路由，仅本次生效；
  // 未捕获到 agentName（老后端/缺 route 事件）则回退到正常路由，无回归。
  useAgentEvent('ask:submit', ({ answers } = {}) => {
    if (!Array.isArray(answers) || !answers.length) return;
    const askMsg = messages[messages.length - 1];
    const continueAgent = askMsg && askMsg.role === 'assistant' ? askMsg.agentName : undefined;

    submitPrompt(buildEmbedFence(ASK_REPLY_SUFFIX, { answers }), undefined, undefined, { agentName: continueAgent });
  });
  // 提问卡「停止」：不作答也不跳过（跳过=继续下一步），直接结束本轮设计与搭建——
  // 终止服务端 run、收掉底部提问卡把位置还给输入框，并按会话记下这条 ask，避免刷新后又弹回来。
  useAgentEvent('ask:stop', () => {
    const askMsg = messages[messages.length - 1];

    handleStop();
    if (!askMsg) return;
    setStoppedAskKey(askMsg.messageId || askMsg.id);
    saveStoppedAsk(sessionId, askMsg.messageId);
  });
  // 卡片「修改」入口：累加到 pendingEdits（不直接发送）。
  // 同一卡片二次修改时替换原条目（而非追加），保证一卡一条、icon 回显最新输入。
  useAgentEvent('builder:add-edit', ({ module, card, text } = {}) => {
    if (!text) return;
    setPendingEdits(prev => {
      const idx = prev.findIndex(e => e.module === module && e.card === card);
      if (idx === -1) return [...prev, { id: uid('edit'), module, card, text }];
      const next = [...prev];
      next[idx] = { ...next[idx], text };
      return next;
    });
  });
  useAgentEvent('builder:files-sync', ({ files } = {}) => {
    if (!files) return;

    filesRef.current = files;
  });
  useAgentEvent('app:meta', ({ name, versionLabel } = {}) => {
    if (name) {
      appMetaRef.current.name = name;
      setCurrentAppName(name);
    }

    // 激活版本切换（实时提交 / 点击历史卡片打开版本）时更新，驱动 plan-card 选中态
    if (versionLabel) setActiveVersionLabel(versionLabel);
  });
  useAgentEvent('plan-card:meta', ({ artifactId, versionId, appIcon, appColor, appName } = {}) => {
    if (!artifactId || !versionId) return;

    setMessages(cur =>
      cur.map(m => ({
        ...m,
        parts: (m.parts || []).map(p =>
          p.kind === 'plan-card' && p.artifactId === artifactId && p.versionId === versionId
            ? {
                ...p,
                appMetaResolved: true,
                appIcon: appIcon || p.appIcon || '',
                appColor: appColor || p.appColor || '',
                name: appName || p.name || '',
              }
            : p,
        ),
      })),
    );
  });
  useAgentEvent('builder:generate', ({ files, source } = {}) => {
    if (files) filesRef.current = files;
    // 匿名态不能真正搭建：点「生成应用」交给外部环境处理（官网单页会按 isSingleMingoPlan 分流链接）
    if (anonymous) {
      onRequestBuild && onRequestBuild({ isSingleMingoPlan });
      return;
    }

    if (requireMobileOverviewBuildConfirm && source !== 'mobile-overview') return;

    // 防重复点击：预检/发起在途时忽略后续点击
    if (buildKickoffRef.current) return;
    buildKickoffRef.current = true;

    // 预检通过（有创建应用权限 + 工作表不超上限）才真正发起搭建；被拦截时通知 AppBuilder
    // 撤销发起态，让「生成应用」按钮恢复可点以便修复后重试。
    runBuildPrecheck()
      .then(ok => {
        if (ok) {
          // 预检通过、即将发送「开始搭建应用」：此刻视为真实触发搭建，通知 AppBuilder 切「已使用 v* 搭建」
          bus.emit('builder:generate-accepted');
          submitPrompt(_l('开始搭建应用'));
        } else {
          bus.emit('builder:generate-rejected');
        }
      })
      .finally(() => {
        // 发起完成放开闸：提交成功后由 submitting/chatSubmitting 接力禁用按钮，被拒则恢复可点
        buildKickoffRef.current = false;
      });
  });

  // 把 submitting 广播给 AppBuilder：plan 还在 streaming / build 进行中时「生成应用」按钮禁用
  useEffect(() => {
    bus.emit('chat:submitting', submitting);
  }, [submitting, bus]);

  // 把待提交的卡片修改广播给 AppBuilder：卡片「修改」icon 据此常驻高亮 + 回显上次输入
  useEffect(() => {
    bus.emit('chat:pending-edits', pendingEdits);
  }, [pendingEdits, bus]);

  // 落地页三栏：广播 AppBuilder 显隐（AgentLand 据此切布局 + 默认收起会话列表），并订阅会话列表显隐
  useEffect(() => {
    if (!landingLayout) return;
    emitter.emit(AGENT_HEADER_EVENT.BUILDER_VISIBLE, { visible: appBuilderVisible });
  }, [appBuilderVisible, landingLayout]);

  useEffect(() => {
    if (!landingLayout) return;
    const onSidebarState = ({ visible } = {}) => setSidebarCollapsed(!visible);
    emitter.on(AGENT_HEADER_EVENT.SIDEBAR_STATE, onSidebarState);
    return () => emitter.off(AGENT_HEADER_EVENT.SIDEBAR_STATE, onSidebarState);
  }, [landingLayout]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // 同步最新 sessionId 到 ref，供卸载清理使用
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    if (hasMessages && sessionId && typeof onSessionActive === 'function') onSessionActive(sessionId);
  }, [hasMessages, onSessionActive, sessionId]);

  // 关闭会话（抽屉关闭 / 切页导致本面板卸载）时，若仍有在途流：abort 本地 SSE 不会停服务端，
  // 需显式调取消接口终止该会话正在执行的 run，避免后端继续跑造成信用点浪费。
  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
        cancelAgentRun(sessionIdRef.current);
        abortRef.current = null;
      }

      // 卸载时清掉在途用量轮询定时器，避免轮询回调在已卸载组件上 setState
      clearUsagePolls();
    };
  }, []);

  // 历史还原 / 修改已有应用的已提交 plan 卡片缺少真实图标主色（还原时未带 appIcon/appColor）：
  // 不阻塞首屏，异步从该版本的 /jsons/app.json 拉取并回填（与 AppBuilder 读的是同一份）。
  // 拉到前卡片图标区留空（见 PlanCard 的 showPlaceholder），拉到后才落真实图标；
  // 无论成功/失败都标 appMetaResolved，让卡片不再重复拉取。
  useEffect(() => {
    if (disableArtifactMetaFetch) return;

    const targets = [];

    messages.forEach(m =>
      (m.parts || []).forEach(p => {
        if (
          p.kind === 'plan-card' &&
          p.status === 'committed' &&
          p.artifactId &&
          p.versionId &&
          !p.appIcon &&
          !p.appColor &&
          !p.appMetaResolved
        ) {
          targets.push({ artifactId: p.artifactId, versionId: p.versionId });
        }
      }),
    );

    targets.forEach(({ artifactId, versionId }) => {
      const key = `${artifactId}:${versionId}`;

      if (planMetaFetchedRef.current.has(key)) return;
      planMetaFetchedRef.current.add(key);

      const resolve = meta =>
        setMessages(cur =>
          cur.map(m => ({
            ...m,
            parts: (m.parts || []).map(p =>
              p.kind === 'plan-card' && p.artifactId === artifactId && p.versionId === versionId
                ? {
                    ...p,
                    appMetaResolved: true,
                    appIcon: p.appIcon || (meta && meta.appIcon) || '',
                    appColor: p.appColor || (meta && meta.appColor) || '',
                  }
                : p,
            ),
          })),
        );

      fetchArtifactAppMeta({ artifactId, versionId })
        .then(resolve)
        .catch(err => {
          console.error('[agent] fetch plan-card app meta failed', key, err);
          resolve(null);
        });
    });
  }, [disableArtifactMetaFetch, messages]);

  // 待提交修改不再回填/清空输入框：一律由上方「修改搭建计划」chip 聚合（≥1 条即显示，见 attachments 槽），
  // 输入框文字保留作为补充说明，发送时与多条修改一并打包，避免漏带（旧版 1 条回填依赖 PromptInput 回写非空
  // value，但其只处理清空，导致填充不可见且发送禁用）。

  function applyAgentEvent(assistantId, event) {
    const data = (event.payload && event.payload.data) || {};

    logSseEvent(event);

    // 记录本轮应答 agent，供 mingo_ask 作答时续上同一 agent、不重路由。
    // route-selected 把 agentName 放在 payload.data 里，顶层 event.agentName 可能为空，故两处都取。
    const respAgent = event.agentName || stringValue(readField(data, 'agentName'));

    if (respAgent) {
      roundAgentRef.current = respAgent;
      setMessages(cur =>
        cur.map(m => (m.id === assistantId && m.agentName !== respAgent ? { ...m, agentName: respAgent } : m)),
      );
    }

    // build 轮开场即显面板：续建（resume）两条既有触发路径都不成立——没有 plan 文件流（不经
    // artifact-file-writing），应用也早在首轮建好、checkpoint 续跑不重放 create-app 事件，
    // 即便重放 appId 也与上轮相同（isNewApp 恒 false）。故改用「本轮路由到 build-app-agent」作判据，
    // 它在 route-selected 即落值、早于任何 step，首建与续建同样覆盖得到。
    if (respAgent === 'build-app-agent' && !buildRoundOpenedRef.current) {
      buildRoundOpenedRef.current = true;
      if (!disableAppBuilder) revealAppBuilder();
      // 续建轮广播已知 appId，驱动 AppBuilder 打开 iframe 预览跟随进度：同页中断时它一直在 appMetaRef 里，
      // 刷新后则由 loadSession 从 build 快照补回。首建此刻还没 appId（本轮才会建），不广播空值，
      // 仍由下面 extractAppCreatedIds 那条路在 create-app 事件到达时广播，时序不变。
      if (appMetaRef.current.appId) {
        bus.emit('app:meta', { appId: appMetaRef.current.appId, sessionId });
      }

      // AppBuilder 里 buildPhase 只在 hasAppId 时才生效（mainStatus），首建这会儿还没 appId，置了也不影响
      bus.emit('build:phase', 'building');
    }

    // 记下本轮 traceId：stream 收尾后据此轮询本轮用量（信用点）。流式事件每条都带，取第一次出现即可。
    const traceId = stringValue(event.payload && event.payload.traceId);

    if (traceId && roundTraceIdRef.current !== traceId) {
      roundTraceIdRef.current = traceId;
      setMessages(cur => cur.map(m => (m.id === assistantId && m.traceId !== traceId ? { ...m, traceId } : m)));
    }

    // 附件解析：带 doc/image 附件的请求在 route-selected 之后、text-delta 之前先发
    // *-extract-start（进入解析窗口），成功发 *-extract-completed 再进入 text-delta；失败只有 terminal error。
    // doc 与 image 各占一条 extract part（一条消息可能既带文档又带图），分开记，避免一方完成把另一方误清。
    // start 报文件名（后端 files[].name 带回）、completed 落完成态并留在消息里，用户能看到解析结果而非只闪过「正在解析中」。
    const extractTarget = EXTRACT_EVENT_TARGET[event.eventName];

    if (extractTarget) {
      const running = /-start$/.test(event.eventName);
      const names = readExtractNames(data);
      const patch = running
        ? { status: 'running', names, count: Number(readField(data, 'count')) || names.length || 1 }
        : { status: 'done', failed: readExtractFailedCount(data), finishedAt: Date.now() };

      // completed 的 files 只有文档带得全（图片仅回 count），名单为空时沿用 start 记下的
      if (!running && names.length) patch.names = names;
      if (!running) {
        const doneCount = Number(readField(data, 'count'));

        if (doneCount) patch.count = doneCount;
      }

      extractShownRef.current = true;
      setMessages(cur => cur.map(m => (m.id === assistantId ? upsertExtractPart(m, extractTarget, patch) : m)));
    } else if (
      extractShownRef.current &&
      (event.eventName === 'text-delta' ||
        event.eventName === 'reasoning-delta' ||
        event.eventName === 'error' ||
        event.eventName === 'completed')
    ) {
      // 正文/思考开始，或任何 terminal 事件（含失败 error，无 *-completed）：解析只是过程提示，整行撤走不留痕，
      // 也顺带兜住没等到 *-extract-completed 的行（不能一直转圈）。
      // ref 守卫：text-delta 是高频事件，没有解析行时不能每帧都重建 messages 数组触发整列重渲染。
      extractShownRef.current = false;
      setMessages(cur => cur.map(m => (m.id === assistantId ? removeExtractParts(m) : m)));
    }

    if (!disableAppBuilder && event.eventName === 'artifact-file-writing' && !data.skipped && data.path) {
      revealAppBuilder();
    }

    if (!disableAppBuilder && event.eventName === 'artifact-file-content-delta' && data.path) {
      revealAppBuilder();
    }

    if (event.eventName === 'artifact-file-content-delta' && data.path) {
      if (!startedPathsRef.current.has(data.path)) {
        startedPathsRef.current.add(data.path);
        bus.emit('file:begin', { path: data.path });
        bus.emit('file:focus', { path: data.path });
      }
    }

    if (!disableArtifactFileFetch && event.eventName === 'artifact-file-written' && data.path) {
      fetchAndWriteArtifact(bus, data);
    }

    // artifact-file-* 事件既要驱动 AppBuilder 文件流（bus），也要驱动 plan-card 状态（appendEventToParts）
    forwardFileEvent(event, bus);

    // plan 流：服务端在 artifact-draft-started 就把 fence 上的 name 透出，提前一整轮写入即可拿到 appName
    if (event.eventName === 'artifact-draft-started') {
      const earlyName = stringValue(readField(event.payload.data, 'name'));

      if (earlyName && earlyName !== appMetaRef.current.name) {
        appMetaRef.current.name = earlyName;
        setCurrentAppName(earlyName);
        bus.emit('app:meta', { name: earlyName, sessionId });
      }
    }

    if (isSingleMingoPlan && event.eventName === 'artifact-version-committed') {
      const name = stringValue(readField(data, 'name'));
      const versionLabel = stringValue(readField(data, 'versionLabel'));
      const committedArtifactId = stringValue(readField(data, 'artifactId')) || stringValue(readField(data, 'id'));
      const committedVersionId =
        stringValue(readField(data, 'versionId')) ||
        stringValue(readField(data, 'artifactVersionId')) ||
        stringValue(readField(data, 'draftVersionId'));

      if (name) {
        appMetaRef.current.name = name;
        setCurrentAppName(name);
      }

      if (committedArtifactId && committedVersionId) {
        selectedVerRef.current = {
          artifactId: committedArtifactId,
          versionId: committedVersionId,
          versionLabel,
        };
        if (versionLabel) latestVerLabelRef.current = versionLabel;
      }

      if (name || versionLabel || committedArtifactId || committedVersionId) {
        bus.emit('app:meta', {
          name,
          versionLabel,
          artifactId: committedArtifactId,
          versionId: committedVersionId,
          sessionId,
        });
      }

      autoOpenInitialBuilderIfNeeded({
        artifactId: committedArtifactId,
        versionId: committedVersionId,
        versionLabel,
        name,
      });
    }

    // build 流：拿到 appId 即开始 iframe 预览；sectionIdByName 后到（workflow-step-completed）也要透传
    const created = extractAppCreatedIds(event);

    if (created && created.appId) {
      // 用「appId 是否变化」判断新一轮搭建，而非仅判 appMetaRef 为空：重新/继续搭建会创建新 appId，
      // 若沿用 firstTime（appMetaRef 已有上轮 appId 时恒为 false），就不会再发 build:phase=building、
      // 也不会重新打开 AppBuilder，导致预览组件不弹出。
      const isNewApp = created.appId !== appMetaRef.current.appId;
      const hasSections = created.sectionIdByName && Object.keys(created.sectionIdByName).length > 0;

      appMetaRef.current.appId = created.appId;
      if (hasSections) appMetaRef.current.sectionIdByName = created.sectionIdByName;

      if (isNewApp || hasSections) {
        bus.emit('app:meta', {
          appId: appMetaRef.current.appId,
          sectionIdByName: appMetaRef.current.sectionIdByName,
          sessionId,
        });
      }

      if (isNewApp) {
        // 重新/继续搭建无 plan 文件流（不经 artifact-file-writing 自动打开），需主动让 AppBuilder 可见
        if (!disableAppBuilder) revealAppBuilder();
        bus.emit('build:phase', 'building');
      }
    }

    // 把 build 阶段进度透传给 AppBuilder（驱动 iframe 自动跟随）
    if (
      event.eventName === 'workflow-step-start' ||
      event.eventName === 'workflow-step-completed' ||
      event.eventName === 'workflow-loop-start' ||
      event.eventName === 'workflow-loop-completed'
    ) {
      const stepId = stringValue(readField(event.payload.data, 'stepId'));

      if (stepId) {
        const status =
          event.eventName === 'workflow-step-completed' || event.eventName === 'workflow-loop-completed'
            ? 'completed'
            : 'running';

        console.log('[preview-trace] 1.emit sse:step-progress', { stepId, status });
        bus.emit('sse:step-progress', { stepId, status });
      }
    }

    // 建表 / 建视图迭代完成：后端已在 loop 事件顶层透出 worksheetId / worksheetName
    // （见 build-app-agent.yaml emitFields），前端直接取顶层字段刷新对应的表，无需再挖 result / 缓存 item。
    if (event.eventName === 'workflow-loop-iteration-completed') {
      const d = event.payload.data;
      const stepId = stringValue(readField(d, 'stepId'));
      const worksheetId = stringValue(readField(d, 'worksheetId'));
      const name = stringValue(readField(d, 'worksheetName'));

      // 单个 worksheet 建好：拿真实 worksheetId 跳到该表
      if (stepId === 'step-build-worksheets' && worksheetId) {
        bus.emit('sse:worksheet-built', { worksheetId, name });
      }

      // 该 worksheet 视图/动作配完：worksheetId 直接来自事件，跳回对应工作表重新拉取，呈现新视图。
      // V5.x：视图步并入并行容器后 stepId 为复合形式，旧顶层 id 保留兼容历史会话回放。
      if ((stepId === 'step-build-views' || stepId === 'step-build-views-and-rules:step-build-views') && worksheetId) {
        bus.emit('sse:worksheet-views-built', { worksheetId, name });
      }

      // 单个自定义页面真实配置完成（仪表盘/工作台填入组件）：该并行 loop 分支只发 iteration 事件、
      // 不发 loop-completed，故无法走 sse:step-progress 的容器级刷新；这里逐页透出，让预览即时刷新，
      // 不必憋到整个 step-config-and-design 容器（含最慢的工作流设计分支）跑完。
      if (stepId === 'step-config-and-design:custom-pages') {
        const index = readField(d, 'index');

        console.log('[preview-trace] 9.custom-page-built emit', { stepId, index });
        bus.emit('sse:custom-page-built', { index: typeof index === 'number' ? index : 0 });
      }
    }

    // 自定义页面空壳批量建好（step-create-pages-and-chatbots 的 create-dashboards 分支）：
    // 结果里带 customPageContext = [{ name, pageId }]，是后续配置写入的真实页面 id。
    // 预览默认跳应用根会被 HAP 重定向到默认空首页（非这些 dashboard），故在此把页面 id 列表透出，
    // 让 AppBuilder 能把预览精确导航到被配置的页面，而不是停在空白首页。
    if (event.eventName === 'workflow-parallel-branch-completed') {
      const d = event.payload.data;

      if (stringValue(readField(d, 'branchId')) === 'create-dashboards') {
        let result = readField(d, 'result');

        if (typeof result === 'string') {
          try {
            result = JSON.parse(result);
          } catch {
            result = null;
          }
        }

        const pages = result ? readField(result, 'customPageContext') : null;

        console.log('[preview-trace] 0.custom-pages-created', { count: Array.isArray(pages) ? pages.length : 0 });
        if (Array.isArray(pages) && pages.length) bus.emit('sse:custom-pages-created', { pages });
      }
    }

    if (event.eventName === 'error') {
      bus.emit('build:phase', 'failed');
      // 以贴底浮动拦截卡呈现（errorCode 决定形态：insufficient_credit→充值 / 其它→重试）。
      setInterceptError({
        errorCode: event.payload.errorCode || '',
        message: event.payload.errorMessage || _l('Agent 执行失败'),
      });
      // 搭建异常：停掉进度卡里所有 loading（运行中的步骤不再无限转圈）
      setMessages(current => current.map(m => (m.id === assistantId ? markBuildProgressAborted(m) : m)));
    }

    setMessages(current => current.map(m => (m.id === assistantId ? appendEventToParts(m, event) : m)));

    if (event.eventName === 'completed') {
      // plan 漂移确认：这是 halt 信号而非真正收尾，drift 卡片已由 workflow-plan-drift-detected 渲染，
      // 不做 build 收尾（不盖 finishedAt、不切 build:phase=completed），等用户在卡片上二选一。
      if (stringValue(readField(event.payload.data, 'status')) === 'awaiting_plan_drift_confirmation') {
        return;
      }

      // 意图弹层确认（路径 E）：有进度会话的模糊表达经分类器判 rebuild/低置信/unrelated → 弹层让用户定夺。
      // 无专属事件，直接由 completed payload（带 stepId + 动态 options）驱动卡片；同样 halt 不收尾。
      if (stringValue(readField(event.payload.data, 'status')) === 'awaiting_rebuild_confirmation') {
        const data = event.payload.data;
        setMessages(current => current.map(m => (m.id === assistantId ? upsertRebuildConfirm(m, data) : m)));
        return;
      }

      // 续建态标记：build 软中断（status=interrupted / resumable=true）置位，成功收尾清除。
      // 下一条消息据此决定是否重传 plan context（见 streamAgentResponse），避免续建误判 plan 漂移。
      const completedStatus = stringValue(readField(event.payload.data, 'status'));
      buildResumableRef.current =
        completedStatus === 'interrupted' || readField(event.payload.data, 'resumable') === true;

      // V6.4：completed 顶层直接回传本轮 assistant 消息的后端 messageId（SSE 帧是 PascalCase 的 MessageId，
      // 已在 normalizeStreamEvent 归一化为 messageId），
      // 直接写为该气泡的锚点，分享 / 重新生成在收到 completed 后立即可用，不再为拿它整拉一次消息列表。
      // 拿不到的场景（取消 / 出错 / 缓存命中 / 无文本产出）恰好都是消息本就不落库的场景，无需特殊处理
      const completedMessageId = stringValue(event.payload && event.payload.messageId);

      if (completedMessageId) {
        roundMessageIdRef.current = completedMessageId;
        setMessages(current => current.map(m => (m.id === assistantId ? { ...m, messageId: completedMessageId } : m)));
      }

      const text = getCompletedText(event.payload.data);

      if (text) {
        setMessages(current => current.map(m => (m.id === assistantId ? ensureCompletedText(m, text) : m)));
      }

      // build 流收尾：给进度卡盖上 finishedAt，BuildProgress 据此折叠并展示总耗时
      setMessages(current => current.map(m => (m.id === assistantId ? markBuildProgressFinished(m) : m)));

      // plan agent 走 artifact.name；build agent 在 completed 顶层直接铺 appName
      const artifact = readField(event.payload.data, 'artifact');
      const name =
        stringValue(readField(artifact, 'name')) ||
        stringValue(readField(event.payload.data, 'name')) ||
        stringValue(readField(event.payload.data, 'appName'));
      const versionLabel =
        stringValue(readField(artifact, 'versionLabel')) || stringValue(readField(event.payload.data, 'versionLabel'));
      const committedArtifactId =
        stringValue(readField(artifact, 'artifactId')) ||
        stringValue(readField(artifact, 'id')) ||
        stringValue(readField(event.payload.data, 'artifactId'));
      const committedVersionId =
        stringValue(readField(artifact, 'versionId')) ||
        stringValue(readField(artifact, 'artifactVersionId')) ||
        stringValue(readField(event.payload.data, 'artifactVersionId')) ||
        stringValue(readField(event.payload.data, 'versionId'));

      // 本轮提交出的新版本即"最新"，把选中基线对齐到它（默认基于最新继续）
      if (committedArtifactId && committedVersionId) {
        selectedVerRef.current = { artifactId: committedArtifactId, versionId: committedVersionId, versionLabel };
        if (versionLabel) latestVerLabelRef.current = versionLabel;
      }

      if (name) {
        setMessages(current => current.map(m => (m.id === assistantId ? applyCompletedAppName(m, name) : m)));
      }

      // 带上本轮提交出的 plan artifactId / versionId：AppBuilder 据此拉取 build 费用预估
      if (name || versionLabel || committedArtifactId) {
        bus.emit('app:meta', { name, versionLabel, artifactId: committedArtifactId, versionId: committedVersionId });
      }

      autoOpenInitialBuilderIfNeeded({
        artifactId: committedArtifactId,
        versionId: committedVersionId,
        versionLabel,
        name,
      });

      // build 流到尾把状态切到 completed；plan 流没有 appId，不影响 Sidebar 状态条
      if (appMetaRef.current.appId) bus.emit('build:phase', 'completed');

      // build 轮成功收尾（completed.Data 带 worksheetContext 是 build outputs 投影的专属特征，
      // plan / 总结轮的 completed 都没有）：标记待总结，由发起方 stream 结束后追加调用 app-build-summary。
      if (readField(event.payload.data, 'worksheetContext')) {
        pendingBuildSummaryRef.current = true;
      }

      // 一轮结束：会话此时已在服务端落库，再次广播让 /agent 落地页刷新左侧历史并选中
      // title：优先后端会话标题（firstMessage，含重命名），取不到再回退首条用户消息，供分享弹窗标题默认值
      // persisted：本次广播时会话确已落库，落地页据此只在「首次落库」刷新左栏，后续每轮不再整拉列表
      emitter.emit(AGENT_HEADER_EVENT.SESSION_ACTIVE, {
        sessionId,
        title: backendSessionTitleRef.current || getSessionTitleFromMessages(messagesRef.current),
        persisted: true,
      });
    }
  }

  // 把当前 plan 文件 + 默认 org/app 拼成发给后端的 context。
  // 正常 build、"继续"、plan 漂移 confirmation（尤其 rebuild 要按新方案从头建）都靠它带上当前方案数据。
  function composeCurrentContext() {
    const composed = composeAppContext({
      files: filesRef.current,
      appName: appMetaRef.current.name || '',
    });
    const buildContext = hasMeaningfulContext(composed) ? composed : undefined;

    // 默认应用 id：供 app-query-agent 等在用户未指定时作默认。有则带、无则省略。
    // appId 优先用本会话 build 流新建的应用，其次回退到当前所在应用（URL /app/:appId）。
    // 但停留在应用列表页（/app/my、/app/lib）时显式判为不在应用下，不让续建会话的 appId 泄漏。
    const defaults = {};
    const defaultAppId = isAppListPage() ? '' : appMetaRef.current.appId || getCurrentAppId();

    if (defaultAppId) defaults.defaultAppId = defaultAppId;

    const merged = { ...(buildContext || {}), ...defaults };
    return Object.keys(merged).length ? merged : undefined;
  }

  // 仅默认应用上下文（不含 plan 派生字段）：续建态用，避免重传方案触发 plan 漂移判定。
  function composeDefaultContext() {
    const defaultAppId = isAppListPage() ? '' : appMetaRef.current.appId || getCurrentAppId();
    return defaultAppId ? { defaultAppId } : {};
  }

  // 常用应用列表：非应用内且用户未 @ 任何应用时，带给后端作兜底候选（设计稿 commonApps）。
  // 与 @应用浮层共用 appSource：SearchMyApps（最近+命中排序）+ 收藏置顶，模块级缓存（不再每条消息重复拉）。
  // context 里只需 { name, id }，截断 20 条避免大列表占 token。
  async function fetchCommonApps() {
    const candidates = await fetchAppCandidates(getContextProjectId());

    return candidates.slice(0, 20).map(a => ({ name: a.name, id: a.id }));
  }

  // 在 build context 之外，按设计稿补充对话上下文：
  // mentions（@ 的应用）、currentApp（应用内默认当前应用）、commonApps（非应用内且未 @ 时的常用应用兜底）。
  // currentOrganization 暂不处理。
  async function composeChatContext(mentions, { omitPlanContext = false } = {}) {
    // 续建态省略 plan 派生字段（worksheets/groupNames…），只保留对话上下文（默认应用 / @ / 常用应用），
    // 后端据 __original_inputs__ 续建，不触发 plan 漂移判定。
    const base = omitPlanContext ? composeDefaultContext() : composeCurrentContext() || {};
    const extra = {};

    const normalizedMentions = (Array.isArray(mentions) ? mentions : [])
      .filter(m => m && m.id)
      .map(m => ({ type: m.type || 'app', name: m.name, id: m.id, projectId: m.projectId }));

    if (normalizedMentions.length) extra.mentions = normalizedMentions;

    // appId 优先用本会话 build 流新建的应用，其次回退到当前所在应用（URL /app/:appId）。
    // 应用列表页（/app/my、/app/lib）显式判为不在应用下，不带续建会话的 appId。
    const appId = isAppListPage() ? '' : appMetaRef.current.appId || getCurrentAppId();

    if (appId) {
      // 应用内：默认带当前应用
      extra.currentApp = { name: appMetaRef.current.name || undefined, appId };
    } else {
      // 分组内 AI 创建：应用尚未建出来(无 appId)时带上分组 id，让新应用归入该分组
      if (groupIdRef.current) extra.groupId = groupIdRef.current;

      // 非应用内且未 @ 应用：带常用应用列表兜底
      if (!normalizedMentions.length) {
        const commonApps = await fetchCommonApps();

        if (commonApps.length) extra.commonApps = commonApps;
      }
    }

    const merged = { ...base, ...extra };
    return Object.keys(merged).length ? merged : undefined;
  }

  // build 成功后追加流式总结：钉住 app-build-summary 静默发起（不渲染用户消息），
  // 总结文本以 text-delta 渐显成独立 assistant 消息，自然跟在搭建进度组件后面。
  // 总结失败完全静默（build 已成功，绝不弹错误拦截卡误导用户）；error 事件也被过滤，
  // 避免 applyAgentEvent 的 error 分支把 build:phase 误切成 failed。
  async function streamBuildSummary() {
    const assistant = assistantMessage();

    startedPathsRef.current = new Set();
    setMessages(current => [...current, assistant]);
    const controller = new AbortController();

    abortRef.current = controller;

    try {
      await requestAgentStream(
        // 触发语用静默 embed fence 而非裸文本：后端照常落库，但历史渲染时该 user 消息整条不显示
        // （agentService 的 SILENT_EMBED_SUFFIXES 过滤），消息列表里只看到流式总结本身。
        {
          sessionId,
          agentName: 'app-build-summary',
          message: buildEmbedFence(TRIGGER_BUILD_SUMMARY_SUFFIX, { action: 'build_summary' }),
          projectId: getContextProjectId(),
        },
        {
          onEvent: event => {
            if (event && event.eventName === 'error') return;
            applyAgentEvent(assistant.id, event);
          },
        },
        controller.signal,
      );
    } catch {
      // 静默：总结是锦上添花，请求失败不打扰用户（completed.Data.summary 模板版仍可兜底展示）
    }
  }

  // 清掉所有在途的用量查询延迟定时器（切会话 / 新建会话 / 卸载时调）：避免回调写进已销毁会话的消息。
  function clearUsagePolls() {
    usagePollTimersRef.current.forEach(clearTimeout);
    usagePollTimersRef.current.clear();
  }

  // 拉取本轮用量并写到对应 assistant 气泡：
  //  - settled（已扣完）→ 写入 credits 终值并清掉计算中态；终值为 0（本轮未产生扣费）时置 null 不展示信用点行，
  //    与历史消息里 usage.credits 为 0 的处理口径保持一致；取不到数值时保留气泡上已有的值。
  //  - pending_aggregate（a2a 后台 async 还在扣）→ 置 creditsPending，气泡显示「费用计算中…」+ 刷新按钮，
  //    并把 traceId / projectId 记在消息上供手动刷新重查。
  function applyTraceUsage(messageId, traceId, projectId) {
    return fetchTraceUsage(traceId, projectId).then(({ settled, credits }) => {
      setMessages(current =>
        current.map(m => {
          if (m.id !== messageId) return m;
          if (settled)
            return {
              ...m,
              credits: credits != null ? (credits > 0 ? credits : null) : m.credits,
              creditsPending: false,
            };

          return { ...m, creditsPending: true, creditsTraceId: traceId, creditsProjectId: projectId };
        }),
      );
    });
  }

  // 新消息收尾后延迟 1s 查一次本轮用量（给后端落账留出时间）。pending 时由气泡上的刷新按钮手动重查，不再自动轮询。
  function startUsagePoll(messageId, traceId, projectId) {
    if (!traceId || !projectId) return;
    const timer = setTimeout(() => {
      usagePollTimersRef.current.delete(timer);
      applyTraceUsage(messageId, traceId, projectId);
    }, 1000);

    usagePollTimersRef.current.add(timer);
  }

  // 「费用计算中…」刷新按钮：手动重查该条消息本轮用量（projectId 兜底取当前上下文组织）
  function handleRefreshUsage(message) {
    if (!message || !message.creditsTraceId) return;
    applyTraceUsage(message.id, message.creditsTraceId, message.creditsProjectId || getContextProjectId());
  }

  async function streamAgentResponse(assistantId, promptText, attachments, mentions, options = {}) {
    enterSubmitting();
    const controller = new AbortController();

    abortRef.current = controller;
    // 新一轮开始：清掉上一轮残留的 traceId / agent / messageId，避免本轮无值时误用上轮的
    roundTraceIdRef.current = '';
    roundAgentRef.current = '';
    roundMessageIdRef.current = '';
    buildRoundOpenedRef.current = false;

    // 记录用户原始 message：路径 E 回写 none_of_these 重路由时须原样带上
    if (promptText) lastUserMessageRef.current = promptText;

    // 匿名态不拼登录态 context（无 projectId / commonApps / @ 应用），只发裸 message + 附件
    const projectId = anonymous ? undefined : getContextProjectId();
    // 有未完成搭建时（续建态）不重传 plan context：让后端按 __original_inputs__ 续建，避免误判 plan 漂移弹层
    const context = anonymous
      ? undefined
      : await composeChatContext(mentionEnabled ? mentions : undefined, { omitPlanContext: buildResumableRef.current });

    try {
      // 若用户点回到非最新版本，本轮基于该旧版本 fork（后端 LOCKED）；在最新版本上则不传，走 AUTO（保留新建无关产出能力）
      const sel = selectedVerRef.current;
      const baseOnOldVersion =
        !!sel &&
        !!sel.artifactId &&
        !!sel.versionId &&
        !!sel.versionLabel &&
        sel.versionLabel !== latestVerLabelRef.current;

      await requestAgentStream(
        {
          sessionId,
          message: promptText,
          // 钉住 agent（匿名版 / mingo_ask 作答续上提问 agent）时关自动路由；登录态默认自动路由。
          // options.agentName 为单次覆盖，仅本请求生效，不污染下一次（下一次自由输入照常路由）
          agentName: options.agentName || pinnedAgent || undefined,
          forceReroute: options.agentName ? false : pinnedAgent ? false : true,
          projectId,
          attachments,
          context,
          artifactId: baseOnOldVersion ? sel.artifactId : undefined,
          basedOnVersionId: baseOnOldVersion ? sel.versionId : undefined,
        },
        {
          onEvent: event => {
            applyAgentEvent(assistantId, event);
          },
          enableCaptcha: anonymous && isSingleMingoPlan,
        },
        controller.signal,
      );

      // 本轮 traceId 在追加总结前先存下：streamBuildSummary 是另一条流、会覆盖 roundTraceIdRef，
      // 而要轮询的是本轮（主应答）的用量。匿名态无计费、不轮询。
      const roundTraceId = roundTraceIdRef.current;

      // build 轮成功收尾：追加流式总结（在同一 try 内 await，submitting 持续到总结结束，停止按钮可中断）
      if (pendingBuildSummaryRef.current) {
        pendingBuildSummaryRef.current = false;
        await streamBuildSummary();
      }

      // 流正常收尾（未被 abort）：启动本轮用量查询，把信用点写到该 assistant 气泡上。
      // help-agent 不计费、非平台版无计费，均跳过查询（也不会显示费用）。
      if (!anonymous && !controller.signal.aborted && !shouldHideUsage(roundAgentRef.current)) {
        startUsagePoll(assistantId, roundTraceId, projectId);
      }

      // 本轮 assistant 消息的 id 已由 completed 事件顶层 MessageId 直接回填（V6.4），
      // 收尾不再整拉一次消息列表；用户提问那条的 id 服务端本期不回传，改由「分享」按需补捞。
    } catch (error) {
      // 用户主动点"停止"/关闭会话会 abort fetch（浏览器抛英文 BodyStreamBuffer was aborted），属正常终止非错误：
      // 不弹拦截卡，静默收尾即可；仅真实请求失败才走贴底拦截卡（无 errorCode → 可重试态）。
      const aborted = controller.signal.aborted || (error && error.name === 'AbortError');

      if (!aborted) {
        const failureError = getStreamFailureError(error, anonymous);

        // 匿名会话过期/失效：交给入口页重新签发，拿到新 sessionId 后用户点「重试」即用新会话重发（不自动重发，避免死循环）
        if (failureError.errorCode === 'anon_session_invalid' && onAnonSessionInvalid) {
          const nextSessionId = await onAnonSessionInvalid().catch(() => '');

          if (nextSessionId) setSessionId(nextSessionId);
        }

        if (!isCaptchaCancelled(error)) {
          setInterceptError(failureError);
        }
      }

      // 异常或中止：流非正常收尾，停掉进度卡里所有 loading
      setMessages(current => current.map(m => (m.id === assistantId ? markBuildProgressAborted(m) : m)));
    } finally {
      setSubmitting(false);
      abortRef.current = null;
    }
  }

  // 补捞会话消息的后端 messageId 回填到本地消息。assistant 那条已由 completed 事件直接回传（V6.4），
  // 这里只用于服务端不随流下发 id 的消息（主要是用户提问那条）——按需调用，不再每轮收尾都拉一次。
  // 返回补齐后的消息数组（无补齐 / 失败返回 null）：messagesRef 由 effect 同步，await 后读它会是旧值，
  // 故调用方需要立即用结果时直接取返回值。
  async function syncMessageIds(targetSessionId) {
    if (anonymous || !targetSessionId) return null;

    try {
      const history = await fetchAgentSessionMessages(targetSessionId, { includeUsage: false });

      // 会话可能在补捞期间被切走：仅当仍是同一会话时才回填，避免把上一会话的 id 写进新会话
      if (!Array.isArray(history) || !history.length || sessionIdRef.current !== targetSessionId) return null;

      setMessages(cur => alignMessageIds(cur, history) || cur);
      return alignMessageIds(messagesRef.current || [], history);
    } catch (err) {
      console.error('[agent] sync message ids failed', err);
      return null;
    }
  }

  async function submitPrompt(text, presetAttachments, mentions, options = {}) {
    const promptText = (text || '').trim();
    const attachments =
      presetAttachments || draftAttachments.filter(f => f.status === 'uploaded').map(mapAttachmentForRequest);

    // 必须有正文才能提交：仅有附件（无文本内容）不支持发送，与 PromptInput 发送按钮禁用态一致，
    // 同时拦住首页预设附件等绕过 UI 的提交路径。
    if (!promptText || submitting) return;

    const user = userMessageFrom(promptText, attachments);
    const assistant = assistantMessage();

    startedPathsRef.current = new Set();
    setInterceptError(null); // 新一轮开始：清掉上一轮的拦截卡

    // 全部跳过的 ask_reply 等静默消息 parts 为空：照常发后端但不在列表插入空气泡（对齐设计稿「界面中不显示」）
    setMessages(current => [...current, ...(user.parts.length ? [user] : []), assistant]);
    setDraft('');
    setDraftAttachments([]);
    setPendingEdits([]);
    // 发起首条消息即标记会话激活：/agent 落地页据此回写 URL、刷新左侧历史
    // title：优先后端标题；否则续接会话取已有首条消息、新会话取本次提交（messagesRef 尚未含新消息）
    emitter.emit(AGENT_HEADER_EVENT.SESSION_ACTIVE, {
      sessionId,
      title:
        backendSessionTitleRef.current || getSessionTitleFromMessages(messagesRef.current) || getUserPlainText(user),
    });
    if (options.onSubmitStart) options.onSubmitStart();
    await streamAgentResponse(assistant.id, promptText, attachments, mentions, options);
  }

  function handleDeleteEdit(id) {
    setPendingEdits(prev => prev.filter(item => item.id !== id));
  }

  // 「提交修改」：把多条修改（+ 当前输入框补充文字）打包成 ```mingo_embed_data_modify_plan``` 作为一条用户消息发送。
  // extraText 来自主发送按钮（编辑器实时文本，最可靠）；从 chip 弹窗「提交修改」进入时无参，回退取 draft。
  function handleSubmitEdits(extraText) {
    if (!pendingEdits.length) return;
    const items = pendingEdits.map(({ module, card, text }) => ({ module, card, text }));
    const extra = (typeof extraText === 'string' ? extraText : draft || '').trim();
    if (extra) items.push({ text: extra });
    // 改的是「已有计划」，必须点名 plan agent、不重路由，仅本次生效：否则登录态默认 forceReroute，
    // 会把这条 modify_plan 重新路由走。匿名态沿用已钉的 app-plan-builder-public，登录态用产品版。
    submitPrompt(buildEmbedFence(MODIFY_PLAN_SUFFIX, { items }), undefined, undefined, {
      agentName: pinnedAgent || PROD_AGENT,
    });
  }

  function retryAssistant(assistantId, promptText) {
    if (submitting || !promptText) return;
    startedPathsRef.current = new Set();
    // 清空该回复并一并清掉旧 messageId：重发会在后端生成新消息，旧 id 已失效，
    // 清掉后由本轮 completed 事件回填新 id，避免分享指向被替换的旧内容。
    setMessages(current => current.map(m => (m.id === assistantId ? { ...m, parts: [], messageId: undefined } : m)));
    streamAgentResponse(assistantId, promptText);
  }

  // 错误拦截卡「重试」：拿最新一条用户消息的正文，对最后一条 assistant 消息重新发送。
  // 不清空该 assistant 消息（保留已有进度/内容），直接基于其继续重发。
  function retryLastMessage() {
    if (submitting) return;
    const reversed = [...messages].reverse();
    const lastUser = reversed.find(m => m.role === 'user');
    const lastAssistant = reversed.find(m => m.role === 'assistant');

    if (!lastUser || !lastAssistant) return;
    const promptText = (lastUser.parts || [])
      .filter(p => p.kind === 'text')
      .map(p => p.text)
      .join('\n')
      .trim();

    if (!promptText) return;
    startedPathsRef.current = new Set();
    streamAgentResponse(lastAssistant.id, promptText);
  }

  // 「重新生成」（V6.3 服务端重跑）：只传被点那条 assistant 回复的后端 messageId，提问原文与附件由
  // 服务端从库里自取，前端不重传。服务端先生成新答案、确认落库后才物理删除「该条及其之后」的消息
  // （不管相不相关，均不可恢复）；本地同步移除其后消息、该条清空后原位流入新答案，
  // 旧 messageId 已失效一并清掉，由本轮 completed 事件回传的 MessageId 回填新 id（V6.4）。
  // 对中间某条重生成会连带删掉后续对话，故先弹确认（对齐删除会话的危险操作形态）；最后一条无后续，直接执行。
  function regenerateAssistant(assistantId) {
    if (submitting) return;
    const list = messagesRef.current || [];
    const idx = list.findIndex(m => m.id === assistantId);
    const target = idx >= 0 ? list[idx] : null;

    if (!target || target.role !== 'assistant' || !target.messageId) return;

    const doRegenerate = () => {
      // 确认弹层期间状态可能变化：执行前用实时 ref 再校验一次（在途流 / 消息已不存在则放弃）
      if (abortRef.current) return;
      const cur = messagesRef.current || [];
      const i = cur.findIndex(m => m.id === assistantId);

      if (i < 0 || !cur[i].messageId) return;

      // 点击前的旧消息段（该条及其之后）：失败/取消时服务端不会删旧消息，本地原样放回
      const snapshotTail = cur.slice(i);

      startedPathsRef.current = new Set();
      setInterceptError(null); // 新一轮开始：清掉上一轮的拦截卡
      // 被点那条及其之后的消息都会被服务端替换/删除：本地同步移除其后消息，
      // 该条原位清空接收新答案，同时清掉旧 messageId 与上一轮信用点
      setMessages(current => {
        const j = current.findIndex(m => m.id === assistantId);

        if (j < 0) return current;
        return [
          ...current.slice(0, j),
          { ...current[j], parts: [], messageId: undefined, credits: null, creditsPending: false, time: Date.now() },
        ];
      });
      streamRegenerate(assistantId, cur[i].messageId, snapshotTail);
    };

    if (idx < list.length - 1) {
      Modal.confirm({
        title: <span className="textError">{_l('确定重新生成该回复？')}</span>,
        width: window.innerWidth - 20 > 480 ? 480 : window.innerWidth - 20,
        content: _l('重新生成后，该回复之后的对话将被删除且不可恢复'),
        okButtonProps: { danger: true },
        onOk: doRegenerate,
      });
    } else {
      doRegenerate();
    }
  }

  // 重新生成的流式请求：SSE 事件流与正常对话一致，复用 applyAgentEvent；请求体只带
  // sessionId + regenerateFromMessageId + projectId（与 message/attachments 互斥），
  // 不传 forceReroute——已有会话默认复用最近使用的 agent 应答，不重新路由。
  // snapshotTail 为点击前的旧消息段（被点那条及其之后）：失败/取消时服务端不会删旧消息，
  // 本地整段放回即回到点击前的样子。
  async function streamRegenerate(assistantId, regenerateFromMessageId, snapshotTail) {
    enterSubmitting();
    const controller = new AbortController();

    abortRef.current = controller;
    // 新一轮开始：清掉上一轮残留的 traceId / agent / messageId，避免本轮无值时误用上轮的
    roundTraceIdRef.current = '';
    roundAgentRef.current = '';
    roundMessageIdRef.current = '';

    const projectId = getContextProjectId();
    // 还原：用被清空的那条（id 不变）定位，替换回点击前的整段旧消息（含其后被移除的消息）
    const restoreSnapshot = () =>
      setMessages(current => {
        const i = current.findIndex(m => m.id === assistantId);

        if (i < 0) return current;
        return [...current.slice(0, i), ...snapshotTail];
      });
    // message_not_found 时按文档「提示并刷新列表」：置位后在 finally 复位 abortRef 之后再重拉，
    // 避免 loadSession 把仍在收尾中的本轮流当作在途流去 abort + 调取消接口
    let reloadAfterError = false;

    try {
      await requestAgentStream(
        { sessionId, regenerateFromMessageId, projectId },
        { onEvent: event => applyAgentEvent(assistantId, event) },
        controller.signal,
      );

      // 重新生成是一次真实的模型调用，照常在收尾后查询本轮用量写到气泡上（help-agent 等不计费场景跳过）
      if (!controller.signal.aborted && !shouldHideUsage(roundAgentRef.current)) {
        startUsagePoll(assistantId, roundTraceIdRef.current, projectId);
      }

      // 正常收尾：服务端已把旧消息物理删除、新答案落库。新 messageId 已由 completed 顶层
      // MessageId 直接回填为锚点（V6.4），再次重新生成 / 分享立即可用；重新生成不产生新的
      // user 消息，仅在极端场景（completed 未带 MessageId）才补捞一次消息列表兜底
      if (!controller.signal.aborted && !roundMessageIdRef.current) {
        syncMessageIds(sessionId);
      }
    } catch (error) {
      const aborted = controller.signal.aborted || (error && error.name === 'AbortError');

      if (aborted) {
        // 生成中取消（点停止/关会话）：服务端旧消息一条不删、新答案也不落库，
        // 本地放回点击前的旧答案即与服务端一致，可直接再点一次（极少数已落库的情况重进会话自然对齐）
        restoreSnapshot();
      } else {
        const body = (error && error.data) || {};
        const errorCode = stringValue(readField(body, 'errorCode')) || '';

        if (errorCode === 'session_not_found') {
          // 会话已在其它端被删除（V6.3.1 起 404）：与 loadSession 的 404 处理同一套语义
          if (helpMode) {
            if (rememberHelpSession && !anonymous) saveHelpAgentSessionId('');
            alert(_l('会话已删除'), 2);
            emitter.emit(AGENT_HEADER_EVENT.BACK_TO_WELCOME);
          } else {
            const accountId =
              (window.md && window.md.global && window.md.global.Account && window.md.global.Account.accountId) || '';

            if (accountId) safeLocalStorageSetItem(`md_agent_last_session_${accountId}`, '');
            handleNewConversation();
            setSessionDeleted(true);
          }
        } else if (errorCode === 'message_not_found') {
          // messageId 不存在 / 不属于该会话 / 已被删（服务端刻意不区分原因）：提示后重拉会话消息对齐服务端
          alert(_l('消息不存在'), 2);
          reloadAfterError = true;
        } else if (errorCode === 'regenerate_not_supported') {
          // 正常不可达（按钮已按 agent 名单隐藏），服务端名单可能扩充：提示并还原旧答案兜底
          alert(_l('该类对话暂不支持重新生成'), 3);
          restoreSnapshot();
        } else {
          // 其余（余额不足 / 限流等）沿用既有贴底拦截卡；旧答案未被删除，先还原再提示
          restoreSnapshot();
          setInterceptError({
            errorCode,
            message: stringValue(readField(body, 'errorMessage')) || (error && error.message) || _l('Agent 请求失败'),
          });
        }
      }

      // 异常或中止：流非正常收尾，停掉进度卡里所有 loading
      setMessages(current => current.map(m => (m.id === assistantId ? markBuildProgressAborted(m) : m)));
    } finally {
      setSubmitting(false);
      abortRef.current = null;
    }

    if (reloadAfterError) {
      loadSession(sessionId);
    }
  }

  // 「分享」：进入选择性分享的多选态，默认选中当前这条回复所在的「对话组」——
  // 即这条回复 + 它对应的上一条用户提问（往前最近的 user 消息），二者都带后端 messageId 时一并选中。
  // 用户提问那条的 id 服务端不随流下发（V6.4 只回传 assistant 的），本轮实时消息本地可能尚无：
  // 此时才补捞一次消息列表——把这次请求从「每轮收尾」挪到「真正点分享」，多数会话不再产生该请求。
  async function shareFromMessage(messageId) {
    if (!messageId) return;
    let list = messagesRef.current || [];

    const findPairedUserIndex = source => {
      const from = source.findIndex(m => m.messageId === messageId);

      for (let i = from - 1; i >= 0; i--) {
        if (source[i].role === 'user') return i;
      }

      return -1;
    };

    const pairedIndex = findPairedUserIndex(list);

    if (pairedIndex >= 0 && !list[pairedIndex].messageId) {
      const patched = await syncMessageIds(sessionIdRef.current);

      if (patched) list = patched;
    }

    const ids = [messageId];
    const userIndex = findPairedUserIndex(list);

    if (userIndex >= 0 && list[userIndex].messageId) ids.push(list[userIndex].messageId);
    setSelectedMessageIds(ids);
  }

  // plan 漂移确认：用户在 drift 卡片上二选一后，钉住 build-app-agent 回传 confirmation 续传。
  // 必须带当前 plan context：rebuild 要按新方案从头建（plan 数据全在 context 里），
  // resume_with_old_plan 也无害（已完成步骤走 checkpoint 投回、不消费 context）。
  // 带一句 message 仅为通过后端 legality 校验（决策由 confirmation 驱动，与 message 内容无关）。
  async function sendPlanDriftConfirmation(driftMessageId, action) {
    if (submitting) return;

    // 先把卡片标记为已决策，禁用按钮、展示选择
    setMessages(current => current.map(m => (m.id === driftMessageId ? resolvePlanDrift(m, action) : m)));
    buildResumableRef.current = false;
    buildRoundOpenedRef.current = false;

    const assistant = assistantMessage();

    startedPathsRef.current = new Set();
    setMessages(current => [...current, assistant]);
    enterSubmitting();
    const controller = new AbortController();

    abortRef.current = controller;

    try {
      await requestAgentStream(
        {
          sessionId,
          agentName: 'build-app-agent',
          message: _l('继续'),
          projectId: getContextProjectId(),
          context: composeCurrentContext(),
          confirmation: { stepId: '__plan_drift__', action },
        },
        { onEvent: event => applyAgentEvent(assistant.id, event) },
        controller.signal,
      );

      // drift 续传跑完 build 同样接流式总结（与 streamAgentResponse 的消费点对称）
      if (pendingBuildSummaryRef.current) {
        pendingBuildSummaryRef.current = false;
        await streamBuildSummary();
      }
    } catch (error) {
      // 用户主动点"停止"/关闭会话会 abort fetch（浏览器抛英文 BodyStreamBuffer was aborted），属正常终止非错误：
      // 不弹拦截卡，静默收尾即可；仅真实请求失败才走贴底拦截卡（无 errorCode → 可重试态）。
      const aborted = controller.signal.aborted || (error && error.name === 'AbortError');

      if (!aborted) {
        setInterceptError(getStreamFailureError(error, anonymous));
      }

      // 异常或中止：流非正常收尾，停掉进度卡里所有 loading
      setMessages(current => current.map(m => (m.id === assistant.id ? markBuildProgressAborted(m) : m)));
    } finally {
      setSubmitting(false);
      abortRef.current = null;
    }
  }

  // 意图弹层确认（路径 E）：用户在卡片上点选后，钉住 build-app-agent 回写 confirmation。
  //  - rebuild：带新 context 按新方案从头建（resume 不消费 context，none_of_these 走重路由）
  //  - none_of_these：后端译成 unrelated+high 重路由到其它 agent，必须把用户原始 message 原样带上做路由依据
  // 选择 rebuild/resume 后清除「可续建」标记，使后续不再误判为续建态。
  async function sendRebuildConfirmation(confirmMessageId, action) {
    if (submitting) return;

    setMessages(current => current.map(m => (m.id === confirmMessageId ? resolveRebuildConfirm(m, action) : m)));
    buildResumableRef.current = false;
    buildRoundOpenedRef.current = false;

    const assistant = assistantMessage();

    startedPathsRef.current = new Set();
    setMessages(current => [...current, assistant]);
    enterSubmitting();
    const controller = new AbortController();

    abortRef.current = controller;

    try {
      await requestAgentStream(
        {
          sessionId,
          agentName: 'build-app-agent',
          // 原始 message 原样回传：none_of_these 后端靠它做重路由，漏带则路由无依据
          message: lastUserMessageRef.current || _l('继续'),
          projectId: getContextProjectId(),
          // 仅 rebuild 需要新方案数据；resume 走 checkpoint、none_of_these 走重路由，均不带 context
          context: action === 'rebuild' ? composeCurrentContext() : undefined,
          confirmation: { stepId: '__rebuild__', action },
        },
        { onEvent: event => applyAgentEvent(assistant.id, event) },
        controller.signal,
      );

      if (pendingBuildSummaryRef.current) {
        pendingBuildSummaryRef.current = false;
        await streamBuildSummary();
      }
    } catch (error) {
      const aborted = controller.signal.aborted || (error && error.name === 'AbortError');

      if (!aborted) {
        setInterceptError({ errorCode: '', message: (error && error.message) || _l('Agent 请求失败') });
      }

      setMessages(current => current.map(m => (m.id === assistant.id ? markBuildProgressAborted(m) : m)));
    } finally {
      setSubmitting(false);
      abortRef.current = null;
    }
  }

  function handleStop() {
    if (abortRef.current) abortRef.current.abort();
    // 仅 abort 本地 SSE 不会停掉服务端，需显式调取消接口终止该会话正在执行的 run
    cancelAgentRun(sessionId);
    // 搭建途中暂停：标记续建态，下次「继续」不重传方案、不误弹 plan 漂移。
    // 判据取「本轮是 build 轮」或「已建出应用」：只看 appId 会漏掉建应用之前就中断的窗口，
    // 而无条件置位又会误伤非 build 轮（如问答被中断后，下一条消息会连带丢掉 plan context）。
    // roundAgentRef 在 route-selected 事件即落值，早于任何 step，故能覆盖那段早期窗口。
    if (roundAgentRef.current === 'build-app-agent' || appMetaRef.current.appId) {
      buildResumableRef.current = true;
    }

    setSubmitting(false);
    // 停止时解析行不能停在「正在解析中…」的转圈态
    extractShownRef.current = false;
    setMessages(current => current.map(removeExtractParts));
  }

  // 开始新对话：中断在途流（并终止服务端 run）、重置会话上下文与界面状态
  function handleNewConversation() {
    if (abortRef.current) {
      abortRef.current.abort();
      cancelAgentRun(sessionId);
    }

    // 用户显式开新对话：清掉记住的上次会话，避免重开抽屉时被旧会话覆盖
    if (!anonymous && !initialSessionId) {
      const accountId =
        (window.md && window.md.global && window.md.global.Account && window.md.global.Account.accountId) || '';

      if (accountId) safeLocalStorageSetItem(`md_agent_last_session_${accountId}`, '');
    }

    abortRef.current = null;
    clearUsagePolls(); // 新会话：清掉上一会话在途的用量轮询
    filesRef.current = {};
    appMetaRef.current = { name: '', appId: '', sectionIdByName: {} };
    startedPathsRef.current = new Set();
    committedFilesFetchedRef.current = new Set();
    committedFilesLoadingRef.current = new Map();
    selectedVerRef.current = null;
    latestVerLabelRef.current = '';
    buildResumableRef.current = false;
    lastUserMessageRef.current = '';
    setSubmitting(false);
    setMessages([]);
    setSessionDeleted(false);
    setDraft('');
    setDraftAttachments([]);
    setCurrentAppName('');
    hideAppBuilder();
    setHistoryVisible(false);
    setInterceptError(null); // 新会话清掉上一会话残留的拦截卡
    setStoppedAskKey('');
    setSelectedMessageIds([]); // 勾选属于上一会话，新会话一并清掉
    backendSessionTitleRef.current = ''; // 新会话清掉后端标题
    setBackendSessionTitle('');
    setSessionId(createAgentSessionId());
    setTimeout(() => promptInputRef.current && promptInputRef.current.focus(), 0);
  }

  // 加载历史会话：拉取消息还原对话，并把后续请求切到该 sessionId
  async function loadSession(targetSessionId, options = {}) {
    if (!targetSessionId || historyLoading) return;
    const shouldAutoOpenInitialBuilder = !!options.autoOpenBuilder;
    const initialPlanArtifactRef = normalizeArtifactRef(options.initialPlanArtifact);

    if (abortRef.current) {
      abortRef.current.abort();
      cancelAgentRun(sessionId);
    }

    abortRef.current = null;
    clearUsagePolls(); // 切换会话：清掉上一会话在途的用量轮询，避免写进已切走的消息
    setHistoryLoading(true);
    setSessionDeleted(false); // 重新尝试加载会话即离开「会话已删除」终态
    setInterceptError(null); // 切换会话清掉上一会话残留的拦截卡
    setStoppedAskKey(readStoppedAsk(targetSessionId)); // 该会话此前被停掉的提问卡，刷新/切回来后不再弹
    setSelectedMessageIds([]); // 勾选的 messageId 属于上一会话，切走即失效
    backendSessionTitleRef.current = ''; // 切会话先清后端标题，加载后异步重取
    setBackendSessionTitle('');
    try {
      const isAnonymousMingoPlan = anonymous && isSingleMingoPlan;
      // build 快照与历史消息并行拉：续建态只活在内存 ref 里，刷新/切会话后会退回 false，
      // 导致下一条「继续」重传整份 plan context → 与首建 hash 对不上 → 误弹 plan 漂移；
      // 挂起中的意图弹层同样只是一次性 SSE 事件，刷新即丢，逃生口 none_of_these 随之消失。
      // 匿名态无 build 续建语义，跳过该请求。失败按空快照处理（内部已吞异常）。
      const [history, buildSnapshot] = await Promise.all([
        fetchAgentSessionMessages(targetSessionId, {
          includeUsage: !isAnonymousMingoPlan,
          includeAnonymousPlanArtifact: isAnonymousMingoPlan,
          rawItems: options.initialHistoryMessages,
        }),
        anonymous
          ? Promise.resolve({ resumable: false, pendingConfirmation: null, appId: '' })
          : fetchSessionBuildSnapshot(targetSessionId),
      ]);

      // 回填用户最后一条原始 message：意图弹层选"都不是"(none_of_these)时须原样带回后端供重路由。
      // 不回填的话刷新后该值退化成字面量"继续"，后端重路由失据、大概率又路由回 build-app。
      const lastUserMsg = [...history].reverse().find(m => m.role === 'user' && m.rawText);
      lastUserMessageRef.current = (lastUserMsg && lastUserMsg.rawText) || '';

      // 匿名智能客服页（/public/mingo/help）：本地记着「问过」就会直进对话，但服务端会话可能已被清空。
      // 这种情况接口是成功返回空列表、没有 error 可 catch，不拦就会停在空白对话区。
      // 按加载失败同样的回退语义静默回帮助首页（入口页在 BACK_TO_WELCOME 里清坏会话并重新签发），
      // 但不弹「加载会话失败」——这不是失败。optional 恢复（带首条提问进入、会话尚未创建）仍按原逻辑跳过。
      if (helpMode && anonymous && !options.optional && !(history && history.length)) {
        setHistoryVisible(false);
        emitter.emit(AGENT_HEADER_EVENT.BACK_TO_WELCOME);
        return;
      }

      filesRef.current = {};
      // appId 取自 build 快照：该会话若已建出应用（含搭建中途中断的），续建轮据此打开 iframe 预览。
      // 此处只落 ref 不广播 app:meta——切回历史会话不该径直弹出预览浮层，等用户真的续建时再广播。
      appMetaRef.current = { name: '', appId: buildSnapshot.appId || '', sectionIdByName: {} };
      startedPathsRef.current = new Set();
      committedFilesFetchedRef.current = new Set();
      committedFilesLoadingRef.current = new Map();
      // 还原版本基线：历史里最后一张 plan-card 即最新版本，作为"是否最新"的判定基准
      const planCards = history.flatMap(m => (m.parts || []).filter(p => p.kind === 'plan-card' && p.versionId));
      const latestCard = planCards[planCards.length - 1] || null;

      // 续建态：服务端说有未完成搭建 **且** 最新方案确实是那次搭建用的那份。
      // built 由 markBuiltPlanCards 按「plan-card 紧邻的下一条 assistant 消息是否 build-app-agent」判定。
      // 若最新方案尚未搭建过（用户在上次 build 失败/中断后又改出了新方案），就不能标续建态——否则下一条
      // 「搭建」会 omitPlanContext，后端按 __original_inputs__ 的旧方案建，用户既拿不到新方案，
      // 也失去 plan 漂移弹层这个纠正机会。此时照常传新 plan，让后端算出不同 hash 正常弹层由用户定夺。
      // （不刷新时无此问题：每轮 completed 都会重设该 ref，产出新方案那轮自然把它清成 false。）
      buildResumableRef.current = buildSnapshot.resumable && !(latestCard && !latestCard.built);
      const restoreCard = latestCard || initialPlanArtifactRef;
      const shouldCheckInitialSessionOverview =
        isMobile && autoOpenInitialOverviewRef.current && !initialOverviewOpenedRef.current;
      const initialSessionOverviewCard = shouldCheckInitialSessionOverview
        ? planCards.find(card => card.artifactId && card.versionId)
        : null;

      if (shouldCheckInitialSessionOverview) {
        initialOverviewOpenedRef.current = true;
      }

      selectedVerRef.current = latestCard
        ? {
            artifactId: latestCard.artifactId,
            versionId: latestCard.versionId,
            versionLabel: latestCard.versionLabel || '',
          }
        : restoreCard
          ? {
              artifactId: restoreCard.artifactId,
              versionId: restoreCard.versionId,
              versionLabel: restoreCard.versionLabel || '',
            }
          : null;
      latestVerLabelRef.current = (restoreCard && restoreCard.versionLabel) || '';
      setSubmitting(false);
      setDraft('');
      setDraftAttachments([]);
      setCurrentAppName(appMetaRef.current.name || '');
      setActiveVersionLabel(latestVerLabelRef.current);
      hideAppBuilder();
      setMessages(restorePendingConfirmation(history, buildSnapshot.pendingConfirmation));
      setSessionId(targetSessionId);
      setHistoryVisible(false);
      // 历史消息渲染后滚到底部，定位到最新一条
      setHistoryScrollSignal(s => s + 1);
      // 恢复/续接会话也要广播激活：否则 Mingo 头部 agentSessionId 为空，会话内「新窗口打开」漏带会话 id
      // 先用本地首条消息标题即时广播（会话切换 / URL 需尽快落地）
      emitter.emit(AGENT_HEADER_EVENT.SESSION_ACTIVE, {
        sessionId: targetSessionId,
        title: getSessionTitleFromMessages(history),
        // 从服务端加载而来，必然已落库（也必然已在左栏列表里）
        persisted: true,
      });
      // 再异步取后端会话标题（firstMessage，含重命名）优先覆盖：取到且仍是同一会话才回填并再次广播。
      // 匿名会话不在 agent/sessions 里，跳过。
      if (!anonymous) {
        fetchAgentSessionTitle(targetSessionId).then(backendTitle => {
          if (!backendTitle || sessionIdRef.current !== targetSessionId) return;
          backendSessionTitleRef.current = backendTitle;
          setBackendSessionTitle(backendTitle);
          emitter.emit(AGENT_HEADER_EVENT.SESSION_ACTIVE, {
            sessionId: targetSessionId,
            title: backendTitle,
            persisted: true,
          });
        });
      }

      if (anonymous && isSingleMingoPlan && restoreCard && restoreCard.artifactId && restoreCard.versionId) {
        const shouldOpenInitialBuilder = (isSingleMingoPlan || shouldAutoOpenInitialBuilder) && !isMobile;
        const appMetaPayload = {
          name: restoreCard.name || appMetaRef.current.name || '',
          versionLabel: latestVerLabelRef.current,
          artifactId: restoreCard.artifactId,
          versionId: restoreCard.versionId,
        };

        if (!shouldOpenInitialBuilder) {
          if (!deferCommittedAppMetaUntilFilesLoaded) bus.emit('app:meta', appMetaPayload);
          const loadFilesPromise = loadCommittedArtifactFilesOnce({
            artifactId: restoreCard.artifactId,
            versionId: restoreCard.versionId,
            loading: !isMobile && (isSingleMingoPlan || shouldAutoOpenInitialBuilder),
          });

          if (deferCommittedAppMetaUntilFilesLoaded)
            loadFilesPromise.finally(() => bus.emit('app:meta', appMetaPayload));
        }
      }

      // 历史含 plan-card：官网单页 plan 与官网免登录 PC 承接页自动打开 AppBuilder。
      if ((isSingleMingoPlan || shouldAutoOpenInitialBuilder) && !isMobile && restoreCard) {
        bus.emit('builder:open', {
          artifactId: restoreCard.artifactId,
          versionId: restoreCard.versionId,
          versionLabel: latestVerLabelRef.current,
          name: restoreCard.name || appMetaRef.current.name || '',
          // 自动打开的最新版本若已搭建，同样还原完成态
          appId: restoreCard.builtAppId || '',
          built: !!restoreCard.built,
        });
      }

      if (initialSessionOverviewCard) {
        bus.emit('builder:open', {
          artifactId: initialSessionOverviewCard.artifactId,
          versionId: initialSessionOverviewCard.versionId,
          versionLabel: initialSessionOverviewCard.versionLabel || '',
          name: initialSessionOverviewCard.name || '',
        });
      }
    } catch (err) {
      console.error('[agent] load session failed', err);
      // 可选恢复（帮助单会话带首条消息进入，固定会话可能尚未创建）：静默跳过，按新会话继续发起
      if (options.optional) return;
      // 会话已不存在（如在其它端被删，404）：不再只是 alert——重置为全新会话，对话区显示「会话已删除」终态。
      // 帮助模式（固定会话回帮助首页）与官网匿名承接（重试拦截）各有回退语义，仍走下方原有流程
      const sessionNotFound = !!err && (err.status === 404 || (err.data && err.data.errorCode === 'session_not_found'));

      if (sessionNotFound && !helpMode && !(anonymous && isSingleMingoPlan)) {
        // 显式清掉记住的会话：handleNewConversation 在带 initialSessionId 进入（如 /mingo/chat/:id）时不清
        const deletedAccountId =
          (window.md && window.md.global && window.md.global.Account && window.md.global.Account.accountId) || '';

        if (deletedAccountId) safeLocalStorageSetItem(`md_agent_last_session_${deletedAccountId}`, '');
        handleNewConversation();
        setSessionDeleted(true);
        return;
      }

      // 帮助模式记录的会话已不存在（如在其它端被删）：清本地记录，回首页后不再直进对话。
      // 该记录按 accountId 存，仅站内登录态适用；匿名帮助页有自己的会话标记，由入口页在 BACK_TO_WELCOME 时清理
      if (helpMode && !anonymous && rememberHelpSession) saveHelpAgentSessionId('');
      // 加载失败（会话已删除 / 异常）：清掉记住的会话并回到 MingoWelcome 首页，避免停留在坏会话
      const accountId =
        (window.md && window.md.global && window.md.global.Account && window.md.global.Account.accountId) || '';

      if (accountId) safeLocalStorageSetItem(`md_agent_last_session_${accountId}`, '');
      setHistoryVisible(false);
      emitter.emit(AGENT_HEADER_EVENT.BACK_TO_WELCOME);
      if (anonymous && isSingleMingoPlan && onRetryIntercept) {
        setTimeout(onRetryIntercept, 1200);
      }
    } finally {
      setHistoryLoading(false);
    }
  }

  function handleSelectSession(session) {
    if (session && session.sessionId) loadSession(session.sessionId);
  }

  // 会话被删除：清掉记住的会话（避免重开抽屉再恢复已删会话）；若删的是当前正在查看的会话，回到 MingoWelcome 首页
  function handleSessionDeleted(deletedSessionId) {
    if (!deletedSessionId) return;
    const accountId =
      (window.md && window.md.global && window.md.global.Account && window.md.global.Account.accountId) || '';
    const key = accountId ? `md_agent_last_session_${accountId}` : '';

    if (key && (window.localStorage.getItem(key) || '').trim() === deletedSessionId) {
      safeLocalStorageSetItem(key, '');
    }

    if (deletedSessionId === sessionId) {
      // 帮助模式删除当前会话：清本地记录的帮助会话，回帮助首页且下次进面板不再直进对话
      if (helpMode && rememberHelpSession) saveHelpAgentSessionId('');
      emitter.emit(AGENT_HEADER_EVENT.BACK_TO_WELCOME);
    }
  }

  // 记住当前会话：关闭 Mingo 抽屉会卸载本面板，重开默认新会话。仅在会话已有消息时持久化 sessionId
  // （避免回写从未提交到后端的空会话，重开恢复时触发 404）；匿名 / 产品续建模式不参与。
  // session-bot- 为单轮 bot 工具调用会话，不可续接（已从历史列表排除），同样不记作"上次会话"。
  // 帮助模式（智能客服）会话不记作"上次会话"（避免通用抽屉重开被恢复进未钉 agent 的对话），
  // 改按人记录帮助会话 id：下次进帮助面板直接进对话详情恢复该会话。
  useEffect(() => {
    if (helpMode) {
      if (rememberHelpSession && !anonymous && sessionId && messages.length) saveHelpAgentSessionId(sessionId);
      return;
    }

    if (anonymous || initialSessionId || !sessionId || !messages.length || sessionId.startsWith('session-bot-')) {
      return;
    }

    const accountId =
      (window.md && window.md.global && window.md.global.Account && window.md.global.Account.accountId) || '';

    if (accountId) safeLocalStorageSetItem(`md_agent_last_session_${accountId}`, sessionId);
  }, [sessionId, messages.length, anonymous, initialSessionId, helpMode, rememberHelpSession]);

  useEffect(() => {
    latestRuntimeRef.current = {
      handleNewConversation,
      loadSession,
      submitPrompt,
      anonymous,
      initialSessionId,
      isSingleMingoPlan,
      initialPlanArtifact,
      customLoadCommittedArtifactFiles,
      initialHistoryMessages,
      autoLoadInitialSession,
      disableSessionRestore,
      helpMode,
    };
  });

  // Agent 头部图标在 Mingo 头部（AgentBus 作用域外）渲染，通过全局 emitter 触发本面板的新对话 / 历史
  useEffect(() => {
    const onNew = () => {
      if (latestRuntimeRef.current.handleNewConversation) {
        latestRuntimeRef.current.handleNewConversation();
      }
    };

    const onHistory = () => setHistoryVisible(true);

    // 会话关闭：中断在途流并调取消接口终止服务端 run（abort 本地 SSE 不会停服务端）
    const onClose = () => {
      if (!abortRef.current) return;
      abortRef.current.abort();
      cancelAgentRun(sessionIdRef.current);
      abortRef.current = null;
    };

    emitter.on(AGENT_HEADER_EVENT.NEW_CONVERSATION, onNew);
    emitter.on(AGENT_HEADER_EVENT.OPEN_HISTORY, onHistory);
    emitter.on(AGENT_HEADER_EVENT.SESSION_CLOSE, onClose);
    return () => {
      emitter.off(AGENT_HEADER_EVENT.NEW_CONVERSATION, onNew);
      emitter.off(AGENT_HEADER_EVENT.OPEN_HISTORY, onHistory);
      emitter.off(AGENT_HEADER_EVENT.SESSION_CLOSE, onClose);
    };
  }, []);

  // 落地页自动聚焦输入框：见下方 <PromptInput autoFocus={autoFocus} />，由 MentionInput 在自身挂载时
  // 对其 contentEditable 直接 focus（时机精准、不跨层抓 ref），抽屉 / 官网 embed 不传 autoFocus 故不受影响。

  // 从 Mingo 新首页带过来的首条 prompt / 待恢复会话：mount 后自动发起一轮 / 加载历史会话。
  // 注意：MingoWelcome 提交时若 Mingo 还未 pin，会触发 SET_MINGO_FIXED → 父级重挂 Mingo → Agent 也会被 unmount 一次。
  // 用 setTimeout 0 + cleanup 清 timer：只有真正活下来的那次 mount 的 timer 才会执行 delete + 发起。
  useEffect(() => {
    const initial = window.mingoInitialMessage;
    const attachments = window.mingoInitialAttachments;
    const mentions = window.mingoInitialMentions;
    const groupId = window.mingoInitialGroupId;
    const handoffKey = window.mingoInitialHandoffKey;
    const hasAttachments = Array.isArray(attachments) && attachments.length > 0;
    const explicitInitialSessionId = window.mingoInitialSessionId;
    const latestRuntime = latestRuntimeRef.current || {};
    // 匿名单页 plan / 帮助模式（本地已对话过标记直进对话详情）按 runtime.initialSessionId 自动恢复；
    // 其它登录态仍只认显式交接的会话（window.mingoInitialSessionId）
    const runtimeInitialSessionId =
      ((latestRuntime.anonymous && latestRuntime.isSingleMingoPlan) || latestRuntime.helpMode) &&
      latestRuntime.autoLoadInitialSession !== false &&
      !initial &&
      !hasAttachments &&
      latestRuntime.initialSessionId
        ? latestRuntime.initialSessionId
        : '';
    const targetInitialSessionId = explicitInitialSessionId || runtimeInitialSessionId;

    if (!initial && !hasAttachments && !targetInitialSessionId) {
      // 无显式恢复目标：尝试恢复上次会话（关闭抽屉重开时回到上次对话），匿名模式除外。
      // 全页落地页（disableSessionRestore）自行用 URL 管理会话，/mingo 必须是新会话，不自动恢复上次对话。
      if (latestRuntimeRef.current.anonymous || latestRuntimeRef.current.disableSessionRestore) return undefined;
      const accountId =
        (window.md && window.md.global && window.md.global.Account && window.md.global.Account.accountId) || '';
      const stored = accountId ? (window.localStorage.getItem(`md_agent_last_session_${accountId}`) || '').trim() : '';

      if (!stored) return undefined;
      const restoreTimer = setTimeout(() => {
        if (latestRuntimeRef.current.loadSession) {
          latestRuntimeRef.current.loadSession(stored);
        }
      }, 0);

      return () => clearTimeout(restoreTimer);
    }

    const timer = setTimeout(() => {
      delete window.mingoInitialMessage;
      delete window.mingoInitialAttachments;
      delete window.mingoInitialMentions;
      delete window.mingoInitialGroupId;
      delete window.mingoInitialSessionId;
      delete window.mingoInitialHandoffKey;
      // 分组内 AI 创建：记下分组 id，供 composeChatContext 拼进 context.groupId
      if (groupId) groupIdRef.current = groupId;
      const submitInitial = () => {
        if ((!initial && !hasAttachments) || !latestRuntimeRef.current.submitPrompt) return;
        latestRuntimeRef.current.submitPrompt(initial || '', hasAttachments ? attachments : undefined, mentions, {
          onSubmitStart: () => handoffKey && clearAnonHandoff(handoffKey),
        });
      };

      if (targetInitialSessionId) {
        if (latestRuntimeRef.current.loadSession) {
          // 恢复目标与首条消息可能同时存在（帮助单会话续接）：先加载历史再发送首条消息；
          // optional：固定会话尚不存在时静默跳过恢复，直接按新会话发起
          latestRuntimeRef.current
            .loadSession(targetInitialSessionId, {
              autoOpenBuilder: autoOpenInitialBuilderRef.current,
              initialPlanArtifact: latestRuntimeRef.current.initialPlanArtifact,
              initialHistoryMessages: latestRuntimeRef.current.initialHistoryMessages,
              optional: !!(initial || hasAttachments),
            })
            .then(submitInitial);
          autoOpenInitialBuilderRef.current = false;
        }
      } else {
        submitInitial();
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const lastMessageId = messages.length ? messages[messages.length - 1].id : null;
  // —— 选择性分享的多选态 ——
  // 可勾选的只有带后端 messageId 的消息（历史加载而来）；实时流出的消息没有 id，不参与勾选与全选计数。
  // 勾选与计数都以「对话组」为单位：一组 = 一条用户提问 + 其后到下一条提问之间的所有回复。
  // 不能按 messageId 条数计数——一问一答会被算成 2 组，一问多答（含工具轮次）更会成倍虚高。
  const messageGroups = useMemo(() => {
    const groups = [];

    messages.forEach(message => {
      if (message.role === 'user' || !groups.length) groups.push([]);
      if (message.messageId) groups[groups.length - 1].push(message.messageId);
    });

    // 整组都没有后端 messageId（本轮实时消息）时不可勾选，不计入分母
    return groups.filter(ids => ids.length);
  }, [messages]);
  // messageId → 所属组的全部 id，供勾选、取消与勾选态回显复用同一份分组结果
  const groupIdsByMessageId = useMemo(() => {
    const map = {};

    messageGroups.forEach(ids => ids.forEach(id => (map[id] = ids)));

    return map;
  }, [messageGroups]);
  const isGroupSelected = ids => ids.some(id => selectedMessageIds.includes(id));
  const selectedGroupCount = messageGroups.filter(isGroupSelected).length;
  const selecting = selectedMessageIds.length > 0;
  const allSelected = !!messageGroups.length && selectedGroupCount === messageGroups.length;
  const selectionShareProps = shareSelectionVisible
    ? buildSessionShareProps({
        sessionId,
        title: backendSessionTitle || getSessionTitleFromMessages(messages),
        projectId: getContextProjectId(),
        messageIds: selectedMessageIds,
        groupCount: selectedGroupCount,
      })
    : null;

  const toggleSelectMessage = messageId => {
    const ids = groupIdsByMessageId[messageId] || [messageId];

    if (isGroupSelected(ids)) {
      setSelectedMessageIds(selectedMessageIds.filter(id => !ids.includes(id)));
      return;
    }

    // 上限是后端 messageIds 的条数硬限，按整组累加判断，避免一组被拆到只分享一半
    if (selectedMessageIds.length + ids.length > MAX_SHARE_MESSAGES) {
      alert(_l('最多分享 %0 条消息', MAX_SHARE_MESSAGES), 3);
      return;
    }

    setSelectedMessageIds(selectedMessageIds.concat(ids));
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedMessageIds([]);
      return;
    }

    const ids = [];
    let groupCount = 0;

    messageGroups.forEach(groupIds => {
      if (ids.length + groupIds.length > MAX_SHARE_MESSAGES) return;
      ids.push(...groupIds);
      groupCount += 1;
    });

    if (groupCount < messageGroups.length) {
      alert(_l('最多分享 %0 条消息，已为你选中前 %1 组对话', MAX_SHARE_MESSAGES, groupCount), 3);
    }

    setSelectedMessageIds(ids);
  };

  // 待回答的 mingo_ask 提问卡：最后一条 assistant 消息文本里的 ask 围栏（assistant 围栏走 markdown 文本）。
  // 流式结束（!submitting）后固定到底部输入区（隐藏输入框）；作答后该消息不再是最后一条、自动收起。
  // 提问围栏在气泡正文里一律剥掉不内联渲染（见 PartView），作答后由 ask_reply 回顾进入对话。
  const lastMessage = messages.length ? messages[messages.length - 1] : null;
  const lastIsAssistant = !!lastMessage && lastMessage.role === 'assistant';
  // 合并最后一条 assistant 的文本片段后抽取 ask 围栏：data=完整可交互，opened=围栏已出现（可能仍在流式）
  const lastAskText = lastIsAssistant
    ? (lastMessage.parts || [])
        .filter(p => p.kind === 'text')
        .map(p => p.text || '')
        .join('\n\n')
    : '';
  const askParsed = lastIsAssistant ? extractAsk(lastAskText) : { data: null, opened: false };
  // 流完（!submitting）且 JSON 完整 → 真·交互提问卡；流式中且围栏已出现 → 骨架占位（提问卡即将到来）
  const pendingAskData = !submitting ? askParsed.data : null;
  const askStreaming = submitting && askParsed.opened;
  // 已被「停止」的这张卡不再展示（本轮已结束），底部让回输入框
  const askStopped =
    !!stoppedAskKey && !!lastMessage && (lastMessage.messageId === stoppedAskKey || lastMessage.id === stoppedAskKey);
  const showDockedAsk = !!pendingAskData && !askStopped;
  // 输入框占位：应用内（URL /app/:appId 或本会话已建出应用）提示对当前应用提问/继续搭建；
  // 非应用内提示 @ 应用提问或搭建新应用。currentAppName 变更会触发重渲染，placeholder 随之更新。
  // 应用列表页（/app/my、/app/lib）显式判为不在应用下，避免续建会话的 appId 泄漏到列表页。
  const inAppContext = !isAppListPage() && !!(appMetaRef.current.appId || getCurrentAppId());
  // 落地页三栏并排：搭建/预览可见时 AppBuilder 占中栏、对话收右栏；非落地页维持原 absolute 全屏覆盖
  const builderSplit = landingLayout && appBuilderVisible;
  // 图表卡片的「保存」入口环境：匿名会话（官网免登录漏斗）不给保存；projectId 供保存到自定义页面选应用用
  const chartSaveEnv = useMemo(
    () => ({ canSave: !anonymous, projectId: runtimeProjectId || selectedProjectId || '' }),
    [anonymous, runtimeProjectId, selectedProjectId],
  );

  return (
    <ChartSaveProvider value={chartSaveEnv}>
      <Wrap $dock={builderSplit}>
        {agentFeedbackHolder}
        <ConversationArea>
          <Conversation
            autoScroll={submitting}
            scrollBottomSignal={historyScrollSignal}
            emptyState={
              <EmptyState>
                <div className="title">{_l('开始一段新的 AI 会话')}</div>
                <div>{_l('描述你想做的事，AI 会自动调用合适的 agent 完成任务。')}</div>
              </EmptyState>
            }
          >
            <CenteredMessages $topInset={contentTopInset}>
              {historyLoading && !messages.length ? (
                <ConversationSkeleton />
              ) : sessionDeleted && !messages.length ? (
                // 会话已删除终态：比照空态样式展示；开始新对话 / 成功加载其它会话后自动清除
                <EmptyState>
                  <div>{_l('会话已删除')}</div>
                </EmptyState>
              ) : (
                messages.map(message => {
                  // 按 agentName 逐条判定：搭建应用 / 方案生成 的 assistant 回复暂不支持分享（置灰）。
                  // 用户提问的复制不受影响（永远可复制），故只对 assistant 计算。
                  // 重新生成入口单独按 V6.3 服务端名单控制（见 MessageRow 的 showRegenerate），不走这里。
                  const opsDisabled = message.role === 'assistant' && isBuildOrPlanAgent(message.agentName);

                  return (
                    <SelectableRow key={message.id} className="agentMessageRow">
                      {/* checkbox 槽位只在多选态渲染：默认不占空间，点击某条回复的「分享」进入多选态后才出现 */}
                      {shareEnabled && selecting && (
                        <span className="selectSlot">
                          {!!message.messageId && (
                            <Checkbox
                              // 勾选态按整组回显：同一组的提问与回复一起选中、一起取消
                              checked={isGroupSelected(groupIdsByMessageId[message.messageId] || [message.messageId])}
                              onChange={() => toggleSelectMessage(message.messageId)}
                            />
                          )}
                        </span>
                      )}
                      <div className="messageBody">
                        <MessageRow
                          message={message}
                          isLast={message.id === lastMessageId}
                          submitting={submitting}
                          onRetry={retryAssistant}
                          onRegenerate={regenerateAssistant}
                          onShare={shareFromMessage}
                          onFeedback={() =>
                            openAgentFeedback({
                              traceId: message.traceId || message.messageId,
                              projectId: getContextProjectId(),
                            })
                          }
                          enableFeedback={showAgentFeedback}
                          enableShare={shareEnabled}
                          // 重新生成仅登录态可用（匿名调用 401）：匿名会话也拿不到后端 messageId，直接不提供入口
                          enableRegenerate={!anonymous}
                          selecting={selecting}
                          opsDisabled={opsDisabled}
                          onConfirmPlanDrift={sendPlanDriftConfirmation}
                          onConfirmRebuild={sendRebuildConfirmation}
                          onRefreshUsage={handleRefreshUsage}
                          bus={bus}
                          currentAppName={currentAppName}
                          activeVersionLabel={activeVersionLabel}
                        />
                      </div>
                    </SelectableRow>
                  );
                })
              )}
            </CenteredMessages>
          </Conversation>
        </ConversationArea>

        {/* 多选态：输入区让位给「全选 / 已选择 N / M 组 / 取消 / 分享」操作条 */}
        {selecting && (
          <SelectionBar className="agentSelectionBar">
            <Checkbox
              checked={allSelected}
              indeterminate={!allSelected && !!selectedGroupCount}
              onChange={toggleSelectAll}
            >
              {_l('全选')}
            </Checkbox>
            <span className="selectedCount">{_l('已选择 %0 / %1 组', selectedGroupCount, messageGroups.length)}</span>
            <div className="flex" />
            <Button onClick={() => setSelectedMessageIds([])}>{_l('取消')}</Button>
            <Button type="primary" className="shareBtn" onClick={() => setShareSelectionVisible(true)}>
              {_l('分享')}
            </Button>
          </SelectionBar>
        )}
        {!selecting && !showDockedAsk && !askStreaming && (
          <ComposerArea className="agentComposerArea">
            {interceptError && (
              <ResponseError
                error={interceptError.message}
                errorCode={interceptError.errorCode}
                onClose={() => setInterceptError(null)}
                onRetry={() => {
                  setInterceptError(null);
                  if (onRetryIntercept) {
                    onRetryIntercept();
                  } else {
                    retryLastMessage();
                  }
                }}
                // 信用点不足 → 复用全站「立即充值」弹窗（参见 Form/Search/OCR 等 code===20008 处理）
                onRecharge={() => {
                  setInterceptError(null);
                  const projectId = getContextProjectId();
                  upgradeVersionDialog({
                    projectId,
                    okText: _l('立即充值'),
                    hint: _l('信用点不足，请联系管理员充值'),
                    explainText: <div></div>,
                    onOk: () => {
                      location.href = pathCompletion(`/admin/valueaddservice/${projectId}`);
                    },
                  });
                }}
                // 版本/配额不足 → 复用全站「立即升级」弹窗（默认跳 /admin/upgradeservice）
                onUpgrade={() => {
                  setInterceptError(null);
                  upgradeVersionDialog({
                    projectId: getContextProjectId(),
                    okText: _l('立即升级'),
                    hint: _l('当前版本无法继续搭建应用，请升级版本后继续'),
                  });
                }}
              />
            )}
            {helpMode && enableHumanSupport && (
              <HelpComposerBar
                onTransfer={() => {
                  // 会话尚无消息（无可分享内容）时不出分享弹层，直接打开人工客服窗口
                  if (!messages.length) {
                    openCustomerService();
                    return;
                  }

                  fetchHelpSessionShareUrl(sessionId)
                    .then(url => {
                      if (url) setTransferUrl(url);
                    })
                    .catch(err => {
                      console.error('[agent] fetch help session share link failed', err);
                      alertIfNotUnauthorized(err, _l('获取分享链接失败'), 2);
                    });
                }}
              />
            )}
            <PromptInputComponent
              className={promptInputClassName}
              ref={promptInputRef}
              autoFocus={autoFocus}
              value={draft}
              projectId={mentionEnabled ? getContextProjectId() : undefined}
              enableMention={mentionEnabled}
              forceEnableVoice={forceEnableVoice}
              getVoiceAuthConfig={
                // 匿名语音凭证是 plan 漏斗专属（voice-token 按 app-plan-builder-public 签发）；
                // 其它匿名场景（如帮助页）不走该链路
                anonymous && isSingleMingoPlan
                  ? () =>
                      requestAnonymousVoiceToken(sessionId, {
                        onSessionRefresh: setSessionId,
                      })
                  : undefined
              }
              onChange={setDraft}
              onSubmit={(text, mentions) => {
                const composed = typeof text === 'string' ? text : draft;

                // 有待提交修改时：把多条修改 + 当前输入文字一并打包成 modify_plan 发送，避免只发文字、漏带修改
                if (pendingEdits.length) {
                  handleSubmitEdits(composed);
                  return;
                }

                submitPrompt(composed, undefined, mentions);
              }}
              onStop={handleStop}
              submitting={submitting}
              // 有待提交修改时即使输入框为空也允许发送（直接提交聚合修改，无需先手敲文字）
              canSendWhenEmpty={pendingEdits.length >= 1}
              placeholder={
                // runtime 指定优先；否则已有消息流（含从历史进入还原的对话）统一提示「发消息」
                promptPlaceholder ||
                (messages.length
                  ? _l('发消息')
                  : anonymous && isSingleMingoPlan
                    ? _l('继续补充需求或修改方案')
                    : inAppContext
                      ? _l('对当前应用提问或继续搭建')
                      : _l('@应用提问或开始搭建一个新应用'))
              }
              inputId={PROMPT_INPUT_ID}
              mentionButtonIcon={promptMentionButtonIcon}
              mentionButtonText={promptMentionButtonText}
              // 必须输入文字才能发送：仅有附件（无正文）时保持发送禁用，不再因已上传附件放开 canSendWhenEmpty
              attachments={
                pendingEdits.length >= 1 || draftAttachments.length ? (
                  <React.Fragment>
                    {pendingEdits.length >= 1 && (
                      <ModifyPlanComposer
                        edits={pendingEdits}
                        onDelete={handleDeleteEdit}
                        onSubmit={handleSubmitEdits}
                      />
                    )}
                    {draftAttachments.length ? (
                      <AddedFiles
                        hideShare
                        files={draftAttachments}
                        onRemove={id => setDraftAttachments(prev => prev.filter(f => f.id !== id))}
                      />
                    ) : null}
                  </React.Fragment>
                ) : null
              }
              attachmentSlot={
                // 智能客服（helpMode）不支持附件输入，整体关掉上传入口；
                // 匿名附件走 plan 漏斗的 upload-token + 七牛直传（按 app-plan-builder-public 签发）；
                // 其它匿名场景（如帮助页）无匿名上传契约，不提供附件入口
                !enableAttachment || helpMode || (anonymous && !isSingleMingoPlan) ? null : anonymous ? (
                  <AnonAttachmentSlot
                    className={promptAttachmentButtonClassName}
                    icon={promptAttachmentButtonIcon}
                    sessionId={sessionId}
                    files={draftAttachments}
                    onChange={setDraftAttachments}
                    onAfterAdd={() => setTimeout(() => promptInputRef.current && promptInputRef.current.focus(), 0)}
                  />
                ) : (
                  <AttachmentUploader
                    buttonClassName={promptAttachmentButtonClassName}
                    buttonIcon={promptAttachmentButtonIcon}
                    files={draftAttachments}
                    onChange={setDraftAttachments}
                    inputId={PROMPT_INPUT_ID}
                    onChooseApp={enableAttachmentAppPicker ? app => promptInputRef.current?.insertApp(app) : undefined}
                    onAfterAdd={() => setTimeout(() => promptInputRef.current && promptInputRef.current.focus(), 0)}
                  />
                )
              }
            />
          </ComposerArea>
        )}
        {showDockedAsk && !selecting && (
          <DockedAskLayer>
            {/* key 绑定 会话 + 提问消息：切换会话/换一道 ask 时整卡重挂载，避免复用旧实例残留翻页进度与作答（导致旧 ask 不刷新/越界报错） */}
            <AskEmbed key={`${sessionId}-${lastMessage.id}`} data={pendingAskData} docked />
          </DockedAskLayer>
        )}
        {askStreaming && !showDockedAsk && !selecting && (
          <DockedAskLayer>
            {/* 流式期：ask 围栏已出现但 JSON 未流完，先占位骨架；流完 !submitting 后无缝换成真卡 */}
            <AskSkeleton docked />
          </DockedAskLayer>
        )}

        {shareSelectionVisible &&
          (isMobile ? (
            <SharePopup {...selectionShareProps} onClose={() => setShareSelectionVisible(false)} />
          ) : (
            <Share {...selectionShareProps} onClose={() => setShareSelectionVisible(false)} />
          ))}

        {historyVisible && (
          <SessionHistory
            currentSessionId={sessionId}
            agentName={helpMode ? pinnedAgent : ''}
            enableShare={shareEnabled}
            onSelect={handleSelectSession}
            onDeleted={handleSessionDeleted}
            onClose={() => setHistoryVisible(false)}
          />
        )}

        {!!transferUrl && <TransferHumanDialog url={transferUrl} onClose={() => setTransferUrl('')} />}

        {!disableAppBuilder &&
          document.querySelector('#containerWrapper') &&
          createPortal(
            <AppBuilder
              visible={appBuilderVisible}
              isSingleMingoPlan={isSingleMingoPlan}
              split={builderSplit}
              sidebarCollapsed={sidebarCollapsed}
            />,
            document.querySelector('#containerWrapper'),
          )}
      </Wrap>
    </ChartSaveProvider>
  );
}

// plan 阶段：消息含 plan-card 时启用重排——text → ThinkingSummary(reasoning) → plan-card → error
// tool / route part 直接隐藏（plan agent 的 load_skill 噪声），无 reasoning 时不渲染"已思考"
// 其它阶段（build / 普通对话）维持流式 part 原序渲染
function renderPlanLayout({ message, parts, streamingLast, reasoningInProgress, onRetry, bus, activeVersionLabel }) {
  const textParts = parts.filter(p => p.kind === 'text');
  const reasoningParts = parts.filter(p => p.kind === 'reasoning');
  const planParts = parts.filter(p => p.kind === 'plan-card');
  const errorParts = parts.filter(p => p.kind === 'error');
  const attachmentParts = parts.filter(p => p.kind === 'attachment');

  return (
    <>
      {attachmentParts.map((part, idx) => (
        <PartView key={`a-${idx}`} part={part} role={message.role} message={message} />
      ))}
      {textParts.map((part, idx) => (
        <PartView
          key={`t-${idx}`}
          part={part}
          role={message.role}
          streaming={streamingLast && !planParts.length && idx === textParts.length - 1}
          message={message}
        />
      ))}
      {reasoningParts.length > 0 && (
        // reasoning 仍是当前活跃（最后）part 时才「思考中」；text/方案 开始流式即视为思考结束，
        // 否则会一直到 plan-card committed 才收起，出现「方案已在输出却还显示思考中」
        <ThinkingSummary items={reasoningParts} streaming={reasoningInProgress} />
      )}
      {planParts.map((part, idx) => {
        // 已提交卡片靠 artifactId + versionId 切版本：缺任一 id 时 builder:open 里的 `artifactId && versionId`
        // 守卫不通过，点击只会静默失效（甚至把面板切成空壳），故直接不给 onClick——
        // PlanCard 无 onClick 即无手型、无 button 角色，卡片纯展示。
        // 生成中的卡片（未 committed）本来就没有 versionId，文件在 store 里，仍允许点开面板。
        const canOpen = !!bus && !!bus.emit && (part.status !== 'committed' || (!!part.artifactId && !!part.versionId));

        return (
          <PlanCard
            key={`p-${idx}`}
            status={part.status}
            // 选中态（蓝底）只给：正在渲染中的当前卡片，或与 AppBuilder 当前激活版本匹配的已提交卡片
            selected={
              part.status !== 'committed'
                ? streamingLast
                : !!part.versionLabel && part.versionLabel === activeVersionLabel
            }
            title={part.name ? _l('%0 搭建方案', part.name) : undefined}
            appIcon={part.appIcon}
            appColor={part.appColor}
            versionLabel={part.versionLabel}
            built={part.built}
            onClick={
              canOpen
                ? () =>
                    bus.emit('builder:open', {
                      artifactId: part.artifactId,
                      versionId: part.versionId,
                      name: part.name,
                      versionLabel: part.versionLabel,
                      // 已搭建版本：带上 build 出来的 appId + 显式 built 布尔，让 AppBuilder 还原完成态 /
                      // 切回未搭建版本时清掉上一张已搭建卡片残留的完成态
                      appId: part.builtAppId || '',
                      built: !!part.built,
                      source: 'plan-card',
                    })
                : undefined
            }
          />
        );
      })}
      {errorParts.map((part, idx) => (
        <PartView
          key={`e-${idx}`}
          part={part}
          role={message.role}
          onRetry={() => onRetry(message.id, part.retryPrompt)}
          message={message}
        />
      ))}
    </>
  );
}

// 「搭建应用 / 方案生成」类消息的 agentName：build（搭建应用）+ plan（方案生成，登录态 / 产品版 / 匿名版）。
// 这些消息暂不支持重新生成 / 分享，其对应用户提问的复制同样禁用（图标置灰）。
const BUILD_PLAN_AGENT_NAMES = [
  'build-app-agent',
  'create-app-plan-streaming',
  'app-plan-builder',
  'app-plan-builder-public',
];

function isBuildOrPlanAgent(agentName) {
  return !!agentName && BUILD_PLAN_AGENT_NAMES.includes(agentName);
}

// V6.3 重新生成的服务端不支持名单：重新生成是全新执行，带写工具的 agent 会真实重复写操作
// （重复建表 / 重复写业务数据），服务端一律 403 拒绝。按文档建议直接不显示按钮而非等 403 再提示：
// 搭应用 / 方案家族（BUILD_PLAN_AGENT_NAMES，其中 create-app-plan-streaming 虽不在服务端名单、
// 同属方案生成一并不提供）+ 搭建总结 + 写业务数据 + 所有 *-sub-agent（只应由主 agent 内部编排调用）。
// 缺 agentName 的老消息不预判，交给服务端 403 兜底。
function isRegenerateSupportedAgent(agentName) {
  if (!agentName) return true;
  if (isBuildOrPlanAgent(agentName)) return false;
  if (agentName === 'app-build-summary' || agentName === 'app-data-agent') return false;
  return !agentName.endsWith('-sub-agent');
}

// assistant 回复正文（供复制 / 朗读）：只取文本 part（工作过程已由 carveWorkParts 折进 work part），
// 剥掉 mingo_ask 围栏后拼接，即为当前展示给用户的回复内容。
function getAssistantPlainText(message) {
  return (message.parts || [])
    .filter(part => part.kind === 'text')
    .map(part => extractAsk(part.text || '').text)
    .join('\n\n')
    .trim();
}

// 用户提问正文（供复制）：取文本 part 拼接（embed / 附件 part 不计入）。
function getUserPlainText(message) {
  return (message.parts || [])
    .filter(part => part.kind === 'text')
    .map(part => part.text || '')
    .join('\n')
    .trim();
}

// 会话默认标题：取首条用户消息文本（与后端 firstMessage / 历史列表标题同源），供分享弹窗标题默认值。
function getSessionTitleFromMessages(list) {
  const firstUser = (list || []).find(m => m.role === 'user');

  return firstUser ? getUserPlainText(firstUser) : '';
}

// 禁用态：去掉 hover 效果（悬浮底色 + tooltip）。BgIconButton 的 disabled 悬浮底色因 CSS 优先级仍会命中，
// 用 pointer-events:none 从根上屏蔽 hover 与 tooltip 触发（图标本身的置灰样式仍保留）。
const DISABLED_NO_HOVER = { pointerEvents: 'none' };

// 本轮回复生成中点击重新生成 / 分享时的提示；带 key 避免连点叠出多条 toast
function alertGenerating() {
  alert({ msg: _l('正在生成消息，无法操作'), type: 3, key: 'agentMessageGenerating' });
}

// 复制按钮：assistant 回复与 user 提问共用。无正文时置灰（用户提问的复制不因搭建 / 方案而禁用，永远可复制）。
function CopyButton({ text, disabled }) {
  const off = disabled || !text;
  const iconStyle = browserIsMobile() ? { fontSize: 22 } : {};

  return (
    <BgIconButton
      size="small"
      icon="copy_custom"
      iconStyle={iconStyle}
      style={off ? DISABLED_NO_HOVER : undefined}
      popupPlacement="top"
      tooltip={_l('复制')}
      disabled={off}
      onClick={() => {
        copy(text);
        alert(_l('复制成功'));
      }}
    />
  );
}

// assistant 回复底部操作栏：复制 / 朗读 / 重新生成 / 分享。朗读复用 SpeechSynthesizer（与对话机器人一致，
// 支持朗读中停止）；「搭建应用 / 方案生成」类消息（opsDisabled，按 agentName 判定）暂不支持分享，置灰禁用。
// 重新生成（V6.3）入口单独控制：showRegenerate 决定是否显示（所有 assistant 回复，按 agent 支持名单过滤），
// regenerateDisabled 在后端 messageId 未回填时先置灰（V6.4 起 completed 即回填，正常收尾后立即可点）。
// 本轮生成中（submitting）不置灰：整屏历史消息的按钮会随每轮问答反复灰亮，改为保持常态样式、
// 点击时提示「正在生成消息」，与「本条能力上就不支持」（置灰）区分开。
function AssistantActions({
  text,
  always,
  shareable,
  enableFeedback,
  onFeedback,
  submitting,
  selecting,
  opsDisabled,
  showRegenerate,
  regenerateDisabled,
  onRegenerate,
  onShare,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const speechRef = useRef(null);
  const isMobile = browserIsMobile();
  const iconStyle = isMobile ? { fontSize: 22 } : {};
  const hasText = !!text;

  // 卸载 / 切换会话时停止朗读，避免遗留语音继续播报
  useEffect(() => {
    return () => {
      if (speechRef.current) speechRef.current.clear();
    };
  }, []);

  const handleSpeak = () => {
    if (!speechRef.current) speechRef.current = new SpeechSynthesizer();

    if (isPlaying) {
      speechRef.current.clear();
      setIsPlaying(false);
      return;
    }

    speechRef.current.speak((text || '').replace(/#/g, ''), {
      onEnd: () => setIsPlaying(false),
    });
    setIsPlaying(true);
  };

  // 多选分享态：整屏都在勾选消息，单条的重新生成 / 分享一并让位，避免与勾选、底部分享条抢操作
  const opsOff = opsDisabled || selecting;
  const regenOff = regenerateDisabled || selecting;

  return (
    <MessageActionsBar always={always}>
      <BgIconButton.Group className="t-items-center" gap={6}>
        <CopyButton text={text} />
        {window.speechSynthesis && (
          <BgIconButton
            size="small"
            icon="bofang"
            iconComponent={isPlaying ? <img width={16} height={16} src={PlayAnimation} alt="" /> : null}
            iconStyle={{ ...iconStyle, ...(isPlaying ? { color: 'var(--color-mingo)' } : {}) }}
            style={hasText ? undefined : DISABLED_NO_HOVER}
            popupPlacement="top"
            tooltip={isPlaying ? _l('停止朗读') : _l('朗读')}
            disabled={!hasText}
            onClick={handleSpeak}
          />
        )}
        {showRegenerate && (
          <BgIconButton
            size="small"
            icon="ic_refresh_black"
            iconStyle={iconStyle}
            style={regenOff ? DISABLED_NO_HOVER : undefined}
            popupPlacement="top"
            tooltip={_l('重新生成')}
            disabled={regenOff}
            onClick={() => {
              if (submitting) return alertGenerating();
              onRegenerate();
            }}
          />
        )}
        {shareable && (
          <BgIconButton
            size="small"
            icon="share"
            iconStyle={iconStyle}
            style={opsOff ? DISABLED_NO_HOVER : undefined}
            popupPlacement="top"
            tooltip={_l('分享')}
            disabled={opsOff}
            onClick={() => {
              if (submitting) return alertGenerating();
              onShare();
            }}
          />
        )}
        {enableFeedback && (
          <BgIconButton
            size="small"
            icon="get_help"
            iconStyle={{
              ...iconStyle,
              color: 'var(--color-mingo)',
            }}
            popupPlacement="top"
            tooltip={_l('反馈')}
            onClick={onFeedback}
          />
        )}
      </BgIconButton.Group>
    </MessageActionsBar>
  );
}

function MessageRow({
  message,
  isLast,
  submitting,
  onFeedback,
  enableFeedback,
  onRetry,
  onRegenerate,
  onShare,
  enableShare,
  enableRegenerate,
  selecting,
  opsDisabled,
  onConfirmPlanDrift,
  onConfirmRebuild,
  onRefreshUsage,
  bus,
  currentAppName,
  activeVersionLabel,
}) {
  const parts = message.parts || [];
  const lastIdx = parts.length - 1;
  const streamingLast = submitting && isLast;
  const isPlanStage = message.role === 'assistant' && parts.some(p => p.kind === 'plan-card');
  // build 阶段消息里已经有 BuildProgress 组件展示进度（自带 spinner / 三点），不需要再叠消息级 LoadingDots
  const isBuildStage = parts.some(p => p.kind === 'build-progress');
  // Reasoning 流式中自带「思考中」三点，message 级 LoadingDots 会和它叠加；
  // 但 reasoning 结束、text 还没开始的间隙仍需要 message loading 占位提示「在生成」
  const reasoningInProgress = streamingLast && parts[lastIdx] && parts[lastIdx].kind === 'reasoning';
  // 有解析行在场（含完成态，它同样带三点）：ExtractStatus 已经在转，message 级 LoadingDots 再出一组就是两个 loading
  const extractInProgress = parts.some(p => p.kind === 'extract');

  // 附件卡片移到气泡外（仍随用户消息右对齐）：白色文件卡塞进有色气泡里显得局促，
  // 且会继承气泡的大行高导致文件名换行被遮挡。仅纯附件无正文时不再渲染空气泡。
  const attachmentParts = parts.filter(p => p.kind === 'attachment');
  // embed（如「修改搭建计划」）与附件一样移到气泡外渲染：自带卡片样式，不套有色气泡。
  // mingo_ask 提问卡不内联渲染：待答时固定在底部输入区，作答后由 ask_reply 回顾进入对话。
  const embedParts = parts.filter(p => p.kind === 'embed' && p.suffix !== 'ask');
  const bubbleParts = parts.filter(p => p.kind !== 'attachment' && p.kind !== 'embed');
  const bubbleLastIdx = bubbleParts.length - 1;
  // 确认类卡片（plan 漂移 / rebuild 二选一）是交互 halt 而非计费产物，
  // 「请确认下一步操作」这类消息不展示信用点，避免让用户误以为确认动作要扣费。
  const isConfirmCard = parts.some(p => p.kind === 'rebuild-confirm' || p.kind === 'plan-drift');

  // 回复操作栏（复制 / 朗读 / 重新生成 / 分享）：仅 assistant 且非在途、非确认卡时展示。
  // 复制 / 朗读作用于回复正文；无正文且不可分享时整条操作栏不出。
  const assistantPlainText = message.role === 'assistant' ? getAssistantPlainText(message) : '';
  const userPlainText = message.role === 'user' ? getUserPlainText(message) : '';
  const shareable = !!enableShare && !!message.messageId;
  // 重新生成（V6.3 服务端重跑）：所有 assistant 回复都提供入口；对中间某条重生成会把其之后的对话
  // 全部物理删除（不管相不相关），由 regenerateAssistant 弹确认兜底。
  // 不支持的 agent（带写工具家族）直接不显示按钮而非置灰。
  const showRegenerate =
    !!enableRegenerate && message.role === 'assistant' && isRegenerateSupportedAgent(message.agentName);
  const showAssistantActions =
    message.role === 'assistant' && !streamingLast && !isConfirmCard && (!!assistantPlainText || shareable);

  return (
    <Message role={message.role}>
      {!isPlanStage &&
        attachmentParts.map((part, idx) => (
          <PartView key={`a-${idx}`} part={part} role={message.role} message={message} />
        ))}
      {!isPlanStage &&
        embedParts.map((part, idx) => <PartView key={`em-${idx}`} part={part} role={message.role} message={message} />)}
      {isPlanStage ? (
        <MessageContent role={message.role}>
          {renderPlanLayout({ message, parts, streamingLast, reasoningInProgress, onRetry, bus, activeVersionLabel })}
        </MessageContent>
      ) : (
        (bubbleParts.length > 0 || (submitting && isLast)) && (
          <MessageContent role={message.role}>
            {bubbleParts.map((part, idx) => (
              <React.Fragment key={part.kind === 'tool' ? `t-${part.id}` : `${part.kind[0]}-${idx}`}>
                <PartView
                  part={part}
                  role={message.role}
                  streaming={streamingLast && idx === bubbleLastIdx}
                  onRetry={() => onRetry(message.id, part.retryPrompt)}
                  onConfirmPlanDrift={action => onConfirmPlanDrift(message.id, action)}
                  onConfirmRebuild={action => onConfirmRebuild(message.id, action)}
                  planDriftDisabled={submitting}
                  message={message}
                  currentAppName={currentAppName}
                  onOpenPreview={() => bus.emit('builder:open-preview')}
                />
                {IS_DEBUG && part.ts && (
                  <DebugLine>
                    {part.kind} · {formatPartTs(part.ts)}
                  </DebugLine>
                )}
              </React.Fragment>
            ))}
            {submitting && isLast && !isBuildStage && !reasoningInProgress && !extractInProgress && (
              <LoadingRow>
                <LoadingDots dotNumber={3} />
              </LoadingRow>
            )}
          </MessageContent>
        )
      )}
      {/* 回复底部页脚：操作栏（复制 / 朗读 / 重新生成 / 分享）+ 元信息（时间 + 扣费信用点）同一行。
          整行最新一条常驻、旧消息 hover 才显现；最后一条仍在 streaming（本轮在途）时不展示，
          等流式结束再出现，避免在途消息底部跳动。settled →「X 信用点」/ pending →「费用计算中…」+ 刷新；
          help-agent 不计费、非平台版无计费时 credits 置空只显示时间。 */}
      {message.role === 'assistant' && !streamingLast && (
        <MessageFooter role="assistant">
          {showAssistantActions && (
            <AssistantActions
              text={assistantPlainText}
              always={isLast}
              shareable={shareable}
              enableFeedback={enableFeedback}
              onFeedback={onFeedback}
              submitting={submitting}
              selecting={selecting}
              opsDisabled={opsDisabled}
              showRegenerate={showRegenerate}
              regenerateDisabled={!message.messageId}
              onRegenerate={() => onRegenerate(message.id)}
              onShare={() => onShare(message.messageId)}
            />
          )}
          <MessageMeta
            time={message.time}
            credits={isConfirmCard || shouldHideUsage(message.agentName) ? null : message.credits}
            pending={isConfirmCard || shouldHideUsage(message.agentName) ? false : message.creditsPending}
            always={isLast}
            onRefresh={() => onRefreshUsage(message)}
          />
        </MessageFooter>
      )}
      {/* 用户提问：发送时间 + 复制（右对齐同一行）。复制永远可用，不因搭建 / 方案而置灰。 */}
      {message.role === 'user' && (
        <MessageFooter role="user">
          <MessageMeta time={message.time} always={isLast}>
            {!!userPlainText && <CopyButton text={userPlainText} />}
          </MessageMeta>
        </MessageFooter>
      )}
    </Message>
  );
}

const PlainUserText = styled.div`
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
`;

function PartView({
  part,
  role,
  streaming,
  onRetry,
  onConfirmPlanDrift,
  onConfirmRebuild,
  planDriftDisabled,
  message,
  currentAppName,
  onOpenPreview,
}) {
  if (part.kind === 'reasoning') {
    return (
      <Reasoning streaming={streaming} defaultOpen={part.open}>
        {part.text}
      </Reasoning>
    );
  }

  if (part.kind === 'work') {
    return <WorkPhase items={part.children} startedAt={part.ts} finishedAt={part.finishedAt} />;
  }

  if (part.kind === 'tool') {
    // 仅在 localStorage.isDebug 开启时展示；正常用户看不到工具调用噪声
    if (!IS_DEBUG) return null;
    return (
      <ToolCall title={part.title} status={part.status} input={part.input} output={part.output} error={part.error} />
    );
  }

  if (part.kind === 'build-progress') {
    return (
      <BuildProgress
        steps={part.steps}
        appName={part.appName || currentAppName}
        startedAt={part.ts}
        finishedAt={part.finishedAt}
        aborted={part.aborted}
        onOpenPreview={onOpenPreview}
      />
    );
  }

  if (part.kind === 'extract') {
    return <ExtractStatus part={part} />;
  }

  if (part.kind === 'error') {
    return <ResponseError error={part.text} onRetry={onRetry} />;
  }

  if (part.kind === 'plan-drift') {
    return (
      <PlanDriftCard
        part={part}
        disabled={planDriftDisabled || part.status === 'resolved'}
        onConfirm={onConfirmPlanDrift}
      />
    );
  }

  if (part.kind === 'rebuild-confirm') {
    return (
      <RebuildConfirmCard
        part={part}
        disabled={planDriftDisabled || part.status === 'resolved'}
        onConfirm={onConfirmRebuild}
      />
    );
  }

  if (part.kind === 'plan-card') {
    return null;
  }

  if (part.kind === 'attachment') {
    return (
      <AddedFiles
        readonly
        hideShare
        files={(part.items || []).map(item => ({
          id: `${message.id}-att-${item.url || item.name}`,
          name: item.name,
          size: item.size,
          type: item.type === 'image' ? 'image/' : '',
          url: item.url,
          status: 'uploaded',
        }))}
      />
    );
  }

  if (part.kind === 'embed') {
    const Embed = getEmbedComponent(part.suffix);

    return Embed ? React.createElement(Embed, { data: part.data }) : null;
  }

  // 用户消息不走 markdown：纯文本渲染（保留换行），embed 已在上面单独处理
  if (role === 'user') {
    return <PlainUserText>{part.text}</PlainUserText>;
  }

  // 流式途中 <workEnd /> 可能只到了一半（如 `<workEnd`），闭合前先藏掉残缺片段，避免标签文本闪现
  const rawText = streaming ? (part.text || '').replace(/<work[^>]*$/i, '') : part.text;
  // mingo_ask 提问围栏从气泡正文里剥掉：待答时固定底部、作答后由 ask_reply 回顾呈现，正文只留引导语
  const { text } = extractAsk(rawText);

  return (
    <MessageResponse role={role} streaming={streaming}>
      {text}
    </MessageResponse>
  );
}

function AttachmentUploader({
  files,
  onChange,
  inputId,
  onAfterAdd,
  onChooseApp,
  buttonClassName,
  buttonIcon = 'attachment',
  children,
}) {
  return (
    <MingoAttachmentUploader
      tokenType={ATTACHMENT_TOKEN_TYPE}
      maxFilesLength={MAX_ATTACHMENTS}
      files={files}
      allowMimeTypes={AGENT_ATTACHMENT_MIME_TYPES}
      dropElementId={inputId}
      onChange={onChange}
      onAfterAdd={onAfterAdd}
      onChooseApp={onChooseApp}
    >
      {children || (
        <BgIconButton
          className={buttonClassName}
          style={{ borderRadius: '8px', padding: '6px' }}
          icon={buttonIcon}
          tooltip={<AttachmentTooltip max={MAX_ATTACHMENTS} />}
          popupPlacement="top"
          onClick={() => {}}
        />
      )}
    </MingoAttachmentUploader>
  );
}
