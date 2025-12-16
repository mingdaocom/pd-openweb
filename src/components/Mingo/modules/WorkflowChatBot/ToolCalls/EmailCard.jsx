import React, { useEffect, useState } from 'react';
import { get, isEmpty } from 'lodash';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import chatbotAjax from 'src/pages/workflow/apiV2/chatbot';

const Con = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  .data-item {
    display: flex;
    flex-direction: row;
    gap: 12px;
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
      gap: 12px;
    }
    .userName {
      font-size: 13px;
      color: #151515;
    }
  }
`;

function parseReceiver(receivers) {
  return safeParse(receivers, 'array').map(receiver =>
    receiver[0] === '{'
      ? {
          type: 'account',
          value: [safeParse(receiver)],
        }
      : receiver[0] === '['
        ? {
            type: 'account',
            value: safeParse(receiver),
          }
        : {
            type: 'email',
            value: receiver,
          },
  );
}

function parseArguments(argumentsData) {
  try {
    const subject = argumentsData.subject;
    const content = argumentsData.content;
    const replyEmail = argumentsData.reply_email;
    const senderName = argumentsData.sender_name;
    const receiverList = parseReceiver(argumentsData.receiver);
    const senderList = parseReceiver(argumentsData.sender);
    const attachments = safeParse(argumentsData.attachments, 'array');
    return {
      subject,
      content,
      senderList,
      receiverList,
      replyEmail,
      senderName,
      attachments,
    };
  } catch (error) {
    console.error(error);
    return {};
  }
}

function EmailCard({ chatbotId, conversationId, functionData = {} }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});
  useEffect(() => {
    chatbotAjax
      .handleAIRequest({
        chatbotId,
        conversationId,
        ...functionData,
      })
      .then(res => {
        const parsedArguments = parseArguments(safeParse(res.arguments));
        setData(parsedArguments);
        setLoading(false);
      });
  }, []);
  if (loading) {
    return <LoadDiv size="small" className="mTop20 mBottom20" />;
  }
  return (
    <Con>
      {!isEmpty(data.receiverList) && (
        <div className="data-item">
          <div className="data-item-label">{_l('收件人')}</div>
          <div className="data-item-value users">
            {data.receiverList.map(receiver => (
              <div className="user">
                {receiver.type === 'account' ? get(receiver, 'value.fullName') : receiver.value}
              </div>
            ))}
          </div>
        </div>
      )}
      {data.replyEmail && (
        <div className="data-item">
          <div className="data-item-label">{_l('抄送')}</div>
          <div className="data-item-value">{data.replyEmail}</div>
        </div>
      )}
      {!isEmpty(data.senderList) && (
        <div className="data-item">
          <div className="data-item-label">{_l('发件人')}</div>
          <div className="data-item-value users">
            {data.senderList.map(sender => (
              <div className="user">{sender.type === 'account' ? get(sender, 'value.fullName') : sender.value}</div>
            ))}
          </div>
        </div>
      )}
      {data.subject && (
        <div className="data-item">
          <div className="data-item-label">{_l('主题')}</div>
          <div className="data-item-value">{data.subject}</div>
        </div>
      )}
      {data.content && (
        <div className="data-item">
          <div className="data-item-label">{_l('正文')}</div>
          <div className="data-item-value">{data.content}</div>
        </div>
      )}
      {/* 附件 */}
    </Con>
  );
}

export default EmailCard;
