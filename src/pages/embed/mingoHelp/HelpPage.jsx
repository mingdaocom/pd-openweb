import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import Agent from 'src/components/Agent';
import { AGENT_HEADER_EVENT, HELP_AGENT_NAME } from 'src/components/Agent/agentService';
import MingoWelcome from 'src/components/Mingo/ChatBot/components/MingoWelcome';
import { emitter } from 'src/utils/platform/browser/dom';
import {
  bootstrapHelpSession,
  clearHelpSession,
  ensureHelpSession,
  isHelpSessionChatted,
  renewHelpSession,
  setHelpSessionChatted,
} from './anonSession';

const Con = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-white);
`;

const StateWrap = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--color-text-secondary);

  .retry {
    margin-left: 8px;
    color: var(--color-link);
    cursor: pointer;
    &:hover {
      color: var(--color-link-hover);
    }
  }
`;

// /public/mingo/help：对外嵌入的匿名智能客服页（免登录）。
// 与站内帮助抽屉（Mingo/HelpAgentChat）共用 help-agent 与 helpMode 异化，差别只在：
//  - 会话 id 由服务端签发（匿名不能自造，见 anonSession），不参与站内按人记录的帮助会话；
//  - 不提供「帮助文档 + 转人工客服」（enableHumanSupport=false）：访客无登录身份，转人工无从承接；
//  - 匿名无上传契约，MingoWelcome / ChatPanel 均不提供附件入口。
export default function HelpPage() {
  // welcome：帮助首页；chat：对话。首条提问由 MingoWelcome 经 window.mingoInitialMessage 交接给 Agent 自动发起。
  // 刷新 / 重开：本会话已提过问则直进对话，由 Agent 按 initialSessionId 拉历史回填（§04 历史回显）；
  // 会话过期（本地 TTL）或从未提问则回帮助首页。
  const [phase, setPhase] = useState(() => (isHelpSessionChatted() ? 'chat' : 'welcome'));
  const [sessionId, setSessionId] = useState('');
  const [bootstrapFailed, setBootstrapFailed] = useState(false);

  // 进入即签发会话：访客提问前就绪，避免首条提问时再等一次往返。
  // 失败不拦首页（可能只是 IP 限频），发消息时 Agent 侧仍会拿到 sessionId 后再发。
  useEffect(() => {
    let cancelled = false;

    ensureHelpSession()
      .then(id => !cancelled && setSessionId(id))
      .catch(() => !cancelled && setBootstrapFailed(true));

    return () => {
      cancelled = true;
    };
  }, []);

  // 403 anon_session_invalid：重新签发并把新 id 交回 ChatPanel，用户点「重试」即用新会话重发
  const handleAnonSessionInvalid = useCallback(async () => {
    const next = await renewHelpSession();

    setSessionId(next);
    return next;
  }, []);

  // 历史加载失败（会话已失效等）：ChatPanel 会广播回首页，这里丢掉坏会话并重新签发
  useEffect(() => {
    const onBackToWelcome = () => {
      clearHelpSession();
      setPhase('welcome');
      setSessionId('');
      bootstrapHelpSession()
        .then(setSessionId)
        .catch(() => setBootstrapFailed(true));
    };

    emitter.on(AGENT_HEADER_EVENT.BACK_TO_WELCOME, onBackToWelcome);
    return () => emitter.off(AGENT_HEADER_EVENT.BACK_TO_WELCOME, onBackToWelcome);
  }, []);

  const handleRetryBootstrap = useCallback(() => {
    setBootstrapFailed(false);
    bootstrapHelpSession()
      .then(setSessionId)
      .catch(() => setBootstrapFailed(true));
  }, []);

  if (bootstrapFailed) {
    return (
      <Con>
        <StateWrap>
          <span>{_l('会话创建失败')}</span>
          <span className="retry" onClick={handleRetryBootstrap}>
            {_l('重试')}
          </span>
        </StateWrap>
      </Con>
    );
  }

  if (!sessionId) {
    return (
      <Con>
        <StateWrap>
          <LoadDiv />
        </StateWrap>
      </Con>
    );
  }

  if (phase === 'welcome') {
    return (
      <Con>
        <MingoWelcome
          helpMode
          anonymous
          enableHumanSupport={false}
          onStartTask={() => {
            // 首条提问已交接给 Agent（window.mingoInitialMessage）：记下「问过」，刷新回来直接续上对话
            setHelpSessionChatted();
            setPhase('chat');
          }}
        />
      </Con>
    );
  }

  return (
    <Con>
      <Agent
        runtime={{
          agentName: HELP_AGENT_NAME,
          helpMode: true,
          anonymous: true,
          enableHumanSupport: false,
          enableMention: false,
          autoFocus: true,
          // 匿名会话 id 由服务端签发，不自生成
          initialSessionId: sessionId,
          // 匿名页不恢复「上次通用会话」（那是登录态 localStorage 逻辑）
          disableSessionRestore: true,
          // autoLoadInitialSession 保持默认 true：刷新/重开时按 initialSessionId 拉历史回填；
          // 从首页带首条提问进入时 ChatPanel 自身会跳过恢复直接发送
          onAnonSessionInvalid: handleAnonSessionInvalid,
          promptPlaceholder: _l('有什么可以帮助您'),
        }}
      />
    </Con>
  );
}
