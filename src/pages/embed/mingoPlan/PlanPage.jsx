import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import Agent from 'src/components/Agent';
import {
  fetchAgentSessionMessagePage,
  fetchArtifactFileContent,
  fetchArtifactFileList,
  pickAgentMessageArtifact,
  readField,
  stringValue,
} from 'src/components/Agent/agentService';
import {
  ANON_AGENT,
  bootstrapAnonymousSession,
  ensureAnonymousSession,
  getAnonSessionId,
  peekAnonHandoff,
} from 'src/components/Agent/anonymous';
import { FILE_ENTRIES, SIDEBAR_ITEMS } from 'src/components/Agent/AppBuilder/fileRegistry';
import Header from 'src/pages/mingo/common/Header';
import MingoBuilderEmptyState, { useMingoAppBuilderVisible } from 'src/pages/mingo/common/MingoBuilderEmptyState';
import { browserIsMobile, getCurrentSubPath, getRequest, pathCompletion } from 'src/utils/common';
import AnonymousMobileOverview from './AnonymousMobileOverview';

// /public/mingo/plan：官网新标签页打开的「生成 plan」页（匿名）。
// 读官网输入框交接的 handoff → bootstrap 真实匿名 sessionId → 复用 <Agent/> 匿名跑通 plan 流式渲染。
// 点「生成应用」→ /mingo/chat/:sessionId；未登录先走注册页 ReturnUrl，登录后在 Mingo 内选择组织并认领会话。

const Con = styled.div`
  width: 100%;
  height: 100%;
  background-color: var(--color-background-primary);
  --color-mingo: var(--color-primary);
  ${() => (md.global.SysSettings.aiBrandThemeColor ? `--color-mingo: ${md.global.SysSettings.aiBrandThemeColor};` : '')}
`;

// AppBuilder portal 挂载区：position: relative 是 AppBuilder position:absolute 子层的定位基准。
// flex: 1 撑满剩余空间（左侧两列 sidebar + content 由 AppBuilder 自身布局）。
const BuilderSlot = styled.div`
  position: relative;
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

// 右侧聊天面板：固定宽度，始终可见（AppBuilder 出现前展示加载/对话，出现后作右侧第三栏）。
const ChatPane = styled.div`
  position: relative;
  width: 380px;
  min-width: 380px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-left: 1px solid var(--color-border-secondary);
  @media (max-width: 767px) {
    width: 100%;
    min-width: 0;
    flex: 1;
    border-left: 0;
  }
`;

function getQueryValue(key) {
  const value = getRequest()[key];

  return Array.isArray(value) ? value[0] : value || '';
}

const hideHeader = window.hideHeader || getQueryValue('header') === '0';

function normalizePath(path) {
  return (path || '').replace(/\/+$/, '') || '/';
}

const getMingoPlanBasePath = () => normalizePath(`${getCurrentSubPath()}/public/mingo/plan`);

function isMingoPlanPath(pathname = location.pathname) {
  const path = normalizePath(pathname);
  const basePath = getMingoPlanBasePath();

  return path === basePath || path.startsWith(`${basePath}/`);
}

function getRouteSessionId(pathname = location.pathname) {
  const path = normalizePath(pathname);
  const basePath = getMingoPlanBasePath();

  if (!path.startsWith(`${basePath}/`)) return '';

  try {
    return decodeURIComponent(path.slice(basePath.length + 1).split('/')[0] || '');
  } catch {
    return '';
  }
}

function getSearchWithoutHandoffKey() {
  const params = new URLSearchParams(location.search);

  params.delete('key');

  const search = params.toString();

  return search ? `?${search}` : '';
}

function replacePlanRoute(history, sessionId) {
  if (!sessionId) return;

  const target = pathCompletion(`/public/mingo/plan/${encodeURIComponent(sessionId)}${getSearchWithoutHandoffKey()}`, {
    hasDomain: false,
  });
  const current = `${location.pathname}${location.search}`;

  if (current !== target) history.replace(target);
}

function clearInitialPayload() {
  delete window.mingoInitialMessage;
  delete window.mingoInitialAttachments;
  delete window.mingoInitialMentions;
  delete window.mingoInitialGroupId;
  delete window.mingoInitialSessionId;
  delete window.mingoInitialHandoffKey;
}

const isSingleMingoPlan = isMingoPlanPath();

function getHistoryPlanArtifact(items) {
  if (!Array.isArray(items) || items.length < 2) return null;

  for (const item of items) {
    const role = (readField(item, 'role') || '').toLowerCase();
    const artifact = role === 'assistant' ? pickAgentMessageArtifact(item, { anonymousPlan: true }) : null;

    if (artifact && artifact.artifactId && artifact.versionId) return artifact;
  }

  return null;
}

function getEntriesFromUrlMap(urlByPath) {
  if (!(urlByPath instanceof Map)) return FILE_ENTRIES;

  return FILE_ENTRIES.filter(entry => urlByPath.has(entry.file));
}

function getFirstRestoredSidebarPath(filesToRestore) {
  const restoredPaths = new Set((filesToRestore || []).map(item => item.path));
  const firstSidebarItem = SIDEBAR_ITEMS.find(item => item.file && restoredPaths.has(item.file));

  return firstSidebarItem ? firstSidebarItem.file : '';
}

function getPlanAppMeta(content) {
  const json = safeParse(content, 'object');

  if (!json || typeof json !== 'object') return null;

  return {
    appIcon: stringValue(readField(json, 'appIcon')) || '',
    appColor: stringValue(readField(json, 'appColor')) || '',
    appName: stringValue(readField(json, 'appName')) || '',
  };
}

async function loadHistoryPlanArtifactFiles({ artifactId, versionId, bus } = {}) {
  if (!artifactId || !versionId || !bus) return false;

  let urlByPath = null;

  try {
    const map = await fetchArtifactFileList({ artifactId, versionId });

    if (map instanceof Map) urlByPath = map;
  } catch (err) {
    console.error('[mingo-plan] list history artifact files failed', err);
  }

  const entries = getEntriesFromUrlMap(urlByPath);

  if (!entries.length) return false;

  const filesToRestore = [];
  let restored = false;

  for (const entry of entries) {
    try {
      const content = await fetchArtifactFileContent({
        artifactId,
        versionId,
        path: entry.file,
        urlByPath,
      });

      if (content) {
        restored = true;
        filesToRestore.push({ path: entry.file, content });
      }

      if (content && entry.file === '/jsons/app.json') {
        const appMeta = getPlanAppMeta(content);

        if (appMeta) bus.emit('plan-card:meta', { artifactId, versionId, ...appMeta });
      }
    } catch (err) {
      console.error('[mingo-plan] fetch history artifact file failed', entry.file, err);
    }
  }

  filesToRestore.forEach(item => bus.emit('file:write', item));
  const firstRestoredSidebarPath = getFirstRestoredSidebarPath(filesToRestore);

  if (firstRestoredSidebarPath) bus.emit('file:focus', { path: firstRestoredSidebarPath });

  return restored;
}

function getAgentErrorInfo(err) {
  const status = err && (err.status || (err.response && err.response.status));
  const rawBody =
    (err && (err.data || (err.response && err.response.data))) || safeParse((err && err.message) || '', 'object');
  const body = rawBody && typeof rawBody === 'object' ? rawBody : {};

  return {
    status,
    code: stringValue(readField(body, 'errorCode')),
  };
}

async function getAnonymousHistoryState(sessionId) {
  if (!sessionId) return { hasHistory: false };

  try {
    const page = await fetchAgentSessionMessagePage(sessionId, { page: 1, size: 50 });
    const items = Array.isArray(page.items) ? page.items : [];
    const planArtifact = getHistoryPlanArtifact(items);

    return {
      hasHistory: page.totalCount > 0 || items.length > 0,
      planArtifact,
      messages: items,
    };
  } catch (err) {
    const { status, code } = getAgentErrorInfo(err);

    if (status === 404 || code === 'session_not_found') return { hasHistory: false, notFound: true };
    if (status === 403 && code === 'anon_session_invalid') return { hasHistory: false, invalid: true };

    throw err;
  }
}

function getMingoChatUrl(sessionId, isMobile) {
  return pathCompletion(
    isMobile
      ? `/mobile/mingo/create-app/${encodeURIComponent(sessionId)}?anon=1`
      : `/mingo/chat/${encodeURIComponent(sessionId)}?anon=1`,
  );
}

function getRegisterUrl(returnUrl) {
  const link = `?ReturnUrl=${encodeURIComponent(returnUrl)}`;

  return pathCompletion(`/register${link}`);
}

function getOfficialHomeUrl(handoff) {
  const sourceUrl = (handoff && handoff.officialHomeUrl) || document.referrer || '';

  try {
    const url = new URL(sourceUrl);

    if (url.origin === location.origin) return '';

    return url.origin + '/';
  } catch {
    return '';
  }
}

function redirectToHomeAfterInvalidSession(handoff) {
  alert(_l('会话不存在或已失效'), 2);

  setTimeout(() => {
    location.href = getOfficialHomeUrl(handoff) || pathCompletion('/');
  }, 1200);
}

function PlanPage({ history }) {
  const [sessionId, setSessionId] = useState('');
  const [initialPlanArtifact, setInitialPlanArtifact] = useState(null);
  const [initialHistoryMessages, setInitialHistoryMessages] = useState(null);
  const [autoLoadInitialSession, setAutoLoadInitialSession] = useState(false);
  const [officialHomeUrl, setOfficialHomeUrl] = useState('');
  const [error, setError] = useState(false);
  const [initialBuilderEmptyVisible, setInitialBuilderEmptyVisible] = useState(true);
  const [historyGateReady, setHistoryGateReady] = useState(false);
  const builderSlotRef = useRef(null);
  const startedRef = useRef(false);
  const handleAppBuilderVisibleChange = useCallback(visible => {
    if (visible) setInitialBuilderEmptyVisible(false);
  }, []);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    document.title = _l('Mingo');
    // AppBuilder 的 PreviewFrame / navigateTo 依赖 window.reactRouterHistory（与 /agent 一致）
    window.reactRouterHistory = history;

    (async () => {
      const handoffKey = getQueryValue('key');
      const handoff = await (async () => {
        try {
          if (handoffKey) return await peekAnonHandoff(handoffKey);
        } catch {
          // ignore
        }

        return null;
      })();

      try {
        const routeSessionId = getRouteSessionId();
        const storedSessionId = getAnonSessionId();
        const hasHandoffAttachments = Array.isArray(handoff && handoff.attachments) && handoff.attachments.length;
        const hasHandoffPayload = !!(handoff && (handoff.prompt || hasHandoffAttachments));
        let sid = handoff
          ? handoff.sessionId || (await bootstrapAnonymousSession())
          : routeSessionId || storedSessionId || (await ensureAnonymousSession());
        let historyState = await getAnonymousHistoryState(sid);

        if ((historyState.notFound || historyState.invalid) && routeSessionId && !hasHandoffPayload) {
          setError(true);
          setOfficialHomeUrl(getOfficialHomeUrl(handoff));
          redirectToHomeAfterInvalidSession(handoff);
          return;
        }

        // session-token / execute 的 TTL 失效时，首轮 handoff 可换新匿名会话重发；
        // 纯刷新没有待发消息时也换成新空会话，避免用失效 sid 继续发送。
        if (historyState.invalid) {
          sid = await bootstrapAnonymousSession();
          historyState = await getAnonymousHistoryState(sid);
        }

        // URL sid 只有查到服务端历史时才作为 capability 续用；空历史且非本地/交接来源时，
        // 不把外部传入的 sid 用于后续 execute，重新 bootstrap 一条匿名会话。
        if (
          !historyState.hasHistory &&
          !hasHandoffPayload &&
          routeSessionId &&
          sid === routeSessionId &&
          routeSessionId !== storedSessionId
        ) {
          sid = await bootstrapAnonymousSession();
          historyState = await getAnonymousHistoryState(sid);
        }

        if (!sid) throw new Error('no anonymous session');

        replacePlanRoute(history, sid);
        clearInitialPayload();

        // 历史非空永远 resume：刷新/重开时 user 消息已在 execute 起始落库，
        // 这里忽略 handoff，避免重复发送首条 prompt。本地 snapshot 不再作为历史恢复来源。
        if (historyState.hasHistory) {
          const hasHistoryPlan = !!historyState.planArtifact;

          window.mingoInitialSessionId = sid;
          setInitialBuilderEmptyVisible(!hasHistoryPlan);
          setInitialPlanArtifact(historyState.planArtifact || null);
          setInitialHistoryMessages(historyState.messages || null);
          setAutoLoadInitialSession(true);
        } else if (hasHandoffPayload) {
          // 空历史 + 官网 handoff 才发首轮；没有 handoff 时停在空输入态，避免对 URL sid 自动发未知消息。
          setInitialPlanArtifact(null);
          setInitialHistoryMessages(null);
          setAutoLoadInitialSession(false);
          window.mingoInitialMessage = handoff.prompt || '';
          if (hasHandoffAttachments) window.mingoInitialAttachments = handoff.attachments;
          if (handoffKey) window.mingoInitialHandoffKey = handoffKey;
        } else {
          setInitialPlanArtifact(null);
          setInitialHistoryMessages(null);
          setAutoLoadInitialSession(false);
        }

        setOfficialHomeUrl(getOfficialHomeUrl(handoff));
        setHistoryGateReady(true);
        setSessionId(sid);
      } catch (err) {
        console.error('[mingo-plan] bootstrap failed', err);
        setError(true);
      }
    })();
  }, [history]);

  const isMobilePlan = browserIsMobile();
  const appBuilderVisible = useMingoAppBuilderVisible(builderSlotRef, {
    disabled: isMobilePlan,
    onVisibleChange: handleAppBuilderVisibleChange,
  });

  // 「生成应用」：匿名态转折点 —— 跳 Mingo 登录态会话，未登录先经注册页，登录后选择组织并认领会话。
  const handleRequestBuild = useCallback(() => {
    const sid = sessionId;
    const chatUrl = getMingoChatUrl(sid, isMobilePlan);

    if (!sid) return;
    location.href = md.global.Account && md.global.Account.accountId ? chatUrl : getRegisterUrl(chatUrl);
  }, [isMobilePlan, sessionId]);

  const handleRetryToOfficialHome = useCallback(() => {
    location.href = officialHomeUrl || pathCompletion('/');
  }, [officialHomeUrl]);

  const runtime = useMemo(
    () =>
      sessionId
        ? {
            anonymous: true,
            agentName: ANON_AGENT,
            initialSessionId: sessionId,
            onRequestBuild: handleRequestBuild,
            forceEnableVoice: true,
            onRetryIntercept: handleRetryToOfficialHome,
            disableAppBuilder: isMobilePlan,
            disableArtifactFileFetch: isMobilePlan,
            disableArtifactMetaFetch: true,
            deferCommittedAppMetaUntilFilesLoaded: true,
            // 移动端不挂 AppBuilder，但历史恢复仍需读取匿名 artifact 的 /plan.md 供总览弹层展示。
            disableCommittedFileLoad: false,
            autoLoadInitialSession,
            initialPlanArtifact,
            loadCommittedArtifactFiles: loadHistoryPlanArtifactFiles,
            initialHistoryMessages,
          }
        : null,
    [
      handleRequestBuild,
      handleRetryToOfficialHome,
      autoLoadInitialSession,
      initialHistoryMessages,
      initialPlanArtifact,
      isMobilePlan,
      sessionId,
    ],
  );

  return (
    <Con className="t-flex t-flex-col">
      {!hideHeader && <Header useMingdaoLogo hideLoginEntry />}
      <div className="t-flex-1 t-flex t-flex-row t-overflow-hidden">
        {/* AppBuilder portal 挂载区（左侧两列：sidebar + content panel） */}
        {!isMobilePlan && (
          <BuilderSlot id="containerWrapper" ref={builderSlotRef}>
            {!error && historyGateReady && initialBuilderEmptyVisible && !appBuilderVisible && (
              <MingoBuilderEmptyState compact />
            )}
          </BuilderSlot>
        )}
        {/* 右侧聊天面板，AppBuilder 出现前展示加载/对话，出现后作第三栏 */}
        <ChatPane>
          {error ? (
            <div className="t-flex t-items-center t-justify-center h100 Gray_9e">{_l('网络繁忙，请稍后再试')}</div>
          ) : runtime ? (
            <Agent runtime={runtime} isSingleMingoPlan={isSingleMingoPlan}>
              {isMobilePlan ? <AnonymousMobileOverview autoOpenOnReady /> : null}
            </Agent>
          ) : (
            <LoadDiv className="mTop10" />
          )}
        </ChatPane>
      </div>
    </Con>
  );
}

export default withRouter(PlanPage);
