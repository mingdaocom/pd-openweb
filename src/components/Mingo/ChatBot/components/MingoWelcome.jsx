import React, { useEffect, useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { BgIconButton, Icon, Skeleton } from 'ming-ui';
import { useGlobalStore } from 'src/common/GlobalStore';
import {
  AGENT_ATTACHMENT_MIME_TYPES,
  AGENT_HEADER_EVENT,
  createAgentSessionId,
  getCompletedText,
  mapAttachmentForRequest,
  requestAgentStream,
} from 'src/components/Agent/agentService';
import { getCurrentAppId } from 'src/components/Agent/buildContext';
import { AttachmentTooltip, ProjectSwitch, PromptInput, SessionHistory } from 'src/components/Agent/ui';
import AddedFiles from 'src/components/Mingo/ChatBot/components/AddedFiles';
import { useDailyBuildSuggestions } from 'src/components/Mingo/ChatBot/components/buildRecommender';
import { BUILD_SAMPLES, pickRandom, pickRandomSamples } from 'src/components/Mingo/ChatBot/components/buildSamples';
import { buildRecommenderMessage, parseQuestions } from 'src/components/Mingo/ChatBot/components/questionRecommender';
import { TRY_TRY_LIST } from 'src/components/Mingo/ChatBot/components/tryTryList';
import UploadFiles from 'src/components/Mingo/ChatBot/components/UploadFiles';
import { formatResponseData } from 'src/components/UploadFiles/utils';
import mingoLogo from 'src/pages/mingo/common/images/mingo-logo.png';
import { getUserRole } from 'src/pages/worksheet/redux/actions/util';
import { canEditApp } from 'src/pages/worksheet/redux/actions/util';
import { emitter } from 'src/utils/common';
import { getCurrentProject } from 'src/utils/project';
import appInfoOptimizationIcon from '../../assets/ai_app_info_optimization.svg';
import createRecordIcon from '../../assets/ai_create_date.svg';
import appendDataIcon from '../../assets/ai_padding_data.svg';
import mingoWelcomeGif from '../../assets/mingoWelcome.gif';
import worksheetIcon from '../../assets/table_c.svg';
import { MINGO_TASK_TYPE } from '../enum';

const ATTACHMENT_TOKEN_TYPE = 71;
const MAX_ATTACHMENTS = 5;
// PromptInput textarea 与 UploadFiles 共用同一 id：plupload 的 paste_element / drop_element 由此挂载
const PROMPT_INPUT_ID = 'mingo-welcome-prompt-input';
// 应用内「提问」tab 推荐问题的 agent 名（纯文本流式输出，每行一个问题）
const QUESTION_RECOMMENDER_AGENT = 'app-question-recommender';

const MingoWelcomeWrap = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px 24px 16px;
  overflow-y: auto;

  /* 落地页（landing）整体垂直居中；抽屉态保持顶部对齐 + 滚动 */
  &.landing {
    justify-content: center;
  }

  .inner {
    width: 100%;
  }

  .topBlock {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  /* 落地页静态 logo（替代欢迎动图）：居中、限高 */
  .welcomeLogo {
    height: 120px;
    width: auto;
    object-fit: contain;
    display: block;
    margin-bottom: 60px;
  }
  /* 嵌入态（?embed=1）：logo 收敛限高，适配外部 iframe 紧凑展示 */
  &.embed .welcomeLogo {
    height: 60px;
  }
  .welcomeGif {
    /* 横向铺满到容器边：抵消 Wrap 两侧各 24px padding（topBlock 居中对齐，对称溢出贴边） */
    width: calc(100% + 48px);
    min-width: 360px;
    height: auto;
    display: block;
    /* 左右各 50px 渐变蒙版：边缘 80% 遮罩（保留 20% 可见，露出容器主题背景）→ 内部不遮。
       用 mask 而非颜色叠层，dark/light 自动正确（透出的就是当前主题背景，无需写死色值）。 */
    -webkit-mask-image: linear-gradient(
      to right,
      rgba(0, 0, 0, 0.2) 0,
      #000 50px,
      #000 calc(100% - 50px),
      rgba(0, 0, 0, 0.2) 100%
    );
    mask-image: linear-gradient(
      to right,
      rgba(0, 0, 0, 0.2) 0,
      #000 50px,
      #000 calc(100% - 50px),
      rgba(0, 0, 0, 0.2) 100%
    );
  }
  .subline {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 8px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    &.switchable {
      cursor: pointer;
      &:hover {
        color: var(--color-mingo);
      }
      .switchArrow {
        font-size: 16px;
        color: var(--color-text-secondary);
      }
    }
  }
  .sectionLabel {
    font-size: 13px;
    color: var(--color-text-secondary);
    margin: 40px 0 6px;
    .accent {
      color: var(--color-text-primary);
      font-weight: 600;
      margin: 0 4px;
    }
  }
  .tryList {
    display: flex;
    flex-direction: column;
  }
  /* hover 与左侧 quickAction 统一：整行底色高亮（不再只变文字色） */
  .tryItem {
    display: flex;
    align-items: center;
    /* 用 min-height 而非固定 height：问题文案换行成多行时能撑高，避免与下一条重叠挤在一起 */
    min-height: 40px;
    padding: 7px 5px;
    line-height: 20px;
    border-radius: 6px;
    color: var(--color-text-primary);
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s ease;
    &:hover {
      background: var(--color-background-hover);
    }
    .newBadge {
      margin-left: 8px;
      color: var(--color-success);
      font-size: 13px;
      font-weight: 500;
    }
  }
  /* 搭建推荐加载中：3 条一起占位，复用 tryItem 行高，内置 ming-ui Skeleton 扫光（去掉其默认内边距/底色） */
  .tryItem.trySkeleton {
    cursor: default;
    &:hover {
      background: transparent;
    }
    .loadingSkeleton {
      width: 100%;
      padding: 0;
      background: transparent;
    }
  }
  /* 应用内输入框下方的「提问 / 搭建」tab 切换（设计稿第三场景）：
     无整行分隔线，仅激活项下方一根短下划线（color-mingo 紫） */
  .welcomeTabsRow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 40px 0 0;
    .icon-refresh1 {
      &:hover {
        color: var(--color-link-hover) !important;
      }
    }
  }
  .welcomeTabs {
    display: flex;
    gap: 32px;
  }
  .welcomeTab {
    position: relative;
    padding-bottom: 8px;
    font-size: 14px;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: color 0.2s ease;
    &:hover {
      color: var(--color-text-primary);
    }
    &.active {
      color: var(--color-text-primary);
      font-weight: 600;
    }
    &.active::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 3px;
      border-radius: 2px;
      background: var(--color-mingo);
    }
  }
  .welcomeTabBody {
    margin-top: 8px;
  }
  /* 提问项去掉 hover 底色（仅保留指针），与「试一试」/「搭建」的整行高亮区分 */
  .questionItem:hover {
    background: transparent;
  }
  .qEmpty {
    padding: 12px 0;
    font-size: 13px;
    color: var(--color-text-secondary);
  }
  .quickActions {
    display: flex;
    flex-direction: column;
    gap: 4px;
    /* 应用内已移除「为 xx 应用」标签，这里补回与输入框的 40px 间距 */
    margin-top: 40px;
  }
  /* tab 面板内的 quickActions 顶部间距由 welcomeTabs / welcomeTabBody 控制，去掉自带 40px */
  .welcomeTabBody .quickActions {
    margin-top: 0;
  }
  .quickAction {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 40px;
    padding: 0;
    border-radius: 6px;
    cursor: pointer;
    color: var(--color-text-primary);
    font-size: 14px;
    transition: background 0.2s ease;
    &:hover {
      background: var(--color-background-hover);
    }
    &.disabled {
      cursor: not-allowed;
      color: var(--color-text-disabled);
      &:hover {
        background: transparent;
      }
    }
    .qaIcon {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      img {
        width: 22px;
        height: 22px;
      }
    }
    .qaName {
      flex: 1;
    }
  }
`;

// 应用内 4 个快捷入口；CREATE_APP_ASSIGNMENT 已移除（新首页输入框就是入口）
const APP_QUICK_ACTIONS = [
  {
    name: _l('创建工作表'),
    icon: worksheetIcon,
    type: MINGO_TASK_TYPE.CREATE_WORKSHEET_ASSIGNMENT,
  },
  {
    name: _l('填充示例数据'),
    icon: appendDataIcon,
    type: MINGO_TASK_TYPE.CREATE_WORKSHEET_DATA_ASSIGNMENT,
  },
  {
    name: _l('创建记录'),
    icon: createRecordIcon,
    type: MINGO_TASK_TYPE.CREATE_RECORD_ASSIGNMENT,
  },
  {
    name: _l('优化名称和图标'),
    icon: appInfoOptimizationIcon,
    type: MINGO_TASK_TYPE.APP_INFO_OPTIMIZATION,
  },
];

// 非应用内的"试一试"：固定 3 项
// 1) @ 一个应用开始提问 → 聚焦输入框并呼出 @ 浮层（新）
// 2) 随机一条搭建提示 → 聚焦并填入（新）
// 3) 随机一条 TryTry 问题 → 聚焦并填入
// 嵌入态（embed）：@ mention 呼出应用选择浮层在 iframe 内不适用，整列统一为最后一类（TryTry 推荐问题，
// type=fill 点击直接发起对话），去掉 @ 与搭建样例，取 3 条不重复。
function buildTrySamples(embed) {
  if (embed) {
    return pickRandomSamples(3, TRY_TRY_LIST).map(item => ({ type: 'fill', text: (item || {}).text || '' }));
  }

  return [
    { type: 'mention', text: _l('@ 一个应用开始提问'), isNew: true },
    { type: 'fill', text: pickRandom(BUILD_SAMPLES), isNew: true },
    { type: 'fill', text: (pickRandom(TRY_TRY_LIST) || {}).text || '' },
  ];
}

function checkIsCharge(appInfo) {
  const { permissionType, isLock } = appInfo;
  return canEditApp(permissionType, isLock);
}

export default function MingoWelcome({ onStartTask = () => {}, landing = false, embed = false }) {
  const {
    store: { appInfo, activeWorksheet },
  } = useGlobalStore();
  const [draft, setDraft] = useState('');
  const [draftAttachments, setDraftAttachments] = useState([]);
  const [historyVisible, setHistoryVisible] = useState(false);
  // 应用内输入框下方两个 tab：'ask' 提问（agent 推荐问题）/ 'build' 搭建（快捷动作）。默认提问（对齐设计稿）
  const [activeTab, setActiveTab] = useState('ask');
  const [questions, setQuestions] = useState([]);
  const [questionStatus, setQuestionStatus] = useState('idle'); // idle | loading | done | error
  const questionAbortRef = useRef(null);
  const promptInputRef = useRef(null);
  // 欢迎动图重播：Mingo 抽屉 destroyOnClose=false，关闭不销毁、重开不会重渲染，play-once gif 会停在末帧。
  // 用 IntersectionObserver 观察稳定容器，每次重新可见就给 <img> 换 key（重建元素）→ 从头再播一次。
  const welcomeBlockRef = useRef(null);
  const [gifNonce, setGifNonce] = useState(0);
  // 打开 Mingo 首页（MingoWelcome 挂载）时自动 focus 最外层输入框，省去用户再点一次
  useEffect(() => {
    const timer = setTimeout(() => promptInputRef.current?.focus(), 0);
    return () => clearTimeout(timer);
  }, []);
  // 仅当 URL 首段是合法 appId(GUID) 才算在应用下；/app/my、/app/lib 等列表页返回空，避免被误判为在应用下。
  // getCurrentAppId 内部已用 getPathWithoutSubPath 兼容子路径部署。
  const appId = getCurrentAppId();
  const isCharge = appInfo?.id === appId ? checkIsCharge(appInfo) : false;
  const { isOwner, isAdmin, isRunner, isDeveloper } = getUserRole(appInfo?.permissionType);
  const isManager = isOwner || isDeveloper || isRunner || isAdmin;
  const projects = get(md, 'global.Account.projects', []) || [];
  const initialProjectId =
    appInfo?.projectId || localStorage.getItem('currentProjectId') || get(projects, '[0].projectId', '');
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId);
  // 应用内锁定 appInfo.projectId；非应用走用户切换的 selectedProjectId
  const currentProjectId = appId ? appInfo?.projectId || initialProjectId : selectedProjectId;
  const currentProjectName = getCurrentProject(currentProjectId).companyName || '';
  const canSwitchProject = !appId && projects.length > 1;
  // 副标题统一展示当前组织名（应用内 / 非应用内一致）
  const sublineText = currentProjectName;

  // 与原逻辑一致：根据 appId / 角色 / activeWorksheet 决定哪些快捷动作可见
  const hiddenTypes = cx({
    [MINGO_TASK_TYPE.CREATE_WORKSHEET_ASSIGNMENT]: !appId || !isCharge || !isManager,
    [MINGO_TASK_TYPE.CREATE_RECORD_ASSIGNMENT]:
      !appId || !get(activeWorksheet, 'allowAdd') || !get(activeWorksheet, 'template.controls', []).length,
    [MINGO_TASK_TYPE.CREATE_WORKSHEET_DATA_ASSIGNMENT]:
      !appId ||
      !get(activeWorksheet, 'allowAdd') ||
      !isManager ||
      !get(activeWorksheet, 'template.controls', []).length,
    [MINGO_TASK_TYPE.APP_INFO_OPTIMIZATION]: !appId || !isManager,
  });
  const visibleQuickActions =
    appInfo?.appStatus === 20 ? [] : APP_QUICK_ACTIONS.filter(a => !hiddenTypes.includes(a.type));
  // 应用内才出现「提问/搭建」tab；appInfo 需已是当前应用的数据（sections 等就绪）才发起推荐
  const inApp = !!appId;
  const appReady = appInfo?.id === appId;

  // 拉取并流式渲染推荐问题：按 appInfo 组 message 调 app-question-recommender，
  // 累积 text-delta（纯文本、每行一个问题）实时解析成列表；completed 兜底取整段文本。
  async function loadQuestions({ isReload = false } = {}) {
    if (!appId) return;
    questionAbortRef.current?.abort();
    const controller = new AbortController();

    questionAbortRef.current = controller;
    setQuestionStatus('loading');
    setQuestions([]);

    const message = buildRecommenderMessage({ appInfo });
    let acc = '';

    try {
      await requestAgentStream(
        {
          sessionId: createAgentSessionId(),
          agentName: QUESTION_RECOMMENDER_AGENT,
          message,
          forceRefresh: isReload,
          // 注入当前语言，让 agent 按用户语言生成推荐
          context: { language: getCurrentLang() },
        },
        {
          onEvent: event => {
            if (controller.signal.aborted) return;
            if (event.eventName === 'text-delta' && event.payload.delta) {
              acc += event.payload.delta;
              setQuestions(parseQuestions(acc));
            } else if (event.eventName === 'completed' && !acc) {
              const text = getCompletedText(event.payload.data);

              if (text) {
                acc = text;
                setQuestions(parseQuestions(acc));
              }
            }
          },
        },
        controller.signal,
      );
      if (!controller.signal.aborted) setQuestionStatus('done');
    } catch {
      if (!controller.signal.aborted) setQuestionStatus('error');
    }
  }

  // 进入应用 / 切换应用且数据就绪时拉推荐问题（默认 tab 即提问，故进入即加载）；离开或切换时中止上一次流
  useEffect(() => {
    if (!inApp || !appReady) {
      questionAbortRef.current?.abort();
      setQuestions([]);
      setQuestionStatus('idle');
      return;
    }

    loadQuestions();
    return () => questionAbortRef.current?.abort();
  }, [appId, appReady]);

  function dispatchTask(task) {
    onStartTask(task);
    // Mingo 还未被 pin 时，先把任务暂存到 pendingTask，触发 SET_MINGO_FIXED 让外层固定再继续
    if (!window.mingoFixing) {
      window.mingoPendingStartTask = task;
      emitter.emit('SET_MINGO_FIXED');
    }
  }

  // 把首条消息（与可选附件、@ 应用）塞给 Agent，由 Agent 在 mount 时自动 submit
  function startAgentChat(text, attachments, mentions) {
    const trimmed = (text || '').trim();
    const hasAttachments = Array.isArray(attachments) && attachments.length > 0;
    const hasMentions = Array.isArray(mentions) && mentions.length > 0;

    // 必须有正文：仅有附件不发起，避免空 message 进 ChatPanel 被其守卫拦住、首页发了却不发起
    if (!trimmed) return;
    window.mingoInitialMessage = trimmed;
    if (hasAttachments) window.mingoInitialAttachments = attachments;
    // @ 的应用随首条消息一起交接，供 ChatPanel 拼进 context.mentions（设计稿三场景）
    if (hasMentions) window.mingoInitialMentions = mentions;
    dispatchTask({ type: MINGO_TASK_TYPE.CREATE_APP_ASSIGNMENT });
  }

  // 历史对话入口在 Mingo 头部（与关闭按钮同级）渲染，通过全局 emitter 打开本页的历史浮层
  useEffect(() => {
    const onOpenHistory = () => setHistoryVisible(true);

    emitter.on(AGENT_HEADER_EVENT.OPEN_HISTORY, onOpenHistory);
    return () => emitter.off(AGENT_HEADER_EVENT.OPEN_HISTORY, onOpenHistory);
  }, []);

  // 跟随外部组织切换（首页 SwitchProject / SideNav 等 emit CHANGE_CURRENT_PROJECT），保持首页与右侧 Mingo 选中组织一致。
  // 应用内锁定 appInfo.projectId，不跟随。
  useEffect(() => {
    if (appId) return undefined;
    const onChangeProject = project => {
      const pid = project && project.projectId;
      if (pid) setSelectedProjectId(pid);
    };

    emitter.on('CHANGE_CURRENT_PROJECT', onChangeProject);
    return () => emitter.off('CHANGE_CURRENT_PROJECT', onChangeProject);
  }, [appId]);

  // 选择历史会话：把会话 id 交给 Agent，由 Agent 在 mount 时加载并恢复对话
  function handleSelectHistorySession(session) {
    if (!session || !session.sessionId) return;
    setHistoryVisible(false);
    window.mingoInitialSessionId = session.sessionId;
    dispatchTask({ type: MINGO_TASK_TYPE.CREATE_APP_ASSIGNMENT });
  }

  function handleSubmit(textOverride, mentions) {
    const text = typeof textOverride === 'string' ? textOverride : draft;
    const uploadedAttachments = draftAttachments.filter(f => f.status === 'uploaded').map(mapAttachmentForRequest);

    // 必须有正文才能发送：仅有附件（无文本内容）不支持提交，与 ChatPanel 一致
    if (!text.trim()) return;
    startAgentChat(text, uploadedAttachments, mentions);
    setDraft('');
    setDraftAttachments([]);
  }

  function handleQuickAction(action) {
    if (action.type === MINGO_TASK_TYPE.CREATE_WORKSHEET_ASSIGNMENT) {
      localStorage.removeItem(`MINGO_CACHE_CREATE_WORKSHEET_BOT_${get(md, 'global.Account.accountId')}`);
    }

    dispatchTask(action);
  }

  // 非应用内「试一试」个性化搭建推荐：按当前组织画像取 app-build-recommender 的建议。
  // 应用内不取（projectId 传空，hook 回退静态）。
  // nextSuggestion：按返回顺序顺延取 1 条（每次 welcome 重新挂载/打开取下一条、循环）。
  const { nextSuggestion: buildReco, status: buildStatus } = useDailyBuildSuggestions(inApp ? '' : currentProjectId);
  // 非应用内"试一试"固定 3 项：mention / 搭建样例 / TryTry（嵌入态为 3 条 TryTry），随机项只在挂载时定一次。
  const baseTrySamples = useMemo(() => buildTrySamples(embed), [embed]);
  // 中间那条「搭建样例」推荐就绪后替换为顺延的个性化推荐；mention / TryTry 始终稳定不重随机。
  // 加载态在渲染处整列用骨架占位（3 条一起），不在此处理。
  const trySamples = useMemo(() => {
    // 嵌入态：整列已是 TryTry 推荐问题，不套用 buildReco 搭建推荐
    if (embed) return baseTrySamples;
    if (!buildReco) return baseTrySamples;
    return baseTrySamples.map((sample, i) => (i === 1 ? { type: 'fill', text: buildReco, isNew: true } : sample));
  }, [baseTrySamples, buildReco, embed]);

  // welcome 每次重新可见时给 gif 换 key 从头重播（抽屉 destroyOnClose=false，重开不重挂载会停在末帧）。
  // 搭建推荐的顺延由组件重新挂载时的 hook load 驱动，无需在此处理。
  useEffect(() => {
    const el = welcomeBlockRef.current;

    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(
      entries =>
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          setGifNonce(n => n + 1);
          // 抽屉 destroyOnClose=false，重开不重挂载：每次重新可见时按全局 currentProjectId 兜底纠正选中组织，
          // 修复「应用内打开 Mingo → 侧滑隐藏 → 首页切换组织 → 重开仍显示旧组织」
          //（appId 锁定态下 CHANGE_CURRENT_PROJECT 监听未注册，selectedProjectId 停在挂载初值，故隐藏期间的切换收不到）。
          if (!appId) {
            const latest = localStorage.getItem('currentProjectId');
            if (latest) setSelectedProjectId(prev => (prev === latest ? prev : latest));
          }
        }),
      { threshold: 0.01 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [appId]);

  // 点击"试一试"：第 1 条（mention）聚焦并呼出 @ 浮层；下面两条（搭建示例 / 推荐问题）直接提交消息
  function handleTrySelect(sample) {
    if (sample.type === 'mention') {
      promptInputRef.current?.insertAt();
      return;
    }

    startAgentChat(sample.text);
  }

  return (
    <MingoWelcomeWrap className={cx({ landing, embed })}>
      <div className="inner">
        <div className="topBlock" ref={welcomeBlockRef}>
          {/* 落地页用静态 logo + 整体垂直居中；抽屉态保持原欢迎动图 */}
          {landing ? (
            <img className="welcomeLogo" src={mingoLogo} alt="mingo" />
          ) : (
            <img key={gifNonce} className="welcomeGif" src={mingoWelcomeGif} alt="" />
          )}
        </div>

        {/* 嵌入态（?embed=1）不展示组织名 / 网络切换 */}
        {embed ? null : canSwitchProject ? (
          <ProjectSwitch value={currentProjectId} onChange={setSelectedProjectId}>
            <div className="subline switchable">
              {currentProjectName}
              <i className="icon icon-arrow-down-border switchArrow" />
            </div>
          </ProjectSwitch>
        ) : (
          <div className="subline">{sublineText}</div>
        )}

        <PromptInput
          ref={promptInputRef}
          value={draft}
          projectId={currentProjectId}
          onChange={setDraft}
          onSubmit={handleSubmit}
          // 嵌入态（?embed=1）不提供 @ 应用：隐藏 @ 按钮 + 禁用 @ 浮层，placeholder 也去掉「@应用提问」
          enableMention={!embed}
          placeholder={
            inApp
              ? _l('对当前应用提问或继续搭建')
              : embed
                ? _l('提问或开始搭建一个新应用')
                : _l('@应用提问或开始搭建一个新应用')
          }
          inputId={PROMPT_INPUT_ID}
          attachments={
            draftAttachments.length ? (
              <AddedFiles
                files={draftAttachments}
                onRemove={id => setDraftAttachments(prev => prev.filter(f => f.id !== id))}
              />
            ) : null
          }
          attachmentSlot={
            <UploadFiles
              tokenType={ATTACHMENT_TOKEN_TYPE}
              maxFilesLength={MAX_ATTACHMENTS}
              existingFiles={draftAttachments}
              allowMimeTypes={AGENT_ATTACHMENT_MIME_TYPES}
              dropElementId={PROMPT_INPUT_ID}
              onAdd={(up, files) => {
                setDraftAttachments(prev => [
                  ...prev,
                  ...files.map(f => ({
                    id: f.id,
                    size: f.size,
                    type: f.type,
                    name: f.name,
                    status: 'added',
                    file: f,
                  })),
                ]);
                // 选完文件把焦点交回输入框，便于继续输入
                setTimeout(() => promptInputRef.current && promptInputRef.current.focus(), 0);
              }}
              onUploadProgress={(up, file) => {
                const progress = ((file.loaded / file.size) * 100).toFixed(0);

                setDraftAttachments(prev =>
                  prev.map(f => (f.id === file.id ? { ...f, status: 'uploading', file, progress } : f)),
                );
              }}
              onUploaded={(up, file, response) => {
                const commonAttachment = formatResponseData(file, response);

                setDraftAttachments(prev =>
                  prev.map(f =>
                    f.id === file.id ? { ...f, status: 'uploaded', file, commonAttachment, url: file.url } : f,
                  ),
                );
              }}
              onError={file => {
                setDraftAttachments(prev => prev.map(f => (f.id === file?.id ? { ...f, status: 'error' } : f)));
              }}
              removeFile={file => {
                setDraftAttachments(prev => prev.filter(f => f.id !== file.id));
              }}
            >
              <BgIconButton
                style={{ borderRadius: '8px', padding: '6px' }}
                icon="attachment"
                tooltip={<AttachmentTooltip max={MAX_ATTACHMENTS} />}
                popupPlacement="top"
                onClick={() => {}}
              />
            </UploadFiles>
          }
        />

        {inApp ? (
          <>
            <div className="welcomeTabsRow">
              <div className="welcomeTabs">
                <div className={cx('welcomeTab', { active: activeTab === 'ask' })} onClick={() => setActiveTab('ask')}>
                  {_l('提问')}
                </div>
                <div
                  className={cx('welcomeTab', { active: activeTab === 'build' })}
                  onClick={() => setActiveTab('build')}
                >
                  {_l('搭建')}
                </div>
              </div>
              {activeTab === 'ask' && (
                <Icon
                  icon="refresh1"
                  className="textTertiary Font18 pointer mLeft10"
                  onClick={() => {
                    if (questionStatus === 'loading') return;
                    loadQuestions({ isReload: true });
                  }}
                />
              )}
            </div>
            <div className="welcomeTabBody">
              {activeTab === 'ask' ? (
                <div className="tryList">
                  {questions.map((q, i) => (
                    <div className="tryItem questionItem" key={i} onClick={() => startAgentChat(q)}>
                      {q}
                    </div>
                  ))}
                  {questionStatus === 'loading' && !questions.length && (
                    <Skeleton
                      active
                      className="mTop10"
                      height="16px"
                      itemStyle={{ margin: '12px 0' }}
                      widths={['70%', '90%', '60%', '85%', '55%']}
                    />
                  )}
                  {questionStatus === 'error' && !questions.length && (
                    <div className="qEmpty">{_l('推荐问题加载失败')}</div>
                  )}
                  {questionStatus === 'done' && !questions.length && <div className="qEmpty">{_l('暂无推荐问题')}</div>}
                </div>
              ) : (
                <div className="quickActions">
                  {visibleQuickActions.length ? (
                    visibleQuickActions.map(action => (
                      <div className="quickAction" key={action.type} onMouseDown={() => handleQuickAction(action)}>
                        <div className="qaIcon">
                          <img src={action.icon} alt="" />
                        </div>
                        <div className="qaName">{action.name}</div>
                      </div>
                    ))
                  ) : (
                    <div className="qEmpty">{_l('暂无可用操作')}</div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="sectionLabel">{_l('试一试')}</div>
            <div className="tryList">
              {buildStatus === 'loading'
                ? [0, 1, 2].map(i => (
                    <div className="tryItem trySkeleton" key={i}>
                      <Skeleton active widths={['62%']} height="16px" />
                    </div>
                  ))
                : trySamples.map((sample, i) => (
                    <div className="tryItem" key={i} onClick={() => handleTrySelect(sample)}>
                      {sample.text}
                      {sample.isNew && <span className="newBadge">{_l('新！')}</span>}
                    </div>
                  ))}
            </div>
          </>
        )}
      </div>

      {historyVisible && (
        <SessionHistory onSelect={handleSelectHistorySession} onClose={() => setHistoryVisible(false)} />
      )}
    </MingoWelcomeWrap>
  );
}

MingoWelcome.propTypes = {
  onStartTask: PropTypes.func.isRequired,
  // 落地页模式：静态 logo 替代欢迎动图 + 整体垂直居中
  landing: PropTypes.bool,
  // 嵌入态（?embed=1）：落地页被外部 iframe 嵌入时收敛展示（welcomeLogo 限高 60）
  embed: PropTypes.bool,
};
