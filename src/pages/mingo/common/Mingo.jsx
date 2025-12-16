import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import HelpBot from 'src/components/Mingo/modules/HelpBot';
import { navigateTo } from 'src/router/navigateTo';

const Con = styled.div`
  width: 100%;
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
      hideHeader,
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
        <HelpBot
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
            navigateTo(`/mingo/chat/${chatItem.chatId}${hideHeader ? '?header=0' : ''}`);
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
