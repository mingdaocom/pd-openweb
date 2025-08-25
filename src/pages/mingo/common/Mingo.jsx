import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MingoContent from 'src/components/Mingo/ChatBot/Content';
import { navigateTo } from 'src/router/navigateTo';

const Con = styled.div`
  .mingo-content {
    height: 100%;
    width: 100%;
    margin: 0 auto;
    overflow: hidden;
  }
  &.isSmallMode.isShare {
    .mingo-content {
      padding-bottom: 0px;
    }
  }
`;

const Mingo = forwardRef(
  (
    {
      emitter,
      className,
      currentChatId,
      onNewChat,
      onNewChatClick,
      disabled,
      infoLoading,
      messageListHeader,
      isSmallMode,
    },
    ref,
  ) => {
    const mingoContentRef = useRef(null);
    useImperativeHandle(ref, () => ({
      newChat: () => {
        mingoContentRef.current.newChat();
      },
    }));
    return (
      <Con className={cx(className, { isSmallMode, isShare: window.isMingoShare })}>
        <MingoContent
          isLand
          allowEdit={!window.isMingoShare}
          infoLoading={infoLoading}
          messageListHeader={messageListHeader}
          disabled={disabled}
          ref={mingoContentRef}
          className="mingo-content"
          maxWidth={720}
          defaultIsChatting={true}
          currentChatId={currentChatId}
          hideHistoryButton={!isSmallMode}
          onNewChat={onNewChat}
          onNewChatClick={onNewChatClick}
          onInsertChatHistory={chatItem => {
            emitter.emit('insertChatHistory', chatItem);
            navigateTo(`/mingo/chat/${chatItem.chatId}`);
          }}
        />
      </Con>
    );
  },
);

Mingo.propTypes = {
  emitter: PropTypes.shape({}),
  className: PropTypes.string,
  currentChatId: PropTypes.string,
  onNewChat: PropTypes.func,
  onNewChatClick: PropTypes.func,
  disabled: PropTypes.bool,
  infoLoading: PropTypes.bool,
  messageListHeader: PropTypes.node,
  isSmallMode: PropTypes.bool,
};

export default Mingo;
