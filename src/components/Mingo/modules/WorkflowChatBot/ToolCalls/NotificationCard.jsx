import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { LoadDiv, UserHead } from 'ming-ui';
import chatbotAjax from 'src/pages/workflow/apiV2/chatbot';

const Con = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  .data-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 5px;
    .data-item-label {
      width: 60px;
      font-size: 13px;
      color: #515151;
      flex-shrink: 0;
      padding-top: 2px;
    }
    .data-item-value {
      padding-top: 2px;
      flex: 1;
      font-size: 13px;
      color: #151515;
    }
  }
  .users {
    display: flex;
    flex-direction: row;
    gap: 12px;
    flex-wrap: wrap;
    .user {
      display: flex;
      flex-direction: row;
      gap: 5px;
      align-items: center;
    }
    .userName {
      font-size: 13px;
      color: #151515;
    }
  }
`;

function NotificationCard({ chatbotId, conversationId, functionData = {} }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    users: [],
    message: '',
  });
  useEffect(() => {
    chatbotAjax
      .handleAIRequest({
        chatbotId,
        conversationId,
        ...functionData,
      })
      .then(res => {
        const parsedArguments = safeParse(res.arguments);
        const message = parsedArguments.message;
        const users = safeParse(parsedArguments.users, 'array').map(accountStr => safeParse(accountStr));
        setData({ message, users });
        setLoading(false);
      });
  }, []);
  if (loading) {
    return <LoadDiv size="small" className="mTop20 mBottom20" />;
  }
  return (
    <Con>
      <div className="data-item">
        <div className="data-item-label">{_l('通知人')}</div>
        <div className="data-item-value users">
          {data.users.map(user => (
            <div className="user">
              <UserHead
                user={{
                  userHead: user.avatarSmall || user.avatar,
                  accountId: user.accountId,
                }}
                size={20}
              />
              <span className="userName flex ellipsis">{user.fullName || user.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="data-item">
        <div className="data-item-label">{_l('正文')}</div>
        <div className="data-item-value">{data.message}</div>
      </div>
    </Con>
  );
}

export default NotificationCard;
