import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import { AgentBusProvider } from 'src/components/Agent/agentBus';
import { fetchSharedSessionMessages } from 'src/components/Agent/agentService';
import { Conversation } from 'src/components/Agent/ui/Conversation';
import { extractAsk, getEmbedComponent } from 'src/components/Agent/ui/embed';
import { Message, MessageContent, MessageResponse } from 'src/components/Agent/ui/Message';
import PlanCard from 'src/components/Agent/ui/PlanCard';
import WorkPhase from 'src/components/Agent/ui/WorkPhase';
import AddedFiles from 'src/components/Mingo/ChatBot/components/AddedFiles';

// 单页硬上限 100（与分享读取接口契约一致）；分享页只做只读浏览，先取首屏 100 条
const PAGE_SIZE = 100;

const MessagesWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 880px;
  margin: 0 auto;
  padding: 20px 0 40px;
  .emptyStatus {
    padding: 60px 0;
    text-align: center;
    font-size: 14px;
    color: var(--color-text-tertiary);
  }
`;

// 用户消息纯文本（不走 markdown，保留换行）——与正常聊天 ChatPanel 的 PlainUserText 一致
const PlainUserText = styled.div`
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
`;

// 只读渲染单个 part：复用与正常聊天同一批展示组件，字号/气泡/卡片同源。
// 只处理历史里会出现的 kind（text / embed / plan-card / work / attachment）；
// 实时态 kind（reasoning / build-progress / tool / error / 确认卡）在只读历史里不会出现，忽略。
function ReadonlyPart({ part, role, message }) {
  if (part.kind === 'attachment') {
    return (
      <AddedFiles
        readonly
        // 预览与下载都要打登录态接口，分享页是匿名访问，点开只会报服务异常，这里直接禁掉交互
        disableActions
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

    // 用 createElement 而非 <Embed/>：动态组件走 JSX 会触发 react-hooks/static-components 告警（与 ChatPanel PartView 一致）
    return Embed ? React.createElement(Embed, { data: part.data }) : null;
  }

  if (part.kind === 'plan-card') {
    return (
      <PlanCard
        status={part.status || 'committed'}
        title={part.name ? _l('%0 搭建方案', part.name) : undefined}
        // 分享态不展示应用图标，也不补拉 app meta（fetchArtifactAppMeta），图标区整体隐藏；
        // 无页内 AppBuilder，卡片纯展示不可点击（不传 onClick 即无手型、无 button 角色）
        hideIcon
        versionLabel={part.versionLabel}
        built={part.built}
      />
    );
  }

  if (part.kind === 'work') {
    return <WorkPhase items={part.children} startedAt={part.ts} finishedAt={part.finishedAt} />;
  }

  if (role === 'user') {
    return <PlainUserText>{part.text}</PlainUserText>;
  }

  // assistant 正文：剥掉 mingo_ask 提问围栏（交互卡仅实时对话底部 dock，历史不内联渲染），其余走 markdown
  const { text } = extractAsk(part.text || '');

  return text.trim() ? <MessageResponse role={role}>{text}</MessageResponse> : null;
}

// 只读渲染一条消息：镜像正常聊天 MessageRow 的结构——附件、embed（非 ask）走气泡外满宽卡，
// 其余（text / work / plan-card）进 MessageContent 气泡；用同一批展示组件保证字号/样式同源。
function ReadonlyMessage({ message }) {
  const parts = message.parts || [];
  const role = message.role;
  const attachmentParts = parts.filter(p => p.kind === 'attachment');
  const embedParts = parts.filter(p => p.kind === 'embed' && p.suffix !== 'ask');
  const bubbleParts = parts.filter(p => p.kind !== 'attachment' && p.kind !== 'embed');

  return (
    <Message role={role}>
      {attachmentParts.map((part, idx) => (
        <ReadonlyPart key={`a-${idx}`} part={part} role={role} message={message} />
      ))}
      {embedParts.map((part, idx) => (
        <ReadonlyPart key={`e-${idx}`} part={part} role={role} message={message} />
      ))}
      {bubbleParts.length > 0 && (
        <MessageContent role={role}>
          {bubbleParts.map((part, idx) => (
            <ReadonlyPart key={`b-${idx}`} part={part} role={role} message={message} />
          ))}
        </MessageContent>
      )}
    </Message>
  );
}

export default function Content({ shareId, onError = () => {} }) {
  // 初始 loading 由是否有 shareId 决定，避免在 effect 体内同步 setState（react-hooks/set-state-in-effect）
  const [isLoading, setIsLoading] = useState(() => Boolean(shareId));
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!shareId) return undefined;

    let cancelled = false;

    // 阶段3：唯一携带 clientId Header 的端点——拿 MDAPI 下发的 clientId 调 MDAgentService 按 shareId 读分享内容。
    // 走 shareId 锚点的独立路由（不复用 {sessionId}/messages），后端在这里做 scope 限流与组织内成员校验。
    // 归一化沿用登录态那一套，保证分享页与正常会话的渲染结构同源。
    fetchSharedSessionMessages({ shareId, clientId: window.clientId || '', page: 1, size: PAGE_SIZE })
      .then(list => {
        if (cancelled) return;
        setMessages(list);
        setIsLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        setMessages([]);
        setIsLoading(false);
        // 403 share_access_denied / 404 session_not_found 等交给页面按状态分流，不在这里静默成空对话
        onError(err);
      });

    return () => {
      cancelled = true;
    };
  }, [onError, shareId]);

  if (isLoading) {
    return (
      <div className="t-flex t-flex-col t-flex-1 t-items-center t-justify-center">
        <LoadDiv />
      </div>
    );
  }

  return (
    // 消息里的嵌入块（ask_reply/build_app 等）会调用 useAgentBus，需 AgentBusProvider 提供上下文；
    // 分享页只读、无另一侧收发，其总线调用即为无害空操作。
    <AgentBusProvider>
      <div className="t-flex t-flex-col t-flex-1 t-overflow-hidden">
        <Conversation autoScroll={false}>
          <MessagesWrap>
            {!messages.length ? (
              <div className="emptyStatus">{_l('暂无对话内容')}</div>
            ) : (
              messages.map(message => <ReadonlyMessage key={message.id} message={message} />)
            )}
          </MessagesWrap>
        </Conversation>
      </div>
    </AgentBusProvider>
  );
}
