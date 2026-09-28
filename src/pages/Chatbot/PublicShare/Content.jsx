import React, { useCallback, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import { identity } from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import { formatMessages, sortMessagesByCtimeAsc } from 'src/components/Mingo/modules/WorkflowChatBot';
import WorkflowChatBot from 'src/components/Mingo/modules/WorkflowChatBot';
import chatbotAjax from 'src/pages/workflow/apiV2/chatbot';

const MessageListHeader = styled.div`
  padding: 20px 0 6px;
  max-width: 880px;
  margin: 0 auto;
  .title {
    font-size: 26px;
    font-weight: bold;
    color: var(--color-text-primary);
  }
  .updateTime {
    margin-top: 6px;
    font-size: 13px;
    color: var(--color-text-secondary);
  }
  &.isSmallMode {
    padding-top: 2px;
  }
`;

export default function Content({ isSmallMode, title, updateTime, chatbotId, conversationId, onError = () => {} }) {
  // 挂载即拉会话，初值直接给 true，省掉「effect 里先 setState 再请求」的级联渲染
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  // onError 不进 loadMessage 依赖：它带默认值，调用方不传时每次渲染都是新引用，
  // 会让 loadMessage 每次都变、effect 反复重跑，把会话接口刷成死循环。
  // 每次渲染把最新回调写进 ref，请求失败时只读 ref，重新拉取仅由会话参数驱动。
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onErrorRef.current = onError;
  });

  const loadMessage = useCallback(() => {
    chatbotAjax
      // 取原始信封（{ status, data, msg }）自行判定：会话不存在 / 不可访问时后端不抛异常，
      // 而是返回 status=0 + data=[]（msg 如「已删除」），标准契约解析只会拿到空数组，
      // 与「这个会话本来就没消息」无从区分，页面会静默渲染成一个空会话。silent 关掉全局 toast，
      // 由外层统一渲染「地址无法访问」。
      .getMessageList({ chatbotId, conversationId }, { customParseResponse: true, silent: true })
      .then(res => {
        const { status, data, msg } = res || {};

        // 只把明确的 status=0 当不可访问；其余取值一律按成功处理，避免误伤非 0/1 的信封
        if (Number(status) === 0) {
          throw new Error(msg || 'conversation unavailable');
        }

        const list = Array.isArray(data) ? data : [];

        setMessages(formatMessages(sortMessagesByCtimeAsc(list)).filter(identity));
        setIsLoading(false);
      })
      // 组织内分享的非成员、分享被取消、会话已删等：交给外层决定是引导登录还是渲染「地址无法访问」
      .catch(err => {
        setIsLoading(false);
        onErrorRef.current(err);
      });
  }, [chatbotId, conversationId]);
  useEffect(() => {
    loadMessage();
  }, [loadMessage]);
  if (isLoading) {
    return (
      <div className="t-flex t-flex-col t-flex-1 t-items-center t-justify-center">
        <LoadDiv />
      </div>
    );
  }

  return (
    <div className="t-flex t-flex-col t-flex-1 t-overflow-hidden">
      <WorkflowChatBot
        chatbotId={chatbotId}
        conversationId={conversationId}
        showMessagesOnly
        defaultMessages={messages}
        maxWidth={720}
        messageListHeader={
          !isLoading ? (
            <MessageListHeader className={cx({ isSmallMode })}>
              <div className="title">{title}</div>
              <div className="updateTime">{moment(updateTime).format('lll')}</div>
            </MessageListHeader>
          ) : null
        }
      />
      {/* <MessageList
        messages={messages}
        maxWidth={720}
        showAssistantAvatar={false}
        messageListHeader={
          !isLoading ? (
            <MessageListHeader className={cx({ isSmallMode })}>
              <div className="title">{title}</div>
              <div className="updateTime">{moment(updateTime).format('lll')}</div>
            </MessageListHeader>
          ) : null
        }
      /> */}
    </div>
  );
}
