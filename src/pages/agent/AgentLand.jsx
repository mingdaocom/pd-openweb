import React, { useCallback, useEffect, useRef, useState } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import { Modal, Tooltip } from 'ming-ui/antd-components';
import { initEscClose } from 'src/common/entries/globalEvents';
import { GlobalStoreProvider } from 'src/common/providers/GlobalStore';
import Agent from 'src/components/Agent';
import { AGENT_HEADER_EVENT } from 'src/components/Agent/agentService';
import { claimAnonymousSession, peekAnonHandoff } from 'src/components/Agent/anonymous';
import { buildSessionShareProps } from 'src/components/Agent/sessionShare';
import { readField, stringValue } from 'src/components/Agent/valueUtils';
import MingoWelcome from 'src/components/Mingo/ChatBot/components/MingoWelcome';
import mingoLogo from 'src/pages/mingo/common/images/mingo-logo.png';
import MingoBuilderEmptyState, { useMingoAppBuilderVisible } from 'src/pages/mingo/common/MingoBuilderEmptyState';
import Share from 'src/pages/worksheet/components/Share';
import { emitter } from 'src/utils/platform/browser/dom';
import { getAccountPersonalUrl, pathCompletion } from 'src/utils/platform/navigation/path';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import HistorySide, { ExpandIcon } from './HistorySide';

const Con = styled.div`
  width: 100%;
  height: 100%;
  background-color: var(--color-background-primary);
`;

// 左栏收起后，左上角浮出「展开按钮 + mingo logo」一条（无全局 header，logo 收进左栏/此处）
const CollapsedBar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  height: 50px;
  padding: 0 16px;
  gap: 10px;
  background-color: var(--color-background-primary);
  .brand-wordmark {
    height: 22px;
    width: auto;
    object-fit: contain;
    display: block;
    margin-top: 2px;
  }
`;

// 右侧对话区：必须带 id="containerWrapper" 且 position: relative —— 新版 Agent 的 AppBuilder
// 通过 createPortal 挂到 #containerWrapper。flex-row：搭建/预览（split 态）时 AppBuilder 占中栏、
// 对话收成右栏并排；非 split 态 AppBuilder 仍以 absolute 铺满覆盖。
const ChatPane = styled.div`
  position: relative;
  min-width: 0;
  display: flex;
  flex-direction: row;
`;

// 落地页新会话：直接展示 Mingo 首页（MingoWelcome）。居中限宽，避免宽屏下内容/动图铺满整行；
// 发送消息后切回 Agent 对话视图（见 showWelcome）。
const WelcomePane = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  justify-content: center;
  overflow: hidden;
  .welcomeInner {
    width: 100%;
    max-width: 720px;
    display: flex;
    flex-direction: column;
  }
`;

// 右上角标题栏操作：分享 + 用户头像（落地页无全局 header，浮在对话区右上）
const TopActions = styled.div`
  position: absolute;
  top: 0;
  right: 20px;
  z-index: 2;
  height: 50px;
  gap: 14px;
  .shareIcon {
    font-size: 20px;
    color: var(--color-text-secondary);
    cursor: pointer;
    &:hover {
      color: var(--color-text-title);
    }
  }
  .userAvatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    overflow: hidden;
    border: 1px solid var(--color-border-secondary);
    cursor: pointer;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
`;

const OrgList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const OrgItem = styled.li`
  padding: 11px 20px;
  border-radius: 6px;
  font-size: 14px;
  color: var(--color-text-primary);
  cursor: pointer;
  &:hover {
    background: var(--color-background-hover);
  }
`;

const hideHeader = window.hideHeader || new URL(location.href).searchParams.get('header') === '0';
const BUILDER_EMPTY_RIGHT_OFFSET = 420;

if (hideHeader) {
  window.hideHeader = true;
}

function getQueryValue(key) {
  return new URL(location.href).searchParams.get(key) || '';
}

function getAccountProjects() {
  return (window.md && md.global && md.global.Account && md.global.Account.projects) || [];
}

function getCreatableProjects() {
  return getAccountProjects().filter(p => !p.cannotCreateApp);
}

function getCurrentProjectId() {
  return localStorage.getItem('currentProjectId') || (getAccountProjects()[0] || {}).projectId || '';
}

function clearInitialPayload() {
  delete window.mingoInitialMessage;
  delete window.mingoInitialAttachments;
  delete window.mingoInitialMentions;
  delete window.mingoInitialGroupId;
  delete window.mingoInitialSessionId;
  delete window.mingoInitialHandoffKey;
}

function setInitialPromptPayload({ text, attachments, handoffKey }) {
  clearInitialPayload();
  window.mingoInitialMessage = text;
  if (Array.isArray(attachments) && attachments.length) window.mingoInitialAttachments = attachments;
  if (handoffKey) window.mingoInitialHandoffKey = handoffKey;
}

function showOrgPicker(projects, onSelect) {
  let close;

  close = Modal.confirm({
    title: _l('选择组织'),
    width: 480,
    footer: null,
    closable: false,
    mask: {
      closable: false,
    },
    content: (
      <OrgList>
        {projects.map(p => (
          <OrgItem
            key={p.projectId}
            onClick={() => {
              if (close) close(false);
              onSelect(p);
            }}
          >
            {p.companyName}
          </OrgItem>
        ))}
      </OrgList>
    ),
  }).destroy;

  return close;
}

const AgentLand = withRouter(props => {
  const { match, history } = props;
  const isSmallMode = window.innerWidth < 880;
  const urlSessionId = (match && match.params && match.params.sessionId) || '';
  const initialAnonRouteRef = useRef(getQueryValue('anon') === '1');
  const initialEntryRouteRef = useRef(getQueryValue('entry') === '1');
  const initialOfficialRouteRef = useRef(initialAnonRouteRef.current || initialEntryRouteRef.current);
  const anonHandledRef = useRef(false);
  const entryHandledRef = useRef(false);
  const chatPaneRef = useRef(null);

  const [sideVisible, setSideVisible] = useState(() => !initialOfficialRouteRef.current);
  const [expandIconVisible, setExpandIconVisible] = useState(false);
  // AppBuilder（搭建/预览）是否可见：可见时进三栏布局，左上角展开 icon 改由 AppBuilder 中栏承载
  const [builderVisible, setBuilderVisible] = useState(() => initialOfficialRouteRef.current);
  // 预览自动收起会话列表前的展开态 + 「本次收起是否由预览触发」标记：
  // 关闭预览时据此恢复，且仅恢复确由预览收起的情况，不覆盖用户在预览期间的手动展开/收起
  const sideVisibleBeforeBuilderRef = useRef(false);
  const collapsedByBuilderRef = useRef(false);
  const [bootstrapping, setBootstrapping] = useState(() => initialAnonRouteRef.current || initialEntryRouteRef.current);
  const [officialLanding, setOfficialLanding] = useState(() => initialOfficialRouteRef.current);
  const [initialBuilderEmptyVisible, setInitialBuilderEmptyVisible] = useState(() => initialOfficialRouteRef.current);
  const [officialBuilderReady, setOfficialBuilderReady] = useState(false);
  const [entrySessionId, setEntrySessionId] = useState('');
  const [entryProjectId, setEntryProjectId] = useState('');
  const [autoOpenBuilderSessionId, setAutoOpenBuilderSessionId] = useState('');
  // 当前激活会话：驱动左栏高亮 + 待挂载会话，初值取自 URL
  const [activeSessionId, setActiveSessionId] = useState(urlSessionId);
  // Agent 重挂载令牌：仅在「显式新建 / 选择历史会话」时自增；会话内 URL 回写不变（不打断在途流）
  const [mountToken, setMountToken] = useState(0);
  // 左栏刷新令牌：会话激活 / 一轮结束后自增，让历史列表重新拉取
  const [historyRefresh, setHistoryRefresh] = useState(0);
  // 是否已进入对话：新会话先展示 MingoWelcome 首页，首页提交（写 window.mingoInitialMessage）后置 true，
  // 切到 Agent 对话视图（Agent 挂载时自动发起一轮）。新建 / 切换会话由 mountSession 复位。
  const [chatStarted, setChatStarted] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  // 当前会话默认标题（首条用户消息，由 ChatPanel 广播 SESSION_ACTIVE 带来 / 选择历史时取 item.title）：
  // 供右上角「分享」弹窗标题默认值
  const [activeSessionTitle, setActiveSessionTitle] = useState('');

  // 已识别的实时会话 id：区分「会话内 URL 回写」与「外部导航（点击历史 / 浏览器前进后退）」
  const liveSessionRef = useRef(urlSessionId);
  // 已确认在左栏列表里的会话 id：URL 直接进入（/mingo/chat/:id）与点历史选中的会话本就在列表中，
  // 新会话则在首轮落库后加入。用于把左栏刷新收敛到「会话首次落库」这一次，
  // 避免同一会话每轮对话都整拉一次列表。
  const listedSessionsRef = useRef(new Set(urlSessionId ? [urlSessionId] : []));
  // 待挂载会话 id：render 阶段写入全局，供 ChatPanel 挂载时 loadSession（必须早于子组件 effect）
  const pendingMountRef = useRef(urlSessionId);
  const initialHistoryRef = useRef(history);
  const handleAppBuilderVisibleChange = useCallback(visible => {
    if (visible) {
      setOfficialBuilderReady(true);
      setInitialBuilderEmptyVisible(false);
    }
  }, []);
  useMingoAppBuilderVisible(chatPaneRef, {
    disabled: !officialLanding || isSmallMode,
    onVisibleChange: handleAppBuilderVisibleChange,
  });

  window.mingoInitialSessionId = bootstrapping || entrySessionId ? undefined : pendingMountRef.current || undefined;

  // 显式切换会话：更新待挂载 id 并自增令牌，强制 Agent 重挂载去加载（新建则传空 → 空白会话）
  const mountSession = useCallback(sessionId => {
    pendingMountRef.current = sessionId || '';
    liveSessionRef.current = sessionId || '';
    // 显式选中的是已有会话（新建传空 id 除外）：它已在左栏列表里，后续广播不必再刷新列表
    if (sessionId) listedSessionsRef.current.add(sessionId);
    setOfficialLanding(false);
    setInitialBuilderEmptyVisible(false);
    setOfficialBuilderReady(false);
    setEntrySessionId('');
    setEntryProjectId('');
    setAutoOpenBuilderSessionId('');
    setActiveSessionId(sessionId || '');
    setActiveSessionTitle(''); // 切换会话先清空标题，随后由 SESSION_ACTIVE / 选择项回填
    // 选中具体会话即进对话视图；新建（空 id）则回到 MingoWelcome 首页
    setChatStarted(!!sessionId);
    setMountToken(token => token + 1);
  }, []);

  // MingoWelcome 首页提交（已写入 window.mingoInitialMessage）：切到 Agent 对话视图，由 Agent 挂载时自动发起一轮
  const handleWelcomeStartTask = useCallback(() => {
    setChatStarted(true);
  }, []);

  useEffect(() => {
    // PreviewFrame / navigateTo 的 SPA 跳转依赖 window.reactRouterHistory
    window.reactRouterHistory = initialHistoryRef.current;
    document.title = _l('Mingo');
    // /mingo 是独立入口，不走主 app 的 globalEvents；弹窗（分享 / 重命名 / 对话历史）的 Esc 关闭
    // 依赖 window.closeFns + 全局 keydown，这里单独接入（不接管站内 a 标签点击，避免独立页跳转被 push 回本页）
    initEscClose();
  }, []);

  useEffect(() => {
    if (!initialEntryRouteRef.current || entryHandledRef.current) return undefined;

    let mounted = true;
    let closeDialog;

    (async () => {
      if (!urlSessionId) {
        if (mounted) {
          entryHandledRef.current = true;
          setOfficialLanding(false);
          setInitialBuilderEmptyVisible(false);
          setBootstrapping(false);
        }

        return;
      }

      const handoff = await peekAnonHandoff(urlSessionId);

      if (!mounted) return;

      if (!handoff || handoff.sessionId !== urlSessionId || !handoff.prompt) {
        entryHandledRef.current = true;
        setOfficialLanding(false);
        setInitialBuilderEmptyVisible(false);
        setBootstrapping(false);
        return;
      }

      const startEntrySession = project => {
        if (!mounted) return;
        const projectId = project && project.projectId;

        if (!projectId) {
          entryHandledRef.current = true;
          setOfficialLanding(false);
          setInitialBuilderEmptyVisible(false);
          setBootstrapping(false);
          return;
        }

        safeLocalStorageSetItem('currentProjectId', projectId);
        setInitialPromptPayload({ text: handoff.prompt, attachments: handoff.attachments, handoffKey: urlSessionId });
        pendingMountRef.current = urlSessionId;
        liveSessionRef.current = urlSessionId;
        setActiveSessionId(urlSessionId);
        setEntrySessionId(urlSessionId);
        setEntryProjectId(projectId);
        setAutoOpenBuilderSessionId(urlSessionId);
        entryHandledRef.current = true;
        history.replace(pathCompletion(`/mingo/chat/${encodeURIComponent(urlSessionId)}`, { hasDomain: false }));
        if (mounted) setBootstrapping(false);
      };

      const goBlank = () => {
        pendingMountRef.current = '';
        liveSessionRef.current = '';
        entryHandledRef.current = true;
        setOfficialLanding(false);
        setInitialBuilderEmptyVisible(false);
        setEntrySessionId('');
        setEntryProjectId('');
        setActiveSessionId('');
        history.replace(pathCompletion('/mingo', { hasDomain: false }));
        if (mounted) setBootstrapping(false);
      };

      const creatableProjects = getCreatableProjects();

      if (!creatableProjects.length) {
        closeDialog = Modal.confirm({
          title: _l('无创建应用权限'),
          content: _l('您当前所在的组织均没有创建应用的权限，请联系组织管理员。'),
          cancelButtonProps: {
            style: {
              display: 'none',
            },
          },
          onOk: goBlank,
        }).destroy;
        return;
      }

      if (creatableProjects.length === 1) {
        startEntrySession(creatableProjects[0]);
        return;
      }

      const currentProjectId = getCurrentProjectId();
      const currentProject = creatableProjects.find(p => p.projectId === currentProjectId);

      closeDialog = showOrgPicker(
        currentProject
          ? [currentProject, ...creatableProjects.filter(p => p.projectId !== currentProjectId)]
          : creatableProjects,
        startEntrySession,
      );
    })();

    return () => {
      mounted = false;
      if (closeDialog) closeDialog(false);
    };
  }, [history, urlSessionId]);

  useEffect(() => {
    if (!initialAnonRouteRef.current || anonHandledRef.current) return undefined;

    let mounted = true;
    let closeDialog;
    let timer;

    const goBlank = () => {
      pendingMountRef.current = '';
      liveSessionRef.current = '';
      anonHandledRef.current = true;
      setOfficialLanding(false);
      setInitialBuilderEmptyVisible(false);
      setActiveSessionId('');
      history.replace(pathCompletion('/mingo', { hasDomain: false }));
      if (mounted) {
        setBootstrapping(false);
      }
    };

    const claimSession = async project => {
      const projectId = project && project.projectId;

      if (!urlSessionId || !projectId) {
        goBlank();
        return;
      }

      try {
        safeLocalStorageSetItem('currentProjectId', projectId);
        const res = await claimAnonymousSession({ sessionId: urlSessionId, projectId });
        const claimedSessionId = stringValue(readField(res, 'sessionId')) || urlSessionId;

        pendingMountRef.current = claimedSessionId;
        liveSessionRef.current = claimedSessionId;
        anonHandledRef.current = true;
        setAutoOpenBuilderSessionId(claimedSessionId);
        setActiveSessionId(claimedSessionId);
        history.replace(pathCompletion(`/mingo/chat/${encodeURIComponent(claimedSessionId)}`, { hasDomain: false }));
      } catch (err) {
        console.error('[agent-land] claim anonymous session failed', err);
        alertIfNotUnauthorized(err, _l('网络繁忙，请稍后再试'), 2);
        goBlank();
        return;
      } finally {
        if (mounted) {
          setBootstrapping(false);
        }
      }
    };

    timer = setTimeout(() => {
      const creatableProjects = getCreatableProjects();

      if (!urlSessionId) {
        goBlank();
        return;
      }

      if (!creatableProjects.length) {
        closeDialog = Modal.confirm({
          title: _l('无创建应用权限'),
          content: _l('您当前所在的组织均没有创建应用的权限，请联系组织管理员。'),
          cancelButtonProps: {
            style: {
              display: 'none',
            },
          },
          onOk: goBlank,
        }).destroy;
        return;
      }

      if (creatableProjects.length === 1) {
        claimSession(creatableProjects[0]);
        return;
      }

      const currentProjectId = getCurrentProjectId();
      const currentProject = creatableProjects.find(p => p.projectId === currentProjectId);

      closeDialog = showOrgPicker(
        currentProject
          ? [currentProject, ...creatableProjects.filter(p => p.projectId !== currentProjectId)]
          : creatableProjects,
        claimSession,
      );
    }, 0);

    return () => {
      mounted = false;
      clearTimeout(timer);
      if (closeDialog) closeDialog(false);
    };
  }, [history, urlSessionId]);

  useEffect(() => {
    setTimeout(
      () => {
        setExpandIconVisible(!sideVisible);
      },
      sideVisible ? 0 : 300,
    );
  }, [sideVisible]);

  // 会话列表显隐变化广播给 AppBuilder：用于决定中栏左上角是否显示「展开会话列表」icon
  useEffect(() => {
    emitter.emit(AGENT_HEADER_EVENT.SIDEBAR_STATE, { visible: sideVisible });
  }, [sideVisible]);

  // AppBuilder 显隐：打开搭建/预览时默认收起会话列表（用户仍可手动展开）；关闭预览时恢复打开前的展开态；
  // 中栏「展开会话列表」icon 点击 → 展开左栏。
  useEffect(() => {
    const onBuilderVisible = ({ visible } = {}) => {
      setBuilderVisible(!!visible);

      if (visible) {
        // 用函数式更新读取当前真实展开态，记下打开前状态（仅首次由预览触发的收起时记录，
        // 避免预览态内重复广播覆盖记忆），再收起左栏
        setSideVisible(prev => {
          if (!collapsedByBuilderRef.current) {
            sideVisibleBeforeBuilderRef.current = prev;
            collapsedByBuilderRef.current = true;
          }

          return false;
        });
        emitter.emit(AGENT_HEADER_EVENT.SIDEBAR_STATE, { visible: false });
      } else if (collapsedByBuilderRef.current) {
        // 关闭预览：恢复成被预览收起前的展开态（打开前是关闭则保持关闭）
        const restore = sideVisibleBeforeBuilderRef.current;
        collapsedByBuilderRef.current = false;
        setSideVisible(restore);
        emitter.emit(AGENT_HEADER_EVENT.SIDEBAR_STATE, { visible: restore });
      }
    };

    // 用户在预览期间手动展开左栏：清除「由预览收起」标记，关闭预览时不再回收，尊重用户的显式操作
    const onExpandSidebar = () => {
      collapsedByBuilderRef.current = false;
      setSideVisible(true);
    };

    emitter.on(AGENT_HEADER_EVENT.BUILDER_VISIBLE, onBuilderVisible);
    emitter.on(AGENT_HEADER_EVENT.EXPAND_SIDEBAR, onExpandSidebar);
    return () => {
      emitter.off(AGENT_HEADER_EVENT.BUILDER_VISIBLE, onBuilderVisible);
      emitter.off(AGENT_HEADER_EVENT.EXPAND_SIDEBAR, onExpandSidebar);
    };
  }, []);

  // ChatPanel 广播会话激活：新会话则回写 URL（history.replace 不触发重挂载）+ 高亮，并刷新左栏
  useEffect(() => {
    const onSessionActive = ({ sessionId, title, persisted } = {}) => {
      if (!sessionId) return;
      if (title !== undefined) setActiveSessionTitle(title || '');
      if (sessionId !== liveSessionRef.current) {
        liveSessionRef.current = sessionId;
        pendingMountRef.current = sessionId;
        // activeSessionId 即 HistorySide 的 currentSessionId，只驱动左栏高亮；
        // 左栏整拉只认下面的 historyRefresh，避免切换会话把已翻的页丢掉
        setActiveSessionId(sessionId);
        history.replace(pathCompletion(`/mingo/chat/${sessionId}`, { hasDomain: false }));
      }

      setAutoOpenBuilderSessionId(current => (current === sessionId ? '' : current));
      // 只在会话「首次落库」时刷新左栏：新会话要等首轮结束才会出现在列表里。
      // 已在列表中的会话（点历史 / URL 进入 / 该会话后续每一轮）列表内容不变，不再整拉一次
      if (persisted && !listedSessionsRef.current.has(sessionId)) {
        listedSessionsRef.current.add(sessionId);
        setHistoryRefresh(n => n + 1);
      }
    };

    emitter.on(AGENT_HEADER_EVENT.SESSION_ACTIVE, onSessionActive);
    return () => emitter.off(AGENT_HEADER_EVENT.SESSION_ACTIVE, onSessionActive);
  }, [history]);

  // 浏览器前进 / 后退导致 URL 变化：与当前实时会话不一致时按外部选择重新加载（URL 已是目标，不再导航）
  useEffect(() => {
    if (urlSessionId !== liveSessionRef.current) {
      mountSession(urlSessionId);
    }
  }, [urlSessionId, mountSession]);

  const handleNewChat = useCallback(() => {
    mountSession('');
    history.push(pathCompletion('/mingo', { hasDomain: false }));
  }, [history, mountSession]);

  // 删除的是当前正在查看的会话：回到空白新会话，避免停留在已删会话
  const handleDeleted = useCallback(
    deletedId => {
      if (deletedId && deletedId === activeSessionId) handleNewChat();
    },
    [activeSessionId, handleNewChat],
  );

  const handleSelect = useCallback(
    session => {
      const sessionId = session && session.sessionId;

      if (!sessionId || sessionId === activeSessionId) return;
      mountSession(sessionId);
      setActiveSessionTitle((session && session.title) || ''); // 选择项自带标题，立即回填（SESSION_ACTIVE 再兜底）
      history.push(pathCompletion(`/mingo/chat/${sessionId}`, { hasDomain: false }));
    },
    [activeSessionId, history, mountSession],
  );

  // 新会话（无激活会话、未进入对话）展示 MingoWelcome 首页；有会话 / 已发起则交给 Agent 对话视图
  const showWelcome = !chatStarted && !activeSessionId;
  const showOfficialBuilderEmptyState =
    initialBuilderEmptyVisible && officialLanding && !isSmallMode && !bootstrapping && !officialBuilderReady;

  return (
    <Con className="t-flex t-flex-col">
      <div className="t-flex-1 t-flex t-flex-row t-overflow-hidden Relative">
        {/* 左栏收起：左上角浮出「展开按钮 + mingo logo」（已无全局 header，logo 收进左栏/此处）。
             搭建/预览（builderVisible）三栏态下，展开 icon 改由 AppBuilder 中栏左上角承载，这里不再浮出，避免重复。 */}
        {!isSmallMode && expandIconVisible && !builderVisible && (
          <CollapsedBar className="t-flex t-items-center">
            <ExpandIcon className="t-flex t-items-center t-justify-center" onClick={() => setSideVisible(true)}>
              <i className="icon icon-menu_right"></i>
            </ExpandIcon>
            <a href={pathCompletion('/')} className="t-flex t-items-center">
              <img className="brand-wordmark" src={md.global.SysSettings.aiBrandLogoUrl || mingoLogo} alt="mingo" />
            </a>
          </CollapsedBar>
        )}
        {!isSmallMode && (
          <HistorySide
            visible={sideVisible}
            currentSessionId={activeSessionId}
            refreshKey={historyRefresh}
            onNewChat={handleNewChat}
            onSelect={handleSelect}
            onExpand={() => setSideVisible(!sideVisible)}
            onDeleted={handleDeleted}
          />
        )}
        <ChatPane id="containerWrapper" className="t-flex-1" ref={chatPaneRef}>
          {/* 搭建/预览三栏态由 AppBuilder 自带头部，这里不再浮出，避免与中栏操作重叠 */}
          {!isSmallMode && !builderVisible && (
            <TopActions className="t-flex t-items-center">
              {!!activeSessionId && (
                <Tooltip title={_l('分享')}>
                  <i className="icon icon-share shareIcon" onClick={() => setShareVisible(true)} />
                </Tooltip>
              )}
              {!!md?.global?.Account?.avatar && (
                <Tooltip title={md?.global?.Account?.fullname}>
                  <div className="userAvatar" onClick={() => (location.href = getAccountPersonalUrl())}>
                    <img src={md.global.Account.avatar} alt="avatar" />
                  </div>
                </Tooltip>
              )}
            </TopActions>
          )}
          {showOfficialBuilderEmptyState && <MingoBuilderEmptyState rightOffset={BUILDER_EMPTY_RIGHT_OFFSET} />}
          {/* 落地页挂载即聚焦输入框（仅此场景，抽屉 / 官网 embed 不强制）；切换会话重挂载亦会重新聚焦 */}
          {/* contentTopInset：落地页无全局 header，消息区顶部补留白避免首条消息贴顶 */}
          {/* disableSessionRestore：落地页用 URL 管理会话，/mingo 进入是新会话，不自动恢复上次对话 */}
          {bootstrapping ? (
            <LoadDiv className="mTop10" />
          ) : showWelcome ? (
            // 新会话直接展示 Mingo 首页；MingoWelcome 依赖 GlobalStore（应用内取 appInfo），独立页需自带 Provider
            <WelcomePane>
              <div className="welcomeInner">
                <GlobalStoreProvider>
                  <MingoWelcome onStartTask={handleWelcomeStartTask} landing />
                </GlobalStoreProvider>
              </div>
            </WelcomePane>
          ) : (
            <Agent
              key={`${mountToken}-${entrySessionId || 'default'}`}
              runtime={{
                autoFocus: true,
                contentTopInset: true,
                disableSessionRestore: true,
                autoOpenInitialBuilder:
                  !!autoOpenBuilderSessionId && pendingMountRef.current === autoOpenBuilderSessionId,
                initialSessionId: entrySessionId || undefined,
                projectId: entryProjectId || undefined,
                // 落地页：搭建/预览时启用三栏布局（AppBuilder 中栏 + 对话右栏）
                landingLayout: true,
              }}
            />
          )}
        </ChatPane>
      </div>
      {shareVisible && (
        <Share
          {...buildSessionShareProps({
            sessionId: activeSessionId,
            title: activeSessionTitle,
            projectId: entryProjectId || undefined,
          })}
          onClose={() => setShareVisible(false)}
        />
      )}
    </Con>
  );
});

AgentLand.propTypes = {
  match: PropTypes.shape({}),
  history: PropTypes.shape({}),
};

export default AgentLand;
