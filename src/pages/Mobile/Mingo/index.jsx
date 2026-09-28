import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActionSheet } from 'antd-mobile';
import { get, sampleSize } from 'lodash';
import { Icon, LoadDiv } from 'ming-ui';
import { AgentBusProvider } from 'src/components/Agent/agentBus';
import { HELP_AGENT_NAME, mapAttachmentForRequest } from 'src/components/Agent/agentService';
import { claimAnonymousSession, peekAnonHandoff } from 'src/components/Agent/anonymous';
import ChatPanel from 'src/components/Agent/ChatPanel';
import { readField, stringValue } from 'src/components/Agent/valueUtils';
import { useDailyBuildSuggestions } from 'src/components/Mingo/ChatBot/components/buildRecommender';
import { TRY_TRY_LIST } from 'src/components/Mingo/ChatBot/components/tryTryList';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import { compatibleMDJS } from 'src/utils/services/project';
import Header from './components/Header';
import MobileMingoPromptInput from './components/MobileMingoPromptInput';
import OverviewPopup, { OverviewController } from './components/OverviewPopup';
import SessionHistory from './components/SessionHistory';
import Welcome from './components/Welcome';
import Wrapper, { AiGeneratedNotice, MobileMingoGlobalStyle } from './core/style';
import {
  getDefaultProject,
  getEntryHandoffKey,
  getInitialSessionId,
  isAnonymousCreateAppRoute,
  isCreateAppRoute,
  isEntryCreateAppRoute,
  isHelpRoute,
  pickRandom,
  syncMingoProjectFromUrl,
} from './core/utils';

function clearInitialPayload() {
  delete window.mingoInitialMessage;
  delete window.mingoInitialAttachments;
  delete window.mingoInitialMentions;
  delete window.mingoInitialGroupId;
  delete window.mingoInitialSessionId;
  delete window.mingoInitialHandoffKey;
}

function setInitialSessionId(sessionId) {
  window.mingoInitialSessionId = sessionId;
}

function setInitialPromptPayload({ text, attachments, mentions, handoffKey }) {
  window.mingoInitialMessage = text;
  if (attachments && attachments.length) window.mingoInitialAttachments = attachments;
  if (Array.isArray(mentions) && mentions.length) window.mingoInitialMentions = mentions;
  if (handoffKey) window.mingoInitialHandoffKey = handoffKey;
}

function getCreatableProjects() {
  const projects = get(md, 'global.Account.projects', []) || [];

  return projects.filter(item => !item.cannotCreateApp);
}

function replaceCreateAppRoute(sessionId) {
  if (!sessionId || !window.history || !window.history.replaceState) return;
  window.history.replaceState(
    null,
    document.title,
    pathCompletion(`/mobile/mingo/create-app/${encodeURIComponent(sessionId)}`, { hasDomain: false }),
  );
}

function isWideHistoryLayout() {
  return typeof window !== 'undefined' && window.matchMedia('(min-width: 701px)').matches;
}

export default function Mingo() {
  const promptInputRef = useRef(null);
  const overviewFilesRef = useRef({});
  const anonymousProjectSheetOpenedRef = useRef(false);
  // 帮助（智能客服）异化形态：/embed/mingo/help，供 native 客户端内嵌。与搭建态互斥。
  // 钉 help-agent、无组织切换 / 无搭建推荐 / 无总览、无附件与分享，输入框上方提供「帮助文档 + 人工客服」。
  // 与站内帮助抽屉（components/Mingo/HelpAgentChat）的差别：那边是按人记录会话 id 的单会话续接，
  // 这里每次进入都是新对话——不带 initialSessionId（由 ChatPanel 自生成会话 id）、永远先落帮助首页，
  // 且 rememberHelpSession=false 不参与本地会话记录，避免污染站内抽屉的进面板分流。
  const helpMode = isHelpRoute();
  const isBuildAppMode = !helpMode && isCreateAppRoute();
  const [initialRoute] = useState(() => ({
    sessionId: helpMode ? '' : getInitialSessionId(),
    isAnonymousSession: isAnonymousCreateAppRoute(),
    isEntrySession: isEntryCreateAppRoute(),
    entryHandoffKey: getEntryHandoffKey(),
  }));
  const { sessionId: routeSessionId, isAnonymousSession, isEntrySession, entryHandoffKey } = initialRoute;
  const initialSessionId = isAnonymousSession || isEntrySession ? '' : routeSessionId;
  const [initialSessionAutoOpenOverview, setInitialSessionAutoOpenOverview] = useState(!!initialSessionId);
  const [initialBuildSamples] = useState(() => {
    return {
      // 试一试第三条 TryTry：随机取一条（挂载内稳定，与桌面一致）
      tryQuestion: get(pickRandom(TRY_TRY_LIST), 'text') || get(TRY_TRY_LIST, '[0].text'),
      // 帮助态整列都是 TryTry 帮助问题：随机取 3 条不重复（对齐桌面帮助模式 buildTrySamples）
      helpQuestions: sampleSize(TRY_TRY_LIST, 3).map(item => get(item, 'text') || ''),
    };
  });
  const [project, setProject] = useState(() => {
    syncMingoProjectFromUrl();
    return getDefaultProject();
  });
  // 个性化「待搭建应用」推荐：nextSuggestion 顺延 1 条（welcome 单条）、randomSamples 返回全量推荐（搭建态取前 3）；
  // 就绪前由 Welcome 骨架占位（不再回退静态样例以免闪动）；仅内存缓存（刷新页面才重拉），移动端与桌面同源。
  // 帮助态不取搭建推荐（projectId 传空即跳过请求），首页整列固定为帮助问题
  const { nextSuggestion: buildReco, randomSamples: buildRandomSamples } = useDailyBuildSuggestions(
    helpMode ? '' : project.projectId,
  );
  const [draft, setDraft] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [wideHistoryLayout, setWideHistoryLayout] = useState(isWideHistoryLayout);
  const [activeHistorySessionId, setActiveHistorySessionId] = useState(initialSessionId);
  const [isChatting, setIsChatting] = useState(() => {
    // 帮助态每次进入（含刷新）都是新对话：永远先落帮助首页
    if (helpMode) return false;
    if (isAnonymousSession) return true;
    if (isEntrySession) return true;
    if (initialSessionId) {
      setInitialSessionId(initialSessionId);
      return true;
    }

    return false;
  });
  const [bootstrappingSession, setBootstrappingSession] = useState(() => isAnonymousSession || isEntrySession);
  const [anonymousProjectId, setAnonymousProjectId] = useState('');
  const [entrySessionId, setEntrySessionId] = useState('');
  const [agentKey, setAgentKey] = useState(0);
  const [overviewVisible, setOverviewVisible] = useState(false);
  const [overviewContent, setOverviewContent] = useState('');
  const [overviewReady, setOverviewReady] = useState(false);
  const [overviewGenerating, setOverviewGenerating] = useState(false);
  const [overviewFilesVersion, setOverviewFilesVersion] = useState(0);
  const [safeAreaBottom, setSafeAreaBottom] = useState(0);
  const handleOverviewFilesChange = useCallback(() => {
    setOverviewFilesVersion(version => version + 1);
  }, []);

  const syncLastMingoId = useCallback(
    mingoId => {
      if (!window.isMingDaoApp || helpMode || isBuildAppMode) return;
      compatibleMDJS('updateLastMingoId', { mingoId: mingoId || '' });
    },
    [helpMode, isBuildAppMode],
  );

  // 帮助态每次进入都是新对话：清掉可能由别处（如 /mobile/mingo）遗留、尚未被 Agent 消费的交接载荷，
  // 避免首次进对话时被恢复成旧会话。此时还在帮助首页，ChatPanel 尚未挂载，清理不会打断在途交接。
  useEffect(() => {
    if (helpMode) clearInitialPayload();
  }, [helpMode]);

  useEffect(() => {
    document.documentElement.classList.add('mobileMingoPage');
    document.body.classList.add('mobileMingoPage');

    return () => {
      document.documentElement.classList.remove('mobileMingoPage');
      document.body.classList.remove('mobileMingoPage');
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    compatibleMDJS('getSafeAreaInsets', {
      success: res => {
        if (!mounted) return;
        const bottom = Number(res?.bottom);
        setSafeAreaBottom(Number.isFinite(bottom) ? Math.max(bottom, 0) : 0);
      },
      fail: () => {
        if (mounted) setSafeAreaBottom(0);
      },
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;

    const media = window.matchMedia('(min-width: 701px)');

    const handleChange = e => {
      setWideHistoryLayout(e.matches);
      if (e.matches) setHistoryVisible(false);
    };

    handleChange(media);
    if (media.addEventListener) {
      media.addEventListener('change', handleChange);
      return () => media.removeEventListener('change', handleChange);
    }

    media.addListener(handleChange);
    return () => media.removeListener(handleChange);
  }, []);

  const selectProject = useCallback(selectedProject => {
    const projectId = get(selectedProject, 'projectId');

    if (!projectId) return '';
    safeLocalStorageSetItem('currentProjectId', projectId);
    setProject(selectedProject);
    return projectId;
  }, []);

  const handleProjectSelectorOpen = useCallback(() => {
    if (!window.isMingDaoApp || !window.MDJS?.chooseProject) return true;

    compatibleMDJS('chooseProject', {
      current: project.projectId,
      success: res => {
        const projectId = get(res, 'projectId');
        if (!projectId) return;

        const projects = get(md, 'global.Account.projects', []) || [];
        const selectedProject = projects.find(item => item.projectId === projectId) || {
          projectId,
          companyName: get(res, 'projectName', ''),
        };

        selectProject(selectedProject);
      },
      cancel: () => {},
    });

    return false;
  }, [project.projectId, selectProject]);

  const showProjectSheet = useCallback(
    ({ projects: sheetProjects, title, onSelect, onClose } = {}) => {
      let actionSheetHandler;
      let selected = false;
      const projects = sheetProjects || get(md, 'global.Account.projects', []) || [];

      const cancelSheet = () => {
        if (!selected && onClose) {
          selected = true;
          onClose();
        }

        actionSheetHandler.close();
      };

      actionSheetHandler = ActionSheet.show({
        popupClassName: 'selectProjectWrap',
        closeOnMaskClick: !onClose,
        actions: projects.map(item => ({
          key: item.projectId,
          project: item,
          text: <span className="flex Bold ellipsis">{item.companyName}</span>,
        })),
        extra: (
          <div className="flexRow header">
            <span className="Font13">{title || _l('切换组织')}</span>
            <div className="closeIcon" onClick={cancelSheet}>
              <Icon icon="close" />
            </div>
          </div>
        ),
        onAction: action => {
          selected = true;
          selectProject(action.project);
          actionSheetHandler.close();
          if (onSelect) onSelect(action.project);
        },
        afterClose: () => {
          if (!selected && onClose) onClose();
        },
      });

      return actionSheetHandler;
    },
    [selectProject],
  );

  useEffect(() => {
    if (!isAnonymousSession) return undefined;

    let mounted = true;

    if (anonymousProjectSheetOpenedRef.current) return undefined;
    anonymousProjectSheetOpenedRef.current = true;

    const anonSessionId = routeSessionId;
    let actionSheetHandler;

    const claimSession = async selectedProject => {
      const projectId = get(selectedProject, 'projectId');

      try {
        if (!anonSessionId || !projectId) throw new Error('missing anonymous session or project');

        selectProject(selectedProject);
        setAnonymousProjectId(projectId);
        const res = await claimAnonymousSession({ sessionId: anonSessionId, projectId });
        const claimedSessionId = stringValue(readField(res, 'sessionId')) || anonSessionId;

        setInitialSessionAutoOpenOverview(true);
        setInitialSessionId(claimedSessionId);
        replaceCreateAppRoute(claimedSessionId);
      } catch (err) {
        console.error('[mobile-mingo] claim anonymous session failed, fallback to session restore', err);
        if (anonSessionId) {
          setInitialSessionAutoOpenOverview(true);
          setInitialSessionId(anonSessionId);
        }
      } finally {
        if (mounted) setBootstrappingSession(false);
      }
    };

    const timer = setTimeout(() => {
      const creatableProjects = getCreatableProjects();

      if (!anonSessionId) {
        setBootstrappingSession(false);
        setIsChatting(false);
        return;
      }

      if (!creatableProjects.length) {
        alert(_l('您当前所在的组织均没有创建应用的权限，请联系组织管理员。'), 2);
        setBootstrappingSession(false);
        setIsChatting(false);
        return;
      }

      if (creatableProjects.length === 1) {
        claimSession(creatableProjects[0]);
        return;
      }

      actionSheetHandler = showProjectSheet({
        projects: creatableProjects,
        title: _l('选择组织'),
        onSelect: claimSession,
        onClose: () => {
          if (!mounted) return;
          setBootstrappingSession(false);
          setIsChatting(false);
        },
      });
    }, 0);

    return () => {
      mounted = false;
      clearTimeout(timer);
      if (actionSheetHandler) actionSheetHandler.close();
    };
  }, [isAnonymousSession, routeSessionId, selectProject, showProjectSheet]);

  useEffect(() => {
    if (!isEntrySession) return undefined;

    let mounted = true;
    let actionSheetHandler;

    const startEntrySession = selectedProject => {
      if (!mounted) return;
      const projectId = selectProject(selectedProject);

      if (!projectId) {
        setIsChatting(false);
        setBootstrappingSession(false);
        return;
      }

      setInitialPromptPayload({
        text: entryPayloadRef.current.prompt,
        attachments: entryPayloadRef.current.attachments,
        handoffKey: entryHandoffKey,
      });
      setEntrySessionId(entryPayloadRef.current.sessionId);
      setIsChatting(true);
      setAgentKey(key => key + 1);
      if (window.history && window.history.replaceState) {
        window.history.replaceState(
          null,
          document.title,
          pathCompletion('/mobile/mingo/create-app', { hasDomain: false }),
        );
      }

      setBootstrappingSession(false);
    };

    const entryPayloadRef = {
      current: {
        prompt: '',
        attachments: [],
        sessionId: '',
      },
    };

    (async () => {
      try {
        const handoff = await peekAnonHandoff(entryHandoffKey);

        if (!mounted) return;
        if (!handoff || !handoff.prompt) {
          setIsChatting(false);
          setBootstrappingSession(false);
          return;
        }

        entryPayloadRef.current = {
          prompt: handoff.prompt,
          attachments: handoff.attachments || [],
          sessionId: handoff.sessionId || '',
        };

        const creatableProjects = getCreatableProjects();

        if (!creatableProjects.length) {
          alert(_l('您当前所在的组织均没有创建应用的权限，请联系组织管理员。'), 2);
          setIsChatting(false);
          setBootstrappingSession(false);
          return;
        }

        if (creatableProjects.length === 1) {
          startEntrySession(creatableProjects[0]);
          return;
        }

        actionSheetHandler = showProjectSheet({
          projects: creatableProjects,
          title: _l('选择组织'),
          onSelect: startEntrySession,
          onClose: () => {
            if (!mounted) return;
            setBootstrappingSession(false);
            setIsChatting(false);
          },
        });
      } catch (err) {
        console.error('[mobile-mingo] take entry handoff failed', err);
        if (mounted) {
          setIsChatting(false);
          setBootstrappingSession(false);
        }
      }
    })();

    return () => {
      mounted = false;
      if (actionSheetHandler) actionSheetHandler.close();
    };
  }, [entryHandoffKey, isEntrySession, selectProject, showProjectSheet]);

  const resetToHome = () => {
    clearInitialPayload();
    syncLastMingoId('');
    setInitialSessionAutoOpenOverview(false);
    setDraft('');
    setAttachments([]);
    setHistoryVisible(false);
    setActiveHistorySessionId('');
    setIsChatting(false);
    setBootstrappingSession(false);
    setEntrySessionId('');
    setOverviewVisible(false);
    setOverviewContent('');
    setOverviewReady(false);
    setOverviewGenerating(false);
    overviewFilesRef.current = {};
  };

  const handleHistorySessionDeleted = sessionId => {
    if (sessionId === activeHistorySessionId) resetToHome();
  };

  const startAgent = ({ text, mentions, sessionId, autoOpenOverview = false } = {}) => {
    setInitialSessionAutoOpenOverview(!!autoOpenOverview);
    setEntrySessionId('');
    if (sessionId) {
      setInitialSessionId(sessionId);
      setActiveHistorySessionId(sessionId);
    } else {
      const trimmed = (text || '').trim();
      const uploadedAttachments = attachments.filter(f => f.status === 'uploaded').map(mapAttachmentForRequest);

      if (!trimmed) return;
      setInitialPromptPayload({ text: trimmed, attachments: uploadedAttachments, mentions });
      setActiveHistorySessionId('');
    }

    setDraft('');
    setAttachments([]);
    setIsChatting(true);
    setBootstrappingSession(false);
    setOverviewVisible(false);
    setOverviewContent('');
    setOverviewReady(false);
    setOverviewGenerating(false);
    overviewFilesRef.current = {};
    setAgentKey(key => key + 1);
  };

  // 搭建态推荐取 agent 返回的前 3 条（加载期为空，由 Welcome 骨架占位，不再用静态前 3 条兜底以免闪动）
  const buildSamples = buildRandomSamples.slice(0, 3);
  const buildAppTryItems = buildSamples.map(text => ({
    text,
    onClick: item => startAgent({ text: item.text }),
  }));
  const helpTryItems = initialBuildSamples.helpQuestions.map(text => ({
    text,
    onClick: item => startAgent({ text: item.text }),
  }));
  const normalTryItems = isBuildAppMode
    ? buildAppTryItems
    : [
        {
          title: _l('提问'),
          text: _l('@ 一个应用开始提问'),
          onClick: () => promptInputRef.current?.insertAt(),
        },
        {
          title: _l('搭建'),
          // 直接用 agent 顺延推荐，就绪前整列走骨架（见下方 loading），不再先显示静态值再切动态值（避免闪动）
          text: buildReco,
          onClick: item => startAgent({ text: item.text }),
        },
        { title: _l('帮助'), text: initialBuildSamples.tryQuestion, onClick: item => startAgent({ text: item.text }) },
      ];
  const tryItems = helpMode ? helpTryItems : normalTryItems;
  const showAiGeneratedNotice = window.isMingDaoApp && window.isAndroid;
  const chatRuntime = {
    promptInputComponent: MobileMingoPromptInput,
    enableAttachmentAppPicker: !isBuildAppMode && !helpMode,
    promptPlaceholder: _l('提问或描述应用需求'),
    ...(!isBuildAppMode && !helpMode ? { onSessionActive: syncLastMingoId } : {}),
    ...(isBuildAppMode
      ? {
          enableMention: false,
          projectId: isAnonymousSession || isEntrySession ? anonymousProjectId || project.projectId : undefined,
          requireMobileOverviewBuildConfirm: isAnonymousSession,
          autoOpenInitialOverview: initialSessionAutoOpenOverview,
          initialSessionId: entrySessionId || undefined,
        }
      : {}),
    // 帮助态：钉 help-agent；不传 initialSessionId 即每次都是新会话，
    // 也不走「恢复上次通用会话」的 localStorage 逻辑（disableSessionRestore）
    ...(helpMode
      ? {
          agentName: HELP_AGENT_NAME,
          helpMode: true,
          enableMention: false,
          // 嵌入页不提供附件与会话分享
          enableAttachment: false,
          enableShare: false,
          rememberHelpSession: false,
          disableSessionRestore: true,
          promptPlaceholder: _l('有什么可以帮助您'),
        }
      : {}),
  };

  return (
    <Wrapper $safeAreaBottom={safeAreaBottom} $showAiGeneratedNotice={showAiGeneratedNotice}>
      <MobileMingoGlobalStyle $embeddedInApp={window.isMingDaoApp} />
      <div className="mobileMingoBody">
        {!helpMode && wideHistoryLayout && (
          <div className="historyAside">
            <SessionHistory
              inline
              currentSessionId={activeHistorySessionId}
              onDeleted={handleHistorySessionDeleted}
              onSelect={session => {
                if (!session?.sessionId) return;
                startAgent({ sessionId: session.sessionId });
              }}
            />
          </div>
        )}
        <div className="mobileMingoMain">
          {/* 帮助态是单会话模型：不提供新对话 / 历史入口，也不接管 APP 导航栏（嵌入方自带标题栏） */}
          {!helpMode && (
            <Header
              isChatting={isChatting}
              historyVisible={historyVisible}
              onOpenHistory={() => setHistoryVisible(true)}
              onCloseHistory={() => setHistoryVisible(false)}
              onFocusInput={
                isChatting
                  ? resetToHome
                  : () => {
                      syncLastMingoId('');
                      promptInputRef.current?.focus();
                    }
              }
            />
          )}
          {isChatting ? (
            <div className="agentContent">
              {bootstrappingSession ? (
                <LoadDiv className="mTop10" />
              ) : (
                <AgentBusProvider key={agentKey}>
                  {/* 帮助态不搭建应用，无方案总览 */}
                  {!helpMode && (
                    <OverviewController
                      filesRef={overviewFilesRef}
                      setOverviewContent={setOverviewContent}
                      setOverviewReady={setOverviewReady}
                      setOverviewVisible={setOverviewVisible}
                      onFilesChange={handleOverviewFilesChange}
                    />
                  )}
                  <ChatPanel runtime={chatRuntime} />
                  {!helpMode && (
                    <OverviewPopup
                      visible={overviewVisible}
                      content={overviewContent}
                      ready={overviewReady}
                      generating={overviewGenerating}
                      filesRef={overviewFilesRef}
                      filesVersion={overviewFilesVersion}
                      onClose={() => setOverviewVisible(false)}
                      onGenerateStart={() => {
                        setOverviewGenerating(true);
                        setOverviewVisible(false);
                      }}
                    />
                  )}
                </AgentBusProvider>
              )}
            </div>
          ) : (
            <Welcome
              promptInputRef={promptInputRef}
              project={project}
              draft={draft}
              attachments={attachments}
              tryItems={tryItems}
              // 推荐就绪前（含初始 idle）整列走骨架，三项一起占位 → 一起出现，避免静态/空态闪动、也不会只单独刷第二项。
              // buildReco（nextSuggestion）与 randomSamples 同步赋值，两端模式都能用它判断是否就绪。
              // 帮助态整列是本地帮助问题、不等接口，恒不走骨架。
              loading={!helpMode && !buildReco}
              placeholder={
                helpMode ? _l('有什么可以帮助您') : isBuildAppMode ? _l('告诉我您希望搭建什么样的应用？') : undefined
              }
              enableMention={!isBuildAppMode && !helpMode}
              buildMode={isBuildAppMode}
              helpMode={helpMode}
              onDraftChange={setDraft}
              onSubmit={(text, mentions) => startAgent({ text, mentions })}
              onAttachmentsChange={setAttachments}
              onProjectChange={() => setProject(getDefaultProject())}
              onProjectSelectorOpen={handleProjectSelectorOpen}
            />
          )}
        </div>
      </div>
      {showAiGeneratedNotice && (
        <AiGeneratedNotice $safeAreaBottom={safeAreaBottom}>{_l('内容由AI生成')}</AiGeneratedNotice>
      )}
      {historyVisible && !wideHistoryLayout && (
        <SessionHistory
          currentSessionId={activeHistorySessionId}
          onClose={() => setHistoryVisible(false)}
          onDeleted={handleHistorySessionDeleted}
          onSelect={session => {
            if (!session?.sessionId) return;
            setHistoryVisible(false);
            startAgent({ sessionId: session.sessionId });
          }}
        />
      )}
    </Wrapper>
  );
}
