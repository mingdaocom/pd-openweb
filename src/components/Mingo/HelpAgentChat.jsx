import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Agent from 'src/components/Agent';
import { getSavedHelpAgentSessionId, HELP_AGENT_NAME } from 'src/components/Agent/agentService';
import MingoWelcome from './ChatBot/components/MingoWelcome';

// 帮助中心（智能客服）单会话模型：会话 id 动态生成（无恢复目标时由 ChatPanel 自生成），
// 会话有消息后按人记录到本地（agentService）。进入时本地有记录直接进对话详情
// （经 runtime.initialSessionId 自动恢复记录的会话）；无记录（或记录的会话已被删除）先落帮助首页，
// 首页提问后按新会话发起并回写记录。
// 不提供「新对话」入口（外层头部对 MINGDAO_HELP_CHAT 不渲染新对话按钮）。
export default function HelpAgentChat({ updateIsChatting = () => {} }) {
  const savedSessionId = useMemo(() => getSavedHelpAgentSessionId(), []);
  // welcome：帮助首页；chat：对话。挂载时若带着首页交接的首条消息 / 待恢复会话
  // （可能经 SET_MINGO_FIXED 重挂到这里），直接进对话，由 Agent 消费对应全局变量；
  // 否则按本地记录的帮助会话分流：有记录直接进对话详情，无记录先落帮助首页。
  const [phase, setPhase] = useState(() =>
    window.mingoInitialMessage || window.mingoInitialSessionId || savedSessionId ? 'chat' : 'welcome',
  );

  // 从帮助入口打开时外层按 pendingTask 先置了 isChatting=true，落首页需纠正回来
  // （头部显示固定按钮而非「智能客服」标题），进对话时再置回
  useEffect(() => {
    updateIsChatting(phase === 'chat');
  }, [phase, updateIsChatting]);

  if (phase === 'welcome') {
    // 首页提问：不带恢复目标，由 ChatPanel 自生成新会话 id 发起，会话有消息后回写本地记录
    return <MingoWelcome helpMode onStartTask={() => setPhase('chat')} />;
  }

  return (
    <Agent
      runtime={{
        agentName: HELP_AGENT_NAME,
        helpMode: true,
        enableMention: false,
        autoFocus: true,
        // 本地有记录时作恢复目标自动进对话详情；为空时由 ChatPanel 自生成新会话 id
        initialSessionId: savedSessionId,
        // 帮助会话不走「恢复上次通用会话」的 localStorage 逻辑
        disableSessionRestore: true,
      }}
    />
  );
}

HelpAgentChat.propTypes = {
  updateIsChatting: PropTypes.func,
};
