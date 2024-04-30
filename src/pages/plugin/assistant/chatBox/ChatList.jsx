import React from 'react';
import styled from 'styled-components';
import { Icon, SvgIcon } from 'ming-ui';
import cx from 'classnames';
import { getMarkdownContent } from '../../util';
import { CHAT_STATUS } from './index';

const MessageItem = styled.div`
  margin: 24px;
  display: flex;
  .msgStatus {
    width: fit-content;
    height: 32px;
    display: flex;
    align-items: center;
    padding: 0 12px;
    border-radius: 10px;
    margin-bottom: 8px;
    background: rgba(103, 173, 91, 0.2);
    .chatPoint {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: rgba(103, 173, 91, 1);
      margin-right: 6px;
      animation: colorChange infinite 1s linear;
      @keyframes colorChange {
        from {
          opacity: 0.5;
        }

        to {
          opacity: 1;
        }
      }
    }
  }
  .messageBox {
    padding: 8px 12px;
    border-radius: 10px;
    max-width: 100%;
    display: inline-block;
    min-height: 36px;
    text-align: left;
    p {
      margin-bottom: 0;
    }
    .markdown-body {
      padding: 0 !important;
      font-size: 14px;
      h1 {
        font-size: 16px !important;
        padding-bottom: 0 !important;
        border: none !important;
        line-height: normal !important;
        font-weight: normal !important;
      }
      .token.operator,
      .token.entity,
      .token.url,
      .language-css .token.string,
      .style .token.string {
        background: transparent;
      }
      span {
        white-space: pre-wrap !important;
        word-break: break-all !important;
      }
      > pre {
        border-radius: 8px !important;
      }
      img {
        width: 100%;
      }
    }
  }
  .mLeft44 {
    margin-left: 44px;
  }
`;

const Avatar = styled.div`
  min-width: 36px;
  width: 36px;
  height: 36px;
  margin-right: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
  &.hasBorder {
    border: 1px solid #e0e0e0;
  }
`;

const Cursor = styled.span`
  display: inline-block;
  width: 10px;
  height: 16px;
  background: #333;
  animation: fadeIn 0.6s ease-in-out infinite;
  margin-top: 3px;
  vertical-align: top;
`;

export default function ChatList(props) {
  const { messageList = [], config = {}, isDialogueCreate, controller, chatStatus } = props;
  const { iconUrl, iconColor } = config;

  const statusText = {
    [CHAT_STATUS.create]: _l('创建消息'),
    [CHAT_STATUS.running]: _l('运行中'),
    [CHAT_STATUS.search]: _l('检索知识库'),
    [CHAT_STATUS.reply]: _l('AI对话'),
  };

  return messageList.map((item, index) => {
    return (
      <MessageItem
        data-id={item.msgId}
        key={item.msgId || index}
        className={cx('messageItem', { TxtRight: item.role === 'user' })}
      >
        {item.role === 'assistant' && (
          <Avatar
            className={cx({ hasBorder: !iconUrl })}
            style={{ backgroundColor: iconUrl ? iconColor || '#2196f3' : '' }}
          >
            {iconUrl ? (
              <SvgIcon url={iconUrl} fill={'#fff'} size={24} />
            ) : (
              <Icon icon="ai1" className="Gray_bd Font20" />
            )}
          </Avatar>
        )}
        <div className="flex">
          {!isDialogueCreate && item.role === 'assistant' && chatStatus && index === messageList.length - 1 && (
            <div className="msgStatus">
              <div className="chatPoint"></div>
              <div>{statusText[chatStatus]}</div>
            </div>
          )}
          <div
            className={cx(
              `messageBox ${
                item.role === 'user'
                  ? 'ThemeBGColor3 White Font14 mLeft44'
                  : `w100 ${isDialogueCreate ? 'WhiteBG createChatElement' : 'ThemeBG assistantChatElement'}`
              }`,
            )}
          >
            {item.role === 'user' ? (
              item.content
            ) : (
              <React.Fragment>
                <div className="markdown-body" dangerouslySetInnerHTML={{ __html: getMarkdownContent(item.content) }} />
                {!item.content && index === messageList.length - 1 && controller && <Cursor />}
              </React.Fragment>
            )}
          </div>
        </div>
      </MessageItem>
    );
  });
}
