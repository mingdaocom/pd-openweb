import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import homeAppAjax from 'src/api/homeApp';
import { emitter, pathCompletion } from 'src/utils/common';
import { useAgentBus, useAgentEvent } from '../agentBus';
import { AGENT_HEADER_EVENT, fetchBuildEstimate } from '../agentService';
import { IS_DEBUG } from '../debug';
import { entryByKey, entryByPath } from './fileRegistry';
import Header from './Header';
import {
  AiAssistantsPanel,
  CustomActionsPanel,
  CustomPagesPanel,
  OtherPanel,
  OverviewPanel,
  RolesPanel,
  WorkflowsPanel,
  WorksheetsPanel,
} from './panels';
import PreviewFrame from './PreviewFrame';
import Sidebar from './Sidebar';
import SkeletonPanel from './SkeletonPanel';
import { useFileStore } from './useFileStore';

// 让 panels 内的 CardEditButton 也能读到 chat 提交状态：
// AppBuilder 是常驻 portal，chat:submitting 事件不会错过；plan-card 到达后才挂载的 CardEditButton
// 自己订阅会丢初始事件，改从 Context 取
export const ChatStateContext = createContext({ submitting: false, pendingEdits: [] });

const Wrap = styled.div`
  display: flex;
  background: var(--color-background-secondary);
  overflow: hidden;

  /* 落地页三栏（split）：作为中栏在文档流里 flex 占位，对话在右栏并排；
     非 split（应用内抽屉 / 官网 embed）：absolute 铺满 #containerWrapper 作搭建/预览浮层。 */
  ${p =>
    p.$split
      ? `position: relative; flex: 1; min-width: 0; height: 100%; order: 1;`
      : `position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 21;`}
`;

const Main = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px 30px;
`;

// 预览 overlay：盖在 Sidebar+Main 之上，自带 Header + iframe；不替换 AppBuilder 原本内容
const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 30;
  display: flex;
  flex-direction: column;
  background: var(--color-background-overlay-white);
`;

const PreviewWrap = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  padding: 0 21px 24px;
  background: var(--color-background-secondary);
`;

// build agent step → sidebar tab：拿到 appId 后自动 setFocus 让 iframe 跟随
const STEP_TO_SIDEBAR_KEY = {
  'step-build-worksheets': 'worksheets',
  // 补表关联仍在工作表上加字段，停留在工作表 tab 让用户看到关联字段陆续出现
  'step-build-relations': 'worksheets',
  // 建页面空壳跳"自定义页面" tab（V5.x：仪表盘/工作台空壳 + 对话机器人合并为并行步
  // step-create-pages-and-chatbots，容器步自身发 workflow-step-start/completed，按容器 id 切 tab）
  'step-create-pages-and-chatbots': 'customPages',
  // V4.3 尾段并行：仪表盘/工作台/角色/工作流四步并发，无法逐个跟随；容器步（step-config-and-design）
  // 起始统一切到"自定义页面"（最直观的产物面），四个分支的 loop-start 不再各自切 tab，避免并发期抖动。
  'step-config-and-design': 'customPages',
};

// activeKey + 已知 ID 组合出 iframe src
// iframe 嵌入应用必须带 ?rp=no，避免主应用层的页头/侧栏在 iframe 内重复渲染
function buildPreviewUrl(
  activeKey,
  { appId, sectionIdByName, latestWorksheet, latestCustomPage, previewNonce, appLanguage },
) {
  if (!appId) return '';

  // sys_lang：与搭建应用 build stream 透传的 appLanguage（app.json.language）保持一致，
  // 让预览 iframe 按搭建语言渲染，避免预览语言与目标应用语言不一致。
  const withLang = appLanguage ? `&sys_lang=${encodeURIComponent(appLanguage)}` : '';
  const withRp = path => `${path}?rp=no${withLang}`;
  // 应用根这类静态预览 URL 不随产物变化，附加 nonce 让 src 变化以触发 PreviewFrame 重新导航刷新
  const withRefresh = path => `${withRp(path)}${previewNonce ? `&_r=${previewNonce}` : ''}`;

  switch (activeKey) {
    case 'roles':
      return withRp(`/app/${appId}/role`);
    case 'workflows':
      return withRp(`/app/${appId}/workflow`);
    case 'worksheets': {
      // 优先跳最近 iteration-completed 透出的具体 worksheet（含真实 worksheetId + sectionId）
      if (latestWorksheet && latestWorksheet.worksheetId && latestWorksheet.sectionId) {
        return withRp(`/app/${appId}/${latestWorksheet.sectionId}/${latestWorksheet.worksheetId}`);
      }

      const firstSection = Object.values(sectionIdByName || {})[0];

      return withRp(firstSection ? `/app/${appId}/${firstSection}` : `/app/${appId}`);
    }

    case 'customPages':
      // 自定义页面（仪表盘 + 工作台）：必须跳到被配置的具体页面 /app/{appId}/{sectionId}/{pageId}。
      // 跳应用根会被 HAP 重定向到默认空首页（非这些 dashboard），看着永远是空壳；带具体 pageId 后
      // 路由 routeKey 变化触发 getPageInfo 重拉，才会呈现配置后的组件。无具体页面时退回应用根。
      if (latestCustomPage && latestCustomPage.pageId && latestCustomPage.sectionId) {
        return withRefresh(`/app/${appId}/${latestCustomPage.sectionId}/${latestCustomPage.pageId}`);
      }

      return withRefresh(`/app/${appId}`);

    case 'customActions':
    case 'overview':
    default:
      return withRefresh(`/app/${appId}`);
  }
}

const DebugBar = styled.div`
  max-width: 762px;
  margin: 0 auto 12px;
  display: flex;
  justify-content: flex-end;
`;

const DebugToggle = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 26px;
  padding: 0 10px;
  border: 1px solid var(--color-border-secondary);
  border-radius: 4px;
  background: var(--color-background-card);
  color: var(--color-text-secondary);
  font-size: 12px;
  cursor: pointer;
  font-family: 'SFMono-Regular', 'SF Mono', Menlo, Consolas, monospace;

  &:hover {
    border-color: var(--color-border-hover);
    color: var(--color-text-primary);
  }
`;

const RawJson = styled.pre`
  max-width: 762px;
  margin: 0 auto;
  padding: 16px 18px;
  border: 1px solid var(--color-border-secondary);
  border-radius: 8px;
  background: var(--color-background-card);
  color: var(--color-text-primary);
  font-family: 'SFMono-Regular', 'SF Mono', Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 18px;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-x: auto;
`;

const PANEL_BY_KEY = {
  overview: ({ parsed }) => <OverviewPanel plan={parsed} />,
  roles: ({ parsed }) => <RolesPanel roles={parsed || []} />,
  worksheets: ({ parsed }) => <WorksheetsPanel worksheets={parsed || []} />,
  customPages: ({ parsed }) => <CustomPagesPanel pages={parsed || []} />,
  customActions: ({ parsed }) => <CustomActionsPanel customActions={parsed || []} />,
  workflows: ({ parsed }) => <WorkflowsPanel workflows={parsed || []} />,
  aiAssistants: ({ parsed }) => <AiAssistantsPanel pages={parsed || []} />,
};

function useStickyScroll(visible, focus, focusedContent) {
  const ref = useRef(null);
  const stickRef = useRef(true);

  useEffect(() => {
    const node = ref.current;

    if (!node) return undefined;
    const onUserScroll = () => {
      stickRef.current = false;
    };

    node.addEventListener('wheel', onUserScroll, { passive: true });
    node.addEventListener('touchmove', onUserScroll, { passive: true });
    node.addEventListener('keydown', onUserScroll);
    return () => {
      node.removeEventListener('wheel', onUserScroll);
      node.removeEventListener('touchmove', onUserScroll);
      node.removeEventListener('keydown', onUserScroll);
    };
  }, [visible]);

  useEffect(() => {
    if (!stickRef.current) return;
    const node = ref.current;

    if (!node) return;
    node.scrollTop = node.scrollHeight;
    requestAnimationFrame(() => {
      if (stickRef.current && ref.current) ref.current.scrollTop = ref.current.scrollHeight;
    });
  }, [visible, focus, focusedContent]);

  const reset = useCallback(() => {
    stickRef.current = true;
  }, []);

  return [ref, reset];
}

export default function AppBuilder({
  visible = true,
  isSingleMingoPlan = false,
  split = false,
  sidebarCollapsed = false,
}) {
  const bus = useAgentBus();
  const { files, focus, setFocus, sidebarItems } = useFileStore();
  const [appMeta, setAppMeta] = useState({
    name: '',
    versionLabel: '',
    appId: '',
    sectionIdByName: {},
    sessionId: '',
    // 当前 plan 产物：拉 build 费用预估用（getAgentBuildEstimate 按 artifactId 取，versionId 变化时重取）
    artifactId: '',
    versionId: '',
  });
  // build 费用预估（信用点）：null = 未返回 / 取不到（渲染「计算中…」）；loading 控制提交后到返回前的过渡
  const [estimateCredits, setEstimateCredits] = useState(null);
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [buildPhase, setBuildPhase] = useState('idle'); // 'idle' | 'building' | 'completed' | 'failed'
  const [showRawJson, setShowRawJson] = useState(false);
  // build 阶段 iframe 跟随的"虚拟 activeKey"，由 sse:step-progress 推动
  const [previewKey, setPreviewKey] = useState('overview');
  // 预览刷新令牌：自定义页面/对话机器人无独立 worksheetId，预览 URL 恒为应用根，src 不变不会触发
  // PreviewFrame 重导航；这类步骤完成时 bump 此值，让预览 URL 变化以刷新左侧结构与页面内容
  const [previewNonce, setPreviewNonce] = useState(0);
  // chat panel 正在请求中（plan streaming 或 build 进行中）：禁用「生成应用」按钮
  const [chatSubmitting, setChatSubmitting] = useState(false);
  // 「生成应用」点击后到搭建真正发起前的过渡态：预检为异步，这段窗口立即禁用按钮（文案仍是「生成应用」），
  // 给即时反馈 + 防重复点击；提交成功由 chatSubmitting 接力，预检被拦则恢复可点。
  const [kickingOff, setKickingOff] = useState(false);
  // 待提交的卡片修改（由 ChatPanel 广播）：卡片「修改」icon 据此常驻高亮 + 回显
  const [pendingEdits, setPendingEdits] = useState([]);
  // 预览 overlay 显隐：appId 拿到自动开；arrow_back 手动关；buildPhase=completed 自动关
  const [overlayOpen, setOverlayOpen] = useState(false);
  // 最近一次 build 出来的 worksheet：{ worksheetId, sectionId, name }；用来把 iframe 跳到该工作表
  const [latestWorksheet, setLatestWorksheet] = useState(null);
  // 自定义页面空壳建好后透出的 [{ name, pageId }] 列表（含真实 pageId）；配置完成时据此把预览导航到具体页面
  const customPagesRef = useRef([]);
  // 当前要在预览里展示的自定义页面：{ sectionId, pageId }；驱动 buildPreviewUrl 跳到具体页面。
  const [latestCustomPage, setLatestCustomPage] = useState(null);
  // 建表阶段累积的 name → { worksheetId, sectionId } 映射；供视图配置阶段按 name 反查工作表跳转
  const worksheetByNameRef = useRef({});
  // 本会话已用于搭建的方案版本集合（versionLabel → true）：命中当前版本时「生成应用」转为已搭建态
  const [builtVersions, setBuiltVersions] = useState({});
  // 正在搭建的版本 label：build 失败时据此回滚 builtVersions，恢复「生成应用」可点
  const pendingBuildLabelRef = useRef('');
  // 点击历史卡片加载已提交版本文件期间：内容区显示骨架屏（实时流式不发该事件，不受影响）
  const [loadingFiles, setLoadingFiles] = useState(false);

  const focusedEntry = focus ? entryByPath(focus) : null;
  const focusedKey = focusedEntry ? focusedEntry.key : null;
  // focus 可能停在一个「无数据被侧栏过滤掉」的 tab 上（典型：方案不含 AI 助手时，流式末尾 focus 落在空的
  // ai-assistants.json）；此时该 tab 不在侧栏里，会出现「无选中项 + 右侧空白」。回落到侧栏中实际存在的最后一项
  // （流式自然停在末尾产物），都没有则退化到 overview。
  const sidebarHasKey = focusedKey && sidebarItems.some(it => it.key === focusedKey);
  const activeKey = sidebarHasKey
    ? focusedKey
    : sidebarItems.length
      ? sidebarItems[sidebarItems.length - 1].key
      : 'overview';
  const activeTitle = (entryByKey(activeKey) || {}).title || '';
  const focusedContent = focus && files[focus] ? files[focus].content : '';
  const [scrollRef, resetScroll] = useStickyScroll(visible, focus, focusedContent);

  useAgentEvent('file:begin', resetScroll);
  useAgentEvent(
    'app:meta',
    ({ name, versionLabel, appId, sectionIdByName, sessionId, artifactId, versionId, built } = {}) => {
      setAppMeta(prev => ({
        name: name || prev.name,
        versionLabel: versionLabel || prev.versionLabel,
        // built 为显式布尔（打开历史卡片：已搭建 true / 未搭建 false）时，用本次 appId 覆盖（空串即清残留），
        // 避免上一张已搭建卡片的 appId 漏到当前卡片（含已搭建版本 appId 解析失败的情况）；
        // 仅实时流式（built===undefined）维持「有则取、无则保留」语义
        appId: built === undefined ? appId || prev.appId : appId || '',
        sectionIdByName: sectionIdByName || prev.sectionIdByName,
        sessionId: sessionId || prev.sessionId,
        artifactId: artifactId || prev.artifactId,
        versionId: versionId || prev.versionId,
      }));
      if (appId) setOverlayOpen(true);

      // 历史会话还原「已搭建」完成态：标记该版本已搭建 + 切完成态；停在标签视图（不自动展开预览 overlay），
      // Sidebar 显示「打开应用」、Header 显示「已使用 v* 搭建」。
      if (built === true && versionLabel) {
        setBuiltVersions(prev => ({ ...prev, [versionLabel]: true }));
        setBuildPhase('completed');
        setOverlayOpen(false);
      } else if (built === false) {
        // 切回未搭建版本：清掉残留的完成态，恢复「生成应用」可点
        setBuildPhase('idle');
      }
    },
  );

  // 清掉待搭建/已搭建标记，让「生成应用」恢复可点。用于：搭建失败（撤销 building 时打的「已搭建」），
  // 以及预检（无创建权限 / 工作表超上限）拦截、搭建未发起（此时仅清待搭建版本，尚未标「已搭建」）。
  function rollbackPendingBuild() {
    const label = pendingBuildLabelRef.current;

    if (!label) return;
    pendingBuildLabelRef.current = '';
    setBuiltVersions(prev => {
      const next = { ...prev };

      delete next[label];
      return next;
    });
  }

  useAgentEvent('build:phase', phase => {
    if (!phase) return;
    setBuildPhase(phase);
    if (phase === 'completed') setOverlayOpen(false);
    // 搭建失败：撤销该版本的已搭建标记，让「生成应用」恢复可点以便重试
    if (phase === 'failed') rollbackPendingBuild();
  });

  // 预检通过、搭建消息已发送：此刻起把按钮文案切成「已使用 v* 搭建」（禁用），对齐"消息发送即真实触发搭建"
  useAgentEvent('builder:generate-accepted', () => {
    const label = pendingBuildLabelRef.current;

    if (label) setBuiltVersions(prev => ({ ...prev, [label]: true }));
  });

  // 预检拦截（无创建权限 / 工作表超上限）：搭建未发起，解除发起中过渡态让按钮恢复可点，并清掉待搭建标记
  useAgentEvent('builder:generate-rejected', () => {
    setKickingOff(false);
    rollbackPendingBuild();
  });

  useAgentEvent('chat:submitting', value => {
    setChatSubmitting(!!value);
    // 搭建已真正发起（submitting 置位）：交接给 chatSubmitting 维持禁用，清掉过渡态
    if (value) setKickingOff(false);
  });

  useAgentEvent('chat:pending-edits', value => setPendingEdits(Array.isArray(value) ? value : []));

  useAgentEvent('builder:loading', value => setLoadingFiles(!!value));

  // 点对话里的方案便签（SchemePill）重新打开搭建预览：覆盖「继续搭建未自动弹出」「中途手动关闭后想重看」
  // 等场景。只要已拿到 appId 就允许重开（搭建中跟随进度，完成态回看成品），无 appId 时无可预览不处理。
  useAgentEvent('builder:open-preview', () => {
    if (appMeta.appId) setOverlayOpen(true);
  });

  // ESC 关闭：预览 overlay 打开时先关 overlay，否则关闭整个搭建/预览面板（等价右上角 X）
  useEffect(() => {
    if (!visible) return;
    const onKeyDown = e => {
      if (e.key !== 'Escape') return;
      if (overlayOpen) setOverlayOpen(false);
      else bus.emit('builder:close');
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [visible, overlayOpen, bus]);

  // build 进度自动跟随：把 iframe 拉到刚被建造的实体页（completed 后不再覆盖，让用户自由探索）
  useAgentEvent('sse:step-progress', ({ stepId, status } = {}) => {
    console.log('[preview-trace] 2.recv sse:step-progress', { stepId, status });
    const key = STEP_TO_SIDEBAR_KEY[stepId];

    if (!key) return;

    if (status === 'running') {
      console.log('[preview-trace] 3.setPreviewKey', key);
      setPreviewKey(key);
    }

    // 自定义页面/对话机器人这类产物建好后，预览 URL 不会变，需主动 bump nonce 触发重导航刷新
    if (key === 'customPages' && status === 'completed') {
      setPreviewNonce(n => n + 1);
    }
  });

  // 自定义页面空壳建好：缓存 [{ name, pageId }] 列表（含真实 pageId），供配置完成时按 index 取页导航。
  useAgentEvent('sse:custom-pages-created', ({ pages } = {}) => {
    console.log('[preview-trace] 0.recv custom-pages-created', { count: Array.isArray(pages) ? pages.length : 0 });
    if (Array.isArray(pages)) customPagesRef.current = pages;
  });

  // 跳到指定自定义页面：pageId 已知，getAppSimpleInfo 反查 sectionId，跳到 /app/:appId/:sectionId/:pageId。
  // 预览走软导航（PreviewFrame 的 refreshFirst：push 前先 await 刷新 sheetList，让新页面进入应用结构再跳，
  // WorkSheet 能识别并渲染，pageContent 按 pageId 变化自动重拉配置），不整页 reload。
  function focusCustomPage(pageId) {
    if (!pageId) return;
    homeAppAjax
      .getAppSimpleInfo({ workSheetId: pageId }, { silent: true })
      .then(info => {
        if (info && info.appSectionId) {
          console.log('[preview-trace] 10b.focusCustomPage', { pageId, sectionId: info.appSectionId });
          setPreviewKey('customPages');
          setLatestCustomPage({ pageId, sectionId: info.appSectionId });
        }
      })
      .catch(() => {});
  }

  // 单个自定义页面真实配置完成：配置内容写进了具体 pageId，但预览默认跳应用根会被 HAP 重定向到默认空首页。
  // 这里按 index 取出被配置页面的真实 pageId，把预览精确导航过去——pageId 与默认首页不同，routeKey 变化即触发
  // WorkSheet 的 getPageInfo 重拉（纯前端 SPA 软刷新，无整页 reload），呈现配置后的组件。
  useAgentEvent('sse:custom-page-built', ({ index = 0 } = {}) => {
    const list = customPagesRef.current || [];
    const page = list[index] || list[0];

    console.log('[preview-trace] 10.recv custom-page-built', { index, pageId: page && page.pageId });
    if (page && page.pageId) focusCustomPage(page.pageId);
  });

  // 跳到指定 worksheet：worksheetId 已知，sectionId 优先复用建表阶段缓存，缺失时 getAppSimpleInfo 反查。
  // 解析到 sectionId 后存为 latestWorksheet，触发 iframe 跳到 /app/:appId/:sectionId/:worksheetId；
  // 工作表 loadWorksheet 不走缓存，worksheetId 变化会重新拉取并呈现最新视图。switchTab=true 时顺带把侧栏切到工作表 tab。
  function focusWorksheet({ worksheetId, name, switchTab }) {
    if (!worksheetId) return;

    const apply = sectionId => {
      if (!sectionId) return;
      if (switchTab) setPreviewKey('worksheets');
      setLatestWorksheet({ worksheetId, sectionId, name });
      // 顺手维护 name → { worksheetId, sectionId } 缓存与 sectionIdByName（分组首页兜底 + 后续按名复用）
      if (name) {
        worksheetByNameRef.current[name] = { worksheetId, sectionId };
        setAppMeta(prev => ({
          ...prev,
          sectionIdByName: { ...(prev.sectionIdByName || {}), [name]: sectionId },
        }));
      }
    };

    // 同名且 worksheetId 一致时复用缓存的 sectionId，省一次请求
    const cached = name ? worksheetByNameRef.current[name] : null;

    if (cached && cached.sectionId && cached.worksheetId === worksheetId) {
      apply(cached.sectionId);
      return;
    }

    homeAppAjax
      .getAppSimpleInfo({ workSheetId: worksheetId }, { silent: true })
      .then(info => info && info.appSectionId && apply(info.appSectionId))
      .catch(() => {});
  }

  // 单个 worksheet 建好：跳到该表（previewKey 已由 step-build-worksheets 的 sse:step-progress 切到工作表 tab）
  useAgentEvent('sse:worksheet-built', ({ worksheetId, name } = {}) => {
    console.log('[preview-trace] 7.worksheet built', { worksheetId, name });
    focusWorksheet({ worksheetId, name, switchTab: false });
  });

  // 单个 worksheet 视图/动作配完：worksheetId 直接来自事件，跳回该表重新拉取，呈现新建的视图
  useAgentEvent('sse:worksheet-views-built', ({ worksheetId, name } = {}) => {
    console.log('[preview-trace] 8.worksheet views built', { worksheetId, name });
    focusWorksheet({ worksheetId, name, switchTab: true });
  });

  // 子实体精确 ID 兜底：拿到 appId 后 silent 拉取应用结构，给 buildPreviewUrl 留 hook
  useEffect(() => {
    if (!appMeta.appId) return undefined;
    let cancelled = false;

    homeAppAjax
      .getApp({ appId: appMeta.appId, getSection: true }, { silent: true })
      .then(detail => {
        if (cancelled || !detail) return;
        // 留位：后续可消费 detail.sections / .items，把名字 → 真实 worksheetId 映射进 buildPreviewUrl
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [appMeta.appId]);

  function setActiveKey(key) {
    const entry = entryByKey(key);

    setFocus((entry && entry.file) || null);
  }

  // 方案是否含工作表：工作表是应用的最小数据载体，无工作表的空方案搭建无意义，禁止生成。
  const worksheetsEntry = entryByKey('worksheets');
  const worksheetsParsed = worksheetsEntry && files[worksheetsEntry.file] && files[worksheetsEntry.file].parsed;
  const hasWorksheets = Array.isArray(worksheetsParsed) && worksheetsParsed.length > 0;

  // 预估费用只在「生成应用」可点态才计算：plan 已生成完（无在途流）、含工作表、非 build 视图（无 appId）、
  // 当前版本未被搭建。与按钮可点条件严格对齐，避免 plan 流式途中 / 已进搭建后还去打预估接口。
  // 非平台版（platformENV.isPlatform 为 false，如普通私有部署）无信用点计费体系：不拉预估，
  // estimateCredits / estimateLoading 保持空值，Header 的「预估消耗」随之不展示。
  const canEstimate =
    window.platformENV.isPlatform &&
    !!appMeta.artifactId &&
    !appMeta.appId &&
    !chatSubmitting &&
    hasWorksheets &&
    !(appMeta.versionLabel && builtVersions[appMeta.versionLabel]);

  // 满足可点态后按 artifactId/versionId 拉取并轮询（后端异步算，status!=='ready' 每 2s 重试至多 15 次 ≈ 30s）；
  // 不满足（plan 未就绪 / 在途 / 已搭建）清空，Header 据此显示「计算中…」占位。
  useEffect(() => {
    if (!canEstimate) {
      const resetTimer = setTimeout(() => {
        setEstimateCredits(null);
        setEstimateLoading(false);
      }, 0);

      return () => clearTimeout(resetTimer);
    }

    let cancelled = false;
    let timer = null;
    let attempts = 0;
    const MAX_ATTEMPTS = 15;

    const run = () => {
      attempts += 1;
      fetchBuildEstimate(appMeta.artifactId, appMeta.versionId).then(({ status, credits }) => {
        if (cancelled) return;
        if (status === 'ready') {
          setEstimateCredits(credits);
          setEstimateLoading(false);
        } else if (status !== 'error' && attempts < MAX_ATTEMPTS) {
          timer = setTimeout(run, 2000);
        } else {
          setEstimateLoading(false);
        }
      });
    };

    timer = setTimeout(() => {
      if (cancelled) return;
      setEstimateLoading(true);
      setEstimateCredits(null);
      run();
    }, 0);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [canEstimate, appMeta.artifactId, appMeta.versionId]);

  // 点击「生成应用」：仅记录待搭建的方案版本（供消息发送标记 / 失败回滚定位），不在此乐观标「已搭建」——
  // 文案改为「已使用 v* 搭建」要等预检通过、搭建消息发送（builder:generate-accepted）后再切，
  // 避免预检被拦时按钮误显已搭建。
  function handleGenerate() {
    // 兜底：无工作表数据时不发起搭建（按钮已禁用，此处防其它触发路径）
    if (!hasWorksheets) return;

    pendingBuildLabelRef.current = appMeta.versionLabel || '';
    // 点击即禁用（仍显示「生成应用」），覆盖异步预检窗口；发起结果出来后由 chatSubmitting / generate-rejected 接管
    setKickingOff(true);
    bus.emit('builder:generate', { files });
  }

  function renderPanel() {
    const entry = entryByKey(activeKey);

    if (!entry || !entry.file) return <OtherPanel />;
    const file = files[entry.file];
    const parsed = file && file.parsed;
    const renderUI = PANEL_BY_KEY[entry.key] || (() => <OtherPanel />);

    if (IS_DEBUG && entry.type === 'json') {
      return (
        <>
          <DebugBar>
            <DebugToggle type="button" onClick={() => setShowRawJson(v => !v)}>
              <Icon icon={showRawJson ? 'preview' : 'code'} />
              {showRawJson ? _l('查看 UI') : _l('查看 JSON')}
            </DebugToggle>
          </DebugBar>
          {showRawJson ? <RawJson>{(file && file.content) || ''}</RawJson> : renderUI({ parsed })}
        </>
      );
    }

    return renderUI({ parsed });
  }

  if (!visible) return null;

  // 应用图标/主色/语言：plan 产出的 /jsons/app.json（流式进 file store），规划期即可读到。
  const appMetaFile = files['/jsons/app.json'];
  const appMetaParsed = (appMetaFile && appMetaFile.parsed) || {};

  const hasAppId = !!appMeta.appId;
  const previewUrl = hasAppId
    ? buildPreviewUrl(previewKey, {
        ...appMeta,
        latestWorksheet,
        latestCustomPage,
        previewNonce,
        // appLanguage 即 build stream 透传的应用语言，作为预览 URL 的 sys_lang
        appLanguage: appMetaParsed.language,
      })
    : '';

  if (overlayOpen) {
    console.log(
      '[preview-trace] 4.render previewUrl=',
      previewUrl,
      '| key=',
      previewKey,
      '| latestWorksheet=',
      latestWorksheet,
    );
  }

  // 主视图状态盒：只在拿到 appId 后显示（plan 阶段不显示）
  const mainStatus = hasAppId ? buildPhase : 'idle';
  const inBuild = !!hasAppId;

  // 空窗骨架：已拿到应用元信息（app.json 在流式 / 已有字段）但还没有任何 tab 数据时，左右都用骨架占位，
  // 避免「左侧空列表 + 右侧空白卡片」的难看中间态。覆盖首次生成的起步阶段、整套重写的重置窗口，
  // 以及历史版本加载（loadingFiles）。一旦出现第一个 tab（sidebarItems 非空）即恢复正常渲染。
  const hasMeta = !!appMetaFile && (appMetaFile.status === 'streaming' || Object.keys(appMetaParsed).length > 0);
  const showSkeleton = loadingFiles || (sidebarItems.length === 0 && hasMeta);
  const showEmptyPlaceholder = split && !loadingFiles && !hasAppId && !hasMeta && sidebarItems.length === 0;

  // 当前查看的方案版本若已在本会话用于搭建，则把版本号给 Header 渲染「已使用 Vx 搭建」
  const builtVersionLabel = appMeta.versionLabel && builtVersions[appMeta.versionLabel] ? appMeta.versionLabel : '';

  if (showEmptyPlaceholder) return <Wrap $split={split} data-mingo-app-builder="true" aria-hidden="true" />;

  return (
    <Wrap $split={split} data-mingo-app-builder="true">
      <Sidebar
        appName={appMetaParsed.appName || appMeta.name}
        appIcon={appMetaParsed.appIcon || ''}
        appColor={appMetaParsed.appColor || '#2E7D6C'}
        items={sidebarItems}
        loading={showSkeleton}
        activeKey={activeKey}
        onSelect={setActiveKey}
        buildStatus={mainStatus}
        // 落地页三栏 + 左栏已收起：应用 icon 左侧显示「展开会话列表」icon
        showSidebarExpand={split && sidebarCollapsed}
        onExpandSidebar={() => emitter.emit(AGENT_HEADER_EVENT.EXPAND_SIDEBAR)}
        onStatusClick={() => {
          if (!hasAppId) return;
          // 完成态：直接新开 tab 进入应用；进行中：重新打开预览 overlay
          if (mainStatus === 'completed') window.open(pathCompletion(`/app/${appMeta.appId}`), '_blank');
          else setOverlayOpen(true);
        }}
      />
      <Main>
        <Header
          activeTitle={activeTitle}
          appName={appMeta.name}
          inBuild={inBuild}
          onGenerate={handleGenerate}
          generateDisabled={chatSubmitting || kickingOff || !hasWorksheets}
          builtVersionLabel={builtVersionLabel}
          estimateCredits={estimateCredits}
          estimateLoading={estimateLoading}
          onClose={() => bus.emit('builder:close')}
          isSingleMingoPlan={isSingleMingoPlan}
        />
        <Content ref={scrollRef}>
          <ChatStateContext.Provider value={{ submitting: chatSubmitting, pendingEdits }}>
            {showSkeleton ? <SkeletonPanel /> : renderPanel()}
          </ChatStateContext.Provider>
        </Content>
      </Main>

      {overlayOpen && hasAppId && (
        <Overlay>
          <Header
            appName={appMeta.name}
            inBuild
            inOverlay
            buildStatus={buildPhase}
            onBack={() => setOverlayOpen(false)}
            onClose={() => bus.emit('builder:close')}
            isSingleMingoPlan={isSingleMingoPlan}
          />
          <PreviewWrap>
            <PreviewFrame
              src={previewUrl}
              refreshFirst={previewKey === 'customPages' && !!(latestCustomPage && latestCustomPage.pageId)}
            />
          </PreviewWrap>
        </Overlay>
      )}
    </Wrap>
  );
}
