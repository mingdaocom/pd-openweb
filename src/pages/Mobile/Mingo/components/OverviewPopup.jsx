import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Icon, PopupWrapper } from 'ming-ui';
import { useAgentBus } from 'src/components/Agent/agentBus';
import {
  entryByKey,
  entryByPath,
  hasData,
  parseFile,
  SIDEBAR_ITEMS,
} from 'src/components/Agent/AppBuilder/fileRegistry';
import {
  AiAssistantsPanel,
  CustomActionsPanel,
  CustomPagesPanel,
  OverviewPanel,
  RolesPanel,
  WorkflowsPanel,
  WorksheetsPanel,
} from 'src/components/Agent/AppBuilder/panels';
import ScrollToBottom from './ScrollToBottom';

const PANEL_BY_KEY = {
  overview: ({ parsed }) => <OverviewPanel plan={parsed} />,
  roles: ({ parsed }) => <RolesPanel roles={parsed || []} />,
  worksheets: ({ parsed }) => <WorksheetsPanel worksheets={parsed || []} />,
  customPages: ({ parsed }) => <CustomPagesPanel pages={parsed || []} />,
  customActions: ({ parsed }) => <CustomActionsPanel customActions={parsed || []} />,
  workflows: ({ parsed }) => <WorkflowsPanel workflows={parsed || []} />,
  aiAssistants: ({ parsed }) => <AiAssistantsPanel pages={parsed || []} />,
};

const ICON_STYLE_BY_KEY = {
  overview: {
    color: 'var(--color-primary)',
    background: 'var(--color-primary-transparent-light)',
  },
  roles: {
    color: 'var(--color-error)',
    background: 'var(--color-error-bg)',
  },
  worksheets: {
    color: 'var(--color-warning)',
    background: 'var(--color-warning-bg)',
  },
  customPages: {
    color: 'var(--color-success)',
    background: 'var(--color-success-bg)',
  },
  customActions: {
    color: '#22BCD5',
    background: 'rgba(34, 188, 213, 0.1)',
  },
  workflows: {
    color: 'var(--color-info)',
    background: 'var(--color-info-bg)',
  },
  aiAssistants: {
    color: 'var(--color-mingo)',
    background: 'var(--color-mingo-transparent-light)',
  },
};

const STICK_TO_BOTTOM_OFFSET = 48;

function isScrollNearBottom(node) {
  return node.scrollHeight - node.scrollTop - node.clientHeight < STICK_TO_BOTTOM_OFFSET;
}

function hasOverflow(node) {
  return node.scrollHeight - node.clientHeight > STICK_TO_BOTTOM_OFFSET;
}

const OverviewScrollWrap = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
`;

const OverviewContent = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  scrollbar-width: none;
  padding: 16px;
  background: var(--color-background-card);
  &::-webkit-scrollbar {
    display: none;
  }
  .overviewEmpty {
    padding-top: 24px;
    text-align: center;
    color: var(--color-text-secondary);
  }
  .PanelWrap,
  > div {
    max-width: none;
  }
  .PanelWrap {
    gap: 12px;
  }
`;

const OverviewPopupInner = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const SectionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionBlock = styled.div`
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background: var(--color-background-card);
`;

const SectionHeader = styled.button`
  width: 100%;
  min-height: 64px;
  border: 0;
  padding: 10px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  background: var(--color-background-card);
  .tileIcon {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${p => p.$background};
    color: ${p => p.$color};
  }
  .tileIcon .icon {
    font-size: 22px;
  }
  .itemBody {
    min-width: 0;
    flex: 1;
  }
  .itemTitle {
    display: flex;
    align-items: baseline;
    gap: 8px;
    font-size: 17px;
    font-weight: 700;
    line-height: 22px;
    color: var(--color-text-primary);
  }
  .count {
    font-size: 13px;
    font-weight: 400;
    color: var(--color-text-primary);
  }
  .itemDesc {
    margin-top: 4px;
    font-size: 14px;
    line-height: 20px;
    color: var(--color-text-tertiary);
  }
  .foldIcon {
    flex-shrink: 0;
    font-size: 20px;
    color: var(--color-text-tertiary);
    transform: rotate(${p => (p.$collapsed ? '180deg' : '0deg')});
    transition: transform 0.2s;
  }
`;

const SectionBody = styled.div`
  border-top: 1px solid var(--color-border-secondary);
  padding: 12px 0;
  background: var(--color-background-card);
  button[aria-label='修改'] {
    display: none;
  }
  > div {
    max-width: none;
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: 0;
    box-shadow: none;
    background: transparent;
  }
`;

const OverviewFooter = styled.div`
  flex-shrink: 0;
  padding: 10px 14px calc(10px + env(safe-area-inset-bottom));
  background: var(--color-background-card);
  .generateBtn {
    width: 100%;
    height: 40px;
    border: 0;
    border-radius: 20px;
    color: var(--color-white);
    background: var(--color-mingo);
    font-size: 14px;
    font-weight: 600;
  }
  .generateBtn.loading {
    color: var(--color-mingo);
    background: var(--color-mingo-transparent-light);
  }
  .generateBtn.generating {
    color: var(--color-white);
    background: var(--color-mingo);
  }
  .generateLoadingIcon {
    color: currentColor;
    font-size: 16px;
    margin-right: 6px;
    animation: mingoGenerateLoading 0.75s linear infinite;
  }
  @keyframes mingoGenerateLoading {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

function tryParseFile(path, content) {
  const entry = entryByPath(path);

  if (!entry) return undefined;

  try {
    return parseFile(entry, content);
  } catch {
    return undefined;
  }
}

export function OverviewController({
  filesRef,
  setOverviewContent,
  setOverviewReady,
  setOverviewVisible,
  onFilesChange,
}) {
  const bus = useAgentBus();

  useEffect(() => {
    const isOverview = payload => payload && payload.path === '/plan.md';
    const openOverview = () => setOverviewVisible(true);

    const updateFile = (path, mutator) => {
      const entry = entryByPath(path);

      if (!entry) return;

      const cur = filesRef.current[path] || { content: '', parsed: entry.initial, status: 'idle' };
      const next = mutator(entry, cur);

      if (next) filesRef.current = { ...filesRef.current, [path]: next };
      if (next && onFilesChange) onFilesChange();
    };

    const handleBegin = payload => {
      if (!payload?.path) return;
      updateFile(payload.path, (entry, cur) => ({
        ...cur,
        content: '',
        parsed: entry.type === 'markdown' ? '' : cur.parsed,
        status: 'streaming',
      }));
      setOverviewReady(false);
      if (isOverview(payload)) {
        setOverviewContent('');
        openOverview();
      }
    };

    const handleDelta = payload => {
      if (!payload?.path) return;
      updateFile(payload.path, (entry, cur) => {
        const content = (cur.content || '') + (payload.delta || '');
        const parsed = entry.type === 'markdown' ? content : tryParseFile(payload.path, content) || cur.parsed;

        return { ...cur, content, parsed, status: 'streaming' };
      });
      setOverviewReady(false);
      if (isOverview(payload)) {
        setOverviewContent(content => content + (payload.delta || ''));
      }
    };

    const handleWrite = payload => {
      if (!payload?.path) return;
      updateFile(payload.path, (entry, cur) => {
        const parsed = tryParseFile(payload.path, payload.content || '');

        return {
          ...cur,
          content: payload.content || '',
          parsed: parsed !== undefined ? parsed : cur.parsed,
          status: 'ready',
        };
      });
      if (isOverview(payload)) {
        setOverviewContent(payload.content || '');
      }
    };

    const handleEnd = payload => {
      if (!payload?.path) return;
      updateFile(payload.path, (entry, cur) => {
        const parsed = tryParseFile(payload.path, cur.content || '');

        return { ...cur, parsed: parsed !== undefined ? parsed : cur.parsed, status: 'ready' };
      });
    };

    const handleAppMeta = ({ versionLabel, artifactId, versionId } = {}) => {
      if (versionLabel || artifactId || versionId) setOverviewReady(true);
    };

    const unsubs = [
      bus.on('file:begin', handleBegin),
      bus.on('file:delta', handleDelta),
      bus.on('file:end', handleEnd),
      bus.on('file:write', handleWrite),
      bus.on('app:meta', handleAppMeta),
      bus.on('mobile:open-overview', openOverview),
    ];

    return () => unsubs.forEach(unsub => unsub());
  }, [bus, filesRef, onFilesChange, setOverviewContent, setOverviewReady, setOverviewVisible]);

  return null;
}

function GenerateBar({ filesRef, ready, generating, onGenerateStart }) {
  const bus = useAgentBus();
  const disabled = !ready || generating;

  const handleGenerate = () => {
    if (disabled) return;
    onGenerateStart();
    bus.emit('builder:generate', { files: filesRef.current, source: 'mobile-overview' });
  };

  return (
    <OverviewFooter>
      <button
        type="button"
        className={
          disabled
            ? `generateBtn ${generating ? 'generating' : 'loading'} flexRow alignItemsCenter justifyContentCenter`
            : 'generateBtn'
        }
        disabled={disabled}
        onClick={handleGenerate}
      >
        {generating ? (
          <React.Fragment>
            <Icon className="generateLoadingIcon" icon="loading_button" />
            {_l('正在生成应用内容')}
          </React.Fragment>
        ) : ready ? (
          _l('生成应用')
        ) : (
          <React.Fragment>
            <Icon className="generateLoadingIcon" icon="loading_button" />
            {_l('正在生成应用规划，请稍候')}
          </React.Fragment>
        )}
      </button>
    </OverviewFooter>
  );
}

function getCount(key, parsed) {
  if (!Array.isArray(parsed)) return null;

  if (key === 'customActions') {
    return parsed.reduce((sum, group) => sum + (Array.isArray(group && group.actions) ? group.actions.length : 0), 0);
  }

  return parsed.length;
}

function getFileByKey(filesRef, key) {
  const entry = entryByKey(key);

  if (!entry || !entry.file) return undefined;
  return filesRef.current[entry.file];
}

function PlanPanel({ activeKey, filesRef, content }) {
  const entry = entryByKey(activeKey);

  if (!entry || !entry.file) return null;

  const file = getFileByKey(filesRef, activeKey);
  const parsed = activeKey === 'overview' ? content || (file && file.parsed) : file && file.parsed;
  const renderUI = PANEL_BY_KEY[activeKey];

  if (renderUI) return renderUI({ parsed });

  return null;
}

function getGeneratedItems(filesRef, content) {
  return SIDEBAR_ITEMS.filter(item => {
    const file = getFileByKey(filesRef, item.key);

    if (item.key === 'overview' && content) return true;
    if (file && file.status === 'streaming') return true;
    return hasData(file);
  });
}

export default function OverviewPopup({
  visible,
  content,
  ready,
  generating,
  filesRef,
  filesVersion = 0,
  onClose,
  onGenerateStart,
}) {
  const [collapsedKeys, setCollapsedKeys] = useState({});
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const contentRef = useRef(null);
  const stickToBottomRef = useRef(true);
  const lastScrollTopRef = useRef(0);
  const userScrollIntentRef = useRef(false);
  const userScrollTimerRef = useRef(null);
  const generatedItems = getGeneratedItems(filesRef, content);

  useEffect(() => {
    if (visible && !ready) {
      const node = contentRef.current;

      stickToBottomRef.current = true;
      userScrollIntentRef.current = false;
      if (node) lastScrollTopRef.current = node.scrollTop;
    }
  }, [ready, visible]);

  useEffect(
    () => () => {
      if (userScrollTimerRef.current) clearTimeout(userScrollTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!visible) return undefined;

    const raf = requestAnimationFrame(() => {
      const node = contentRef.current;

      if (!node) return;

      if (!ready && stickToBottomRef.current) {
        node.scrollTop = node.scrollHeight;
        lastScrollTopRef.current = node.scrollTop;
      }

      setShowScrollBottom(hasOverflow(node) && !isScrollNearBottom(node));
    });

    return () => cancelAnimationFrame(raf);
  }, [content, filesVersion, ready, visible]);

  const markUserScrollIntent = () => {
    userScrollIntentRef.current = true;
    if (userScrollTimerRef.current) clearTimeout(userScrollTimerRef.current);
    userScrollTimerRef.current = setTimeout(() => {
      userScrollIntentRef.current = false;
    }, 500);
  };

  const handleContentScroll = () => {
    const node = contentRef.current;

    if (!node) return;

    const scrollTop = node.scrollTop;
    const scrolledUp = scrollTop < lastScrollTopRef.current;
    const isNearBottom = isScrollNearBottom(node);

    lastScrollTopRef.current = scrollTop;
    setShowScrollBottom(hasOverflow(node) && !isNearBottom);

    if (ready) return;

    if (!userScrollIntentRef.current && !scrolledUp) {
      if (isNearBottom) stickToBottomRef.current = true;
      return;
    }

    stickToBottomRef.current = isNearBottom;
  };

  const scrollToBottom = () => {
    const node = contentRef.current;

    if (!node) return;

    stickToBottomRef.current = true;
    userScrollIntentRef.current = false;
    node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' });
    lastScrollTopRef.current = node.scrollTop;
  };

  return (
    <PopupWrapper
      visible={visible}
      onClose={onClose}
      title=""
      headerType="withIcon"
      headerTitleAlign="left"
      bodyClassName="heightPopupBody40"
    >
      <OverviewPopupInner>
        <OverviewScrollWrap>
          <OverviewContent
            ref={contentRef}
            onScroll={handleContentScroll}
            onTouchMove={markUserScrollIntent}
            onWheel={markUserScrollIntent}
          >
            {generatedItems.length ? (
              <SectionList>
                {generatedItems.map(item => {
                  const file = getFileByKey(filesRef, item.key);
                  const count = getCount(item.key, file && file.parsed);
                  const iconStyle = ICON_STYLE_BY_KEY[item.key] || ICON_STYLE_BY_KEY.overview;
                  const collapsed = !!collapsedKeys[item.key];

                  return (
                    <SectionBlock key={item.key}>
                      <SectionHeader
                        type="button"
                        $color={iconStyle.color}
                        $background={iconStyle.background}
                        $collapsed={collapsed}
                        onClick={() =>
                          setCollapsedKeys(prev => ({
                            ...prev,
                            [item.key]: !prev[item.key],
                          }))
                        }
                      >
                        <span className="tileIcon">
                          <Icon icon={item.icon} />
                        </span>
                        <span className="itemBody">
                          <span className="itemTitle">
                            <span>{item.title}</span>
                            {count !== null && <span className="count">{count}</span>}
                          </span>
                          <span className="itemDesc">{item.description}</span>
                        </span>
                        <Icon className="foldIcon" icon="expand_more" />
                      </SectionHeader>
                      {!collapsed && (
                        <SectionBody>
                          <PlanPanel activeKey={item.key} filesRef={filesRef} content={content} />
                        </SectionBody>
                      )}
                    </SectionBlock>
                  );
                })}
              </SectionList>
            ) : (
              <div className="overviewEmpty">{_l('正在生成应用规划，请稍候')}</div>
            )}
          </OverviewContent>
          {visible && showScrollBottom && <ScrollToBottom onClick={scrollToBottom} />}
        </OverviewScrollWrap>
        <GenerateBar filesRef={filesRef} ready={ready} generating={generating} onGenerateStart={onGenerateStart} />
      </OverviewPopupInner>
    </PopupWrapper>
  );
}
