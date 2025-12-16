import React, { useEffect, useRef } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { ChatHistoryContent } from 'src/components/Mingo/ChatBot/components/ChatHistory';

const Con = styled.div`
  width: 280px;
  border-right: 1px solid #e0e0e0;
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  margin-left: 0;
  .new-chat-btn {
    height: 40px;
    border-radius: 40px;
    border: 1px solid #e0e0e0;
    margin: 12px 16px 16px;
    cursor: pointer;
    i {
      font-size: 18px;
      color: #6e09f9;
      margin-right: 6px;
    }
    span {
      font-size: 14px;
      color: #151515;
      font-weight: 500;
    }
  }
  .history-title {
    font-size: 13px;
    color: #9e9e9e;
    font-weight: bold;
    margin: 6px 20px;
  }
  .footer {
    height: 38px;
    padding: 0 10px;
  }
  &.un-expand {
    margin-left: -280px;
  }
`;

export const ExpandIcon = styled.span`
  width: 32px;
  height: 32px;
  border-radius: 3px;
  cursor: pointer;
  i {
    font-size: 20px;
    color: #757575;
  }
  &.un-expand {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    border: 1px solid #eaeaea;
    margin: 12px;
  }
`;

export default function Side({
  visible,
  emitter,
  currentChatId,
  onSelect = () => {},
  handleNewChatClick = () => {},
  onExpand = () => {},
}) {
  const chatHistoryRef = useRef(null);
  useEffect(() => {
    emitter.on('insertChatHistory', chatItem => {
      chatHistoryRef.current?.appendChatItem(chatItem);
    });
  }, [emitter]);
  return (
    <Con className={cx('t-flex t-flex-col', { 'un-expand': !visible })}>
      <div className="new-chat-btn t-flex t-items-center t-justify-center" onClick={handleNewChatClick}>
        <i className="icon icon-new_chat"></i>
        <span>{_l('新对话')}</span>
      </div>
      <div className="t-flex-1 t-overflow-hidden">
        <ChatHistoryContent
          isLand
          ref={chatHistoryRef}
          className="chatHistoryContent"
          setDocumentTitle
          currentChatId={currentChatId}
          showHeader={false}
          header={<div className="history-title">{_l('历史对话')}</div>}
          onSelect={onSelect}
        />
      </div>
      <div className="footer t-flex t-items-center t-justify-end">
        <ExpandIcon className="expand-icon t-flex t-items-center t-justify-center" onClick={onExpand}>
          <i className="icon icon-menu_left"></i>
        </ExpandIcon>
      </div>
    </Con>
  );
}

Side.propTypes = {
  visible: PropTypes.bool,
  emitter: PropTypes.shape({}),
  currentChatId: PropTypes.string,
  onSelect: PropTypes.func,
  handleNewChatClick: PropTypes.func,
  onExpand: PropTypes.func,
};
