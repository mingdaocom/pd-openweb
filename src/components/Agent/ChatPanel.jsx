import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { BgIconButton } from 'ming-ui';
import projectAjax from 'src/api/project';
import AddedFiles from 'src/components/Mingo/ChatBot/components/AddedFiles';
import MingoAttachmentUploader from 'src/components/Mingo/ChatBot/components/AttachmentUploader';
import { upgradeVersionDialog } from 'src/components/upgradeVersion';
import { browserIsMobile, emitter, pathCompletion } from 'src/utils/common';
import { useAgentBus, useAgentEvent } from './agentBus';
import {
  AGENT_ATTACHMENT_MIME_TYPES,
  AGENT_HEADER_EVENT,
  cancelAgentRun,
  createAgentSessionId,
  fetchAgentSessionMessages,
  fetchArtifactAppMeta,
  fetchArtifactFile,
  fetchArtifactFileContent,
  fetchArtifactFileList,
  fetchTraceUsage,
  getCompletedText,
  mapAttachmentForRequest,
  readField,
  requestAgentStream,
  stringValue,
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
import {
  appendEventToParts,
  applyCompletedAppName,
  ensureCompletedText,
  extractAppCreatedIds,
  forwardFileEvent,
  markBuildProgressAborted,
  markBuildProgressFinished,
  resolvePlanDrift,
  resolveRebuildConfirm,
  upsertRebuildConfirm,
} from './streamEvents';
import {
  AnonAttachmentSlot,
  AttachmentTooltip,
  BuildProgress,
  Conversation,
  ConversationContent,
  ConversationSkeleton,
  LoadingDots,
  Message,
  MessageContent,
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
import ModifyPlanComposer from './ui/ModifyPlanComposer';

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
  /* 落地页（无全局 header）消息区顶部留白，避免首条消息贴顶 */
  ${p => p.$topInset && 'padding-top: 40px;'}
`;

const ComposerArea = styled.div`
  width: 100%;
  max-width: 792px;
  margin: 0 auto;
  padding: 8px 16px 16px;
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

// loading 三点 + 过渡态步骤文案（如「正在解析文档…」）同行展示
const LoadingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  .loadingHint {
    font-size: 13px;
    color: var(--color-text-secondary);
  }
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

// 由 doc/image 待解析数量派生过渡态文案：「正在解析文档…」「正在解析 2 个文档、1 张图片…」
function buildExtractHint({ doc, image } = {}) {
  const segs = [];

  if (doc) segs.push(doc > 1 ? _l('%0 个文档', doc) : _l('文档'));
  if (image) segs.push(image > 1 ? _l('%0 张图片', image) : _l('图片'));
  return segs.length ? _l('正在解析%0…', segs.join('、')) : '';
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

function getSingleMingoPlanAnonSessionError(error) {
  const body = safeParse((error && error.message) || '', 'object');
  const errorCode = stringValue(readField(body, 'errorCode')) || '';
  const message = stringValue(readField(body, 'errorMessage'));

  if (errorCode !== 'anon_session_invalid' || !message) return null;

  return { errorCode, message };
}

function getStreamFailureError(error, shouldPickSingleMingoPlanError) {
  if (shouldPickSingleMingoPlanError) {
    const singleMingoPlanError = getSingleMingoPlanAnonSessionError(error);

    if (singleMingoPlanError) return singleMingoPlanError;
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
    // 落地页：搭建/预览可见时与对话并排成三栏（AppBuilder 中栏 + 对话右栏）
    landingLayout = false,
    promptInputClassName,
    promptAttachmentButtonClassName,
    promptAttachmentButtonIcon,
    promptMentionButtonIcon,
    promptMentionButtonText,
    promptPlaceholder,
  } = runtime || {};
  const mentionEnabled = enableMention && !anonymous;
  const isMobile = browserIsMobile();
  const bus = useAgentBus();
  const initialAppBuilderVisible = landingLayout && autoOpenInitialBuilder && !disableAppBuilder && !isMobile;
  const [sessionId, setSessionId] = useState(() => initialSessionId || createAgentSessionId());
  const [messages, setMessages] = useState([]);
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
  // 打开历史会话后一次性贴底信号：历史非流式（autoScroll=submitting=false），需主动滚到最新一条
  const [historyScrollSignal, setHistoryScrollSignal] = useState(0);
  // appName 同时进 state 与 ref：ref 给 composeAppContext 同步取值，state 让 BuildProgress 渲染时拿到当前值
  const [currentAppName, setCurrentAppName] = useState('');
  // 当前在 AppBuilder 中激活/展示的版本（versionLabel）：用于让对应 plan-card 高亮为选中态，其余仅 committed 不高亮
  const [activeVersionLabel, setActiveVersionLabel] = useState('');
  // 执行中断 / 拦截提示：贴在输入框上方的浮动卡（信用点不足、服务异常等）。{ errorCode, message }，null 时不展示。
  const [interceptError, setInterceptError] = useState(null);
  // 附件解析过渡态：route-selected 后、text-delta 前，后端同步「下载+解析」doc/图片附件（vision），
  // 这段窗口原本黑屏。记 doc/image 各自待解析数量（0=未在解析），给 loading 三点补「正在解析文档/图片…」步骤文案。
  // doc 与 image 可同时出现（一条消息既带文档又带图），分开记，避免一方先完成把另一方文案误清。
  // 成功路径 *-completed 清；失败只会有 terminal error（无 *-completed），故 error/completed 也要兜底清空。
  const [extracting, setExtracting] = useState({ doc: 0, image: 0 });

  const filesRef = useRef({});
  // 「生成应用」发起中闸：预检为异步（await 工作表上限接口），在这段窗口内 submitting 尚未置位、
  // 按钮也还没变「已搭建」，靠它挡住重复点击，避免并发预检 / 发起两次搭建。发起完成（提交或被拒）即放开。
  const buildKickoffRef = useRef(false);
  const messagesRef = useRef([]);
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
  // 在途的用量轮询定时器集合：切会话 / 新建会话 / 卸载时统一清掉，避免轮询写进已不存在的消息。
  const usagePollTimersRef = useRef(new Set());

  // 当前选中组织：落地页空态可切换（仅影响新会话）；优先级 runtime 固定值 > 用户所选 > 全局默认
  const [selectedProjectId, setSelectedProjectId] = useState(() => getCurrentProjectId());

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

    // 预检①：组织创建应用权限。global 已按组织下发 cannotCreateApp（见 md.global.Account.projects）。
    const projects =
      (window.md && window.md.global && window.md.global.Account && window.md.global.Account.projects) || [];
    const project = projects.find(p => p.projectId === projectId);

    if (project && project.cannotCreateApp) {
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
      if (pid) setSelectedProjectId(pid);
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

    // 记下本轮 traceId：stream 收尾后据此轮询本轮用量（信用点）。流式事件每条都带，取第一次出现即可。
    const traceId = stringValue(event.payload && event.payload.traceId);

    if (traceId) roundTraceIdRef.current = traceId;

    // 附件解析过渡态：带 doc/image 附件的请求在 route-selected 之后、text-delta 之前先发
    // *-extract-start（进入解析窗口），成功发 *-extract-completed 再进入 text-delta；失败只有 terminal error。
    // 给 loading 补「正在解析文档/图片…」步骤文案。清空用函数式 no-op（值不变则不触发重渲染）。
    if (event.eventName === 'doc-extract-start') {
      setExtracting(s => ({ ...s, doc: Number(readField(data, 'count')) || 1 }));
    } else if (event.eventName === 'image-extract-start') {
      setExtracting(s => ({ ...s, image: Number(readField(data, 'count')) || 1 }));
    } else if (event.eventName === 'doc-extract-completed') {
      setExtracting(s => (s.doc ? { ...s, doc: 0 } : s));
    } else if (event.eventName === 'image-extract-completed') {
      setExtracting(s => (s.image ? { ...s, image: 0 } : s));
    } else if (
      event.eventName === 'text-delta' ||
      event.eventName === 'reasoning-delta' ||
      event.eventName === 'error' ||
      event.eventName === 'completed'
    ) {
      // 正文/思考开始，或任何 terminal 事件（含失败 error，无 *-completed）：兜底清空所有解析态
      setExtracting(s => (s.doc || s.image ? { doc: 0, image: 0 } : s));
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

      // 该 worksheet 视图/动作配完：worksheetId 直接来自事件，跳回对应工作表重新拉取，呈现新视图
      if (stepId === 'step-build-views' && worksheetId) {
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
      emitter.emit(AGENT_HEADER_EVENT.SESSION_ACTIVE, { sessionId });
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
      .map(m => ({ type: m.type || 'app', name: m.name, id: m.id }));

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
  //  - settled（已扣完）→ 写入 credits（终值，0 也合法），清掉计算中态；
  //  - pending_aggregate（a2a 后台 async 还在扣）→ 置 creditsPending，气泡显示「费用计算中…」+ 刷新按钮，
  //    并把 traceId / projectId 记在消息上供手动刷新重查。
  function applyTraceUsage(messageId, traceId, projectId) {
    return fetchTraceUsage(traceId, projectId).then(({ settled, credits }) => {
      setMessages(current =>
        current.map(m => {
          if (m.id !== messageId) return m;
          if (settled) return { ...m, credits: credits != null ? credits : m.credits, creditsPending: false };

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
    setSubmitting(true);
    const controller = new AbortController();

    abortRef.current = controller;
    // 新一轮开始：清掉上一轮残留的 traceId / agent，避免本轮无值时误用上轮的去轮询
    roundTraceIdRef.current = '';
    roundAgentRef.current = '';

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
    } catch (error) {
      // 用户主动点"停止"/关闭会话会 abort fetch（浏览器抛英文 BodyStreamBuffer was aborted），属正常终止非错误：
      // 不弹拦截卡，静默收尾即可；仅真实请求失败才走贴底拦截卡（无 errorCode → 可重试态）。
      const aborted = controller.signal.aborted || (error && error.name === 'AbortError');

      if (!aborted) {
        const failureError = getStreamFailureError(error, anonymous && isSingleMingoPlan);

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
    setExtracting({ doc: 0, image: 0 }); // 清掉上一轮残留的解析过渡态

    // 全部跳过的 ask_reply 等静默消息 parts 为空：照常发后端但不在列表插入空气泡（对齐设计稿「界面中不显示」）
    setMessages(current => [...current, ...(user.parts.length ? [user] : []), assistant]);
    setDraft('');
    setDraftAttachments([]);
    setPendingEdits([]);
    // 发起首条消息即标记会话激活：/agent 落地页据此回写 URL、刷新左侧历史
    emitter.emit(AGENT_HEADER_EVENT.SESSION_ACTIVE, { sessionId });
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
    setMessages(current => current.map(m => (m.id === assistantId ? { ...m, parts: [] } : m)));
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

  // plan 漂移确认：用户在 drift 卡片上二选一后，钉住 build-app-agent 回传 confirmation 续传。
  // 必须带当前 plan context：rebuild 要按新方案从头建（plan 数据全在 context 里），
  // resume_with_old_plan 也无害（已完成步骤走 checkpoint 投回、不消费 context）。
  // 带一句 message 仅为通过后端 legality 校验（决策由 confirmation 驱动，与 message 内容无关）。
  async function sendPlanDriftConfirmation(driftMessageId, action) {
    if (submitting) return;

    // 先把卡片标记为已决策，禁用按钮、展示选择
    setMessages(current => current.map(m => (m.id === driftMessageId ? resolvePlanDrift(m, action) : m)));
    buildResumableRef.current = false;

    const assistant = assistantMessage();

    startedPathsRef.current = new Set();
    setMessages(current => [...current, assistant]);
    setSubmitting(true);
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
        setInterceptError(getStreamFailureError(error, anonymous && isSingleMingoPlan));
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

    const assistant = assistantMessage();

    startedPathsRef.current = new Set();
    setMessages(current => [...current, assistant]);
    setSubmitting(true);
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
    // 搭建途中暂停（已建出应用即视为有进度）：标记续建态，下次「继续」不重传方案、不误弹 plan 漂移
    if (appMetaRef.current.appId) buildResumableRef.current = true;
    setSubmitting(false);
    setExtracting({ doc: 0, image: 0 });
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
    setDraft('');
    setDraftAttachments([]);
    setCurrentAppName('');
    hideAppBuilder();
    setHistoryVisible(false);
    setInterceptError(null); // 新会话清掉上一会话残留的拦截卡
    setExtracting({ doc: 0, image: 0 });
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
    setInterceptError(null); // 切换会话清掉上一会话残留的拦截卡
    setExtracting({ doc: 0, image: 0 });
    try {
      const isAnonymousMingoPlan = anonymous && isSingleMingoPlan;
      const history = await fetchAgentSessionMessages(targetSessionId, {
        includeUsage: !isAnonymousMingoPlan,
        includeAnonymousPlanArtifact: isAnonymousMingoPlan,
        rawItems: options.initialHistoryMessages,
      });

      filesRef.current = {};
      appMetaRef.current = { name: '', appId: '', sectionIdByName: {} };
      startedPathsRef.current = new Set();
      committedFilesFetchedRef.current = new Set();
      committedFilesLoadingRef.current = new Map();
      // 还原版本基线：历史里最后一张 plan-card 即最新版本，作为"是否最新"的判定基准
      const planCards = history.flatMap(m => (m.parts || []).filter(p => p.kind === 'plan-card' && p.versionId));
      const latestCard = planCards[planCards.length - 1] || null;
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
      setMessages(history);
      setSessionId(targetSessionId);
      setHistoryVisible(false);
      // 历史消息渲染后滚到底部，定位到最新一条
      setHistoryScrollSignal(s => s + 1);
      // 恢复/续接会话也要广播激活：否则 Mingo 头部 agentSessionId 为空，会话内「新窗口打开」漏带会话 id
      emitter.emit(AGENT_HEADER_EVENT.SESSION_ACTIVE, { sessionId: targetSessionId });
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
      alert(_l('加载会话失败'), 2);
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
      emitter.emit(AGENT_HEADER_EVENT.BACK_TO_WELCOME);
    }
  }

  // 记住当前会话：关闭 Mingo 抽屉会卸载本面板，重开默认新会话。仅在会话已有消息时持久化 sessionId
  // （避免回写从未提交到后端的空会话，重开恢复时触发 404）；匿名 / 产品续建模式不参与。
  // session-bot- 为单轮 bot 工具调用会话，不可续接（已从历史列表排除），同样不记作"上次会话"。
  useEffect(() => {
    if (anonymous || initialSessionId || !sessionId || !messages.length || sessionId.startsWith('session-bot-')) return;
    const accountId =
      (window.md && window.md.global && window.md.global.Account && window.md.global.Account.accountId) || '';

    if (accountId) safeLocalStorageSetItem(`md_agent_last_session_${accountId}`, sessionId);
  }, [sessionId, messages.length, anonymous, initialSessionId]);

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
    const runtimeInitialSessionId =
      latestRuntime.anonymous &&
      latestRuntime.isSingleMingoPlan &&
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
      if (targetInitialSessionId) {
        if (latestRuntimeRef.current.loadSession) {
          latestRuntimeRef.current.loadSession(targetInitialSessionId, {
            autoOpenBuilder: autoOpenInitialBuilderRef.current,
            initialPlanArtifact: latestRuntimeRef.current.initialPlanArtifact,
            initialHistoryMessages: latestRuntimeRef.current.initialHistoryMessages,
          });
          autoOpenInitialBuilderRef.current = false;
        }
      } else {
        if (latestRuntimeRef.current.submitPrompt) {
          latestRuntimeRef.current.submitPrompt(initial || '', hasAttachments ? attachments : undefined, mentions, {
            onSubmitStart: () => handoffKey && clearAnonHandoff(handoffKey),
          });
        }
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const lastMessageId = messages.length ? messages[messages.length - 1].id : null;
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
  const showDockedAsk = !!pendingAskData;
  // 由 doc/image 解析态派生 loading 步骤文案（仅最后一条流式消息用）
  const loadingHint = buildExtractHint(extracting);
  // 输入框占位：应用内（URL /app/:appId 或本会话已建出应用）提示对当前应用提问/继续搭建；
  // 非应用内提示 @ 应用提问或搭建新应用。currentAppName 变更会触发重渲染，placeholder 随之更新。
  // 应用列表页（/app/my、/app/lib）显式判为不在应用下，避免续建会话的 appId 泄漏到列表页。
  const inAppContext = !isAppListPage() && !!(appMetaRef.current.appId || getCurrentAppId());
  // 落地页三栏并排：搭建/预览可见时 AppBuilder 占中栏、对话收右栏；非落地页维持原 absolute 全屏覆盖
  const builderSplit = landingLayout && appBuilderVisible;

  return (
    <Wrap $dock={builderSplit}>
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
            ) : (
              messages.map(message => (
                <MessageRow
                  key={message.id}
                  message={message}
                  isLast={message.id === lastMessageId}
                  submitting={submitting}
                  onRetry={retryAssistant}
                  onConfirmPlanDrift={sendPlanDriftConfirmation}
                  onConfirmRebuild={sendRebuildConfirmation}
                  onRefreshUsage={handleRefreshUsage}
                  bus={bus}
                  currentAppName={currentAppName}
                  activeVersionLabel={activeVersionLabel}
                  loadingHint={loadingHint}
                />
              ))
            )}
          </CenteredMessages>
        </Conversation>
      </ConversationArea>

      {!showDockedAsk && !askStreaming && (
        <ComposerArea>
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
          <PromptInput
            className={promptInputClassName}
            ref={promptInputRef}
            autoFocus={autoFocus}
            value={draft}
            projectId={mentionEnabled ? getContextProjectId() : undefined}
            enableMention={mentionEnabled}
            forceEnableVoice={forceEnableVoice}
            getVoiceAuthConfig={
              anonymous
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
                : anonymous
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
                    <ModifyPlanComposer edits={pendingEdits} onDelete={handleDeleteEdit} onSubmit={handleSubmitEdits} />
                  )}
                  {draftAttachments.length ? (
                    <AddedFiles
                      files={draftAttachments}
                      onRemove={id => setDraftAttachments(prev => prev.filter(f => f.id !== id))}
                    />
                  ) : null}
                </React.Fragment>
              ) : null
            }
            attachmentSlot={
              anonymous ? (
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
                  onAfterAdd={() => setTimeout(() => promptInputRef.current && promptInputRef.current.focus(), 0)}
                />
              )
            }
          />
        </ComposerArea>
      )}
      {showDockedAsk && (
        <DockedAskLayer>
          {/* key 绑定 会话 + 提问消息：切换会话/换一道 ask 时整卡重挂载，避免复用旧实例残留翻页进度与作答（导致旧 ask 不刷新/越界报错） */}
          <AskEmbed key={`${sessionId}-${lastMessage.id}`} data={pendingAskData} docked />
        </DockedAskLayer>
      )}
      {askStreaming && !showDockedAsk && (
        <DockedAskLayer>
          {/* 流式期：ask 围栏已出现但 JSON 未流完，先占位骨架；流完 !submitting 后无缝换成真卡 */}
          <AskSkeleton docked />
        </DockedAskLayer>
      )}

      {historyVisible && (
        <SessionHistory
          currentSessionId={sessionId}
          onSelect={handleSelectSession}
          onDeleted={handleSessionDeleted}
          onClose={() => setHistoryVisible(false)}
        />
      )}

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
      {planParts.map((part, idx) => (
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
          onClick={() =>
            bus &&
            bus.emit &&
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
          }
        />
      ))}
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

function MessageRow({
  message,
  isLast,
  submitting,
  onRetry,
  onConfirmPlanDrift,
  onConfirmRebuild,
  onRefreshUsage,
  bus,
  currentAppName,
  activeVersionLabel,
  loadingHint,
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
            {submitting && isLast && !isBuildStage && !reasoningInProgress && (
              <LoadingRow>
                <LoadingDots dotNumber={3} />
                {loadingHint && <span className="loadingHint">{loadingHint}</span>}
              </LoadingRow>
            )}
          </MessageContent>
        )
      )}
      {/* 元信息行（消息时间 + 扣费信用点）：所有 assistant 消息都展示，整行最新一条常驻、旧消息 hover 才显现。
          最后一条仍在 streaming（本轮在途）时不展示——等流式结束再出现，避免在途消息底部跳时间/费用。
          settled →「X 信用点」/ pending →「费用计算中…」+ 刷新按钮；help-agent 不计费、非平台版无计费，
          credits 置空只显示时间。 */}
      {message.role === 'assistant' && !streamingLast && (
        <MessageMeta
          time={message.time}
          credits={isConfirmCard || shouldHideUsage(message.agentName) ? null : message.credits}
          pending={isConfirmCard || shouldHideUsage(message.agentName) ? false : message.creditsPending}
          always={isLast}
          onRefresh={() => onRefreshUsage(message)}
        />
      )}
      {/* 用户消息只展示发送时间（无扣费）：整行最新一条常驻、旧消息 hover 才显现 */}
      {message.role === 'user' && <MessageMeta time={message.time} always={isLast} />}
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
        files={(part.items || []).map(item => ({
          id: `${message.id}-att-${item.url || item.name}`,
          name: item.name,
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

function AttachmentUploader({ files, onChange, inputId, onAfterAdd, buttonClassName, buttonIcon = 'attachment' }) {
  return (
    <MingoAttachmentUploader
      tokenType={ATTACHMENT_TOKEN_TYPE}
      maxFilesLength={MAX_ATTACHMENTS}
      files={files}
      allowMimeTypes={AGENT_ATTACHMENT_MIME_TYPES}
      dropElementId={inputId}
      onChange={onChange}
      onAfterAdd={onAfterAdd}
    >
      <BgIconButton
        className={buttonClassName}
        style={{ borderRadius: '8px', padding: '6px' }}
        icon={buttonIcon}
        tooltip={<AttachmentTooltip max={MAX_ATTACHMENTS} />}
        popupPlacement="top"
        onClick={() => {}}
      />
    </MingoAttachmentUploader>
  );
}
