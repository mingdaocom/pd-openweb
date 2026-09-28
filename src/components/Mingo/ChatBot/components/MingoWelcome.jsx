import React, { useEffect, useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { BgIconButton, Icon } from 'ming-ui';
import { Skeleton } from 'ming-ui/antd-components';
import { useGlobalStore } from 'src/common/providers/GlobalStore';
import {
  AGENT_ATTACHMENT_MIME_TYPES,
  AGENT_HEADER_EVENT,
  createAgentSessionId,
  getCompletedText,
  HELP_AGENT_NAME,
  mapAttachmentForRequest,
  requestAgentStream,
} from 'src/components/Agent/agentService';
import { getCurrentAppId } from 'src/components/Agent/buildContext';
import { AttachmentTooltip, ProjectSwitch, PromptInput, SessionHistory } from 'src/components/Agent/ui';
import { HelpComposerBar, openCustomerService } from 'src/components/Agent/ui/TransferHuman';
import AddedFiles from 'src/components/Mingo/ChatBot/components/AddedFiles';
import { useDailyBuildSuggestions } from 'src/components/Mingo/ChatBot/components/buildRecommender';
import { BUILD_SAMPLES, pickRandom, pickRandomSamples } from 'src/components/Mingo/ChatBot/components/buildSamples';
import { buildRecommenderMessage, parseQuestions } from 'src/components/Mingo/ChatBot/components/questionRecommender';
import { TRY_TRY_LIST } from 'src/components/Mingo/ChatBot/components/tryTryList';
import UploadFiles from 'src/components/Mingo/ChatBot/components/UploadFiles';
import {
  canBuildAppWithMingo,
  canQueryDataWithMingo,
  canUseMingoOtherAssistant,
  getDefaultMingoProjectId,
  getMingoDisabledTip,
  isProjectMingoEnabled,
} from 'src/components/Mingo/permission';
import mingoLogo from 'src/pages/mingo/common/images/mingo-logo.png';
import { getUserRole } from 'src/utils/domain/permission/app';
import { canEditApp } from 'src/utils/domain/permission/app';
import { emitter } from 'src/utils/platform/browser/dom';
import { formatResponseData } from 'src/utils/platform/file/attachment';
import { getCurrentProject } from 'src/utils/services/project';
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
  /* 帮助中心（智能客服）：整体垂直居中，静态 wordmark 高 80 */
  &.helpMode {
    justify-content: center;
    .welcomeLogo {
      height: 80px;
      margin-bottom: 100px;
    }
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
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    color: var(--color-text-secondary);
    margin: 40px 0 6px;
    .icon-refresh1 {
      &:hover {
        color: var(--color-link-hover) !important;
      }
    }
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
  }
  /* 搭建推荐加载中：3 条一起占位，复用 tryItem 行高，去掉骨架默认内边距 / 底色 */
  .tryItem.trySkeleton {
    cursor: default;
    &:hover {
      background: transparent;
    }
    .hap-skeleton {
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
// 1) @ 一个应用开始提问 → 聚焦输入框并呼出 @ 浮层
// 2) 随机一条搭建提示 → 聚焦并填入
// 3) 随机一条 TryTry 问题 → 聚焦并填入
// 嵌入态（embed）：@ mention 呼出应用选择浮层在 iframe 内不适用，整列统一为最后一类（TryTry 推荐问题，
// type=fill 点击直接发起对话），去掉 @ 与搭建样例，取 3 条不重复。
// helpOnly：帮助模式整列固定为 TryTry 推荐问题（不含 @ 应用 / 搭建样例）
// allowDataQuery / allowBuild：组织级 MingoAI 开关，关掉后对应的 @ 提问、搭建样例不再出现
function buildTrySamples(helpOnly, { allowDataQuery = true, allowBuild = true } = {}) {
  if (helpOnly) {
    return pickRandomSamples(3, TRY_TRY_LIST).map(item => ({
      type: 'fill',
      text: (item || {}).text || '',
    }));
  }
  return [
    allowDataQuery && {
      type: 'mention',
      text: _l('@ 一个应用开始提问'),
    },
    allowBuild && {
      type: 'fill',
      kind: 'build',
      text: pickRandom(BUILD_SAMPLES),
    },
    {
      type: 'fill',
      text: (pickRandom(TRY_TRY_LIST) || {}).text || '',
    },
  ].filter(Boolean);
}

// 组织切换下拉：已禁用 MingoAI 的组织置灰并给出原因
function getProjectDisabledTip(project) {
  return isProjectMingoEnabled(get(project, 'projectId')) ? '' : getMingoDisabledTip();
}

// 输入框 placeholder 随组织可用能力变化：关掉数据查询就不再提「提问」，关掉搭建就不再提「搭建」
function getPromptPlaceholder({ helpMode, inApp, allowDataQuery, allowBuild, allowOtherAssistant }) {
  if (helpMode) return _l('有什么可以帮助您');

  if (inApp) {
    if (allowDataQuery && allowOtherAssistant) return _l('对当前应用提问或继续搭建');
    if (allowDataQuery) return _l('对当前应用提问');
    if (allowOtherAssistant) return _l('对当前应用继续搭建');
    return _l('有什么可以帮助您');
  }

  if (allowDataQuery && allowBuild) return _l('@应用提问或开始搭建一个新应用');
  if (allowDataQuery) return _l('@应用提问');
  if (allowBuild) return _l('开始搭建一个新应用');
  return _l('有什么可以帮助您');
}
function checkIsCharge(appInfo) {
  const { permissionType, isLock } = appInfo;
  return canEditApp(permissionType, isLock);
}
export default function MingoWelcome({
  onStartTask = () => {},
  landing = false,
  helpMode = false,
  anonymous = false,
  enableHumanSupport = true,
}) {
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
  // 欢迎动图重播：Mingo 抽屉 destroyOnHidden=false，关闭不销毁、重开不会重渲染，play-once gif 会停在末帧。
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
  const contextProjectId =
    appInfo?.projectId || localStorage.getItem('currentProjectId') || get(projects, '[0].projectId', '');
  // 应用内锁定应用所属组织；非应用内（首页等）默认落到一个仍开放 MingoAI 的组织
  const initialProjectId = appId ? contextProjectId : getDefaultMingoProjectId(contextProjectId);
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId);
  // 应用内锁定 appInfo.projectId；非应用走用户切换的 selectedProjectId
  const currentProjectId = appId ? appInfo?.projectId || initialProjectId : selectedProjectId;
  const currentProjectName = getCurrentProject(currentProjectId).companyName || '';
  const canSwitchProject = !appId && projects.length > 1;
  // 当前组织的 MingoAI 能力：搭建应用 / 数据查询与分析 / 应用内其它辅助
  const allowBuild = canBuildAppWithMingo(currentProjectId);
  const allowDataQuery = canQueryDataWithMingo(currentProjectId);
  const allowOtherAssistant = canUseMingoOtherAssistant(currentProjectId);
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
  // 应用内才出现「提问/搭建」tab；appInfo 需已是当前应用的数据（sections 等就绪）才发起推荐。
  // 帮助模式（智能客服）只答帮助中心问题，即使在应用内打开也不走应用上下文形态
  const inApp = !helpMode && !!appId;
  const appReady = appInfo?.id === appId;
  // 组织关掉数据查询 / 应用内其它辅助时，对应的「提问」「搭建」tab 不再出现；
  // activeTab 相应落到仍可用的那个，两个都关掉则整块 tab 区域不渲染
  const activeTabKey = allowDataQuery ? (allowOtherAssistant ? activeTab : 'ask') : 'build';
  const tabsVisible = inApp && (allowDataQuery || allowOtherAssistant);

  // 拉取并流式渲染推荐问题：按 appInfo 组 message 调 app-question-recommender，
  // 累积 text-delta（纯文本、每行一个问题）实时解析成列表；completed 兜底取整段文本。
  async function loadQuestions({ isReload = false } = {}) {
    if (!appId) return;
    questionAbortRef.current?.abort();
    const controller = new AbortController();
    questionAbortRef.current = controller;
    setQuestionStatus('loading');
    setQuestions([]);
    const message = buildRecommenderMessage({
      appInfo,
    });
    let acc = '';
    try {
      await requestAgentStream(
        {
          sessionId: createAgentSessionId(),
          agentName: QUESTION_RECOMMENDER_AGENT,
          message,
          forceRefresh: isReload,
          // 注入当前语言，让 agent 按用户语言生成推荐
          context: {
            language: getCurrentLang(),
          },
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
    if (!inApp || !appReady || !allowDataQuery) {
      questionAbortRef.current?.abort();
      setQuestions([]);
      setQuestionStatus('idle');
      return;
    }
    loadQuestions();
    return () => questionAbortRef.current?.abort();
  }, [appId, appReady, allowDataQuery]);
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
    // 帮助模式的首条提问进帮助会话（钉 help-agent），不走通用 Agent 自动路由
    dispatchTask({ type: helpMode ? MINGO_TASK_TYPE.MINGDAO_HELP_CHAT : MINGO_TASK_TYPE.CREATE_APP_ASSIGNMENT });
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
      // 外部切到已禁用 MingoAI 的组织时不跟随，仍停留在可用组织上
      if (pid) setSelectedProjectId(getDefaultMingoProjectId(pid));
    };
    emitter.on('CHANGE_CURRENT_PROJECT', onChangeProject);
    return () => emitter.off('CHANGE_CURRENT_PROJECT', onChangeProject);
  }, [appId]);

  // 选择历史会话：把会话 id 交给 Agent，由 Agent 在 mount 时加载并恢复对话
  function handleSelectHistorySession(session) {
    if (!session || !session.sessionId) return;
    setHistoryVisible(false);
    window.mingoInitialSessionId = session.sessionId;
    dispatchTask({ type: helpMode ? MINGO_TASK_TYPE.MINGDAO_HELP_CHAT : MINGO_TASK_TYPE.CREATE_APP_ASSIGNMENT });
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
  // 帮助模式不取搭建推荐（projectId 传空跳过请求），整列固定为 TryTry 推荐问题
  // 组织关掉搭建能力时不再拉搭建推荐（projectId 传空跳过请求）
  const {
    nextSuggestion: buildReco,
    status: buildStatus,
    reload: reloadBuildSuggestions,
  } = useDailyBuildSuggestions(inApp || helpMode || !allowBuild ? '' : currentProjectId);
  // 非应用内"试一试"固定 3 项：mention / 搭建样例 / TryTry（嵌入态为 3 条 TryTry），随机项只在挂载时定一次。
  const baseTrySamples = useMemo(
    () => buildTrySamples(helpMode, { allowDataQuery, allowBuild }),
    [helpMode, allowDataQuery, allowBuild],
  );
  // 「搭建样例」那条推荐就绪后替换为顺延的个性化推荐；mention / TryTry 始终稳定不重随机。
  // 加载态在渲染处整列用骨架占位（3 条一起），不在此处理。
  const trySamples = useMemo(() => {
    // 帮助模式：整列已是 TryTry 推荐问题，不套用 buildReco 搭建推荐
    if (helpMode) return baseTrySamples;
    if (!buildReco) return baseTrySamples;
    return baseTrySamples.map(sample => (sample.kind === 'build' ? { ...sample, text: buildReco } : sample));
  }, [baseTrySamples, buildReco, helpMode]);

  // welcome 每次重新可见时给 gif 换 key 从头重播（抽屉 destroyOnHidden=false，重开不重挂载会停在末帧）。
  // 搭建推荐的顺延由组件重新挂载时的 hook load 驱动，无需在此处理。
  useEffect(() => {
    const el = welcomeBlockRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(
      entries =>
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          setGifNonce(n => n + 1);
          // 抽屉 destroyOnHidden=false，重开不重挂载：每次重新可见时按全局 currentProjectId 兜底纠正选中组织，
          // 修复「应用内打开 Mingo → 侧滑隐藏 → 首页切换组织 → 重开仍显示旧组织」
          //（appId 锁定态下 CHANGE_CURRENT_PROJECT 监听未注册，selectedProjectId 停在挂载初值，故隐藏期间的切换收不到）。
          if (!appId) {
            const latest = getDefaultMingoProjectId(localStorage.getItem('currentProjectId'));
            if (latest) setSelectedProjectId(prev => (prev === latest ? prev : latest));
          }
        }),
      {
        threshold: 0.01,
      },
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
    <MingoWelcomeWrap className={cx({ landing, helpMode })}>
      <div className="inner">
        <div className="topBlock" ref={welcomeBlockRef}>
          {/* 落地页 / 帮助模式用静态 logo；抽屉通用态保持原欢迎动图。
              配置了 AI 品牌图标时，欢迎动图属 Mingo 专属素材，抽屉态同样降级成静态品牌 logo */}
          {landing || helpMode || md.global.SysSettings.aiBrandLogoUrl ? (
            <img className="welcomeLogo" src={md.global.SysSettings.aiBrandLogoUrl || mingoLogo} alt="mingo" />
          ) : (
            <img key={gifNonce} className="welcomeGif" src={mingoWelcomeGif} alt="" />
          )}
        </div>

        {/* 帮助模式不展示组织名 / 网络切换 */}
        {helpMode ? null : canSwitchProject ? (
          <ProjectSwitch
            value={currentProjectId}
            onChange={setSelectedProjectId}
            getDisabledTip={getProjectDisabledTip}
          >
            <div className="subline switchable">
              {currentProjectName}
              <i className="icon icon-arrow-down-border switchArrow" />
            </div>
          </ProjectSwitch>
        ) : (
          <div className="subline">{sublineText}</div>
        )}

        {/* 帮助模式：输入框上方常驻「帮助文档 + 转人工客服」栏；首页尚无会话可分享，转人工直接打开客服窗口。
            对外嵌入的匿名帮助页不提供该栏（enableHumanSupport=false） */}
        {helpMode && enableHumanSupport && <HelpComposerBar onTransfer={openCustomerService} />}
        <PromptInput
          ref={promptInputRef}
          value={draft}
          projectId={currentProjectId}
          onChange={setDraft}
          onSubmit={handleSubmit}
          // 帮助模式不提供 @ 应用：隐藏 @ 按钮 + 禁用 @ 浮层，placeholder 也去掉「@应用提问」；
          // 组织关掉数据查询与分析时同样不提供 @ 应用提问
          enableMention={!helpMode && allowDataQuery}
          placeholder={getPromptPlaceholder({
            helpMode,
            inApp,
            allowDataQuery,
            allowBuild,
            allowOtherAssistant,
          })}
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
            // 智能客服（helpMode）不支持附件输入，整体关掉上传入口；
            // UploadFiles 走登录态 token；匿名访客（对外嵌入的帮助页）无上传契约，不提供附件入口
            helpMode || anonymous ? null : (
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
                    prev.map(f =>
                      f.id === file.id
                        ? {
                            ...f,
                            status: 'uploading',
                            file,
                            progress,
                          }
                        : f,
                    ),
                  );
                }}
                onUploaded={(up, file, response) => {
                  const commonAttachment = formatResponseData(file, response);
                  setDraftAttachments(prev =>
                    prev.map(f =>
                      f.id === file.id
                        ? {
                            ...f,
                            status: 'uploaded',
                            file,
                            commonAttachment,
                            url: file.url,
                          }
                        : f,
                    ),
                  );
                }}
                onError={file => {
                  setDraftAttachments(prev =>
                    prev.map(f =>
                      f.id === file?.id
                        ? {
                            ...f,
                            status: 'error',
                          }
                        : f,
                    ),
                  );
                }}
                removeFile={file => {
                  setDraftAttachments(prev => prev.filter(f => f.id !== file.id));
                }}
              >
                <BgIconButton
                  style={{
                    borderRadius: '8px',
                    padding: '6px',
                  }}
                  icon="attachment"
                  tooltip={<AttachmentTooltip max={MAX_ATTACHMENTS} />}
                  popupPlacement="top"
                  onClick={() => {}}
                />
              </UploadFiles>
            )
          }
        />

        {inApp ? (
          tabsVisible && (
            <>
              <div className="welcomeTabsRow">
                <div className="welcomeTabs">
                  {allowDataQuery && (
                    <div
                      className={cx('welcomeTab', {
                        active: activeTabKey === 'ask',
                      })}
                      onClick={() => setActiveTab('ask')}
                    >
                      {_l('提问')}
                    </div>
                  )}
                  {allowOtherAssistant && (
                    <div
                      className={cx('welcomeTab', {
                        active: activeTabKey === 'build',
                      })}
                      onClick={() => setActiveTab('build')}
                    >
                      {_l('搭建')}
                    </div>
                  )}
                </div>
                {activeTabKey === 'ask' && (
                  <Icon
                    icon="refresh1"
                    className="textTertiary Font18 pointer mLeft10"
                    onClick={() => {
                      if (questionStatus === 'loading') return;
                      loadQuestions({
                        isReload: true,
                      });
                    }}
                  />
                )}
              </div>
              <div className="welcomeTabBody">
                {activeTabKey === 'ask' ? (
                  <div className="tryList">
                    {questions.map((q, i) => (
                      <div className="tryItem questionItem" key={i} onClick={() => startAgentChat(q)}>
                        {q}
                      </div>
                    ))}
                    {questionStatus === 'loading' && !questions.length && (
                      <Skeleton
                        active
                        className="mTop10 pAll20"
                        paragraph={{
                          rows: 5,
                          width: ['70%', '90%', '60%', '85%', '55%'],
                        }}
                      />
                    )}
                    {questionStatus === 'error' && !questions.length && (
                      <div className="qEmpty">{_l('推荐问题加载失败')}</div>
                    )}
                    {questionStatus === 'done' && !questions.length && (
                      <div className="qEmpty">{_l('暂无推荐问题')}</div>
                    )}
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
          )
        ) : (
          <>
            <div className="sectionLabel">
              <span>{_l('试一试')}</span>
              {/* 刷新：丢掉搭建推荐的缓存重新拉一组。帮助模式整列是固定推荐问题、
                  组织关掉搭建能力时不拉推荐，两种情况都不给刷新入口 */}
              {!helpMode && allowBuild && (
                <Icon
                  icon="refresh1"
                  className="textTertiary Font18 pointer mLeft10"
                  onClick={() => {
                    if (buildStatus === 'loading') return;
                    reloadBuildSuggestions();
                  }}
                />
              )}
            </div>
            <div className="tryList">
              {buildStatus === 'loading'
                ? [0, 1, 2].map(i => (
                    <div className="tryItem trySkeleton" key={i}>
                      <Skeleton
                        className="pAll20"
                        active
                        paragraph={{
                          rows: 1,
                          width: ['62%'],
                        }}
                      />
                    </div>
                  ))
                : trySamples.map((sample, i) => (
                    <div className="tryItem" key={i} onClick={() => handleTrySelect(sample)}>
                      {sample.text}
                    </div>
                  ))}
            </div>
          </>
        )}
      </div>

      {historyVisible && (
        <SessionHistory
          agentName={helpMode ? HELP_AGENT_NAME : ''}
          onSelect={handleSelectHistorySession}
          onClose={() => setHistoryVisible(false)}
        />
      )}
    </MingoWelcomeWrap>
  );
}
MingoWelcome.propTypes = {
  onStartTask: PropTypes.func.isRequired,
  // 落地页模式：静态 logo 替代欢迎动图 + 整体垂直居中
  landing: PropTypes.bool,
  // 帮助中心（智能客服）首页：TryTry 固定为帮助问题、隐藏组织切换与 @ 应用，提交进帮助会话（help-agent）
  helpMode: PropTypes.bool,
  // 匿名访客（对外嵌入的帮助页）：无登录态上传契约，不提供附件入口
  anonymous: PropTypes.bool,
  // 帮助态是否提供「帮助文档 + 转人工客服」栏
  enableHumanSupport: PropTypes.bool,
};
