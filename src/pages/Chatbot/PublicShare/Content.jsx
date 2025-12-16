import React, { useCallback, useEffect, useState } from 'react';
import cx from 'classnames';
import { identity } from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import { formatMessages } from 'src/components/Mingo/modules/WorkflowChatBot';
import WorkflowChatBot from 'src/components/Mingo/modules/WorkflowChatBot';
import chatbotAjax from 'src/pages/workflow/apiV2/chatbot';

const MessageListHeader = styled.div`
  padding: 20px 0 6px;
  max-width: 880px;
  margin: 0 auto;
  .title {
    font-size: 26px;
    font-weight: bold;
    color: #151515;
  }
  .updateTime {
    margin-top: 6px;
    font-size: 13px;
    color: #757575;
  }
  &.isSmallMode {
    padding-top: 2px;
  }
`;
export default function Content({ isSmallMode, title, updateTime, chatbotId, conversationId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const loadMessage = useCallback(() => {
    chatbotAjax.getMessageList({ chatbotId, conversationId }).then(data => {
      setMessages(formatMessages(data.sort((a, b) => new Date(a.ctime) - new Date(b.ctime))).filter(identity));
      setIsLoading(false);
    });
  }, [chatbotId, conversationId]);
  useEffect(() => {
    setIsLoading(true);
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
